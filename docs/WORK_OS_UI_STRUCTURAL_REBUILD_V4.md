# Work OS — Structural UX Rebuild V4

**Status:** LOCKED — founder correction after Golden Baseline visual rejection  
**Date:** 2026-09-08  
**Authority:** This document supersedes prior Golden Baseline acceptance claims where they conflict with the founder-reviewed deployed result.

## 1. Why V4 exists

The deployed Golden Baseline candidate was rejected because it changed mostly colors, card styling, and surface treatment while leaving the underlying UX composition substantially unchanged.

The founder review conclusion is:

- current implementation is **not** a Golden Baseline
- changing light cards to dark cards is not a structural redesign
- a dark sidebar plus dark panels on a large white canvas is explicitly unacceptable
- the product still reads as a conventional SaaS/admin dashboard
- the intended Work OS experience requires major changes to shell composition, information hierarchy, density, context preservation, interaction model, and live operational behavior

Therefore the next pass is a **structural UX rebuild**, not a reskin.

## 2. Success definition

The next Command Center must look and behave obviously different at first glance.

A reviewer should be able to identify, without explanation, that:

1. this is one coherent operating environment rather than cards placed on a webpage
2. the shell, navigation, canvas, panels, status, drawers, search, and live work state belong to one design system
3. daily work is faster and more contextual than the previous implementation
4. the product is not a generic admin dashboard
5. the high-tech feeling comes from system awareness, live state, depth, and interaction — not just dark colors or glow

If a before/after comparison looks like the same layout with a darker theme, the pass fails automatically.

## 3. Non-negotiable structural changes

### 3.1 Unified operational canvas

The authenticated workspace must become one continuous matte environment.

Required:
- no large white page behind dark cards in dark mode
- no visual split where shell is dark but content is effectively a separate white website
- sidebar, top/system bar, main canvas, panels, drawers, overlays, and footer/status areas must feel physically and visually related
- use layered depth to separate regions, not giant blank whitespace

### 3.2 Shell redesign, not recolor

The shell must be reconsidered structurally.

It must support:
- compact role-aware primary navigation
- product-family navigation rather than long legacy module lists
- persistent universal search / command access
- notifications
- communication access
- workday/presence slot where real backing exists
- user/profile controls
- contextual right-side operating panel foundation
- responsive collapse behavior

The current long admin-style left navigation is not the final pattern.

Target families:
`Home | My Work | Projects | People | Communication | Time | Files | Finance | Reports | AI`

Audit and Settings remain role/capability driven.

### 3.3 Command Center must be recomposed

Do not keep the existing page anatomy and just restyle its cards.

The Command Center should be composed as an operating console with clear priority regions such as:

- **NOW / ACTIVE WORK** — what the current user is doing or should do next
- **ATTENTION** — blockers, approvals, deadlines, unread/high-priority changes
- **PROJECT PULSE** — project health and next milestones where real data exists
- **LIVE OPERATIONS / RECENT CHANGE** — meaningful authorized event stream
- **TEAM / PRESENCE** — only where real presence data exists
- **TIME / WORKDAY** — only where real work-session data exists
- **AI ATTENTION** — truthful unavailable state if not configured

The hierarchy should make the next action obvious without scanning a grid of unrelated metrics.

### 3.4 Contextual interaction model

The product must demonstrate the stay-in-context rule visibly.

Required examples:
- clicking a task opens a contextual drawer/split panel rather than forcing a full-page transition
- task context can expose related project, people, time, files, conversation, evidence, and AI entry points as permitted
- universal search opens as a command surface, not merely a route search field
- notifications and contextual details should preserve the user's current workspace

### 3.5 1–3 interaction rule must be testable

At least these journeys must be reachable in three interactions or fewer from appropriate contexts:

- Dashboard → open project
- Project → open task details
- Task → message/open related conversation
- Task → start/open time action when supported
- Anywhere → global search
- Anywhere → notifications
- Project → Files
- Project → Finance
- Communication → related task/project

Document any journey that exceeds three interactions and either fix it or justify it as administrative configuration.

### 3.6 Density and whitespace

The product should feel calm, not empty.

Do not use giant blank areas to create a premium feeling.

Required:
- useful vertical rhythm
- compact metadata
- grouped operational regions
- adaptive density based on content
- panels that size to information rather than leaving large dead zones

## 4. Visual-material requirements

The approved reference direction remains:

- deep matte surfaces
- subtle material response
- environmental lighting
- optical depth
- restrained illuminated edges
- low-contrast separators
- calm typography
- premium rounded geometry
- contextual glow only

Semantic light:
- cyan/teal — live/active
- green — healthy/completed
- amber/orange — attention/risk
- red — blocked/critical
- violet/purple — AI/intelligence

But these visuals are secondary to structural UX. A structurally unchanged dashboard cannot pass by satisfying surface styling alone.

## 5. Required visible behaviors for the high-tech feel

At least the Golden Command Center must visibly demonstrate:

- active/focused panel depth change
- subtle contextual edge activation
- animated but restrained state transition when status/progress changes
- command palette / global search overlay
- contextual drawer or split-panel task inspection
- live/recent activity presentation
- semantic state hierarchy
- reduced-motion fallback

Do not use fake realtime data.

## 6. Command Center founder acceptance criteria

The next deployed Command Center must pass all of the following.

### Structural
- [ ] full authenticated canvas is visually coherent in dark mode
- [ ] shell is structurally different from the rejected candidate
- [ ] long legacy admin navigation is reduced/reorganized into product families
- [ ] Command Center layout is recomposed, not merely recolored
- [ ] contextual drawer/split behavior is visible and functional
- [ ] global command/search surface is visually first-class
- [ ] important journeys satisfy the 1–3 interaction rule
- [ ] dead whitespace is materially reduced

### Visual
- [ ] no large white background in dark mode
- [ ] layered matte depth is visible across the whole environment
- [ ] environmental lighting is subtle but visible
- [ ] semantic edge lighting is contextual
- [ ] typography hierarchy feels intentional and premium
- [ ] not generic SaaS/admin
- [ ] not gaming HUD / neon sci-fi

### Product truth
- [ ] real authorized data only
- [ ] unavailable domains represented truthfully
- [ ] no schema/RLS/RBAC weakening
- [ ] existing repository/use-case architecture preserved
- [ ] loading/error/empty states exist

### Interaction
- [ ] task details preserve context
- [ ] search/command reachable globally
- [ ] notifications reachable globally
- [ ] responsive keyboard/focus states exist
- [ ] reduced motion is respected

If any required item fails, founder acceptance is FAIL.

## 7. Before/after delta requirement

The implementation must produce a documented before/after comparison of the Command Center.

The report must explicitly list:

- shell layout changes
- navigation changes
- canvas/background changes
- information architecture changes
- interaction changes
- contextual panel changes
- command/search changes
- density/whitespace changes
- visual/material changes

If the majority of differences are color, border, shadow, or typography changes, the pass is automatically rejected.

## 8. Scope discipline

For this correction pass:

DO:
- rebuild shared shell where necessary
- rebuild Command Center structure
- update reusable design-system primitives
- update command palette/search surface
- implement contextual drawer/split behavior using existing supported data
- update tests for structural expectations

DO NOT:
- add database migrations
- build Desktop Agent
- implement screenshot monitoring
- invent calling infrastructure
- implement missing Finance backend
- migrate the entire app
- delete legacy UI broadly
- merge to main

## 9. Execution loop

For the Command Center correction:

`INSPECT REJECTED SCREEN -> IDENTIFY STRUCTURAL FAILURES -> REBUILD STRUCTURE -> TEST -> RENDER -> COMPARE BEFORE/AFTER -> SCORE V4 MATRIX -> FIX FAILURES -> RETEST -> RE-RENDER`

Repeat until every applicable V4 criterion passes.

Do not proceed to Project Workspace or Communication until the Command Center passes founder review visually.

## 10. Stop condition

Stop after producing a **Command Center V4 Candidate**.

Do not call it Golden Baseline approved.

Final status must be one of:

`COMMAND CENTER V4 CANDIDATE READY FOR FOUNDER REVIEW`

or

`COMMAND CENTER V4 BLOCKED — <specific blocker>`
