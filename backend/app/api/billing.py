"""
Raktio API — Billing Router

Endpoints:
  GET    /api/billing/balance         — credit balance + plan info
  GET    /api/billing/usage           — credit usage history (ledger)
  POST   /api/billing/estimate        — estimate simulation cost
  GET    /api/billing/plans           — list available plans
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.auth.guards import WorkspaceContext, require_workspace_member
from app.schemas.billing import CreditEstimateRequest
from app.services import billing_service

router = APIRouter()


@router.get("/balance")
async def get_balance(
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Get credit balance and plan info for the workspace's organization."""
    return await billing_service.get_balance(ctx.workspace_id)


@router.get("/usage")
async def get_usage_history(
    ctx: WorkspaceContext = Depends(require_workspace_member),
    limit: int = Query(default=50, ge=1, le=200),
):
    """Get credit usage history (ledger entries)."""
    return await billing_service.get_usage_history(ctx.workspace_id, limit)


@router.post("/estimate")
async def estimate_cost(
    body: CreditEstimateRequest,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Estimate credit cost for a simulation configuration."""
    return await billing_service.estimate_simulation_cost(
        agent_count=body.agent_count,
        duration_preset=body.duration_preset,
        platform_scope=body.platform_scope,
        geography_scope=body.geography_scope,
    )


@router.get("/plans")
async def list_plans():
    """List all available plans (public endpoint)."""
    return await billing_service.get_plans()
