"""
Raktio Runtime — State Reader

Reads the current state of a running simulation for display in
the Simulation Canvas. Combines product DB state with runtime
SQLite data.

Used by:
  - GET /api/simulations/{id} (enriched with runtime state)
  - SSE stream endpoint (live updates)
  - Canvas modes (feed, network, timeline, geo, segments)
"""

from __future__ import annotations

import uuid
from typing import Any, Optional

from app.db.supabase_client import get_supabase
from app.runtime.event_bridge import get_event_counts, read_events_from_sqlite


def get_run_state(simulation_id: uuid.UUID) -> Optional[dict[str, Any]]:
    """
    Get the current runtime state for a simulation's active run.

    Returns:
        Dict with run status, event counts, simulated time, etc.
        None if no active run exists.
    """
    sb = get_supabase()

    # Find the latest run for this simulation
    result = (
        sb.table("simulation_runs")
        .select("*")
        .eq("simulation_id", str(simulation_id))
        .order("started_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        return None

    run = result.data[0]
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

    # If we have a SQLite path, read event counts
    sqlite_path = run.get("sqlite_path")
    if sqlite_path:
        run_state["event_counts"] = get_event_counts(sqlite_path)

    return run_state


def get_recent_events(
    simulation_id: uuid.UUID,
    since_row_id: int = 0,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """
    Get recent events from a simulation's active run.
    Used for live feed updates in the canvas.
    """
    sb = get_supabase()

    result = (
        sb.table("simulation_runs")
        .select("sqlite_path")
        .eq("simulation_id", str(simulation_id))
        .order("started_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data or not result.data[0].get("sqlite_path"):
        return []

    sqlite_path = result.data[0]["sqlite_path"]
    events = read_events_from_sqlite(sqlite_path, since_row_id, limit)

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
        }
        for e in events
    ]
