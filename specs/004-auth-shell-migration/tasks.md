# Tasks: Auth Shell Migration

**Input**: Design documents from `/specs/004-auth-shell-migration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-ui.md, quickstart.md (all present)

**Tests**: Not a TDD gate — spec.md didn't request one. Unit-test tasks are
included only where Constitution Principle VII makes them mandatory
(shared code used by more than one call site: `components/shared/*`). No
new/changed Route Handler exists, so no new Route Handler tests are
needed — the existing ones (`tests/unit/request-code.test.ts`, etc.) are
untouched. Existing Playwright e2e specs (`auth-signin`, `auth-signout`,
`auth-session-persistence`) are reused as the regression proof for
FR-002/003/004 ("unchanged behavior"), not rewritten.

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

**Purpose**: New dependency, new primitives, and the one pure (no
behavior change) file relocation — nothing story-specific yet.

- [X] T001 Add `@tanstack/react-form` to `packages/web/package.json` dependencies and run `npm install`
- [X] T002 [P] Add the `input` and `label` primitives via the shadcn/ui CLI into `packages/web/components/ui/` (the CLI is already initialized from 003-ui-shell-foundation — `packages/web/components.json`)
- [X] T003 Create `packages/web/app/(app)/page.tsx` by moving `packages/web/app/page.tsx` there unchanged (content untouched — spec.md's Assumptions treat this smoke-test placeholder as today's stand-in for the not-yet-built hub), and delete the old `packages/web/app/page.tsx`

**Checkpoint**: Dependencies installed, shadcn CLI usable, the one existing protected screen already lives at its new `(app)` location.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-story blocking prerequisites, if any.

**Note**: This feature has none beyond Setup. Unlike 003-ui-shell-
foundation (where a shared rendering kernel blocked all three stories),
US1 (visual rebuild), US2 (middleware cleanup), and US3 (regression
verification of already-unchanged behavior) touch different files with no
shared setup work — each depends only on Phase 1. No tasks in this phase
by design, not by oversight.

---

## Phase 3: User Story 1 - Sign in through the migrated shell (Priority: P1) 🎯 MVP

**Goal**: The email-then-code sign-in flow renders in the Verse Margin
visual language (serif mark, sage palette, sans-serif body, shared
form-field/CTA tokens) with identical functional behavior to before this
migration, landing on the hub route on success.

**Independent Test**: Sign in with an allowed email end to end (request
code, retrieve it, enter it) and confirm every screen along the way uses
the shared visual language, per spec.md's User Story 1 Independent Test.

### Implementation for User Story 1

- [X] T004 [US1] ~~Add the `form-field-*` and `cta-*` Tier-3 component tokens...~~ **Revised during implementation**: on inspecting the actual shared components (`error-state.tsx`, `empty-state.tsx`), 003 never materialized DESIGN.md's Tier-3 JSON as new CSS custom properties — every shared component consumes Tier 1/2 vars directly via arbitrary-value Tailwind classes (e.g. `text-[var(--error-11)]`). Introducing a separate `--form-field-*`/`--cta-*` namespace would break that convention. Instead: added the one genuinely-missing Tier-2 value, `--accent-bg-subtle-active` (`var(--accent-4)`, both `:root` and `[data-theme="dark"]`, plus its `@theme` mapping) — the CTA pressed-state background. `FormField` (T007) and the login screen (T009) reference existing tokens (`--border-input`, `--text-secondary`, `--error-9`/`--error-11`, `--accent-bg-subtle`/`-active`, `--accent-text`) directly, matching `ErrorState`'s pattern exactly.
- [X] T005 [P] [US1] Add an optional `showBackToHub?: boolean` prop (default `true`) to `packages/web/components/shared/page-header.tsx`, conditionally rendering the existing back-to-hub `<Link>` only when it isn't explicitly `false` (FR-014)
- [X] T006 [US1] Update `packages/web/tests/unit/page-header.test.tsx`: replace the now-incorrect "always renders... no prop to suppress it" assertion with coverage for both the default (`showBackToHub` omitted → renders) and opted-out (`showBackToHub={false}` → omits) states (Constitution Principle VII; depends on T005). Verified passing (5/5 tests).
- [X] T007 [P] [US1] Create `packages/web/components/shared/form-field.tsx` composing `ui/input.tsx` and `ui/label.tsx` (T002) per `contracts/auth-ui.md`'s `FormFieldProps` — label + input styled via direct Tier 1/2 token references (T004's revised scope), error shown under the field via three redundant cues (boundary color, icon glyph, message text) only when the `error` prop is supplied (depends on T002, T004)
- [X] T008 [US1] Create `packages/web/tests/unit/form-field.test.tsx` verifying `FormField` renders its label/input pair, shows the error only when the `error` prop is present, and injects no validation timing of its own (Constitution Principle VII; depends on T007). Verified passing (4/4 tests).
- [X] T009 [US1] Rebuild the login screen at `packages/web/app/(auth)/login/page.tsx` (moved from `packages/web/app/login/page.tsx`, which is deleted): a two-step TanStack Form flow — email step validated on blur against `emailInputSchema`, code step validated on blur against `verifyCodeInputSchema` (both from `lib/validation/auth.ts`, unchanged, via manual `safeParse` validators — Zod 3.25's Standard Schema support exists but manual validators keep `field.state.meta.errors` a predictable `string[]`) — each field rendered via `FormField` (T007), submit actions using the existing `Button` primitive styled with the CTA tokens, `PageHeader` rendered with `showBackToHub={false}` (T005), server-rejected errors rendered via the existing `ErrorState` component, requests made via `lib/api-client.ts`'s `apiClient()` (its first real consumer). Preserved the exact accessible names from the pre-migration implementation. Typecheck and lint both clean; all 38 unit tests pass (FR-001, FR-002, FR-009, FR-010, FR-013; Acceptance Scenarios 1-5; depends on T004, T005, T007, T001)
- [X] T010 [P] [US1] Run `packages/e2e/auth-signin.spec.ts` against the rebuilt login screen and confirm it passes with zero assertion changes (accessible names preserved by construction in T009); if any assertion genuinely needs adjustment, change only what's strictly necessary to match a preserved, not new, behavior (depends on T009). Ran via `npx playwright test` — all 4 auth-signin tests pass unmodified.

**Checkpoint**: User Story 1 is fully functional — sign-in works end to end through the re-skinned screens and lands on the hub route.

---

## Phase 4: User Story 2 - Every screen requires a session by default (Priority: P2)

**Goal**: Every screen other than `/login` redirects an unauthenticated
visitor, with no per-screen code required — including closing the one
existing exemption (`/styleguide`) that predates this feature.

**Independent Test**: Attempt to load several in-app URLs while signed
out (including the now-deleted `/styleguide`) and confirm every one
redirects to `/login` or 404s, per spec.md's User Story 2 Independent
Test.

### Implementation for User Story 2

- [X] T011 [US2] Remove the `/styleguide` exemption and its now-stale TODO comment from `packages/web/middleware.ts`'s allow-list check and doc comment (FR-011). The default-deny logic itself is otherwise unchanged — route groups don't affect what the middleware matches on (research.md §2).
- [X] T012 [P] [US2] Delete `packages/web/app/styleguide/` — the example/reference screen and its route (FR-011)
- [X] T013 [P] [US2] Delete `packages/e2e/styleguide.spec.ts` (FR-011 — the route it tests no longer exists)
- [X] T014 [US2] Manually verify, per `quickstart.md` step 2, that `/styleguide` now 404s, that `/` (now at `app/(app)/page.tsx`, T003) still redirects a signed-out visitor to `/login`, and that an already-signed-in visitor hitting `/login` still redirects to `/` — confirming the unchanged default-deny middleware check covers the reorganized routes and that a hypothetical new screen under `app/(app)/` would be protected the same way with no per-screen code (FR-005, FR-006, FR-007; depends on T003, T011, T012). Verified live via Playwright against the real Workers preview: `/styleguide` → 404; `/` while signed out → redirects to `/login`; `/login` while signed in → redirects to `/`.

**Checkpoint**: User Stories 1 AND 2 both work — the re-skinned sign-in flow is complete, and no route is left unauthenticated except `/login`.

---

## Phase 5: User Story 3 - Sign out ends access immediately (Priority: P3)

**Goal**: Confirm the existing, unchanged sign-out behavior still holds
through the reorganized routes — this story adds no new code (FR-004
preserves it unchanged).

**Independent Test**: Sign in, trigger sign-out, and confirm no
previously-reachable protected screen loads without signing in again, per
spec.md's User Story 3 Independent Test.

### Implementation for User Story 3

- [X] T015 [US3] Run `packages/e2e/auth-signout.spec.ts` and `packages/e2e/auth-session-persistence.spec.ts` against the reorganized `app/(app)/page.tsx` (T003) and rebuilt login screen (T009) and confirm both pass with no code change needed — sign-out still immediately revokes access, and back-navigation still doesn't reveal cached protected content (depends on T003, T009, T011). Manually verified live via Playwright first, then confirmed via `npx playwright test` — all 3 tests (1 signout, 2 session-persistence) pass unmodified.

**Checkpoint**: All three user stories are independently functional — sign-in, default protection, and sign-out are all verified through the migrated shell.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide verification, the deliberate-scope-decision checks
from research.md, and documentation consistency once all three stories
are done.

- [X] T016 [P] Run `npm run lint` and `npm run typecheck` from the repo root and fix any violations introduced by this feature. Both clean.
- [X] T017 [P] Confirm no `zustand` dependency or client-side auth-status store was added anywhere under `packages/web/lib/`, `packages/web/providers/`, or `packages/web/package.json`, per `quickstart.md` step 5 (research.md §3 — a deliberate scope decision, kept visibly checked rather than silently assumed). Confirmed — zero matches.
- [X] T018 [P] Update `specs/003-ui-shell-foundation/contracts/shared-components.md` and `specs/003-ui-shell-foundation/data-model.md`: correct the `PageHeader` guarantee ("Always renders the back-to-hub affordance — no prop suppresses it") to note it's now optional (`showBackToHub`, default `true`), superseded by this feature's FR-014, so the two specs don't describe contradictory shell behavior (research.md §8)
- [X] T019 Run the full `quickstart.md` validation (all 8 steps) against the running app (`npm run dev` + the send-email worker) and record the results. All 8 steps verified live via Playwright against the real Workers preview + real local Supabase + fake-Resend capture: re-skinned sign-in end to end (steps 1, 7), `/styleguide` 404s and route protection holds (step 2), sign-out revokes access with no cached content on back-navigation (step 3), the deleted-route check (step 4), the no-Zustand check (step 5, T017), unit suite (step 6), lint/typecheck (step 8).
- [X] T020 Run `npm run test:unit` and `npm run test:e2e` from the repo root and confirm everything passes: the updated `page-header.test.tsx`, the new `form-field.test.tsx`, and the three preserved auth e2e specs — with `styleguide.spec.ts` gone entirely, not skipped (depends on T006, T008, T010, T014, T015). 38/38 unit tests pass; 9/9 e2e tests pass (a fresh, non-reused fake-resend-server instance was needed for a clean e2e run — repeated manual runs against the same long-lived instance within Supabase's 60s per-email resend cooldown produced 4 transient failures from stale captured OTPs, a testing-methodology artifact unrelated to the implementation; see note below).

### Fixes made during manual verification

Manually exercising the rebuilt login screen (real browser, real Workers
preview, real local Supabase + fake-Resend) surfaced three issues not
caught by unit tests or typecheck, all now fixed and re-verified:

1. **App-wide layout bug, pre-existing (not introduced by this feature)**:
   `styles/globals.css`'s reset rule (`*, *::before, *::after { margin:0;
   padding:0; }`, written in 003-ui-shell-foundation) was unlayered plain
   CSS, while Tailwind v4's own utilities all live inside `@layer
   utilities`. Per the CSS Cascade Layers spec, any unlayered rule beats
   every layered rule regardless of specificity or source order — so this
   reset silently zeroed out *every* padding/margin utility in the app
   (arbitrary-value tokens and plain Tailwind classes alike, e.g. even
   shadcn's own `px-2.5` on `Button`), invisible until a real form was
   rendered and inspected. Fixed by wrapping the reset in `@layer base`
   (matching Tailwind's own `theme, base, components, utilities` layer
   order, so utilities correctly win). This fix is app-wide, not scoped to
   auth screens — every existing page gains correct spacing.
2. **Missing page mark**: the login screen was calling `PageHeader` with
   no `mark` prop, violating DESIGN.md's one-signature-mark-per-page rule
   that every other screen follows. Resolved with the user: `⁂` (asterism)
   — a traditional printer's mark for "a new section begins," fitting for
   a sign-in screen as the app's literal opening act.
3. **Error icon misalignment in `FormField`**: the inline "!" icon used
   `items-start` (top-alignment, correct for `ErrorState`'s
   potentially-multi-line banner layout) at inherited text-sm size with no
   explicit sizing — visually off-balance for a single-line inline note.
   Changed to `items-center` with an explicit `text-base` icon size,
   matching `ErrorState`'s "icon sized larger than body text" convention
   at a scale appropriate for a compact per-field note.

Also shortened the login title from "Sign in to HomeBase" to "Sign in"
(matching the terse, canonical-name style every other page title uses —
"Habits", "Expenses") after the longer title wrapped to two lines next to
the mark at phone width.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Empty by design (see note above) — Phase 3+ each depend only on Setup.
- **User Story 1 (Phase 3)**: Depends on Setup (T001 for TanStack Form, T002 for `input`/`label`). No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Setup (T003, for the `/` move it verifies). No dependency on US1's own work — the two stories touch entirely different files (login screen vs. middleware/styleguide).
- **User Story 3 (Phase 5)**: Depends on Setup (T003) and, to have something meaningful to run against, US1's rebuilt login screen (T009) and US2's middleware cleanup (T011) — it's a pure regression check, not new implementation, so this is expected.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each User Story

- US1: T004, T005, T007 are independent of each other (different files); T006 depends on T005; T008 depends on T007; T009 depends on T004, T005, T007 (and T001); T010 depends on T009.
- US2: T011, T012, T013 are independent of each other (different files); T014 depends on all three plus T003.
- US3: T015 is the only task, depending on T003, T009, T011.

### Parallel Opportunities

- Setup: T002 can run alongside T001 and T003.
- US1: T004, T005, T007 can start in parallel once Setup is done; T006 and T008 branch off T005/T007 respectively once those land; T010 waits on T009.
- US2: T011, T012, T013 can all run in parallel (three different files, no shared dependency).
- Once Setup is done, US1 and US2 can largely proceed in parallel (different files) — US3 should wait for both, since it's a regression check of their combined output.

---

## Parallel Example: User Story 2

```bash
# All three touch different files and share no dependency on each other:
Task: "Remove the /styleguide exemption from packages/web/middleware.ts"
Task: "Delete packages/web/app/styleguide/"
Task: "Delete packages/e2e/styleguide.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1 (T004-T010)
3. **STOP and VALIDATE**: sign in end to end through the re-skinned screens and confirm `auth-signin.spec.ts` passes
4. This alone delivers the feature's most visible, most-requested outcome (the visual migration) before touching route-protection cleanup

### Incremental Delivery

1. Setup → dependencies and the one pure file move ready
2. Add US1 → the re-skinned sign-in flow works end to end (MVP!)
3. Add US2 → no route is left unauthenticated except `/login`; the 003-era exemption is closed
4. Add US3 → confirms nothing about sign-out regressed along the way
5. Polish → lint/typecheck, deliberate-scope-decision checks, docs consistency, full test suite

### Solo-Maintainer Note

This project has one maintainer (Constitution: no team to parallelize
across). The "Parallel Opportunities" above describe which tasks have no
file/dependency conflicts, useful for batching tool calls or working out
of strict numeric order — not a suggestion to staff multiple people.

---

## Notes

- [P] tasks touch different files and have no incomplete dependency.
- [Story] labels map every Phase 3+ task to spec.md's US1/US2/US3 for traceability.
- No task adds a Zustand store, a React context for auth status, or a `domains/auth/` folder — deliberate scope decisions (research.md §3, §5), checked explicitly in T017 rather than left to silently not happen.
- No task changes any Route Handler (`app/api/auth/*`) — FR-002/FR-003/FR-004 preserve that layer unchanged; `specs/002-email-otp-auth/contracts/auth-api.md` remains authoritative.
- No task wires up PWA manifest/service worker — that gap is carried forward unchanged from 003-ui-shell-foundation's own Complexity Tracking (plan.md Constitution Check); this feature ships no new product capability, so it isn't the trigger feature for closing it.
