# Quickstart: Foundational Project Infrastructure

Validation guide for this feature. Assumes Node.js 20+, Docker (or
equivalent, for the Supabase CLI), and the Supabase CLI are installed —
one-time prerequisites (see spec Assumptions).

## 1. Local development (validates User Story 2)

```bash
npm install
supabase start          # local Postgres/Auth/Storage — no internet required after images are cached
npx prisma migrate deploy
npm run dev
```

Open `http://localhost:3000`. Expected: the smoke-test page loads, shows no
record yet, and submitting the form persists a value that survives a page
reload. Disconnect from the internet first and repeat — behavior must be
identical (spec SC-001, FR-003, FR-005).

Stop with `supabase stop`; restart later without data loss unless
`supabase db reset` is run explicitly.

## 2. Hermetic e2e run (validates User Story 3)

```bash
supabase start           # fresh instance
npx prisma migrate deploy
npm run build:workers    # opennextjs-cloudflare build
npm run preview:workers  # local Workers runtime (wrangler/Miniflare)
npm run test:e2e         # Playwright, against the preview above
supabase stop
```

Expected: tests pass with zero network calls to any live/cloud service
(check via Playwright's network log or a network-blocking CI runner
profile). Run the whole sequence twice in a row — both runs must produce
identical results with no shared state (spec SC-004, FR-006, FR-007,
FR-008).

## 3. Production smoke check (validates User Story 1)

After a deploy completes:

1. Visit the production URL.
2. Submit the smoke-test form.
3. Reload — the submitted value is still there, read from the real
   Supabase cloud project (spec SC-002: round trip within 3 seconds).
4. Confirm no sign-in was required at any point (FR-016).

## 4. Pipeline gate check (validates User Story 4)

1. Open a pull request with a deliberate lint violation. Expected: the
   `ci.yml` checks fail and the PR is blocked from merging (FR-010, FR-011).
2. Fix it and get all checks green. Expected: merging to `main` triggers
   `deploy.yml`, which builds and then **pauses** on the `production`
   GitHub Environment awaiting a manual reviewer approval (FR-012, FR-013).
3. Approve it. Expected: the deploy proceeds and the production URL
   reflects the change (FR-015).
4. If a bad deploy needs to be undone: re-run `deploy.yml` against the
   previous known-good commit (FR-017 — manual rollback only).

## Out of scope for this quickstart

Signing in, PWA install prompts, and any real module (habits, bills, etc.)
— none of that exists yet. See `plan.md` Complexity Tracking for the
follow-up features that add auth and PWA support before module work begins.
