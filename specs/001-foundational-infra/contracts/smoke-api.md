# Contract: `/api/smoke`

The only API surface this feature introduces. Follows constitution
Principle V's response/error/validation conventions, with auth deliberately
skipped per FR-016 (see `plan.md` Constitution Check).

## `POST /api/smoke`

Creates a smoke-test record.

**Request body** (JSON, validated with Zod):

```json
{ "message": "string, 1-500 chars" }
```

**Success — 201**:

```json
{ "data": { "id": "string", "message": "string", "createdAt": "ISO 8601 string" } }
```

**Validation error — 400** (shared error shape):

```json
{ "error": { "message": "string", "code": "VALIDATION_ERROR" } }
```

**Unexpected error — 500** (shared error shape, no leaked internals):

```json
{ "error": { "message": "string", "code": "INTERNAL_ERROR" } }
```

## `GET /api/smoke`

Returns the most recently created smoke-test record, if any.

**Success — 200**:

```json
{ "data": { "id": "string", "message": "string", "createdAt": "ISO 8601 string" } | { "data": null } }
```

**Unexpected error — 500**: same shape as above.

## Explicitly no auth

Per FR-016, neither endpoint checks a Supabase Auth session. This is a
deliberate, tracked exception to Principle V — see `plan.md` Constitution
Check / Complexity Tracking. No other current or future Route Handler may
copy this exception without the same explicit justification.
