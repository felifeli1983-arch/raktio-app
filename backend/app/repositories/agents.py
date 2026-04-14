"""
Raktio Repository — Agents

All direct Supabase/DB access for the agents domain.
Covers: agents, agent_platform_presence, audiences, audience_memberships,
simulation_participations.
"""

from __future__ import annotations

import uuid
from typing import Any, Optional

from app.db.supabase_client import get_supabase


# ── Agents ─────────────────────────────────────────────────────────────

def insert_agent(row: dict[str, Any]) -> dict[str, Any]:
    """Insert a single agent. Returns the inserted row."""
    sb = get_supabase()
    result = sb.table("agents").insert(row).execute()
    return result.data[0] if result.data else {}


def insert_agents_batch(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Insert multiple agents in one call. Returns inserted rows."""
    if not rows:
        return []
    sb = get_supabase()
    result = sb.table("agents").insert(rows).execute()
    return result.data or []


def find_agent_by_id(agent_id: uuid.UUID) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("agents")
        .select("*")
        .eq("agent_id", str(agent_id))
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def find_agent_by_username(username: str) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("agents")
        .select("*")
        .eq("username", username)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def count_global_agents_by_country(country: str) -> int:
    """Count global agents for a given country."""
    sb = get_supabase()
    result = (
        sb.table("agents")
        .select("agent_id", count="exact")
        .eq("is_global", True)
        .eq("country", country)
        .eq("status", "active")
        .execute()
    )
    return result.count or 0


def find_global_agents(
    country: Optional[str] = None,
    stance: Optional[str] = None,
    platforms: Optional[list[str]] = None,
    exclude_ids: Optional[list[str]] = None,
    limit: int = 100,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """
    Find global agents with optional filters.

    Args:
        country: Filter by country code
        stance: Filter by base_stance_bias
        platforms: If provided, only return agents that have presence on
                   at least one of these platforms (via agent_platform_presence)
        exclude_ids: Agent IDs to exclude (for dedup across batches)
        limit: Max results
        offset: Pagination offset
    """
    sb = get_supabase()

    if platforms:
        # Join with agent_platform_presence to filter by platform
        # Get agent_ids that have presence on any of the requested platforms
        presence_result = (
            sb.table("agent_platform_presence")
            .select("agent_id")
            .in_("platform", platforms)
            .eq("is_active", True)
            .execute()
        )
        platform_agent_ids = list({r["agent_id"] for r in (presence_result.data or [])})
        if not platform_agent_ids:
            return []  # No agents have the required platform presence

        query = (
            sb.table("agents")
            .select("*")
            .eq("is_global", True)
            .eq("status", "active")
            .in_("agent_id", platform_agent_ids)
        )
    else:
        query = (
            sb.table("agents")
            .select("*")
            .eq("is_global", True)
            .eq("status", "active")
        )

    if country:
        query = query.eq("country", country)
    if stance:
        query = query.eq("base_stance_bias", stance)
    if exclude_ids:
        query = query.not_.in_("agent_id", exclude_ids)

    result = query.range(offset, offset + limit - 1).execute()
    return result.data or []


# ── Agent Platform Presence ────────────────────────────────────────────

def insert_platform_presence_batch(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not rows:
        return []
    sb = get_supabase()
    result = sb.table("agent_platform_presence").insert(rows).execute()
    return result.data or []


# ── Audiences ──────────────────────────────────────────────────────────

def insert_audience(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("audiences").insert(row).execute()
    return result.data[0] if result.data else {}


def find_audience_by_id(
    audience_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("audiences")
        .select("*")
        .eq("audience_id", str(audience_id))
        .eq("workspace_id", str(workspace_id))
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def list_audiences(
    workspace_id: uuid.UUID,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[dict[str, Any]], int]:
    sb = get_supabase()
    count_result = (
        sb.table("audiences")
        .select("audience_id", count="exact")
        .eq("workspace_id", str(workspace_id))
        .eq("status", "active")
        .execute()
    )
    total = count_result.count or 0

    result = (
        sb.table("audiences")
        .select("*")
        .eq("workspace_id", str(workspace_id))
        .eq("status", "active")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data or [], total


# ── Audience Memberships ───────────────────────────────────────────────

def insert_audience_memberships_batch(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not rows:
        return []
    sb = get_supabase()
    result = sb.table("audience_memberships").insert(rows).execute()
    return result.data or []


def get_audience_agent_ids(audience_id: uuid.UUID) -> list[str]:
    """Return list of agent_id strings for an audience."""
    sb = get_supabase()
    result = (
        sb.table("audience_memberships")
        .select("agent_id")
        .eq("audience_id", str(audience_id))
        .execute()
    )
    return [r["agent_id"] for r in (result.data or [])]


# ── Simulation Participations ──────────────────────────────────────────

def insert_participations_batch(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not rows:
        return []
    sb = get_supabase()
    result = sb.table("simulation_participations").insert(rows).execute()
    return result.data or []


def get_simulation_participants(
    simulation_id: uuid.UUID,
) -> list[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("simulation_participations")
        .select("*")
        .eq("simulation_id", str(simulation_id))
        .execute()
    )
    return result.data or []
