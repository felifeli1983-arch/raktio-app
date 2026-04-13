# DATAFLOW_AND_RUNTIME.md

## Purpose

This document defines the full end-to-end dataflow of Raktio and the runtime lifecycle of a simulation.

It explains how a simulation moves from:
- user brief
to
- AI planning
to
- audience selection/generation
to
- OASIS run bootstrap
to
- live Simulation Canvas
to
- report generation
to
- compare/rerun
to
- persistent memory updates

This file is critical because Raktio is not a simple UI on top of model prompts.  
It is a structured simulation platform with multiple layers and persistence boundaries.

---

## Core rule

A Raktio simulation must always move through a **real pipeline**, not a fake one.

That means:
- the brief is actually interpreted
- the audience is actually planned
- the OASIS runtime is actually launched
- events are actually streamed from run state
- memory is actually transformed and persisted
- reports are actually generated from runtime evidence

No part of the product should “pretend” the pipeline happened if it did not.

---

## High-level pipeline

The full pipeline is:

1. **Brief ingestion**
2. **Brief understanding**
3. **Simulation planning**
4. **Audience sourcing / generation**
5. **Simulation configuration finalization**
6. **Run bootstrap**
7. **OASIS simulation execution**
8. **Live streaming to Simulation Canvas**
9. **Runtime-to-memory transformation**
10. **Report generation**
11. **Compare / rerun workflows**
12. **Cross-run persistence and learning**

---

## Phase 1 — Brief ingestion

### Inputs accepted
Raktio should accept:
- plain text brief
- structured prompt fields
- images
- PDFs
- DOCX/TXT/MD files
- future source imports / CRM-like material
- optional user tags or goals

### Example goals
- test a social post
- validate a startup idea
- compare two campaign directions
- test PR/crisis messaging
- simulate audience reaction to a product
- test a legal/public narrative
- evaluate a content strategy

### Product behavior
The system stores:
- raw brief
- uploaded assets
- simulation intent
- requesting workspace / user / org
- locale / language hints
- optional industry or use-case tags

### Output of this phase
A new **simulation draft** is created in product storage.

---

## Phase 2 — Brief understanding

### Purpose
Turn raw input into structured simulation context.

### Intelligence layer tasks
- extract key entities
- identify topic and domain
- detect simulation goal
- identify likely audience groups
- detect geography clues
- detect platform cues
- identify likely risks or ambiguity
- determine whether uploaded materials matter heavily

### Typical outputs
- topic summary
- relevant entities and concepts
- candidate audience segments
- candidate platforms
- candidate geography distribution
- recommended scale
- confidence / rationale notes

### Persistence
Store:
- interpreted brief summary
- extracted concepts
- planner context snapshot
- rationale notes

This is useful both for explainability and reruns.

---

## Phase 3 — Simulation planning

### Purpose
Convert understanding into a recommended simulation design.

### Planner decides or suggests
- number of agents
- scale tier
- simulated duration
- platform mix
- geography distribution
- stance distribution
- recsys recommendation
- complexity level
- expected credit cost
- expected bootstrap/runtime intensity

### Important rule
The planner suggests.  
The user can still modify:
- agent count
- countries/regions
- platform mix
- duration
- add-ons
- compare mode
- report depth

### Persistence
Store:
- planner recommendation version
- user overrides
- final chosen simulation setup
- pricing estimate snapshot

This matters for explainability and later compare/replay.

---

## Phase 4 — Audience sourcing / generation

### Purpose
Prepare the actual synthetic users that will participate.

### Input sources
Audience can be built from:
- the global persistent agent pool
- private audience pools
- newly generated agents
- source-derived profile enrichment
- geography-based selection
- persona/archetype balancing
- platform presence rules

### Selection logic
The system should:
1. try to satisfy the requested setup from the global persistent pool
2. generate new agents only when:
   - segment coverage is insufficient
   - geographic coverage is insufficient
   - diversity is insufficient
   - platform presence coverage is insufficient
   - a private audience needs to be created

### Agent structure used here
Each selected/generated agent must have:
- stable agent ID
- unique username
- display identity
- avatar seed
- geographic identity
- demographic profile
- psychographic traits
- platform presence profile
- long-term memory summary
- run participation shell

### Output
A concrete simulation population is assembled for the run.

### Persistence
Store:
- selected agent IDs
- generated new agent IDs
- simulation population snapshot
- geography and platform distribution snapshot

---

## Phase 5 — Simulation configuration finalization

### Purpose
Translate product-level setup into runtime-executable configuration.

### Configuration includes
- agent roster
- runtime identities / participant mapping
- platform selection
- recsys choice
- time duration preset
- temporal activity multipliers
- stance distributions
- initial seeding logic if any
- run metadata
- interview availability
- reporting mode hints

### Key rule
The final runtime config must be explicit and saved.

### Why
Because it is needed for:
- reproducibility
- compare mode
- reruns
- debugging
- enterprise trust
- post-run interpretation

### Persistence
Store:
- final runtime config
- config version
- simulation fingerprint/hash
- run launch parameters

---

## Phase 6 — Run bootstrap

### Purpose
Prepare and launch the OASIS runtime safely.

### Bootstrap responsibilities
- create run-local working directory
- initialize SQLite run database
- seed runtime users / identity mapping
- inject config into OASIS environment
- initialize platform state
- prepare event bridge
- register run in product backend
- transition simulation status:
  - draft -> bootstrapping -> running

### Product UX
The user should see bootstrap progress such as:
- reading brief
- preparing audience
- generating runtime identities
- configuring simulation
- starting social world
- opening live feed

### Important rule
Bootstrap can take time.  
The product must be honest and visible about it.

---

## Phase 7 — OASIS simulation execution

### Purpose
Run the actual social world simulation.

### OASIS responsibilities during runtime
- step the environment
- let agents act
- maintain world state
- rank/serve content through recsys
- update SQLite tables
- record traces
- respond to manual interview commands
- respect simulated time

### Runtime state changes
During the run, the system continuously updates:
- posts
- comments
- likes/dislikes
- quotes/reposts
- follow/unfollow
- mute/unmute
- searches
- reports
- group actions
- recommendations
- time progression
- trend state

### Run status model
Recommended statuses:
- draft
- planning
- audience_preparing
- bootstrapping
- running
- paused
- completing
- reporting
- completed
- failed
- canceled

---

## Phase 8 — Live stream to Simulation Canvas

### Purpose
Turn runtime truth into observable product experience.

### Event sources
Live data can come from:
- trace logs
- runtime table deltas
- normalized event bridge
- JSONL-like stream records
- derived metrics aggregation

### Simulation Canvas consumes
- feed events
- network relation events
- timeline markers
- geo-distributed activity
- segment-level aggregates
- live sentiment and polarization metrics
- top amplifiers / alerts
- run status and simulated time

### Canvas modes
The same run should be observable in multiple ways:
- Feed
- Network
- Timeline
- Geo
- Segments
- Compare

### Key rule
The live world must feel genuinely alive, not just like a list of generated messages.

---

## Phase 9 — Runtime-to-memory transformation

### Purpose
Convert low-level runtime events into persistent semantic memory.

### Why this matters
Raw events are not enough for:
- persistent agents
- memory timelines
- cross-run continuity
- report evidence
- interview context
- explainability

### Transformation layer does
- convert actions into textual/semantic episodes
- summarize meaningful shifts
- record who influenced whom
- record relationships formed or broken
- attach topic/entity tags
- record important quotes or signals
- mark turning points
- update persistent memory summaries

### Example episode forms
- agent posted about topic X
- agent shifted from neutral to skeptical after exposure to Y
- agent followed Z during the run
- agent muted cluster A
- agent amplified narrative B

### Persistence
Store:
- episodic memory entries
- memory summary deltas
- relationship changes
- topic exposure history
- run-to-agent memory links

---

## Phase 10 — Report generation

### Trigger
Begins when:
- the simulation completes
or
- enough runtime evidence exists to start progressive reporting

### Inputs
- run config
- trace-derived events
- metric aggregates
- semantic memory episodes
- geography aggregates
- platform aggregates
- selected interviews
- entity/topic search results

### Report generation model
Should be:
- evidence-backed
- section-based
- progressive
- tool-assisted
- explainable

### Output sections
- executive summary
- key findings
- belief shifts
- patient zero / top amplifiers
- segment analysis
- geography analysis
- platform analysis
- recommendations
- evidence/citations
- confidence/limitations

### Report UX
- sections appear progressively
- user can inspect evidence
- user can ask follow-up questions in report chat
- user can export/share

### Persistence
Store:
- final report
- partial sections
- report chat history
- report evidence links
- compare-ready summary features

---

## Phase 11 — Compare / rerun workflows

### Purpose
Turn one simulation into a decision loop, not a dead-end artifact.

### Typical rerun path
1. user reviews results
2. user identifies issue/opportunity
3. user clones simulation
4. user changes one or more variables:
   - brief wording
   - image
   - agent count
   - geography
   - platform mix
   - stance mix
5. system launches a new run
6. Compare mode highlights differences

### Compare inputs
- original simulation config
- modified simulation config
- run summaries
- report summaries
- key event markers
- segment deltas
- platform deltas
- patient zero changes
- sentiment changes

### Persistence
Store:
- parent-child simulation relationship
- compare bundles
- scenario lineage
- variant labels
- decision notes

---

## Phase 12 — Cross-run persistence and learning

### Purpose
Ensure Raktio evolves beyond one-off runs.

### Persistent things
- global agent identities
- audience definitions
- source knowledge
- simulation history
- run-derived memory
- user workspaces
- compare chains
- report archives
- pricing and credit usage
- org/team governance records

### What improves over time
- global population coverage
- geography coverage
- platform presence diversity
- memory richness
- compare intelligence
- source-linked reasoning

### What must remain separated
- persistent identity
vs
- run-specific temporary state

This separation must always hold.

---

## Detailed system dataflow

### Product input -> Intelligence
- brief
- uploads
- user goal
- locale
- requested geography/platform hints

### Intelligence -> Product
- interpreted brief
- recommendations
- audience suggestions
- rationale/confidence
- estimated complexity/cost

### Product -> Runtime
- finalized simulation config
- selected agent roster
- platform mix
- duration
- recsys
- add-on flags
- manual actions/interviews

### Runtime -> Product
- live events
- run state
- time progression
- metric aggregates
- failures/warnings

### Runtime -> Intelligence
- traces
- action outputs
- relation changes
- topic activity
- event sequences

### Intelligence -> Product post-run
- report sections
- memory summaries
- compare features
- explanations
- searchable insights

---

## Storage split

### SQLite (run-local)
Use for:
- runtime truth
- posts/comments/follows/mutes/rec state
- fast run operations
- trace origin

### Supabase/Postgres (product-persistent)
Use for:
- users/workspaces/orgs
- persistent agents
- simulation registry
- reports
- compare chains
- credit usage
- admin/governance
- long-term memory tables

### Search / semantic index layer
Use for:
- report chat
- evidence lookup
- memory retrieval
- topic/entity search
- source exploration

---

## Failure handling model

### Possible failure points
- bad or incomplete brief ingestion
- file parse failure
- planner failure
- insufficient audience coverage
- run bootstrap error
- OASIS runtime failure
- stream bridge failure
- memory transformation failure
- report generation timeout/failure

### Product requirement
Each failure must be:
- stateful
- logged
- recoverable where possible
- visible to admins
- understandable to users at the right level

### Avoid
Silent failures or fake “success” states.

---

## Performance and scale implications

### Self-serve standard
Runs should feel manageable and observable.

### Advanced/large scale
Need:
- stronger orchestration
- more careful stream aggregation
- summarized live views
- controlled compare/report generation

### Enterprise/hyperscale
May require:
- custom execution strategy
- managed runs
- partitioned or sampled live views
- richer post-run analytics than raw live observability

---

## UX principle tied to runtime

The product must not wait until everything is finished before becoming useful.

### Therefore
As soon as bootstrap allows it:
- open Simulation Canvas
- show first events
- show live metrics
- show simulation is alive
- allow monitoring and interviews
- build anticipation while the world evolves

This is crucial to the user experience.

---

## Final rule for Claude

**Always preserve the real simulation pipeline. A Raktio run must move from brief ingestion to planning, audience sourcing, runtime configuration, OASIS execution, live streaming, memory transformation, report generation, compare/rerun, and persistent storage in a coherent end-to-end flow. Never fake intermediate stages or collapse the runtime into a static generation process.**
