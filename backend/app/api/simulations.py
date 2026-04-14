"""
Raktio API — Simulations Router

Endpoints:
  POST   /api/simulations                  — create simulation (draft)
  GET    /api/simulations                  — list simulations for workspace
  GET    /api/simulations/{simulation_id}  — get single simulation
  PATCH  /api/simulations/{simulation_id}  — update draft simulation
  DELETE /api/simulations/{simulation_id}  — delete draft/canceled simulation
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.guards import WorkspaceContext, require_workspace_member
from app.auth.permissions import (
    can_create_simulation,
    can_delete_simulation,
    can_edit_simulation,
)
from app.schemas.simulation import (
    SimulationCreate,
    SimulationListResponse,
    SimulationResponse,
    SimulationUpdate,
)
from app.services import audience_service, brief_service, planner_service, simulation_service

router = APIRouter()


@router.post("", response_model=SimulationResponse, status_code=201)
async def create_simulation(
    body: SimulationCreate,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Create a new simulation in draft status."""
    if not can_create_simulation(ctx.member_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot create simulations",
        )

    return await simulation_service.create_simulation(
        workspace_id=ctx.workspace_id,
        user_id=ctx.user.user_id,
        data=body,
    )


@router.get("", response_model=SimulationListResponse)
async def list_simulations(
    ctx: WorkspaceContext = Depends(require_workspace_member),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List simulations for the workspace, paginated."""
    return await simulation_service.list_simulations(
        workspace_id=ctx.workspace_id,
        page=page,
        page_size=page_size,
    )


@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    simulation_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Get a single simulation by ID."""
    return await simulation_service.get_simulation(
        simulation_id=simulation_id,
        workspace_id=ctx.workspace_id,
    )


@router.patch("/{simulation_id}", response_model=SimulationResponse)
async def update_simulation(
    simulation_id: uuid.UUID,
    body: SimulationUpdate,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Update a draft simulation's configuration."""
    if not can_edit_simulation(ctx.member_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot modify simulations",
        )

    return await simulation_service.update_simulation(
        simulation_id=simulation_id,
        workspace_id=ctx.workspace_id,
        data=body,
    )


@router.post("/{simulation_id}/understand")
async def understand_simulation(
    simulation_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Run AI brief understanding on a draft simulation."""
    if not can_create_simulation(ctx.member_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot trigger brief understanding",
        )

    return await brief_service.understand_brief(
        simulation_id=simulation_id,
        workspace_id=ctx.workspace_id,
    )


@router.post("/{simulation_id}/prepare-audience")
async def prepare_audience(
    simulation_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Assemble the simulation audience from global pool + new generation."""
    if not can_create_simulation(ctx.member_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot prepare audiences",
        )

    return await audience_service.prepare_audience(
        simulation_id=simulation_id,
        workspace_id=ctx.workspace_id,
        user_id=ctx.user.user_id,
    )


@router.post("/{simulation_id}/plan")
async def plan_simulation(
    simulation_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Generate AI planner recommendation for a draft simulation."""
    if not can_create_simulation(ctx.member_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot trigger simulation planning",
        )

    return await planner_service.plan_simulation(
        simulation_id=simulation_id,
        workspace_id=ctx.workspace_id,
    )


@router.delete("/{simulation_id}", status_code=204)
async def delete_simulation(
    simulation_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Delete a draft or canceled simulation."""
    if not can_delete_simulation(ctx.member_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only editors and above can delete simulations",
        )

    await simulation_service.delete_simulation(
        simulation_id=simulation_id,
        workspace_id=ctx.workspace_id,
    )
