# Quickstart: Validating the Auth Shell Migration

Run these after implementation to confirm the feature meets spec.md's
Success Criteria. This is a validation guide, not an implementation guide
— see `contracts/auth-ui.md` for the component interfaces and
`data-model.md` for the token/entity shapes being validated.

## Prerequisites

- Local Supabase stack running (`npm run db:start`) — sign-in is real,
  not mocked, in both dev and this quickstart.
- Dependencies installed (`npm install`) after this feature adds
  `@tanstack/react-form` and shadcn's `input`/`label` primitives to
  `packages/web/package.json`.
- `ALLOWED_EMAILS` configured in `packages/web/.dev.vars` (per
  `.dev.vars.example`) so at least one email can complete sign-in.
- The send-email worker running (`npm run dev --workspace=send-email --
  --port 8788`) so a real code is deliverable — or read it directly from
  the fake-resend capture server if running against the e2e stack.

## 1. Sign in through the re-skinned screens (SC-002, SC-003, User Story 1)

```bash
npm run dev
```

Visit `http://localhost:8787/login` at a 375×667 phone viewport (spec
FR-012). Confirm:

- The screen displays the serif oversize mark, sage palette, and
  sans-serif body text used throughout the shell (SC-003) — not the old
  unstyled form.
- No back-to-hub affordance is present anywhere on the login or
  code-entry screen (FR-009, Acceptance Scenario 5).
- Submitting an allow-listed email advances to the code-entry step with
  the same copy/behavior as before this migration (FR-001, FR-002).
- Entering the correct code signs in and lands on `/` — the hub/home
  route, not a tool screen (FR-008, SC-002).
- Entering an incorrect or expired code shows the shared `ErrorState`
  pattern (boundary + icon + text, no toast) rather than a one-off inline
  error (FR-010).

## 2. Confirm protection by default (SC-001, User Story 2)

```bash
curl -sI http://localhost:8787/ | head -1
curl -sI http://localhost:8787/styleguide | head -1
```

With no session cookie attached, both requests' page-navigation
equivalent (via a browser, not `curl`, since the redirect happens through
`middleware.ts`'s cookie-aware check) should land on `/login`. Confirm in
a browser:

- Visiting `/` while signed out redirects to `/login` (unchanged from
  002-email-otp-auth, re-verified here since this feature reorganizes the
  route into `app/(app)/`).
- Visiting `/styleguide` returns a 404 — the route no longer exists at
  all (FR-011; this is the one URL whose behavior actually changes, from
  "renders publicly" to "doesn't exist").
- While signed in, visiting `/login` redirects away to `/` rather than
  showing the login form (FR-007, existing behavior re-verified).

## 3. Confirm sign-out still works (User Story 3)

Sign in, then use the existing sign-out control on the smoke-test page.
Confirm you land on `/login`, and that pressing the browser back button
does not reveal any cached protected content (re-verifies
002-email-otp-auth's existing guarantee through the reorganized routes).

## 4. Confirm the deleted example screen is fully gone

```bash
test -d packages/web/app/styleguide && echo "STILL EXISTS" || echo "removed"
grep -rn "styleguide" packages/web/middleware.ts packages/e2e/ 2>/dev/null
```

Expected: `removed`, and no remaining references in `middleware.ts` or
`packages/e2e/` (its spec file is deleted alongside the route).

## 5. Confirm no client-side auth-status store was added

```bash
grep -rn "zustand" packages/web/package.json packages/web/lib packages/web/providers 2>/dev/null
```

Expected: no match — research.md §3's deliberate scope decision, kept
visible here so a future contributor can see it was intentional, not
forgotten.

## 6. Unit tests for shared component changes (Constitution Principle VII)

```bash
npm run test:unit
```

Expected: passing coverage for `page-header.test.tsx`'s updated
assertions (both `showBackToHub` states) and the new
`form-field.test.tsx` (renders label/input/error correctly; error only
appears when passed, never injects its own validation timing).

## 7. End-to-end auth flow (existing specs, reused)

```bash
npm run test:e2e
```

Expected: `auth-signin.spec.ts`, `auth-signout.spec.ts`, and
`auth-session-persistence.spec.ts` all pass unmodified in assertions
(same accessible names, same URLs) against the re-skinned UI — this is
the concrete proof of SC-004/SC-005 ("zero regressions," "same number of
steps"). `styleguide.spec.ts` is gone, not skipped.

## 8. Lint / typecheck

```bash
npm run lint
npm run typecheck
```

Expected: clean. No `any`/non-null assertions without an inline
justifying comment (Constitution Principle I).

## Out of scope for this quickstart

- No manual iOS Safari / Android Chrome PWA verification — Principle IV
  remains deferred, unchanged from 003-ui-shell-foundation (plan.md
  Constitution Check).
- No verification of a hub/launcher screen's own content — spec
  Assumptions state that screen is a separate, not-yet-built feature; this
  quickstart only confirms the redirect target, not what's rendered there.
