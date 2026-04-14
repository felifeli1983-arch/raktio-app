# BACKEND_ARCHITECTURE.md

## Purpose

This document defines the backend architecture of Raktio.

Raktio’s backend is not a thin API wrapper.  
It is the coordination layer that connects:
- user/product workflows
- OASIS runtime execution
- intelligence services
- persistent storage
- live streaming
- reporting
- credits/billing logic
- admin/governance needs

The backend must preserve the three-layer architecture already defined elsewhere:
- OASIS Runtime Layer
- Intelligence Layer
- Product Layer

This file focuses on how those layers are operationalized in backend services.

---

## Core backend rule

**The backend must orchestrate OASIS, not replace it.**

That means:
- the backend launches and supervises simulation runs
- the backend stores product/persistent state
- the backend exposes APIs and live streams
- the backend runs planner/report/memory services
- the backend must not flatten OASIS into fake feed generation

---

## Backend responsibilities

The backend must handle:

### Product responsibilities
- authentication-aware API behavior
- workspace / org / team scoping
- simulation CRUD and lifecycle
- audience CRUD
- agent profile access
- report access
- compare flows
- credits and billing logic
- admin/tenant operations

### Runtime responsibilities
- prepare OASIS run configuration
- create and manage run workspaces
- launch/monitor OASIS executions
- expose run state and live events
- handle pause/resume/stop/interview requests
- normalize trace/runtime outputs

### Intelligence responsibilities
- brief understanding
- ontology/entity extraction
- planner recommendations
- audience generation support
- memory transformation
- report generation
- report chat
- explainability surfaces

---

## Recommended backend stack direction

### Core API layer
- **FastAPI** as the primary product API

### Runtime workers
- dedicated simulation workers/processes
- task/job system for bootstrap, run supervision, reporting, memory updates

### Persistent database
- **Supabase / Postgres** for product persistence

### Run-local database
- **SQLite** per simulation run for OASIS runtime truth

### Stream layer
- SSE or WebSocket layer for live simulation updates

### Async/task layer
- worker queue / background jobs for:
  - simulation launch
  - memory updates
  - report generation
  - compare preparation
  - imports/parsing

---

## High-level backend module map

Recommended backend module groups:

1. `api/`
2. `services/`
3. `runtime/`
4. `workers/`
5. `adapters/`
6. `repositories/`
7. `schemas/`
8. `auth/`
9. `billing/`
10. `admin/`
11. `utils/`

---

# 1. API layer

## Purpose
Expose product-facing endpoints cleanly.

## Main API domains
- auth/session-aware access
- simulations
- reports
- compare
- audiences
- agents
- knowledge/sources
- billing/credits
- team/governance
- admin

### Suggested API modules
- `api/simulations.py`
- `api/reports.py`
- `api/compare.py`
- `api/audiences.py`
- `api/agents.py`
- `api/knowledge.py`
- `api/billing.py`
- `api/team.py`
- `api/admin.py`

### API rule
The API layer should stay thin.  
It validates input, enforces auth/permissions, and calls services.  
It must not contain business orchestration logic directly.

---

# 2. Service layer

## Purpose
Contain business logic and cross-module orchestration.

## Suggested service modules
- `brief_service`
- `planner_service`
- `audience_service`
- `agent_service`
- `simulation_service`
- `runtime_bridge_service`
- `memory_service`
- `report_service`
- `compare_service`
- `knowledge_service`
- `billing_service`
- `admin_service`

### Service rule
Services own orchestration logic, not API modules.

---

# 3. Runtime layer (backend side)

## Purpose
Supervise and integrate live OASIS runs.

## Suggested runtime modules
- `runtime/launcher.py`
- `runtime/supervisor.py`
- `runtime/state_reader.py`
- `runtime/event_bridge.py`
- `runtime/interview_bridge.py`
- `runtime/config_builder.py`
- `runtime/health.py`

### Responsibilities
- prepare run folders
- materialize final config
- initialize OASIS run state
- start OASIS process/job
- monitor lifecycle
- read SQLite / traces
- normalize runtime events
- expose health/run status
- route interview/manual commands

### Important rule
The runtime backend layer is the product-facing wrapper around OASIS, not a replacement for OASIS internals.

---

# 4. Worker/job layer

## Purpose
Handle long-running and asynchronous operations.

## Required async jobs
- parse uploaded sources
- run brief understanding
- run planner recommendation
- prepare population
- bootstrap simulation
- supervise simulation
- transform memory episodes
- generate report
- generate compare artifacts
- build export files
- run maintenance/admin tasks

### Job system requirement
The product must support:
- retries where safe
- job state tracking
- failure visibility
- cancellation where relevant
- admin visibility into stuck jobs

---

# 5. Adapter layer

## Purpose
Isolate external systems and internal runtime boundaries.

## Suggested adapters
- `oasis_adapter`
- `llm_adapter`
- `storage_adapter`
- `stream_adapter`
- `dicebear_adapter` (optional helper, not critical)
- `source_parser_adapter`
- `semantic_index_adapter`

### Why adapters matter
They keep the architecture flexible and reduce tight coupling.

### Critical adapters
#### OASIS adapter
Responsible for:
- config translation
- launch integration
- run lifecycle hooks
- trace/event reading abstractions
- interview/manual action bridge

#### LLM adapter
Responsible for:
- model routing
- planner calls
- report calls
- enrichment calls
- cost accounting hooks

---

# 6. Repository layer

## Purpose
Provide controlled access to persistent product data.

## Suggested repositories
- simulation repository
- report repository
- audience repository
- agent repository
- memory repository
- billing repository
- team repository
- source repository
- compare repository
- admin repository

### Rule
Services should use repositories, not raw DB access all over the codebase.

---

# 7. Schema/model layer

## Purpose
Define request/response models and internal DTOs.

## Suggested schema groups
- simulation schemas
- planner schemas
- audience schemas
- agent schemas
- report schemas
- compare schemas
- billing schemas
- admin schemas
- runtime event schemas

### Important
Runtime event schemas are especially important for live streaming and replay consistency.

---

# 8. Auth and access layer

## Purpose
Enforce user, workspace, org, and admin access.

## Needs
- user identity
- workspace/org scoping
- role checks
- feature gating by plan
- admin override permissions
- private audience/report visibility control

### Rule
Auth and permission logic must never be scattered randomly across services.

---

# 9. Billing and credits layer

## Purpose
Own all commercial logic.

## Responsibilities
- plan entitlement checks
- credit consumption calculation
- credit reservation and deduction
- pack purchases
- annual plan logic
- upgrade prompts
- enterprise gating
- usage history
- billing alerts

### Important rule
Simulation launch should always validate credit sufficiency before run commitment, unless enterprise rules override that.

---

# 10. Admin layer

## Purpose
Support product and enterprise operations.

## Responsibilities
- simulation oversight
- failed-run inspection
- model routing and cost control
- tenant management
- enterprise flags
- admin audit trails
- usage anomaly detection
- pricing parameter management

---

## Core backend flows

# Flow A — Create simulation draft

### Steps
1. user submits brief and files
2. API validates workspace/user access
3. simulation draft record is created
4. uploaded sources are stored and linked
5. background jobs are enqueued for brief understanding
6. planner output is persisted
7. client receives simulation draft state updates

### Backend modules involved
- simulations API
- brief service
- planner service
- source parser adapter
- simulation repository

---

# Flow B — Finalize setup and launch simulation

### Steps
1. user confirms or edits setup
2. billing service estimates cost and validates credits
3. audience service resolves/creates population
4. runtime config builder creates final OASIS config
5. runtime launcher prepares run workspace
6. run status changes to bootstrapping/running
7. stream bridge becomes available

### Backend modules involved
- simulations API
- billing service
- audience service
- runtime config builder
- runtime launcher
- simulation repository
- agent repository

---

# Flow C — Live simulation stream

### Steps
1. runtime supervisor monitors OASIS process
2. runtime state reader reads SQLite/trace changes
3. event bridge normalizes events
4. stream layer publishes events
5. canvas consumes feed, network, timeline, geo, segment data
6. metrics aggregators update live stats

### Backend modules involved
- runtime supervisor
- state reader
- event bridge
- stream adapter
- metric aggregation service

---

# Flow D — Agent interview during run

### Steps
1. user clicks Interview Agent
2. API validates permissions and run state
3. interview bridge sends command to runtime
4. runtime resolves response
5. response is normalized and returned to UI
6. optional memory/report hooks record the exchange

### Backend modules involved
- agents API or simulations API
- interview bridge
- OASIS adapter
- memory service (optional write-through)
- report service (optional evidence use)

---

# Flow E — Report generation

### Steps
1. simulation completes or reaches reporting threshold
2. report job is enqueued
3. report service queries:
   - run config
   - trace events
   - memory episodes
   - aggregates
   - interviews
4. section-based report generation occurs
5. report state becomes partially available progressively
6. final report is persisted and indexed

### Backend modules involved
- report service
- memory service
- search/index adapter
- report repository
- simulation repository

---

# Flow F — Compare workflow

### Steps
1. user clones a simulation or compares two simulations
2. compare service builds structured comparison input
3. deltas are computed across:
   - config
   - outcomes
   - segments
   - geo
   - platform
   - belief shifts
4. compare artifacts are saved
5. compare page is served from structured compare data

### Backend modules involved
- compare service
- simulation repository
- report repository
- memory repository

---

# Flow G — Persistent memory update

### Steps
1. runtime events are transformed into semantic episodes
2. agent memory summaries are updated
3. relationship history is updated
4. topic exposure summaries are updated
5. agent simulation history is updated
6. all of this is persisted to product storage

### Backend modules involved
- memory service
- event bridge
- agent repository
- memory repository
- simulation repository

---

## Runtime-specific backend design

# Run workspace model

Each simulation run should have a dedicated run workspace containing:
- run config
- SQLite DB
- logs
- runtime status metadata
- temporary exports/artifacts if needed

This improves:
- reproducibility
- debugging
- failure isolation

---

# Run state model

Recommended simulation run states:
- draft
- understanding
- planning
- audience_preparing
- cost_check
- bootstrapping
- running
- paused
- completing
- reporting
- completed
- failed
- canceled

### Requirement
State transitions must be explicit and stored.

---

# Event normalization model

OASIS runtime output must be transformed into a product event schema.

### Example event families
- post_created
- comment_created
- repost_created
- quote_created
- follow_changed
- mute_changed
- report_triggered
- search_performed
- belief_shift_detected
- patient_zero_candidate
- geography_spike
- platform_spike
- alert_created

### Why
Frontend and report systems should consume normalized events, not raw runtime internals.

---

# Metrics aggregation layer

A dedicated aggregation service should calculate:
- live feed counts
- sentiment summaries
- polarization
- trend counts
- cluster metrics
- geo metrics
- segment metrics
- compare-ready rollups

This avoids overloading the frontend with raw event processing.

---

## Database architecture (product side)

### Persistent database should store
- users
- orgs / workspaces
- plans / subscriptions
- credit balances / usage
- simulation drafts and runs
- final runtime configs
- audiences
- persistent agents
- agent platform presence
- memory entries
- reports
- report chat history
- compare entities
- source files / source metadata
- admin/audit logs

### SQLite stays runtime-local
Do not try to make SQLite the main product database.

---

## Recommended backend package structure (illustrative)

```text
backend/
  app/
    api/
      simulations.py
      reports.py
      compare.py
      audiences.py
      agents.py
      knowledge.py
      billing.py
      team.py
      admin.py
    services/
      brief_service.py
      planner_service.py
      audience_service.py
      agent_service.py
      simulation_service.py
      runtime_bridge_service.py
      memory_service.py
      report_service.py
      compare_service.py
      billing_service.py
      knowledge_service.py
      admin_service.py
    runtime/
      launcher.py
      supervisor.py
      state_reader.py
      event_bridge.py
      interview_bridge.py
      config_builder.py
      health.py
    workers/
      jobs.py
      queues.py
      retry_policy.py
    adapters/
      oasis_adapter.py
      llm_adapter.py
      storage_adapter.py
      stream_adapter.py
      parser_adapter.py
      search_adapter.py
    repositories/
      simulations.py
      reports.py
      audiences.py
      agents.py
      memory.py
      billing.py
      compare.py
      teams.py
      admin.py
    schemas/
      simulation.py
      report.py
      compare.py
      audience.py
      agent.py
      billing.py
      events.py
      admin.py
    auth/
      guards.py
      permissions.py
    billing/
      credit_rules.py
      entitlements.py
    admin/
      oversight.py
      audits.py
    utils/
      logging.py
      time.py
      ids.py
```

---

## Scalability model

### Standard scale
Must comfortably support self-serve workflows up to standard plan limits.

### High scale
For upper business plan ranges, backend must support:
- stronger supervision
- event downsampling/summarization where needed
- more efficient stream delivery
- careful metric rollups

### Enterprise / hyperscale
May require:
- managed execution paths
- queue prioritization
- tenant-level limits
- more careful memory/report scheduling
- custom compute controls

---

## Observability requirements

The backend should have strong internal observability for:
- run state transitions
- job failures
- LLM request failures
- OASIS runtime failures
- stream failures
- billing/credit failures
- memory update failures
- report generation failures

### Minimum needs
- structured logging
- run/job IDs
- admin-visible failure state
- retry traces
- cost/accounting visibility for model calls

---

## Security and safety boundaries

### Required
- workspace scoping
- private audience isolation
- report visibility control
- billing integrity
- admin auditability
- controlled enterprise overrides

### Important
Even if the product is simulation-heavy, backend security and tenancy rules remain critical.

---

## Anti-patterns to avoid

### Do not
- put business logic in API routes
- let frontend compute core simulation metrics from raw streams alone
- merge runtime and product persistence into one messy storage layer
- directly expose raw OASIS internals to product clients
- let report generation be a one-shot unstructured endpoint
- let memory updates happen informally without persistence discipline

---

## Non-negotiable backend requirements

The backend must:
- preserve OASIS as runtime truth
- supervise long-running simulation jobs
- normalize live events
- support persistent synthetic agents
- support report and compare flows
- support billing and credits
- support enterprise/admin operations
- remain modular and debuggable

---

## Final rule for Claude

**Build the backend as a modular orchestration and product services layer around OASIS. FastAPI and service modules should coordinate the user workflow, runtime execution, memory transformation, reporting, and billing while keeping OASIS as the live simulation engine and SQLite as the per-run operational truth.**


---

## Implementation Status (as of 2026-04-14)

### Module implementation

| Module | Status | Key files |
|--------|--------|-----------|
| `api/` | 5 routers implemented (simulations 12 endpoints, reports 3, compare 3, audiences 3, stream 1). 5 stubs remain (agents, knowledge, billing, team, admin). | `api/simulations.py`, `api/reports.py`, `api/compare.py`, `api/audiences.py`, `api/stream.py` |
| `services/` | 7 implemented (simulation, brief, planner, agent, audience, report, compare). 5 stubs (billing, knowledge, memory, runtime_bridge, admin). | Services use repository pattern exclusively. |
| `runtime/` | 5 implemented (oasis_worker, config_builder, launcher, supervisor, event_bridge, state_reader). 2 stubs (interview_bridge, health). | `oasis_worker.py` runs real OASIS env.step() loop. |
| `repositories/` | 5 implemented (simulations, agents, billing, reports, compare). 4 stubs. | All services route through repositories. |
| `schemas/` | 4 implemented (simulation, audience, report, compare). 4 stubs. | |
| `adapters/` | 2 implemented (llm_adapter with Anthropic+DeepSeek). stream_adapter DEFERRED. 4 stubs. | |
| `auth/` | guards.py fully implemented, permissions.py fully implemented. | 4 FastAPI dependencies + 10 permission functions. |
| `billing/` | Implemented: credit_rules.py (full formula), entitlements.py (plan checks). | |
| `admin/` | Stubs. | |
| `workers/` | Stubs. OASIS currently runs via asyncio.create_task, not ARQ. | |

### Architecture pattern compliance
- **API layer thin**: ✓ validates auth, calls services
- **Services own orchestration**: ✓ all business logic in services
- **Services use repositories**: ✓ zero direct DB calls in services
- **Adapters isolate externals**: ✓ LLM routing via llm_adapter
- **Repository pattern**: ✓ established and enforced across all implemented services

### Total API endpoints: 26 implemented
