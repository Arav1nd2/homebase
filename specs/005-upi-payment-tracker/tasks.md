# Tasks: UPI Payment Tracker

**Input**: Design documents from `/specs/005-upi-payment-tracker/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/upi-tracker-api.md](./contracts/upi-tracker-api.md), [quickstart.md](./quickstart.md)

**Tests**: Included. Constitution Principle VII requires unit tests for
non-obvious business logic (deep-link parsing, the pending/unconfirmed
status lifecycle, tag soft-delete filtering, summary math) and at least
one auth-check test per Route Handler.

**Organization**: Tasks are grouped by user story (US1–US4, matching
spec.md's P1–P4) so each story can be implemented and validated
independently, per `quickstart.md`'s scenario numbering.

**Note on a contract correction made while writing this file**: while
mapping FR-022 (camera-denied manual entry) against US3's manual-backfill
entry, the original `contracts/upi-tracker-api.md` conflated `origin` with
"is this a backfill." Both are now corrected: `origin` (`scanned`/`manual`)
is purely descriptive (FR-011); whether the request includes an explicit
`status` is what actually determines pending-lifecycle vs. backfill.
FR-022's fallback stays inline on `page.tsx` (no separate route) and still
goes through the live pending → confirm lifecycle. See
`contracts/upi-tracker-api.md`'s `POST /transactions` section and
`data-model.md`'s Validation summary.

## Path Conventions

npm workspaces monorepo — `packages/web` (Next.js app), `packages/e2e`
(Playwright, exercises `packages/web` via the local Workers preview). All
file paths below are relative to the repository root.

---

## Phase 1: Setup

**Purpose**: Get the one new dependency in place before any module code is written.

- [X] T001 Add `jsqr` to `packages/web/package.json` dependencies (`npm install jsqr --workspace=packages/web`) — research.md §1

**Checkpoint**: New dependency installed; nothing else needed before schema/foundational work.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schema, validation, and client-side wrappers every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Add `upiTag`, `upiTransaction`, `upiTransactionTag` table definitions to `packages/web/db/schema.ts` per `data-model.md`: `camelCase` variables / `PascalCase` SQL names, `id`/`createdAt`/`updatedAt`/`userId` on `upiTag` and `upiTransaction` (join table deliberately omits `userId` — research.md §6), `deletedAt` nullable soft-delete column on `upiTag`, `CHECK (amountPaise > 0)` and a status-enum `CHECK` on `upiTransaction`, FK from `upiTransactionTag` to both tables with a `(transactionId, tagId)` unique constraint and `ON DELETE CASCADE` from `upiTransaction`
- [X] T003 Generate the migration (`npm run db:generate-migration` from `packages/web`) and commit the produced SQL file under `packages/web/drizzle/` (depends on T002)
- [X] T004 Apply it locally (`npm run db:migrate:local`) and confirm all three tables and constraints exist in the local Supabase Postgres (depends on T003)
- [X] T005 [P] Create `packages/web/lib/validation/upi-tracker.ts`: Zod schemas `tagCreateInputSchema`, `tagUpdateInputSchema`, `transactionCreateInputSchema` (`status` optional per the corrected contract above), `transactionUpdateInputSchema` (`status`/`tagIds`, both optional), `transactionListQuerySchema`, `summaryQuerySchema` — per `contracts/upi-tracker-api.md` and `data-model.md`'s Validation summary (depends on T002)
- [X] T006 [P] Create `packages/web/lib/api/upi-tracker.ts`: typed client-side fetch wrappers for all 8 endpoints (path constants + request/response types), following the existing `lib/auth/api.ts` pattern — used by every story's UI (depends on T002)
- [X] T046 **Shared-component prerequisite, added post-design-build (numbered out of sequence — T007+ already existed and are cross-referenced elsewhere, so this wasn't inserted mid-range to avoid a disruptive renumber).** Update `packages/web/components/shared/page-header.tsx` per `DESIGN.md`'s **§Shell chrome — PageHeader** section: replace the current static back-to-hub `Link` + boolean `showBackToHub` prop with a `back` prop supporting four values — `{ mode: "hub" }` (default, unchanged rendering: "‹ HomeBase" → `/`), `{ mode: "step", onBack }` (renders "‹ Back", calls `onBack()` instead of navigating — no route change), `{ mode: "parent", href, label }` (renders "‹ [label]", links to `href`), and `false` (renders nothing — the login page's existing exception; `showBackToHub={false}` may stay as a backward-compatible alias). Also add the theme-toggle control: an icon-only 44×44px button at the header row's trailing edge (`Sun`/`Moon` from `lucide-react`, already a dependency), wired to `next-themes`' `setTheme` to flip the *resolved* theme, with `aria-pressed` per the WAI-ARIA toggle-button pattern. **This is a shared-shell change, not UPI-scoped** — it's consumed by all 6 existing tools' page headers too, so `{ mode: "hub" }` being the default when `back` is omitted must keep every existing call site (Habits, Movies & TV, Expenses, Food Reviews, Recipes, Groceries, `/styleguide`) rendering exactly as before. **Blocks T015, T027, T033, T038** — the first task in each of UPI's 4 routes to render a `PageHeader` with a non-default `back` mode.
- [X] T047 [P] Extend the existing `packages/web/tests/unit/page-header.test.tsx` (from `003-ui-shell-foundation`) to cover T046's new `back` modes (`hub`/`step`/`parent`/`false`, confirming `step` calls `onBack` rather than navigating and `parent` links to the given `href`) and the theme-toggle control (icon swaps with resolved theme, `aria-pressed` reflects dark/light, `setTheme` called on tap) (depends on T046)

**Checkpoint**: Tables migrated locally; shared validation schemas and typed client wrappers exist; `PageHeader` supports UPI's navigation modes without regressing the other 6 tools — user story implementation can begin.

---

## Phase 3: User Story 1 - Scan, tag, and pay in one flow (Priority: P1) 🎯 MVP

**Goal**: Open the tool, camera opens immediately, scan a UPI QR code, confirm amount and tag(s), tap Pay, get redirected to the UPI app, return, and confirm success/failed (or land on `unconfirmed`/`pending` if not answered/never returned).

**Independent Test**: `quickstart.md` Scenarios 1–3 — full scan→amount→tag→pay→confirm journey; abandoned-prompt and never-returning cases both land on a definite/bucketed status (SC-004); malformed QR retry, no-UPI-app message, camera-denied fallback, and zero/negative amount block all work without dead-ending the flow.

### Implementation for User Story 1

- [X] T007 [US1] **Spike, do first**: verify Playwright's fake-camera mechanism works in this project before building the rest of the story on it — launch Chromium with `--use-fake-device-for-media-stream` and `--use-file-for-fake-video-capture=<a short recorded video showing a UPI QR code>` against a minimal test page calling `getUserMedia` + `jsqr`, confirm a real decode succeeds under the local Workers preview (research.md §10, same "verify the risky assumption first" precedent as `002-email-otp-auth`'s middleware spike). If it fails, document the fallback (camera-free e2e coverage via the manual-entry path only) before continuing.
- [X] T008 [P] [US1] Implement `parseUpiDeepLink(url: string)` and `buildUpiDeepLink(input)` in `packages/web/lib/upi-tracker/deep-link.ts` per research.md §2: read `pa` (required)/`pn` (optional, nullable result)/`am` (optional) from a `upi://pay` URI; construct the outbound link with `pa`/`pn`/`am`/`cu=INR`/a fixed generic `tn`
- [X] T009 [P] [US1] Unit test `packages/web/tests/unit/upi-deep-link.test.ts`: valid link with amount, valid link without amount, missing `pa` → parse failure (FR-021), missing `pn` → still valid with `payeeName: null`, non-numeric `am` → parse failure, `buildUpiDeepLink` output shape (depends on T008)
- [X] T010 [P] [US1] Implement the camera-scan hook in `packages/web/components/upi-tracker/qr-scanner.tsx`: `getUserMedia({ video: { facingMode: "environment" } })`, draw frames to an off-screen canvas on `requestAnimationFrame`, decode with `jsqr`, surface decode-success, `NotAllowedError`/`NotFoundError` (permission denied / no camera), and no-decode-yet states (research.md §1, §8) (depends on T001)
- [X] T011 [P] [US1] Implement `useAppReturnDetection` in `packages/web/lib/upi-tracker/use-app-return.ts`: `visibilitychange` (primary) + `focus` (fallback) listeners, attach-on-demand/detach-on-resolve API (research.md §7)
- [X] T012 [US1] Implement `POST /api/upi-tracker/transactions` in `packages/web/app/api/upi-tracker/transactions/route.ts` per `contracts/upi-tracker-api.md`: `getSessionOrThrow()` first, validate via T005's schema, when `status` is omitted always write `status: "pending"` regardless of `origin` (live "Pay now" path — covers both scanned and the FR-022 camera-denied fallback) and default `occurredAt` to now; when `status` is present require `occurredAt` in the same request (backfill path, completed fully in US3 but accepted here since the schema already supports it); validate every `tagIds` entry belongs to the caller and is not soft-deleted; insert the transaction and its `upiTransactionTag` rows together (depends on T005)
- [X] T013 [P] [US1] Implement `GET /api/upi-tracker/tags` and `POST /api/upi-tracker/tags` in `packages/web/app/api/upi-tracker/tags/route.ts` per `contracts/upi-tracker-api.md`: list the caller's active (`deletedAt IS NULL`) tags; create with a name-uniqueness-among-active check (HTTP 409 `TAG_NAME_TAKEN`) (depends on T005) — needed so US1's tag-picker chip list and inline "add new tag" have somewhere to read/write
- [X] T014 [US1] Implement `PATCH /api/upi-tracker/transactions/[id]` in `packages/web/app/api/upi-tracker/transactions/[id]/route.ts`, scoped in this story to the `status` field (full `tagIds` editing arrives with US3's T030, but the confirm-prompt's success/failed/unconfirmed write needs this endpoint now); enforce caller ownership (404, not 403, on a non-owned or missing id — FR-018) (depends on T012)
- [X] T015 [US1] Build the scan step of `packages/web/app/(app)/upi-tracker/page.tsx`: opens the camera immediately on mount (FR-001) via T010; on a malformed/non-UPI decode, shows an inline error with a retry that keeps scanning without restarting the flow (FR-021); on `NotAllowedError`/`NotFoundError`, shows an **inline** manual VPA/amount/payee-name entry form in place of the camera view (FR-022) — this is the same page's flow with the scan step swapped out, not a separate route (see the contract-correction note above) (depends on T010, T046)
- [X] T016 [US1] Build the amount step (same page, step 2): pre-fills from the parsed QR amount when present (T008), editable, blocks proceeding on a zero/negative/non-numeric value (FR-003, FR-004) (depends on T008, T015)
- [X] T017 [US1] Build the tagging step (same page, step 3): fetch active tags (T013), render as tappable chips via `packages/web/components/upi-tracker/tag-picker.tsx`, inline "add new tag" calling `POST /api/upi-tracker/tags` (T013) without leaving the flow (FR-005, FR-006, FR-007) (depends on T013, T016)
- [X] T018 [US1] Build the "Pay" step: call `POST /api/upi-tracker/transactions` (T012) with `origin` set to `"scanned"` or `"manual"` (matching how step 1 was completed) and no `status` field, **the instant "Pay" is tapped, before constructing the redirect** (SC-004, research.md §3); on success, build the deep link via `buildUpiDeepLink` (T008) and navigate to it (FR-008) (depends on T012, T017)
- [X] T019 [US1] Build `packages/web/components/upi-tracker/confirm-prompt.tsx` and wire it into the page: on return (T011), show the success/failed prompt; answering calls `PATCH .../[id]` (T014) with that status; dismissing/navigating away without answering calls it with `"unconfirmed"` (FR-009, FR-010) (depends on T011, T014, T018)
- [X] T020 [US1] Handle "no UPI app installed" (FR-020): if the page is still visible/foregrounded shortly after attempting the redirect (i.e., no app hand-off occurred), show a clear message explaining no UPI app was found, rather than a silent or dead redirect (depends on T018)
- [X] T021 [P] [US1] Route Handler auth-check test in `packages/web/tests/unit/upi-transactions.test.ts`: unauthenticated `POST`/`PATCH /api/upi-tracker/transactions` both reject with the shared 401 error shape (Principle VII) (depends on T012, T014)
- [X] T022 [US1] Playwright e2e `packages/e2e/upi-tracker-scan-pay.spec.ts` covering `quickstart.md` Scenarios 1–3: full scan→amount→tag→pay→confirm via the fake-video-device mechanism (T007); abandoned-prompt and never-returning cases; malformed-QR retry; no-UPI-app message; camera-denied inline fallback; zero/negative amount block (depends on T007, T019, T020)

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the deployable MVP.

---

## Phase 4: User Story 2 - Review spending by tag and time period (Priority: P2)

**Goal**: List, filter/group, and summarize tracked transactions by tag, status, and date range.

**Independent Test**: `quickstart.md` Scenario 4 — seed transactions with varying tags/statuses/dates, verify filter/group correctness and that per-tag/per-period totals match.

### Implementation for User Story 2

- [X] T023 [P] [US2] Implement the status-bucketing helper in `packages/web/lib/upi-tracker/status.ts`: exports a `pending`+`unconfirmed` "not confirmed" grouping used by every list/filter/summary query, so a never-returned `pending` row reads as not-confirmed everywhere except the raw stored value (research.md §3)
- [X] T024 [US2] Implement `GET /api/upi-tracker/transactions` (list) in `packages/web/app/api/upi-tracker/transactions/route.ts` per `contracts/upi-tracker-api.md`: `tagId`/`status`/`from`/`to` query filters, each row's tags joined inline from the live `upiTag` row (FR-012, FR-013) (depends on T005, T023)
- [X] T025 [US2] Implement `GET /api/upi-tracker/transactions/summary` in `packages/web/app/api/upi-tracker/transactions/summary/route.ts`: per-tag/per-period totals in `amountPaise`; a multi-tagged transaction's full amount counts toward each of its tags (FR-014) (depends on T024)
- [X] T026 [P] [US2] Unit test extending `packages/web/tests/unit/upi-transactions.test.ts`: summary math for a multi-tagged transaction counts full amount per tag; a `pending` row with no return appears in the "not confirmed" bucket alongside `unconfirmed` rows in both the list and summary (depends on T023, T025)
- [X] T027 [US2] Build `packages/web/app/(app)/upi-tracker/history/page.tsx`: list view with tag/status/date-range filters and grouping, via `packages/web/components/upi-tracker/transaction-list.tsx` (reusing `components/shared`'s `EmptyState`/`LoadingState`/`ErrorState` per `CLAUDE.md` — no reimplementation); include "+ Add manually" (→ `/new`) and "Manage tags" (→ `/tags`) as standing secondary links, not folded into the filter row (JOURNEY.md's History page spec, content blocks 4-5); renders `PageHeader` with `back={{ mode: "parent", href: "/upi-tracker", label: "UPI" }}` per `DESIGN.md`'s §Shell chrome — PageHeader (depends on T024, T046)
- [X] T028 [US2] Build `packages/web/components/upi-tracker/summary-card.tsx` and wire it into the history page: per-tag/per-period totals for the current filter selection (SC-002) (depends on T025, T027)
- [X] T029 [US2] Playwright e2e `packages/e2e/upi-tracker-history.spec.ts` covering `quickstart.md` Scenario 4: seed transactions via the API, verify filter/group correctness and summary totals (depends on T027, T028)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - Correct or backfill a transaction (Priority: P3)

**Goal**: Edit an existing transaction's tag(s)/status after the fact; add a past transaction manually without scanning.

**Independent Test**: `quickstart.md` Scenario 5 — edit a transaction's tag/status and confirm it persists; add a manually backfilled transaction and confirm it appears identically to a scanned one.

### Implementation for User Story 3

- [X] T030 [US3] Extend `PATCH /api/upi-tracker/transactions/[id]` (T014) to also accept and apply `tagIds` (full FR-015 scope: status and/or tags, either or both) (depends on T014)
- [X] T031 [US3] Confirm/complete the backfill branch of `POST /api/upi-tracker/transactions` (T012): `status` present in the request requires `occurredAt` in the same request (HTTP 400 `VALIDATION_ERROR` otherwise) — this branch was defined in T012's schema but only the live-flow (status-omitted) branch was necessarily exercised by US1 (depends on T012)
- [X] T032 [US3] Build the inline edit affordance on `packages/web/app/(app)/upi-tracker/history/page.tsx`: a modal/drawer to change a transaction's tag(s) and/or status, calling T030 (FR-015) (depends on T027, T030)
- [X] T033 [US3] Build `packages/web/app/(app)/upi-tracker/new/page.tsx`: the dedicated retrospective-backfill entry point — payee, amount, tag(s) (reusing `tag-picker.tsx` from T017), a date picker, and direct status selection — calling T031 with `origin: "manual"` and an explicit `status` (FR-016). Independent of US1's inline camera-denied fallback (T015) — see the contract-correction note above. Renders `PageHeader` with `back={{ mode: "parent", href: "/upi-tracker/history", label: "History" }}` per `DESIGN.md`'s §Shell chrome — PageHeader (depends on T017, T031, T046)
- [X] T034 [P] [US3] Unit test extending `packages/web/tests/unit/upi-transactions.test.ts`: `PATCH` updates tags and status independently and together; a backfill `POST` (status present) without `occurredAt` is rejected; a backfill `POST` with both is accepted and skips `pending` entirely (depends on T030, T031)
- [X] T035 [US3] Playwright e2e `packages/e2e/upi-tracker-edit-backfill.spec.ts` covering `quickstart.md` Scenario 5: edit an existing transaction's tag/status; add a manually backfilled transaction; confirm both appear correctly in history (depends on T032, T033)

**Checkpoint**: User Stories 1, 2, and 3 all independently functional.

---

## Phase 6: User Story 4 - Manage tags (Priority: P4)

**Goal**: Rename, recolor, and delete tags; renames/recolors propagate live to every transaction referencing the tag, deletes soft-delete without affecting history.

**Independent Test**: `quickstart.md` Scenario 6 — rename/recolor a tag and confirm every transaction using it reflects the change; delete an unused tag and confirm it disappears from selection; delete a tag with existing transactions and confirm those transactions keep their historical tag label.

### Implementation for User Story 4

- [X] T036 [US4] Implement `PATCH /api/upi-tracker/tags/[id]` in `packages/web/app/api/upi-tracker/tags/[id]/route.ts` per `contracts/upi-tracker-api.md`: rename and/or recolor, with the active-name-uniqueness check (depends on T013)
- [X] T037 [US4] Implement `DELETE /api/upi-tracker/tags/[id]` (same file): sets `deletedAt`, touches no `upiTransactionTag` row (research.md §4) (depends on T013)
- [X] T038 [US4] Build `packages/web/app/(app)/upi-tracker/tags/page.tsx`: tag management view — list active tags, rename/recolor/delete controls, color-swatch picker using the 8-swatch tag-color ramp already locked in `DESIGN.md`'s §Tag color ramp (`specs/005-upi-payment-tracker/design-reference.md` has been refreshed against it — no further design-context run needed for the swatch values). Renders `PageHeader` with `back={{ mode: "parent", href: "/upi-tracker/history", label: "History" }}` per `DESIGN.md`'s §Shell chrome — PageHeader (depends on T036, T037, T046)
- [X] T039 [P] [US4] Unit test `packages/web/tests/unit/upi-tags.test.ts`: rename/recolor is visible immediately when the same tag is re-read; delete excludes the tag from the active list but leaves existing `upiTransactionTag` rows and their transactions' displayed tag untouched; name-uniqueness-among-active is enforced; cross-user isolation (FR-018) holds on all four tag endpoints (depends on T036, T037)
- [X] T040 [US4] Playwright e2e `packages/e2e/upi-tracker-tags.spec.ts` covering `quickstart.md` Scenario 6 (depends on T038)

**Checkpoint**: All four user stories independently functional.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story verification and production hardening.

- [X] T041 [P] Playwright e2e `packages/e2e/upi-tracker-isolation.spec.ts` covering `quickstart.md` Scenario 7 (FR-018): a second allow-listed test session has zero visibility into the first user's tags/transactions, including direct id-guessing against the API (expect 404, not 403) (depends on T012, T024, T036)
- [ ] T042 Manual PWA verification per `quickstart.md`'s "Manual PWA verification" section, on both a real/simulated iOS Safari session and an Android Chrome session (constitution Principle IV): camera permission prompt + scan UI, UPI-app redirect and return-focus behavior, offline history-view load failing visibly rather than silently
- [X] T043 [P] `design-reference.md` was already refreshed against the built `DESIGN.md`/`JOURNEY.md` (2026-07-21) — this task is now just a final confirmation pass: re-run the `speckit-design-context` skill only if `DESIGN.md`, `JOURNEY.md`, or `design/VOICE.md` changed again since, and confirm T038's swatch values still match
- [X] T044 Run every scenario in `quickstart.md` end-to-end locally; confirm SC-001 (under 20s scan-to-redirect), SC-002 (under 10s to find a tag's monthly total), SC-003 (95%+ scan parse accuracy — informal check against several real QR codes), SC-004 (no payment attempt ever lost), and SC-005 (under 15s to correct a transaction) all hold
- [X] T045 [P] Confirm no new local-setup step is needed in root `README.md` (no new secrets/bindings/Supabase config were introduced by this feature — see `research.md`'s Summary table); update it only if that turns out not to be true

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup (T001) — BLOCKS all user stories.
- **User Stories (Phase 3–6)**: All depend on Foundational completion.
  - US1 has no dependency on US2/US3/US4.
  - US2 depends on Foundational only; reuses US1's existing tag data for realistic seeding but its own endpoints/UI are new work.
  - US3 depends on Foundational + reuses US1's `PATCH` endpoint (extends it, T030) and tag-picker component (T017); reuses US2's history page (extends it, T032).
  - US4 depends on Foundational + reuses US1's tags `route.ts` file (extends it with the `[id]` handler, T036/T037) and tag-picker component indirectly (tags created/managed here are what US1's picker lists).
- **Polish (Final Phase)**: Depends on all four user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational. No dependency on US2/US3/US4. This is the deployable MVP on its own.
- **User Story 2 (P2)**: Can start after Foundational; needs US1's transaction data to be meaningful to demo, but its own code has no hard dependency on US1's files.
- **User Story 3 (P3)**: Can start after Foundational; its tasks explicitly extend US1 (T014→T030, T012→T031) and US2 (T027→T032) files, so schedule it after both for a clean incremental extension rather than a merge conflict.
- **User Story 4 (P4)**: Can start after Foundational; extends US1's tags `route.ts` (T013→T036/T037) with a sibling `[id]` file, so no direct file conflict, but logically depends on US1's tag-creation endpoint already existing.

### Parallel Opportunities

- T005, T006 (Foundational) can run in parallel once T002 exists — different files.
- T008, T010, T011 (US1) can run in parallel — different files, no cross-dependency.
- T013 (US1, tags route) can run in parallel with T008/T010/T011 — different file from T012.
- T021 (US1 test) can run in parallel with other US1 tasks once T012/T014 land.
- T023 (US2) can start in parallel with any remaining US1 task once Foundational is done — different file.
- T039 (US4 test) can run in parallel with T038 — different file.
- T041, T043, T045 (Polish) can run in parallel — different concerns/files.

### Same-file sequencing note

- `packages/web/tests/unit/upi-transactions.test.ts` is extended across three phases (T021 → T026 → T034). `packages/web/app/api/upi-tracker/transactions/route.ts` is written by T012 (US1) then extended by T024 (US2, adds `GET`) and T031 (US3, completes the backfill branch). `packages/web/app/api/upi-tracker/transactions/[id]/route.ts` is written by T014 (US1) then extended by T030 (US3). If working stories out of priority order or in parallel across people, coordinate on these specific files to avoid clobbering each other's additions.

---

## Parallel Example: Foundational Phase

```bash
Task: "Create lib/validation/upi-tracker.ts with Zod schemas for tags and transactions"
Task: "Create lib/api/upi-tracker.ts typed client fetch wrappers"
```

## Parallel Example: User Story 1

```bash
Task: "Implement parseUpiDeepLink/buildUpiDeepLink in lib/upi-tracker/deep-link.ts"
Task: "Implement the camera-scan hook in components/upi-tracker/qr-scanner.tsx"
Task: "Implement useAppReturnDetection in lib/upi-tracker/use-app-return.ts"
Task: "Implement GET/POST /api/upi-tracker/tags in app/api/upi-tracker/tags/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (includes the DB migration — do not skip)
3. Complete Phase 3: User Story 1 (includes the fake-camera e2e spike, T007 — do not defer it)
4. **STOP and VALIDATE**: run `quickstart.md` Scenarios 1–3
5. This is a legitimate, deployable MVP: every payment attempt that reaches "Pay" is durably recorded (SC-004) and reviewable via direct API/DB inspection even before the history UI (US2) exists.

### Incremental Delivery

1. Setup + Foundational → schema and shared plumbing ready, nothing user-visible yet.
2. Add User Story 1 → validate → the entire reason the tool exists is now usable end-to-end.
3. Add User Story 2 → validate → the tagging now pays off with reviewable history and summaries.
4. Add User Story 3 → validate → miscategorizations are correctable, pre-tool payments can be backfilled.
5. Add User Story 4 → validate → tags stay tidy over time (rename/recolor/delete).
6. Final Phase → cross-user isolation check, manual PWA verification, quickstart timing pass.

---

## Notes

- [P] tasks touch different files with no unmet dependency.
- [Story] labels map each task to spec.md's US1–US4 for traceability.
- The join table (`upiTransactionTag`) omitting `userId` is a deliberate, documented choice (research.md §6, plan.md Complexity Tracking) — do not "fix" this during implementation without re-reading that reasoning.
- No task in this list adds a new Cloudflare binding or Supabase config change — see research.md's Summary table.
- Commit after each task or logical group; stop at each checkpoint to validate that story independently before moving on.
