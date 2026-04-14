"""
Raktio API — Admin Router

Platform admin control plane. All endpoints require platform_admin role.

Endpoints:
  GET  /api/admin/overview         — platform overview dashboard
  GET  /api/admin/tenants          — list organizations
  GET  /api/admin/tenants/{id}     — get organization detail
  GET  /api/admin/simulations      — list all simulations (cross-workspace)
  GET  /api/admin/runtime          — runtime health overview
  GET  /api/admin/costs            — LLM cost summary
  GET  /api/admin/population       — agent population stats
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.guards import AuthUser, require_admin
from app.repositories import admin as admin_repo
from app.services import admin_service

router = APIRouter()


@router.get("/overview")
async def platform_overview(
    user: AuthUser = Depends(require_admin),
):
    """High-level platform overview for admin dashboard."""
    return await admin_service.get_platform_overview()


@router.get("/tenants")
async def list_tenants(
    user: AuthUser = Depends(require_admin),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """List all organizations with plan info."""
    return await admin_service.list_tenants(limit, offset)


@router.get("/tenants/{organization_id}")
async def get_tenant(
    organization_id: uuid.UUID,
    user: AuthUser = Depends(require_admin),
):
    """Get detailed info for one organization."""
    result = await admin_service.get_tenant(str(organization_id))
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return result


@router.get("/simulations")
async def list_simulations_admin(
    user: AuthUser = Depends(require_admin),
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """List all simulations across all workspaces."""
    return await admin_service.list_simulations_admin(status_filter, limit, offset)


@router.get("/runtime")
async def runtime_overview(
    user: AuthUser = Depends(require_admin),
):
    """Runtime health: active runs, recent completions, failures."""
    return await admin_service.get_runtime_overview()


@router.get("/costs")
async def cost_overview(
    user: AuthUser = Depends(require_admin),
):
    """LLM cost summary across the platform."""
    return await admin_service.get_cost_overview()


@router.get("/population")
async def population_overview(
    user: AuthUser = Depends(require_admin),
):
    """Agent population statistics."""
    return await admin_service.get_population_overview()


@router.get("/audit")
async def list_audit_logs(
    user: AuthUser = Depends(require_admin),
    action_type: str | None = Query(default=None),
    organization_id: uuid.UUID | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """List audit log entries."""
    logs, total = admin_repo.list_audit_logs(
        limit, offset,
        action_type=action_type,
        organization_id=str(organization_id) if organization_id else None,
    )
    return {"items": logs, "total": total}
