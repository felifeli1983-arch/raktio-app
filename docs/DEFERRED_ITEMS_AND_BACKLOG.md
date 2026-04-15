# Deferred Items and Backlog

> Central source of truth for all deferred, partial, blocked, or missing items.
> Last synchronized: 2026-04-15 (after Step 11 Phase 1 + Strategic Review)

---

## Runtime

### RT-01: ARQ background worker dispatch
- **Area**: Runtime
- **Description**: OASIS simulation currently runs via `asyncio.create_task()` inside the FastAPI process. In production, this should be dispatched to a dedicated ARQ background worker to avoid blocking the API server and support concurrent runs.
- **Why deferred**: `asyncio.create_task()` works correctly for development and testing. ARQ requires Redis + worker process infrastructure.
- **Dependencies**: Redis (already in docker-compose), ARQ (in requirements.txt)
- **Priority**: HIGH
- **Type**: Architecture follow-up
- **Related files**: `runtime/launcher.py`, `app/workers/jobs.py` (stub)
- **Recommended step**: Step 8 or dedicated infrastructure step
- **Status**: DEFERRED

### RT-02: Interview bridge
- **Area**: Runtime
- **Description**: `runtime/interview_bridge.py` is a stub. No ability to interview individual agents during or after a simulation run. OASIS supports `ActionType.INTERVIEW` and `agent.perform_interview()`.
- **Why deferred**: Lower priority than core simulation execution pipeline.
- **Dependencies**: OASIS interview API (verified available), agent profile context
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `runtime/interview_bridge.py` (stub), `SIMULATION_ENGINE_SPEC.md` section 9
- **Recommended step**: Post-Step 8
- **Status**: DEFERRED

### RT-03: Temporal activity multipliers
- **Area**: Runtime
- **Description**: SIMULATION_ENGINE_SPEC.md section 2 specifies daypart multipliers (dead hours, morning, workday, peak evening, night) that should affect agent activation rates and action pacing. Not implemented in config_builder or oasis_worker.
- **Why deferred**: OASIS env.step() treats each step uniformly. Temporal multipliers would require varying the number of active agents per step.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Enhancement
- **Related files**: `runtime/config_builder.py`, `runtime/oasis_worker.py`
- **Recommended step**: Runtime refinement pass
- **Status**: DEFERRED

### RT-04: Group simulation actions
- **Area**: Runtime
- **Description**: 5 OASIS ActionTypes disabled: JOIN_GROUP, LEAVE_GROUP, SEND_TO_GROUP, CREATE_GROUP, LISTEN_FROM_GROUP. These enable community/faction simulation scenarios.
- **Why deferred**: Group features are a distinct product capability, not needed for core social simulation.
- **Dependencies**: None (OASIS supports them already)
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `runtime/oasis_worker.py` (action set documentation)
- **Recommended step**: Group simulation feature step
- **Status**: DEFERRED

### RT-05: Runtime health endpoint
- **Area**: Runtime
- **Description**: `runtime/health.py` is a stub. No health monitoring for running OASIS processes.
- **Why deferred**: Low priority vs core pipeline.
- **Dependencies**: OASIS worker running
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `runtime/health.py` (stub)
- **Recommended step**: Step 9 (Admin)
- **Status**: DEFERRED

---

## Distribution & Virality

### DIST-01: Publisher authority / reputation scoring ✅ DONE
- **Area**: Distribution
- **Description**: High-influence agents (influence_weight ≥2.0) get ×1.2 activation boost in temporal selection + "high influence" label in OASIS description. Low-influence agents (≤0.5) get ×0.8 reduction + "low influence" label. Combined with activity level and daypart. Probabilistic, not deterministic.
- **Status**: DONE (Step 10.5E)

### DIST-01b: Direct recsys influence weighting ✅ DONE
- **Area**: Distribution
- **Description**: `_boost_influence_exposure()` directly writes to OASIS rec table after each step. High-influence agents' posts are probabilistically injected into other agents' feeds (90% for weight≥3.0, 60% for weight≥2.0). Combined with temporal activation boost and LLM behavioral guidance.
- **Status**: DONE (Step 10.5E1)

### DIST-02: Platform algorithm behavior modeling
- **Area**: Distribution
- **Description**: OASIS recsys options (random, reddit, personalized, twhin-bert) don't model platform-specific algorithmic promotion (trending boost, engagement-based amplification, recency decay). Content that gets early engagement should be promoted more.
- **Why it matters**: Platform algorithms are the biggest driver of what spreads vs what dies. Without this, viral dynamics are unrealistic.
- **Priority**: MEDIUM
- **Type**: Enhancement
- **Dependencies**: DIST-01
- **Timing**: DO BEFORE FRONTEND
- **Status**: DEFERRED

### DIST-03: Competition / noise context
- **Area**: Distribution
- **Description**: Simulations currently exist in a vacuum — the only content is what agents create about the brief topic. Real social feeds have competing content, unrelated posts, and information noise that affects attention and engagement.
- **Why it matters**: Testing message performance in a noise-free environment overstates resonance. Real briefs compete for attention.
- **Priority**: LOW
- **Type**: Enhancement
- **Dependencies**: None
- **Timing**: CAN WAIT
- **Status**: DEFERRED

### DIST-04: Seeded content distribution
- **Area**: Distribution
- **Description**: Inject the exact post/campaign being tested into OASIS as a seed before the step loop. Agents react to the actual content, not just the topic.
- **Why it matters**: Users want to test a specific post/message, not just a topic. Seeding lets the simulation react to the exact content.
- **Priority**: **HIGH — Realism Upgrade R1A.1**
- **Type**: Missing feature
- **Dependencies**: None
- **Timing**: **NEXT IMPLEMENTATION BLOCK**
- **Status**: DONE (R1A, 2026-04-15)

### DIST-05: Amplifier archetype detection
- **Area**: Distribution
- **Description**: Post-run classification of agents into amplifier archetypes (early adopter, bridge node, echo chamber member, contrarian, passive observer). Currently `patient_zero` report section infers this from evidence, but no structured archetype tagging exists.
- **Why it matters**: Structured archetypes enable segment-based analysis and audience refinement.
- **Priority**: LOW
- **Type**: Enhancement
- **Dependencies**: MEM-02b (better topic extraction)
- **Timing**: CAN WAIT
- **Status**: DEFERRED

### DIST-FULL: Full Distribution & Virality Layer (planned future block)
- **Area**: Distribution / Virality
- **Description**: A comprehensive realism layer that models how content spreads through social platforms. This is NOT a single feature — it is a planned future workstream that covers:
  1. **Timing sensitivity** — content performance varies by time-of-day and day-of-week (foundation laid in 10.5D temporal multipliers, but deeper integration with content decay and trending mechanics needed)
  2. **Publisher authority / reputation** — graduated authority model beyond the current influence_weight binary boost (foundation laid in 10.5E/E1, deeper recsys customization needed)
  3. **Platform algorithm behavior** — OASIS recsys enhancements: engagement-based promotion, recency decay, trending boost, content-type weighting per platform
  4. **Competition / noise context** — inject non-topic content to simulate real information environment competition
  5. **Seeded distribution** — inject the exact content being tested as a seed post at a specific time, observe organic reactions
  6. **Amplifier archetypes** — post-run classification of agents into spread roles (early adopter, bridge, echo chamber, contrarian, observer)
  7. **Amplification / virality scoring** — cascade depth, spread speed, reach ratio metrics. MUST be presented as scenario-based guidance ("this pattern tends to spread this way"), NOT as certainty or prediction
- **Why deferred**: Core simulation works. The current influence model (temporal + LLM + recsys injection) provides meaningful asymmetry. The full virality layer requires deeper OASIS customization and significant product design decisions about how to present spread patterns without overclaiming.
- **Dependencies**: DIST-01/01b (done), 10.5D (done), OASIS Platform customization for deeper recsys
- **Priority**: MEDIUM (as a whole block)
- **Type**: Planned future workstream
- **Timing**: CAN WAIT — designed as a post-frontend enhancement block
- **Status**: PLANNED (not started)
- **Important constraint**: Raktio must NEVER claim to predict real-world virality. The virality layer produces plausible scenario patterns for comparison and iteration, not guarantees.

### DIST-06: Virality / amplification scoring
- **Area**: Distribution
- **Description**: Framework for scoring cascade depth, spread speed, reach ratio per post. Must be presented as scenario-based guidance ("this type of content tends to spread in this pattern"), NOT as certainty. Raktio must never claim to predict real-world virality.
- **Why it matters**: Comparative virality signals between simulations are valuable for iteration. But must be framed honestly as plausible patterns, not guarantees.
- **Priority**: LOW
- **Type**: Enhancement
- **Dependencies**: DIST-01, DIST-02
- **Timing**: CAN WAIT
- **Status**: DEFERRED

---

## Influence Model

### INF-06: Stronger influencer agent synthesis
- **Area**: Influence / Population
- **Description**: During agent generation, flag 2-5% of agents as influencer archetypes: high influence_weight (≥3.0), large follower_band, domain expertise, authentic voice style. Types: tech thought leader, community advocate, industry analyst, etc.
- **Why it matters**: "How would influencers react" is a primary enterprise use case. Currently all agents are generically weighted.
- **Priority**: **HIGH — Realism Upgrade R1A.3**
- **Type**: Enhancement
- **Dependencies**: DIST-01 (done)
- **Timing**: **NEXT IMPLEMENTATION BLOCK**
- **Status**: DONE (R1A, 2026-04-15)

### INF-08: Emergent influencer dynamics
- **Area**: Influence / Simulation
- **Description**: Instead of pre-tagging influencer archetypes, let influence emerge from simulation behavior. Agents who receive more likes/follows/quotes during a run naturally become more influential in subsequent rounds. Requires tracking per-agent engagement metrics during the run and feeding them back into the recsys/activation loop. Distinct from static archetype tagging (INF-06).
- **Why it matters**: Static tagging assigns influence before the simulation runs. Emergent dynamics let the simulation discover who the real amplifiers are — more realistic and more surprising.
- **Priority**: MEDIUM
- **Type**: Enhancement / future realism
- **Dependencies**: INF-06 (done), DIST-02 (platform amplification)
- **Timing**: Phase R2 or later
- **Status**: PLANNED (future)

### INF-07: Bridge agent identification
- **Area**: Influence
- **Description**: Identify agents who connect otherwise separate clusters during a simulation. Bridge agents are high-value for understanding cross-segment spread. Currently only inferred in the faction_analysis report section.
- **Why it matters**: "Which agent type bridges the skeptics and supporters" is a key strategic insight.
- **Priority**: LOW
- **Type**: Enhancement
- **Dependencies**: Interaction matrix (exists)
- **Timing**: CAN WAIT
- **Status**: DEFERRED

---

## Simulation Modes

### SIM-01: Fresh vs memory-informed simulation mode ✅ DONE
- **Area**: Simulation
- **Description**: Users can choose `memory_mode`: "persistent" (agents carry memory) or "fresh" (clean slate). Field added to SimulationCreate, SimulationResponse, DB (migration 010). config_builder skips memory injection when fresh. oasis_worker skips post-run memory transformation when fresh.
- **Status**: DONE (Step 10.6)

### SIM-02: Memory as light influence, not dominant force
- **Area**: Simulation / Memory
- **Description**: Agent memory should subtly influence behavior (topic familiarity, relationship continuity) without making agents rigid or over-determined. An agent who was skeptical in one simulation shouldn't be locked into skepticism forever. Memory should create tendencies, not determinism.
- **Why it matters**: Over-weighted memory makes simulations predictable and agents feel scripted. Under-weighted memory makes persistence meaningless.
- **Priority**: LOW (currently memory is ~315 chars in description — naturally light)
- **Type**: Design principle
- **Dependencies**: Memory system (done)
- **Timing**: CAN WAIT (monitor as memory accumulates across many runs)
- **Status**: DEFERRED

---

## Geography & Platform Realism

### GEO-01: Stronger geography in evidence and reporting ✅ DONE
- **Area**: Geography
- **Description**: Agent geography exists in Supabase profiles but is not in the OASIS SQLite evidence bundle. Reports and compare cannot do real geography-based analysis — they infer from agent descriptions. Agent country/city should be included in the evidence bundle and the report prompt.
- **Why it matters**: "Your message works in Milan but fails in Naples" is a key product promise. Without real geo data in evidence, geo analysis sections are speculative.
- **Priority**: MEDIUM
- **Type**: Enhancement
- **Dependencies**: None
- **Timing**: DO BEFORE FRONTEND
- **Status**: DONE (Step 10.6) — agent country/city injected into report prompt via agent_repo lookup

### PLAT-01: LinkedIn runtime behavior model ✅ DONE (prompt-level)
- **Area**: Platform
- **Description**: LinkedIn profile implemented in `platform_profiles.py`: professional tone, formal, long-form, low controversy tolerance, peak shift -4h. Behavioral prompt: "Write professionally, signal expertise, no slang." Limitation: still runs on Twitter OASIS backend — differences are prompt-level, not engine-level.
- **Status**: DONE (Step 10.5H) — prompt-level approximation. Full OASIS platform engine for LinkedIn remains deferred (PLAT-04).

### PLAT-02: Instagram runtime behavior model ✅ DONE (prompt-level)
- **Description**: Instagram profile: visual framing, high like tendency, low comment, aspirational tone, heavy hashtags. Prompt: "Frame posts as visual moments, like generously, avoid confrontation."
- **Status**: DONE (Step 10.5H) — prompt-level approximation.

### PLAT-03: TikTok runtime behavior model ✅ DONE (prompt-level)
- **Description**: TikTok profile: rapid/trendy/slang, high share, peak shift -2h. Prompt: "React fast, use trendy language, be authentic."
- **Status**: DONE (Step 10.5H) — prompt-level approximation.

### PLAT-04: Engine-level platform realism (official future requirement)
- **Area**: Platform
- **Description**: Making LinkedIn, Instagram, and TikTok progressively engine-level platforms, not only prompt-level approximations. This is an official future requirement for Raktio — the product must eventually have real behavioral differentiation at the runtime engine level, not just LLM prompt guidance.
- **Current state**: X and Reddit are engine-level (natively supported by OASIS DefaultPlatformType). LinkedIn, Instagram, and TikTok currently use: prompt-level behavioral guidance + temporal peak shifts + product-layer approximation. This creates observable differences but is not true engine-level platform modeling.
- **Future target**: Progressive engine-level support covering 5 sub-areas:
- **Priority**: MEDIUM (as a whole track — individual sub-items below)
- **Type**: Planned future workstream
- **Timing**: CAN WAIT — post-frontend, pre-production scaling
- **Status**: PLANNED

### PLAT-04a: Platform action weighting
- **Area**: Platform / Engine
- **Description**: Different action tendencies/probabilities by platform at the runtime level. Instagram agents should have higher probability of LIKE_POST, lower probability of CREATE_COMMENT. LinkedIn agents should have higher probability of FOLLOW, lower probability of DISLIKE_POST. Currently all platforms use the same 21 ActionTypes with equal probability — the LLM decides what to do based on prompt guidance only.
- **Implementation approach**: Per-platform action weight maps that modify which ActionTypes are offered to agents, or probabilistically filter agent actions post-LLM-decision.
- **Dependencies**: PLAT-01/02/03 (done — prompt-level profiles exist)
- **Priority**: MEDIUM
- **Timing**: CAN WAIT
- **Status**: DEFERRED

### PLAT-04b: Platform-specific recsys / exposure logic
- **Area**: Platform / Engine
- **Description**: Different ranking/exposure behavior by platform. Instagram should favor visual/recent content. LinkedIn should favor professional network connections. TikTok should favor trending/viral content with fast decay. Currently all platforms use the same OASIS recsys (twitter/reddit/random/twhin-bert).
- **Implementation approach**: Custom recsys functions per platform, or OASIS Platform fork with platform-specific recommendation scoring.
- **Dependencies**: OASIS recsys customization
- **Priority**: MEDIUM
- **Timing**: CAN WAIT
- **Status**: DEFERRED

### PLAT-04c: Platform-specific engagement logic
- **Area**: Platform / Engine
- **Description**: Different spread patterns, content decay rates, discussion depth, and interaction styles by platform. TikTok content should spread faster and decay faster. LinkedIn threads should be deeper and more measured. Reddit discussions should have more nested depth. Instagram engagement should be broader but shallower.
- **Dependencies**: PLAT-04a, PLAT-04b
- **Priority**: LOW
- **Timing**: CAN WAIT
- **Status**: DEFERRED

### PLAT-04d: Platform-specific content model
- **Area**: Platform / Engine
- **Description**: Different post/comment style expectations at the runtime level, not only prompt level. Instagram posts should have image descriptions. TikTok posts should be very short. LinkedIn posts should have professional formatting. This goes beyond LLM prompt guidance — it would validate/transform content at the platform layer.
- **Dependencies**: PLAT-04a
- **Priority**: LOW
- **Timing**: CAN WAIT
- **Status**: DEFERRED

### PLAT-04e: Platform-specific network/exposure behavior
- **Area**: Platform / Engine
- **Description**: Different discovery patterns per platform. TikTok is discovery-heavy (algorithmic feed, strangers see your content). LinkedIn is graph-heavy (connection-based exposure). Reddit is community-centered (subreddit scope). Instagram is hybrid (explore + follower feed). X is mixed (algorithmic + follower + trending).
- **Dependencies**: PLAT-04b
- **Priority**: LOW
- **Timing**: CAN WAIT
- **Status**: DEFERRED

---

## Source / Knowledge Realism

### SRC-01: Source-grounded simulation importance
- **Area**: Knowledge
- **Description**: Simulations grounded in uploaded real-world materials (competitor analysis, market research, press releases) produce more relevant agent behavior and more credible findings. This is especially important for enterprise/B2B users who work with documents.
- **Why it matters**: The difference between "simulate reaction to this topic" and "simulate reaction to this specific document" is the difference between generic and valuable.
- **Priority**: MEDIUM
- **Type**: Design principle
- **Dependencies**: KS-01, KS-02 (Step 10.5F-G)
- **Timing**: Step 10.5F-G
- **Status**: DEFERRED

---

## Report Quality

### RPQ-01: Report excellence as explicit product requirement
- **Area**: Reports
- **Description**: Reports must be robust, low-fragility, low-latency, and strongly evidence-grounded. This is not optional polish — it is a core product quality requirement. Covers: section fragility (3/14 failed in stress test), generation latency (570s for 14 sections), prompt bloat, evidence precision. Already tracked as RP-02c but elevated here as a product-level requirement.
- **Why it matters**: Reports are one of the primary reasons users pay for Raktio. Poor report quality directly undermines product credibility.
- **Priority**: HIGH
- **Type**: Product requirement
- **Dependencies**: None
- **Timing**: DO AFTER CURRENT BLOCK (Step 10.6 refinement batch)
- **Status**: PARTIAL — RP-02b done (truncation + retry). Remaining: parallel generation, evidence highlights per section, prompt optimization. CAN WAIT

---

## Reports / Compare

### RP-01: Report evidence links table
- **Area**: Reports
- **Description**: `report_evidence_links` table from DATA_MODEL_AND_STORAGE.md section 26 not created. This would link report sections to specific evidence items (posts, events, agents) for drill-down.
- **Why deferred**: Reports currently embed evidence in markdown text. Structured linking requires a separate table + UI.
- **Dependencies**: Migration, frontend drill-down UI
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` section 26
- **Recommended step**: Report refinement step
- **Status**: DEFERRED

### RP-02: Report chat (interactive)
- **Area**: Reports
- **Description**: `report_chat_threads` and `report_chat_messages` tables not created. No chat endpoint. REPORTS_AND_INSIGHTS_SPEC.md defines this as a core layer (interactive insight layer).
- **Why deferred**: Requires tables, chat service, evidence retrieval, frontend component.
- **Dependencies**: Report tables, semantic search (pgvector)
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` sections 27-28, `REPORTS_AND_INSIGHTS_SPEC.md`
- **Recommended step**: Post-Step 8
- **Status**: DEFERRED

### RP-02b: Report section generation fragility ✅ DONE
- **Area**: Reports
- **Description**: Fixed in Step 10.6. Previous sections truncated to single-line summaries (150 chars each) instead of full markdown. Added 1 retry per section with the same prompt. Reduces prompt bloat from ~4000 chars to ~500 for later sections.
- **Status**: DONE (Step 10.6)

### RP-02c: Report excellence hardening ✅ DONE
- **Area**: Reports
- **Description**: Comprehensive hardening pass on the report generation system. Result: 14/14 sections now complete reliably even on small simulations (10 agents).
- **What was done (2026-04-15)**:
  1. **Section fragility**: Evidence-level classification (rich/moderate/sparse) adapts prompts. Section-specific fallback prompts for patient_zero, geography, faction.
  2. **JSON parsing**: 6 fallback strategies — never fails to produce content.
  3. **Retry**: 3 attempts (was 2), plus graceful fallback with honest "limited evidence" content.
  4. **System prompt**: Explicitly allows small-sim analysis, forbids hallucination, requires limitation acknowledgment.
  5. **Scorecard**: scorecard_json now populated on report record.
- **Remaining for future**: Parallel generation (PERF-01), evidence highlights per section, prompt compaction.
- **Status**: DONE (robustness). PERF-01 deferred (latency optimization).

### RP-03: Report PDF export
- **Area**: Reports
- **Description**: No PDF generation from report sections. REPORTS_AND_INSIGHTS_SPEC.md lists export as a key action.
- **Why deferred**: Lower priority than evidence pipeline.
- **Dependencies**: PDF library (e.g., weasyprint), report sections completed
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `REPORTS_AND_INSIGHTS_SPEC.md`
- **Recommended step**: Step 11 (Frontend) or dedicated export step
- **Status**: DEFERRED

### RP-04: NLP sentiment analysis on content
- **Area**: Reports / Analytics
- **Description**: Post and comment content is passed to the LLM as text. No explicit NLP sentiment classification per post/comment. Belief shift analysis infers sentiment from behavioral patterns (likes/dislikes), not from content analysis.
- **Why deferred**: Requires embedding model calls per post (sentence-transformers or LLM batch). Would add significant latency. More appropriate as post-run batch processing.
- **Dependencies**: sentence-transformers (installed), batch processing infrastructure
- **Priority**: MEDIUM
- **Type**: Enhancement
- **Related files**: `runtime/event_bridge.py`, `services/report_service.py`
- **Recommended step**: Memory transformation step
- **Status**: DEFERRED

### RP-05: Compare geography and segment deltas
- **Area**: Compare
- **Description**: Compare currently infers geography and segment deltas from agent descriptions. No structured data feeds these sections because agent geography is in Supabase (not in OASIS SQLite evidence bundle) and segments aren't mapped to agents.
- **Why deferred**: Requires joining Supabase agent data with OASIS evidence, and segment-to-agent mapping.
- **Dependencies**: Population system refinement (segment mapping)
- **Priority**: LOW
- **Type**: Limitation
- **Related files**: `services/compare_service.py`
- **Recommended step**: Population refinement step
- **Status**: DEFERRED

---

## Population / Agents / Audiences

### POP-01: Per-segment stance assignment
- **Area**: Population
- **Description**: Map agents to segments via demographics/psychographics, then apply planner's per-segment `stance_bias` instead of random global assignment.
- **Why it matters**: A 25-year-old indie dev and a 50-year-old CTO shouldn't get the same random stance distribution.
- **Dependencies**: None (planner already provides segment data)
- **Priority**: **HIGH — Realism Upgrade R1A.2**
- **Type**: Limitation
- **Related files**: `services/audience_service.py`
- **Status**: DONE (R1A, 2026-04-15)
- **Status**: PARTIAL

### POP-02: Private audience service enforcement
- **Area**: Population
- **Description**: Schema supports `is_private` on audiences and `population_tier` on agents. `find_global_agents()` correctly filters `is_global=True`. But no service logic creates private audiences or enforces workspace-scoped access to private agents.
- **Why deferred**: Enterprise feature. Schema is ready, service logic is a feature step.
- **Dependencies**: None (schema ready)
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `services/audience_service.py`, `repositories/agents.py`, `AUDIENCE_AND_AGENT_ATLAS_SPEC.md`
- **Recommended step**: Enterprise feature step
- **Status**: DEFERRED

### POP-03: Agent Atlas API ✅ DONE
- **Area**: Population
- **Description**: 2 endpoints: GET /api/agents (list/filter by country, stance, with pagination) and GET /api/agents/{agent_id} (full profile with memory summary, episodes, relationships, topic exposures).
- **Status**: DONE (Step 10.6)

### POP-04: Audience creation/edit/duplicate endpoints
- **Area**: Population
- **Description**: Audiences API only has GET list, GET single, DELETE (archive). No create, edit, duplicate, filter-based selection, or source-derived audience endpoints.
- **Why deferred**: Auto-generated audiences work for the simulation pipeline. Manual audience management is a product refinement.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `api/audiences.py`, `AUDIENCE_AND_AGENT_ATLAS_SPEC.md`
- **Recommended step**: Step 10
- **Status**: PARTIAL

---

## Memory System

### MEM-01: Memory domain tables ✅ DONE
- **Area**: Memory
- **Description**: 5 tables live (migration 008, 25 tables total): `agent_memory_summaries`, `agent_episodic_memory`, `agent_relationship_memory`, `agent_topic_exposure`, `memory_update_jobs`. Full repository implemented with upsert, batch insert, query functions.
- **Status**: DONE (Step 10.5A)

### MEM-02: Post-run memory transformation ✅ DONE
- **Area**: Memory
- **Description**: `memory_service.transform_run_to_memory()` reads evidence bundle, creates episodic memories, updates relationships, topic exposures, and rolling summaries. Auto-triggered after OASIS completion in `oasis_worker.py`. Tracked via `memory_update_jobs`.
- **Status**: DONE (Step 10.5B)

### MEM-02b: Topic extraction (partial ✅, LLM deferred)
- **Area**: Memory
- **Description**: Keyword fallback implemented in Step 10.6: hashtag-first, then significant word frequency extraction (top 5 words by count, 4+ chars, excluding 100 stop words). Full LLM-based semantic topic/entity extraction remains deferred (adds cost per post).
- **Status**: PARTIAL (keyword fallback done in 10.6, full LLM extraction CAN WAIT)

### MEM-02c: LLM-based summary synthesis
- **Area**: Memory
- **Description**: Rolling summary text is formulaic ("Participated in N simulation(s). Last activity: X."). After many simulations, it doesn't capture evolution or nuance. An LLM call could synthesize episodic history into a richer, more human-readable summary.
- **Why deferred**: Formulaic summary works for context injection. LLM synthesis adds cost per agent per run.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Enhancement
- **Related files**: `services/memory_service.py` `_update_summaries()`
- **Recommended step**: Memory refinement pass
- **Status**: DEFERRED

### MEM-02d: Episode dedup guard for re-runs
- **Area**: Memory
- **Description**: If `transform_run_to_memory()` is called twice for the same run (manual retry or bug), duplicate episodes are inserted. `simulation_count` would also double-increment. No guard checks if a transformation job already completed for this run.
- **Why deferred**: Single-execution path works correctly. Dedup is a robustness improvement.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Bug / robustness
- **Related files**: `services/memory_service.py`
- **Recommended step**: Memory refinement pass
- **Status**: DEFERRED

### MEM-02e: Relationship strength accumulation across runs ✅ DONE
- **Area**: Memory
- **Description**: Fixed in Step 10.6. Reads existing relationship strength before upsert, adds 0.15 per interaction, capped at 1.0. Multi-run agents accumulate relationship strength.
- **Status**: DONE (Step 10.6)

### MEM-02f: N+1 query pattern in memory operations
- **Area**: Memory / Performance
- **Description**: Two N+1 query patterns exist: (1) `_build_agent_map()` calls `find_agent_by_id()` once per participant. (2) `_get_memory_context()` in config_builder calls 2 queries per agent. For 1000-agent simulations, this is 1000-2000 individual queries. Should use batch queries.
- **Why deferred**: Small simulations (2-50 agents) work fine. Batch optimization needed for scale.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Performance
- **Related files**: `services/memory_service.py`, `runtime/config_builder.py`
- **Recommended step**: Scale optimization pass
- **Status**: DEFERRED

### MEM-02g: Summary unbounded growth fix ✅ DONE
- **Area**: Memory
- **Description**: Fixed in Step 10.6. Summary text capped at 500 chars. More informative format: includes sim count, last activity, behavioral tendency (stance + like/dislike ratio), and top topics.
- **Status**: DONE (Step 10.6)

### MEM-03: Belief trajectory over time
- **Area**: Memory / Analytics
- **Description**: OASIS trace rows don't have wall-clock timestamps per step (only rowid ordering and `created_at` in tables which resets per run). Per-step stance snapshots would require instrumenting the worker loop to record step boundaries.
- **Why deferred**: Would require modifying oasis_worker to insert step markers into trace or a separate progress table.
- **Dependencies**: oasis_worker modification
- **Priority**: LOW
- **Type**: Enhancement
- **Related files**: `runtime/oasis_worker.py`
- **Recommended step**: Analytics refinement pass
- **Status**: DEFERRED

---

## Knowledge / Sources

### KS-01: Knowledge domain tables ✅ DONE
- **Area**: Knowledge
- **Description**: 3 tables live (migration 009, 28 total): `sources`, `source_extractions`, `source_links`. Repository + service + 4 API endpoints. `source_files` merged into `sources` (raw_text stored directly). LLM extraction via Claude PLANNING.
- **Status**: DONE (Step 10.5F)

### KS-02: File/image upload in brief ingestion ✅ DONE
- **Area**: Knowledge
- **Description**: `knowledge_service.upload_source()` accepts file upload (PDF/DOCX/TXT/MD) or raw text. Text extraction + LLM extraction. Source-to-simulation linking. `brief_service.understand_brief()` now injects linked source context (summaries, entities, topics, key claims) into the LLM prompt. Image support still deferred (KS-03).
- **Status**: DONE (Step 10.5F-G)
- **Status**: DEFERRED

---

## Billing

### BIL-01: Credit settlement on completion ✅ DONE
- **Area**: Billing
- **Description**: `_settle_credits()` in `oasis_worker.py` calculates actual cost from real execution, settles reserved→final, creates `simulation_finalization` ledger entry, handles partial refund.
- **Status**: DONE (Step 7.5G)

### BIL-02: Full credit cost formula ✅ DONE
- **Area**: Billing
- **Description**: Full formula implemented: `agents × duration × platform × geography`. Platform: +20% per extra platform. Geography: +5% per extra country. Add-on pricing remains deferred.
- **Status**: DONE (Step 8)

### BIL-03: Billing service + API ✅ DONE
- **Area**: Billing
- **Description**: billing_service.py + api/billing.py implemented: balance, usage, estimate, plans endpoints. Subscriptions and pack purchases remain deferred (BIL-04, BIL-05).
- **Status**: DONE (Step 8)

### BIL-04: Subscriptions table
- **Area**: Billing
- **Description**: `subscriptions` table from DATA_MODEL_AND_STORAGE.md section 37 not created. Needed for tracking plan periods, renewal dates, cancellation.
- **Why deferred**: Part of Step 8.
- **Dependencies**: BIL-03
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` section 37
- **Recommended step**: Step 8
- **Status**: DEFERRED

### BIL-05: Credit purchases table
- **Area**: Billing
- **Description**: `credit_purchases` table from DATA_MODEL_AND_STORAGE.md section 40 not created.
- **Why deferred**: Part of Step 8.
- **Dependencies**: BIL-03
- **Priority**: LOW
- **Type**: Missing feature
- **Recommended step**: Step 8
- **Status**: DEFERRED

### BIL-05b: LLM usage analytics API
- **Area**: Billing / Analytics
- **Description**: `llm_usage_log` table exists and is populated on every LLM call. Repository has `get_usage_summary_by_org()`. But there is no API endpoint exposing usage analytics to admins or billing users. No dashboard data for cost analysis.
- **Why deferred**: Core logging infrastructure is in place. API exposure is a refinement.
- **Dependencies**: None (data exists)
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `repositories/llm_usage.py`, `api/billing.py`
- **Recommended step**: Admin panel or billing refinement
- **Status**: DEFERRED

### BIL-05d: Wire log_context into all LLM-calling services ✅ DONE
- **Area**: Billing / Analytics
- **Description**: All 5 LLM-calling services now pass `log_context` with simulation_id, workspace_id, service_module, call_purpose, and context-specific IDs (report_id, compare_id).
- **Status**: DONE (Step 8E)

### BIL-05e: LLM usage log — remaining attribution gaps
- **Area**: Billing / Analytics
- **Description**: Four context fields are not yet populated in `llm_usage_log`:
  1. **organization_id**: Services have workspace_id but don't look up the org. Requires `sim_repo.get_workspace_org_id()` call in each service or passing org_id from the API layer.
  2. **user_id**: The calling user's ID is available in the API layer (`ctx.user.user_id`) but not passed down through services to `log_context`. Requires threading user_id through service function signatures.
  3. **run_id**: OASIS agent inference during `env.step()` goes through camel-ai's own LLM client, not through our `llm_adapter`. These calls are invisible to our logging. Capturing them would require instrumenting camel-ai or wrapping the model backend.
  4. **agent_id**: Agent generation creates multiple agents per LLM call, so no single agent_id applies. For report/compare calls, agent_id is not applicable.
- **Why deferred**: Core attribution (simulation_id + workspace_id + service_module + call_purpose) is sufficient for per-simulation cost analysis. The remaining fields add precision but require API-to-service threading (org_id, user_id) or camel-ai instrumentation (run_id).
- **Dependencies**: None for org_id/user_id. Camel-ai modification for run_id.
- **Priority**: LOW
- **Type**: Enhancement
- **Related files**: `adapters/llm_adapter.py`, all services, `runtime/oasis_worker.py`
- **Recommended step**: Service refinement pass
- **Status**: DEFERRED

### BIL-05c: Cost-based pricing recommendations
- **Area**: Billing / Analytics
- **Description**: The `llm_usage_log` data could power automatic pricing recommendations (e.g., "this simulation cost $X in LLM calls, the credit charge was Y credits — suggest adjusting the formula"). This is explicitly designed as a future capability — the current system only measures, never auto-modifies.
- **Why deferred**: Requires significant data accumulation and product decision-making.
- **Dependencies**: BIL-05b
- **Priority**: LOW
- **Type**: Enhancement
- **Recommended step**: Product analytics phase
- **Status**: DEFERRED

### BIL-06: Add-on modular pricing
- **Area**: Billing
- **Description**: The credit formula currently covers agents × duration × platform × geography. PRICING_AND_CREDITS.md specifies add-on modular pricing as a separate cost factor (e.g., report depth, interview access, extended memory). No add-on pricing logic exists.
- **Why deferred**: Core formula works. Add-ons require product definition of which features are add-ons and their cost weights.
- **Dependencies**: None (formula infrastructure exists)
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `billing/credit_rules.py`
- **Recommended step**: Product refinement step
- **Status**: DEFERRED

### BIL-07: Plan change API (upgrade/downgrade)
- **Area**: Billing
- **Description**: No API for changing an organization's plan. Currently `organizations.plan_id` can only be set at creation time or via direct DB edit. Users cannot upgrade, downgrade, or manage their subscription from the product.
- **Why deferred**: Requires BIL-04 (subscriptions table) for proper plan period tracking, proration logic, and billing cycle management.
- **Dependencies**: BIL-04
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `api/billing.py`, `services/billing_service.py`
- **Recommended step**: Post-Step 8 billing refinement
- **Status**: DEFERRED

### BIL-08: Payment provider integration
- **Area**: Billing
- **Description**: No integration with a payment provider (Stripe, Paddle, etc.). Credit purchases, plan subscriptions, and invoicing all require external payment processing. Currently credits can only be set via direct DB operations.
- **Why deferred**: Requires payment provider selection, account setup, webhook handling, and checkout flow. This is a product/business decision, not just a code task.
- **Dependencies**: BIL-04, BIL-05, BIL-07
- **Priority**: MEDIUM
- **Type**: Missing feature / integration
- **Related files**: `api/billing.py`, `services/billing_service.py`
- **Recommended step**: Dedicated payment integration step (pre-launch)
- **Status**: DEFERRED

---

## Admin / Governance

### ADM-01: Admin panel API ✅ DONE
- **Area**: Admin
- **Description**: 8 admin endpoints implemented: overview, tenants (list+detail), simulations, runtime, costs, population, audit logs. Admin service + repository fully implemented.
- **Status**: DONE (Step 9)

### ADM-02: Audit logs table ✅ DONE
- **Area**: Admin
- **Description**: `audit_logs` table live (migration 007, 20 tables total). RLS restricts to platform_admin. `runtime_failure_records` remains deferred — failures are visible via `admin/runtime` endpoint which reads `simulation_runs.failure_reason`.
- **Status**: DONE (Step 9). Note: `runtime_failure_records` separate table not created — failure data comes from simulation_runs.

### ADM-03: require_admin() real DB check ✅ DONE
- **Area**: Governance
- **Description**: `require_admin()` now checks `workspace_memberships` for `role='platform_admin'`. Non-admins get 403. Tested.
- **Status**: DONE (Step 9)

### ADM-03b: runtime_failure_records separate table
- **Area**: Admin
- **Description**: DATA_MODEL_AND_STORAGE.md section 45 specifies a `runtime_failure_records` table for persistent failure registry. Currently failures are stored in `simulation_runs.failure_reason`. A separate table would support richer failure metadata, categorization, and admin-specific queries.
- **Why deferred**: Current approach works — failures are visible via `/admin/runtime` which reads `simulation_runs`. Separate table is a refinement.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Enhancement
- **Related files**: `repositories/admin.py`, `DATA_MODEL_AND_STORAGE.md`
- **Recommended step**: Admin refinement pass
- **Status**: DEFERRED

### ADM-04: Team management API ✅ DONE
- **Area**: Governance
- **Description**: 5 team endpoints: list members, invite by email, change role, remove member, list workspaces. Permission enforcement, role authority limits, self-protection, audit logging.
- **Status**: DONE (Step 10)

### ADM-05: Workspace create/rename/archive API
- **Area**: Governance
- **Description**: No API to create, rename, or archive workspaces. Currently workspaces are only created via direct DB insert in tests. TEAM_GOVERNANCE_AND_PERMISSIONS.md specifies workspace management as a workspace_admin capability.
- **Why deferred**: Core team member management was prioritized. Workspace lifecycle is a refinement.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `api/team.py`, `repositories/teams.py`
- **Recommended step**: Governance refinement
- **Status**: DEFERRED

### ADM-06: Object visibility policies
- **Area**: Governance
- **Description**: TEAM_GOVERNANCE_AND_PERMISSIONS.md specifies per-object visibility controls (private to creator, shared to workspace, restricted, org-visible, admin-only). Not implemented — all workspace-scoped objects are visible to all workspace members.
- **Why deferred**: Requires visibility field on each major object + filtering logic. Significant scope.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `TEAM_GOVERNANCE_AND_PERMISSIONS.md`
- **Recommended step**: Enterprise governance step
- **Status**: DEFERRED

---

## Frontend UI

### FE-01: All workspace pages ✅ DONE
- **Area**: Frontend
- **Description**: 19 workspace pages fully implemented in `/raktio-dashboard` (Vite + React 19): Overview, Simulations, New Simulation, Canvas, Reports, Report Detail, Compare, Audiences, Agent Atlas, Agent Profile, Knowledge, Graph Explorer, Billing, Integrations, Team, Settings, plus auth pages (Landing, Login, Signup, Onboarding, Pricing).
- **Status**: DONE (Step 11 Phase 1, 2026-04-15). All pages use mock data — real API integration is Step 11 Phase 2.

### FE-02: All admin pages ✅ DONE (4 of 11)
- **Area**: Frontend
- **Description**: 4 admin pages implemented: Admin Control, Model & Cost Control, Audit Logs, Tenant Management. 6 remaining admin surfaces (Runtime Health, Population Control, Pricing Control, Plan Management, Failures & Recovery, Storage Oversight) can be added progressively.
- **Status**: DONE (Step 11 Phase 1). Remaining admin surfaces are not blocking — they can grow with admin needs.

### FE-03: All component files ✅ DONE
- **Area**: Frontend
- **Description**: Core components implemented: ErrorBoundary, PageStates (Loading/Error/Empty), AppLayout with fixed shell. Canvas modes (Feed/Network/Geo full, Timeline/Segments/Compare placeholder). Report sections (14). Simulation wizard (7 steps). Agent cards, audience builder, knowledge manager, billing cards.
- **Status**: DONE (Step 11 Phase 1).

### FE-04: Frontend admin route blocking
- **Area**: Frontend
- **Description**: Middleware does not block non-admin users from `/admin/*` routes. Any authenticated user can see the admin UI shell. Relies on backend 403 for data access.
- **Why deferred**: Admin backend not implemented.
- **Dependencies**: ADM-03
- **Priority**: LOW
- **Type**: Limitation
- **Related files**: `frontend/middleware.ts`
- **Recommended step**: Step 9
- **Status**: DEFERRED

---

## Streaming / Infrastructure

### INF-01: Stream adapter (push-based)
- **Area**: Streaming
- **Description**: `stream_adapter.py` contains a `StreamManager` with pub/sub queues but is not wired into any active code path. SSE uses 2s polling instead. The adapter is documented as DEFERRED with explicit activation criteria.
- **Why deferred**: Polling is adequate for current scale. Wiring requires OASIS worker to dual-write events to both SQLite and in-memory bus.
- **Dependencies**: OASIS worker modification
- **Priority**: LOW
- **Type**: Architecture follow-up
- **Related files**: `adapters/stream_adapter.py`
- **Recommended step**: Production optimization step
- **Status**: DEFERRED

### INF-02: Object storage adapter
- **Area**: Infrastructure
- **Description**: `adapters/storage_adapter.py` is a stub. No file upload to Supabase Storage, S3, or R2. Needed for source files, report exports, canvas snapshots.
- **Why deferred**: No file-based features implemented yet.
- **Dependencies**: KS-01
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `adapters/storage_adapter.py` (stub)
- **Recommended step**: Knowledge step
- **Status**: DEFERRED

### INF-03: Semantic search adapter
- **Area**: Infrastructure
- **Description**: `adapters/search_adapter.py` is a stub. pgvector extension is enabled in Supabase but not used. Needed for report chat retrieval, evidence search, memory retrieval.
- **Why deferred**: No search-dependent features implemented yet.
- **Dependencies**: pgvector (enabled), embedding model
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `adapters/search_adapter.py` (stub)
- **Recommended step**: Report chat or memory step
- **Status**: DEFERRED

---

## Data Model Gaps

### DM-01: Simulation events index
- **Area**: Data Model
- **Description**: `simulation_events_index` table from DATA_MODEL_AND_STORAGE.md section 9 not created. This would be a normalized product-level event index for fast retrieval and replay.
- **Why deferred**: Events are currently read directly from OASIS SQLite via event_bridge.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Missing feature
- **Recommended step**: Replay/analytics step
- **Status**: DEFERRED

### INF-04: Superseded stubs cleanup
- **Area**: Infrastructure
- **Description**: Two stub files are superseded by actual implementations and should be removed or documented: `services/runtime_bridge_service.py` (superseded by `runtime/oasis_worker.py` + `runtime/event_bridge.py`) and `adapters/oasis_adapter.py` (superseded by `runtime/oasis_worker.py`). They contain only TODO comments and are never imported.
- **Why deferred**: No functional impact — they're dead files.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Cleanup
- **Related files**: `services/runtime_bridge_service.py`, `adapters/oasis_adapter.py`
- **Recommended step**: Next cleanup pass
- **Status**: DEFERRED

### INF-05: LLM streaming (stream_complete)
- **Area**: Infrastructure
- **Description**: `llm_adapter.stream_complete()` raises `NotImplementedError`. Would be needed for progressive report section streaming to the frontend (showing text as it generates).
- **Why deferred**: Reports generate synchronously per section. Streaming is a UX enhancement for the frontend.
- **Dependencies**: Frontend report rendering
- **Priority**: LOW
- **Type**: Enhancement
- **Related files**: `adapters/llm_adapter.py`
- **Recommended step**: Frontend implementation step
- **Status**: DEFERRED

### DM-02: Simulation bookmarks
- **Area**: Data Model
- **Description**: `simulation_bookmarks` table from DATA_MODEL_AND_STORAGE.md section 10 not created. User annotations/bookmarks on events.
- **Why deferred**: Frontend not implemented.
- **Dependencies**: FE-01
- **Priority**: LOW
- **Type**: Missing feature
- **Recommended step**: Step 11
- **Status**: DEFERRED

---

## Execution Timing

Every deferred item must have a timing classification:
- **DO NOW** — blocking or needed in the current implementation pass
- **DO AFTER CURRENT BLOCK** — refinement batch after Step 10.5H completes
- **DO BEFORE FRONTEND** — must be done before Step 11 (Frontend)
- **CAN WAIT** — not needed before launch / production / frontend

### Reality Upgrade Block — Step 10.5 ✅ COMPLETE
All 10.5 sub-steps (A through H) completed.

### Refinement Batch — Step 10.6 ✅ COMPLETE
| Item | Description | Status |
|------|-------------|--------|
| RP-02b | Report section fragility (truncation + retry) | ✅ DONE |
| MEM-02b | Topic extraction (keyword fallback) | ✅ DONE (partial — full LLM deferred) |
| MEM-02e | Relationship strength accumulation | ✅ DONE |
| MEM-02g | Summary unbounded growth fix | ✅ DONE |
| POP-03 | Agent Atlas API | ✅ DONE |
| GEO-01 | Geography in evidence/reporting | ✅ DONE |
| SIM-01 | Fresh vs memory-informed sim mode | ✅ DONE |
| POP-01 | Per-segment stance assignment | DEFERRED → CAN WAIT |
| INF-06 | Stronger influencer agent synthesis | DEFERRED → CAN WAIT |
| DIST-02 | Platform algorithm behavior | DEFERRED → CAN WAIT |
| DIST-04 | Seeded content distribution | DEFERRED → CAN WAIT |
| MEM-02c | LLM-based summary synthesis | DEFERRED → CAN WAIT |

### Items that CAN WAIT (post-frontend / production)
| Item | Description |
|------|-------------|
| POP-01 | Per-segment stance assignment |
| INF-06 | Stronger influencer agent synthesis |
| DIST-02 | Platform algorithm behavior |
| DIST-04 | Seeded content distribution |
| MEM-02b (full) | LLM-based topic extraction |
| MEM-02c | LLM-based summary synthesis |
| MEM-02d | Episode dedup guard |
| MEM-02f | N+1 query pattern (scale) |
| MEM-03 | Belief trajectory over time |
| SIM-02 | Memory as light influence (monitor) |
| DIST-03 | Competition / noise context |
| DIST-05 | Amplifier archetype detection |
| DIST-06 | Virality / amplification scoring |
| INF-07 | Bridge agent identification |
| RT-01 | ARQ background worker |
| RT-02 | Interview bridge |
| RT-04 | Group simulation actions |
| RT-05 | Runtime health endpoint |
| RP-01 | Report evidence links table |
| RP-02 | Report chat |
| RP-03 | Report PDF export |
| RP-04 | NLP sentiment analysis |
| RP-05 | Compare geo/segment deltas |
| POP-02 | Private audience enforcement |
| POP-04 | Audience create/edit/duplicate |
| BIL-04 | Subscriptions table |
| BIL-05 | Credit purchases table |
| BIL-05b | LLM usage analytics API |
| BIL-05c | Cost-based pricing recs |
| BIL-05e | LLM log attribution gaps |
| BIL-06 | Add-on modular pricing |
| BIL-07 | Plan change API |
| BIL-08 | Payment provider |
| ADM-03b | runtime_failure_records |
| ADM-05 | Workspace CRUD API |
| ADM-06 | Object visibility policies |
| INF-01 | Stream adapter (push) |
| INF-02 | Object storage adapter |
| INF-03 | Semantic search adapter |
| INF-04 | Superseded stubs cleanup |
| INF-05 | LLM streaming |
| DM-01 | Simulation events index |
| DM-02 | Simulation bookmarks |

---

## New Items (added 2026-04-15 — Strategic Review)

### Security

### SEC-01: Rate limiting on API endpoints
- **Area**: Security
- **Description**: No rate limiter on any API endpoint. DDoS and abuse risk in production.
- **Priority**: HIGH
- **Type**: Missing feature
- **Timing**: DO BEFORE PRODUCTION
- **Status**: NEW

### SEC-02: Input sanitization on brief/source text
- **Area**: Security
- **Description**: User text from brief and source uploads goes directly into LLM prompts. Prompt injection vector. Should sanitize or sandbox user input before prompt construction.
- **Priority**: MEDIUM
- **Type**: Security hardening
- **Timing**: DO BEFORE PRODUCTION
- **Status**: NEW

### SEC-03: API key rotation / secret management
- **Area**: Security
- **Description**: All API keys are in env vars with no rotation mechanism. Production needs proper secret management (Vault, AWS Secrets Manager, etc.).
- **Priority**: MEDIUM
- **Type**: Infrastructure
- **Timing**: DO BEFORE PRODUCTION
- **Status**: NEW

---

### Observability

### OBS-01: Structured logging
- **Area**: Observability
- **Description**: No structured logging (JSON format, request correlation IDs, trace context). Currently print/logger without standardized format. Production debugging requires structured logs.
- **Priority**: HIGH
- **Type**: Infrastructure
- **Timing**: DO BEFORE PRODUCTION
- **Status**: NEW

### OBS-02: Error tracking (Sentry or equivalent)
- **Area**: Observability
- **Description**: Errors only visible in server console. Production needs Sentry/Datadog/equivalent for error tracking, alerting, and triage.
- **Priority**: MEDIUM
- **Type**: Infrastructure
- **Timing**: DO BEFORE PRODUCTION
- **Status**: NEW

---

### Reliability

### REL-01: Simulation timeout / hard kill ✅ DONE
- **Area**: Reliability
- **Description**: OASIS runs now wrapped in `asyncio.wait_for()` with configurable timeout: `max(1800, duration_steps * 300)` seconds (min 30 min, 5 min/step). On timeout: marks sim as failed, settles credits with full refund, logs clearly.
- **Priority**: HIGH
- **Type**: Bug / missing guard
- **Status**: DONE (Step 11 pre-integration batch, 2026-04-15)

### REL-02: Idempotent simulation launch
- **Area**: Reliability
- **Description**: Double-clicking "Launch" could create duplicate runs. Launch endpoint should check for existing running/bootstrapping runs for the same simulation and reject duplicates.
- **Priority**: MEDIUM
- **Type**: Bug / guard
- **Timing**: DO BEFORE PRODUCTION
- **Status**: NEW

---

### Enterprise Readiness

### ENT-01: SSO / SAML integration
- **Area**: Auth / Enterprise
- **Description**: Auth is Supabase email+password and Google OAuth only. Enterprise customers require SSO (SAML 2.0, Okta, Azure AD). Supabase supports SAML — needs configuration + UI for enterprise settings.
- **Priority**: HIGH (for enterprise sales)
- **Type**: Missing feature
- **Timing**: DO BEFORE ENTERPRISE LAUNCH
- **Status**: NEW

### ENT-02: Data export / GDPR compliance
- **Area**: Governance / Legal
- **Description**: No API for user data export or deletion. GDPR requires "right to be forgotten" and "data portability". Must support: export all user data, delete user and associated data, audit trail of deletions.
- **Priority**: MEDIUM
- **Type**: Legal requirement
- **Timing**: DO BEFORE EU LAUNCH
- **Status**: NEW

### ENT-03: Workspace data isolation verification
- **Area**: Security / Multi-tenancy
- **Description**: Supabase RLS policies exist but have not been systematically verified for all 28 tables and all cross-workspace query paths. Must audit every repository function for workspace scoping.
- **Priority**: MEDIUM
- **Type**: Security audit
- **Timing**: DO BEFORE PRODUCTION
- **Status**: NEW

---

### Frontend Hardening

### FE-05: React error boundary components ✅ DONE
- **Area**: Frontend
- **Description**: ErrorBoundary class component wraps `<Outlet />` in AppLayout. Catches rendering errors, shows fallback UI with "Try again" button. Styled with Raktio design system.
- **Status**: DONE (Step 11 pre-integration batch, 2026-04-15)

### FE-06: Loading/error/empty states for API pages ✅ DONE
- **Area**: Frontend
- **Description**: PageLoading, PageError, PageEmpty components created. Loading/error state pattern applied to 6 core pages (Dashboard, SimulationsList, ReportsList, Report, Billing, AgentAtlas). Each page has useState hooks ready for real API replacement.
- **Status**: DONE (Step 11 pre-integration batch, 2026-04-15)

---

### Performance

### PERF-01: Report generation parallelism
- **Area**: Performance
- **Description**: 14 report sections generated sequentially = ~570s. Independent sections (simulation_context, outcome_scorecard, evidence, confidence_limitations) can be generated in parallel. Target: <3 minutes.
- **Priority**: MEDIUM
- **Type**: Performance
- **Timing**: CAN WAIT (post-integration)
- **Status**: NEW

---

### Infrastructure

### INF-08: Database connection pooling
- **Area**: Infrastructure
- **Description**: Supabase client is a singleton with no explicit connection pool management. Under load with concurrent simulations, may hit connection limits.
- **Priority**: MEDIUM
- **Type**: Scalability
- **Timing**: DO BEFORE PRODUCTION
- **Status**: NEW

### INF-09: CORS configuration hardening
- **Area**: Infrastructure
- **Description**: CORS likely allows all origins in development. Production must restrict to actual frontend domain(s).
- **Priority**: MEDIUM
- **Type**: Security
- **Timing**: DO BEFORE PRODUCTION
- **Status**: NEW
### KS-03: Image source support
- **Area**: Knowledge
- **Description**: Source upload supports text/PDF/DOCX but not images. DATAFLOW_AND_RUNTIME.md mentions image upload as a brief ingestion input. Would require vision model (Claude vision) to extract meaning from images.
- **Why deferred**: Text-based sources cover the primary use case. Image analysis requires different LLM capabilities.
- **Priority**: LOW
- **Type**: Enhancement
- **Timing**: CAN WAIT
- **Status**: DEFERRED

### New findings from deep audit (2026-04-14)

| ID | Issue | Timing |
|----|-------|--------|
| MEM-02g | Memory summary unbounded growth (no max length) | DO BEFORE FRONTEND |
| AUTH-01 | /api/billing/plans has no auth guard — document or fix | DO BEFORE FRONTEND |
| AUTH-02 | SSE ?token= in URL — log/history exposure risk | DO BEFORE PRODUCTION |
| RPQ-02 | No LLM JSON output schema validation in report_service | DO BEFORE PRODUCTION |
| CLEAN-01 | Delete 34 stubs + 12 empty model files | DO BEFORE PRODUCTION |
| SIM-03 | Re-understand/re-plan overwrite without warning | CAN WAIT |

### DONE items
MEM-01, MEM-02, MEM-02e, MEM-02g, BIL-01, BIL-02, BIL-03, BIL-05d, DIST-01, DIST-01b, ADM-01, ADM-02, ADM-03, ADM-04, POP-03, GEO-01, SIM-01, KS-01, KS-02, PLAT-01, PLAT-02, PLAT-03, RP-02b, FE-01, FE-02 (4/11), FE-03, FE-05, FE-06, REL-01, 10.5D (temporal)

---

## Enterprise Growth Track

> This section documents the strategic direction for evolving Raktio toward enterprise-grade product maturity. These items are NOT yet implemented. They represent the progressive growth path that must be preserved and prioritized as the product matures.

### Governance & Audit Completeness
- **ADM-06**: Object-level permissions (per-simulation, per-report visibility controls)
- **ADM-05**: Workspace lifecycle API (create, rename, archive workspaces)
- **Audit trail completeness**: Ensure all mutation events are captured in audit_logs
- **Admin/governance parity principle**: Every major product capability must have a corresponding admin/governance surface

### Identity & Access
- **ENT-01**: SSO / SAML integration (Okta, Azure AD, Google Workspace)
- **FE-04**: Admin route blocking in frontend (currently relies on backend 403)
- **Role granularity**: Expand beyond admin/analyst/viewer to include product_admin, billing_admin, support roles

### Data Privacy & Compliance
- **ENT-02**: GDPR data export / right to be forgotten
- **ENT-03**: Workspace data isolation verification (RLS audit across all 28 tables)
- **SEC-02**: Input sanitization on user text before LLM prompts

### Multi-Tenancy & Workspace Control
- **POP-02**: Private audiences / private populations (workspace-scoped agent pools)
- **Workspace data isolation**: RLS enforcement verification for all cross-workspace queries
- **Tenant health monitoring**: Per-tenant resource usage, alert thresholds

### Reporting & Executive Deliverables
- **RP-03**: Report PDF export (WeasyPrint or Puppeteer)
- **RP-02**: Report chat (interactive Q&A on evidence)
- **RP-01**: Report evidence links table (structured drill-down)
- **Report benchmarking**: Compare results against industry baselines
- **Report sharing**: Shareable links with access controls

### Commercial & Billing Governance
- **BIL-07**: Plan change API (upgrade/downgrade/cancel)
- **BIL-08**: Payment provider integration (Stripe/Paddle)
- **BIL-04**: Subscriptions table (plan periods, renewals)
- **BIL-06**: Add-on modular pricing

### Collaboration & Team Features
- **Collaboration annotations**: Team comments on reports and simulations
- **Shared views**: Team members can share canvas states and filters
- **Notification system**: Real alerts beyond the mock notification bell

### Source Governance & Storage
- **INF-02**: Object storage adapter (Supabase Storage / S3 / R2)
- **KS-03**: Image source support (vision model extraction)
- **Source versioning**: Track changes to uploaded documents over time
- **Storage quotas**: Per-tenant storage limits and monitoring

### Premium Realism Differentiators
- **DIST-04**: Seeded content injection (test the exact message)
- **INF-06**: Influencer archetype synthesis (specialized agent types)
- **DIST-02**: Platform algorithm simulation (engagement-based amplification)
- **Multi-language simulation**: Agents respond in the geography's language
- **Custom agent pools**: Enterprise uploads their own customer profiles as templates
- **Real-time competitive monitoring**: Scheduled sims tracking competitor announcements

### Infrastructure & Reliability
- **RT-01**: ARQ background worker dispatch (Redis + worker process)
- **SEC-01**: Rate limiting on API endpoints
- **INF-08**: Database connection pooling
- **INF-09**: CORS configuration hardening
- **OBS-01**: Structured logging (JSON, correlation IDs)
- **OBS-02**: Error tracking (Sentry or equivalent)

### Principle
> Admin, governance, and enterprise capabilities must evolve in parallel with product capabilities. Major product features must remain governable, controllable, auditable, and supportable. Before moving to major new implementation blocks, verify completeness, update docs/backlog, and audit the latest implemented block.

---

## Language Architecture (decided 2026-04-15, corrected)

> Core principle: **Store originals with source_language metadata. Generate new content in target language. Preserve originals — never overwrite. Remain compatible with future reader-language translation.**
>
> Source language is metadata, not a display constraint. The product must support: source-language display (default), reader-language translation (future), and cached translation (future). Originals are never replaced by translations.

### LANG-01: simulation_language field
- **Area**: Simulation / Language
- **Description**: Add `simulation_language` to `simulation_configs`. Derived from geography during `understand_brief()` (primary_languages[0]). User can override in New Simulation wizard. Injected into agent descriptions as "Communicate in {language}." For multi-country sims, per-agent language based on their country.
- **Priority**: MEDIUM
- **Type**: New field + config injection
- **Timing**: DO DURING FRONTEND INTEGRATION (Step 11 Phase 2)
- **Status**: DESIGNED — not yet implemented

### LANG-02: source_language on memory records
- **Area**: Memory / Language
- **Description**: Add explicit `source_language` string field to `agent_memory_summaries` and `agent_episodic_memory`. Set by `memory_service.transform_run_to_memory()` from the simulation's `simulation_language`. This is metadata — it does not constrain display. Future display may show original, translated, or both.
- **Priority**: MEDIUM
- **Type**: Schema field + service change
- **Timing**: DO DURING FRONTEND INTEGRATION (Step 11 Phase 2)
- **Status**: DESIGNED — not yet implemented

### LANG-03: Report/compare output language parameter
- **Area**: Reports / Language
- **Description**: Add `language` parameter to `report_service.generate_report()` and `compare_service.create_comparison()`. Prompt: "Write analysis in {language}. Preserve evidence quotes in their original language." Default: 'en'. Store `language` field on report/compare records. User could later request same report in different language → new version, not overwrite.
- **Priority**: MEDIUM
- **Type**: API parameter + prompt change
- **Timing**: DO DURING FRONTEND INTEGRATION (Step 11 Phase 2)
- **Status**: DESIGNED — not yet implemented

### LANG-04: reading_language as product concept
- **Area**: User / Language
- **Description**: `reading_language` is a real product concept from Phase 1. API endpoints accept `language` parameter for generated content (reports, compare). Per-user `reading_language` preference stored in Phase 2. Default: 'en'. Frontend passes this when calling generation APIs.
- **Priority**: MEDIUM (concept now, stored preference Phase 2)
- **Type**: API design + user preference
- **Timing**: Phase 1 (API param), Phase 2 (stored user preference + UI toggle)
- **Status**: DESIGNED — API param not yet implemented, user preference not yet implemented

### LANG-05: UI i18n (EN/IT)
- **Area**: Frontend / Language
- **Description**: Extract all UI strings into `src/lib/i18n/{en,it}.ts` dictionaries. Add `useLocale()` hook or context provider. `ui_language` user preference controls which dictionary loads. All 23 pages need string extraction.
- **Priority**: LOW
- **Type**: Frontend refactor
- **Timing**: Phase 2
- **Status**: DESIGNED — not yet implemented

### LANG-06: Translate-on-demand (feed, Atlas, memory)
- **Area**: Frontend / Language
- **Description**: In Agent Atlas, Canvas feed, and memory displays, offer optional translate button for content where `source_language ≠ reading_language`. Calls LLM for translation, shows both original and translated text. Results cached (client-side or `translations` table). Originals never overwritten.
- **Priority**: LOW
- **Type**: UX enhancement + optional backend cache
- **Timing**: Phase 3
- **Status**: DESIGNED — not yet implemented
