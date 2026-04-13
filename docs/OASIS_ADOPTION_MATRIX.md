# OASIS_ADOPTION_MATRIX.md

## Purpose

This document defines exactly what Raktio adopts from OASIS, what it adapts, and what it does not use directly.  
Raktio is **OASIS-first**: OASIS remains the core social simulation runtime. Raktio must not replace OASIS social behavior with a simplified custom system.

---

## Decision rule

For every OASIS component, one of these statuses applies:

- **Use directly** — keep as core runtime behavior
- **Adapt** — keep the logic, but wrap or reinterpret it for Raktio product needs
- **Do not use directly** — do not expose or copy as-is into the product layer

---

## Layer boundary

### OASIS owns
- simulation runtime
- social actions
- world state changes
- time-stepping
- recommendation/exposure logic
- run-local SQLite state
- agent action execution
- manual actions / interview primitives

### Raktio owns
- brief ingestion
- audience planning
- persistent synthetic population
- multi-tenant SaaS layer
- Supabase persistence
- Simulation Canvas UI
- reports and compare workflows
- billing and credits
- admin and governance
- cross-simulation memory policy

---

## Adoption matrix

| OASIS component | Source area | Status | Why it matters | How Raktio uses it | Product impact | Backend impact |
|---|---|---:|---|---|---|---|
| `OasisEnv` / environment stepping | `oasis/environment/env.py` | **Use directly** | It is the simulation loop backbone | Run each simulation through the OASIS environment instead of replacing it with custom orchestration logic | Makes simulations feel alive and stateful | Requires robust job orchestration, progress tracking, and runtime monitoring |
| `Platform` social backend | `oasis/social_platform/platform.py` | **Use directly** | This is the real social world backend: posts, follows, mutes, rec tables, comments, etc. | Use as the core runtime social backend for each run | Gives Raktio real social behavior instead of fake generated threads | Needs wrappers, event extraction, and sync bridges |
| SQLite run database | `oasis/social_platform/schema/*` | **Use directly** | Stores the operational truth of a simulation run | Keep SQLite as per-run runtime state, then sync relevant results to Supabase | Supports replay, live canvas, and analytics | Requires run-level storage management and sync jobs |
| Trace logging | `trace` table and related runtime logging | **Use directly** | Every action is logged, which is essential for replay, patient zero analysis, and report evidence | Stream trace-derived events into the Simulation Canvas and reports | Enables turning-point analysis and evidence-based reporting | Requires normalized event pipeline and stream transport |
| Agent action execution via LLM | `oasis/social_agent/agent.py` | **Use directly** | Core agent autonomy already exists | Preserve OASIS tool/action-based behavior rather than flattening to one-shot generation | Makes Raktio a true simulation product | Requires prompt control, context injection, and model routing |
| `perform_interview()` | `oasis/social_agent/agent.py` | **Use directly** | Direct questioning of a live agent is a differentiating feature | Use as the base for "Interview Agent" and "Ask the Crowd" | Strong product differentiation | Requires IPC and interview orchestration |
| `perform_action_by_data()` | `oasis/social_agent/agent.py` | **Adapt** | Useful for forcing certain actions or operator interventions | Use for manual interventions, controlled testing, and admin/debug workflows | Enables operator control and curated scenarios | Requires controlled API surface and permissions |
| Action catalog (all social actions) | `oasis/social_agent/agent_action.py` | **Use directly** | These are the grammar of the simulation | Preserve all actions at runtime, even if not all are exposed equally in early UI | Richer behavior, better realism | UI/event model must support more than basic post/comment/like |
| Social actions: posts, comments, like, dislike, repost, quote | agent action layer | **Use directly** | Core observable feed behavior | Drive Feed mode and report evidence | Essential | Standard live event rendering |
| Search actions | `SEARCH_POSTS`, `SEARCH_USER` | **Use directly** | Adds information-seeking behavior and realism | Surface as feed events and search-behavior analytics | Strong realism signal | Must be represented in event schema |
| Follow/unfollow actions | action layer + schema | **Use directly** | Critical for relationship evolution | Use in graph dynamics and influence analysis | Enables social graph change over time | Needs graph update logic |
| Mute/unmute actions | action layer + schema | **Use directly** | Important for backlash and echo chamber formation | Surface in toxicity, fragmentation, and relationship analytics | Valuable for enterprise insight | Needs derived metrics and reporting |
| Report post action | `REPORT_POST` | **Use directly** | Captures escalation and moderation-like behavior | Surface as risk/event signal in live view and final report | Very useful for PR/crisis cases | Requires event classification and aggregation |
| Group chat actions | create/join/leave/send/listen group | **Use directly** | Supports group/community simulations and factional behavior | Keep available in the runtime even if not central in every UI flow | Useful for advanced scenarios | Needs optional group visualizations later |
| Recommendation systems | `oasis/social_platform/recsys.py` | **Use directly** | Exposure drives reaction; this is essential to simulation realism | Support all OASIS recsys options and allow planner/user selection | Exposure view becomes a premium differentiator | Requires config support and analytics exposure logging |
| `random` recsys | recsys | **Use directly** | Baseline or control scenario | Allow in controlled experiments | Useful for comparison | Simple config |
| `reddit` recsys / hot-score style | recsys | **Use directly** | Important for discussion-heavy and popularity-decay simulations | Useful for Reddit-like or discussion-first runs | Helps platform-specific behavior | Needs proper labeling in setup |
| `personalized` similarity recsys | recsys | **Use directly** | Stronger personal relevance modeling | Useful for audience-targeted testing | Supports more realistic personalization | Requires embeddings/model availability planning |
| `twhin-bert` recsys | recsys | **Use directly** | Strong Twitter-like contextual feed behavior | Default strong choice for X-like simulations | Supports high-realism feed ranking | Requires supporting model pipeline |
| Clock / simulated time | `oasis/clock/clock.py` | **Use directly** | Simulated time is a first-class axis of the product | Expose simulation duration presets and render simulated time in canvas/report | Makes runs feel like social worlds rather than static tests | Requires time conversion and replay support |
| Trend logic | platform config and trend actions | **Use directly** | Trend emergence is a major insight surface | Use in live trending topics and post-run topic analysis | Supports "world is moving" feeling | Needs aggregation and UI surfacing |
| `show_score`, `allow_self_rating`, feed parameters | platform config | **Adapt** | These are low-level runtime knobs | Keep configurable internally, expose only selected ones in admin or advanced setup | Avoids overwhelming normal users | Requires admin config layer |
| `refresh_rec_post_count`, `max_rec_post_len`, `following_post_count` | platform config | **Adapt** | Useful advanced tuning knobs | Not for regular users; expose in advanced/admin settings or AI planner | Keeps product clean while preserving power | Needs config abstraction |
| `trend_num_days`, `trend_top_k`, `report_threshold` | platform config | **Adapt** | Useful for advanced scenario tuning | Keep as internal or advanced controls | Makes enterprise tuning possible | Requires admin/tuning surface |
| SQL schemas and runtime tables | schema files | **Use directly** | They encode the world state OASIS expects | Preserve them for run execution | Stable runtime foundation | Needs mapping to product analytics storage |
| OASIS examples and demo scripts | `examples/` | **Do not use directly** | Good reference, but not product-ready UX or architecture | Use only as engineering references | No direct product value | Helpful for testing patterns only |
| Raw technical UI assumptions from OASIS | repo structure | **Do not use directly** | OASIS is not a polished product UI | Raktio must build its own Simulation Canvas and SaaS UX | Protects product quality | No direct adoption |
| OASIS as persistent population store | overall design | **Do not use directly** | OASIS is run-centric, not product-centric | Raktio must own persistent global agent identities in Supabase | Enables synthetic social population over time | Requires identity + memory model outside OASIS |
| OASIS as billing/tenant layer | overall design | **Do not use directly** | Not part of OASIS scope | Raktio must provide SaaS controls | Required for productization | Separate product backend needed |

---

## Product-critical conclusions

### 1. OASIS is the runtime, not just a content generator
Raktio must not flatten OASIS into a "generate comments" engine.  
The simulation must remain a true social world powered by OASIS state transitions and actions.

### 2. Exposure logic is as important as output content
It is not enough to show what agents wrote.  
Raktio must also show, explain, or analyze **what they were exposed to**, because exposure affects reaction.

### 3. Trace is a goldmine
The trace/action history must power:
- replay
- timeline
- patient zero analysis
- turning point detection
- backlash mapping
- evidence-backed reports

### 4. Manual interview is a core feature
The OASIS interview capability is not a side detail.  
It should become one of Raktio’s most visible premium features.

### 5. OASIS does not solve the persistent social population product problem
Raktio must add:
- global persistent agent pool
- agent identity continuity
- cross-simulation memory policy
- private audiences
- audience studio
- product-facing profiles and visuals

---

## What must not happen

Raktio must **not**:
- replace OASIS social logic with simplified one-shot prompting
- discard trace richness and only keep pretty posts
- expose low-level runtime complexity directly to standard users
- treat OASIS examples as product templates
- confuse per-run runtime state with persistent product identity

---

## Engineering implication summary

### Keep
- OASIS run engine
- OASIS social backend
- OASIS action system
- OASIS recsys
- OASIS SQLite run state
- OASIS trace
- OASIS time model
- OASIS interview/manual action primitives

### Add around it
- Raktio planners
- Raktio persistent agents
- Supabase product persistence
- streaming bridge
- Simulation Canvas
- reports and compare
- credits/pricing
- admin/governance
- cross-run memory management

---

## Final rule for Claude

**Raktio must remain OASIS-powered at its core. Do not replace OASIS social simulation logic with simplified custom orchestration. Use OASIS as the simulation runtime, wrap it with Raktio product services, and expose its power through a product-grade SaaS experience rather than a raw technical interface.**
