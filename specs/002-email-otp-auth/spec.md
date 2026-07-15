# Feature Specification: Email OTP Authentication

**Feature Branch**: `002-email-otp-auth`

**Created**: 2026-07-13

**Status**: Draft

**Input**: User description: "Very basic foundational skeleton is setup. Now I want you to setup authentication for this project using supabase auth. I would like the email otp authentication approach. Move the main page behind a login screen and implement the feature keeping the security atmost priority. Never do anythign that can harm users security in the process. At the sametime remember the app is supposed to be used as a progressive web app, so to have a frictionless experience it would be ideal to have loong lived login sessions. Do detailed research and analyis about auth best practices for pwas and next js and cloudflare"

## Clarifications

### Session 2026-07-13

- Q: FR-006 says the one-time code expires "on the order of minutes, not
  hours" — what should the exact expiry duration be? → A: 10 minutes.
- Q: FR-008 requires limiting verification attempts to resist guessing —
  what is the failed-attempt threshold before a code is invalidated? → A:
  3 attempts per code, then that code is invalidated and a new one must be
  requested.
- Q: (Follow-up, same session) Should the 3-attempts-per-code lockout be
  built now? → A: No — descoped for this iteration. Rely on Supabase
  Auth's built-in IP-based rate limiting plus the 10-minute code expiry for
  now; a hard per-code attempt lockout (and the tracking it requires) can
  be added later if abuse is actually observed.
- Q: (Follow-up, after implementation) Should the allow-list continue
  storing HMAC hashes of household emails (with a separate pepper secret),
  or plain email addresses? → A: Plain email addresses, stored only as a
  Cloudflare Worker secret (never a plaintext config file or committed
  value). Hashing was originally added for defense-in-depth against
  accidental in-app log exposure, but was judged unnecessary complexity
  for a two-person project: both the Worker secret and GitHub Actions
  secret storage already prevent read-back via their respective consoles/
  APIs, which was the main protection actually needed here.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in with an emailed one-time code (Priority: P1)

A household member opens the app, is not currently signed in, and needs to
reach the main application screen. They enter their email address, receive a
one-time code by email, enter that code, and are taken to the main
application as a fully authenticated user.

**Why this priority**: Without this flow, nobody can reach the application
at all — it is the minimum viable slice of the entire feature.

**Independent Test**: Can be fully tested by opening the app while signed
out, submitting a known allowed email, retrieving the emailed code,
submitting it, and confirming the main application page loads.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor on the login screen, **When** they submit
   an allowed email address, **Then** the system sends a one-time code to
   that email and shows a screen to enter the code.
2. **Given** a visitor who has requested a code, **When** they enter the
   correct, still-valid code, **Then** they are signed in and redirected to
   the main application page.
3. **Given** a visitor entering a code, **When** the code is incorrect,
   **Then** the system rejects it, shows a clear error, and does not sign
   them in.
4. **Given** a visitor entering a code, **When** the code has expired,
   **Then** the system rejects it, shows a clear error, and offers a way to
   request a new code.

---

### User Story 2 - Frictionless return visits on the installed PWA (Priority: P2)

A household member who signed in previously reopens the installed app days
or weeks later (from the home-screen icon, a browser tab, or after a device
restart) and lands directly on the main application page without having to
sign in again, as long as their session is still valid.

**Why this priority**: The app is meant to replace several single-purpose
apps used many times a day; requiring a fresh sign-in on every open would
make it unusable as a daily-driver PWA, even though it is not needed to
prove the core sign-in flow works.

**Independent Test**: Can be fully tested by signing in once, closing the
app completely (including a simulated device/browser restart), reopening it
after a delay, and confirming the main application page loads with no
login prompt.

**Acceptance Scenarios**:

1. **Given** a user who signed in previously and whose session has not
   expired, **When** they reopen the app after closing it completely,
   **Then** they land on the main application page without re-entering
   credentials.
2. **Given** a user whose session has expired, **When** they reopen the
   app, **Then** they are shown the login screen instead of the main
   application page.
3. **Given** a user actively using the app, **When** their session is
   nearing its expiry, **Then** continued use extends the session so an
   actively-used app does not sign the user out mid-use.

---

### User Story 3 - Explicit sign-out (Priority: P3)

A signed-in household member chooses to sign out of the app (for example,
before handing a shared device to someone else), and is immediately
returned to the login screen with no further access to the main
application from that device until they sign in again.

**Why this priority**: Important for shared-device scenarios and user
control, but the app is still usable and secure without it if the first
two stories are in place, since sessions still expire on their own.

**Independent Test**: Can be fully tested by signing in, triggering
sign-out, and confirming the main application page is no longer reachable
without going through sign-in again.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they choose to sign out, **Then**
   their session is invalidated immediately and they are shown the login
   screen.
2. **Given** a user who just signed out, **When** they try to reload or
   revisit the main application page, **Then** they are redirected to the
   login screen rather than shown any cached application content.

---

### Edge Cases

- What happens when a user requests a new code while a previous code for
  the same email is still valid? (The previous code must stop working once
  a new one is issued, so only one code per email is ever valid at a time.)
- How does the system handle repeated rapid code requests or repeated
  incorrect code entry for the same email or from the same visitor? (Must
  be throttled to resist guessing and email-spam abuse.)
- What happens when someone submits an email address that is not on the
  allowed list? (The system must not reveal whether the email is
  recognized, and must not send a code.)
- What happens if the device is offline when the user opens the installed
  PWA? (A previously-established valid session should still allow access
  to previously-cached screens per the app's existing offline behavior; a
  sign-in attempt made while offline must fail with a clear message rather
  than hanging.)
- What happens if a session is used from two different devices at once for
  the same user? (Both remain valid independently; signing out on one
  device does not sign out the other.)
- What happens when a user's session token is somehow copied or replayed
  from a different device/location? (Out of scope for this feature to
  detect anomalous locations; standard secure session handling is the
  mitigation.)
- What happens when the login screen itself is reached while a valid
  session already exists? (The user is redirected straight to the main
  application instead of being shown the login form again.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST prevent access to the main application page
  (and any page currently reachable without sign-in) for anyone without a
  valid, current session, redirecting them to a login screen instead.
- **FR-002**: The system MUST let a visitor request a one-time code by
  submitting an email address on the login screen.
- **FR-003**: The system MUST send the one-time code only to the submitted
  email address, and MUST respond the same way on the login screen whether
  or not that email is recognized, so the login screen cannot be used to
  discover which emails are allowed.
- **FR-004**: The system MUST let a visitor enter the code they received
  and, on a correct and still-valid code, establish an authenticated
  session and grant access to the main application.
- **FR-005**: The system MUST reject a code that is incorrect, expired, or
  already used, without granting access, and MUST show the visitor a clear,
  non-technical error message.
- **FR-006**: The system MUST expire an issued one-time code exactly 10
  minutes after it is issued, regardless of the session's own long-lived
  duration.
- **FR-007**: The system MUST invalidate a previously issued, unused code
  for an email as soon as a new code is requested for that same email, so
  at most one code is ever valid per email at a time.
- **FR-008**: The system MUST limit how many codes can be requested for a
  given email and how many verification attempts can be made in a given
  time window (via rate limiting), to resist guessing and email-flooding
  abuse. A hard per-code failed-attempt lockout is explicitly deferred for
  this iteration — see Assumptions.
- **FR-009**: The system MUST restrict sign-in to a fixed, app
  owner-configured allow-list of household member emails, stored only as a
  Cloudflare Worker secret (never plaintext in repo config or committed
  files); submitting any email that does not match an entry in the list
  MUST NOT create a new account or send a code.
- **FR-010**: The system MUST use a sliding session validity window of 30
  days: a session remains valid for 30 days from the user's last activity,
  keeping a user signed in across app restarts, device reboots, and
  closing/reopening the installed PWA without re-entering credentials, and
  expires only after 30 consecutive days with no activity on that session.
- **FR-011**: The system MUST extend an active user's session on each use
  (per the 30-day sliding window in FR-010), so ongoing daily use never
  gets interrupted by expiry, while a session that sits unused for the
  full window still expires on its own.
- **FR-012**: The system MUST let a signed-in user explicitly sign out,
  which immediately invalidates that session so it can no longer be used
  to reach the main application, on that device.
- **FR-013**: The system MUST NOT display the login screen to a visitor who
  already holds a valid session; such a visitor is sent straight to the
  main application.
- **FR-014**: The system MUST NOT expose any information in a login error
  message, network response, or client-visible state that would let a
  visitor determine whether a specific email address is on the allowed
  list, has an account, or has an outstanding valid code.
- **FR-015**: The system MUST record enough information about sign-in
  attempts (successful and failed) to support later investigation of
  suspicious activity, without storing the one-time codes themselves in
  plain, reusable form beyond their short validity window.

### Key Entities

- **Household Member Account**: An individual allowed to use the app,
  identified by their email address; represents "who is signed in" for
  every other module's data-ownership checks.
- **Sign-In Session**: An authenticated session tied to one account and one
  device/browser instance; has a start time, an expiry governed by the
  long-lived session policy, and is extended by ongoing activity or ended
  by explicit sign-out.
- **One-Time Code Challenge**: A short-lived code issued for a specific
  email in response to a sign-in request; has an issue time, a short expiry,
  an attempt count, and a used/unused state; superseded by any newer code
  requested for the same email.
- **Allowed Email List**: An app owner-configured, static list of the
  household members' email addresses, checked against a submitted email to
  decide whether a code may be sent. A GitHub Actions secret is the single
  source of truth; the deploy pipeline syncs it to the Cloudflare Worker
  secret the app actually reads. Never stored in plaintext repo config.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor with an allowed email can go from opening the login
  screen to reaching the main application (request code, receive it,
  enter it) in under 60 seconds under normal conditions.
- **SC-002**: 100% of attempts to load the main application (or any
  currently-protected page) without a valid session result in the login
  screen instead of any application content or data.
- **SC-003**: A returning user with a still-valid session reopens the
  installed app and reaches the main application with zero sign-in prompts
  in at least 95% of such reopens observed during testing.
- **SC-004**: 100% of incorrect, expired, or reused one-time codes are
  rejected; no such code ever results in a granted session.
- **SC-005**: After a user signs out, 0% of subsequent attempts to reach
  the main application on that device succeed without signing in again.
- **SC-006**: Submitting an email that is not on the allowed list produces
  the same visible outcome on the login screen as submitting one that is,
  from the visitor's point of view.

## Assumptions

- The app owner configures the fixed set of allowed household-member email
  addresses out-of-band, as a GitHub Actions secret (the project's single
  source of truth for secrets), synced to the Cloudflare Worker by the
  deploy pipeline whenever someone is added or removed; self-service
  sign-up is out of scope, since this is a private, two-person household
  app rather than a public product. No in-app admin screen manages this
  list.
- A 30-day sliding session window is the target balance of frictionless PWA
  use against bounded exposure if a device is lost; it is a starting policy
  that can be revisited later, not treated as immutable.
- A user may be signed in on more than one device/browser at the same time,
  and signing out on one device does not affect sessions on other devices,
  consistent with how personal apps typically behave across a phone and a
  desktop.
- Password-based sign-in, social/OAuth sign-in, and multi-factor
  authentication beyond the emailed one-time code are out of scope for this
  feature.
- Account recovery for a household member who loses access to their email
  address is an out-of-band, manual process (the app owner has direct
  database/config access) and is out of scope for this feature's UI.
- The existing single main page (currently the smoke-test page) is the page
  being placed behind the login screen; as further pages/modules are added
  later, they inherit the same protection rather than each needing separate
  auth logic.
- "Long-lived" session behavior applies to normal sign-in state, not to any
  future step-up/re-authentication requirement for especially sensitive
  actions — no such sensitive action exists yet in this app.
- A hard 3-attempts-then-invalidate lockout per one-time code is deferred:
  for this iteration, Supabase Auth's own built-in IP-based rate limiting
  (on both code requests and verification attempts) plus the short
  10-minute code expiry are treated as sufficient brute-force resistance
  for a 2-user household app. Building a dedicated per-code attempt
  counter (and the supporting infrastructure it needs) is left as future
  work if real abuse is ever observed.
