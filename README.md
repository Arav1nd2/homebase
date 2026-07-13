~~# HomeBase

A personal life-management app built with Next.js and deployed to Cloudflare
Workers, backed by Supabase Postgres.

## Tech stack

- **Framework**: Next.js (App Router) + TypeScript
- **Database**: Supabase Postgres, accessed via Drizzle ORM
- **Hosting**: Cloudflare Workers, via the OpenNext adapter
- **Testing**: Vitest (unit), Playwright (end-to-end)
- **CI/CD**: GitHub Actions

## Getting started

### Prerequisites

- Node.js 22 or later
- A local container runtime (Docker or equivalent), required by the
  Supabase CLI — if `supabase start` hangs or errors, check that it's
  running first
- No separate Supabase CLI install is needed; it's invoked via `npx`

### Local development

```bash
npm install
npm run dev
```

This starts a local Supabase stack (Postgres, Auth, Storage), applies
database migrations, builds the app, and serves it through a local
Cloudflare Workers preview — open the URL it prints. Everything runs
locally; nothing talks to production.

Local dev intentionally runs through the same Cloudflare Workers runtime
used in production (not Next.js's `next dev` server), so the database
connection path, request handling, and any Workers-specific behavior are
identical across local, CI, and production. The tradeoff is slower
iteration — no hot reload — in exchange for local testing that's actually
representative of production.

Stop the local stack with `npm run db:stop`. Data persists across restarts
unless you run `npm run db:reset`.

### Schema changes

1. Edit `db/schema.ts`.
2. Run `npm run db:generate-migration` to generate a migration file under
   `drizzle/`.
3. Commit the generated migration alongside your schema change.
4. Apply it locally with `npm run db:migrate:local`.

## Testing

```bash
npm run test:unit         # Vitest — shared/data-access code
npm run test:e2e          # Playwright, against a local Workers preview
npm run test:integration  # Fully hermetic: fresh local DB, migrate, e2e, teardown
npm test                  # test:unit + test:integration
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which applies
database migrations, builds the app, and deploys to Cloudflare Workers.
Deploys are gated behind a manual approval step in GitHub.

### One-time production setup

1. **Create a Supabase cloud project.** From its **Connect** dialog, get two
   separate connection strings:
   - **Transaction pooler** (port `6543`) — used for the app's live
     queries, via Cloudflare Hyperdrive.
   - **Session pooler** (port `5432`, `aws-<region>.pooler.supabase.com`
     host) — used for running migrations. Don't use the plain "direct
     connection" (`db.<ref>.supabase.co:5432`) for this; it's IPv6-only
     unless you've purchased Supabase's IPv4 add-on, and GitHub Actions
     runners are IPv4-only.
2. **Create a Cloudflare Hyperdrive config** pointing at the transaction
   pooler connection string, and set its ID in the `hyperdrive` block of
   `wrangler.jsonc`.
3. **Run the initial migration**:
   `DATABASE_URL=<session-pooler-url> npx drizzle-kit migrate`.
4. **Deploy**: `npm run deploy:workers`, or push to `main` and let CI/CD
   handle it.
5. **Verify**: visit the production URL and confirm the app loads and can
   read/write data.

### GitHub configuration

1. **Branch protection** on `main`: require CI checks to pass before
   merging.
2. **Production environment**: create a GitHub Environment named
   `production` with at least one required reviewer — this is the
   deploy approval gate.
3. **Secrets**, scoped to the `production` environment:
   - `CLOUDFLARE_API_TOKEN` — an "Edit Cloudflare Workers" token scoped to
     your account
   - `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard, or
     `wrangler whoami`
   - `PRODUCTION_DATABASE_URL` — the session pooler connection string (see
     step 1 above); using the direct connection here will fail from
     GitHub's IPv4-only runners

### Rolling back

There's no automated rollback. To roll back by hand:

1. In the Actions tab, find the last known-good run of `deploy.yml` and
   re-run it — this rebuilds and redeploys that commit.
2. If the bad deploy included a schema migration, assess separately
   whether it's safe to revert before or after redeploying the old code;
   migrations aren't rolled back automatically either.

## Contributing

1. Branch off `main` and make your changes.
2. Before opening a PR, make sure the following all pass locally:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```
3. Open a PR against `main`. GitHub Actions runs lint, type-checking, unit
   tests, and end-to-end tests on every PR — all must pass before merging.
4. Merging to `main` triggers a production deploy, gated behind manual
   approval (see Deployment above).

Design and planning documents for individual features live under `specs/`.

## Roadmap

Authentication (Supabase Auth) and installable PWA support are planned as
foundational work, ahead of further product features.
