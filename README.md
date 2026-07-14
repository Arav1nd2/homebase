# HomeBase

A personal life-management app built with Next.js and deployed to Cloudflare
Workers, backed by Supabase Postgres.

## Tech stack

- **Framework**: Next.js (App Router) + TypeScript
- **Database**: Supabase Postgres, accessed via Drizzle ORM
- **Auth**: Supabase Auth (email one-time codes), sign-in emails rendered
  with React Email and sent via Resend
- **Hosting**: Cloudflare Workers, via the OpenNext adapter
- **Testing**: Vitest (unit), Playwright (end-to-end)
- **CI/CD**: GitHub Actions

## Project structure

An npm workspaces monorepo:

```text
packages/
├── web/          # The Next.js app — deployed as its own Cloudflare Worker
├── send-email/   # Dedicated Worker: receives Supabase's Send Email Hook,
│                 # renders the sign-in email, sends it via Resend
└── e2e/          # Playwright end-to-end tests covering both of the above
```

`supabase/` (local Supabase CLI config), `.specify/` (spec/plan docs), and
this README live at the repo root, shared across all three packages.

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
cp packages/web/.dev.vars.example packages/web/.dev.vars
cp packages/send-email/.dev.vars.example packages/send-email/.dev.vars
cp .env.example .env
npm run db:start   # then fill in SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY from `npx supabase status`
npm run dev
```

`npm run dev` starts a local Supabase stack (Postgres, Auth, Storage),
applies database migrations, builds `packages/web`, and serves it through
a local Cloudflare Workers preview — open the URL it prints. Everything
runs locally; nothing talks to production.

Local dev intentionally runs through the same Cloudflare Workers runtime
used in production (not Next.js's `next dev` server), so the database
connection path, request handling, and any Workers-specific behavior are
identical across local, CI, and production. The tradeoff is slower
iteration — no hot reload — in exchange for local testing that's actually
representative of production.

Stop the local stack with `npm run db:stop`. Data persists across restarts
unless you run `npm run db:reset`.

**To actually sign in locally** (not just load the login page), the
send-email Worker also needs to be running, since Supabase Auth delegates
sending the code entirely to it (see "Signing in" below):

```bash
npm run dev --workspace=send-email -- --port 8788
```

`npm run test:e2e` starts this (and a fake Resend capture server) for you
automatically — see "Testing" below. You only need to start it by hand for
interactive manual testing.

`.dev.vars` files (gitignored — never commit them) hold local secrets
Wrangler injects as environment bindings, one per package that needs them
(`packages/web/.dev.vars`, `packages/send-email/.dev.vars`). The repo-root
`.env` (also gitignored) holds `SEND_EMAIL_HOOK_SECRET`, read by the
Supabase CLI itself via `config.toml`'s `env()` substitution — a separate
mechanism from `.dev.vars`. That secret must exactly match the same value
in `packages/send-email/.dev.vars`.

### Signing in

The app is gated behind sign-in: enter your email on the login screen and
a 6-digit code is sent to it. Only email addresses on an allow-list can
sign in.

The code is delivered via Supabase Auth's **Send Email Hook**: Supabase
never sends the email itself — it calls `packages/send-email`'s Worker
with the code, which renders a React Email template and sends it through
Resend. Locally, that Worker is configured (via its own `.dev.vars`) to
call a fake local capture server instead of the real Resend API — see
`specs/002-email-otp-auth/research.md` §10 for the full reasoning,
including an explicit callout of what that fake server *can't* verify
(anything about the real Resend API/domain actually working).

To add yourself locally, append your email to the comma-separated
`ALLOWED_EMAILS` in `packages/web/.dev.vars`. Sessions stay signed in for
30 days of activity — closing and reopening the app doesn't require
signing in again until then.

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

1. Edit `packages/web/db/schema.ts`.
2. Run `npm run db:generate-migration` to generate a migration file under
   `packages/web/drizzle/`.
3. Commit the generated migration alongside your schema change.
4. Apply it locally with `npm run db:migrate:local`.

## Testing

```bash
npm run test:unit         # Vitest — packages/web's shared/data-access code
npm run test:e2e          # Playwright — starts web, send-email, and a fake
                           # Resend capture server automatically
npm run test:integration  # Fully hermetic: fresh local DB, migrate, e2e, teardown
npm test                  # test:unit + test:integration
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which applies
database migrations, builds and deploys **both** `packages/web` and
`packages/send-email` to Cloudflare Workers, and syncs both packages' auth
secrets from GitHub. It can also be triggered manually from the Actions
tab (`workflow_dispatch`) — useful when you've only changed a secret and
don't have a new commit to push. Both deploys are gated behind one manual
approval step in GitHub.

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
   `packages/web/wrangler.jsonc`.
3. **Run the initial migration**:
   `DATABASE_URL=<session-pooler-url> npx drizzle-kit migrate` (from
   `packages/web/`).
4. **Configure Supabase Auth session settings** in the hosted project's
   Dashboard (Authentication → Sessions): a 30-day session inactivity
   timeout. This setting lives only in the hosted project — it doesn't
   sync from `supabase/config.toml`, so update both whenever one changes.
5. **Create a Resend account and verify a sending domain.** Sign-in emails
   are sent from this domain (e.g. `sign-in@yourdomain.com`) — Resend
   won't deliver from an unverified one.
6. **Configure Supabase's Send Email Hook** (Authentication → Hooks → Send
   Email hook, in the hosted project's Dashboard): set it to HTTPS,
   pointing at the deployed `packages/send-email` Worker's URL, and
   generate its webhook secret there — this becomes `SEND_EMAIL_HOOK_SECRET`
   below.
7. **Set the following as GitHub Actions secrets** (see "GitHub
   configuration" below) — never via `wrangler secret put` directly:
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`, not
     the legacy anon key), `ALLOWED_EMAILS` — for `packages/web`
   - `SEND_EMAIL_HOOK_SECRET` (from step 6), `RESEND_API_KEY` (from
     Resend), `RESEND_FROM_ADDRESS` (e.g. `"HomeBase <sign-in@yourdomain.com>"`,
     using the domain verified in step 5) — for `packages/send-email`
8. **Deploy**: push to `main`, or trigger `deploy.yml` manually from the
   Actions tab — either way it builds, migrates, deploys both Workers, and
   syncs secrets.
9. **Manually verify real email delivery once.** This is not optional and
   automated tests cannot substitute for it (see
   `specs/002-email-otp-auth/research.md` §10 for exactly why): sign in
   with a real allowed email and confirm the code actually arrives. This
   is the only way to confirm the Resend API key and verified domain are
   actually working — the local fake capture server used in automated
   tests can't validate either.
10. **Verify overall**: visit the production URL and confirm it redirects
    to the login screen.

### GitHub configuration

1. **Branch protection** on `main`: require CI checks to pass before
   merging.
2. **Production environment**: create a GitHub Environment named
   `production` with at least one required reviewer — this is the
   deploy approval gate.
3. **Secrets**, scoped to the `production` environment — these are the
   single source of truth for every credential this project uses (see the
   constitution's Additional Constraints); `deploy.yml` syncs them to both
   Workers on every run, so nothing is ever set by hand directly against
   Cloudflare:
   - `CLOUDFLARE_API_TOKEN` — an "Edit Cloudflare Workers" token scoped to
     your account
   - `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard, or
     `wrangler whoami`
   - `PRODUCTION_DATABASE_URL` — the session pooler connection string (see
     step 1 above); using the direct connection here will fail from
     GitHub's IPv4-only runners
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`, not
     the legacy anon key) — from the Supabase cloud project's API settings
   - `ALLOWED_EMAILS` — comma-separated household member emails allowed to
     sign in; update this whenever someone is added or removed, then
     re-run `deploy.yml`
   - `SEND_EMAIL_HOOK_SECRET` — from the Send Email Hook's dashboard setup
   - `RESEND_API_KEY`, `RESEND_FROM_ADDRESS` — from Resend

### Rolling back

There's no automated rollback. To roll back by hand:

1. In the Actions tab, find the last known-good run of `deploy.yml` and
   re-run it — this rebuilds and redeploys that commit (both Workers).
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
