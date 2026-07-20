# Research: UPI Payment Tracker

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

This document resolves every open technical question from the plan's
Technical Context, plus a few genuine ambiguities in the spec's status
model and tag lifecycle that needed an explicit, documented decision rather
than a silent guess.

## 1. QR scanning: `jsQR` decoding frames from `getUserMedia`, not the native `BarcodeDetector` API

**Decision**: Open the rear camera via
`navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })`,
draw video frames to an off-screen `<canvas>` on a `requestAnimationFrame`
loop, and decode each frame's `ImageData` with `jsQR` (zero dependencies,
~30KB, pure JS/WASM-free).

**Rationale**: The native Shape Detection API (`BarcodeDetector`) would
avoid a dependency entirely, but it is not supported in Safari on iOS as of
this writing (still behind an experimental flag), which constitution
Principle IV requires this app to work correctly on. `jsQR` runs
identically across iOS Safari and Android Chrome since it only depends on
`Canvas`/`ImageData`, both universally supported. It's the long-standing,
de facto standard for exactly this use case (canvas-based QR decode from a
live video stream), has no dependencies of its own (Principle VI: no
bundle-size or Node-compat risk), and is entirely client-side — it never
touches the Workers runtime, so it has no interaction with any of
Principle VI's server-side constraints.

**Alternatives considered**: `BarcodeDetector` alone — rejected, breaks on
iOS Safari (a hard requirement). `BarcodeDetector` with a `jsQR` fallback —
rejected as unnecessary complexity (Principle VIII): maintaining two decode
paths for one already-adequate library is not justified by a concrete need,
since `jsQR` alone already covers both required platforms.
`@zxing/browser` — rejected: a heavier, more general multi-format barcode
library (1D/2D formats HomeBase never needs) when only QR decoding is
required; more surface area than the current need justifies.

## 2. UPI deep link parsing and construction

**Decision**: A UPI QR code encodes a `upi://pay?...` URI per the NPCI UPI
Linking Specification. Parse it with the platform's own `URL`/
`URLSearchParams`, reading:

- `pa` → payee VPA (required; a link missing `pa` is treated as "not a
  valid UPI payment code," FR-021).
- `pn` → payee display name (optional per the NPCI spec itself; some
  real-world QR codes omit it, so `payeeName` is nullable in the data
  model — see `data-model.md`).
- `am` → pre-filled amount (optional; absent means the amount step starts
  empty per FR-003/Acceptance Scenario 3).

Construct the outbound deep link the same way: `upi://pay` with `pa`, `pn`
(the payee name as scanned/entered), `am` (the confirmed amount, formatted
to 2 decimals), `cu=INR`, and `tn` set to a fixed, generic app note (e.g.
`"HomeBase UPI Tracker"`) rather than the transaction's tag names — tags
are the household's private categorization and have no reason to appear
inside the payee's own UPI app.

Both directions are implemented as small, pure functions
(`parseUpiDeepLink(url: string)`, `buildUpiDeepLink(input)`) with no
browser API dependency, so they are fully unit-testable (Principle VII —
"business logic with non-obvious rules... MUST have tests covering the
non-obvious cases": malformed links, missing `pa`, missing `pn`, missing
`am`, non-numeric `am`).

**Rationale**: Keeping parse/construct as pure functions separates the one
part of the QR flow that's easy to get subtly wrong (link parsing) from
the part that's inherently untestable in a unit test (camera access) — see
§10 for how this splits the testing strategy.

**Alternatives considered**: A dedicated UPI-parsing npm package — none of
the actively maintained options add meaningfully over ~20 lines of
`URLSearchParams` code against a simple, stable, published spec; rejected
per Principle VIII (no dependency without a concrete need beyond what the
platform already provides).

## 3. Transaction status lifecycle: what "pending" means alongside "unconfirmed"

This needed explicit resolution: FR-011 and Key Entities list four status
values (`success`/`failed`/`pending`/`unconfirmed`), but every acceptance
scenario and FR-010 only ever describes the confirm-prompt setting
`success`, `failed`, or defaulting to `unconfirmed`. Nothing in the spec's
prose ever explicitly produces `pending`. At the same time, SC-004 requires
**100% of payment attempts that reach "Pay" to end up with a definite,
persisted status — none silently lost** — even if the user never returns
to the tab at all (an explicit edge case).

**Decision**: The transaction row is written to the database **the instant
the user taps "Pay," before the redirect fires**, with `status = "pending"`.
This is what satisfies SC-004 literally: the record exists no matter what
happens next, including the browser being closed mid-redirect. When the
tool detects return (FR-009, Page Visibility API — see §7):

- User answers success/failed → `PATCH` the row to that value.
- User dismisses/navigates away without answering → `PATCH` to
  `"unconfirmed"` (FR-010's explicit trigger).
- User never returns at all → the row is simply left at `"pending"` by the
  client (there is no return event to act on it). To satisfy the "never
  returns" edge case's requirement that this reads as `"unconfirmed"`
  rather than being lost or stuck in limbo, **every read path (history
  list, filters, summaries) treats `pending` and `unconfirmed` as the same
  bucket** — grouped together as "not confirmed" everywhere except the raw
  stored enum value, which stays distinct so the *client* can tell "still
  in this session's active in-flight window, show the confirm prompt on
  return" apart from "already resolved as not-confirmed."

No background job sweeps `pending` rows to `unconfirmed` after a timeout —
that would require a long-lived timer/process, which Principle VI
prohibits (Workers isolates are request-scoped, no persistent
background state). Treating the two states as one bucket for every
user-facing view achieves the same observable outcome without one.

**Rationale**: This is the only reading that satisfies all three
constraints simultaneously: FR-011's literal four-value enum, FR-010's
narrow "didn't answer the prompt" trigger for `unconfirmed`, and SC-004 +
the "never returns" edge case's requirement that nothing is ever left in
an ambiguous state from the user's perspective — without inventing a sweep
job the constitution doesn't allow.

**Alternatives considered**: Writing the row only on return (skip
`pending` entirely, write `unconfirmed`/`success`/`failed` directly) —
rejected: fails SC-004 outright, since a browser closed between "Pay" and
return would leave no record at all. A background cron/queue to sweep
stale `pending` rows to `unconfirmed` after N minutes — rejected: adds a
Cloudflare primitive (Queues or a Cron Trigger) and a real persistent-state
concern for a cosmetic distinction that read-path bucketing already
resolves for free.

## 4. Tag deletion: soft-delete (`deletedAt`), not hard-delete with a name/color snapshot

**Decision**: `upiTag` rows are never hard-deleted by the app. "Delete" (in
User Story 4 / FR-017) sets a `deletedAt` timestamp. Every query that
powers the tag chip picker or the tag management "current tags" list
filters `WHERE deletedAt IS NULL`; every query that renders a transaction's
tag(s) always joins the live `upiTag` row by id, with no filter — so a
transaction created before deletion keeps showing that tag's last known
name and color exactly as FR-017 and the edge case require ("previously
tagged transactions retain their historical tag label rather than becoming
blank or erroring"), and renames/recolors of a still-active tag propagate
to every transaction that references it (US4 AC1), since there's only ever
one row being read from, not a copy.

**Rationale**: This single mechanism satisfies both halves of FR-017 (live
propagation of renames while active, frozen-but-intact display after
deletion) with no extra column on `upiTransactionTag` and no snapshot/copy
step to keep in sync at write time. It is also the natural reading of "the
tag no longer appears as a selectable option" (a filtered list, not a
deleted row) versus "previously tagged transactions retain their
historical tag label" (the same row, just no longer offered for new
tagging).

**Alternatives considered**: Hard-delete the tag row and snapshot
`tagName`/`tagColor` onto each `upiTransactionTag` row at creation time —
rejected: requires copying two fields at write time, freezes the name/color
seen even while the tag is still active and gets renamed (violating US4
AC1's "every transaction... reflects the new name/color" for currently
active tags), and reintroduces exactly the kind of denormalized, can-drift
copy Principle II's foreign-key rule steers away from. Hard-delete with
`ON DELETE SET NULL` on the join table (blank tag) — explicitly rejected by
the edge case itself ("rather than becoming blank or erroring").

## 5. Amount storage: integer paise, not a decimal/numeric column

**Decision**: Store `amountPaise` as a Postgres `integer` (smallest currency
unit — 1 rupee = 100 paise), with a `CHECK (amountPaise > 0)` constraint at
the database level in addition to Zod validation at the API boundary
(FR-004). All summation for per-tag/per-period totals (FR-014, SC-002) is
plain integer addition; the UI divides by 100 and formats only at render
time.

**Rationale**: Integer arithmetic has no floating-point rounding risk when
summing many rows for a summary total, unlike `float`/`double`, and avoids
the extra type-handling `numeric`/`decimal` columns need in Drizzle
(returned as strings, requiring parsing before any arithmetic). This is a
common, well-understood pattern for money columns (the same one Stripe and
similar payment-adjacent systems use) and is the simplest option that
can't silently misround a summary total. Adding the `CHECK` constraint is
close to free and gives FR-004 (positive-amount-only) a second, storage-
level guarantee beyond the Zod check, matching the same defense-in-depth
spirit as the constitution's own connection-timeout reasoning in `lib/db.ts`.

**Alternatives considered**: Postgres `numeric(10,2)` — rejected: Drizzle
returns `numeric` columns as strings by default, pushing string-to-number
parsing (and the rounding-mode decisions that come with it) onto every
summary computation, for no benefit over integer paise at this project's
scale. Storing rupees as a `float`/`double` — rejected outright due to
binary floating-point rounding error accumulating across a summary total.

## 6. Ownership column and the join table's `userId`

**Decision**: `upiTag` and `upiTransaction` each get a plain `userId: text`
column (Supabase `auth.users.id`, a UUID string) — no cross-schema
Postgres foreign-key constraint into `auth.users`, consistent with
`002-email-otp-auth`'s established precedent (`data-model.md` §"Session/user
shape as consumed by the app") that the app's own tables reference this id
by value only. `upiTransactionTag` (the many-to-many join table between
transactions and tags) does **not** get its own `userId` column.

**Rationale for omitting it on the join table**: Every code path that
touches `upiTransactionTag` first loads and auth-checks the parent
`upiTransaction` row (via `userId`) before it ever reads or writes that
transaction's tag associations — there is no query that filters the join
table directly by ownership without going through the transaction first.
A duplicated `userId` here would be a fact that must be kept in sync with
the parent row's `userId` forever, for a check that's already covered, so
it fails Principle VIII's "no abstraction/column without a concrete
current need" the same way an unused snapshot column would. This is
recorded as a documented, deliberate reading of Principle II's "every
table has ... a userId" bullet (see `plan.md` Complexity Tracking), not a
silent bypass.

**Alternatives considered**: Adding `userId` to the join table for literal
rule compliance — rejected per the reasoning above; the rule's stated
purpose ("so auth checks... can rely on a consistent shape") is already
satisfied via the FK to the always-auth-checked parent.

## 7. Detecting return from the UPI app: Page Visibility API, with a `focus` fallback

**Decision**: Listen for `document.visibilitychange` and treat a
transition to `document.visibilityState === "visible"` as "the user has
returned" (FR-009), with a `window.addEventListener("focus", ...)`
listener as a fallback for browser/OS combinations where the visibility
event fires unreliably after an external-app handoff. Both listeners are
attached only while a payment is in its post-redirect, awaiting-return
window, and removed once the confirm prompt is answered or dismissed.

**Rationale**: This is the standard, dependency-free technique for
detecting app-resume in a browser/PWA context, and needs no native app
integration (there is none — this is a web app redirecting to a native
UPI app via a deep link, not a wrapped native shell). No new dependency
required.

**Alternatives considered**: Relying on `visibilitychange` alone — kept as
the primary signal, but a `focus` fallback costs nothing and hedges
against real-world inconsistency in exactly when mobile browsers fire
`visibilitychange` after returning from an external app hand-off.

## 8. Camera-denial and malformed-QR error paths

**Decision**: Both are client-side branches in the same scan step, no new
dependency:

- `getUserMedia` rejecting with `NotAllowedError` (permission denied) or
  `NotFoundError` (no camera hardware) → show an inline message and a
  "Enter manually" action that routes into the same amount/tag/pay flow,
  skipping only the scan step (FR-022).
- `jsQR` returning no decode result after a short timeout, or a decode
  result whose `parseUpiDeepLink` (§2) fails (missing `pa`, not a `upi://`
  scheme at all) → inline error with a "Try again" action that resets the
  scan loop without leaving the page or re-requesting camera permission
  (FR-021).

**Rationale**: Both are direct client-side branches on existing signals
(a rejected Promise, a null/invalid parse result) — no new libraries, no
server round-trip needed to detect either condition.

## 9. Tag color representation: a constrained token set, exact values deferred to the design bridge

**Decision**: `upiTag.color` is stored as `text`, but constrained at the
Zod validation layer to one of a small, fixed set of swatch tokens (not a
freeform hex/color-picker value). The app's current design system
(`packages/web/styles/globals.css`, the "Verse Margin" tokens) defines only
one accent hue plus semantic success/warning/error/info colors — it has no
existing multi-hue categorical palette suitable for visually distinguishing
an open-ended set of user tags. Picking the actual swatch values (which
hues, how many, contrast-checked for both light and dark theme) is a
visual-design decision, not a technical/data-modeling one — **running the
`speckit-design-context` skill for this feature, before UI implementation
begins, is required to produce those concrete tokens** (per its documented
role bridging spec-kit features into the design system).

**Rationale**: Storing a constrained token (not a raw hex string) keeps
tag color rendering consistent with the design system's token-based
approach elsewhere and keeps the accessibility baseline (Additional
Constraints: "sufficient color contrast") enforceable at the token
level rather than per-tag. Deferring the exact palette to the design
bridge avoids this plan inventing visual design decisions outside its
scope.

**Alternatives considered**: A freeform hex color input — rejected: no
contrast guarantee, and inconsistent with every other color in the app
being a named design token.

## 10. Testing strategy for the camera-dependent flow

**Decision**: Split the flow so the parts that are easy to get subtly
wrong are unit-testable in isolation, and only the thin camera-glue code
depends on a real or simulated browser environment:

- `parseUpiDeepLink` / `buildUpiDeepLink` (§2): pure functions, Vitest
  coverage of valid links, missing `pa`, missing `pn`, missing/non-numeric
  `am` (Principle VII, "non-obvious rules").
- Amount validation (FR-004), status-bucketing (§3), tag-active-filter
  logic (§4): pure functions, Vitest coverage.
- Each Route Handler: at least one auth-check test (Principle VII) plus
  its module-specific behavior (soft-delete filtering, summary math,
  ownership isolation per FR-018).
- The actual `getUserMedia` + `jsQR` decode loop: covered by Playwright
  launching Chromium with `--use-fake-device-for-media-stream` and
  `--use-file-for-fake-video-capture=<path-to-a-recorded-UPI-QR-video>`,
  which feeds a real synthetic video frame into the real `getUserMedia`
  API — this exercises the actual decode path end-to-end in CI, not a
  mocked one. This is flagged as a **spike to verify early** (first task
  in `tasks.md` for User Story 1), the same way `002-email-otp-auth`
  flagged its middleware-under-Workers assumption, since it's this
  feature's one similarly unverified-in-this-project mechanism.
- The manual-entry path (FR-022) gives every other e2e scenario (tag
  picking, pay-redirect construction, confirm prompt, history, summaries)
  a camera-free way to reach the same downstream steps, so most of the
  suite doesn't depend on the fake-video-device mechanism at all.

**Rationale**: Directly follows Principle VII's risk-based testing
approach — concentrate automated coverage on the non-obvious logic
(link parsing, status/tag lifecycle, auth isolation) and the one genuinely
novel-to-this-project browser mechanism (camera + decode under Workers/
Playwright), while using the manual-entry path to keep the rest of the
suite simple and fast.

**Alternatives considered**: Mocking `getUserMedia`/`jsQR` entirely in e2e
tests — rejected as giving false confidence; it would never actually
exercise the real decode path the way the fake-video-device approach does.

## 11. Constitution Principle IV (installable PWA) — already satisfied, nothing for this feature to do

**Decision**: No manifest/service-worker work is needed in this plan.
`006-pwa-installability` has already landed (Serwist-based service worker,
`app/manifest.ts`) per `CLAUDE.md` and this feature's own
`checklists/requirements.md` notes — the Bootstrap Sequencing Exception
that `spec.md`'s Assumptions section names as a prerequisite is satisfied.
This feature only needs the ordinary Principle IV manual-verification step
(iOS Safari + Android Chrome) applied to its own new screens, camera
permission prompt, and offline-write failure behavior (Additional
Constraints: writes must fail visibly, never silently, when offline) —
tracked in `quickstart.md`'s manual verification section, not as new
infrastructure.

**Rationale**: Confirms this feature is ordinary module development, not
bootstrap-phase work, per the constitution's Bootstrap Sequencing Exception
clause 3 ("No real product/module feature may be built while a Principle
IV... gap remains open").

## Summary of new infrastructure this feature introduces

| Component | Type | Purpose |
|---|---|---|
| `jsqr` | New npm dependency (`packages/web`) | Client-side QR decode from camera frames (§1) |
| `upiTag`, `upiTransaction`, `upiTransactionTag` | New Drizzle tables (`db/schema.ts`) | See `data-model.md` |
| `amountPaise > 0` CHECK constraint | Postgres constraint | Defense-in-depth for FR-004 (§5) |
| `app/(app)/upi-tracker/**` | New pages | See `plan.md` Project Structure |
| `app/api/upi-tracker/**` | New Route Handlers | See `contracts/upi-tracker-api.md` |

No new Cloudflare binding, no new deployment target, no new Supabase
configuration is introduced by this feature.
