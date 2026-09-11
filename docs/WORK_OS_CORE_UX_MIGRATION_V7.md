# Work OS — Core UX Migration V7

Status: LOCKED for execution sequencing

## Purpose

V5 established the clean-cutover shell foundation. V6 improved the shell and Command Center visual environment, but founder review places the overall product experience at roughly 25–35% of the intended target. The primary remaining gap is no longer shell color or isolated visual polish. The primary gap is that legacy page-level UX still controls most real work surfaces.

V7 therefore migrates the core daily workflows into the new Work OS operating model.

The objective is not to make old pages prettier. The objective is to replace legacy page grammar with persistent, contextual, multitasking workspaces while preserving all existing server, repository, security, role, task-lifecycle, and organization-scoping authority.

## Highest-Level Product Rule

Work OS must feel like one connected company operating system, not a collection of separate admin pages.

Common important destinations and actions should normally be reachable in 1–3 interactions. Users should remain in context through drawers, split views, side panels, overlays, and persistent workspaces whenever safe and appropriate.

## Visual Benchmark Carry-Forward

All V7 surfaces inherit `docs/WORK_OS_VISUAL_BENCHMARK_V6.md`.

The benchmark is a quality bar for:

- matte material realism
- optical foreground/mid/background depth
- environmental lighting
- deliberate focus hierarchy
- premium typography
- restrained semantic illumination
- spatial composition
- micro-detailing
- interaction response

Do not copy any benchmark layout, branding, text, iconography, or assets.

## V7 Migration Sequence

V7 is intentionally executed in founder-gated stages. Do not migrate all three experiences in one uncontrolled batch.

### V7A — My Work / Task Execution

Rebuild the personal execution surface first.

This must become the daily cockpit for an employee or Org Admin to understand and execute assigned work.

Required experience, using real authorized backing where available:

- Today / Now
- Next work
- Upcoming
- Blocked
- Completed/recent work where useful
- Project and milestone context
- assignee/owner context
- due date / urgency
- task status
- current work session/timer access where supported
- comments/conversation context where supported
- files/evidence context where supported
- task drawer or split detail view
- work chunks/checkpoints/subtasks where backing exists
- completion-oriented progress interaction

### Task Progress Direction

The product direction is:

Project -> Milestone -> Task -> Work Chunks / Checkpoints

Users should not be forced to express progress only through a single percentage slider.

Where the current domain already supports subtasks/work chunks/checklist-like records, surface them as completion-oriented units. Where backing does not exist, do not fabricate persistence.

Preserve the canonical task lifecycle and server authority.

### V7A Founder Gate

Do not move to V7B until the founder reviews the deployed My Work / task execution experience.

Automatic fail if it remains visually or structurally equivalent to the current legacy Tasks page with only new colors, spacing, or cards.

---

### V7B — Project Workspace

Only after V7A approval, rebuild the flagship project operating workspace.

Canonical persistent project tabs:

- Overview
- Plan
- Tasks
- Milestones
- Team
- Conversations
- Files
- Time
- Activity
- Finance
- Reports
- AI

The workspace must preserve project context while users inspect tasks, people, files, conversations, time, and intelligence.

Prefer drawers/split views/context panels over unnecessary full-page navigation.

Project header should surface real supported context such as:

- status
- progress/health where authoritative
- owner/team
- dates
- next milestone
- blockers
- time state
- finance signal only if truly authorized/backed

### V7B Founder Gate

Do not move to V7C until Project Workspace passes founder visual and UX review.

---

### V7C — Communication Workspace

Only after V7B approval, rebuild Communication as a serious multitasking workspace.

Target structure:

Left rail:

- DMs
- channels
- departments
- project conversations
- starred
- unread

Center:

- conversation
- threads/replies
- mentions
- reactions
- attachments
- system/action messages
- composer

Right context:

- related project
- task
- milestone
- people
- files/evidence
- time
- approvals
- finance context where authorized
- AI actions

Prepare honest positions for audio call, video call, file sharing, and media preview. Do not invent backend call/upload capability.

### V7C Founder Gate

Communication must prove stay-in-context, multitasking, and work-context-in-chat before whole-app migration continues.

## Legacy Surface Rule

As each V7 surface is migrated:

1. stop using legacy visual/layout components for that surface
2. keep non-visual domain/repository/auth logic
3. prove the replacement in browser
4. classify displaced legacy UI as `DELETE LATER`
5. do not globally delete legacy code until zero-consumer proof and founder approval

## Dark-First Priority

Dark mode is the flagship quality target during V7.

Light mode must remain functional and structurally coherent, but do not spend major iteration budget perfecting light-mode material realism before the dark flagship experience is approved.

## Browser-First Acceptance

Playwright Chromium is available and mandatory.

For every V7 stage:

1. capture current baseline
2. implement
3. run the real route in Chromium
4. capture after screenshot
5. compare against the V6 benchmark and V7 UX requirements
6. identify exact failures
7. fix only those failures
8. repeat until the current stage is materially transformed

Keep screenshots outside Git.

## Automatic Failure Conditions

A V7 stage fails if the result still shows any major combination of:

- legacy white/grey page surfaces inside the new shell
- generic list/table page with no workspace behavior
- large dead canvas
- full-page navigation for simple contextual actions
- old task percentage-slider-centric UX as the primary progress model
- no persistent work context
- no meaningful drawers/split views/context panels
- visual difference mostly colors, shadows, spacing, or border radius
- weak benchmark material/depth/lighting quality
- fake metrics or unsupported capabilities

## Security / Architecture Freeze

Do not:

- change database schema unless separately approved
- add migrations unless separately approved
- weaken RLS/RBAC
- bypass repositories/use-cases
- use browser state as production authority
- alter canonical task lifecycle without explicit product approval
- touch `main`
- invent fake operational/financial/AI data

## Quality Gates

At minimum run:

- `npm run typecheck:baseline`
- `npm run lint:baseline`
- `npm test`
- `npm run build`
- `npm run check:bundle`
- `git diff --check`
- relevant Playwright visual/interaction proof

## Current Next Action

Execute V7A only: My Work / Task Execution.

Do not begin Project Workspace or Communication in the same task.
