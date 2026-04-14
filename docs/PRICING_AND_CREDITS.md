# PRICING_AND_CREDITS.md

## Purpose

This document defines the commercial model of Raktio:
- subscription plans
- included credits
- bonus credits
- annual discount logic
- credit packs
- progressive credit consumption
- self-serve vs enterprise scale limits
- simulation cost drivers
- pricing transparency rules

Raktio should not price users on raw token logic.  
It should price them on a clear, controllable simulation-credit system tied to the real drivers of computational and product value.

---

## Core pricing rule

**Users buy simulation capability, not tokens.**

Raktio does not sell:
- raw LLM usage
- invisible meter-based charges
- arbitrary credit drain

Raktio sells:
- simulation scale
- simulation duration
- platform breadth
- geography breadth
- insight depth
- interactive investigation tools

Credits are the product abstraction that makes usage understandable and scalable.

---

## Business model

Raktio uses a hybrid commercial model:

1. **Subscription plans**
2. **Included monthly credits**
3. **Moderate bonus credits on higher plans**
4. **Optional annual discount**
5. **Optional extra credit packs**
6. **Enterprise custom pricing for large-scale/custom needs**

---

## Strategic commercial principles

### 1. Credits must feel understandable
Users should always know:
- why a run costs what it costs
- what increases or decreases cost
- what their current plan includes
- what happens when they run out

### 2. Cost should map to real simulation drivers
Credits should be driven by:
- agent count
- simulated time
- number of platforms
- geography scope
- add-ons

### 3. Agent count is the strongest pricing lever
Agent count is the most important cost driver and should carry the greatest pricing weight.

### 4. Geography should matter, but less than agents
Adding geographies should increase value and some cost, but not dominate pricing if the population size remains fixed.

### 5. Time should matter meaningfully
Longer simulated time increases runtime complexity and insight depth, but should not outweigh population size.

### 6. Higher plans should get better economics, but not absurd giveaways
Bonus credits should reward upgrades without destroying margin discipline.

---

## Pricing stack structure

The pricing stack has four layers:

### Layer 1 — Plan access
Defines:
- monthly/annual subscription
- included credits
- feature access
- maximum self-serve scale tier

### Layer 2 — Credit consumption
Defines how simulations and add-ons consume credits.

### Layer 3 — Credit packs
Allows users to buy more credits without changing their plan.

### Layer 4 — Enterprise custom
Applies when needs exceed self-serve or require custom governance/compute.

---

## Recommended plan structure

### Plan 1 — Starter
Best for:
- creators
- solo users
- small tests
- exploratory usage

### Plan 2 — Growth
Best for:
- startups
- marketers
- consultants
- frequent individual/professional use

### Plan 3 — Business
Best for:
- teams
- agencies
- product/PR groups
- heavier simulation use

### Plan 4 — Scale
Best for:
- advanced teams
- larger simulations
- more serious recurring usage
- high-end self-serve

### Enterprise
Custom-managed

### Super Enterprise / Hyperscale
Custom-managed

---

## Recommended plan framework

## Starter
- monthly price: entry-level
- included credits: modest
- best for small and medium runs
- self-serve scale cap: lower tier
- suitable for up to smaller simulation ranges

## Growth
- more credits
- stronger economics per credit
- more features unlocked
- self-serve scale cap: stronger than Starter

## Business
- stronger credit bundle
- compare and richer workflows unlocked
- higher self-serve complexity tolerance
- higher self-serve scale cap

## Scale
- highest self-serve plan
- largest included credits
- modest bonus credits
- can run up to **50k agents**
- intended for advanced but still self-serve users

## Enterprise
- custom contracts
- custom credit terms or usage models
- governance/workspace needs
- 50k+ range or custom complexity
- optional managed support

## Super Enterprise / Hyperscale
- custom-managed at very large scale
- architecture/compute aligned with high-end OASIS usage patterns

---

## Scale tiers and plan access

### Standard self-serve
Up to **10,000 agents**

This should be reachable across upper normal plans depending on credits.

### Top self-serve / Scale plan
Up to **50,000 agents**

This is the highest normal self-serve scale tier.

### Enterprise
Above **50,000 agents**
or any configuration requiring:
- private populations
- advanced governance
- custom support
- custom compute policy
- special compliance/reporting needs

### Super Enterprise / Hyperscale
Very high scale, managed only.

---

## Annual discount logic

Raktio should offer a visible annual discount.

### Recommendation
Annual billing should:
- reduce price vs monthly
- improve retention
- feel meaningful but not desperate

### Suggested policy
- around **15% to 20%** effective annual savings
- annual plan may also include a small extra credit bonus

### Example logic
If monthly is paid 12 times, annual can:
- cost less overall
- include one extra month equivalent of credits or a modest bonus pool

---

## Bonus credit policy

Bonus credits should scale with plan level, but stay moderate.

### Good bonus behavior
- Starter: no or tiny bonus
- Growth: small bonus
- Business: moderate bonus
- Scale: meaningful but controlled bonus

### Important
Do not make bonus credits so aggressive that the pricing becomes unsustainable.

---

## Credit pack policy

Users who run out of credits must be able to:
- buy extra packs
- or upgrade their plan

### This is essential for:
- frictionless continued usage
- avoiding dead ends in the product
- letting occasional heavy users stay self-serve

### Pack design rule
Packs should offer:
- clear value
- increasing efficiency at larger sizes
- no confusing hidden conditions

---

## Credit consumption model

Raktio credit consumption is based on:

### 1. Agent count
Strongest driver

### 2. Simulated time
Medium driver

### 3. Platform count
Medium-strong driver

### 4. Geography scope
Light-medium driver

### 5. Add-ons
Modular driver

### Formula concept
Credits consumed =
**population factor + time factor + platform factor + geography factor + add-ons**

This should be implemented as a progressive pricing function, not rigid fixed bundles only.

---

## Agent count pricing model

### Core rule
Users can choose exact agent counts manually.

The system should:
- allow free numeric input
- show slider/reference presets
- compute credits progressively

### Avoid
Hard cliffs such as:
- 250 agents = 8 credits
- 251 agents = 12 credits

### Preferred approach
A progressive or semi-progressive pricing function with smooth increases.

### Example reference bands (for UX only)
- 100 = small sample
- 250 = focused sample
- 500 = balanced sample
- 1,000 = strong validation
- 2,500 = advanced analysis
- 5,000 = high-scale
- 10,000 = upper standard self-serve
- 50,000 = Scale-tier extreme

These are reference points, not rigid bundles.

---

## Simulated time pricing model

### Supported presets
- 6h
- 12h
- 24h
- 48h
- 72h

### Weight
Time has a **medium** pricing weight.

### Interpretation
Longer simulations provide:
- more realistic social evolution
- more spread opportunities
- more belief shifts
- more trend emergence
- more signal richness

Therefore time should increase credits, but less than agent count.

---

## Geography pricing model

### Rule
Geography should add value and moderate complexity, but should not behave like a dominant multiplier when agent count remains fixed.

### Geography scope types
- single-country
- regional multi-country
- multi-region/global

### Pricing implication
- single-country = lowest geo factor
- multi-country regional = moderate geo factor
- multi-region/global = higher geo factor
- deep local drill-down in Tier 1 geographies can influence value, but should still remain secondary to agent count

---

## Platform pricing model

### Rule
Each additional platform adds meaningful value and simulation complexity.

### Why platform count matters
- same population behaves differently by platform
- platform-specific rendering/analysis matters
- cross-platform compare is valuable
- report complexity increases

### Platform count should have stronger cost weight than geography
Recommended relative ranking:
- agents > platforms > time > geography

---

## Add-on pricing model

Add-ons should consume credits separately where relevant.

### Candidate add-ons
- interview one agent
- batch interview
- ask the crowd
- compare A/B
- report premium depth
- private audience creation/use
- premium exports
- advanced replay or evidence bundles (optional later)

### Important
Add-ons should be modular and explicit.

---

## Example credit drivers

### Core run
- agent count
- simulated duration
- geography
- platform mix

### Optional extras
- report premium
- compare mode
- interviews
- ask the crowd
- private audience

---

## Suggested pricing shape (conceptual)

### Small run
- smaller population
- 1 geography
- 1 platform
- short time

Should feel accessible.

### Medium run
- meaningful population
- maybe 2 platforms
- 1–2 geographies
- moderate duration

Should feel like a serious but still reachable professional expense.

### Large run
- bigger population
- multiple platforms
- broader geography
- longer duration
- optional compare/report extras

Should feel premium but justified.

---

## Suggested plan philosophy

### Starter
- designed for early repeated use
- enough credits to run meaningful but not massive simulations
- keeps price barrier low

### Growth
- best candidate for startup and solo pro users
- enough credits for repeated serious tests
- more attractive economics

### Business
- intended for teams and frequent use
- stronger compare/report workflows
- stronger monthly credit budget

### Scale
- premium self-serve
- can reach 50k agent runs
- significantly larger monthly allowance
- still not an enterprise custom contract

---

## Upgrade and depletion logic

When a user runs low or out of credits, the product should offer two clear paths:

### Option A — Buy more credits
Good for:
- occasional spike
- not ready to upgrade plan
- temporary demand

### Option B — Upgrade plan
Good for:
- frequent usage
- need for more included credits
- better credit economics
- unlocking more features / scale tiers

### UX rule
Do not trap the user in a vague “out of credits” dead end.

---

## Simulation launch billing logic

Before launching a simulation, the backend should:

1. estimate credits
2. validate user entitlement/plan
3. validate available balance
4. reserve credits
5. launch only if allowed
6. finalize actual consumption as the run lifecycle proceeds

### Why reservation matters
It prevents:
- oversubscription
- inconsistent billing state
- mid-run ambiguity

---

## Credit ledger rule

Credit accounting should be ledger-based.

### Every meaningful event should be recorded
- plan allocation
- bonus allocation
- annual bonus
- pack purchase
- simulation reservation
- simulation finalization
- refund/correction
- admin adjustment

### Important
Do not rely only on a mutable balance number.

---

## Enterprise pricing logic

Enterprise pricing should not just be “more credits”.

It may include:
- custom credit terms
- committed volume
- annual contracts
- managed simulation support
- private audience features
- governance features
- special scale access
- custom reporting/export options

### Trigger conditions
Enterprise/custom route should activate when:
- user needs more than 50k-agent self-serve scale
- governance/team complexity is high
- custom support is needed
- audience privacy/compliance is stricter
- contract-style purchasing is required

---

## Suggested product messaging for pricing

The pricing UI should clearly explain:

### What credits measure
Credits reflect:
- simulation scale
- simulated duration
- platform breadth
- geography breadth
- analytical depth

### Why this is fair
Because users control the real cost drivers of the simulation.

### What subscriptions do
Subscriptions include monthly credits and unlock higher scale/features.

### What packs do
Packs let users continue working without waiting for the next cycle or changing plan immediately.

---

## Transparency rules

Pricing pages and simulation setup must always show:

- estimated credits before launch
- what variables affect the estimate
- current remaining credits
- scale limit based on plan
- upgrade path if a setup exceeds current entitlement
- enterprise prompt if scope goes beyond self-serve

This transparency is critical to trust.

---

## Example commercial page structure

### Section 1 — Plans
Show:
- monthly price
- annual price
- included credits
- bonus credits
- scale tier
- major features

### Section 2 — Credit packs
Show:
- available packs
- price
- credits
- relative value

### Section 3 — How credits work
Explain:
- agents
- time
- platforms
- geographies
- add-ons

### Section 4 — Enterprise
Show:
- when to contact sales
- what enterprise unlocks
- high-scale/custom/governance benefits

---

## Guardrails

### Avoid
- wildly inflated bonus credits
- confusing price-per-credit math on the main user path
- hard-to-understand hidden multipliers
- inconsistent plan entitlements
- giant jumps that punish tiny changes
- unclear enterprise thresholds

### Prefer
- progressive, understandable pricing
- strong transparency
- smooth upgrade path
- premium but fair positioning

---

## Non-negotiable requirements

The commercial system must support:
- subscriptions
- included monthly credits
- moderate bonus credits
- annual discount
- extra credit packs
- progressive credit consumption
- transparent pre-launch cost estimates
- self-serve scale up to 10k and up to 50k on Scale plan
- enterprise and hyperscale gating

---

## Final rule for Claude

**Design pricing and credits as a transparent simulation-capability system, not as raw token resale. The strongest cost driver is agent count, followed by platform count, simulated time, geography scope, and add-ons. Plans should bundle credits and scale access cleanly, while packs and enterprise paths handle overflow and advanced needs.**


---

## Implementation Status (as of 2026-04-14)

### Plans table
- 5 plans seeded: starter (2500 agents, €49/mo), growth (5000, €149/mo), business (10000, €399/mo), scale (50000, €999/mo), enterprise (custom)
- Fields: plan_id, name, agent_limit, monthly_price, annual_price, included_credits, bonus_credits, is_enterprise, feature_flags

### Credit lifecycle
| Event | Implemented |
|-------|-------------|
| Estimation at draft time | ✓ (agents × duration_multiplier, soft check) |
| Reservation at launch | ✓ (deduct from available, add to reserved, ledger entry) |
| Refund on cancel | ✓ (restore available, reduce reserved, ledger entry) |
| Finalization at completion | NOT YET (Step 7.5G) |
| Pack purchases | NOT YET (Step 8) |
| Plan changes | NOT YET (Step 8) |

### Credit formula
- **Current**: `agents × duration_multiplier` only
- **Missing**: platform_count factor, geography_scope factor, add-on modular pricing
- Full formula per docs: audience_size (strong) + platform_count (medium-strong) + duration (medium) + geography (light-medium) + add-ons (modular)

### Tables
- `credit_balances`: live (per-organization, available + reserved)
- `credit_ledger`: live (append-only, event_type CHECK constraint)
- `plans`: live (with pricing fields from migration 002)
- `subscriptions`: NOT YET CREATED
- `credit_purchases`: NOT YET CREATED

### Credit settlement (updated 2026-04-14, Step 7.5G)
- **Implemented**: `_settle_credits()` in `runtime/oasis_worker.py`
- Full completion: actual_cost = reserved (no refund)
- Partial completion: actual_cost = reserved × (steps_completed / steps_total)
- Failed (0 steps): actual_cost = 0 (full refund)
- Creates `simulation_finalization` ledger entry with actual cost
- Creates `refund` ledger entry if partial refund applies
- Settles reserved→0, adjusts available for any refund
- Updates `simulations.credit_final` to actual cost
- **Tested**: 2-agent 2-step full completion → reserved=1, actual=1, refund=0

### Full credit formula (updated 2026-04-14, Step 8)
- **Implemented**: `billing/credit_rules.py`
- Formula: `agent_count × duration_multiplier × platform_multiplier × geography_multiplier`
- Duration: 6h=0.5, 12h=0.75, 24h=1.0, 48h=1.8, 72h=2.5
- Platform: +20% per additional platform beyond the first
- Geography: +5% per additional country beyond the first
- Examples: 1000a/24h/1p/1c=1000, 1000a/24h/3p=1400, 2000a/48h/2p/2c=4536
- Simulation creation and update both use the full formula
- Add-on modular pricing: NOT YET (deferred)

### Billing API (updated 2026-04-14, Step 8)
- GET /api/billing/balance — credit balance + plan info
- GET /api/billing/usage — ledger entries (usage history)
- POST /api/billing/estimate — estimate cost before launch
- GET /api/billing/plans — list all plans (public)
- NOT YET: pack purchases, plan changes, subscription management
