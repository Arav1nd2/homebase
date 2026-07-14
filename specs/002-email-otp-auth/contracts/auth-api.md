# Contract: Auth Route Handlers & Middleware

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

All responses follow the constitution Principle V shared shapes:
success as the resource directly (or `{ data: ... }`), errors as
`{ error: { message: string, code: string } }` with a matching HTTP status.
These routes are the intentional exception to Principle V's "verify session
before touching anything" sub-rule for `request-code`/`verify-code`
specifically — they exist to *establish* a session, so there is no session
to check yet.

## `POST /api/auth/request-code`

Request a one-time code for an email address.

**Request body**:

```json
{ "email": "person@example.com" }
```

- `email`: string, required, valid email shape (Zod `z.string().email()`).

**Response — always the same shape, regardless of allow-list match**
(FR-003, FR-014):

```json
{ "data": { "message": "A sign-in code has been sent to that email address." } }
```

- HTTP 200 in all cases where the input itself was valid — including an
  email that is not on the allow-list. This is deliberate: the response
  MUST NOT let a caller distinguish "sent" from "not on the list."
- HTTP 400 with the shared error shape only for a structurally invalid
  email (e.g. missing `@`) — this is a client-input error, not an
  allow-list signal, so it's safe to return distinctly.
- Wording is a flat, unconditional statement — no hedging like "if that
  email is registered." Conditional phrasing leaks the existence of an
  internal registration/allow-list concept the visitor has no reason to
  know about, even though the response itself is already
  allow-list-independent.

**Internal behavior** (not visible in the response):

1. Normalize the email (trim, lowercase).
2. Compare it against the configured `ALLOWED_EMAILS` list (constant-time
   string comparison).
3. If it matches, call Supabase `signInWithOtp({ email })`. If not, do
   nothing further (no Supabase call, no email sent).
4. Always return the same success response either way.

## `POST /api/auth/verify-code`

Redeem a one-time code and establish a session.

**Request body**:

```json
{ "email": "person@example.com", "code": "123456" }
```

- `email`: string, required, same shape as above.
- `code`: string, required, exactly 6 digits (Zod
  `z.string().regex(/^\d{6}$/)`).

**Response on success** — HTTP 200, session cookies set via `Set-Cookie`
(handled by the `@supabase/ssr` server client, not manually):

```json
{ "data": { "redirectTo": "/" } }
```

**Response on failure** — HTTP 401 with the shared error shape:

```json
{ "error": { "message": "That code is incorrect or expired. Request a new one.", "code": "OTP_INVALID" } }
```

- Returned for: wrong code, expired code, or code already used. No
  per-code attempt counting is performed in this iteration (see
  data-model.md) — brute-force resistance comes from Supabase Auth's own
  IP-based rate limiting on verification attempts, plus the 10-minute code
  expiry.

## `POST /api/auth/sign-out`

Ends the current session.

**Request body**: none.

**Auth**: Requires an existing session (uses `getSessionOrThrow()`); if
called with no valid session, returns 401 with the shared error shape
rather than silently succeeding.

**Response on success** — HTTP 200, session cookie cleared:

```json
{ "data": { "redirectTo": "/login" } }
```

## `middleware.ts` (not a Route Handler, but part of this contract)

Gates **page navigation only** — any path not starting with `/api/`.
Behavior:

| Condition | Action |
|---|---|
| API route (`/api/*`) | Always allowed through unchanged; auth (where required) is each handler's own responsibility via `getSessionOrThrow()`, not middleware's — see note below |
| No valid session, path is `/login` | Allow through unchanged |
| No valid session, any other page | Redirect to `/login` (FR-001) |
| Valid session, path is `/login` | Redirect to `/` (FR-013) |
| Valid session, any other page | Allow through, refreshing the session cookie if `getUser()` extended it |

The middleware is the single enforcement point for FR-001/FR-013 on
**pages**. It deliberately does not gate `/api/*`: redirecting a JSON API
caller with an HTML 307 is unusable for that caller, and constitution
Principle V already requires every Route Handler that needs auth to check
it itself and return a clean `{ error: ... }` 401 — this also preserves
`/api/smoke`'s existing, intentionally-public exemption
(001-foundational-infra FR-016) without middleware needing a special case
for it. `request-code`/`verify-code`/`sign-out` are simply the three
routes in this feature that either skip that check (the first two, by
design) or perform it themselves (`sign-out`, via `getSessionOrThrow()`).
