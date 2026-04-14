# TEAM_GOVERNANCE_AND_PERMISSIONS.md

## Purpose

This document defines how Raktio handles:
- teams
- organizations
- workspace boundaries
- permissions
- private audiences
- simulation visibility
- billing authority
- admin authority
- auditability
- enterprise governance

Raktio is not just a solo tool.  
It must support serious organizational usage without turning permissions into chaos.

---

## Core governance rule

**Every major product object must have a clear visibility and control boundary.**

That includes:
- simulations
- audiences
- agents (where relevant)
- reports
- compare objects
- sources
- billing
- private populations
- admin actions

No object should have vague or accidental access behavior.

---

## Governance model overview

Raktio should support four nested scopes:

1. **User**
2. **Workspace**
3. **Organization**
4. **Platform admin**

These scopes define who can:
- view
- edit
- launch
- delete
- export
- share
- bill
- administrate

---

## Core object scopes

Each major object should belong to or be constrained by one of these scopes:

### User-scoped
- personal notes
- private bookmarks
- personal saved views
- draft artifacts not yet shared

### Workspace-scoped
- most simulations
- most reports
- most audiences
- source files
- compare chains
- standard team work

### Organization-scoped
- shared billing
- cross-workspace policy
- enterprise private population policies
- org-wide usage visibility
- tenant-level settings

### Platform-admin scoped
- global oversight
- pricing controls
- model routing controls
- system-wide failure handling
- platform health
- tenant support

---

## Governance entity model

Recommended governance entities:
- organizations
- workspaces
- workspace memberships
- roles
- permission policies
- access grants
- audit logs
- object visibility policies

---

# 1. Organizations

## Definition
An organization is the top-level tenant or business customer boundary.

### Owns or governs
- billing
- subscription
- multiple workspaces
- enterprise settings
- private population policies
- tenant-specific overrides
- shared usage visibility
- managed support rules

### Example
A company or agency can have:
- one organization
- multiple workspaces for different teams or clients

---

# 2. Workspaces

## Definition
A workspace is the primary collaboration boundary for day-to-day use.

### Workspaces typically contain
- simulations
- reports
- audiences
- source files
- compare objects
- notes/bookmarks
- team members

### Key rule
Most product objects should be workspace-scoped by default.

This keeps collaboration clean and understandable.

---

# 3. Workspace memberships

## Definition
Connects users to workspaces with a role.

### Suggested fields
- `workspace_membership_id`
- `workspace_id`
- `user_id`
- `role`
- `joined_at`
- `status`

### Why this matters
Permissions should be role-driven, not hard-coded ad hoc.

---

## Recommended role model

Raktio should support a role model with increasing power.

### 1. Viewer
Can:
- view simulations
- view reports
- inspect agents/audiences where access is granted
- use report chat if allowed
- not modify or launch important things

### 2. Analyst / Contributor
Can:
- create and edit simulations
- launch simulations
- create audiences
- use compare workflows
- interview agents
- interact heavily with product workflows

### 3. Editor / Operator
Can:
- manage shared workspace assets
- edit or duplicate audiences
- manage source files
- update shared simulation artifacts
- manage more of the workspace content lifecycle

### 4. Workspace Admin
Can:
- manage members inside workspace
- manage workspace defaults
- control shared content
- manage access to private workspace resources
- see broader usage visibility
- govern collaboration in that workspace

### 5. Org Billing Admin
Can:
- view and manage billing
- buy credits
- upgrade plan
- manage subscription-level actions
- may not need full content admin rights

### 6. Org Admin
Can:
- oversee workspaces
- manage cross-workspace settings
- manage enterprise/private audience policies
- see org-level usage and credit behavior
- assign higher roles

### 7. Platform Admin
Can:
- access product-wide admin control plane
- override at platform level
- support tenants
- manage pricing, costs, runtime health, etc.

---

## Recommended permission domains

Permissions should not be one giant on/off blob.  
They should be grouped by domain.

### Domain A — Simulations
Actions:
- view simulation
- create simulation
- edit simulation
- launch simulation
- pause/stop simulation
- clone simulation
- delete/archive simulation
- export simulation artifacts

### Domain B — Reports
Actions:
- view report
- generate report
- export report
- share report
- chat with report
- delete/archive report

### Domain C — Audiences
Actions:
- view audience
- create audience
- edit audience
- duplicate audience
- delete audience
- mark audience private
- use audience in simulation

### Domain D — Agent access
Actions:
- inspect agent profile
- inspect memory timeline
- interview agent
- inspect platform presence
- export agent-linked insights (if allowed)

### Domain E — Sources
Actions:
- upload source
- view source
- link source to simulations/audiences
- delete/archive source
- inspect extraction

### Domain F — Compare
Actions:
- create compare
- view compare
- export compare
- share compare

### Domain G — Billing
Actions:
- view balance
- view usage
- buy credits
- change plan
- view invoices
- manage annual plan
- apply billing controls

### Domain H — Team / workspace
Actions:
- invite member
- change role
- remove member
- create workspace
- rename workspace
- change workspace visibility defaults

### Domain I — Admin / enterprise
Actions:
- access org-level usage
- manage private population rules
- manage cross-workspace settings
- manage org-level policies
- access control plane

---

## Object visibility policies

Every major object should support explicit visibility rules.

### Suggested visibility options
- private to creator
- shared to workspace
- restricted to selected members
- org-visible
- admin-only
- private enterprise object

### Objects that need visibility controls
- simulations
- reports
- audiences
- source files
- compare objects
- notes/bookmarks
- private populations
- enterprise support artifacts

### Rule
Visibility should never be inferred sloppily.  
It should be stored and enforced.

---

## Private audiences and governance

Private audiences are especially sensitive.

### Requirements
- private audiences must be scoped to a workspace or org
- access must be explicit
- use in simulation must respect workspace/org visibility
- private audience details must not leak into other workspaces
- enterprise-specific private populations may require stronger boundary policies

### Optional governance settings
- who can create private audiences
- who can use them in simulations
- who can inspect member agents
- whether they can be duplicated
- whether they can be exported

---

## Private sources and source governance

Some uploaded materials may be sensitive.

### Source governance should support
- private source visibility
- workspace-only visibility
- restricted member visibility
- source usage tracking
- audit history for sensitive sources

### Why
Enterprise and legal-like workflows especially require stronger trust.

---

## Billing governance

Billing access should be narrower than normal simulation access.

### Good rule
Most users can see:
- their balance context
- cost estimate before launching

Only billing-authorized roles can:
- purchase credits
- change plans
- manage annual billing
- view invoices
- apply enterprise billing changes

This reduces accidental commercial mistakes.

---

## Simulation ownership and authorship

### Each simulation should store
- creator
- current owner
- workspace
- visibility policy
- optionally assigned collaborators

### Why
This supports:
- auditability
- team clarity
- handoff
- enterprise oversight

### Ownership actions
Roles with sufficient rights should be able to:
- transfer ownership
- assign collaborators
- change visibility
- archive old simulations

---

## Report governance

Reports should inherit simulation context but still support their own controls where needed.

### Important cases
- a report may be shareable more broadly than a simulation draft
- a report may be exportable while underlying raw details remain more restricted
- enterprise reports may need watermarking or special access rules

### Governance actions
- share report internally
- share report via controlled link
- export PDF
- restrict evidence visibility
- keep compare private

---

## Auditability rules

All sensitive governance actions should be auditable.

### Audit examples
- role changed
- member invited/removed
- workspace visibility changed
- private audience created
- private audience access changed
- report exported
- billing plan changed
- credits adjusted
- admin override applied
- enterprise policy changed

### Audit fields should include
- actor
- timestamp
- action type
- object type
- object ID
- before/after or metadata diff
- workspace/org context

---

## Enterprise governance features

For enterprise contexts, governance may need to support:

- multiple workspaces under one org
- central billing
- private synthetic populations
- restricted source domains
- tenant-wide policy controls
- enterprise-only exports
- higher audit visibility
- support/admin involvement with notes and approvals

### Important
Enterprise does not just mean “bigger plan.”  
It means stronger control boundaries and better oversight.

---

## Sharing model

Raktio should support controlled sharing.

### Internal sharing
- workspace share
- org share
- selected people only

### External sharing
- export only
- controlled report link
- enterprise-only controlled access if later supported

### Rule
Do not over-open sharing by default.  
Err on the side of clear boundaries.

---

## Permission defaults

### Default recommended behavior
- simulations: workspace-visible by default
- reports: workspace-visible by default
- audiences: workspace-visible by default
- sources: workspace-visible by default unless marked private
- billing: restricted
- private audiences: restricted
- admin pages: restricted strongly

This provides collaboration without being too loose.

---

## Governance UX principles

Governance interfaces should feel:
- clear
- controlled
- unsurprising
- explainable

They should not feel:
- bureaucratic for normal users
- hidden
- inconsistent
- overly technical

### Good UX behavior
When a user tries to do something they cannot do:
- explain why
- say who can do it
- offer the next valid path if appropriate

---

## Access escalation model

Some actions should escalate naturally:

### Example
A normal user wants to run a simulation using a private audience.
The system should:
- check permission
- if denied, explain the boundary
- offer request/ask-admin workflow if implemented later

This is better than silent blocking.

---

## Admin vs org admin distinction

### Org admin
- governs one org
- can manage workspaces, members, billing, and enterprise-scoped resources for that org

### Platform admin
- governs the whole platform
- can oversee tenants
- can inspect runtime failures
- can change pricing rules
- can support enterprise operations
- must be auditable

This distinction is critical.

---

## Anti-patterns to avoid

### Do not
- make everything visible to everyone in a workspace without thought
- make billing permissions equal to simulation permissions
- treat private audiences as normal shared assets
- skip audit logs for sensitive actions
- bury permission rules in scattered backend conditionals
- make governance so complex that normal users cannot understand it
- let enterprise features leak into basic plans accidentally

---

## Minimum governance model summary

The minimum viable governance architecture should support:

### User/workspace/org structure
- users
- organizations
- workspaces
- memberships

### Roles
- viewer
- contributor/analyst
- editor/operator
- workspace admin
- billing admin
- org admin
- platform admin

### Controlled objects
- simulations
- reports
- audiences
- sources
- compare objects
- billing data
- private populations

### Auditable actions
- member changes
- visibility changes
- billing changes
- credit changes
- private audience changes
- admin overrides

---

## Final rule for Claude

**Design permissions and governance as a first-class part of Raktio, not an afterthought. Every important object must have a clear scope, every sensitive action must be auditable, and workspace/org/admin boundaries must be explicit. Support collaboration, private audiences, billing separation, and enterprise control without turning the product into permission chaos.**


---

## Implementation Status (as of 2026-04-14)

### Roles implemented
7 roles enforced via `workspace_memberships.role` CHECK constraint:
viewer, contributor, editor, workspace_admin, billing_admin, org_admin, platform_admin

### Permission module
`auth/permissions.py` implements 10 reusable role-check functions:
- `can_create_simulation(role)` — contributors+
- `can_edit_simulation(role)` — contributors+
- `can_delete_simulation(role)` — editors+
- `can_launch_simulation(role)` — contributors+
- `can_view_billing(role)` — billing_admin+
- `can_manage_billing(role)` — billing_admin+
- `can_manage_members(role)` — workspace_admin+
- `can_access_admin(role)` — platform_admin only
- `can_manage_org(role)` — org_admin+
- `can_view_simulation(role)` — all members

### What is NOT yet implemented
- `api/team.py` — stub (no member invite, role change, workspace management)
- `require_admin()` — delegates to `require_user()` (no platform_admin DB check)
- Admin frontend route blocking (relies on backend 403)
- Object visibility policies (per-object visibility stored/enforced)
- Audit logs table
- Source governance
- Sharing model
