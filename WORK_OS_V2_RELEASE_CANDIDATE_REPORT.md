# Work OS V2 Release Candidate Report

## Freeze declaration

**WORK OS V2 FEATURE IMPLEMENTATION FREEZE**

- Requested UI baseline: `d9a2e79`.
- Supplied frozen baseline: `d5ee0097be2bd1dbf800b2282bb320ed23b154dd` (the checkout presents the prior work as a consolidated commit).
- Release-candidate rule: **TEST → FIND DEFECT → FIX → RETEST → REGRESSION → CLOSE**.
- No new feature, scope expansion, architectural restart, production deployment, or credential change is authorized during release-candidate QA.

This is a release-candidate preparation record, not a production-readiness declaration. Functional status and premium UI status are locally complete; browser, isolated-Supabase, and real-provider proof remain pending.

## Evidence classification

| Marker | Meaning |
|---|---|
| PASS | Locally implemented and covered by source/automated evidence. |
| PENDING MANUAL QA | Requires authenticated browser, responsive, accessibility, or human workflow validation. |
| PENDING REMOTE QA | Requires an isolated Supabase/PostgreSQL environment and real RLS/RPC execution. |
| EXTERNAL CONFIG | Implementation exists but needs separately provisioned infrastructure or credentials. |
| DEFERRED | Explicitly excluded from V2 scope. |

## Canonical route inventory

| Area | Route/surface | Roles | Automated/source status | Release-candidate QA |
|---|---|---|---|---|
| Auth | Login, password recovery, session restoration, logout | Signed out / all authenticated roles | PASS | PENDING MANUAL QA: login failure, recovery link, refresh restoration, logout/Back. |
| Home | Employee Command Center / My Work | Employee | PASS | PENDING MANUAL QA: Today, due, blocked, active session, recent data. |
| Home | Organization Command Center | Org Admin | PASS | PENDING MANUAL QA: health, blockers, capacity, time, notifications. |
| People | `/people/employees` | Org Admin | PASS | PENDING MANUAL QA: directory/profile context and empty/error states. |
| People | `/people/departments` | Org Admin | PASS | PENDING MANUAL QA: creation, membership relationships, persistence. |
| People | Skills and capacity planning modules | Org Admin | PASS | PENDING REMOTE QA: tenant isolation and optimistic mutation proof. |
| Work | `/work/projects`, `/work/tasks` | Employee / Org Admin | PASS | PENDING MANUAL QA: CRUD, permissions, refresh, archive. |
| Work | `/work/my-work` | Employee | PASS | PENDING MANUAL QA: authorized aggregation, dates, priority and impact. |
| Work | `/work/milestones`, `/work/assignments`, `/work/reports` | Employee / Org Admin as scoped | PASS | PENDING MANUAL QA: mutations, rollups, filters and projections. |
| Workspace | `/work/workspace`: Overview, Plan, Tasks, Milestones, Team, Conversations, Files, Time, Activity, Reports, AI | Employee / Org Admin as scoped | PASS | PENDING MANUAL QA: all tabs, deep links, cross-tab context and responsive density. |
| Communication | `/communication/communicate`, `/communication/conversations`, channel/context variants | Employee / Org Admin | PASS | PENDING MANUAL QA: DM, channel, Project/Task/Milestone context, pagination and membership changes. |
| Time | `/employee/my-day`, `/employee/time-logs` | Employee | PASS | PENDING MANUAL QA: session start/stop, attribution, submit/correct/resubmit. |
| Time | `/time/tracking`, `/time/sessions`, `/time/corrections` | Org Admin | PASS | PENDING MANUAL QA: review, approve, reject and correction states. |
| Knowledge | `/knowledge/files` | Employee / Org Admin as scoped | PASS | EXTERNAL CONFIG: private upload signing and bucket policy. |
| Evidence | Files & Evidence task/subtask workflows | Employee / Org Admin as scoped | PASS | PENDING REMOTE QA: authoritative completion blocking and cross-org denial. |
| Automation | `/automation/rules` | Org Admin | PASS | PENDING REMOTE QA: trusted action/audit execution. |
| Notifications | Shell notification center and domain notifications | Employee / Org Admin | PASS | EXTERNAL CONFIG: deadline scheduler provisioning. |
| Search | `/search` | Employee / Org Admin | PASS | PENDING REMOTE QA: RLS-filtered cross-domain results. |
| Offline | Queue, replay, syncing, conflict and rejection states | Employee / Org Admin as scoped | PASS | PENDING MANUAL QA: browser reconnect and recovery; PENDING REMOTE QA: revocation. |
| AI | `/ai/copilots` | Employee / Org Admin as scoped | PASS | EXTERNAL CONFIG: server provider credentials; test unavailable state first. |
| AI | Autopilot and Agent Center | Org Admin | PASS | PENDING REMOTE QA: atomic materialization/audit; EXTERNAL CONFIG for inference. |
| Audit | `/security/audit-logs` | Org Admin | PASS | PENDING REMOTE QA: real trusted events and organization boundaries. |
| Settings | `/platform/org-settings` and canonical membership settings | Org Admin | PASS | PENDING MANUAL QA: only backed settings and authorization boundaries. |
| Platform | `/super/console`, `/super/organizations`, `/super/audit-logs` | Platform Admin | PASS | PENDING REMOTE QA: no implicit customer Work access. |

## Role QA matrix

### Employee

- [ ] See only Work assigned or otherwise authorized by server policy.
- [ ] Cannot create/administer Projects, Milestones, assignments, dependencies, departments, capacity, Automation, or Agents.
- [ ] My Work includes authorized Tasks/Subtasks and correct Project/Milestone context.
- [ ] Task lifecycle follows the locked transition matrix and persists after refresh.
- [ ] Work Session and Time Entry operations are limited to the current membership.
- [ ] Submitted/approved Time Entries cannot be rewritten; rejected entries follow the correction policy.
- [ ] Communication, Evidence, notifications, Search, offline replay, and AI context reveal no inaccessible entity metadata.

### Organization administrator

- [ ] Administer only the active organization: Projects, Tasks, Milestones, assignments, dependencies, People, departments, skills/capacity, Time review, Communication, Evidence, Automation, Reports, AI, and Agents.
- [ ] Every conflicting edit surfaces a bounded stale-revision state rather than silently overwriting.
- [ ] Material actions produce appropriate trusted audit and contextual notifications.
- [ ] Switching organizations clears the prior organization's data before the next load resolves.

### Platform administrator

- [ ] Access platform console, organization operations, platform health, support, and global audit only.
- [ ] Customer Work routes are not rendered merely disabled; route containment redirects away.
- [ ] Platform role alone cannot read or mutate customer Projects, Tasks, Time, Communication, Files, Evidence, Search, Automation, Agents, or AI context.

## Organization-isolation journey

1. Sign in with memberships in Org A and Org B; select Org A.
2. Open each canonical Work, People, Time, Communication, Files, Search, Reports, notifications, Workspace, and AI surface; record Org A entity IDs.
3. Begin slow requests, switch to Org B before they resolve, and verify Org A rows disappear immediately and late Org A results are ignored.
4. Refresh on Org B and deep-link using captured Org A entity IDs. Expect empty/denied results with no titles, counts, snippets, or other metadata leakage.
5. Queue an Org A offline mutation, switch to Org B, reconnect, and verify it is not replayed under Org B.
6. Revoke Org A membership, attempt replay, and verify permanent authoritative rejection rather than local success.
7. Restore authorized Org A membership, switch back, and verify a fresh server load—not stale cached authority.

## Locked Task lifecycle regression

| Start | Action | Expected persisted result |
|---|---|---|
| Todo / 0% | Set positive progress | In Progress with requested progress, atomically. |
| In Progress | Edit progress | In Progress with valid 1–99 progress. |
| In Progress / N% | Block | Blocked / N%; progress control locked. |
| Blocked / N% | Resume | In Progress / N%. |
| Any non-completed | Complete | Completed / 100%. |
| Completed / 100% | Reopen as Todo, In Progress, or Blocked | Requested status / 0%. |
| Any state | Explicit Todo | Todo / 0%. |

For every row: reload immediately, repeat with a stale revision, verify stale-write rejection, then verify Org B and Platform Admin denial.

## Domain journey checklist

### Core Work and Project Workspace

- [ ] Create/edit/open/archive Project; create Milestone, Task, Subtask, assignment, and dependency; change assignee/allocation.
- [ ] Reject self/cyclic dependency and invalid/cross-org references without partial writes.
- [ ] Verify effort-weighted Task → Milestone → Project rollups after refresh.
- [ ] Verify My Work and Reports derive from the same authoritative records.
- [ ] Open all eleven Workspace tabs and verify selected Project context, loading, empty, error, deep-link, and responsive behavior.

### People and Time

- [ ] Validate directory/profile/department/skill/availability/capacity relationships and role restrictions.
- [ ] Start/stop attributed session; submit Time Entry; approve/reject/request correction; correct/resubmit; verify revisions, audit, and notifications.
- [ ] Confirm approved/locked Time records cannot be rewritten by an Employee.

### Communication, Files, Evidence, Automation

- [ ] Create DM/channel/context conversation; send message; mention, react, pin/unpin; validate pagination and removed-member denial.
- [ ] Verify storage-unavailable state never represents a successful upload; when configured, validate intent, finalize, download authorization, archive, and context linkage.
- [ ] Configure evidence requirement; submit and approve/reject evidence; verify unmet requirements block completion authoritatively.
- [ ] Create/edit/enable/disable/run Automation; verify unsupported actions fail closed and successful trusted actions create notification/audit evidence.

### Notifications, Search, Offline, AI

- [ ] Generate assignment, mention, status, Evidence, Time correction, Automation, and deadline notifications; test unread/read/mark-all/context navigation.
- [ ] Search every supported domain and probe inaccessible/cross-org IDs and terms.
- [ ] Exercise offline queue success, duplicate replay, network retry, stale revision, org switch, revocation, permission change, and validation rejection.
- [ ] With no provider, verify configuration-required state and no fabricated response. When externally configured, verify READ/DRAFT/EXECUTE separation and unmistakable confirmation before EXECUTE.
- [ ] Autopilot: brief → generate → review → edit → validate → approve; verify real-member checks, cycles/references, duplicate idempotency, atomic hierarchy, and audit.
- [ ] Agents: enable/disable, scope, authority, status/result/failure; verify no hidden EXECUTE behavior.

## UI, responsive, accessibility, and state QA

Run every flagship surface at 1440px, standard laptop, tablet, and mobile widths in Light and Dark themes:

- [ ] Shell/sidebar/header, organization switcher, search, notifications, profile and theme controls.
- [ ] Command Center, Project Workspace, Tasks/My Work, People, Time, Communication, Files/Evidence, Automation, AI/Autopilot, Agents, Reports, Audit and Settings.
- [ ] Keyboard order, visible focus, collapsed-navigation names/tooltips, dialogs/drawers focus return, Escape behavior, form labels/errors, status announcements, contrast, 200% zoom, and reduced motion.
- [ ] Loading skeleton/progress, empty, network error/retry, permission denied, stale conflict, configuration required, AI unavailable, storage unavailable, offline, syncing, rejected mutation, and reconciled states.
- [ ] No raw database/provider error, token, credential, internal identifier, or inaccessible entity detail reaches user-visible error output.

## Automated evidence

The release-candidate run must record exact results for:

- `npm test`
- `npm run typecheck:baseline`
- `npm run lint:baseline`
- `npm run build`
- `npm run check:bundle`
- `git diff --check`

Playwright/browser accessibility execution is **PENDING MANUAL QA** when no browser binary is installed. Supabase migration, pgTAP, cross-organization RLS, trusted-RPC, revocation, and atomicity execution is **PENDING REMOTE QA** until an isolated backend exists.

## Known warnings and external requirements

- Vite currently reports the known large main-chunk warning; the deterministic bundle ceiling remains the release regression gate.
- Private object storage requires separately provisioned signing, bucket, and policy configuration.
- AI requires server-side provider credentials; unavailable/configuration-required behavior is the expected fail-closed baseline.
- Scheduled deadline delivery requires scheduler provisioning; the trusted processing contract already exists.
- No staging or isolated Supabase backend is claimed by this local report.

## Deferred scope

- Premium redesign expansion after freeze, native desktop/mobile clients, Finance, payroll, fines, surveillance, screenshots, keyboard/mouse monitoring, and punitive employee scoring.

## Release-candidate status

- Functional implementation: **PASS (local implementation evidence)**.
- Premium UI implementation: **PASS (source and local build evidence)**.
- Manual browser/responsive/accessibility QA: **PENDING MANUAL QA**.
- Live migration/RLS/trusted-operation QA: **PENDING REMOTE QA**.
- AI, private storage, and scheduler provisioning: **EXTERNAL CONFIG**.
- Production readiness: **NOT YET DECLARED**.

WORK OS V2 FEATURE FREEZE COMPLETE

READY FOR MANUAL QA
