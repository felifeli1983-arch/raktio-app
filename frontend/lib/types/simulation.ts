/** Raktio — Simulation types */

export type SimulationStatus =
  | "draft"
  | "understanding"
  | "planning"
  | "audience_preparing"
  | "cost_check"
  | "bootstrapping"
  | "running"
  | "paused"
  | "completing"
  | "reporting"
  | "completed"
  | "failed"
  | "canceled";

export type Platform = "x" | "reddit" | "instagram" | "tiktok" | "linkedin";

export type CanvasMode = "feed" | "network" | "timeline" | "geo" | "segments" | "compare";

export type RecsysChoice = "random" | "reddit" | "personalized" | "twhin-bert";

export type DurationPreset = "6h" | "12h" | "24h" | "48h" | "72h";

export interface Simulation {
  id: string;
  workspace_id: string;
  name: string;
  goal_type: string;
  status: SimulationStatus;
  agent_count: number;
  duration_preset: DurationPreset;
  platforms: Platform[];
  geography_scope: GeographyScope;
  recsys: RecsysChoice;
  credit_estimate: number;
  credit_final: number | null;
  parent_simulation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeographyScope {
  countries: string[];
  regions?: Record<string, string[]>;
}

export interface SimulationRun {
  run_id: string;
  simulation_id: string;
  status: SimulationStatus;
  started_at: string | null;
  completed_at: string | null;
  simulated_time_completed: string | null;
}

/** Live event emitted from OASIS runtime — normalized product schema */
export interface SimulationEvent {
  id: string;
  simulation_id: string;
  run_id: string;
  event_type: string;
  event_time_simulated: string;
  agent_id: string;
  related_agent_id: string | null;
  platform: Platform | null;
  geography_key: string | null;
  payload: Record<string, unknown>;
  importance_score: number;
}
