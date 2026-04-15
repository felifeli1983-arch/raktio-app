import { api } from './client';

export interface Simulation {
  simulation_id: string;
  workspace_id: string;
  created_by_user_id: string;
  name: string;
  goal_type: string;
  status: 'draft' | 'understanding' | 'planning' | 'audience_preparing' | 'cost_check' | 'bootstrapping' | 'running' | 'paused' | 'completing' | 'reporting' | 'completed' | 'failed' | 'canceled';
  planner_status: 'pending' | 'running' | 'ready' | 'failed';
  brief_text: string | null;
  brief_context_json: Record<string, any> | null;
  agent_count_requested: number;
  agent_count_final: number | null;
  duration_preset: '6h' | '12h' | '24h' | '48h' | '72h';
  platform_scope: string[];
  geography_scope: Record<string, any>;
  recsys_choice: 'random' | 'reddit' | 'personalized' | 'twhin-bert';
  memory_mode: 'persistent' | 'fresh';
  simulation_language: string;
  credit_estimate: number | null;
  credit_final: number | null;
  audience_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SimulationList {
  items: Simulation[];
  total: number;
  page: number;
  page_size: number;
}

export interface SimulationCreate {
  name: string;
  goal_type?: string;
  brief_text?: string;
  agent_count_requested?: number;
  duration_preset?: string;
  platform_scope?: string[];
  geography_scope?: Record<string, any>;
  recsys_choice?: string;
  memory_mode?: 'persistent' | 'fresh';
  simulation_language?: string;
}

export const simulationsApi = {
  list: (page = 1, pageSize = 20) =>
    api.get<SimulationList>('/api/simulations', { page, page_size: pageSize }),

  get: (id: string) =>
    api.get<Simulation>(`/api/simulations/${id}`),

  create: (data: SimulationCreate) =>
    api.post<Simulation>('/api/simulations', data),

  update: (id: string, data: Partial<SimulationCreate>) =>
    api.patch<Simulation>(`/api/simulations/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/simulations/${id}`),

  understand: (id: string) =>
    api.post<Simulation>(`/api/simulations/${id}/understand`),

  plan: (id: string) =>
    api.post<Simulation>(`/api/simulations/${id}/plan`),

  prepareAudience: (id: string) =>
    api.post<Simulation>(`/api/simulations/${id}/prepare-audience`),

  launch: (id: string) =>
    api.post<Simulation>(`/api/simulations/${id}/launch`),

  pause: (id: string) =>
    api.post<Simulation>(`/api/simulations/${id}/pause`),

  resume: (id: string) =>
    api.post<Simulation>(`/api/simulations/${id}/resume`),

  cancel: (id: string) =>
    api.post<Simulation>(`/api/simulations/${id}/cancel`),
};
