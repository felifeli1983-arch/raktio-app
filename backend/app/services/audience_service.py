"""
Raktio Service — Audience Assembly

Phase 4 of the simulation pipeline (DATAFLOW_AND_RUNTIME.md):
Prepares the synthetic population for a simulation run.

Strategy (from AGENTS_AUDIENCE_MEMORY.md):
  1. Try to satisfy the requested setup from the global persistent pool
  2. Generate new agents only when coverage is insufficient
  3. Create an audience entity + memberships
  4. Create simulation_participations records

The planner recommendation (from Step 3B) drives the audience composition.
"""

from __future__ import annotations

import random
import uuid
from typing import Any

from fastapi import HTTPException, status

from app.repositories import agents as agent_repo
from app.repositories import simulations as sim_repo
from app.services import agent_service


async def prepare_audience(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
) -> dict[str, Any]:
    """
    Assemble the simulation audience.

    Prerequisites:
    - Simulation must be in 'draft' with planner_status='ready'
    - brief_context_json must be populated

    Steps:
    1. Read planner recommendation from simulation_configs
    2. Source agents from global pool where possible
    3. Generate new agents for gaps
    4. Create audience + memberships
    5. Create simulation_participations
    6. Update simulation.agent_count_final

    Returns summary dict.
    """
    # 1. Validate simulation state
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    if row.get("status") != "draft":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot prepare audience in '{row['status']}' status. Must be 'draft'.",
        )

    if row.get("planner_status") != "ready":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Planner not ready. Run /plan first.",
        )

    # Transition status
    sim_repo.update(simulation_id, workspace_id, {"status": "audience_preparing"})

    try:
        # 2. Get planner recommendation
        config = sim_repo.get_latest_config(simulation_id)
        planner_rec = {}
        if config and config.get("planner_recommendation_json"):
            planner_rec = config["planner_recommendation_json"]

        # Extract key parameters
        requested_count = row.get("agent_count_requested", 500)
        platforms = row.get("platform_scope", ["x"])
        brief_context = row.get("brief_context_json", {})

        # Get stance distribution from planner or use defaults
        audience_comp = planner_rec.get("audience_composition", {})
        stance_dist = audience_comp.get("stance_distribution", {
            "supportive": 0.30,
            "neutral": 0.40,
            "opposing": 0.20,
            "observer": 0.10,
        })

        # Get geography from planner or brief
        geo = planner_rec.get("geography_distribution", {})
        countries = geo.get("countries", [])
        if not countries:
            # Fallback to brief context
            geo_hints = brief_context.get("geography_hints", {})
            primary = geo_hints.get("primary_countries", ["US"])
            countries = [{"code": c, "share": 1.0 / len(primary)} for c in primary]

        # 3. Source from global pool + generate gaps
        # Track all sourced IDs to avoid cross-country duplicates
        all_agent_ids: list[str] = []
        sourced_id_set: set[str] = set()
        generation_summary: dict[str, Any] = {
            "sourced_from_pool": 0,
            "newly_generated": 0,
            "by_country": {},
            "total_requested": requested_count,
        }

        for country_spec in countries:
            country_code = country_spec.get("code", "US")
            country_share = country_spec.get("share", 1.0)
            country_count = max(1, round(requested_count * country_share))

            # Source from global pool — filter by platform presence,
            # exclude already-sourced agents (cross-country dedup)
            existing = agent_repo.find_global_agents(
                country=country_code,
                platforms=platforms,
                exclude_ids=list(sourced_id_set) if sourced_id_set else None,
                limit=country_count,
            )
            sourced_ids = [a["agent_id"] for a in existing]
            sourced_id_set.update(sourced_ids)
            generation_summary["sourced_from_pool"] += len(sourced_ids)

            # Generate missing agents
            gap = country_count - len(sourced_ids)
            generated_ids = []

            if gap > 0:
                segments = audience_comp.get("segments", [])
                segment_desc = "; ".join(
                    f"{s['name']} ({s.get('description', '')})"
                    for s in segments
                ) if segments else ""

                remaining = gap
                while remaining > 0:
                    batch = min(remaining, 15)
                    try:
                        new_agents = await agent_service.generate_agents(
                            count=batch,
                            country=country_code,
                            stance_distribution=stance_dist,
                            platforms=platforms,
                            segment_description=segment_desc,
                            log_context={
                                "simulation_id": str(simulation_id),
                                "workspace_id": str(workspace_id),
                            },
                        )
                        generated_ids.extend(a["agent_id"] for a in new_agents)
                    except Exception:
                        break
                    remaining -= batch

                generation_summary["newly_generated"] += len(generated_ids)

            country_agents = sourced_ids + generated_ids
            all_agent_ids.extend(country_agents[:country_count])
            generation_summary["by_country"][country_code] = {
                "requested": country_count,
                "sourced": len(sourced_ids),
                "generated": len(generated_ids),
                "total": min(len(country_agents), country_count),
            }

        # Deduplicate final list (safety net for any remaining overlaps)
        seen: set[str] = set()
        deduped_ids: list[str] = []
        for aid in all_agent_ids:
            if aid not in seen:
                seen.add(aid)
                deduped_ids.append(aid)
        all_agent_ids = deduped_ids

        # Coverage quality
        coverage_pct = round(len(all_agent_ids) / requested_count * 100, 1) if requested_count > 0 else 0
        generation_summary["coverage_pct"] = coverage_pct
        generation_summary["total_assembled"] = len(all_agent_ids)

        # 4. Create audience entity
        audience_row = agent_repo.insert_audience({
            "workspace_id": str(workspace_id),
            "created_by_user_id": str(user_id),
            "name": f"Audience for: {row.get('name', 'Simulation')}",
            "description": f"Auto-generated audience for simulation {simulation_id}",
            "audience_type": "generated",
            "agent_count": len(all_agent_ids),
            "geography_summary": {c["code"]: c.get("share", 0) for c in countries},
            "platform_summary": {p: True for p in platforms},
            "stance_summary": stance_dist,
        })
        audience_id = audience_row.get("audience_id")

        # 5. Create audience memberships
        if audience_id and all_agent_ids:
            membership_rows = [
                {"audience_id": audience_id, "agent_id": aid}
                for aid in all_agent_ids
            ]
            # Batch insert in chunks (Supabase has row limits per request)
            chunk_size = 500
            for i in range(0, len(membership_rows), chunk_size):
                agent_repo.insert_audience_memberships_batch(
                    membership_rows[i:i + chunk_size]
                )

        # 6. Create simulation_participations with per-segment stance
        if all_agent_ids:
            # Try per-segment stance from planner's candidate_audience_segments
            segments = brief_context.get("candidate_audience_segments", [])

            participation_rows = []
            for i, aid in enumerate(all_agent_ids):
                # Look up agent to determine segment
                agent = agent_repo.find_agent_by_id(uuid.UUID(aid))
                assigned_stance = _assign_segment_stance(agent, segments, stance_dist)

                participation_rows.append({
                    "simulation_id": str(simulation_id),
                    "agent_id": aid,
                    "runtime_stance": assigned_stance,
                    "active_platforms_json": platforms,
                })

            for i in range(0, len(participation_rows), chunk_size):
                agent_repo.insert_participations_batch(
                    participation_rows[i:i + chunk_size]
                )

        # 6.5. Influencer archetype assignment (R1A.3 — single tagging path)
        #
        # Policy: influencer count scales with population size.
        # Very small sims get zero influencers (all peers).
        # Larger sims get a graduated percentage that decreases as pop grows.
        #
        # Fresh mode: full influencer tagging per simulation.
        # Persistent mode: lighter tagging (50% rate) — memory creates emergent influence.
        memory_mode = row.get("memory_mode", "persistent")
        target_influencer_count = _compute_influencer_count(len(all_agent_ids), memory_mode)

        # Count existing influencers in the assembled audience
        existing_influencers = 0
        for aid in all_agent_ids:
            agent = agent_repo.find_agent_by_id(uuid.UUID(aid))
            if agent and agent.get("influence_weight", 1.0) >= 3.0:
                existing_influencers += 1

        # Only tag more if we need to reach the target
        to_tag_count = max(0, target_influencer_count - existing_influencers)
        if to_tag_count > 0:
            # Pick agents that are NOT already influencers
            candidates = [
                aid for aid in all_agent_ids
                if (agent_repo.find_agent_by_id(uuid.UUID(aid)) or {}).get("influence_weight", 1.0) < 3.0
            ]
            to_tag = random.sample(candidates, min(to_tag_count, len(candidates)))
            from app.db.supabase_client import get_supabase as _get_sb
            _sb = _get_sb()
            for aid in to_tag:
                _sb.table("agents").update({
                    "influence_weight": round(random.uniform(3.0, 5.0), 1),
                    "activity_level": "high",
                }).eq("agent_id", aid).execute()
            generation_summary["influencers_tagged"] = len(to_tag)
        else:
            generation_summary["influencers_tagged"] = 0
        generation_summary["influencers_total"] = existing_influencers + generation_summary["influencers_tagged"]

        # 7. Update simulation with audience link
        sim_repo.update(simulation_id, workspace_id, {
            "status": "draft",
            "agent_count_final": len(all_agent_ids),
            "audience_id": audience_id,
        })

        return {
            "audience_id": audience_id,
            "agent_count_final": len(all_agent_ids),
            "generation_summary": generation_summary,
        }

    except Exception as exc:
        # Revert on failure
        sim_repo.update(simulation_id, workspace_id, {"status": "draft"})
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audience preparation failed: {exc}",
        )


def _compute_influencer_count(total_agents: int, memory_mode: str = "fresh") -> int:
    """
    Compute how many influencer agents to tag based on population size.

    Policy:
    - < 10 agents: 0 (micro-group, all peers)
    - 10-29: 0 or 1 (30% chance of 1 — small focus group)
    - 30-99: ~4% (1-3 agents)
    - 100-499: ~3%
    - 500-4999: ~2%
    - 5000+: ~1.5%

    Persistent mode: 50% of normal rate (memory creates emergent influence).
    """
    if total_agents < 10:
        return 0
    if total_agents < 30:
        count = 1 if random.random() < 0.3 else 0
    elif total_agents < 100:
        count = max(1, round(total_agents * 0.04))
    elif total_agents < 500:
        count = max(2, round(total_agents * 0.03))
    elif total_agents < 5000:
        count = max(3, round(total_agents * 0.02))
    else:
        count = max(5, round(total_agents * 0.015))

    # Persistent mode: lighter forced tagging — memory drives emergent influence
    if memory_mode == "persistent":
        count = max(0, count // 2)

    return count


def _assign_segment_stance(agent: dict | None, segments: list, default_dist: dict) -> str:
    """
    Assign stance based on which segment the agent likely belongs to.
    Uses profession/age matching heuristics.
    Falls back to default stance distribution if no segment match.
    """
    if not agent or not segments:
        return _random_stance(default_dist)

    profession = (agent.get("profession") or "").lower()
    age = agent.get("age") or 30

    for seg in segments:
        seg_name = (seg.get("segment") or "").lower()
        # Simple heuristic: match profession keywords to segment names
        if any(kw in profession for kw in seg_name.split()):
            # Use segment's estimated_share to bias stance
            share = seg.get("estimated_share", 0.3)
            if share > 0.4:
                # Large segment -> more opposing (they feel the change most)
                return random.choice(["opposing", "opposing", "neutral", "supportive"])
            elif share < 0.15:
                # Small segment -> more supportive (decision makers)
                return random.choice(["supportive", "supportive", "neutral", "opposing"])

    return _random_stance(default_dist)


def _random_stance(dist: dict) -> str:
    """Pick a random stance from a distribution dict."""
    stances = []
    for stance, share in dist.items():
        stances.extend([stance] * max(1, round(100 * share)))
    return random.choice(stances) if stances else "neutral"
