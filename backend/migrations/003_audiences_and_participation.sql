-- ============================================================
-- Raktio — Migration 003: Audiences + Simulation Participations
-- ============================================================
-- Tables from DATA_MODEL_AND_STORAGE.md Domain 3:
--   • audiences (saved audience entities)
--   • audience_memberships (maps agents to audiences)
--   • simulation_participations (per-run agent participation state)
-- ============================================================


-- ── 1. audiences ──────────────────────────────────────────────────────

CREATE TABLE public.audiences (
  audience_id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID        NOT NULL REFERENCES public.workspaces(workspace_id) ON DELETE CASCADE,
  created_by_user_id UUID       NOT NULL REFERENCES public.users(user_id),
  name              TEXT        NOT NULL,
  description       TEXT,
  audience_type     TEXT        NOT NULL DEFAULT 'generated'
                                CHECK (audience_type IN ('generated', 'filter_based', 'source_derived', 'cloned', 'private')),
  is_private        BOOLEAN     NOT NULL DEFAULT FALSE,
  agent_count       INTEGER     NOT NULL DEFAULT 0,
  geography_summary JSONB       NOT NULL DEFAULT '{}',
  platform_summary  JSONB       NOT NULL DEFAULT '{}',
  stance_summary    JSONB       NOT NULL DEFAULT '{}',
  demographics_summary JSONB    NOT NULL DEFAULT '{}',
  generation_config JSONB,       -- the planner config used to generate this audience
  status            TEXT        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'archived', 'deleted')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audiences_workspace ON public.audiences(workspace_id);
CREATE INDEX idx_audiences_type      ON public.audiences(audience_type);

CREATE TRIGGER trg_audiences_updated_at
  BEFORE UPDATE ON public.audiences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── 2. audience_memberships ───────────────────────────────────────────

CREATE TABLE public.audience_memberships (
  audience_membership_id UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_id            UUID    NOT NULL REFERENCES public.audiences(audience_id) ON DELETE CASCADE,
  agent_id               UUID    NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  added_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (audience_id, agent_id)
);

CREATE INDEX idx_audience_memberships_audience ON public.audience_memberships(audience_id);
CREATE INDEX idx_audience_memberships_agent    ON public.audience_memberships(agent_id);


-- ── 3. simulation_participations ──────────────────────────────────────

CREATE TABLE public.simulation_participations (
  simulation_participation_id UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id               UUID  NOT NULL REFERENCES public.simulations(simulation_id) ON DELETE CASCADE,
  run_id                      UUID  REFERENCES public.simulation_runs(run_id) ON DELETE SET NULL,
  agent_id                    UUID  NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  runtime_agent_ref           TEXT,           -- reference ID used inside OASIS runtime
  runtime_stance              TEXT            CHECK (runtime_stance IN ('supportive', 'neutral', 'opposing', 'observer')),
  active_platforms_json       JSONB NOT NULL DEFAULT '[]',
  local_influence_score       FLOAT,
  local_activity_score        FLOAT,
  notable_flag                BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (simulation_id, agent_id)
);

CREATE INDEX idx_sim_participations_simulation ON public.simulation_participations(simulation_id);
CREATE INDEX idx_sim_participations_agent      ON public.simulation_participations(agent_id);
CREATE INDEX idx_sim_participations_run        ON public.simulation_participations(run_id);


-- ── RLS ───────────────────────────────────────────────────────────────

ALTER TABLE public.audiences                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_memberships     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_participations ENABLE ROW LEVEL SECURITY;

-- audiences: workspace members can see
CREATE POLICY "audiences_select_workspace_members"
  ON public.audiences FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "audiences_insert_contributors"
  ON public.audiences FOR INSERT
  WITH CHECK (
    public.workspace_role(workspace_id) IN
    ('contributor', 'editor', 'workspace_admin', 'org_admin', 'platform_admin')
  );

CREATE POLICY "audiences_update_contributors"
  ON public.audiences FOR UPDATE
  USING (public.is_workspace_member(workspace_id));

-- audience_memberships: visible if parent audience is visible
CREATE POLICY "audience_memberships_select"
  ON public.audience_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.audiences a
      WHERE a.audience_id = audience_memberships.audience_id
        AND public.is_workspace_member(a.workspace_id)
    )
  );

-- simulation_participations: visible if parent simulation is visible
CREATE POLICY "sim_participations_select"
  ON public.simulation_participations FOR SELECT
  USING (
    public.is_workspace_member(
      (SELECT workspace_id FROM public.simulations s
       WHERE s.simulation_id = simulation_participations.simulation_id)
    )
  );


-- End of migration 003
