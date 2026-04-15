"""
Raktio API — Agent Atlas Router

Browse and inspect persistent synthetic agents.

Endpoints:
  GET    /api/agents                — list/filter agents
  GET    /api/agents/{agent_id}    — get agent profile with memory
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query

from app.auth.guards import AuthUser, require_user
from app.db.supabase_client import get_supabase
from app.repositories import agents as agent_repo
from app.repositories import memory as mem_repo

router = APIRouter()


@router.get("")
async def list_agents(
    user: AuthUser = Depends(require_user),
    country: str | None = Query(default=None),
    stance: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """List/filter global agents. Authenticated users can browse the population."""
    agents = agent_repo.find_global_agents(
        country=country,
        stance=stance,
        limit=limit,
        offset=offset,
    )

    # Count total
    sb = get_supabase()
    query = sb.table("agents").select("agent_id", count="exact").eq("is_global", True).eq("status", "active")
    if country:
        query = query.eq("country", country)
    if stance:
        query = query.eq("base_stance_bias", stance)
    count_result = query.execute()
    total = count_result.count or 0

    return {"items": agents, "total": total}


@router.get("/{agent_id}")
async def get_agent_profile(
    agent_id: uuid.UUID,
    user: AuthUser = Depends(require_user),
):
    """Get a full agent profile with memory, episodes, relationships, and topics."""
    agent = agent_repo.find_agent_by_id(agent_id)
    if not agent:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    aid = str(agent_id)

    # Memory summary
    summary = mem_repo.get_summary(aid)

    # Recent episodes
    episodes = mem_repo.get_episodes_for_agent(aid, limit=20)

    # Relationships
    relationships = mem_repo.get_relationships_for_agent(aid, limit=20)

    # Topic exposures
    topics = mem_repo.get_topic_exposures_for_agent(aid, limit=10)

    return {
        "agent": agent,
        "memory_summary": summary,
        "recent_episodes": episodes,
        "relationships": relationships,
        "topic_exposures": topics,
    }
