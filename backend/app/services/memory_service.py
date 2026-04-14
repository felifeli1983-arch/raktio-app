"""
Raktio Service — Memory Transformation

Post-run service that converts completed simulation evidence into
persistent agent memory. Called after OASIS execution completes.

Transformation pipeline:
  1. Read evidence bundle from completed run's SQLite
  2. Create episodic memory entries from trace events
  3. Update relationship memory from interaction matrix
  4. Update topic exposure from post/comment content
  5. Update rolling memory summaries
  6. Track transformation via memory_update_jobs

Data sources:
  - build_evidence_bundle() from event_bridge (posts, comments, trace,
    agent activity, belief indicators, interaction matrix)
  - simulation_participations (agent-to-run mapping)

Memory targets:
  - agent_episodic_memory (new episodes per significant event)
  - agent_relationship_memory (upsert per agent pair)
  - agent_topic_exposure (upsert per agent+topic)
  - agent_memory_summaries (rolling summary update)
  - memory_update_jobs (tracking record)
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from app.repositories import agents as agent_repo
from app.repositories import memory as mem_repo
from app.repositories import simulations as sim_repo
from app.runtime.event_bridge import build_evidence_bundle

logger = logging.getLogger("raktio.memory_service")


async def transform_run_to_memory(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> dict[str, Any]:
    """
    Transform a completed simulation run into persistent agent memory.

    Prerequisites:
    - Simulation must be 'completed'
    - A simulation_runs record with sqlite_path must exist

    Returns summary of transformation.
    """
    sim = sim_repo.find_by_id(simulation_id, workspace_id)
    if not sim:
        raise ValueError(f"Simulation {simulation_id} not found")

    run = sim_repo.get_latest_run(simulation_id)
    if not run or not run.get("sqlite_path"):
        raise ValueError("No completed run with SQLite path found")

    sqlite_path = run["sqlite_path"]
    run_id = run["run_id"]

    # Create tracking job
    job = mem_repo.insert_job({
        "simulation_id": str(simulation_id),
        "run_id": run_id,
        "status": "running",
        "started_at": datetime.now(timezone.utc).isoformat(),
    })
    job_id = job["memory_update_job_id"]

    try:
        evidence = build_evidence_bundle(sqlite_path)
        participants = agent_repo.get_simulation_participants(simulation_id)
        agent_map = _build_agent_map(participants)

        stats = {
            "episodes_created": 0,
            "relationships_updated": 0,
            "topics_updated": 0,
            "summaries_updated": 0,
        }

        # Episodic memory from posts + comments + behavior
        episodes = _extract_episodes(evidence, agent_map, str(simulation_id), run_id)
        if episodes:
            for i in range(0, len(episodes), 100):
                mem_repo.insert_episodes_batch(episodes[i:i + 100])
            stats["episodes_created"] = len(episodes)

        # Relationship memory from interaction matrix
        interactions = evidence.get("interaction_matrix", {})
        stats["relationships_updated"] = _update_relationships(interactions, agent_map)

        # Topic exposure from content
        stats["topics_updated"] = _update_topic_exposure(evidence, agent_map)

        # Rolling summaries
        stats["summaries_updated"] = _update_summaries(
            agent_map, evidence, str(simulation_id),
        )

        mem_repo.update_job(job_id, {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "updated_agent_count": len(agent_map),
            "episodes_created": stats["episodes_created"],
            "relationships_updated": stats["relationships_updated"],
            "topics_updated": stats["topics_updated"],
        })

        logger.info(
            f"Memory transformation complete: {stats['episodes_created']} episodes, "
            f"{stats['relationships_updated']} relationships, "
            f"{stats['topics_updated']} topics, "
            f"{stats['summaries_updated']} summaries"
        )

        return {"job_id": job_id, "status": "completed", **stats, "agents_processed": len(agent_map)}

    except Exception as exc:
        mem_repo.update_job(job_id, {
            "status": "failed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "error_message": str(exc)[:500],
        })
        logger.error(f"Memory transformation failed: {exc}")
        raise


def _build_agent_map(participants: list[dict[str, Any]]) -> dict[str, str]:
    """Map OASIS username → Raktio agent_id."""
    agent_map: dict[str, str] = {}
    for p in participants:
        agent = agent_repo.find_agent_by_id(uuid.UUID(p["agent_id"]))
        if agent:
            agent_map[agent["username"]] = agent["agent_id"]
    return agent_map


def _extract_episodes(
    evidence: dict[str, Any],
    agent_map: dict[str, str],
    simulation_id: str,
    run_id: str,
) -> list[dict[str, Any]]:
    """Extract episodic memory entries from evidence."""
    episodes: list[dict[str, Any]] = []

    for post in evidence.get("posts", []):
        agent_id = agent_map.get(post.get("username", ""))
        if not agent_id:
            continue
        content = post.get("content") or ""
        topics = _extract_topics(content)
        episodes.append({
            "agent_id": agent_id, "simulation_id": simulation_id, "run_id": run_id,
            "episode_type": "created_post",
            "episode_text": f"Created a post: \"{content[:200]}\"",
            "topic_tags": topics,
            "importance_score": min(1.0, 0.5 + (post.get("num_likes", 0) * 0.1)),
            "linked_trace_ids": [post.get("post_id")],
        })

    for comment in evidence.get("comments", []):
        agent_id = agent_map.get(comment.get("username", ""))
        if not agent_id:
            continue
        content = comment.get("content") or ""
        episodes.append({
            "agent_id": agent_id, "simulation_id": simulation_id, "run_id": run_id,
            "episode_type": "created_comment",
            "episode_text": f"Commented on post {comment.get('post_id')}: \"{content[:200]}\"",
            "topic_tags": _extract_topics(content),
            "importance_score": 0.4,
            "linked_trace_ids": [comment.get("comment_id")],
        })

    belief = evidence.get("belief_indicators", {})
    for username, ind in belief.items():
        agent_id = agent_map.get(username)
        if not agent_id:
            continue
        stance = ind.get("behavioral_stance", "unknown")
        if stance in ("positive", "negative", "mixed"):
            episodes.append({
                "agent_id": agent_id, "simulation_id": simulation_id, "run_id": run_id,
                "episode_type": "changed_belief" if stance != "positive" else "liked_content",
                "episode_text": (
                    f"Behavioral stance: {stance}. "
                    f"Likes: {ind.get('likes_given', 0)}, Dislikes: {ind.get('dislikes_given', 0)}."
                ),
                "topic_tags": [],
                "importance_score": 0.6,
            })

    for edge in evidence.get("interaction_matrix", {}).get("follow_edges", []):
        agent_id = agent_map.get(edge.get("follower", ""))
        if agent_id:
            episodes.append({
                "agent_id": agent_id, "simulation_id": simulation_id, "run_id": run_id,
                "episode_type": "followed_agent",
                "episode_text": f"Followed {edge.get('followee', 'another agent')}.",
                "topic_tags": [],
                "importance_score": 0.3,
            })

    for edge in evidence.get("interaction_matrix", {}).get("mute_edges", []):
        agent_id = agent_map.get(edge.get("muter", ""))
        if agent_id:
            episodes.append({
                "agent_id": agent_id, "simulation_id": simulation_id, "run_id": run_id,
                "episode_type": "muted_agent",
                "episode_text": f"Muted {edge.get('mutee', 'another agent')}.",
                "topic_tags": [],
                "importance_score": 0.5,
            })

    return episodes


def _extract_topics(content: str) -> list[str]:
    """Simple topic extraction from hashtags."""
    if not content:
        return []
    words = content.split()
    hashtags = [w.lstrip("#").lower() for w in words if w.startswith("#")]
    return hashtags[:5] if hashtags else []


def _update_relationships(
    interactions: dict[str, Any],
    agent_map: dict[str, str],
) -> int:
    """Update relationship memory from interaction matrix."""
    updated = 0
    now = datetime.now(timezone.utc).isoformat()

    for inter in interactions.get("comment_interactions", []):
        from_id = agent_map.get(inter.get("from", ""))
        to_id = agent_map.get(inter.get("to", ""))
        if not from_id or not to_id or from_id == to_id:
            continue
        mem_repo.upsert_relationship(from_id, to_id, {
            "relationship_type": "recurring_interactor",
            "relationship_strength": min(1.0, inter.get("count", 1) * 0.2),
            "last_interaction_at": now,
            "interaction_summary": f"Commented on their posts {inter.get('count', 1)} time(s)",
        })
        updated += 1

    for inter in interactions.get("like_interactions", []):
        from_id = agent_map.get(inter.get("from", ""))
        to_id = agent_map.get(inter.get("to", ""))
        if not from_id or not to_id or from_id == to_id:
            continue
        mem_repo.upsert_relationship(from_id, to_id, {
            "relationship_type": "recurring_interactor",
            "relationship_strength": min(1.0, inter.get("count", 1) * 0.15),
            "last_interaction_at": now,
        })
        updated += 1

    for edge in interactions.get("follow_edges", []):
        f_id = agent_map.get(edge.get("follower", ""))
        t_id = agent_map.get(edge.get("followee", ""))
        if f_id and t_id:
            mem_repo.upsert_relationship(f_id, t_id, {
                "relationship_type": "follows",
                "follow_history_flag": True,
                "last_interaction_at": now,
            })
            updated += 1

    for edge in interactions.get("mute_edges", []):
        m_id = agent_map.get(edge.get("muter", ""))
        t_id = agent_map.get(edge.get("mutee", ""))
        if m_id and t_id:
            mem_repo.upsert_relationship(m_id, t_id, {
                "relationship_type": "muted",
                "conflict_history_flag": True,
                "last_interaction_at": now,
            })
            updated += 1

    return updated


def _update_topic_exposure(
    evidence: dict[str, Any],
    agent_map: dict[str, str],
) -> int:
    """Update topic exposure from post/comment hashtags."""
    updated = 0
    now = datetime.now(timezone.utc).isoformat()
    agent_topics: dict[str, dict[str, int]] = {}

    for item in evidence.get("posts", []) + evidence.get("comments", []):
        agent_id = agent_map.get(item.get("username", ""))
        if not agent_id:
            continue
        topics = _extract_topics(item.get("content", ""))
        if agent_id not in agent_topics:
            agent_topics[agent_id] = {}
        for t in topics:
            agent_topics[agent_id][t] = agent_topics[agent_id].get(t, 0) + 1

    for agent_id, topics in agent_topics.items():
        for topic, count in topics.items():
            mem_repo.upsert_topic_exposure(agent_id, topic, {
                "exposure_count": count,
                "positive_exposure_count": count,
                "last_exposed_at": now,
            })
            updated += 1

    return updated


def _update_summaries(
    agent_map: dict[str, str],
    evidence: dict[str, Any],
    simulation_id: str,
) -> int:
    """Update rolling memory summaries for all participating agents."""
    updated = 0
    activity = evidence.get("agent_activity", {})
    belief = evidence.get("belief_indicators", {})

    for username, agent_id in agent_map.items():
        existing = mem_repo.get_summary(agent_id)
        sim_count = (existing.get("simulation_count", 0) if existing else 0) + 1
        revision = (existing.get("memory_revision", 0) if existing else 0) + 1

        agent_belief = belief.get(username, {})
        agent_acts = activity.get(username, {})
        act_str = ", ".join(f"{k}: {v}" for k, v in agent_acts.items()) if agent_acts else "no significant activity"

        summary_text = (
            f"Participated in {sim_count} simulation(s). "
            f"Last activity: {act_str}. "
            f"Last stance: {agent_belief.get('behavioral_stance', 'unknown')}."
        )

        mem_repo.upsert_summary(agent_id, {
            "summary_text": summary_text,
            "recent_stance_summary": {
                "last_simulation": simulation_id,
                "behavioral_stance": agent_belief.get("behavioral_stance", "unknown"),
                "reaction_ratio": agent_belief.get("reaction_ratio"),
            },
            "simulation_count": sim_count,
            "memory_revision": revision,
            "last_updated_at": datetime.now(timezone.utc).isoformat(),
        })
        updated += 1

    return updated
