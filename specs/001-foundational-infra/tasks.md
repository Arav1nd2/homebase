# Tasks: Foundational Project Infrastructure

**Input**: Design documents from `/specs/001-foundational-infra/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/smoke-api.md, quickstart.md

**Tests**: Not formally requested as TDD in the spec, but the constitution
(Principle VII) and the spec's own user stories require automated coverage
for shared code and the e2e round trip — those test tasks are included
inline within the stories that need them.

**Organization**: Tasks are grouped by user story (spec.md priorities
P1–P4) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- File paths follow the structure in `plan.md`

## Path Conventions

Single Next.js App Router project at the repository root (see `plan.md`
Project Structure): `app/`, `lib/`, `prisma/`, `supabase/`, `tests/unit/`,
`tests/e2e/`, `.github/workflows/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize the Next.js App Router TypeScript project at the repository root (`package.json`, `tsconfig.json` with `strict: true`, `app/` directory) per `plan.md` Project Structure
- [X] T002 [P] Install and pin core dependencies: `next`, `react`, `typescript`, `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `@opennextjs/cloudflare`, `zod`, `vitest`, `@playwright/test` (declared in package.json; run `npm install` to fetch — see Polish notes)
- [X] T003 [P] Configure ESLint + Prettier with strict TypeScript rules (disallow `any` and non-null assertions per constitution Principle I) and add `lint`/`typecheck` npm scripts
- [X] T004 [P] Add `wrangler.jsonc` and `open-next.config.ts` for Cloudflare Workers with the Node.js compatibility flag (`research.md` §1)
- [X] T005 [P] Run `supabase init` to create `supabase/config.toml` for the local CLI stack

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create `prisma/schema.prisma` with the `postgresql` datasource and the `driverAdapters` preview feature enabled (`research.md` §1)
- [X] T007 Add the `SmokeTest` model to `prisma/schema.prisma` per `data-model.md`
- [X] T008 Generate the initial Prisma migration for `SmokeTest` in `prisma/migrations/` (hand-authored, matching Prisma's format — no live DB was available to run `prisma migrate dev`; verify/regenerate with `prisma migrate dev` once `supabase start` works locally)
- [X] T009 Implement the shared Prisma client wrapper in `lib/prisma.ts` using `@prisma/adapter-pg` (production: Cloudflare Hyperdrive binding; local/CI: direct connection string — `research.md` §1) — includes the T020/T022 environment branching and production-connection guard already, done here in one pass
- [X] T010 [P] Define the Zod validation schema for the smoke `POST` body in `lib/validation/smoke.ts` (`contracts/smoke-api.md`)

**Checkpoint**: Schema, migration, shared DB client, and validation exist — user stories can now be implemented.

---

## Phase 3: User Story 1 - Prove the Full Stack Works in Production (Priority: P1) 🎯 MVP

**Goal**: A public, no-auth page in production that round-trips data through the API into the database and back.

**Independent Test**: Visit the production URL, submit the smoke-test form, reload, and confirm the value persisted (`quickstart.md` §3).

### Implementation for User Story 1

- [X] T011 [US1] Implement `POST` and `GET` handlers for `/api/smoke` in `app/api/smoke/route.ts` per `contracts/smoke-api.md` (uses `lib/prisma.ts`, `lib/validation/smoke.ts`; no auth check per FR-016)
- [X] T012 [US1] Build the smoke-test page in `app/page.tsx` (form to submit a message, displays the latest record on load)
- [X] T013 [US1] Add DB-unavailable error handling to `app/page.tsx` / `app/api/smoke/route.ts` so a DB outage shows a clear error state instead of a blank page or crash (spec Edge Cases)
- [X] T014 [P] [US1] Write the Playwright e2e spec for the full round trip in `tests/e2e/smoke.spec.ts`
- [X] T015 [P] [US1] Write Vitest unit tests for `lib/prisma.ts` in `tests/unit/prisma.test.ts`
- [ ] T016 [US1] **MANUAL — needs your Cloudflare + Supabase accounts.** Create the production Supabase project and configure the Cloudflare Hyperdrive binding to it in `wrangler.jsonc` (placeholder + instructions left in the file)
- [ ] T017 [US1] **MANUAL — depends on T016.** Deploy to Cloudflare Workers via OpenNext and manually verify the production round trip (`quickstart.md` §3, SC-002)

**Checkpoint**: User Story 1 is fully functional and independently verifiable — the production URL round-trips data with no sign-in required.

---

## Phase 4: User Story 2 - Develop Fully Offline on a Local Machine (Priority: P2)

**Goal**: A complete local Postgres/Auth/Storage stack runnable with no internet connection after initial setup.

**Independent Test**: Disconnect from the internet, run the local startup command, confirm all local services come up and stay isolated from production (`quickstart.md` §1).

### Implementation for User Story 2

- [X] T018 [US2] Add `db:start` / `db:stop` npm scripts wrapping `supabase start` / `supabase stop`
- [X] T019 [US2] Add `.env.local.example` documenting the local Supabase Postgres connection string used by Prisma
- [X] T020 [US2] Extend `lib/prisma.ts`'s environment branching so local dev connects directly to the local Postgres instance (no Hyperdrive) while Workers still uses the Hyperdrive binding (finalizes T009 for the local case) — done together with T009
- [X] T021 [US2] Add a combined `npm run dev` script/documented sequence (`supabase start` → `prisma migrate deploy` → `next dev`)
- [X] T022 [P] [US2] Add a startup guard in `lib/prisma.ts` that fails loudly if a production connection string is ever used outside the Workers/production environment (FR-005, FR-014) — done together with T009
- [X] T023 [P] [US2] Document local setup, prerequisites, and the "local container runtime not running" error case in `README.md` (spec Edge Cases)

**Checkpoint**: `supabase start` + `npm run dev` gives a fully offline-capable local environment, isolated from production, startable/stoppable with single commands.

---

## Phase 5: User Story 3 - Trustworthy Automated End-to-End Testing (Priority: P3)

**Goal**: CI provisions a brand-new, isolated local Supabase stack for every run and executes Playwright against it with zero live-cloud dependency.

**Independent Test**: Trigger the CI e2e job twice back-to-back and confirm both runs produce identical results with no shared state and no cloud network calls (`quickstart.md` §2).

### Implementation for User Story 3

- [X] T024 [US3] Add `build:workers` / `preview:workers` npm scripts (OpenNext build + local Wrangler/Workers preview) per `research.md` §2 — done together with T001
- [X] T025 [US3] Configure `playwright.config.ts` to target the local Workers preview URL
- [X] T026 [US3] Add the e2e job to `.github/workflows/ci.yml`: start a fresh local Supabase CLI stack, run migrations, build + preview, run Playwright
- [X] T027 [US3] Add a teardown step to the e2e CI job that removes all containers/volumes after every run, so no state leaks between runs (FR-006, FR-007) — `if: always()` + `supabase stop --no-backup`
- [ ] T028 [US3] **Partially verifiable now.** The workflow is *designed* for hermeticity by construction (fresh `supabase start` + unconditional teardown every run); empirically running the CI job twice back-to-back to confirm zero flakiness (SC-004, SC-006) requires a live GitHub Actions run once this repo is pushed — cannot be executed from this local checkout.

**Checkpoint**: Every CI e2e run is fresh, fully isolated, and independent of any live cloud service.

---

## Phase 6: User Story 4 - Safe, Gated Path to Production (Priority: P4)

**Goal**: Every PR automatically runs lint/type-check/unit/e2e and is blocked from merging on failure; production deploys require passing checks plus explicit manual approval.

**Independent Test**: Open a PR with a deliberate lint failure and confirm it's blocked; fix it and confirm the deploy still pauses for manual approval before production updates (`quickstart.md` §4).

### Implementation for User Story 4

- [X] T029 [US4] Add lint and type-check jobs to `.github/workflows/ci.yml`, triggered on every pull request
- [X] T030 [US4] Add the Vitest unit-test job to `.github/workflows/ci.yml`
- [ ] T031 [US4] **MANUAL — GitHub repo settings, no local file.** Configure branch protection on `main` requiring all `ci.yml` checks to pass before merge (FR-010, FR-011). Documented in `README.md`.
- [ ] T032 [US4] **MANUAL — GitHub repo settings, no local file.** Create the `production` GitHub Environment with a required reviewer configured (the manual-approval gate). `deploy.yml` already references `environment: production`. Documented in `README.md`.
- [ ] T033 [US4] **MANUAL — GitHub repo settings, no local file.** Add production secrets (`CLOUDFLARE_API_TOKEN`, `PRODUCTION_DATABASE_URL`) scoped only to the `production` GitHub Environment; confirm fork PRs cannot access them (FR-014, spec Edge Cases). `deploy.yml` already references these secret names. Documented in `README.md`.
- [X] T034 [US4] Write `.github/workflows/deploy.yml`: triggered on push to `main`, builds via OpenNext, runs `prisma migrate deploy` against the production database, then deploys to Cloudflare Workers, gated by `environment: production` (FR-009, FR-012, FR-013)
- [X] T035 [US4] Document the manual-rollback procedure (redeploy a previous known-good commit) in `README.md` (FR-017)

**Checkpoint**: PRs are blocked on any failing check; production deploys happen only after checks pass and a human approves.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and tracking for the deliberate scope gaps from `plan.md`

- [X] T036 [P] Run the full `quickstart.md` validation end-to-end and fix any discrepancies found — done as far as possible without Docker/live accounts: `npm run lint`, `npm run typecheck`, `npm run test:unit`, and `next build` all pass; manually verified the dev server serves the page (200) and `/api/smoke` returns the clear DB-unavailable error (500) with no crash when the local Supabase stack isn't running. Found and fixed a real bug along the way (see Notes). §2 (hermetic CI) and §3 (production) require a pushed repo / live accounts — see T028, T016/T017.
- [X] T037 [P] Add a root `README.md` overview tying together dev/CI/deploy instructions
- [X] T038 Add a tracking comment near the `SmokeTest` model (`prisma/schema.prisma`) and `/api/smoke` route noting both should be removed once the first real module ships (`data-model.md`)
- [X] T039 File follow-up tracking items for the two committed foundational features from `plan.md` Complexity Tracking: (1) Supabase Auth + Route Handler auth-check convention, (2) PWA manifest/service worker — both required before module development starts. Filed as `TRACKING.md` (no GitHub repo exists yet to file real issues against)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only
- **User Story 2 (Phase 4)**: Depends on Foundational only — independent of US1
- **User Story 3 (Phase 5)**: Depends on Foundational, and needs US1's `/api/smoke` + page to exist as the thing being tested, and US2's local-stack scripts to reuse
- **User Story 4 (Phase 6)**: Depends on US1–US3 all existing (per spec.md: there must be a production environment, a local dev flow, and a trustworthy e2e environment to gate on)
- **Polish (Phase 7)**: Depends on all four user stories being complete

### Parallel Opportunities

- All Setup tasks marked `[P]` (T002–T005) can run in parallel after T001
- T010 (Foundational) can run in parallel with T006–T009 once the schema file exists for T007/T008 to extend
- Within US1: T014 and T015 (tests) can run in parallel with each other, but only after T011–T013 exist to test
- Within US2: T022 and T023 can run in parallel
- Within Phase 7: T036 and T037 can run in parallel

---

## Parallel Example: Setup

```bash
# After T001 (project scaffold exists), launch together:
Task: "Install and pin core dependencies"
Task: "Configure ESLint + Prettier with strict TypeScript rules"
Task: "Add wrangler.jsonc and open-next.config.ts for Cloudflare Workers"
Task: "Run supabase init to create supabase/config.toml"
```

## Parallel Example: User Story 1 tests

```bash
# After T011-T013 (route + page + error handling) exist, launch together:
Task: "Write the Playwright e2e spec for the full round trip in tests/e2e/smoke.spec.ts"
Task: "Write Vitest unit tests for lib/prisma.ts in tests/unit/prisma.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: visit the deployed production URL and confirm the round trip works (`quickstart.md` §3)
5. This is the walking skeleton — everything else builds on it being proven first

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. User Story 1 → validate in production → MVP proven
3. User Story 2 → validate offline local dev works
4. User Story 3 → validate hermetic CI e2e is trustworthy
5. User Story 4 → validate the full gated pipeline, using US1–US3 as its subject matter
6. Polish → close out documentation and track the two deferred foundational features (auth, PWA)

---

## Notes

- `[P]` tasks touch different files with no unmet dependencies
- `[Story]` labels map each task to its user story for traceability
- This feature intentionally ships no product/module code — see `plan.md` Complexity Tracking for the auth and PWA follow-up features required before module development begins
- Commit after each task or logical group
- **Bug found and fixed during implementation**: `lib/prisma.ts` originally created the Prisma client eagerly at module-import time, so a bare `import` (e.g. from a unit test, or Next.js's build-time module evaluation) could throw before any real usage happened. Fixed by making the client lazy (Proxy-backed, created on first property access) — `resolveConnectionString()` is now a pure function importable/testable on its own.
- **Tasks requiring your manual action** (cannot be done from this checkout): T016, T017, T031, T032, T033, and the empirical half of T028 — see `README.md` and `TRACKING.md`.
