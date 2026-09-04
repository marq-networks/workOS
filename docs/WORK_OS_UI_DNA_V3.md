# Work OS — UI DNA V3

**Status:** LOCKED — founder-approved UI foundation  
**Date:** 2026-09-05  
**Supersedes for visual/interaction direction:** `WORK_OS_UI_SYSTEM_V2.md` where this document is more specific.

## 1. Product experience target

Work OS must feel like a **living company operating system**, not a collection of admin pages.

The target combines:

- **Zoho Projects-level work-management usability and information architecture**
- **Zoho People-style daily workforce flows**
- **Zoho Cliq-style communication/presence**
- **WorkDrive-style contextual files/evidence**
- **Time Doctor-style time/activity concepts where appropriate**
- **Finance connected directly to projects/work**
- **Apple-level restraint, clarity, motion and polish**
- **original cinematic mission-control intelligence** inspired by advanced command systems, without copying Apple, Star Trek, Iron Man, LCARS, trademarks, layouts, iconography or proprietary visual assets

The result must be original Work OS.

## 2. Founder-approved visual reference interpretation

The approved reference board shared on 2026-09-05 establishes the following visual DNA. Do not re-interpret it into generic SaaS styling.

### Material language

- deep matte surfaces first
- soft layered depth rather than flat cards everywhere
- restrained translucent/glass treatment only where hierarchy benefits
- subtle physical/material response
- low-contrast separators
- soft environmental shadows
- precise, premium rounded geometry
- active/focused surfaces may receive thin illuminated edges
- background remains calm and low-noise

### Light language

- glow is contextual, not decorative
- cyan/teal: active/live/operational
- green: healthy/completed
- amber/orange: attention/risk
- red: blocked/critical
- violet/purple: AI/intelligence state only
- inactive surfaces do not glow continuously
- avoid rainbow gradients and neon-outline-everything treatment

### Depth language

- focused content stays sharp
- surrounding context may gently recede when drawers/command surfaces activate
- overlays/drawers feel optically separated from the base workspace
- motion and depth should make the system feel responsive and alive, not game-like

### Typography

- modern, calm, precise sans-serif
- large headings are rare and purposeful
- data/metadata is compact but readable
- hierarchy comes from scale, weight, spacing and placement before color
- no decorative sci-fi fonts

## 3. Non-negotiable UX laws

### 3.1 One-to-three click rule

Any important destination or high-frequency action must be reachable in **1–3 interactions maximum** from an appropriate working context.

Examples:

- open a project
- open a task
- message a person
- start/stop task time
- check in/out
- upload/share a file
- open a conversation
- view an approval
- open project finance
- search for any work object

Deep administrative configuration may exceed three clicks when justified, but normal work must not.

### 3.2 Stay-in-context rule

Do not force full-page navigation when a drawer, contextual panel, popover or split view can safely complete the action.

A user should be able to:

- inspect a task while staying in a project
- message/call a person without abandoning current work
- preview/share files in context
- inspect time, finance or evidence from the related task/project
- use AI against the current object

### 3.3 Multitasking rule

Work OS must support simultaneous work contexts. The shell should make chat, calls, files, search, notifications and AI available without destroying the user's current page state.

### 3.4 No fake completeness

A sidebar link is not a completed feature. A feature is complete only when its real data path, authorization, loading, error, empty state, mutation state and tests exist.

## 4. Canonical shell

The canonical authenticated shell must include:

- Work OS identity
- organization/workspace switcher
- role-aware primary navigation
- universal search / command bar
- notifications
- persistent access to communication
- current presence/workday state when applicable
- profile/account menu
- theme control
- network/offline state when relevant

Primary product families should converge toward:

`Home | My Work | Projects | People | Communication | Time | Files | Finance | Reports | AI`

`Audit` and `Settings` are role/capability driven rather than cluttering every employee shell.

Platform Admin keeps a separate platform-operation shell and receives no implicit customer-work visibility.

## 5. Universal Search + Command Bar

A first-class global search/command experience is mandatory.

Keyboard target: `Ctrl/Cmd + K`.

Search across authorized scope only:

- people
- organizations/workspaces
- projects
- milestones
- tasks/subtasks
- messages/conversations
- files/evidence
- time entries/work sessions
- approvals
- finance records
- reports

The same surface may expose permitted quick actions such as:

- create task
- create project
- message person
- open project
- start timer
- check in/out
- upload file
- create expense
- open approval
- ask Work OS AI

Results must be grouped, fast, keyboard navigable, permission-aware and context preserving.

## 6. Communication / Cliq-style workspace

Communication must become a primary operating surface, not a generic page.

### Layout

**Left rail**
- DMs
- channels
- departments
- project conversations
- starred/pinned
- unread

**Center**
- conversation
- threads/replies
- mentions
- reactions
- attachments
- system action messages
- composer

**Right context panel**
- related project/task/milestone
- people
- files
- time
- approvals
- evidence
- finance context where permitted
- AI actions

### Communication actions

From conversation context, users should be able to perform permitted actions such as:

- create task
- assign
- log/start time
- request approval
- attach evidence
- handoff work
- open project/task

### Calls and media

The UX foundation must reserve a coherent place for:

- audio/video call initiation
- call state
- file sharing
- image/video preview
- contextual attachments

Do not invent unsupported call infrastructure during the UI-foundation pass; prepare the interaction model and component slots truthfully.

## 7. Presence and workday state

Presence must become system-wide and meaningful:

- Working
- Available
- Focus
- Meeting
- Break
- On Leave
- Offline

Where backed by real data, show presence beside people in Communication, Projects, My Work and Team views.

Attendance/workday UX should later support:

`Check In -> Start Work -> Break/Resume -> Switch Task -> Stop -> Check Out`

## 8. Command Center / Home

Home is not a dashboard catalog. It is the daily operating console.

Role-aware content should answer:

1. What is happening now?
2. What needs my attention?
3. What should I work on next?
4. Who/what is blocked or at risk?
5. What changed since I last looked?

Potential real-data panels include:

- workday state / checked in duration
- active task/session
- My Work / next work
- approvals
- unread mentions/messages
- project health
- team pulse/presence
- live activity
- deadlines/risk
- finance pulse for authorized managers
- AI attention briefing

High-tech feeling comes from live state, smooth updates, contextual intelligence and restrained motion—not decorative HUD graphics.

## 9. My Work

Employee daily execution should be exceptionally simple.

Primary experience:

- Today
- Now
- Next
- Waiting/Blocked
- Mentions
- Approvals relevant to the user

For the active task, show work chunks/checklist rather than forcing manual progress estimation.

Employees should not need to navigate the full project hierarchy for routine execution.

## 10. Project Workspace

The project is a persistent workspace, not a collection of unrelated pages.

Canonical tabs:

`Overview | Plan | Tasks | Milestones | Team | Conversations | Files | Time | Activity | Finance | Reports | AI`

### Project header

When backed by real data, surface:

- project health
- progress
- owner/team
- dates
- next milestone
- blocker/risk count
- budget/cost signal for authorized users

### Tasks

Support appropriate views as production-ready:

- list
- board/Kanban
- timeline/Gantt where dates/dependencies support it truthfully

### Stay in project context

Opening task details, files, conversation, time and finance should preserve project context through drawers/split views whenever practical.

## 11. Smart task decomposition + progress

Work OS should reduce manual project-management overhead.

### Project Autopilot direction

A user can describe an outcome. Work OS may draft:

`Project -> Milestones -> Tasks -> Work Chunks -> Dependencies -> Estimates -> Suggested Assignees`

Nothing is materialized until the authorized human reviews/approves it.

Users must be able to:

- accept
- edit
- delete
- add their own
- reorder
- reassign
- regenerate only a selected section

### Task decomposition

A task may be broken into small executable work chunks/checklist items for the team.

### Progress rule

Primary progress should come from real completed work chunks and/or weighted estimated effort—not asking employees to drag an arbitrary percentage slider.

Progress rolls upward:

`work chunks -> task -> milestone -> project`

Existing authoritative lifecycle/security rules remain in force.

## 12. Files and evidence

Files must be contextual across the system:

- project files
- task files
- conversation attachments
- evidence
- expense receipts
- approval documents

Support preview and sharing in context where feasible. Avoid forcing users through a disconnected file-manager journey for routine work.

## 13. Finance

Finance is part of the Work OS product direction and should connect money to execution.

Project Workspace includes `Finance` for authorized users.

Target connected flow:

`Task -> Time -> Cost -> Project Budget -> Billing/Invoice -> Revenue -> Profitability`

Future/approved finance surfaces may include:

- finance dashboard
- project budgets
- planned vs actual labor cost
- expenses/receipts
- billable/non-billable time
- invoices/payment status
- project profitability/margin

Sensitive finance/payroll data must have strict role/capability controls.

Do not expose placeholder payroll/fines screens as if complete simply because prototype cards exist.

## 14. AI and mission-control intelligence

AI is contextual and operational.

Required patterns:

- universal `Ask Work OS`
- contextual AI in Project/Task/Conversation/Report
- Command Center attention briefing
- Project AI tab
- Autopilot draft/review/approve
- agent center when production-ready

AI states:

- unavailable
- ready
- analyzing
- draft ready
- awaiting confirmation
- executing
- completed
- failed safely

Consequential changes must use authorized trusted domain mutations and appropriate confirmation/audit.

## 15. High-tech interaction language

The interface should feel advanced through:

- live presence/status changes
- smooth progress rollups
- subtle active edge illumination
- optical focus/depth when context drawers open
- real-time event/activity stream
- contextual side panels
- dependency/relationship visualization when useful
- meaningful state transitions
- command palette
- AI attention surfaces
- instantaneous-feeling search

Avoid:

- decorative grids everywhere
- permanent neon borders
- fake radar/HUD widgets
- excessive particles
- game UI aesthetics
- sci-fi fonts
- animation that competes with work

## 16. Components to standardize before broad feature expansion

The first UI foundation pass should establish reusable primitives/patterns for:

- app shell
- primary navigation
- top/system bar
- global search/command trigger
- status/presence indicators
- matte panel/card
- metric/attention tile
- contextual right drawer
- tabs
- list/table
- filter/search row
- buttons/icon buttons
- forms/inputs
- avatar/person chip
- task/work chunk row
- progress visualization
- activity/event row
- empty/loading/error states
- toast/inline mutation feedback
- split workspace
- communication rail/message shell
- file preview shell
- AI surface

## 17. Motion

Default interaction motion target: approximately **120–220ms**.

Use for:

- drawer/split-panel entry
- focus/selection
- save confirmation
- state/progress update
- command palette
- AI reveal
- status transitions

Respect reduced-motion settings.

Continuous motion is allowed only for genuinely live state where it remains subtle and non-distracting.

## 18. Light and dark

Both are first-class.

Dark mode should best express the cinematic matte reference language, but light mode must remain premium and structurally identical rather than becoming a generic white admin template.

Semantic states, depth and hierarchy must survive both themes.

## 19. Accessibility and density

Required:

- keyboard navigation
- visible focus
- semantic landmarks/headings
- accessible icon labels
- no color-only meaning
- adequate contrast
- reduced motion
- touch targets
- accessible validation/errors
- responsive layouts

The desktop web app is the highest-density operational surface, but critical work journeys must remain usable on narrower screens.

## 20. Explicit DO NOT rules

Do not:

- restart the product from scratch
- replace secure V2 domain/repository/RLS architecture with mock/local state
- copy Zoho, Apple, Star Trek, Iron Man or any proprietary design
- use SOLACE branding or wellness styling
- turn the product into a generic SaaS admin dashboard
- add glow merely to make a screen look futuristic
- create a new visual language per module
- expose unimplemented routes as complete features
- use fake production analytics/data
- add manual progress sliders as the primary employee progress mechanism
- make users leave context for actions that can be completed safely in a drawer/split view
- create deep navigation that violates the 1–3 click rule for normal work

## 21. Golden-baseline process

Do not redesign the whole application at once.

### Gate 1 — Command Center

Implement the shared shell + one real Command Center using existing authorized production data only.

Review visually and functionally.

### Gate 2 — Project Workspace

Apply the same approved components/material language to the Project Workspace.

### Gate 3 — Communication

Apply the same foundation to the Cliq-style Communication workspace.

Only after all three are approved should the visual/component system be considered the **UI Golden Baseline** and propagated to the remaining product.

After the Golden Baseline is approved, no developer/AI session may invent a competing visual system without explicit founder approval.

## 22. Implementation discipline

For each slice:

`PULL -> READ CONTRACT -> IMPLEMENT ONLY APPROVED SCOPE -> TEST -> FIX DEFECTS -> RETEST -> REGRESSION -> COMMIT -> PUSH -> QA DEPLOY -> VISUAL ACCEPTANCE`

Feature work follows:

`TEST -> FIND DEFECT -> FIX ONLY DEFECT -> RETEST -> REGRESSION -> CLOSE`

Do not broaden scope while fixing a defect.
