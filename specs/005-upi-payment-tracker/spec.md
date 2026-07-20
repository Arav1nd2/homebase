# Feature Specification: UPI Payment Tracker

**Feature Branch**: `feat/add-payment-tracker`

**Created**: 2026-07-19

**Status**: Draft

**Input**: User description: "Build a mobile-first web app called UPI Tracker that lets users tag and track their UPI payments, since native UPI apps (Google Pay, PhonePe, etc.) don't support transaction tagging. Core flow: open the tool and the camera opens immediately in QR-scan mode; scan a UPI QR code and parse the payee VPA, payee name, and any pre-filled amount from the UPI deep link; let the user enter or override the amount; show existing tags as tappable chips with an inline 'add new tag' option; on 'Pay', construct a UPI deep link and redirect to the user's default UPI app; on return to the tool, prompt the user to confirm success/failure, recording 'unconfirmed' if they don't respond (web UPI deep links don't reliably report status back); persist every transaction (payee, amount, tag(s), timestamp, status) so it can be listed, filtered/grouped by tag/status/date, summarized per tag and period, edited after the fact, or backfilled manually. Tags can be created, renamed, deleted, and color-coded. No UPI credentials, PINs, or bank details are ever collected — the tool only constructs standard UPI deep links; actual payment authorization happens inside the user's chosen UPI app. Out of scope for v1: actually processing payments, bank statement reconciliation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan, tag, and pay in one flow (Priority: P1)

A user wants to pay someone via UPI and have that payment automatically categorized, instead of paying in Google Pay/PhonePe and having no record of what it was for. They open the UPI Tracker tool, the camera opens immediately, they scan the recipient's UPI QR code, confirm or enter the amount, pick (or create) a tag, tap Pay, get redirected to their UPI app to complete the payment, return to the tool, and confirm whether it succeeded.

**Why this priority**: This is the entire reason the tool exists — native UPI apps don't support tagging. Without this flow there is no product.

**Independent Test**: Can be fully tested by scanning a real UPI QR code end-to-end (scan → amount → tag → pay redirect → return → confirm) and verifying a transaction with the correct payee, amount, tag, and status appears afterward. Delivers value on its own even before history/summary views exist.

**Acceptance Scenarios**:

1. **Given** the UPI Tracker tool is opened, **When** it loads, **Then** the device camera opens in QR-scan mode without any additional tap.
2. **Given** the camera is active, **When** the user scans a UPI QR code that includes a pre-filled amount, **Then** the payee name, payee VPA, and amount are extracted and shown, with the amount editable.
3. **Given** a scanned QR code has no amount, **When** the amount screen is shown, **Then** the amount field is empty and editable, and the user must enter a positive amount to proceed.
4. **Given** the user is on the tagging step, **When** they select one or more existing tags or create a new tag inline, **Then** the selected/created tag(s) are attached to the in-progress transaction.
5. **Given** payee, amount, and at least the option to proceed with no tag are set, **When** the user taps "Pay", **Then** the app constructs a UPI deep link with the payee VPA, amount, and a transaction note/reference and redirects to the device's UPI app.
6. **Given** the user has been redirected to their UPI app and returns to the tool (app resume/tab visibility change), **When** the tool detects the return, **Then** it shows a prompt asking the user to confirm whether the payment succeeded or failed.
7. **Given** the confirmation prompt is shown, **When** the user answers success or failed, **Then** the transaction is saved with that status; **When** the user does not answer and navigates away instead, **Then** the transaction is saved with status "unconfirmed".

---

### User Story 2 - Review spending by tag and time period (Priority: P2)

Once several payments have been tracked, the user wants to see where their money went — filtered by tag, status, or date range, with totals per tag and per period — the payoff for having tagged anything in the first place.

**Why this priority**: Depends on User Story 1 producing data, but is the actual reason a user keeps using the tool past the first payment.

**Independent Test**: Seed several transactions with varying tags, statuses, and dates; verify the history list filters/groups correctly and per-tag/per-period totals compute correctly.

**Acceptance Scenarios**:

1. **Given** multiple recorded transactions exist, **When** the user opens the transaction history view, **Then** all of the signed-in user's transactions are listed with payee, amount, tag(s), timestamp, and status visible.
2. **Given** the history view, **When** the user filters or groups by tag, status, or date range, **Then** only matching transactions are shown/grouped accordingly.
3. **Given** transactions tagged "Groceries" totaling a known sum within a given month, **When** the user views the summary for that tag and period, **Then** the displayed total matches the sum of those transactions' amounts.

---

### User Story 3 - Correct or backfill a transaction (Priority: P3)

The user realizes a transaction was tagged wrong, or that "unconfirmed" status should actually be "success," or they paid someone via UPI outside the tool (e.g. before installing it) and want it reflected in their records.

**Why this priority**: Real-world correction and backfill matter for data trustworthiness, but only once there's a meaningful body of tracked transactions to correct.

**Independent Test**: Create a transaction with an incorrect tag, edit it, and verify the change persists; separately, manually add a past transaction without scanning and verify it appears in history identically to a scanned one.

**Acceptance Scenarios**:

1. **Given** an existing transaction, **When** the user edits its tag(s) or status, **Then** the updated values are saved and reflected in the history view and summaries.
2. **Given** the user wants to record a payment made outside the tool, **When** they use "add transaction manually" and enter payee, amount, tag(s), date, and status, **Then** a new transaction is created identical in structure to a scanned one.

---

### User Story 4 - Manage tags (Priority: P4)

The user wants to keep their tag list tidy over time: rename "Misc" to something clearer, retire a tag they no longer use, or give a tag a distinct color so it's easy to scan visually in the chip list and history.

**Why this priority**: Inline tag creation (covered in User Story 1) already unblocks the core flow; full management (rename/delete/recolor) is a lower-frequency administrative action.

**Independent Test**: Create a tag, rename it, assign it a color, and delete a different unused tag — verify the tag list reflects each change and previously tagged transactions are unaffected by the rename/color change.

**Acceptance Scenarios**:

1. **Given** the tag management view, **When** the user renames or recolors an existing tag, **Then** every transaction previously tagged with it reflects the new name/color (since the tag is a reference, not a copy).
2. **Given** a tag with existing transactions attached, **When** the user deletes that tag, **Then** the tag no longer appears as a selectable option, and previously tagged transactions retain their historical tag label rather than becoming blank or erroring.

---

### Edge Cases

- What happens when the user taps "Pay" but no UPI app is installed on the device? The tool MUST show a clear message explaining no UPI app was found, rather than a silent or dead redirect.
- What happens when a scanned QR code is malformed or not a UPI payment code at all? The tool MUST show a clear inline error and let the user retry scanning without restarting the flow.
- What happens when camera permission is denied? The tool MUST offer a way to proceed (manual payee/amount entry) rather than dead-ending on a blocked camera.
- What happens when the user is redirected to their UPI app and never returns to the tab/tool (closes browser, switches away for a long time)? The transaction MUST remain recorded as "unconfirmed" rather than being lost.
- What happens when a user enters a zero or negative amount? The tool MUST block proceeding until a positive amount is entered.
- What happens when a tag with existing transactions is deleted? Historical transactions keep their tag label; the tag is just removed from future selection (see User Story 4).
- What happens when a user tries to view or edit a transaction they didn't create? The tool MUST NOT show another user's transactions at all (see FR-018).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The tool MUST open the device camera in QR-scan mode immediately every time the user navigates into the UPI Tracker tool, not only on first use.
- **FR-002**: The tool MUST parse a scanned UPI QR code's deep link and extract the payee VPA, payee display name, and amount when present.
- **FR-003**: The tool MUST let the user enter or override the payment amount, pre-filled from the QR code when an amount was present.
- **FR-004**: The tool MUST prevent proceeding past the amount step with a zero, negative, or non-numeric amount.
- **FR-005**: The tool MUST display the signed-in user's existing tags as selectable chips during the tagging step.
- **FR-006**: The tool MUST allow creating a new tag inline during the tagging step without leaving the payment flow.
- **FR-007**: The tool MUST allow a transaction to be tagged with one or more tags selected from the user's existing tags (not limited to a single tag).
- **FR-008**: The tool MUST construct a standard UPI deep link (payee VPA, amount, transaction note/reference) and redirect the user to their device's UPI app handler when they confirm payment.
- **FR-009**: The tool MUST detect when the user returns to it after a payment redirect (e.g. via a visibility/resume signal) and prompt them to confirm whether the payment succeeded or failed.
- **FR-010**: The tool MUST record a transaction's status as "unconfirmed" if the user does not respond to the confirmation prompt.
- **FR-011**: The tool MUST persist every transaction with payee name, payee VPA, amount, tag(s), timestamp, status (success/failed/pending/unconfirmed), and whether it originated from a scan or manual entry.
- **FR-012**: The tool MUST let the user view a list of their own past transactions.
- **FR-013**: The tool MUST let the transaction list be filtered and grouped by tag, status, and date range.
- **FR-014**: The tool MUST show summary totals of amount spent per tag and per time period; a transaction with multiple tags counts its full amount toward each of its tags' totals.
- **FR-015**: The tool MUST let the user edit a transaction's tag(s) or status after it has been recorded.
- **FR-016**: The tool MUST let the user manually add a past transaction (payee, amount, tag(s), date, status) without going through the scan flow.
- **FR-017**: The tool MUST let the user create, rename, delete, and assign a color to a tag; renaming/recoloring a tag MUST be reflected on all transactions already carrying it, and deleting a tag MUST NOT delete or blank out transactions that already carry it.
- **FR-018**: Transaction and tag data MUST be private to the signed-in user who created it — no other HomeBase user, however authenticated, can view or edit another user's UPI Tracker data.
- **FR-019**: The tool MUST NOT collect or store UPI PINs, bank account numbers, or other payment authorization credentials at any point.
- **FR-020**: The tool MUST show a clear, actionable message when no UPI app is available to handle the payment redirect, instead of a silent failure.
- **FR-021**: The tool MUST show a clear, actionable message and allow retrying the scan when a scanned QR code is not a valid UPI payment code.
- **FR-022**: The tool MUST provide a manual entry path (payee, amount) when camera permission is denied, rather than dead-ending the flow.

### Key Entities

- **Transaction**: A single tracked UPI payment attempt, owned by the signed-in user who created it. Attributes: payee VPA, payee display name, amount, one or more associated tags, timestamp, status (success / failed / pending / unconfirmed), optional note/reference, and origin (scanned vs. manually added).
- **Tag**: A user-defined label for categorizing transactions, owned by the signed-in user who created it. Attributes: name, color, and creation source (inline during tagging vs. tag management). Referenced by zero or more transactions; deleting a tag does not delete or alter the transactions that already reference it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from opening the UPI Tracker tool to being redirected to their UPI app in under 20 seconds for a QR code with a pre-filled amount and an existing tag selection.
- **SC-002**: Users can find the total amount spent under a specific tag for the current month in under 10 seconds from opening the tool.
- **SC-003**: At least 95% of scanned valid UPI QR codes are correctly parsed into payee and amount fields without requiring manual correction.
- **SC-004**: 100% of payment attempts that reach the "Pay" step end up recorded with a definite status (success, failed, or unconfirmed) — none are silently lost.
- **SC-005**: A user can correct a miscategorized transaction's tag or status in under 15 seconds from the history view.

## Assumptions

- This tool is a module within the existing HomeBase app and is reached only after the app's existing sign-in (Supabase Auth session) is already established; it does not introduce its own login step. "Opening the tool" (FR-001) refers to navigating into UPI Tracker within HomeBase, not launching HomeBase itself.
- This feature depends on `specs/006-pwa-installability` (or equivalent) landing first, or close enough alongside it, per the constitution's Bootstrap Sequencing Exception — HomeBase's installable-PWA gap (Principle IV) is being closed as its own dedicated feature rather than bundled into this one. See that feature's plan for the manifest/service-worker work; this spec assumes it lands as a prerequisite.
- Transaction and tag data is private per signed-in user (clarified with the requester); there is no shared household view of another user's UPI Tracker data in v1.
- A transaction may carry more than one tag; per-tag summary totals count the transaction's full amount against each of its tags (no proportional splitting), which is the simplest, most predictable behavior at this project's scale.
- No automatic payment status detection is attempted in v1 — web-based UPI deep linking does not reliably return a status callback, so status is always either user-confirmed or "unconfirmed" by default. SMS/notification-based reconciliation is a possible future direction, not part of this feature.
- "Default UPI app" resolution when multiple UPI apps are installed is left to the device/OS's own handling, not controlled by this tool.
- A device without a camera or without any UPI app installed can still use manual transaction entry (User Story 3) but cannot complete the primary scan-and-pay flow (User Story 1) end-to-end; this is expected, not a defect.
- Bank statement reconciliation, multi-currency support, and actually processing/authorizing payments are out of scope for v1 — the tool only ever constructs and redirects to a standard `upi://pay` deep link.
