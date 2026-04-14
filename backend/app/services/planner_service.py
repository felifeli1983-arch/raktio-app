"""
Raktio Service — Simulation Planner

Phase 3 of the simulation pipeline (DATAFLOW_AND_RUNTIME.md):
Takes the brief_context_json from Phase 2 and generates a recommended
simulation configuration via Claude Sonnet (PLANNING route).

Outputs stored in simulation_configs.planner_recommendation_json.
Simulation planner_status transitions: pending → running → ready (or failed).
"""

from __future__ import annotations

import json
import uuid

from fastapi import HTTPException, status

from app.adapters.llm_adapter import llm_adapter, LLMResponse
from app.config import ModelRoute
from app.db.supabase_client import get_supabase
from app.repositories import simulations as sim_repo


# ── System prompt for planner ──────────────────────────────────────────

PLANNER_SYSTEM = """You are the Simulation Planner module of Raktio, a social reaction simulation platform.

You receive a structured brief understanding (from the Brief Understanding phase) and the user's initial simulation parameters. Your job is to generate an optimized simulation configuration recommendation.

You must output valid JSON with this exact structure:
{
  "recommended_agent_count": 2000,
  "recommended_duration": "24h",
  "recommended_platforms": ["x", "instagram"],
  "recommended_recsys": "random",
  "geography_distribution": {
    "countries": [
      {"code": "IT", "share": 0.7, "regions": ["Lombardia", "Lazio", "Campania"]},
      {"code": "US", "share": 0.3, "regions": ["California", "New York"]}
    ]
  },
  "audience_composition": {
    "segments": [
      {
        "name": "Segment name",
        "share": 0.3,
        "stance_bias": "supportive",
        "activity_level": "high",
        "description": "Why this segment matters"
      }
    ],
    "stance_distribution": {
      "supportive": 0.35,
      "neutral": 0.35,
      "opposing": 0.20,
      "observer": 0.10
    }
  },
  "platform_strategy": {
    "primary": "x",
    "secondary": ["instagram"],
    "rationale": "Why these platforms"
  },
  "complexity_assessment": {
    "level": "medium",
    "bootstrap_estimate": "2-5 minutes",
    "runtime_estimate": "10-30 minutes"
  },
  "planner_rationale": "One paragraph explaining the overall simulation design choices",
  "confidence": 0.8,
  "warnings": ["Warning 1 if any"]
}

Rules:
- Always output valid JSON, nothing else
- Platforms must only use: x, reddit, instagram, tiktok, linkedin
- Country codes must be ISO 3166-1 alpha-2
- stance_bias must be: supportive, neutral, opposing, or observer
- activity_level must be: low, medium, or high
- Shares in stance_distribution must sum to 1.0
- Shares in segments must sum to approximately 1.0
- confidence is a float between 0 and 1
- Be specific and actionable, not generic
"""


async def plan_simulation(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> dict:
    """
    Generate a planner recommendation for a simulation.

    Prerequisites:
    - Simulation must be in 'draft' status
    - brief_context_json must be populated (Phase 2 completed)

    Steps:
    1. Validates prerequisites
    2. Sets planner_status to 'running'
    3. Calls Claude Sonnet (PLANNING route) with brief context + user params
    4. Stores result in simulation_configs.planner_recommendation_json
    5. Sets planner_status to 'ready'

    Returns the planner recommendation dict.
    """
    # 1. Fetch and validate
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    if row.get("status") != "draft":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot plan simulation in '{row['status']}' status. Must be 'draft'.",
        )

    brief_context = row.get("brief_context_json")
    if not brief_context:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Brief understanding not yet completed. Run /understand first.",
        )

    # 2. Transition planner_status to 'running'
    sim_repo.update(simulation_id, workspace_id, {
        "planner_status": "running",
        "status": "planning",
    })

    try:
        # 3. Build context for the planner
        user_params = {
            "agent_count_requested": row.get("agent_count_requested"),
            "duration_preset": row.get("duration_preset"),
            "platform_scope": row.get("platform_scope"),
            "geography_scope": row.get("geography_scope"),
            "recsys_choice": row.get("recsys_choice"),
        }

        user_message = (
            f"## Brief Understanding\n"
            f"```json\n{json.dumps(brief_context, indent=2)}\n```\n\n"
            f"## User's Initial Parameters\n"
            f"```json\n{json.dumps(user_params, indent=2)}\n```\n\n"
            f"Generate an optimized simulation configuration recommendation "
            f"based on the brief understanding above and the user's initial parameters. "
            f"Respect the user's platform and geography choices where provided, "
            f"but suggest improvements or additions where beneficial."
        )

        response: LLMResponse = await llm_adapter.complete(
            route=ModelRoute.PLANNING,
            messages=[{"role": "user", "content": user_message}],
            system=PLANNER_SYSTEM,
            max_tokens=4096,
            temperature=0.4,
        )

        # 4. Parse JSON response
        try:
            recommendation = json.loads(response.content)
        except json.JSONDecodeError:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            recommendation = json.loads(content)

        recommendation["_llm_metadata"] = {
            "model": response.model,
            "usage": response.usage,
        }

        # 5. Store in simulation_configs + update simulation
        sb = get_supabase()

        # Find existing config or create version 1
        existing_configs = (
            sb.table("simulation_configs")
            .select("config_version")
            .eq("simulation_id", str(simulation_id))
            .order("config_version", desc=True)
            .limit(1)
            .execute()
        )
        next_version = 1
        if existing_configs.data:
            next_version = existing_configs.data[0]["config_version"] + 1

        sb.table("simulation_configs").insert({
            "simulation_id": str(simulation_id),
            "config_version": next_version,
            "planner_recommendation_json": recommendation,
        }).execute()

        # Update simulation status
        sim_repo.update(simulation_id, workspace_id, {
            "planner_status": "ready",
            "status": "draft",
        })

        return recommendation

    except Exception as exc:
        # On failure, revert planner_status
        sim_repo.update(simulation_id, workspace_id, {
            "planner_status": "failed",
            "status": "draft",
        })

        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Planner failed: {exc}",
        )
