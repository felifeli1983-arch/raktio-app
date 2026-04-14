"""
Raktio Runtime — Supervisor

Monitors the lifecycle of a running OASIS simulation.
Handles pause, resume, stop, and failure detection.

In production, this would run as an ARQ background job that:
1. Launches OASIS via Python subprocess/import
2. Monitors env.step() progress
3. Normalizes events via event_bridge
4. Updates simulation status in real-time
5. Handles graceful shutdown

For now, this module provides the status management interface.
The actual OASIS integration will be wired when the runtime worker is implemented.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException, status

from app.db.supabase_client import get_supabase
from app.repositories import simulations as sim_repo


async def pause_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> dict[str, Any]:
    """Pause a running simulation."""
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    if row.get("status") != "running":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot pause simulation in '{row['status']}' status",
        )

    sim_repo.update(simulation_id, workspace_id, {"status": "paused"})

    sb = get_supabase()
    sb.table("simulation_runs").update({"status": "paused"}).eq(
        "simulation_id", str(simulation_id)
    ).eq("status", "running").execute()

    return {"status": "paused", "simulation_id": str(simulation_id)}


async def resume_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> dict[str, Any]:
    """Resume a paused simulation."""
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    if row.get("status") != "paused":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot resume simulation in '{row['status']}' status",
        )

    sim_repo.update(simulation_id, workspace_id, {"status": "running"})

    sb = get_supabase()
    sb.table("simulation_runs").update({"status": "running"}).eq(
        "simulation_id", str(simulation_id)
    ).eq("status", "paused").execute()

    return {"status": "running", "simulation_id": str(simulation_id)}


async def cancel_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> dict[str, Any]:
    """Cancel a running or paused simulation. Refunds reserved credits."""
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    if row.get("status") not in ("running", "paused", "bootstrapping"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot cancel simulation in '{row['status']}' status",
        )

    sim_repo.update(simulation_id, workspace_id, {"status": "canceled"})

    sb = get_supabase()
    sb.table("simulation_runs").update({
        "status": "canceled",
        "failed_at": "now()",
        "failure_reason": "Canceled by user",
    }).eq("simulation_id", str(simulation_id)).neq("status", "completed").execute()

    # Refund reserved credits
    credit_final = row.get("credit_final", 0)
    if credit_final > 0:
        org_id = sim_repo.get_workspace_org_id(workspace_id)
        if org_id:
            balance_result = sb.table("credit_balances").select("available_credits, reserved_credits").eq(
                "organization_id", org_id
            ).limit(1).execute()

            if balance_result.data:
                current = balance_result.data[0]
                new_available = current["available_credits"] + credit_final
                new_reserved = max(0, current["reserved_credits"] - credit_final)

                sb.table("credit_balances").update({
                    "available_credits": new_available,
                    "reserved_credits": new_reserved,
                }).eq("organization_id", org_id).execute()

                sb.table("credit_ledger").insert({
                    "organization_id": org_id,
                    "workspace_id": str(workspace_id),
                    "event_type": "refund",
                    "amount": credit_final,
                    "balance_after": new_available,
                    "linked_simulation_id": str(simulation_id),
                    "note": "Refund: simulation canceled by user",
                }).execute()

    return {"status": "canceled", "simulation_id": str(simulation_id), "credits_refunded": credit_final}
