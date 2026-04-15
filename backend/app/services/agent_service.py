"""
Raktio Service — Agent Generation

Phase 4 of the simulation pipeline (DATAFLOW_AND_RUNTIME.md):
Generates new synthetic agents via Claude Sonnet (PLANNING route)
when the global pool doesn't have sufficient coverage.

Agent identity rules (PROJECT.md §9):
  - globally unique username
  - persistent avatar derived from username (DiceBear notionists)
  - realistic geographic identity
  - psychographic and platform behavior traits

Generation strategy:
  1. Try to satisfy demand from global pool
  2. Generate new agents only when coverage is insufficient
"""

from __future__ import annotations

import json
import uuid
import random
import string
from typing import Any

from app.adapters.llm_adapter import llm_adapter
from app.config import ModelRoute
from app.repositories import agents as agent_repo


# ── Username generation ────────────────────────────────────────────────

def _generate_username(first_name: str, last_name: str) -> str:
    """
    Generate a unique username from first/last name.
    Format: firstname_lastname_XXXX (4 random chars for uniqueness).
    """
    base = f"{first_name.lower()}_{last_name.lower()}"
    # Strip non-alphanumeric except underscores
    base = "".join(c for c in base if c.isalnum() or c == "_")
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
    username = f"{base}_{suffix}"

    # Ensure uniqueness
    existing = agent_repo.find_agent_by_username(username)
    if existing:
        suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
        username = f"{base}_{suffix}"

    return username


# ── LLM-based agent generation ─────────────────────────────────────────

AGENT_GENERATION_SYSTEM = """You are the Agent Generator module of Raktio, a social reaction simulation platform.

Generate realistic synthetic social media user profiles for simulation. Each profile must be unique, diverse, and plausible.

Output valid JSON as an array of agent objects with this structure:
[
  {
    "first_name": "Marco",
    "last_name": "Rossi",
    "display_name": "Marco Rossi",
    "country": "IT",
    "region": "Lombardia",
    "city": "Milano",
    "timezone": "Europe/Rome",
    "languages": ["it", "en"],
    "age": 28,
    "gender": "male",
    "profession": "Marketing Manager",
    "education_level": "university",
    "income_band": "middle",
    "family_status": "single",
    "tech_literacy": "high",
    "mbti": "ENFP",
    "interests": ["food", "sustainability", "fitness", "travel"],
    "values": ["health", "environment", "authenticity"],
    "base_stance_bias": "supportive",
    "activity_level": "high",
    "persuadability": 0.6,
    "controversy_tolerance": 0.4,
    "platforms": [
      {
        "platform": "instagram",
        "posting_frequency": "high",
        "commenting_frequency": "medium",
        "engagement_style": "reactive",
        "tone_profile": "casual",
        "follower_band": "micro"
      }
    ]
  }
]

Rules:
- Country codes: ISO 3166-1 alpha-2
- base_stance_bias: supportive, neutral, opposing, or observer
- activity_level: low, medium, or high
- persuadability: float 0-1
- controversy_tolerance: float 0-1
- platforms: only x, reddit, instagram, tiktok, linkedin
- Names must be culturally appropriate for the country
- Generate diverse, realistic profiles — not all the same archetype
- Always output valid JSON array, nothing else
"""


async def generate_agents(
    count: int,
    country: str,
    stance_distribution: dict[str, float],
    platforms: list[str],
    segment_description: str = "",
    log_context: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """
    Generate new synthetic agents via Claude Sonnet.

    Args:
        count: How many agents to generate (per batch, max ~20 at a time)
        country: ISO country code
        stance_distribution: e.g. {"supportive": 0.35, "neutral": 0.35, "opposing": 0.2, "observer": 0.1}
        platforms: List of platform identifiers the agents should be on
        segment_description: Optional text describing the target segment

    Returns:
        List of inserted agent dicts from DB.
    """
    # Batch to avoid overly long responses
    batch_size = min(count, 15)

    prompt = (
        f"Generate {batch_size} synthetic social media user profiles.\n\n"
        f"Country: {country}\n"
        f"Platforms they should be active on: {', '.join(platforms)}\n"
        f"Stance distribution (approximate): {json.dumps(stance_distribution)}\n"
    )
    if segment_description:
        prompt += f"Segment context: {segment_description}\n"

    _ctx = dict(log_context or {})
    _ctx.setdefault("service_module", "agent_service")
    _ctx.setdefault("call_purpose", f"agent_generation:{country}")

    response = await llm_adapter.complete(
        route=ModelRoute.PLANNING,
        messages=[{"role": "user", "content": prompt}],
        system=AGENT_GENERATION_SYSTEM,
        max_tokens=8192,
        temperature=0.8,
        log_context=_ctx,
    )

    # Parse response
    try:
        profiles = json.loads(response.content)
    except json.JSONDecodeError:
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        profiles = json.loads(content)

    if not isinstance(profiles, list):
        profiles = [profiles]

    # Validate and sanitize LLM output
    valid_profiles = []
    for profile in profiles:
        # Required fields check
        fn = profile.get("first_name", "").strip()
        ln = profile.get("last_name", "").strip()
        if not fn or not ln:
            continue  # Skip profiles without names

        # Force country to match requested country (LLM may hallucinate)
        profile["country"] = country

        # Clamp stance to valid values
        if profile.get("base_stance_bias") not in ("supportive", "neutral", "opposing", "observer"):
            profile["base_stance_bias"] = "neutral"

        # Clamp activity_level
        if profile.get("activity_level") not in ("low", "medium", "high"):
            profile["activity_level"] = "medium"

        valid_profiles.append(profile)

    profiles = valid_profiles

    # Convert LLM output to DB rows
    agent_rows = []
    platform_rows = []

    for profile in profiles:
        username = _generate_username(
            profile.get("first_name", "agent"),
            profile.get("last_name", "user"),
        )

        agent_row = {
            "username": username,
            "display_name": profile.get("display_name", f"{profile.get('first_name', '')} {profile.get('last_name', '')}"),
            "first_name": profile.get("first_name", "Agent"),
            "last_name": profile.get("last_name", "User"),
            "country": profile.get("country", country),
            "region": profile.get("region", ""),
            "city": profile.get("city", ""),
            "timezone": profile.get("timezone", "UTC"),
            "languages": profile.get("languages", ["en"]),
            "age": profile.get("age"),
            "gender": profile.get("gender"),
            "profession": profile.get("profession"),
            "education_level": profile.get("education_level"),
            "income_band": profile.get("income_band"),
            "family_status": profile.get("family_status"),
            "tech_literacy": profile.get("tech_literacy"),
            "mbti": profile.get("mbti"),
            "interests": profile.get("interests", []),
            "values": profile.get("values", []),
            "base_stance_bias": profile.get("base_stance_bias", "neutral"),
            "activity_level": profile.get("activity_level", "medium"),
            "persuadability": max(0, min(1, profile.get("persuadability", 0.5))),
            "controversy_tolerance": max(0, min(1, profile.get("controversy_tolerance", 0.5))),
            "risk_tolerance": max(0, min(1, profile.get("risk_tolerance", 0.5))),
            "population_tier": "global",
            "is_global": True,
            "is_private": False,
            "origin_type": "generated",
        }
        agent_rows.append(agent_row)

    # Flag ~5% as influencer archetypes
    influencer_count = max(1, len(agent_rows) // 20)
    influencer_indices = random.sample(range(len(agent_rows)), min(influencer_count, len(agent_rows)))
    for idx in influencer_indices:
        agent_rows[idx]["influence_weight"] = round(random.uniform(3.0, 5.0), 1)
        agent_rows[idx]["activity_level"] = "high"
        interests = agent_rows[idx].get("interests", [])
        if not isinstance(interests, list):
            interests = []
        interests.append("influencer")
        agent_rows[idx]["interests"] = interests

    # Batch insert agents
    inserted_agents = agent_repo.insert_agents_batch(agent_rows)

    # Now insert platform presence for each agent
    for i, agent in enumerate(inserted_agents):
        agent_platforms = profiles[i].get("platforms", []) if i < len(profiles) else []
        for plat in agent_platforms:
            if isinstance(plat, dict):
                platform_rows.append({
                    "agent_id": agent["agent_id"],
                    "platform": plat.get("platform", "x"),
                    "posting_frequency": plat.get("posting_frequency"),
                    "commenting_frequency": plat.get("commenting_frequency"),
                    "engagement_style": plat.get("engagement_style"),
                    "tone_profile": plat.get("tone_profile"),
                    "follower_band": plat.get("follower_band"),
                })
            elif isinstance(plat, str):
                platform_rows.append({
                    "agent_id": agent["agent_id"],
                    "platform": plat,
                })

    if platform_rows:
        agent_repo.insert_platform_presence_batch(platform_rows)

    return inserted_agents
