# UI/UX Frontend Specification — Raktio

> **Single source of truth** for frontend/UI/UX generation and code integration.
> Based on real backend implementation state, not aspirational design.
> Last updated: 2026-04-15 (post Step 11 Phase 1)

---

## Purpose

This spec exists to:
1. Guide external UI generation (e.g., Google AI Studio, v0, Cursor)
2. Keep generated UI aligned with the real backend/runtime
3. Enable clean frontend integration without rework

**Rule**: every UI element described here has a real backend API behind it. Nothing speculative.

---

## 1. App Shell

### 1.1 Sidebar (App)

The app sidebar is the primary navigation for authenticated workspace users.

```
┌─────────────────────┐
│  [Raktio logo]      │
│  Workspace: ▾ name  │
├─────────────────────┤
│  Overview           │  → /overview
│  Simulations        │  → /simulations
│  New Simulation     │  → /sim/new
│  Reports            │  → /reports
│  Compare            │  → /compare
│  Agent Atlas        │  → /agents
│  Audiences          │  → /audiences
│  Knowledge          │  → /knowledge
├─────────────────────┤
│  Billing            │  → /billing
│  Team               │  → /team
│  Settings           │  → /settings
├─────────────────────┤
│  Admin ⚙            │  → /admin (only if platform_admin)
├─────────────────────┤
│  [User avatar]      │
│  user@email.com     │
│  Sign out            │
└─────────────────────┘
```

**Visibility rules:**
- **Admin link**: visible ONLY to `platform_admin` role. Backend enforces via `require_admin()` guard. Frontend should check role from workspace membership or user context.
- **Billing**: visible to all roles. `billing_admin+` can modify; others can view.
- **Team**: visible to all. `workspace_admin+` can invite/remove; others read-only.
- **New Simulation**: visible to `contributor+` roles only.

### 1.2 Sidebar (Admin)

Separate sidebar for admin section.

```
┌─────────────────────┐
│  [Raktio Admin]     │
│  ← Back to app      │
├─────────────────────┤
│  Overview           │  → /admin
│  Tenants            │  → /admin/tenants
│  Simulations        │  → /admin/simulations
│  Runtime            │  → /admin/runtime
│  Costs              │  → /admin/costs
│  Population         │  → /admin/population
│  Audit              │  → /admin/audit
└─────────────────────┘
```

### 1.3 Topbar

Minimal topbar per page with:
- **Breadcrumb**: `Workspace > Section > Item` (e.g., "Acme Corp > Simulations > Campaign Test Q4")
- **Credit balance pill**: shows available credits (from `GET /api/billing/balance`)
- **User avatar + dropdown**: profile, settings, sign out

### 1.4 Workspace Switcher

- Dropdown in sidebar header
- Lists all workspaces the user belongs to (from `GET /api/team/workspaces`)
- Switching workspace changes the `x-workspace-id` header for all subsequent API calls
- Workspace context stored client-side (Zustand or context)

### 1.5 User Menu

Dropdown from user avatar in sidebar footer:
- Display name + email
- "Settings" link
- "Sign out" action (calls `supabase.auth.signOut()`)

---

## 2. Real Route Map

### Auth Routes (public)

| Route | Page | Layout |
|-------|------|--------|
| `/login` | Login form | Centered auth layout |
| `/signup` | Registration form | Centered auth layout |

### App Routes (protected — require auth + workspace)

| Route | Page | Priority |
|-------|------|----------|
| `/overview` | Workspace dashboard | Tier 1 |
| `/sim/new` | Simulation creation wizard | Tier 1 |
| `/sim/[id]` | Simulation canvas (live + post-run) | Tier 1 |
| `/simulations` | Simulation list (all statuses) | Tier 1 |
| `/reports` | Report list | Tier 1 |
| `/reports/[id]` | Report detail (14 sections) | Tier 1 |
| `/compare` | Compare list | Tier 2 |
| `/compare/[id]` | Compare detail (2 sims side-by-side) | Tier 2 |
| `/agents` | Agent Atlas (population browser) | Tier 2 |
| `/agents/[id]` | Agent profile detail | Tier 2 |
| `/audiences` | Audience list | Tier 2 |
| `/audiences/[id]` | Audience detail | Tier 2 |
| `/knowledge` | Source/knowledge list | Tier 2 |
| `/knowledge/[id]` | Source detail with extraction | Tier 2 |
| `/billing` | Credit balance + usage + plans | Tier 2 |
| `/team` | Workspace members + invites | Tier 3 |
| `/settings` | User/workspace settings | Tier 3 |

### Admin Routes (protected — require platform_admin)

| Route | Page | Priority |
|-------|------|----------|
| `/admin` | Platform overview dashboard | Tier 3 |
| `/admin/tenants` | Organization list | Tier 3 |
| `/admin/simulations` | Cross-workspace simulation list | Tier 3 |
| `/admin/runtime` | Active runs + health | Tier 3 |
| `/admin/costs` | LLM cost analysis | Tier 3 |
| `/admin/population` | Agent pool stats | Tier 3 |
| `/admin/audit` | Audit log browser | Tier 3 |

---

## 3. Page Inventory

### 3.1 Overview (`/overview`)

**Purpose**: Workspace dashboard. Quick status of active simulations, recent reports, credit balance.

**API dependencies**:
- `GET /api/simulations?page=1&page_size=5` — recent simulations
- `GET /api/reports` — recent reports
- `GET /api/billing/balance` — credit balance + plan info

**Key UI sections**:
- Active simulations card (status badges, progress)
- Recent reports list (clickable → report detail)
- Credit balance widget (available / reserved)
- Quick action: "New Simulation" button

**Must be real from day 1**: Yes — this is the landing page.
**Can remain mock**: Graph/chart visualizations of historical trends.

---

### 3.2 New Simulation (`/sim/new`)

**Purpose**: Multi-step simulation creation wizard. The core product entry point.

**API dependencies**:
- `POST /api/simulations` — create draft
- `POST /api/simulations/{id}/understand` — AI brief understanding
- `POST /api/simulations/{id}/plan` — AI planner recommendation
- `POST /api/simulations/{id}/prepare-audience` — assemble audience
- `POST /api/simulations/{id}/launch` — launch run
- `POST /api/billing/estimate` — credit cost estimate
- `GET /api/billing/balance` — check available credits
- `GET /api/knowledge/sources` — list available sources to link
- `POST /api/knowledge/sources/{id}/link` — link source to simulation

**Key UI sections** (wizard steps):
1. **Brief**: name, brief_text textarea, goal_type selector
2. **Configuration**: platform_scope (multi-select), duration_preset, agent_count_requested (slider/input), geography_scope, recsys_choice, **memory_mode toggle** (persistent/fresh)
3. **Sources**: optional — link existing sources or upload new ones
4. **Understanding**: trigger AI brief understanding, show result (brief_context_json)
5. **Plan**: trigger AI planner, show recommendation (segments, stances, agent distribution)
6. **Audience**: trigger audience preparation, show assembly result (agent count, coverage, stance distribution)
7. **Review + Launch**: credit estimate, configuration summary, launch button

**Must be real from day 1**: Yes — entire wizard flow.
**Can remain mock**: Nothing. Every step has a real API.

---

### 3.3 Simulation Canvas (`/sim/[id]`)

**Purpose**: Live simulation observation + post-run analysis. The central operational surface.

**API dependencies**:
- `GET /api/simulations/{id}` — simulation state
- `GET /api/stream/{id}` — SSE live events
- `POST /api/simulations/{id}/pause` — pause
- `POST /api/simulations/{id}/resume` — resume
- `POST /api/simulations/{id}/cancel` — cancel
- `POST /api/reports/{id}/generate` — trigger report generation

**Key UI sections**:
- **Status bar**: simulation name, status badge, elapsed time, step progress
- **Control bar**: pause/resume/cancel buttons (visible when status=running/paused)
- **Feed mode**: scrolling social feed of agent posts/comments/likes (from SSE events)
- **Post-run actions**: "Generate Report" button (when status=completed)

**Canvas modes** (defined in types, implement progressively):
- `feed` — social media feed view (primary, must be real)
- `network` — relationship graph (can be mock initially)
- `timeline` — temporal activity chart (can be mock initially)
- `geo` — geographic distribution map (can be mock initially)
- `segments` — segment-based analysis (can be mock initially)

**Must be real from day 1**: Feed mode + SSE connection + control buttons.
**Can remain mock**: Network, timeline, geo, segments modes.

---

### 3.4 Simulations List (`/simulations`)

**Purpose**: Browse all simulations in the workspace.

**API dependencies**:
- `GET /api/simulations?page=N&page_size=20` — paginated list

**Key UI sections**:
- Table/card list with: name, status badge, agent count, duration, platform, created_at
- Status filter (draft, running, completed, failed, canceled)
- Pagination controls
- Click → navigate to `/sim/[id]`

**Must be real from day 1**: Yes.
**Can remain mock**: Nothing.

---

### 3.5 Report List (`/reports`)

**Purpose**: Browse all generated reports.

**API dependencies**:
- `GET /api/reports` — list reports for workspace

**Key UI sections**:
- List with: simulation name, report status, section count (completed/total), created_at
- Status badge (pending, generating, partial, completed, failed)
- Click → navigate to `/reports/[id]`

**Must be real from day 1**: Yes.
**Can remain mock**: Nothing.

---

### 3.6 Report Detail (`/reports/[id]`)

**Purpose**: View a full 14-section report with progressive loading.

**API dependencies**:
- `GET /api/reports/{simulation_id}` — report with all sections

**Key UI sections**:
- **Section navigation**: sidebar or tabs listing all 14 sections with status indicators
- **Section content**: rendered markdown for each section
- **Failed section indicator**: show "Generation failed" message for sections with status=failed
- **Metadata**: simulation name, creation date, overall report status

**14 section keys** (in order):
1. `executive_summary`
2. `simulation_context`
3. `outcome_scorecard`
4. `key_findings`
5. `belief_shifts`
6. `patient_zero`
7. `segment_analysis`
8. `geography_analysis`
9. `platform_analysis`
10. `exposure_analysis`
11. `faction_analysis`
12. `recommendations`
13. `evidence`
14. `confidence_limitations`

**Must be real from day 1**: Yes — markdown rendering + section navigation.
**Can remain mock**: Export/share buttons (no backend for PDF/share yet).

---

### 3.7 Compare (`/compare` + `/compare/[id]`)

**Purpose**: Side-by-side comparison of two completed simulations.

**API dependencies**:
- `GET /api/compare` — list comparisons
- `GET /api/compare/{id}` — compare detail
- `POST /api/compare` — create new comparison (select 2 completed sims)

**Key UI sections**:
- **Create**: select base + target simulation from completed list
- **Detail**: side-by-side metric comparison, key differences, evidence quality indicator
- **summary_json** rendered as structured comparison cards

**Must be real from day 1**: No — can be mock initially.
**Can remain mock**: Yes, compare is Tier 2. Basic list + detail sufficient.

---

### 3.8 Agent Atlas (`/agents` + `/agents/[id]`)

**Purpose**: Browse and inspect the persistent synthetic population.

**API dependencies**:
- `GET /api/agents?country=X&stance=Y&limit=50&offset=0` — list/filter
- `GET /api/agents/{id}` — full profile with memory

**Key UI sections — List** (`/agents`):
- Card grid or table with: avatar (DiceBear notionists from username), username, display_name, country, city, stance, influence_weight
- Filters: country dropdown, stance dropdown
- Pagination (limit/offset)

**Key UI sections — Profile** (`/agents/[id]`):
- **Identity card**: avatar, username, display_name, demographics (age, gender, profession, country, city)
- **Personality**: MBTI, Big Five scores, interests, stance bias, activity level
- **Memory summary**: simulation count, summary text, recent stance
- **Recent episodes**: list of episodic memories (up to 20)
- **Relationships**: list of relationship connections with strength indicator
- **Topic exposures**: list of topics with sentiment/stance tendency

**Avatar generation**: `https://api.dicebear.com/7.x/notionists/svg?seed={username}`

**Must be real from day 1**: No — Tier 2.
**Can remain mock**: Yes, basic list sufficient initially. Profile detail can iterate.

---

### 3.9 Audiences (`/audiences` + `/audiences/[id]`)

**Purpose**: Browse auto-generated audiences used in simulations.

**API dependencies**:
- `GET /api/audiences?page=N&page_size=20` — paginated list
- `GET /api/audiences/{id}` — single audience detail
- `DELETE /api/audiences/{id}` — archive

**Key UI sections**:
- List with: name, type, agent count, geography summary, stance summary, status
- Detail: full breakdown of demographics, geography distribution, stance distribution, platform presence
- Archive button (soft delete)

**Must be real from day 1**: No — Tier 2.
**Can remain mock**: Yes. Audiences are auto-generated; manual management is secondary.

---

### 3.10 Knowledge (`/knowledge` + `/knowledge/[id]`)

**Purpose**: Upload and manage source materials for simulation grounding.

**API dependencies**:
- `GET /api/knowledge/sources` — list sources
- `GET /api/knowledge/sources/{id}` — source with extraction
- `POST /api/knowledge/sources` — upload (multipart form)
- `POST /api/knowledge/sources/{id}/link?simulation_id=X` — link to simulation

**Key UI sections**:
- **List**: source title, type, upload date, linked simulations count
- **Detail**: raw text preview, LLM extraction results (summary, entities, topics, key claims)
- **Upload form**: title, description, file upload or text paste

**Must be real from day 1**: No — Tier 2. Source linking happens in sim/new wizard.
**Can remain mock**: Standalone knowledge pages can iterate.

---

### 3.11 Billing (`/billing`)

**Purpose**: Credit balance, usage history, cost estimation.

**API dependencies**:
- `GET /api/billing/balance` — credit balance + plan info
- `GET /api/billing/usage?limit=50` — ledger entries
- `POST /api/billing/estimate` — cost calculator
- `GET /api/billing/plans` — plan list (public)

**Key UI sections**:
- **Balance card**: available credits, reserved credits, plan name
- **Usage history**: table of ledger entries (simulation name, credits, date, type)
- **Cost calculator**: agent count slider, duration, platform → estimated credits
- **Plan comparison**: current plan vs available upgrades

**Must be real from day 1**: Balance card + basic usage history (users need to see cost before launching).
**Can remain mock**: Plan upgrade flow (no payment API yet), cost calculator can be simple.

---

### 3.12 Team (`/team`)

**Purpose**: Workspace member management.

**API dependencies**:
- `GET /api/team/members` — list members
- `POST /api/team/members/invite` — invite by email
- `PATCH /api/team/members/{user_id}` — change role
- `DELETE /api/team/members/{user_id}` — remove member

**Key UI sections**:
- Member list: avatar, name, email, role badge, joined date
- Invite form: email input, role selector (respects inviter's authority level)
- Role change dropdown (workspace_admin+ only)
- Remove button with confirmation dialog

**Must be real from day 1**: No — Tier 3.
**Can remain mock**: Basic member list sufficient. Invite flow can iterate.

---

### 3.13 Admin Pages (`/admin/*`)

**Purpose**: Platform-wide administration. Only accessible to `platform_admin`.

**API dependencies** (all require `require_admin`):
- `GET /api/admin/overview` — platform stats
- `GET /api/admin/tenants` — organization list
- `GET /api/admin/tenants/{id}` — org detail
- `GET /api/admin/simulations` — cross-workspace sims
- `GET /api/admin/runtime` — active runs
- `GET /api/admin/costs` — LLM costs
- `GET /api/admin/population` — agent pool stats
- `GET /api/admin/audit` — audit logs

**Must be real from day 1**: No — Tier 3.
**Can remain mock**: Entirely. Admin is internal tooling.

---

## 4. Core User Flows

### 4.1 Authentication Flow

```
[User visits any app route]
    ↓
[Middleware checks auth]
    ↓ not authenticated
[Redirect to /login?next=/original-path]
    ↓
[User enters email + password]
    ↓
[supabase.auth.signInWithPassword()]
    ↓ success
[Redirect to ?next param or /overview]
    ↓ failure
[Show error message in form]
```

**Signup flow**:
```
[/signup form: email + password (min 8 chars)]
    ↓
[supabase.auth.signUp()]
    ↓ success
[Show "Check your email for confirmation" message]
    ↓ (email confirmed)
[handle_new_auth_user() trigger creates public.users row]
    ↓
[User can now log in]
```

**Sign out**: `supabase.auth.signOut()` → redirect to `/login`.

### 4.2 Workspace Access Flow

```
[User logs in]
    ↓
[GET /api/team/workspaces → list of workspaces]
    ↓ user has workspaces
[Store active workspace_id in client state]
[Set x-workspace-id header on all API calls]
    ↓ user has no workspaces
[Show "No workspace" state or onboarding]
```

### 4.3 Simulation Creation Flow (the core product loop)

```
Step 1 — Brief
    [User enters name + brief_text]
    [POST /api/simulations → creates draft]
    [simulation_id returned]

Step 2 — Configure
    [User selects: platform, duration, agent count, geography, recsys, memory_mode]
    [PATCH /api/simulations/{id} → updates draft]
    [POST /api/billing/estimate → show credit cost]

Step 3 — Sources (optional)
    [User can link existing sources or upload new]
    [POST /api/knowledge/sources → upload]
    [POST /api/knowledge/sources/{id}/link?simulation_id=X → link]

Step 4 — Understand
    [POST /api/simulations/{id}/understand]
    [Show loading → show brief_context_json result]
    [Result: topic analysis, sentiment landscape, key themes]

Step 5 — Plan
    [POST /api/simulations/{id}/plan]
    [Show loading → show planner recommendation]
    [Result: segments, stance distribution, agent configuration]

Step 6 — Prepare Audience
    [POST /api/simulations/{id}/prepare-audience]
    [Show loading → show audience assembly result]
    [Result: agents sourced, agents generated, coverage metrics]

Step 7 — Review + Launch
    [Show configuration summary + credit estimate]
    [GET /api/billing/balance → verify sufficient credits]
    [POST /api/simulations/{id}/launch]
    [Redirect to /sim/{id} (canvas)]
```

**Important**: Steps 4-6 are async and take 10-60 seconds each. UI must show:
- Loading spinner with step description
- Progressive results as each step completes
- Error state if any step fails (with retry option)

### 4.4 Live Simulation Flow (SSE)

```
[Canvas page /sim/{id} loads]
    ↓
[GET /api/simulations/{id} → get current state]
    ↓ status = running
[Connect to GET /api/stream/{id}?token=JWT]
    ↓
[Receive SSE events:]
    - run_state → set initial status
    - simulation_event → append to feed
    - heartbeat → keep alive
    - simulation_ended → disconnect, show completion state
    ↓
[User can: pause, resume, cancel via POST endpoints]
    ↓ status = completed
[Show "Generate Report" button]
[POST /api/reports/{id}/generate → trigger report]
```

**SSE reconnection**: on disconnect, reconnect with `?since=lastRowId` to resume from last seen event.

### 4.5 Report Flow

```
[POST /api/reports/{sim_id}/generate]
    ↓ (takes 3-10 minutes for 14 sections)
[Poll GET /api/reports/{sim_id} periodically]
[Show sections as they complete (progressive loading)]
    ↓ all sections done
[Full report rendered with markdown]
```

### 4.6 Compare Flow

```
[User selects 2 completed simulations]
    ↓
[POST /api/compare → {base_simulation_id, target_simulation_id}]
    ↓ (takes 1-3 minutes)
[Poll or navigate to /compare/{id}]
[GET /api/compare/{id} → structured comparison]
```

### 4.7 Billing Flow

```
[/billing page loads]
    ↓
[GET /api/billing/balance → credits, plan info]
[GET /api/billing/usage → recent ledger entries]
    ↓
[Display balance card + usage table]
    ↓ user wants cost estimate
[POST /api/billing/estimate → calculate cost]
```

### 4.8 Admin Flow

```
[Admin user navigates to /admin]
    ↓
[Backend validates platform_admin role]
    ↓ not admin
[403 Forbidden]
    ↓ is admin
[GET /api/admin/overview → platform stats]
[Navigate between admin sub-pages]
```

### 4.9 Team Governance Flow

```
[/team page loads]
    ↓
[GET /api/team/members → member list]
    ↓ user is workspace_admin+
[Show invite form + role management controls]
    ↓ user is contributor/viewer
[Show read-only member list]
```

### 4.10 Agent Atlas Flow

```
[/agents page loads]
    ↓
[GET /api/agents?limit=50&offset=0 → agent list]
    ↓ user clicks agent card
[Navigate to /agents/{id}]
[GET /api/agents/{id} → full profile + memory]
```

### 4.11 Knowledge Upload Flow

```
[In /sim/new wizard OR /knowledge page]
    ↓
[User uploads file or pastes text]
[POST /api/knowledge/sources (multipart)]
    ↓ extraction takes 5-15 seconds
[Source created with extraction results]
    ↓ user links to simulation
[POST /api/knowledge/sources/{id}/link?simulation_id=X]
```

---

## 5. Simulation Setup UX

### 5.1 Platform Choice

Multi-select from 5 platforms:
- **X (Twitter)** — default selected
- **Reddit**
- **Instagram**
- **TikTok**
- **LinkedIn**

Display as toggle buttons or checkbox cards with platform icons.
Note: Instagram, TikTok, LinkedIn use prompt-level behavior approximation (not engine-level). No need to surface this distinction to users.

### 5.2 Geography

Geography scope is a free-form dict. UI should provide:
- Country selector (multi-select dropdown)
- Optional city/region refinement
- "Global" default (empty dict = no geographic constraint)

### 5.3 Agent Count

- Slider or number input
- Range: 10 – 100,000
- Default: 500
- Show warning above 10,000 (high credit cost)
- Plan limit enforced by backend (403 if exceeded)

### 5.4 Memory Mode

Toggle switch or radio buttons:
- **Persistent** (default): "Agents carry memory from previous simulations. Returning agents will remember past experiences."
- **Fresh**: "Clean slate. Agents start without memory, regardless of prior participation. Useful for controlled A/B testing."

### 5.5 Duration Preset

Radio buttons or dropdown:
- 6h, 12h, **24h** (default), 48h, 72h

### 5.6 Recommendation System

Dropdown (advanced setting, can be collapsed):
- **Random** (default) — random content distribution
- **Reddit** — Reddit-style ranking
- **Personalized** — personalized feeds
- **TWHin-BERT** — ML-based recommendations

### 5.7 Source-Aware Setup

In the wizard, after basic config:
- Show list of available sources (from `GET /api/knowledge/sources`)
- Allow linking existing sources to the simulation
- Allow uploading new sources inline
- Linked sources will be injected into the brief understanding step

### 5.8 Credit Estimate Visibility

- Show estimated credit cost LIVE as configuration changes
- Call `POST /api/billing/estimate` on config change (debounced)
- Display: "Estimated cost: **350 credits**" next to current balance
- Warning if cost > available balance
- Formula breakdown: `agents × duration × platform multiplier × geography multiplier`

---

## 6. Report UX

### 6.1 Report List

- Table or card list
- Columns: simulation name, status badge, sections completed, creation date
- Status badges: `pending` (gray), `generating` (blue pulse), `partial` (yellow), `completed` (green), `failed` (red)

### 6.2 Report Detail

- Left sidebar or tabs: list of 14 sections with status indicator per section
- Main content: rendered markdown for selected section
- Section status indicators:
  - Completed (green check)
  - Failed (red X with "Generation failed" message)
  - Pending/generating (spinner)

### 6.3 Progressive Loading

Reports take 3-10 minutes to generate (14 sequential LLM calls).
- After triggering generation, poll `GET /api/reports/{sim_id}` every 5-10 seconds
- Render each section as soon as its status becomes "completed"
- User can read early sections while later ones generate

### 6.4 Failed Section Handling

- Show a subtle error state (not a full-page error)
- Message: "This section could not be generated. The remaining sections are unaffected."
- No retry button on frontend (backend already retries once internally)
- Failed sections should not block navigation to other sections

### 6.5 Evidence Display

Evidence is embedded in section markdown, not as a separate structured layer.
- Reports cite specific posts, agent names, interaction patterns
- Frontend renders markdown faithfully (bold, lists, headers, quotes)
- No drill-down into raw evidence data (deferred: RP-01)

---

## 7. Agent Atlas UX

### 7.1 List View

Grid of agent cards:
```
┌─────────────────────┐
│  [DiceBear avatar]  │
│  @username          │
│  Display Name       │
│  📍 Rome, IT        │
│  Stance: neutral    │
│  Influence: ★★☆     │
│  Sims: 3            │
└─────────────────────┘
```

### 7.2 Filters

- **Country**: dropdown (from available countries in population)
- **Stance**: dropdown (supportive, neutral, skeptical, opposed, etc.)
- Pagination: load more / page controls

### 7.3 Profile Detail

**Identity section**:
- Large avatar, username, display name
- Demographics: age, gender, profession, education, country, city

**Personality section**:
- MBTI type badge
- Interests as tags
- Activity level indicator
- Influence weight (visual: 1-5 stars or bar)

**Memory section** (from `memory_summary`):
- Simulation count
- Summary text (up to 500 chars)
- Recent behavioral stance

**Episodes section** (from `recent_episodes`):
- Chronological list of episodic memories
- Each: type (post/comment/like/follow/mute), content snippet, simulation reference, timestamp

**Relationships section** (from `relationships`):
- List of connected agents with strength bar (0.0–1.0)
- Relationship type (interacted, followed, etc.)
- Click → navigate to other agent's profile

**Topics section** (from `topic_exposures`):
- Tag cloud or list of topics
- Each with: exposure count, stance tendency

---

## 8. Billing UX

### 8.1 Balance Card

```
┌──────────────────────────────┐
│  Available Credits: 2,450    │
│  Reserved: 350               │
│  Plan: Professional          │
│  Agent limit: 5,000          │
└──────────────────────────────┘
```

### 8.2 Usage History

Table:
| Date | Simulation | Type | Credits | Balance After |
|------|-----------|------|---------|---------------|
| Apr 14 | Campaign Q4 | reservation | -350 | 2,450 |
| Apr 14 | Campaign Q4 | settlement | +50 | 2,500 |

Types: `reservation`, `settlement`, `refund`, `purchase`, `bonus`

### 8.3 Cost Estimate

Interactive calculator:
- Agent count slider (10–100,000)
- Duration dropdown
- Platform multi-select
- Live cost display as inputs change

### 8.4 Plan Info

Current plan details + available upgrades.
Note: plan change/upgrade API not yet implemented — show plan info read-only, upgrade button as "Contact us" or disabled.

---

## 9. Admin UX

### 9.1 Overview (`/admin`)

Dashboard cards:
- Total simulations (by status)
- Total agents in pool
- Total organizations
- Credit volume
- LLM cost (total, by provider)
- Recent failures count

### 9.2 Tenants (`/admin/tenants`)

Table: org name, plan, member count, simulation count, credit balance.
Click → detail page with full org info.

### 9.3 Runtime (`/admin/runtime`)

- Active runs list with: simulation name, org, status, step progress, duration
- Recent completions
- Recent failures with error summaries

### 9.4 Costs (`/admin/costs`)

- LLM cost breakdown by route (PLANNING / RUNTIME / REPORT)
- Cost by provider (Anthropic / DeepSeek)
- Cost trend chart (optional, can be mock)

### 9.5 Population (`/admin/population`)

- Total global agents count
- Country distribution (top 20)
- Stance distribution
- Activity level distribution
- Influence weight distribution

### 9.6 Audit (`/admin/audit`)

Table of audit log entries:
- Timestamp, actor (user), action type, organization, details
- Filters: action type, organization, date range

---

## 10. Required UI States

Every data-fetching page/component must handle these states:

### 10.1 Loading

- Skeleton loaders for lists and cards
- Spinner for async operations (understand, plan, audience preparation, report generation)
- Progress indicators for multi-step flows

### 10.2 Empty

- "No simulations yet" with CTA to create first simulation
- "No reports generated" with explanation
- "No sources uploaded" with upload CTA
- Empty agent atlas (shouldn't happen — population exists)

### 10.3 Partial

- Report with some sections completed, others still generating
- Simulation list with mixed statuses
- Audience with coverage gaps (show quality metrics)

### 10.4 Permission Denied

- `403` from backend → show "You don't have permission to perform this action"
- Admin pages for non-admins → "This section requires platform administrator access"
- Launch button disabled for viewers with tooltip: "Contributors can launch simulations"

### 10.5 Failed Async

- Simulation launch failed → show error message, offer retry
- Understanding/planning failed → show error, allow re-trigger
- Report section failed → subtle inline error (not full-page)
- SSE connection lost → auto-reconnect with banner "Reconnecting..."

### 10.6 No Data

- API returns empty list → show empty state with helpful message
- Agent profile not found → 404 page
- Simulation not found → 404 page

### 10.7 Not Ready Yet

- Simulation in `draft` → show setup wizard, not canvas
- Simulation in `bootstrapping` → show "Preparing simulation..." with spinner
- Report in `pending` → show "Report has not been generated yet" with generate button

### 10.8 Progressive Content

- Report sections appear one by one as they complete
- SSE events append to canvas feed in real time
- Audience preparation shows progress (sourced X agents, generating Y more...)

---

## 11. Frontend Integration Rules

### 11.1 Authentication

- Use `@supabase/ssr` for both client and server components
- Client: `createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)`
- Server: `createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies })`
- Middleware validates session on every request via `supabase.auth.getUser()` (NOT `getSession()`)
- JWT access token available from `session.access_token`

### 11.2 Authorization Header

Every API call to the backend MUST include:
```
Authorization: Bearer <access_token>
```

The API client utility must:
1. Get current session from Supabase
2. Extract `session.access_token`
3. Attach as Bearer token
4. Handle 401 (token expired) → refresh session → retry

### 11.3 Workspace Header

All workspace-scoped endpoints require:
```
x-workspace-id: <uuid>
```

This is set from the active workspace context (stored in Zustand or React context after workspace selection).

### 11.4 SSE Integration

- Use the existing `useSimulationStream` hook
- Connect to `GET /api/stream/{simulationId}?token=<jwt>`
- Handle event types: `run_state`, `simulation_event`, `heartbeat`, `simulation_ended`
- Track `lastRowId` for reconnection with `?since=` parameter
- Auto-reconnect on disconnect (3s delay)

### 11.5 Role-Aware Rendering

Roles determine what UI elements are visible/enabled:

| Element | Viewer | Contributor | Editor | Workspace Admin | Billing Admin | Org Admin | Platform Admin |
|---------|--------|-------------|--------|-----------------|---------------|-----------|----------------|
| View simulations | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create simulation | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit draft | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Delete simulation | - | - | ✓ | ✓ | - | ✓ | ✓ |
| Launch simulation | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View billing | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage billing | - | - | - | - | ✓ | ✓ | ✓ |
| Invite members | - | - | - | ✓ | - | ✓ | ✓ |
| Remove members | - | - | - | ✓ | - | ✓ | ✓ |
| Access admin | - | - | - | - | - | - | ✓ |

Get the user's role from workspace membership context and conditionally render UI elements.

### 11.6 No Fake Hardcoded Data

In the integrated version:
- EVERY list must come from a real API call
- EVERY form submission must call a real API endpoint
- EVERY status badge must reflect real backend state
- NO hardcoded agent names, simulation names, or credit values
- Mock data is ONLY acceptable for:
  - Canvas modes that aren't feed (network, timeline, geo, segments)
  - Chart/graph visualizations on admin pages
  - Plan upgrade flow (no payment API yet)

### 11.7 Backend-First Alignment

- Frontend types must match backend Pydantic schemas exactly
- Status enums must match: `SimulationStatus`, `PlannerStatus`, `DurationPreset`, `RecsysChoice`, `MemoryMode`
- Pagination follows backend convention: `page` + `page_size` (not offset/limit for simulation list; offset/limit for agents)
- Error handling: backend returns standard HTTP status codes + `detail` field in error body
- All dates are ISO 8601 strings from backend; parse with `date-fns`

### 11.8 API Client Pattern

Recommended pattern for the API client:

```typescript
// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = createBrowserClient(...);
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // Add workspace header if in workspace context
  const workspaceId = getActiveWorkspaceId(); // from Zustand store
  if (workspaceId) {
    headers['x-workspace-id'] = workspaceId;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(res.status, error.detail);
  }

  return res.json();
}
```

---

## 12. Technology Stack (Established)

> **Implementation note (2026-04-15)**: The primary frontend is now `/raktio-dashboard` (Vite 6 + React 19 + Tailwind CSS 4 + React Router). The Next.js `/frontend` project contains useful types, auth middleware, and SSE hook but pages are stubs. All page implementations reference the raktio-dashboard project.

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.5 |
| React | React | 18.3.1 |
| Language | TypeScript | 5.5.3 |
| UI Components | Radix UI (headless) | Latest |
| Styling | Tailwind CSS | 3.x |
| State Management | Zustand | 4.5.4 |
| Data Fetching | SWR | 2.2.5 |
| Forms | React Hook Form + Zod | 7.52.1 / 3.23.8 |
| Charts | Recharts | 2.12.7 |
| Graph Viz | Sigma.js | 3.0.0 |
| Maps | MapLibre GL | 4.5.0 |
| Icons | Lucide React | 0.414.0 |
| Auth | Supabase SSR | 0.5.0 |
| Dates | date-fns | 3.6.0 |

---

## 13. Design Tokens & Visual Language

### Typography
- Primary font: **Inter** (loaded from Google Fonts)
- Monospace: system monospace for code/data

### Colors
Use CSS custom properties (defined in globals.css):
- `--background`, `--foreground` — base colors
- `--primary`, `--primary-foreground` — accent/CTA
- `--muted`, `--muted-foreground` — subdued text
- `--destructive` — error/delete actions
- `--border`, `--input`, `--ring` — form elements

### Status Badge Colors
| Status | Color | Use |
|--------|-------|-----|
| draft | gray | Not yet started |
| understanding, planning, audience_preparing | blue (pulsing) | AI processing |
| cost_check, bootstrapping | yellow | Preparing |
| running | green (pulsing) | Active |
| paused | orange | Paused by user |
| completing, reporting | blue | Finishing |
| completed | green (solid) | Done |
| failed | red | Error |
| canceled | gray (strikethrough) | User canceled |

### Spacing & Layout
- Sidebar width: 240px (collapsible to 60px icon-only)
- Main content max-width: 1200px (centered)
- Card padding: 16-24px
- Table row height: 48-56px
- Form field spacing: 16px between fields

---

## 14. Existing Frontend Assets (Do Not Recreate)

These files already exist and are working. The frontend shell must preserve them:

| File | Status | Purpose |
|------|--------|---------|
| `middleware.ts` | Working | Route protection + session refresh |
| `lib/supabase/client.ts` | Working | Browser Supabase client |
| `lib/supabase/server.ts` | Working | SSR Supabase client |
| `lib/hooks/useSimulationStream.ts` | Working | SSE hook for live canvas |
| `lib/types/simulation.ts` | Working | Simulation types + enums |
| `lib/types/agent.ts` | Working | Agent types + avatar helper |
| `lib/stores/canvas.ts` | Working | Canvas mode state |
| `app/(auth)/login/page.tsx` | Working | Real login form |
| `app/(auth)/signup/page.tsx` | Working | Real signup form |
| `app/layout.tsx` | Working | Root layout |
| `app/(app)/layout.tsx` | Working | App layout with sidebar |
| `app/(admin)/layout.tsx` | Working | Admin layout |

**Types that need updating for 10.6**:
- `lib/types/simulation.ts` — add `MemoryMode = "persistent" | "fresh"` and `memory_mode` field to Simulation interface

---

## 15. What's NOT in This Spec (Intentionally)

> **Note (2026-04-15)**: These remain valid deferred items post Step 11 Phase 1. No backend support has been added for any of them.

These features do NOT have backend support yet. Do NOT build UI for them:

| Feature | Why not | Backend status |
|---------|---------|---------------|
| Report PDF export | No PDF generation API | RP-03 deferred |
| Report chat | No chat tables or API | RP-02 deferred |
| Report sharing | No share link API | Not planned |
| Agent interview | No interview API | RT-02 deferred |
| Plan upgrade/payment | No payment API | BIL-04+ deferred |
| Workspace create/rename | No create workspace API | ADM-05 deferred |
| Private audiences | No private audience API | POP-02 deferred |
| Audience create/edit | No manual audience CRUD | POP-04 deferred |
| NLP sentiment display | No sentiment analysis | RP-04 deferred |
| Belief trajectory charts | No trajectory data | MEM-03 deferred |

---

## 16. Implementation Status (2026-04-15, post Step 11 Phase 1)

**Step 11 Phase 1 COMPLETE**: 23 pages implemented in `/raktio-dashboard`.

### Shell
- Fixed sidebar (4 groups: Workspace, Intelligence, Operations, Admin)
- Fixed topbar (search, credit pill, theme toggle, notifications, profile)
- Scrollable content area with ErrorBoundary wrapping all route-level components
- Dark mode default, light mode working, localStorage persistence

### Loading/Error/Empty States
Implemented on 6 core pages: Dashboard, SimulationsList, ReportsList, Report, Billing, AgentAtlas.

### Route Notes
- Sign up route is `/signup` (not `/register`)
- All UI copy normalized to English

### Canvas Status
- Feed / Network / Geo: fully implemented
- Timeline / Segments / Compare: placeholder components

### Admin Pages
4 pages implemented: Control, Costs, Audit, Tenants.

### What Remains (Step 11 Phase 2 — API Integration)
- All 23 pages currently use mock data — no real API calls yet
- Canvas SSE streaming not connected
- Canvas Timeline/Segments/Compare modes are placeholder components

### Original Priority Phases (for reference)

#### Phase 1 — Core Product Loop (Tier 1)
1. Auth (login, signup, logout) — working
2. Overview dashboard — DONE (mock)
3. Simulation creation wizard (`/sim/new`) — DONE (mock)
4. Simulation canvas (`/sim/[id]`) — DONE (Feed/Network/Geo; mock data)
5. Simulation list (`/simulations`) — DONE (mock)
6. Report list + detail (`/reports`, `/reports/[id]`) — DONE (mock)
7. Billing balance + usage (`/billing`) — DONE (mock)

#### Phase 2 — Extended Features (Tier 2)
8. Agent Atlas (`/agents`, `/agents/[id]`) — DONE (mock)
9. Compare (`/compare`) — DONE (mock)
10. Knowledge (`/knowledge`) — DONE (mock)
11. Audiences (`/audiences`) — DONE (mock)

#### Phase 3 — Governance & Admin (Tier 3)
12. Team management (`/team`) — DONE (mock)
13. Settings (`/settings`) — DONE (mock)
14. Admin panel (`/admin/*`) — DONE (mock, 4 pages)

Each phase should produce a fully working product increment that can be tested end-to-end.
