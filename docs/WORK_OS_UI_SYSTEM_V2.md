# Work OS V2 — UI System

**Status:** LOCKED V2 VISUAL DIRECTION  
**Date:** 2026-09-03

## 1. Design intent

Work OS V2 should feel:

**Apple-level clarity and polish + premium modern SaaS + subtle futuristic mission-control atmosphere.**

The mood is advanced, calm and intelligent. It may evoke the confidence of a cinematic command bridge, but it must not copy Apple, Star Trek, LCARS, trademarks, iconography, screen layouts or proprietary visual assets.

The design must remain useful for real company work for many hours per day. Futurism is expressed through precision, hierarchy, motion and status awareness—not decorative neon overload.

## 2. Core principles

1. **Clarity before spectacle.** A user should understand priority and next action immediately.
2. **Calm density.** High-information screens can be dense, but hierarchy and whitespace prevent noise.
3. **Progressive disclosure.** Tables/cards show essential information; drawers/workspaces reveal detail.
4. **Context stays visible.** Project, task, person and organization context should not disappear during drill-down.
5. **State is obvious.** Loading, saving, blocked, offline, conflict, risk and completion states are visually distinct.
6. **Motion communicates change.** Animation is short, subtle and purposeful.
7. **Dark and light are first-class.** Neither theme is an afterthought.
8. **Accessibility is structural.** Keyboard, focus, contrast, semantic labels and responsive behavior are part of the component contract.
9. **No fake capability.** Disabled/unavailable production tabs explain why rather than simulating data.
10. **One system.** People, Work, Communication, Time, Reports and AI use the same visual language.

## 3. Visual character

### Surfaces
- primary app background: quiet neutral surface
- elevated panels/cards: matte/translucent surface with restrained blur only where performance/contrast allow
- drawers/modals: stronger separation than cards
- command-center panels: subtle layered depth, not glass everywhere

### Accent treatment
Use one primary brand accent and semantic state accents. Futuristic glow is limited to:
- focused/selected controls
- active work/session status
- high-signal health/risk indicators
- AI listening/processing state
- command palette/agent action state

Avoid rainbow gradients, constant neon borders and gratuitous glow.

### Corners and depth
- default radius family: approximately 10–16px
- smaller controls may use 8–10px
- cards use soft border + minimal shadow/elevation
- strong shadows are reserved for floating overlays/drawers

### Spacing
Use an 8px-oriented spacing rhythm with 4px half-steps where needed. Dense tables may compress vertical rhythm but retain readable touch targets.

## 4. Typography

Use a modern system/sans-serif stack with excellent web rendering and no bundled proprietary Apple fonts.

Hierarchy:
- Display / mission headline: rare, Command Center/project headers only
- H1: page/workspace title
- H2: major panel/section
- H3: card/group title
- Body: default operational reading
- Compact body: tables/metadata
- Label/caption: status/meta only

Use font weight and spacing before relying on color for hierarchy.

## 5. Color semantics

Exact tokens belong in theme implementation; semantic intent is locked:

- **Primary:** brand action/selection
- **Success:** completed/healthy
- **Warning:** attention/due risk
- **Danger:** blocking/critical failure, never decorative
- **Info:** informational/system
- **AI:** distinct but restrained intelligent-assistant accent
- **Offline:** unmistakable connection/sync state

Task/project health colors must be accompanied by text/icon meaning; never color-only.

## 6. Motion

Default interaction motion target: roughly **120–220ms**.

Use motion for:
- drawer/panel entry
- card state change
- selection/focus transitions
- save confirmation
- progress/state transitions
- command palette
- AI thinking/result reveal

Respect reduced-motion preferences. Avoid continuous decorative animation on work screens.

## 7. App shell

Canonical shell should provide:
- organization/workspace identity and switcher
- role-appropriate primary navigation
- global search / command palette
- notifications
- user/profile menu
- theme control
- visible network/offline state when relevant

Navigation should move toward product families:

`Home | People | Work | Communication | Time | Reports | Audit | Settings`

Visibility remains role/capability driven. Platform Admin has its own platform-operation shell/navigation.

The shell must not expose routes merely because source files exist.

## 8. Page anatomy

Preferred page structure:

1. breadcrumb/context where useful
2. page header
   - title
   - concise description/state
   - primary action
   - optional secondary actions
3. control row
   - search
   - filters
   - sort/view switch
4. main content
5. contextual drawer/detail panel

Do not stack multiple giant headers/toolbars.

## 9. Cards vs tables

### Cards
Best for:
- Projects
- Command Center summary
- portfolios/workspaces
- high-level risk/impact tiles

A Project card may show, as production backing allows:
- project name/color
- status/priority
- owner/team avatars
- date range
- progress
- next milestone
- blockers/risk count
- impact/health signal

### Tables/lists
Best for:
- Tasks
- People
- Time Entries
- Audit
- reports
- admin operations

Tables require:
- meaningful empty state
- keyboard/focus support
- responsive alternative on narrow screens
- persistent column semantics
- bulk actions only when production authorization supports them

## 10. Drawers and detail workspaces

Use a right-side drawer for fast create/edit/detail tasks that do not require full workspace context.

Use a full Project Workspace for sustained project operation.

Drawers should:
- preserve list context
- have clear Save/Cancel/close semantics
- show mutation/loading/conflict errors inline
- prevent silent unsaved loss where practical
- never show fields that cannot persist

## 11. Project Workspace

Target tabs:

`Overview | Plan | Tasks | Milestones | Team | Conversations | Files | Time | Activity | Reports | AI`

### Overview / cockpit
A Project Manager should see, when backing data exists:
- project health/status
- progress
- next milestone
- critical blockers
- critical-path/dependency risk
- team capacity
- at-risk tasks
- recent decisions/activity
- recent evidence/files
- time vs estimate
- AI project briefing

This is a mission-control view: high signal, no decorative dashboard clutter.

### Plan
Planning/roadmap/dependency view. Gantt/timeline-style presentation may be introduced if the Work dependency/date model can support it truthfully.

### Tasks
List + Board/Kanban at minimum when production-ready. Filtering, grouping and quick status/progress actions share one underlying authoritative state.

### Conversations / Files / Time / AI
Tabs remain disabled/hidden with a clear capability state until their production domains exist. Never hydrate them from mocks on a production route.

## 12. Task UX

Task list/row should support, as production fields become available:
- title
- project/milestone context
- status
- priority
- assignee
- dates
- impact/risk
- progress
- quick actions

Task detail should provide:
- description
- lifecycle/progress
- assignee/effort/dates
- dependencies
- subtasks
- evidence/files
- conversation
- activity
- time
- AI help

Existing P7 lifecycle behavior is authoritative and must not be redesigned away.

## 13. Status and impact language

Do not confuse:
- **Progress** — completion percentage
- **Status** — Todo/In Progress/Blocked/Completed/etc.
- **Health** — manager/system forecast such as On Track/At Risk/Critical
- **Impact** — consequence/importance derived from graph signals
- **Priority** — explicit planning choice

The UI should expose these separately.

Impact must include an explanation, e.g.:

> High impact — blocks 5 downstream tasks and the launch milestone.

Never render an unexplained employee productivity score.

## 14. AI UI

AI is integrated, not sprinkled randomly.

Patterns:
- contextual **Ask AI** in Project/Task/Conversation/Report surfaces
- Command Center briefing panel
- dedicated Project AI tab
- Agent Center for configured agents
- draft-review screens for Autopilot/actions

AI state treatment:
- unavailable/not configured
- ready
- analyzing
- draft ready
- awaiting confirmation
- executing
- completed
- failed safely

For DRAFT actions, show exactly what will be created/changed before approval.

For EXECUTE actions, confirmation must describe affected records and scope.

## 15. Communication UI

Communication should feel native to Work OS:
- contextual header showing Project/Task/Milestone when applicable
- thread/conversation body
- composer
- attachments/evidence
- mentions/reactions
- system action messages

Work context remains navigable without copying links between separate applications.

## 16. Offline UI

When offline/syncing:
- global connection state is visible but non-disruptive
- queued edits are marked
- stale/conflicted records are obvious
- user can inspect failed/rejected sync items
- app never claims server save before authoritative reconciliation

## 17. Loading / empty / error

Every production surface requires:
- skeleton/loading
- no-data empty state with legitimate next action
- bounded error with retry
- mutation-in-progress state
- conflict/stale-state handling where relevant

Avoid blank screens and raw provider errors.

## 18. Responsive behavior

Desktop is the highest-density operational view, but tablet/mobile must support critical execution journeys.

On narrow screens:
- navigation collapses cleanly
- tables become cards/compact rows or horizontal-safe layouts
- drawers become full-height sheets
- core actions remain reachable
- task progress/status remains usable
- communication/offline/evidence workflows remain touch-friendly

## 19. Accessibility

Required:
- semantic headings/landmarks
- visible focus
- keyboard navigation
- action-oriented accessible names for icon buttons
- no color-only meaning
- sufficient contrast in light/dark themes
- reduced motion support
- accessible form errors
- touch target sizing
- critical/serious axe regressions blocked in covered journeys

## 20. Migration rule

When restoring richer prototype UX:

1. inventory useful feature
2. verify product approval
3. verify/implement production field/domain
4. connect through repository/use-case
5. add loading/error/security behavior
6. add tests
7. only then expose in canonical UX

Never copy an entire prototype screen together with its mock/localStorage assumptions.
