# SIMULATION_CANVAS_SPEC.md

## Purpose

This document defines the Simulation Canvas, the most important product surface in Raktio.

The Simulation Canvas is where users observe, inspect, and interact with the live simulated world.  
It must feel:
- alive
- analytical
- controllable
- premium
- information-dense but readable

It must not be treated as a simple scrolling feed page.  
It is the central operational console of the product.

---

## Core product rule

**If the Simulation Canvas is weak, Raktio is weak.**

The user must not feel like they are watching fake bots emit text.  
They must feel like they are observing:
- a living synthetic social world
- reactions spreading over time
- factions emerging
- beliefs shifting
- influence flowing
- geography reacting differently
- platforms shaping behavior differently

---

## Canvas mission

The Simulation Canvas must allow a user to answer questions like:

- What is happening right now?
- Who is driving the conversation?
- Where is sentiment turning?
- Which segment is reacting badly?
- Which geography is diverging?
- What content is spreading?
- Who changed their mind?
- Who triggered the cascade?
- Which platform is amplifying risk?
- Should I stop, rerun, or branch into a compare scenario?

---

## Layout overview

The Simulation Canvas should use a **three-zone layout**:

### 1. Header / command bar
### 2. Left rail / filters and control
### 3. Main canvas area
### 4. Right rail / live metrics and alerts

The layout must remain stable while the central mode changes.

---

## 1. Header / command bar

### Purpose
Show the simulation identity and give runtime-level controls.

### Required content
- simulation name
- status chip (`bootstrapping`, `running`, `paused`, `reporting`, `completed`, etc.)
- simulated time
- real elapsed time
- agent count
- platform summary
- geography summary
- mode switcher
- credit/cost summary (optional compact form)
- action buttons

### Action buttons
- pause
- resume
- stop
- clone
- create variant
- open report
- export snapshot
- open compare

### Important UX note
The header must always remind the user:
- this is a real running world
- what time it is in the simulation
- how large the world is
- what scope they are observing

---

## 2. Left rail — filters and controls

### Purpose
Let the user shape what they are looking at without leaving the simulation.

### Required controls
- platform filter
- geography filter
- segment filter
- stance filter
- sentiment filter
- event type filter
- agent influence filter
- time slice filter
- “show only alerts”
- “show only belief shifts”
- “show only negative cascade”
- “show only conversions”
- “show only reports/mutes/unfollows”

### Additional controls
- replay slider
- speed / density control for visual modes
- switch between full population and filtered subset
- save current view as snapshot

### Key rule
Filtering must feel like investigative control, not like generic dashboard filtering.

---

## 3. Main canvas area

This is the heart of the page.

The main area must support multiple observation modes over the **same simulation**.

---

# Canvas modes

## Mode A — Feed

### Goal
Read what agents are saying and doing in a familiar social format.

### Must show
- posts
- comments
- reposts
- quotes
- search events
- follows/unfollows
- mute/report events when relevant
- mini status events
- platform indicator
- time indicator

### Post card content
Each post card should include:
- avatar
- display name
- username
- location badge (compact)
- platform badge
- content
- image/media preview if relevant
- metrics (likes, comments, reposts, quotes, etc.)
- sentiment indicator
- stance/archetype chip
- influence/reach signal
- event tags such as:
  - viral
  - controversial
  - bridge
  - amplifier
  - turning point

### Comment thread behavior
Comments should:
- feel social and threaded
- remain readable
- allow collapse/expand
- support “inspect thread impact”

### Feed actions
- inspect agent
- interview agent
- inspect event propagation
- bookmark post
- open in network context
- mark as turning-point candidate

### UX rule
This mode must look like a premium “augmented social feed”, not just a plain social clone.

---

## Mode B — Network

### Goal
See social structure, influence flow, faction formation, and cascades.

### Visual model
- nodes = agents
- edges = interactions / relationships
- node size = influence or activity
- node color = stance / sentiment / segment / geography (switchable)
- edge color = interaction type
- edge intensity = recent strength
- clusters = communities or echo chambers
- pulses/waves = propagation events

### Must support
- zoom
- pan
- click node
- click edge
- multi-select cluster
- isolate faction
- focus patient zero
- focus top amplifiers
- show only negative cascade
- show only positive spread
- show only belief-shift paths

### Side inspect panel
When a node is selected:
- avatar
- name / username
- location
- current stance
- current sentiment
- influence weight
- key recent actions
- memory summary
- interview button
- open profile button

When an edge is selected:
- relation type
- interaction history
- strongest recent event
- directionality
- impact notes

### UX rule
This mode must feel like:
- a living relationship map
not
- an abstract graph demo

---

## Mode C — Timeline

### Goal
Understand evolution over time.

### Must show
- activity volume over time
- sentiment shifts over time
- polarization over time
- belief shifts over time
- key turning points
- spikes in:
  - reports
  - mutes
  - follows
  - reposts
  - controversy
- patient zero moment
- top amplifier moments
- key message emergence

### Interactions
- scrub timeline
- click on turning point
- jump canvas to that moment
- compare timeline slices
- bookmark time windows

### UX rule
The timeline is not just a chart.  
It is the simulation’s “story spine”.

---

## Mode D — Geo

### Goal
See how reactions vary by geography.

### Core rule
Geo must remain meaningful even in single-country simulations.

### Multi-country behavior
Start at:
- continent / macro-region
then
- country level
with drill-down

### Single-country behavior
Start at:
- regional/state level
then
- province/county/city where available

### Must show
- activity volume by geography
- sentiment by geography
- polarization by geography
- top topics by geography
- top agents/clusters by geography
- platform differences by geography
- drill-down maps
- hot zones / cold zones

### Interactions
- click area to drill down
- compare areas
- filter by platform within geography
- open local feed
- open local segment breakdown

### UX rule
The map must not be decorative.  
It must feel analytically useful.

---

## Mode E — Segments

### Goal
Compare reactions across audience segments.

### Segment examples
- age bands
- profession
- gender
- income band
- tech literacy
- archetype / stance
- platform-heavy users
- geography-derived cohorts
- source-derived cohorts
- private audience slices

### Must show
- segment activity
- segment sentiment
- segment conversion / belief shift
- top objections
- top positive signals
- top amplifiers within segment
- segment-specific trend topics

### Interactions
- compare 2+ segments
- isolate segment feed
- isolate segment network
- open segment report slice
- ask-the-crowd restricted to segment

### UX rule
This mode must answer:  
**who reacted this way, and who reacted differently?**

---

## Mode F — Compare

### Goal
Observe two simulations or two variants side by side.

### Use cases
- original vs edited post
- price A vs price B
- country mix A vs country mix B
- platform mix A vs platform mix B
- audience A vs audience B

### Layout
Prefer split-screen or synchronized compare controls.

### Must show
- summary delta cards
- feed delta
- timeline delta
- segment delta
- geo delta
- belief shift delta
- recommendation delta

### Interactions
- sync time windows
- toggle winner highlights
- jump to divergence point
- save compare snapshot

### UX rule
Compare mode is not a static report view; it is a live diagnostic workspace.

---

## 4. Right rail — live metrics and alerts

### Goal
Surface high-signal quantitative context continuously.

### Required modules
- sentiment live card
- polarization score
- top amplifiers
- belief tracker
- trending topics
- velocity / spread indicator
- follow vs unfollow balance
- reports / mutes spike
- platform activity split
- geography activity split
- run health / status
- alerts list

### Alerts examples
- Negative cascade emerging
- Belief shift accelerating
- One geography diverging strongly
- One platform becoming dominant
- Mute/report spike detected
- Segment X highly polarized
- Patient zero candidate identified

### UX rule
This rail must feel useful enough that users keep glancing at it constantly.

---

# Live metrics specification

## Core metrics
- active agents
- posts
- comments
- likes
- dislikes
- reposts
- quotes
- follows
- unfollows
- mutes
- reports
- searches
- group interactions
- interviews triggered

## Behavioral metrics
- activity velocity
- interaction depth
- thread depth
- engagement intensity
- amplification rate
- passivity rate
- observer ratio

## Relational metrics
- relationship changes
- new follows
- broken ties
- mute spikes
- cluster density
- echo chamber strength

## Cognitive / change metrics
- belief shifts
- stance shifts
- persuadable population movement
- hardened opposition growth
- neutral erosion
- positive adoption growth

## Causal metrics
- patient zero
- top amplifiers
- calming nodes
- bridge nodes
- cascade source chains

## Exposure metrics
- what content was shown most
- which segments saw which messages
- exposure vs reaction correlation
- platform distribution of exposure

---

# Agent interaction within canvas

The user must be able to directly interact with agents without leaving the simulation.

## Supported actions
- interview single agent
- inspect profile
- inspect memory timeline
- inspect their recent feed context
- see why they reacted
- see which platform they are active on
- see who influenced them

## Ask-the-crowd flows
From the canvas, the user should be able to:
- ask all agents
- ask filtered agents
- ask one segment
- ask one geography slice
- ask one cluster

This is a major differentiator.

---

# Replay and time navigation

## Purpose
Support post-run understanding and mid-run inspection.

### Required features
- scrub simulation time
- jump to beginning / latest / turning point
- replay only selected window
- replay only one geography or segment
- compare before/after a key event

### Important
Replay must use real simulation evidence, not fabricated retrospective summaries.

---

# Bookmarking and annotation

Users should be able to:
- bookmark events
- mark turning points
- write notes
- flag content as relevant for compare
- flag evidence for report export

This is useful for teams and enterprise workflows.

---

# Visual design principles

## The canvas must be:
- dense but not cramped
- alive but not chaotic
- premium but not theatrical
- analytical but still emotionally engaging
- readable across long sessions

## It must avoid:
- overdone sci-fi effects
- meaningless motion
- fake live feel
- giant empty map areas
- dashboard clutter without hierarchy

## Dopamine should come from:
- visible cascades
- visible shifts
- visible divergence
- visible agency
- visible consequence
- visible compare wins

Not from decoration.

---

# Single-country rule

If the user runs a single-country simulation:
- the Geo mode must automatically drill into internal geography
- the world must still feel rich and distributed
- the map must never look like one static blob

This is mandatory.

---

# Platform realism rule

The canvas must reflect the fact that:
- the same underlying agent can behave differently across platforms
- not every agent is present on every platform
- platform context changes tone, style, visibility, and interaction norms

This must be visible in:
- feed rendering
- platform badges
- segment/platform filters
- report interpretation

---

# Connection to other pages

From the Simulation Canvas, users must be able to jump to:
- Agent Profile
- Report Detail
- Compare Detail
- Audience Detail
- Graph Explorer
- Billing (if simulation is blocked by credits)

This page is the operational center and must not feel isolated.

---

# Tiered complexity

## Standard user
Sees:
- Feed
- basic metrics
- some alerts
- interviews
- limited compare

## Power user
Sees:
- full filters
- network tools
- timeline controls
- segment compare
- replay

## Enterprise/admin contexts
Can additionally use:
- advanced diagnostics
- deeper cost/runtime overlays
- managed run controls
- audit-related views

---

# Non-negotiable requirements

The Simulation Canvas must:
- support real-time observation
- support multi-view analysis
- make causality visible
- support agent interaction
- support replay
- support compare
- support geography
- support segment analysis
- support platform analysis
- be clearly superior to a simple live feed

---

## Final rule for Claude

**Build the Simulation Canvas as the central operational intelligence surface of Raktio. It must combine live social feed readability with deep observability across relationships, time, geography, segments, and comparison. Never reduce it to a scrolling message list or a decorative dashboard.**

---

## Implementation Status (as of 2026-04-15, post Step 10.6)

### Backend APIs supporting Canvas
- **SSE streaming**: `GET /api/stream/{sim_id}` — polling-based (2s interval), auth via header or `?token=`. Frontend hook `useSimulationStream.ts` implemented with reconnection logic.
- **State reader**: `runtime/state_reader.py` — combines Supabase simulation state + OASIS SQLite trace data for canvas rendering.
- **Simulation lifecycle**: 12 endpoints cover create→understand→plan→prepare-audience→launch→pause/resume/cancel flow.
- **Agent Atlas API**: `GET /api/agents/{agent_id}` — full profile with memory (episodes, relationships, topics). Available for agent detail panels in canvas.

### Backend realities Canvas must respect
- **Fresh vs Persistent mode**: `memory_mode` field on simulations. Canvas setup must expose this toggle. In "fresh" mode, agent memory panels show no prior history.
- **5 platform behavior profiles**: X, Reddit, Instagram, TikTok, LinkedIn. Each with different content_style, hashtag_tendency, peak_hours_shift. Canvas should reflect platform-specific rendering.
- **Temporal dayparts**: 7 levels (dead→peak). Activity rates vary by simulated hour. Timeline mode should reflect this.
- **Influence-weighted reach**: 3 levels (temporal activation + LLM guidance + rec table injection). High-influence agents' posts appear more in feeds.
- **Geography**: Agent country/city available from Supabase. Geography mode can use real geo data (injected into report evidence in Step 10.6).
- **14-section reports**: Generated post-completion via Claude REPORT route. Report panel can show progressive sections.

### Frontend Canvas Status (2026-04-15, post Step 11 Phase 1)

**Shell:** Fixed 3-zone layout — left rail filters, main canvas area, right rail live metrics
**Header:** Simulation name, status badge, agent/round/credit stats, Clone + End & Report buttons
**Playback:** Pause/Play button, progress slider (Round 1-N), timer display

**Canvas Modes:**
| Mode | Status | Details |
|------|--------|---------|
| Feed | IMPLEMENTED | Live post stream, viral indicators, stance badges, engagement metrics |
| Network | IMPLEMENTED | D3 force graph, 80 nodes, zoom, tooltips, click-to-drawer with agent profile |
| Geo | IMPLEMENTED | Leaflet map with cluster markers, popups, distribution legend |
| Timeline | PLACEHOLDER | Description card, requires SSE event data for time-series |
| Segments | PLACEHOLDER | Description card, requires audience segment data |
| Compare | PLACEHOLDER | Description card, links to Compare Lab |

**Left Rail Filters:** Platforms (5: X, Reddit, Instagram, TikTok, LinkedIn), Segments (2), Stance (3), Smart Filters (Influential Agents, Isolate Patient Zero)
**Right Rail Metrics:** Belief Shift, Toxic Drift alert, Unfollow Rate sparkline, Top Amplifiers, Trending Topics, Run Health (events/sec, polarization, queue depth)
**Agent Drawer:** Full profile on node click (identity, stance, risk, psych profile, current thought, interview + history buttons)

**Remaining for integration (Step 11 Phase 2-3):**
- Connect SSE streaming to replace mock data
- Implement Timeline mode with real step-by-step event data
- Implement Segments mode with real audience segment breakdowns
- Implement Compare side-by-side with real dual-simulation data

### NOT yet available for Canvas
- Real-time agent interview (RT-02 deferred)
- Ask-the-crowd feature
- NLP sentiment per post (behavioral inference only)
- Belief trajectory over time (MEM-03 deferred)
- Platform-specific recsys behavior (PLAT-04b deferred)
