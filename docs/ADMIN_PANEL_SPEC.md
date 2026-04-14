# ADMIN_PANEL_SPEC.md

## Purpose

This document defines the Admin Panel of Raktio.

The admin layer is not a cosmetic backoffice.  
It is the operational control center for:
- product oversight
- simulation supervision
- pricing and credit governance
- tenant/org oversight
- runtime health and failure handling
- model and cost control
- persistent population oversight
- enterprise support operations

Raktio is a complex simulation platform.  
It needs a serious admin/control plane.

---

## Core admin rule

**The admin panel must operate like a control plane, not a generic CRUD backoffice.**

It must help operators answer questions like:

- Which runs are currently active?
- Which runs are failing or degraded?
- Which orgs are consuming unusual amounts of credits?
- What simulation configurations are driving cost?
- Is the persistent agent pool healthy and balanced?
- Are certain geographies/platforms under-covered?
- Are report jobs failing?
- Do we need to intervene on a tenant, run, or pricing rule?

---

## Admin panel mission

The admin area should support four big goals:

1. **Platform health and supervision**
2. **Commercial and pricing control**
3. **Population and content oversight**
4. **Enterprise/tenant operations**

---

## Top-level admin sections

Recommended admin navigation:

- Admin Overview
- Simulation Oversight
- Runtime Health
- Population Control
- Pricing & Credits Control
- Plan Management
- Tenant Management
- Audit & Compliance
- Failures & Recovery
- Model & Cost Control
- Source / Storage Oversight (optional but useful)

---

## Route structure (recommended)

- `/admin`
- `/admin/simulations`
- `/admin/runtime`
- `/admin/population`
- `/admin/pricing`
- `/admin/plans`
- `/admin/tenants`
- `/admin/audit`
- `/admin/failures`
- `/admin/costs`
- `/admin/storage`

---

# 1. Admin Overview

## Route
`/admin`

## Purpose
Global control-plane landing page for operators.

## Must show
- active simulations count
- simulations by status
- failed runs today
- report generation failures
- credit usage today / week / month
- top consuming organizations
- top consuming simulation types
- current model spend indicators
- population growth summary
- memory job status
- urgent alerts

## Key actions
- open stuck/failing runs
- open cost anomalies
- open top-consuming tenant
- inspect system health
- open credit/pricing controls
- trigger admin investigation flows

## UX note
This page should feel operational and serious, not like a marketing dashboard.

---

# 2. Simulation Oversight

## Route
`/admin/simulations`

## Purpose
Observe and manage all simulations across the platform.

## Must show
- simulation list/table
- workspace/org
- owner
- status
- run ID
- agent count
- duration
- platforms
- geographies
- current stage
- credit estimate / actual credit consumption
- created at / started at / ended at
- anomaly flags

## Filters
- by status
- by workspace/org
- by scale tier
- by simulation goal
- by platform mix
- by geography scope
- by time range
- by failure state

## Key actions
- inspect simulation
- inspect run config
- open live canvas
- pause/stop/cancel (if admin policy allows)
- rerun from admin
- mark for support follow-up
- attach internal note

## Important
Admin must be able to distinguish:
- product simulation metadata
- actual runtime state
- failure reason
- cost pattern

---

# 3. Runtime Health

## Route
`/admin/runtime`

## Purpose
Monitor the health of the simulation runtime layer.

## Must show
- currently running jobs
- runtime worker status
- queue backlog
- bootstrapping bottlenecks
- average run start time
- average reporting time
- runtime error rate
- interview timeout rate
- event bridge health
- memory update health
- high-scale run pressure

## Key modules
- live worker status
- queue depth
- run-stage distribution
- runtime latency indicators
- stream pipeline health
- system alerts

## Key actions
- inspect a worker
- inspect a stuck run
- retry a failed stage
- mark worker unhealthy
- trigger maintenance procedure
- inspect OASIS bridge errors

## UX note
This page is for operators, so it can be more technical than user-facing pages, but still should remain structured and readable.

---

# 4. Population Control

## Route
`/admin/population`

## Purpose
Oversee the persistent synthetic population.

## Must show
- total persistent agent count
- new agents created over time
- distribution by country/region
- distribution by platform presence
- diversity indicators
- geography coverage gaps
- psychographic coverage gaps
- private population count
- memory update freshness
- top-used agents / overused agents
- duplicate/similarity anomaly indicators

## Why this page matters
Raktio’s population is a core asset.  
Operators need to ensure it remains:
- healthy
- broad
- realistic
- balanced
- scalable

## Key actions
- inspect coverage gaps
- trigger controlled agent generation
- inspect a problematic agent cluster
- inspect private population boundaries
- review generation quality
- quarantine broken or suspicious synthetic profiles if needed

## Important rule
This page should never encourage careless destructive edits to the global population.

---

# 5. Pricing & Credits Control

## Route
`/admin/pricing`

## Purpose
Control and observe the platform’s credit economics.

## Must show
- current pricing rule set
- credit consumption by driver:
  - agent count
  - time
  - geography
  - platforms
  - add-ons
- top cost-driving run shapes
- margin-relevant anomaly views
- plan usage distribution
- credit burn by tenant
- low-credit churn risk
- pack purchase behavior

## Key actions
- adjust pricing parameters
- adjust credit consumption formulas
- change add-on pricing rules
- change yearly discount rules
- review impact before publishing changes
- log pricing changes for audit

## Important
Pricing changes should require explicit logging and be reversible.

---

# 6. Plan Management

## Route
`/admin/plans`

## Purpose
Manage subscription plans and plan entitlements.

## Must show
- plan catalog
- monthly/annual prices
- included credits
- bonus credits
- scale limits
- feature entitlements
- enterprise flags
- plan adoption metrics

## Key actions
- create or edit plan
- activate/deactivate plan
- change included credits
- change annual pricing
- adjust self-serve scale limits
- control which features unlock on which plan

## Example feature flags
- compare mode access
- ask-the-crowd access
- report premium access
- private audiences
- 50k scale access
- advanced replay
- enterprise-only exports

---

# 7. Tenant Management

## Route
`/admin/tenants`

## Purpose
Manage organizations, workspaces, and enterprise customers.

## Must show
- org list
- current plan
- current balance / usage pattern
- top simulations
- risk flags
- enterprise status
- contract notes
- support status
- private audience usage
- admin notes

## Filters
- by plan
- by spend
- by activity
- by support priority
- by custom contract status
- by delinquency or risk state

## Key actions
- upgrade/downgrade org plan
- assign enterprise flag
- add internal note
- view recent simulations
- inspect workspace composition
- apply custom limits
- adjust credits manually (audited)
- handoff to support/sales

---

# 8. Audit & Compliance

## Route
`/admin/audit`

## Purpose
Provide a durable log of sensitive actions.

## Must show
- pricing changes
- credit adjustments
- plan changes
- admin overrides
- tenant changes
- simulation cancellations by admin
- private audience access changes
- permission changes
- enterprise policy changes
- manual support interventions

## Key features
- strong filtering
- export
- traceability
- actor / timestamp / entity / diff view

## Important
This is especially relevant once enterprise customers exist.

---

# 9. Failures & Recovery

## Route
`/admin/failures`

## Purpose
Central place for failure investigation and recovery workflows.

## Must show
- failed simulations
- failed report jobs
- failed memory jobs
- interview failures/timeouts
- stream bridge failures
- parser failures
- billing/credit reservation failures
- unresolved failure backlog

## For each failure record show
- entity type
- simulation/run/report/job
- tenant/workspace
- failure stage
- failure summary
- timestamp
- retry count
- current resolution status

## Key actions
- retry job
- reopen job
- mark resolved
- add internal note
- escalate to engineering
- attach root-cause tag

## Important
Failures should be understandable and operationally actionable, not vague exceptions.

---

# 10. Model & Cost Control

## Route
`/admin/costs`

## Purpose
Control LLM and model-routing economics.

## Must show
- model routing policy
- planner model usage
- report model usage
- enrichment model usage
- average cost per simulation by tier
- average report cost
- highest-cost runs
- top cost spikes
- current cost anomalies
- enterprise managed run cost behavior

## Key actions
- adjust model routing policy
- route certain simulation sizes to different model strategies
- adjust report model strategy
- change thresholds for managed runs
- inspect cost impact before publishing
- set admin-level warnings

## Why this matters
Raktio is a simulation product with variable runtime/computation patterns.  
Cost control must be explicit and actively managed.

---

# 11. Source / Storage Oversight

## Route
`/admin/storage`

## Purpose
Monitor uploaded source data, storage usage, and artifact generation.

## Must show
- source ingestion queue
- parse success/failure
- storage usage
- large files
- export generation volume
- orphaned artifacts
- cleanup candidate data
- source-linked simulation usage

## Key actions
- inspect failed parse
- reprocess source
- delete or archive stale artifacts
- investigate storage growth
- inspect export generation pipeline

---

## Admin metrics hierarchy

The admin panel should organize signals into four classes:

### A. Operational health
- run status
- worker status
- queue health
- failures

### B. Commercial health
- credits
- plan usage
- spend patterns
- cost anomalies

### C. Population health
- agent growth
- coverage
- diversity
- memory freshness

### D. Enterprise/tenant health
- org activity
- special contract needs
- private audience use
- governance visibility

This hierarchy prevents admin clutter.

---

## Admin role separation

Not every admin user should see or control everything equally.

### Example roles
- product admin
- ops admin
- billing admin
- support admin
- tenant success admin
- super admin

### Why
Because simulation, billing, tenant, and cost control are different powers.

---

## Required admin capabilities

The admin plane must support:

- view and filter all simulations
- inspect failure states
- inspect cost and credit behavior
- manage plans and pricing
- inspect and govern synthetic population health
- manage org/tenant state
- view audit history
- trigger safe retries or interventions
- control model/cost policies
- support enterprise operations

---

## Admin UX principles

### Must feel
- structured
- controlled
- trustworthy
- operational
- calm under load

### Must not feel
- noisy
- flashy
- consumer-like
- experimental
- overloaded with decorative widgets

### Visual recommendation
Use a more restrained variant of the product design language:
- dense tables where useful
- strong filters
- clear state chips
- compact scorecards
- operational alert panels

---

## Anti-patterns to avoid

### Do not
- make admin a shallow CRUD screen set
- mix end-user product pages with sensitive admin pages
- hide failure causes behind vague statuses
- allow pricing or credits changes without audit
- allow destructive population edits casually
- make model routing invisible to operators
- let support actions happen without notes/history

---

## Suggested admin data dependencies

Admin pages should pull from:
- simulation registry
- run status and runtime health
- credit ledger
- plan catalog
- agent and audience coverage summaries
- failure registry
- audit logs
- model usage tracking
- source/storage metadata

They should not read raw runtime internals directly unless through safe, normalized admin views.

---

## Final rule for Claude

**Design the admin panel as Raktio’s operational control plane. It must support platform health, simulation oversight, pricing and credit governance, tenant management, population health, model/cost control, and audited intervention workflows. Never reduce it to a simple CRUD dashboard.**


---

## Implementation Status (as of 2026-04-14)

### Status: IMPLEMENTED (Step 9)

#### Admin API endpoints (8)
- GET /admin/overview — platform dashboard (sims, population, credits, LLM costs, failures)
- GET /admin/tenants — list orgs with plan info
- GET /admin/tenants/{id} — org detail with plan join
- GET /admin/simulations — cross-workspace sim list with status filter
- GET /admin/runtime — active runs, recent completions, failures
- GET /admin/costs — LLM cost summary by route/provider
- GET /admin/population — agent pool stats with country distribution
- GET /admin/audit — audit log entries with filters

#### Auth
- `require_admin()` checks `workspace_memberships` for `role=platform_admin`
- Non-admins get 403

#### Tables
- `audit_logs` live (migration 007, 20 tables total)
- `runtime_failure_records` not created — failure data from simulation_runs

#### Frontend
- 11 admin pages remain placeholder stubs (Step 11)
