# Data Model: Email OTP Authentication

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

## No new Drizzle/Postgres table

This feature adds **no new table** to `db/schema.ts`. See `research.md`
Sections 3, 4, 6, and 8 for why each conceptual entity in the spec maps to
either Supabase Auth's own managed schema, a Cloudflare primitive, or a
Workers secret, instead of app-owned Postgres rows. This is a deliberate
outcome of constitution Principle VIII (no schema surface without a
relational need) and the "Auth ... stay managed" constraint, not an
oversight.

## Entity → implementation mapping

| Spec entity (spec.md § Key Entities) | Where it actually lives | Notes |
|---|---|---|
| Household Member Account | Supabase Auth's `auth.users` (managed) | Created/looked up automatically by `signInWithOtp`/`verifyOtp`; our code never reads/writes this table directly except via the Supabase Auth client. |
| Sign-In Session | Supabase Auth's session/refresh-token machinery (managed), reflected to the browser as cookies set by `@supabase/ssr` | Lifecycle governed by `auth.sessions.inactivity_timeout` (30 days) — see research.md §3. No app-owned session table. |
| One-Time Code Challenge | Supabase Auth's internal OTP state (managed) | 10-minute expiry via `auth.email.otp_expiry`; "superseded by a newer code" behavior is Supabase's own default when `signInWithOtp` is called again for the same email. |
| Allowed Email List | GitHub Actions secret `ALLOWED_EMAILS` (source of truth), synced to a Cloudflare Worker secret by `deploy.yml` | Not a database row; a fixed, small list of plain email addresses, updated by the app owner in GitHub (Assumptions). See research.md §6. |

**No failed-attempt counter in this iteration.** A per-email KV-backed
attempt counter was considered (research.md §4) to enforce a hard
3-strikes-per-code lockout, but that rule is explicitly deferred — see
spec.md Clarifications and Assumptions. Rate limiting for now comes
entirely from Supabase Auth's own built-in per-IP throttles, which
requires no new binding or app-owned state at all.

## Session/user shape as consumed by the app

The app does not define its own "User" type for auth purposes. Wherever
code needs "the current user," it uses the Supabase Auth user object
returned by `getUser()` (via the shared `getSessionOrThrow()` helper),
narrowed to the one field modules actually need:

```text
AuthenticatedUser
├── id: string        # Supabase auth.users.id (uuid) — this is the
│                      # "userId" every other module's Drizzle tables
│                      # (constitution Principle II) will store as the
│                      # ownership column, once real modules exist.
└── email: string      # For display only; never used as a lookup key
                        # into the allow-list at request time (the
                        # allow-list check only happens at sign-in).
```

No other user attributes (name, avatar, preferences) are in scope for this
feature; if a future module needs profile data, it becomes a new Drizzle
table keyed by this `id`, per Principle II's foreign-key convention — not
an extension of Supabase's own `auth.users` row.

## State transitions

**One-Time Code Challenge** (conceptual, entirely inside Supabase Auth):

```text
(none) --signInWithOtp--> issued (10 min TTL)
issued --verifyOtp: correct--> consumed --> Sign-In Session created
issued --verifyOtp: wrong--> issued (no lockout tracked this iteration; see research.md §4)
issued --signInWithOtp called again (manual resend)--> superseded
issued --10 min elapse--> expired
```

**Sign-In Session** (conceptual, entirely inside Supabase Auth +
`@supabase/ssr` cookies):

```text
(none) --successful code verification--> active
active --any request within 30 days of last activity--> active (renewed)
active --explicit sign-out--> ended
active --30 days with no activity--> expired
```
