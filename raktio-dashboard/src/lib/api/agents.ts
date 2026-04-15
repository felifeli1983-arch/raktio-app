import { api } from './client';

export interface Agent {
  agent_id: string;
  username: string;
  display_name: string;
  first_name: string;
  last_name: string;
  avatar_seed: string;
  country: string;
  region: string | null;
  city: string | null;
  age: number;
  gender: string;
  profession: string;
  education_level: string;
  income_band: string | null;
  mbti: string;
  interests: string[];
  values: string[];
  base_stance_bias: string;
  activity_level: string;
  influence_weight: number;
  persuadability: number;
  is_global: boolean;
  created_at: string;
}

export interface AgentList {
  items: Agent[];
  total: number;
}

export interface AgentProfile {
  agent: Agent;
  memory_summary: Record<string, any> | null;
  recent_episodes: Record<string, any>[];
  relationships: Record<string, any>[];
  topic_exposures: Record<string, any>[];
}

export const agentsApi = {
  list: (params?: { country?: string; stance?: string; limit?: number; offset?: number }) =>
    api.get<AgentList>('/api/agents', params as Record<string, string | number | undefined>),

  get: (agentId: string) =>
    api.get<AgentProfile>(`/api/agents/${agentId}`),
};
