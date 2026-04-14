-- ============================================================
-- Raktio — Migration 009: Sources & Knowledge
-- ============================================================
-- Domain 6 from DATA_MODEL_AND_STORAGE.md:
--   1. sources — uploaded source materials
--   2. source_extractions — extracted entities/topics/summary
--   3. source_links — links sources to simulations/audiences
--
-- These tables enable source-grounded simulation briefs,
-- enterprise document workflows, and evidence lineage.
-- ============================================================


-- ── 1. sources ────────────────────────────────────────────────────────

CREATE TABLE public.sources (
  source_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id       UUID        NOT NULL REFERENCES public.workspaces(workspace_id) ON DELETE CASCADE,
  uploaded_by_user_id UUID       NOT NULL REFERENCES public.users(user_id),
  source_type        TEXT        NOT NULL DEFAULT 'document'
                                 CHECK (source_type IN ('document', 'text', 'url', 'image')),
  title              TEXT        NOT NULL,
  description        TEXT,
  file_name          TEXT,                -- original file name
  file_size_bytes    INTEGER,
  mime_type          TEXT,                -- application/pdf, text/plain, etc.
  raw_text           TEXT,                -- extracted plain text content
  parse_status       TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (parse_status IN ('pending', 'parsing', 'parsed', 'failed')),
  status             TEXT        NOT NULL DEFAULT 'active'
                                 CHECK (status IN ('active', 'archived', 'deleted')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sources_workspace ON public.sources(workspace_id);
CREATE INDEX idx_sources_status    ON public.sources(parse_status);

CREATE TRIGGER trg_sources_updated_at
  BEFORE UPDATE ON public.sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── 2. source_extractions ─────────────────────────────────────────────

CREATE TABLE public.source_extractions (
  source_extraction_id UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id            UUID      NOT NULL REFERENCES public.sources(source_id) ON DELETE CASCADE,
  extraction_version   INTEGER   NOT NULL DEFAULT 1,
  summary_json         JSONB,              -- LLM-generated summary of the source
  entity_json          JSONB,              -- extracted entities (people, companies, products)
  topic_json           JSONB,              -- extracted topics/themes
  key_claims_json      JSONB,              -- key claims/arguments from the document
  word_count           INTEGER,
  language             TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_id, extraction_version)
);

CREATE INDEX idx_extractions_source ON public.source_extractions(source_id);


-- ── 3. source_links ───────────────────────────────────────────────────

CREATE TABLE public.source_links (
  source_link_id       UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id            UUID      NOT NULL REFERENCES public.sources(source_id) ON DELETE CASCADE,
  linked_entity_type   TEXT      NOT NULL
                                 CHECK (linked_entity_type IN (
                                   'simulation', 'audience', 'report', 'compare'
                                 )),
  linked_entity_id     UUID      NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_id, linked_entity_type, linked_entity_id)
);

CREATE INDEX idx_source_links_source ON public.source_links(source_id);
CREATE INDEX idx_source_links_entity ON public.source_links(linked_entity_type, linked_entity_id);


-- ── RLS ───────────────────────────────────────────────────────────────

ALTER TABLE public.sources            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_links       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sources_select_workspace"
  ON public.sources FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "sources_insert_contributors"
  ON public.sources FOR INSERT
  WITH CHECK (
    public.workspace_role(workspace_id) IN
    ('contributor', 'editor', 'workspace_admin', 'org_admin', 'platform_admin')
  );

CREATE POLICY "source_extractions_select"
  ON public.source_extractions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sources s
      WHERE s.source_id = source_extractions.source_id
        AND public.is_workspace_member(s.workspace_id)
    )
  );

CREATE POLICY "source_links_select"
  ON public.source_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sources s
      WHERE s.source_id = source_links.source_id
        AND public.is_workspace_member(s.workspace_id)
    )
  );

-- End of migration 009
