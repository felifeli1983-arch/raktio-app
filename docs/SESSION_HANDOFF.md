# SESSION HANDOFF

> Last updated: 2026-04-14
> Last completed step: **Step 2 — Supabase Service-Role Client + Simulations CRUD API**
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
  - `backend/app/services/simulation_service.py` — full CRUD + credit estimation + plan agent limit check + credit balance check
  - `backend/app/api/simulations.py` — 5 endpoints: POST, GET list, GET single, PATCH, DELETE with role-based access
  - Integration tested end-to-end: user creation → org → workspace → membership → credits → JWT → all CRUD ops → cleanup

### Partially Done (by design — completed in later steps)

- `require_admin()` — delegates to `require_user()` (needs `platform_admin` role check from DB)
- `llm_adapter.py` — `_call_anthropic()` and `_call_deepseek()` raise `NotImplementedError` (skeleton only)

### Not Started Yet

- Step 3: Brief ingestion + Intelligence Layer (Claude Sonnet planning)
- Step 4: Audience sourcing + agent population
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
| `backend/app/db/supabase_client.py` | **IMPLEMENTED** — singleton `get_supabase()` using service_role key, `@lru_cache` |
| `backend/app/schemas/simulation.py` | **IMPLEMENTED** — `SimulationCreate`, `SimulationUpdate`, `SimulationResponse`, `SimulationListResponse`, constrained Literal types |
| `backend/app/services/simulation_service.py` | **IMPLEMENTED** — `create_simulation`, `list_simulations`, `get_simulation`, `update_simulation`, `delete_simulation`, `estimate_credits`, plan limit + credit balance checks |
| `backend/app/api/simulations.py` | **IMPLEMENTED** — 5 endpoints (POST, GET list, GET single, PATCH, DELETE) with role-based auth guards |
| `backend/app/adapters/llm_adapter.py` | **SKELETON** — `LLMAdapter` class with `complete()` dispatching to `_call_anthropic`/`_call_deepseek` (both `NotImplementedError`) |
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

### Step 3: Brief Ingestion + Intelligence Layer (Claude Sonnet Planning)

Execute in this order:

1. **Implement `backend/app/adapters/llm_adapter.py`** — complete `_call_anthropic()` using the `anthropic` Python SDK. Implement `complete(route, messages, system)` for `PLANNING` and `REPORT` routes. `_call_deepseek()` stays `NotImplementedError` for now (runtime step).

2. **Implement `backend/app/services/brief_service.py`** — takes `brief_text` from a simulation, calls Claude Sonnet (PLANNING route) to extract:
   - Brief understanding / interpretation
   - Ontology extraction (key topics, entities, relationships)
   - Store result in `simulations.brief_context_json`

3. **Implement `backend/app/services/planner_service.py`** — calls Claude Sonnet (PLANNING route) to generate:
   - Audience recommendation (demographics, stance distribution, geography)
   - Platform/geography/recsys config recommendations
   - Store result in `simulation_configs.planner_recommendation_json`
   - Update `simulations.planner_status` to `ready`

4. **Wire brief + planner into the simulation lifecycle**:
   - Add a `POST /api/simulations/{id}/understand` endpoint that triggers brief understanding
   - Add a `POST /api/simulations/{id}/plan` endpoint that triggers the planner
   - These transition simulation status: `draft` → `understanding` → `planning` → (planner_status=ready)

5. **Test the full flow**: create simulation → submit brief → understand → plan → verify stored results.

---

## 6. Open Issues / Unresolved Details

| Issue | Notes |
|-------|-------|
| **GitHub token exposed** | Token `ghp_hRJ1...` was pasted in chat. Must be revoked from GitHub Settings → Developer settings → PAT. |
| **DB password exposed** | `@Eleonora2021@` was shared in chat. Consider rotating from Supabase Dashboard → Settings → Database. |
| **Service role key exposed** | Shared in chat. Consider rotating from Supabase Dashboard → Settings → API (regenerate). |
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
3. Execute **Step 2** as described in section 5 above
4. Do NOT re-architect, re-discuss, or recreate the skeleton

### What must NOT be reinvented or changed

- The 12-table schema is **live on Supabase** — do not recreate or modify tables without a new numbered migration (`002_*.sql`)
- The model routing policy (Claude Sonnet / DeepSeek) is frozen
- The folder structure is final — add files within it, do not reorganize
- The auth flow (Supabase Auth + JWT validation) is complete — build on top of it
- The 18 Docs files are the source of truth for all product decisions
- Login and signup pages are working — do not touch unless there is a bug

### Prompt to start the next chat

```
Read Docs/SESSION_HANDOFF.md first, then continue exactly from the recorded
next step. Do not re-architect the project unless the handoff explicitly says
something is unresolved.
```
