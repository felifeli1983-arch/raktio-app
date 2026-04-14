"""
Raktio API — Audiences Router

Endpoints:
  GET    /api/audiences                  — list audiences for workspace
  GET    /api/audiences/{audience_id}    — get single audience
  DELETE /api/audiences/{audience_id}    — archive an audience
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.guards import WorkspaceContext, require_workspace_member
from app.auth.permissions import can_delete_simulation
from app.repositories import agents as agent_repo
from app.schemas.audience import AudienceListResponse, AudienceResponse

router = APIRouter()


@router.get("", response_model=AudienceListResponse)
async def list_audiences(
    ctx: WorkspaceContext = Depends(require_workspace_member),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List audiences for the workspace, paginated."""
    offset = (page - 1) * page_size
    rows, total = agent_repo.list_audiences(ctx.workspace_id, offset, page_size)
    items = [AudienceResponse(**r) for r in rows]
    return AudienceListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{audience_id}", response_model=AudienceResponse)
async def get_audience(
    audience_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Get a single audience by ID."""
    row = agent_repo.find_audience_by_id(audience_id, ctx.workspace_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audience not found")
    return AudienceResponse(**row)


@router.delete("/{audience_id}", status_code=204)
async def archive_audience(
    audience_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Archive an audience (soft delete)."""
    if not can_delete_simulation(ctx.member_role):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Editors and above can archive audiences")

    row = agent_repo.find_audience_by_id(audience_id, ctx.workspace_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audience not found")

    from app.db.supabase_client import get_supabase
    sb = get_supabase()
    sb.table("audiences").update({"status": "archived"}).eq("audience_id", str(audience_id)).eq("workspace_id", str(ctx.workspace_id)).execute()
