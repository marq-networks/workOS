# Work OS — UI Rebuild Execution Plan

**Status:** LOCKED — execution contract  
**Date:** 2026-09-05  
**Branch:** `v2/functional-build`  
**Visual authority:** `docs/WORK_OS_UI_DNA_V3.md`

## 1. Purpose

This document locks the migration path from the current Work OS UI to the founder-approved Work OS UI system.

The goal is **not** to keep patching the existing generic SaaS styling. The goal is to implement one new coherent Work OS design system, validate it through a small golden-baseline set of screens, migrate the product onto it, and then remove the superseded UI system cleanly.

Do not restart the product, database, domain architecture, repositories, RLS, routing, or trusted mutation model.

## 2. Non-negotiable sequence

The order is locked:

1. **Document and lock the visual/UX contract**
2. **Inventory the current UI system and dependencies**
3. **Build the new Work OS design system foundation**
4. **Apply it to Command Center only**
5. **Founder visual acceptance**
6. **Apply the same system to Project Workspace**
7. **Founder visual acceptance**
8. **Apply the same system to Communication**
9. **Founder visual acceptance**
10. **Declare UI Golden Baseline**
11. **Migrate remaining product surfaces to the Golden Baseline**
12. **Delete superseded UI tokens/components/styles only after no production route depends on them**
13. **Run full regression**
14. **Only then continue broad feature expansion inside the new system**

No phase may be skipped because of speed pressure.

## 3. Source of truth

All implementation decisions must follow:

- `docs/WORK_OS_UI_DNA_V3.md` — visual/interaction authority
- current Work OS product/domain architecture — functional authority
- existing production-backed repositories/use-cases/RLS — data/security authority

Where the old `WORK_OS_UI_SYSTEM_V2.md` conflicts with UI DNA V3, **UI DNA V3 wins for visual and interaction direction**.

The old V2 UI document may remain as historical context until migration is complete, but it must not drive new UI implementation.

## 4. What "replace the design system" means

Replacement does **not** mean deleting working UI code first.

Correct migration pattern:

`inventory -> introduce new primitives/tokens -> migrate approved reference screens -> validate -> migrate remaining screens -> prove no references remain -> delete old primitives/styles`

This prevents breaking routes while still ensuring the final product has only one active design system.

## 5. Phase A — UI inventory before coding

Codex must first inspect and report:

- current theme/token files
- global CSS
- component libraries/primitives
- shell/navigation components
- card/panel components
- button/input/form components
- table/list components
- drawer/modal components
- typography rules
- icon system
- light/dark implementation
- any legacy prototype styles
- any local page-specific styling that bypasses shared primitives

For each item classify:

- **KEEP** — structurally useful and compatible
- **REBUILD** — behavior useful, visual implementation incompatible
- **MIGRATE** — can be wrapped/adapted into new system
- **DELETE LATER** — obsolete after migration

No deletion during this inventory phase.

## 6. Phase B — New Work OS foundation

Create one shared design system that expresses the locked DNA:

- deep matte surfaces
- layered optical depth
- restrained environmental edge lighting
- calm premium typography
- compact operational density
- contextual state lighting
- low-noise separators
- premium motion
- high-tech behavior through live state and intelligence, not decorative HUD clutter

At minimum establish shared tokens/primitives for:

- application canvas
- shell
- navigation rail
- top/system bar
- universal search/command trigger
- panel/card surfaces
- status/presence indicators
- buttons/icon buttons
- form controls
- tabs
- list/table rows
- metric/attention tiles
- contextual right drawer
- split view
- progress/work-chunk row
- activity/event row
- empty/loading/error states
- AI surface
- communication shell primitives
- file preview shell

Dark and light must use the same structural system. Dark is the primary cinematic expression; light must remain premium and must not fall back to a generic white admin template.

## 7. Gate 1 — Command Center only

Do not redesign the whole application.

Apply the new shell + shared design system to **Command Center/Home only**.

Use existing authorized real data only.

The screen must answer:

- what is happening now?
- what needs attention?
- what should I do next?
- what is blocked/at risk?
- what changed recently?

The existing flat SaaS Command Center is **not** the accepted baseline.

### Gate 1 acceptance

Must feel:

- unmistakably Work OS
- premium and matte
- operationally alive
- high-tech through behavior/state
- dense enough for real work without visual clutter
- usable for many hours per day
- clearly different from a generic admin dashboard

Must also preserve:

- real data
- authorization
- loading/error/empty states
- keyboard/focus support
- responsive behavior
- current functionality

If founder says FAIL, fix only Gate 1. Do not proceed to Gate 2.

## 8. Gate 2 — Project Workspace

After Gate 1 is approved, apply the **same components and tokens** to Project Workspace.

Canonical project workspace remains:

`Overview | Plan | Tasks | Milestones | Team | Conversations | Files | Time | Activity | Finance | Reports | AI`

Do not create a second project-specific visual language.

Project interaction must preserve the 1–3 click rule and stay-in-context rule.

If founder says FAIL, fix Gate 2 only.

## 9. Gate 3 — Communication

After Gate 2 approval, apply the same system to the Cliq-style Communication workspace:

- left communication rail
- center conversation
- right contextual work panel
- persistent access to files, people, calls, tasks, projects, time, approvals and AI where supported

Do not implement fake call/media infrastructure merely to fill the UI.

If founder says FAIL, fix Gate 3 only.

## 10. Golden Baseline declaration

Only when Gates 1–3 are founder-approved may the new system be declared:

**WORK OS UI GOLDEN BASELINE**

At that point:

- all new screens must use it
- all migrated screens must use it
- no AI/developer may invent a competing visual system
- module-specific one-off styling requires explicit approval

## 11. Full product migration

After Golden Baseline approval, migrate remaining product areas in controlled batches, including:

- My Work
- Projects lists/boards
- Tasks
- Milestones
- Assignments
- People
- Time
- Files & Evidence
- Finance
- Reports
- Notifications
- Search
- Automation
- Agent Center / AI
- Audit
- Settings

Each migration preserves existing functional/domain behavior unless a separately approved product change says otherwise.

## 12. Old UI deletion rule

The old design system is deleted **only after**:

1. all production routes have migrated
2. repository search shows no active imports/references to superseded tokens/components/styles
3. tests/build pass
4. authenticated route smoke tests pass
5. dark/light mode regression passes
6. accessibility regression passes for covered flows

Then delete:

- obsolete tokens
- obsolete shared UI primitives
- obsolete global styles
- legacy page-specific styles no longer referenced
- dead visual assets

Do not delete functional/domain components just because they contain old styling; migrate them first.

After deletion, run a second repository-wide search to prove the superseded system is gone.

## 13. UX laws that every migrated screen must pass

### 1–3 Click Rule
Normal high-frequency work and destinations must be reachable within 1–3 interactions from an appropriate context.

### Stay-in-Context Rule
Use drawers, split views, contextual panels and popovers where they prevent unnecessary navigation.

### Multitasking Rule
Search, chat, calls, files, notifications and AI must be accessible without destroying the current work context.

### No Fake Completeness
A visible module is not complete unless it has real data, authorization, loading/error/empty/mutation states and tests.

## 14. Anti-drift rules

Codex/Claude/developers must not:

- redesign from memory instead of reading the locked docs
- interpret "futuristic" as more neon
- copy Star Trek, Iron Man, Apple, Zoho or proprietary layouts/assets
- add unrelated features during UI migration
- add database migrations during a visual-only gate unless a separately proven functional defect requires one
- change domain architecture for styling convenience
- replace server authority with mocks/localStorage
- create separate visual systems for People, Projects, Finance, Time or Communication
- move to the next gate before visual acceptance
- delete old shared UI before migrated routes are proven independent from it

## 15. Required implementation loop

Every UI gate follows exactly:

`PULL -> READ UI DNA + THIS PLAN -> INVENTORY IMPACT -> IMPLEMENT APPROVED SCOPE -> TYPECHECK -> LINT -> TEST -> BUILD -> QA DEPLOY -> FOUNDER VISUAL REVIEW -> FIX ONLY FOUND DEFECTS -> RETEST -> REGRESSION -> COMMIT/PUSH -> CLOSE GATE`

No broadening during defect repair.

## 16. Desktop agent

Desktop-only monitoring capabilities remain deferred until the web Work OS is complete and stable.

Do not let desktop-agent work block or contaminate the web UI rebuild.

## 17. Immediate next action

The next coding task is **Phase A + Phase B foundation preparation, then Gate 1 Command Center only**.

Before changing code, Codex must return the UI inventory/classification and proposed files to create/migrate/delete-later. Then implementation can proceed tightly against the approved plan.