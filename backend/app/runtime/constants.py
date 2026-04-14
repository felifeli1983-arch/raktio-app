"""
Raktio Runtime — Shared Constants

Constants shared between temporal.py and config_builder.py to avoid
fragile keyword coupling. If you change a label here, both modules
pick up the change automatically.
"""

# Influence level labels (used in agent descriptions and temporal selection)
INFLUENCE_HIGH_LABEL = "high influence"
INFLUENCE_MODERATE_LABEL = "moderate influence"
INFLUENCE_LOW_LABEL = "low influence"

# Influence weight thresholds
INFLUENCE_HIGH_THRESHOLD = 2.0
INFLUENCE_LOW_THRESHOLD = 0.5

# Activity level labels
ACTIVITY_HIGH_LABEL = "high activity"
ACTIVITY_MEDIUM_LABEL = "medium activity"
ACTIVITY_LOW_LABEL = "low activity"

# Follower band labels (for temporal keyword matching)
FOLLOWER_MACRO_LABEL = "macro"
FOLLOWER_NANO_LABEL = "nano"

# Temporal selection modifiers
INFLUENCE_HIGH_MODIFIER = 1.2
INFLUENCE_LOW_MODIFIER = 0.8
ACTIVITY_HIGH_MODIFIER = 1.3
ACTIVITY_LOW_MODIFIER = 0.6
