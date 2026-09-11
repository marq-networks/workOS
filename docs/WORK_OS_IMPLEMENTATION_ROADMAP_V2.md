# Work OS V2 — Implementation Roadmap

**Status:** V2 EXECUTION PLAN  
**Date:** 2026-09-03

This roadmap supersedes stale execution ordering for V2 work but does not erase historical Phase 0–7 records. It is dependency-driven and keeps `main` stable until the V2 integration branch is ready.

## Working model

Primary integration branch:

`work-os-v2-integration`

Recommended workstream branches:

- `v2/01-master-blueprint`
- `v2/02-premium-ui`
- `v2/03-core-work-engine`
- `v2/04-communication-offline`
- `v2/05-ai-intelligence`
- `v2/06-integration-docs`
- `v2/07-release-freeze`

No workstream should push directly to `main`. The final merge path is:

`workstream → work-os-v2-integration → full integration/QA → main`

## Wave 0 — V2 reconstruction

**Goal:** establish one authoritative product target before broad implementation.

Deliverables:
- Master Product Blueprint
- Current State Audit
- Gap Register V2
- Implementation Roadmap V2
- UI System V2
- AI Architecture

Exit gate:
- every meaningful existing/proposed capability is classified
- first-release vs deferred boundaries are explicit
- V2 design and AI governance are locked

## Wave 1 — Premium shell + UX restoration foundation

**Goal:** restore product quality without restoring prototype authority.

Work:
- consolidate AppShell/PageLayout/design tokens
- implement V2 light/dark visual language
- role-aware unified navigation hierarchy
- organization switcher, search and notification placement
- polished loading/empty/error states
- responsive layouts and drawer patterns
- restore richer Project/Task presentation using only production-backed fields
- introduce Project Workspace shell with disabled/unavailable tabs where domains are not production-ready

Must preserve:
- Auth and organization contexts
- production route containment
- RLS/trusted boundaries
- existing P7 task lifecycle/concurrency

Exit gate:
- canonical Projects/Tasks no longer look like temporary scaffolding
- no fake fields or mock fallbacks are reintroduced
- representative accessibility tests pass

## Wave 2 — Close P7-1 formally + expand Project/Task production model

**Goal:** finish the bounded Project/Task slice and safely add execution fields needed by V2.

Work:
- record organization-switch browser proof
- record Employee/Platform Admin browser Work behavior where feasible
- repair P7 source pgTAP SQL-shape issue without changing proven RLS semantics
- reconcile stale P7 docs
- add approved Project execution metadata (priority/color/dates/owner/team relationships as dependency support exists)
- add approved Task planning metadata (priority/dates/effort where adopted)
- implement premium create/edit/detail workflows

Do not add Finance-backed budget/billing fields without explicit scope approval.

Exit gate:
- P7-1 closure evidence is truthful and current
- Projects/Tasks are stable enough to support downstream Milestones/Assignments

## Wave 3 — Complete Core Work Engine

**Goal:** make the Work hierarchy authoritative.

Order:
1. Milestones
2. Subtasks
3. Assignments
4. Dependencies
5. effort/capacity primitives
6. progress rollups
7. My Work aggregation
8. Work Reports
9. Work Impact Graph foundation

For each domain:
- forward-only migration
- tenant/org-consistent FKs
- indexes and lifecycle constraints
- repository contract and Supabase adapter
- organization/member RLS
- trusted audit for significant mutations
- optimistic concurrency where needed
- tests and production-safe UX

Impact Graph acceptance:
- explain downstream blocking and risk
- no punitive employee score
- dependency cycles handled safely

## Wave 4 — People production parity

**Goal:** provide authoritative people context for work planning.

Work:
- worker profile model
- production People Directory
- Departments
- approved enhanced editor/admin parity
- skills/capability metadata if approved for assignment assistance
- legitimate availability/capacity inputs
- connect People to Projects/Assignments/Time

Exit gate:
- People screens no longer depend on prototype authority for production-target functions
- enhanced legacy routes can only be retired after parity tests

## Wave 5 — Time production slice

**Goal:** link real work to real time without surveillance-first behavior.

Work:
- Work Session
- Time Entry
- project/task attribution
- Employee personal logs
- Org Admin review
- sessions
- corrections
- filters/export
- report projections

Explicit exclusions:
- fines
- screenshot monitoring
- keyboard/mouse productivity scoring
- Finance posting

Exit gate:
- Time is authoritative, org-scoped and usable by Work/Reports/AI.

## Wave 6 — Communication + Knowledge + Evidence

**Goal:** connect conversation and proof directly to work.

Communication order:
1. conversation/channel model
2. membership/organization scope
3. messages
4. project/task/milestone contexts
5. mentions/reactions
6. attachments/pins/search
7. system messages

Knowledge/Evidence order:
1. secure file metadata/storage policy
2. project/task attachment context
3. evidence records
4. optional evidence-required completion rules
5. permission-aware search foundation

Exit gate:
- contextual work conversations use real Work IDs
- protected approvals are not authorized by chat state
- files/evidence do not leak cross-org data

## Wave 7 — Offline foundation

**Goal:** allow safe interruption-tolerant execution.

Work:
- define offline-capable operations
- encrypted/local persistence strategy for supported client
- mutation queue contract
- idempotency keys where needed
- conflict/revision model
- reconnect auth/membership/permission revalidation
- authoritative replay/reconciliation
- sync-status UI

If browser limitations prevent safe completion, stop at tested contracts and explicitly defer native desktop/mobile runtime implementation.

Exit gate:
- offline work cannot bypass revocation, organization switching or stale-write controls

## Wave 8 — AI Intelligence

**Goal:** make AI useful across real Work OS context without weakening authority.

Order:
1. provider-neutral server boundary
2. AI request/context contract
3. permission/context guard
4. READ/DRAFT/EXECUTE enforcement
5. safe disabled/configuration state
6. Project/Task/My Work copilots
7. communication/knowledge summaries
8. Project Autopilot draft schema
9. Risk/Workload/Reporting/Knowledge agents
10. Agent Center
11. AI action audit/confirmation flows

Project Autopilot consumes authoritative People/Work capabilities and should not invent unavailable members/skills as executable facts.

Exit gate:
- no provider secret in browser
- no AI bypass of RLS/trusted mutations
- EXECUTE actions have permission + confirmation + audit
- absence of provider credentials never yields fake production AI output

## Wave 9 — Unified Command Center + Project Workspace integration

**Goal:** make domains feel like one product.

Project Workspace target:

`Overview | Plan | Tasks | Milestones | Team | Conversations | Files | Time | Activity | Reports | AI`

Command Center target:
- Employee: today, blockers, due/high-impact work, session, conversations, AI briefing
- Org Admin: project risk, workload, People/Time summaries, corrections/approvals, AI operational briefing
- Platform Admin: platform operations only

Exit gate:
- navigation and contextual linking eliminate mini-app fragmentation
- tabs and cards always reflect actual authorization/data availability

## Wave 10 — Legacy parity / safe retirement

**Goal:** reduce old route/service inventory without losing useful capability.

Review explicitly:
- enhanced People/Departments
- old admin Project/Task/Milestone/Assignment screens
- Work mock/ExecutionOS authority
- duplicate common screens
- legacy aliases

For each retirement:
- document unique features
- merge approved capability first
- route/deep-link tests
- role tests
- redirect or delete only after proof

Deferred Finance/surveillance prototypes remain outside launch even if retained in source.

## Wave 11 — Integration + feature freeze

**Goal:** stop feature invention and prepare a release candidate.

Full checks:
- gap register reconciliation
- migrations and schema review
- RLS/security tests
- repository/lifecycle tests
- full Vitest
- typecheck ratchet
- lint ratchet
- production build
- bundle check
- browser smoke
- accessibility
- responsive critical flows
- organization switch
- role isolation
- AI governance
- offline conflict/revocation checks
- docs consistency

Every approved V2 gap must be either:
- VERIFIED, or
- explicitly DEFERRED with product reason

Then declare:

**WORK OS FEATURE IMPLEMENTATION FREEZE**

From that point:

`TEST → FIND DEFECT → FIX → RETEST → REGRESSION TEST → CLOSE`

## Parallelization rules for speed

Safe parallel work is allowed only when dependencies are respected.

### Can run in parallel after Wave 0
- Premium UI foundation
- Core Work schema/repository design
- Communication schema/repository design

### Must wait for shared foundations
- AI Autopilot/Workload Agent waits for stable Work/People contracts
- Offline replay implementation waits for stable production mutation contracts
- unified Command Center waits for production projections
- legacy retirement waits for parity

### Conflict rule
If two workstreams touch the same canonical architecture file (navigation, AppShell, central types, migrations, shared repository contracts), integrate one first, update/rebase the other and rerun tests. Do not resolve conflicts by blindly accepting both versions.

## Main-branch merge gate

`work-os-v2-integration` may merge to `main` only when:
- release-candidate report exists
- migrations are reviewed and production application plan is explicit
- P0 gaps are closed or consciously deferred with acceptable risk
- quality/browser/security gates are green at the integration head
- documentation describes the integration head truthfully
- no mock fallback is hidden behind production navigation
