# Work OS — Visual Benchmark V6

Status: LOCKED — founder visual benchmark

## Purpose

This document defines the visual quality bar for Work OS V6.

The target is not to copy another product's layout, branding, assets, iconography, or trade dress. The target is to reach the same perceived level of material realism, optical depth, environmental lighting, premium composition, and interaction polish shown in the founder-approved benchmark reference.

Current V5 is approximately 25% toward the target. V6 exists to close the visual-quality gap before broad module migration.

## Core Benchmark

Work OS must feel like a physically believable, premium digital operating environment.

The benchmark quality is defined by four non-negotiable characteristics:

1. Material realism
   - Panels should feel like coherent physical surfaces, not flat rectangles.
   - Use subtle matte response, soft internal gradients, barely visible texture, controlled highlights, and believable edge treatment.
   - Avoid glossy glass as the default material.

2. Optical depth
   - Separate focus layer, mid layer, background layer, and environment.
   - Primary work stays sharp.
   - Secondary layers may recede slightly through contrast, softness, depth, or shadow.
   - The UI should feel spatial without fake 3D gimmicks.

3. Environmental lighting
   - Light should feel like it comes from the environment, not from decorative CSS borders.
   - Cyan/teal, amber/orange, violet, green, and red illumination must be contextual and state-driven.
   - Light may softly catch edges, corners, and nearby surfaces.
   - No permanent neon outlines.

4. Premium composition
   - Every screen needs deliberate scale, spacing, density, rhythm, and focal hierarchy.
   - Avoid large dead regions, generic grids, dashboard-card repetition, and arbitrary alignment.
   - Primary work must dominate. Supporting information should guide attention, not compete with it.

## Visual Language

### Matte first

Use deep matte surfaces as the default. Surfaces can have subtle acrylic/frosted response, but they must remain calm and premium.

### Edge light second

Edge illumination exists only where it communicates active state, focus, live activity, attention, warning, AI, or environmental light catch.

### Optical depth always

Foreground content must separate from supporting context and background environment.

### Cinematic restraint

High-tech does not mean gaming HUD. Avoid sci-fi grids, scanlines, fake radar, oversaturated gradients, excessive glow, and novelty motion.

### Color balance

- cyan/teal = active/live/operational
- green = healthy/completed
- amber/orange = attention/risk
- red = blocked/critical
- violet/purple = AI/intelligence
- neutral warm highlights may be used sparingly for premium environmental balance

## Shell Quality Bar

The Work OS shell must feel like a premium operating frame, not an admin wrapper.

Required:

- compact product-family navigation
- premium top/system bar
- visible global command/search
- organization context
- contextual right-side panel capability
- strong dark-first canvas
- optical separation between navigation, system bar, work surface, and contextual overlays
- subtle environmental lighting and shadowing
- smooth, restrained transitions
- no giant empty black voids

The shell must not merely be a black background with teal icons.

## Command Center Quality Bar

The Command Center is the first flagship proof screen.

It must feel like a living operations cockpit.

Required visual hierarchy:

- operating state / system context
- current work and execution priority
- attention / blockers
- recent signals / changes
- contextual intelligence
- meaningful action surfaces

The screen should not read as:

header + KPI cards + empty area + random panels

It should read as one coordinated workspace with a clear visual focal path.

## Interaction Quality Bar

The premium feeling must come from behavior as well as styling.

Required:

- hover/focus states with subtle material response
- contextual edge-light response on active items
- smooth drawers and split-context panels
- command surface that feels first-class
- selection/focus depth
- task/work rows that visibly react to state
- reduced-motion support
- keyboard usability

No meaningless animation.

## Typography

Typography must feel intentionally composed.

Required:

- strong title/body hierarchy
- compact operational labels
- readable dense information
- careful letter spacing
- restrained use of uppercase micro-labels
- consistent number styling
- no giant decorative headings that waste space

## Density and Spacing

Work OS is a serious work product used for long periods.

Required:

- dense but breathable layout
- no oversized empty canvases
- no excessive vertical padding
- no giant single-purpose cards
- compact rows and clear grouping
- consistent spatial rhythm

## Layer Model

Use four conceptual layers:

1. Focus layer
   - current task, work queue, active conversation, primary project context
   - sharpest and highest contrast

2. Mid layer
   - secondary panels, project context, supporting metrics, related people/files
   - slightly quieter

3. Background layer
   - shell environment, supporting navigation, inactive context
   - lower contrast

4. Environment
   - subtle ambient light, shadow, depth, atmosphere
   - never distracts from work

## Material Tokens to Establish

The V6 implementation should introduce or refine explicit tokens for:

- canvas/background
- surface-0 / surface-1 / surface-2
- surface highlight
- surface shadow
- edge neutral
- edge active
- edge attention
- edge blocked
- edge AI
- ambient cyan
- ambient warm
- text primary
- text secondary
- text muted
- separator
- focus ring
- radius scale
- shadow/depth scale
- blur/focus scale

## Automatic Fail Conditions

V6 FAILS if any flagship screenshot still looks like:

- flat dark SaaS
- admin template
- black background + teal icons
- white cards on dark canvas
- dark cards on empty canvas
- repeated generic rectangles
- huge unused space
- CSS glow used as decoration
- no visible depth separation
- no environmental lighting
- typography that still feels default/generic
- old page composition with new colors

If any fail condition is present, continue iterating.

## Browser-First Acceptance

Playwright Chromium is required.

For each flagship pass:

1. capture current production-like screenshot
2. identify visual failures against this document
3. implement one focused correction batch
4. rebuild and rerun
5. capture new screenshot
6. compare side-by-side
7. continue until the visual delta is obvious

Do not self-approve from code inspection alone.

Temporary screenshots must stay outside Git.

Recommended location:

`/tmp/workos-v6-review/`

## V6 Scope

This benchmark pass applies first to:

1. V5 Org Admin shell
2. Org Admin Command Center

Do not broadly migrate every module until these two surfaces meet the benchmark.

After founder approval, the same visual language becomes the authority for:

- Project Workspace
- My Work / Tasks
- Communication
- People
- Time
- Files
- Finance
- Reports
- AI

## Architecture Guardrails

V6 is a visual/interaction refinement only.

Do not:

- change Supabase schema
- add migrations
- weaken RLS/RBAC
- alter domain authority
- replace repositories/use-cases
- invent fake operational data
- touch main

## Acceptance Statement

V6 is ready for founder review only when the shell and Command Center visibly demonstrate:

- material realism
- optical depth
- environmental lighting
- premium composition
- clear focus hierarchy
- strong interaction polish
- reduced dead space
- coherent Work OS identity

The benchmark is a quality target, not a layout template.
