"""
Raktio Service — Team & Governance

Workspace membership management: list, invite, change role, remove.
Permission checks are based on the caller's role in the workspace.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException, status

from app.auth.permissions import can_manage_members
from app.repositories import teams as team_repo
from app.repositories import admin as admin_repo

# Roles that can be assigned (in ascending order)
VALID_ROLES = frozenset({
    "viewer", "contributor", "editor",
    "workspace_admin", "billing_admin", "org_admin", "platform_admin",
})

# Only these roles can be assigned by workspace admins.
# org_admin and platform_admin require higher authority.
WORKSPACE_ASSIGNABLE_ROLES = frozenset({
    "viewer", "contributor", "editor", "workspace_admin", "billing_admin",
})


async def list_members(
    workspace_id: uuid.UUID,
) -> list[dict[str, Any]]:
    """List all active members of a workspace."""
    return team_repo.list_members(str(workspace_id))


async def invite_member(
    workspace_id: uuid.UUID,
    email: str,
    role: str,
    inviter_role: str,
    inviter_user_id: uuid.UUID,
) -> dict[str, Any]:
    """
    Invite a user to a workspace by email.

    Rules:
    - Inviter must be workspace_admin or higher
    - Target user must exist in the system (registered via Supabase Auth)
    - Target must not already be an active member
    - Role must be valid and within inviter's authority
    """
    if not can_manage_members(inviter_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace admins and above can invite members",
        )

    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {role}. Valid roles: {sorted(VALID_ROLES)}",
        )

    # Workspace admins can't assign org_admin or platform_admin
    if inviter_role == "workspace_admin" and role not in WORKSPACE_ASSIGNABLE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Workspace admins cannot assign '{role}'. Only org_admin+ can.",
        )

    # Find user by email
    user = team_repo.find_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No user found with email: {email}",
        )

    target_user_id = user["user_id"]

    # Check not already a member
    existing = team_repo.find_membership(str(workspace_id), target_user_id)
    if existing and existing.get("status") == "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already an active member of this workspace",
        )

    # Add member
    membership = team_repo.add_member(str(workspace_id), target_user_id, role)

    # Audit log
    try:
        admin_repo.insert_audit_log({
            "actor_user_id": str(inviter_user_id),
            "workspace_id": str(workspace_id),
            "action_type": "member_invited",
            "entity_type": "workspace_membership",
            "entity_id": membership.get("workspace_membership_id"),
            "metadata_json": {"email": email, "role": role},
        })
    except Exception:
        pass  # Best-effort audit

    return membership


async def change_role(
    workspace_id: uuid.UUID,
    target_user_id: uuid.UUID,
    new_role: str,
    changer_role: str,
    changer_user_id: uuid.UUID,
) -> dict[str, Any]:
    """Change a member's role."""
    if not can_manage_members(changer_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace admins and above can change roles",
        )

    if new_role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {new_role}",
        )

    if changer_role == "workspace_admin" and new_role not in WORKSPACE_ASSIGNABLE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Workspace admins cannot assign '{new_role}'",
        )

    # Can't change own role
    if target_user_id == changer_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role",
        )

    existing = team_repo.find_membership(str(workspace_id), str(target_user_id))
    if not existing or existing.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this workspace",
        )

    old_role = existing.get("role")
    result = team_repo.update_member_role(str(workspace_id), str(target_user_id), new_role)

    try:
        admin_repo.insert_audit_log({
            "actor_user_id": str(changer_user_id),
            "workspace_id": str(workspace_id),
            "action_type": "role_changed",
            "entity_type": "workspace_membership",
            "entity_id": existing.get("workspace_membership_id"),
            "metadata_json": {"old_role": old_role, "new_role": new_role, "target_user_id": str(target_user_id)},
        })
    except Exception:
        pass

    return result or existing


async def remove_member(
    workspace_id: uuid.UUID,
    target_user_id: uuid.UUID,
    remover_role: str,
    remover_user_id: uuid.UUID,
) -> None:
    """Remove a member from a workspace (soft delete)."""
    if not can_manage_members(remover_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace admins and above can remove members",
        )

    if target_user_id == remover_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove yourself",
        )

    existing = team_repo.find_membership(str(workspace_id), str(target_user_id))
    if not existing or existing.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )

    team_repo.remove_member(str(workspace_id), str(target_user_id))

    try:
        admin_repo.insert_audit_log({
            "actor_user_id": str(remover_user_id),
            "workspace_id": str(workspace_id),
            "action_type": "member_removed",
            "entity_type": "workspace_membership",
            "entity_id": existing.get("workspace_membership_id"),
            "metadata_json": {"target_user_id": str(target_user_id), "old_role": existing.get("role")},
        })
    except Exception:
        pass


async def list_my_workspaces(user_id: uuid.UUID) -> list[dict[str, Any]]:
    """List all workspaces the current user belongs to."""
    return team_repo.list_workspaces_for_user(str(user_id))
