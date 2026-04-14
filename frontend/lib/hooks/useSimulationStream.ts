/**
 * useSimulationStream — SSE hook for live canvas events
 *
 * Connects to GET /api/stream/{simulationId} and yields normalized
 * simulation events for the Simulation Canvas.
 *
 * Handles reconnection, heartbeat detection, and cleanup.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SimulationEvent {
  event_id: string;
  event_type: string;
  simulated_time: string;
  agent_username: string;
  related_agent_username?: string;
  platform: string;
  content?: string;
  sentiment?: string;
  metadata?: Record<string, unknown>;
}

export type StreamStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "ended"
  | "error";

interface RunState {
  run_id?: string;
  status: string;
  event_counts?: Record<string, number>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useSimulationStream(simulationId: string | null) {
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [runState, setRunState] = useState<RunState | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastRowIdRef = useRef(0);

  const connect = useCallback(async () => {
    if (!simulationId) return;

    setStatus("connecting");

    // Get auth token from Supabase session
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setStatus("error");
      return;
    }

    // EventSource doesn't support custom headers natively.
    // We pass the token as a query param (backend should support this).
    // For production, consider using fetch-based SSE or a proxy.
    const url = `${API_URL}/api/stream/${simulationId}?since=${lastRowIdRef.current}&token=${session.access_token}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("run_state", (e) => {
      try {
        const data = JSON.parse(e.data);
        setRunState(data);
        setStatus("connected");
      } catch {
        /* ignore parse errors */
      }
    });

    es.addEventListener("simulation_event", (e) => {
      try {
        const event: SimulationEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev.slice(-500), event]); // Keep last 500

        // Update last row ID for reconnection
        const parts = event.event_id.split("_");
        const rowId = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(rowId) && rowId > lastRowIdRef.current) {
          lastRowIdRef.current = rowId;
        }
      } catch {
        /* ignore */
      }
    });

    es.addEventListener("heartbeat", (e) => {
      try {
        const data = JSON.parse(e.data);
        setRunState((prev) =>
          prev ? { ...prev, status: data.status } : { status: data.status }
        );
      } catch {
        /* ignore */
      }
    });

    es.addEventListener("simulation_ended", (e) => {
      try {
        const data = JSON.parse(e.data);
        setRunState((prev) =>
          prev ? { ...prev, status: data.status } : { status: data.status }
        );
        setStatus("ended");
      } catch {
        /* ignore */
      }
      es.close();
    });

    es.onerror = () => {
      es.close();
      setStatus("reconnecting");
      // Reconnect after 3 seconds
      setTimeout(() => {
        connect();
      }, 3000);
    };
  }, [simulationId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (simulationId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [simulationId, connect, disconnect]);

  return {
    events,
    status,
    runState,
    connect,
    disconnect,
    clearEvents: () => setEvents([]),
  };
}
