# Deferred Items and Backlog

> Central source of truth for all deferred, partial, blocked, or missing items.
> Last synchronized: 2026-04-14 (after Step 7.5G — Step 7.5 block complete)

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

### DIST-01: Publisher authority / reputation scoring
- **Area**: Distribution
- **Description**: All agents currently have equal reach mechanics. In reality, high-follower agents should have posts seen by more people. `influence_weight` and `follower_band` exist in agent profiles but don't affect OASIS recsys exposure. Need to weight recommendation/exposure by agent authority.
- **Why it matters**: Without authority gradient, a nano-follower has the same reach as a macro-influencer. This undermines platform realism and "who drives the narrative" analysis.
- **Priority**: HIGH
- **Type**: Missing feature
- **Dependencies**: None (agent fields exist)
- **Timing**: DO NOW (Step 10.5E — next)
- **Status**: DEFERRED

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
- **Description**: Ability to inject initial "seed" content (the actual post/campaign being tested) at a specific simulated time, then observe organic reactions. Currently the brief influences agent behavior but the exact content being tested isn't posted as a seed.
- **Why it matters**: Users want to test a specific post/message, not just a topic. Seeding lets the simulation react to the exact content.
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Dependencies**: None
- **Timing**: DO BEFORE FRONTEND
- **Status**: DEFERRED

### DIST-05: Amplifier archetype detection
- **Area**: Distribution
- **Description**: Post-run classification of agents into amplifier archetypes (early adopter, bridge node, echo chamber member, contrarian, passive observer). Currently `patient_zero` report section infers this from evidence, but no structured archetype tagging exists.
- **Why it matters**: Structured archetypes enable segment-based analysis and audience refinement.
- **Priority**: LOW
- **Type**: Enhancement
- **Dependencies**: MEM-02b (better topic extraction)
- **Timing**: CAN WAIT
- **Status**: DEFERRED

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
- **Description**: Generate or tag synthetic agents with explicit influencer profiles (fashion influencer, tech thought leader, local community leader). These agents should have high `influence_weight`, appropriate `follower_band`, and domain-specific expertise that makes them realistic test subjects for "how would influencers react" scenarios.
- **Why it matters**: Brand/agency users want to test influencer-led scenarios (e.g., "what if a fashion influencer promotes this product"). Currently all agents are generic.
- **Priority**: MEDIUM
- **Type**: Enhancement
- **Dependencies**: DIST-01 (influence weight matters in reach)
- **Timing**: DO BEFORE FRONTEND
- **Status**: DEFERRED

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

### SIM-01: Fresh vs memory-informed simulation mode
- **Area**: Simulation
- **Description**: Users should be able to choose between: (a) **Fresh/baseline** — agents participate without memory context (clean slate, useful for controlled experiments), (b) **Persistent/memory-informed** — agents carry prior memory (realistic longitudinal behavior). This should be a clear option in simulation setup.
- **Why it matters**: A/B testing requires fresh baselines. Longitudinal campaigns need persistent memory. Both modes are valuable.
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Dependencies**: Memory system (10.5A-C, done)
- **Timing**: DO BEFORE FRONTEND
- **Status**: DEFERRED

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

### GEO-01: Stronger geography in evidence and reporting
- **Area**: Geography
- **Description**: Agent geography exists in Supabase profiles but is not in the OASIS SQLite evidence bundle. Reports and compare cannot do real geography-based analysis — they infer from agent descriptions. Agent country/city should be included in the evidence bundle and the report prompt.
- **Why it matters**: "Your message works in Milan but fails in Naples" is a key product promise. Without real geo data in evidence, geo analysis sections are speculative.
- **Priority**: MEDIUM
- **Type**: Enhancement
- **Dependencies**: None
- **Timing**: DO BEFORE FRONTEND
- **Status**: DEFERRED

### PLAT-01: LinkedIn runtime behavior model
- **Area**: Platform
- **Description**: LinkedIn simulations currently use Twitter OASIS mode with "LinkedIn" label. Need: professional tone weighting, higher reputation signaling, lower aggression default, longer-form content tendency, connection-based (not follower-based) reach.
- **Why it matters**: LinkedIn users behave fundamentally differently than Twitter users. Credible LinkedIn simulation requires runtime-level behavioral differences.
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Dependencies**: Step 10.5H (platform action weight profiles)
- **Timing**: Step 10.5H
- **Status**: DEFERRED

### PLAT-02: Instagram runtime behavior model
- **Area**: Platform
- **Description**: Instagram simulations need: more visual framing, shorter comments, aesthetic/social proof emphasis, weaker explicit dislike semantics, higher like-to-comment ratio.
- **Priority**: MEDIUM
- **Dependencies**: Step 10.5H
- **Timing**: Step 10.5H
- **Status**: DEFERRED

### PLAT-03: TikTok runtime behavior model
- **Area**: Platform
- **Description**: TikTok simulations need: rapid reaction cycles, trend/slang influence, very short commentary, faster polarizing spread, higher reshare tendency.
- **Priority**: LOW
- **Dependencies**: Step 10.5H
- **Timing**: Step 10.5H
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
- **Status**: DEFERRED — planned for Step 10.6

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

### RP-02b: Report section generation fragility
- **Area**: Reports
- **Description**: With 14 sections, later sections receive a very large prompt (all previous sections' markdown is included for coherence). This can cause: JSON parsing failures, token limit issues, or LLM refusals. Stress test showed 11/14 sections succeeded (3 failed). The system is fault-tolerant (failed sections don't block others), but the failure rate needs improvement.
- **Why deferred**: The core pipeline works. Optimization is a refinement task: truncate previous sections more aggressively, or omit them for independent sections.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Bug / fragility
- **Related files**: `services/report_service.py` `_generate_section()` prompt construction
- **Recommended step**: Report refinement pass
- **Status**: DEFERRED

### RP-02c: Report excellence hardening (dedicated post-Billing micro-step)
- **Area**: Reports
- **Description**: Comprehensive hardening pass on the report generation system to bring it from "works" to "excellent". Covers five areas:
  1. **Section fragility**: 3/14 sections failed in stress test. Fix prompt growth by truncating/summarizing previous sections, not including full markdown. Consider section-independence classification (which sections need prior context, which don't).
  2. **Prompt optimization**: Evidence bundle is passed as raw text. Should be structured more compactly. Reduce redundancy between event_counts, agent_activity, and belief_indicators in the prompt.
  3. **Generation latency**: 14 sections × sequential LLM call = ~570s. Independent sections (simulation_context, outcome_scorecard, evidence, confidence_limitations) can be generated in parallel. Target: <3 minutes for full report.
  4. **Evidence grounding quality**: Ensure sections like belief_shifts and faction_analysis cite specific trace events, not just aggregate metrics. Consider passing a curated "evidence highlights" subset per section instead of the full bundle.
  5. **Robustness**: Add retry logic for failed sections (1 retry with simplified prompt). Track which sections fail most often. Consider fallback to shorter prompts for late sections.
- **Why deferred**: Core pipeline works and produces useful reports. Excellence hardening is a refinement pass that should happen after the billing system is in place (Step 8), so the product has both simulation capability and commercial infrastructure before polish.
- **Dependencies**: None (all infrastructure exists)
- **Priority**: HIGH
- **Type**: Enhancement / quality hardening
- **Related files**: `services/report_service.py`, `runtime/event_bridge.py`
- **Recommended step**: Dedicated micro-step after Step 8 (suggested: Step 8.5 or Step 9A)
- **Status**: DEFERRED

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
- **Description**: Planner provides per-segment `stance_bias`, but audience_service assigns stances globally from `stance_distribution` randomly. Agents don't get segment-appropriate stances.
- **Why deferred**: Requires segment-to-agent mapping logic (which segment each agent belongs to, based on demographics/psychographics).
- **Dependencies**: Segment definition model in audience assembly
- **Priority**: MEDIUM
- **Type**: Limitation
- **Related files**: `services/audience_service.py` lines 209-217
- **Recommended step**: Population refinement step
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

### POP-03: Agent Atlas API
- **Area**: Population
- **Description**: `api/agents.py` is a stub. No API for browsing, filtering, or viewing agent profiles. The Agent Atlas page (Tier 2 per APP_STRUCTURE_AND_PAGES.md) has no backend.
- **Why deferred**: Lower priority than runtime pipeline and evidence pipeline.
- **Dependencies**: None (agents exist in DB with full profiles)
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `api/agents.py` (stub), `AUDIENCE_AND_AGENT_ATLAS_SPEC.md`
- **Recommended step**: Step 10
- **Status**: DEFERRED

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

### MEM-02b: LLM-based episode extraction
- **Area**: Memory
- **Description**: Current topic extraction uses simple hashtag parsing (`#tag` → topic). Content without hashtags produces no topic exposure. LLM-based extraction (sending post/comment content to Claude for semantic topic/entity extraction) would produce richer, more accurate memory.
- **Why deferred**: Hashtag extraction works for posts that use hashtags. LLM extraction adds cost (one LLM call per post/comment) and latency to post-run transformation.
- **Dependencies**: None
- **Priority**: MEDIUM
- **Type**: Enhancement
- **Related files**: `services/memory_service.py` `_extract_topics()`
- **Recommended step**: Memory refinement pass
- **Status**: DEFERRED

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

### MEM-02e: Relationship strength accumulation across runs
- **Area**: Memory
- **Description**: Currently each run resets `relationship_strength` to a value based on that run's interaction count. Across multiple runs, strength should accumulate (agents who interact in 5 simulations should have stronger relationships than one-run interactions). The upsert overwrites rather than accumulating.
- **Why deferred**: Single-run relationships work. Accumulation requires reading existing strength before upsert.
- **Dependencies**: None
- **Priority**: LOW
- **Type**: Enhancement
- **Related files**: `services/memory_service.py` `_update_relationships()`
- **Recommended step**: Memory refinement pass
- **Status**: DEFERRED

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

### KS-01: Knowledge domain tables
- **Area**: Knowledge
- **Description**: 4 tables from DATA_MODEL_AND_STORAGE.md Domain 6 not created: `sources`, `source_files`, `source_extractions`, `source_links`. No file upload, parsing, or source-to-simulation linking.
- **Why deferred**: Brief ingestion currently accepts text only. File processing requires parser adapter + storage adapter.
- **Dependencies**: Storage adapter, parser adapter
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `DATA_MODEL_AND_STORAGE.md` Domain 6, `adapters/parser_adapter.py` (stub), `adapters/storage_adapter.py` (stub)
- **Recommended step**: Dedicated knowledge step
- **Status**: DEFERRED

### KS-02: File/image upload in brief ingestion
- **Area**: Knowledge
- **Description**: DATAFLOW_AND_RUNTIME.md Phase 1 says brief ingestion should accept "images, PDFs, DOCX/TXT/MD files". Only `brief_text` is supported.
- **Why deferred**: Requires KS-01 tables + parser adapter + storage adapter.
- **Dependencies**: KS-01
- **Priority**: MEDIUM
- **Type**: Missing feature
- **Related files**: `services/brief_service.py`, `DATAFLOW_AND_RUNTIME.md`
- **Recommended step**: Same as KS-01
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

### FE-01: All workspace pages
- **Area**: Frontend
- **Description**: 15 app pages are placeholder stubs (overview, sim/new, sim/[id], simulations, reports, compare, audiences, agents, knowledge, graph, billing, integrations, team, settings). These are the core product UI.
- **Why deferred**: Step 11. Backend pipeline was prioritized.
- **Dependencies**: Backend APIs (mostly implemented)
- **Priority**: HIGH
- **Type**: Missing feature
- **Related files**: `frontend/app/(app)/**`
- **Recommended step**: Step 11
- **Status**: DEFERRED

### FE-02: All admin pages
- **Area**: Frontend
- **Description**: 11 admin pages are placeholder stubs.
- **Why deferred**: Admin backend not implemented (Step 9).
- **Dependencies**: ADM-01
- **Priority**: LOW
- **Type**: Missing feature
- **Related files**: `frontend/app/(admin)/**`
- **Recommended step**: Step 11 (after Step 9)
- **Status**: BLOCKED

### FE-03: All component files
- **Area**: Frontend
- **Description**: ~40 component files are stubs (canvas modes, simulation forms, report sections, agent cards, audience builders, etc.).
- **Why deferred**: Step 11.
- **Dependencies**: FE-01
- **Priority**: HIGH
- **Type**: Missing feature
- **Related files**: `frontend/components/**`
- **Recommended step**: Step 11
- **Status**: DEFERRED

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

### Reality Upgrade Block — remaining (Step 10.5E-H)
| Step | Item | Timing |
|------|------|--------|
| ~~10.5D~~ | ~~Temporal activity multipliers~~ | ~~DONE~~ |
| 10.5E | Influence-weighted reach (DIST-01) | DO NOW (next) |
| 10.5F | Source/Knowledge tables + upload (KS-01, KS-02, SRC-01) | DO NOW |
| 10.5G | Source-aware brief understanding | DO NOW |
| 10.5H | Platform behavior profiles (PLAT-01, PLAT-02, PLAT-03) | DO NOW |

### Refinement Batch — Step 10.6 (after 10.5H, before Frontend)
Post-10.5 refinement pass to harden quality before frontend work.
| Item | Description | Timing |
|------|-------------|--------|
| RPQ-01 / RP-02c | Report excellence hardening | DO AFTER CURRENT BLOCK |
| RP-02b | Report section fragility fix | DO AFTER CURRENT BLOCK |
| MEM-02b | LLM-based topic extraction | DO AFTER CURRENT BLOCK |
| MEM-02c | LLM-based summary synthesis | DO BEFORE FRONTEND |
| MEM-02e | Relationship strength accumulation | DO BEFORE FRONTEND |
| POP-01 | Per-segment stance assignment | DO BEFORE FRONTEND |
| POP-03 | Agent Atlas API | DO BEFORE FRONTEND |
| GEO-01 | Geography in evidence/reporting | DO BEFORE FRONTEND |
| SIM-01 | Fresh vs memory-informed sim mode | DO BEFORE FRONTEND |
| INF-06 | Stronger influencer agent synthesis | DO BEFORE FRONTEND |
| DIST-02 | Platform algorithm behavior | DO BEFORE FRONTEND |
| DIST-04 | Seeded content distribution | DO BEFORE FRONTEND |

### Items that CAN WAIT (post-frontend / production)
| Item | Description |
|------|-------------|
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
| FE-02 | Admin pages |
| FE-04 | Admin route blocking |

### DONE items
MEM-01, MEM-02, BIL-01, BIL-02, BIL-03, BIL-05d, ADM-01, ADM-02, ADM-03, ADM-04, 10.5D (temporal)
