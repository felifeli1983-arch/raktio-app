-- ============================================================
-- Raktio — Migration 006: LLM Usage Log
-- ============================================================
-- Cost & Token Intelligence Layer (Step 8D).
-- Records every LLM call for analytics, cost tracking,
-- and future pricing recommendations.
--
-- This table is append-only (like credit_ledger).
-- It does NOT auto-modify credits, plans, or pricing.
-- It measures, logs, and supports future analysis only.
-- ============================================================

CREATE TABLE public.llm_usage_log (
  llm_usage_log_id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider & model
  provider            TEXT        NOT NULL,    -- 'anthropic', 'deepseek'
  model               TEXT        NOT NULL,    -- 'claude-sonnet-4-6', 'deepseek-chat'
  route               TEXT        NOT NULL     -- 'planning', 'runtime', 'report'
                                  CHECK (route IN ('planning', 'runtime', 'report')),

  -- Token usage
  input_tokens        INTEGER     NOT NULL DEFAULT 0,
  output_tokens       INTEGER     NOT NULL DEFAULT 0,
  total_tokens        INTEGER     GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,

  -- Estimated cost (USD, for analytics — NOT for billing)
  estimated_cost_usd  NUMERIC(10,6) NOT NULL DEFAULT 0,

  -- Context linkage
  simulation_id       UUID        REFERENCES public.simulations(simulation_id) ON DELETE SET NULL,
  run_id              UUID        REFERENCES public.simulation_runs(run_id) ON DELETE SET NULL,
  report_id           UUID        REFERENCES public.reports(report_id) ON DELETE SET NULL,
  compare_id          UUID        REFERENCES public.compare_runs(compare_id) ON DELETE SET NULL,
  agent_id            UUID        REFERENCES public.agents(agent_id) ON DELETE SET NULL,
  organization_id     UUID        REFERENCES public.organizations(organization_id) ON DELETE SET NULL,
  workspace_id        UUID        REFERENCES public.workspaces(workspace_id) ON DELETE SET NULL,
  user_id             UUID        REFERENCES public.users(user_id) ON DELETE SET NULL,

  -- Call metadata
  service_module      TEXT,       -- 'brief_service', 'planner_service', 'report_service', 'agent_service', 'compare_service', 'oasis_worker'
  call_purpose        TEXT,       -- 'brief_understanding', 'planner_recommendation', 'report_section:executive_summary', 'agent_generation', 'compare', 'agent_inference'

  -- Timing
  duration_ms         INTEGER,    -- wall clock time for the LLM call
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_llm_usage_log_route      ON public.llm_usage_log(route);
CREATE INDEX idx_llm_usage_log_provider   ON public.llm_usage_log(provider);
CREATE INDEX idx_llm_usage_log_sim        ON public.llm_usage_log(simulation_id);
CREATE INDEX idx_llm_usage_log_org        ON public.llm_usage_log(organization_id);
CREATE INDEX idx_llm_usage_log_created    ON public.llm_usage_log(created_at);

-- RLS
ALTER TABLE public.llm_usage_log ENABLE ROW LEVEL SECURITY;

-- Only billing/org admins can see usage logs
CREATE POLICY "llm_usage_log_select"
  ON public.llm_usage_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.workspace_memberships m ON m.workspace_id = w.workspace_id
      WHERE w.organization_id = llm_usage_log.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('billing_admin', 'org_admin', 'platform_admin')
    )
  );

-- End of migration 006
