<!--
Sync Impact Report
- Version change: 2.0.0 → 2.1.0
- Modified principles: none (no principle text changed)
- Added sections:
  - Governance > Bootstrap Sequencing Exception — formally sanctions shipping
    a foundational infrastructure feature (e.g. 001-foundational-infra) before
    every MUST principle is satisfied, provided the gap is documented in that
    feature's plan.md, a closing follow-up feature is named, and no real
    module is built while a Principle IV/V gap remains open. Prompted by
    /speckit-analyze flagging that the prior Governance text only recognized
    "simplify away" or "amend the constitution" as resolution paths, while
    001-foundational-infra's plan.md relied on a documented Complexity
    Tracking deviation instead.
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (generic Constitution Check gate —
    compatible as-is)
  - ✅ .specify/templates/spec-template.md (no principle-specific placeholders)
  - ✅ .specify/templates/tasks-template.md (no principle-specific placeholders)
  - ⚠ No command files found under .specify/templates/commands/ — nothing to sync
- Follow-up TODOs: none
-->

# Hombase Constitution

## Core Principles

### I. Strict TypeScript Everywhere

All code MUST be TypeScript with `strict` mode enabled in `tsconfig.json`
(including `strictNullChecks`, `noImplicitAny`). `any` and non-null assertions
(`!`) are forbidden except with an inline comment justifying why the type
cannot be narrowed. Prisma-generated types, Supabase generated types, and
Zod (or equivalent) schemas for Route Handler inputs/outputs MUST be used
instead of hand-rolled interfaces that can drift from the real shape of the
data. `// @ts-ignore` / `// @ts-expect-error` require a comment explaining
the underlying issue and MUST NOT be used to silence a real type error.

**Rationale**: One maintainer, many small modules — the type checker is the
primary safety net standing in for a larger team's code review. Loosening it
anywhere lets bugs cross module boundaries silently.

### II. Consistent Prisma Schema Conventions

There is exactly one `schema.prisma`, shared by all modules, with one
Postgres database (Supabase). A new module MUST be addable by appending new
models without editing or renaming another module's models. To keep that
true:

- Every model name is `PascalCase` singular (e.g. `HabitEntry`, not
  `habit_entries` or `HabitEntries`); every field is `camelCase`.
- Every module's tables are prefixed or grouped so ownership is obvious from
  the name (e.g. `Habit`, `HabitLog` for the habit module; `Bill`,
  `BillSplit` for bill splitting) — no generic shared table names like
  `Item` or `Entry` that multiple modules would be tempted to reuse.
- Every model has an `id` (`cuid()` or `uuid()`), `createdAt`, and
  `updatedAt`, and a `userId` (or explicit household/shared-access field)
  establishing ownership, so auth checks and cross-module tooling (e.g. a
  future "recent activity" view) can rely on a consistent shape.
- Cross-module references go through a documented foreign key relation, not
  a loosely-typed JSON blob standing in for another module's id.
- Schema changes ship as Prisma Migrate migrations committed to the repo;
  `prisma db push` against shared/prod data is for local prototyping only.

**Rationale**: Prisma schema conflicts (two modules fighting over a table or
field name) are the most likely source of cross-module breakage as new tools
get added. A naming and ownership convention agreed up front avoids that
without needing per-module databases or schemas.

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

Hombase MUST remain installable as a Progressive Web App on both iOS
(Safari "Add to Home Screen") and Android (Chrome install prompt), via a
valid `manifest.json` (name, icons at required sizes, `display: standalone`,
theme/background color) and a service worker managed through `next-pwa` (or
an actively maintained equivalent if `next-pwa` becomes unmaintained — a
replacement requires a constitution amendment noting the swap).

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
  touching Prisma. No handler queries the database before confirming who is
  asking.
- **Errors**: Errors MUST be returned as JSON in one shared shape,
  `{ error: { message: string, code: string } }`, with the matching HTTP
  status (400 validation, 401 unauthenticated, 403 unauthorized, 404 missing,
  500 unexpected). Handlers MUST NOT leak raw Prisma/Postgres error messages
  or stack traces to the client.
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

Prisma MUST be used through a Workers/edge-compatible driver adapter (e.g.
Prisma's driver adapters for serverless Postgres) rather than the default
Node TCP engine, since raw TCP connections don't behave the same way across
Workers invocations.

When a needed library is genuinely Node-only and has no edge-compatible
alternative, that is a signal to reconsider the feature's implementation,
not to add a second runtime/deployment target — the single Workers
deployment is a hard constraint, not a default that can be quietly walked
back per module.

**Rationale**: Discovering a Workers incompatibility after a module is
built is expensive to unwind. Checking constraints at dependency-selection
time is far cheaper than migrating a module off an incompatible library
later, and a second deployment target would undermine the "one app, one
codebase" premise entirely.

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

Prefer the tools already in the stack (Next.js Route Handlers, Prisma,
Supabase Auth/Storage, Cloudflare primitives) over adding a new service or
novel dependency; any new dependency MUST be justified by a concrete current
requirement, not "we might need it when we add module N."

**Rationale**: This is a personal project built for you and your roommate.
There is no team to coordinate through abstraction and no scale problem to
design around. Premature generalization here is pure cost — it slows down
the next feature instead of speeding it up.

## Additional Constraints

- **Single deployment target**: Cloudflare Workers via OpenNext is the only
  deployment target. No separate backend service, serverless function
  platform, or second runtime may be introduced to work around a Workers
  limitation — see Principle VI.
- **Auth and storage stay managed**: Authentication goes through Supabase
  Auth and file/image storage through Supabase Storage; modules MUST NOT
  roll their own auth or stand up a separate storage bucket/provider.
- **Module isolation**: A module MUST be addable or removable (feature-flag
  or delete its route/directory/Prisma models) without breaking other
  modules. Shared code a module depends on lives in the shared layer, not
  copy-pasted from another module.
- **Accessibility baseline**: Interactive elements MUST be usable via touch
  with adequate tap targets and sufficient color contrast; this is treated
  as part of mobile-first design, not a separate optional pass.

## Development Workflow

- Changes are reviewed by the maintainer against this constitution before
  being considered done; for a two-person project this means a deliberate
  self-review pass (or your roommate's review), not a formal PR process.
- Any change that adds a new module, a new Prisma model, a new Route
  Handler, or a new dependency MUST state in its plan/PR description how it
  complies with Principles I, II, V, VI, and VIII (TypeScript strictness,
  schema conventions, API conventions, Workers constraints, no premature
  abstraction).
- PWA-affecting changes MUST note manual iOS Safari + Android Chrome
  verification per Principle IV before being merged.
- Prisma schema changes MUST include the generated migration in the same
  commit as the model change.

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

**Version**: 2.1.0 | **Ratified**: 2026-07-12 | **Last Amended**: 2026-07-12
