# Work OS UI Golden Baseline — implementation inventory

**Date:** 2026-09-07  
**Scope:** Gates 0–3 only. No legacy source was deleted.

## Gate 0 classification

| Area                                                                     | Classification   | Decision                                                                                                                                         |
| ------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auth, organization context, route guard, repositories                    | **KEEP**         | Preserve the established Supabase session, validated membership, route and domain boundaries.                                                    |
| Navigation manifest and registry                                         | **KEEP**         | Remain the visible-navigation and screen-mapping authorities. Golden routes continue to use them.                                                |
| Radix-based accessible UI primitives                                     | **MIGRATE**      | Buttons, inputs, menus, dialog behavior and toast infrastructure remain useful beneath the new material system.                                  |
| Authenticated shell/top bar/theme controls                               | **REBUILD**      | Keep behavior; replace generic card/header treatment with the shared matte shell and operational system bar.                                     |
| Theme tokens, typography, spacing, color and shadows                     | **REBUILD**      | Introduce semantic live/healthy/attention/critical/AI light, layered matte surfaces and consistent geometry in both themes.                      |
| Command palette                                                          | **REBUILD**      | Keep keyboard behavior and permission-filtered navigation; remove prototype quick actions that implied unsupported operations.                   |
| Panels, cards, badges, presence, progress, lists and tabs                | **MIGRATE**      | Golden primitives standardize reusable state, density and interaction rather than page-local styling.                                            |
| Drawers, split views and file/AI/communication shells                    | **MIGRATE**      | Compose the existing behavior into contextual, non-destructive workspace patterns.                                                               |
| Loading, error, empty and mutation feedback                              | **REBUILD**      | Use a single explicit state vocabulary with accessible roles and truthful copy.                                                                  |
| Command Center                                                           | **REBUILD**      | Render only authorized Work, session and notification repository data; no invented pulse or finance data.                                        |
| Project Workspace                                                        | **REBUILD**      | Keep the closure repository and canonical project context; replace JSON/debug output with operational tabs, rows and contextual task inspection. |
| Communication                                                            | **REBUILD**      | Keep scoped conversation/message mutations; build the three-pane golden reference with honest call placeholders.                                 |
| Generated/prototype screen catalog and old page-specific utility styling | **DELETE LATER** | Retain until founder approval, route-usage proof and whole-app migration. Do not broadly delete in this pass.                                    |
| Legacy mock services, prototype finance/payroll/fines/monitoring screens | **DELETE LATER** | They remain migration inventory and are not treated as Golden Baseline authority.                                                                |

## Dependency analysis after Gates 1–3

The Golden Baseline depends on the protected shell, organization/auth contexts, role-aware manifest/registry, Work/V2 hooks, closure repository, communication repository, Radix primitives and toast provider. Older generated screens remain reachable only where existing route policy permits; therefore their tokens and one-off styles cannot yet be removed safely.

## Intentionally deferred

- Founder visual acceptance and broad module migration.
- Broad deletion/consolidation of generated screens and legacy design-system code.
- Unsupported calling backend, production presence, finance completion, AI provider execution, and database/schema work.
- Arbitrary task percentage editing is retained only on the legacy task list; the Golden Project Workspace presents repository progress and work chunks without adding a new progress authority.

## Gate acceptance record

| Gate | Result | Evidence |
|---|---|---|
| Gate 0 — inventory | **PASS** | The matrix above covers shell, navigation, top bar, themes/tokens, typography, spacing, color, shadows, panels, lists, tabs, forms, overlays, states, responsiveness and all three reference surfaces without deleting legacy code. |
| Gate 1 — foundation + Command Center | **PASS (candidate)** | Shared primitives and tokens provide matte surfaces, contextual edges, status/presence, progress, people/tasks/chunks/activity/files/AI/states/drawer patterns. Command Center derives counts and rows from authorized Work, session and notification hooks. |
| Gate 2 — Project Workspace | **PASS (candidate)** | The repository-backed workspace holds project context across all canonical tabs, reports unavailable Finance truthfully, and opens task/work-chunk detail in a contextual drawer. |
| Gate 3 — Communication | **PASS (candidate)** | Repository-backed conversations and message mutations use a responsive three-pane rail/conversation/context layout. Unsupported audio, video and attachments are visible but disabled and labelled honestly. |

### Acceptance matrix

- **Visual:** premium matte character, layered depth, restrained semantic illumination, compact typography, coherent dark-first and structurally equivalent light themes; no decorative HUD/grid/neon treatment.
- **UX:** obvious primary actions, compact density, persistent shell, contextual drawer, command keyboard access, three-pane multitasking, responsive collapse behavior and visible focus.
- **Truth/security:** existing hooks and repositories only; validated organization and route boundaries unchanged; explicit loading/error/empty/unavailable states; no schema or authorization changes.
- **Quality/accessibility:** semantic landmarks, labelled icon controls and progress, keyboard-operable tabs/rows/palette, focus-visible styling and reduced-motion override.

Browser capture was attempted in the supplied environment, but the installed Playwright package had no Chromium executable. Rendered screenshot artifacts therefore remain unavailable due to that environment limitation; production compilation completed before browser launch and programmatic acceptance checks remain authoritative for this task handoff.
