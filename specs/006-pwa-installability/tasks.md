# Tasks: PWA Installability

**Input**: Design documents from `/specs/006-pwa-installability/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, contracts/, quickstart.md. No data-model.md — this feature adds no data entity.

**Tests**: Playwright e2e coverage is part of this feature's committed scope (plan.md's Testing section), not optional TDD scaffolding — included directly within the user story phase they validate.

**Organization**: Tasks are grouped by user story (spec.md) to enable independent implementation and testing of each.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths are repository-root-relative

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Get the toolchain and static assets in place before any wiring begins

- [X] T001 Create `packages/web/public/` (doesn't exist yet) with app icons generated from the Verse Margin brand tokens (`DESIGN.md`): `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` (with safe-zone padding for Android's maskable icon spec), and `apple-touch-icon.png` (180×180) — per contracts/pwa-manifest.md.
- [X] T002 Add `serwist` and `@serwist/next` as dependencies in `packages/web/package.json`.
- [X] T003 [P] Update `packages/web/tsconfig.json` to include `"@serwist/next/typings"` and the `"webworker"` lib, per Serwist's documented setup (research.md §1).
- [X] T004 [P] Update `packages/web/.gitignore` to ignore Serwist's generated worker output (`public/sw.js`, `public/swe-worker.*`) while still committing the hand-written source and the icons from T001.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The core service-worker wiring every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Wrap `packages/web/next.config.ts` with `withSerwist` from `@serwist/next` (`swSrc: "app/sw.ts"`, `swDest: "public/sw.js"`) (depends on T002, T003).
- [X] T006 Create `packages/web/app/sw.ts` with Serwist's precache manifest injection wired up so the build-time static asset list populates correctly (depends on T005).
- [X] T007 Add an explicit `NetworkOnly` runtime caching rule for `/api/.*` in `packages/web/app/sw.ts`, ordered ahead of any broader/default rule — per contracts/service-worker-caching.md, this is what makes FR-009 (no cached API/Route Handler responses) hold regardless of what other caching rules get added later (depends on T006).

**Checkpoint**: The service worker builds, registers, and provably excludes `/api/*` from any cache — foundation ready for all three user stories.

---

## Phase 3: User Story 1 - Install HomeBase to the home screen (Priority: P1) 🎯 MVP

**Goal**: A valid manifest and icon set so the app installs and launches standalone on both iOS Safari and Android Chrome.

**Independent Test**: Install to the home screen on both a real/simulated iOS Safari session and an Android Chrome session; confirm standalone launch (no browser chrome, correct icon/name/theme) and that backgrounding then returning preserves state.

### Implementation for User Story 1

- [X] T008 [P] [US1] Create `packages/web/app/manifest.ts` (Next.js native metadata route) with `name`, `short_name`, `description`, `start_url`, `display: "standalone"`, `theme_color`, `background_color`, and the `icons` array — per contracts/pwa-manifest.md (depends on T001).
- [X] T009 [P] [US1] Add the `apple-touch-icon` link via the `icons` metadata field in `packages/web/app/layout.tsx` — iOS Safari does not read the manifest's `icons` array for "Add to Home Screen" (contracts/pwa-manifest.md) (depends on T001).
- [ ] T010 [US1] Manual verification: install to the home screen on Android Chrome (device or emulator) and confirm standalone launch with the correct icon, name, and theme color (quickstart.md §1) (depends on T006, T008, T009).
- [ ] T011 [US1] Manual verification: install to the home screen on a real or simulated iOS Safari session via "Add to Home Screen" and confirm standalone launch with the correct icon and name (quickstart.md §1) (depends on T006, T008, T009).
- [ ] T012 [US1] Manual verification: with the installed app open, switch to another app and back, and confirm HomeBase resumes the same screen/state rather than restarting (spec Acceptance Scenario US1.4) (depends on T010, T011).

**Checkpoint**: User Story 1 is fully functional and testable independently — the app installs and launches standalone on both platforms.

---

## Phase 4: User Story 2 - Previously loaded screens stay usable offline or on a flaky connection (Priority: P1)

**Goal**: Navigation and static-asset caching so previously loaded screens keep rendering offline or on a degraded connection, with cache versioning across deploys.

**Independent Test**: Load the app once online, then simulate full offline and a throttled connection; confirm the previously loaded shell renders in both cases; redeploy and confirm an already-installed client picks up the update without manual cache clearing.

### Implementation for User Story 2

- [X] T013 [US2] Add a `NetworkFirst` runtime caching rule for navigation/document requests in `packages/web/app/sw.ts` (short network timeout, falls back to cache) — per contracts/service-worker-caching.md (depends on T007).
- [X] T014 [US2] Add a `StaleWhileRevalidate` rule for `_next/static/*` JS/CSS and a `CacheFirst` rule for fonts/images in `packages/web/app/sw.ts` (depends on T007).
- [X] T015 [P] [US2] Write `packages/e2e/pwa-offline.spec.ts`: load the app once online, go offline (`browserContext.setOffline(true)`), reload, and assert the previously loaded shell renders instead of a blank page or browser error (quickstart.md §2) (depends on T013).
- [X] T016 [P] [US2] Extend `packages/e2e/pwa-offline.spec.ts`: throttle the connection to a slow/flaky profile instead of fully offline, and assert the shell still renders without hanging indefinitely (quickstart.md §2) (depends on T013).
- [ ] T017 [US2] Manual verification: after a rebuild/redeploy, confirm an already-installed client picks up the new version on next open, with no manual site-data clear required (quickstart.md §2, FR-008) (depends on T006).

**Checkpoint**: User Stories 1 AND 2 both work independently — the app installs, and previously loaded screens stay usable offline/on a flaky connection.

---

## Phase 5: User Story 3 - Offline write attempts fail visibly (Priority: P2)

**Goal**: Confirm an offline mutation attempt fails immediately and visibly — no silent data loss, no infinite spinner.

**Independent Test**: Go offline, submit the existing smoke-test form, and confirm a clear error message appears within a few seconds with no false success confirmation.

### Implementation for User Story 3

- [X] T018 [P] [US3] Write `packages/e2e/pwa-offline.spec.ts`: go offline, submit the existing smoke-test form (`packages/web/app/(app)/page.tsx`), and assert a visible error message appears with no success confirmation shown (quickstart.md §3) (depends on T007).
- [X] T019 [US3] Confirm no loading/spinner state is left indefinitely active after the offline write failure — review `packages/web/app/(app)/page.tsx`'s existing submit-state handling against the T018 test result and adjust only if the test reveals a gap (depends on T018). No gap found: the existing `handleSubmit`'s `try/finally` already always resets `submitting` to `false` and only updates `record`/clears the input on the success path, so a failed offline write leaves the button re-enabled with no false success shown — confirmed by the T018 test.

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification that spans stories, plus repo housekeeping

- [X] T020 [P] Run quickstart.md §4: confirm `/api/smoke` is never served from cache while offline — only the existing loading/error state shows, never stale JSON. Covered by the T015 e2e test's own assertion (`packages/e2e/pwa-offline.spec.ts`'s fully-offline test also asserts the data section shows its error state, not stale JSON).
- [X] T021 [P] Run quickstart.md §5: confirm the app still loads and functions as a normal web page with service workers disabled (FR-011 graceful degradation). Automated via Playwright's `serviceWorkers: "block"` context option in a new `packages/e2e/pwa-offline.spec.ts` test (sign-in + smoke-test round trip both work with no service worker registered at all).
- [X] T022 Update README.md's Roadmap section — remove the "Installable PWA support... is planned as foundational work" line now that it's shipped, in the same plain-language style as the rest of the README (no spec/process jargon). The section had no other content, so the whole (now-empty) `## Roadmap` heading was removed too.
- [X] T023 Run `npm run lint` and `npm run typecheck` across the repo and fix anything the new files surface. Surfaced one gap: `eslint.config.mjs` didn't exclude Serwist's generated `public/sw.js` from linting (73 problems on the minified bundle) — added the same ignore patterns as `.gitignore`. Both commands are now clean across all three workspaces.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup (T002, T003) — BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational (Phase 2) completion.
  - US1 has no dependency on US2/US3 and is the suggested MVP slice.
  - US2 and US3 both build on the Foundational service worker (T007) but not on each other or on US1 — all three can proceed in parallel once Phase 2 is done.
- **Polish (Phase 6)**: Depends on whichever user stories are in scope being complete (T022 specifically only makes sense once the feature as a whole is considered shipped).

### Within Each User Story

- US1: icons/manifest/layout changes (T008, T009) before the manual verification tasks that depend on them (T010–T012).
- US2: the two new caching rules (T013, T014) before the e2e tests that assert on their behavior (T015, T016).
- US3: the e2e test (T018) before the follow-up review task (T019), since T019 is explicitly "act on what T018's test shows."

### Parallel Opportunities

- T003 and T004 (Setup) can run in parallel.
- T008 and T009 (US1) touch different files and can run in parallel.
- T015 and T016 (US2) can be written in parallel (same spec file, but independent test cases — sequence the actual edits if working solo).
- T018 (US3) has no file overlap with US2's tasks and can proceed in parallel with Phase 4 once Phase 2 is done.
- T020 and T021 (Polish) can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "Create packages/web/app/manifest.ts per contracts/pwa-manifest.md"
Task: "Add apple-touch-icon link via the icons metadata field in packages/web/app/layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (blocks everything else).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: confirm install + standalone launch works on both platforms per quickstart.md §1.
5. This alone already satisfies the literal "installable" half of Principle IV and is demoable.

### Incremental Delivery

1. Setup + Foundational → toolchain and service-worker skeleton ready, `/api/*` provably never cached.
2. Add US1 → installable on both platforms (MVP).
3. Add US2 → offline/flaky-connection shell resilience.
4. Add US3 → offline write failure confirmed visible (largely a verification pass over already-existing error handling, per research.md).
5. Polish → cache-safety spot checks, graceful degradation, README roadmap update, lint/typecheck.

### Solo-Maintainer Note

This project has one maintainer (Constitution Principle VIII) — "parallel opportunities" above describe which tasks *could* run concurrently if ever staffed, not a suggestion to multitask them simultaneously solo. Working the phases top-to-bottom in order is the expected path.
