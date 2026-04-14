-- ============================================================
-- Raktio — Migration 008: Memory System
-- ============================================================
-- Domain 4 from DATA_MODEL_AND_STORAGE.md:
--   1. agent_memory_summaries  — rolling persistent summary per agent
--   2. agent_episodic_memory   — structured semantic episodes from runs
--   3. agent_relationship_memory — persistent cross-run relationships
--   4. agent_topic_exposure    — topic/narrative exposure tracking
--   5. memory_update_jobs      — post-run memory transformation tracking
--
-- These tables transform agents from "persistent identity" to
-- "persistent experience" — the biggest realism upgrade so far.
-- ============================================================


-- ── 1. agent_memory_summaries ─────────────────────────────────────────
-- Rolling summary of what an agent "remembers" across all simulations.
-- Updated after each run by the memory transformation service.

CREATE TABLE public.agent_memory_summaries (
  agent_memory_summary_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                 UUID        NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  summary_text             TEXT,                  -- human-readable rolling summary
  topic_summary            JSONB       NOT NULL DEFAULT '{}',   -- {topic: stance/exposure}
  relationship_summary     JSONB       NOT NULL DEFAULT '{}',   -- {agent_username: relationship_type}
  platform_summary         JSONB       NOT NULL DEFAULT '{}',   -- {platform: behavior_notes}
  recent_stance_summary    JSONB       NOT NULL DEFAULT '{}',   -- recent stance evolution
  simulation_count         INTEGER     NOT NULL DEFAULT 0,
  last_updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  memory_revision          INTEGER     NOT NULL DEFAULT 1,
  UNIQUE (agent_id)
);

CREATE INDEX idx_memory_summaries_agent ON public.agent_memory_summaries(agent_id);


-- ── 2. agent_episodic_memory ──────────────────────────────────────────
-- Structured semantic episodes derived from simulation trace events.
-- Each episode is a human-readable memory unit, not a raw log entry.

CREATE TABLE public.agent_episodic_memory (
  agent_episode_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                 UUID        NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  simulation_id            UUID        NOT NULL REFERENCES public.simulations(simulation_id) ON DELETE CASCADE,
  run_id                   UUID        REFERENCES public.simulation_runs(run_id) ON DELETE SET NULL,
  episode_type             TEXT        NOT NULL
                                       CHECK (episode_type IN (
                                         'created_post', 'created_comment', 'liked_content',
                                         'disliked_content', 'followed_agent', 'unfollowed_agent',
                                         'muted_agent', 'changed_belief', 'amplified_topic',
                                         'reacted_negatively', 'was_interviewed',
                                         'became_amplifier', 'became_bridge', 'other'
                                       )),
  episode_text             TEXT        NOT NULL,   -- human-readable description
  topic_tags               JSONB       NOT NULL DEFAULT '[]',
  geography_tags           JSONB       NOT NULL DEFAULT '[]',
  platform_tags            JSONB       NOT NULL DEFAULT '[]',
  confidence_score         FLOAT       DEFAULT 0.5 CHECK (confidence_score BETWEEN 0 AND 1),
  importance_score         FLOAT       DEFAULT 0.5 CHECK (importance_score BETWEEN 0 AND 1),
  event_time_simulated     TEXT,        -- e.g. "3h" — when in the simulation
  linked_trace_ids         JSONB       DEFAULT '[]',  -- rowids from trace table
  recorded_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_episodic_agent      ON public.agent_episodic_memory(agent_id);
CREATE INDEX idx_episodic_simulation ON public.agent_episodic_memory(simulation_id);
CREATE INDEX idx_episodic_type       ON public.agent_episodic_memory(episode_type);


-- ── 3. agent_relationship_memory ──────────────────────────────────────
-- Persistent relationship-level memory across runs.
-- Tracks how agents relate to each other over time.

CREATE TABLE public.agent_relationship_memory (
  agent_relationship_memory_id  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                      UUID    NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  other_agent_id                UUID    NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  relationship_type             TEXT    NOT NULL DEFAULT 'interacted'
                                        CHECK (relationship_type IN (
                                          'follows', 'followed_by', 'recurring_interactor',
                                          'conflict_pair', 'bridge_connection',
                                          'group_affiliated', 'high_influence_target',
                                          'interacted', 'muted'
                                        )),
  relationship_strength         FLOAT   NOT NULL DEFAULT 0.5 CHECK (relationship_strength BETWEEN 0 AND 1),
  last_interaction_at           TIMESTAMPTZ,
  interaction_summary           TEXT,
  follow_history_flag           BOOLEAN NOT NULL DEFAULT FALSE,
  conflict_history_flag         BOOLEAN NOT NULL DEFAULT FALSE,
  bridge_relationship_flag      BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, other_agent_id)
);

CREATE INDEX idx_relationship_agent       ON public.agent_relationship_memory(agent_id);
CREATE INDEX idx_relationship_other       ON public.agent_relationship_memory(other_agent_id);
CREATE INDEX idx_relationship_type        ON public.agent_relationship_memory(relationship_type);


-- ── 4. agent_topic_exposure ───────────────────────────────────────────
-- Tracks what topics/narratives an agent has encountered across runs.
-- Crucial for coherent future reactions and topic-aware interviews.

CREATE TABLE public.agent_topic_exposure (
  agent_topic_exposure_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                 UUID        NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  topic                    TEXT        NOT NULL,
  exposure_count           INTEGER     NOT NULL DEFAULT 1,
  positive_exposure_count  INTEGER     NOT NULL DEFAULT 0,
  negative_exposure_count  INTEGER     NOT NULL DEFAULT 0,
  last_exposed_at          TIMESTAMPTZ,
  exposure_summary         TEXT,
  stance_tendency_on_topic TEXT        CHECK (stance_tendency_on_topic IN (
                                        'supportive', 'neutral', 'opposing', 'mixed', NULL
                                      )),
  UNIQUE (agent_id, topic)
);

CREATE INDEX idx_topic_exposure_agent ON public.agent_topic_exposure(agent_id);
CREATE INDEX idx_topic_exposure_topic ON public.agent_topic_exposure(topic);


-- ── 5. memory_update_jobs ─────────────────────────────────────────────
-- Tracks post-run memory transformation operations.
-- One job per simulation run → updates all participating agents' memory.

CREATE TABLE public.memory_update_jobs (
  memory_update_job_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id            UUID        NOT NULL REFERENCES public.simulations(simulation_id) ON DELETE CASCADE,
  run_id                   UUID        REFERENCES public.simulation_runs(run_id) ON DELETE SET NULL,
  status                   TEXT        NOT NULL DEFAULT 'pending'
                                       CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at               TIMESTAMPTZ,
  completed_at             TIMESTAMPTZ,
  updated_agent_count      INTEGER     DEFAULT 0,
  episodes_created         INTEGER     DEFAULT 0,
  relationships_updated    INTEGER     DEFAULT 0,
  topics_updated           INTEGER     DEFAULT 0,
  error_message            TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memory_jobs_simulation ON public.memory_update_jobs(simulation_id);
CREATE INDEX idx_memory_jobs_status     ON public.memory_update_jobs(status);


-- ── RLS ───────────────────────────────────────────────────────────────

ALTER TABLE public.agent_memory_summaries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_episodic_memory      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_relationship_memory  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_topic_exposure       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_update_jobs         ENABLE ROW LEVEL SECURITY;

-- Memory summaries: visible to authenticated users for global agents
CREATE POLICY "memory_summaries_select"
  ON public.agent_memory_summaries FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.agents a
      WHERE a.agent_id = agent_memory_summaries.agent_id
        AND (a.is_global = TRUE OR public.is_workspace_member(a.origin_workspace_id))
    )
  );

-- Episodic memory: visible to simulation workspace members
CREATE POLICY "episodic_memory_select"
  ON public.agent_episodic_memory FOR SELECT
  USING (
    public.is_workspace_member(
      (SELECT workspace_id FROM public.simulations s
       WHERE s.simulation_id = agent_episodic_memory.simulation_id)
    )
  );

-- Relationship memory: visible to authenticated users
CREATE POLICY "relationship_memory_select"
  ON public.agent_relationship_memory FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Topic exposure: visible to authenticated users
CREATE POLICY "topic_exposure_select"
  ON public.agent_topic_exposure FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Memory update jobs: visible to simulation workspace members
CREATE POLICY "memory_jobs_select"
  ON public.memory_update_jobs FOR SELECT
  USING (
    public.is_workspace_member(
      (SELECT workspace_id FROM public.simulations s
       WHERE s.simulation_id = memory_update_jobs.simulation_id)
    )
  );


-- End of migration 008
