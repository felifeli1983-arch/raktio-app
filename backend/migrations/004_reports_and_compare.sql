-- ============================================================
-- Raktio — Migration 004: Reports + Compare
-- ============================================================
-- Tables from DATA_MODEL_AND_STORAGE.md Domain 5:
--   • reports
--   • report_sections
--   • compare_groups (implicit via simulations.compare_group_id)
--   • compare_runs
-- ============================================================


-- ── 1. reports ────────────────────────────────────────────────────────

CREATE TABLE public.reports (
  report_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id     UUID        NOT NULL REFERENCES public.simulations(simulation_id) ON DELETE CASCADE,
  run_id            UUID        REFERENCES public.simulation_runs(run_id) ON DELETE SET NULL,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'generating', 'partial', 'completed', 'failed')),
  report_version    INTEGER     NOT NULL DEFAULT 1,
  summary_json      JSONB,                  -- executive summary structured data
  scorecard_json    JSONB,                  -- key metrics scorecard
  confidence_notes  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

CREATE INDEX idx_reports_simulation ON public.reports(simulation_id);
CREATE INDEX idx_reports_status     ON public.reports(status);


-- ── 2. report_sections ────────────────────────────────────────────────

CREATE TABLE public.report_sections (
  report_section_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id          UUID        NOT NULL REFERENCES public.reports(report_id) ON DELETE CASCADE,
  section_key        TEXT        NOT NULL
                                 CHECK (section_key IN (
                                   'executive_summary', 'key_findings', 'belief_shifts',
                                   'patient_zero', 'segment_analysis', 'geography_analysis',
                                   'platform_analysis', 'recommendations', 'evidence',
                                   'confidence_limitations'
                                 )),
  status             TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  content_markdown   TEXT,
  structured_json    JSONB,
  generated_at       TIMESTAMPTZ,
  UNIQUE (report_id, section_key)
);

CREATE INDEX idx_report_sections_report ON public.report_sections(report_id);


-- ── 3. compare_runs ───────────────────────────────────────────────────

CREATE TABLE public.compare_runs (
  compare_id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id            UUID        NOT NULL REFERENCES public.workspaces(workspace_id) ON DELETE CASCADE,
  base_simulation_id      UUID        NOT NULL REFERENCES public.simulations(simulation_id),
  target_simulation_id    UUID        NOT NULL REFERENCES public.simulations(simulation_id),
  compare_type            TEXT        NOT NULL DEFAULT 'standard'
                                      CHECK (compare_type IN ('standard', 'a_b_test', 'variant', 'time_series')),
  summary_json            JSONB,
  status                  TEXT        NOT NULL DEFAULT 'pending'
                                      CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at            TIMESTAMPTZ
);

CREATE INDEX idx_compare_runs_workspace ON public.compare_runs(workspace_id);
CREATE INDEX idx_compare_runs_base      ON public.compare_runs(base_simulation_id);
CREATE INDEX idx_compare_runs_target    ON public.compare_runs(target_simulation_id);


-- ── RLS ───────────────────────────────────────────────────────────────

ALTER TABLE public.reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compare_runs    ENABLE ROW LEVEL SECURITY;

-- reports: visible to simulation's workspace members
CREATE POLICY "reports_select"
  ON public.reports FOR SELECT
  USING (
    public.is_workspace_member(
      (SELECT workspace_id FROM public.simulations s WHERE s.simulation_id = reports.simulation_id)
    )
  );

-- report_sections: follows parent report visibility
CREATE POLICY "report_sections_select"
  ON public.report_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports r
      JOIN public.simulations s ON s.simulation_id = r.simulation_id
      WHERE r.report_id = report_sections.report_id
        AND public.is_workspace_member(s.workspace_id)
    )
  );

-- compare_runs: workspace members
CREATE POLICY "compare_runs_select"
  ON public.compare_runs FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "compare_runs_insert"
  ON public.compare_runs FOR INSERT
  WITH CHECK (
    public.workspace_role(workspace_id) IN
    ('contributor', 'editor', 'workspace_admin', 'org_admin', 'platform_admin')
  );


-- End of migration 004
