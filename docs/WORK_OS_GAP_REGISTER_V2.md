# Work OS V2 — Gap Register

**Status:** AUTHORITATIVE ROOT-GAP REGISTER  
**Date:** 2026-09-03

This register tracks root product gaps rather than every symptom. A gap closes only when its approved target state, authoritative data path, security, UX, tests and required verification agree.

## Status values

- OPEN
- IN PROGRESS
- VERIFIED
- DEFERRED
- LEGACY / PARITY REQUIRED

## Priority

- **P0:** blocks safe V2 integration/release
- **P1:** core product capability
- **P2:** important expansion/polish
- **P3:** later/deferred

| ID | Domain | Priority | Status | Current state | Target state / acceptance | Dependencies |
|---|---|---:|---|---|---|---|
| V2-GAP-001 | Documentation | P0 | OPEN | Roadmap/progress still state blanket P7-1 remote block. | Reconcile P7 production evidence and remaining browser gates into authoritative docs. | Integration pass |
| V2-GAP-002 | Work UX | P0 | OPEN | Canonical Projects/Tasks render minimal production scaffolding. | Premium production-backed Project/Task UX with parity-reviewed drawers, filtering, hierarchy and responsive states. | V2 UI system |
| V2-GAP-003 | Projects | P1 | OPEN | Production Project schema is intentionally narrow. | Add only approved execution fields needed by V2 Project workspace; classify client/billing/budget boundaries explicitly. | People/core Work decisions |
| V2-GAP-004 | Tasks | P1 | OPEN | Production lifecycle works but richer planning/detail UX is incomplete. | Task detail/list/board/filter/group/date/priority/dependency experience backed by real fields. | Work schema expansion |
| V2-GAP-005 | Milestones | P1 | OPEN | Rich prototype only. | Production milestone schema, repository, RLS, audit where relevant, UX and tests. | Projects |
| V2-GAP-006 | Assignments | P1 | OPEN | Task assignee exists; complete Assignment domain is prototype only. | Production assignment model supporting Work hierarchy and planning. | People memberships, Tasks |
| V2-GAP-007 | Subtasks | P1 | OPEN | No authoritative production subtask model. | Approved Project→Milestone→Task→Subtask hierarchy with safe lifecycle/security. | Tasks |
| V2-GAP-008 | Dependencies | P1 | OPEN | No production dependency graph/critical path. | Task/milestone dependency model, validation, cycle handling and risk projection. | Milestones/Tasks |
| V2-GAP-009 | My Work | P1 | OPEN | Rich prototype surfaces remain. | Production aggregation over current user's authorized assignments/work. | Assignments, Tasks |
| V2-GAP-010 | Work Reports | P1 | OPEN | Rich report prototypes; production projection incomplete. | Read-only derived Work reports from authoritative Work data. | Core Work completion |
| V2-GAP-011 | Work Impact Graph | P1 | OPEN | Product concept only. | Explainable impact signals from dependencies, milestones, due risk and blocked downstream work; no punitive worker score. | Dependencies, Work graph |
| V2-GAP-012 | Progress rollups | P1 | OPEN | Task progress exists; project/milestone rollups not authoritative. | Derived milestone/project progress with documented weighting policy. | Milestones/Subtasks/effort decision |
| V2-GAP-013 | Capacity / effort | P1 | OPEN | No authoritative effort/capacity model. | Estimated effort + legitimate availability/capacity inputs suitable for planning and AI suggestions. | People + Work |
| V2-GAP-014 | People Directory | P1 | OPEN | Membership is production; richer worker profile is mixed prototype. | Production worker profile/directory with org isolation and parity-reviewed enhanced UX. | People schema/RLS |
| V2-GAP-015 | Departments | P1 | OPEN | Rich screens exist; full production authority not closed. | Production departments with People/Project relationships and admin parity. | People |
| V2-GAP-016 | Skills | P2 | OPEN | No canonical production planning-skills model. | Permission-safe skills/capability metadata for assignment suggestions. | People Directory |
| V2-GAP-017 | Time | P1 | OPEN | Multiple rich prototypes/API contracts but no full production Time slice. | Production Work Session + Time Entry + review/correction contracts, schema, RLS, UX. | Work IDs, People |
| V2-GAP-018 | Communication | P1 | OPEN | Rich prototype/chat-dock exists; no production communication authority. | Org-scoped DMs/channels + contextual Project/Task/Milestone conversations. | Membership, Work graph |
| V2-GAP-019 | Conversation context | P1 | OPEN | Prototype chat is not authoritative work context. | Conversation/message entities reference authorized Work context; protected approvals use trusted domain mutation. | Communication + Work |
| V2-GAP-020 | Knowledge / Files | P1 | OPEN | Attachments appear in prototypes but no coherent production domain. | Secure org/entity-scoped file metadata/storage rules/search foundation. | Work, Communication |
| V2-GAP-021 | Evidence | P1 | OPEN | No canonical production evidence/completion policy. | Evidence records/attachments linked to work with optional completion requirements and audit where relevant. | Knowledge/Files, Tasks |
| V2-GAP-022 | Offline | P2 | OPEN | Offline Sync screen is prototype only. | Safe offline queue/contracts: revalidate auth/org/permission, conflict detection, replay and authoritative reconciliation. | Core production domains |
| V2-GAP-023 | Native/field client | P3 | DEFERRED | Web repo has no dedicated native offline agent. | Desktop/mobile client only after offline contracts/security are stable; optional legitimate field check-in. | Offline foundation |
| V2-GAP-024 | AI architecture | P1 | OPEN | No canonical provider-abstracted Work OS AI domain. | Server-side provider boundary, org/permission context, READ/DRAFT/EXECUTE governance and safe disabled state. | Auth/Org + domain contracts |
| V2-GAP-025 | Project Autopilot | P1 | OPEN | Product concept only. | Brief → reviewable milestone/task/subtask/dependency/effort/skill/assignee/risk/deliverable draft; explicit approval before persistence. | AI architecture, Work graph |
| V2-GAP-026 | AI Copilots | P1 | OPEN | No canonical Project/Task/My Work copilots. | Permission-aware summaries, drafting, blocker/risk and next-action assistance over real context. | AI architecture |
| V2-GAP-027 | Agent Center | P2 | OPEN | No canonical Work OS Agent Center. | Governed Project Manager/Risk/Workload/Reporting/Knowledge/Meeting/Onboarding agents with scoped tools. | AI architecture, domain readiness |
| V2-GAP-028 | AI execution governance | P0 | OPEN | Policy exists only in V2 blueprint. | Runtime permission checks, confirmations, trusted mutations and audit for AI-assisted EXECUTE actions. | AI architecture |
| V2-GAP-029 | Command Center | P1 | OPEN | Employee/admin dashboard prototypes are fragmented. | Role-appropriate unified Command Center fed by production projections and AI when configured. | Work/People/Time/AI |
| V2-GAP-030 | Navigation V2 | P1 | OPEN | Production route containment works; visible product hierarchy reflects older launch shape. | Unified role-safe product families: Home, People, Work, Communication, Time, Reports, Audit, Settings; Platform Admin separate. | Shell + production readiness |
| V2-GAP-031 | Legacy Work authority | P0 | LEGACY / PARITY REQUIRED | ExecutionOSContext, ExecutionOSMockService and Work mock data remain for unconverted surfaces. | Replace production-target use behind real repositories; retire only after parity/route tests. | Work migrations |
| V2-GAP-032 | Legacy People parity | P1 | LEGACY / PARITY REQUIRED | Enhanced People/Department screens contain useful actions. | Merge approved capability into canonical production People UX before redirect/retire. | People production |
| V2-GAP-033 | Legacy routes | P2 | LEGACY / PARITY REQUIRED | Large registered prototype/deferred inventory remains. | Safe redirects/retirement only after feature parity, role/deep-link tests and usage review. | Domain productionization |
| V2-GAP-034 | P7 source pgTAP | P1 | OPEN | Final P7-1 pgTAP assertion has a known SQL-shape issue although equivalent live proof passed. | Repair source test to valid shape without changing proven RLS semantics; rerun in safe environment. | Test environment |
| V2-GAP-035 | Org-switch browser proof | P0 | OPEN | Production backend isolation is proven; final browser organization-switch evidence was not formally closed in docs. | Org A data clears on switch, never appears in Org B, and reloads correctly on return. | Current P7 UI |
| V2-GAP-036 | Employee/Platform Work browser proof | P1 | OPEN | Backend role semantics proven; final canonical browser UX proof is desirable. | Employee sees minimum authorized Work and no admin mutations; Platform Admin has no implicit Work. | Current P7 UI |
| V2-GAP-037 | Staging / integration backend | P2 | OPEN | Preview safely fails closed but no isolated non-production Supabase backend exists. | Dedicated isolated integration/staging project for repeatable migrations/RLS/browser integration tests. | Infra approval |
| V2-GAP-038 | Accessibility expansion | P2 | IN PROGRESS | Representative baseline exists. | V2 critical journeys pass keyboard, focus, responsive and critical/serious accessibility gates. | V2 UI |
| V2-GAP-039 | Bundle/performance | P2 | IN PROGRESS | Deterministic baseline exists with large historical bundle debt. | Preserve ratchet during V2; later reduce chunks/load cost without hiding regressions. | V2 UI/domain loading |
| V2-GAP-040 | Automation / workflow | P2 | OPEN | Prototype operations exist, no canonical workflow domain. | Rule/trigger/approval workflow foundation using trusted domain actions; configurable forms later. | Core domains |
| V2-GAP-041 | Notifications | P2 | PARTIAL | Notification UI/service prototypes exist. | Production contextual notifications linked to Work/Communication/Time events. | Event/domain foundations |
| V2-GAP-042 | Search | P2 | PARTIAL | Command palette/global search UI history exists. | Permission-aware cross-domain search over production People/Work/Communication/Knowledge. | Production domains |
| V2-GAP-043 | Finance | P3 | DEFERRED | Extensive prototype Finance/earnings/payroll code remains. | Re-evaluate only after core V2 and explicit product/security approval. | Founder approval |
| V2-GAP-044 | Surveillance/fines | P3 | DEFERRED | Legacy fines, screenshot, input-counter/activity screens remain in source. | Keep outside production scope/navigation; never use as hidden punitive scoring. | Explicit future policy approval |
| V2-GAP-045 | AI provider config | P1 | OPEN / CONFIG DEPENDENCY | No approved production AI provider configuration is part of audited V2 base. | Provider-neutral architecture and safe disabled state first; production provider added only with secure server configuration. | AI architecture |

## Gap closure rules

A root gap may be marked **VERIFIED** only when all applicable items pass:

1. Product target is documented and scope-approved.
2. Data/schema changes are forward-only and reviewed.
3. Repository/use-case authority is production-backed.
4. RLS/RBAC/trusted-server boundaries are tested.
5. UX includes loading, empty, success and failure states.
6. Optimistic/conflict behavior exists where concurrent editing matters.
7. Automated regression tests pass.
8. Required browser/remote verification is recorded truthfully.
9. Documentation reflects the actual deployed state.
10. No mock fallback or dual-write hides failure.

## V2 release blockers today

The minimum P0 blockers before V2 feature freeze are:

- V2-GAP-001 documentation truth
- V2-GAP-002 canonical Work UX regression
- V2-GAP-028 AI execution governance before any EXECUTE capability
- V2-GAP-031 retained mock authority on production-target Work surfaces
- V2-GAP-035 organization-switch browser closure

Additional P1 capabilities must either be implemented or explicitly deferred by product decision before feature freeze.
