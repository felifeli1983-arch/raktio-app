"""
Raktio Service — Simulation CRUD + credit validation.

All DB operations use the service_role client (bypasses RLS).
Authorization is already enforced by the guards in the API layer.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException, status

from app.db.supabase_client import get_supabase
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


# ── Helpers ────────────────────────────────────────────────────────────

def _get_org_for_workspace(workspace_id: uuid.UUID) -> uuid.UUID:
    """Look up the organization_id for a workspace."""
    sb = get_supabase()
    result = (
        sb.table("workspaces")
        .select("organization_id")
        .eq("workspace_id", str(workspace_id))
        .limit(1)
        .execute()
    )
    if not result.data or not result.data[0].get("organization_id"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or has no organization",
        )
    return uuid.UUID(result.data[0]["organization_id"])


def _check_credit_balance(organization_id: uuid.UUID, required: int) -> None:
    """Raise 402 if the org doesn't have enough available credits."""
    sb = get_supabase()
    result = (
        sb.table("credit_balances")
        .select("available_credits")
        .eq("organization_id", str(organization_id))
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No credit balance found for this organization",
        )
    available = result.data[0]["available_credits"]
    if available < required:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits: {available} available, {required} required",
        )


def _check_agent_limit(organization_id: uuid.UUID, requested: int) -> None:
    """Raise 403 if the requested agent count exceeds the plan limit."""
    sb = get_supabase()
    result = (
        sb.table("organizations")
        .select("plan_id")
        .eq("organization_id", str(organization_id))
        .limit(1)
        .execute()
    )
    if not result.data:
        return  # no org → will fail elsewhere

    plan_id = result.data[0]["plan_id"]
    plan_result = (
        sb.table("plans")
        .select("agent_limit")
        .eq("plan_id", plan_id)
        .limit(1)
        .execute()
    )
    if plan_result.data:
        limit = plan_result.data[0]["agent_limit"]
        if requested > limit:
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
    sb = get_supabase()
    org_id = _get_org_for_workspace(workspace_id)

    # Validate plan limits
    _check_agent_limit(org_id, data.agent_count_requested)

    # Estimate credits
    credit_est = estimate_credits(data.agent_count_requested, data.duration_preset)

    # Soft credit check (no reservation until launch)
    _check_credit_balance(org_id, credit_est)

    # Insert
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

    result = sb.table("simulations").insert(row).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create simulation",
        )

    return SimulationResponse(**result.data[0])


async def list_simulations(
    workspace_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
) -> SimulationListResponse:
    """List simulations for a workspace, paginated, newest first."""
    sb = get_supabase()
    offset = (page - 1) * page_size

    # Count total
    count_result = (
        sb.table("simulations")
        .select("simulation_id", count="exact")
        .eq("workspace_id", str(workspace_id))
        .execute()
    )
    total = count_result.count or 0

    # Fetch page
    result = (
        sb.table("simulations")
        .select("*")
        .eq("workspace_id", str(workspace_id))
        .order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )

    items = [SimulationResponse(**row) for row in (result.data or [])]

    return SimulationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


async def get_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> SimulationResponse:
    """Get a single simulation by ID, scoped to workspace."""
    sb = get_supabase()
    result = (
        sb.table("simulations")
        .select("*")
        .eq("simulation_id", str(simulation_id))
        .eq("workspace_id", str(workspace_id))
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    return SimulationResponse(**result.data[0])


async def update_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
    data: SimulationUpdate,
) -> SimulationResponse:
    """
    Update mutable fields of a simulation.
    Only allowed when status is 'draft'.
    """
    sb = get_supabase()

    # Verify simulation exists and is in draft status
    existing = await get_simulation(simulation_id, workspace_id)
    if existing.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot edit simulation in '{existing.status}' status. Only 'draft' simulations can be modified.",
        )

    # Build update payload (only non-None fields)
    update_data: dict[str, Any] = {}
    for field, value in data.model_dump(exclude_none=True).items():
        update_data[field] = value

    if not update_data:
        return existing

    # Recalculate credit estimate if relevant fields changed
    agent_count = update_data.get("agent_count_requested", existing.agent_count_requested)
    duration = update_data.get("duration_preset", existing.duration_preset)
    update_data["credit_estimate"] = estimate_credits(agent_count, duration)

    # Validate new agent count against plan limit
    if "agent_count_requested" in update_data:
        org_id = _get_org_for_workspace(workspace_id)
        _check_agent_limit(org_id, update_data["agent_count_requested"])

    result = (
        sb.table("simulations")
        .update(update_data)
        .eq("simulation_id", str(simulation_id))
        .eq("workspace_id", str(workspace_id))
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update simulation",
        )

    return SimulationResponse(**result.data[0])


async def delete_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> None:
    """
    Delete a simulation. Only allowed in 'draft' or 'canceled' status.
    """
    existing = await get_simulation(simulation_id, workspace_id)
    if existing.status not in ("draft", "canceled"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete simulation in '{existing.status}' status",
        )

    sb = get_supabase()
    sb.table("simulations").delete().eq(
        "simulation_id", str(simulation_id)
    ).execute()
