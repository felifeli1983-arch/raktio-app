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
        all_agent_ids: list[str] = []
        generation_summary: dict[str, Any] = {"sourced_from_pool": 0, "newly_generated": 0, "by_country": {}}

        for country_spec in countries:
            country_code = country_spec.get("code", "US")
            country_share = country_spec.get("share", 1.0)
            country_count = max(1, round(requested_count * country_share))

            # Try to source from global pool
            existing = agent_repo.find_global_agents(
                country=country_code,
                limit=country_count,
            )
            sourced_ids = [a["agent_id"] for a in existing]
            generation_summary["sourced_from_pool"] += len(sourced_ids)

            # Generate missing agents
            gap = country_count - len(sourced_ids)
            generated_ids = []

            if gap > 0:
                # Get segment descriptions from planner
                segments = audience_comp.get("segments", [])
                segment_desc = "; ".join(
                    f"{s['name']} ({s.get('description', '')})"
                    for s in segments
                ) if segments else ""

                # Generate in batches of 15
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
                        )
                        generated_ids.extend(a["agent_id"] for a in new_agents)
                    except Exception:
                        # If LLM generation fails, continue with what we have
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

        # 6. Create simulation_participations
        if all_agent_ids:
            # Assign stances based on distribution
            stances = []
            for stance, share in stance_dist.items():
                stances.extend([stance] * max(1, round(len(all_agent_ids) * share)))
            random.shuffle(stances)
            stances = stances[:len(all_agent_ids)]
            while len(stances) < len(all_agent_ids):
                stances.append("neutral")

            participation_rows = [
                {
                    "simulation_id": str(simulation_id),
                    "agent_id": aid,
                    "runtime_stance": stances[i],
                    "active_platforms_json": platforms,
                }
                for i, aid in enumerate(all_agent_ids)
            ]
            for i in range(0, len(participation_rows), chunk_size):
                agent_repo.insert_participations_batch(
                    participation_rows[i:i + chunk_size]
                )

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
