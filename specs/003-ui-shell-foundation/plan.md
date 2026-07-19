# Implementation Plan: UI Shell Foundation

**Branch**: `003-ui-shell-foundation` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-ui-shell-foundation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Stand up HomeBase's shared UI kernel — the visual-language tokens, page
shell, and state patterns every future tool screen (Habits, Expenses,
Groceries, etc.) will render inside — with no tool-specific content of its
own. The visual language and IA constraints (serif/sans pairing, sage
palette, no nav bar, no search, hub-and-spoke navigation) are not designed
here; they are already locked in `DESIGN.md`/`JOURNEY.md` and this feature
implements them in code. Technically: Tailwind CSS v4 (CSS-first `@theme`,
selected this session) generates the design-token layer directly from the
same values `DESIGN.md` already documents; shadcn/ui supplies unstyled
Radix primitives re-themed to match; `next-themes` (selected this session)
drives light/dark switching using the exact `data-theme` attribute
convention already prototyped in the design phase's rendered mocks; and
`AppProviders` wires up TanStack Query scaffolding for future domains
while deliberately *not* wiring up any shared toast component, per this
feature's clarified FR-013.

## Technical Context

**Language/Version**: TypeScript 5.7, `strict` mode (existing
`packages/web/tsconfig.json`: `strict`, `strictNullChecks`,
`noImplicitAny`, `noUncheckedIndexedAccess`) — Constitution Principle I.

**Primary Dependencies**:
- Next.js 15 (App Router) + React 19 — already in `packages/web`.
- Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/postcss`) — CSS-first
  `@theme` config in `styles/globals.css`; no `tailwind.config.ts`. Chosen
  this session over v3 because v4's `@theme` directive makes CSS variables
  *be* the theme definition, the most direct fit for the brief's "CSS
  variables, no hard-coded values" requirement, and it's the current
  shadcn/ui default for new installs (zero migration cost either way,
  since nothing is installed yet).
- shadcn/ui (Radix UI primitives via its CLI) — raw components land in
  `components/ui`, re-themed to Verse Margin (no default shadcn styling
  kept: no radius, no shadow, per `DESIGN.md`'s Never section).
- `next-themes` — light/dark switching. Chosen this session over a
  CSS-only `prefers-color-scheme` approach specifically because FR-015
  requires the example screen to be *verifiably* rendered in both modes,
  which a pure media-query approach can't do without changing OS/devtools
  settings. Configured with `attribute="data-theme"` (not the more common
  `attribute="class"`) to match the exact toggle mechanism already
  prototyped in `.design-foundations/build/2026-07-17-homebase-phase-7-mock.html`
  (`document.documentElement.dataset.theme`), and `defaultTheme="system"`
  with no visible in-app toggle control, since no theme-switch UI exists
  anywhere in `JOURNEY.md`'s locked page specs.
- `@tanstack/react-query` v5 — client-side data-fetching scaffolding
  (FR-012), unused by any domain yet.
- `next/font/google` (Newsreader + Inter) — self-hosted at build time
  (zero runtime request to Google's CDN), matching both the offline-first
  spirit of Constitution Principle IV and standard Next.js App Router
  practice for web fonts.

**Storage**: N/A — this feature touches no database; Drizzle/Postgres are
untouched. (Constitution Principle II does not apply to this feature.)

**Testing**: Vitest (`packages/web`, existing unit-test setup) for shared
component/hook logic per Constitution Principle VII ("shared code used by
multiple modules... MUST have unit tests"), including a token-resolution
test confirming Tailwind token classes resolve to the correct CSS custom
property in both light and dark mode. No dedicated automated check
verifies the implemented tokens against `DESIGN.md` on an ongoing basis —
considered and declined (research.md §3): the existing
`.design-foundations/build/phase5-spec-check.mjs` gate is gitignored and
not reachable from CI, and building a replacement was judged more tooling
than this phase needs (Constitution Principle VIII); design/implementation
drift is caught by code review instead. Playwright (`packages/e2e`)
end-to-end coverage is not required for this phase — there is no real user
flow yet, only an example screen — but a minimal smoke check that
`/styleguide` renders without error is cheap enough to be worth adding at
the tasks stage.

**Target Platform**: Cloudflare Workers via OpenNext (`packages/web`,
Worker `hombase`) — Constitution Principle VI, no separate target. Local
dev via `npm run dev` (real Workers preview via Wrangler/Miniflare, not
`next dev`) per Environment Parity; this feature adds no binding/
infrastructure access, so Environment Parity has nothing new to violate.

**Project Type**: Web application — single Next.js App Router project,
existing `packages/web`. No new package, no new deployment target.

**Performance Goals**: None newly introduced. The spec's Success Criteria
are consistency/correctness-focused (token reuse, identical state
patterns), not latency-focused; this feature inherits the project's
general mobile-first responsiveness expectation (Principle III) without
adding a specific performance budget.

**Constraints**:
- Mobile-first, phone viewport first (Principle III / FR-011).
- No persistent navigation bar, no search — permanent (FR-007/FR-008), not
  a "not yet built" gap.
- No shared visual toast/notification component (FR-013, this session's
  clarification) — confirmations render as an in-place visual change plus
  a screen-reader-only announcement.
- Dark mode is in scope now, OS-detected by default with no visible
  in-app toggle, but with a forceable override for verification (FR-015).
- **PWA installability (manifest + service worker) remains an open
  project-wide gap** (tracked in `CLAUDE.md`'s roadmap; `next-pwa` not yet
  wired anywhere). This feature does not close it — see Constitution
  Check below for why that's permitted here specifically, and
  Complexity Tracking for the tracked follow-up commitment.

**Scale/Scope**: Shared/kernel code only — `components/ui`,
`components/shared`, `lib/`, `providers/`, `styles/`, plus one example
route (`app/styleguide/`). No `domains/` folder, no new database table, no
new API route. Household scale (currently 2 people, no hard cap) has no
bearing on this feature's scope since it holds no data.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Strict TypeScript Everywhere | PASS | Existing `strict` tsconfig carries over unchanged; shared components get explicit prop types, no `any`/`!`. |
| II. Consistent Drizzle Schema Conventions | N/A | No database access in this feature. |
| III. Mobile-First, Responsive by Default | PASS | FR-011 states this directly; the example screen and every shared pattern are built and verified at phone width first. |
| IV. Installable, Reliable PWA | **DEFERRED (permitted)** | No manifest/service worker added here. Permitted under the constitution's Bootstrap Sequencing Exception *only* because this feature ships no real tool/module (spec Assumptions state this explicitly) — the exception's own condition ("No real product/module feature may be built while a Principle IV gap remains open") means the **next** feature that ships an actual tool MUST close this gap first or alongside it. Tracked in Complexity Tracking below. `next/font` self-hosting is chosen now partly because it's compatible with an eventual service-worker-cached app shell, so this phase doesn't work against that follow-up. |
| V. Consistent Route Handler API Conventions | N/A | No new Route Handler is added by this feature. |
| VI. Cloudflare Workers Runtime Constraints | PASS | All new dependencies (Tailwind v4, shadcn/ui, next-themes, TanStack Query, next/font) are either build-time-only or small client-side React code — nothing needs Node-only runtime APIs inside a Worker. Single deployment target preserved; no new service introduced. |
| VII. Pragmatic Testing | PASS | `components/shared`, `lib/query-client.ts`, `lib/api-client.ts`, and `providers/app-providers.tsx` are shared code used by every future module — Vitest coverage required, including a token-resolution test. No automated design-doc-vs-implementation drift check is added (research.md §3) — judged unnecessary tooling for this phase; ordinary code review covers it (Principle VIII). |
| VIII. Simplicity Over Premature Abstraction | PASS | The FR-013 clarification (drop the toast component) is a direct application of this principle — no dependency without a concrete current need. `domains/` is explicitly not created yet. |

**Additional Constraints check**: Single deployment target — preserved
(no new service). Auth/storage stay managed — untouched, N/A. Module
isolation — N/A (no domains yet). Accessibility baseline — inherited
directly from `DESIGN.md`'s already contrast-checked tokens, transcribed
by hand (T012-T015) and spot-checked by the Vitest token-resolution test;
no automated drift guard beyond that (see Testing above).

One DEFERRED item (Principle IV) is tracked explicitly in **Complexity
Tracking** below, per governance ("unresolved conflicts MUST be simplified
away or the constitution amended first, not silently bypassed"). It is a
staged, tracked gap with a committed follow-up, not silent non-compliance
— consistent with how `specs/001-foundational-infra/plan.md` handled the
same principle during that feature.

*Post-Phase-1 re-check: unchanged — nothing in Phase 0/1 design introduced
a new gate or resolved the PWA deferral differently than stated above.*

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-shell-foundation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/web/
├── app/
│   ├── layout.tsx                  # Updated: wraps {children} in AppProviders,
│   │                                #   sets suppressHydrationWarning for next-themes
│   └── styleguide/
│       └── page.tsx                 # Example/placeholder screen (FR-009) — renders
│                                     #   inside the shell, no tool-specific content
│
├── components/
│   ├── ui/                          # Raw shadcn/ui primitives (button, input, card,
│   │   └── ...                      #   badge, skeleton, ...) — unopinionated, themed
│   │                                 #   via CSS variables only, no HomeBase-specific
│   │                                 #   composition logic (FR-014)
│   └── shared/
│       ├── page-header.tsx          # PageHeader: oversize punctuation mark + title +
│       │                            #   back-to-hub affordance (FR-006)
│       ├── loading-state.tsx        # Shared Loading pattern (FR-003)
│       ├── empty-state.tsx          # Shared Empty pattern (FR-004)
│       └── error-state.tsx          # Shared Error pattern (FR-005)
│
├── lib/
│   ├── query-client.ts              # TanStack Query client factory (FR-012)
│   └── api-client.ts                # Shared fetch wrapper (FR-012)
│
├── providers/
│   └── app-providers.tsx            # AppProviders: QueryClientProvider + next-themes
│                                     #   ThemeProvider. Deliberately no toaster (FR-013).
│
├── styles/
│   └── globals.css                  # Tailwind v4 @theme block; :root (light) +
│                                     #   [data-theme="dark"] token values, transcribed
│                                     #   verbatim from DESIGN.md's DTCG blocks
│                                     #   (FR-001, FR-002, FR-015) — see research.md §3
│                                     #   for the source-of-truth reference used.
│
├── components.json                  # shadcn/ui CLI config (new)
├── postcss.config.mjs               # Tailwind v4 PostCSS plugin (new)
└── package.json                     # + tailwindcss, @tailwindcss/postcss, shadcn's
                                      #   runtime deps (Radix packages as added),
                                      #   next-themes, @tanstack/react-query
```

**Structure Decision**: Everything lands inside the existing single
Next.js App Router project (`packages/web`) — no new package, matching
Constitution Principle VI's single-deployment-target rule and this
project's existing monorepo layout. Within `packages/web`, the feature
follows the exact `components/ui` / `components/shared` / `lib/` /
`providers/` / `styles/` split specified in the original brief: `ui` holds
unopinionated primitives, `shared` holds HomeBase-specific composed
patterns (the three state patterns, the page shell), and no `domains/`
folder is created yet — this phase is kernel code only.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| No PWA manifest/service worker (Principle IV) in this feature | This feature is shell/kernel infrastructure with no tool-specific content (spec Assumptions state this explicitly) — the same bootstrapping rationale `001-foundational-infra` used for the same principle. Building PWA installability into a feature that has no real screen to make installable yet would front-load work with nothing concrete to validate it against. | Wiring a manifest/service worker now, before any real tool screen exists to cache/verify offline, would mean guessing at what "the app shell" needs to cache rather than building it against a real one. Per the constitution's Bootstrap Sequencing Exception, this gap is permitted **only** until the first real tool module ships — that feature MUST close this gap first or alongside it; it MUST NOT be deferred again. |
