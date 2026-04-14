"""
Raktio API — Knowledge & Sources Router

Endpoints:
  POST   /api/knowledge/sources              — upload source (file or text)
  GET    /api/knowledge/sources               — list sources for workspace
  GET    /api/knowledge/sources/{source_id}   — get source with extraction
  POST   /api/knowledge/sources/{source_id}/link — link source to simulation
"""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.auth.guards import WorkspaceContext, require_workspace_member
from app.auth.permissions import can_create_simulation
from app.services import knowledge_service

router = APIRouter()


@router.post("/sources", status_code=201)
async def upload_source(
    title: str = Form(...),
    description: Optional[str] = Form(default=None),
    raw_text: Optional[str] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Upload a source document or paste raw text."""
    if not can_create_simulation(ctx.member_role):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Viewers cannot upload sources")

    return await knowledge_service.upload_source(
        workspace_id=ctx.workspace_id,
        user_id=ctx.user.user_id,
        title=title,
        file=file,
        raw_text=raw_text,
        description=description,
    )


@router.get("/sources")
async def list_sources(
    ctx: WorkspaceContext = Depends(require_workspace_member),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """List sources for the workspace."""
    return await knowledge_service.list_sources(ctx.workspace_id, limit, offset)


@router.get("/sources/{source_id}")
async def get_source(
    source_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Get a source with its extraction."""
    return await knowledge_service.get_source(source_id, ctx.workspace_id)


@router.post("/sources/{source_id}/link")
async def link_source_to_simulation(
    source_id: uuid.UUID,
    simulation_id: uuid.UUID = Query(...),
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Link a source to a simulation for grounding."""
    if not can_create_simulation(ctx.member_role):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Viewers cannot link sources")

    return await knowledge_service.link_source_to_simulation(
        source_id=source_id,
        simulation_id=simulation_id,
        workspace_id=ctx.workspace_id,
    )
