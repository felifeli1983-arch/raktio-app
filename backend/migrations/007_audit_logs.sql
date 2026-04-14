-- ============================================================
-- Raktio — Migration 007: Audit Logs
-- ============================================================
-- Tracks sensitive governance actions for admin oversight.
-- Aligned with TEAM_GOVERNANCE_AND_PERMISSIONS.md audit requirements.
-- ============================================================

CREATE TABLE public.audit_logs (
  audit_log_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id     UUID        REFERENCES public.users(user_id) ON DELETE SET NULL,
  workspace_id      UUID        REFERENCES public.workspaces(workspace_id) ON DELETE SET NULL,
  organization_id   UUID        REFERENCES public.organizations(organization_id) ON DELETE SET NULL,
  action_type       TEXT        NOT NULL,
  entity_type       TEXT,       -- 'simulation', 'workspace', 'membership', 'audience', etc.
  entity_id         TEXT,       -- UUID of the affected entity
  metadata_json     JSONB,      -- before/after diff, extra context
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor      ON public.audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_org        ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_workspace  ON public.audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_action     ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_created    ON public.audit_logs(created_at);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view audit logs
CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships m
      WHERE m.user_id = auth.uid()
        AND m.role = 'platform_admin'
        AND m.status = 'active'
    )
  );

-- End of migration 007
