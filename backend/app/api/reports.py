"""
Raktio API — Reports Router

Endpoints:
  GET    /api/reports                        — list reports for workspace
  GET    /api/reports/{simulation_id}        — get report for a simulation
  POST   /api/reports/{simulation_id}/generate — trigger report generation
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.guards import WorkspaceContext, require_workspace_member
from app.auth.permissions import can_create_simulation
from app.db.supabase_client import get_supabase
from app.services import report_service

router = APIRouter()


@router.get("")
async def list_reports(
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """List all reports for simulations in this workspace."""
    sb = get_supabase()

    # Get simulation IDs for this workspace
    sims = sb.table("simulations").select("simulation_id").eq(
        "workspace_id", str(ctx.workspace_id)
    ).execute()

    if not sims.data:
        return {"items": [], "total": 0}

    sim_ids = [s["simulation_id"] for s in sims.data]

    reports = sb.table("reports").select("*").in_(
        "simulation_id", sim_ids
    ).order("created_at", desc=True).execute()

    return {"items": reports.data or [], "total": len(reports.data or [])}


@router.get("/{simulation_id}")
async def get_report(
    simulation_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Get the latest report for a simulation, with all sections."""
    return await report_service.get_report(simulation_id, ctx.workspace_id)


@router.post("/{simulation_id}/generate")
async def generate_report(
    simulation_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Trigger report generation for a simulation."""
    if not can_create_simulation(ctx.member_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot generate reports",
        )

    return await report_service.generate_report(simulation_id, ctx.workspace_id)
