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
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from app.config import settings
from app.repositories import memory as mem_repo
from app.runtime.platform_profiles import get_profile, get_oasis_backend, get_behavior_prompt
from app.runtime.constants import (
    INFLUENCE_HIGH_LABEL, INFLUENCE_LOW_LABEL, INFLUENCE_MODERATE_LABEL,
    INFLUENCE_HIGH_THRESHOLD, INFLUENCE_LOW_THRESHOLD,
)


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

    # Determine simulation-level primary platform
    sim_platform_scope = simulation_row.get("platform_scope", ["x"])
    if isinstance(sim_platform_scope, str):
        sim_platform_scope = json.loads(sim_platform_scope)
    sim_primary_platform = sim_platform_scope[0] if sim_platform_scope else "x"
    sim_platform_profile = get_profile(sim_primary_platform)

    # Build OASIS agent configs
    agent_configs = []
    for i, participant in enumerate(participants):
        agent_id = participant["agent_id"]
        agent = agent_id_to_agent.get(agent_id, {})

        active_platforms = participant.get("active_platforms_json", ["x"])
        if isinstance(active_platforms, str):
            active_platforms = json.loads(active_platforms)

        agent_primary = active_platforms[0] if active_platforms else sim_primary_platform
        recsys_type = get_oasis_backend(agent_primary)

        # Build UserInfo-compatible config
        agent_config = {
            "agent_index": i,
            "agent_id": agent_id,
            "user_name": agent.get("username", f"agent_{i}"),
            "name": agent.get("display_name", f"Agent {i}"),
            "description": _build_agent_description(agent, participant, sim_primary_platform),
            "profile": {
                "gender": agent.get("gender", ""),
                "age": agent.get("age", 30),
                "country": agent.get("country", "US"),
                "city": agent.get("city", ""),
                "mbti": agent.get("mbti", ""),
                "profession": agent.get("profession", ""),
                "interests": agent.get("interests", []),
                "stance": participant.get("runtime_stance", "neutral"),
                "influence_weight": agent.get("influence_weight", 1.0),
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
    platform_type = get_oasis_backend(primary_platform)

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
        "primary_platform": sim_primary_platform,
        "peak_hours_shift": sim_platform_profile.peak_hours_shift,
        "created_at": datetime.utcnow().isoformat(),
    }

    # Save config to run workspace for reproducibility
    config_path = run_dir / "runtime_config.json"
    with open(config_path, "w") as f:
        json.dump(runtime_config, f, indent=2, default=str)

    return runtime_config


def _build_agent_description(agent: dict, participant: dict, platform: str = "x") -> str:
    """
    Build a human-readable description for OASIS UserInfo.

    Includes:
    - Agent identity (profession, location, stance, activity, influence)
    - Platform-specific behavioral guidance
    - Influence-level behavioral guidance
    - Persistent memory context (if returning agent)

    Token budget: ~400-600 chars total (measured).
    """
    parts = []

    if agent.get("profession"):
        parts.append(agent["profession"])
    if agent.get("city") and agent.get("country"):
        parts.append(f"from {agent['city']}, {agent['country']}")
    elif agent.get("country"):
        parts.append(f"from {agent['country']}")

    stance = participant.get("runtime_stance", "neutral")
    activity = agent.get("activity_level", "medium")
    influence = agent.get("influence_weight", 1.0)

    # Classify influence level for description
    if influence >= INFLUENCE_HIGH_THRESHOLD:
        influence_label = INFLUENCE_HIGH_LABEL
    elif influence <= INFLUENCE_LOW_THRESHOLD:
        influence_label = INFLUENCE_LOW_LABEL
    else:
        influence_label = INFLUENCE_MODERATE_LABEL

    parts.append(f"{stance} stance, {activity} activity, {influence_label}")

    # High-influence agents get explicit behavioral guidance
    if influence >= 2.0:
        parts.append(
            "As a high-influence voice, you tend to create authoritative content "
            "that sparks discussion. You post frequently and others often engage "
            "with your content"
        )
    elif influence <= 0.5:
        parts.append(
            "You tend to observe and react to others' content more than creating "
            "your own. You are more likely to like, comment, or follow than to post"
        )

    interests = agent.get("interests", [])
    if interests and isinstance(interests, list):
        parts.append(f"interested in {', '.join(interests[:5])}")

    # Platform-specific behavioral guidance
    platform_prompt = get_behavior_prompt(platform)
    if platform_prompt:
        parts.append(platform_prompt)

    # Inject persistent memory context (if available)
    memory_context = _get_memory_context(agent.get("agent_id"))
    if memory_context:
        parts.append(memory_context)

    return ". ".join(parts) if parts else "A social media user."


# Max chars for memory in agent description (controls token bloat)
_MAX_MEMORY_SUMMARY_CHARS = 200
_MAX_MEMORY_TOPICS = 5


def _get_memory_context(agent_id: str | None) -> str | None:
    """
    Build a concise memory context string for an agent.

    Returns None if the agent has no prior memory (first simulation).
    Returns a bounded string (~50-100 words) for returning agents.
    """
    if not agent_id:
        return None

    try:
        summary = mem_repo.get_summary(agent_id)
        if not summary or summary.get("simulation_count", 0) == 0:
            return None

        parts = []

        # Rolling summary (truncated)
        summary_text = summary.get("summary_text", "")
        if summary_text:
            parts.append(f"Past experience: {summary_text[:_MAX_MEMORY_SUMMARY_CHARS]}")

        # Recent stance
        stance_info = summary.get("recent_stance_summary", {})
        if isinstance(stance_info, dict) and stance_info.get("behavioral_stance"):
            parts.append(f"Recent tendency: {stance_info['behavioral_stance']}")

        # Top topic exposures
        topics = mem_repo.get_topic_exposures_for_agent(agent_id, limit=_MAX_MEMORY_TOPICS)
        if topics:
            topic_strs = []
            for t in topics:
                stance = t.get("stance_tendency_on_topic")
                if stance:
                    topic_strs.append(f"{t['topic']} ({stance})")
                else:
                    topic_strs.append(t["topic"])
            parts.append(f"Known topics: {', '.join(topic_strs)}")

        return ". ".join(parts) if parts else None

    except Exception:
        return None  # Memory lookup failure is non-blocking
