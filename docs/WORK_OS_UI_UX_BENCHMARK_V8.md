# Work OS — UI + UX Benchmark V8

Status: **LOCKED — founder benchmark authority before V8 cutover**

## Why this exists

Work OS will no longer migrate the customer experience one legacy page at a time.

Before the V8 clean cutover, the product must have one system-wide benchmark for **both UI and UX**. The founder-provided Surface Realism reference is the quality benchmark. Work OS may use the same visual family and color language, but must not copy the reference layout, branding, text, icons, charts, or trade dress.

The goal is one coherent operating environment across the entire customer-facing product — not a new shell wrapped around legacy pages.

---

# 1. Benchmark principle

The benchmark defines two inseparable standards:

1. **UI benchmark** — material, color, depth, lighting, typography, density, surface composition, motion and detail.
2. **UX benchmark** — how users move through work, stay in context, inspect objects, act, communicate, search, multitask and recover state.

A screen fails V8 if either the UI or UX remains legacy.

Changing only colors, shadows, radius, typography or spacing is not a V8 migration.

Changing only workflow while rendering the old visual system is not a V8 migration.

---

# 2. System-wide visual language

## 2.1 One palette across the entire product

Do not invent a different color language per page or module.

The benchmark palette is the Work OS palette.

### Dark flagship palette

Approximate benchmark-derived anchors:

- **Canvas / environment:** `#040B11`
- **Deep background:** `#020407`
- **Surface 0:** `#0D1218`
- **Surface 1:** `#111A22`
- **Surface 2 / elevated matte:** `#1F1F23`
- **Raised neutral edge:** `#2F343C`
- **Muted text:** `#6C7180`
- **Secondary text:** `#969AA4`
- **Primary text:** `#DCDBDE`
- **Cool operational blue:** `#136D94`
- **Cool focus blue:** `#145988`
- **Warm environmental amber:** `#E57D3A`
- **Warm midtone:** `#9D4A29`
- **Intelligence violet:** `#532A80`
- **Soft violet:** `#7873BA`

These are anchor values, not permission to paint every element with accent color.

### Semantic color roles

- cyan / cool blue = active, live, selected, operational
- green = healthy, completed, confirmed
- amber / orange = attention, risk, time-sensitive
- red = blocked, critical, destructive
- violet = AI, intelligence, assisted action

Semantic colors must be restrained and state-driven.

## 2.2 No module-specific palettes

Projects, People, Communication, Time, Files, Finance, Reports and AI all use the same environmental and material system.

Modules may use semantic accents for state, but may not create independent branded visual systems.

---

# 3. Material benchmark

Work OS must feel materially composed, not CSS-flat.

Required material families:

- matte acrylic
- acrylic-frosted support surfaces
- soft plastic / velvet-like low-reflection surfaces
- selective glass hint only where useful
- restrained edge glow / light catch

Every material needs believable:

- internal shading
- edge response
- highlight falloff
- shadow direction
- depth relationship to neighboring surfaces

Avoid glossy glass as the default.

Avoid neon borders as a substitute for depth.

---

# 4. Optical depth model

All V8 screens must use the same four-layer model.

## Focus layer

The active work object or primary operating surface.

Examples:

- selected task
- current project workspace
- active conversation
- current file preview
- finance decision surface

Properties:

- sharpest content
- highest meaningful contrast
- strongest material definition
- clear selected/focus state

## Mid layer

Supporting context.

Examples:

- task inspector
- project context
- related people
- approvals
- linked files
- supporting metrics

Properties:

- slightly quieter
- still fully readable
- visibly behind focus layer

## Background layer

Navigation, inactive context, structural rails.

Properties:

- lower contrast
- reduced visual weight
- never competes with active work

## Environment

Ambient light, soft shadow, atmosphere and distant depth.

Properties:

- subtle
- environmental, not decorative
- can shift warm/cool by context
- never obscures information

---

# 5. Environmental lighting benchmark

Light must feel like it comes from the space around the interface.

Use:

- cool blue/cyan environmental light for operational focus
- warm amber/orange light for attention and premium balance
- restrained violet light for AI/intelligence

Lighting may softly affect:

- surface edges
- corners
- nearby panels
- shadows
- active object emphasis

Do not draw permanent bright glowing outlines around every card.

---

# 6. Typography benchmark

Typography is part of the operating hierarchy.

Required:

- premium but highly readable system font stack
- strong title hierarchy without oversized marketing headings
- deliberate numeric hierarchy
- restrained uppercase micro-labels
- controlled letter spacing
- compact operational labels
- clear dense body copy
- predictable line rhythm

No module may introduce its own typography rules.

---

# 7. Dark and light are two authored material systems

## Dark mode

Dark is the flagship benchmark.

It must reach the founder reference quality first.

## Light mode

Light mode must not be created by inversion or simply replacing dark backgrounds with white.

Light mode must preserve the same material/depth hierarchy using:

- warm/off-white environmental canvas
- cool neutral matte surfaces
- restrained edge definition
- low-bloom shadows
- clear dark typography
- subtle cyan operational accents
- restrained amber environmental light
- depth through material contrast rather than grey fog

Light mode fails if it becomes washed out, low-contrast, foggy, excessively shadowed or generic white SaaS.

Dark and light must share the same:

- spacing
- geometry
- hierarchy
- object placement
- component APIs
- interaction behavior

Only material rendering changes.

---

# 8. UX benchmark — one operating environment

V8 UX must stop behaving like a collection of independent pages.

The user should feel that Work OS is one company operating environment.

## 8.1 Persistent application frame

Always preserve:

- organization context
- product-family navigation
- global search / command
- notification access
- profile / account context
- current working context where applicable

## 8.2 Stay in context

Use drawers, inspectors, split views and contextual overlays before routing away.

Examples:

- click task → task inspector opens in place
- click person from project → person context opens without destroying project state
- click file from task → preview opens in context
- click conversation from project → communication surface opens with project context preserved

Full navigation is reserved for deliberate workspace changes, not every detail inspection.

## 8.3 1–3 interaction rule

Common actions should normally be reachable in 1–3 interactions:

- open project
- open task
- start work
- change task state
- inspect blocker
- message teammate
- open conversation
- share file
- inspect time
- inspect person
- inspect finance context
- ask AI
- open report

## 8.4 Object-centric UX

The system revolves around real work objects:

`Plan → Project → Milestone → Task → Work Chunk/Subtask → Assignment → Conversation → Time → File/Evidence → Activity → Report → AI Insight → Decision`

Every work object should expose its related context without forcing users to hunt through disconnected modules.

## 8.5 Multitasking

A user should be able to work while also accessing:

- chat
- files
- people
- task/project context
- time
- AI
- notifications
- approvals

without repeatedly losing their place.

## 8.6 Progressive disclosure

Do not place every possible control on the main screen.

Primary surface = current work.

Secondary context = inspector/drawer.

Advanced actions = contextual menu or command surface.

## 8.7 Search as navigation + action

Global search/command should eventually support:

- destinations
- projects
- tasks
- people
- files
- conversations
- actions

Search must not remain merely a list of product destinations in the final system.

## 8.8 Truthful capability

Never fake functionality.

If a capability is not backed, show a truthful unavailable/not configured state rather than simulated production behavior.

---

# 9. Canonical UX models by domain

These are not separate design systems. They are domain arrangements built from the same V8 primitives.

## Command Center

One coordinated operating surface for:

- operating state
- current execution
- blockers / attention
- recent signals
- contextual intelligence

Not a KPI-card dashboard.

## My Work

Daily personal execution cockpit:

- focus
- now
- next
- blocked
- completed
- archived
- task inspector
- real work chunks/subtasks
- time/start-work entry point when backed

## Project Workspace

Persistent project operating room with canonical tabs:

`Overview | Plan | Tasks | Milestones | Team | Conversations | Files | Time | Activity | Finance | Reports | AI`

Tabs change context inside the project. They should not feel like 12 unrelated pages.

## Communication

Three-zone collaboration model where appropriate:

- conversation navigation
- active conversation
- contextual work inspector

Project/task/file/person context stays attached to conversation.

## People

Directory + person context + current work + organization role + communication/work access.

Not a plain member table.

## Time

Current session + work linkage + entries + review/history + project/task context.

## Files & Evidence

Contextual preview + relationship to work + activity + permissions + search.

## Finance

Operating finance connected to projects/work, not an unrelated accounting dashboard.

## Reports

Report builder/viewer with filters, saved views, drill-down and contextual links to source work.

## AI

AI is contextual and permission-scoped.

Modes remain:

- READ
- DRAFT
- EXECUTE

EXECUTE must use trusted domain operations and confirmation.

---

# 10. V8 shared component families

The new customer-facing product must be composed from one new V8 component system.

Required families:

- AppEnvironment
- SystemBar
- ProductRail
- CommandSurface
- ContextDrawer
- SplitInspector
- MatteSurface
- FocusSurface
- SupportSurface
- StatusBadge
- WorkRow
- WorkCard
- ObjectHeader
- TabStrip
- ActionRail
- EmptyState
- LoadingState
- ErrorState
- DataTableV8
- FormSurfaceV8
- ConversationRail
- ConversationSurface
- ComposerV8
- FilePreviewV8
- PersonInspectorV8
- TaskInspectorV8
- ProjectWorkspaceV8
- TimeSessionSurfaceV8
- FinanceSurfaceV8
- ReportSurfaceV8
- IntelligenceSurfaceV8

Legacy visual components must not be used inside a migrated V8 route unless explicitly wrapped as a temporary compatibility adapter and visually invisible to the user.

---

# 11. Whole-product cutover strategy

V8 is not a page-by-page visual renovation.

## Phase 0 — benchmark lock

This document is the authority.

Do not code the full cutover until the benchmark is accepted.

## Phase 1 — V8 system foundation

Build the new isolated V8 system:

- tokens
- dark material system
- light material system
- typography
- spacing
- depth
- environmental light
- motion
- shared components
- shell
- drawer/inspector model
- command/search model

No legacy UI should visually leak into the V8 foundation.

## Phase 2 — domain composition layer

Compose all major customer-facing domains using V8 primitives:

- Command Center
- My Work
- Projects / Project Workspace
- Communication
- People
- Time
- Files
- Finance
- Reports
- AI

Use real repositories and domain authority where available.

Do not redesign each module independently.

## Phase 3 — route cutover

Route the customer-facing Work OS experience to V8 in a coordinated cutover.

Keep old components in the repo temporarily for rollback/reference, but do not render them in V8 routes.

## Phase 4 — capability integration

Connect remaining backed domain operations and classify gaps as:

- DONE
- PARTIAL
- MISSING
- DEFERRED
- BLOCKED

No fake capability.

## Phase 5 — legacy deletion

Only after route and regression proof:

- verify zero V8 route consumers
- remove old presentation components
- remove old design tokens/styles
- remove obsolete route adapters
- regression test

---

# 12. Whole-system automatic fail conditions

V8 fails if any active customer-facing route visibly contains:

- legacy white/grey SaaS surface
- old table/card visual grammar
- module-specific color theme
- different typography system
- flat page inside the new shell
- old progress-slider-first task UX
- giant unused canvas
- disconnected full-page detail navigation where an inspector should be used
- duplicated navigation systems
- washed-out light mode
- generic dark SaaS
- fake data or fake capability

The whole product also fails if the UX remains page-centric even after visual replacement.

---

# 13. Acceptance method

The benchmark is applied at **system level**, not one screenshot at a time.

Required review set for every V8 acceptance build:

1. Command Center — dark
2. My Work with task selected — dark
3. Project Workspace — dark
4. Communication with conversation selected — dark
5. People/person context — dark
6. Time — dark
7. Files — dark
8. Finance — dark
9. Reports — dark
10. AI — dark
11. Command Center — light
12. My Work — light
13. Project Workspace — light
14. Communication — light

Review the set together for:

- one palette
- one material system
- one typography system
- one depth model
- one interaction grammar
- one navigation model
- no legacy leakage

Founder approval is final.

---

# 14. Execution discipline

For V8 use:

`BENCHMARK → SYSTEM DESIGN → BUILD SHARED PRIMITIVES → COMPOSE DOMAINS → CUT OVER ROUTES → TEST → VISUAL REVIEW SET → FIND DEFECT → FIX → REGRESSION → LEGACY DELETE`

Do not return to the old pattern of independently polishing one legacy page at a time.

---

# 15. Architecture and security guardrails

Preserve:

- Supabase
- server authority
- organization scoping
- RLS/RBAC
- trusted mutations
- audit
- task lifecycle
- repository/use-case boundaries

V8 replaces the presentation and interaction system. It does not bypass domain authority.

Do not touch `main` during V8 development.

---

# 16. Founder acceptance statement

V8 can begin full cutover only after this benchmark is accepted as the product-wide authority for both UI and UX.

The intended result is:

**the benchmark's visual quality and color language + Work OS's own business workflows + a completely new connected UX model across the whole product.**
