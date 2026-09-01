# Work OS Roadmap

This roadmap reports evidence, not aspirational completion. Phase 0 and cloud Track A were completed before this record.

## Phase status and acceptance gates

| Phase | Status | Acceptance gate / next safe outcome |
|---|---|---|
| 0. Audit | COMPLETE | Prior repository/product audit exists. |
| 1. Product Foundation | COMPLETE | Founder approved first-release scope, launch surfaces/roles, tenancy direction, and policy exclusions on 2026-08-18. |
| 2. Domain / Product Architecture | COMPLETE | Founder approved the core domain map, ownership boundaries, dependency order, and first-release entity model on 2026-08-18. |
| 3. Canonical UX & Screen Consolidation | COMPLETE | Founder approved `WORK_OS_PHASE_3_CANONICAL_UX.md` on 2026-08-19; canonical role navigation, route matrix, merge safeguards, and redirect/retirement plan are locked. |
| 4. Technical Architecture | COMPLETE | Founder approved `WORK_OS_PHASE_4_TECHNICAL_ARCHITECTURE.md` on 2026-08-19; layer boundaries, Auth/organization contexts, data/state rules, browser/server split, validation/error model, trusted audit, and mock-migration strategy are locked. |
| 5. Database / Security / RBAC | COMPLETE | Production QA verified the approved Auth, tenancy, membership, RLS, launch-role, and trusted audit foundation. |
| 6. Production Foundation | IN PROGRESS — P6-6 NEXT | P6-1 through P6-5 are complete. P6-5 authoritative GitHub `browser-smoke` CI passed; P6-6 is next. |
| 7. Core Work Engine | BLOCKED | Phase 6 acceptance gates must pass before Phase 7 begins. |
| 8. People + Time + Reporting | BLOCKED | Core identity/hierarchy/time implementation is secured end-to-end. |
| 9. Advanced Modules | BLOCKED | OQ-004/OQ-005 and other advanced-module policy decisions are approved after core dependencies. |
| 10. Hardening & Launch | BLOCKED | Threat/performance/accessibility/recovery testing and launch runbooks pass. |

## Phase 1 — Product Foundation — APPROVED

### Approved first-release product boundary
- People Directory
- Work Execution
- Time Capture
- Essential Reporting
- Audit

Deferred from the first release unless separately approved later: Finance, advanced Communication/Analytics, payroll, fines, surveillance/productivity scoring, and similar sensitive/advanced modules.

### Approved launch surfaces / roles
- Employee
- Org Admin
- Platform Admin

Owner and Manager remain reserved until their distinct permission semantics are defined. Browser role switching is prototype behavior and must not be treated as authorization.

### Approved tenancy direction
One tenant may contain one or more organizations/workspaces. Membership is explicit and production access must enforce tenant/organization boundaries server-side with RLS.

## Phase 2 — Domain / Product Architecture — APPROVED

### First-release domain dependency spine
Platform/Tenancy -> People -> Work -> Time -> Reporting/Analytics, with Security & Audit cross-cutting.

### Approved domain ownership
| Domain | First-release disposition | Owns / responsibility |
|---|---|---|
| Platform / Tenancy | KEEP minimum operations | tenants, organizations/workspaces, memberships, minimum customer administration |
| People | KEEP | worker profiles, organization membership references, departments |
| Work | KEEP | projects, tasks, milestones, assignments |
| Time | KEEP | time entries and work sessions; sensitive workforce logic remains gated |
| Reporting / Analytics | KEEP as read-only projection | derived reports; no duplicate source records |
| Security & Audit | KEEP cross-cutting | authorization enforcement support, audit events, policy metadata |
| Finance | DEFER first-release production schema | advanced-module decision later under OQ-005 |
| Communication | DEFER advanced production scope | advanced-module decision later |
| Integrations | DEFER | attach only after stable domain APIs/IDs exist |

### Approved first-release core entities
Tenant, Organization/Workspace, User Identity, Membership, Worker Profile, Department, Project, Task, Milestone, Assignment, Time Entry, Work Session, Audit Event.

Reporting is derived rather than a source of truth. Finance, payroll, fines, surveillance/productivity records, and advanced Communication entities are not part of the first-release production entity model.

### Phase 1 + 2 verification record (2026-08-18)
Repository reconciliation confirmed the approved three role identifiers and the domain dependency/ownership baseline. Historical prototype documents have been explicitly subordinated to the approved decisions. Deferred routes and contracts remain present as prototype inventory, but are not launch scope; their visible-navigation and route consolidation is governed by the approved Phase 3 plan.

## Phase 3 — Canonical UX & Screen Consolidation — APPROVED

Founder approved [`WORK_OS_PHASE_3_CANONICAL_UX.md`](WORK_OS_PHASE_3_CANONICAL_UX.md) on 2026-08-19.
The approved package locks:
- first-release role navigation for Employee, Org Admin and Platform Admin;
- canonical route/screen targets for People, Work, Time, Essential Reporting, Audit and minimum Platform/Tenancy operations;
- merge-before-retire safeguards for richer legacy People/Department/Work functionality;
- deferred route families outside launch navigation;
- a non-destructive redirect/retirement plan requiring parity and route tests before legacy retirement.

All 178 registered prototype routes remain source inventory until later approved migration work proves safe redirects/retirement. Approval of Phase 3 does not itself authorize destructive deletion.

## Phase 4 — Technical Architecture — APPROVED

Founder approved [`WORK_OS_PHASE_4_TECHNICAL_ARCHITECTURE.md`](WORK_OS_PHASE_4_TECHNICAL_ARCHITECTURE.md) on 2026-08-19.

Approved production target:

```text
React screens -> domain hooks/use-cases -> typed repository contracts
             -> selected mock / Supabase / trusted-server adapter
             -> Supabase browser client for ordinary RLS-protected operations
             -> server/Edge Function for privileged or secret-bearing operations
Cross-cutting: Auth context, Organization context, validation, structured errors,
trusted audit, diagnostics, accessibility, CI
```

Locked rules include:
- repository contracts are framework-free and domain-owned;
- screens do not import Supabase/adapters/database row types directly;
- Auth context owns session identity; Organization context owns validated memberships and active organization selection;
- persisted organization IDs are untrusted preferences and must be revalidated;
- route visibility/browser role selection is presentation only, never authorization;
- authoritative People/Work/Time/Membership/Reporting/Audit data is server state, not long-lived browser storage;
- privileged membership/role, cross-tenant, secret-bearing and identity-administration operations require trusted server boundaries;
- important audit events must be generated through a trusted path and atomically with protected mutations;
- mock services are replaced incrementally behind stable repository contracts rather than through broad UI rewrites.

The People Directory architecture proof remains intentionally design-only until Phase 5 establishes identity/membership scope and schema/RLS foundations.

## Phase 5 — Database / Security / RBAC — COMPLETE

Phase 5 implementation and production QA now provide the approved first-release security/data foundation:
- Supabase Auth session integration and protected shell;
- Tenant and Organization/Workspace production model;
- explicit memberships for Employee, Org Admin and Platform Admin;
- validated active-organization context;
- first-release schema foundations needed for identity, People, Work, Time and Audit dependencies;
- deny-by-default RLS and policy tests;
- trusted boundaries for privileged membership/cross-tenant operations;
- audit foundations required for security-relevant mutations.

Phase 5 must not add Finance, payroll, fines, surveillance/productivity, advanced Communication, advanced Analytics or other deferred modules. Migrations must be forward-only, reviewed, and paired with access-policy tests. The browser must never be the final authorization boundary.

## Phases 5–10 — execution slices
1. **Phase 5 — COMPLETE:** Auth/tenancy/RBAC foundation, Supabase session, protected shell, organization selection, memberships, deny-by-default RLS, policy tests, and production QA-1 through QA-4.
2. **Phase 6 — IN PROGRESS:** P6-1 Production Route Containment, P6-2 Quality Baseline, P6-3 Environment + Preview/Staging Safety, P6-4 Error + Monitoring Foundation, and P6-5 Browser E2E / Critical Auth Smoke Automation are complete. P6-5 authoritative GitHub `browser-smoke` CI passed; P6-6 is next.
3. Phase 7: Work vertical slice — project/task lifecycle with audit events.
4. Phase 8: People + Time + reporting production slices.
5. Resolve OQ-004/OQ-005 before sensitive workforce or Finance implementation; then evaluate Phase 9 advanced modules.
6. Phase 10 hardening: accessibility, threat model, performance budgets, backups/recovery, observability, incident and launch runbooks.

### Phase 5 verification gate (2026-08-18)

The repository artifacts, remotely applied migration `20260819180940`, RLS/private predicates, and trusted administration boundaries passed review and production QA. QA-1 verified Platform Admin and organization administration; QA-2 verified invitation acceptance and Org Admin scope; QA-3 verified Employee denial and live revocation; QA-4 verified bounded authentication, recovery, session restoration, canonical routing, and logout. PR #33 resolved browser URL/Router history synchronization, and PR #34 resolved sign-out from the no-organization-access state; both remediations passed production re-test. **Phase 5 is COMPLETE; Phase 6 is IN PROGRESS with P6-1 through P6-5 complete and P6-6 next.** See [`WORK_OS_PHASE_5_SECURITY_DATABASE.md`](WORK_OS_PHASE_5_SECURITY_DATABASE.md).

## Phase 6 — Production Foundation — IN PROGRESS

Phase 6 executes through these bounded acceptance gates; Phase 7 remains blocked until all gates pass:

1. **P6-1 Production Route Containment — COMPLETE / production verified (2026-08-28):** production application routes are constrained to the `NAV_MANIFEST` launch surface while deferred registry inventory remains retained for development and later parity work. Employee, Org Admin, and Platform Admin production QA confirmed deferred, diagnostic, analysis, and role-forbidden deep links canonicalize to each role's authorized default without rendering blocked content; browser Back did not restore blocked Employee history entries. Org Admin access to `/people/members` remained allowed.
2. **P6-2 Quality Baseline — COMPLETE (2026-08-28):** current-main remeasurement found 322 TypeScript diagnostics in 110 files plus 31 ESLint errors and 60 warnings in 36 files, all outside the production-foundation priority paths except one bounded tooling diagnostic in `vite.config.ts`, which was fixed. Deterministic diagnostic-identity baselines now ratchet the retained prototype debt at 321 TypeScript diagnostics in 109 files and 31 ESLint errors plus 60 warnings in 36 files. `npm run quality` is the canonical hard gate for both ratchets, Vitest, and the production build, and GitHub Actions runs it on pull requests and pushes to `main`.
3. **P6-3 Environment + Preview/Staging Safety — COMPLETE / production and Preview manually verified (2026-08-28):** the Vite build validates canonical HTTPS Supabase URLs and browser-safe keys, locks Vercel Production to project `zabpmtkzqetroiwbbofh`, and rejects missing configuration or the production project in Vercel Preview. Vercel Production variables were confirmed scoped only to Production, with the production URL and browser-safe publishable key; a fresh Production redeployment completed successfully. Preview has neither Supabase variable, and a real Preview deployment failed closed with the expected environment-isolation policy error. Preview may use a valid isolated non-production project when one is approved; otherwise it intentionally fails closed. No dedicated staging backend currently exists.
4. **P6-4 Error + Monitoring Foundation — COMPLETE / production verified (2026-08-31):** PR #44 passed the GitHub Actions Quality workflow. From the canonical `/super/console` Platform Admin route in Production, the synthetic self-test returned `Accepted` with a generated event/correlation ID. The matching `POST /api/operational-error` request returned `202`, and its structured Vercel Runtime Log recorded `client_operational_error`, `self_test`, `monitoring_self_test`, `/super/console`, trusted authenticated user identity, and release/deployment/production environment metadata. The trace showed identity validation against the configured production Supabase project. Manual privacy inspection confirmed that no access or refresh token, email address, raw Supabase session, raw exception message or stack, raw request body, or client-supplied user identity was logged. Broader alerting, paging/on-call, long-term retention, and distributed tracing remain Phase 10 hardening concerns.
5. **P6-5 Browser E2E / Critical Auth Smoke Automation — COMPLETE / authoritative GitHub CI passed (2026-09-01):** PR #48 is merged. Chromium Playwright browser smoke uses synthetic Supabase Auth and membership fixtures to automate critical auth, session, RBAC, and route-containment journeys, with safety guards that block Production Supabase and Production Work OS hosts. GitHub Actions finished with `Quality` **SUCCESS** and `browser-smoke` **SUCCESS**; Playwright passed 9/9 tests with 0 failures in approximately 14.2 seconds. This closes the GAP-029 Phase 6 browser-E2E criterion. It is not a real Supabase integration suite: that work remains open because no isolated non-production Supabase backend exists. No staging environment exists or is claimed, and tests must not connect to Production.
6. **P6-6 Initial Bundle + Accessibility Baseline / closeout — NEXT:** record initial bundle and accessibility baselines and complete Phase 6 acceptance. No P6-6 work has started.
