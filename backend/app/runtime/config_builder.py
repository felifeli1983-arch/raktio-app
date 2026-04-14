"""
Raktio Runtime — Config Builder

Translates product-level simulation configuration into OASIS-executable
runtime configuration. Creates run workspace directory and prepares
all files needed to launch an OASIS simulation.

OASIS patterns used (from exploration):
  - OasisEnv via oasis.make(agent_graph, platform, db_path)
  - SocialAgent with UserInfo configs
  - AgentGraph container
  - DefaultPlatformType.TWITTER or REDDIT
  - LLMAction for agent inference
"""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from app.config import settings


def build_run_config(
    simulation_id: uuid.UUID,
    run_id: uuid.UUID,
    simulation_row: dict[str, Any],
    participants: list[dict[str, Any]],
    agents: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Build the runtime configuration for an OASIS simulation run.

    Args:
        simulation_id: The simulation UUID
        run_id: The run UUID
        simulation_row: Full simulation row from DB
        participants: simulation_participations rows (with runtime_stance, active_platforms_json)
        agents: Full agent rows for each participant

    Returns:
        Runtime config dict with:
        - run_workspace_path: absolute path to the run directory
        - sqlite_path: absolute path to the SQLite DB
        - agent_configs: list of OASIS-ready agent config dicts
        - platform_type: OASIS platform type string
        - duration_steps: number of simulation steps
        - recsys_type: recommendation system type
    """
    # Create run workspace directory
    workspace_base = Path(settings.oasis_run_workspace)
    run_dir = workspace_base / str(simulation_id) / str(run_id)
    run_dir.mkdir(parents=True, exist_ok=True)

    sqlite_path = str(run_dir / "social_media.db")

    # Map participants to agents
    agent_id_to_participant = {p["agent_id"]: p for p in participants}
    agent_id_to_agent = {a["agent_id"]: a for a in agents}

    # Build OASIS agent configs
    agent_configs = []
    for i, participant in enumerate(participants):
        agent_id = participant["agent_id"]
        agent = agent_id_to_agent.get(agent_id, {})

        # Determine recsys type from platform
        active_platforms = participant.get("active_platforms_json", ["x"])
        if isinstance(active_platforms, str):
            active_platforms = json.loads(active_platforms)

        # Map Raktio platform to OASIS recsys type
        primary_platform = active_platforms[0] if active_platforms else "x"
        recsys_map = {
            "x": "twitter",
            "reddit": "reddit",
            "instagram": "twitter",
            "tiktok": "twitter",
            "linkedin": "twitter",
        }
        recsys_type = recsys_map.get(primary_platform, "twitter")

        # Build UserInfo-compatible config
        agent_config = {
            "agent_index": i,
            "agent_id": agent_id,
            "user_name": agent.get("username", f"agent_{i}"),
            "name": agent.get("display_name", f"Agent {i}"),
            "description": _build_agent_description(agent, participant),
            "profile": {
                "gender": agent.get("gender", ""),
                "age": agent.get("age", 30),
                "country": agent.get("country", "US"),
                "city": agent.get("city", ""),
                "mbti": agent.get("mbti", ""),
                "profession": agent.get("profession", ""),
                "interests": agent.get("interests", []),
                "stance": participant.get("runtime_stance", "neutral"),
            },
            "recsys_type": recsys_type,
            "active_platforms": active_platforms,
        }
        agent_configs.append(agent_config)

    # Determine OASIS platform type
    platform_scope = simulation_row.get("platform_scope", ["x"])
    if isinstance(platform_scope, str):
        platform_scope = json.loads(platform_scope)

    primary_platform = platform_scope[0] if platform_scope else "x"
    oasis_platform_map = {
        "x": "twitter",
        "reddit": "reddit",
        "instagram": "twitter",
        "tiktok": "twitter",
        "linkedin": "twitter",
    }
    platform_type = oasis_platform_map.get(primary_platform, "twitter")

    # Calculate duration steps
    duration_preset = simulation_row.get("duration_preset", "24h")
    hours = int(duration_preset.replace("h", ""))
    # Each OASIS step represents ~1 simulated hour (configurable)
    duration_steps = hours

    # Build final runtime config
    runtime_config = {
        "simulation_id": str(simulation_id),
        "run_id": str(run_id),
        "run_workspace_path": str(run_dir),
        "sqlite_path": sqlite_path,
        "agent_configs": agent_configs,
        "agent_count": len(agent_configs),
        "platform_type": platform_type,
        "recsys_type": simulation_row.get("recsys_choice", "random"),
        "duration_steps": duration_steps,
        "duration_preset": duration_preset,
        "brief_text": simulation_row.get("brief_text", ""),
        "created_at": datetime.utcnow().isoformat(),
    }

    # Save config to run workspace for reproducibility
    config_path = run_dir / "runtime_config.json"
    with open(config_path, "w") as f:
        json.dump(runtime_config, f, indent=2, default=str)

    return runtime_config


def _build_agent_description(agent: dict, participant: dict) -> str:
    """Build a human-readable description for OASIS UserInfo."""
    parts = []

    if agent.get("profession"):
        parts.append(agent["profession"])
    if agent.get("city") and agent.get("country"):
        parts.append(f"from {agent['city']}, {agent['country']}")
    elif agent.get("country"):
        parts.append(f"from {agent['country']}")

    stance = participant.get("runtime_stance", "neutral")
    activity = agent.get("activity_level", "medium")
    parts.append(f"{stance} stance, {activity} activity")

    interests = agent.get("interests", [])
    if interests and isinstance(interests, list):
        parts.append(f"interested in {', '.join(interests[:5])}")

    return ". ".join(parts) if parts else "A social media user."
