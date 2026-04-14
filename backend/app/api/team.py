"""
Raktio API — Team & Governance Router

Endpoints:
  GET    /api/team/members            — list workspace members
  POST   /api/team/members/invite     — invite member by email
  PATCH  /api/team/members/{user_id}  — change member role
  DELETE /api/team/members/{user_id}  — remove member
  GET    /api/team/workspaces         — list caller's workspaces
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth.guards import AuthUser, WorkspaceContext, require_user, require_workspace_member
from app.services import team_service

router = APIRouter()


class InviteMemberRequest(BaseModel):
    email: str
    role: str = "contributor"


class ChangeRoleRequest(BaseModel):
    role: str


@router.get("/members")
async def list_members(
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """List all active members of this workspace."""
    return await team_service.list_members(ctx.workspace_id)


@router.post("/members/invite", status_code=201)
async def invite_member(
    body: InviteMemberRequest,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Invite a user to this workspace by email."""
    return await team_service.invite_member(
        workspace_id=ctx.workspace_id,
        email=body.email,
        role=body.role,
        inviter_role=ctx.member_role,
        inviter_user_id=ctx.user.user_id,
    )


@router.patch("/members/{target_user_id}")
async def change_member_role(
    target_user_id: uuid.UUID,
    body: ChangeRoleRequest,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Change a member's role in this workspace."""
    return await team_service.change_role(
        workspace_id=ctx.workspace_id,
        target_user_id=target_user_id,
        new_role=body.role,
        changer_role=ctx.member_role,
        changer_user_id=ctx.user.user_id,
    )


@router.delete("/members/{target_user_id}", status_code=204)
async def remove_member(
    target_user_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(require_workspace_member),
):
    """Remove a member from this workspace."""
    await team_service.remove_member(
        workspace_id=ctx.workspace_id,
        target_user_id=target_user_id,
        remover_role=ctx.member_role,
        remover_user_id=ctx.user.user_id,
    )


@router.get("/workspaces")
async def list_my_workspaces(
    user: AuthUser = Depends(require_user),
):
    """List all workspaces the current user belongs to."""
    return await team_service.list_my_workspaces(user.user_id)
