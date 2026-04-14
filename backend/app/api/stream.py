"""
Raktio API — Stream Router (SSE)

Server-Sent Events endpoint for live simulation updates.
The Simulation Canvas consumes this stream for real-time feed,
network, timeline, geo, and segment data.

Endpoint:
  GET /api/stream/{simulation_id}  — SSE stream of simulation events
"""

from __future__ import annotations

import asyncio
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.auth.guards import AuthUser, require_user
from app.db.supabase_client import get_supabase
from app.runtime.state_reader import get_recent_events, get_run_state

router = APIRouter()


@router.get("/{simulation_id}")
async def stream_simulation(
    simulation_id: uuid.UUID,
    user: AuthUser = Depends(require_user),
    since: int = Query(default=0, ge=0, description="Last seen event row ID"),
):
    """
    SSE stream for a simulation's live events.

    The client connects and receives events as they occur.
    Events are normalized SimulationEvent objects.

    Query params:
      - since: row ID to start from (for reconnection)

    Returns: text/event-stream
    """
    # Verify user has access to this simulation's workspace
    sb = get_supabase()
    sim_result = (
        sb.table("simulations")
        .select("workspace_id, status")
        .eq("simulation_id", str(simulation_id))
        .limit(1)
        .execute()
    )

    if not sim_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    sim = sim_result.data[0]
    workspace_id = sim["workspace_id"]

    # Check membership
    membership = (
        sb.table("workspace_memberships")
        .select("role")
        .eq("workspace_id", workspace_id)
        .eq("user_id", str(user.user_id))
        .eq("status", "active")
        .limit(1)
        .execute()
    )
    if not membership.data:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a workspace member")

    async def event_generator():
        """Yield SSE events from the simulation runtime."""
        last_row_id = since

        # Send initial run state
        run_state = get_run_state(simulation_id)
        yield _sse_event("run_state", run_state or {"status": "unknown"})

        # Poll for new events
        while True:
            events = get_recent_events(simulation_id, since_row_id=last_row_id, limit=50)

            if events:
                for event in events:
                    yield _sse_event("simulation_event", event)
                    # Update last_row_id from event_id
                    try:
                        row_id = int(event.get("event_id", "0").split("_")[-1])
                        if row_id > last_row_id:
                            last_row_id = row_id
                    except (ValueError, IndexError):
                        pass

            # Check if simulation is still active
            current = (
                sb.table("simulations")
                .select("status")
                .eq("simulation_id", str(simulation_id))
                .limit(1)
                .execute()
            )
            current_status = current.data[0]["status"] if current.data else "unknown"

            if current_status in ("completed", "failed", "canceled"):
                yield _sse_event("simulation_ended", {"status": current_status})
                break

            # Send heartbeat
            yield _sse_event("heartbeat", {"status": current_status})

            # Wait before next poll (2 seconds)
            await asyncio.sleep(2)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _sse_event(event_type: str, data: dict) -> str:
    """Format a dict as an SSE event string."""
    return f"event: {event_type}\ndata: {json.dumps(data, default=str)}\n\n"
