# APP_STRUCTURE_AND_PAGES.md

## Purpose

This document defines the full frontend information architecture of Raktio:
- primary navigation
- sidebar structure
- all major pages and sub-pages
- the purpose of each page
- how pages connect to each other
- which areas are core product, intelligence, operations, or enterprise/admin

Raktio is not a simple dashboard app.  
It is a simulation platform with a large surface area, so page architecture must remain intentional and hierarchical.

---

## Core UX principle

Raktio should feel like a **simulation intelligence workspace**, not a generic SaaS.

That means:
- the Simulation Canvas is the product heart
- overview pages support decisions, not decoration
- every major screen must have a clear role in the lifecycle
- the app must support both active work and historical analysis
- enterprise/admin sections must be separated from the main product flow

---

## Top-level product zones

The product is divided into these top-level zones:

1. **Workspace**
2. **Intelligence**
3. **Operations**
4. **Enterprise / Admin**

These zones should be visible in navigation grouping and reflected consistently in routing.

---

## Sidebar structure

### WORKSPACE
- Overview
- New Simulation
- Active Simulations
- Reports
- Compare Lab

### INTELLIGENCE
- Audience Studio
- Agent Atlas
- Knowledge & Sources
- Graph Explorer

### OPERATIONS
- Credits & Billing
- Integrations
- Team & Governance
- Settings

### ENTERPRISE / ADMIN
- Admin Control
- Model & Cost Control
- Audit Logs
- Tenant Management

---

## Routing model (recommended)

### Workspace
- `/overview`
- `/sim/new`
- `/simulations`
- `/sim/:id`
- `/reports`
- `/reports/:id`
- `/compare`
- `/compare/:id`

### Intelligence
- `/audiences`
- `/audiences/:id`
- `/agents`
- `/agents/:id`
- `/knowledge`
- `/knowledge/:id`
- `/graph`

### Operations
- `/billing`
- `/integrations`
- `/team`
- `/settings`

### Enterprise / Admin
- `/admin`
- `/admin/costs`
- `/admin/audit`
- `/admin/tenants`

---

## Page-by-page specification

# 1. Overview

## Route
`/overview`

## Purpose
The Overview page is the product home for active users.

It should answer:
- what is currently happening
- what simulations matter right now
- what recent insights were important
- how many credits remain
- which runs need attention
- what audiences and reports are most relevant

## Primary blocks
- credit balance summary
- active simulations panel
- recent reports panel
- latest key findings / alerts
- compare highlights
- saved audiences snapshot
- recent agent/activity intelligence
- quick launch button for New Simulation

## Key actions
- open active simulation
- create new simulation
- open latest report
- open compare chain
- inspect alerts
- jump to billing if credits are low

## Notes
This page must be useful and dense, not a decorative “welcome dashboard”.

---

# 2. New Simulation

## Route
`/sim/new`

## Purpose
Entry point for creating a new simulation.

This page must convert a raw brief into a configured run.

## Core flow
- input brief
- upload files/images
- specify goal
- AI brief understanding
- audience recommendation
- geography/platform recommendation
- user overrides
- cost/credit estimate
- launch simulation

## Sections
### A. Input
- text area
- file upload
- image upload
- goal/type selector
- optional tags

### B. AI Understanding
- brief summary
- detected topic
- detected entities
- candidate audience logic
- confidence/rationale notes

### C. Configuration
- agent count
- simulated duration
- geography
- platform mix
- stance distribution
- recsys
- add-ons

### D. Pricing / Launch
- cost in credits
- included vs extra features
- estimated bootstrap time
- estimated runtime complexity
- launch button

## Key actions
- accept AI recommendation
- override manually
- save draft
- launch run

---

# 3. Active Simulations

## Route
`/simulations`

## Purpose
Operational list of simulations in draft, running, paused, completed, failed, or recently finished states.

## Primary blocks
- filters by status
- table/grid of simulations
- live status chips
- progress indicators
- agent count
- platform/geography summary
- simulated duration
- elapsed real time
- owner/workspace
- alert state

## Key actions
- open simulation canvas
- pause/resume (if allowed)
- clone
- archive
- open report
- troubleshoot failed run

## Notes
This page is especially important for power users and teams.

---

# 4. Simulation Canvas

## Route
`/sim/:id`

## Purpose
The central live workspace of Raktio.

This is the page where the user watches the simulated world react in real time and interacts with it.

## Required modes
- Feed
- Network
- Timeline
- Geo
- Segments
- Compare

## Core layout
### Header
- simulation name
- status
- simulated time
- real elapsed time
- agent count
- platform/geography summary
- pause/stop/clone buttons

### Left rail
- filters
- segment controls
- platform filter
- geography filter
- sentiment filter
- stance filter
- event-type filter

### Main canvas
Switchable view mode:
- Feed mode
- Network mode
- Timeline mode
- Geo mode
- Segments mode
- Compare mode

### Right rail
- live metrics
- sentiment
- polarization
- top amplifiers
- alerts
- trend topics
- belief tracker
- run activity summary

## Key actions
- change canvas mode
- drill into agent
- drill into relation
- open interview
- bookmark event
- switch segment
- replay recent time slice
- clone run for compare

## Notes
This page is the product heart and must feel premium, alive, and highly useful.

---

# 5. Reports

## Route
`/reports`

## Purpose
List and manage completed reports.

## Primary blocks
- recent reports
- filters by workspace / simulation type / status
- summary cards
- compare-ready reports
- exported reports
- bookmarked reports

## Key actions
- open report
- compare with another report
- export/share
- reopen parent simulation
- duplicate simulation from report

---

# 6. Report Detail

## Route
`/reports/:id`

## Purpose
Deep analysis page for a completed simulation.

## Sections
- executive summary
- key findings
- belief shifts
- patient zero / top amplifiers
- segment analysis
- geography analysis
- platform analysis
- recommendations
- evidence
- confidence / limitations
- report chat

## Side content
- workflow progress log (curated, not overly raw)
- evidence links
- quick filter by section

## Key actions
- chat with report
- export PDF
- share
- clone simulation
- compare report
- inspect evidence

---

# 7. Compare Lab

## Route
`/compare`

## Purpose
Workspace for side-by-side analysis of variants, versions, or scenarios.

## Compare types
- simulation A vs B
- original vs edited brief
- different audience mixes
- different platform mixes
- different geography mixes
- different time horizons

## Primary blocks
- compare scenario selector
- summary difference cards
- metric deltas
- report deltas
- sentiment comparison
- belief shift comparison
- geography comparison
- patient zero / amplifier comparison

## Key actions
- open both simulations
- open detailed compare
- save compare
- export compare
- rerun from compare baseline

---

# 8. Compare Detail

## Route
`/compare/:id`

## Purpose
Detailed side-by-side analysis of a specific comparison.

## Main areas
- summary winner/loser
- metric diff matrix
- key event divergence timeline
- segment-by-segment comparison
- platform-by-platform comparison
- recommendation summary
- decision note area

---

# 9. Audience Studio

## Route
`/audiences`

## Purpose
Create, save, inspect, and reuse synthetic populations.

## Primary blocks
- saved audiences
- global pool segments
- private audiences
- imported/source-derived audiences
- filters by geography, traits, platform presence

## Audience creation methods
- AI-generated from brief
- filter-based selection
- source-informed generation
- clone and edit
- private audience creation

## Key actions
- create audience
- preview audience
- save audience
- attach to simulation
- duplicate audience
- inspect coverage quality

---

# 10. Audience Detail

## Route
`/audiences/:id`

## Purpose
Deep inspection of a saved audience.

## Sections
- audience summary
- size and distribution
- geography distribution
- platform distribution
- psychographic composition
- demographic composition
- representative agent samples
- usage history
- quality/coverage notes

## Key actions
- use in simulation
- edit audience
- duplicate
- promote to private audience
- inspect sample agents

---

# 11. Agent Atlas

## Route
`/agents`

## Purpose
Explore the persistent synthetic population.

## Primary blocks
- searchable agent directory
- filters by geography, platform presence, interests, profession, stance, activity, influence
- top amplifiers
- most active agents
- newly generated agents
- agents by memory/topic exposure

## Key actions
- open agent profile
- inspect memory
- inspect network presence
- use as sample reference
- filter by simulation participation

---

# 12. Agent Profile

## Route
`/agents/:id`

## Purpose
Detailed persistent profile for a synthetic user.

## Sections
- identity summary
- avatar
- username / display name
- location
- demographic profile
- psychographic profile
- platform presence
- follower/influence profile
- memory timeline
- simulation history
- relationships / graph links
- recent posts/interviews

## Key actions
- interview agent
- inspect simulation participation
- inspect related agents
- inspect topic exposure
- open in graph context

---

# 13. Knowledge & Sources

## Route
`/knowledge`

## Purpose
Show uploaded files, extracted knowledge, source lineage, and semantic grounding.

## Primary blocks
- source library
- uploaded files
- extracted entities/topics
- source-to-audience linkage
- source-to-report linkage
- status of parsed inputs

## Key actions
- upload source
- inspect extraction
- link source to audience
- inspect source usage in report

---

# 14. Source Detail

## Route
`/knowledge/:id`

## Purpose
Inspect a single source file or source set.

## Sections
- file summary
- parsed content summary
- extracted entities/topics
- linked simulations
- linked audiences
- linked report evidence
- notes / metadata

---

# 15. Graph Explorer

## Route
`/graph`

## Purpose
Dedicated graph exploration workspace outside of a single live run.

## Use cases
- inspect social relations across a run
- inspect persistent relationship snapshots
- inspect factions
- inspect amplifier chains
- inspect source/topic graph slices

## Key actions
- filter graph
- inspect node/edge
- jump to agent
- jump to simulation
- jump to report evidence

---

# 16. Credits & Billing

## Route
`/billing`

## Purpose
Commercial page for credits, plans, packs, and consumption.

## Sections
- current plan
- included credits
- bonus credits
- annual discount info
- current balance
- usage history
- credit packs
- upgrade prompts
- enterprise contact entry

## Key actions
- upgrade plan
- buy credits
- view invoice/payment history
- contact sales for enterprise

---

# 17. Integrations

## Route
`/integrations`

## Purpose
Manage external systems and future source integrations.

## Examples
- source imports
- CRM-like inputs
- document pipelines
- locale/language support hooks
- future enterprise connectors

## Notes
Can start lean but must exist architecturally.

---

# 18. Team & Governance

## Route
`/team`

## Purpose
Manage collaboration and permissions in team/business contexts.

## Sections
- members
- roles
- workspaces
- permissions
- access policies
- activity history
- simulation ownership

## Key actions
- invite member
- change role
- move simulation ownership
- manage access

---

# 19. Settings

## Route
`/settings`

## Purpose
Workspace and user settings.

## Sections
- profile settings
- locale
- notification preferences
- default simulation preferences
- credit alerts
- appearance / UI preferences
- workspace defaults

---

# 20. Admin Control

## Route
`/admin`

## Purpose
Administrative operations center for product owners or org admins.

## Sections
- platform health
- simulation oversight
- user/org overview
- agent pool oversight
- pricing controls
- failures / alerts

---

# 21. Model & Cost Control

## Route
`/admin/costs`

## Purpose
Advanced admin area for model routing and cost governance.

## Sections
- model usage policy
- cost per route
- planner/report model choices
- credit formula controls
- scale tier policy
- enterprise overrides

---

# 22. Audit Logs

## Route
`/admin/audit`

## Purpose
Trace administrative and sensitive events.

## Sections
- billing changes
- team changes
- simulation state changes
- admin overrides
- pricing changes
- enterprise support actions

---

# 23. Tenant Management

## Route
`/admin/tenants`

## Purpose
Manage organizations, enterprise workspaces, and special access tiers.

## Sections
- org list
- contract flags
- usage tier
- custom limits
- managed compute notes
- enterprise support status

---

## Navigation rules

### Rule 1
The Simulation Canvas must never be buried.  
It is the center of the product.

### Rule 2
Intelligence pages must support the simulation workflow, not feel disconnected.

### Rule 3
Commercial and admin pages must be clearly separated from the creative/analytical workspace.

### Rule 4
Users should be able to move fluidly between:
- simulation
- report
- compare
- audience
- agent
without losing context.

---

## Cross-page navigation flows

### Flow A — Create and run
Overview -> New Simulation -> Simulation Canvas -> Report -> Compare

### Flow B — Work from report
Report -> Clone Simulation -> New Simulation (prefilled) -> Simulation Canvas -> Compare

### Flow C — Work from audience
Audience Studio -> Audience Detail -> New Simulation (audience preselected) -> Simulation Canvas

### Flow D — Work from agent
Agent Atlas -> Agent Profile -> Related Simulation / Interview / Graph Explorer

### Flow E — Enterprise operations
Overview -> Billing / Team -> Admin / Cost Control / Tenant Management

---

## Priority ranking of pages

### Tier 1 (must feel exceptional)
- New Simulation
- Simulation Canvas
- Report Detail
- Overview

### Tier 2 (must be strong)
- Compare Lab
- Audience Studio
- Agent Profile
- Billing

### Tier 3 (important supporting infrastructure)
- Active Simulations
- Reports list
- Knowledge & Sources
- Team & Governance
- Integrations

### Tier 4 (admin / advanced)
- Graph Explorer
- Admin Control
- Cost Control
- Audit Logs
- Tenant Management

---

## Final rule for Claude

**Treat the app as a simulation intelligence workspace, not a generic SaaS with a few dashboard pages. The page system must revolve around New Simulation, the Simulation Canvas, Reports, Compare workflows, persistent audiences, persistent agents, and clear separation between user workspace and admin/enterprise operations.**


---

## Implementation Status (2026-04-15, post Step 11 Phase 1)

### Backend — Complete
- 46 endpoints across 10 routers, fully implemented and tested
- 28 tables live (migrations 001-010)

### Frontend — Raktio Dashboard (`/raktio-dashboard`)
Primary frontend: Vite 6 + React 19 + Tailwind CSS 4 + React Router

**Shell:**
- Fixed sidebar (4 groups: Workspace, Intelligence, Operations, Admin)
- Fixed topbar (search, credit pill, theme toggle, notifications, profile)
- Scrollable content area with ErrorBoundary
- Dark mode default, light mode working (localStorage persistence)
- Loading/error/empty state patterns on 6 core pages

**Implemented Pages (23):**

| Route | Page | Status |
|-------|------|--------|
| `/` | Landing Page | DONE |
| `/login` | Login | DONE |
| `/signup` | Sign Up | DONE |
| `/onboarding` | Onboarding | DONE |
| `/pricing` | Pricing | DONE |
| `/overview` | Workspace Overview | DONE (operational hub) |
| `/simulations` | Simulations | DONE (status tabs, 3-dot menu) |
| `/sim/new` | New Simulation | DONE (7-step wizard) |
| `/sim/:id/canvas` | Simulation Canvas | DONE (3 modes full, 3 placeholder) |
| `/reports` | Reports List | DONE |
| `/reports/:id` | Report Detail | DONE (14 sections, sidebar nav) |
| `/compare` | Compare Lab | DONE (selectors, deltas, actions) |
| `/audiences` | Audience Studio | DONE (dual-column builder) |
| `/agents` | Agent Atlas | DONE (split-pane, interview) |
| `/agents/:id` | Agent Profile | DONE |
| `/knowledge` | Knowledge & Sources | DONE |
| `/graph` | Graph Explorer | DONE (placeholder graph, sim selector) |
| `/billing` | Credits & Billing | DONE |
| `/integrations` | Integrations | DONE |
| `/team` | Team & Governance | DONE |
| `/settings` | Settings | DONE |
| `/admin` | Admin Control | DONE |
| `/admin/costs` | Model & Cost Control | DONE |
| `/admin/audit` | Audit Logs | DONE |
| `/admin/tenants` | Tenant Management | DONE |

**What remains mock (pending Step 11 Phase 2 — API integration):**
- All pages use hardcoded mock data
- No real API calls to backend endpoints yet
- Canvas SSE streaming not connected
- Canvas Timeline/Segments/Compare modes are placeholder components

### Next.js Frontend (`/frontend`) — Preserved as reference
Contains useful assets: Supabase auth middleware, SSE hook (useSimulationStream), TypeScript types (simulation, agent, billing). Pages remain stubs.
