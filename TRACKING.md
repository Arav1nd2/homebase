# Follow-up tracking

No GitHub repository exists yet for this checkout, so these can't be filed
as GitHub issues yet — convert them once the repo is pushed. Required by
`.specify/memory/constitution.md`'s Bootstrap Sequencing Exception and
`specs/001-foundational-infra/plan.md` Complexity Tracking: **both MUST land
before any real product/module feature is built.**

## 1. Supabase Auth + Route Handler auth-check convention

Wire up Supabase Auth end-to-end and establish the constitution Principle V
auth-check convention (`getSessionOrThrow()` or equivalent, used at the top
of every Route Handler that isn't explicitly public). Once this lands,
`/api/smoke` (or its replacement) should either adopt the convention or be
deleted — see `data-model.md`.

## 2. PWA support

Add the manifest, icons, and service worker (via `next-pwa` or an actively
maintained equivalent) required by constitution Principle IV — installable
on iOS Safari and Android Chrome, app shell cached for offline/flaky-network
use.

## Also manual, not yet done (see README.md for details)

- T016/T017: create the production Supabase project, configure the
  Cloudflare Hyperdrive binding, and run the first production deploy.
- T031-T033: GitHub branch protection on `main`, the `production`
  Environment with a required reviewer, and scoped deploy secrets.
- T028: empirically verify CI e2e hermeticity (two back-to-back runs) once
  this is pushed and `ci.yml` actually runs on GitHub.
