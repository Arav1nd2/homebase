# Hombase

Personal life-management app. This is the foundational walking skeleton
(see `specs/001-foundational-infra/`) — no real modules yet, just proof that
the full stack, local dev, CI, and deploy pipeline all work.

## Stack

Next.js (App Router) + TypeScript, Prisma + Supabase Postgres, deployed to
Cloudflare Workers via OpenNext. See `.specify/memory/constitution.md` for
the full set of project principles.

## Prerequisites (one-time)

- Node.js 20+
- A local container runtime (Docker or equivalent) — required by the
  Supabase CLI. If `supabase start` hangs or errors, **check that your
  container runtime is actually running first**; that's the most common
  cause.
- The Supabase CLI is invoked via `npx supabase`, no separate install needed.

## Local development (offline-capable)

```bash
npm install
cp .env.local.example .env.local
npm run dev   # runs: supabase start -> prisma migrate deploy -> next dev
```

Open <http://localhost:3000>. Everything — Postgres, Auth, Storage — runs
locally via the Supabase CLI; nothing here talks to production or any cloud
service (enforced by a guard in `lib/prisma.ts` — a non-local `DATABASE_URL`
is rejected outside the real Cloudflare Workers runtime).

Stop with `npm run db:stop`. Data persists across restarts unless you run
`npm run db:reset`.

## Tests

```bash
npm run test:unit   # Vitest — shared/data-access code
npm run test:e2e    # Playwright — full round trip (needs the local stack running)
```

For a higher-fidelity e2e run against the actual Cloudflare Workers runtime
(not just `next dev`):

```bash
npm run build:workers
npm run preview:workers &
PLAYWRIGHT_BASE_URL=http://localhost:8771 npm run test:e2e
```

(Port depends on what `preview:workers` reports on startup.)

## Production setup (manual, one-time — requires your accounts)

This repository ships the code and config; the following steps need a human
with account access and can't be automated by an agent:

1. **Create a Supabase cloud project** (supabase.com). Note its pooled
   (Supavisor, transaction-mode) connection string.
2. **Create a Cloudflare Hyperdrive config** pointing at that connection
   string, then uncomment and fill in the `hyperdrive` block in
   `wrangler.jsonc` with its id.
3. **Run migrations against production**: `DATABASE_URL=<supabase-direct-url> npx prisma migrate deploy`.
4. **Deploy**: `npm run deploy:workers` (or let `deploy.yml` do it — see below).
5. **Verify**: visit the production URL, submit the smoke-test form, reload
   — the value should persist within a few seconds.

## CI/CD (GitHub, manual one-time setup)

`.github/workflows/ci.yml` runs lint/typecheck/unit/e2e on every PR.
`.github/workflows/deploy.yml` deploys to production on merge to `main`,
gated by manual approval. To finish wiring this up on GitHub itself (not
doable from a checked-out repo):

1. **Branch protection**: on `main`, require the `ci.yml` checks to pass
   before merging.
2. **Production environment**: create a GitHub Environment named
   `production` with at least one required reviewer — this is the
   manual-approval gate (FR-012/FR-013).
3. **Secrets**: add `CLOUDFLARE_API_TOKEN` and the production `DATABASE_URL`
   (for the migration step) as secrets scoped to the `production`
   environment only, so pull requests from forks never see them.

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
