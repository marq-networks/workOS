# Work OS V2 — Master Product Blueprint

**Status:** AUTHORITATIVE V2 PRODUCT TARGET  
**Prepared:** 2026-09-03  
**Base:** `work-os-v2-integration` at `fd9df22c404c6d1080445df8c988123823e2e878`

## 1. Product definition

Work OS is a unified business execution platform for planning, coordinating, proving and improving work. It should replace the fragmented experience of moving between separate project, chat, time, people and reporting products with one coherent operating environment.

The product model is:

`Plan → Project → Milestone → Task/Subtask → Assignment → Conversation → Time → Evidence → Activity → Report → AI Insight → Decision`

The long-term product areas are:

- Home / Command Center
- People
- Work
- Communication
- Time
- Knowledge / Files
- Evidence
- Reports
- Automation
- Audit / Security
- AI Intelligence
- Later: Finance / profitability / payroll integrations

Work OS may study leading products, including project-management, communication, workforce and AI tools, but must remain its own product and design language.

## 2. Product principles

1. **One workspace, not stitched apps.** Work, people, conversations, time, files and reports share context and IDs.
2. **Execution first.** Every dashboard should help a person understand what needs attention or action.
3. **Server authority.** Production data comes from Supabase/trusted-server boundaries, never prototype browser state.
4. **Permission-aware by construction.** RLS/RBAC and validated organization membership are part of every production domain.
5. **Evidence over surveillance.** Measure delivery, dependencies, outcomes, time and evidence; do not default to invasive monitoring.
6. **AI assists; people remain accountable.** AI reads, drafts and proposes. Protected writes require permission and confirmation.
7. **Merge before retire.** Rich prototype capability is reconciled before legacy screens are removed.
8. **Progressive productionization.** A feature is visible as production only when its authoritative backend, security and failure states exist.
9. **Premium simplicity.** The system should feel calm, fast and advanced even when handling high information density.
10. **Offline is a state, not an error.** Approved work should remain usable offline where feasible and reconcile safely when connectivity returns.

## 3. Role model

### Employee
Primary job: execute assigned work.

Target areas:
- Home / My Work
- Projects available through assignment/minimum parent visibility
- Tasks, Milestones, Assignments
- Project/task conversations
- Work Session and personal Time Entries
- Files/evidence relevant to authorized work
- Personal Work Reports
- AI daily/work assistant
- My Profile

### Organization Admin
Primary job: operate one organization.

Target areas:
- Organization Command Center
- People Directory, Memberships/Invitations, Departments
- Projects, Milestones, Tasks, Assignments, Work Reports
- Communication administration within the organization
- Time review, Sessions, Corrections
- Essential Reports
- Audit Log
- Organization Settings
- AI operational/project assistance

### Platform Admin
Primary job: operate Work OS as a platform.

Target areas:
- Support Console
- Organizations
- Platform health/monitoring as approved
- Global Audit

A Platform Admin receives **no implicit access to customer Work data**.

## 4. Domain architecture

### Platform / Tenancy
Owns tenants, organizations/workspaces, validated membership scope and minimum customer administration.

### People
Owns worker profile, department, skills/capability metadata, working relationships and availability/capacity inputs that are legitimate for planning.

### Work
Owns projects, milestones, tasks/subtasks, dependencies and assignments. It is the core execution graph.

### Communication
Owns direct conversations, channels and contextual work conversations. Project, milestone and task conversations reference the Work entity they belong to.

### Time
Owns work sessions and time entries, including project/task attribution and correction/review workflows.

### Knowledge / Files / Evidence
Owns file/document references and evidence attached to authorized work. Completion evidence can be required by task policy without turning evidence into a hidden monitoring mechanism.

### Reports
Read-only projections over authoritative domains. Reports do not duplicate source-of-truth records.

### Automation
Rules/triggers/workflows operating through domain permissions and trusted mutation paths.

### Audit / Security
Cross-cutting authorization support, trusted audit and policy evidence.

### AI Intelligence
A provider-abstracted, permission-aware intelligence layer over authorized context. It never becomes an authorization or data-authority bypass.

## 5. Work model

The target work hierarchy is:

`Project → Milestone → Task → Subtask`

Assignments connect work to organization memberships. Dependencies connect tasks/milestones to other work. Progress and risk may be derived from child work and dependency state.

### Project
A Project is an operating workspace, not only a card.

Approved product concepts to reconcile/implement include:
- name and description
- status
- visual identity/color
- priority
- owner/team
- department relationship when production People supports it
- start/end or target dates
- progress/health
- milestones/tasks
- workload and dependencies
- contextual conversations
- files/evidence
- linked time
- activity
- reports
- AI briefing/copilot

Client, billing model, budget and profitability are valuable historical concepts but must remain outside production until their boundary with deferred Finance is explicitly approved and implemented.

### Project Workspace
Target information architecture:

`Overview | Plan | Tasks | Milestones | Team | Conversations | Files | Time | Activity | Reports | AI`

Tabs are enabled only when their production domain exists.

### Task lifecycle
The browser-verified production lifecycle is locked:
- Todo = `0%`
- committing Todo progress > 0 atomically changes status to In Progress with chosen progress
- In Progress progress is editable
- Blocked preserves progress and disables progress editing
- Blocked → In Progress preserves progress
- Completed = `100%` and progress is locked
- reopening Completed to Todo/In Progress/Blocked resets to `0%`
- any explicit transition to Todo resets to `0%`

Optimistic concurrency, authoritative server reconciliation and per-task mutation serialization remain required.

## 6. Work Impact Graph

Work OS V2 introduces a Work Impact Graph as a product differentiator.

The graph connects, as production domains become available:

`Goal → Project → Milestone → Task/Subtask → Dependency → Assignment/Person → Time → Evidence → Conversation/Decision`

Initial impact signals should explain delivery consequences, not create punitive employee scores. Examples:
- downstream tasks blocked
- dependency depth
- milestone criticality
- critical-path relevance
- number of people/work items waiting
- due-date risk
- project delivery risk

The UI should explain **why** a work item is high impact.

## 7. Progress, planning and capacity

Progress rollups should be derived where feasible from child work and effort rather than simple task counts. Managers can set health/forecast judgments separately from calculated completion.

Planning should eventually support:
- dependencies
- critical path / schedule risk
- estimated effort
- skills needed
- member capacity/availability
- suggested assignments
- what-if recovery plans

No hidden productivity score is part of this model.

## 8. Communication

Communication is contextual to work rather than a detached chat clone.

Target capabilities:
- direct messages
- organization channels
- department channels
- project conversations
- milestone conversations
- task conversations
- mentions
- reactions
- attachments
- pins
- search
- system messages

Message semantics may include:
- Normal
- Evidence
- Approval
- System

A chat message never becomes the trusted authority for a protected approval; approval actions still execute through the relevant trusted domain mutation and audit path.

## 9. Offline and field execution

Offline support should cache only an authorized working set and queue eligible writes locally.

Target offline working set:
- current/assigned projects and tasks
- work session state
- notes/checklists/forms when production-backed
- progress drafts
- evidence/photos/files
- draft messages

Reconnect flow:

`Reconnect → revalidate Auth → revalidate membership/org → revalidate permission → detect conflicts → replay valid mutations → reject stale/invalid writes → reload authoritative state`

Native desktop/mobile work, device storage encryption, background sync and optional legitimate field check-in/location capability may require later dedicated clients. Surveillance-first screenshots/keyboard/mouse scoring are not a default Work OS product principle.

## 10. AI Intelligence

AI is a first-class Work OS domain with three action levels:

- **READ:** summarize/analyze authorized context
- **DRAFT:** prepare plans, tasks, summaries, recovery proposals
- **EXECUTE:** perform authoritative mutations only with valid permission and required confirmation

Initial target capabilities:

### Project Autopilot
A manager can describe a project and receive a reviewable draft containing:
- milestones
- tasks/subtasks
- dependencies
- estimated effort
- required skills
- suggested assignees
- timeline
- risks
- deliverables

Nothing persists until confirmed.

### Project Copilot
- summarize project state
- explain blockers/risk
- summarize changes
- suggest next actions/recovery options

### Task Copilot
- improve descriptions
- propose subtasks
- identify dependencies/blockers
- summarize activity/conversation

### Communication / Meeting Intelligence
- summarize long conversations
- identify decisions/questions
- extract proposed action items
- convert proposed actions into draft work requiring confirmation

### My Work AI
- daily priority briefing
- explain what changed
- surface due/blocked/high-impact work

### Agent Center
Target agents:
- Project Manager Agent
- Risk Agent
- Workload Agent
- Reporting Agent
- Knowledge Agent
- Meeting Agent
- Onboarding Agent

AI must never silently discipline workers, generate punitive performance rankings, use hidden surveillance signals, make payroll/HR decisions, expose data outside user permission, or directly bypass RLS/trusted use cases.

## 11. Home / Command Center

### Employee Command Center
Focus:
- today's work
- due/overdue/high-impact tasks
- blockers
- active work session
- important conversations/changes
- AI briefing when configured

### Org Admin Command Center
Focus:
- project health/risk
- overdue/blocking work
- workload/capacity
- People/Time operational summaries
- important corrections/approvals
- recent organization activity
- AI operational summary

### Platform Admin Command Center
Focus on platform operations, not customer execution data.

## 12. First-release boundary vs future vision

### V2 production priority
- Platform/Tenancy foundation
- People core
- Work core
- Time core
- Essential Reports
- Audit/Security
- contextual Communication foundation
- Knowledge/Evidence foundation
- AI architecture and safe assistive capabilities

### Explicitly deferred unless separately approved
- payroll
- fines
- employee surveillance/productivity scoring
- screenshot monitoring
- advanced Finance/accounting
- autonomous disciplinary/HR decisioning
- advanced cross-company analytics
- native field/offline clients if web architecture cannot safely provide them yet

Finance prototype inventory remains product research/history, not production authority.

## 13. Production architecture rules

Canonical production flow remains:

`React screen → domain hook/use-case → typed repository → Supabase/trusted-server adapter → PostgreSQL/Supabase`

Locked rules:
- screens do not directly own authorization
- browser-selected roles never grant authority
- persisted organization IDs are untrusted preferences and must be revalidated
- production domain state is not long-lived mock/localStorage authority
- privileged operations remain server-side
- important protected mutations retain trusted audit
- every organization-owned production table requires tenant/org isolation review
- migrations are forward-only
- legacy capability is reconciled before retirement

## 14. Visual direction

Work OS V2 visual language is:

**Apple-level simplicity/polish + premium modern SaaS + subtle futuristic mission-control atmosphere.**

It is an original design system, not a copy of Apple or Star Trek.

Detailed rules live in `WORK_OS_UI_SYSTEM_V2.md`.

## 15. Completion definition

A V2 capability is not complete because a screen renders or tests pass. It is complete when its approved UX, authoritative backend, schema, security/RLS, failure states, tests and documentation agree, with production/browser verification recorded where required.

After all approved V2 gaps are implemented or explicitly deferred, declare **WORK OS FEATURE IMPLEMENTATION FREEZE** and shift to:

`TEST → FIND DEFECT → FIX → RETEST → REGRESSION TEST → CLOSE`
