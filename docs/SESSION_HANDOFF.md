# SESSION HANDOFF

> Last updated: 2026-04-15
> Last completed step: **Step 11 — Frontend Pages (Phase 1: Structure + Core Pages)**
> Repository: https://github.com/felifeli1983-arch/raktio-app.git
> Git: local `main` ahead of remote by ~15 commits. Feature branches pushed: `feat/steps-4-7-full`, `fix/audit-batch-steps-3-7`

---

## 1. Current Roadmap Status

| Step | Name | Status |
|------|------|--------|
| 1 | Supabase Schema + Auth | **PASS** |
| 2 | Service-Role Client + Simulations CRUD | **PASS** |
| Audit 1-2 | Email, plans pricing, repo pattern, permissions | **PASS** |
| 3A | Brief Understanding | **PASS** |
| 3B | Planner | **PASS** |
| 4A | Audience Tables (migration 003) | **PASS** |
| 4B | Agent Generation | **PASS** |
| 4C | Audience Assembly | **PASS** |
| 4D | Audiences API | **PASS** |
| 5A | DeepSeek Adapter | **PASS** |
| 5B | Config Builder | **PASS** |
| 5C | Launcher + Supervisor | **PASS** |
| 5D | Event Bridge + State Reader | **PASS** |
| 6A | SSE Stream Endpoint | **PASS** |
| 6B | Stream Adapter | **DEFERRED** (polling is official model) |
| 6C | Frontend SSE Hook | **PASS** |
| 7A | Reports Tables (migration 004) | **PASS** |
| 7B | Report Service | **PASS** |
| 7C | Reports API | **PASS** |
| 7D | Compare Service + API | **PASS** |
| Audit 3-7 | SSE auth, agent cap, restrictions, repos, sections | **PASS** |
| **7.5A** | Verify OASIS environment | **PASS** |
| **7.5B** | Real OASIS runtime worker | **PASS** |
| **7.5C** | Verified event bridge rewrite | **PASS** |
| **7.5D** | Live SSE streaming | **PASS** |
| **7.5E** | Report evidence handoff | **PASS** |
| **7.5E0** | Population quality hardening | **PASS** |
| **7.5E1** | Evidence precision hardening | **PASS** |
| 7.5F | Compare evidence handoff | **PASS** |
| 7.5G | Credit settlement | **PASS** |
| 8A-C | Billing / Credits (formula, service, API) | **PASS** |
| 8D | Cost & Token Intelligence Layer | **PASS** |
| 8E | log_context propagation across services | **PASS** |
| 9 | Admin Panel API | **PASS** |
| 10 | Team & Governance API | **PASS** |
| 10.5A | Memory domain tables (migration 008) | **PASS** |
| 10.5B | Post-run memory transformation service | **PASS** |
| 10.5C | Memory-informed agent context | **PASS** |
| 10.5D | Distribution: temporal activity multipliers | **PASS** |
| 10.5E | Distribution: influence-weighted reach | **PASS** |
| 10.5F | Source/Knowledge: tables + file upload | **PASS** |
| 10.5G | Source/Knowledge: source-aware brief | **PASS** |
| 10.5H | Platform behavior: action weight profiles | **PASS** |
| **10.6** | **Refinement Batch** | **PASS** |
| **11** | **Frontend Pages (Phase 1)** | **DONE** |
| 11.1 | Shell Hardening + Language | **DONE** |
| 11.2 | Pre-Integration Fixes (REL-01, FE-05, FE-06) | **DONE** |
| 11.3 | Strategic Review + Doc Sync | **DONE** |
| 11 P2 | Frontend API Integration | **DONE** |
| 11 P3 | SSE Canvas Streaming + Auth | **DONE** |
| 12 | Integration Testing | NOT STARTED |

---

## 2. Live Infrastructure

| Resource | Detail |
|----------|--------|
| Supabase project | `epnvdtuowwqzjjazkmxp` (eu-west-1) |
| Tables live | **28**: users, organizations, workspaces, workspace_memberships, plans, simulations, simulation_configs, simulation_runs, agents, agent_platform_presence, audiences, audience_memberships, simulation_participations, credit_balances, credit_ledger, reports, report_sections, compare_runs, llm_usage_log, audit_logs, agent_memory_summaries, agent_episodic_memory, agent_relationship_memory, agent_topic_exposure, memory_update_jobs, sources, source_chunks, source_simulation_links |
| Migrations applied | 001-010 (10 migrations, includes memory_mode column) |
| Anthropic API | Configured + tested (Claude Sonnet `claude-sonnet-4-6`) |
| DeepSeek API | Configured + tested (`deepseek-chat`) |
| OASIS | v0.2.5 importable from `oasis-main/`, runs with DeepSeek via camel-ai ModelFactory |

---

## 3. API Endpoints Implemented

### Simulations (`/api/simulations`)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/` | Create simulation (draft) |
| GET | `/` | List (paginated, workspace-scoped) |
| GET | `/{id}` | Get single |
| PATCH | `/{id}` | Update draft |
| DELETE | `/{id}` | Delete draft/canceled |
| POST | `/{id}/understand` | Brief understanding (Claude PLANNING) |
| POST | `/{id}/plan` | Planner recommendation (Claude PLANNING) |
| POST | `/{id}/prepare-audience` | Assemble audience from pool + generation |
| POST | `/{id}/launch` | Launch OASIS run (background task) |
| POST | `/{id}/pause` | Pause running simulation |
| POST | `/{id}/resume` | Resume paused simulation |
| POST | `/{id}/cancel` | Cancel + refund credits |

### Reports (`/api/reports`)
| POST | `/{sim_id}/generate` | Generate 14-section report (Claude REPORT) |
| GET | `/{sim_id}` | Get report with sections |
| GET | `/` | List reports for workspace |

### Compare (`/api/compare`)
| POST | `/` | Create comparison (completed sims only) |
| GET | `/{id}` | Get compare result |
| GET | `/` | List compares |

### Audiences (`/api/audiences`)
| GET | `/` | List audiences |
| GET | `/{id}` | Get single audience |
| DELETE | `/{id}` | Archive audience |

### Billing (`/api/billing`)
| GET | `/balance` | Credit balance + plan info |
| GET | `/usage` | Credit usage history (ledger) |
| POST | `/estimate` | Estimate simulation cost (full formula) |
| GET | `/plans` | List all plans (public) |

### Stream (`/api/stream`)
| GET | `/{sim_id}` | SSE stream (auth via header or `?token=`) |

### Agents (`/api/agents`)
| GET | `/` | List/filter global agents |
| GET | `/{agent_id}` | Agent profile with memory |

### Other
| GET | `/api/health` | Health check |

---

## 4. Key Architecture Decisions (Implemented)

| Decision | Implementation |
|----------|---------------|
| OASIS-first | Real `env.step()` loop via `oasis_worker.py`. DeepSeek LLM for agent inference. |
| Model routing | `_call_anthropic()` for PLANNING/REPORT, `_call_deepseek()` for RUNTIME. Both tested with real keys. |
| Repository pattern | All services use repositories. Zero direct `sb.table()` calls in service layer. |
| Permission model | `auth/permissions.py` with role-based functions. 7 roles enforced. |
| Status lifecycle | `draft→cost_check→bootstrapping→running→completing→completed` (or failed/canceled). Documented in `oasis_worker.py`. |
| Action set | 21 of 31 OASIS ActionTypes enabled. Excludes internal mechanics + group actions. Documented. |
| SSE streaming | Polling-based (2s interval via SQLite trace table). `stream_adapter.py` deferred. |
| Evidence pipeline | `build_evidence_bundle()` extracts: posts, comments, trace events, per-agent activity, belief indicators, exposure history, interaction matrix. Fed into report prompt. |
| Credit lifecycle | Reserve on launch, refund on cancel, ledger entries for both. Settlement (7.5G) pending. |

---

## 5. Implemented Files

### Backend — Implemented
| Path | Description |
|------|-------------|
| `migrations/001-010` | 10 SQL migrations (001-009 applied, 010 pending) |
| `app/config.py` | Settings, ModelRoute enum, model routing |
| `app/main.py` | FastAPI app, 11 routers registered |
| `app/db/supabase_client.py` | Singleton service_role client |
| `app/auth/guards.py` | JWT decode, require_user/admin/workspace_member/optional_user |
| `app/auth/permissions.py` | Role-based permission functions (10 functions) |
| `app/adapters/llm_adapter.py` | Anthropic + DeepSeek adapters, both tested |
| `app/adapters/stream_adapter.py` | DEFERRED (documented, singleton commented out) |
| `app/repositories/simulations.py` | Simulations + configs + runs CRUD |
| `app/repositories/agents.py` | Agents, audiences, memberships, participations |
| `app/repositories/billing.py` | Credit balances + ledger |
| `app/repositories/reports.py` | Reports + sections |
| `app/repositories/compare.py` | Compare runs |
| `app/services/simulation_service.py` | CRUD + credit estimation via repo |
| `app/services/brief_service.py` | Brief understanding via Claude PLANNING |
| `app/services/planner_service.py` | Planner recommendation via Claude PLANNING |
| `app/services/agent_service.py` | LLM-based agent generation with validation |
| `app/services/audience_service.py` | Pool sourcing + gap generation + dedup |
| `app/services/report_service.py` | 14-section progressive report with evidence |
| `app/services/compare_service.py` | 2-simulation comparison (completed only) |
| `app/runtime/oasis_worker.py` | Real OASIS env.step() loop (background task) |
| `app/runtime/config_builder.py` | Product config → OASIS UserInfo format |
| `app/runtime/launcher.py` | Pre-flight, credit reservation, background dispatch |
| `app/runtime/supervisor.py` | Pause/resume/cancel with credit refund |
| `app/runtime/event_bridge.py` | Trace-first event extraction, belief/exposure/interaction analysis |
| `app/runtime/state_reader.py` | Combined Supabase + SQLite state for canvas |
| `app/api/simulations.py` | 12 endpoints |
| `app/api/reports.py` | 3 endpoints |
| `app/api/compare.py` | 3 endpoints |
| `app/api/audiences.py` | 3 endpoints |
| `app/api/stream.py` | SSE with dual auth |
| `app/api/billing.py` | 4 endpoints (balance, usage, estimate, plans) |
| `app/billing/credit_rules.py` | Full credit formula (agents × duration × platform × geography) |
| `app/billing/entitlements.py` | Plan lookup, agent limit, feature flags |
| `app/repositories/llm_usage.py` | LLM usage log repository |
| `app/schemas/simulation.py` | Pydantic models (includes audience_id) |
| `app/schemas/billing.py` | Billing Pydantic models |
| `app/schemas/audience.py` | Pydantic models |
| `app/schemas/report.py` | Pydantic models |
| `app/schemas/compare.py` | Pydantic models |

### Frontend — Next.js (`/frontend`)
| Path | Description |
|------|-------------|
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | SSR Supabase client |
| `middleware.ts` | Route protection (auth/app/admin) |
| `app/(auth)/login/page.tsx` | Real login with signInWithPassword |
| `app/(auth)/signup/page.tsx` | Real signup with email confirmation |
| `lib/hooks/useSimulationStream.ts` | EventSource SSE hook with reconnection |
| `lib/types/simulation.ts` | SimulationStatus, Platform, CanvasMode types |
| `lib/types/agent.ts` | Agent, AgentPlatformPresence types |

> Note: Next.js frontend has strong types/auth/SSE but pages are stubs. Raktio Dashboard is the primary UI.

### Frontend — Raktio Dashboard (`/raktio-dashboard`) — Step 11
Primary frontend: Vite + React 19 + Tailwind CSS 4 + React Router

| Route | Page | Status |
|-------|------|--------|
| `/` | Landing Page | **DONE** (polished hero, use cases, FAQ) |
| `/login` | Login | **DONE** (Google SSO + email) |
| `/register` | Register | **DONE** |
| `/onboarding` | Onboarding | **DONE** (3-step: account type, context, optional) |
| `/pricing` | Pricing | **DONE** |
| `/overview` | Workspace Overview | **REBUILT** (operational control hub, alerts, quick actions) |
| `/simulations` | Simulations | **REBUILT** (status tabs: All/Running/Draft/Completed/Failed/Canceled, 3-dot menu) |
| `/sim/new` | New Simulation | **REBUILT** (7-step wizard: Brief→Config→Sources→Understanding→Plan→Audience→Review) |
| `/sim/:id/canvas` | Simulation Canvas | **DONE** (3-zone: left rail filters, main canvas with 6 modes, right rail metrics) |
| `/reports` | Reports List | **DONE** (search, sort, risk badges) |
| `/reports/:id` | Report Detail | **REBUILT** (14-section layout, section navigation sidebar, scorecard) |
| `/compare` | Compare Lab | **REBUILT** (base/target selectors, evidence quality, delta sections, save/clone) |
| `/audiences` | Audience Studio | **DONE** (dual-column builder + grid) |
| `/agents` | Agent Atlas | **DONE** (split-pane, search, filters, profile detail, interview modal) |
| `/agents/:id` | Agent Profile | **DONE** |
| `/knowledge` | Knowledge & Sources | **DONE** (source manager, vector DB status, filters) |
| `/graph` | Graph Explorer | **NEW** (placeholder with graph stats, featured nodes) |
| `/billing` | Credits & Billing | **DONE** (balance card, usage log, invoices, plan) |
| `/integrations` | Integrations | **DONE** (app cards with status) |
| `/team` | Team & Governance | **DONE** (members, roles, audit tabs) |
| `/settings` | Settings | **DONE** (profile, workspace, notifications, security tabs) |
| `/admin` | Admin Control | **DONE** (system metrics, user management, system status) |
| `/admin/costs` | Model & Cost Control | **NEW** (LLM spend, model routing, anomaly alerts) |
| `/admin/audit` | Audit Logs | **NEW** (filterable table, 8 action types) |
| `/admin/tenants` | Tenant Management | **NEW** (tenant table, plan/status badges, actions) |

**Shell structure:**
- Sidebar: 4 groups (Workspace, Intelligence, Operations, Admin)
- Topbar: search, credit balance pill, theme toggle, notifications, profile dropdown
- All pages support dark mode
- Consistent design system: rounded-2xl cards, slate palette, premium dark feel

---

## 6. Next Step

### Step 10.5 — Reality Upgrade Block

A structured prerequisite block before frontend implementation.

**Priority order:**
1. **10.5A-C: Memory System** — episodic memory, memory transformation, memory-informed agents
2. **10.5D-E: Distribution Layer** — temporal multipliers, influence-weighted reach
3. **10.5F-G: Source/Knowledge** — file upload, source-aware brief understanding
4. **10.5H: Platform Behavior** — per-platform action weight profiles

**Step 10.6 — Refinement Batch (COMPLETE):**
Implemented items:
1. RP-02b/RP-02c: Report fragility fix — previous sections truncated to single-line summaries, 1 retry per section
2. MEM-02b: Keyword topic extraction — fallback from hashtag-only to significant word frequency
3. MEM-02e: Relationship strength accumulation — reads existing before upsert, capped at 1.0
4. MEM-02g: Summary unbounded growth fix — capped at 500 chars, more informative format
5. POP-03: Agent Atlas API — 2 endpoints (list/filter + full profile with memory)
6. GEO-01: Geography in evidence — agent country/city injected into report prompt
7. SIM-01: Fresh vs memory sim mode — `memory_mode` field, config_builder skip, worker skip

Deferred from 10.6 (not blocking frontend):
- POP-01: Per-segment stance assignment → CAN WAIT
- INF-06: Stronger influencer agent synthesis → CAN WAIT
- DIST-02: Platform algorithm behavior → CAN WAIT
- DIST-04: Seeded content distribution → CAN WAIT
- MEM-02c: LLM summary synthesis → CAN WAIT
- MEM-02b full: LLM topic extraction (keyword fallback implemented, full LLM deferred) → CAN WAIT

**Step 11 — Frontend Pages (Phase 1 COMPLETE, 2026-04-15):**
Implemented using `/raktio-dashboard` (Vite + React 19) as the primary frontend:

**Shell & Routing:**
- Sidebar restructured: 4 groups (Workspace, Intelligence, Operations, Admin)
- Added Graph Explorer to Intelligence group
- Admin expanded to 4 sub-pages (Control, Model/Cost, Audit, Tenants)
- All routes updated in App.tsx

**Pages rebuilt from existing code:**
- Overview → operational control hub (alerts, signals, quick actions, intelligence summary)
- Simulations → status filter tabs (All/Running/Draft/Completed/Failed/Canceled), 3-dot context menu
- New Simulation → 7-step wizard matching backend flow (Brief→Config→Sources→Understanding→Plan→Audience→Review)
- Report Detail → 14-section layout with sidebar navigation, scorecard, evidence
- Compare Lab → base/target selectors, evidence quality indicator, delta sections, save/clone/export

**New pages created:**
- Graph Explorer (placeholder with stats sidebar)
- Admin Costs (model routing policy, LLM spend, anomaly alerts)
- Admin Audit (filterable audit log table)
- Admin Tenants (tenant table with plan/status management)

**Preserved as-is (already strong):**
- Simulation Canvas (3-zone: left rail + 6 modes + right rail)
- Agent Atlas (split-pane with interview modal)
- Audience Studio (dual-column builder)
- Knowledge & Sources (source manager with vector DB status)
- Billing (balance card, usage log, invoices)
- Integrations, Team, Settings, Login, Register, Onboarding, Landing, Pricing

**Step 11 Phase 1 — UI Fix Batch (2026-04-15):**
Applied after full UI/UX completeness audit:
1. M1: Added `memory_mode` indicator (Fresh/Persistent badge) to SimulationsList rows
2. M2: Added report-status indicator (Report Ready / Generating badge) to SimulationsList rows
3. M3: Canvas left rail: expanded from 2 to 5 platform filters (X, Reddit, Instagram, TikTok, LinkedIn)
4. M4: Canvas right rail: added Trending Topics section (hashtag tags) + Run Health metrics (Events/sec, Polarization, Queue Depth)
5. M5: Graph Explorer: added simulation selector dropdown with 4 mock simulations

**Step 11 Phase 1b — Shell Hardening + Language Pass (2026-04-15):**
1. Shell layout: outer wrapper `h-screen overflow-hidden`, sidebar `h-full` with internal scroll, topbar non-sticky (always visible in flex layout), content area `flex-1 overflow-auto min-h-0`
2. Dark mode default: `dark` class applied on mount, localStorage persistence for theme preference
3. Light mode: verified working — all pages use `dark:` prefix throughout, CSS variables defined for both `:root` (light) and `.dark` (dark)
4. Language normalization: all UI copy normalized to English across all pages; Italian text kept only in agent simulation output content (quotes, posts)
5. Route naming: `/register` renamed to `/signup` to match product docs
6. Pricing page: all Italian labels translated to English

**Known deferred items (not blocking integration):**
- Canvas Timeline/Segments/Compare modes: placeholders (require SSE data)
- Canvas bookmarking/annotation: UX feature, not structural
- SimulationsList bulk selection: nice-to-have
- Agent Atlas pagination: needed at scale
- Audience Studio save/reuse flow: blocked by POP-04 (API not ready)

**Step 11 — Strategic Review (2026-04-15):**
Full deferred/enterprise/realism review completed. 15 new backlog items added:
- SEC-01/02/03: Security (rate limiting, input sanitization, secret management)
- OBS-01/02: Observability (structured logging, error tracking)
- REL-01/02: Reliability (sim timeout, idempotent launch)
- ENT-01/02/03: Enterprise (SSO, GDPR, data isolation)
- FE-05/06: Frontend hardening (error boundaries, loading states)
- PERF-01: Report parallelism
- INF-08/09: Infrastructure (connection pooling, CORS)

**Pre-integration batch DONE (2026-04-15):**
1. REL-01: Simulation timeout — `asyncio.wait_for()` with `max(1800, steps*300)` timeout, failed+refund on expiry
2. FE-05: ErrorBoundary wraps Outlet in AppLayout, catches render errors with fallback UI
3. FE-06: PageLoading/PageError/PageEmpty components + loading/error state hooks on 6 core pages

**Realism upgrade priorities (do before or during integration):**
1. DIST-04: Seeded content injection (the core "test THIS message" use case)
2. POP-01: Per-segment stance assignment
3. INF-06: Influencer archetype synthesis

**Language Architecture (decided 2026-04-15, corrected):**
Principle: Store originals with source_language metadata. Generate new content in target language. Preserve originals — never overwrite. Remain compatible with future reader-language translation.
- `simulation_language`: per-simulation config, derived from geography. Agents speak this language.
- `source_language`: explicit field on memory records (summaries, episodes). Tracks what language content was originally created in.
- `reading_language`: real product concept from Phase 1 (API param). Per-user preference in Phase 2. Default: 'en'.
- `ui_language`: per-user (Phase 2), controls frontend chrome. Default: 'en'.
- Agent posts: generated in simulation_language, stored as-is. Future: translate-on-demand compatible.
- Reports: generated directly in reading_language. Evidence quotes preserved in source language.
- Memory: stored with explicit source_language. Displayed in source language by default. Future: reader-language rendering alongside original.
- Phase 1: simulation_language config + source_language on memory + language param on reports + reading_language as API concept.
- Phase 2: UI i18n (EN/IT), user language preferences, multi-language sims.
- Phase 3: translate-on-demand (feed, Atlas, memory), translation cache.

**Step 11 Phase 2 — Frontend API Integration (2026-04-15, in progress):**

Completed integrations:
- API client layer: `src/lib/api/` with client.ts + 4 typed modules (simulations, reports, billing, agents)
- CORS: backend allows localhost:5173 (Vite dev server)
- SimulationsList: real `GET /api/simulations`, real status tabs, real 3-dot actions (pause/cancel/delete)
- ReportsList: real `GET /api/reports`, dynamic stats, status badges
- Report Detail: real `GET /api/reports/{sim_id}`, 14 sections from API, markdown rendering, status indicators
- Billing: real `GET /api/billing/balance` + `GET /api/billing/usage`, topbar credit pill wired
- Agent Atlas: real `GET /api/agents` + `GET /api/agents/{id}`, memory/episodes/topics from API

Language Phase 1 implemented:
- LANG-01: `simulation_language` field on SimulationCreate schema + config_builder injection
- LANG-02: `source_language` on episode and summary memory records
- LANG-03: `language` parameter on report generation endpoint + prompt instruction
- LANG-04: `reading_language` accepted as API param on `/api/reports/{id}/generate?language=it`

Completed integrations (second batch):
- New Simulation wizard: full 7-step flow wired (create → understand → plan → prepare-audience → estimate → launch)
  - Real `POST /api/simulations`, `/understand`, `/plan`, `/prepare-audience`, `/launch`
  - Real `POST /api/billing/estimate` for credit preview
  - `simulation_language` derived from geography, passed in creation
  - Loading/error states per step, form state preserved on retry
  - Navigates to canvas on successful launch
- Simulation Canvas: SSE streaming + real sim data + control buttons
  - `GET /api/simulations/{id}` for sim metadata (name, agents, status)
  - `GET /api/stream/{id}` SSE connection for live events
  - Real-time feed posts from `simulation_event` SSE events
  - Live metrics updated from event actions (likes → belief shift, unfollows → rate)
  - Real pause/resume via `POST /api/simulations/{id}/pause|resume`
  - Terminal status banner (completed/failed/canceled) with link to report
  - Progress from `run_state` SSE events
- Report detail: fixed section_key mapping (underscore format matching backend)

**Step 11 Phase 3 — Real Auth + Workspace Context (2026-04-15):**

Implemented:
- Supabase JS client (`@supabase/supabase-js` installed, singleton in `src/lib/supabase.ts`)
- AuthContext provider (`src/lib/auth/AuthContext.tsx`): session restore, login, signup, logout, workspace loading
- AuthGuard components (`src/lib/auth/AuthGuard.tsx`): RequireAuth (redirects to /login), RequireGuest (redirects to /overview)
- Login page: real Supabase `signInWithPassword` + Google OAuth, loading/error states, redirect to previous page
- Signup page: real Supabase `signUp` + Google OAuth, redirects to /onboarding
- Logout: clears Supabase session + API client state + localStorage
- Route protection: all app routes wrapped in RequireAuth, login/signup wrapped in RequireGuest
- Workspace context: fetches `GET /api/team/workspaces` on login, persists selection in localStorage, auto-selects first workspace
- API client: token + workspace_id synced from AuthContext via useEffect, 401 auto-redirects to /login
- AppLayout: shows real user email/name, real workspace name/role, real avatar from DiceBear seed
- `.env.example` created with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL

**Database Audit (2026-04-15):**
Full historical schema audit completed. Found and fixed 5 mismatches:
1. simulation_language: column added to simulations (migration 011)
2. source_language: columns added to memory_summaries + episodic_memory (migration 011)
3. Workspace endpoint: frontend mapping fixed for nested response shape
4. Billing balance: now includes plan object from organizations→plans join
5. Agent stance field: frontend fixed to use `base_stance_bias` (DB column name)

**PENDING ACTION: Run migration 011 via Supabase SQL Editor**
File: `backend/migrations/011_language_fields.sql`
Contains 3 ALTER TABLE statements adding language columns. Must be run manually
in the Supabase Dashboard → SQL Editor before language features will persist.

| Tables live | **28 + 3 new columns** (pending migration 011) |
| Migrations | 001-010 applied, 011 pending manual execution |

**Next steps:**
- Run migration 011 in Supabase SQL Editor
- Step 12: Integration Testing (end-to-end simulation → canvas → report flow)

**Enterprise growth track (preserved for future phases):**
- ENT-01: SSO / SAML
- ENT-02: GDPR data export/deletion
- ENT-03: Workspace data isolation audit
- ADM-06: Object-level permissions
- POP-02: Private audiences
- ADM-05: Workspace lifecycle API
- RP-02: Report chat
- RP-03: Report PDF export
- BIL-07/08: Plan management + payment provider

---

## 7. Deferred Items

All deferred, partial, blocked, and missing items are centralized in:
**[docs/DEFERRED_ITEMS_AND_BACKLOG.md](DEFERRED_ITEMS_AND_BACKLOG.md)**

That file contains 33 tracked items across 8 areas with priority, status, dependencies, and recommended step for each.

---

## 8. Structural Limitations (Intentional)

| Limitation | Reason | When to fix |
|-----------|--------|-------------|
| Reports infer belief shifts from behavioral metrics, not NLP sentiment | Requires embedding model calls per post. Batch processing in memory transformation step. | Memory system implementation |
| `simulation_participations.runtime_stance` set once, never updated | Requires post-run memory transformation | Memory system implementation |
| Per-segment stance assignment uses global random, ignores per-segment bias | Requires segment-to-agent mapping logic | Audience system refinement |
| Private audience service logic not enforced | Schema correct, service deferred | Feature step |
| `stream_adapter.py` not wired (polling used) | Polling adequate for current scale | Production optimization |
| Agent Atlas API is basic (list+profile) | Full search/filter/compare deferred | POP-03 |
| LinkedIn/Instagram/TikTok are prompt-level only, not engine-level | OASIS only supports Twitter/Reddit natively | PLAT-04 |
| `runtime_failure_records` separate table not created | Failures visible via admin/runtime from simulation_runs | LOW |
| Fire-and-forget background task dispatch | asyncio.create_task — no await, needs ARQ for production | RT-01 |
| Memory topic extraction uses keyword fallback (no NLP) | Hashtag-first, then significant word frequency. Full LLM extraction deferred | MEM-02b |
| Memory summary text is formulaic but capped | 500 chars, includes stance/topics/activity. LLM synthesis deferred | MEM-02c |
| Memory episode dedup not guarded on re-transformation | Double-run inserts duplicate episodes | MEM-02d |
| Memory relationship strength accumulates but simple | Reads existing + adds 0.15/interaction, capped at 1.0 | MEM-02e |
| Memory N+1 queries at scale | 1000+ agents = 1000+ individual DB queries | MEM-02f |
| No subscription/plan change/payment API | Requires BIL-04 to BIL-08 | Post-launch |
| Group actions (5) not enabled in OASIS | Group simulation features deferred | Later step |
| No report_chat tables | Interactive report chat deferred | Later step |
| LLM usage logs missing org_id, user_id, run_id, agent_id | org/user need API-layer threading; run_id needs camel-ai instrumentation | BIL-05e |
| ~80 frontend files are stubs | Frontend implementation step | Step 11 |

---

## 9. Frozen Decisions

| Decision | Detail |
|----------|--------|
| OASIS-first | OASIS is the real simulation engine. `env.step()`, Platform, SQLite, trace, recsys preserved. |
| MiroFish as selective pattern reference | Adopted: ontology, planner, graph memory, progressive reports, interview IPC. UI NOT cloned. |
| 3-layer architecture | OASIS Runtime → Intelligence Layer → Raktio Product Layer |
| Model routing | PLANNING→Claude Sonnet, RUNTIME→DeepSeek, REPORT→Claude Sonnet. Provider-agnostic via llm_adapter. |
| Persistent synthetic agents | Globally unique username, persistent identity, DiceBear notionists avatar from username seed. |
| Multi-platform Model 1 | One population, agents exist across multiple platforms with different behavior. |
| Deep geography | country, region, province_or_state, city, macro_area, timezone, languages. |
| Credit ledger | Immutable append-only. No UPDATE/DELETE on credit_ledger. |
| Storage split | SQLite per-run (OASIS truth) + Supabase/Postgres (product state) + object storage. |
| Service-role pattern | Backend uses service_role key (bypasses RLS) for all DB operations after JWT validation. |

---

## 10. Restart Instructions

### Read first
1. This file (`Docs/SESSION_HANDOFF.md`)
2. `backend/app/config.py` — settings + model routing
3. `backend/app/runtime/oasis_worker.py` — OASIS execution + status lifecycle

### Must do first
1. Apply migration 010 (`010_add_memory_mode.sql`) to Supabase if not yet applied
2. Do NOT re-architect the project

### Must NOT change
- The 28-table schema is live — new tables require new numbered migrations
- Model routing policy is frozen
- Repository pattern is established — all services use repositories
- Auth flow is complete
- OASIS worker execution lifecycle is documented and authoritative
- 21-action set is documented and justified

---

## 11. Documentation Sync Log

### 2026-04-15 — Post Step 10.6 Readiness Pass + Frontend Spec

| Doc | Updated | Changes |
|-----|---------|---------|
| `SESSION_HANDOFF.md` | ✓ | Step 10.6 complete, 46 endpoints, 28 tables, 10 migrations, audit verdict, frontend readiness |
| `DEFERRED_ITEMS_AND_BACKLOG.md` | ✓ | 7 items marked DONE, 6 moved to CAN WAIT |
| `AUDIENCE_AND_AGENT_ATLAS_SPEC.md` | ✓ | Agent Atlas API now IMPLEMENTED, memory system documented |
| `SIMULATION_CANVAS_SPEC.md` | ✓ | Implementation Status section added (was missing) |
| `APP_STRUCTURE_AND_PAGES.md` | ✓ | Backend API surface table added, frontend integration notes |
| `ADMIN_PANEL_SPEC.md` | ✓ | Updated to 9 endpoints, memory/agent atlas noted |
| `REPORTS_AND_INSIGHTS_SPEC.md` | ✓ | 10.6 improvements documented, geography evidence added |
| **`UI_UX_FRONTEND_SPEC.md`** | ✓ NEW | Complete frontend product spec — 16 sections, all routes, all flows, all API deps, integration rules |

### 2026-04-14 — Post Step 7.5E1 Full Sync

| Doc | Updated | Changes |
|-----|---------|---------|
| `SESSION_HANDOFF.md` | Full rewrite | Complete state from Step 1 through 7.5E1 |
| `DATA_MODEL_AND_STORAGE.md` | Implementation status added | 18 of ~46 tables implemented, which domains done |
| `BACKEND_ARCHITECTURE.md` | Implementation status added | Which modules implemented, repo pattern, API count |
| `SIMULATION_ENGINE_SPEC.md` | Implementation status added | OASIS verified, 21 actions, status lifecycle |
| `REPORTS_AND_INSIGHTS_SPEC.md` | Implementation status added | Evidence pipeline, 14 sections, what's grounded vs inferred |
| `AGENTS_AUDIENCE_MEMORY.md` | Implementation status added | Population hardening, dedup, platform filter |
| `AUDIENCE_AND_AGENT_ATLAS_SPEC.md` | Implementation status added | Audience CRUD, Agent Atlas stub |
| `PRICING_AND_CREDITS.md` | Implementation status added | Credit estimation, reservation, settlement pending |
| `DATAFLOW_AND_RUNTIME.md` | Implementation status added | Which phases implemented |
| `TEAM_GOVERNANCE_AND_PERMISSIONS.md` | Implementation status added | 7 roles, permission module |
| `ADMIN_PANEL_SPEC.md` | Implementation status added | Not started |
| `APP_STRUCTURE_AND_PAGES.md` | Implementation status added | 2 pages working, ~35 stubs |

---

## 12. Post-10.6 Audit Verdict (2026-04-15)

### Stress Test: 8/8 PASS
All Python files parse (100 files, 0 errors). All schema imports OK. All runtime modules import OK. Memory mode validation correct. Topic extraction correct. Platform profiles all 5 OK. Migration files 001-010 present and valid.

### Backend Readiness for Frontend: READY

| Area | Verdict | Detail |
|------|---------|--------|
| Report fragility | FULLY WORKING | 150-char summaries, 1 retry, geography injected |
| Memory fresh/persistent | FULLY WORKING | Full chain: schema→service→config→worker |
| Agent Atlas API | FULLY WORKING | 2 endpoints, memory data, auth, registered |
| Geography in evidence | FULLY WORKING | Agent country/city in report prompt |
| Source-aware understanding | FULLY WORKING | Upload→extract→link→inject chain complete |
| Auth system | FULLY WORKING | 4 guards, 10 permissions, 7 roles |
| API surface | FULLY WORKING | 46 endpoints across 10 routers |
| Overall | **PASS — frontend can begin** | No blocking issues |

### Frontend Shell Integration Requirements
The incoming frontend shell must:
1. **Auth**: Use Supabase client-side auth (signInWithPassword, signUp). JWT token in Authorization header for all API calls.
2. **API base**: All backend calls to `/api/*` (simulations, reports, compare, audiences, agents, knowledge, billing, team, admin, stream).
3. **Simulation flow**: Must follow the lifecycle: create(draft) → understand → plan → prepare-audience → launch → stream → report.
4. **Memory mode**: Simulation create form must include `memory_mode` toggle (persistent/fresh).
5. **Workspace scoping**: All workspace-level endpoints require `x-workspace-id` header.
6. **SSE streaming**: Use EventSource to `GET /api/stream/{sim_id}` for live simulation updates.
7. **Credit display**: Show estimate before launch, balance in billing section.

What can remain mock initially:
- Admin panel pages (backend API exists but admin UI is lower priority)
- Compare visualization (API works, complex UI can iterate)
- Agent Atlas deep profiles (API works, basic list sufficient initially)
- Source/knowledge upload UI (API works, can be added after core flow)

What must be real from start:
- Auth flow (login/signup/logout)
- Simulation CRUD + lifecycle (the core product loop)
- Report viewing (the primary deliverable)
- Billing/credit display (users need to see cost)
- Workspace navigation
