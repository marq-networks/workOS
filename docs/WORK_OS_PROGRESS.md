# Work OS Progress

**Last updated:** 2026-08-27
**Current checkpoint:** PHASE 5 — QA-1 AND QA-2 COMPLETE; QA-3 EMPLOYEE ACCESS VERIFIED / TRUSTED REVOCATION RETEST PENDING. The bounded trusted Employee membership-deactivation path is implemented; QA-3 is not complete and QA-4/Phase 6 have not begun.

**Current remediation batch:** Batch 1 — Phase 5 closure only. **QA-1 is MANUALLY VERIFIED / COMPLETE.** Production verification confirmed the backend-derived Platform Admin role, trusted organization create/edit/deactivate flow (including persisted edit), rejection of a deactivated organization as active context, session-clearing logout, canonical login after logout, signed-out refresh, and browser Back protection. The bounded QA-2 follow-up adds the missing Platform Organizations action for a fixed-role Org Admin invitation and same-target resend. Remote migration `20260819180940`, RLS, and the trusted administration functions remain unchanged.

## PHASE 5 CLOSEOUT SCOREBOARD

**TOTAL PHASE-5 GAPS: 12**

| ID | Status | Code complete? | Remote deployed? | Automated proof? | Manual proof? | Blocker | Next action |
|---|---|---:|---:|---|---|---|---|
| GAP-001 | QA-1 MANUALLY VERIFIED (remaining role journeys continue in QA-2–4) | Yes | Yes | Repository auth/RLS tests | Platform Admin login/session/logout journey passed | Controlled Org Admin/Employee fixtures | QA-2, QA-3, QA-4 |
| GAP-002 | DEPLOYED — AWAITING MANUAL VERIFICATION | Yes | Yes | Remote RPC denial/service-role/rollback audit passed | No real email acceptance | Email recipient journey | QA-2 |
| GAP-003 | DEPLOYED — AWAITING MANUAL VERIFICATION | Yes | Yes | Focused build/unit proof | No invitation UI E2E | Email recipient journey | QA-2 |
| GAP-007 | VERIFIED — QA-1 COMPLETE | Yes | Yes | Remote privilege and rollback/audit checks passed | Create/edit/deactivate and persisted edit verified | None | Complete |
| GAP-008 | DEPLOYED — AWAITING MANUAL VERIFICATION | Yes | Yes | Bounded mapping tests pass | No throttling proof | Supabase project configuration | QA-4 |
| GAP-009 | DEPLOYED — AWAITING MANUAL VERIFICATION | Yes | Yes | Forgot-password tests pass | No delivery proof | SMTP/redirect environment | QA-4 |
| GAP-010 | DEPLOYED — AWAITING MANUAL VERIFICATION | Yes | Yes | Invalid-session mapping test passes | No round-trip proof | Real recovery email | QA-4 |
| GAP-011 | DEPLOYED — AWAITING MANUAL VERIFICATION | Yes | Yes | Acceptance policy/RPC tests pass | No first-login proof | Real invitation email | QA-2 |
| GAP-013 | QA-1 VERIFIED — QA-3 REVOCATION PROOF PENDING | Yes | Yes | Initial/background, event coalescing, dialog preservation, and revocation tests pass | QA-1 focus/session lifecycle passed | Controlled revoked-member fixture | QA-3 |
| GAP-036 | DEPLOYED — AWAITING MANUAL VERIFICATION | Yes | Yes | Deactivation pgTAP and remote predicate checks passed | No revoked-session UI proof | Controlled membership fixture | QA-3 |
| GAP-038 | QA-1 MANUALLY VERIFIED (revocation journey remains QA-3) | Yes | Yes | Deactivated-org denial and remote predicate checks passed | Deactivated organization rejected as active context | Controlled QA-3 fixture | QA-3 |
| GAP-064 | DEPLOYED — AWAITING MANUAL VERIFICATION | Yes | Yes | Recovery outcome regressions pass | No deployed re-test | Real recovery email | QA-4 |

**VERIFIED: 1 / 12**

**DEPLOYED — AWAITING REMAINING MANUAL PROOF: 11 / 12**

**OPEN: 0 / 12**

**EXTERNAL SETTING BLOCKERS: 1.** Security Advisor was rerun after migration `20260819180940`: the prior warnings for `is_active_member`, `is_org_admin`, and `is_platform_admin` are cleared. Remote inspection reports zero public RLS predicate helpers and three helpers in the `private` schema. The only current advisor warning is **Leaked Password Protection Disabled**; it remains an unresolved Phase-5 Supabase Auth project-setting blocker.

## CONSOLIDATED PHASE-5 QA PACKET

Run these four journeys once, in order, with dedicated QA email addresses. Record timestamp, actor email, organization, expected/actual result, screenshot, and request/correlation ID where available. Do not retest individual gap numbers separately.

### QA-1 PLATFORM ADMIN

**Status (2026-08-24): MANUALLY VERIFIED / COMPLETE.** Production evidence: backend-derived Platform Admin role loaded; trusted organization create, edit, and deactivate succeeded; the edit persisted; the deactivated organization could not become active context; logout cleared the session and showed the canonical login; refresh remained signed out; and browser Back did not restore protected content.

**Exact steps**
1. Sign in through the canonical Work OS credential screen with the controlled Platform Admin account; refresh once and confirm MARQ Networks and the Platform Administrator surface are restored.
2. Inspect the authenticated browser request/session and record the Supabase user ID and JWT role (`authenticated`); confirm the application role and organization come from the backend membership, not a browser-selected role.
3. Open `/super/organizations`, create a uniquely named QA organization, rename it, then deactivate it. Attempt to select or reopen the deactivated organization and confirm it grants no active application context.
4. Sign out and confirm the canonical credential login appears; refresh and use browser Back, then confirm the same login remains and protected content is not available.

**Expected result:** the backend membership admits the Platform Admin; organization create/update/deactivate succeeds through the trusted boundary; the deactivated organization cannot authorize access; logout clears protected access. No raw provider error or secret is exposed.

**Verifies:** GAP-001, GAP-007, GAP-038.

**Reviewer remote evidence:** inspect the Auth user ID and active Platform Admin membership; the created organization and its inactive state; correlated `organization.created`, `organization.updated`, and `organization.deactivated` audit rows; `organization-administration` invocation logs; and absence of a direct browser RPC call to the trusted database function.

### QA-2 INVITATION + ORG ADMIN

**Status (2026-08-25): Platform Admin → Org Admin invitation VERIFIED; resend VERIFIED; acceptance VERIFIED; backend active Org Admin membership VERIFIED; Org Admin canonical membership page reached VERIFIED; Org Admin role options correctly exclude Platform Admin VERIFIED; Org Admin → Employee invitation backend path VERIFIED. QA-2 is NOT COMPLETE.** Production testing discovered a split-brain membership UI: the trusted real invitation write succeeded while the membership table still read mock People employees. A bounded real membership-list remediation is implemented and pending production retest. The remediation extends the existing trusted `identity-administration` boundary with an authorized organization-scoped list action, returns invited and active memberships without requiring worker profiles, and refreshes that list immediately after invitation.

**Exact steps**
1. As Platform Admin, invite a new controlled email as Org Admin for an active QA organization. Before accepting, use resend once for the same invitation.
2. Open the newest email in a clean/private browser, follow the link, set the password if prompted, and complete acceptance.
3. Sign in as the invited Org Admin; confirm only the assigned organization and Org Admin surface appear.
4. Open `/people/members` and invite a second controlled email as Employee; confirm the UI reports a real invitation rather than creating a local/prototype employee.

**Expected result:** both invite operations create the intended Auth identity/membership through the trusted endpoint; resend is bounded and does not duplicate membership; acceptance activates only the invitee's JWT-derived membership; the Org Admin cannot assign Platform Admin.

**Verifies:** GAP-002, GAP-003, GAP-011 (and the Org Admin positive-role portion of GAP-001).

**Reviewer remote evidence:** inspect the two Auth identities, organization-scoped membership rows and activation timestamps/statuses; correlated invitation/acceptance audit events; `identity-administration` version-2 invocation logs including resend; and verify there is no duplicate membership or unintended Platform Admin role.

### QA-3 EMPLOYEE + REVOCATION

**Status (2026-08-27):** Employee login **VERIFIED**; Employee canonical navigation **VERIFIED**; direct `/people/members` route denial **VERIFIED**; trusted Employee membership deactivation **IMPLEMENTED**; production revocation retest **PENDING**. QA-3 remains open.

**Exact steps**
1. Accept the Employee invitation from QA-2 in a clean/private browser and sign in; confirm the Employee surface and assigned organization only.
2. Attempt a Platform Admin URL and an Org Admin membership operation; confirm no privileged data or successful mutation is available.
3. Keep the Employee session open. Using the authorized administration path/controlled reviewer operation, deactivate that Employee membership.
4. Return to the Employee tab and trigger revalidation by focusing it (then wait through the bounded refresh interval if needed); refresh once. Confirm the organization disappears and the protected shell shows login/no-access rather than stale data.

**Expected result:** Employee access is membership-scoped and privileged operations are denied; revocation is recognized without requiring the user to clear storage; no inactive membership or organization continues to authorize the session.

**Verifies:** GAP-001, GAP-013, GAP-036, GAP-038.

**Reviewer remote evidence:** inspect the inactive membership and unchanged Auth user identity; the correlated membership-deactivation audit event; browser/Edge request denials for privileged operations; and timestamps showing the application revalidated after revocation.

### QA-4 AUTH / RECOVERY / SESSION

**Exact steps**
1. From a signed-out browser, submit one invalid-password sign-in and confirm the message is generic. Inspect the Supabase Auth rate-limit configuration/status; do not deliberately lock a shared production account.
2. Request password recovery for a controlled account and for an unregistered address; confirm both request screens are enumeration-safe, while only the controlled inbox must receive the usable message.
3. Open the controlled recovery link, set a valid new password, and confirm truthful success plus sign-out. Sign in with the new password and refresh to prove session restoration.
4. Reopen the used recovery link (and an expired link if a controlled expired fixture exists); confirm a bounded invalid/expired state and no authenticated protected shell.
5. Sign out and confirm refresh/Back cannot restore protected content.

**Expected result:** credential and recovery-request messages do not disclose account/provider details; delivery and redirect complete; an accepted password update reports success; used/expired links fail safely; session refresh restores only valid authorization and logout removes it.

**Verifies:** GAP-001, GAP-008, GAP-009, GAP-010, GAP-013, GAP-064.

**Reviewer remote evidence:** inspect Auth delivery/audit logs for recovery requests without exposing tokens; redirect URL and provider/rate-limit settings; the password-update/user security event; session refresh/sign-out events; and absence of sensitive provider details in Vercel/browser logs. Separately enable and rerun Security Advisor for the unresolved leaked-password-protection setting.

## Phase 1 + 2 final verification — 2026-08-18
- **Verdict:** VERIFIED / COMPLETE; no product blocker found.
- Launch role identifiers are consistently `employee`, `org_admin`, and `platform_admin` in the canonical manifest, role configuration, route registry, state, and service types.
- The approved first-release boundary and domain spine are internally consistent. Older constitution/data-spine claims about five roles, Finance, payroll, fines, monitoring, and advanced Communication/Analytics were classified as documentation corrections and marked historical/deferred.
- Shared prototype paths can occur in multiple role groups. Role-aware manifest lookup now disambiguates those entries and repairs the navigation invariant without consolidating or deleting routes.

### Architecture mismatch disposition
| Finding | Classification | Disposition |
|---|---|---|
| Deferred Finance, advanced Communication/Analytics, fines and monitoring remain in prototype route inventory. | DEFERRED/FUTURE | Preserve routes/screens outside launch navigation until later approved migration or advanced-module decisions. |
| Prototype service types/contracts include Finance, fines, payroll, monitoring, leave and Communication models. | FUTURE PHASE ISSUE | Treat as mock/prototype only; do not use as the production entity model. |
| Historical constitution defines Owner/Manager and launch-complete advanced modules. | DOCUMENTATION CORRECTION | Marked historical and subordinate to approved decisions. |
| Historical data spine omits Platform/Tenancy at its root and mandates Finance/fine/payroll flows. | DOCUMENTATION CORRECTION | Marked historical and superseded where incompatible. |
| `Employee` prototype records conflate identity/profile/employment concerns and `Organization` does not encode approved Tenant membership. | PHASE 5 ISSUE | Split during approved production schema/Auth/RLS design. |
| Shared manifest paths previously resolved to the first role-specific duplicate. | SAFE FIX | Added optional role-aware lookup and regression coverage. |

### First-release consistency matrix
| Approved product scope | Domain | Owner | Core entity | User surface |
|---|---|---|---|---|
| Tenant/workspace administration | Platform / Tenancy | Platform | Tenant, Organization/Workspace, Membership, User Identity | Platform Admin; minimum Org Admin organization settings |
| People Directory | People | People | Worker Profile, Department; membership reference | Employee profile; Org Admin people administration |
| Work Execution | Work | Work | Project, Task, Milestone, Assignment | Employee work; Org Admin work administration |
| Time Capture | Time | Time | Time Entry, Work Session | Employee time capture; Org Admin time review/correction |
| Essential Reporting | Reporting / Analytics | Read-only projection over domain owners | Derived views only | Employee/Org Admin approved reporting surfaces |
| Audit | Security & Audit | Cross-cutting audit owner | Audit Event | Org Admin audit; Platform Admin global audit |

## Completed
- Phase 0 repository/product audit.
- Cloud Track A: GitHub/Vercel deployment and Supabase browser-client foundation.
- Durable repository guidance and roadmap/decision/progress/open-question memory.
- Phase 1 Product Foundation approved and verified.
- Phase 2 Domain / Product Architecture approved and verified.
- Phase 3 Canonical UX & Screen Consolidation approved on 2026-08-19.
- Phase 4 Technical Architecture approved on 2026-08-19:
  - UI -> domain hook/use-case -> framework-free repository contract -> selected adapter is the locked dependency direction;
  - the existing single browser-safe Supabase client is the ordinary RLS-protected browser adapter foundation;
  - privileged membership/role, cross-tenant, identity-admin and secret-bearing operations require trusted server/Edge boundaries;
  - Auth context owns session identity; Organization context owns validated memberships and active organization selection;
  - persisted organization IDs are untrusted preferences and must be revalidated;
  - authoritative domain records are server state, not long-lived browser storage;
  - validation and structured `AppError` boundaries are required for production I/O;
  - security-relevant audit generation must use trusted context and be atomic with protected mutations;
  - mock-to-production migration occurs incrementally behind stable contracts;
  - People Directory proof remains design-only until Phase 5 provides identity/membership scope and schema/RLS foundations.
- Early Phase 6 work already completed out of sequence: strict TypeScript/ESLint/Vitest/CI harness plus one bounded shared UI-contract remediation slice.

## Known technical state
- `npm run test`, `npm run build`, and `git diff --check` passed for the Phase 4 packet run.
- Latest recorded strict typecheck after the bounded Phase 6 remediation: 334 errors across 119 prototype files; generic cleanup remains intentionally paused.
- Latest recorded lint baseline: 31 errors and 51 warnings in existing prototype files.
- Navigation suite passes all eight Phase 3 tests.
- Current auth/session/role selection remains prototype-only and client-controlled until Phase 5 replaces it with authenticated membership context.
- Current service provider remains mock/in-memory with scattered local/session storage and embedded data.
- `navRegistry.ts` contains 178 unique registered paths with repeated prototype generations retained as migration inventory.

## Phase 4 approval — 2026-08-19
- PR #7 / merge commit `c28f960cdb8ec704c746827a8fcdf81e57705884` placed the Phase 4 packet on GitHub main.
- Founder accepted the recommended architecture and requested progression to the next roadmap phase.
- **Status:** PHASE 4 — VERIFIED / COMPLETE.

## Current phase — Phase 5 Database / Security / RBAC
Goal: implement the approved production security/data foundation without expanding product scope.

### Phase 5 allowed scope
- Supabase Auth session integration and protected shell.
- Tenant + Organization/Workspace production model.
- Explicit backend memberships for Employee, Org Admin and Platform Admin.
- Validated active-organization selection/context.
- Production schema foundation needed for the approved first-release dependency spine.
- Deny-by-default RLS and policy tests.
- Trusted server/Edge boundaries for privileged membership/role and cross-tenant actions.
- Trusted audit foundations needed for security-relevant mutations.

### Phase 5 hard exclusions
- No Finance/payroll/fines/surveillance/productivity schema.
- No advanced Communication/Analytics/Integrations expansion.
- No broad prototype cleanup.
- No destructive legacy-route retirement unrelated to the security foundation.
- Do not treat route visibility or browser-selected role/org IDs as authorization.

## Next execution order
1. Phase 5: production Auth/Tenancy/RBAC schema, Supabase session foundation, deny-by-default RLS and policy tests.
2. Finish remaining Phase 6 acceptance work.
3. Phase 7 Core Work Engine.
4. Phase 8 People + Time + Reporting.
5. Resolve OQ-004/OQ-005 before Phase 9 sensitive/Finance advanced modules.
6. Phase 10 hardening and launch.

## Stop rule
Remain inside Phase 5 until its schema/security acceptance gates are proven. Do not skip to Phase 7 feature implementation or reopen generic TypeScript cleanup.

## Phase 5 repository implementation — 2026-08-18
- Added Supabase Auth session lifecycle, membership-derived Organization context, and protected-shell state flow.
- Added a forward-only Tenant/Organization/Membership/People dependency/Audit migration with forced deny-by-default RLS and backend-derived role predicates.
- Added a trusted-server-only atomic membership/audit database function, Edge contract scaffolding, and thirteen-case pgTAP policy coverage.
- Removed prototype session/selected-role/mock-organization authority from application composition; route/navigation roles remain presentation only.
- Completed the bounded security findings record in `WORK_OS_PHASE_5_SECURITY_DATABASE.md`.
- Corrected reviewer-found Phase 5 issues before remote verification: current-user membership loading now selects by authenticated user even for globally-readable Platform Admin sessions, Protected Shell requires a validated active membership, and browser employees cannot mutate authoritative worker job-title or department assignments. Regression coverage includes the selection boundary and corrected pgTAP privilege/worker-field cases.
- **Remote database status: APPLIED AND HARDENED.** The initial Tenant, Organization, and Platform Admin membership bootstrap and a real Supabase Auth user exist.
- Real-session testing found that Supabase password recovery established an authenticated session but the application had no recovery-specific gate or new-password UI. The Phase 5 correction adds explicit `PASSWORD_RECOVERY` state, a gated password update through `supabase.auth.updateUser`, post-update sign-out, focused regression tests, and removal of production-facing prototype credentials.
- The Batch 1 auth remediation now maps sign-in failures to bounded credential/throttling messages and adds an enumeration-safe forgot-password request mode using Supabase Auth with an explicit same-origin reset redirect. Eight focused auth/UI tests and the full 21-test repository suite pass; remote delivery, configured redirects, provider throttling, and real-session behavior remain external verification rather than claimed green.
- Founder manual evidence confirms the real authentication happy path: the new password authenticated `team@marqnetworks.com` and loaded the Platform Administrator membership, MARQ Networks organization, and protected Platform Admin console. This is positive but partial GAP-001 evidence; JWT inspection, logout, remaining roles, and negative cases are not inferred.
- The same manual run exposed GAP-064: password persistence succeeded but recovery displayed a false failure. Tracing confirmed password update and subsequent sign-out were sequential within one throwing operation. They are now distinct outcomes: only `updateUser` failure rejects, sign-out failure returns a bounded cleanup result, and the screen always acknowledges an accepted update truthfully. Safe mappings distinguish same-password, weak-password, invalid recovery session, and unknown provider failure without exposing raw details.
- GAP-002 repository remediation implements the `identity-administration` Edge Function. A verified bearer identity is re-authorized from active backend memberships before Auth invitation, the database remains the final authorization boundary, failed membership creation compensates the new Auth identity, and invited users can activate only their own JWT-derived memberships through a service-role-only function that writes correlated audit evidence in the same transaction. Payload policy regressions pass; Edge deployment, email delivery/link behavior, and real positive/negative journeys remain remote verification.
- **Phase status: REMOTE VERIFICATION IN PROGRESS.** Phase 5 is not COMPLETE until the founder/reviewer completes a fresh real login and verifies the authenticated JWT plus backend Platform Admin membership.
