# Contract: UPI Tracker Route Handlers

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

All responses follow the constitution Principle V shared shapes: success
as `{ data: ... }`, errors as `{ error: { message: string, code: string } }`
with a matching HTTP status. Every handler below calls
`getSessionOrThrow()` before touching the database (Principle V) — there
is no exception in this module, unlike the auth-establishing routes in
`002-email-otp-auth`. Every query is scoped to `userId = <session user>`
(FR-018) — a request for another user's tag or transaction id returns 404,
never 403, so existence isn't leaked across users.

## Tags — `/api/upi-tracker/tags`

### `GET /api/upi-tracker/tags`

List the caller's active (non-soft-deleted) tags, for the tag chip picker
and tag management view.

**Response** — HTTP 200:

```json
{ "data": [{ "id": "…", "name": "Groceries", "color": "accent-2", "createdAt": "…" }] }
```

### `POST /api/upi-tracker/tags`

Create a tag inline (FR-006) or from the tag management view.

**Request body**:

```json
{ "name": "Groceries", "color": "accent-2" }
```

- `name`: string, required, non-empty, unique among the caller's active
  tags — HTTP 409 `TAG_NAME_TAKEN` if a duplicate.
- `color`: string, required, one of the constrained swatch tokens
  (`data-model.md`) — HTTP 400 `VALIDATION_ERROR` otherwise.

**Response** — HTTP 201, the created tag: `{ "data": { "id": "…", "name": "…", "color": "…", "createdAt": "…" } }`

### `PATCH /api/upi-tracker/tags/[id]`

Rename and/or recolor a tag (FR-017, US4 AC1). Propagates immediately to
every transaction referencing it, since transactions always read the live
tag row (`data-model.md`).

**Request body** (either or both fields):

```json
{ "name": "Household", "color": "accent-4" }
```

**Response** — HTTP 200, the updated tag. HTTP 404 `NOT_FOUND` if the id
doesn't belong to the caller or is already soft-deleted. HTTP 409
`TAG_NAME_TAKEN` on a rename collision.

### `DELETE /api/upi-tracker/tags/[id]`

Soft-delete a tag (FR-017): sets `deletedAt`, does not touch any existing
`upiTransactionTag` row or the transactions that reference it (edge case:
"previously tagged transactions retain their historical tag label rather
than becoming blank or erroring").

**Response** — HTTP 204, no body. HTTP 404 `NOT_FOUND` if already deleted
or not owned by the caller.

## Transactions — `/api/upi-tracker/transactions`

### `GET /api/upi-tracker/transactions`

List the caller's transactions (FR-012), with optional filters (FR-013).

**Query params** (all optional): `tagId`, `status` (one of the four
values), `from` (ISO date, inclusive, filters on `occurredAt`), `to` (ISO
date, inclusive). Multiple `tagId` values may be repeated
(`?tagId=a&tagId=b`) to match "grouped by tag."

**Response** — HTTP 200:

```json
{
  "data": [
    {
      "id": "…",
      "payeeVpa": "merchant@upi",
      "payeeName": "Local Store",
      "amountPaise": 45000,
      "status": "success",
      "origin": "scanned",
      "occurredAt": "2026-07-18T10:00:00.000Z",
      "tags": [{ "id": "…", "name": "Groceries", "color": "accent-2" }]
    }
  ]
}
```

Each transaction embeds its tags inline (joined server-side) so the
history view never needs a second round trip per row — this is also how
a deleted tag's frozen name/color still renders correctly (research.md
§4): the row read here is the same live `upiTag` row, whatever its current
`deletedAt` state.

### `POST /api/upi-tracker/transactions`

Create a transaction. This one endpoint covers three moments that all
produce the same shape of row: a scanned QR "Pay" tap (US1), a "Pay" tap
where the payee was typed in because camera permission was denied (US1,
FR-022), and a retrospective backfill entry (US3 AC2). The two axes are
independent and MUST NOT be conflated:

- **`origin`** (`"scanned"` \| `"manual"`) is a purely descriptive/audit
  fact (FR-011) — whether a QR was actually decoded, or the payee/amount
  was typed in by hand. It has no effect on `status` handling.
- **Whether `status` is present in the request body** is what actually
  determines the lifecycle (research.md §3):
  - **Omitted** → this is a live "tap Pay now" moment (true whether
    `origin` is `"scanned"` or the FR-022 camera-denied `"manual"`
    fallback — both proceed through the same immediate pending → redirect
    → confirm-prompt lifecycle). The server always writes
    `status: "pending"`, ignoring any `status` field if one was sent
    anyway, and `occurredAt` defaults to the current server time if
    omitted. This is the call the client makes the instant "Pay" is
    tapped, before constructing the redirect (SC-004).
  - **Present** → this is a retrospective backfill (US3 AC2, always
    `origin: "manual"` in practice, though the server does not require
    that pairing). The server uses the given `status` as-is (one of the
    four values, whichever actually happened) and **requires**
    `occurredAt` in the same request (the user-chosen, possibly past,
    date) — HTTP 400 `VALIDATION_ERROR` if `status` is present without
    `occurredAt`.

**Request body** (live "Pay now" example — `status` omitted):

```json
{
  "payeeVpa": "merchant@upi",
  "payeeName": "Local Store",
  "amountPaise": 45000,
  "origin": "scanned",
  "tagIds": ["…"],
  "note": null
}
```

**Request body** (backfill example — `status` present):

```json
{
  "payeeVpa": "merchant@upi",
  "payeeName": "Local Store",
  "amountPaise": 45000,
  "origin": "manual",
  "tagIds": ["…"],
  "note": null,
  "occurredAt": "2026-07-10T18:30:00.000Z",
  "status": "success"
}
```

- `tagIds`: array of the caller's own active tag ids; empty array allowed.
  HTTP 400 `VALIDATION_ERROR` if any id doesn't belong to the caller or is
  soft-deleted (a soft-deleted tag can still be *displayed* on old
  transactions but can never be newly *attached*).

**Response** — HTTP 201, the created transaction (same shape as the `GET`
list's items).

### `PATCH /api/upi-tracker/transactions/[id]`

Edit a transaction's status and/or tag(s) after creation (FR-015). This is
also how the post-redirect confirm prompt (FR-009/FR-010) resolves a
`pending` row to `success`/`failed`/`unconfirmed`.

**Request body** (either or both fields):

```json
{ "status": "success", "tagIds": ["…"] }
```

Only `status` and `tagIds` are accepted — `payeeVpa`, `payeeName`,
`amountPaise`, `occurredAt`, and `origin` are immutable after creation
(`data-model.md`). Sending any other field is ignored, not an error (keeps
the confirm-prompt call and a full manual-edit call using the same shape).

**Response** — HTTP 200, the updated transaction. HTTP 404 `NOT_FOUND` if
not owned by the caller.

### `GET /api/upi-tracker/transactions/summary`

Per-tag, per-period totals (FR-014, SC-002).

**Query params** (all optional, same semantics as the list endpoint):
`tagId`, `from`, `to`.

**Response** — HTTP 200:

```json
{
  "data": [
    { "tagId": "…", "tagName": "Groceries", "totalPaise": 1234500, "transactionCount": 7 }
  ]
}
```

- A transaction with multiple tags contributes its full `amountPaise` to
  each of its tags' totals (FR-014 — "no proportional splitting").
- Only `success`, `failed`, `pending`, and `unconfirmed` rows the caller
  owns are ever included, scoped the same way as the list endpoint
  (`from`/`to` filters `occurredAt`); the spec does not require excluding
  any status from the summary total, so all of the caller's own
  transactions in range are counted as-is.
