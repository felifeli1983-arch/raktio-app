"""
Raktio Service — Simulation CRUD + credit validation.

Orchestration layer: validates business rules, delegates DB access to
repositories/simulations.py. Never calls sb.table() directly.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException, status

from app.repositories import simulations as sim_repo
from app.schemas.simulation import (
    SimulationCreate,
    SimulationListResponse,
    SimulationResponse,
    SimulationUpdate,
)


# ── Credit estimation ──────────────────────────────────────────────────

# Base cost per agent per duration tier (simplified model).
# Refined cost rules will live in billing/credit_rules.py later.
_DURATION_MULTIPLIER: dict[str, float] = {
    "6h": 0.5,
    "12h": 0.75,
    "24h": 1.0,
    "48h": 1.8,
    "72h": 2.5,
}

_BASE_COST_PER_AGENT = 1  # 1 credit per agent at 24h baseline


def estimate_credits(agent_count: int, duration_preset: str) -> int:
    """Return an integer credit estimate for a simulation."""
    multiplier = _DURATION_MULTIPLIER.get(duration_preset, 1.0)
    return max(1, round(agent_count * _BASE_COST_PER_AGENT * multiplier))


# ── Validation helpers ─────────────────────────────────────────────────

def _get_org_for_workspace(workspace_id: uuid.UUID) -> str:
    """Look up the organization_id for a workspace. Raises 404 if missing."""
    org_id = sim_repo.get_workspace_org_id(workspace_id)
    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or has no organization",
        )
    return org_id


def _check_credit_balance(organization_id: str, required: int) -> None:
    """Raise 402 if the org doesn't have enough available credits."""
    available = sim_repo.get_available_credits(organization_id)
    if available is None:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No credit balance found for this organization",
        )
    if available < required:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits: {available} available, {required} required",
        )


def _check_agent_limit(organization_id: str, requested: int) -> None:
    """Raise 403 if the requested agent count exceeds the plan limit."""
    limit = sim_repo.get_org_plan_agent_limit(organization_id)
    if limit is not None and requested > limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Agent count {requested} exceeds plan limit of {limit}. Upgrade your plan.",
        )


# ── CRUD ───────────────────────────────────────────────────────────────

async def create_simulation(
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    data: SimulationCreate,
) -> SimulationResponse:
    """
    Create a new simulation in 'draft' status.
    Validates: plan agent limit and credit estimate (soft check — no reservation yet).
    """
    org_id = _get_org_for_workspace(workspace_id)
    _check_agent_limit(org_id, data.agent_count_requested)

    credit_est = estimate_credits(data.agent_count_requested, data.duration_preset)
    _check_credit_balance(org_id, credit_est)

    row = {
        "workspace_id": str(workspace_id),
        "created_by_user_id": str(user_id),
        "name": data.name,
        "goal_type": data.goal_type,
        "status": "draft",
        "planner_status": "pending",
        "brief_text": data.brief_text,
        "agent_count_requested": data.agent_count_requested,
        "duration_preset": data.duration_preset,
        "platform_scope": data.platform_scope,
        "geography_scope": data.geography_scope,
        "recsys_choice": data.recsys_choice,
        "credit_estimate": credit_est,
    }

    inserted = sim_repo.insert(row)
    if not inserted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create simulation",
        )

    return SimulationResponse(**inserted)


async def list_simulations(
    workspace_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
) -> SimulationListResponse:
    """List simulations for a workspace, paginated, newest first."""
    offset = (page - 1) * page_size
    rows, total = sim_repo.list_by_workspace(workspace_id, offset, page_size)
    items = [SimulationResponse(**row) for row in rows]
    return SimulationListResponse(
        items=items, total=total, page=page, page_size=page_size
    )


async def get_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> SimulationResponse:
    """Get a single simulation by ID, scoped to workspace."""
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )
    return SimulationResponse(**row)


async def update_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
    data: SimulationUpdate,
) -> SimulationResponse:
    """
    Update mutable fields of a simulation.
    Only allowed when status is 'draft'.
    """
    existing = await get_simulation(simulation_id, workspace_id)
    if existing.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot edit simulation in '{existing.status}' status. Only 'draft' simulations can be modified.",
        )

    update_data: dict[str, Any] = data.model_dump(exclude_none=True)
    if not update_data:
        return existing

    # Recalculate credit estimate if relevant fields changed
    agent_count = update_data.get("agent_count_requested", existing.agent_count_requested)
    duration = update_data.get("duration_preset", existing.duration_preset)
    update_data["credit_estimate"] = estimate_credits(agent_count, duration)

    if "agent_count_requested" in update_data:
        org_id = _get_org_for_workspace(workspace_id)
        _check_agent_limit(org_id, update_data["agent_count_requested"])

    updated = sim_repo.update(simulation_id, workspace_id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update simulation",
        )

    return SimulationResponse(**updated)


async def delete_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> None:
    """Delete a simulation. Only allowed in 'draft' or 'canceled' status."""
    existing = await get_simulation(simulation_id, workspace_id)
    if existing.status not in ("draft", "canceled"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete simulation in '{existing.status}' status",
        )

    sim_repo.delete(simulation_id, workspace_id)
