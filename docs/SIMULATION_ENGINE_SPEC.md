# SIMULATION_ENGINE_SPEC.md

## Purpose

This document defines how Raktio uses and configures the live simulation engine.

Raktio is **OASIS-first**, so the simulation engine spec must preserve OASIS as the true runtime while defining:
- how simulations are configured
- how agents are selected and activated
- how multi-platform behavior works
- how geography is represented
- how simulated time works
- how recsys/exposure shape outcomes
- how interviews/manual actions fit into the runtime

This file describes the **runtime behavior model**, not the full SaaS product around it.

---

## Core rule

**The simulation engine must remain a real social system, not a content generator.**

Agents must:
- observe feeds
- receive exposure shaped by recsys/platform
- act over simulated time
- change relations
- react differently by geography, segment, and platform
- be interviewable
- leave evidence in trace/state

---

## Engine identity inside Raktio

Raktio uses OASIS as the core runtime engine.

### OASIS owns
- environment stepping
- social actions
- feed/exposure serving
- local runtime state
- simulated time progression
- basic action grammar
- per-run truth

### Raktio configures and extends
- simulation planning output
- agent selection from persistent pool
- multi-platform behavior model
- deeper geography distribution
- memory transformation after events
- richer product metrics and observability
- product-facing simulation controls

---

## Simulation object model

Every simulation run should be defined by a finalized runtime configuration that includes:

- simulation ID
- run ID
- simulation goal
- selected agents
- platform mix
- geography distribution
- duration preset
- recsys choice(s)
- stance distribution
- temporal activity profile
- add-on features enabled
- reporting flags
- compare lineage metadata

This runtime config must be explicit and versioned.

---

## Core runtime dimensions

The simulation engine must be configurable along five major dimensions:

1. **Agent population**
2. **Simulated time**
3. **Geography**
4. **Platform mix**
5. **Exposure / recommendation behavior**

All five affect simulation behavior and should be treated as first-class runtime parameters.

---

# 1. Agent population

## Purpose
Define who is present in the simulated world.

### Agent source
Agents must come from:
- global persistent pool
- private audience pools
- newly generated missing coverage

### Agent count rules
- agent count is user-adjustable
- planner recommends a count
- credit cost scales progressively
- user can type exact values manually
- self-serve standard supports up to 10k
- scale/business plan supports up to 50k
- enterprise and hyperscale are custom-managed tiers

### Runtime population requirements
Every active runtime participant must have:
- stable runtime identity mapping
- geography
- demographics
- psychographics
- platform presence model
- activity level
- influence weight
- stance bias
- memory seed/context summary

### Runtime participation shell
For each run, agents should get a run participation state containing:
- active/inactive in this run
- runtime stance
- active platform flags
- current local context
- local relation state
- local memory delta

---

# 2. Simulated time

## Purpose
The simulation must evolve over a meaningful social time axis.

### Official duration presets
- 6h
- 12h
- 24h
- 48h
- 72h

### Time rule
Time has a **medium cost weight** in the pricing model:
- less than population size
- meaningful enough to affect planning and runtime complexity

### Runtime meaning
Simulated time is not decorative. It must influence:
- activity rhythms
- who is awake/active
- pacing of reactions
- trend emergence
- clustering of key events
- escalation or cooling patterns

### Temporal activity model
Use daypart multipliers inspired by MiroFish-style patterns:
- dead hours
- morning hours
- workday hours
- peak evening hours
- night hours

These should affect:
- how many agents activate
- how likely certain actions are
- how fast topics move
- how dense the feed becomes

### UX implication
The Simulation Canvas must always expose:
- current simulated time
- progression through the selected duration
- turning points on the timeline

---

# 3. Geography model

## Purpose
Represent social reaction spatially and culturally.

### Rule
Geography is not just a label; it affects:
- audience composition
- local reaction differences
- platform behavior tendencies
- language/cultural framing
- map visualization
- local segment analysis

### Geography scope types
- single-country
- multi-country regional
- multi-region / global mix

### Distribution rule
The planner proposes geography distribution.  
The user can edit it manually.

### Example
For a 1,000-agent Europe simulation, the planner may suggest:
- 250 Italy
- 200 France
- 180 Germany
- 150 Spain
- 100 Netherlands
- 120 rest-of-Europe mix

User can override this.

### Single-country rule
If the run is single-country, geo mode must drill into internal territorial layers rather than collapsing into one static area.

### Tiered geo depth
#### Tier 1
High-depth countries:
- Italy
- France
- Germany
- Spain
- UK
- USA

#### Tier 2
Medium-depth countries:
- country
- region/state
- major cities

#### Tier 3
Base-depth countries:
- country
- macro internal area where needed

### Geography and cost
Geography affects cost, but less than agent count.  
It should be treated as a light-to-medium multiplier, not a dominant one.

---

# 4. Multi-platform model

## Official model
Raktio uses **Multi-platform Model 1**.

### Meaning
There is one unified synthetic population.  
Agents are people, not isolated single-platform accounts.

A single agent may:
- exist on some platforms and not others
- behave differently depending on platform context
- carry the same underlying identity across all platforms
- express different tone/frequency/style by platform

### Supported platform set
Current intended set:
- X
- Reddit
- Instagram
- TikTok
- LinkedIn

### Important rule
OASIS is most natively aligned with X/Reddit-like behavior.  
Instagram, TikTok, and LinkedIn are added as deeper behavioral/rendering layers on top of the unified runtime model.

### Platform presence per agent
For each agent, track:
- active_on_x
- active_on_reddit
- active_on_instagram
- active_on_tiktok
- active_on_linkedin

Optional richer fields:
- posting frequency by platform
- engagement style by platform
- tone style by platform
- likely lurker vs poster behavior by platform

### Behavioral difference examples
#### X
- shorter, faster, more reactive
- more quote/repost conflict
- more sharp debate

#### Reddit
- discussion-heavy
- thread depth matters more
- community tone matters more

#### Instagram
- more visual framing
- shorter comments
- aesthetic/social proof emphasis
- weaker explicit dislike semantics

#### TikTok
- rapid reaction
- trend/slang influence
- short sharp commentary
- faster polarizing spread

#### LinkedIn
- more professional framing
- higher reputation signaling
- more “positioning” language
- lower raw aggression by default, but subtle skepticism possible

### Product implication
The same run can be interpreted across different platform lenses without pretending they are unrelated populations.

---

# 5. Stances and behavioral posture

## Purpose
Define directional predisposition inside the run.

### Base stance set
- supportive
- opposing
- neutral
- observer

### Runtime use
Stance affects:
- probability of certain actions
- tone
- amplification tendency
- objection framing
- willingness to post vs lurk
- conflict escalation tendency

### Extended behavior fields
Raktio should also preserve richer behavioral modifiers such as:
- persuadability
- controversy tolerance
- risk tolerance
- amplification tendency
- bridge tendency
- loyalty bias

### Rule
Stance is one layer, not the whole personality.

---

# 6. Recommendation / exposure logic

## Purpose
Determine what agents see and therefore what they can react to.

### Core principle
Reaction without exposure is analytically incomplete.

### Supported recsys
Raktio should support all OASIS runtime recsys options:
- random
- reddit/hot-score style
- personalized
- twhin-bert

### Planner behavior
The planner can recommend a recsys.  
Advanced users/admins may override.

### Product relevance
The engine must retain enough exposure information to support:
- feed interpretation
- report explanation
- segment exposure analysis
- patient zero / cascade analysis
- “what they saw” views

### Exposure outputs to preserve
- top exposed posts
- segment exposure
- geography/platform exposure differences
- exposure-to-reaction links

This is one of the strongest differentiators of the product.

---

# 7. Social action grammar

## Core rule
Keep the full OASIS action grammar available in the engine, even if some UI surfaces expose only subsets at first.

### Core action families
#### Content creation
- create post
- create comment
- quote post
- repost

#### Reaction
- like post
- unlike post
- dislike post
- undo dislike post
- like comment
- unlike comment
- dislike comment
- undo dislike comment

#### Discovery
- search posts
- search user
- trend
- refresh

#### Relationship
- follow
- unfollow
- mute
- unmute

#### Moderation-like behavior
- report post

#### Group/community actions
- create group
- join group
- leave group
- send to group
- listen from group

#### Manual/extra
- interview
- do nothing
- signup
- purchase product (optional future scenarios)

### Product implication
Because the grammar is rich, the engine can support:
- feed realism
- graph realism
- social fragmentation
- causal reporting
- group/community scenarios
- richer platform interpretation

---

# 8. Group/community behavior

## Purpose
Support scenarios where community clusters matter more than pure public feed behavior.

### Use cases
- fandoms
- professional communities
- activists
- private discussion pockets
- community-led escalation
- subculture behavior

### Runtime rule
Keep group primitives available in the engine, even if they are not always surfaced prominently in the product UI.

### Product use later
Group/community actions can support:
- faction analysis
- cluster deep-dives
- private-group rumor spreading
- enterprise/community simulations

---

# 9. Interview and manual actions

## Purpose
Allow the user or report system to directly question a live or completed-run agent.

### Interview modes
- interview one agent
- ask selected agents
- ask a segment
- ask a geography slice
- ask the crowd
- ask cluster/faction

### Runtime rule
Interviews should route through the engine’s manual action/interview path, not through a fake separate profile chatbot detached from the run context.

### Important
Interview responses should be grounded in:
- agent identity
- run context
- recent memory
- prior exposure
- platform/social context where relevant

---

# 10. Runtime metrics and event generation

## Purpose
Make the simulation observable as a living system.

### Core runtime outputs
- posts created
- comments created
- likes/dislikes
- reposts/quotes
- follows/unfollows
- mutes
- reports
- searches
- trend emergence
- group events
- time progression

### Derived runtime signals
- sentiment shifts
- polarization
- belief shifts
- cascade sources
- top amplifiers
- local geo spikes
- platform spikes
- cluster formation
- echo chamber signals

### Important rule
Derived signals should be based on runtime evidence, not hallucinated analytics.

---

# 11. Run bootstrap behavior

## Purpose
Turn a configured simulation into an executable runtime.

### Bootstrap tasks
- materialize final runtime config
- create run workspace
- map persistent agents into runtime participants
- initialize SQLite runtime state
- seed identities/platform flags
- start event supervision
- expose initial run status

### UX rule
Bootstrap must be visible and honest.  
The user should see meaningful progress rather than a fake spinner with no state.

---

# 12. Runtime state model

Suggested states:
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

### Rule
State transitions must be explicit, persisted, and auditable.

---

# 13. Replay and re-entry behavior

## Purpose
Support interpretation, replay, and compare workflows.

### Engine requirement
The runtime must produce enough history to allow:
- replay by time window
- turning-point inspection
- post-run evidence reconstruction
- compare against other runs
- event-based annotations

### Important
Replay is not cosmetic.  
It is part of the analytical value of the engine.

---

# 14. Memory update compatibility

## Purpose
Ensure that runtime output can become persistent synthetic population memory.

### The engine must expose enough detail for:
- event-to-episode conversion
- stance history updates
- relationship history updates
- topic exposure updates
- notable event extraction
- simulation participation summaries

### Rule
The engine does not own long-term memory directly, but must produce the evidence needed for it.

---

# 15. Scale model

## Official scale tiers
- Standard self-serve: up to 10,000 agents
- Top business/scale plan: up to 50,000 agents
- Enterprise: above 50,000
- Hyperscale / Super Enterprise: custom-managed toward OASIS high-scale capability

### Important distinction
These are product/control tiers, not hard proof that runtime value is identical at every scale under every infrastructure condition.

### UX implication
Higher scales should trigger:
- stronger complexity warnings
- better expectation setting
- more summarized live views where appropriate
- managed run controls in enterprise contexts

---

# 16. Cost relationship model

The simulation engine informs credit pricing through:

- population size
- duration
- platform count
- geography scope
- add-ons/interview/report depth

### Relative pricing weight
- population size = strongest
- platform count = medium-strong
- duration = medium
- geography = light-medium
- add-ons = modular

The engine spec must make these relationships meaningful from a runtime perspective.

---

# 17. Failure and resilience model

### Possible runtime failures
- bootstrap failure
- OASIS launch failure
- event bridge failure
- SQLite access issues
- high-scale runtime instability
- interview timeout
- report-handoff failure

### Engine requirement
The runtime integration must support:
- recoverable failure states where possible
- diagnostics
- admin visibility
- clean cancellation
- explicit failed state persistence

No silent “pretend it worked” behavior.

---

# 18. Non-negotiable engine requirements

The simulation engine must:
- remain OASIS-based
- support agent-level persistent identity mapping
- support simulated time presets
- support deep geography logic
- support multi-platform model 1
- preserve recsys/exposure logic
- preserve social action richness
- support interviews/manual actions
- produce evidence-rich traces
- support replay and memory transformation

---

## Final rule for Claude

**Treat the simulation engine as the real behavioral core of Raktio. Configure and extend OASIS for persistent synthetic users, multi-platform model 1, deep geography, simulated time, rich exposure logic, and interviewable agents—but never collapse it into a simplified fake content generator.**


---

## Implementation Status (as of 2026-04-14)

### OASIS integration
- **OASIS v0.2.5** verified importable on Python 3.12 (despite pyproject.toml <3.12 constraint)
- **Dependencies installed**: camel-ai 0.2.78, torch (CPU), sentence-transformers, igraph, neo4j
- **Model backend**: `ModelFactory.create(OPENAI_COMPATIBLE_MODEL, "deepseek-chat", api_key, url)` — DeepSeek for RUNTIME route
- **Execution**: `oasis.make()` → `env.reset()` → `env.step({agent: LLMAction()})` × N → `env.close()`
- **Tested**: 3-agent, 6-step run produces 6 posts, 7 comments, 2 likes, 33 trace entries

### Action set (21 of 31 enabled)
- **Content**: CREATE_POST, CREATE_COMMENT, REPOST, QUOTE_POST
- **Post reactions**: LIKE/UNLIKE/DISLIKE/UNDO_DISLIKE_POST
- **Comment reactions**: LIKE/UNLIKE/DISLIKE/UNDO_DISLIKE_COMMENT
- **Relationships**: FOLLOW, UNFOLLOW, MUTE, UNMUTE
- **Discovery**: SEARCH_POSTS, SEARCH_USER, TREND
- **Moderation**: REPORT_POST
- **Passive**: DO_NOTHING
- **Excluded**: REFRESH, SIGNUP, UPDATE_REC_TABLE, EXIT (internal); INTERVIEW (manual); PURCHASE_PRODUCT (not social); 5 group actions (deferred)

### Status lifecycle (authoritative)
```
simulations.status: draft → cost_check → bootstrapping → running → completing → completed
                                                        ↘ failed / canceled / paused
simulation_runs.status: bootstrapping → running → completing → completed
                                                 ↘ failed / canceled / paused
```

### Runtime SQLite schema (17 tables verified)
user, post, comment, like, dislike, follow, mute, report, rec, trace, comment_like, comment_dislike, chat_group, group_members, group_messages, product, sqlite_sequence

### What is NOT yet implemented
- Interview bridge (stub)
- Temporal activity multipliers (daypart patterns)
- Group simulation features (5 group actions)
- Replay/re-entry behavior
- ARQ background worker dispatch (currently asyncio.create_task)

### Reality Upgrade Plan — Distribution & Platform (defined 2026-04-14)
- **Step 10.5D**: Temporal activity multipliers — daypart patterns affecting agent activation rates
- **Step 10.5E**: Influence-weighted reach — publisher authority gradient in recsys/exposure
- **Step 10.5H**: Platform behavior action weight profiles — per-platform action probabilities (Instagram: more likes less text, LinkedIn: professional framing, TikTok: rapid short reactions)
- Currently OASIS runs all agents uniformly per step. These upgrades add temporal and social-structural realism.
