# Work OS — UI Clean Cutover V5

**Status:** LOCKED — founder-approved recovery direction

## 1. Why V5 exists

The previous UI passes failed because they continued to reuse the legacy shell, navigation, layout, spacing, card composition, and page structure. The result was mostly a reskin of the old product instead of a true Work OS redesign.

V5 is a controlled UI/UX cutover.

The product logic, security model, repositories, routes, data contracts, task lifecycle, Supabase authority, RLS/RBAC, and trusted mutation paths remain intact. The UI layer is replaced independently.

## 2. Non-negotiable principle

**Do not redesign the old design system. Replace it.**

The new Work OS UI Kernel must not be built by extending the legacy visual shell.

The following legacy concepts are not design authorities for V5:

- legacy AppShell composition
- long admin-style sidebar structure
- generic page-header + card-grid composition
- old theme tokens
- old spacing/grid decisions
- old dashboard card language
- generated prototype utility styling
- white SaaS canvas with dark cards placed on top

Legacy components may remain temporarily only so unmigrated routes continue to compile. They must not be imported into the new V5 shell or Command Center unless explicitly approved as non-visual infrastructure.

## 3. What stays frozen

Do not change these unless a genuine defect requires an approved fix:

- Supabase schema
- migrations
- RLS
- RBAC
- organization scoping
- repositories
- use-cases/domain hooks
- trusted server operations
- route authority
- task lifecycle rules
- audit/security architecture
- production data authority

No mock/localStorage authority may be introduced.

## 4. V5 scope — first founder gate only

Build only:

1. **New Work OS UI Kernel**
2. **New authenticated Org Admin shell**
3. **New Org Admin Command Center**

Do not redesign Platform Admin in this pass.
Do not build Finance functionality in this pass.
Do not rebuild Project Workspace in this pass.
Do not rebuild Communication in this pass.
Do not begin whole-app migration.

Founder visual approval of the Org Admin shell + Command Center is required before propagation.

## 5. New Work OS UI Kernel

Create a new, isolated reusable UI system with its own tokens and primitives.

It must define:

- application canvas
- shell layout
- compact product-family navigation
- system/top bar
- organization switcher treatment
- global search / command surface
- notification access
- communication access point
- profile / role surface
- contextual right drawer
- split workspace foundation
- matte surface primitive
- layered panel primitive
- state edge / semantic illumination primitive
- typography scale
- spacing scale
- radii
- separators
- shadows / depth
- status badges
- presence indicators
- metric/attention surfaces
- task/work rows
- activity rows
- empty/loading/error states
- toast/mutation feedback
- responsive behavior
- reduced-motion behavior
- light-mode structural counterpart

Use a distinct namespace/folder/token layer so the new system cannot silently fall back to legacy styling.

## 6. Visual direction

The founder reference direction is:

- deep matte surfaces
- subtle physical/material realism
- calm dark operational canvas
- layered optical depth
- environmental rather than decorative lighting
- restrained cyan/teal operational accents
- green healthy/completed state
- amber/orange attention/risk state
- red critical/blocked state
- violet/purple AI/intelligence state
- low-contrast separators
- premium typography
- soft environmental shadows
- controlled rounded geometry
- focus layer sharp, supporting layers allowed to recede

The product should feel advanced because it is intelligent, contextual, live, fast, and spatially coherent — not because it is covered in neon or HUD decorations.

Do not copy Apple, Zoho, Star Trek, LCARS, Iron Man, Tony Stark HUDs, or any proprietary trade dress.

## 7. Structural UX requirements

The V5 shell must be materially different from the legacy shell.

### Product-family navigation

Move away from the long admin-style navigation list.

The Org Admin primary structure should converge toward:

- Home
- My Work
- Projects
- People
- Communication
- Time
- Files
- Finance
- Reports
- AI

Role-aware administrative items such as Audit and Organization Settings remain available without dominating daily navigation.

### 1–3 Click Rule

Important daily actions and destinations should normally be reachable in 1–3 interactions.

### Stay-in-Context Rule

Prefer drawers, split views, contextual panels, overlays, and command surfaces over unnecessary page changes.

### Multitasking Rule

The shell must be designed so future/current access to chat, notifications, search, files, AI, people, and work context does not force the user to abandon the current task.

## 8. Org Admin Command Center target

The Command Center is not a generic analytics dashboard.

It is the operational landing surface for running the organization.

It should answer, using only authorized real data:

1. What is happening now?
2. What needs my attention?
3. What should I work on next?
4. What is blocked or at risk?
5. What changed recently?

The composition should include only data-backed surfaces that are actually available, for example:

- active work / next work
- blocked work
- deadlines
- projects needing attention
- notifications / mentions
- recent activity
- approvals where backed
- current work session where backed
- AI briefing only where configured

Do not invent fake team activity, revenue, platform metrics, MRR, health percentages, finance values, or presence.

## 9. Automatic visual FAIL conditions

The V5 pass is an automatic FAIL if the founder screenshot still shows any of the following as the dominant experience:

- white SaaS canvas
- old long sidebar
- old page composition
- generic dashboard grid
- dark cards placed on white background
- giant dead whitespace
- default grey toolbar
- only token/color/shadow changes
- gaming HUD
- permanent neon outlines
- old admin template with new colors

If the difference is not obvious at first glance, the redesign is not complete.

## 10. Browser-first acceptance loop

Playwright Chromium is available and MUST be used.

Before changes:

1. run the app
2. sign in to an Org Admin test context
3. capture baseline screenshot of the current Org Admin shell + Command Center

Then iterate:

IMPLEMENT
→ BUILD/TEST
→ OPEN IN PLAYWRIGHT
→ CAPTURE SCREENSHOT
→ COMPARE AGAINST V5
→ IDENTIFY EXACT FAILURE
→ FIX
→ RETEST
→ RECAPTURE

Repeat until the structural difference is obvious.

Do not declare PASS from code/CSS inspection alone.

Do not use Platform Admin screenshots as proof of Org Admin acceptance.

## 11. Required before/after proof

The final report must include:

- baseline screenshot path/reference
- final screenshot path/reference
- shell before/after description
- navigation before/after description
- information architecture before/after description
- interaction before/after description
- dead-space/density change
- 1–3 click examples
- exact legacy components intentionally not reused

Generated screenshots must remain outside the PR diff if binary handoff does not support them.

## 12. Legacy deletion policy

V5 is a clean cutover, but deletion remains controlled.

During the new shell + Command Center implementation:

1. build new UI Kernel independently
2. switch Org Admin shell + Command Center to the new kernel
3. prove build/tests/browser acceptance
4. scan dependencies
5. remove only legacy UI files/components that now have zero consumers and whose removal is safe
6. leave unmigrated legacy routes compiling until their later migration

Do not keep old visual code merely because it is convenient for the new shell.
Do not delete domain/security/data infrastructure.

## 13. Founder gate

Only two states are allowed:

**V5 COMMAND CENTER CANDIDATE READY FOR FOUNDER REVIEW**

or

**V5 COMMAND CENTER BLOCKED — <specific blocker>**

Codex must not self-approve the founder visual gate.

After founder approval, the new kernel becomes the UI Golden Baseline and is propagated in this order:

1. Project Workspace
2. Communication
3. My Work / Tasks
4. People + Time
5. Files / Evidence
6. Finance
7. Reports / AI / Automation
8. Platform Admin redesign
9. final legacy UI deletion
10. Desktop Agent last

## 14. Anti-drift check before every code batch

Ask:

1. Am I building the new kernel or modifying the old one?
2. Is this a structural UX improvement, not cosmetic styling?
3. Does this preserve domain/security authority?
4. Does this help the 1–3 click or stay-in-context rules?
5. Can I prove the result in the browser?

If #1 is “modifying the old one” without an explicit migration reason, stop and correct course.
