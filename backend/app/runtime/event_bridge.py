"""
Raktio Runtime — Event Bridge

Normalizes raw OASIS runtime output (SQLite tables, trace logs) into
product-facing event schemas that the Simulation Canvas can consume.

Event families (from BACKEND_ARCHITECTURE.md):
  - post_created, comment_created, repost_created, quote_created
  - follow_changed, mute_changed
  - belief_shift_detected, patient_zero_candidate
  - geography_spike, platform_spike, alert_created

This module reads from the per-run SQLite database and transforms
raw OASIS actions into structured SimulationEvent objects.

Currently implemented as interface + stub. Full implementation depends
on active OASIS runtime integration (Step 5C worker).
"""

from __future__ import annotations

import sqlite3
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Optional


@dataclass
class SimulationEvent:
    """Normalized product-facing event from OASIS runtime."""
    event_id: str
    event_type: str           # post_created, comment_created, follow_changed, etc.
    simulated_time: str       # e.g. "2h30m"
    agent_username: str
    agent_id: Optional[str] = None
    related_agent_username: Optional[str] = None
    platform: str = "x"
    content: Optional[str] = None
    sentiment: Optional[str] = None  # positive, neutral, negative
    metadata: dict[str, Any] = field(default_factory=dict)
    recorded_at: Optional[datetime] = None


def read_events_from_sqlite(
    sqlite_path: str,
    since_row_id: int = 0,
    limit: int = 100,
) -> list[SimulationEvent]:
    """
    Read and normalize events from a run's SQLite database.

    Args:
        sqlite_path: Absolute path to the run's SQLite DB
        since_row_id: Only return events after this row ID (for incremental reads)
        limit: Max events to return

    Returns:
        List of normalized SimulationEvent objects.
    """
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return []

    events: list[SimulationEvent] = []

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Read posts
        cursor.execute(
            "SELECT rowid, * FROM post WHERE rowid > ? ORDER BY rowid LIMIT ?",
            (since_row_id, limit),
        )
        for row in cursor.fetchall():
            events.append(SimulationEvent(
                event_id=f"post_{row['rowid']}",
                event_type="post_created",
                simulated_time="",
                agent_username=str(row.get("user_id", "")),
                content=row.get("content", ""),
                metadata={"post_id": row.get("post_id")},
            ))

        # Read follows
        cursor.execute(
            "SELECT rowid, * FROM follow WHERE rowid > ? ORDER BY rowid LIMIT ?",
            (since_row_id, limit),
        )
        for row in cursor.fetchall():
            events.append(SimulationEvent(
                event_id=f"follow_{row['rowid']}",
                event_type="follow_changed",
                simulated_time="",
                agent_username=str(row.get("follower_id", "")),
                related_agent_username=str(row.get("followee_id", "")),
            ))

        conn.close()

    except sqlite3.OperationalError:
        # DB might not have these tables yet
        pass

    return events


def get_event_counts(sqlite_path: str) -> dict[str, int]:
    """Get counts of each event type from a run's SQLite DB."""
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return {}

    counts = {}
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        for table in ("post", "comment", "like", "dislike", "follow", "mute"):
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                counts[table] = cursor.fetchone()[0]
            except sqlite3.OperationalError:
                counts[table] = 0

        conn.close()
    except sqlite3.OperationalError:
        pass

    return counts
