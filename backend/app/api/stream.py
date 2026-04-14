"""
Raktio API — Stream Router (SSE)

Server-Sent Events endpoint for live simulation updates.
The Simulation Canvas consumes this stream for real-time feed,
network, timeline, geo, and segment data.

Auth strategy:
  EventSource API does not support custom headers. This endpoint
  accepts the JWT token via query param `?token=...` as a fallback.
  The standard Authorization header is also supported for non-EventSource clients.

Endpoint:
  GET /api/stream/{simulation_id}?token=<jwt>  — SSE stream
"""

from __future__ import annotations

import asyncio
import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.guards import AuthUser, _extract_auth_user
from app.db.supabase_client import get_supabase
from app.runtime.state_reader import get_recent_events, get_run_state

router = APIRouter()

_bearer_scheme = HTTPBearer(auto_error=False)


def _resolve_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials],
) -> AuthUser:
    """
    Resolve AuthUser from either:
    1. Authorization: Bearer <token> header (standard)
    2. ?token=<jwt> query param (EventSource fallback)
    """
    # Try header first
    if credentials:
        return _extract_auth_user(credentials)

    # Fallback: query param
    token = request.query_params.get("token")
    if token:
        from fastapi.security import HTTPAuthorizationCredentials as Creds
        return _extract_auth_user(Creds(scheme="Bearer", credentials=token))

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authorization required. Pass token via header or ?token= query param.",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.get("/{simulation_id}")
async def stream_simulation(
    simulation_id: uuid.UUID,
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    since: int = Query(default=0, ge=0, description="Last seen event row ID"),
):
    """
    SSE stream for a simulation's live events.

    Auth: pass JWT via Authorization header OR ?token= query param.
    The ?token= fallback is required because the browser EventSource API
    does not support custom headers.

    Query params:
      - token: JWT access token (EventSource fallback)
      - since: row ID to start from (for reconnection)
    """
    user = _resolve_user(request, credentials)

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

    workspace_id = sim_result.data[0]["workspace_id"]

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
        last_row_id = since

        run_state = get_run_state(simulation_id)
        yield _sse_event("run_state", run_state or {"status": "unknown"})

        while True:
            events = get_recent_events(simulation_id, since_row_id=last_row_id, limit=50)

            if events:
                for event in events:
                    yield _sse_event("simulation_event", event)
                    try:
                        row_id = int(event.get("event_id", "0").split("_")[-1])
                        if row_id > last_row_id:
                            last_row_id = row_id
                    except (ValueError, IndexError):
                        pass

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

            yield _sse_event("heartbeat", {"status": current_status})
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
