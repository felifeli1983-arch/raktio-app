"""
Raktio Adapter — Stream Adapter

Abstraction layer over SSE transport for simulation event streaming.
Manages concurrent listeners and event distribution.

Currently supports SSE only. WebSocket support can be added later
by implementing a WebSocket variant of the same interface.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any, AsyncIterator
from dataclasses import dataclass, field


@dataclass
class StreamChannel:
    """A channel for a single simulation's event stream."""
    simulation_id: str
    listeners: list[asyncio.Queue] = field(default_factory=list)

    def add_listener(self) -> asyncio.Queue:
        """Add a new listener and return its queue."""
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self.listeners.append(queue)
        return queue

    def remove_listener(self, queue: asyncio.Queue) -> None:
        """Remove a listener."""
        if queue in self.listeners:
            self.listeners.remove(queue)

    async def broadcast(self, event_type: str, data: dict[str, Any]) -> None:
        """Broadcast an event to all listeners."""
        message = {"event": event_type, "data": data}
        dead_listeners = []

        for queue in self.listeners:
            try:
                queue.put_nowait(message)
            except asyncio.QueueFull:
                dead_listeners.append(queue)

        for q in dead_listeners:
            self.remove_listener(q)


class StreamManager:
    """Manages stream channels for all active simulations."""

    def __init__(self):
        self._channels: dict[str, StreamChannel] = {}

    def get_channel(self, simulation_id: str) -> StreamChannel:
        """Get or create a channel for a simulation."""
        if simulation_id not in self._channels:
            self._channels[simulation_id] = StreamChannel(simulation_id=simulation_id)
        return self._channels[simulation_id]

    def remove_channel(self, simulation_id: str) -> None:
        """Remove a channel when a simulation ends."""
        self._channels.pop(simulation_id, None)

    async def publish(self, simulation_id: str, event_type: str, data: dict[str, Any]) -> None:
        """Publish an event to a simulation's channel."""
        channel = self.get_channel(simulation_id)
        await channel.broadcast(event_type, data)

    async def subscribe(self, simulation_id: str) -> AsyncIterator[dict[str, Any]]:
        """Subscribe to a simulation's event stream."""
        channel = self.get_channel(simulation_id)
        queue = channel.add_listener()
        try:
            while True:
                message = await queue.get()
                yield message
        finally:
            channel.remove_listener(queue)


# Singleton instance
stream_manager = StreamManager()
