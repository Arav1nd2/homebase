# Feature Specification: Foundational Project Infrastructure

**Feature Branch**: `001-foundational-infra`

**Created**: 2026-07-12

**Status**: Draft

**Input**: User description: "Set up the foundational project infrastructure for HomeBase before any feature UI is built. This includes: a working Next.js TypeScript project scaffold deployed end-to-end (a trivial page that proves the full stack works, from frontend through API route through database), a local development environment using the Supabase CLI for a fully local Postgres/Auth/Storage stack so development works offline, a hermetic end-to-end test environment using the same local Supabase CLI stack spun up fresh in CI with Playwright running integration tests against it (isolated per test run, no shared state between runs, no dependency on any live cloud service), a production environment on Cloudflare Workers with a real Supabase cloud project, and a CI/CD pipeline that runs linting/type-checking/unit tests/e2e tests on every pull request, and deploys to production only after those checks pass and a manual approval step is completed."

## Clarifications

### Session 2026-07-12

- Q: Should the production smoke-test page/API route require Supabase Auth
  sign-in as part of this foundational feature? → A: No — the smoke-test
  page and its API route are fully public with no sign-in involved.
  Supabase Auth is not wired up or exercised as part of this feature at all.
- Q: Should logging/error-visibility conventions be established as part of
  this foundational infrastructure work? → A: Out of scope — this feature
  relies on default platform logs; a dedicated observability/logging
  convention is deferred to a later feature.
- Q: If a production deploy causes a problem after manual approval, what's
  the expected recovery mechanism? → A: Manual rollback only — the
  maintainer redeploys a previous known-good commit by hand; no automated
  health-check-based rollback is required.

## User Scenarios & Testing *(mandatory)*

<!--
  This feature has no end-user-facing UI. The "user" for these scenarios is the
  developer/maintainer of HomeBase, who needs a trustworthy foundation to build
  every future module on.
-->

### User Story 1 - Prove the Full Stack Works in Production (Priority: P1)

As the maintainer, I need a minimal, fully public page running in the real
production environment that writes something through an API endpoint into
the database and reads it back, so I know the entire chain (browser → API →
database → back to browser) genuinely works before any real feature is
built on top of it. This page requires no sign-in — authentication is not
part of this feature.

**Why this priority**: Nothing else matters if the basic path doesn't work
end-to-end in production. This is the walking skeleton every future module
depends on; building modules on an unproven foundation risks discovering a
platform-level problem only after a lot of feature work is already built on
top of it.

**Independent Test**: Visit the production URL, trigger the trivial
write/read action, and confirm the value round-trips correctly. Can be
verified without any other part of this feature being complete.

**Acceptance Scenarios**:

1. **Given** the production environment is deployed, **When** a visitor
   loads the production URL, **Then** the page loads successfully and
   displays a value that was fetched from the database via an API call.
2. **Given** the page is loaded, **When** the visitor triggers the
   demonstration action (e.g., a button that writes a value), **Then** the
   value is persisted to the database and is visible again after a page
   reload.
3. **Given** the production database is temporarily unavailable, **When**
   the page attempts to load data, **Then** the visitor sees a clear error
   state instead of a blank page or an unhandled crash.

---

### User Story 2 - Develop Fully Offline on a Local Machine (Priority: P2)

As the maintainer, I need to run a complete local copy of the database,
authentication, and file storage stack on my own machine, so I can build and
test features without an internet connection or any dependency on a shared
cloud environment.

**Why this priority**: Day-to-day feature development happens far more often
than production deploys. Without a reliable, fully local environment, every
future module's development is blocked by network availability or risks
accidentally mutating shared/cloud data during development.

**Independent Test**: Disconnect from the internet, start the local
environment with a single command, and confirm the application runs fully
functional against local database, auth, and storage services.

**Acceptance Scenarios**:

1. **Given** a clean checkout of the repository and no internet connection,
   **When** the maintainer runs the local environment startup command,
   **Then** a local database, authentication service, and file storage
   service all become available on the machine.
2. **Given** the local environment is running, **When** the maintainer uses
   the application, **Then** all reads and writes affect only the local
   environment, never the production or any shared cloud environment.
3. **Given** the local environment is running, **When** the maintainer stops
   it, **Then** all services shut down cleanly and can be restarted later
   without data loss (unless the maintainer explicitly resets it).

---

### User Story 3 - Trustworthy Automated End-to-End Testing (Priority: P3)

As the maintainer, I need automated end-to-end tests to run against a fresh,
isolated environment for every test run, so a passing test run reliably
means the feature works — with no risk of one run's leftover state making
another run pass or fail incorrectly.

**Why this priority**: This is what makes the CI/CD pipeline (User Story 4)
trustworthy. Without isolation, flaky or misleading test results erode
confidence in the pipeline and eventually get ignored, which defeats the
purpose of having automated checks at all.

**Independent Test**: Trigger the automated end-to-end test run twice in
immediate succession (or in parallel) and confirm both runs produce
identical, correct results with no shared data and no calls to any live
cloud service.

**Acceptance Scenarios**:

1. **Given** the automated test pipeline starts, **When** it provisions the
   test environment, **Then** it creates a brand-new, empty database/auth/
   storage stack rather than reusing one from a previous run.
2. **Given** two end-to-end test runs happen back-to-back, **When** both
   complete, **Then** neither run's data or state is visible to or affects
   the other.
3. **Given** the end-to-end tests are running, **When** they execute,
   **Then** no network calls are made to any live/cloud-hosted service —
   the entire test run is self-contained.
4. **Given** the test environment is torn down after the run, **When** the
   next run starts, **Then** no leftover containers, volumes, or data from
   the previous run remain.

---

### User Story 4 - Safe, Gated Path to Production (Priority: P4)

As the maintainer, I need every code change to automatically pass linting,
type-checking, unit tests, and end-to-end tests, and to require an explicit
manual approval, before it can reach production, so a mistake can't
accidentally go live.

**Why this priority**: This depends on User Stories 1-3 already existing
(there must be a production environment, a local dev flow producing code to
check, and a trustworthy test environment to run checks against), so it is
correctly built last, but it's what makes every future change to HomeBase
safe to ship without manual, ad hoc verification.

**Independent Test**: Open a pull request that intentionally fails one
automated check (e.g., a lint violation) and confirm it is blocked from
being merged/deployed; then fix it and confirm merging still requires an
explicit approval step before production is updated.

**Acceptance Scenarios**:

1. **Given** a pull request is opened, **When** it is submitted, **Then**
   linting, type-checking, unit tests, and end-to-end tests all run
   automatically without manual triggering.
2. **Given** any of those automated checks fails, **When** the pull request
   is evaluated, **Then** it is blocked from being merged.
3. **Given** all automated checks pass, **When** the change is ready to go
   to production, **Then** the deployment does not happen automatically —
   it waits for an explicit manual approval action.
4. **Given** manual approval is granted, **When** the approval is recorded,
   **Then** the change is deployed to the production environment and
   becomes visible there.

### Edge Cases

- What happens when the local Supabase CLI stack fails to start (e.g.,
  required local container runtime isn't running)? The maintainer MUST see
  a clear, actionable error rather than a silent hang or an unrelated crash
  later in the app.
- What happens if the CI end-to-end test environment fails to provision
  (e.g., times out spinning up)? The pipeline run MUST fail clearly and MUST
  NOT be treated as a passing check.
- What happens if a pull request comes from a fork or an untrusted source
  that shouldn't have access to any deployment credentials? Automated checks
  (lint/type-check/unit/e2e against the hermetic local stack) MUST still run,
  but no production or cloud credentials MUST be exposed to that run.
- What happens if manual approval is rejected or never given? The change
  MUST remain undeployed indefinitely with no automatic fallback deployment.
- What happens if the production database schema and the local/CI schema
  drift apart over time? This MUST NOT be possible by construction — both
  MUST be produced from the same schema definition/migration history.
- What happens if two developers run the local environment at the same
  time on different machines? Each MUST be fully isolated from the other
  with no shared state.
- What happens if a production deploy causes a problem after approval? The
  maintainer MUST be able to redeploy a previous known-good commit by hand;
  no automated rollback is required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a minimal page that demonstrates data
  flowing from the browser, through an API endpoint, into the database, and
  back to the browser, to prove the full stack works end-to-end.
- **FR-002**: The system MUST have a production environment that serves
  this page and its API to real visitors from a real, cloud-hosted database
  and related services (not a local or simulated backend).
- **FR-003**: Developers MUST be able to run a complete local database,
  authentication, and file storage stack entirely on their own machine, with
  no internet connection required once initial setup is complete.
- **FR-004**: The local development stack MUST be startable and stoppable
  through a single, documented command.
- **FR-005**: The local development stack MUST be fully isolated from
  production and from any other shared/cloud environment — no local action
  can read or write production/shared data.
- **FR-006**: The system MUST provide an automated end-to-end test run that
  provisions a brand-new, isolated local database/auth/storage stack for
  each run.
- **FR-007**: Automated end-to-end test runs MUST NOT share state with any
  other test run, whether previous, concurrent, or subsequent.
- **FR-008**: Automated end-to-end test runs MUST NOT depend on, or make
  calls to, any live/cloud-hosted service — the test environment is fully
  self-contained.
- **FR-009**: The local, CI/test, and production environments MUST all be
  provisioned from the same underlying schema/migration definitions, so they
  cannot silently drift apart.
- **FR-010**: Every pull request MUST automatically trigger linting,
  type-checking, unit tests, and end-to-end tests without manual action.
- **FR-011**: A pull request MUST be prevented from merging if any automated
  check (lint, type-check, unit test, e2e test) fails.
- **FR-012**: A deployment to production MUST NOT occur automatically
  merely because automated checks passed — it MUST additionally require an
  explicit manual approval action taken by a person.
- **FR-013**: The manual approval step MUST occur only after all automated
  checks have already passed, never before or in place of them.
- **FR-014**: Credentials or configuration granting access to the
  production database/services MUST NOT be accessible to, or usable from,
  the local development or CI/test environments.
- **FR-015**: After a production deployment is approved and completed, the
  production URL MUST reflect the newly deployed change.
- **FR-016**: The smoke-test page and its API route MUST be publicly
  accessible with no sign-in required. Authentication is explicitly out of
  scope for this feature and MUST NOT be a prerequisite for exercising the
  smoke-test flow.
- **FR-017**: The maintainer MUST be able to manually redeploy a previous
  known-good commit to production if a deploy causes a problem. Automated,
  health-check-triggered rollback is not required.

### Key Entities

- **Smoke-test record**: A minimal, throwaway piece of data (e.g., a single
  value with an identifier and timestamp) written and read back purely to
  prove the browser-to-API-to-database path works. It is not part of any
  real product/module data model.
- **Environment**: A named, isolated configuration of the application stack
  (Local Development, CI/Test, Production). Each environment has its own
  database/auth/storage instance and its own credentials; environments never
  share data or credentials with each other.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can go from a fresh checkout of the repository to
  a fully running local environment (app + database + auth + storage), with
  no internet connection required after initial setup, in under 15 minutes.
- **SC-002**: The production page is publicly reachable and completes a full
  write-then-read round trip within 3 seconds of the action being triggered.
- **SC-003**: 100% of pull requests with a failing automated check are
  blocked from merging, with zero manual intervention needed to enforce it.
- **SC-004**: Running the automated end-to-end test suite twice in
  immediate succession produces identical outcomes both times, with zero
  failures caused by leftover state from a prior run.
- **SC-005**: 100% of production deployments have both a fully passing
  automated check suite and a recorded manual approval before going live —
  verified by inspecting deployment history.
- **SC-006**: The automated end-to-end test run completes successfully with
  zero dependency on internet access to any live cloud service.

## Assumptions

- The "trivial page" in User Story 1 is a throwaway smoke-test screen for
  this foundational feature, not a real product module; it may be removed
  or replaced once the first real module ships.
- Manual production-approval authority rests with the project maintainer
  (and, since this is a two-person project, optionally the roommate); no
  formal multi-person approval chain is required.
- Production deploys are triggered by changes landing on the main branch
  after pull request checks have passed, with the manual approval gate
  sitting between "checks passed" and "actually released."
- "Local container runtime" (e.g., Docker or an equivalent) being installed
  on the developer's machine is a one-time setup prerequisite and is not
  itself something this feature needs to provision.
- Initial local/CI setup (e.g., first-time image downloads for the local
  Supabase CLI stack) may require internet access; "works offline" refers to
  day-to-day development after that one-time setup.
- Supabase Auth is not configured, wired up, or exercised by this feature.
  The smoke-test page is intentionally public. Authentication is deferred to
  whichever future module first needs user accounts.
- Dedicated logging/error-tracking conventions and tooling are out of scope
  for this feature; the production environment relies on default
  Cloudflare Workers platform logs until a later feature addresses
  observability explicitly.
