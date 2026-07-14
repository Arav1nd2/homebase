# Tasks: Email OTP Authentication

**Post-implementation amendment (2026-07-14)**: T003, T012, T026, and the
e2e tests below were originally built and completed against an
HMAC-SHA256 + pepper allow-list scheme (`ALLOWED_EMAIL_HMACS` +
`EMAIL_ALLOWLIST_PEPPER`). That was reconsidered and reverted to a plain
`ALLOWED_EMAILS` list — see spec.md's Clarifications and research.md §6
for the full reasoning (both Cloudflare Worker secrets and GitHub Actions
secrets already prevent read-back, which was the hashing's main point).
The task descriptions below are left as originally written (historical
record of what was actually done at the time); the current code, `.dev.vars`,
and all other docs reflect the plain-email design.

**Second amendment (same day)**: T008, T009, and the `SUPABASE_ANON_KEY`
references in T003/T004/T026 also originally used Supabase's legacy JWT
`anon` key. That was switched to the current-generation publishable key
(`sb_publishable_...`, env var `SUPABASE_PUBLISHABLE_KEY`) after checking
Supabase's docs — the two are drop-in equivalents for any client library
version, so this was a rename with no logic change. Current code and all
other docs use `SUPABASE_PUBLISHABLE_KEY`.

**Input**: Design documents from `/specs/002-email-otp-auth/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/auth-api.md](./contracts/auth-api.md), [quickstart.md](./quickstart.md)

**Tests**: Included. Constitution Principle VII requires unit tests for shared
auth infrastructure and at least one behavior test per Route Handler; the
allow-list's no-oracle response is a non-obvious rule that also needs a
regression test under the same principle.

**Organization**: Tasks are grouped by user story (US1/US2/US3, matching
spec.md's P1/P2/P3) so each story can be implemented and validated
independently, per `quickstart.md`'s scenario numbering.

## Path Conventions

Single Next.js App Router project at the repository root (per plan.md
Project Structure) — `app/`, `lib/`, `middleware.ts`, `supabase/`,
`tests/unit/`, `tests/e2e/`.

---

## Phase 1: Setup

**Purpose**: Get Supabase Auth reachable from the Worker and secrets
handled safely, before any auth logic is written.

- [X] T001 Add `@supabase/ssr` and `@supabase/supabase-js` to `package.json` dependencies (`npm install @supabase/ssr @supabase/supabase-js`)
- [X] T002 [P] Add `.dev.vars` to `.gitignore` (currently missing — Wrangler's local-secrets file must never be committed)
- [X] T003 [P] Create `.dev.vars.example` at the repo root documenting the required variable names (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ALLOWED_EMAIL_HMACS`, `EMAIL_ALLOWLIST_PEPPER`) with placeholder, not real, values
- [X] T004 Populate a local (gitignored) `.dev.vars` with the local Supabase stack's URL/anon key (from `supabase status`), a locally-generated pepper, and the HMAC of at least one real test email you control — see `research.md` §6 for the HMAC scheme
- [X] T005 [P] Update `supabase/config.toml`: set `auth.email.otp_expiry = 600`, `auth.email.max_frequency = "60s"`, and uncomment/set `auth.sessions.inactivity_timeout = "720h"` (research.md §3–4)

**Checkpoint**: Local stack can reach Supabase Auth with the right config; no plaintext secret can be accidentally committed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared session/auth infrastructure every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Add a minimal pass-through `middleware.ts` at the repo root and confirm it actually executes under `npm run preview:workers` (the real Cloudflare Workers runtime via OpenNext) — this project has never run Next.js middleware before; per `research.md` §7, verify compatibility now rather than after the feature is built on top of it. If it does not run correctly, stop and fall back to the per-layout auth-check approach noted in research.md §7 before continuing.
- [X] T007 [P] Create `lib/validation/auth.ts` with Zod schemas `emailInputSchema` (valid email) and `verifyCodeInputSchema` (email + exactly 6-digit code, per contracts/auth-api.md's verify-code body shape)
- [X] T008 [P] Create `lib/supabase/server.ts`: a server-side Supabase client factory using `@supabase/ssr`'s `createServerClient`, wired to Next.js `cookies()`, reading `SUPABASE_URL`/`SUPABASE_ANON_KEY` via `getCloudflareContext().env` — mirror `lib/db.ts`'s binding-access pattern (no `process.env` fallback, per constitution Principle VI Environment Parity)
- [X] T009 Create `lib/supabase/middleware.ts`: a middleware-flavored Supabase client factory bound to the `NextRequest`/`NextResponse` cookie adapter (depends on T006 passing)
- [X] T010 Implement the real `middleware.ts` logic (replacing the T006 stub): call `supabase.auth.getUser()` on every request; redirect a signed-out visitor on any path other than `/login`/`/api/auth/*` to `/login` (FR-001); redirect a signed-in visitor on `/login` to `/` (FR-013); let everything else through, persisting any refreshed session cookie (depends on T009). Verified against the real Workers preview: `GET /` with no session returns `307` to `/login`.
- [X] T011 [P] Create `lib/supabase/session.ts` with a `getSessionOrThrow()` helper (constitution Principle V's shared auth-check helper) built on `lib/supabase/server.ts`'s client, calling `getUser()` (not `getSession()`) and throwing a typed `UnauthorizedError` a Route Handler can turn into the shared 401 shape (depends on T008)
- [X] T012 [P] Create `lib/auth/allowlist.ts`: normalize an email (trim, lowercase), compute `HMAC-SHA256(EMAIL_ALLOWLIST_PEPPER, normalizedEmail)`, and compare (constant-time) against the comma-separated `ALLOWED_EMAIL_HMACS` list, reading both via `getCloudflareContext().env` (research.md §6)
- [X] T013 [P] Unit test `lib/auth/allowlist.ts` in `tests/unit/allowlist.test.ts`: matching email passes, non-matching fails, case/whitespace normalization is applied before hashing (depends on T012)
- [X] T014 [P] Unit test `lib/supabase/session.ts` in `tests/unit/supabase-session.test.ts`: `getSessionOrThrow()` returns the user on a valid session and throws on no session (depends on T011)

**Checkpoint**: Route protection, session access, and the allow-list check all exist and are unit-tested — user story implementation can now begin.

---

## Phase 3: User Story 1 - Sign in with an emailed one-time code (Priority: P1) 🎯 MVP

**Goal**: A signed-out visitor can request a code, receive it by email, enter it, and reach the main application; the main page is unreachable without this.

**Independent Test**: Follow `quickstart.md` Scenarios 1, 2, and 5 — sign in with an allowed email end-to-end; confirm a disallowed email produces an identical response with no email sent; confirm an already-signed-in visitor hitting `/login` is redirected away.

### Implementation for User Story 1

- [X] T015 [P] [US1] Implement `POST /api/auth/request-code` in `app/api/auth/request-code/route.ts` per `contracts/auth-api.md`: validate with `emailInputSchema` (T007), check `lib/auth/allowlist.ts` (T012), call Supabase `signInWithOtp({ email })` only on a match, and always return the same generic success response (FR-003, FR-014)
- [X] T016 [P] [US1] Implement `POST /api/auth/verify-code` in `app/api/auth/verify-code/route.ts` per `contracts/auth-api.md`: validate with `verifyCodeInputSchema` (T007), call Supabase `verifyOtp({ email, token, type: 'email' })` via the server client (T008), and return `{ data: { redirectTo: "/" } }` on success or the shared 401 error shape on failure
- [X] T017 [US1] Build `app/login/page.tsx`: a mobile-first client component with an email-entry step (posts to `request-code`) and a code-entry step (posts to `verify-code`), showing the shared error messages and redirecting to `/` on success (depends on T015, T016)
- [X] T018 [US1] Customize the local Supabase email template (`supabase/templates/magic_link.html` + `[auth.email.template.magic_link]` in config.toml) so the 6-digit code (`{{ .Token }}`) is the prominent, readable element of the sign-in email — verified against a real sent message in local Inbucket (research.md §1)
- [X] T019 [US1] Regression test in `tests/unit/request-code.test.ts`: assert `POST /api/auth/request-code` returns byte-identical response shape/status for an allow-listed vs. a non-allow-listed email, and that only the allow-listed case triggers a Supabase call (FR-003, FR-014 — non-obvious rule per constitution Principle VII) (depends on T015)
- [X] T020 [US1] Playwright e2e `tests/e2e/auth-signin.spec.ts` covering quickstart Scenarios 1, 2, and 5 against the local Workers preview, reading the emailed code from local Inbucket via the new `tests/e2e/inbucket.ts` helper (depends on T010, T017, T018). **Correctness fix found while implementing**: `middleware.ts`'s original design (redirect any unauthenticated non-`/login`/`/api/auth/*` path) would have 307-redirected the pre-existing, intentionally-public `/api/smoke` route (constitution bootstrap exception, FR-016 from 001-foundational-infra) and any other API JSON caller. Corrected so middleware only gates page navigation (`/api/*` is always passed through; each Route Handler enforces its own auth via `getSessionOrThrow()` per constitution Principle V) — `contracts/auth-api.md` updated to match. Also updated the pre-existing `tests/e2e/smoke.spec.ts` UI test to sign in first, since `/` is now gated.

**Checkpoint**: User Story 1 is fully functional and independently testable — the app is gated behind working email-OTP sign-in.

---

## Phase 4: User Story 2 - Frictionless return visits on the installed PWA (Priority: P2)

**Goal**: A previously signed-in user reopening the app does not have to sign in again while their session is valid.

**Independent Test**: Follow `quickstart.md` Scenario 3 — sign in, simulate closing/reopening the app after a delay, confirm no login prompt appears; confirm an expired session does show the login screen.

### Implementation for User Story 2

- [X] T021 [US2] Playwright e2e `tests/e2e/auth-session-persistence.spec.ts` covering quickstart Scenario 3 (depends on T010, T017). **Adjusted from the literal task description**: simulates "closing/reopening the installed PWA" via a fresh Playwright `BrowserContext` seeded with the signed-in session's `storageState`, rather than restarting the Workers preview process — session validity here is enforced entirely by Supabase Auth + the cookie (research.md §3), not by any in-memory state in the preview process, so restarting it wouldn't exercise anything a fresh-context/same-cookie test doesn't already cover. Separately confirms a context with no session cookie is redirected to `/login`.

**Checkpoint**: User Story 2 is validated with no new production code — the 30-day sliding session (Setup T005) plus the middleware built for US1 (T010) already deliver this behavior, per `research.md` §3's "configure, don't build" decision.

---

## Phase 5: User Story 3 - Explicit sign-out (Priority: P3)

**Goal**: A signed-in user can sign out and immediately lose access to the main application on that device.

**Independent Test**: Follow `quickstart.md` Scenario 4 — sign in, sign out, confirm the main page is unreachable (including via back-navigation) without signing in again.

### Implementation for User Story 3

- [X] T022 [P] [US3] Implement `POST /api/auth/sign-out` in `app/api/auth/sign-out/route.ts` per `contracts/auth-api.md`: require a valid session via `getSessionOrThrow()` (T011), call Supabase `signOut()`, and return `{ data: { redirectTo: "/login" } }`, clearing the session cookie
- [X] T023 [US3] Add a sign-out control to `app/page.tsx` that calls `POST /api/auth/sign-out` and navigates to `/login` on success (depends on T022)
- [X] T024 [US3] Playwright e2e `tests/e2e/auth-signout.spec.ts` covering quickstart Scenario 4: sign in, sign out, confirm immediate redirect, and confirm back-navigation to `/` does not show cached app content (SC-005) (depends on T023)

**Checkpoint**: All three user stories are independently functional.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Production parity and hardening that spans all stories.

- [ ] T025 **Requires manual action in the Supabase Dashboard (not performed — needs your hosted-project credentials).** Set the hosted Supabase project's Authentication settings (OTP expiry 10 minutes, sessions inactivity timeout 30 days, tightened email rate limit) to match `supabase/config.toml` (T005) — these do not sync automatically from `config.toml` (research.md §3 operational note). Steps are documented in `README.md`'s "One-time production setup."
- [ ] T026 **Requires manual action in GitHub (not performed — needs your repo admin access).** Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (the current-generation `sb_publishable_...` key, not the legacy anon key), and `ALLOWED_EMAILS` as GitHub Actions secrets scoped to the `production` environment — these are the single source of truth per the constitution's "GitHub Actions secrets are the single secret manager" constraint; `deploy.yml` syncs them to the Cloudflare Worker secret on every run, so there is no separate `wrangler secret put` step to perform. Steps are documented in `README.md`'s "One-time production setup" and "GitHub configuration."
- [X] T027 [P] Update `README.md` with plain-language local setup steps for signing in (allow-list configuration, required `.dev.vars` entries) — no internal spec/process terminology, consistent with the rest of the README
- [X] T028 [P] Security pass: grep the new code for any accidental logging of raw emails, OTP codes, or the pepper, and confirm every error response is checked against FR-014's non-disclosure requirement. Clean: the only `console.error` (`request-code`) logs Supabase's own generic error message, never the email/code/pepper; `.dev.vars` confirmed untracked by git.
- [X] T029 Ran every scenario in `quickstart.md` end-to-end locally (via direct curl against the local Workers preview, in addition to the Playwright suite) — all 5 pass, including Scenario 3 with a literal full stop/restart of the preview process (not just a fresh browser context) to confirm the session survives a real process restart, not only a client-side one.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup (needs `.dev.vars`/config in place) — BLOCKS all user stories.
- **User Stories (Phase 3–5)**: All depend on Foundational completion.
  - US1 has no dependency on US2/US3.
  - US2 depends only on Foundational + US1's middleware (T010) and login page (T017) already existing to have something to test against — it adds no new production code of its own.
  - US3 depends only on Foundational (`getSessionOrThrow()`, T011) and touches its own new route + a small addition to the existing main page.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational. No dependency on US2/US3.
- **User Story 2 (P2)**: Can start after Foundational; in practice its only task is a test that exercises US1's middleware/login page, so schedule it after US1 lands.
- **User Story 3 (P3)**: Can start after Foundational — independent of US1/US2's own tasks, though it reuses `getSessionOrThrow()` from Foundational.

### Parallel Opportunities

- T002, T003, T005 (Setup) can run in parallel — different files.
- T007, T008, T011, T012 (Foundational) can run in parallel once T001 is done — different files, no cross-dependency among them.
- T013, T014 (Foundational tests) can run in parallel with each other once their respective helpers (T012, T011) are done.
- T015, T016 (US1 route handlers) can run in parallel — different files.
- T022 (US3 route handler) can run in parallel with any remaining US1/US2 task — different file, only depends on Foundational.

---

## Parallel Example: Foundational Phase

```bash
Task: "Create lib/validation/auth.ts with Zod schemas for email and code"
Task: "Create lib/supabase/server.ts server-side Supabase client factory"
Task: "Create lib/supabase/session.ts getSessionOrThrow() helper"
Task: "Create lib/auth/allowlist.ts HMAC allow-list check helper"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (includes the middleware compatibility spike — do not skip)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run quickstart.md Scenarios 1, 2, 5 — the app is now fully gated behind working sign-in
5. This is a legitimate, deployable MVP: sessions already default to Supabase's standard behavior even before US2's config is verified in production, and sign-out (US3) isn't required for the app to be secure — an expiring session is.

### Incremental Delivery

1. Setup + Foundational → foundation ready, nothing user-visible yet.
2. Add User Story 1 → validate → this closes the constitution's Principle V bootstrap gap; a real product module could now be built (once Principle IV/PWA also lands, per plan.md Complexity Tracking).
3. Add User Story 2 → validate → confirms the long-lived-session config actually behaves as intended under a simulated PWA reopen.
4. Add User Story 3 → validate → adds user-controlled sign-out.
5. Final Phase → production parity + hardening before deploy.

---

## Notes

- [P] tasks touch different files with no unmet dependency.
- [Story] labels map each task to spec.md's US1/US2/US3 for traceability.
- No task in this list adds a new Postgres/Drizzle table or a new Cloudflare binding — see `data-model.md` and `research.md` §4 for why (the 3-attempt-lockout/KV design was explicitly descoped; revisit only if abuse is observed).
- Commit after each task or logical group; stop at each checkpoint to validate that story independently before moving on.
