# Hombase

Personal life-management app. This is the foundational walking skeleton
(see `specs/001-foundational-infra/`) — no real modules yet, just proof that
the full stack, local dev, CI, and deploy pipeline all work.

## Stack

Next.js (App Router) + TypeScript, Drizzle ORM + Supabase Postgres, deployed
to Cloudflare Workers via OpenNext. See `.specify/memory/constitution.md`
for the full set of project principles.

## Prerequisites (one-time)

- Node.js 22+ (Wrangler 4.x requires it)
- A local container runtime (Docker or equivalent) — required by the
  Supabase CLI. If `supabase start` hangs or errors, **check that your
  container runtime is actually running first**; that's the most common
  cause.
- The Supabase CLI is invoked via `npx supabase`, no separate install needed.

## Local development (offline-capable)

```bash
npm install
npm run dev   # runs: supabase start -> migrate local DB -> build -> Workers preview
```

Open the URL `preview:workers` prints (a local Miniflare-emulated Workers
runtime, not `next dev`). Everything — Postgres, Auth, Storage — runs
locally via the Supabase CLI; nothing here talks to production or any cloud
service.

**Environment Parity (constitution Principle VI)**: local dev, CI, and
production all resolve the database through the exact same code path —
`getCloudflareContext().env.DATABASE_URL`, a direct `pg` TCP connection
(Workers' `nodejs_compat`) to Supabase's transaction pooler. Locally/in CI
that value comes from `.dev.vars` (gitignored — copy `.dev.vars.example`)
and points at the Supabase CLI stack; in production it's a
`wrangler secret put DATABASE_URL` value pointing at the real pooler.
There's no Node-only fallback to accidentally diverge from production, and
no separate "local mode" of `lib/db.ts` to keep in sync. The tradeoff: no
Next.js `next dev` hot-reload — a full `build:workers` + `preview:workers`
cycle is slower per iteration, but it's the only thing that's actually
guaranteed to behave like production.

(Amendment 2026-07-13: this used to go through a Cloudflare Hyperdrive
binding. Dropped after a production incident where Hyperdrive itself
intermittently hung for minutes before failing — see
`specs/001-foundational-infra/research.md`'s amendment note.)

Copy `.dev.vars.example` to `.dev.vars` before your first `npm run dev` —
it's gitignored (contains a connection string) and not created for you.

Stop with `npm run db:stop`. Data persists across restarts unless you run
`npm run db:reset`.

**Schema changes**: edit `db/schema.ts`, then `npm run db:generate-migration`
(runs `drizzle-kit generate`, diffs the schema and writes a new SQL file
under `drizzle/`) — commit the generated migration file alongside the
schema change. Apply it locally with `npm run db:migrate:local`.

## Tests

```bash
npm run test:unit         # Vitest — shared/data-access code, no server needed
npm run test:e2e          # Playwright — builds + starts + tears down the real
                           # Workers preview itself (playwright.config.ts
                           # `webServer`); reuses `npm run dev` if it's
                           # already running. Needs the local Supabase stack
                           # up (`npm run db:start`) first.
npm run test:integration  # One-shot, fully hermetic: resets the local DB,
                           # migrates, runs test:e2e, stops the DB. This is
                           # what CI runs (US3) — safe to run repeatedly with
                           # no leftover state between runs.
npm test                  # test:unit + test:integration
```

e2e/integration tests always run against the real Workers runtime (never
`next dev`), per Environment Parity above.

## Production setup (manual, one-time — requires your accounts)

This repository ships the code and config; the following steps need a human
with account access and can't be automated by an agent:

1. **Create a Supabase cloud project** (supabase.com). From the **Connect**
   button on the project page, you'll need two different connection
   strings for two different jobs — do not mix them up:
   - **Transaction pooler** (Supavisor, port `6543`) — for the app's live
     queries (step 2 below).
   - **Session pooler** (port `5432`, `aws-<region>.pooler.supabase.com`
     host) — for running migrations (step 3, and `PRODUCTION_DATABASE_URL`
     in CI/CD below). **Do not use the plain "direct connection"**
     (`db.<ref>.supabase.co:5432`) for migrations from CI — it's IPv6-only
     unless you've paid for Supabase's IPv4 add-on, and GitHub Actions
     runners are IPv4-only; `drizzle-kit migrate` will fail to connect
     there. The session pooler supports the same locking behavior Migrate
     needs, over IPv4.
2. **Set the app's `DATABASE_URL` secret** to the **transaction pooler**
   connection string: `npx wrangler secret put DATABASE_URL` (or let
   `deploy.yml` do it from the `PRODUCTION_APP_DATABASE_URL` GitHub secret
   — see CI/CD setup below). Append `?sslmode=require`.
3. **Run migrations against production**: `DATABASE_URL=<session-pooler-url> npx drizzle-kit migrate`.
4. **Deploy**: `npm run deploy:workers` (or let `deploy.yml` do it — see below).
5. **Verify**: visit the production URL, submit the smoke-test form, reload
   — the value should persist within a few seconds.

## CI/CD (GitHub, manual one-time setup)

`.github/workflows/ci.yml` runs lint/typecheck/unit/e2e on every PR — the
e2e job runs against the real Cloudflare Workers runtime locally (see
Environment Parity below), so a passing e2e run is the actual correctness
signal, not a check against production. `.github/workflows/deploy.yml`
deploys to production on merge to `main`, gated by manual approval, and
does not run any test against the live database (deliberately — see
constitution Principle VI). To finish wiring this up on GitHub itself (not
doable from a checked-out repo):

1. **Branch protection**: on `main`, require the `ci.yml` checks to pass
   before merging.
2. **Production environment**: create a GitHub Environment named
   `production` with at least one required reviewer — this is the
   manual-approval gate (FR-012/FR-013).
3. **Secrets**, scoped to the `production` environment only (so pull
   requests from forks never see them):
   - `CLOUDFLARE_API_TOKEN` — "Edit Cloudflare Workers" template, scoped to
     your account
   - `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard sidebar or
     `wrangler whoami`
   - `PRODUCTION_DATABASE_URL` — the **session pooler** connection string
     (see step 1 above under Production setup) — not the direct connection,
     it'll fail with `P1001` from GitHub Actions' IPv4-only runners. Used
     only for running migrations.
   - `PRODUCTION_APP_DATABASE_URL` — the **transaction pooler** connection
     string (`?sslmode=require`). `deploy.yml` sets this as the Worker's
     `DATABASE_URL` secret on every deploy — this is what the app queries
     through at runtime, deliberately a different secret from
     `PRODUCTION_DATABASE_URL` above (different pooler, different job).

## Manual rollback

If a deploy causes a problem, there's no automated rollback (deliberate —
see `plan.md` Complexity Tracking). To roll back by hand:

1. Go to the repo's Actions tab → `deploy.yml` → find the last known-good
   run.
2. Re-run that job. It rebuilds and redeploys that commit's code.
3. If the bad deploy also shipped a schema migration, you'll need to assess
   whether reverting the migration is safe before or after re-deploying the
   old code — there's no automatic migration rollback either.

## What's deliberately not here yet

Per `.specify/memory/constitution.md`'s Bootstrap Sequencing Exception:
Supabase Auth (and the auth-checked Route Handler convention) and PWA
support (manifest/service worker) are **not** part of this feature. Two
dedicated follow-up foundational features must land before any real
product module is built — see `specs/001-foundational-infra/plan.md`
Complexity Tracking.
