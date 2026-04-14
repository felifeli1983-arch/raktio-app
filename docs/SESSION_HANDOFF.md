# SESSION HANDOFF

> Last updated: 2026-04-14
> Last completed step: **Step 4 — Audience Sourcing + Agent Population**
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

### Not Started Yet
- Step 5: OASIS runtime bridge
- Step 6: Live streaming (SSE)
- Step 7: Reports + Compare
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

### Step 5: OASIS Runtime Bridge

Split into micro-steps:

**Step 5A — DeepSeek adapter**
1. Implement `_call_deepseek()` in `llm_adapter.py` using OpenAI-compatible client
2. Test with real `DEEPSEEK_API_KEY` (now configured)

**Step 5B — Runtime config builder**
1. Implement `runtime/config_builder.py` — translates product-level simulation config into OASIS-executable config
2. Creates run workspace directory, SQLite init

**Step 5C — Runtime launcher + supervisor**
1. Implement `runtime/launcher.py` — prepares and launches OASIS process
2. Implement `runtime/supervisor.py` — monitors lifecycle, handles pause/stop
3. Add `POST /api/simulations/{id}/launch` endpoint
4. Status transitions: `draft` → `cost_check` → `bootstrapping` → `running`

**Step 5D — Event bridge**
1. Implement `runtime/event_bridge.py` — normalizes OASIS trace/SQLite events
2. Implement `runtime/state_reader.py` — reads runtime state for canvas

**Note**: OASIS integration depends on `oasis-main/` being present. If not available, implement the bridge interface with mock/stub runtime.

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
