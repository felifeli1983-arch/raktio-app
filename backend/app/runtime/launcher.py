"""
Raktio Runtime — Launcher

Prepares and launches an OASIS simulation run.
Creates a simulation_runs record and manages the bootstrap phase.

The actual OASIS execution runs in a background task/worker.
This module handles the pre-flight checks and initial setup.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from app.repositories import agents as agent_repo
from app.repositories import billing as billing_repo
from app.repositories import simulations as sim_repo
from app.runtime.config_builder import build_run_config
from app.services.simulation_service import estimate_credits


async def launch_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
    run_oasis: bool = True,
) -> dict[str, Any]:
    """
    Launch a simulation run.

    Pre-flight checks:
    1. Simulation must be in 'draft' with planner_status='ready'
    2. agent_count_final must be > 0 (audience prepared)
    3. Credit balance must be sufficient
    4. Credit reservation is created

    Then:
    5. Create simulation_runs record (status='bootstrapping')
    6. Build runtime config
    7. Update simulation status to 'bootstrapping'

    The actual OASIS execution would be dispatched to an ARQ worker.
    For now, we prepare everything and mark as 'bootstrapping'.

    Returns: run summary dict.
    """
    # 1. Validate simulation state
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    if row.get("status") != "draft":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot launch simulation in '{row['status']}' status. Must be 'draft'.",
        )

    if row.get("planner_status") != "ready":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Planner not ready. Run /plan first.",
        )

    agent_count = row.get("agent_count_final", 0)
    if agent_count == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No audience prepared. Run /prepare-audience first.",
        )

    # 2. Credit check + reservation
    org_id = sim_repo.get_workspace_org_id(workspace_id)
    if not org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace has no organization")

    credit_cost = estimate_credits(agent_count, row.get("duration_preset", "24h"))
    balance = billing_repo.get_balance(org_id)
    available = balance["available_credits"] if balance else 0
    if available < credit_cost:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits: {available} available, {credit_cost} required",
        )

    # Reserve credits
    billing_repo.reserve_credits(org_id, credit_cost, available - credit_cost)

    billing_repo.insert_ledger_entry({
        "organization_id": org_id,
        "workspace_id": str(workspace_id),
        "event_type": "simulation_reservation",
        "amount": -credit_cost,
        "balance_after": available - credit_cost,
        "linked_simulation_id": str(simulation_id),
        "note": f"Credit reservation for simulation launch ({agent_count} agents)",
    })

    try:
        # 3. Transition to cost_check → bootstrapping
        sim_repo.update(simulation_id, workspace_id, {"status": "cost_check"})

        # 4. Create simulation_runs record
        run_id = uuid.uuid4()
        sim_repo.insert_run({
            "run_id": str(run_id),
            "simulation_id": str(simulation_id),
            "status": "bootstrapping",
            "started_at": datetime.now(timezone.utc).isoformat(),
        })

        # 5. Get participants and agent data for config
        participants = agent_repo.get_simulation_participants(simulation_id)

        # Load all agent profiles in batches (no truncation)
        agent_ids = [p["agent_id"] for p in participants]
        agents = []
        batch_size = 100
        for i in range(0, len(agent_ids), batch_size):
            batch = agent_ids[i:i + batch_size]
            for aid in batch:
                a = agent_repo.find_agent_by_id(uuid.UUID(aid))
                if a:
                    agents.append(a)

        # 6. Build runtime config with all participants
        runtime_config = build_run_config(
            simulation_id=simulation_id,
            run_id=run_id,
            simulation_row=row,
            participants=participants,
            agents=agents,
        )

        # 7. Update simulation and run records
        sim_repo.update(simulation_id, workspace_id, {
            "status": "bootstrapping",
            "credit_final": credit_cost,
        })

        # Update run with paths
        sim_repo.update_run(str(run_id), {
            "runtime_path": runtime_config["run_workspace_path"],
            "sqlite_path": runtime_config["sqlite_path"],
            "runtime_metadata_json": {
                "agent_count": runtime_config["agent_count"],
                "platform_type": runtime_config["platform_type"],
                "duration_steps": runtime_config["duration_steps"],
            },
        })

        # Store final runtime config in simulation_configs
        sim_repo.update_config(simulation_id, {
            "final_runtime_config_json": runtime_config,
        })

        # 8. Dispatch OASIS simulation as background task
        #    Returns immediately so the client can connect to SSE stream.
        #    The worker updates status/SQLite as it runs.
        #    In production, this should be an ARQ job dispatch instead.
        if run_oasis:
            import asyncio
            from app.runtime.oasis_worker import run_oasis_simulation

            async def _run_in_background():
                try:
                    await run_oasis_simulation(
                        runtime_config=runtime_config,
                        simulation_id=str(simulation_id),
                        workspace_id=str(workspace_id),
                        run_id=str(run_id),
                    )
                except Exception as exc:
                    import logging
                    logging.getLogger("raktio.launcher").error(
                        f"Background OASIS run failed: {exc}"
                    )

            asyncio.create_task(_run_in_background())

        return {
            "run_id": str(run_id),
            "status": "bootstrapping",
            "agent_count": runtime_config["agent_count"],
            "platform_type": runtime_config["platform_type"],
            "duration_steps": runtime_config["duration_steps"],
            "run_workspace_path": runtime_config["run_workspace_path"],
            "credit_reserved": credit_cost,
            "note": "OASIS simulation dispatched as background task. "
                    "Connect to GET /api/stream/{id} for live events.",
        }

    except Exception as exc:
        # Refund credits on failure
        billing_repo.refund_credits(org_id, available, 0)

        billing_repo.insert_ledger_entry({
            "organization_id": org_id,
            "workspace_id": str(workspace_id),
            "event_type": "refund",
            "amount": credit_cost,
            "balance_after": available,
            "linked_simulation_id": str(simulation_id),
            "note": f"Refund: launch failed — {exc}",
        })

        sim_repo.update(simulation_id, workspace_id, {"status": "draft"})

        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Launch failed: {exc}",
        )
