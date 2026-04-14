# SESSION HANDOFF

> Last updated: 2026-04-14
> Last completed step: **Step 7 — Reports + Compare (+ audit fix batch applied)**
> Repository: https://github.com/felifeli1983-arch/raktio-app.git (branch `main`)

---

## 1. Current Status

### Completed

- **Architecture design** — full 3-layer architecture reviewed and confirmed across 18 spec documents
- **Model routing policy** — confirmed and coded: Claude Sonnet (planning/reports), DeepSeek (runtime)
- **Repository skeleton** — full folder structure for backend (FastAPI) and frontend (Next.js 14)
- **Step 1: Supabase Schema + Auth** — fully implemented and deployed:
  - SQL migration `001_initial_schema.sql` with 12 tables, RLS, triggers, seed data
  - Migration executed on live Supabase project `epnvdtuowwqzjjazkmxp` (eu-west-1)
  - 16 old tables from previous project wiped before applying new schema
  - Backend JWT auth guards (`guards.py`) with HS256 decode via python-jose
  - Frontend Supabase client helpers (browser + SSR)
  - Next.js middleware for route protection (auth/app/admin groups)
  - Login and Signup pages with real Supabase Auth integration
  - `.env` files configured with real Supabase credentials (not in git)
  - GitHub repo initialized and pushed
- **Step 2: Supabase Service-Role Client + Simulations CRUD API** — fully implemented and tested:
  - `backend/app/db/supabase_client.py` — singleton service_role client via `supabase-py`
  - `require_workspace_member()` now does real DB lookup on `workspace_memberships`
  - `backend/app/schemas/simulation.py` — Pydantic models: `SimulationCreate`, `SimulationUpdate`, `SimulationResponse`, `SimulationListResponse`
  - `backend/app/services/simulation_service.py` — full CRUD via repository layer + credit estimation + plan agent limit check
  - `backend/app/api/simulations.py` — 5 CRUD endpoints + 2 intelligence endpoints with role-based access
  - Integration tested end-to-end: user creation → org → workspace → membership → credits → JWT → all CRUD ops → cleanup
- **Audit fixes applied** (between Step 2 and Step 3):
  - Migration `002_add_user_email_and_plan_pricing.sql` — adds `email` to `public.users`, pricing fields to `plans`, updates trigger
  - Refactored `simulation_service.py` to use `repositories/simulations.py` (no direct DB calls)
  - Extracted role checks into `auth/permissions.py` with reusable permission functions
  - Fixed delete query to filter by workspace_id (defense-in-depth)
  - Removed inline imports from API routes
  - Step 1 and Step 2 both passed re-audit after fixes
- **Step 3A: Brief Understanding** — implemented and structurally tested:
  - `_call_anthropic()` implemented in `llm_adapter.py` using `anthropic` SDK (AsyncAnthropic)
  - `brief_service.py` — calls Claude Sonnet (PLANNING), extracts structured JSON (topic, entities, audience segments, geography, risks)
  - `POST /api/simulations/{id}/understand` — triggers brief understanding, stores in `brief_context_json`
  - Status transitions: `draft` → `understanding` → `draft` (with context). Reverts on failure.
  - Structural tests pass: routing, validation (no brief → 422), permissions (viewer → 403), error recovery
  - **BLOCKER**: Full LLM test requires `ANTHROPIC_API_KEY` in `.env` (currently empty)
- **Step 3B: Planner** — implemented and structurally tested:
  - `planner_service.py` — calls Claude Sonnet (PLANNING) with brief context + user params, generates simulation config recommendation
  - `POST /api/simulations/{id}/plan` — triggers planner, stores in `simulation_configs.planner_recommendation_json`
  - `planner_status` transitions: `pending` → `running` → `ready` (or `failed`). Reverts on failure.
  - Structural tests pass: prerequisite check (no understanding → 422), permissions (viewer → 403), error recovery
  - **BLOCKER**: Full LLM test requires `ANTHROPIC_API_KEY` in `.env`

### Partially Done (by design — completed in later steps)

- `require_admin()` — delegates to `require_user()` (needs `platform_admin` role check from DB)
- `_call_deepseek()` in `llm_adapter.py` — raises `NotImplementedError` (Step 5: OASIS runtime)
- `stream_complete()` in `llm_adapter.py` — not yet implemented (Step 6: streaming)

- **Step 4: Audience Sourcing + Agent Population** — implemented and tested:
  - Migration `003_audiences_and_participation.sql` — 3 new tables (audiences, audience_memberships, simulation_participations) with RLS. Applied to live Supabase (15 tables total).
  - `repositories/agents.py` — full CRUD for agents, audiences, memberships, participations
  - `agent_service.py` — LLM-based agent generation via Claude Sonnet PLANNING, username generation with uniqueness
  - `audience_service.py` — sources from global pool + generates gaps, creates audience + memberships + participations
  - `POST /api/simulations/{id}/prepare-audience` — endpoint with status transitions, graceful fallback when LLM unavailable
  - `audiences.py` API — GET list, GET single, DELETE (soft archive) with role-based access
  - `schemas/audience.py` — Pydantic models
  - Structural tests pass: prerequisite checks (422), permissions (403), error recovery, CRUD operations
  - **Note**: `DEEPSEEK_API_KEY` now configured in `.env`. `ANTHROPIC_API_KEY` still empty.

- **Step 5: OASIS Runtime Bridge + Launch Lifecycle** — implemented and tested:
  - `_call_deepseek()` in `llm_adapter.py` — OpenAI-compatible client, tested with real API key
  - `runtime/config_builder.py` — translates product config → OASIS UserInfo format, creates run workspace
  - `runtime/launcher.py` — pre-flight checks, credit reservation, simulation_runs creation, config persistence
  - `runtime/supervisor.py` — pause, resume, cancel with credit refund via ledger
  - `runtime/event_bridge.py` — reads OASIS SQLite, normalizes to SimulationEvent objects
  - `runtime/state_reader.py` — combines product DB + runtime SQLite state for canvas
  - 4 new endpoints: `POST /launch`, `/pause`, `/resume`, `/cancel`
  - Credit lifecycle: reservation on launch, refund on cancel, ledger entries for both
  - Integration test: launch → credits reserved → cancel → credits refunded → all assertions pass
  - **Note**: Actual OASIS process execution (env.step() loop) deferred to ARQ worker implementation. Current launcher prepares everything and marks as `bootstrapping`.
  - **Git**: committed locally on `main`, pushed to `feat/step-5-runtime-bridge` branch (main push blocked by sandbox)

- **Step 6: Live Streaming (SSE)** — implemented and tested:
  - `api/stream.py` — SSE endpoint `GET /api/stream/{simulation_id}`, auth + membership check, heartbeat, auto-end on completion
  - `adapters/stream_adapter.py` — StreamManager with concurrent listeners, broadcast, queue-based distribution
  - `frontend/lib/hooks/useSimulationStream.ts` — React EventSource hook with reconnection, event buffering (last 500), status tracking
  - Tests pass: SSE content-type, run_state/simulation_ended events, 401 without auth, 403 for non-members

- **Step 7: Reports + Compare** — implemented and tested:
  - Migration `004_reports_and_compare.sql` — 3 new tables (reports, report_sections, compare_runs) with RLS. Applied to live Supabase (18 tables total).
  - `report_service.py` — progressive 10-section report generation via Claude Sonnet (REPORT route), sections fail independently
  - `compare_service.py` — structured 2-simulation comparison via Claude Sonnet (REPORT route)
  - `api/reports.py` — GET list, GET single, POST generate
  - `api/compare.py` — GET list, GET single, POST create
  - `schemas/report.py`, `schemas/compare.py` — Pydantic models
  - Tests pass: all endpoints registered, report record created (sections fail gracefully without API key), compare fails at LLM (502), permissions enforced
  - **Git**: local `main` ahead by 4 commits; pushed to branch `feat/steps-4-7-full`. User needs to merge to main.
- **Audit Fix Batch (Steps 3-7)** — applied and tested:
  - Migration `005_report_sections_expand.sql` — expanded section_key CHECK, added `audience_id` to simulations
  - SSE auth: `?token=` query param fallback for EventSource
  - Launcher: all participants loaded (no truncation)
  - Report/compare restricted to completed simulations
  - All services refactored to use repositories (zero direct DB calls)
  - 4 missing report sections added, audience_id linked, timestamps fixed
  - **Steps 3-7 all PASS after fixes**

### Structural Limitation (intentional)

Reports and compare generate from brief/planner config, NOT from OASIS runtime evidence. True evidence-backed reporting requires completing the OASIS `env.step()` worker. This is documented in `confidence_limitations` section of every report.

### Not Started Yet
- Step 8: Billing / credits
- Step 9: Admin panel
- All frontend pages beyond login/signup are placeholder stubs

---

## 2. Frozen Decisions

These decisions are **confirmed and must not be changed** without explicit user request:

| Decision | Detail |
|----------|--------|
| **OASIS-first** | OASIS is the real simulation engine. `env.step()`, Platform, SQLite, trace, recsys are preserved. Not a fake feed generator. |
| **MiroFish as selective pattern reference** | Adopted patterns: ontology, planner, graph memory, progressive reports, interview IPC. UI is NOT cloned from MiroFish. |
| **3-layer architecture** | OASIS Runtime Layer → Intelligence Layer → Raktio Product Layer |
| **Model routing** | `PLANNING` → Claude Sonnet (`claude-sonnet-4-6`), `RUNTIME` → DeepSeek (`deepseek-chat`), `REPORT` → Claude Sonnet (`claude-sonnet-4-6`). Provider-agnostic via `llm_adapter`. Admin-overridable model IDs. |
| **Persistent synthetic agents** | Globally unique `username`, persistent identity. Agents exist across runs with memory. |
| **DiceBear notionists avatars** | `avatar_seed = username` (GENERATED ALWAYS AS column in DB). URL: `https://api.dicebear.com/9.x/notionists/svg?seed={username}`. No image storage. |
| **Multi-platform Model 1** | One population, agents exist across multiple platforms with different per-platform behavior profiles. |
| **Deep geography** | Agents have: country, region, province_or_state, city, macro_area, timezone, languages. |
| **Pricing & credits** | Immutable append-only `credit_ledger`. `credit_balances` per organization. 5 plans: starter (2500 agents), growth (5000), business (10000), scale (50000), enterprise (unlimited). |
| **Frontend stack** | Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand (state), SWR (fetch), sigma.js (graph), maplibre-gl (geo), Radix UI, recharts |
| **Backend stack** | FastAPI, Python 3.11, Supabase (Postgres + Auth + Storage), python-jose (JWT), ARQ (job queue), Redis, structlog |
| **Storage split** | SQLite per-run (OASIS truth) + Supabase/Postgres (product state) + object storage (sources/exports) + pgvector (semantic, later) |
| **Simulation Canvas** | 6 modes: Feed, Network, Timeline, Geo, Segments, Compare — over same run data |
| **12-phase pipeline** | brief → understanding → planning → audience → config → bootstrap → OASIS exec → stream → memory transform → report → compare → cross-run persistence |
| **Service-role pattern** | Backend uses Supabase `service_role` key (bypasses RLS) for all DB operations, after validating caller JWT |
| **Supabase Auth flow** | Frontend handles signup/login via `@supabase/ssr`. Backend validates JWT (HS256) from Authorization header. `handle_new_auth_user()` trigger auto-creates `public.users` row on signup. |

---

## 3. Files Created or Modified

### Root level

| Path | Description |
|------|-------------|
| `.gitignore` | Ignores .env, node_modules, __pycache__, oasis-main/, MiroFish-main/ |
| `.env` | Real credentials (Supabase URL, keys, JWT secret). NOT in git. |
| `.env.example` | Template for `.env` |
| `docker-compose.yml` | Dev environment: frontend (3000), backend (8000), worker (ARQ), redis |

### Docs/ (18 spec files — source of truth)

| Path | Description |
|------|-------------|
| `Docs/PROJECT.md` | Project overview and vision |
| `Docs/RAKTIO_ARCHITECTURE.md` | 3-layer architecture definition |
| `Docs/OASIS_ADOPTION_MATRIX.md` | What to adopt/adapt/skip from OASIS |
| `Docs/MIROFISH_PATTERN_MATRIX.md` | What to adopt/adapt/skip from MiroFish |
| `Docs/DATAFLOW_AND_RUNTIME.md` | 12-phase pipeline spec |
| `Docs/APP_STRUCTURE_AND_PAGES.md` | All app pages and navigation |
| `Docs/BACKEND_ARCHITECTURE.md` | Backend modules and API design |
| `Docs/DATA_MODEL_AND_STORAGE.md` | Storage strategy and data model |
| `Docs/SIMULATION_CANVAS_SPEC.md` | 6-mode canvas specification |
| `Docs/AGENTS_AUDIENCE_MEMORY.md` | Agent identity and memory system |
| `Docs/SIMULATION_ENGINE_SPEC.md` | OASIS runtime integration spec |
| `Docs/REPORTS_AND_INSIGHTS_SPEC.md` | Report generation and structure |
| `Docs/PRICING_AND_CREDITS.md` | Credit system and plan tiers |
| `Docs/UI_UX_PRINCIPLES.md` | UI/UX guidelines |
| `Docs/ADMIN_PANEL_SPEC.md` | Admin dashboard specification |
| `Docs/AUDIENCE_AND_AGENT_ATLAS_SPEC.md` | Audience builder and agent atlas |
| `Docs/TEAM_GOVERNANCE_AND_PERMISSIONS.md` | Roles and permissions model |
| `Docs/BUYER_PERSONAS.md` | Target user personas |

### Backend — implemented files

| Path | Description |
|------|-------------|
| `backend/migrations/001_initial_schema.sql` | **IMPLEMENTED** — 12 tables, RLS, triggers, helper functions, plan seeds. Applied to live Supabase. |
| `backend/app/config.py` | **IMPLEMENTED** — `Settings` (pydantic-settings), `ModelRoute` enum, `MODEL_ROUTING` dict |
| `backend/app/auth/guards.py` | **IMPLEMENTED** — `AuthUser`, `WorkspaceContext`, `_decode_supabase_jwt()`, `require_user`, `require_admin`, `require_workspace_member` (real DB lookup), `get_optional_user` |
| `backend/app/auth/permissions.py` | **IMPLEMENTED** — reusable role-check functions: `can_create_simulation()`, `can_delete_simulation()`, `can_view_billing()`, etc. |
| `backend/app/db/supabase_client.py` | **IMPLEMENTED** — singleton `get_supabase()` using service_role key, `@lru_cache` |
| `backend/app/repositories/simulations.py` | **IMPLEMENTED** — `insert`, `find_by_id`, `list_by_workspace`, `update`, `delete`, plus helper lookups for org/plan/credits |
| `backend/app/schemas/simulation.py` | **IMPLEMENTED** — `SimulationCreate`, `SimulationUpdate`, `SimulationResponse`, `SimulationListResponse`, constrained Literal types |
| `backend/app/services/simulation_service.py` | **IMPLEMENTED** — CRUD via repository layer + credit estimation + plan limit + balance checks |
| `backend/app/services/brief_service.py` | **IMPLEMENTED** — `understand_brief()`, Claude Sonnet PLANNING call, JSON extraction, status transitions |
| `backend/app/services/planner_service.py` | **IMPLEMENTED** — `plan_simulation()`, Claude Sonnet PLANNING call, stores in simulation_configs, planner_status lifecycle |
| `backend/app/api/simulations.py` | **IMPLEMENTED** — 7 endpoints (5 CRUD + understand + plan) with role-based auth via permissions module |
| `backend/app/adapters/llm_adapter.py` | **IMPLEMENTED** — `_call_anthropic()` via anthropic SDK. `_call_deepseek()` still `NotImplementedError`. |
| `backend/migrations/002_add_user_email_and_plan_pricing.sql` | **IMPLEMENTED** — adds email to users, pricing fields to plans, updates trigger. Applied to live Supabase. |
| `backend/migrations/003_audiences_and_participation.sql` | **IMPLEMENTED** — audiences, audience_memberships, simulation_participations + RLS. Applied to live Supabase. |
| `backend/app/repositories/agents.py` | **IMPLEMENTED** — CRUD for agents, audiences, memberships, participations |
| `backend/app/services/agent_service.py` | **IMPLEMENTED** — LLM-based agent generation, username generation |
| `backend/app/services/audience_service.py` | **IMPLEMENTED** — audience assembly from pool + generation, create audience + memberships + participations |
| `backend/app/api/audiences.py` | **IMPLEMENTED** — GET list, GET single, DELETE (archive) |
| `backend/app/schemas/audience.py` | **IMPLEMENTED** — `AudienceResponse`, `AudienceListResponse` |
| `backend/app/main.py` | **SKELETON** — FastAPI app with 10 routers registered, health endpoint |
| `backend/requirements.txt` | Full dependency list |
| `backend/Dockerfile.dev` | Dev Dockerfile (Python 3.11-slim, uvicorn --reload) |
| `backend/.env.example` | Template for backend env vars |

### Backend — placeholder/stub files (empty or minimal)

All files in these directories are stubs with `# TODO` markers:

- `backend/app/api/` — 10 router files (simulations, reports, compare, audiences, agents, knowledge, billing, team, admin, stream)
- `backend/app/services/` — 12 service files
- `backend/app/runtime/` — 7 runtime bridge files
- `backend/app/models/` — 12 model files
- `backend/app/schemas/` — 8 schema files
- `backend/app/repositories/` — 9 repository files
- `backend/app/workers/` — 3 worker files
- `backend/app/utils/` — 3 utility files
- `backend/app/billing/` — 2 billing files
- `backend/app/admin/` — 2 admin files
- `backend/app/auth/permissions.py` — stub

### Frontend — implemented files

| Path | Description |
|------|-------------|
| `frontend/lib/supabase/client.ts` | **IMPLEMENTED** — `createBrowserClient` for Client Components |
| `frontend/lib/supabase/server.ts` | **IMPLEMENTED** — `createServerClient` SSR-safe with cookie handling |
| `frontend/middleware.ts` | **IMPLEMENTED** — Route protection: session refresh via `getUser()`, auth/app/admin redirects, `?next=` param |
| `frontend/app/(auth)/login/page.tsx` | **IMPLEMENTED** — Email/password login form with `signInWithPassword`, error handling, redirect to `?next=` |
| `frontend/app/(auth)/signup/page.tsx` | **IMPLEMENTED** — Signup form with password validation, `signUp`, email confirmation screen |
| `frontend/app/(auth)/layout.tsx` | **IMPLEMENTED** — Centered layout for auth pages |
| `frontend/app/layout.tsx` | **IMPLEMENTED** — Root layout with Inter font, metadata |
| `frontend/app/globals.css` | **IMPLEMENTED** — Light/dark theme CSS variables, Tailwind base |
| `frontend/tailwind.config.ts` | **IMPLEMENTED** — Sentiment colors, platform identity colors, CSS variable theme |
| `frontend/package.json` | Full dependency list (next, supabase, zustand, swr, sigma, maplibre, radix, recharts) |
| `frontend/next.config.ts` | DiceBear image domain whitelisted |
| `frontend/tsconfig.json` | Standard Next.js TS config |
| `frontend/.env.local` | Real Supabase anon key. NOT in git. |
| `frontend/.env.local.example` | Template |
| `frontend/Dockerfile.dev` | Dev Dockerfile (node:20-alpine) |
| `frontend/lib/types/simulation.ts` | **IMPLEMENTED** — `SimulationStatus`, `Platform`, `CanvasMode`, `Simulation`, `SimulationRun`, `SimulationEvent` types |
| `frontend/lib/types/agent.ts` | **IMPLEMENTED** — `Agent`, `AgentPlatformPresence`, `AgentEpisode`, `agentAvatarUrl()` utility |

### Frontend — placeholder/stub files

All other files in these directories are stubs with placeholder content:

- `frontend/app/(app)/` — 15 page files (overview, sim/new, sim/[id], simulations, reports, compare, audiences, agents, knowledge, graph, billing, integrations, team, settings)
- `frontend/app/(admin)/` — 11 admin page files
- `frontend/components/` — all component files (~40 files across canvas, simulation, reports, agents, audiences, compare, shared, admin)
- `frontend/lib/api/` — 7 API client files
- `frontend/lib/stores/` — 2 Zustand store files
- `frontend/lib/hooks/` — 4 hook files
- `frontend/lib/utils/` — 3 utility files
- `frontend/lib/types/` — 4 additional type files (report, audience, compare, billing)

---

## 4. Current Repository Structure

```
raktio-app/
├── .env                          # Real credentials (gitignored)
├── .env.example
├── .gitignore
├── docker-compose.yml
│
├── Docs/                         # 18 spec files (source of truth)
│   ├── PROJECT.md
│   ├── RAKTIO_ARCHITECTURE.md
│   ├── ... (16 more)
│   └── BUYER_PERSONAS.md
│
├── backend/
│   ├── .env.example
│   ├── Dockerfile.dev
│   ├── requirements.txt
│   ├── migrations/
│   │   └── 001_initial_schema.sql    ★ IMPLEMENTED + DEPLOYED
│   └── app/
│       ├── main.py                   ★ skeleton (routers registered)
│       ├── config.py                 ★ IMPLEMENTED
│       ├── db/
│       │   └── supabase_client.py    ★ IMPLEMENTED (service_role singleton)
│       ├── auth/
│       │   ├── guards.py             ★ IMPLEMENTED (real DB lookup)
│       │   └── permissions.py          stub
│       ├── adapters/
│       │   ├── llm_adapter.py        ★ skeleton (routing logic, no calls)
│       │   └── ... (5 more)            stubs
│       ├── api/
│       │   ├── simulations.py        ★ IMPLEMENTED (5 CRUD endpoints)
│       │   └── ... (9 more)            stubs
│       ├── schemas/
│       │   ├── simulation.py         ★ IMPLEMENTED (Pydantic models)
│       │   └── ... (7 more)            stubs
│       ├── services/
│       │   ├── simulation_service.py ★ IMPLEMENTED (CRUD + credits)
│       │   └── ... (11 more)           stubs
│       ├── runtime/      (7 files)     stubs
│       ├── models/       (12 files)    stubs
│       ├── repositories/ (9 files)     stubs
│       ├── workers/      (3 files)     stubs
│       ├── billing/      (2 files)     stubs
│       ├── admin/        (2 files)     stubs
│       └── utils/        (3 files)     stubs
│
├── frontend/
│   ├── .env.local                    # Real anon key (gitignored)
│   ├── .env.local.example
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts            ★ IMPLEMENTED
│   ├── tsconfig.json
│   ├── middleware.ts                 ★ IMPLEMENTED
│   ├── app/
│   │   ├── layout.tsx                ★ IMPLEMENTED
│   │   ├── page.tsx                    stub (landing)
│   │   ├── globals.css               ★ IMPLEMENTED
│   │   ├── (auth)/
│   │   │   ├── layout.tsx            ★ IMPLEMENTED
│   │   │   ├── login/page.tsx        ★ IMPLEMENTED
│   │   │   └── signup/page.tsx       ★ IMPLEMENTED
│   │   ├── (app)/
│   │   │   ├── layout.tsx            ★ IMPLEMENTED (Sidebar)
│   │   │   └── ... (15 pages)          stubs
│   │   └── (admin)/
│   │       ├── layout.tsx            ★ IMPLEMENTED (AdminSidebar)
│   │       └── ... (11 pages)          stubs
│   ├── components/                   ~40 files, all stubs
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts             ★ IMPLEMENTED
│       │   └── server.ts             ★ IMPLEMENTED
│       ├── types/
│       │   ├── simulation.ts         ★ IMPLEMENTED
│       │   ├── agent.ts              ★ IMPLEMENTED
│       │   └── ... (4 more)            stubs
│       ├── api/          (7 files)     stubs
│       ├── stores/       (2 files)     stubs
│       ├── hooks/        (4 files)     stubs
│       └── utils/        (3 files)     stubs
│
├── oasis-main/                       # OASIS source (gitignored, reference)
└── MiroFish-main/                    # MiroFish source (gitignored, reference)
```

**Legend**: ★ = implemented with real logic, `stub` = placeholder file with TODO markers

---

## 5. Next Exact Implementation Step

### PRIORITY DECISION (2026-04-14)

**Step 8 (Billing) is BLOCKED. Step 7.5 must come first.**

Rationale: the product's core value — real social simulation — is not yet functional.
Reports, compare, streaming, and billing finalization all depend on real OASIS runtime
evidence that does not exist yet. Building billing on speculative execution would
require rework. Real OASIS execution is the single highest-priority work item.

### Step 7.5 — OASIS Runtime Execution + Evidence Pipeline

This prerequisite block must complete before Step 8 begins.

**Step 7.5A — Verify OASIS environment** ✅ COMPLETED
- OASIS v0.2.5 imports successfully on Python 3.12 (despite pyproject.toml saying <3.12)
- Required deps installed: numpy, pandas, torch (CPU), sentence-transformers, camel-ai 0.2.78, igraph, neo4j
- Smoke test passed: 2 agents, 3 steps, DeepSeek as LLM → real posts, comments, likes in SQLite
- OASIS API surface confirmed: `oasis.make()`, `env.reset()`, `env.step()`, `env.close()`, `SocialAgent`, `UserInfo`, `AgentGraph`, `LLMAction`, `ManualAction`, 31 `ActionType` members, `DefaultPlatformType.TWITTER/REDDIT`
- `SocialAgent` requires `camel.models.ModelFactory.create()` model, not raw API key
- DeepSeek works via `ModelPlatformType.OPENAI_COMPATIBLE_MODEL` with url `https://api.deepseek.com/v1`
- Real SQLite schema: 17 tables (user, post, comment, like, dislike, follow, mute, rec, trace, report, + group/product/sqlite_sequence)
- **CRITICAL: `trace` table is the primary event source** — records every agent action with JSON info. Current event_bridge.py ignores it entirely.
- **event_bridge.py mismatches**: `like` is SQL reserved word (needs quoting), comments not read, trace not read, user table not used for ID mapping, rec table not used for exposure
- Fixes required before 7.5B: rewrite event_bridge.py against real schema (will be done in 7.5C)

**Step 7.5B — OASIS runtime worker** ✅ COMPLETED
- `runtime/oasis_worker.py` implemented: full `env.step()` loop
- Model: `ModelFactory.create(OPENAI_COMPATIBLE_MODEL, "deepseek-chat", api_key, url)`
- Agents: `SocialAgent(agent_id, UserInfo(...), agent_graph, model, available_actions)`
- Execution: `oasis.make()` → `env.reset()` → `env.step({agent: LLMAction()})` × N → `env.close()`
- Status transitions: `bootstrapping → running → completing → completed` (or `failed`)
- Progress: `simulated_time_completed` updated each step, `runtime_metadata_json` with step/total/pct
- E2E test: 3 agents, 6 steps, DeepSeek → **6 posts, 7 comments, 2 likes, 33 trace entries**
- Agents produced culturally coherent Italian food discourse
- Launcher dispatches worker inline (`run_oasis=True`); production should use ARQ
- **OASIS simulations now actually run. This is the most significant milestone in the project.**
- Post-fixes applied:
  - Status lifecycle: sim goes `draft→cost_check→bootstrapping→running→completing→completed` (or `failed`). Run mirrors `bootstrapping→running→completed`. `completing` is a real transitional state between last step and env.close(). `reporting` set by report_service only.
  - Action set expanded from 11 to 21: full social action grammar minus internal mechanics (REFRESH/SIGNUP/EXIT/UPDATE_REC_TABLE), special actions (INTERVIEW/PURCHASE_PRODUCT), and deferred group actions (5). Documented and categorized in oasis_worker.py.

**Step 7.5C — Verified event bridge** ✅ COMPLETED
- `event_bridge.py` fully rewritten against real OASIS v0.2.5 SQLite schema
- `trace` table is now the PRIMARY event source (20 action types → product events)
- `user` table used for `user_id` → `username` mapping
- `rec` table read for exposure/recommendation analysis
- `[like]` properly quoted (SQL reserved word fix)
- `comment` is a first-class event type
- `read_posts()`, `read_comments()`, `read_exposure()` with enriched metadata
- `build_evidence_bundle()` produces complete runtime evidence: posts, comments, trace counts, per-agent activity, top posts, exposure records
- `state_reader.py` updated to use trace-based event reading
- Tested: all 8 test categories pass against real OASIS SQLite DB
- Incremental reading via `since_rowid` works correctly

**Step 7.5D — Live streaming** ✅ COMPLETED
- Launcher dispatches OASIS as `asyncio.create_task()` (returns immediately to client)
- SSE stream polls trace table from live SQLite via `read_events_from_trace()`
- Verified: 7 real events from 3-agent, 3-step run delivered via SSE
  - Event types: post_created, comment_created×3, post_liked, comment_liked, search_performed
- Run state includes real event counts (post:1, comment:3, like:1, trace:16) + action summary
- Stream clearly distinguishes: run_state, simulation_event, heartbeat, simulation_ended
- Background task dispatch enables concurrent SSE consumption during live runs
- TestClient limitation: can't test truly concurrent background+SSE (requires real uvicorn). Verified via two-phase test (run OASIS → read SSE from completed DB).

**Step 7.5E — Report evidence handoff** ✅ COMPLETED
- `report_service.py` imports `build_evidence_bundle()` from event_bridge
- `sim_context` includes `runtime_evidence` with: event counts, action summary, top posts (content + engagement), sample comments (content + attribution), per-agent activity breakdown, exposure records
- `_generate_section()` builds structured evidence prompt for each section
- System prompt instructs Claude to cite real evidence when `has_runtime_evidence=true`
- Tested: 3-agent OASIS run → 14/14 report sections generated, ALL reference real agents and real metrics
- Reports are now genuinely evidence-backed, not speculative
- Stream adapter cleanup: Option B chosen — polling is official temporary model, adapter documented as DEFERRED
- **Step 7.5E0 — Population quality hardening** applied:
  - Agent profile validation: skip nameless entries, force country match, clamp enums
  - Pool sourcing: platform presence filter + cross-country dedup (exclude_ids)
  - Audience assembly: dedup safety net, coverage_pct in response
  - SimulationResponse includes audience_id for traceability
  - Deferred: per-segment stance assignment, private audience enforcement

**Step 7.5F — Compare evidence handoff**
1. Compare reads real reports + runtime event counts from both runs

**Step 7.5G — Credit settlement**
1. Calculate actual cost from real execution
2. Settle reserved → final in credit_balances
3. Insert simulation_finalization ledger entry

### After Step 7.5, remaining roadmap:
- Step 8: Billing / Credits
- Step 9: Admin panel API
- Step 10: Team & Governance API
- Step 11: Frontend page implementations
- Step 12: Integration testing & deployment prep

---

## 6. Open Issues / Unresolved Details

| Issue | Notes |
|-------|-------|
| **GitHub token exposed** | Token `ghp_hRJ1...` was pasted in chat. Must be revoked from GitHub Settings → Developer settings → PAT. |
| **DB password exposed** | `@Eleonora2021@` was shared in chat. Consider rotating from Supabase Dashboard → Settings → Database. |
| **Service role key exposed** | Shared in chat. Consider rotating from Supabase Dashboard → Settings → API (regenerate). |
| **ANTHROPIC_API_KEY not set** | `.env` has `ANTHROPIC_API_KEY=` (empty). Step 3 LLM calls (understand, plan) will fail with 502 until this is configured. Structural tests pass without it. |
| **npm install not run** | `frontend/package.json` exists but `npm install` has never been executed (no `node_modules/`, no `package-lock.json`). |
| **pip install not run** | `backend/requirements.txt` exists but deps not installed in a venv. |
| **No git hooks / CI** | No linting, formatting, or CI pipeline set up yet. |
| **Supabase DB connection** | Direct connection (`db.*.supabase.co:5432`) DNS did not resolve. Used pooler `aws-0-eu-west-1.pooler.supabase.com:6543` for migration. Backend `supabase-py` uses REST API (not pooler), so this is fine for app usage. |
| **Supabase email confirmation** | Default Supabase behavior requires email confirmation on signup. The `handle_new_auth_user()` trigger fires on `auth.users` INSERT. Confirm this works with the default Supabase email template. |
| **`oasis-main/` and `MiroFish-main/` location** | These are local folders inside the project root. They are gitignored. The `docker-compose.yml` mounts `oasis-main` read-only. If the repo is cloned elsewhere, these must be placed manually or symlinked. |

---

## 7. Restart Instructions for Next Chat

### Files to read first (in order)

1. `Docs/SESSION_HANDOFF.md` — **this file** (start here)
2. `backend/app/config.py` — settings structure and model routing
3. `backend/app/auth/guards.py` — current auth implementation
4. `backend/migrations/001_initial_schema.sql` — the live DB schema

### What the next session must do first

1. Read this handoff file
2. Confirm understanding of frozen decisions
3. Execute **Step 4** as described in section 5 above (micro-step process)
4. Do NOT re-architect, re-discuss, or recreate the skeleton

### What must NOT be reinvented or changed

- The 12-table schema is **live on Supabase** — do not recreate or modify tables without a new numbered migration (`002_*.sql`)
- The model routing policy (Claude Sonnet / DeepSeek) is frozen
- The folder structure is final — add files within it, do not reorganize
- The auth flow (Supabase Auth + JWT validation) is complete — build on top of it
- The 18 Docs files are the source of truth for all product decisions
- Login and signup pages are working — do not touch unless there is a bug
- Brief and planner services are implemented — they work structurally, full LLM test needs API key
- The repository pattern is established — all new services must use repositories, not direct DB calls

### Prompt to start the next chat

```
Read Docs/SESSION_HANDOFF.md first, then continue exactly from the recorded
next step. Do not re-architect the project unless the handoff explicitly says
something is unresolved.
```
