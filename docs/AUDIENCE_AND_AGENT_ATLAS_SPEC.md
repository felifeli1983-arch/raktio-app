# AUDIENCE_AND_AGENT_ATLAS_SPEC.md

## Purpose

This document defines the product and data behavior of:
- the persistent synthetic population
- Audience Studio
- Agent Atlas
- agent profiles
- audience creation and reuse
- memory, geography, and platform presence at the agent level

Raktio is not built around disposable one-off agents.  
It is built around a **persistent synthetic social population** that evolves over time and can be reused across simulations.

---

## Core rule

**Agents are synthetic social users, not temporary prompt outputs.**

They must behave like persistent residents of the simulated social ecosystem:
- they have identity
- they have geography
- they have platform presence
- they have memory
- they participate in simulations
- they can be inspected and interviewed
- they remain available for future runs

---

## Product mission of this module

This module should let users:
- inspect the synthetic population
- build and save audiences
- understand who the agents are
- reuse the same or similar audiences across runs
- inspect memory and platform behavior
- trust that Raktio is simulating a real population model, not generating random temporary blobs every time

---

## Core concepts

# 1. Global Persistent Pool

### Definition
The Global Persistent Pool is the core synthetic population owned by Raktio.

It contains persistent agents that:
- exist beyond any single simulation
- can be selected for future runs
- can accumulate memory and simulation history
- can be filtered by geography, demographics, psychographics, platform presence, and topic exposure

### Key rule
The Global Persistent Pool grows over time.  
Raktio should not regenerate all agents from scratch for every run.

---

# 2. Private Audiences

### Definition
Private Audiences are workspace/org-specific subsets or custom populations.

They may be:
- derived from the global pool
- generated specifically for one client
- enriched using uploaded materials or enterprise source logic
- reused only within that workspace/org if needed

### Why they matter
They enable:
- enterprise relevance
- confidentiality
- more tailored testing
- stronger workspace continuity

---

# 3. Audience Studio

### Definition
Audience Studio is the page/system where users create, save, inspect, and reuse audiences.

It must act as the population control center of the product.

---

# 4. Agent Atlas

### Definition
Agent Atlas is the persistent agent exploration system.

It should let users:
- browse the synthetic population
- inspect individual agents
- understand their profile and memory
- see how they participated across simulations
- use them as interpretable, persistent “residents” of the Raktio world

---

## Agent identity model

Every persistent agent should have a stable identity composed of multiple layers.

---

# A. Core identity

Required fields:
- `agent_id`
- `username`
- `display_name`
- `first_name`
- `last_name`
- `avatar_seed`
- `avatar_style`

### Rules
- `username` must be globally unique and stable
- avatar is deterministic from username seed
- display name may be more human-readable
- name/city combinations must feel realistic, not random nonsense

### Avatar policy
Raktio uses DiceBear `notionists` avatars with:
- no stored image files
- deterministic avatar from username seed
- persistent visual identity across feed, graph, reports, and profile views

---

# B. Geography identity

Required fields:
- `country`
- `region/state`
- `province/county` where supported
- `city`
- `macro_area`
- `timezone`
- `languages`

### Geographic rule
Geography must feel real, not generic.

### Tiered depth
- Tier 1 countries: deep granularity
- Tier 2 countries: medium granularity
- Tier 3 countries: base granularity

### Why this matters
Geo mode, local segment analysis, and local realism all depend on it.

---

# C. Demographic identity

Suggested fields:
- `age`
- `gender`
- `profession`
- `education_level`
- `income_band`
- `family_status`
- `tech_literacy`

These are not cosmetic.  
They must influence audience building and simulation behavior.

---

# D. Psychographic identity

Suggested fields:
- `mbti`
- `big_five`
- `interests`
- `values`
- `stance_bias`
- `activity_level`
- `influence_weight`
- `persuadability`
- `risk_tolerance`
- `controversy_tolerance`

### Rule
Stances such as supportive/opposing/neutral/observer are useful, but Raktio should not stop there conceptually.  
These fields support richer future behavior models.

---

# E. Platform presence identity

Each agent has a **global identity** but may have **platform-specific presence**.

Suggested fields:
- `platform_presence[]`
- `platform_active_flags`
- `platform_style_profiles`
- `platform_frequency_profiles`
- `platform_username_variants` (optional)
- `platform_followers_band`
- `platform_engagement_style`

### Core rule
Not every agent must exist on every platform.

### Example
One agent may:
- be active on X and TikTok
- passive on Instagram
- absent on LinkedIn and Reddit

This is more realistic than universal platform presence.

---

# F. Memory identity

Suggested persistent fields:
- `memory_summary`
- `topic_exposure_summary`
- `relationship_summary`
- `simulation_count`
- `recent_stance_history`
- `notable_events_summary`
- `last_active_in_simulation`

### Rule
Persistent identity must remain separate from run-specific temporary state.

---

## Agent generation policy

### Recommended approach
Use a **hybrid identity generation model**:

1. realistic country-specific distributions
2. synthetic combinations
3. LLM-based profile enrichment
4. deterministic persistent identity

### This means
- names and surnames should feel culturally plausible
- geography should be grounded in real places
- profiles should feel distinct
- no agent should directly map to a real person

### Avoid
- purely random identity generation with poor realism
- directly copying real identities
- overusing a tiny set of cities and names

---

## When new agents are created

New agents should be generated only when necessary.

### Triggers for generation
- insufficient segment coverage
- insufficient geographic coverage
- insufficient platform-presence diversity
- insufficient psychographic diversity
- user explicitly creates a new audience or private population
- enterprise/private audience creation
- long-term population growth strategy

### Important rule
The system should first try to satisfy a simulation from the existing pool.  
Only then generate missing coverage.

---

## Agent participation model

Persistent agents participate in simulations through a run-specific layer.

### Persistent layer
Stable across runs:
- identity
- geography
- psychographics
- platform presence
- avatar
- long-term memory

### Run participation layer
Specific to one simulation:
- `simulation_id`
- `agent_id`
- active platforms in this run
- stance at runtime
- event history in this run
- influence during this run
- role in this run
- local memory delta for this run

### Why this matters
This keeps the architecture clean and avoids mixing:
- who the agent is
with
- what the agent did in one run

---

## Audience Studio — product specification

## Main route
`/audiences`

### Purpose
Audience Studio is where the user creates and manages simulation-ready populations.

### Audience types
- saved audience
- reusable audience
- private audience
- source-derived audience
- compare baseline audience
- simulation-derived segment audience

### Creation methods
1. AI-assisted creation from brief
2. manual filter composition
3. source-informed generation
4. clone and edit existing audience
5. save segment from report or simulation
6. create private audience

---

## Audience filters

Audience creation and filtering should support at least:

### Geography
- continent/region
- country
- region/state
- province/county/city where supported

### Demographics
- age band
- gender
- profession
- income band
- education level
- family status

### Psychographics
- interests
- values
- stance bias
- risk tolerance
- controversy tolerance
- persuadability

### Platform presence
- active on X
- active on Instagram
- active on TikTok
- active on LinkedIn
- active on Reddit
- multi-platform presence patterns

### Behavioral
- high activity
- high influence
- passive observers
- likely amplifiers
- likely opposers

### Memory / history
- exposed to certain topics before
- participated in certain simulations
- strong historical reaction to related themes
- private audience membership

---

## Audience detail page

### Route
`/audiences/:id`

### Must show
- audience name
- source / origin
- size
- geography distribution
- demographic distribution
- psychographic distribution
- platform distribution
- influence/activity distribution
- representative agents
- usage history
- quality / coverage notes
- linked simulations
- linked reports

### Key actions
- use in simulation
- duplicate
- edit
- expand
- convert to private audience
- compare with another audience

---

## Agent Atlas — directory specification

## Main route
`/agents`

### Purpose
Directory of the persistent synthetic population.

### Must support
- search by username, display name, topic, geography
- filters for demographics, psychographics, platform presence, influence, activity, memory
- sorting by recent activity, influence, simulation count, topic exposure
- saved filters/views

### Featured modules
- most influential agents
- most active agents
- newly created agents
- agents with notable recent belief shifts
- agents heavily exposed to a topic
- top bridge agents
- top controversial agents

---

## Agent Profile page

## Route
`/agents/:id`

### Purpose
Deep profile of a persistent synthetic user.

### Required sections

#### 1. Identity
- avatar
- display name
- username
- name
- location
- languages
- presence summary

#### 2. Demographic profile
- age
- profession
- income/education/family profile if shown

#### 3. Psychographic profile
- MBTI / Big Five
- interests
- values
- controversy tolerance
- persuadability
- stance tendencies

#### 4. Platform presence
- active platforms
- posting style per platform
- engagement style per platform
- follower/influence band

#### 5. Memory timeline
- notable past episodes
- topic exposure
- stance shifts over time
- important simulation moments
- quotes or extracted memory summaries

#### 6. Simulation history
- past simulations
- role in each
- key reactions
- influence metrics
- notable interviews

#### 7. Relationship and graph links
- top interacted agents
- factions/clusters
- follow/unfollow history where useful
- bridge roles

### Key actions
- interview agent
- open in graph explorer
- inspect last simulation
- inspect memory details
- filter other agents like this one
- use agent to sample audience logic

---

## Memory timeline model

### Purpose
Show that agents are not stateless.

### Timeline should include
- notable posts
- major reactions
- topic exposure
- belief shifts
- important follow/unfollow/mute events
- simulation participation
- interviews and memorable responses
- relationship changes

### UX rule
The memory timeline must feel like:
- readable
- longitudinal
- identity-reinforcing
not
- raw logs dumped on the screen

---

## Audience reuse and iteration

### Purpose
Support repeated product usage.

Users should be able to:
- save a successful or useful audience
- clone and slightly modify an audience
- create a variant audience for compare
- reuse an audience across simulations
- derive an audience from a simulation result
- build private audience libraries over time

### Why this matters
This drives:
- retention
- workflow continuity
- stronger B2B use
- enterprise value

---

## Quality and trust layers

Audience and Agent Atlas should expose quality/trust information where useful.

### Examples
- coverage quality
- low diversity warning
- geography imbalance note
- platform imbalance note
- small-sample warning
- memory depth note
- private audience note

### Why
This reinforces trust and avoids black-box perception.

---

## Identity realism rules

### Required
- unique usernames
- realistic display names
- geography grounded in real locations
- stable avatars
- no over-reliance on a handful of popular cities
- culturally plausible naming

### Avoid
- repetitive names
- fake-sounding combinations
- one-size-fits-all bios
- platform presence identical for everyone
- cartoonishly stereotyped traits

---

## Product navigation relationships

From Audience Studio, users should be able to jump to:
- New Simulation
- Audience Detail
- Agent Atlas
- Graph Explorer
- related reports

From Agent Profile, users should be able to jump to:
- Simulation Canvas for relevant runs
- Report Detail
- Compare Detail
- Graph Explorer
- related audience

This module must feel deeply connected to the rest of the platform.

---

## Enterprise implications

### Private audiences
Enterprise users may need:
- org-private audiences
- source-informed custom populations
- higher memory continuity
- stricter access controls
- reusable internal audience libraries

### Governance
Audience and agent access may need:
- permission controls
- workspace boundaries
- audit trails for edits/creation
- team-level visibility rules

---

## Anti-patterns to avoid

### Do not
- treat agents as disposable simulation-only shells
- treat audience creation as a tiny side feature
- reduce profiles to only name + city + bio
- hide platform presence
- hide memory continuity
- overcomplicate profile pages with raw internals
- make the synthetic population feel fake or randomly generated each time

---

## Non-negotiable requirements

This module must support:
- persistent global population
- unique usernames
- stable avatars from username seeds
- realistic geography
- multi-platform presence
- memory continuity
- audience creation and reuse
- deep inspectability of agents
- clean separation between persistent identity and run participation

---

## Final rule for Claude

**Treat the synthetic population as one of Raktio’s core assets. Audience Studio and Agent Atlas must make the population inspectable, reusable, persistent, realistic, and productively useful. Never design agents as throwaway runtime artifacts or reduce audiences to shallow demographic filters only.**


---

## Implementation Status (as of 2026-04-14)

### Audience Studio
- **GET /api/audiences**: list (paginated, workspace-scoped) ✓
- **GET /api/audiences/{id}**: single audience ✓
- **DELETE /api/audiences/{id}**: soft archive ✓
- **Auto-generated audiences**: created during `prepare-audience` flow ✓
- **Missing**: create/edit/duplicate endpoints, filter-based selection, source-derived audiences, clone-and-edit

### Agent Atlas
- **NOT IMPLEMENTED** — `api/agents.py` is a stub
- No browsing, filtering, or profile viewing API
- Agents exist in the database with full profiles but have no public API surface

### Population quality hardening (Step 7.5E0)
- Profile validation on LLM output (skip nameless, force country, clamp enums)
- Platform presence sourcing (agents matched by platform_presence join)
- Cross-country deduplication (exclude_ids parameter)
- Coverage quality metrics in audience preparation response
