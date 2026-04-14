"""
Raktio Runtime — Platform Behavior Profiles

Defines behavioral differentiation for each supported platform.
These profiles modify:
  1. Agent descriptions (prompt-level behavioral guidance)
  2. Action weighting (which actions are more/less likely)
  3. Content style guidelines
  4. Temporal patterns (peak hours differ by platform)

OASIS constraint: only DefaultPlatformType.TWITTER and REDDIT exist
at the engine level. Instagram/TikTok/LinkedIn simulations run on
the Twitter OASIS backend but with platform-specific behavioral
modifications applied through agent prompts and action guidance.

This is a product-layer behavioral approximation, not a full
platform engine change. It creates meaningful differentiation in
how agents behave, what content they create, and how they interact.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class PlatformProfile:
    """Behavioral profile for a social platform."""
    platform_id: str                    # x, reddit, instagram, tiktok, linkedin
    display_name: str                   # X, Reddit, Instagram, TikTok, LinkedIn
    oasis_backend: str                  # twitter or reddit (OASIS engine type)

    # Content behavior
    content_style: str                  # How agents should create content
    typical_length: str                 # short / medium / long
    visual_emphasis: bool               # Whether visual framing matters
    hashtag_tendency: str               # none / light / heavy

    # Interaction behavior
    like_tendency: str                  # low / medium / high
    comment_tendency: str               # low / medium / high
    share_tendency: str                 # low / medium / high
    follow_tendency: str                # low / medium / high

    # Tone
    tone_default: str                   # professional / casual / aggressive / measured
    controversy_tolerance: str          # low / medium / high
    formality: str                      # formal / informal / mixed

    # Temporal
    peak_hours_shift: int = 0           # Hours offset from default peak (18-22)

    # Behavioral prompt injection (appended to agent description)
    behavior_prompt: str = ""

    def get_action_guidance(self) -> str:
        """Return platform-specific action guidance for agent descriptions."""
        return self.behavior_prompt


# ── Platform profiles ──────────────────────────────────────────────────

PLATFORM_PROFILES: dict[str, PlatformProfile] = {
    "x": PlatformProfile(
        platform_id="x",
        display_name="X (Twitter)",
        oasis_backend="twitter",
        content_style="Short, punchy, opinion-driven. Threads for longer takes.",
        typical_length="short",
        visual_emphasis=False,
        hashtag_tendency="light",
        like_tendency="high",
        comment_tendency="medium",
        share_tendency="high",
        follow_tendency="medium",
        tone_default="casual",
        controversy_tolerance="high",
        formality="informal",
        behavior_prompt=(
            "You are on X (Twitter). Write short, direct posts. Use sharp opinions. "
            "Quote-tweet and repost freely. Engage in debates. Use 1-3 hashtags max. "
            "Don't be overly formal."
        ),
    ),

    "reddit": PlatformProfile(
        platform_id="reddit",
        display_name="Reddit",
        oasis_backend="reddit",
        content_style="Discussion-heavy, thread-depth matters, community norms important.",
        typical_length="medium",
        visual_emphasis=False,
        hashtag_tendency="none",
        like_tendency="medium",
        comment_tendency="high",
        share_tendency="low",
        follow_tendency="low",
        tone_default="measured",
        controversy_tolerance="medium",
        formality="mixed",
        behavior_prompt=(
            "You are on Reddit. Write thoughtful, discussion-oriented posts. "
            "Elaborate on your points. Reply in-depth to others. Avoid hashtags. "
            "Community tone matters — be substantive, not flashy."
        ),
    ),

    "instagram": PlatformProfile(
        platform_id="instagram",
        display_name="Instagram",
        oasis_backend="twitter",  # OASIS backend limitation
        content_style="Visual-first framing, aesthetic emphasis, lifestyle-oriented.",
        typical_length="short",
        visual_emphasis=True,
        hashtag_tendency="heavy",
        like_tendency="high",
        comment_tendency="low",
        share_tendency="low",
        follow_tendency="high",
        tone_default="casual",
        controversy_tolerance="low",
        formality="informal",
        behavior_prompt=(
            "You are on Instagram. Frame posts as if describing a visual moment or "
            "aesthetic experience. Use emoji and descriptive imagery. Like content "
            "generously. Write short, warm comments. Use 5-10 relevant hashtags. "
            "Avoid confrontation — Instagram culture is aspirational, not combative."
        ),
    ),

    "tiktok": PlatformProfile(
        platform_id="tiktok",
        display_name="TikTok",
        oasis_backend="twitter",  # OASIS backend limitation
        content_style="Rapid, trend-driven, slang-heavy, meme-aware.",
        typical_length="short",
        visual_emphasis=True,
        hashtag_tendency="heavy",
        like_tendency="high",
        comment_tendency="medium",
        share_tendency="high",
        follow_tendency="medium",
        tone_default="casual",
        controversy_tolerance="high",
        formality="informal",
        peak_hours_shift=-2,  # TikTok peaks later (20-00)
        behavior_prompt=(
            "You are on TikTok. React fast. Use trendy language and slang. "
            "Write very short, punchy comments. Share/repost content that's funny "
            "or surprising. Use trending hashtags. Be authentic and informal — "
            "polished corporate language feels fake here."
        ),
    ),

    "linkedin": PlatformProfile(
        platform_id="linkedin",
        display_name="LinkedIn",
        oasis_backend="twitter",  # OASIS backend limitation
        content_style="Professional, thought-leadership, career-oriented.",
        typical_length="long",
        visual_emphasis=False,
        hashtag_tendency="light",
        like_tendency="medium",
        comment_tendency="medium",
        share_tendency="medium",
        follow_tendency="low",
        tone_default="professional",
        controversy_tolerance="low",
        formality="formal",
        peak_hours_shift=-4,  # LinkedIn peaks earlier (8-12, 14-17)
        behavior_prompt=(
            "You are on LinkedIn. Write professionally and thoughtfully. "
            "Share industry insights, career perspectives, and business observations. "
            "Be constructive, not confrontational. Avoid slang and emoji. "
            "Signal expertise and credibility. Engage respectfully with others' posts."
        ),
    ),
}


def get_profile(platform_id: str) -> PlatformProfile:
    """Get the behavioral profile for a platform."""
    return PLATFORM_PROFILES.get(platform_id, PLATFORM_PROFILES["x"])


def get_oasis_backend(platform_id: str) -> str:
    """Get the OASIS platform type for a Raktio platform."""
    profile = get_profile(platform_id)
    return profile.oasis_backend


def get_behavior_prompt(platform_id: str) -> str:
    """Get the behavioral prompt injection for a platform."""
    profile = get_profile(platform_id)
    return profile.behavior_prompt


def get_peak_hours_shift(platform_id: str) -> int:
    """Get the peak hours offset for a platform (for temporal model)."""
    profile = get_profile(platform_id)
    return profile.peak_hours_shift
