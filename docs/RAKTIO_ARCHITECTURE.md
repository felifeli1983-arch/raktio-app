# RAKTIO_ARCHITECTURE.md

## Purpose

This document defines the architectural structure of Raktio at a system level.

Raktio must be built as a **three-layer platform**:

1. **OASIS Runtime Layer** — the true social simulation engine
2. **Intelligence Layer** — planning, memory, graph, reporting, and orchestration patterns inspired selectively by MiroFish
3. **Raktio Product Layer** — the SaaS application, Simulation Canvas, persistent synthetic population, billing, admin, and governance

This separation is mandatory.  
It prevents architecture drift, protects the OASIS-first principle, and makes the product scalable and maintainable.

---

## Core architectural rule

**Raktio is OASIS-powered, not OASIS-decorated.**  
The system must not replace OASIS social simulation logic with simplified one-shot prompting or fake feed generation.

At the same time, Raktio must not become a clone of MiroFish’s research workflow.  
It must remain a **product-grade simulation platform**.

---

## Layer 1 — OASIS Runtime Layer

### Role
The OASIS Runtime Layer is the operational heart of each simulation run.

It owns:
- environment stepping
- social actions
- world state
- recommendation/exposure logic
- run-local SQLite state
- time progression
- autonomous agent behavior
- manual actions and interviews

### Main responsibilities
- execute simulation steps
- maintain platform state during a run
- store posts/comments/follows/mutes/rec tables in run DB
- log action traces
- expose runtime outputs to the event bridge
- support interviews and manual interventions
- respect simulated time and activity rhythms

### What belongs here
- `OasisEnv`
- `Platform`
- social actions
- recommendation systems
- SQLite run database
- trace/event logging
- clock/time model
- interview/manual action primitives
- group chat primitives

### What must not belong here
- SaaS billing logic
- persistent global user population
- multi-tenant workspace logic
- admin configuration UI
- high-level product reporting UI
- frontend state management
- final cross-run memory policy

### Architectural principle
The runtime layer is **run-centric**, not product-centric.  
It is responsible for the truth of a single simulation while it is executing.

---

## Layer 2 — Intelligence Layer

### Role
The Intelligence Layer wraps the OASIS runtime with higher-level reasoning, planning, semantic memory, and report generation capabilities.

This layer borrows selectively from MiroFish-like patterns, but is redesigned for Raktio.

### Main responsibilities
- interpret briefs and uploaded materials
- extract structured concepts/entities/topics
- generate simulation configuration suggestions
- generate or enrich agent profiles
- convert runtime events into semantic memory episodes
- support report reasoning and post-run analysis
- provide search and insight tooling over simulation outputs
- drive explainability and rationale surfaces

### Functional modules

#### 1. Brief Understanding
Reads:
- user prompt
- images
- PDFs / docs / text
- uploaded materials

Outputs:
- topic understanding
- relevant entities
- contextual concepts
- simulation goal classification
- audience hypotheses

#### 2. Simulation Planner
Given the brief, proposes:
- agent count
- geography distribution
- platform mix
- stance mix
- recommended duration
- recsys suggestion
- complexity level

This planner should be AI-assisted but user-editable.

#### 3. Profile Enrichment
Supports generation/enrichment of:
- biography
- profession
- interests
- psychographic traits
- platform styles
- local geography identity
- behavior presets

#### 4. Memory Transformation Layer
Converts simulation events into:
- readable semantic episodes
- persistent memory summaries
- relationship evidence
- topic history
- report evidence

This is one of the most important cross-run intelligence components.

#### 5. Report Intelligence Layer
Supports:
- evidence-backed summary generation
- insight decomposition
- entity/topic search
- graph-aware analysis
- interactive report chat
- interview-driven follow-up analysis

#### 6. Explainability Layer
Explains:
- why a certain audience was suggested
- why certain geographies/platforms were recommended
- why the system chose a certain run shape
- how robust the simulation sample is
- what limits apply to the interpretation

### What belongs here
- ontology extraction patterns
- planner logic
- profile generation/enrichment logic
- event-to-memory transformation
- report search tools
- report reasoning workflows
- simulation setup intelligence
- explainability and rationale modules

### What must not belong here
- direct replacement of OASIS runtime
- feed rendering
- tenant billing
- workspace routing
- admin UX
- low-level SQLite run truth

### Architectural principle
The intelligence layer is **meaning-centric**.  
It interprets, enriches, explains, and synthesizes.  
It does not replace the runtime.

---

## Layer 3 — Raktio Product Layer

### Role
The Product Layer is the actual application users pay for and interact with.

It owns:
- SaaS workflows
- persistent synthetic population
- Simulation Canvas
- reports UI
- compare workflows
- credits and billing
- team and governance
- admin operations
- user-facing product experience

### Main responsibilities
- manage workspaces and simulations
- own the persistent global agent pool
- allow users to create, run, monitor, compare, and export simulations
- provide live visualization of a running world
- expose reports and interviews
- control billing, credits, and plans
- handle users, teams, admin, enterprise rules

### Functional modules

#### 1. Workspace Layer
Includes:
- overview/dashboard
- simulation list
- active simulations
- report history
- compare lab

#### 2. New Simulation Flow
Includes:
- brief ingestion
- setup wizard
- AI recommendations
- user overrides
- live cost/credit estimation
- launch workflow

#### 3. Simulation Canvas
This is the product heart.

Modes include:
- Feed
- Network
- Timeline
- Geo
- Segments
- Compare

This layer must make the world feel alive and observable.

#### 4. Agent & Audience Layer
Includes:
- persistent global population
- private audience collections
- Agent Atlas
- Audience Studio
- geography filters
- platform presence profiles

#### 5. Reporting Layer
Includes:
- executive summary
- key findings
- belief shift
- patient zero
- top amplifiers
- segment analysis
- recommendation engine
- report chat
- export/share

#### 6. SaaS Commercial Layer
Includes:
- plans
- credits
- packs
- annual discounts
- usage logic
- enterprise thresholds

#### 7. Team / Governance / Admin Layer
Includes:
- roles
- permissions
- audit logs
- tenant controls
- pricing controls
- run visibility
- large-scale enterprise support

### What belongs here
- frontend app
- backend API layer
- auth
- billing
- credit consumption rules
- persistent storage in Supabase
- simulation history
- user/team/org entities
- admin views
- UI/UX system

### What must not belong here
- low-level simulation stepping
- direct runtime mutation bypassing OASIS
- hard-coded research workflow constraints
- fake simulation outputs detached from runtime data

### Architectural principle
The product layer is **user-centric and SaaS-centric**.  
It translates the power of the runtime and intelligence layers into a clear, sellable, trustworthy application.

---

## Cross-layer relationship model

### Runtime -> Intelligence
Runtime emits:
- action traces
- state changes
- entities/events
- relationships
- timing data

Intelligence transforms them into:
- semantic memory
- insights
- evidence
- report inputs
- search index inputs

### Runtime -> Product
Runtime provides:
- live feed data
- graph events
- time progression
- action metrics
- run state

Product exposes these through:
- Simulation Canvas
- live metrics
- alerts
- progress UI
- replay/time navigation

### Intelligence -> Product
Intelligence provides:
- setup recommendations
- explainability
- report insights
- interview summaries
- memory timelines
- search-driven answers

Product exposes these through:
- planner UI
- reports
- Agent Atlas
- compare lab
- rationale cards

### Product -> Runtime
Product sends:
- simulation launch configs
- manual actions
- interview requests
- pause/resume/stop controls
- advanced setup values

### Product -> Intelligence
Product sends:
- uploaded files
- prompts
- user simulation goals
- requested report questions
- compare requests
- audience creation requests

---

## Storage architecture

### OASIS SQLite (per-run operational state)
Purpose:
- truth of the live simulation
- posts/comments/follows/mutes/rec tables
- fast local runtime access
- trace source

### Supabase/Postgres (persistent product state)
Purpose:
- users, orgs, workspaces
- persistent global agent pool
- simulation registry
- run summaries
- report objects
- audience definitions
- billing/credits
- admin/governance state
- cross-run memory and indexes

### Derived index / semantic layer
Purpose:
- report search
- memory retrieval
- source linkage
- entity/topic recall
- graph-aware reasoning

This can evolve over time, but conceptually it belongs to the Intelligence Layer.

---

## Persistent agent architecture

### Key rule
Agents are not temporary per-run ghosts.  
They are persistent synthetic social users of Raktio.

### Split model
#### Global agent identity
Persistent across runs:
- username
- display name
- geography
- psychographic profile
- platform presence
- avatar seed
- long-term memory summary

#### Run participation state
Specific to one simulation:
- role in this run
- runtime stance
- activity in this run
- what they posted
- what they reacted to
- influence during this run

This separation is mandatory.

---

## Multi-platform architecture

### Official model
Raktio uses **Multi-platform Model 1**.

That means:
- one unified simulation population
- one persistent agent identity
- platform-specific presence and behavior
- different behavioral outputs depending on context
- not five isolated simulations pretending to be related

### Implications
A single agent may:
- exist on X but not on LinkedIn
- be active on Instagram and TikTok but quiet on Reddit
- express a different tone and posting style per platform
- carry the same underlying beliefs/persona across all platforms

---

## Geographic architecture

### Core rule
Geo must remain dynamic even for single-country runs.

### Multi-country
Default geo view begins at:
- continent / macro-region
- then country level
- then drill-down

### Single-country
Default geo view must drill into:
- regions/states
- provinces/counties if supported
- cities / major local clusters

### Tiered depth
- Tier 1 countries: high drill-down
- Tier 2 countries: medium drill-down
- Tier 3 countries: basic depth

---

## Scale architecture

### Supported scale tiers
- Standard self-serve: up to 10,000 agents
- Top scale/business plan: up to 50,000 agents
- Enterprise: above 50,000
- Hyperscale / Super Enterprise: custom-managed toward OASIS upper capability ranges

### Meaning
Raktio must not be architecturally designed like a small toy simulator.  
It should be designed for serious scale, but exposed in user-facing tiers.

---

## Pricing architecture relationship

### Core rule
Credits are computed from:
- audience size
- simulated time
- platform count
- geography scope
- add-ons

### Relative weight
- audience size = strongest
- platform count = medium-strong
- simulated time = medium
- geography scope = light-medium
- add-ons = modular

This belongs to Product Layer logic, but depends on Runtime and Intelligence inputs.

---

## Explainability and trust architecture

### Required
Raktio must expose:
- why the planner recommended a certain setup
- why a certain audience split was suggested
- what the simulation is and is not claiming
- how robust the sample is
- confidence/uncertainty notes where appropriate

### Why
Without this, the product risks feeling like:
- fake magic
- black-box simulation theater
- expensive toy

With it, the product feels:
- intelligent
- transparent
- enterprise-ready
- credible

---

## Failure boundaries and anti-patterns

### Anti-pattern 1
Replacing OASIS runtime with prompt-generated fake social output

### Anti-pattern 2
Turning Raktio into a graph-first research lab UI

### Anti-pattern 3
Merging persistent agent identity with run-specific behavior

### Anti-pattern 4
Treating geography as a decorative map only

### Anti-pattern 5
Treating multi-platform as just a visual skin with no behavior distinction

### Anti-pattern 6
Letting product/admin concerns leak into runtime responsibilities

---

## Architectural blueprint summary

### OASIS Runtime Layer
Owns:
- live simulation truth

### Intelligence Layer
Owns:
- interpretation, planning, memory transformation, and analysis

### Product Layer
Owns:
- everything the user buys, sees, configures, compares, and manages

This layered model is the non-negotiable backbone of Raktio.

---

## Final rule for Claude

**Always preserve the three-layer architecture. OASIS remains the live social runtime, the intelligence layer provides planning/memory/report reasoning, and Raktio product services provide the persistent population, Simulation Canvas, SaaS workflows, pricing, reporting, admin, and enterprise experience. Never collapse these responsibilities into a single blurred layer.**
