# DATA_MODEL_AND_STORAGE.md

## Purpose

This document defines the data model and storage architecture of Raktio.

Raktio uses a **split storage model**:

1. **SQLite per run** for OASIS runtime truth
2. **Supabase / Postgres** for persistent product state
3. **Object/file storage** for uploaded materials, exports, and artifacts
4. **Optional semantic/search index layer** for evidence retrieval, report chat, and memory/query workflows

This separation is mandatory.  
Raktio must not collapse runtime state, product state, and file storage into one undifferentiated system.

---

## Core storage rule

**SQLite is the truth of a live run. Postgres is the truth of the product.**

That means:

### SQLite owns
- per-run operational state
- posts/comments/follows/mutes/rec tables for that run
- raw trace origin
- local runtime truth while the simulation is executing

### Postgres owns
- users/orgs/workspaces
- persistent agents
- audiences
- simulation registry
- reports
- compare chains
- billing/credits
- admin/governance
- persistent memory

### Object storage owns
- uploaded files
- derived exports
- snapshots
- long-form report files
- auxiliary artifacts

---

## Storage layers overview

### Layer 1 — Runtime local storage
Per simulation run:
- run config snapshot
- SQLite DB
- runtime logs
- normalized event cache if needed
- temporary artifacts

### Layer 2 — Product persistent database
Shared persistent product state:
- auth-linked entities
- simulation metadata
- persistent synthetic population
- reports and compare metadata
- commercial and governance state

### Layer 3 — File/object storage
Binary or long-form file assets:
- uploaded documents
- uploaded images
- generated report exports
- canvas snapshots
- optional evidence bundles

### Layer 4 — Search/semantic index layer
Optional but strategically important:
- report chat retrieval
- evidence search
- topic/entity lookup
- source exploration
- memory retrieval

---

## Product database domains

The Postgres/Supabase schema should be organized into logical domains:

1. identity and tenancy
2. simulations and runs
3. agents and audiences
4. memory and relationships
5. reports and compare
6. knowledge and sources
7. billing and credits
8. admin and audit

---

# Domain 1 — Identity and tenancy

## 1. users
Represents platform users.

### Suggested fields
- `user_id`
- `email`
- `display_name`
- `created_at`
- `last_seen_at`
- `locale`
- `status`

## 2. organizations
Represents teams, companies, or enterprise tenants.

### Suggested fields
- `organization_id`
- `name`
- `slug`
- `plan_id`
- `billing_status`
- `created_at`
- `status`

## 3. workspaces
Logical workspace under an org or personal scope.

### Suggested fields
- `workspace_id`
- `organization_id` (nullable for personal mode if desired)
- `name`
- `slug`
- `created_at`
- `default_locale`
- `status`

## 4. workspace_memberships
Maps users to workspaces and roles.

### Suggested fields
- `workspace_membership_id`
- `workspace_id`
- `user_id`
- `role`
- `joined_at`
- `status`

## 5. roles / permissions (logical or table-driven)
Needed for:
- simulation access
- audience access
- billing access
- admin access
- enterprise audience isolation

---

# Domain 2 — Simulations and runs

## 6. simulations
Persistent simulation object at product level.

### Suggested fields
- `simulation_id`
- `workspace_id`
- `created_by_user_id`
- `name`
- `goal_type`
- `status`
- `planner_status`
- `run_status`
- `agent_count_requested`
- `agent_count_final`
- `duration_preset`
- `platform_scope`
- `geography_scope`
- `recsys_choice`
- `credit_estimate`
- `credit_final`
- `parent_simulation_id` (for variants)
- `compare_group_id` (optional)
- `created_at`
- `updated_at`

## 7. simulation_configs
Versioned config snapshot.

### Suggested fields
- `simulation_config_id`
- `simulation_id`
- `config_version`
- `planner_recommendation_json`
- `user_override_json`
- `final_runtime_config_json`
- `simulation_fingerprint`
- `created_at`

## 8. simulation_runs
Actual runtime executions.

### Suggested fields
- `run_id`
- `simulation_id`
- `status`
- `runtime_path`
- `sqlite_path`
- `started_at`
- `completed_at`
- `failed_at`
- `failure_reason`
- `simulated_time_completed`
- `runtime_metadata_json`

## 9. simulation_events_index
Optional product-level normalized event index for fast retrieval and replay support.

### Suggested fields
- `simulation_event_id`
- `simulation_id`
- `run_id`
- `event_type`
- `event_time_simulated`
- `event_time_recorded`
- `agent_id`
- `related_agent_id`
- `platform`
- `geography_key`
- `payload_json`
- `importance_score`

### Important note
This is not necessarily the raw runtime truth — it is a normalized product-facing index.

## 10. simulation_bookmarks
User annotations/bookmarks on events or moments.

### Suggested fields
- `simulation_bookmark_id`
- `simulation_id`
- `user_id`
- `bookmark_type`
- `linked_event_id`
- `linked_time_offset`
- `note`
- `created_at`

---

# Domain 3 — Agents and audiences

## 11. agents
Persistent synthetic users.

Core fields are defined in detail in `AGENTS_AUDIENCE_MEMORY.md`, but table exists here as central product entity.

## 12. agent_platform_presence
Platform-specific presence and behavior settings per agent.

## 13. audiences
Saved audience entities.

## 14. audience_memberships
Maps agents into audiences.

## 15. simulation_participations
Run-specific participation state for each agent.

### Suggested fields
- `simulation_participation_id`
- `simulation_id`
- `run_id`
- `agent_id`
- `runtime_agent_ref`
- `runtime_stance`
- `active_platforms_json`
- `local_influence_score`
- `local_activity_score`
- `notable_flag`
- `created_at`

## 16. private_population_scopes
Defines workspace/private population boundaries.

### Suggested fields
- `private_population_scope_id`
- `workspace_id`
- `name`
- `description`
- `visibility_policy`
- `created_at`

## 17. private_population_memberships
Maps private-only or private-scoped agents to private populations if needed.

---

# Domain 4 — Memory and relationships

## 18. agent_memory_summaries
Rolling summary for each persistent agent.

## 19. agent_episodic_memory
Structured semantic episodes.

## 20. agent_relationship_memory
Persistent relationship memory.

## 21. agent_topic_exposure
Topic exposure history.

## 22. memory_update_jobs
Tracks post-run memory update operations.

### Suggested fields
- `memory_update_job_id`
- `simulation_id`
- `run_id`
- `status`
- `started_at`
- `completed_at`
- `updated_agent_count`
- `error_message`

## 23. relationship_edges_index (optional)
A materialized index for fast graph views outside raw runtime DB.

### Suggested fields
- `relationship_edge_id`
- `source_agent_id`
- `target_agent_id`
- `relationship_type`
- `strength`
- `last_seen_at`
- `workspace_scope` (if relevant)
- `simulation_scope` (nullable)

---

# Domain 5 — Reports and compare

## 24. reports
Persistent report object.

### Suggested fields
- `report_id`
- `simulation_id`
- `run_id`
- `status`
- `report_version`
- `summary_json`
- `scorecard_json`
- `confidence_notes`
- `created_at`
- `completed_at`

## 25. report_sections
Progressive section-by-section report storage.

### Suggested fields
- `report_section_id`
- `report_id`
- `section_key`
- `status`
- `content_markdown`
- `structured_json`
- `generated_at`

## 26. report_evidence_links
Maps report findings/sections to evidence.

### Suggested fields
- `report_evidence_link_id`
- `report_id`
- `section_id`
- `evidence_type`
- `linked_event_id`
- `linked_episode_id`
- `linked_agent_id`
- `linked_source_id`
- `importance_score`

## 27. report_chat_threads
Thread metadata for report chat.

## 28. report_chat_messages
Messages exchanged inside report chat.

### Important rule
Report chat must be grounded in the report/evidence layer, not generic chat state.

## 29. compare_groups
Logical grouping of simulations/variants to compare.

## 30. compare_runs
Stores structured compare records.

### Suggested fields
- `compare_id`
- `workspace_id`
- `base_simulation_id`
- `target_simulation_id`
- `compare_type`
- `summary_json`
- `created_at`

## 31. compare_metrics
Structured diff objects if you want normalized compare storage.

---

# Domain 6 — Knowledge and sources

## 32. sources
Represents uploaded source materials or source collections.

### Suggested fields
- `source_id`
- `workspace_id`
- `uploaded_by_user_id`
- `source_type`
- `title`
- `description`
- `storage_path`
- `parse_status`
- `created_at`

## 33. source_files
If one source object contains multiple files.

## 34. source_extractions
Stores extracted summary/entities/topics per source.

### Suggested fields
- `source_extraction_id`
- `source_id`
- `extraction_version`
- `summary_json`
- `entity_json`
- `topic_json`
- `created_at`

## 35. source_links
General linking table between source and:
- simulations
- audiences
- reports
- agents (optional)
- compare contexts

### Why
Important for trust, lineage, and enterprise explainability.

---

# Domain 7 — Billing and credits

## 36. plans
Defines plan catalog.

### Suggested fields
- `plan_id`
- `name`
- `monthly_price`
- `annual_price`
- `included_credits`
- `bonus_credits`
- `agent_limit`
- `feature_flags_json`
- `is_enterprise`
- `created_at`

## 37. subscriptions
Tracks user/org subscriptions.

### Suggested fields
- `subscription_id`
- `organization_id`
- `plan_id`
- `status`
- `billing_period`
- `started_at`
- `renewal_at`
- `canceled_at`

## 38. credit_balances
Current available credits.

### Suggested fields
- `credit_balance_id`
- `organization_id` or `workspace_id`
- `available_credits`
- `reserved_credits`
- `updated_at`

## 39. credit_ledger
Immutable ledger of credit events.

### Suggested fields
- `credit_ledger_id`
- `organization_id`
- `workspace_id`
- `event_type`
- `amount`
- `balance_after`
- `linked_simulation_id`
- `linked_run_id`
- `linked_purchase_id`
- `note`
- `created_at`

## 40. credit_purchases
Credit pack purchases.

## 41. invoices / billing_records
Depending on billing provider integration.

### Important rule
Credit events should be ledger-based and auditable, not just mutable counters.

---

# Domain 8 — Admin and audit

## 42. audit_logs
Tracks sensitive actions.

### Suggested fields
- `audit_log_id`
- `actor_user_id`
- `workspace_id`
- `organization_id`
- `action_type`
- `entity_type`
- `entity_id`
- `metadata_json`
- `created_at`

## 43. tenant_flags
Enterprise or org-level feature flags / controls.

## 44. model_routing_policies
Optional admin table for model selection and cost policies.

## 45. runtime_failure_records
Persistent failure registry for debugging/oversight.

## 46. admin_notes
Optional internal notes linked to tenants, simulations, or failures.

---

## Runtime-local SQLite ownership

The SQLite database created for each simulation run should remain the operational source of truth for the live run.

### OASIS runtime tables include
- users
- posts
- comments
- likes/dislikes
- follows
- mutes
- rec tables
- groups
- traces
- other runtime-native entities

### Rule
Do not mirror every single runtime table 1:1 into Postgres blindly.

### Instead
Promote selected outputs into product persistence through:
- normalized events
- summaries
- memory episodes
- report evidence
- run metadata

This keeps the product database manageable.

---

## Object/file storage model

Use object storage for:

### Uploaded input files
- PDFs
- DOCX
- TXT/MD
- images

### Generated artifacts
- exported reports (PDF)
- compare exports
- saved visual snapshots
- optional replay/export bundles

### File storage metadata should be tracked in Postgres
Never rely on storage paths with no metadata record.

---

## Search / semantic index layer

This can be implemented in different ways, but conceptually it should support:

- report chat retrieval
- source search
- evidence lookup
- topic/entity lookup
- memory retrieval
- compare context retrieval

### Searchable objects may include
- report sections
- evidence items
- agent memory episodes
- source chunks
- important simulation events
- interviews

### Rule
Keep search/index concerns separate from transactional product tables.

---

## Relationship between storage layers

### Product launch flow
Product DB stores:
- simulation record
- config record
- selected audience
- pricing state

Runtime workspace stores:
- run files
- run SQLite DB

### During execution
Runtime writes SQLite and logs  
Product receives normalized events and status

### After completion
Product DB stores:
- run summary
- report
- memory updates
- compare objects
- credit ledger updates

---

## Suggested data access patterns

### Runtime read path
Simulation Canvas should consume:
- normalized event stream
- aggregated metrics
- selected runtime snapshots

Not direct raw SQL over SQLite from the browser.

### Product read path
Pages like:
- Overview
- Reports
- Audience Studio
- Agent Atlas
- Billing
should read from Postgres-backed product models.

### Hybrid path
Some pages combine:
- product DB metadata
- runtime-derived evidence
- search/index retrieval

Especially:
- Report Detail
- Simulation Canvas replay
- Agent memory views

---

## Data retention model

### Keep persistently
- simulation metadata
- reports
- compare chains
- credit ledger
- audiences
- persistent agents
- memory summaries and episodes
- audit logs

### Runtime retention policy
May vary by scale tier:
- small runs: keep full runtime artifacts longer
- large runs: keep summarized/archived artifacts with retention policy

### Rule
Retention policy must be explicit, especially for large-scale and enterprise runs.

---

## Multi-tenant isolation rules

At minimum:
- workspace-level isolation
- private audience isolation
- private source isolation
- billing isolation
- report visibility controls
- admin override auditability

### Important
Do not assume that just because the synthetic population is global, all derived assets are globally visible.

---

## Indexing priorities

For Postgres, prioritize indexes on:
- simulation status / workspace
- run lookup
- agent username
- audience membership
- geography fields
- platform presence flags
- report by simulation
- compare by base/target simulation
- credit ledger by org/workspace
- audit logs by entity/workspace/date

### Why
This product depends heavily on:
- filtering
- drill-down
- historical retrieval
- cross-linking between entities

---

## Anti-patterns to avoid

### Do not
- use SQLite as the full product database
- mirror every runtime table naively into Postgres
- store uploaded files without metadata records
- rely on mutable credit balances without a ledger
- merge agent identity and run participation into one table
- store unstructured report blobs only, with no section/evidence layer
- let search/index logic be embedded ad hoc in transactional tables

---

## Minimum conceptual schema summary

The minimum persistent schema should cover:

### Identity / tenancy
- users
- organizations
- workspaces
- memberships

### Simulations
- simulations
- simulation_configs
- simulation_runs
- simulation_events_index
- bookmarks

### Population
- agents
- agent_platform_presence
- audiences
- audience_memberships
- simulation_participations

### Memory
- agent_memory_summaries
- agent_episodic_memory
- agent_relationship_memory
- agent_topic_exposure
- memory_update_jobs

### Reports / compare
- reports
- report_sections
- report_evidence_links
- report_chat_threads
- report_chat_messages
- compare_groups
- compare_runs

### Sources
- sources
- source_files
- source_extractions
- source_links

### Billing / admin
- plans
- subscriptions
- credit_balances
- credit_ledger
- credit_purchases
- audit_logs
- runtime_failure_records

---

## Final rule for Claude

**Model Raktio storage as a deliberate split between SQLite runtime truth, Postgres product persistence, and object/file storage. Keep persistent product entities explicit, normalized enough for filtering and drill-down, and separate identity, runtime participation, memory, reporting, billing, and admin concerns cleanly.**


---

## Implementation Status (as of 2026-04-14)

### Tables implemented (18 of ~46 conceptual tables)

| Domain | Table | Status |
|--------|-------|--------|
| Identity/Tenancy | users | Live (with email column added in migration 002) |
| | organizations | Live |
| | workspaces | Live |
| | workspace_memberships | Live (7 roles enforced via CHECK) |
| Simulations | simulations | Live (13-state status, audience_id column added 005) |
| | simulation_configs | Live (versioned, planner + runtime config) |
| | simulation_runs | Live (status lifecycle: bootstrapping→running→completed) |
| Population | agents | Live (avatar_seed GENERATED ALWAYS AS username) |
| | agent_platform_presence | Live |
| | audiences | Live (migration 003) |
| | audience_memberships | Live (migration 003) |
| | simulation_participations | Live (migration 003) |
| Billing | plans | Live (pricing fields added migration 002) |
| | credit_balances | Live (auto-created via trigger) |
| | credit_ledger | Live (append-only, reservation + refund events) |
| Reports | reports | Live (migration 004) |
| | report_sections | Live (14 section types, migration 005 expanded) |
| Compare | compare_runs | Live (migration 004) |

### Tables NOT yet implemented
- simulation_events_index, simulation_bookmarks
- agent_memory_summaries, agent_episodic_memory, agent_relationship_memory, agent_topic_exposure, memory_update_jobs
- reports evidence_links, report_chat_threads, report_chat_messages
- sources, source_files, source_extractions, source_links
- subscriptions, credit_purchases
- audit_logs, tenant_flags, model_routing_policies, runtime_failure_records

### Migrations applied
1. `001_initial_schema.sql` — 12 core tables + RLS + triggers
2. `002_add_user_email_and_plan_pricing.sql` — email column, pricing fields
3. `003_audiences_and_participation.sql` — audiences, memberships, participations
4. `004_reports_and_compare.sql` — reports, report_sections, compare_runs
5. `005_report_sections_expand.sql` — expanded section_key CHECK, audience_id on simulations

### Storage split implementation
- **SQLite per-run**: implemented via `oasis_worker.py` → OASIS creates SQLite at runtime
- **Supabase/Postgres**: 18 tables live with RLS
- **Object storage**: not yet implemented
- **Semantic/search index**: not yet implemented (pgvector extension enabled but unused)

### Additional table (Step 8D, 2026-04-14)
| Domain | Table | Status |
|--------|-------|--------|
| Analytics | llm_usage_log | Live (migration 006). Append-only log of all LLM calls with token counts, cost estimates, context IDs. RLS restricted to billing/org/platform admins. |

**Total tables live: 19**

### Memory tables (Step 10.5A, 2026-04-14)
| Domain | Table | Status |
|--------|-------|--------|
| Memory | agent_memory_summaries | Live (migration 008). Rolling summary per agent. |
| Memory | agent_episodic_memory | Live. Semantic episodes from runs. 13 episode types. |
| Memory | agent_relationship_memory | Live. Cross-run relationships. 9 relationship types. |
| Memory | agent_topic_exposure | Live. Topic exposure tracking with stance tendency. |
| Memory | memory_update_jobs | Live. Post-run transformation job tracking. |

**Total tables live: 25**
