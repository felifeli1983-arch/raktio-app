# AGENTS_AUDIENCE_MEMORY.md

## Purpose

This document defines the backend and data architecture for:
- the persistent synthetic population
- agent creation and expansion
- audience persistence
- memory systems
- run participation state
- relationship continuity
- private audiences
- cross-simulation continuity

This is one of the most important files in the entire Raktio stack.

Raktio is not based on disposable one-off agent outputs.  
It is based on a persistent population of synthetic social users that evolves over time.

---

## Core rule

**Persistent identity must be separated from run-specific behavior.**

Every agent in Raktio has:
1. a stable long-lived synthetic identity
2. optional workspace/private audience membership
3. a memory layer that evolves over time
4. a run-specific participation state for each simulation

These layers must not be collapsed into one table or one vague object.

---

## Conceptual model

Raktio should treat agents as:

- synthetic social residents
- reusable across runs
- explainable and inspectable
- persistent across time
- diverse in geography, demographics, psychographics, and platform presence
- capable of accumulating memory without becoming incoherent

The product value increases as the population becomes:
- broader
- more reusable
- more consistent
- more richly indexed
- more analytically meaningful

---

## Core entity model

The system should distinguish at least these entities:

1. **Persistent Agent**
2. **Agent Platform Presence**
3. **Audience**
4. **Audience Membership**
5. **Simulation Participation**
6. **Agent Memory Summary**
7. **Agent Episodic Memory**
8. **Agent Relationship Memory**
9. **Topic Exposure Memory**
10. **Private Audience / Workspace-scoped Population**
11. **Memory Update Job / Memory Revision State**

---

# 1. Persistent Agent

## Definition
A Persistent Agent is the stable, long-lived synthetic identity used by Raktio across simulations.

## Required fields
- `agent_id`
- `username`
- `display_name`
- `first_name`
- `last_name`
- `avatar_seed`
- `avatar_style`
- `country`
- `region`
- `province_or_state`
- `city`
- `timezone`
- `languages`
- `age`
- `gender`
- `profession`
- `education_level`
- `income_band`
- `family_status`
- `tech_literacy`
- `mbti`
- `big_five`
- `interests`
- `values`
- `base_stance_bias`
- `activity_level`
- `influence_weight`
- `persuadability`
- `controversy_tolerance`
- `risk_tolerance`
- `created_at`
- `population_tier`
- `is_global`
- `is_private`
- `origin_type`
- `origin_workspace_id` (nullable)
- `status`

## Key rules
- `username` must be globally unique
- `username` should be stable over time
- `avatar_seed` should equal `username`
- persistent agent records should never be overwritten casually
- profile evolution should happen through controlled updates, not destructive mutation

---

# 2. Agent Platform Presence

## Definition
A Persistent Agent may exist on some platforms and not others.

Platform presence must be modeled separately from the core identity.

## Required fields
- `agent_platform_presence_id`
- `agent_id`
- `platform`
- `is_active`
- `platform_username` (optional)
- `posting_frequency`
- `commenting_frequency`
- `lurking_frequency`
- `engagement_style`
- `tone_profile`
- `follower_band`
- `platform_influence_weight`
- `platform_joined_at`
- `platform_behavior_notes`

## Core rule
Do not assume every agent is present everywhere.

This table is what makes Multi-platform Model 1 realistic.

---

# 3. Audience

## Definition
An Audience is a saved population definition or saved agent subset used for simulations.

## Audience types
- system-generated reusable audience
- user-saved audience
- workspace-private audience
- source-informed audience
- compare baseline audience
- segment-derived audience

## Required fields
- `audience_id`
- `workspace_id`
- `name`
- `description`
- `audience_type`
- `is_private`
- `created_from_simulation_id` (nullable)
- `created_from_report_id` (nullable)
- `source_context_id` (nullable)
- `size`
- `coverage_quality_score`
- `created_at`
- `updated_at`

---

# 4. Audience Membership

## Definition
Maps persistent agents into a saved audience.

## Required fields
- `audience_membership_id`
- `audience_id`
- `agent_id`
- `membership_reason`
- `weight_in_audience`
- `added_at`

## Why it matters
An audience should be reusable without regenerating everything.

---

# 5. Simulation Participation

## Definition
Represents an agent’s role and state inside one specific run.

## Required fields
- `simulation_participation_id`
- `simulation_id`
- `run_id`
- `agent_id`
- `runtime_agent_ref`
- `active_platforms_in_run`
- `runtime_stance`
- `runtime_role`
- `entered_run_at`
- `completed_run_at`
- `local_influence_score`
- `local_activity_score`
- `belief_shift_flag`
- `notable_participant_flag`
- `memory_delta_status`

## Core rule
This entity must contain run-specific state only.  
It must not replace the persistent identity.

---

# 6. Agent Memory Summary

## Definition
A rolling persistent summary of what the agent broadly “remembers” or tends toward across simulations.

## Required fields
- `agent_memory_summary_id`
- `agent_id`
- `summary_text`
- `topic_summary`
- `relationship_summary`
- `platform_summary`
- `recent_stance_summary`
- `simulation_count`
- `last_updated_at`
- `memory_revision`

## Why it matters
This gives agents continuity and makes interviews more coherent across time.

---

# 7. Agent Episodic Memory

## Definition
Structured, human-readable memory units derived from simulation events.

These are the building blocks of long-term memory.

## Required fields
- `agent_episode_id`
- `agent_id`
- `simulation_id`
- `run_id`
- `episode_type`
- `episode_text`
- `topic_tags`
- `geography_tags`
- `platform_tags`
- `confidence_score`
- `event_time_simulated`
- `recorded_at`
- `importance_score`
- `linked_trace_ids`
- `linked_report_ids` (optional)

## Example episode types
- created_post
- changed_belief
- followed_agent
- unfollowed_agent
- muted_cluster
- amplified_topic
- reacted_negatively_to_message
- shifted_from_neutral_to_supportive
- was_interviewed
- became_patient_zero_candidate

## Core rule
Episodes must be semantically readable, not just raw logs.

---

# 8. Agent Relationship Memory

## Definition
Persistent relationship-level memory across runs.

## Required fields
- `agent_relationship_memory_id`
- `agent_id`
- `other_agent_id`
- `relationship_type`
- `relationship_strength`
- `last_interaction_at`
- `interaction_summary`
- `follow_history_flag`
- `conflict_history_flag`
- `bridge_relationship_flag`
- `updated_at`

## Example relationship types
- follows
- followed_by
- recurring_interactor
- conflict_pair
- bridge_connection
- group-affiliated
- high-influence-target

## Why it matters
This supports graph continuity and more believable future simulations.

---

# 9. Topic Exposure Memory

## Definition
Tracks what topics or narratives an agent has repeatedly encountered.

## Required fields
- `agent_topic_exposure_id`
- `agent_id`
- `topic`
- `exposure_count`
- `positive_exposure_count`
- `negative_exposure_count`
- `last_exposed_at`
- `exposure_summary`
- `stance_tendency_on_topic`

## Why it matters
This is crucial for:
- more coherent future reactions
- segment building
- topic-aware interview answers
- cross-run continuity

---

# 10. Private Audience / Workspace Population

## Definition
A workspace-specific or enterprise-specific persistent audience or derived population.

## Use cases
- enterprise customer profile mirrors
- confidential workspace-specific populations
- legal/agency/client-specific audiences
- high-value reusable scenario populations

## Rules
- private audiences can be composed from global agents
- private audiences can also include private-only agents
- access must be permission-controlled
- private audiences must never leak across workspace boundaries

---

# 11. Memory Revision / Update State

## Definition
Tracks whether persistent memory updates for a run were completed successfully.

## Required fields
- `memory_update_job_id`
- `simulation_id`
- `run_id`
- `status`
- `started_at`
- `completed_at`
- `error_message`
- `updated_agent_count`
- `revision_note`

## Why it matters
Memory updates are too important to happen invisibly and unreliably.

---

## Identity generation policy

### Recommended policy
Use a **hybrid identity generation system**:

1. country-appropriate distributions for names and surnames
2. real geographic structures (country/region/city)
3. synthetic combinations
4. LLM enrichment for bio/persona/traits
5. deterministic username creation
6. deterministic avatar from username seed

### Why this is the right policy
It gives:
- realism
- scalability
- persistence
- cultural plausibility
- safe synthetic distance from real people

### Avoid
- pure random generation
- cloning real identities
- tiny repetitive city/name pools
- changing usernames later

---

## Username policy

### Required rules
- every agent must have a unique username
- the username is persistent
- the username should be available globally, not only per workspace
- the avatar derives from the username seed
- display name may vary more than username, but should remain stable by default

### Suggested generation pattern
- based on name + surname + modifier
- uniqueness fallback suffix if needed
- plausible social-style formatting
- no highly repetitive auto-number spam if avoidable

### Example
- `giovanni.rossi`
- `giovannirossi84`
- `maria_torres`
- `luca-bernardi`

---

## Avatar policy

Raktio uses:
- DiceBear API
- `notionists`
- `seed = username`

### Implications
- no avatar storage needed
- stable visual identity
- scalable to huge populations
- every agent is visually recognizable

---

## Agent creation lifecycle

### New agents should be created when
- coverage is missing for a requested geography
- coverage is missing for a requested segment
- platform presence mix is insufficient
- diversity is too low
- user creates a private audience needing more specific identities
- long-term expansion is needed

### New agents should NOT be created when
- the global pool already satisfies the requested shape
- only a simulation rerun is happening with the same coverage needs
- a saved audience already provides enough coverage

### Core rule
Prefer reuse first, expansion second.

---

## Persistent pool growth policy

### Global pool should grow gradually
The pool should not be fully pre-generated at giant scale on day one.

Instead:
- start with a strong seeded base
- add coverage as demand appears
- keep quality checks on new agent creation
- continuously improve distribution breadth

### Benefits
- lower initial overhead
- better realism control
- better diversity management
- more meaningful growth over time

---

## Audience creation logic

When building an audience, the backend should:

1. read the requested simulation or audience spec
2. estimate required coverage by:
   - geography
   - demographics
   - psychographics
   - platform presence
   - topic history if relevant
3. check the global pool
4. check relevant private pools
5. select best-fit existing agents
6. identify coverage gaps
7. generate missing agents if necessary
8. save the resulting audience snapshot or run population

---

## Memory update logic after a run

After a simulation completes, the backend should:

1. collect normalized runtime events
2. identify notable actions and interactions
3. transform them into semantic episodes
4. update topic exposure summaries
5. update relationship memory
6. update stance/belief summaries where needed
7. update simulation count and last participation
8. persist memory revision state

### Important rule
Memory must be additive and curated.  
It must not become an incoherent garbage dump of every tiny event.

---

## Memory compression and summarization

Because agents persist over many runs, memory must be layered.

### Recommended memory layers
#### Layer 1 — raw trace
Kept in runtime/history systems, not the primary agent memory

#### Layer 2 — episodes
Structured meaningful events

#### Layer 3 — memory summary
Compressed rolling summary for fast reuse in future prompts/interviews

### Why
This keeps agents:
- coherent
- affordable to use
- explainable
- scalable over time

---

## Platform continuity rules

Platform presence should persist between runs, but run behavior can vary.

### Persistent layer
- where the agent exists
- baseline style
- baseline activity tendency

### Runtime layer
- whether they are active in this simulation
- how much they post here
- how strongly they engage on that platform in this run

This avoids forcing identical behavior every time.

---

## Geography continuity rules

Geography is persistent identity, not runtime noise.

### Persistent geography includes
- country
- region/state
- city
- timezone
- language

### Runtime geography use includes
- map placement
- local cohorting
- geo-specific analysis
- local narrative simulation
- location-specific audience splits

### Rule
Do not flatten geography to “country only” in the persistent model.

---

## Audience quality model

Audience objects should store some quality metadata.

### Suggested fields
- diversity score
- geography coverage score
- platform mix score
- psychographic spread score
- planner confidence
- low-coverage warnings

### Why
This increases trust and helps users understand what they are simulating.

---

## Agent profile read model (for product use)

The product does not need every raw memory table directly.

It should have a read model that supports:
- identity card
- geography card
- psychographic card
- platform presence card
- memory timeline
- simulation history
- notable relationships
- interviewability
- linked reports / evidence

This read model should be optimized for Agent Atlas and Simulation Canvas drill-downs.

---

## Suggested persistent storage tables (conceptual)

```text
agents
agent_platform_presence
agent_memory_summary
agent_episodic_memory
agent_relationship_memory
agent_topic_exposure
audiences
audience_memberships
simulation_participations
private_population_scopes
memory_update_jobs
```

Additional linking tables may be needed for:
- report evidence
- source linkage
- compare lineage
- workspace access rules

---

## Access control rules

### Global agents
Readable where product policy allows

### Private agents / audiences
Readable only inside authorized workspaces/orgs

### Memory visibility
May need different levels:
- standard user-level inspectability
- enterprise deeper visibility
- admin/debug visibility

### Rule
Private population boundaries must be enforced at backend level, not only UI level.

---

## Anti-patterns to avoid

### Do not
- store agents only as simulation-local rows
- mix persistent and run-specific state into one blob
- regenerate the whole population every time
- lose memory continuity between runs
- rely on fragile ad hoc profile generation
- allow usernames to mutate carelessly
- make private audiences porous
- let memory expand without summarization control

---

## Non-negotiable requirements

The backend population/memory system must support:
- globally unique usernames
- persistent synthetic identity
- deterministic avatars
- realistic geography
- platform presence
- persistent memory summaries
- episodic memory
- relationship memory
- topic exposure
- reusable audiences
- private audiences
- explicit run participation separation

---

## Final rule for Claude

**Design the agent/audience/memory layer as a persistent synthetic population system, not as temporary runtime output. Separate identity, platform presence, audience membership, run participation, and memory into explicit backend models. Reuse first, expand only when needed, and keep memory structured, additive, and explainable.**
