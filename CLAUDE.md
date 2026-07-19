# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

HomeBase: a personal life-management app for two people, built with Next.js (App Router) + TypeScript, Supabase Postgres via Drizzle ORM, and deployed to Cloudflare Workers via the OpenNext adapter. Auth is Supabase Auth with email one-time codes, delivered through a custom Send Email Hook worker + Resend.

npm workspaces monorepo:
- `packages/web` — the Next.js app (pages + API Route Handlers), deployed as Worker `hombase`.
- `packages/send-email` — a small, separate Worker (`homebase-send-email-hook`) whose only job is to receive Supabase's Send Email Hook webhook, render the sign-in email, and send it via Resend. This is the one documented exception to "single deployment target" (see constitution below) — it exists only because that webhook needs its own internet-reachable endpoint.
- `packages/e2e` — Playwright tests exercising both workers together, plus a fake Resend capture server so no real emails go out in local/CI runs.

## Commands

Setup:
```bash
npm install
cp packages/web/.dev.vars.example packages/web/.dev.vars
cp packages/send-email/.dev.vars.example packages/send-email/.dev.vars
cp .env.example .env
npm run db:start   # then fill in SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY from `npx supabase status`
```

Dev: `npm run dev` — starts local Supabase, migrates, builds `packages/web`, and serves it through a **real Cloudflare Workers preview** (Wrangler/Miniflare), not `next dev`. This is deliberate (see Environment Parity below); the tradeoff is no hot reload. To sign in locally you also need the send-email worker running: `npm run dev --workspace=send-email -- --port 8788`.

Lint / typecheck: `npm run lint`, `npm run typecheck`

Tests:
```bash
npm run test:unit         # Vitest, packages/web only
npm run test:e2e          # Playwright — auto-starts web, send-email, fake-resend server
npm run test:integration  # fresh local DB -> migrate -> e2e -> teardown
npm test                  # test:unit + test:integration
```

Single test:
```bash
# from packages/web/
npx vitest run tests/unit/allowlist.test.ts

# from packages/e2e/
npx playwright test auth-signin.spec.ts
```

DB schema changes: edit `packages/web/db/schema.ts` → `npm run db:generate-migration` → commit the generated file under `packages/web/drizzle/` → `npm run db:migrate:local`.

## Architecture notes

**Auth flow** spans all three packages: `/login` → `request-code` Route Handler checks the allow-list and asks Supabase Auth to send an OTP → Supabase Auth calls the Send Email Hook → `packages/send-email` verifies the webhook signature, renders the React Email template, sends via Resend (or the fake capture server locally/CI) → user enters the code → `verify-code` Route Handler completes sign-in (30-day session).

**DB connections are per-request, not pooled** (`packages/web/lib/db.ts`): every DB access opens a new `pg.Client` against a connection string resolved from `getCloudflareContext().env.HYPERDRIVE` — there is no `globalThis` or Node-only fallback, and calling it outside the real Workers runtime throws by design. Short timeouts (8-10s) are set on every connection. This exists because of a real incident: a Worker isolate torn down mid-transaction once left a lock held for 10+ minutes. Hyperdrive does the pooling at the edge; the Worker just connects, queries, and closes.

**Environment parity is a hard constraint**: local dev, CI, and production must all resolve infrastructure access (DB, bindings) through the exact same code path — the real Workers runtime, never a parallel Node-only branch. This isn't stylistic: a prior `globalThis`-based fallback let CI pass against a working local DB while the real Hyperdrive path was broken in prod, shipping an outage.

**Governance**: `.specify/memory/constitution.md` is the authoritative, actively-amended source of project conventions (currently v3.3.0) — read it before making structural decisions. Key checkable rules it enforces:
- `any` and non-null assertions (`!`) are forbidden without an inline justifying comment (ESLint-enforced in `packages/web/eslint.config.mjs`).
- Drizzle tables: `camelCase` singular variable name, `PascalCase` singular SQL table name, every table has `id`/`createdAt`/`updatedAt`/an ownership column; schema changes always ship as committed `drizzle-kit generate` migrations.
- Route Handlers live under `app/api/<module>/...`, check the Supabase session before any DB touch, return errors as `{ error: { message, code } }`, and validate input via Zod.
- Mobile-first, phone-viewport-first design; installable PWA (manifest + service worker) is a MUST but is a currently-open gap tracked in the README roadmap, permitted under the constitution's "Bootstrap Sequencing Exception" until the first real module ships.
- E2E sign-in tests must each use a unique email — a past shared-email race caused intermittent OTP-capture failures that looked like infra bugs.
- No new dependency, service, or abstraction without a concrete current need (Principle VIII) — this project has one maintainer and no team to design abstractions for.

`.specify/` and `specs/` hold this project's spec-kit workflow (constitution, feature specs, plans, tasks — see `specs/001-foundational-infra`, `specs/002-email-otp-auth`); the `speckit-*` skills operate on these for larger features.

**Design docs**: `DESIGN.md` and `JOURNEY.md` live at the project root (not in `design/`) because the design-for-ai plugin's own commands do a hardcoded `ls DESIGN.md JOURNEY.md` there to detect a locked design system and resume mid-lifecycle — moving them breaks that. `design/VOICE.md` (tone/copy rules) and `design/mocks/*.html` (rendered page specimens) have no such constraint and live under `design/`. speckit and design-for-ai don't cross-reference each other automatically; the `speckit-design-context` skill (`.claude/skills/speckit-design-context/`) bridges them per-feature — run it after `/speckit-specify` to produce `specs/<feature>/design-reference.md`, and read its "Revision discipline" section before hand-editing any design doc mid-implementation.

**Known loose end**: `.claude/settings.local.json` has allow-listed commands referencing `shadcn/ui` (`npx shadcn@latest add ...`) and a `/styleguide` route, but no `components.json`, `components/` directory, or Tailwind config currently exist in source — only stale traces in gitignored `.next`/`.open-next` build caches. Don't assume shadcn/Tailwind are configured; this looks like unfinished or uncommitted work.
