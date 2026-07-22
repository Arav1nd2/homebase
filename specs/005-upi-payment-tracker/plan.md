# Implementation Plan: UPI Payment Tracker

**Branch**: `feat/add-payment-tracker` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-upi-payment-tracker/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

The first real HomeBase domain module: a mobile-first tool that opens the
camera immediately, scans a UPI QR code, lets the user confirm an amount
and tag(s), redirects to the device's UPI app to actually pay, and records
every attempt (success/failed/unconfirmed/pending) so it can be reviewed,
filtered, summarized, corrected, or backfilled. No payment credentials are
ever collected — the tool only constructs and redirects to a standard
`upi://pay` deep link; NPCI/UPI app handles the actual authorization.

Three new Drizzle tables (`upiTag`, `upiTransaction`,
`upiTransactionTag`), one new client-side dependency (`jsqr`, for
cross-platform QR decoding since the native `BarcodeDetector` API isn't
supported on iOS Safari), and a set of Route Handlers under
`/api/upi-tracker/**` following the existing auth/error/validation
conventions. The trickiest design decision — what "pending" means
alongside "unconfirmed" so SC-004's "no payment attempt is ever silently
lost" holds even if the user never returns to the tab — is resolved in
`research.md` §3 by persisting the transaction row the instant "Pay" is
tapped, before the redirect fires. `research.md` §4 resolves tag deletion
via soft-delete rather than a name/color snapshot, so renamed/recolored
tags propagate live while deleted tags still render correctly on old
transactions. The installable-PWA prerequisite this spec's Assumptions
section named (`006-pwa-installability`) has already landed, so this plan
adds no PWA/service-worker work of its own — see `research.md` §11.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) — unchanged.

**Primary Dependencies**: Next.js 15 (App Router), React 19, Drizzle ORM +
`pg` (existing, extended with three new tables), Zod (existing, new
schemas), TanStack Query (existing, new queries/mutations for tags and
transactions), shadcn/ui + `components/shared` primitives (existing, no
new UI kit). **New**: `jsqr` (client-side QR decode, zero dependencies —
research.md §1).

**Storage**: Existing Supabase Postgres via Drizzle/Hyperdrive, unchanged
connection pattern (`lib/db.ts`). Three new tables appended to the single
`db/schema.ts` — see `data-model.md`.

**Testing**: Vitest (pure-function coverage of UPI deep-link parse/build,
amount validation, status bucketing, tag-active filtering, plus Route
Handler auth-check tests — Principle VII), Playwright (full user-story
journeys; the camera-scan step specifically via Chromium's
`--use-fake-device-for-media-stream` + a recorded fake video, research.md
§10).

**Target Platform**: Cloudflare Workers via OpenNext (unchanged) — this
feature's new logic is otherwise entirely client-side browser APIs
(`getUserMedia`, Page Visibility API) that have no interaction with the
Workers runtime at all.

**Project Type**: Web application — same single Next.js project, no new
deployment target, no new Cloudflare binding.

**Performance Goals**: SC-001 (scan → redirected to UPI app, under 20s for
a QR with pre-filled amount and existing tag), SC-002 (find a tag's
current-month total, under 10s), SC-005 (correct a transaction, under
15s).

**Constraints**: SC-004 — 100% of payment attempts that reach "Pay" end up
with a definite, persisted status, including the "user never returns"
edge case (research.md §3). FR-018 — strict per-user data isolation, no
cross-user visibility even by id-guessing. FR-019 — no UPI PIN/credential
collection, ever (the deep link construction only ever needs `pa`/`pn`/
`am`/`cu`/`tn`, never anything payment-authorizing). Additional
Constraints — accessible tap targets/contrast for tag chips and the
confirm prompt; offline writes must fail visibly, not silently (Principle
IV).

**Scale/Scope**: 4 user stories (P1–P4), 22 functional requirements, 3
tables, ~8 Route Handlers across two resources (tags, transactions) plus a
summary sub-resource, ~5 new pages under `app/(app)/upi-tracker/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Strict TypeScript Everywhere | PASS | Zod schemas for every Route Handler input (`lib/validation/upi-tracker.ts`); Drizzle-inferred types for `upiTag`/`upiTransaction`/`upiTransactionTag` reused across API and UI, no hand-rolled parallel interfaces. |
| II. Consistent Drizzle Schema Conventions | PASS, one documented reading | New tables appended to the single `db/schema.ts`, `upi`-prefixed, `camelCase` variable/`PascalCase` SQL name, each with `id`/`createdAt`/`updatedAt`/`userId` — **except** the `upiTransactionTag` join table, which omits `userId` by design (research.md §6, tracked below in Complexity Tracking as a documented interpretation, not a silent bypass). |
| III. Mobile-First, Responsive by Default | PASS | The entire scan → amount → tag → pay flow is inherently a one-thumb, phone-first sequence; history/tag-management views designed phone-first per the existing shell conventions (`specs/003-ui-shell-foundation`). |
| IV. Installable, Reliable PWA | PASS | Already satisfied by `006-pwa-installability` (landed) — see research.md §11. This feature's own obligation is the ordinary manual iOS Safari + Android Chrome verification of its *new* screens and the camera permission prompt specifically, tracked in `quickstart.md`, not new manifest/service-worker work. |
| V. Consistent Route Handler API Conventions | PASS | `app/api/upi-tracker/tags/**` and `app/api/upi-tracker/transactions/**`, REST-ish resource paths; every handler calls `getSessionOrThrow()` first (no exception in this module, unlike the auth-establishing routes in `002-email-otp-auth`); shared error shape and Zod validation throughout — see `contracts/upi-tracker-api.md`. |
| VI. Cloudflare Workers Runtime Constraints | PASS | `jsqr` is a small, dependency-free, pure-JS/browser library bundled into client code only — never imported by a Route Handler or middleware, so it has no Workers-runtime or bundle-size-limit interaction beyond ordinary client bundle size. No new binding, no long-lived server-side state. |
| VII. Pragmatic Testing | PASS | Deep-link parse/build, amount validation, status bucketing, and tag-active filtering are non-obvious business logic requiring unit tests (research.md §2–§4); every Route Handler gets an auth-check test; the camera-decode path is spiked and covered via Playwright's fake-video-device mechanism (research.md §10), flagged as the first task for User Story 1 the same way `002-email-otp-auth` flagged its middleware spike. |
| VIII. Simplicity Over Premature Abstraction | PASS | One new dependency (`jsqr`), justified by a concrete, stated requirement (cross-platform QR decode) with no existing alternative in the stack. No new abstraction layer, plugin system, or generic "module framework" introduced — tags/transactions use the same Route Handler + TanStack Query + Drizzle pattern `002-email-otp-auth` already established. Soft-delete (one nullable column) was chosen over a name/color-snapshot design specifically because it's the simpler mechanism, not the more elaborate one (research.md §4). |

One documented Principle II interpretation (join table's omitted `userId`)
is tracked in Complexity Tracking below — not a defect, but recorded per
Governance's "never silently bypassed" requirement.

## Project Structure

### Documentation (this feature)

```text
specs/005-upi-payment-tracker/
├── plan.md                        # This file (/speckit-plan command output)
├── research.md                    # Phase 0 output (/speckit-plan command)
├── data-model.md                  # Phase 1 output (/speckit-plan command)
├── quickstart.md                  # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── upi-tracker-api.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md            # Already produced by /speckit-specify
└── tasks.md                       # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/web/
├── app/
│   ├── (app)/
│   │   └── upi-tracker/
│   │       ├── page.tsx                 # US1 (P1): scan → amount → tag → pay → confirm,
│   │       │                            # client-side step state machine, one route
│   │       ├── new/
│   │       │   └── page.tsx             # US3 (P3) dedicated retrospective backfill entry
│   │       │                            # (arbitrary past date + direct status). NOT used by
│   │       │                            # FR-022's camera-denied fallback, which stays inline
│   │       │                            # on page.tsx's own flow (research.md §8) — the two
│   │       │                            # are independent axes, see contracts/upi-tracker-api.md
│   │       ├── history/
│   │       │   └── page.tsx             # US2 (P2) list/filter/group/summary; inline edit
│   │       │                            # affordance for US3 (P3) AC1, no separate route
│   │       └── tags/
│   │           └── page.tsx             # US4 (P4) tag management (create/rename/recolor/delete)
│   └── api/
│       └── upi-tracker/
│           ├── tags/
│           │   ├── route.ts             # GET, POST — contracts/upi-tracker-api.md
│           │   └── [id]/route.ts        # PATCH, DELETE
│           └── transactions/
│               ├── route.ts             # GET, POST
│               ├── [id]/route.ts        # PATCH
│               └── summary/route.ts     # GET
├── components/
│   └── upi-tracker/                     # Module-owned components (module isolation):
│       ├── qr-scanner.tsx               # getUserMedia + jsQR decode loop (client component)
│       ├── amount-step.tsx
│       ├── tag-picker.tsx               # Reuses components/ui chip/badge primitives
│       ├── confirm-prompt.tsx           # Page-Visibility-driven success/failed prompt
│       ├── transaction-list.tsx         # Reuses components/shared EmptyState/LoadingState/ErrorState
│       └── summary-card.tsx
├── lib/
│   ├── upi-tracker/
│   │   ├── deep-link.ts                 # parseUpiDeepLink / buildUpiDeepLink (research.md §2)
│   │   ├── status.ts                    # status-bucketing helper (research.md §3)
│   │   └── use-app-return.ts            # Page Visibility + focus hook (research.md §7)
│   ├── validation/
│   │   └── upi-tracker.ts               # New: Zod schemas for tags/transactions
│   └── api/
│       └── upi-tracker.ts               # New: typed client fetch wrappers (lib/auth/api.ts pattern)
├── db/
│   └── schema.ts                        # Extended: upiTag, upiTransaction, upiTransactionTag
├── drizzle/
│   └── <timestamp>_<name>.sql           # New: drizzle-kit generate output for the three tables
├── package.json                         # Extended: + jsqr dependency
└── tests/unit/
    ├── upi-deep-link.test.ts            # New
    ├── upi-status.test.ts               # New
    ├── upi-tags.test.ts                 # New (Route Handler auth + soft-delete filtering)
    └── upi-transactions.test.ts         # New (Route Handler auth + summary math + FR-018 isolation)

packages/e2e/
├── upi-tracker-scan-pay.spec.ts         # New: US1, fake-video-device camera path
├── upi-tracker-history.spec.ts          # New: US2
├── upi-tracker-edit-backfill.spec.ts    # New: US3
└── upi-tracker-tags.spec.ts             # New: US4
```

**Structure Decision**: This is the first module to add real domain tables
and its own pages/API beyond the `001-foundational-infra` smoke test and
the auth/shell scaffolding — no `domains/` folder convention exists yet
(per `CLAUDE.md`), so this feature follows the flattest structure
consistent with the existing single-Next.js-project layout: pages under
`app/(app)/upi-tracker/`, API under `app/api/upi-tracker/`, and
module-owned UI under `components/upi-tracker/` (parallel to the existing
`components/shared` vs `components/ui` split — module code never
reimplements `PageHeader`/`EmptyState`/`LoadingState`/`ErrorState`, per
`CLAUDE.md`). The existing root `app/(app)/page.tsx` smoke-test page is
untouched; this module is purely additive (constitution "Module
isolation" — addable/removable without touching another module's files).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| `upiTransactionTag` join table omits the `userId` ownership column Principle II otherwise requires on "every table" | Every code path reaches this table only after loading and auth-checking its parent `upiTransaction` row by `userId` first (research.md §6) — there is no query that needs to filter the join table directly by ownership. | Adding `userId` anyway for literal rule compliance was considered and rejected: it would be a fact duplicated from the parent row on every insert, with no auth-check it isn't already covering, and would need to be kept in sync forever for zero behavioral benefit — the kind of unused-but-present column Principle VIII's "no abstraction without a concrete current need" argues against just as much as an unused code abstraction would. |
