# MIROFISH_PATTERN_MATRIX.md

## Purpose

This document defines exactly which patterns, services, and UX ideas Raktio should adopt from MiroFish, which ones must be adapted, and which ones should not be copied directly.

Raktio is **not** a clone of MiroFish.  
Raktio is **OASIS-first** and uses MiroFish selectively as an orchestration, graph-memory, reporting, and workflow-pattern reference.

---

## Decision rule

For every relevant MiroFish element, one of these statuses applies:

- **Adopt as pattern** — keep the concept, adapt implementation to Raktio
- **Adapt heavily** — useful idea, but needs structural redesign
- **Do not copy directly** — reference only, not part of Raktio product design

---

## Role of MiroFish inside Raktio

### MiroFish contributes
- ontology extraction patterns
- simulation configuration generation patterns
- rich profile generation patterns
- file-based interview IPC patterns
- graph-memory update patterns
- progressive report generation patterns
- workflow and observability patterns

### MiroFish does not replace
- OASIS runtime
- Raktio product UX
- Raktio persistent population model
- Raktio SaaS/backend architecture
- Raktio admin/billing/team systems

---

## Pattern matrix

| MiroFish pattern / module | Source area | Status | Why it matters | How Raktio uses it | Product impact | Backend impact |
|---|---|---:|---|---|---|---|
| Ontology extraction from documents | `backend/app/services/ontology_generator.py` | **Adopt as pattern** | Converts unstructured input into structured simulation context | Use as the basis for brief understanding, domain entities, relevant concepts, and topic extraction | Makes the planner feel intelligent and grounded | Requires ingestion pipeline and structured extraction output |
| Graph-building from extracted entities | `graph_builder.py` | **Adapt heavily** | Useful for context graphs and semantic memory, but Raktio must not become graph-first at the expense of simulation-first | Use selectively for knowledge context, source linkage, and report tools | Supports trust and explainability | Requires graph service abstraction, not necessarily MiroFish’s exact setup |
| Zep entity reading / entity filters | `zep_entity_reader.py` | **Adopt as pattern** | Helpful for selecting entity-driven audiences or interpreting uploaded materials | Use in source analysis, audience reasoning, and report drill-downs | Helps enterprise trust and source-aware insights | Requires source-to-entity mapping |
| Oasis profile generation from source entities | `oasis_profile_generator.py` | **Adopt as pattern** | Strong bridge from knowledge extraction to audience generation | Use as one input path for synthetic audience creation when uploaded data or research documents are used | Makes audiences feel derived rather than arbitrary | Requires integration with persistent agent pool rules |
| LLM-generated simulation config | `simulation_config_generator.py` | **Adopt as pattern** | One of the most valuable patterns: transforms a brief into runnable simulation parameters | Use as the AI planner layer for agent count, geography mix, platform selection, stances, and time profile | Reduces setup complexity and increases perceived intelligence | Requires planner service and config schema |
| Temporal activity multipliers | `simulation_config_generator.py` and related config | **Adopt as pattern** | Simulations feel more human when activity rises and falls realistically | Use for daypart behavior, wake/sleep cycles, peak hours, and social rhythm | Makes the world feel alive | Requires mapping into OASIS config/runtime orchestration |
| Agent stances | generated config | **Adopt as pattern** | Excellent simple layer for directional behavior | Use as baseline behavioral posture: supportive, opposing, neutral, observer | Great for scenario diversity and setup transparency | Must be extended later into richer behavior archetypes |
| Rich generated agent profiles | generated OASIS profiles | **Adopt as pattern** | Strong fit with Agent Atlas and persistent synthetic users | Use to enrich persistent agent identities with biography, profession, interests, region, stance, and psychographic traits | Increases realism and trust | Requires persistent storage and lifecycle management |
| File-based interview IPC | `simulation_ipc.py` | **Adopt as pattern** | Simple, pragmatic way to query live agents during a running simulation | Use for Interview Agent and Ask the Crowd operations | Major premium feature | Requires command/response orchestration and timeout handling |
| Batch interview command model | `simulation_ipc.py` | **Adopt as pattern** | Very useful for mass questioning or segment-level qualitative probes | Use for Ask the Crowd and segment interview workflows | Strong differentiator | Requires scalable orchestration and batching |
| Simulation runner / subprocess monitoring | `simulation_runner.py` | **Adopt as pattern** | Shows how to wrap simulations as controlled jobs | Use as inspiration for Raktio run orchestration and monitoring | Enables active run management | Requires FastAPI/worker integration and job state management |
| Simulation manager CRUD/state | `simulation_manager.py` | **Adopt as pattern** | Good reference for simulation lifecycle tracking | Use for run states: draft, bootstrapping, running, paused, completed, failed | Improves reliability and observability | Requires product-level simulation registry |
| JSONL action streaming | `action_logger.py`, runner pattern | **Adopt as pattern** | Ideal for real-time feed, replay, debugging, and analytics | Use as live event stream source or normalized stream format | Supports rich Simulation Canvas and replay | Requires event bridge from OASIS trace/stream into UI transport |
| Graph memory update from actions | `zep_graph_memory_updater.py` | **Adopt as pattern** | Very important conceptual bridge: actions become semantic episodes/memory | Use to convert simulation actions into persistent agent memory and source-linked graph knowledge | Enables memory continuity and explainability | Requires memory/event transformation layer |
| Textual episodic representation of actions | `zep_graph_memory_updater.py` | **Adopt as pattern** | Useful for readable memory timelines and agent history | Use for Agent Atlas memory timeline and evidence extraction | Improves human readability and trust | Requires event-to-episode templates |
| Quick semantic search tools | `zep_tools.py` / QuickSearch | **Adopt as pattern** | Helpful for post-run report exploration and product chat over results | Use inside report chat and analyst tools | Adds depth to post-run exploration | Requires unified search/index layer |
| Panorama / full graph context search | `zep_tools.py` / PanoramaSearch | **Adopt as pattern** | Strong for enterprise and full-context analysis | Use for high-level report context and global narrative detection | Useful for premium reporting | Requires broader graph/search backend |
| Insight decomposition tool pattern | `zep_tools.py` / InsightForge | **Adopt as pattern** | Valuable for decomposing broad questions into analyzable sub-questions | Use in report generation and report chat reasoning | Improves quality of insights | Requires report-agent orchestration |
| Interview as report tool | `zep_tools.py` / Interview | **Adopt as pattern** | Excellent bridge between quant and qual | Use in report workflows when the system wants to probe selected agents or clusters | Strong enterprise differentiation | Requires linking report agent to live/persisted interview system |
| ReAct-style report loop | `report_agent.py` | **Adopt as pattern** | Very strong reporting structure; avoids shallow one-shot report generation | Use for progressive, evidence-backed report writing | Greatly strengthens perceived quality | Requires tool orchestration and report state persistence |
| Progressive section rendering | `Step4Report.vue` and report pipeline | **Adopt as pattern** | Makes long analysis feel alive and premium | Use for section-by-section report generation and partial visibility | Better UX and transparency | Requires section state tracking |
| Report workflow log UI | `Step4Report.vue` | **Adapt heavily** | Useful concept, but Raktio needs cleaner enterprise UX than a research-lab feel | Use as controlled “analysis trace” view, not raw technical workflow dump | Supports trust without clutter | Requires curated UI layer |
| Step-based wizard flow | `Step1GraphBuild.vue`, `Step2EnvSetup.vue`, etc. | **Adapt heavily** | The workflow idea is good, but the literal multi-step lab UX should not dominate Raktio | Use some setup flow logic in New Simulation, but keep Raktio product-grade and less academic | Keeps onboarding strong | Avoid hard-coding product around a lab wizard |
| Graph panel / force graph | `GraphPanel.vue` | **Adopt as pattern** | Strong foundation for relation and faction visualization | Use as conceptual basis for Raktio Network mode, but redesign visually and functionally | Simulation Canvas becomes much richer | Requires graph data pipeline and interaction model |
| Detailed node/edge inspect panels | `GraphPanel.vue` | **Adopt as pattern** | Useful for drilling into relationships, episodes, labels, and facts | Use in Graph Explorer and Agent/Relation side panels | Increases analytical depth | Requires unified node/edge metadata model |
| Live feed simulation page structure | `Step3Simulation.vue` | **Adapt heavily** | Useful proof that live simulation UX works, but Raktio must go beyond a polling lab page | Use as inspiration for a richer Simulation Canvas with feed + metrics + network + geo | Strong runtime UX | Requires higher-end front-end architecture |
| History/project storage view | `HistoryDatabase.vue` | **Adopt as pattern** | Raktio needs historical simulation management | Use as basis for simulation history and saved runs | Supports reuse and comparison | Requires simulation history persistence |
| Language switch / locale context | `LanguageSwitcher.vue`, `locale.py` | **Adopt as pattern** | Important for multi-country product direction | Use for locale-aware UI and agent/report language behavior | Supports internationalization | Requires locale management across stack |
| PDF/MD/TXT parsing utilities | `file_parser.py`, `text_processor.py` | **Adopt as pattern** | Very useful for brief ingestion and source upload workflows | Use for source ingestion in Raktio | Important for enterprise inputs | Requires upload pipeline and safe parsing |
| Chunking strategy for uploaded text | `text_processor.py` | **Adopt as pattern** | Necessary for large uploaded materials and semantic processing | Use in ingestion and source indexing | Improves large-input support | Requires chunking/index service |
| MiroFish exact frontend design | Vue step UIs | **Do not copy directly** | Too research-lab / workflow-demo oriented for Raktio’s product ambition | Use only for inspiration | Protects Raktio brand and UX clarity | No direct adoption |
| MiroFish exact backend topology | current project architecture | **Do not copy directly** | Raktio needs a cleaner SaaS/product backend with OASIS-first runtime boundaries | Use only for design references | Keeps architecture coherent | Must redesign around Raktio product needs |
| MiroFish as primary engine | overall project | **Do not copy directly** | MiroFish is not the core social runtime | OASIS remains the runtime | Critical architectural clarity | Prevents wrong engine ownership |

---

## Product-critical conclusions

### 1. The best thing MiroFish offers is not its UI — it is its orchestration patterns
The highest-value reusable patterns are:
- ontology extraction
- config generation
- graph memory updates
- file-based interview IPC
- progressive reports
- search/report tools

### 2. MiroFish is especially valuable before and after the simulation
OASIS dominates the runtime.  
MiroFish-style patterns are most valuable in:
- setup/planning
- source understanding
- post-run reporting
- memory indexing
- qualitative probing

### 3. The workflow concept is useful, but the product feel must change
Raktio should not feel like a lab notebook with rigid steps.  
It should feel like a polished intelligence platform with:
- strong simulation entry flow
- powerful live canvas
- premium report and compare workflows

### 4. Graph memory is one of the most important ideas to preserve
The notion that actions become semantic episodes is essential for:
- persistent agent memory
- evidence-backed reports
- memory timeline in Agent Atlas
- source-linked explainability

### 5. Raktio must not become graph-first at the expense of simulation-first
Graphs are valuable, but they support the product.  
They must not overshadow the social simulation engine itself.

---

## What must not happen

Raktio must **not**:
- clone MiroFish’s Vue UI structure literally
- move the center of gravity away from OASIS runtime
- become a graph/ontology lab instead of a simulation product
- expose raw workflow logs as the default user experience
- rely on MiroFish-specific assumptions where Raktio needs product-grade SaaS boundaries

---

## Engineering implication summary

### Adopt from MiroFish
- ontology extraction patterns
- source parsing/chunking patterns
- simulation config generation patterns
- temporal activity profile patterns
- rich profile generation patterns
- interview IPC patterns
- graph-memory update patterns
- report tool patterns
- progressive report rendering patterns
- graph inspection patterns

### Redesign for Raktio
- all primary product UX
- Simulation Canvas
- global persistent agent system
- SaaS multi-tenant backend
- billing, credits, governance, admin
- enterprise controls
- product information architecture

---

## Final rule for Claude

**Borrow selective orchestration, configuration, graph-memory, reporting, and workflow patterns from MiroFish, but do not clone MiroFish’s architecture or UI wholesale. Raktio remains OASIS-first, simulation-first, and product-first.**
