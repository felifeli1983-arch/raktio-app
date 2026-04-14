"""
Raktio Runtime — Temporal Activity Model

Daypart-based activity multipliers that control what fraction of agents
are active at each simulated hour. Inspired by real social media usage
patterns (SIMULATION_ENGINE_SPEC.md §2).

Each simulation step represents ~1 simulated hour. The multiplier
determines the probability that each agent acts during that hour.

Daypart definitions (UTC-based, adjustable per timezone):
  - dead    (02:00-05:00): very low activity
  - early   (06:00-07:00): rising activity
  - morning (08:00-11:00): moderate activity
  - midday  (12:00-13:00): lunch dip
  - work    (14:00-17:00): moderate-high activity
  - peak    (18:00-22:00): peak engagement
  - night   (23:00-01:00): declining activity

This module is pure logic — no DB access, no side effects.
"""

from __future__ import annotations

import random
from typing import Any

from app.runtime.constants import (
    ACTIVITY_HIGH_LABEL, ACTIVITY_HIGH_MODIFIER,
    ACTIVITY_LOW_LABEL, ACTIVITY_LOW_MODIFIER,
    FOLLOWER_MACRO_LABEL, FOLLOWER_NANO_LABEL,
    INFLUENCE_HIGH_LABEL, INFLUENCE_HIGH_MODIFIER,
    INFLUENCE_LOW_LABEL, INFLUENCE_LOW_MODIFIER,
)


# ── Daypart definitions ────────────────────────────────────────────────

# Multiplier = fraction of agents active during this hour.
# 1.0 = all agents active, 0.2 = 20% active.
DAYPART_MULTIPLIERS: dict[str, float] = {
    "dead": 0.15,
    "early": 0.35,
    "morning": 0.65,
    "midday": 0.50,
    "work": 0.70,
    "peak": 1.0,
    "night": 0.40,
}

# Hour → daypart mapping (0-23, UTC)
HOUR_TO_DAYPART: dict[int, str] = {
    0: "night",
    1: "night",
    2: "dead",
    3: "dead",
    4: "dead",
    5: "dead",
    6: "early",
    7: "early",
    8: "morning",
    9: "morning",
    10: "morning",
    11: "morning",
    12: "midday",
    13: "midday",
    14: "work",
    15: "work",
    16: "work",
    17: "work",
    18: "peak",
    19: "peak",
    20: "peak",
    21: "peak",
    22: "peak",
    23: "night",
}


def get_daypart(step_num: int, start_hour: int = 8) -> str:
    """
    Get the daypart for a given simulation step.

    Args:
        step_num: The current step number (1-based)
        start_hour: The hour of day the simulation starts (default: 8 AM)

    Returns:
        Daypart name (dead, early, morning, midday, work, peak, night)
    """
    hour = (start_hour + step_num - 1) % 24
    return HOUR_TO_DAYPART.get(hour, "work")


def get_activity_multiplier(step_num: int, start_hour: int = 8) -> float:
    """
    Get the activity multiplier for a given simulation step.

    Returns a float between 0.15 and 1.0.
    """
    daypart = get_daypart(step_num, start_hour)
    return DAYPART_MULTIPLIERS[daypart]


def select_active_agents(
    all_agents: list[Any],
    step_num: int,
    start_hour: int = 8,
    min_active: int = 1,
) -> list[Any]:
    """
    Select which agents are active during this step based on daypart,
    activity level, and influence weight.

    Modifiers applied to base daypart multiplier:
    - Activity level: high=×1.3, medium=×1.0, low=×0.6
    - Influence weight: high_influence=×1.2, low_influence=×0.8
      (extracted from agent description keywords)

    High-influence agents are more likely to be active, creating more
    content and thus achieving higher natural reach through the recsys.
    This is probabilistic, not deterministic.

    Args:
        all_agents: List of (agent_index, agent_object) tuples from AgentGraph
        step_num: Current step number
        start_hour: Starting hour of simulation
        min_active: Minimum agents that must be active (at least 1)

    Returns:
        List of (agent_index, agent_object) tuples that are active this step.
    """
    multiplier = get_activity_multiplier(step_num, start_hour)

    active = []
    for idx, agent in all_agents:
        agent_multiplier = multiplier
        desc = ""
        if hasattr(agent, "user_info") and agent.user_info:
            desc = (agent.user_info.description or "").lower()

        # Activity level modifier
        if ACTIVITY_HIGH_LABEL in desc:
            agent_multiplier *= ACTIVITY_HIGH_MODIFIER
        elif ACTIVITY_LOW_LABEL in desc:
            agent_multiplier *= ACTIVITY_LOW_MODIFIER

        # Influence weight modifier
        if INFLUENCE_HIGH_LABEL in desc or FOLLOWER_MACRO_LABEL in desc:
            agent_multiplier *= INFLUENCE_HIGH_MODIFIER
        elif INFLUENCE_LOW_LABEL in desc or FOLLOWER_NANO_LABEL in desc:
            agent_multiplier *= INFLUENCE_LOW_MODIFIER

        agent_multiplier = min(1.0, agent_multiplier)

        if random.random() < agent_multiplier:
            active.append((idx, agent))

    # Ensure minimum
    if len(active) < min_active and all_agents:
        remaining = [(i, a) for i, a in all_agents if (i, a) not in active]
        random.shuffle(remaining)
        active.extend(remaining[:min_active - len(active)])

    return active


def get_step_metadata(step_num: int, start_hour: int = 8) -> dict[str, Any]:
    """Get temporal metadata for a step (for logging/progress tracking)."""
    hour = (start_hour + step_num - 1) % 24
    daypart = get_daypart(step_num, start_hour)
    multiplier = DAYPART_MULTIPLIERS[daypart]
    return {
        "simulated_hour": hour,
        "daypart": daypart,
        "activity_multiplier": multiplier,
    }
