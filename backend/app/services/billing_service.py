"""
Raktio Service — Billing

Handles credit balance queries, usage history, and plan information.
Credit reservation and settlement are handled by launcher and oasis_worker.
This service provides the read/query side for the billing API.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException, status

from app.billing.credit_rules import estimate_credits
from app.billing.entitlements import get_org_plan
from app.db.supabase_client import get_supabase
from app.repositories import billing as billing_repo
from app.repositories import simulations as sim_repo


async def get_balance(
    workspace_id: uuid.UUID,
) -> dict[str, Any]:
    """Get credit balance for the workspace's organization."""
    org_id = sim_repo.get_workspace_org_id(workspace_id)
    if not org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace has no organization")

    balance = billing_repo.get_balance(org_id)
    if not balance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No credit balance found")

    plan = get_org_plan(org_id)

    return {
        "organization_id": org_id,
        "available_credits": balance["available_credits"],
        "reserved_credits": balance["reserved_credits"],
        "plan": {
            "plan_id": plan["plan_id"] if plan else None,
            "name": plan["name"] if plan else None,
            "agent_limit": plan["agent_limit"] if plan else None,
            "included_credits": plan.get("included_credits", 0) if plan else 0,
            "bonus_credits": plan.get("bonus_credits", 0) if plan else 0,
        } if plan else None,
    }


async def get_usage_history(
    workspace_id: uuid.UUID,
    limit: int = 50,
) -> dict[str, Any]:
    """Get credit usage history (ledger entries) for the workspace's org."""
    org_id = sim_repo.get_workspace_org_id(workspace_id)
    if not org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace has no organization")

    sb = get_supabase()
    result = (
        sb.table("credit_ledger")
        .select("*")
        .eq("organization_id", org_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return {
        "organization_id": org_id,
        "entries": result.data or [],
        "total": len(result.data or []),
    }


async def estimate_simulation_cost(
    agent_count: int,
    duration_preset: str,
    platform_scope: list[str] | None = None,
    geography_scope: dict | None = None,
) -> dict[str, Any]:
    """Estimate credit cost for a simulation configuration."""
    cost = estimate_credits(agent_count, duration_preset, platform_scope, geography_scope)
    return {
        "credit_estimate": cost,
        "agent_count": agent_count,
        "duration_preset": duration_preset,
        "platform_count": len(platform_scope) if platform_scope else 1,
        "formula": "agent_count × duration × platform × geography",
    }


async def get_plans() -> list[dict[str, Any]]:
    """Get all available plans."""
    sb = get_supabase()
    result = sb.table("plans").select("*").order("agent_limit").execute()
    return result.data or []
