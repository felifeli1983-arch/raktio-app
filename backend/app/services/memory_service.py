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

        # Track source language for memory records
        source_language = sim.get("simulation_language", "en")

        stats = {
            "episodes_created": 0,
            "relationships_updated": 0,
            "topics_updated": 0,
            "summaries_updated": 0,
        }

        # Episodic memory from posts + comments + behavior
        episodes = _extract_episodes(evidence, agent_map, str(simulation_id), run_id, source_language=source_language)
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
            agent_map, evidence, str(simulation_id), source_language=source_language,
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
    source_language: str = "en",
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
            "source_language": source_language,
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
            "source_language": source_language,
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
    """
    Extract topics from content. Uses hashtags if available,
    otherwise falls back to keyword extraction from significant
    words in the text (nouns, multi-word phrases).
    """
    if not content:
        return []

    # Try hashtags first
    words = content.split()
    hashtags = [w.lstrip("#").lower() for w in words if w.startswith("#")]
    if hashtags:
        return hashtags[:5]

    # Fallback: extract significant words/phrases from content
    # Remove common stop words and extract meaningful terms
    stop_words = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "need", "dare", "ought",
        "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
        "as", "into", "through", "during", "before", "after", "above", "below",
        "between", "out", "off", "over", "under", "again", "further", "then",
        "once", "here", "there", "when", "where", "why", "how", "all", "both",
        "each", "few", "more", "most", "other", "some", "such", "no", "nor",
        "not", "only", "own", "same", "so", "than", "too", "very", "just",
        "don", "now", "also", "about", "up", "its", "it", "this", "that",
        "these", "those", "i", "me", "my", "we", "our", "you", "your",
        "he", "him", "his", "she", "her", "they", "them", "their", "what",
        "which", "who", "whom", "and", "but", "or", "if", "while", "because",
        "been", "see", "like", "get", "got", "one", "think", "know", "much",
        "many", "any", "make", "way", "new", "even", "really", "well",
    }

    # Extract words 4+ chars, not stop words, lowercased
    significant = []
    for word in words:
        clean = word.strip(".,!?;:\"'()[]{}").lower()
        if len(clean) >= 4 and clean not in stop_words and clean.isalpha():
            significant.append(clean)

    # Count frequency and return top terms
    freq: dict[str, int] = {}
    for w in significant:
        freq[w] = freq.get(w, 0) + 1

    top = sorted(freq.items(), key=lambda x: -x[1])
    return [w for w, _ in top[:5]]


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
        # Accumulate strength across runs (read existing + add new)
        existing_rels = mem_repo.get_relationships_for_agent(from_id, limit=100)
        existing_strength = 0.0
        for r in existing_rels:
            if r.get("other_agent_id") == to_id:
                existing_strength = r.get("relationship_strength", 0.0)
                break
        new_strength = min(1.0, existing_strength + inter.get("count", 1) * 0.15)
        mem_repo.upsert_relationship(from_id, to_id, {
            "relationship_type": "recurring_interactor",
            "relationship_strength": new_strength,
            "last_interaction_at": now,
            "interaction_summary": f"Commented on their posts {inter.get('count', 1)} time(s)",
        })
        updated += 1

    for inter in interactions.get("like_interactions", []):
        from_id = agent_map.get(inter.get("from", ""))
        to_id = agent_map.get(inter.get("to", ""))
        if not from_id or not to_id or from_id == to_id:
            continue
        existing_rels = mem_repo.get_relationships_for_agent(from_id, limit=100)
        existing_strength = 0.0
        for r in existing_rels:
            if r.get("other_agent_id") == to_id:
                existing_strength = r.get("relationship_strength", 0.0)
                break
        new_strength = min(1.0, existing_strength + inter.get("count", 1) * 0.1)
        mem_repo.upsert_relationship(from_id, to_id, {
            "relationship_type": "recurring_interactor",
            "relationship_strength": new_strength,
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
    source_language: str = "en",
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

        # Build richer summary (capped at 500 chars to prevent unbounded growth)
        act_parts = []
        for k, v in agent_acts.items():
            if k not in ("refresh", "sign_up", "trend", "do_nothing"):
                act_parts.append(f"{k.replace('_', ' ')} ({v}x)")
        act_str = ", ".join(act_parts) if act_parts else "mostly observed"

        stance = agent_belief.get("behavioral_stance", "unknown")
        ratio = agent_belief.get("reaction_ratio")
        ratio_str = f" (reaction ratio: {ratio})" if ratio is not None else ""

        # Get top topics from this agent's existing exposure
        topics = mem_repo.get_topic_exposures_for_agent(agent_id, limit=3)
        topic_str = ", ".join(t["topic"] for t in topics) if topics else "general"

        summary_text = (
            f"Experienced {sim_count} simulation(s). "
            f"Most recent: {act_str}. "
            f"Behavioral tendency: {stance}{ratio_str}. "
            f"Key topics: {topic_str}."
        )[:500]  # Hard cap to prevent unbounded growth

        mem_repo.upsert_summary(agent_id, {
            "summary_text": summary_text,
            "recent_stance_summary": {
                "last_simulation": simulation_id,
                "behavioral_stance": agent_belief.get("behavioral_stance", "unknown"),
                "reaction_ratio": agent_belief.get("reaction_ratio"),
            },
            "simulation_count": sim_count,
            "memory_revision": revision,
            "source_language": source_language,
            "last_updated_at": datetime.now(timezone.utc).isoformat(),
        })
        updated += 1

    return updated
