"""
Raktio Billing — Plan Entitlements

Checks what a plan allows: agent limits, feature flags, etc.
"""

from __future__ import annotations

from typing import Any, Optional

from app.db.supabase_client import get_supabase


def get_plan(plan_id: str) -> Optional[dict[str, Any]]:
    """Get a plan by ID."""
    sb = get_supabase()
    result = sb.table("plans").select("*").eq("plan_id", plan_id).limit(1).execute()
    return result.data[0] if result.data else None


def get_org_plan(organization_id: str) -> Optional[dict[str, Any]]:
    """Get the plan for an organization."""
    sb = get_supabase()
    org = sb.table("organizations").select("plan_id").eq("organization_id", organization_id).limit(1).execute()
    if not org.data:
        return None
    return get_plan(org.data[0]["plan_id"])


def check_agent_limit(plan: dict[str, Any], requested: int) -> tuple[bool, int]:
    """Check if requested agent count is within plan limit. Returns (allowed, limit)."""
    limit = plan.get("agent_limit", 0)
    return requested <= limit, limit


def check_feature(plan: dict[str, Any], feature: str) -> bool:
    """Check if a feature is enabled for a plan."""
    flags = plan.get("feature_flags", {})
    return flags.get(feature, False)
