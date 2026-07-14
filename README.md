# HomeBase

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
cp .dev.vars.example .dev.vars
npm run db:start   # then fill in SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY from `npx supabase status`
npm run dev
```

This starts a local Supabase stack (Postgres, Auth, Storage), applies
database migrations, builds the app, and serves it through a local
Cloudflare Workers preview — open the URL it prints. Everything runs
locally; nothing talks to production.

`.dev.vars` (gitignored — never commit it) holds local secrets Wrangler
injects as environment bindings. Besides the Supabase URL/key, it also
defines who is allowed to sign in (`ALLOWED_EMAILS`) — see "Signing in"
below.

Local dev intentionally runs through the same Cloudflare Workers runtime
used in production (not Next.js's `next dev` server), so the database
connection path, request handling, and any Workers-specific behavior are
identical across local, CI, and production. The tradeoff is slower
iteration — no hot reload — in exchange for local testing that's actually
representative of production.

Stop the local stack with `npm run db:stop`. Data persists across restarts
unless you run `npm run db:reset`.

### Signing in

The app is gated behind sign-in: enter your email on the login screen and
a 6-digit code is sent to it (via local Supabase's Inbucket/Mailpit at
`http://127.0.0.1:54324` in dev — no real email is sent locally). Only
email addresses on an allow-list can sign in.

To add yourself locally, append your email to the comma-separated
`ALLOWED_EMAILS` in `.dev.vars`. Sessions stay signed in for 30 days of
activity — closing and reopening the app doesn't require signing in again
until then.

In production, GitHub Actions secrets are the single source of truth for
all secrets (see "GitHub configuration" below) — to add someone, update
the `ALLOWED_EMAILS` secret in GitHub (Settings → Secrets and variables →
Actions) with the full comma-separated list (this replaces the previous
value, so include everyone who should still have access), then re-run
`deploy.yml` (push to `main`, or trigger it manually from the Actions tab)
to sync it to the Worker. Never set it directly with `wrangler secret put`
against production — that would only update Cloudflare's copy, leaving it
out of sync with GitHub the next time anyone deploys.

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
database migrations, builds the app, deploys to Cloudflare Workers, and
syncs auth secrets from GitHub to the Worker. It can also be triggered
manually from the Actions tab (`workflow_dispatch`) — useful when you've
only changed a secret and don't have a new commit to push. Deploys are
gated behind a manual approval step in GitHub either way.

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
4. **Configure Supabase Auth** in the hosted project's Dashboard
   (Authentication → Sign In / Providers → Email, and Authentication →
   Sessions): OTP expiry 10 minutes, resend cooldown 60 seconds, and a
   30-day session inactivity timeout. These settings live only in the
   hosted project — they don't sync from `supabase/config.toml`, so update
   both whenever one changes.
5. **Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `ALLOWED_EMAILS`**
   as GitHub Actions secrets (see "GitHub configuration" below) — not via
   `wrangler secret put` directly. `deploy.yml` pushes them to the Worker
   on every run. Use the project's publishable key (`sb_publishable_...`,
   from the same **Connect** dialog / API settings page), not the legacy
   anon key.
6. **Deploy**: push to `main`, or trigger `deploy.yml` manually from the
   Actions tab — either way it builds, migrates, deploys, and syncs
   secrets to the Worker.
7. **Verify**: visit the production URL, confirm it redirects to the login
   screen, and that signing in with an allowed email works end-to-end.

### GitHub configuration

1. **Branch protection** on `main`: require CI checks to pass before
   merging.
2. **Production environment**: create a GitHub Environment named
   `production` with at least one required reviewer — this is the
   deploy approval gate.
3. **Secrets**, scoped to the `production` environment — these are the
   single source of truth for every credential this project uses (see the
   constitution's Additional Constraints); `deploy.yml` syncs the auth
   ones to the Worker on every run, so nothing is ever set by hand
   directly against Cloudflare:
   - `CLOUDFLARE_API_TOKEN` — an "Edit Cloudflare Workers" token scoped to
     your account
   - `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard, or
     `wrangler whoami`
   - `PRODUCTION_DATABASE_URL` — the session pooler connection string (see
     step 1 above); using the direct connection here will fail from
     GitHub's IPv4-only runners
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`, not
     the legacy anon key) — from the same Supabase cloud project's API
     settings
   - `ALLOWED_EMAILS` — comma-separated household member emails allowed to
     sign in; update this whenever someone is added or removed, then
     re-run `deploy.yml`

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

Installable PWA support (manifest, service worker, offline behavior) is
planned as foundational work, ahead of further product features.
