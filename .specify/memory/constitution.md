<!--
Sync Impact Report
- Version change: 3.3.0 → 3.4.0
- Modified constraint (MINOR: the principle's own text already
  pre-authorized this exact contingency — "an actively maintained
  equivalent if next-pwa becomes unmaintained" — so naming the actual
  replacement is applying existing guidance, not redefining the
  principle; the installability/service-worker requirement itself is
  unchanged):
  - IV. Installable, Reliable PWA on iOS Safari and Android Chrome —
    `next-pwa` → Serwist (`@serwist/next`). Reason: researched during
    006-pwa-installability planning (the feature actually closing the
    Principle IV gap per the Bootstrap Sequencing Exception, split out
    from 005-upi-payment-tracker so the two ship independently) —
    next-pwa is no longer actively maintained and does not support
    Turbopack; Serwist is its purpose-built successor for the Next.js
    App Router, actively maintained, and works as a pure build-time
    plugin that emits a static `public/sw.js` (no Edge Runtime route
    requirement), which does not intersect with
    `@opennextjs/cloudflare`'s known runtime-manifest issues (those are
    all server-side `require()` calls against `.next/*.json`, unrelated
    to a static service-worker asset). See
    specs/006-pwa-installability/research.md for the full comparison.
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (generic Constitution Check gate —
    compatible as-is)
  - ✅ .specify/templates/spec-template.md (no principle-specific placeholders)
  - ✅ .specify/templates/tasks-template.md (no principle-specific placeholders)
- Follow-up TODOs: none
-->

<!--
Sync Impact Report (previous amendment, retained for history)
- Version change: 3.2.0 → 3.3.0
- Added guidance (MINOR: new constraint under an existing principle, no
  existing principle redefined):
  - VII. Pragmatic Testing — new bullet: e2e tests that trigger a real
    sign-in MUST each use their own dedicated, unique email address, never
    shared across tests or spec files. Added after a real incident: with
    Playwright's `fullyParallel` workers, a shared-email fake-inbox-clearing
    helper caused one test to silently wipe another's just-captured OTP
    email, producing intermittent "No OTP email arrived" failures that
    looked like a Docker/host.docker.internal networking bug and were
    debugged as one for a while before the actual cause (test-authoring,
    not infrastructure) was found. See the e2e suite's fake-resend.ts
    history for the fix.
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (generic Constitution Check gate —
    compatible as-is)
  - ✅ .specify/templates/spec-template.md (no principle-specific placeholders)
  - ✅ .specify/templates/tasks-template.md (no principle-specific placeholders)
- Follow-up TODOs: none
-->

<!--
Sync Impact Report (previous amendment, retained for history)
- Version change: 3.1.0 → 3.2.0
- Modified constraint (MINOR: narrows a MUST with an explicit, bounded
  exception rather than redefining or removing it):
  - Additional Constraints — "Single deployment target" gains a narrow,
    named exception: a small, dedicated Cloudflare Worker MAY exist solely
    to receive a third-party webhook callback (e.g. Supabase's Send Email
    Auth Hook) that requires an internet-reachable endpoint separate from
    the main app. Scoped tightly (receive/verify/act on one callback only,
    no user-facing routes, no unrelated logic) and requires being named
    here when added. First instance: `send-email-hook`. Added during
    002-email-otp-auth after deciding to pivot the sign-in email itself to
    a React Email template sent via Resend (through Supabase's Send Email
    Hook) instead of Supabase's own SMTP+template system — see
    specs/002-email-otp-auth/research.md §10.
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (generic Constitution Check gate —
    compatible as-is)
  - ✅ .specify/templates/spec-template.md (no principle-specific placeholders)
  - ✅ .specify/templates/tasks-template.md (no principle-specific placeholders)
- Follow-up TODOs: none
-->

<!--
Sync Impact Report (previous amendment, retained for history)
- Version change: 3.0.0 → 3.1.0
- Added guidance (MINOR: new constraint, no existing principle redefined):
  - Additional Constraints — new bullet "GitHub Actions secrets are the
    single secret manager": every credential/config secret is set once as
    a GitHub Actions secret scoped to the `production` environment;
    Cloudflare Worker secrets are synced from it by `deploy.yml` on every
    run, never set by hand via `wrangler secret put`. Added during
    002-email-otp-auth, prompted by realizing Cloudflare Worker secrets
    and GitHub Actions secrets are both write-only (no read-back), so an
    automated "append one more allow-listed email" workflow had no source
    of truth to append to unless one side was treated as canonical.
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (generic Constitution Check gate —
    compatible as-is)
  - ✅ .specify/templates/spec-template.md (no principle-specific placeholders)
  - ✅ .specify/templates/tasks-template.md (no principle-specific placeholders)
- Follow-up TODOs: none
-->

<!--
Sync Impact Report (previous amendment, retained for history)
- Version change: 2.2.0 → 3.0.0
- Modified principles (MAJOR: redefines the mandated ORM, a
  backward-incompatible stack change per this constitution's own
  Governance MAJOR-bump criteria):
  - II. Consistent Prisma Schema Conventions → II. Consistent Drizzle
    Schema Conventions. Full rewrite: `schema.prisma`/Prisma Migrate →
    `db/schema.ts`/`drizzle-kit`; `cuid()`/`uuid()` id default →
    `crypto.randomUUID()` (no extra dependency); added an explicit
    per-request-connection rule (no long-lived pool across requests).
    Reason: Prisma proved unworkable on Cloudflare Workers during
    001-foundational-infra — native engine binary detection needed
    filesystem access Workers doesn't support, and the newer
    engine-free generator still dynamically compiled a WASM query
    compiler at runtime, which Workers disallows. Neither was
    resolvable without fighting the tooling itself. Drizzle (a thin
    TypeScript layer directly over `pg`, no codegen, no engine, no
    WASM) is Cloudflare's own documented pattern for Hyperdrive and
    sidesteps the whole problem class. See
    specs/001-foundational-infra/plan.md's amendment note for the
    full incident account.
  - I, V, VI, VIII, Additional Constraints, Development Workflow —
    cross-references to Prisma updated to Drizzle (types, error
    messages, driver/connection-pooling rule, dependency list, module
    isolation, PR-description checklist, migration-commit rule).
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (generic Constitution Check gate —
    compatible as-is)
  - ✅ .specify/templates/spec-template.md (no principle-specific placeholders)
  - ✅ .specify/templates/tasks-template.md (no principle-specific placeholders)
  - ⚠ No command files found under .specify/templates/commands/ — nothing to sync
  - ⚠ specs/001-foundational-infra/{research.md,data-model.md,quickstart.md}
    still describe Prisma in detail (historical record of what was tried);
    each now carries an amendment pointer at the top rather than being
    rewritten, since they document a real decision timeline
- Follow-up TODOs: none
-->

# HomeBase Constitution

## Core Principles

### I. Strict TypeScript Everywhere

All code MUST be TypeScript with `strict` mode enabled in `tsconfig.json`
(including `strictNullChecks`, `noImplicitAny`). `any` and non-null assertions
(`!`) are forbidden except with an inline comment justifying why the type
cannot be narrowed. Drizzle-inferred types, Supabase generated types, and
Zod (or equivalent) schemas for Route Handler inputs/outputs MUST be used
instead of hand-rolled interfaces that can drift from the real shape of the
data. `// @ts-ignore` / `// @ts-expect-error` require a comment explaining
the underlying issue and MUST NOT be used to silence a real type error.

**Rationale**: One maintainer, many small modules — the type checker is the
primary safety net standing in for a larger team's code review. Loosening it
anywhere lets bugs cross module boundaries silently.

### II. Consistent Drizzle Schema Conventions

There is exactly one Drizzle schema (`db/schema.ts`, or `db/schema/*.ts` if
split by module), shared by all modules, with one Postgres database
(Supabase), accessed exclusively through Drizzle ORM (`drizzle-orm` +
`pg`). A new module MUST be addable by appending new tables without editing
or renaming another module's tables. To keep that true:

- Every table variable is `camelCase` singular (e.g. `habitEntry`, not
  `habit_entries` or `HabitEntries`); the underlying SQL table name is
  `PascalCase` singular (e.g. `"HabitEntry"`), matching what the table
  variable implies; every column is `camelCase`.
- Every module's tables are prefixed or grouped so ownership is obvious from
  the name (e.g. `habit`, `habitLog` for the habit module; `bill`,
  `billSplit` for bill splitting) — no generic shared table names like
  `item` or `entry` that multiple modules would be tempted to reuse.
- Every table has an `id` (`text`, defaulted via `crypto.randomUUID()` — no
  extra dependency needed for id generation), `createdAt`, and `updatedAt`,
  and a `userId` (or explicit household/shared-access column) establishing
  ownership, so auth checks and cross-module tooling (e.g. a future "recent
  activity" view) can rely on a consistent shape.
- Cross-module references go through a documented foreign key relation, not
  a loosely-typed JSON blob standing in for another module's id.
- Schema changes ship as `drizzle-kit generate`-produced SQL migrations
  committed to the repo under `drizzle/`, applied via `drizzle-kit migrate`;
  ad hoc schema edits directly against shared/prod data are not permitted.
- Database code MUST NOT hold a long-lived connection/pool across requests
  (Workers isolates are request-scoped — Principle VI); connect, query, and
  close per request, relying on Hyperdrive's own pooling.

**Rationale**: Schema conflicts (two modules fighting over a table or column
name) are the most likely source of cross-module breakage as new tools get
added. A naming and ownership convention agreed up front avoids that without
needing per-module databases or schemas. Drizzle specifically (over an
ORM with a generated client/engine layer) was chosen after a real
incident: Prisma's engine-detection and WASM-query-compiler code proved
incompatible with the Workers runtime in ways that weren't resolvable
without fighting the tooling itself — see `specs/001-foundational-infra/plan.md`
for the full account. Drizzle is a thin TypeScript layer directly over
`pg`, with no code generation step, no engine binary, and no WASM, which
sidesteps that entire class of problem.

### III. Mobile-First, Responsive by Default

Every screen and component MUST be designed and tested at phone viewport
widths first, then adapted upward for tablet/desktop — never the reverse.
Touch targets, spacing, and navigation patterns MUST work with one thumb on
a phone before any desktop layout is considered. Desktop/tablet layouts are
a progressive enhancement and MUST NOT be required for a module to be
usable; no feature may ship that only works correctly above a phone-sized
viewport.

**Rationale**: The primary and most frequent usage context is a phone in
hand. Optimizing for desktop first and retrofitting mobile support produces
the wrong default and wastes effort on the less-used surface.

### IV. Installable, Reliable PWA on iOS Safari and Android Chrome

HomeBase MUST remain installable as a Progressive Web App on both iOS
(Safari "Add to Home Screen") and Android (Chrome install prompt), via a
valid `manifest.json` (name, icons at required sizes, `display: standalone`,
theme/background color) and a service worker managed through Serwist
(`@serwist/next`) — or a further actively maintained equivalent if Serwist
itself becomes unmaintained, subject to the same amendment requirement.

The service worker MUST cache the app shell and static assets so previously
loaded screens render offline or on a flaky connection instead of a blank
page or a native browser error. Write actions MAY require connectivity, but
MUST fail visibly with a clear message (no silent data loss, no infinite
spinner) when offline.

Because iOS Safari and Android Chrome diverge in PWA support (iOS has no
background sync, stricter storage eviction, different install UX), any
change touching the manifest, service worker, or caching strategy MUST be
manually verified on both a real or simulated iOS Safari session and an
Android Chrome session before being considered done.

**Rationale**: This app replaces several single-purpose phone apps for two
people, so it must feel installed and reliable on whichever phone opens it.
iOS and Android are different enough in PWA behavior that testing only one
platform routinely misses breakage on the other.

### V. Consistent Route Handler API Conventions

All API endpoints are Next.js App Router Route Handlers under
`app/api/<module>/...`, following one shared convention so a new module's
endpoints are immediately familiar:

- **Routing**: REST-ish resource paths scoped by module, e.g.
  `app/api/habits/route.ts` (list/create), `app/api/habits/[id]/route.ts`
  (get/update/delete). No RPC-style catch-all endpoints unless a module has
  no sensible resource shape.
- **Auth**: Every handler MUST verify the Supabase Auth session at the top
  of the function via one shared helper (e.g. `getSessionOrThrow()`), before
  touching the database. No handler queries the database before confirming
  who is asking.
- **Errors**: Errors MUST be returned as JSON in one shared shape,
  `{ error: { message: string, code: string } }`, with the matching HTTP
  status (400 validation, 401 unauthenticated, 403 unauthorized, 404 missing,
  500 unexpected). Handlers MUST NOT leak raw Drizzle/Postgres error
  messages or stack traces to the client.
- **Validation**: Request bodies/query params MUST be parsed through a Zod
  schema (or equivalent) before use; invalid input returns a 400 with the
  shared error shape, never an unhandled throw.
- **Responses**: Successful responses return the resource (or
  `{ data: ... }` for lists with pagination) — pick one shape per response
  kind and apply it across every module.

**Rationale**: With many small modules built over time, without an enforced
convention every module's API ends up shaped slightly differently, which
turns every new frontend integration into a rediscovery exercise. One
convention makes new modules fast to both build and consume.

### VI. Cloudflare Workers Runtime Constraints

The app deploys as a single Cloudflare Workers deployment via the OpenNext
adapter (`@opennextjs/cloudflare`), Node.js compatibility mode, with no
separate backend service. Before adding any dependency, especially inside
Route Handlers or middleware, confirm it:

- Does not rely on Node APIs unsupported by the Workers Node
  compatibility layer (e.g. native addons, `child_process`, `cluster`,
  filesystem access as persistent storage) — check compatibility before
  adding, don't discover it at deploy time.
- Does not meaningfully risk the Workers bundle/script-size limit; prefer
  lighter libraries and dynamic imports for rarely-used, heavy code paths
  over adding a large dependency to the main bundle.
- Does not assume a long-lived server process (in-memory caches, background
  timers, singleton connections that outlive a request) — Workers isolates
  are request-scoped; persistent state belongs in Postgres, Supabase
  Storage, or Cloudflare's own primitives (KV/Durable Objects), not module
  globals.
- **Environment Parity**: Local development and CI MUST exercise the same
  binding-access code path as production — the real Workers runtime (via
  local preview/Miniflare), not a parallel Node-only code path.
  Environment-specific branching for infrastructure access (database
  connections, bindings, storage) is prohibited: there must be exactly one
  way the code resolves these, used identically in local dev, CI, and
  production, differing only in which underlying resource that one path
  points at (e.g. a binding's local-emulation connection string vs. the
  real production one). A bug in that access path must be catchable in
  local/CI testing, not only discoverable in production.

The ORM (Drizzle, see Principle II) MUST connect to Postgres exclusively
through the Cloudflare Hyperdrive binding, never a driver's default
long-lived pool assumption — Hyperdrive does the pooling at the edge, the
Worker just connects, queries, and closes per request.

When a needed library is genuinely Node-only and has no edge-compatible
alternative, that is a signal to reconsider the feature's implementation,
not to add a second runtime/deployment target — the single Workers
deployment is a hard constraint, not a default that can be quietly walked
back per module.

**Rationale**: Discovering a Workers incompatibility after a module is
built is expensive to unwind. Checking constraints at dependency-selection
time is far cheaper than migrating a module off an incompatible library
later, and a second deployment target would undermine the "one app, one
codebase" premise entirely. Environment-specific fallback branches are
exactly the kind of divergence that lets local/CI tests pass while
production is broken — the whole point of testing before deploy is
defeated if the tested code path and the deployed code path aren't the
same code path (this happened on 001-foundational-infra: a
`globalThis`-based binding check silently fell back to a working local
`DATABASE_URL` in CI while the real Hyperdrive-binding path was broken in
production, so a green CI run shipped an outage).

### VII. Pragmatic Testing

Automated tests are required where they protect against real risk, not as a
blanket mandate:

- Shared code used by multiple modules (the Supabase Auth session helper,
  the shared API error/response helpers, shared UI components, Prisma
  data-access utilities) MUST have unit tests (Vitest or equivalent), since
  a regression there breaks every module at once.
- Business logic with non-obvious rules (e.g. bill-splitting math, recurring
  habit/chore scheduling, unit conversions in recipes) MUST have tests
  covering the non-obvious cases.
- Route Handlers MUST have at least one test per endpoint asserting the auth
  check rejects an unauthenticated request and the error shape matches
  Principle V.
- Simple CRUD screens and presentational UI MAY rely on manual verification
  instead of automated tests.
- Every bug fix for a reported issue MUST include a regression test that
  would have caught it, unless the code path is trivial.
- End-to-end tests that trigger a real sign-in MUST each use their own
  dedicated, unique email address — never shared across tests, even across
  different spec files. Playwright's `fullyParallel` execution and Supabase
  Auth's per-email OTP resend cooldown (`auth.email.max_frequency`) mean two
  tests racing on the same email can silently suppress or misattribute the
  OTP, producing an intermittent failure that looks like an infrastructure
  bug rather than what it actually is: a test-authoring race condition.

Tests MUST be fast enough to run locally before every commit; a suite that
discourages running it is worse than a smaller one that gets run.

**Rationale**: With two users and one maintainer, exhaustive coverage on
low-risk UI is wasted effort. Risk concentrates in shared infrastructure,
auth boundaries, and logic that's easy to get subtly wrong — testing budget
MUST go there.

### VIII. Simplicity Over Premature Abstraction

Build the module that's needed now, using the plainest solution the stack
already offers. Do not introduce a plugin system, generic "module
framework," configuration DSL, or extra abstraction layer until at least two
or three real modules demonstrably need the same pattern — extract the
shared abstraction from real duplication, not from anticipated future needs.

Prefer the tools already in the stack (Next.js Route Handlers, Drizzle,
Supabase Auth/Storage, Cloudflare primitives) over adding a new service or
novel dependency; any new dependency MUST be justified by a concrete current
requirement, not "we might need it when we add module N."

**Rationale**: This is a personal project built for you and your roommate.
There is no team to coordinate through abstraction and no scale problem to
design around. Premature generalization here is pure cost — it slows down
the next feature instead of speeding it up.

## Additional Constraints

- **Single deployment target**: Cloudflare Workers via OpenNext is the only
  deployment target for the application itself. No separate backend
  service, serverless function platform, or second runtime may be
  introduced to work around a Workers limitation — see Principle VI.
  **Narrow exception**: a small, dedicated Cloudflare Worker MAY exist
  solely to receive a webhook callback from a third-party service the app
  integrates with (e.g. Supabase's Send Email Auth Hook), when that
  third-party integration itself requires an internet-reachable endpoint
  separate from the main app's own routes. Such a Worker MUST do nothing
  beyond receiving, verifying, and acting on that one callback — it MUST
  NOT grow its own pages, user-facing routes, or unrelated business logic;
  the moment it would, that logic belongs in the main app instead. Each
  such Worker MUST be documented here by name and purpose when added.
  - `send-email-hook` (`workers/send-email-hook/`): receives Supabase
    Auth's Send Email Hook webhook, renders the sign-in code email, and
    sends it via Resend. See specs/002-email-otp-auth/research.md §10 for
    the full rationale.
- **Auth and storage stay managed**: Authentication goes through Supabase
  Auth and file/image storage through Supabase Storage; modules MUST NOT
  roll their own auth or stand up a separate storage bucket/provider.
- **Module isolation**: A module MUST be addable or removable (feature-flag
  or delete its route/directory/Drizzle tables) without breaking other
  modules. Shared code a module depends on lives in the shared layer, not
  copy-pasted from another module.
- **Accessibility baseline**: Interactive elements MUST be usable via touch
  with adequate tap targets and sufficient color contrast; this is treated
  as part of mobile-first design, not a separate optional pass.
- **GitHub Actions secrets are the single secret manager**: Every credential
  and sensitive config value (database URLs, API tokens, the sign-in
  allow-list, etc.) is set exactly once, as a GitHub Actions secret scoped
  to the `production` environment. Cloudflare Worker secrets are never set
  ad hoc via `wrangler secret put` by hand; `deploy.yml` pushes the current
  GitHub secret values to the Worker on every run (push to `main` or a
  manual `workflow_dispatch`), so Cloudflare's copy can never drift from
  what's in GitHub. To change a secret, update it in GitHub and re-run the
  deploy — never edit it directly on the Cloudflare side.

**Rationale**: Two systems independently holding "the real value" of the
same secret is exactly the kind of divergence Principle VI's Environment
Parity rule warns about for infrastructure access — a secret quietly
changed in one place and not the other is a silent, hard-to-notice
production bug waiting to happen. A single source of truth, synced by the
same pipeline that deploys the code, removes that failure mode entirely.

## Development Workflow

- Changes are reviewed by the maintainer against this constitution before
  being considered done; for a two-person project this means a deliberate
  self-review pass (or your roommate's review), not a formal PR process.
- Any change that adds a new module, a new Drizzle table, a new Route
  Handler, or a new dependency MUST state in its plan/PR description how it
  complies with Principles I, II, V, VI, and VIII (TypeScript strictness,
  schema conventions, API conventions, Workers constraints, no premature
  abstraction).
- PWA-affecting changes MUST note manual iOS Safari + Android Chrome
  verification per Principle IV before being merged.
- Drizzle schema changes MUST include the `drizzle-kit generate`-produced
  migration in the same commit as the table change.

## Governance

This constitution supersedes any conflicting ad hoc practice. Amendments are
made by editing this file directly (no separate approval body, given the
project's size) and MUST include:

1. A description of what changed and why.
2. A version bump following semantic versioning:
   - **MAJOR**: A principle is removed or redefined in a backward-incompatible
     way (e.g., dropping the single-Workers-deployment constraint, changing
     the mandated auth/storage/ORM stack).
   - **MINOR**: A new principle or materially expanded guidance is added.
   - **PATCH**: Wording clarifications or non-semantic fixes.
3. An updated `Last Amended` date.

### Bootstrap Sequencing Exception

A small number of foundational infrastructure features may ship before
every MUST principle is fully satisfied, provided:

1. The gap is explicitly documented in that feature's `plan.md` Constitution
   Check and Complexity Tracking.
2. The plan names the specific follow-up feature(s) that will close the gap.
3. No real product/module feature may be built while a Principle IV (PWA) or
   Principle V (auth) gap remains open — the follow-up feature(s) MUST land
   first.

This exception applies only to the initial bootstrap phase of the project
(before the first real module ships) and MUST NOT be invoked to justify
skipping a principle during ordinary module development.

Any plan or task list produced for a feature MUST include a Constitution
Check confirming alignment with these principles before implementation
begins; unresolved conflicts MUST be simplified away, resolved via the
Bootstrap Sequencing Exception above, or the constitution amended first —
never silently bypassed.

**Version**: 3.4.0 | **Ratified**: 2026-07-12 | **Last Amended**: 2026-07-19
