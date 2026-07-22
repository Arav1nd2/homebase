# Data Model: UPI Payment Tracker

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Three new tables in the single shared `db/schema.ts` (constitution
Principle II — one Drizzle schema, appended to, not split into a new
file, since this is the first module to add real tables and there's no
duplication yet to justify splitting by module). All three are prefixed
`upi` so ownership is unambiguous to any future module.

## Entities

### `upiTag`

A user-defined label for categorizing transactions (spec.md Key Entities).

| Column | Type | Notes |
|---|---|---|
| `id` | `text`, PK | `crypto.randomUUID()` default (Principle II) |
| `userId` | `text`, not null | Supabase `auth.users.id`; plain value, no cross-schema FK (research.md §6) |
| `name` | `text`, not null | |
| `color` | `text`, not null | One of a constrained swatch-token set enforced by Zod, not freeform hex (research.md §9) |
| `deletedAt` | `timestamp`, nullable | Soft-delete marker (research.md §4). `NULL` = active/selectable. |
| `createdAt` | `timestamp`, not null, default now | |
| `updatedAt` | `timestamp`, not null, default now | |

**Application-layer validation** (not a DB constraint, per Principle
VIII — a partial unique index is more migration complexity than a
two-user app's scale justifies): `(userId, name)` must be unique among
tags where `deletedAt IS NULL` — checked in the `POST`/`PATCH` Route
Handlers before insert/rename (`contracts/upi-tracker-api.md`).

### `upiTransaction`

A single tracked UPI payment attempt (spec.md Key Entities).

| Column | Type | Notes |
|---|---|---|
| `id` | `text`, PK | `crypto.randomUUID()` default |
| `userId` | `text`, not null | Owner (FR-018) |
| `payeeVpa` | `text`, not null | From `pa` (scanned) or user entry (manual) |
| `payeeName` | `text`, nullable | From `pn`; nullable because `pn` is optional in the NPCI spec and some real QR codes omit it (research.md §2) |
| `amountPaise` | `integer`, not null | Smallest currency unit (research.md §5). `CHECK (amountPaise > 0)` at the DB level, in addition to Zod (FR-004). |
| `status` | `text`, not null | One of `pending` \| `success` \| `failed` \| `unconfirmed` (research.md §3). `CHECK` constraint restricting to these four values. |
| `origin` | `text`, not null | One of `scanned` \| `manual` (FR-011) |
| `note` | `text`, nullable | Optional user-entered note/reference (Key Entities); distinct from the `tn` deep-link param, which is always the fixed app note (research.md §2) |
| `occurredAt` | `timestamp`, not null | The transaction's logical time: "now" at the moment "Pay" is tapped for a scanned transaction, or a user-chosen (possibly past) date for a manual backfill (US3 AC2). **Deliberately separate from `createdAt`** (row-insert time), since a backfilled transaction's real-world date and its row's insert time differ. |
| `createdAt` | `timestamp`, not null, default now | |
| `updatedAt` | `timestamp`, not null, default now | Bumped on every `PATCH` (status/tag edits, FR-015) |

**Not editable after creation** (FR-015 only names tag(s) and status):
`payeeVpa`, `payeeName`, `amountPaise`, `occurredAt`, `origin` are
write-once at creation. A miscategorized amount/payee is out of this
feature's edit scope as written.

### `upiTransactionTag` (join table)

Many-to-many association between transactions and tags (FR-007: a
transaction may carry one or more tags).

| Column | Type | Notes |
|---|---|---|
| `id` | `text`, PK | `crypto.randomUUID()` default |
| `transactionId` | `text`, not null | FK → `upiTransaction.id`, `ON DELETE CASCADE` |
| `tagId` | `text`, not null | FK → `upiTag.id` (no cascade action needed — tags are soft-deleted, never hard-deleted, research.md §4) |
| `createdAt` | `timestamp`, not null, default now | |
| `updatedAt` | `timestamp`, not null, default now | Present for literal Principle II compliance; rows are create/delete-only in practice, never mutated |

**No `userId` column** — deliberate, see research.md §6 and `plan.md`
Complexity Tracking. Ownership is always established by loading the
parent `upiTransaction` first.

**Unique constraint**: `(transactionId, tagId)` — a transaction cannot
carry the same tag twice.

## Relationships

```text
upiTag (1) ──────< upiTransactionTag >────── (1) upiTransaction
  ^ userId                                          ^ userId
  (soft-delete: deletedAt)                          (immutable once created,
                                                       except status via PATCH)
```

- A `upiTransaction` has zero or more `upiTransactionTag` rows (FR-007
  allows proceeding with no tag at the "Pay" step, per Acceptance
  Scenario 5's "at least the option to proceed with no tag").
- A `upiTag` has zero or more `upiTransactionTag` rows; deleting a tag
  (soft-delete) does not touch its existing `upiTransactionTag` rows.

## State transitions

**`upiTransaction.status`** (research.md §3):

```text
(none) --user taps "Pay" (row created here, before redirect)--> pending
pending --tool detects return, user answers "succeeded"--> success
pending --tool detects return, user answers "failed"--> failed
pending --tool detects return, user dismisses/navigates away--> unconfirmed
pending --user never returns to the tool at all--> pending (stays; bucketed
                                                     with `unconfirmed` in
                                                     every read/filter/
                                                     summary view, research.md §3)
success/failed/unconfirmed --user edits status (FR-015)--> any of the four values
```

A retrospective backfill (US3 AC2 — request includes `status` directly)
skips the `pending` step entirely: the user picks `status` on creation
(success/failed/unconfirmed, whichever actually happened). This is
independent of `origin`: FR-022's camera-denied fallback also has
`origin: "manual"` but is a live "tap Pay now" moment (no `status` in the
request), so it still starts at `pending` like a scanned transaction — see
`contracts/upi-tracker-api.md`.

**`upiTag.deletedAt`**:

```text
(none, NULL) --create--> active (NULL)
active --rename/recolor (FR-017)--> active (NULL), new name/color visible
                                     immediately on every transaction that
                                     references it
active --delete (FR-017)--> soft-deleted (deletedAt set); excluded from
                             future tag-selection UI; existing
                             upiTransactionTag rows and their transactions'
                             display of this tag are unaffected
```

There is no "undelete" or re-rename-after-delete path in this feature —
once `deletedAt` is set, the tag is frozen and no longer reachable through
any management UI (only through its existing transaction associations).

## Validation summary (enforced via Zod at the Route Handler boundary, Principle V)

- `amountPaise`: positive integer, required.
- `payeeVpa`: non-empty string, required (both scanned and manual entry).
- `payeeName`: optional string.
- `status` (on create): optional. Omitted → a live "tap Pay now" moment
  (`origin` may be `scanned` or `manual` — the latter covers FR-022's
  camera-denied fallback, which is still a live pay attempt, not a
  backfill); server always writes `pending`, ignoring any client-sent
  status. Present → a retrospective backfill (US3 AC2); `occurredAt`
  becomes required in the same request. See
  `contracts/upi-tracker-api.md`'s `POST /transactions` section — `origin`
  and "is this a backfill" are independent axes, not coupled.
- `status` (on `PATCH`): one of the four values.
- `tagIds` (on create/`PATCH`): array of tag ids belonging to the
  authenticated user and not soft-deleted; empty array allowed (no tag).
- `color` (tag create/`PATCH`): one of the constrained swatch tokens
  (research.md §9).
- `name` (tag create/`PATCH`): non-empty, unique among the user's active
  tags (see `upiTag` table notes above).
- `occurredAt` (manual create only): valid date, not required to be in the
  past (a same-day backfill is valid) but must parse as a real date.
