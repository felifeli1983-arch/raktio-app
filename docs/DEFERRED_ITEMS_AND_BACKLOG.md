# Deferred Items and Backlog

> Central source of truth for all deferred, partial, blocked, or missing items.
> Last synchronized: 2026-04-14 (after Step 7.5G — Step 7.5 block complete)

---

## Runtime

### RT-01: ARQ background worker dispatch
- **Area**: Runtime
- **Description**: OASIS simulation currently runs via `asyncio.create_task()` inside the FastAPI process. In production, this should be dispatched to a dedicated ARQ background worker to avoid blocking the API server and support concurrent runs.
- **Why deferred**: `asyncio.create_task()` works correctly for development and testing. ARQ requires Redis + worker process infrastructure.
- **Dependencies**: Redis (already in docker-compose), ARQ (in requirements.txt)
- **Priority**: HIGH
- **Type**: Architecture follow-up
- **Related files**: `runtime/launcher.py`, `app/workers/jobs.py` (stub)
- **Recommended step**: Step 8 or dedicated infrastructure step
- **Status**: DEFERRED

### RT-02: Interview bridge
- **Area**: Runtime
- **Description**: `runtime/interview_bridge.py` is a stub. No ability to interview individual agents during or after a simulation run. OASIS supports `ActionType.INTERVIEW` and `agent.perform_interview()`.
- **Why deferred**: Lower priority than core simulation execution pipeline.
- **Dependencies**: OASIS interview API (verified available), agent profile context
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `runtime/interview_bridge.py` (stub), `SIMULATION_ENGINE_SPEC.md` section 9
- **Recommended step**: Post-Step 8
- **Status**: DEFERRED

### RT-03: Temporal activity multipliers
- **Area**: Runtime
- **Description**: SIMULATION_ENGINE_SPEC.md section 2 specifies daypart multipliers (dead hours, morning, workday, peak evening, night) that should affect agent activation rates and action pacing. Not implemented in config_builder or oasis_worker.
- **Why deferred**: OASIS env.step() treats each step uniformly. Temporal multipliers would require varying the number of active agents per step.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Enhancement
- **Related files**: `runtime/config_builder.py`, `runtime/oasis_worker.py`
- **Recommended step**: Runtime refinement pass
- **Status**: DEFERRED

### RT-04: Group simulation actions
- **Area**: Runtime
- **Description**: 5 OASIS ActionTypes disabled: JOIN_GROUP, LEAVE_GROUP, SEND_TO_GROUP, CREATE_GROUP, LISTEN_FROM_GROUP. These enable community/faction simulation scenarios.
- **Why deferred**: Group features are a distinct product capability, not needed for core social simulation.
- **Dependencies**: None (OASIS supports them already)
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `runtime/oasis_worker.py` (action set documentation)
- **Recommended step**: Group simulation feature step
- **Status**: DEFERRED

### RT-05: Runtime health endpoint
- **Area**: Runtime
- **Description**: `runtime/health.py` is a stub. No health monitoring for running OASIS processes.
- **Why deferred**: Low priority vs core pipeline.
- **Dependencies**: OASIS worker running
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `runtime/health.py` (stub)
- **Recommended step**: Step 9 (Admin)
- **Status**: DEFERRED

---

## Reports / Compare

### RP-01: Report evidence links table
- **Area**: Reports
- **Description**: `report_evidence_links` table from DATA_MODEL_AND_STORAGE.md section 26 not created. This would link report sections to specific evidence items (posts, events, agents) for drill-down.
- **Why deferred**: Reports currently embed evidence in markdown text. Structured linking requires a separate table + UI.
- **Dependencies**: Migration, frontend drill-down UI
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` section 26
- **Recommended step**: Report refinement step
- **Status**: DEFERRED

### RP-02: Report chat (interactive)
- **Area**: Reports
- **Description**: `report_chat_threads` and `report_chat_messages` tables not created. No chat endpoint. REPORTS_AND_INSIGHTS_SPEC.md defines this as a core layer (interactive insight layer).
- **Why deferred**: Requires tables, chat service, evidence retrieval, frontend component.
- **Dependencies**: Report tables, semantic search (pgvector)
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` sections 27-28, `REPORTS_AND_INSIGHTS_SPEC.md`
- **Recommended step**: Post-Step 8
- **Status**: DEFERRED

### RP-02b: Report section generation fragility
- **Area**: Reports
- **Description**: With 14 sections, later sections receive a very large prompt (all previous sections' markdown is included for coherence). This can cause: JSON parsing failures, token limit issues, or LLM refusals. Stress test showed 11/14 sections succeeded (3 failed). The system is fault-tolerant (failed sections don't block others), but the failure rate needs improvement.
- **Why deferred**: The core pipeline works. Optimization is a refinement task: truncate previous sections more aggressively, or omit them for independent sections.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Bug / fragility
- **Related files**: `services/report_service.py` `_generate_section()` prompt construction
- **Recommended step**: Report refinement pass
- **Status**: DEFERRED

### RP-03: Report PDF export
- **Area**: Reports
- **Description**: No PDF generation from report sections. REPORTS_AND_INSIGHTS_SPEC.md lists export as a key action.
- **Why deferred**: Lower priority than evidence pipeline.
- **Dependencies**: PDF library (e.g., weasyprint), report sections completed
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `REPORTS_AND_INSIGHTS_SPEC.md`
- **Recommended step**: Step 11 (Frontend) or dedicated export step
- **Status**: DEFERRED

### RP-04: NLP sentiment analysis on content
- **Area**: Reports / Analytics
- **Description**: Post and comment content is passed to the LLM as text. No explicit NLP sentiment classification per post/comment. Belief shift analysis infers sentiment from behavioral patterns (likes/dislikes), not from content analysis.
- **Why deferred**: Requires embedding model calls per post (sentence-transformers or LLM batch). Would add significant latency. More appropriate as post-run batch processing.
- **Dependencies**: sentence-transformers (installed), batch processing infrastructure
- **Priority**: MEDIUM
- **Type**: Enhancement
- **Related files**: `runtime/event_bridge.py`, `services/report_service.py`
- **Recommended step**: Memory transformation step
- **Status**: DEFERRED

### RP-05: Compare geography and segment deltas
- **Area**: Compare
- **Description**: Compare currently infers geography and segment deltas from agent descriptions. No structured data feeds these sections because agent geography is in Supabase (not in OASIS SQLite evidence bundle) and segments aren't mapped to agents.
- **Why deferred**: Requires joining Supabase agent data with OASIS evidence, and segment-to-agent mapping.
- **Dependencies**: Population system refinement (segment mapping)
- **Priority**: LOW
- **Type**: Limitation
- **Related files**: `services/compare_service.py`
- **Recommended step**: Population refinement step
- **Status**: DEFERRED

---

## Population / Agents / Audiences

### POP-01: Per-segment stance assignment
- **Area**: Population
- **Description**: Planner provides per-segment `stance_bias`, but audience_service assigns stances globally from `stance_distribution` randomly. Agents don't get segment-appropriate stances.
- **Why deferred**: Requires segment-to-agent mapping logic (which segment each agent belongs to, based on demographics/psychographics).
- **Dependencies**: Segment definition model in audience assembly
- **Priority**: MEDIUM
- **Type**: Limitation
- **Related files**: `services/audience_service.py` lines 209-217
- **Recommended step**: Population refinement step
- **Status**: PARTIAL

### POP-02: Private audience service enforcement
- **Area**: Population
- **Description**: Schema supports `is_private` on audiences and `population_tier` on agents. `find_global_agents()` correctly filters `is_global=True`. But no service logic creates private audiences or enforces workspace-scoped access to private agents.
- **Why deferred**: Enterprise feature. Schema is ready, service logic is a feature step.
- **Dependencies**: None (schema ready)
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `services/audience_service.py`, `repositories/agents.py`, `AUDIENCE_AND_AGENT_ATLAS_SPEC.md`
- **Recommended step**: Enterprise feature step
- **Status**: DEFERRED

### POP-03: Agent Atlas API
- **Area**: Population
- **Description**: `api/agents.py` is a stub. No API for browsing, filtering, or viewing agent profiles. The Agent Atlas page (Tier 2 per APP_STRUCTURE_AND_PAGES.md) has no backend.
- **Why deferred**: Lower priority than runtime pipeline and evidence pipeline.
- **Dependencies**: None (agents exist in DB with full profiles)
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `api/agents.py` (stub), `AUDIENCE_AND_AGENT_ATLAS_SPEC.md`
- **Recommended step**: Step 10
- **Status**: DEFERRED

### POP-04: Audience creation/edit/duplicate endpoints
- **Area**: Population
- **Description**: Audiences API only has GET list, GET single, DELETE (archive). No create, edit, duplicate, filter-based selection, or source-derived audience endpoints.
- **Why deferred**: Auto-generated audiences work for the simulation pipeline. Manual audience management is a product refinement.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `api/audiences.py`, `AUDIENCE_AND_AGENT_ATLAS_SPEC.md`
- **Recommended step**: Step 10
- **Status**: PARTIAL

---

## Memory System

### MEM-01: Memory domain tables
- **Area**: Memory
- **Description**: 5 tables from DATA_MODEL_AND_STORAGE.md Domain 4 not created: `agent_memory_summaries`, `agent_episodic_memory`, `agent_relationship_memory`, `agent_topic_exposure`, `memory_update_jobs`. This is the biggest gap for persistent agent evolution.
- **Why deferred**: Requires post-run memory transformation service that converts OASIS trace events into semantic episodes.
- **Dependencies**: OASIS runtime (done), event bridge (done)
- **Priority**: HIGH
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` Domain 4, `AGENTS_AUDIENCE_MEMORY.md`
- **Recommended step**: Dedicated memory system step (post-Step 8)
- **Status**: DEFERRED

### MEM-02: Post-run memory transformation
- **Area**: Memory
- **Description**: After a simulation completes, agent memories should be updated with what they experienced. `simulation_participations.runtime_stance` is set once and never updated. No service converts trace events into episodic memory, relationship updates, or topic exposure.
- **Why deferred**: Requires MEM-01 tables + memory service + LLM-based episode extraction.
- **Dependencies**: MEM-01, event_bridge evidence bundle
- **Priority**: HIGH
- **Type**: Missing feature
- **Related files**: `services/memory_service.py` (stub), `AGENTS_AUDIENCE_MEMORY.md`
- **Recommended step**: Dedicated memory system step
- **Status**: DEFERRED

### MEM-03: Belief trajectory over time
- **Area**: Memory / Analytics
- **Description**: OASIS trace rows don't have wall-clock timestamps per step (only rowid ordering and `created_at` in tables which resets per run). Per-step stance snapshots would require instrumenting the worker loop to record step boundaries.
- **Why deferred**: Would require modifying oasis_worker to insert step markers into trace or a separate progress table.
- **Dependencies**: oasis_worker modification
- **Priority**: LOW
- **Type**: Enhancement
- **Related files**: `runtime/oasis_worker.py`
- **Recommended step**: Analytics refinement pass
- **Status**: DEFERRED

---

## Knowledge / Sources

### KS-01: Knowledge domain tables
- **Area**: Knowledge
- **Description**: 4 tables from DATA_MODEL_AND_STORAGE.md Domain 6 not created: `sources`, `source_files`, `source_extractions`, `source_links`. No file upload, parsing, or source-to-simulation linking.
- **Why deferred**: Brief ingestion currently accepts text only. File processing requires parser adapter + storage adapter.
- **Dependencies**: Storage adapter, parser adapter
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` Domain 6, `adapters/parser_adapter.py` (stub), `adapters/storage_adapter.py` (stub)
- **Recommended step**: Dedicated knowledge step
- **Status**: DEFERRED

### KS-02: File/image upload in brief ingestion
- **Area**: Knowledge
- **Description**: DATAFLOW_AND_RUNTIME.md Phase 1 says brief ingestion should accept "images, PDFs, DOCX/TXT/MD files". Only `brief_text` is supported.
- **Why deferred**: Requires KS-01 tables + parser adapter + storage adapter.
- **Dependencies**: KS-01
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `services/brief_service.py`, `DATAFLOW_AND_RUNTIME.md`
- **Recommended step**: Same as KS-01
- **Status**: DEFERRED

---

## Billing

### BIL-01: Credit settlement on completion ✅ DONE
- **Area**: Billing
- **Description**: `_settle_credits()` in `oasis_worker.py` calculates actual cost from real execution, settles reserved→final, creates `simulation_finalization` ledger entry, handles partial refund.
- **Status**: DONE (Step 7.5G)

### BIL-02: Full credit cost formula
- **Area**: Billing
- **Description**: Current formula: `agents x duration_multiplier`. Missing: platform_count factor, geography_scope factor, add-on modular pricing. Doc specifies: audience_size (strong) + platform_count (medium-strong) + duration (medium) + geography (light-medium) + add-ons (modular).
- **Why deferred**: Simplified formula works for MVP. Full formula is a Step 8 task.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Enhancement
- **Related files**: `services/simulation_service.py`, `billing/credit_rules.py` (stub), `PRICING_AND_CREDITS.md`
- **Recommended step**: Step 8
- **Status**: DEFERRED

### BIL-03: Billing service + API
- **Area**: Billing
- **Description**: `services/billing_service.py` and `api/billing.py` are stubs. No plan management, pack purchases, usage history, or upgrade prompts.
- **Why deferred**: Was blocked by Step 7.5G (now complete).
- **Dependencies**: BIL-01 (done)
- **Priority**: HIGH
- **Type**: Missing feature
- **Related files**: `services/billing_service.py` (stub), `api/billing.py` (stub), `PRICING_AND_CREDITS.md`
- **Recommended step**: Step 8
- **Status**: READY

### BIL-04: Subscriptions table
- **Area**: Billing
- **Description**: `subscriptions` table from DATA_MODEL_AND_STORAGE.md section 37 not created. Needed for tracking plan periods, renewal dates, cancellation.
- **Why deferred**: Part of Step 8.
- **Dependencies**: BIL-03
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` section 37
- **Recommended step**: Step 8
- **Status**: DEFERRED

### BIL-05: Credit purchases table
- **Area**: Billing
- **Description**: `credit_purchases` table from DATA_MODEL_AND_STORAGE.md section 40 not created.
- **Why deferred**: Part of Step 8.
- **Dependencies**: BIL-03
- **Priority**: LOW
- **Type**: Missing feature
- **Recommended step**: Step 8
- **Status**: DEFERRED

---

## Admin / Governance

### ADM-01: Admin panel API
- **Area**: Admin
- **Description**: `api/admin.py`, `services/admin_service.py`, `admin/oversight.py`, `admin/audits.py` are all stubs. No tenant management, runtime oversight, pricing controls, or failure inspection.
- **Why deferred**: Step 9.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: All admin stubs, `ADMIN_PANEL_SPEC.md`
- **Recommended step**: Step 9
- **Status**: DEFERRED

### ADM-02: Audit logs table
- **Area**: Admin
- **Description**: `audit_logs` and `runtime_failure_records` tables from DATA_MODEL_AND_STORAGE.md Domain 8 not created. Sensitive actions are not tracked.
- **Why deferred**: Step 9.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` Domain 8, `TEAM_GOVERNANCE_AND_PERMISSIONS.md`
- **Recommended step**: Step 9
- **Status**: DEFERRED

### ADM-03: require_admin() real DB check
- **Area**: Governance
- **Description**: `require_admin()` in `guards.py` delegates to `require_user()`. No `platform_admin` role check from DB. Any authenticated user passes the admin guard.
- **Why deferred**: Admin panel not started.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Limitation
- **Related files**: `auth/guards.py`
- **Recommended step**: Step 9
- **Status**: DEFERRED

### ADM-04: Team management API
- **Area**: Governance
- **Description**: `api/team.py` is a stub. No member invite, role change, workspace management, or team visibility endpoints.
- **Why deferred**: Step 10.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `api/team.py` (stub), `TEAM_GOVERNANCE_AND_PERMISSIONS.md`
- **Recommended step**: Step 10
- **Status**: DEFERRED

---

## Frontend UI

### FE-01: All workspace pages
- **Area**: Frontend
- **Description**: 15 app pages are placeholder stubs (overview, sim/new, sim/[id], simulations, reports, compare, audiences, agents, knowledge, graph, billing, integrations, team, settings). These are the core product UI.
- **Why deferred**: Step 11. Backend pipeline was prioritized.
- **Dependencies**: Backend APIs (mostly implemented)
- **Priority**: HIGH
- **Type**: Missing feature
- **Related files**: `frontend/app/(app)/**`
- **Recommended step**: Step 11
- **Status**: DEFERRED

### FE-02: All admin pages
- **Area**: Frontend
- **Description**: 11 admin pages are placeholder stubs.
- **Why deferred**: Admin backend not implemented (Step 9).
- **Dependencies**: ADM-01
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `frontend/app/(admin)/**`
- **Recommended step**: Step 11 (after Step 9)
- **Status**: BLOCKED

### FE-03: All component files
- **Area**: Frontend
- **Description**: ~40 component files are stubs (canvas modes, simulation forms, report sections, agent cards, audience builders, etc.).
- **Why deferred**: Step 11.
- **Dependencies**: FE-01
- **Priority**: HIGH
- **Type**: Missing feature
- **Related files**: `frontend/components/**`
- **Recommended step**: Step 11
- **Status**: DEFERRED

### FE-04: Frontend admin route blocking
- **Area**: Frontend
- **Description**: Middleware does not block non-admin users from `/admin/*` routes. Any authenticated user can see the admin UI shell. Relies on backend 403 for data access.
- **Why deferred**: Admin backend not implemented.
- **Dependencies**: ADM-03
- **Priority**: LOW
- **Type**: Limitation
- **Related files**: `frontend/middleware.ts`
- **Recommended step**: Step 9
- **Status**: DEFERRED

---

## Streaming / Infrastructure

### INF-01: Stream adapter (push-based)
- **Area**: Streaming
- **Description**: `stream_adapter.py` contains a `StreamManager` with pub/sub queues but is not wired into any active code path. SSE uses 2s polling instead. The adapter is documented as DEFERRED with explicit activation criteria.
- **Why deferred**: Polling is adequate for current scale. Wiring requires OASIS worker to dual-write events to both SQLite and in-memory bus.
- **Dependencies**: OASIS worker modification
- **Priority**: LOW
- **Type**: Architecture follow-up
- **Related files**: `adapters/stream_adapter.py`
- **Recommended step**: Production optimization step
- **Status**: DEFERRED

### INF-02: Object storage adapter
- **Area**: Infrastructure
- **Description**: `adapters/storage_adapter.py` is a stub. No file upload to Supabase Storage, S3, or R2. Needed for source files, report exports, canvas snapshots.
- **Why deferred**: No file-based features implemented yet.
- **Dependencies**: KS-01
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `adapters/storage_adapter.py` (stub)
- **Recommended step**: Knowledge step
- **Status**: DEFERRED

### INF-03: Semantic search adapter
- **Area**: Infrastructure
- **Description**: `adapters/search_adapter.py` is a stub. pgvector extension is enabled in Supabase but not used. Needed for report chat retrieval, evidence search, memory retrieval.
- **Why deferred**: No search-dependent features implemented yet.
- **Dependencies**: pgvector (enabled), embedding model
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `adapters/search_adapter.py` (stub)
- **Recommended step**: Report chat or memory step
- **Status**: DEFERRED

---

## Data Model Gaps

### DM-01: Simulation events index
- **Area**: Data Model
- **Description**: `simulation_events_index` table from DATA_MODEL_AND_STORAGE.md section 9 not created. This would be a normalized product-level event index for fast retrieval and replay.
- **Why deferred**: Events are currently read directly from OASIS SQLite via event_bridge.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Missing feature
- **Recommended step**: Replay/analytics step
- **Status**: DEFERRED

### DM-02: Simulation bookmarks
- **Area**: Data Model
- **Description**: `simulation_bookmarks` table from DATA_MODEL_AND_STORAGE.md section 10 not created. User annotations/bookmarks on events.
- **Why deferred**: Frontend not implemented.
- **Dependencies**: FE-01
- **Priority**: LOW
- **Type**: Missing feature
- **Recommended step**: Step 11
- **Status**: DEFERRED

---

## Priority Summary

### HIGH priority items
1. ~~**BIL-01**: Credit settlement~~ ✅ DONE
2. **BIL-03**: Billing service + API (Step 8 — now READY)
3. **MEM-01**: Memory domain tables
4. **MEM-02**: Post-run memory transformation
5. **RT-01**: ARQ background worker
6. **FE-01**: Workspace pages
7. **FE-03**: Component files

### MEDIUM priority items
8. **RT-02**: Interview bridge
9. **RP-01**: Report evidence links
10. **RP-02**: Report chat
11. **RP-04**: NLP sentiment analysis
12. **POP-01**: Per-segment stance assignment
13. **POP-03**: Agent Atlas API
14. **KS-01**: Knowledge domain tables
15. **KS-02**: File upload
16. **BIL-02**: Full credit formula
17. **BIL-04**: Subscriptions table
18. **ADM-01**: Admin panel API
19. **ADM-02**: Audit logs
20. **ADM-03**: require_admin() real check
21. **ADM-04**: Team management API
22. **INF-02**: Object storage adapter

### LOW priority items
23-33: RT-03, RT-04, RT-05, RP-03, RP-05, POP-02, POP-04, BIL-05, FE-02, FE-04, INF-01, INF-03, DM-01, DM-02
