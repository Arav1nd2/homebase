# Research: Email OTP Authentication

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

This document resolves every open technical question from the plan's
Technical Context and records the security-relevant decisions the spec's
"security at utmost priority" and "frictionless PWA sessions" requirements
depend on.

## 1. OTP delivery mechanism: `signInWithOtp` + `verifyOtp`, not a magic link

**Decision**: Use Supabase Auth's `signInWithOtp({ email })` to issue a code,
and `verifyOtp({ email, token, type: 'email' })` to redeem it. Configure the
email template so it surfaces `{{ .Token }}` (the 6-digit code) prominently,
not just a `{{ .ConfirmationURL }}` magic link.

**Rationale**: `signInWithOtp` is a single Supabase API that can deliver
either a clickable magic link or a numeric code from the same email,
depending on which placeholder the email template uses. The user
explicitly asked for the code-entry flow (not "click this link"), which
also fits a PWA better — a link opens the system browser, potentially
outside the installed PWA's standalone window, breaking the "stay inside
the app" experience the long-lived-session requirement is trying to
protect. A typed code keeps the whole journey inside the installed app.

**Alternatives considered**: Magic-link-only flow — rejected per explicit
user request and the PWA-context-switch problem above. Password auth —
explicitly out of scope (Assumptions). Third-party OAuth — same.

## 2. Session/cookie handling: `@supabase/ssr` with a Route Handler + middleware pair

**Decision**: Adopt `@supabase/ssr` (Supabase's supported package for
Next.js App Router), which centers on cookie-based sessions rather than
`localStorage`:

- A shared server client factory (`lib/supabase/server.ts`) built with
  `createServerClient`, reading/writing the session via Next.js's
  `cookies()`.
- `middleware.ts` at the repo root, using a middleware-flavored client
  (`createServerClient` with a `NextResponse`-backed cookie adapter) that
  calls `supabase.auth.getUser()` on every request, refreshes the session
  cookie when needed, and redirects: signed-out visitors on any protected
  path → `/login`; signed-in visitors on `/login` → `/` (FR-001, FR-013).
- A shared `getSessionOrThrow()` helper (constitution Principle V, Route
  Handler convention) built on the server client, for the auth-checked
  Route Handlers this feature and every future module's API routes use.

**Rationale**: `@supabase/ssr` is Supabase's own documented replacement for
the deprecated `@supabase/auth-helpers-nextjs`, purpose-built for the
server client / middleware pattern above, and is the only currently
maintained option. Cookie-based sessions (rather than `localStorage`)
matter specifically for the PWA requirement — see Section 5.

**`getUser()` vs `getSession()`**: Middleware and Route Handlers MUST call
`getUser()`, not `getSession()`. `getSession()` reads the JWT out of the
cookie without contacting Supabase, so a forged or stale cookie can pass
undetected; `getUser()` revalidates the token against Supabase Auth's
server on every call. This is the single most-cited Supabase Auth security
footgun in their own SSR docs and directly serves this feature's "security
at utmost priority" instruction.

**Alternatives considered**: `localStorage`-based `@supabase/supabase-js`
default client only (no SSR helper) — rejected: no server-side/middleware
visibility into the session, so FR-001's redirect-before-render couldn't
be enforced without a client-side flash of protected content.

## 3. Long-lived sessions: Supabase's built-in inactivity timeout, not custom code

**Decision**: Set, both in `supabase/config.toml` (local/CI parity) and the
hosted Supabase project's Authentication → Sessions settings (production):

- `auth.sessions.inactivity_timeout = "720h"` (30 days) — matches FR-010's
  sliding 30-day window exactly: Supabase's own session-refresh machinery
  already extends a session on activity and expires it after the
  configured period of *inactivity*, with no timebox (no unconditional
  absolute cutoff) since FR-010 wants "sliding," not "fixed-then-dead."
- Leave `jwt_expiry` at a short value (e.g. 3600s, the default) — this only
  governs the short-lived access token; `@supabase/ssr`/`supabase-js`
  silently refreshes it in the background using the refresh token for as
  long as the refresh token itself remains valid under the inactivity
  timeout above. The user never notices the short-lived access token; it's
  an internal implementation detail, not the "session" the spec means.

**Rationale**: This is a configuration setting Supabase Auth already
provides for exactly this need — no custom session table, expiry-tracking
logic, or cron job is required. This is the strongest fit with constitution
Principle VIII (simplicity) and the "auth stays managed through Supabase
Auth" constraint: the long-lived-session requirement is met by
*configuring* the managed service correctly, not building around it.

**Operational note**: `supabase/config.toml` only drives the **local** CLI
stack. The hosted (production) project's session settings are separate and
must be set to the same values via the Supabase Dashboard or Management
API — `supabase config push` does not currently sync the `[auth.sessions]`
block to a hosted project. This is a manual parity step to carry into
`tasks.md` and re-verify whenever `config.toml`'s auth section changes,
since a silent local/production divergence here is exactly the kind of gap
constitution Principle VI's Environment Parity rule exists to catch.

**Alternatives considered**: A custom "remember me" token stored in our own
Postgres with a hand-rolled sliding-expiry column — rejected: duplicates a
feature Supabase Auth already has, adds a table and expiry-management code
we'd be responsible for keeping correct, and violates "modules MUST NOT
roll their own auth."

## 4. Rate limiting (FR-008) — Supabase's built-in throttles only, for now

**Decision**: For this iteration, rely entirely on **Supabase's built-in
per-IP throttles** (`auth.rate_limit` in `config.toml`, mirrored in the
hosted project's settings): keep `sign_in_sign_ups` and
`token_verifications` at their defaults (30 per 5 minutes) as a coarse,
IP-scoped backstop against high-volume abuse, and tighten
`auth.email.max_frequency` from the default `"1s"` to `"60s"` so a single
email address cannot trigger a resend more than once a minute. Combined
with the 10-minute code expiry (Section 1 / FR-006), this is treated as
sufficient brute-force resistance for a 2-user household app.

**No app-owned attempt counter, no new Cloudflare KV binding.** An earlier
version of this research proposed a per-email failed-attempt counter in a
new KV namespace to enforce a hard "3 wrong guesses invalidates this
specific code" rule. That rule has been explicitly descoped for this
iteration (see spec.md Clarifications) — it would have been the only piece
of new infrastructure this feature needed beyond configuring Supabase, and
per constitution Principle VIII, that's not worth adding before there's a
concrete need for it.

**Rationale**: Supabase's GoTrue does not expose a "this specific code is
now dead after N wrong guesses" primitive natively — its rate limiting is
IP-scoped and coarse, not per-code — so a true 3-strikes-per-code rule
would still require the KV counter design above if it's ever built. That
design is preserved here as the concrete approach to reach for if abuse is
observed in practice: a KV entry keyed by the normalized email (Section 6
— the allow-list no longer hashes emails, so this would key directly on
the normalized address), TTL'd to the 10-minute code expiry, incremented
on each wrong `verifyOtp` result, triggering an automatic `signInWithOtp`
reissue (which supersedes the compromised code per FR-007) on the 3rd
failure.

**Alternatives considered**: Building the KV counter now — rejected per the
user's explicit instruction to defer it; the coarser IP-based limiting is
judged adequate for the current 2-user, low-traffic threat model. A
Postgres table with a Drizzle model instead of KV — would still add
unnecessary schema surface and manual expiry bookkeeping for throwaway
abuse-counter data even if/when this is revisited; KV remains the better
fit whenever it is built.

## 5. PWA-specific session/storage behavior (iOS Safari & Android Chrome)

**Decision**: Cookie-based sessions via `@supabase/ssr` (Section 2), with
`Secure`, `HttpOnly` where the cookie doesn't need client JS access, and
`SameSite=Lax` (first-party, standard-navigation flows only — this app has
no cross-site auth redirect step, so `Lax` is sufficient and safer than
`None`).

**Rationale — why this matters specifically for a PWA**:

- **iOS Safari's Intelligent Tracking Prevention (ITP)** aggressively caps
  and evicts *script-writable* storage (`localStorage`, IndexedDB) for
  origins not recently interacted with — as short as 7 days in some ITP
  versions. This is the single biggest risk to "long-lived sessions" on
  iOS if a session were kept in `localStorage`. First-party cookies set by
  a server response are not subject to that specific 7-day script-writable
  eviction policy, which is why `@supabase/ssr`'s cookie approach (not the
  default browser client's `localStorage` approach) is the correct choice
  for this requirement, not just a style preference.
- **Installed (Add to Home Screen) iOS web apps get their own storage
  context**, separate from Safari's regular browsing storage, and are
  generally exempt from the same interactive-browsing storage caps applied
  to regular tabs — but that storage can still be cleared by the OS under
  device-wide storage pressure or a manual "Offload App"/reinstall. No
  session mechanism can fully prevent that; FR-002 (User Story 2) accepts
  this as an edge case, handled by falling back to the login screen rather
  than erroring.
- **Android Chrome installed PWAs** share Chrome's normal cookie storage
  and are not subject to an ITP-equivalent aggressive eviction policy, so
  this is primarily an iOS-specific risk to design around, not a symmetric
  one.

**Alternatives considered**: Storing the session token in `localStorage`
for simpler client-side access — rejected specifically because of the iOS
ITP risk above; it would directly undermine the "long-lived" requirement
on the platform where it's hardest to get right.

## 6. Allow-list storage: plain emails in a Worker secret, not hashed

**Decision**: Store the allow-list as a GitHub Actions secret
(`ALLOWED_EMAILS`, comma-separated plain email addresses) scoped to the
`production` environment — the single source of truth per the
constitution's "GitHub Actions secrets are the single secret manager"
constraint. `deploy.yml` pushes its current value to the matching
Cloudflare Worker secret on every run, so the app always reads the same
value that's set in GitHub. To check a submitted email: normalize
(lowercase, trim) and compare against the configured list using a
constant-time string comparison.

**Reconsidered from an earlier HMAC-based design**: This feature originally
hashed the allow-list with `HMAC-SHA256` and a separate pepper secret, so
that even the stored allow-list configuration wouldn't contain a plaintext
household email if it were ever accidentally exposed (a log line, a
misconfigured non-secret var, a support screenshot). On reflection, that
was judged unnecessary complexity for a two-person personal project:

- Both storage layers already involved (Cloudflare Worker secrets, GitHub
  Actions secrets) are write-only by design — neither the Cloudflare
  dashboard/API nor the GitHub UI/API can display a secret's value once
  set, and GitHub additionally auto-masks known secret values in workflow
  logs. The specific "someone reads it out of secret storage" threat the
  hash was defending against is already well-covered by using secrets at
  all, hash or no hash.
- The hash added real ongoing cost: a pepper to generate and keep in sync
  across `.dev.vars`, the Worker secret, and (if automated) CI: a
  hashing step every time an email is checked or added; and a subtler
  failure mode where a future contributor could `console.log` the raw
  submitted email during debugging (the one thing hashing *couldn't*
  prevent either, since the app must always have the plaintext in hand at
  request time to compute the hash and to pass to Supabase).
- The residual risk hashing still mitigated — the *app itself* logging the
  raw `ALLOWED_EMAILS` env value somewhere Cloudflare's own log masking
  doesn't reach — was judged low-probability and low-impact enough (two
  known household emails, not a large user base) not to justify the
  added complexity, for this project specifically.

**Scope note (still applies)**: This allow-list only gates *whether the
app calls Supabase to send a code at all* (FR-009); Supabase Auth's own
managed user store (`auth.users`) necessarily holds the real email address
for any account that completes sign-in, same as before — that was never
something the hash changed.

**Alternatives considered**: The original HMAC+pepper design (reverted,
per above). A plain, git-committed config file — considered during the
same discussion as a way to make the list self-service-editable without
touching secrets at all, but rejected: the user preferred keeping it as a
secret and manually tracking the current list themselves, over having
household member emails committed in the clear to git history.

## 7. Cloudflare Workers runtime compatibility

**Decision**: `@supabase/supabase-js` and `@supabase/ssr` are fetch-based
with no Node-only APIs, so they are expected to work under OpenNext's
Cloudflare Workers runtime the same as they do on Vercel Edge/other
fetch-based runtimes. However, **Next.js middleware under OpenNext's
Cloudflare adapter has not yet been exercised in this project** (the
existing 001 feature has no middleware at all). Given this project's prior
incident with an ORM that looked edge-compatible on paper but wasn't
(Prisma, see constitution Principle II's rationale), this is flagged as a
**first task** in `tasks.md`: stand up the minimal middleware + `getUser()`
call against the local Workers preview before building the rest of the
feature on top of it, so an incompatibility surfaces immediately rather
than after the whole feature is built.

**Rationale**: Directly follows constitution Principle VI's instruction to
"confirm compatibility before adding, don't discover it at deploy time,"
and the project's own documented lesson from the Prisma incident.

**Alternatives considered**: Skip middleware, do the auth check per-page in
Server Components/layouts instead. This remains the documented fallback in
`tasks.md` if the middleware spike fails — but middleware is preferred
because it's the only place that can redirect *before* any protected
page's Server Component starts rendering, cleanly satisfying FR-001/FR-013
in one place rather than duplicating the check per route.

## 8. Audit trail (FR-015): Supabase's own `auth.audit_log_entries`

**Decision**: Rely on Supabase Auth's built-in audit log (every sign-in
attempt, OTP send, and verification failure is already recorded in its own
managed schema) rather than building a parallel logging table.

**Rationale**: Satisfies FR-015 with zero new code or schema — another
instance of Section 3's theme (configure/use the managed service, don't
duplicate it). If a future feature needs an in-app "recent sign-in
activity" view, it can query this existing table rather than a new one.

**Alternatives considered**: A custom `signInAttempt` Drizzle table —
rejected as duplicate functionality Supabase already provides, with no
current requirement (per Principle VIII) to expose it in-app yet.

## Summary of new infrastructure this feature introduces

| Component | Type | Purpose |
|---|---|---|
| `ALLOWED_EMAILS` | GitHub Actions secret (source of truth), synced to a Cloudflare Worker secret by `deploy.yml` | Static allow-list of household emails (FR-009) |
| `auth.sessions.inactivity_timeout` | Supabase Auth config (local + hosted) | 30-day sliding session window (FR-010, FR-011) |
| `auth.email.max_frequency` | Supabase Auth config (local + hosted) | Resend cooldown (supplements FR-008) |
| `middleware.ts` | Next.js middleware | Route protection + session refresh (FR-001, FR-013) |
| `lib/supabase/server.ts` | Shared helper | `getSessionOrThrow()`-style session access for Route Handlers |

No new Drizzle table or Postgres schema change is introduced by this
feature — see `data-model.md`.
