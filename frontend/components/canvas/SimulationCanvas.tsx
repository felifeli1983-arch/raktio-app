"use client";

/**
 * Raktio — Simulation Canvas
 *
 * The central operational intelligence surface of the product.
 * Combines: Header · Left Rail · Main Canvas · Right Rail
 *
 * Canvas modes (same run, different lenses):
 *   Feed      → social post stream with augmented metadata
 *   Network   → sigma.js force graph — influence, factions, cascades
 *   Timeline  → activity/sentiment over simulated time
 *   Geo       → maplibre-gl — geographic reaction distribution
 *   Segments  → audience segment comparison
 *   Compare   → side-by-side simulation delta view
 */

import type { CanvasMode } from "@/lib/types/simulation";

interface SimulationCanvasProps {
  simulationId: string;
}

export function SimulationCanvas({ simulationId }: SimulationCanvasProps) {
  // TODO: subscribe to useSimulationStream(simulationId)
  // TODO: render CanvasHeader, LeftRail, mode-based main area, RightRail

  return (
    <div className="flex flex-col h-full">
      {/* CanvasHeader */}
      <div className="border-b px-4 py-2 flex items-center gap-4">
        {/* TODO: sim name, status chip, simulated time, agent count, mode switcher, action buttons */}
        <span className="text-sm text-muted-foreground">Canvas — {simulationId}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left rail — filters */}
        <div className="w-56 border-r p-3 shrink-0">
          {/* TODO: platform, geo, segment, stance, sentiment, event-type filters */}
        </div>

        {/* Main canvas area */}
        <div className="flex-1 overflow-hidden">
          {/* TODO: render active CanvasMode component */}
        </div>

        {/* Right rail — live metrics */}
        <div className="w-64 border-l p-3 shrink-0">
          {/* TODO: sentiment, polarization, top amplifiers, alerts, trending topics */}
        </div>
      </div>
    </div>
  );
}
