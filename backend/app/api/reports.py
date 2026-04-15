"""
Raktio API — Reports Router

Endpoints:
  GET    /api/reports                        — list reports for workspace
  GET    /api/reports/{simulation_id}        — get report for a simulation
  POST   /api/reports/{simulation_id}/generate — trigger report generation
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.guards import WorkspaceContext, require_workspace_member
from app.auth.permissions import can_create_simulation
from app.repositories import reports as report_repo
from app.repositories import simulations as sim_repo
from app.services import report_service

router = APIRouter()


@router.get("")
async def list_reports(
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """List all reports for simulations in this workspace."""
    sim_ids = sim_repo.get_simulation_ids_for_workspace(str(ctx.workspace_id))
    if not sim_ids:
        return {"items": [], "total": 0}

    reports = report_repo.list_reports_by_simulation_ids(sim_ids)
    return {"items": reports, "total": len(reports)}


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
    language: str = Query(default="en", description="Output language for report analysis (e.g., 'en', 'it')"),
):
    """Trigger report generation for a simulation."""
    if not can_create_simulation(ctx.member_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot generate reports",
        )

    return await report_service.generate_report(simulation_id, ctx.workspace_id, language=language)
