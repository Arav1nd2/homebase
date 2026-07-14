# Implementation Plan: Email OTP Authentication

**Branch**: `002-email-otp-auth` | **Date**: 2026-07-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-email-otp-auth/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Gate the app behind Supabase Auth email-OTP sign-in, closing the
Principle V (auth) bootstrap gap that `001-foundational-infra` deliberately
left open. A signed-out visitor reaches a `/login` screen, requests a
6-digit code, redeems it via a `middleware.ts` + `@supabase/ssr`
cookie-session pattern, and is protected on every other route. Sessions use
Supabase Auth's built-in 30-day inactivity timeout (not custom code) so the
installed PWA stays signed in across reopens without friction. A static
allow-list (Workers secret) gates who may request a code at all, since
this is a private two-person household app, not public signup.
No new Postgres/Drizzle table or Cloudflare binding is introduced — see
`data-model.md` for why Supabase Auth's own managed schema (plus its
built-in rate limiting) covers every entity in the spec for this
iteration; a per-code attempt-lockout was considered and explicitly
deferred (research.md §4).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 22 (local
tooling; Workers Node compatibility runtime in production) — unchanged
from `001-foundational-infra`.

**Primary Dependencies**: `@supabase/ssr` (new), `@supabase/supabase-js`
(new, used underneath `@supabase/ssr`), existing Next.js (App Router),
Drizzle/`pg` (unchanged, untouched by this feature), Zod.

**Storage**: No new Postgres/Drizzle table and no new Cloudflare binding.
Supabase Auth's own managed schema (`auth.users`, session/refresh-token
state, `auth.audit_log_entries`) handles accounts, sessions, and the audit
trail (FR-015). Rate limiting (FR-008) uses Supabase Auth's built-in
per-IP throttles only for this iteration — a per-code attempt counter
(which would need a new KV binding) is explicitly deferred. See
`research.md` §§3–4, 8 and `data-model.md`.

**Testing**: Vitest (allow-list check helper, `getSessionOrThrow()`
helper), Playwright (full sign-in/sign-out journeys against the local
Workers preview, reading codes from local Supabase's Inbucket per
`quickstart.md`).

**Target Platform**: Cloudflare Workers via OpenNext (production), local
Workers preview via Wrangler (dev/CI) — unchanged, but this feature is the
first to require Next.js **middleware** to run under that runtime, which
is explicitly called out as an unverified assumption to spike first (see
Phase 0 risk in `research.md` §7 and Task 1 below).

**Project Type**: Web application — same single Next.js project, no new
deployment target.

**Performance Goals**: Sign-in flow (request code → receive → verify) completes in
under 60s under normal conditions (SC-001); middleware's per-request
`getUser()` check should not add perceptible latency to page loads.

**Constraints**: Cloudflare Workers bundle-size/Node-compat limits
(Principle VI, unchanged); local/CI/production parity for both the
Supabase Auth session-timeout config and the allow-list secrets
(`research.md` §3's operational note — hosted project settings must be
kept in sync with `config.toml` manually); no plaintext household email
may appear in repo config or logs (FR-009, FR-014, `research.md` §6).

**Scale/Scope**: Two allowed household member accounts; one `/login`
screen; three Route Handlers (`request-code`, `verify-code`, `sign-out`);
one `middleware.ts`; no new Cloudflare bindings; the existing single main
page moves behind this gate unchanged otherwise.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Strict TypeScript Everywhere | PASS | Zod schemas for `request-code`/`verify-code` bodies; Supabase's generated `User`/`Session` types used instead of hand-rolled ones. |
| II. Consistent Drizzle Schema Conventions | PASS (N/A) | No new table added — see `data-model.md`. Nothing to name/prefix/own, so no convention to violate. |
| III. Mobile-First, Responsive by Default | PASS | `/login` and code-entry screens designed phone-first: single column, large tap targets for the 6-digit input, per Additional Constraints' accessibility baseline. |
| IV. Installable, Reliable PWA | **DEFERRED (unchanged)** | This feature does not add the manifest/service worker; see Complexity Tracking — a dedicated PWA-installability feature is still required before any real product module, per the Bootstrap Sequencing Exception. This feature's session design (research.md §3, §5) is written so that follow-up feature doesn't need to touch session logic at all. |
| V. Consistent Route Handler API Conventions | PASS | `request-code`/`verify-code`/`sign-out` follow the shared error/response shapes (`contracts/auth-api.md`). `request-code`/`verify-code` are the documented, narrow exception to "verify session before touching anything," since their entire purpose is establishing that session — `sign-out` does require an existing session. This feature is also what *introduces* the shared `getSessionOrThrow()` helper every future module's routes must use. |
| VI. Cloudflare Workers Runtime Constraints | PASS, pending Task 1 spike | `@supabase/ssr`/`@supabase/supabase-js` are fetch-based, no Node-only APIs. Next.js middleware under OpenNext's Cloudflare adapter is untested in this project; per the project's own Prisma-incident lesson, Task 1 verifies this first, before the rest of the feature is built on top of it. Fallback (per-layout auth check instead of middleware) is documented in `research.md` §7 if the spike fails. |
| VII. Pragmatic Testing | PASS | Shared session helper and allow-list helper get unit tests (Principle VII's "shared code" rule); each new Route Handler gets an auth-behavior test; full journeys get Playwright coverage per `quickstart.md`. |
| VIII. Simplicity Over Premature Abstraction | PASS | Deliberately avoided a custom session table, custom OTP-attempt table/KV counter, and custom audit log by configuring/reusing what Supabase Auth already provides (research.md §§3,4,8) — this feature adds no new Cloudflare bindings at all, only Supabase config changes. |

One PASS-with-deviation (Route Handler auth-check narrow exception,
inherent to this feature's purpose) and one continuing DEFERRED item
(Principle IV) are tracked in **Complexity Tracking** below.

## Project Structure

### Documentation (this feature)

```text
specs/002-email-otp-auth/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── auth-api.md        # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

**Amendment**: The tree below reflects this feature's implementation
before a later pivot (research.md §10) moved sign-in email delivery from
Supabase's own SMTP/template system to a Send Email Hook handled by a
second, dedicated Cloudflare Worker, and the whole repo was restructured
into an npm workspaces monorepo (`packages/web`, `packages/send-email`,
`packages/e2e`) to accommodate it. The tree is left as originally written
below (historical record); see the **Structure Decision** note and
research.md §10 for what actually shipped.

```text
app/
├── page.tsx                       # Existing main page — now reachable only via middleware gate
├── layout.tsx
├── login/
│   └── page.tsx                    # New: email entry + code entry UI (client component)
└── api/
    ├── smoke/route.ts              # Existing, untouched
    └── auth/
        ├── request-code/route.ts   # POST — see contracts/auth-api.md
        ├── verify-code/route.ts    # POST — see contracts/auth-api.md
        └── sign-out/route.ts       # POST — see contracts/auth-api.md

middleware.ts                       # New: route protection + session refresh (FR-001, FR-013)

lib/
├── db.ts                           # Existing, untouched
├── api-response.ts                 # Existing, untouched
├── validation/
│   ├── smoke.ts                    # Existing, untouched
│   └── auth.ts                      # New: Zod schemas for email/code
└── supabase/
    ├── server.ts                    # New: server-side Supabase client factory (Route Handlers)
    ├── middleware.ts                 # New: middleware-flavored Supabase client factory
    └── session.ts                    # New: getSessionOrThrow() shared helper (Principle V)

supabase/
└── config.toml                     # Modified: [auth.sessions] inactivity_timeout, [auth.email]
                                     # otp_expiry/max_frequency, per research.md §3–4

wrangler.jsonc                      # Unchanged — no new bindings for this feature

tests/
├── unit/
│   ├── prisma.test.ts               # Existing (misnamed historically; actually Drizzle) — untouched
│   ├── supabase-session.test.ts     # New: getSessionOrThrow() behavior
│   └── allowlist.test.ts             # New: allow-list check helper
└── e2e/
    ├── smoke.spec.ts                 # Existing, untouched
    └── auth.spec.ts                   # New: sign-in/out journeys, per quickstart.md
```

**What actually shipped** (current tree, post-amendment):

```text
packages/
├── web/                             # Everything in the tree above, unchanged in substance,
│   ├── app/, lib/, middleware.ts    # just relocated one level down as an npm workspace
│   ├── tests/unit/
│   └── wrangler.jsonc
├── send-email/                      # New: dedicated Worker (constitution exception)
│   ├── emails/magic-link.tsx        # React Email template (devDependency-only; never
│   │                                 # imported by the deployed Worker itself)
│   ├── scripts/build-template.ts    # Pre-renders the template to static HTML at build time
│   ├── src/index.ts                 # Verifies the webhook, sends via Resend
│   └── wrangler.jsonc
└── e2e/                             # Playwright tests, moved out of packages/web entirely
    ├── *.spec.ts
    ├── fake-resend-server.ts        # Hermetic Resend stand-in for tests (research.md §10)
    └── playwright.config.ts

supabase/                            # Unchanged location (shared by both Workers)
└── config.toml                      # Also gained [auth.hook.send_email] (research.md §10)

.env                                 # New: SEND_EMAIL_HOOK_SECRET, read via config.toml's
                                      # env() substitution (separate from .dev.vars)
```

**Structure Decision**: Originally, a single Next.js App Router project
(constitution: one codebase, one deployment target), with auth-specific
code grouped under `lib/supabase/`. That single-project structure is
unchanged for the app itself — `packages/web` **is** that same project,
just relocated. What changed is the addition of `packages/send-email`, an
explicit, narrowly-scoped exception to the single-deployment-target rule
(constitution Additional Constraints, amended for this), and the
resulting move to an npm workspaces monorepo so the new Worker, the app,
and the e2e tests (which now exercise both) could each have their own
`package.json`/dependencies without polluting each other's.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| `request-code` and `verify-code` skip the Principle V "verify session first" sub-rule | These two routes exist specifically to *create* a session; there is no session yet to check. | N/A — this is the one Route Handler category where the rule structurally cannot apply, same reasoning the constitution itself anticipates for auth-establishing endpoints. |
| No PWA manifest/service worker (Principle IV) still not delivered | This feature's scope, per explicit user request, is auth specifically; PWA installability is a materially separate concern (manifest, icons, service worker caching strategy, iOS/Android install-flow verification) that deserves its own focused feature rather than being bundled in. | Per the Bootstrap Sequencing Exception, this is only acceptable because a dedicated follow-up PWA-installability feature is explicitly named as required before any real product module — same commitment `001-foundational-infra` made and is now carrying forward one more feature. **Follow-up feature required next (or before any household module): PWA installability (manifest + service worker).** |
| A second Cloudflare Worker (`packages/send-email`) — Principle VI / Additional Constraints "single deployment target" | Supabase's Send Email Hook needs an internet-reachable HTTPS endpoint that isn't part of the main app's own session-authenticated routes; see research.md §10 for the full reasoning (email deliverability requirements forced a change to Supabase's own email system regardless, and the React Email/Resend pivot on top of that needed a webhook receiver). | Adding it as a Route Handler in `packages/web` was considered and rejected: it would mix a third-party-facing webhook into an app whose every other route is called only by its own frontend, without actually avoiding a second thing to build/maintain (the Worker's logic still has to exist somewhere). The constitution was amended with an explicit, narrow, named exception (one webhook, no user-facing routes, no unrelated logic) rather than silently violating the rule. |
