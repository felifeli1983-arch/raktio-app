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

from app.repositories import billing as billing_repo
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
    sim_repo.update_run_by_simulation(str(simulation_id), "running", {"status": "paused"})

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
    sim_repo.update_run_by_simulation(str(simulation_id), "paused", {"status": "running"})

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

    from datetime import datetime, timezone
    cancel_data = {
        "status": "canceled",
        "failed_at": datetime.now(timezone.utc).isoformat(),
        "failure_reason": "Canceled by user",
    }
    for s in ("running", "paused", "bootstrapping"):
        sim_repo.update_run_by_simulation(str(simulation_id), s, cancel_data)

    # Refund credits: look up the original reservation amount from the ledger
    # (not from credit_final, which oasis_worker may have overwritten with actual cost)
    org_id = sim_repo.get_workspace_org_id(workspace_id)
    refund_amount = 0
    if org_id:
        reserved_amount = billing_repo.get_reservation_amount(org_id, str(simulation_id))
        if reserved_amount > 0:
            balance = billing_repo.get_balance(org_id)
            if balance:
                new_available = balance["available_credits"] + reserved_amount
                new_reserved = max(0, balance["reserved_credits"] - reserved_amount)
                billing_repo.refund_credits(org_id, new_available, new_reserved)
                billing_repo.insert_ledger_entry({
                    "organization_id": org_id,
                    "workspace_id": str(workspace_id),
                    "event_type": "refund",
                    "amount": reserved_amount,
                    "balance_after": new_available,
                    "linked_simulation_id": str(simulation_id),
                    "note": "Refund: simulation canceled by user",
                })
                refund_amount = reserved_amount

    return {"status": "canceled", "simulation_id": str(simulation_id), "credits_refunded": refund_amount}
