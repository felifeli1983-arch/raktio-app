"""
Raktio Repository — Teams

Workspace membership CRUD and workspace management.
"""

from __future__ import annotations

import uuid
from typing import Any, Optional

from app.db.supabase_client import get_supabase


# ── Members ────────────────────────────────────────────────────────────

def list_members(workspace_id: str) -> list[dict[str, Any]]:
    """List all active members of a workspace with user info."""
    sb = get_supabase()
    result = (
        sb.table("workspace_memberships")
        .select("workspace_membership_id, user_id, role, joined_at, status, users(display_name, email)")
        .eq("workspace_id", workspace_id)
        .eq("status", "active")
        .order("joined_at")
        .execute()
    )
    return result.data or []


def find_membership(
    workspace_id: str,
    user_id: str,
) -> Optional[dict[str, Any]]:
    """Find a specific membership."""
    sb = get_supabase()
    result = (
        sb.table("workspace_memberships")
        .select("*")
        .eq("workspace_id", workspace_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def find_membership_by_id(membership_id: str) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("workspace_memberships")
        .select("*")
        .eq("workspace_membership_id", membership_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def add_member(
    workspace_id: str,
    user_id: str,
    role: str = "contributor",
) -> dict[str, Any]:
    """Add a member to a workspace. Returns the membership row."""
    sb = get_supabase()
    result = sb.table("workspace_memberships").insert({
        "workspace_id": workspace_id,
        "user_id": user_id,
        "role": role,
        "status": "active",
    }).execute()
    return result.data[0] if result.data else {}


def update_member_role(
    workspace_id: str,
    user_id: str,
    new_role: str,
) -> Optional[dict[str, Any]]:
    """Change a member's role."""
    sb = get_supabase()
    result = (
        sb.table("workspace_memberships")
        .update({"role": new_role})
        .eq("workspace_id", workspace_id)
        .eq("user_id", user_id)
        .eq("status", "active")
        .execute()
    )
    return result.data[0] if result.data else None


def remove_member(
    workspace_id: str,
    user_id: str,
) -> None:
    """Soft-remove a member (set status to 'removed')."""
    sb = get_supabase()
    sb.table("workspace_memberships").update({"status": "removed"}).eq(
        "workspace_id", workspace_id
    ).eq("user_id", user_id).execute()


# ── User lookup ────────────────────────────────────────────────────────

def find_user_by_email(email: str) -> Optional[dict[str, Any]]:
    """Find a user by email (for invite by email)."""
    sb = get_supabase()
    result = (
        sb.table("users")
        .select("user_id, display_name, email")
        .eq("email", email)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


# ── Workspaces ─────────────────────────────────────────────────────────

def list_workspaces_for_user(user_id: str) -> list[dict[str, Any]]:
    """List all workspaces a user belongs to."""
    sb = get_supabase()
    result = (
        sb.table("workspace_memberships")
        .select("workspace_id, role, workspaces(name, slug, organization_id, status)")
        .eq("user_id", user_id)
        .eq("status", "active")
        .execute()
    )
    return result.data or []
