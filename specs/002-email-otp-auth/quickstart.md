# Quickstart: Validating Email OTP Authentication

**Feature**: [spec.md](./spec.md) | **Contracts**: [contracts/auth-api.md](./contracts/auth-api.md)

## Prerequisites

- Local stack running: `npm run dev` (starts local Supabase, migrates,
  builds, and serves the Workers preview — see repo `README.md`).
- Local secrets set in `.dev.vars` (gitignored): `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `ALLOWED_EMAILS` (containing at least one test
  email you control locally).
- Local Supabase Inbucket (email capture) at `http://127.0.0.1:54324` —
  every OTP email sent by the local stack lands here instead of a real
  inbox.

**Local testing caveat**: Supabase's per-email resend cooldown
(`auth.email.max_frequency`, 60s per FR-008) is enforced against the same
persistent local Postgres across runs. Re-running these scenarios (or the
Playwright suite) back-to-back within 60 seconds for the *same* email
address will get silently rate-limited (no new code sent) — this is the
real control working as intended, not a bug. Either wait 60s between runs,
use a fresh email each time, or run `npm run test:integration` (resets the
local database, clearing all rate-limit state, before each run). CI is
unaffected: every CI run provisions a brand-new local Supabase stack with
no carried-over state.

## Scenario 1 — Sign in with an allowed email (User Story 1, P1)

1. Open the app's root URL while signed out → confirm you land on
   `/login`, not the main page (FR-001).
2. Submit an email address in your local `ALLOWED_EMAILS` → confirm the UI
   shows "check your email for a code" and responds within SC-001's
   60-second budget.
3. Open Inbucket, find the message, copy the 6-digit code.
4. Enter the code on the verify screen → confirm redirect to `/` and the
   main app page renders.

**Expected**: Steps 2–4 complete well under 60 seconds; the main page is
reachable only after step 4.

## Scenario 2 — Disallowed email produces no observable difference (FR-003, FR-006, SC-006)

1. Submit an email address **not** in the allow-list.
2. Confirm the UI response is identical in wording/timing/shape to
   Scenario 1 step 2.
3. Check Inbucket → confirm no email was sent for this address.

## Scenario 3 — Frictionless return visit (User Story 2, P2)

1. Complete Scenario 1 to sign in.
2. Stop and restart the local Workers preview (`npm run preview:workers`
   again, or fully close and reopen the browser) to simulate reopening an
   installed PWA after a delay.
3. Reload the app's root URL → confirm you land directly on the main page
   with no login prompt (SC-003).

## Scenario 4 — Explicit sign-out (User Story 3, P3)

1. While signed in, trigger sign-out.
2. Confirm immediate redirect to `/login`.
3. Attempt to navigate back to `/` (including via browser back button) →
   confirm you're redirected to `/login`, not shown cached app content
   (SC-005).

## Scenario 5 — Already-signed-in visitor hitting `/login` (FR-013)

1. While signed in, manually navigate to `/login`.
2. Confirm immediate redirect to `/` rather than the login form.

## Manual PWA verification (constitution Principle IV cross-check)

Even though this feature does not add the PWA manifest/service worker
itself (see plan.md Complexity Tracking), the **session behavior** Scenario
3 exercises is the part of "PWA-frictionless" this feature owns. Once a
manifest exists (follow-up feature), re-run Scenario 3 as an actual
installed home-screen app on both a real/simulated iOS Safari session and
an Android Chrome session, per Principle IV's manual-verification
requirement — iOS's storage eviction behavior (research.md §5) is the
platform-specific risk to specifically confirm doesn't regress this
feature's session persistence.
