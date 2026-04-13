/** Raktio — Agent types */

export type Platform = "x" | "reddit" | "instagram" | "tiktok" | "linkedin";

export interface Agent {
  agent_id: string;
  username: string;
  display_name: string;
  first_name: string;
  last_name: string;

  /** DiceBear notionists avatar — generated from username seed, never stored */
  avatar_url: string; // https://api.dicebear.com/9.x/notionists/svg?seed=<username>

  country: string;
  region: string;
  province_or_state: string | null;
  city: string;
  timezone: string;
  languages: string[];

  age: number;
  gender: string;
  profession: string;
  education_level: string;
  income_band: string;
  family_status: string;
  tech_literacy: string;

  mbti: string | null;
  big_five: Record<string, number> | null;
  interests: string[];
  values: string[];
  base_stance_bias: string;
  activity_level: string;
  influence_weight: number;
  persuadability: number;

  platform_presence: AgentPlatformPresence[];
  memory_summary: string | null;
  simulation_count: number;
  created_at: string;
}

export interface AgentPlatformPresence {
  platform: Platform;
  is_active: boolean;
  posting_frequency: string;
  engagement_style: string;
  tone_profile: string;
  follower_band: string;
}

export interface AgentEpisode {
  episode_id: string;
  agent_id: string;
  simulation_id: string;
  episode_type: string;
  episode_text: string;
  topic_tags: string[];
  event_time_simulated: string;
  importance_score: number;
}

/** Utility: build DiceBear avatar URL from username */
export function agentAvatarUrl(username: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(username)}`;
}
