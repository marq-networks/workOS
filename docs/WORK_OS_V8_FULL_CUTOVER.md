# Work OS — V8 Full UI/UX Cutover

Status: LOCKED EXECUTION SPEC
Branch: `v2/functional-build`

## Mission

Replace the customer-facing legacy presentation and interaction system with one coherent V8 Work OS experience across the product.

This is not a page-by-page cosmetic migration.

The founder benchmark images are the absolute quality target for both UI and UX. The target is to match the benchmark quality as closely as possible — including color family, material realism, depth, lighting, typography quality, spatial hierarchy, interaction polish, and overall premium feel — without copying the benchmark's exact layout, branding, text, icons, charts, or trade dress.

## Non-negotiable outcome

The final customer Work OS must feel like one operating environment, not a new shell wrapped around old pages.

The cutover must remove legacy presentation and legacy page-centric interaction behavior from every migrated customer-facing route while preserving domain logic, repositories, trusted mutations, RLS/RBAC, organization scoping, and server authority.

## UI target

Use the founder benchmark as the governing visual system.

Required qualities:

- deep matte dark base
- benchmark-aligned cool cyan/teal operational accents
- restrained warm amber/orange environmental light
- violet intelligence/AI accents
- green healthy/completed states
- red critical/blocked states
- believable material thickness and edge response
- focus, mid, background, and environment layers
- environmental light that influences nearby surfaces
- premium typography and numeric styling
- dense but breathable information composition
- restrained motion and hover/focus response
- no flat SaaS card grids
- no giant empty canvases
- no white legacy surfaces inside dark shell
- no glow used as decoration

## Light mode target

Light mode is an authored material system, not a brightness inversion.

Required:

- warm/cool off-white environment rather than pure white
- defined surface elevations
- restrained shadow and edge contrast
- strong readable typography
- benchmark-aligned cyan, amber, violet, green, and red semantics
- no foggy bloom
- no washed-out cards
- no grey prototype look

Dark and light must share the same component and UX grammar.

## UX target

The UX must change as materially as the UI.

### Global UX laws

1. **1–3 interaction rule**
   Common work should normally be reachable in one to three interactions.

2. **Stay in context**
   Prefer drawers, split views, inspectors, overlays, contextual panels, command surfaces, and inline actions over unnecessary page navigation.

3. **Object-centric work**
   The main objects are Project, Milestone, Task, Work Chunk, Person, Conversation, File, Time Session, Finance Record, Report, AI Insight, and Decision.

4. **Persistent context**
   Project/task/person/file/conversation context should remain visible when users move between related work.

5. **Multitasking**
   Users should be able to work while accessing chat, files, people, time, AI, notifications, approvals, and search without repeatedly losing their place.

6. **Truth**
   Never fabricate data or capability. Unsupported functionality must show an honest unavailable/not-configured state.

## V8 foundation authority

All migrated customer-facing modules must use the same V8 primitives/tokens for:

- shell
- system bar
- navigation
- command/search
- drawers
- inspectors
- surface elevations
- forms
- controls
- tables/lists where needed
- object rows
- empty/loading/error states
- status/attention/intelligence treatment
- responsive behavior
- motion
- dark/light themes

Module-specific visual systems are forbidden unless approved by the founder.

## Full customer product cutover

Cut over the customer Work OS as one coordinated migration program.

### Home / Command Center

Must become the live operational entry point, not a KPI dashboard.

### My Work / Task Execution

Must become a personal execution cockpit with focus/now/next/blocked/completed/archived views backed by real data. Task inspection stays in context. Real subtasks/work chunks are shown when available; Work OS must never invent chunk data.

### Projects / Project Workspace

Canonical workspace tabs:

`Overview | Plan | Tasks | Milestones | Team | Conversations | Files | Time | Activity | Finance | Reports | AI`

The project must feel like one persistent operating room rather than 11 unrelated pages.

### Communication

Build a serious collaboration workspace with conversation rail, active conversation, composer, contextual work panel, project/task/file/person context, and honest call/video/screen-share capability states where infrastructure is not yet implemented.

### People

Replace legacy member lists with a proper workforce workspace using real role, department, membership, current work, project, workload, time, activity, communication, and permission context where backed.

### Time

Use real work sessions/time entries. Make start/stop, task/project linkage, history, review/correction, approvals, and reporting coherent. Do not implement deferred surveillance features in this cutover.

### Files & Evidence

Create contextual file/evidence UX for project/task/conversation work, using real backing only.

### Finance

Integrate approved finance context into Work OS. Do not invent financial data or silently re-enable deferred punitive/fines concepts.

### Reports

Replace legacy report-card catalogs with integrated, filterable, drillable report workflows.

### AI

AI must feel native and contextual. READ/DRAFT/EXECUTE authority rules remain enforced; EXECUTE requires permission, confirmation, trusted mutation, and audit.

### Settings / Admin customer surfaces

Move organization settings, membership, invitations, departments, permissions, automation controls, and audit into V8 language.

## Legacy cutover rule

Do not delete working domain/business logic just because its old screen is removed.

For each customer-facing route:

1. route it to a V8 composition
2. reuse or adapt existing domain hooks/repositories/use-cases
3. stop rendering the legacy UI component
4. mark old presentation components as `DELETE LATER`
5. verify zero active customer-route consumers
6. delete legacy presentation only after the cutover is proven

Legacy UI must not remain visible anywhere in the customer Work OS after cutover.

## Platform Admin

Platform Admin is not part of this customer Work OS cutover. Do not accidentally grant Platform Admin access to customer Work data. Redesign Platform Admin separately after customer Work OS stabilizes.

## Security and architecture guardrails

Preserve:

- Supabase
- RLS and FORCE RLS where already established
- RBAC
- organization/tenant boundaries
- trusted mutations
- optimistic concurrency/server authority
- repository/use-case boundaries
- task lifecycle rules
- real authorization semantics

Do not:

- replace server authority with browser/local state
- weaken RLS/RBAC
- invent permissions
- touch `main`
- add fake production data
- add destructive migrations without an explicit product need
- implement deferred screenshot surveillance/keystroke scoring/punitive productivity scoring

## Benchmark loop

The benchmark images must be attached to the implementation task and used continuously.

For every major V8 area:

`render → screenshot → compare to benchmark → identify UI gap → identify UX gap → fix → retest → rerender`

The implementation must not stop after one pass.

Screenshots remain outside Git under `/tmp/workos-v8-cutover/`.

## Automatic fail conditions

The cutover fails if any customer-facing route still visibly contains:

- legacy white/grey page surfaces
- generic SaaS cards
- old admin tables/forms without V8 treatment
- old chat layout
- old task-list UX
- old report catalog UX
- old navigation grammar
- page-centric workflows that should stay in context
- inconsistent module colors/themes
- flat black canvas + teal icons
- large meaningless empty regions
- fake capability/data

It also fails if dark mode is polished but light mode remains a washed-out inversion.

## Acceptance target

The founder target is 100% convergence in **quality and experience**, not pixel-for-pixel copying.

Internal implementation scoring is not approval.

Only founder review can approve the final UI/UX.

## Validation

At minimum run:

- `npm run typecheck:baseline`
- `npm run lint:baseline`
- `npm test`
- `npm run build`
- `npm run check:bundle`
- `git diff --check`
- relevant Playwright route/workflow suites
- V8 screenshot coverage in dark and light

Existing historical diagnostic ratchets may be reported separately, but new V8 errors are not acceptable.

## Final stop condition

The V8 customer cutover is ready for founder review only when:

- all active customer-facing Work OS routes render through V8
- no active customer route exposes the legacy visual system
- dark and light both use authored V8 material systems
- UX materially follows 1–3 interactions and stay-in-context principles
- Project, Task, Communication, People, Time, Files, Finance, Reports, and AI feel connected
- real domain logic/security remain intact
- unsupported capability remains truthful
- benchmark comparison shows an obvious, system-wide transformation

Do not self-approve.

Final implementation report must end with:

`V8 FULL CUTOVER READY FOR FOUNDER REVIEW`

or

`V8 FULL CUTOVER BLOCKED — <specific blocker>`
