"""
Raktio Billing — Credit Cost Rules

Full credit cost formula per PRICING_AND_CREDITS.md:
  cost = agent_count × duration_multiplier × platform_multiplier × geography_multiplier

Relative weight (from docs):
  - audience_size = strong (base)
  - platform_count = medium-strong
  - duration = medium
  - geography = light-medium
  - add-ons = modular (not yet implemented)
"""

from __future__ import annotations

# ── Duration multipliers ───────────────────────────────────────────────

DURATION_MULTIPLIER: dict[str, float] = {
    "6h": 0.5,
    "12h": 0.75,
    "24h": 1.0,
    "48h": 1.8,
    "72h": 2.5,
}

# ── Platform multipliers ──────────────────────────────────────────────
# Each additional platform adds cost. Base = 1 platform.

def platform_multiplier(platform_count: int) -> float:
    """Medium-strong weight. Each additional platform adds 20%."""
    if platform_count <= 1:
        return 1.0
    return 1.0 + (platform_count - 1) * 0.2


# ── Geography multipliers ─────────────────────────────────────────────
# Multi-country simulations add a light cost premium.

def geography_multiplier(country_count: int) -> float:
    """Light-medium weight. Each additional country adds 5%."""
    if country_count <= 1:
        return 1.0
    return 1.0 + (country_count - 1) * 0.05


# ── Base cost per agent ────────────────────────────────────────────────

BASE_COST_PER_AGENT = 1  # 1 credit per agent at 24h, 1 platform, 1 country


# ── Full credit estimation ─────────────────────────────────────────────

def estimate_credits(
    agent_count: int,
    duration_preset: str,
    platform_scope: list[str] | None = None,
    geography_scope: dict | None = None,
) -> int:
    """
    Calculate credit cost using the full formula.

    Args:
        agent_count: Number of agents
        duration_preset: "6h", "12h", "24h", "48h", "72h"
        platform_scope: List of platform identifiers (e.g. ["x", "instagram"])
        geography_scope: Dict with geography info. If it has "countries" key,
                         count them. Otherwise assume single country.

    Returns:
        Integer credit cost (minimum 1).
    """
    dur_mult = DURATION_MULTIPLIER.get(duration_preset, 1.0)

    plat_count = len(platform_scope) if platform_scope else 1
    plat_mult = platform_multiplier(plat_count)

    # Count countries from geography_scope
    country_count = 1
    if geography_scope:
        if isinstance(geography_scope, dict):
            countries = geography_scope.get("countries", [])
            if isinstance(countries, list):
                country_count = max(1, len(countries))
            elif isinstance(geography_scope.get("primary_countries"), list):
                country_count = max(1, len(geography_scope["primary_countries"]))
    geo_mult = geography_multiplier(country_count)

    cost = agent_count * BASE_COST_PER_AGENT * dur_mult * plat_mult * geo_mult
    return max(1, round(cost))
