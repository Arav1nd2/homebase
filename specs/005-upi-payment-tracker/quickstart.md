# Quickstart: Validating the UPI Payment Tracker

**Feature**: [spec.md](./spec.md) | **Contracts**: [contracts/upi-tracker-api.md](./contracts/upi-tracker-api.md)

## Prerequisites

- Local stack running: `npm run dev` (local Supabase, migrated, Workers
  preview) — see repo root `README.md`.
- Signed in already (this module assumes the existing session gate;
  `specs/002-email-otp-auth` covers sign-in itself).
- A real device (phone) or a desktop browser with a webcam, for manually
  exercising the camera scan step. A printed or on-screen UPI QR code
  (e.g. generated from any UPI app's "receive money" screen, or a test VPA
  of your own) to scan against.
- For automated e2e coverage of the scan step specifically: Chromium
  launched with `--use-fake-device-for-media-stream` and
  `--use-file-for-fake-video-capture=<path>` pointed at a short recorded
  video containing a known UPI QR code (research.md §10) — set up once as
  part of the first implementation task, not required for manual
  verification below.

## Scenario 1 — Scan, tag, and pay (User Story 1, P1)

1. Navigate into the UPI Tracker tool → confirm the camera opens
   immediately in QR-scan mode, no extra tap (FR-001).
2. Scan a UPI QR code that has a pre-filled amount → confirm payee name,
   payee VPA, and amount all appear correctly, with the amount editable
   (FR-002, FR-003).
3. Proceed to the tagging step → select an existing tag chip, or create a
   new one inline → confirm it attaches without leaving the flow (FR-005,
   FR-006, FR-007).
4. Tap "Pay" → confirm you are redirected to your device's UPI app with
   the payee, amount, and a note pre-filled (FR-008) — and confirm (via
   the history view, opened on a second device/tab, or immediately after
   returning) that a transaction row already exists with `status: "pending"`
   at this point (SC-004 — recorded before the redirect, not after).
5. Return to the tool (switch back to the browser tab/app) → confirm the
   success/failed confirmation prompt appears (FR-009).
6. Answer "succeeded" → confirm the transaction's status updates to
   `success` and it appears correctly in the history view (FR-010,
   FR-011, FR-012).

**Timing check (SC-001)**: steps 1–4 (open tool → redirected to UPI app),
for a QR code with a pre-filled amount and an existing tag selection,
complete in under 20 seconds.

## Scenario 2 — Abandoned confirmation and never-returning (edge cases, FR-010, SC-004)

1. Repeat Scenario 1 through the "Pay" redirect.
2. On return, when the confirm prompt appears, navigate away instead of
   answering → confirm the transaction is saved as `unconfirmed`, not lost
   and not left pending (FR-010).
3. Separately, repeat through the redirect once more, then close the
   browser/app entirely without returning at all → reopen later and check
   the history view → confirm the transaction still appears (as `pending`
   internally, but grouped/displayed as "not confirmed" alongside
   `unconfirmed` rows per research.md §3) rather than being missing.

## Scenario 3 — Malformed QR, no UPI app, camera denied (edge cases, FR-020–FR-022)

1. Scan a QR code that is not a UPI payment link (or any arbitrary QR
   code) → confirm a clear inline error appears with a retry option, and
   the camera keeps scanning without restarting the whole flow (FR-021).
2. On a device/browser with no UPI app installed, complete the flow
   through "Pay" → confirm a clear message explains no UPI app was found,
   rather than a silent or dead redirect (FR-020).
3. Deny camera permission when first prompted → confirm a manual
   payee/amount entry path is offered instead of a dead end (FR-022).
4. Enter a zero or negative amount at the amount step → confirm you cannot
   proceed until a positive amount is entered (FR-004).

## Scenario 4 — Review spending by tag and period (User Story 2, P2)

1. With several transactions recorded across different tags, statuses,
   and dates (seed via Scenario 1 repeats or manual entry, Scenario 5),
   open the transaction history view → confirm all of the signed-in
   user's transactions list with payee, amount, tag(s), timestamp, and
   status visible (FR-012).
2. Filter by tag, then by status, then by a date range → confirm only
   matching transactions show (FR-013).
3. Open the summary for a specific tag and month → confirm the displayed
   total matches the sum of that tag's transactions in that period
   (FR-014).

**Timing check (SC-002)**: finding the total spent under a specific tag
for the current month, from opening the tool, takes under 10 seconds.

## Scenario 5 — Correct or backfill a transaction (User Story 3, P3)

1. Edit an existing transaction's tag(s) or status → confirm the change
   persists and is reflected in both the history view and any summary
   that includes it (FR-015).
2. Use "add transaction manually" → enter payee, amount, tag(s), a past
   date, and a status directly (no scan step) → confirm it appears in
   history identically in structure to a scanned transaction (FR-016).

**Timing check (SC-005)**: correcting a miscategorized transaction's tag
or status, from the history view, takes under 15 seconds.

## Scenario 6 — Manage tags (User Story 4, P4)

1. Rename an existing tag → confirm every transaction already carrying it
   shows the new name immediately (US4 AC1).
2. Recolor a tag → same check for color.
3. Delete a different, unused tag → confirm it no longer appears as a
   selectable option, but this doesn't affect the renamed/recolored tag
   from steps 1–2.
4. Delete a tag that **does** have existing transactions → confirm those
   transactions keep showing the tag's last name/color rather than going
   blank or erroring (FR-017, edge case).

## Scenario 7 — Cross-user isolation (FR-018)

1. Sign in as a second HomeBase user (or a second allow-listed test
   email).
2. Confirm this user's UPI Tracker history and tags are empty/independent
   — none of the first user's tags or transactions are visible, listable,
   or editable (not even by guessing an id directly against the API,
   which should return 404).

## Manual PWA verification (constitution Principle IV cross-check)

This feature adds new screens and a new browser permission prompt
(camera) on top of the PWA groundwork `006-pwa-installability` already
laid. Before considering this feature done, manually verify on both a
real/simulated **iOS Safari** session and an **Android Chrome** session:

- The camera permission prompt and scan UI render and function correctly
  (iOS Safari's camera/`getUserMedia` behavior inside an installed PWA has
  historically been a rougher edge than Android Chrome's).
- The UPI-app redirect (`upi://pay` deep link) correctly hands off to an
  installed UPI app and correctly returns focus to the installed PWA (not
  a regular browser tab) on both platforms.
- Attempting to load the history view while offline fails visibly with a
  clear message (Additional Constraints: no silent data loss, no infinite
  spinner) rather than a blank screen — previously-cached screens should
  still render per the existing service worker's app-shell caching.
