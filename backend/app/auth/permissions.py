"""
Raktio Auth — Permission helpers

Reusable role-check functions for API route guards.
Aligned with TEAM_GOVERNANCE_AND_PERMISSIONS.md role model:

  viewer < contributor < editor < workspace_admin < billing_admin < org_admin < platform_admin

Usage in API routes:
    from app.auth.permissions import can_create_simulation

    if not can_create_simulation(ctx.member_role):
        raise HTTPException(403, "...")
"""

from __future__ import annotations

# ── Role hierarchy (ascending power) ───────────────────────────────────

_CONTRIBUTOR_AND_ABOVE = frozenset({
    "contributor", "editor", "workspace_admin",
    "billing_admin", "org_admin", "platform_admin",
})

_EDITOR_AND_ABOVE = frozenset({
    "editor", "workspace_admin", "org_admin", "platform_admin",
})

_WORKSPACE_ADMIN_AND_ABOVE = frozenset({
    "workspace_admin", "org_admin", "platform_admin",
})

_BILLING_AUTHORIZED = frozenset({
    "billing_admin", "org_admin", "platform_admin",
})

_ORG_ADMIN_AND_ABOVE = frozenset({
    "org_admin", "platform_admin",
})

_PLATFORM_ADMIN_ONLY = frozenset({
    "platform_admin",
})


# ── Domain A: Simulations ──────────────────────────────────────────────

def can_view_simulation(role: str) -> bool:
    """Any workspace member can view simulations."""
    return True


def can_create_simulation(role: str) -> bool:
    """Contributors and above can create simulations."""
    return role in _CONTRIBUTOR_AND_ABOVE


def can_edit_simulation(role: str) -> bool:
    """Contributors and above can edit draft simulations."""
    return role in _CONTRIBUTOR_AND_ABOVE


def can_delete_simulation(role: str) -> bool:
    """Editors and above can delete simulations."""
    return role in _EDITOR_AND_ABOVE


def can_launch_simulation(role: str) -> bool:
    """Contributors and above can launch simulations."""
    return role in _CONTRIBUTOR_AND_ABOVE


# ── Domain G: Billing ──────────────────────────────────────────────────

def can_view_billing(role: str) -> bool:
    """Billing admins and above can view billing details."""
    return role in _BILLING_AUTHORIZED


def can_manage_billing(role: str) -> bool:
    """Billing admins and above can purchase credits / change plans."""
    return role in _BILLING_AUTHORIZED


# ── Domain H: Team / Workspace ─────────────────────────────────────────

def can_manage_members(role: str) -> bool:
    """Workspace admins and above can invite/remove members."""
    return role in _WORKSPACE_ADMIN_AND_ABOVE


# ── Domain I: Admin ────────────────────────────────────────────────────

def can_access_admin(role: str) -> bool:
    """Only platform admins can access the admin control plane."""
    return role in _PLATFORM_ADMIN_ONLY


def can_manage_org(role: str) -> bool:
    """Org admins and above can manage cross-workspace settings."""
    return role in _ORG_ADMIN_AND_ABOVE
