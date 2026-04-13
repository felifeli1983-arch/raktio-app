# Raktio — Project Definition

## 1. Executive Summary

Raktio is a social perception and reaction simulation platform built on top of the OASIS simulation engine, with selected orchestration, graph-memory, reporting, and UX patterns adapted from MiroFish.

Raktio is not a chatbot, not a static persona generator, and not a simple "AI comments" tool. It is a product layer that turns an existing simulation runtime into a sellable SaaS platform for testing how synthetic but persistent populations react to ideas, content, messages, products, campaigns, narratives, and scenarios.

The product takes a brief, generates or selects the right synthetic audience, runs a live social simulation, lets the user observe the system in real time, and then produces actionable insights, comparisons, and recommendations.

Its core promise is:

> Before you publish, launch, announce, defend, or decide, simulate how a realistic social audience could react.

---

## 2. Product Positioning

### Raktio is:
- A synthetic audience simulation platform
- A social reaction engine
- A perception stress-testing system
- A scenario intelligence product
- A decision-support tool for communication, marketing, product, PR, media, and selected legal-strategy workflows

### Raktio is not:
- A generic multi-agent chat app
- A social media scheduler
- A sentiment dashboard over real social data
- A guarantee or oracle of real-world outcomes
- A substitute for legal truth, official polling, or scientific evidence

### Core framing
Raktio provides **plausible reaction simulation**, not certainty. It helps surface hidden objections, risks, opportunity signals, cluster dynamics, and audience splits before real-world action is taken.

---

## 3. Core Product Thesis

The core insight behind Raktio is that current LLM usage usually gives users one intelligent answer, while many real decisions require understanding many possible reactions.

Users often ask ChatGPT, Claude, or Gemini:
- “What do you think of this post?”
- “Is this idea good?”
- “Would this campaign work?”
- “How can I improve this message?”

These systems give one answer. Raktio is designed to show a **social system reacting**, including:
- support
- skepticism
- polarization
- contagion
- amplification
- silence
- backlash
- conversion
- regional variation
- platform variation

This is the key product difference.

---

## 4. Architectural Principle

### Raktio is OASIS-first
Raktio must remain **OASIS-powered at its core**.

This means:
- OASIS is the primary simulation runtime
- MiroFish is a source of selected orchestration, graph-memory, reporting, and UX patterns
- Raktio is the SaaS product layer that wraps the engine into a usable, persistent, scalable, and sellable product

### Official layer split

#### Layer 1 — OASIS Runtime
Responsible for:
- simulation stepping
- social actions
- social platform state
- recommendation/exposure logic
- per-run SQLite data
- trace logging
- interviews/manual actions
- time simulation
- group primitives

#### Layer 2 — MiroFish-inspired Intelligence Layer
Responsible for:
- ontology extraction patterns
- simulation configuration generation
- temporal activity patterns
- richer agent profiling patterns
- graph-memory update patterns
- report-agent patterns
- progressive report rendering patterns
- interview file-based IPC pattern where appropriate

#### Layer 3 — Raktio Product Layer
Responsible for:
- brief ingestion
- audience planning
- persistent agent pool
- identity system
- simulation launch UX
- Simulation Canvas
- reports and compare flows
- billing and credits
- admin and governance
- memory continuity across simulations
- marketable enterprise-grade UX

---

## 5. What Raktio Uses from OASIS

Raktio must use OASIS as a real simulation engine, not as a fake content generator.

### OASIS responsibilities to retain
- `env.step()` and simulation loop
- `Platform` as the social backend runtime
- social actions and event execution
- recommendation systems
- per-run SQLite database
- trace/event logging
- SocialAgent action logic
- interview/manual-action capabilities
- time/clock simulation
- social search/follow/mute/report primitives
- group support primitives

### Key OASIS product value
The value is not just that agents can produce posts. The value is that they:
- see different content
- react to exposure
- influence each other
- escalate or calm trends
- form factions
- follow and mute others
- search, quote, repost, and reshape discourse
- generate a traceable social system, not isolated completions

---

## 6. What Raktio Borrows from MiroFish

Raktio should selectively adapt the best patterns from MiroFish.

### Patterns to adopt/adapt
- ontology extraction from documents and briefs
- profile generation patterns for richer agent setup
- simulation configuration generation via LLM
- temporal activity multipliers
- stance patterns
- JSONL/action streaming pattern
- report-agent pattern with tool-assisted analysis
- progressive section rendering in reports
- interview IPC pattern
- graph-memory updater concept
- interactive report/chat concept

### What not to do
- Do not clone MiroFish UI literally
- Do not treat MiroFish as the primary simulation runtime
- Do not import unnecessary academic/lab complexity into the core user product

---

## 7. Product Scope

Raktio is being designed as a **complete platform**, not as a deliberately reduced MVP.

This does not mean every module must be implemented in the first coding pass, but it does mean:
- the product should be documented as a full system
- architectural decisions should assume the full platform
- no false “toy MVP” assumptions should shape the structure

The platform should be planned in complete form, with internal build priorities rather than artificial scope reduction.

---

## 8. Primary Product Experience

The core experience is not a dashboard. It is the **Simulation Canvas**.

### Simulation Canvas is the heart of Raktio
It must let the user observe the synthetic social world in multiple modes:
- Feed
- Network
- Timeline
- Geo
- Segments
- Compare

The user should feel they are observing a living social system, not reading a scroll of fake posts.

### Product ideal
Users should be able to:
1. enter a brief
2. get an AI-assisted audience and simulation plan
3. launch the simulation
4. watch the world react in real time
5. inspect shifts, factions, and influence paths
6. interview individual agents or groups
7. review final insights and recommendations
8. create a variant and rerun
9. compare results side by side

This iteration loop is central to retention and product value.

---

## 9. Agent Philosophy

Agents are not disposable run-time shells.

They are persistent synthetic social users who populate the Raktio world over time.

### Agent principles
- each agent has a stable identity
- each agent has a unique username
- each agent has a persistent avatar derived from username
- each agent has realistic geographic identity
- each agent has psychographic and platform behavior traits
- agents can be reused across simulations
- new agents are generated only when needed
- the global pool grows over time

### Identity rules
Each agent should have:
- global unique username
- display name
- first name
- last name
- persistent profile
- stable avatar seed
- geographic attributes
- demographic attributes
- psychographic attributes
- platform presence profile
- simulation history
- long-term memory references

### Avatar policy
Raktio uses DiceBear API with the `notionists` style.
Each avatar is generated deterministically from the agent’s username seed.
No avatar images are stored in the database.

Example pattern:
`https://api.dicebear.com/9.x/notionists/svg?seed=<username>`

### Identity generation policy
Raktio should use a hybrid identity generation model:
- realistic country-specific distributions for names and locations
- synthetic combination of identity traits
- LLM-generated enrichment for bio/persona/behavior
- no direct representation of real people

---

## 10. Global Agent Pool

Raktio should maintain a **Global Persistent Pool** of agents.

### Rules
- agents persist across simulations
- simulations draw from the pool when possible
- new agents are generated when segments, geographies, or archetypes are insufficiently covered
- private or client-specific audiences may exist alongside the global pool
- simulation runtime state must remain distinct from global identity state

### Important distinction
Raktio must separate:
- **persistent global identity**
from
- **simulation-specific participation/state**

An agent is who they are globally.
A simulation captures what they did in a specific run.

---

## 11. Multi-Platform Model

### Official decision
Raktio uses **Multi-Platform Model 1**.

This means:
- one population
- one simulation world
- one synthetic person can exist across multiple platforms
- behavior varies by platform
- not all agents must be present everywhere

### Platform logic
An agent may:
- be present on X but absent from LinkedIn
- be highly active on TikTok but low-frequency on Reddit
- use different tone and posting style per platform
- exhibit different behavioral tendencies depending on platform norms

### Supported platform direction
OASIS is naturally closest to X/Twitter and Reddit.
Raktio extends the product to support:
- X
- Reddit
- Instagram
- TikTok
- LinkedIn

These should be implemented as deeper behavioral and rendering layers, not just visual skins.

---

## 12. Geography Model

Raktio must support **multi-level geography**.

### Geographic depth rule
If a simulation covers multiple countries, geo view starts at country level.
If a simulation covers a single country, geo view must drill down into internal territorial layers so the geo experience remains dynamic and analytically useful.

### Geography tiers

#### Tier 1 — deep support
Initial key countries:
- Italy
- France
- Germany
- Spain
- United Kingdom
- USA

Support:
- country
- regions/states
- provinces/counties where relevant
- major cities
- strong drill-down

#### Tier 2 — medium support
Support:
- country
- major regions
- major cities

#### Tier 3 — base support
Support:
- country
- possibly macro areas only

### Europe priority
Raktio should support strong European simulation coverage including at least:
- Italy
- France
- Germany
- Spain
- United Kingdom
- Netherlands
- Belgium
- Portugal

The user can choose geography, the AI planner suggests distribution, and the user can override it manually.

---

## 13. Simulation Time Model

### Official preset durations
Raktio supports these simulation durations:
- 6h
- 12h
- 24h
- 48h
- 72h

These are simulated-world durations, not promised real-world completion times.

### Time principle
The product must distinguish clearly between:
- simulated time
- real elapsed runtime

The product promise is not “full report in five minutes.”
The product promise is that users begin seeing the synthetic world become active after setup, then observe the simulation evolve.

### Pricing weight
Time has **medium weight** in credit consumption.
It matters, but less than total audience size.

---

## 14. Scale Tiers

Raktio should not be architecturally limited to small runs.

### Official scale tiers
- **Standard self-serve:** up to 10,000 agents
- **Top scale/business plan:** up to 50,000 agents
- **Enterprise:** beyond 50,000 agents
- **Super Enterprise / Hyperscale:** custom-managed very large runs up to OASIS-supported high-scale limits

This means Raktio must not be mentally designed as a 5k-only product.

At the same time, hyperscale is not a casual default setting for everyone. It belongs to managed enterprise conditions.

---

## 15. Pricing Philosophy

Raktio uses a **subscription + credits + add-ons** model.

### Credits are consumed by:
- audience size
- simulated time
- platform count
- geography scope
- modular add-ons

### Relative weight
Recommended cost impact order:
- audience size = strong
- platform count = medium-strong
- simulated time = medium
- geography scope = light-medium
- add-ons = modular

### Subscription logic
- monthly subscription includes credits
- higher plans include more credits and modest bonus credits
- annual plans offer savings
- users can buy additional credit packs
- users can upgrade when credits run out

### Enterprise logic
- standard plans = self-serve
- top plan can go up to 50k agents
- enterprise and super enterprise handled through contact/sales/custom orchestration

---

## 16. Explainability and Credibility

Raktio must not present itself as magic or certainty.

It should include an **Explainability / Confidence Layer**.

### Users should be able to see:
- why the planner suggested a given audience
- why that geography was chosen
- why that number of agents was suggested
- why certain platforms were recommended
- confidence notes / robustness notes where appropriate

### Credibility framing
Raktio simulates plausible audience and social reaction scenarios.
It does not claim certainty or ground truth.

This layer is important for trust, especially in higher-value business and enterprise contexts.

---

## 17. Core User Types

Raktio can theoretically be used in many domains, but its strongest early-value buyer groups are:
- marketing and brand teams
- founders and product marketers
- PR and crisis communication teams
- agencies
- content/social teams
- media and entertainment teams
- internal communications / HR change teams
- selected legal strategy workflows

Additional secondary users may include:
- chefs / restaurateurs
- sports business decision-makers
- event organizers
- publishers/journalists
- real estate / urban projects
- NGOs / advocacy groups

Raktio should be documented broadly enough to support multiple use cases, but messaging should remain commercially focused and credible.

---

## 18. Core Product Flows

The system revolves around these main flows:

### Flow A — New simulation
Brief → AI understanding → audience suggestion → config → launch

### Flow B — Live simulation
Setup → live feed/world activation → observe/inspect/interview → monitor metrics

### Flow C — Report
Completed run → summary → findings → recommendations → evidence → chat with report

### Flow D — Iterate
Clone → modify → relaunch → compare

### Flow E — Audience reuse
Save segment → reuse segment → compare across audiences

### Flow F — Agent exploration
Open agent profile → inspect history and memory → interview

---

## 19. UI / UX Direction

Raktio should look enterprise-grade, but not like a military terminal for its own sake.

### Desired visual feel
- clean
- dense but readable
- product-grade
- modern SaaS quality
- simulation-first
- social-world-live feel
- high information clarity

### Avoid
- generic empty dashboards
- over-gamified visuals
- fake futuristic clutter
- academic prototype styling
- endless walls of logs without hierarchy

### Principle
The “wow” should come from:
- observing a living system
- seeing causality and spread
- understanding who influenced what
- seeing belief shifts and cluster formation
- comparing worlds and outcomes

not from gratuitous effects.

---

## 20. Key Product Modules

The full platform should include at least:
- Overview
- New Simulation
- Active Simulations
- Simulation Canvas
- Reports
- Compare Lab
- Audience Studio
- Agent Atlas
- Knowledge & Sources
- Credits & Billing
- Team & Governance
- Admin controls

These modules may be implemented in phases, but the architecture and docs should assume the complete platform.

---

## 21. Raktio’s True Product Goal

The goal is not merely to let users watch many AI agents talk.

The goal is to let users:
- test ideas before real exposure
- detect objections they did not foresee
- observe how discourse spreads and mutates
- understand which segments split, convert, or reject
- improve content or strategy iteratively
- treat synthetic populations as reusable intelligence assets over time

If Raktio delivers that, it becomes a real product category rather than a novelty.

---

## 22. Final Product Definition

Raktio is a sellable SaaS wrapper around a real social simulation engine.

The power already exists in the engine layer. The work is to build the marketable shell, persistent identity layer, orchestration, experience, reporting, and operating model around it.

### Final one-line definition
Raktio is an OASIS-powered social reaction simulation platform with persistent synthetic agents, multi-platform behavioral modeling, real-time observation, and actionable intelligence workflows for testing perception before real-world decisions.
