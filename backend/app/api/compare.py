"""
Raktio API — Compare Router

Endpoints:
  GET    /api/compare                    — list compare runs for workspace
  GET    /api/compare/{compare_id}       — get single compare
  POST   /api/compare                    — create a new compare
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.guards import WorkspaceContext, require_workspace_member
from app.auth.permissions import can_create_simulation
from app.schemas.compare import CompareCreate
from app.services import compare_service

router = APIRouter()


@router.get("")
async def list_compares(
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """List all compare runs for this workspace."""
    items = await compare_service.list_compares(ctx.workspace_id)
    return {"items": items, "total": len(items)}


@router.get("/{compare_id}")
async def get_compare(
    compare_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Get a single compare run."""
    return await compare_service.get_compare(compare_id, ctx.workspace_id)


@router.post("", status_code=201)
async def create_compare(
    body: CompareCreate,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Create a new comparison between two simulations."""
    if not can_create_simulation(ctx.member_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot create comparisons",
        )

    return await compare_service.create_compare(
        workspace_id=ctx.workspace_id,
        base_simulation_id=body.base_simulation_id,
        target_simulation_id=body.target_simulation_id,
        compare_type=body.compare_type,
    )
