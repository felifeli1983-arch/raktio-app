# SESSION HANDOFF

> Last updated: 2026-04-14
> Last completed step: **Step 8D — Cost & Token Intelligence Layer**
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
| 9 | Admin Panel API | NOT STARTED |
| 10 | Team & Governance API | NOT STARTED |
| 11 | Frontend Pages | NOT STARTED |
| 12 | Integration Testing | NOT STARTED |

---

## 2. Live Infrastructure

| Resource | Detail |
|----------|--------|
| Supabase project | `epnvdtuowwqzjjazkmxp` (eu-west-1) |
| Tables live | **18**: users, organizations, workspaces, workspace_memberships, plans, simulations, simulation_configs, simulation_runs, agents, agent_platform_presence, audiences, audience_memberships, simulation_participations, credit_balances, credit_ledger, reports, report_sections, compare_runs |
| Migrations applied | 001 (schema), 002 (email+pricing), 003 (audiences), 004 (reports+compare), 005 (sections expand+audience_id) |
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
| `migrations/001-005` | 5 SQL migrations, all applied to live Supabase |
| `app/config.py` | Settings, ModelRoute enum, model routing |
| `app/main.py` | FastAPI app, 10 routers registered |
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

### Frontend — Implemented
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

### Frontend — Stubs (~80 files)
All other pages, components, stores, hooks, API clients are placeholder stubs.

---

## 6. Next Step

### Step 7.5F — Compare Evidence Handoff

Wire real runtime evidence from both simulations' SQLite DBs into compare_service.

### After 7.5F:
- 7.5G: Credit settlement from real execution
- Step 8: Billing / Credits
- Step 9: Admin Panel API
- Step 10: Team & Governance API
- Step 11: Frontend Pages
- Step 12: Integration Testing

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
| No Agent Atlas API (`api/agents.py` stub) | Lower priority than runtime pipeline | Step 10+ |
| No memory domain tables (5 tables) | Requires memory transformation service | Post-runtime step |
| No knowledge/sources tables (4 tables) | Requires file processing pipeline | Later step |
| No audit_logs table | Admin panel step | Step 9 |
| `require_admin()` delegates to `require_user()` | Admin panel step | Step 9 |
| No subscription/plan change/payment API | Requires BIL-04 to BIL-08 | Post-launch |
| Group actions (5) not enabled in OASIS | Group simulation features deferred | Later step |
| No report_chat tables | Interactive report chat deferred | Later step |
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
1. Execute Step 7.5F as described in section 6
2. Do NOT re-architect the project

### Must NOT change
- The 18-table schema is live — new tables require new numbered migrations
- Model routing policy is frozen
- Repository pattern is established — all services use repositories
- Auth flow is complete
- OASIS worker execution lifecycle is documented and authoritative
- 21-action set is documented and justified

---

## 11. Documentation Sync Log (2026-04-14)

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
| Others (PROJECT, OASIS_ADOPTION_MATRIX, MIROFISH_PATTERN_MATRIX, RAKTIO_ARCHITECTURE, SIMULATION_CANVAS_SPEC, UI_UX_PRINCIPLES, BUYER_PERSONAS) | No changes needed | These are design docs, not implementation docs |
