-- ============================================================
-- Raktio — Migration 001: Initial Schema
-- ============================================================
-- Run this against your Supabase project via:
--   Supabase Dashboard → SQL Editor → paste and run
--   or: supabase db push (if using Supabase CLI)
--
-- Tables created (minimum required for Step 1):
--   1.  users
--   2.  organizations
--   3.  workspaces
--   4.  workspace_memberships
--   5.  simulations
--   6.  simulation_configs
--   7.  simulation_runs
--   8.  agents
--   9.  agent_platform_presence
--   10. credit_balances
--   11. credit_ledger
--
-- Extra table created beyond the minimum:
--   • plans  — required by credit_balances and billing_service to
--              enforce plan entitlements during simulation launch.
--              Without a plans catalog, credit validation has no
--              reference point. Kept minimal (catalog-only, no prices).
-- ============================================================


-- ── Extensions ────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "vector";     -- pgvector (semantic search, later)


-- ── Helper: updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. users
-- Extends auth.users (Supabase Auth).
-- One row per authenticated user, created automatically via trigger.
-- ============================================================
CREATE TABLE public.users (
  user_id       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT        NOT NULL DEFAULT '',
  locale        TEXT        NOT NULL DEFAULT 'en',
  status        TEXT        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ
);

-- Auto-create a users row when a Supabase Auth user registers
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ============================================================
-- 2. plans
-- Catalog of subscription plans. Referenced by organizations.
-- Extra table justified: needed to validate scale limits and
-- credit entitlements before any simulation can be launched.
-- ============================================================
CREATE TABLE public.plans (
  plan_id           TEXT        PRIMARY KEY,   -- 'starter','growth','business','scale','enterprise'
  name              TEXT        NOT NULL,
  agent_limit       INTEGER     NOT NULL DEFAULT 10000,
  is_enterprise     BOOLEAN     NOT NULL DEFAULT FALSE,
  feature_flags     JSONB       NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.plans (plan_id, name, agent_limit, is_enterprise, feature_flags) VALUES
  ('starter',    'Starter',    2500,   FALSE, '{"compare":false,"ask_crowd":false,"private_audiences":false}'),
  ('growth',     'Growth',     5000,   FALSE, '{"compare":true,"ask_crowd":false,"private_audiences":false}'),
  ('business',   'Business',   10000,  FALSE, '{"compare":true,"ask_crowd":true,"private_audiences":false}'),
  ('scale',      'Scale',      50000,  FALSE, '{"compare":true,"ask_crowd":true,"private_audiences":true}'),
  ('enterprise', 'Enterprise', 999999, TRUE,  '{"compare":true,"ask_crowd":true,"private_audiences":true,"custom_governance":true}');


-- ============================================================
-- 3. organizations
-- Top-level tenant boundary. Owns billing + workspaces.
-- ============================================================
CREATE TABLE public.organizations (
  organization_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  slug             TEXT        NOT NULL UNIQUE,
  plan_id          TEXT        NOT NULL DEFAULT 'starter' REFERENCES public.plans(plan_id),
  billing_status   TEXT        NOT NULL DEFAULT 'active'
                               CHECK (billing_status IN ('active','past_due','canceled','trialing')),
  status           TEXT        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','suspended','deleted')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 4. workspaces
-- Primary collaboration unit. Scoped under an organization.
-- A user can have a personal workspace (organization_id nullable).
-- ============================================================
CREATE TABLE public.workspaces (
  workspace_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID        REFERENCES public.organizations(organization_id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  slug             TEXT        NOT NULL,
  default_locale   TEXT        NOT NULL DEFAULT 'en',
  status           TEXT        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','archived','deleted')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, slug)
);

CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 5. workspace_memberships
-- Maps users to workspaces with a role.
-- Roles: viewer | contributor | editor | workspace_admin |
--        billing_admin | org_admin | platform_admin
-- ============================================================
CREATE TABLE public.workspace_memberships (
  workspace_membership_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id            UUID        NOT NULL REFERENCES public.workspaces(workspace_id) ON DELETE CASCADE,
  user_id                 UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  role                    TEXT        NOT NULL DEFAULT 'contributor'
                                      CHECK (role IN (
                                        'viewer','contributor','editor',
                                        'workspace_admin','billing_admin','org_admin','platform_admin'
                                      )),
  joined_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status                  TEXT        NOT NULL DEFAULT 'active'
                                      CHECK (status IN ('active','removed')),
  UNIQUE (workspace_id, user_id)
);


-- ============================================================
-- 6. simulations
-- Product-level simulation object (persists across all states).
-- ============================================================
CREATE TABLE public.simulations (
  simulation_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id           UUID        NOT NULL REFERENCES public.workspaces(workspace_id) ON DELETE CASCADE,
  created_by_user_id     UUID        NOT NULL REFERENCES public.users(user_id),
  name                   TEXT        NOT NULL,
  goal_type              TEXT        NOT NULL DEFAULT 'general',
  status                 TEXT        NOT NULL DEFAULT 'draft'
                                     CHECK (status IN (
                                       'draft','understanding','planning','audience_preparing',
                                       'cost_check','bootstrapping','running','paused',
                                       'completing','reporting','completed','failed','canceled'
                                     )),
  planner_status         TEXT        NOT NULL DEFAULT 'pending'
                                     CHECK (planner_status IN ('pending','running','ready','failed')),
  brief_text             TEXT,
  brief_context_json     JSONB,                -- interpreted brief from Intelligence layer
  agent_count_requested  INTEGER     NOT NULL DEFAULT 500,
  agent_count_final      INTEGER,
  duration_preset        TEXT        NOT NULL DEFAULT '24h'
                                     CHECK (duration_preset IN ('6h','12h','24h','48h','72h')),
  platform_scope         JSONB       NOT NULL DEFAULT '["x"]',
  geography_scope        JSONB       NOT NULL DEFAULT '{}',
  recsys_choice          TEXT        NOT NULL DEFAULT 'random'
                                     CHECK (recsys_choice IN ('random','reddit','personalized','twhin-bert')),
  credit_estimate        INTEGER,
  credit_final           INTEGER,
  parent_simulation_id   UUID        REFERENCES public.simulations(simulation_id),
  compare_group_id       UUID,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_simulations_workspace      ON public.simulations(workspace_id);
CREATE INDEX idx_simulations_status         ON public.simulations(status);
CREATE INDEX idx_simulations_parent         ON public.simulations(parent_simulation_id);

CREATE TRIGGER trg_simulations_updated_at
  BEFORE UPDATE ON public.simulations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 7. simulation_configs
-- Versioned config snapshot (planner recommendation + user overrides
-- + final runtime config). Keeps full reproducibility history.
-- ============================================================
CREATE TABLE public.simulation_configs (
  simulation_config_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id                UUID        NOT NULL REFERENCES public.simulations(simulation_id) ON DELETE CASCADE,
  config_version               INTEGER     NOT NULL DEFAULT 1,
  planner_recommendation_json  JSONB,
  user_override_json           JSONB,
  final_runtime_config_json    JSONB,
  simulation_fingerprint       TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (simulation_id, config_version)
);

CREATE INDEX idx_sim_configs_simulation ON public.simulation_configs(simulation_id);


-- ============================================================
-- 8. simulation_runs
-- Actual OASIS runtime execution records.
-- Multiple runs per simulation are possible (reruns, variants).
-- ============================================================
CREATE TABLE public.simulation_runs (
  run_id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id             UUID        NOT NULL REFERENCES public.simulations(simulation_id) ON DELETE CASCADE,
  status                    TEXT        NOT NULL DEFAULT 'bootstrapping'
                                        CHECK (status IN (
                                          'bootstrapping','running','paused','completing',
                                          'reporting','completed','failed','canceled'
                                        )),
  runtime_path              TEXT,           -- absolute path to run workspace directory
  sqlite_path               TEXT,           -- absolute path to run SQLite DB
  started_at                TIMESTAMPTZ,
  completed_at              TIMESTAMPTZ,
  failed_at                 TIMESTAMPTZ,
  failure_reason            TEXT,
  simulated_time_completed  TEXT,           -- e.g. "18h" — how far through the preset
  runtime_metadata_json     JSONB
);

CREATE INDEX idx_sim_runs_simulation ON public.simulation_runs(simulation_id);
CREATE INDEX idx_sim_runs_status     ON public.simulation_runs(status);


-- ============================================================
-- 9. agents
-- Persistent synthetic social users — core Raktio population asset.
-- username is globally unique and stable (avatar derives from it).
-- ============================================================
CREATE TABLE public.agents (
  agent_id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username               TEXT        NOT NULL UNIQUE,
  display_name           TEXT        NOT NULL,
  first_name             TEXT        NOT NULL,
  last_name              TEXT        NOT NULL,
  -- avatar_seed = username; no image stored — DiceBear notionists
  avatar_seed            TEXT        NOT NULL GENERATED ALWAYS AS (username) STORED,
  avatar_style           TEXT        NOT NULL DEFAULT 'notionists',

  -- Geography (persistent identity)
  country                TEXT        NOT NULL,
  region                 TEXT        NOT NULL DEFAULT '',
  province_or_state      TEXT,
  city                   TEXT        NOT NULL DEFAULT '',
  macro_area             TEXT,
  timezone               TEXT        NOT NULL DEFAULT 'UTC',
  languages              JSONB       NOT NULL DEFAULT '["en"]',

  -- Demographics
  age                    INTEGER,
  gender                 TEXT,
  profession             TEXT,
  education_level        TEXT,
  income_band            TEXT,
  family_status          TEXT,
  tech_literacy          TEXT,

  -- Psychographics
  mbti                   TEXT,
  big_five               JSONB,
  interests              JSONB       NOT NULL DEFAULT '[]',
  values                 JSONB       NOT NULL DEFAULT '[]',
  base_stance_bias       TEXT        NOT NULL DEFAULT 'neutral'
                                     CHECK (base_stance_bias IN ('supportive','neutral','opposing','observer')),
  activity_level         TEXT        NOT NULL DEFAULT 'medium'
                                     CHECK (activity_level IN ('low','medium','high')),
  influence_weight       FLOAT       NOT NULL DEFAULT 1.0,
  persuadability         FLOAT       NOT NULL DEFAULT 0.5 CHECK (persuadability BETWEEN 0 AND 1),
  controversy_tolerance  FLOAT       NOT NULL DEFAULT 0.5 CHECK (controversy_tolerance BETWEEN 0 AND 1),
  risk_tolerance         FLOAT       NOT NULL DEFAULT 0.5 CHECK (risk_tolerance BETWEEN 0 AND 1),

  -- Pool metadata
  population_tier        TEXT        NOT NULL DEFAULT 'global'
                                     CHECK (population_tier IN ('global','private')),
  is_global              BOOLEAN     NOT NULL DEFAULT TRUE,
  is_private             BOOLEAN     NOT NULL DEFAULT FALSE,
  origin_type            TEXT        NOT NULL DEFAULT 'generated'
                                     CHECK (origin_type IN ('generated','source_derived','manually_created')),
  origin_workspace_id    UUID        REFERENCES public.workspaces(workspace_id),
  status                 TEXT        NOT NULL DEFAULT 'active'
                                     CHECK (status IN ('active','archived','quarantined')),

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agents_country    ON public.agents(country);
CREATE INDEX idx_agents_username   ON public.agents(username);
CREATE INDEX idx_agents_is_global  ON public.agents(is_global);
CREATE INDEX idx_agents_stance     ON public.agents(base_stance_bias);

CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 10. agent_platform_presence
-- Platform-specific presence and behavior per agent.
-- Not every agent is present on every platform (Multi-platform Model 1).
-- ============================================================
CREATE TABLE public.agent_platform_presence (
  agent_platform_presence_id  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                    UUID    NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  platform                    TEXT    NOT NULL
                                      CHECK (platform IN ('x','reddit','instagram','tiktok','linkedin')),
  is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
  platform_username           TEXT,
  posting_frequency           TEXT,   -- 'high','medium','low','lurker'
  commenting_frequency        TEXT,
  engagement_style            TEXT,   -- 'reactive','deliberate','lurker','amplifier'
  tone_profile                TEXT,   -- 'formal','casual','aggressive','measured'
  follower_band               TEXT,   -- 'nano','micro','mid','macro'
  platform_influence_weight   FLOAT   NOT NULL DEFAULT 1.0,
  platform_behavior_notes     TEXT,
  UNIQUE (agent_id, platform)
);

CREATE INDEX idx_agent_platform_presence_agent    ON public.agent_platform_presence(agent_id);
CREATE INDEX idx_agent_platform_presence_platform ON public.agent_platform_presence(platform);


-- ============================================================
-- 11. credit_balances
-- Current credit balance per organization.
-- reserved_credits = credits locked for running simulations.
-- ============================================================
CREATE TABLE public.credit_balances (
  credit_balance_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID        NOT NULL REFERENCES public.organizations(organization_id) ON DELETE CASCADE,
  available_credits   INTEGER     NOT NULL DEFAULT 0 CHECK (available_credits >= 0),
  reserved_credits    INTEGER     NOT NULL DEFAULT 0 CHECK (reserved_credits >= 0),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id)
);

-- Auto-create a balance row when an org is created
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.credit_balances (organization_id, available_credits)
  VALUES (NEW.organization_id, 0)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization();


-- ============================================================
-- 12. credit_ledger
-- Immutable append-only log of all credit events.
-- Never update or delete rows — only INSERT.
-- ============================================================
CREATE TABLE public.credit_ledger (
  credit_ledger_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      UUID        NOT NULL REFERENCES public.organizations(organization_id),
  workspace_id         UUID        REFERENCES public.workspaces(workspace_id),
  event_type           TEXT        NOT NULL
                                   CHECK (event_type IN (
                                     'plan_allocation','bonus_allocation','annual_bonus',
                                     'pack_purchase','simulation_reservation',
                                     'simulation_finalization','refund','admin_adjustment'
                                   )),
  amount               INTEGER     NOT NULL,   -- positive = credit in, negative = deduction
  balance_after        INTEGER     NOT NULL,
  linked_simulation_id UUID        REFERENCES public.simulations(simulation_id),
  linked_run_id        UUID        REFERENCES public.simulation_runs(run_id),
  note                 TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_ledger_org       ON public.credit_ledger(organization_id);
CREATE INDEX idx_credit_ledger_sim       ON public.credit_ledger(linked_simulation_id);
CREATE INDEX idx_credit_ledger_created   ON public.credit_ledger(created_at);


-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all product tables
ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_configs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_platform_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_balances        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans                  ENABLE ROW LEVEL SECURITY;

-- plans: readable by everyone (public catalog)
CREATE POLICY "plans_select_all"
  ON public.plans FOR SELECT USING (true);

-- users: each user sees only their own row
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = user_id);

-- Helper: check if the calling user is a member of a workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_memberships
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get the user's role in a workspace
CREATE OR REPLACE FUNCTION public.workspace_role(p_workspace_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.workspace_memberships
  WHERE workspace_id = p_workspace_id
    AND user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get the org_id for a workspace (used in billing policies)
CREATE OR REPLACE FUNCTION public.workspace_org(p_workspace_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM public.workspaces WHERE workspace_id = p_workspace_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- workspaces: visible to members only
CREATE POLICY "workspaces_select_members"
  ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(workspace_id));

-- workspace_memberships: members can see their workspace's membership list
CREATE POLICY "memberships_select_workspace_members"
  ON public.workspace_memberships FOR SELECT
  USING (public.is_workspace_member(workspace_id));

-- simulations: workspace members can see simulations
CREATE POLICY "simulations_select_workspace_members"
  ON public.simulations FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "simulations_insert_contributors"
  ON public.simulations FOR INSERT
  WITH CHECK (
    public.workspace_role(workspace_id) IN
    ('contributor','editor','workspace_admin','org_admin','platform_admin')
  );

CREATE POLICY "simulations_update_contributors"
  ON public.simulations FOR UPDATE
  USING (public.is_workspace_member(workspace_id));

-- simulation_configs: same as simulations
CREATE POLICY "sim_configs_select"
  ON public.simulation_configs FOR SELECT
  USING (
    public.is_workspace_member(
      (SELECT workspace_id FROM public.simulations s WHERE s.simulation_id = simulation_configs.simulation_id)
    )
  );

-- simulation_runs: same as simulations
CREATE POLICY "sim_runs_select"
  ON public.simulation_runs FOR SELECT
  USING (
    public.is_workspace_member(
      (SELECT workspace_id FROM public.simulations s WHERE s.simulation_id = simulation_runs.simulation_id)
    )
  );

-- agents: global agents readable by all authenticated users
CREATE POLICY "agents_select_global"
  ON public.agents FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_global = TRUE);

-- private agents: only workspace members of the origin workspace
CREATE POLICY "agents_select_private"
  ON public.agents FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_global = FALSE
    AND public.is_workspace_member(origin_workspace_id)
  );

-- agent_platform_presence: follows agent visibility
CREATE POLICY "agent_platform_presence_select"
  ON public.agent_platform_presence FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.agents a
      WHERE a.agent_id = agent_platform_presence.agent_id
        AND (a.is_global = TRUE OR public.is_workspace_member(a.origin_workspace_id))
    )
  );

-- credit_balances: visible to org admins and billing admins
CREATE POLICY "credit_balances_select"
  ON public.credit_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.workspace_memberships m ON m.workspace_id = w.workspace_id
      WHERE w.organization_id = credit_balances.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('billing_admin','org_admin','platform_admin')
    )
  );

-- credit_ledger: same as credit_balances
CREATE POLICY "credit_ledger_select"
  ON public.credit_ledger FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.workspace_memberships m ON m.workspace_id = w.workspace_id
      WHERE w.organization_id = credit_ledger.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('billing_admin','org_admin','platform_admin')
    )
  );

-- organizations: org members can see their org
CREATE POLICY "organizations_select"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.workspace_memberships m ON m.workspace_id = w.workspace_id
      WHERE w.organization_id = organizations.organization_id
        AND m.user_id = auth.uid()
    )
  );


-- ============================================================
-- Service-role bypass policy
-- The backend uses the service_role key and bypasses RLS.
-- This is enforced by Supabase automatically for service_role.
-- No extra policy needed here — service_role ignores RLS by default.
-- ============================================================

-- End of migration 001
