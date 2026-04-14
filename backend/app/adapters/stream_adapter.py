"""
Raktio Adapter — Stream Adapter

STATUS: DEFERRED — Not active in the current architecture.

Current streaming model (as of Step 7.5D):
  The SSE endpoint (api/stream.py) polls the OASIS SQLite trace table
  every 2 seconds via state_reader → event_bridge.read_events_from_trace().
  This works correctly for real-time event delivery during live runs.

Why polling is used instead of this adapter:
  OASIS writes to SQLite natively during env.step(). Polling the SQLite
  is the simplest correct approach that requires zero modification to the
  OASIS engine. The adapter pattern (in-memory pub/sub with concurrent
  listener queues) would require the OASIS worker to dual-write events
  to both SQLite and an in-memory bus, adding complexity for no functional
  gain at current scale.

When this adapter should be activated:
  - When concurrent SSE listeners per simulation exceed ~50
  - When polling latency (2s) becomes unacceptable for UX
  - When the OASIS worker is refactored to publish events via a message bus
  At that point, wire stream_manager.publish() into the worker step loop
  and replace the polling in api/stream.py with stream_manager.subscribe().

The code below is preserved as the intended future architecture.
It is NOT imported or referenced by any active code path.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any, AsyncIterator


@dataclass
class StreamChannel:
    """A channel for a single simulation's event stream."""
    simulation_id: str
    listeners: list[asyncio.Queue] = field(default_factory=list)

    def add_listener(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self.listeners.append(queue)
        return queue

    def remove_listener(self, queue: asyncio.Queue) -> None:
        if queue in self.listeners:
            self.listeners.remove(queue)

    async def broadcast(self, event_type: str, data: dict[str, Any]) -> None:
        message = {"event": event_type, "data": data}
        dead = []
        for queue in self.listeners:
            try:
                queue.put_nowait(message)
            except asyncio.QueueFull:
                dead.append(queue)
        for q in dead:
            self.remove_listener(q)


class StreamManager:
    """Manages stream channels for all active simulations."""

    def __init__(self):
        self._channels: dict[str, StreamChannel] = {}

    def get_channel(self, simulation_id: str) -> StreamChannel:
        if simulation_id not in self._channels:
            self._channels[simulation_id] = StreamChannel(simulation_id=simulation_id)
        return self._channels[simulation_id]

    def remove_channel(self, simulation_id: str) -> None:
        self._channels.pop(simulation_id, None)

    async def publish(self, simulation_id: str, event_type: str, data: dict[str, Any]) -> None:
        channel = self.get_channel(simulation_id)
        await channel.broadcast(event_type, data)

    async def subscribe(self, simulation_id: str) -> AsyncIterator[dict[str, Any]]:
        channel = self.get_channel(simulation_id)
        queue = channel.add_listener()
        try:
            while True:
                message = await queue.get()
                yield message
        finally:
            channel.remove_listener(queue)


# NOT instantiated — this module is inactive.
# Uncomment when wiring the push-based streaming model:
# stream_manager = StreamManager()
