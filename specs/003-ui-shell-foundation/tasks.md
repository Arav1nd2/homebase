# Tasks: UI Shell Foundation

**Input**: Design documents from `/specs/003-ui-shell-foundation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/shared-components.md, quickstart.md (all present)

**Tests**: Not a TDD gate — spec.md didn't request one. Unit-test tasks are
included only where Constitution Principle VII makes them mandatory
(shared code used by multiple future modules: `components/shared`,
`lib/*`, `providers/*`). `components/ui` (vendored shadcn/ui primitives)
gets no bespoke tests. No automated design-doc-vs-implementation drift
check is included by design (research.md §3, considered and declined) —
token fidelity relies on careful transcription plus the ordinary Vitest
token-resolution test, not a bespoke gate.

**Organization**: Tasks are grouped by user story (US1/US2/US3, matching
spec.md's priorities) so each is independently implementable and
testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an
  incomplete task)
- **[Story]**: Which user story this task belongs to (US1/US2/US3)
- File paths are relative to the repo root unless noted

---

## Phase 1: Setup

**Purpose**: Get the new dependencies and directory scaffolding in place. No tokens, no components yet.

- [X] T001 Add `next-themes` and `@tanstack/react-query` to `packages/web/package.json` dependencies and install
- [X] T002 Add Tailwind v4 (`tailwindcss`, `@tailwindcss/postcss`) to `packages/web/package.json` and create `packages/web/postcss.config.mjs` registering the `@tailwindcss/postcss` plugin (depends on T001 for a clean single install pass)
- [X] T003 Initialize shadcn/ui via its CLI (base: Radix, preset: Nova — the CLI's style-preset system replaced the old new-york/default choice since research.md was written; CSS variables enabled) creating `packages/web/components.json` (depends on T002). Required a minimal `styles/globals.css` with the Tailwind import to exist first (pulled forward from T006) — the CLI's Tailwind-detection preflight check fails without it.
- [X] T004 Add the `skeleton` and `button` primitives via the shadcn/ui CLI into `packages/web/components/ui/` (depends on T003)
- [X] T005 [P] Create empty kernel directories: `packages/web/components/shared/`, `packages/web/lib/`, `packages/web/providers/`, `packages/web/styles/`

**Checkpoint**: Dependencies installed, shadcn/ui CLI usable, kernel directories exist.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wiring every user story needs to render at all — the token *mechanism*, the provider tree, and the scaffolding FR-012 requires. No visual-language values yet (that's US1) and no shared components yet (US2/US3).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 [P] Create `packages/web/styles/globals.css` with `@import "tailwindcss";`, an empty `@theme {}` block, the `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` rule (research.md §1 — required for `next-themes`' attribute-based override to work under Tailwind v4), a base reset (`box-sizing`, margin/padding), and the `@media (prefers-reduced-motion: reduce)` block from spec.md's Edge Cases. (Pulled forward before T003 — shadcn's CLI preflight requires a Tailwind-wired CSS file to already exist. shadcn's own init then merged its Nova-preset default tokens and a `.dark` class block into this file; both get replaced by real DESIGN.md values and the `.dark` duplicate is deleted in T012-T016.)
- [X] T007 [P] Create `packages/web/lib/query-client.ts` exporting `getQueryClient()` per research.md §6 (per-request `QueryClient` on the server via `React.cache`, a browser singleton) and `contracts/shared-components.md`
- [X] T008 [P] Create `packages/web/lib/api-client.ts` exporting `apiClient<T>(path, init?)` per `contracts/shared-components.md` — scaffolding only, not called from anywhere yet (FR-012)
- [X] T009 Create `packages/web/providers/app-providers.tsx` composing a `next-themes` `ThemeProvider` (`attribute="data-theme"`, `defaultTheme="system"`) and a TanStack `QueryClientProvider` backed by `getQueryClient()` (T007) — explicitly no toast/notification provider or export (FR-013; depends on T007)
- [X] T010 Extend `packages/web/providers/app-providers.tsx` to read a `?theme=` URL query param and call `next-themes`' `setTheme()` on mount when present, as a verification-only override with no visible UI control (research.md §2, FR-015; depends on T009)
- [X] T011 Update `packages/web/app/layout.tsx` to import `styles/globals.css`, add `suppressHydrationWarning` to `<html>`, and wrap `{children}` in `AppProviders` (depends on T006, T010)

**Checkpoint**: App builds and boots through `AppProviders`; theme-switching mechanism and query/api-client scaffolding exist; no design tokens or shared UI components exist yet.

---

## Phase 3: User Story 1 - One shared visual language for every future screen (Priority: P1) 🎯 MVP

**Goal**: Type scale, spacing scale, and color palette defined once, in both light and dark mode, sourced verbatim from `DESIGN.md`, consumed only through Tailwind utilities/CSS variables — never hardcoded per screen.

**Independent Test**: Compose two minimal elements using the shared tokens (no page shell needed yet) and confirm both resolve identical values with zero hardcoded overrides; the Vitest token-resolution test (T018) passes in both modes.

### Implementation for User Story 1

- [X] T012 [US1] Populate `packages/web/styles/globals.css`'s `:root` block with `DESIGN.md`'s global + alias **color** tokens (light mode), transcribed verbatim from its `<!-- dtcg:global -->`/`<!-- dtcg:alias -->` blocks — use `.design-foundations/build/2026-07-17-homebase-phase-7-mock.html`'s `:root` block (research.md §3) as the cross-check reference, not a fresh re-read of prose
- [X] T013 [US1] Populate `packages/web/styles/globals.css`'s `[data-theme="dark"]` block with `DESIGN.md`'s dark-mode color values, same source (depends on T012 — same file)
- [X] T014 [US1] Add the type-scale variables (`--font-display`, `--font-body`, `--text-xs` … `--text-5xl`, `--leading-*`, `--font-weight-*`) to `packages/web/styles/globals.css`, verbatim from `DESIGN.md`'s §Type scale (depends on T013 — same file). Placed inside `@theme {}` directly rather than `:root` (folded into T016) — these are mode-independent, and `@theme` already compiles to real root-level custom properties while also generating the matching Tailwind utilities in one step; duplicating them in a separate `:root` block would have created a self-referencing `var()`.
- [X] T015 [US1] Add the spacing-scale variables (`--space-1` … `--space-9`, `--tap-target`, `--glyph`, `--hairline`) to `packages/web/styles/globals.css`'s `:root` block, from `DESIGN.md`'s §Design system global tier (depends on T014 — same file). Not aliased into `@theme` — DESIGN.md's 1-9 steps already equal Tailwind's own default 4px-multiplier scale at each step, so ordinary utilities (`p-6`, `gap-3`) already match; the named tokens (`--tap-target`, `--glyph`, `--hairline`) are consumed via arbitrary-value syntax (`min-h-[var(--tap-target)]`) where needed.
- [X] T016 [US1] Map every color variable added in T012-T013 into the `@theme {}` block in `packages/web/styles/globals.css` so components consume them as Tailwind utility classes (e.g. `text-3xl`, `bg-accent-9`), not raw `var()` (FR-001; depends on T015 — same file). Also bridges shadcn/ui's expected role names (`--color-primary`, `--color-muted`, etc.) to our tokens, and zeroes `--radius` app-wide per DESIGN.md's no-radius rule.
- [X] T017 [P] [US1] Wire Newsreader + Inter via `next/font/google` in `packages/web/app/layout.tsx` and connect their generated CSS variables to the `--font-display`/`--font-body` tokens (depends on T016). Newsreader loaded at weight 400 only — DESIGN.md reserves medium/semibold for Inter exclusively.
- [X] T018 [P] [US1] Add a Vitest test at `packages/web/tests/unit/design-tokens.test.ts` (`.ts`, not `.tsx` — no JSX needed) asserting `globals.css`'s token declarations are present and internally consistent (light/dark overrides exist, aliases reference Tier 1 only, radius is zeroed) (Constitution Principle VII; depends on T016). **Deviation from the original plan**: jsdom's CSSOM doesn't reliably resolve CSS custom properties through `getComputedStyle`, so "render an element, assert computed style" isn't actually verifiable in this test environment — this is a source-text regression test instead (guards against a future edit silently dropping a token), explicitly **not** the DESIGN.md-vs-implementation drift check that was considered and declined (research.md §3). Real computed-style/visual verification happens via the browser in quickstart.md's manual steps and T033's Playwright check. Required adding `jsdom` + `@testing-library/react` + `@testing-library/jest-dom` as dev dependencies and extending `vitest.config.ts` (`environmentMatchGlobs` for `.test.tsx` files, `include` glob widened to `.test.{ts,tsx}`) — this project had no component-testing infra before; T022/T026 (React Testing Library render tests) depend on it too.

**Checkpoint**: The token system is complete and verified in both modes via T018 — independently testable with no UI component built yet.

---

## Phase 4: User Story 2 - One consistent loading, empty, and error pattern everywhere (Priority: P2)

**Goal**: One shared component per state (Loading, Empty, Error), each reused identically by every future screen — no per-tool variants.

**Independent Test**: Render each of the three components with different caller-supplied content and confirm identical structural/visual treatment; confirm none accepts a styling override prop.

### Implementation for User Story 2

- [X] T019 [P] [US2] Create `packages/web/components/shared/loading-state.tsx` per `contracts/shared-components.md`'s `LoadingStateProps`, built on the shadcn `skeleton` primitive (T004). Overrides shadcn's default `animate-pulse` with `animate-none` — DESIGN.md's Motion section forbids ambient/looping motion, which a perpetually pulsing skeleton would violate for an unbounded-duration loading state.
- [X] T020 [P] [US2] Create `packages/web/components/shared/empty-state.tsx` per `contracts/shared-components.md`'s `EmptyStateProps` — `message` is caller-supplied (DESIGN.md's "empty states set as short verse" copy is a per-tool concern, not hardcoded here), rendered inside the 96px bracket frame `DESIGN.md`'s signature move specifies for empty states
- [X] T021 [P] [US2] Create `packages/web/components/shared/error-state.tsx` per `contracts/shared-components.md`'s `ErrorStateProps`, including the optional `onRetry` affordance (same tap, not a separate recovery flow — JOURNEY.md's repeated retry rule). Uses a single bottom hairline + flat error-tint fill, not a bordered box — DESIGN.md's Never section permits hairline dividers only, never card/panel chrome.
- [X] T022 [US2] Add Vitest + Testing Library tests in `packages/web/tests/unit/state-patterns.test.tsx` covering `loading-state.tsx`, `empty-state.tsx`, and `error-state.tsx`: confirm consistent structure across all three and confirm none accepts a `className`/style-override prop (Constitution Principle VII; depends on T019-T021). Required fixing two more test-infra gaps discovered here: Vitest's esbuild transform doesn't understand `tsconfig.json`'s `"jsx": "preserve"` (Next.js/SWC-specific) and needs `esbuild: { jsx: "automatic" }` in `vitest.config.ts`; and since this project's Vitest config doesn't enable `test.globals`, Testing Library's automatic per-test `cleanup()` never registers, so it's called explicitly via `afterEach`. Also added `@testing-library/user-event` as a dev dependency.

**Checkpoint**: User Stories 1 AND 2 both work independently — tokens exist and are unit-tested, and the three state patterns are visually consistent and unit-tested, with no page shell built yet.

---

## Phase 5: User Story 3 - A calm first impression with no navigation clutter (Priority: P3)

**Goal**: The base page shell (`PageHeader`: mark + title + back-to-hub affordance) and one example screen composing US1's tokens and US2's state patterns — with no nav bar or search anywhere.

**Independent Test**: Render `/styleguide` and confirm the serif mark, sage palette, sans body text, and back-to-hub affordance are present in both light and dark mode, and confirm no nav bar or search control exists anywhere in the shell.

### Implementation for User Story 3

- [X] T023 [US3] Create `packages/web/components/shared/page-header.tsx` per `contracts/shared-components.md`'s `PageHeaderProps` — `mark` optional and `aria-hidden`, `title` required, back-to-hub affordance always rendered as a plain-text link (research.md §7 — no existing mock shows this placement, so it's designed fresh against `DESIGN.md`'s hairline/no-chrome rules) at `--tap-target` minimum height (depends on T016 for tokens, T011 for the shell to render inside). Uses `next/link`'s `Link`, not a raw `<a>` — required by this repo's ESLint config (`@next/next/no-html-link-for-pages`).
- [X] T024 [US3] Create `packages/web/app/styleguide/page.tsx` rendering `PageHeader` plus one instance each of `LoadingState`, `EmptyState`, and `ErrorState` (FR-009), with a Next.js `metadata` export for the title, and no tool-specific content (depends on T019, T020, T021, T023). The error example omits `onRetry`: a Server Component page can't pass a function prop across the boundary to `ErrorState`'s client-side button; that behavior is already covered by `tests/unit/state-patterns.test.tsx`, not re-demonstrated here. Uses mark "†" — deliberately not any real tool's assigned mark (`*` Habits, `§` Expenses, `‡` Food Reviews, `"` Movies & TV per the phase-5 mock's data), since this page has no tool identity of its own.
- [X] T025 [US3] Confirm the `?theme=` override (T010) works end-to-end on `/styleguide` (`packages/web/app/styleguide/page.tsx`) so both modes are forceable for verification (FR-015 acceptance scenario 2; depends on T024). Code-level confirmed: `ThemeQueryOverride` is mounted app-wide inside `AppProviders` (`app/layout.tsx`), not scoped away from this route. Live browser confirmation happens in T032, since this repo's own middleware requires the real `npm run dev` Workers-preview stack — confirmed directly: `next start` alone 500s (`getCloudflareContext` called without `initOpenNextCloudflareForDev`), validating why `CLAUDE.md` rules out a `next dev`/`next start` shortcut here.
- [X] T026 [P] [US3] Add a Vitest test in `packages/web/tests/unit/page-header.test.tsx` confirming the back-to-hub affordance is always rendered and the `mark` prop, when present, is `aria-hidden` (Constitution Principle VII; depends on T023)
- [X] T027 [US3] Manually verify, per `quickstart.md` steps 1-2, that `packages/web/app/styleguide/page.tsx` has no persistent navigation bar and no search control anywhere, checked at a 375×667 viewport (the smallest currently-supported iPhone) first, then at larger widths (FR-007, FR-008, FR-011; depends on T024). Source-level confirmed now (`page-header.tsx`, `app/styleguide/page.tsx`, and `AppProviders` contain no nav/search markup anywhere); live visual confirmation folded into T032's full quickstart run.
- [X] T028 [US3] Review `packages/web/components/shared/page-header.tsx`, `empty-state.tsx`, `error-state.tsx`, and `packages/web/app/styleguide/page.tsx` for nagging phrasing, gamification mechanics, notification badges, or streak-shaming patterns and confirm none exist (FR-010; depends on T023, T024). Confirmed — all copy ("HomeBase", "Nothing here yet. This space is waiting, not broken.", "That didn't save. Try again.", "Retry", "Loading") is plain-register with no blame, exclamation, badges, or streak language.

**Checkpoint**: All three user stories are independently functional — tokens, state patterns, and the page shell compose into one verifiable example screen with no nav bar or search anywhere.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide verification and documentation cleanup once all three stories are done.

- [X] T029 [P] Remove the "Known loose end" paragraph about unconfigured shadcn/ui and Tailwind from `CLAUDE.md`, since this feature resolves it. Replaced with a short "UI shell foundation" architecture note (matching the file's existing style) so future sessions know what exists and where.
- [X] T030 Run `npm run lint` and `npm run typecheck` from the repo root and fix any violations introduced by this feature. Both clean across all three workspaces (web, send-email, e2e).
- [X] T031 Confirm no toast/notification dependency or component was introduced anywhere under `packages/web/providers/`, `packages/web/components/`, or `packages/web/package.json`, per `quickstart.md` step 3 (FR-013). Confirmed — only explanatory comments match, no dependency or component.
- [X] T032 Run the full `quickstart.md` validation (all 6 steps) against the running app and record the results. Ran via the real stack (`db:start` → `db:migrate:local` → `build:workers` → `preview:workers`, per Environment Parity — confirmed directly that `next start` alone 500s with `getCloudflareContext` called without `initOpenNextCloudflareForDev`, validating why this repo has no `next dev` shortcut). Verified with a real browser (Playwright) at a 375×667 viewport: serif mark + title + sage palette render correctly in light mode; `?theme=dark` sets `data-theme="dark"` on `<html>` after hydration and dark-mode tokens render with correct contrast, no unstyled elements; accessibility snapshot confirms zero `navigation`/`search` roles and correct `banner`/`main`/`status`/`alert` landmarks; token/toast/lint/typecheck checks all pass. **One real bug found and fixed during this step**: `/styleguide` initially 307-redirected to `/login` — `middleware.ts` protects every page by default and had no exemption for it, contradicting spec.md's Assumption that it needs no sign-in. Added `pathname !== "/styleguide"` alongside the existing `/login` exemption. **Pre-existing, unrelated issue observed**: a `ReferenceError: __name is not defined` console error occurs on every page including `/login` (confirmed before this feature existed) — an OpenNext/Workers bundling quirk, out of scope for this feature.
- [X] T033 [P] Add a minimal Playwright smoke check in `packages/e2e/` confirming `/styleguide` renders without error (optional per plan.md, not a spec Success Criterion, but cheap enough to include). `packages/e2e/styleguide.spec.ts` — two tests (shell renders with no nav/search; `?theme=` override applies `data-theme="dark"`), both passing.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational only. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Foundational only (needs T004's `skeleton` primitive). No dependency on US1's token *values*, though its components will look unstyled until US1 lands — still independently testable per its own Independent Test (structural consistency, not final visual polish).
- **User Story 3 (Phase 5)**: Depends on Foundational, and **integrates** US1 (tokens, T016) and US2 (state pattern components, T019-T021) — this is expected per the template's own guidance that later-priority stories may build on earlier ones while staying independently testable in their own right.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each User Story

- US1: T012-T016 are sequential (same file, `globals.css`); T017/T018 branch off in parallel once T016 lands.
- US2: T019-T021 are parallel (three different files); T022 depends on all three.
- US3: T023 → T024 → T025; T026 branches off T023 in parallel; T027/T028 depend on T024.

### Parallel Opportunities

- Setup: T005 can run alongside T001-T004.
- Foundational: T006, T007, T008 can run in parallel; T009-T011 are sequential after.
- US1: T017, T018 can run in parallel once T012-T016 land.
- US2: T019, T020, T021 can run fully in parallel.
- US3: T026 can run in parallel with T024/T025 once T023 lands.
- Once Foundational is done, US1 and US2 can proceed in parallel (different files, no shared dependency) — US3 should wait for both, since it integrates their outputs.

---

## Parallel Example: User Story 2

```bash
# All three state-pattern components touch different files and share no dependency on each other:
Task: "Create packages/web/components/shared/loading-state.tsx per contracts/shared-components.md"
Task: "Create packages/web/components/shared/empty-state.tsx per contracts/shared-components.md"
Task: "Create packages/web/components/shared/error-state.tsx per contracts/shared-components.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (T012-T018)
4. **STOP and VALIDATE**: the Vitest token-resolution test (T018) passes in both modes
5. This alone proves the hardest-to-retrofit part (the token system, sourced correctly and unit-tested) works before spending effort on components that render it

### Incremental Delivery

1. Setup + Foundational → app boots, no visible design yet
2. Add US1 → tokens exist and are verified → nothing renders differently yet (no components consume them), but the source of truth is locked
3. Add US2 → the three state patterns exist and are structurally consistent, visually unstyled-but-correct once US1's tokens are in place
4. Add US3 → `/styleguide` renders the full shell — the first point at which spec.md's User Story 3 acceptance scenarios (serif mark, sage palette, dark mode, no nav/search) are visually checkable
5. Polish → documentation cleanup, lint/typecheck, full quickstart run

### Solo-Maintainer Note

This project has one maintainer (Constitution: no team to parallelize
across). The "Parallel Opportunities" above describe which tasks have no
file/dependency conflicts, useful for batching tool calls or working
out of strict numeric order — not a suggestion to staff multiple people.

---

## Notes

- [P] tasks touch different files and have no incomplete dependency.
- [Story] labels map every Phase 3+ task to spec.md's US1/US2/US3 for traceability.
- `components/ui` (shadcn/ui vendored primitives, T004) gets no bespoke tests — it's unopinionated vendored code (FR-014), not HomeBase-authored logic.
- No task in this list creates a `domains/` folder, a database table, or a Route Handler — out of scope per spec.md's Assumptions.
- No task wires up PWA manifest/service worker — deferred per plan.md's Constitution Check and Complexity Tracking; tracked as a MUST for the next feature that ships a real tool module, not for this one.
- No task builds an automated `DESIGN.md`-vs-implementation drift check — considered and declined (research.md §3); the Vitest token-resolution test (T018) is the only automated guard.
