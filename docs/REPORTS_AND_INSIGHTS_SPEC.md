# REPORTS_AND_INSIGHTS_SPEC.md

## Purpose

This document defines the structure, behavior, and product role of Raktio’s reporting and insights system.

Raktio reports are not decorative summaries.  
They are one of the core reasons the product is valuable and sellable.

A report must:
- explain what happened
- explain why it happened
- identify what matters
- surface risk and opportunity
- support decisions
- enable iteration
- remain grounded in real simulation evidence

---

## Core rule

**Raktio reports must be evidence-backed, structured, and decision-oriented.**

They must not feel like:
- generic LLM summaries
- vague consultant prose
- decorative dashboards
- ungrounded prediction theater

They must feel like:
- an analyst’s synthesis
- built on real simulation behavior
- inspectable and explorable
- useful enough to act on

---

## Report mission

A report should help the user answer questions like:

- Did the idea/message/content perform well or poorly?
- Which audience segments reacted best or worst?
- Which geographies diverged?
- Which platform amplified or softened the reaction?
- What caused the biggest positive or negative cascade?
- Which change would most likely improve outcomes?
- What did I miss before launching?
- What should I test next?

---

## Report architecture

The report system has three layers:

### 1. Generated insight layer
Structured sections produced from simulation evidence

### 2. Evidence layer
Quotes, posts, events, turning points, memory shifts, and metric references supporting conclusions

### 3. Interactive insight layer
Chat, filtering, drill-down, compare, and export capabilities

All three are required.

---

## Report generation model

### Inputs
Reports are generated from:
- simulation config
- runtime trace/events
- aggregated metrics
- belief/stance shifts
- geography breakdowns
- platform breakdowns
- segment breakdowns
- relationship changes
- memory episodes
- interview outputs
- exposure analysis
- compare context when relevant

### Output style
Reports should be:
- section-based
- progressive
- evidence-backed
- actionable
- explainable
- exportable

### Generation approach
Use:
- tool-assisted reasoning
- decomposition of questions
- search over simulation evidence
- optional interview-informed interpretation
- progressive section generation instead of one-shot only

---

## Report lifecycle

### State model
Suggested report states:
- queued
- generating
- partially_available
- completed
- failed

### UX behavior
The user should not have to wait for the full report before seeing value.

As sections become available, they should appear progressively.

---

## Required report structure

# 1. Executive Summary

## Purpose
Deliver the top-line outcome fast.

## Must include
- overall simulation outcome
- short summary of reaction pattern
- top risk
- top opportunity
- strongest positive signal
- strongest negative signal
- recommendation headline
- confidence / limitation note

## Example questions it answers
- Was this broadly positive, mixed, or risky?
- Is this ready to publish/launch/test?
- What is the one thing I should know first?

---

# 2. Simulation Context

## Purpose
Anchor the report in what was actually simulated.

## Must include
- simulation goal
- brief summary
- agent count
- duration
- geography scope
- platform scope
- major audience composition
- recsys choice
- notable setup details
- key planner assumptions

## Why this matters
Without this, the report feels disconnected from the actual run.

---

# 3. Outcome Score / Scorecard

## Purpose
Provide a compact evaluation layer.

## Possible structure
- overall score
- risk score
- resonance score
- controversy score
- adoption potential
- clarity score
- polarization score

These can be presented as:
- 0–10
- labeled bands
- enterprise-friendly scorecards

## Important rule
Scores must support interpretation, not replace it.

---

# 4. Key Findings

## Purpose
Surface the most important discoveries.

## Must include
- surprising reaction patterns
- strongest objections
- strongest validation signals
- hidden opportunities
- blind spots exposed by simulation
- unexpected segment/platform/geography divergence

## Finding structure
Each finding should include:
- title
- short explanation
- why it matters
- affected audience/platform/geo
- supporting evidence
- optional confidence note

---

# 5. Belief and Stance Shifts

## Purpose
Show how opinions moved, not just how much people talked.

## Must include
- movement from neutral to positive
- movement from neutral to skeptical
- movement from persuadable to resistant
- hardened support or hardened opposition
- what content/interactions triggered changes
- which clusters shifted most

## Why this matters
This is one of Raktio’s strongest differentiators.

---

# 6. Patient Zero / Amplifier Analysis

## Purpose
Identify causal drivers of the simulation’s outcome.

## Must include
- patient zero candidate(s)
- top amplifiers
- bridge nodes
- calming agents / de-escalators
- cascade origin summary
- spread pathways

## Example questions answered
- Who started the backlash?
- Who amplified the good reaction?
- Which node changed the course of the conversation?

---

# 7. Segment Analysis

## Purpose
Show how different audience slices reacted.

## Segment examples
- age bands
- gender
- profession
- income bands
- geography-driven cohorts
- platform-active cohorts
- private audience segments
- source-derived segments

## Must include
- top positive segments
- top negative segments
- indifferent segments
- highly polarized segments
- best fit / worst fit segments
- segment-specific objections
- segment-specific opportunities

---

# 8. Geography Analysis

## Purpose
Show differences across countries and internal local areas.

## Must include
- sentiment by geography
- activity by geography
- polarization by geography
- top local themes
- divergent local reactions
- drill-down insights for single-country runs

## Example
For Italy-only runs, the report should still discuss internal variation by:
- region
- province/state where appropriate
- city clusters

Geo must not be shallow.

---

# 9. Platform Analysis

## Purpose
Explain how the same simulation behaved across platforms.

## Must include
- platform-level sentiment
- platform-level controversy
- platform-level virality/amplification
- tone differences
- engagement shape differences
- where a message performed best or worst
- platform-specific risk/opportunity notes

## Why it matters
Raktio uses multi-platform model 1, so the report must reflect cross-platform behavioral reality.

---

# 10. Exposure and Recommendation Analysis

## Purpose
Explain what people saw and how that shaped outcomes.

## Must include
- top exposed content
- exposure distribution across segments
- recsys effect summary
- exposure vs reaction relationship
- whether the algorithm reinforced certain dynamics

## Why it matters
Reaction without exposure analysis is incomplete.

---

# 11. Relationship / Faction Analysis

## Purpose
Explain social structure changes.

## Must include
- faction emergence
- echo chamber formation
- new follow clusters
- unfollow / mute spikes
- fragmentation
- bridge agents
- group/community effects if relevant

## Why this matters
This is one of the strongest analytical differentiators versus a simple AI summary tool.

---

# 12. Key Evidence

## Purpose
Support insights with traceable artifacts.

## Evidence types
- notable posts
- notable comments
- notable quotes/reposts
- key searches
- interviews
- turning-point events
- graph events
- memory episodes
- trend markers

## Each evidence item should support
- what happened
- where it happened
- why it matters
- which insight it supports

## UX rule
Evidence must be clickable and inspectable, not buried.

---

# 13. Recommendations

## Purpose
Turn insights into action.

## Recommendations should include
- what to change
- what to keep
- what to test next
- what to remove or avoid
- which geography/platform to prioritize
- which audience segment to target or avoid
- what language/tone to refine

## Structure
Each recommendation should include:
- priority
- rationale
- expected impact
- linked evidence
- suggested next simulation

---

# 14. Confidence, Robustness, and Limits

## Purpose
Keep the product credible.

## Must include
- sample robustness note
- planner assumptions note
- limitation note
- uncertainty note where appropriate
- warning if a scenario is unusually thin or exploratory

## Why
This avoids fake certainty and increases trust.

---

# 15. Report Chat

## Purpose
Let the user interrogate the report and the simulation evidence interactively.

## Example prompts
- Why did the Gen Z segment react badly?
- What was the main objection in Italy?
- Which word triggered the backlash?
- Summarize the 3 strongest positives.
- Show me only the evidence from LinkedIn.
- Which audience became more favorable over time?

## Backing logic
Report Chat should query:
- report sections
- evidence layer
- memory layer
- search/index layer
- interview layer when useful

## Important rule
Report chat must answer using the run evidence, not generic speculation.

---

# 16. Compare-Ready Report Features

## Purpose
Allow reports to feed Compare Lab and scenario iteration.

## Must include
- structured summary features
- comparable score outputs
- segment deltas
- geo deltas
- platform deltas
- recommendation deltas
- causal deltas

## Why
The user journey does not end at reading one report.  
The report must help launch the next, better simulation.

---

## Progressive rendering model

### Required behavior
The report should appear section by section.

### Suggested order
1. Executive Summary
2. Context
3. Scorecard
4. Key Findings
5. Segment / Geo / Platform Analysis
6. Belief / Patient Zero / Faction Analysis
7. Recommendations
8. Confidence / Limits
9. Full Evidence
10. Report Chat available throughout once enough context exists

### Why
This keeps users engaged and avoids dead waiting time.

---

## Evidence model

### Evidence should be stored as structured references
Each report insight should be linked to:
- one or more events
- one or more traces
- one or more agent outputs
- one or more memory episodes
- one or more interviews
- one or more metric references

### This enables
- inspectability
- traceability
- trust
- better exports
- better compare

---

## Report export model

### Supported exports
- PDF
- shareable link
- executive summary export
- compare summary export
- evidence snapshot export

### Export requirements
Exports must preserve:
- headline findings
- recommendations
- core visuals
- scorecards
- evidence excerpts
- simulation context

---

## Recommended visual sections

### Executive section
- big summary cards
- scorecard
- headline recommendation

### Insight section
- cards or structured panels
- importance / risk badges
- linked evidence

### Analysis section
- charts
- segment tables
- geo breakdowns
- platform deltas
- timeline markers

### Evidence section
- post/comment/event list
- interview excerpts
- trace-linked snapshots

### Recommendation section
- clear action list
- priority badges
- “next simulation to run” suggestions

---

## Integration with the rest of the product

### Report -> Simulation Canvas
The user should be able to jump from a finding directly to:
- the relevant time window
- the relevant agent
- the relevant geography
- the relevant post/comment
- the relevant graph slice

### Report -> Compare
The user should be able to:
- compare this report to another
- branch into a new simulation from one recommendation

### Report -> Audience
The user should be able to:
- inspect affected segments
- save a segment as an audience
- refine future simulations

---

## Anti-patterns to avoid

### Do not
- generate one giant blob of text
- invent conclusions without evidence
- present only charts and no interpretation
- present only prose and no inspectable evidence
- make reports feel disconnected from the simulation
- hide uncertainty completely
- make report chat generic and uncoupled from the run

---

## Tiered report complexity

### Standard reports
- summary
- key findings
- basic segment/platform/geo views
- recommendations

### Advanced reports
- richer causality
- belief shifts
- amplifier analysis
- stronger evidence layer
- report chat

### Enterprise reports
- deeper compare
- governance/compliance-friendly exports
- stronger methodology and confidence sections
- custom slices and audience insights

---

## Non-negotiable requirements

A Raktio report must:
- be grounded in the simulation
- be inspectable
- be progressive
- be decision-oriented
- support compare and iteration
- expose uncertainty honestly
- feel like a premium analytical deliverable

---

## Final rule for Claude

**Treat the reporting system as one of Raktio’s core product pillars. Reports must be evidence-backed, structured, interactive, and tightly connected to the live simulation, the memory layer, and compare workflows. Never reduce them to generic LLM summaries or decorative analytics pages.**


---

## Implementation Status (as of 2026-04-15, post Step 10.6)

### Frontend Report Status (2026-04-15, post Step 11 Phase 1)

**Report Detail Page (`/reports/:id`):**
- 14-section layout with sidebar navigation (smooth scroll)
- Executive Summary dark hero card with 4 scorecards (Risk, Resonance, Controversy, Adoption Potential)
- Recommendation headline in executive summary
- All 14 sections rendered with mock content:
  1. Executive Summary, 2. Simulation Context, 3. Outcome Scorecard, 4. Key Findings,
  5. Belief & Stance Shifts, 6. Patient Zero / Amplifier, 7. Segment Analysis,
  8. Geography Analysis, 9. Platform Analysis, 10. Exposure & Recommendation,
  11. Relationship / Factions, 12. Key Evidence (3 quoted posts), 13. Recommendations (Keep/Change/Test),
  14. Confidence & Limits
- Header: Back button, title, metadata, Share + Download PDF actions
- Loading/error state hooks ready for API integration

**Reports List Page (`/reports`):**
- Table with 5 columns (Name, Type, Date, Risk, Actions)
- Search, sort dropdown (4 options), pagination
- 3 stat cards (Reports Generated, Success Rate, Crises Avoided)

**Still NOT implemented:** Report chat (RP-02), PDF export (RP-03), evidence drill-down links (RP-01)

### Report generation
- **Progressive 14-section generation** via Claude Sonnet (REPORT route)
- **Sections**: executive_summary, simulation_context, outcome_scorecard, key_findings, belief_shifts, patient_zero, segment_analysis, geography_analysis, platform_analysis, exposure_analysis, faction_analysis, recommendations, evidence, confidence_limitations
- **Evidence-backed**: reports receive real runtime evidence from OASIS SQLite via `build_evidence_bundle()`
- **Step 10.6 improvements**:
  - Previous sections truncated to 150-char single-line summaries (prevents prompt bloat)
  - 1 retry per failed section
  - Agent geography (country, city) injected into report prompt from Supabase

### Evidence pipeline feeding reports
| Evidence source | Implemented | Used in prompt |
|----------------|-------------|----------------|
| Event counts (posts, comments, likes, etc.) | ✓ | ✓ |
| Action summary (trace action types) | ✓ | ✓ |
| Top posts (with content + engagement) | ✓ | ✓ |
| Sample comments (with content + attribution) | ✓ | ✓ |
| Per-agent activity breakdown | ✓ | ✓ |
| Belief shift indicators (behavioral stance, reaction ratio) | ✓ | ✓ |
| Exposure history (from refresh traces) | ✓ | ✓ |
| Interaction matrix (comment/like/follow/mute edges) | ✓ | ✓ |
| Post reach (per-post exposure to agents) | ✓ | ✓ |
| Agent geography (country, city from Supabase) | ✓ (Step 10.6) | ✓ |
| NLP sentiment analysis on content | Not implemented | Not used |
| Interview outputs | Not implemented | Not used |

### What is NOT yet implemented
- `report_evidence_links` table (linking sections to specific evidence items)
- `report_chat_threads` / `report_chat_messages` tables (interactive report chat)
- NLP-based sentiment classification on post/comment content
- Interview-informed report sections
- Export to PDF
- Share via link

### Compare system (updated 2026-04-14)
- **Evidence-backed**: compare_service reads `build_evidence_bundle()` from BOTH simulations' SQLite DBs
- **Evidence in prompt**: event counts, top posts (quoted), agent activity, belief indicators, interaction matrix — for both runs side-by-side
- **Output structure**: `evidence_quality` (full/partial/config_only), `metric_comparison` with real counts, each `key_difference` tagged with `evidence_type` (metric/behavioral/inferred)
- **Tested**: two 2-agent OASIS runs compared → evidence_quality=full, winner determined from real data, 6 differences citing real agents
