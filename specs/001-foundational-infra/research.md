# Research: Foundational Project Infrastructure

> **Amendment (2026-07-12)**: §1 (Prisma + Hyperdrive via `@prisma/adapter-pg`)
> is superseded — the project switched to Drizzle ORM post-implementation
> after Prisma proved unworkable on Workers. See `plan.md`'s amendment note.
> Drizzle uses the same underlying `pg` driver and Hyperdrive binding
> pattern described here, just without Prisma's codegen/engine layer.

All items below were resolved during planning; none remain as
`NEEDS CLARIFICATION`.

## 1. Postgres connectivity from Cloudflare Workers (Prisma)

**Decision**: Use `@prisma/adapter-pg` (Prisma's `driverAdapters` preview
feature) bound through a **Cloudflare Hyperdrive** configuration that points
at the Supabase project's connection-pooled Postgres endpoint (Supavisor, in
transaction mode). Locally and in CI, the same `@prisma/adapter-pg` code
path connects directly to the local Supabase CLI Postgres instance (no
Hyperdrive needed outside the real Workers runtime — `wrangler`'s local dev
mode proxies the Hyperdrive binding straight to the given connection string).

**Rationale**: Cloudflare Workers cannot hold long-lived TCP connections the
way a normal Node server can; Hyperdrive is Cloudflare's supported mechanism
for pooled Postgres access from Workers, and it's compatible with Prisma's
driver-adapter mode. This satisfies constitution Principle VI (no raw
Node-only TCP engine in the Workers runtime) while keeping one Prisma
schema and one query API for local, CI, and production.

**Alternatives considered**:
- Default Prisma Node TCP engine — rejected, explicitly disallowed by
  Principle VI (doesn't behave correctly across Workers invocations).
- Supabase's `postgres.js`/`pg` directly without Prisma — rejected, would
  abandon the constitution's mandated single Prisma-based data-access
  pattern (Principle II) for no benefit at this stage.

## 2. Where Playwright e2e tests run against

**Decision**: CI e2e tests run against the app served through
`opennextjs-cloudflare`'s local preview (Wrangler's local Workers runtime),
not plain `next dev`. The local Supabase CLI stack is started fresh first,
and the Hyperdrive binding is pointed at it via a local connection string.

**Rationale**: Running e2e tests against the actual Workers runtime (rather
than Node's `next dev`) is what catches Workers-incompatibility bugs
(Principle VI) before they reach production, not after. This is the
highest-fidelity hermetic environment achievable without a real Cloudflare
account, and it satisfies FR-006/FR-008 (fresh, isolated, no live-cloud
dependency).

**Alternatives considered**:
- Run e2e against `next dev` (plain Node) — rejected, would not catch
  Workers-runtime-specific bugs (the exact risk Principle VI exists to
  avoid), even though it's simpler to set up.

## 3. CI/CD platform

**Decision**: GitHub Actions. A `ci.yml` workflow runs lint/type-check/unit/
e2e on every pull request. A separate `deploy.yml` workflow runs on merge to
`main`, builds, and deploys to Cloudflare Workers via the OpenNext adapter,
gated by a GitHub **Environment** (`production`) configured with a required
reviewer — this is the manual-approval mechanism GitHub Actions provides
natively, with no extra tooling.

**Rationale**: The project already has no other CI system in place, GitHub
Environments' required-reviewer feature directly satisfies FR-012/FR-013
(manual approval strictly after automated checks pass) without introducing
a new dependency, in line with Principle VIII.

**Alternatives considered**:
- A dedicated CD tool/service — rejected as premature; GitHub Actions
  Environments already provide the exact gate needed.

## 4. Local Supabase CLI stack lifecycle

**Decision**: `supabase start` / `supabase stop` (Supabase CLI, Docker-backed)
provides local Postgres, Auth, and Storage. `supabase db reset` combined with
Prisma Migrate (`prisma migrate deploy` against the local instance) keeps
schema in sync. The same migration history is applied to CI's ephemeral
instance and to the production Supabase project — one migration history,
three environments (Principle II, FR-009).

**Rationale**: This is the documented, supported local-dev workflow for
Supabase and requires no custom tooling.

**Alternatives considered**:
- A hand-rolled Docker Compose Postgres — rejected, duplicates what the
  Supabase CLI already provides (including Auth/Storage emulation, which a
  bare Postgres container wouldn't give us for later features), and
  contradicts Principle VIII (don't build what the stack already offers).

## 5. Auth and PWA setup: explicitly out of scope for this feature

**Decision**: Per user direction during planning, this feature does not
wire up Supabase Auth, the Route Handler auth-check convention (Principle
V), or the PWA manifest/service worker (Principle IV). HomeBase is being
bootstrapped incrementally: this feature is the first slice (walking
skeleton + environments + CI/CD), and dedicated follow-up foundational
features will add auth and PWA support before any real product module is
built. See `plan.md` Constitution Check / Complexity Tracking for the
explicit, tracked gap this creates and the commitment to close it before
module development starts.

**Rationale**: Building the entire constitution's requirements into one
feature would violate Principle VIII (simplicity, incremental delivery) and
delay proving the walking skeleton works. Staging foundational concerns
across a few small features, in an explicit order, is itself the simpler
path.
