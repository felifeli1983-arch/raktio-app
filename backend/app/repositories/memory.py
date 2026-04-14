"""
Raktio Repository — Memory

CRUD for the persistent memory system:
  - agent_memory_summaries (rolling summary per agent)
  - agent_episodic_memory (semantic episodes from runs)
  - agent_relationship_memory (cross-run relationships)
  - agent_topic_exposure (topic/narrative exposure)
  - memory_update_jobs (post-run transformation tracking)
"""

from __future__ import annotations

from typing import Any, Optional

from app.db.supabase_client import get_supabase


# ── Memory Summaries ──────────────────────────────────────────────────

def get_summary(agent_id: str) -> Optional[dict[str, Any]]:
    """Get the rolling memory summary for an agent."""
    sb = get_supabase()
    result = (
        sb.table("agent_memory_summaries")
        .select("*")
        .eq("agent_id", agent_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def upsert_summary(agent_id: str, data: dict[str, Any]) -> dict[str, Any]:
    """Insert or update the memory summary for an agent."""
    sb = get_supabase()
    data["agent_id"] = agent_id
    result = sb.table("agent_memory_summaries").upsert(data, on_conflict="agent_id").execute()
    return result.data[0] if result.data else {}


# ── Episodic Memory ──────────────────────────────────────────────────

def insert_episode(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("agent_episodic_memory").insert(row).execute()
    return result.data[0] if result.data else {}


def insert_episodes_batch(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not rows:
        return []
    sb = get_supabase()
    result = sb.table("agent_episodic_memory").insert(rows).execute()
    return result.data or []


def get_episodes_for_agent(
    agent_id: str,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """Get recent episodes for an agent, newest first."""
    sb = get_supabase()
    result = (
        sb.table("agent_episodic_memory")
        .select("*")
        .eq("agent_id", agent_id)
        .order("recorded_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


def get_episodes_for_simulation(
    simulation_id: str,
    agent_id: str | None = None,
) -> list[dict[str, Any]]:
    """Get all episodes from a simulation, optionally filtered by agent."""
    sb = get_supabase()
    query = (
        sb.table("agent_episodic_memory")
        .select("*")
        .eq("simulation_id", simulation_id)
    )
    if agent_id:
        query = query.eq("agent_id", agent_id)
    result = query.order("recorded_at").execute()
    return result.data or []


# ── Relationship Memory ──────────────────────────────────────────────

def upsert_relationship(
    agent_id: str,
    other_agent_id: str,
    data: dict[str, Any],
) -> dict[str, Any]:
    """Insert or update a relationship memory between two agents."""
    sb = get_supabase()
    data["agent_id"] = agent_id
    data["other_agent_id"] = other_agent_id
    result = sb.table("agent_relationship_memory").upsert(
        data, on_conflict="agent_id,other_agent_id"
    ).execute()
    return result.data[0] if result.data else {}


def get_relationships_for_agent(
    agent_id: str,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """Get all relationship memories for an agent."""
    sb = get_supabase()
    result = (
        sb.table("agent_relationship_memory")
        .select("*")
        .eq("agent_id", agent_id)
        .order("relationship_strength", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


# ── Topic Exposure ───────────────────────────────────────────────────

def upsert_topic_exposure(
    agent_id: str,
    topic: str,
    data: dict[str, Any],
) -> dict[str, Any]:
    """Insert or update topic exposure for an agent."""
    sb = get_supabase()
    data["agent_id"] = agent_id
    data["topic"] = topic
    result = sb.table("agent_topic_exposure").upsert(
        data, on_conflict="agent_id,topic"
    ).execute()
    return result.data[0] if result.data else {}


def get_topic_exposures_for_agent(
    agent_id: str,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """Get topic exposure records for an agent."""
    sb = get_supabase()
    result = (
        sb.table("agent_topic_exposure")
        .select("*")
        .eq("agent_id", agent_id)
        .order("exposure_count", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


# ── Memory Update Jobs ───────────────────────────────────────────────

def insert_job(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("memory_update_jobs").insert(row).execute()
    return result.data[0] if result.data else {}


def update_job(job_id: str, data: dict[str, Any]) -> None:
    sb = get_supabase()
    sb.table("memory_update_jobs").update(data).eq("memory_update_job_id", job_id).execute()


def get_job(job_id: str) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("memory_update_jobs")
        .select("*")
        .eq("memory_update_job_id", job_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def get_jobs_for_simulation(simulation_id: str) -> list[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("memory_update_jobs")
        .select("*")
        .eq("simulation_id", simulation_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []
