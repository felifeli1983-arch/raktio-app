"""
Raktio Runtime — State Reader

Reads the current state of a running or completed simulation for
display in the Simulation Canvas and SSE stream.

Combines product DB state (Supabase) with runtime SQLite data (OASIS).
"""

from __future__ import annotations

import uuid
from typing import Any, Optional

from app.repositories import simulations as sim_repo
from app.runtime.event_bridge import (
    get_event_counts,
    get_trace_action_summary,
    read_events_from_trace,
)


def get_run_state(simulation_id: uuid.UUID) -> Optional[dict[str, Any]]:
    """
    Get the current runtime state for a simulation's latest run.

    Returns dict with run status, event counts, action summary, etc.
    """
    run = sim_repo.get_latest_run(simulation_id)
    if not run:
        return None

    run_state: dict[str, Any] = {
        "run_id": run["run_id"],
        "status": run["status"],
        "started_at": run.get("started_at"),
        "completed_at": run.get("completed_at"),
        "failed_at": run.get("failed_at"),
        "failure_reason": run.get("failure_reason"),
        "simulated_time_completed": run.get("simulated_time_completed"),
        "runtime_metadata": run.get("runtime_metadata_json", {}),
    }

    # Read real event counts from SQLite if path exists
    sqlite_path = run.get("sqlite_path")
    if sqlite_path:
        run_state["event_counts"] = get_event_counts(sqlite_path)
        run_state["action_summary"] = get_trace_action_summary(sqlite_path)

    return run_state


def get_recent_events(
    simulation_id: uuid.UUID,
    since_row_id: int = 0,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """
    Get recent events from a simulation's active run via trace table.
    Used for live feed updates in the canvas and SSE stream.
    """
    run = sim_repo.get_latest_run(simulation_id)
    if not run or not run.get("sqlite_path"):
        return []

    events = read_events_from_trace(
        run["sqlite_path"],
        since_rowid=since_row_id,
        limit=limit,
    )

    return [
        {
            "event_id": e.event_id,
            "event_type": e.event_type,
            "simulated_time": e.simulated_time,
            "agent_username": e.agent_username,
            "related_agent_username": e.related_agent_username,
            "platform": e.platform,
            "content": e.content,
            "sentiment": e.sentiment,
            "metadata": e.metadata,
            "recorded_at": e.recorded_at,
        }
        for e in events
    ]
