# Feature Specification: Auth Shell Migration

**Feature Branch**: `feat/auth-migration`

**Created**: 2026-07-19

**Status**: Draft

**Input**: User description: "Migrate HomeBase's existing authentication pages/flows so they live inside
the new app shell (see Foundation phase) instead of their current standalone
styling, and so every screen built after this point is behind real
authentication by default.

Context: HomeBase is used by a small household (currently two people), not
the general public — there's no self-serve public signup flow to design,
just getting the current household members' auth experience onto the new
shell and confirming route protection works.

Requirements:
- Audit what authentication currently exists (login, session persistence,
  logout) and carry that same functional behavior forward — this phase is a
  migration, not a redesign of how auth works.
- Re-skin the existing auth screens to match the Foundation visual language
  (Verse Margin), while treating them as the one part of the app that sits
  outside the launcher's shelf/pin hierarchy — they come before the hub, not
  inside it.
- Every screen behind the hub must require an authenticated session; an
  unauthenticated visitor should land on the login screen, not any tool.
- Preserve the two-levels-deep, no-persistent-nav IA — auth screens should
  feel visually consistent with the rest of HomeBase without being forced
  into the launcher's card/shelf pattern.

Technical stack:
- Session/auth logic re-homed into `lib/auth.ts` and Next.js middleware for
  route protection on the `(app)` route group — not scattered per-page.
- Auth screens rebuilt with shadcn/ui form primitives and the shared
  `PageHeader`/`EmptyState`/`ErrorState` components from Foundation, not
  custom one-off markup.
- If login has any client-side form state (vs. a simple server action),
  use TanStack Form + Zod, matching the pattern every other form in the app
  will use.
- Auth status needed by client components should be read via a small
  Zustand store or React context populated from the session — not
  duplicated ad hoc `useState` per component.
- Lands in: `domains/auth/` if the auth surface is large enough to warrant
  its own domain, otherwise `app/(auth)/` for routes plus `lib/auth.ts` for
  logic.

Acceptance criteria:
- Existing login/logout behavior works unchanged, now rendered in the Verse
  Margin visual language.
- Visiting any authenticated route while logged out redirects to login.
- After login, the user lands on the launcher (hub), not a tool screen."

## Clarifications

### Session 2026-07-19

- Q: The shared page shell (003-ui-shell-foundation) gives every screen
  rendered inside it an automatic back-to-hub affordance as part of the
  page head. Should the login/code-entry screens include that affordance,
  given a signed-out visitor has no hub to go back to yet? → A: No — the
  back-to-hub affordance doesn't fit the auth screens' design and shouldn't
  be forced shell-wide in general; each screen should own whether it shows
  one. The shared page shell is refactored so the affordance becomes an
  optional, per-screen element of the page head rather than automatic on
  every screen, and the auth screens are the first to opt out of it.
- Q: The example/reference screen from 003-ui-shell-foundation is currently
  exempted from the sign-in requirement so it could be viewed before real
  auth screens existed, and its own middleware carries a maintainer TODO to
  "remove the route... once auth is migrated." Once this feature closes that
  exemption, should the screen be kept (now protected) or removed entirely?
  → A: Removed entirely — the route and its page are deleted as part of
  this migration, closing the TODO literally rather than leaving a
  now-protected leftover screen behind.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in through the migrated shell (Priority: P1)

A household member who already knows how to sign in to HomeBase opens the
app, is not currently signed in, and goes through the same email-then-code
sign-in they've always used — except the screens now look and feel like the
rest of HomeBase's calm, editorial shell instead of the old unstyled form.

**Why this priority**: Without this, nobody can reach the app at all, and
the visual migration this feature exists to deliver isn't visible anywhere.
It is the minimum slice that proves both "auth still works" and "auth now
lives in the shell."

**Independent Test**: Can be fully tested by opening the app signed out,
submitting an allowed email, retrieving the code, entering it, and
confirming both that sign-in succeeds and that every screen along the way
uses the shared visual language.

**Acceptance Scenarios**:

1. **Given** a signed-out household member on the login screen, **When**
   they submit an allowed email address, **Then** the system sends a
   one-time code exactly as before and shows a code-entry screen rendered in
   the shared visual language.
2. **Given** a member who has requested a code, **When** they enter the
   correct, still-valid code, **Then** they are signed in and land on the
   app's hub/home screen — never a specific tool screen.
3. **Given** a member entering a code, **When** the code is incorrect or
   expired, **Then** the system rejects it and shows a clear error using the
   shell's shared error-state pattern, without signing them in.
4. **Given** the login and code-entry screens, **When** viewed at a phone
   viewport, **Then** they display the serif oversize mark, sage palette,
   and sans-serif body text used everywhere else in the shell, while
   remaining visually distinct from the launcher's card/shelf presentation
   used for tools.
5. **Given** the login and code-entry screens, **When** rendered at any
   point in the sign-in flow, **Then** they display no back-to-hub
   affordance, since a signed-out visitor has no hub to return to yet.

---

### User Story 2 - Every screen requires a session by default (Priority: P2)

An unauthenticated visitor — someone with no valid session, whether they
never signed in or their session ended — tries to reach any screen in the
app other than the login screen itself, including screens added after this
feature ships, and is always sent to the login screen instead of seeing any
protected content.

**Why this priority**: This is the "secure by default" guarantee the whole
migration exists to establish going forward; it depends on User Story 1's
re-skinned login screen existing to redirect to, but is independently
verifiable once that screen is in place.

**Independent Test**: Can be fully tested by attempting to load several
different in-app URLs (including one that didn't exist before this feature)
while signed out and confirming every single one redirects to the login
screen rather than rendering.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they request any screen
   other than the login screen, **Then** they are redirected to the login
   screen instead of seeing that screen's content.
2. **Given** a screen added to the app after this feature ships, **When** an
   unauthenticated visitor requests it, **Then** it is protected the same
   way without needing its own separate auth check added by hand.
3. **Given** an already signed-in visitor, **When** they navigate directly
   to the login screen's URL, **Then** they are redirected away from it to
   the hub, never shown the login form.

---

### User Story 3 - Sign out ends access immediately (Priority: P3)

A signed-in household member chooses to sign out (for example, before
handing a shared device to someone else) and is immediately returned to the
login screen, with no further access to any protected screen from that
device until they sign in again.

**Why this priority**: Important for shared-device use and user control,
but the app remains usable and secure without a fresh test of it if the
first two stories hold, since sessions also expire on their own.

**Independent Test**: Can be fully tested by signing in, triggering
sign-out, and confirming no previously-reachable protected screen loads
without signing in again.

**Acceptance Scenarios**:

1. **Given** a signed-in member, **When** they choose to sign out, **Then**
   their session ends immediately and they see the login screen.
2. **Given** a member who just signed out, **When** they try to reload or
   revisit a protected screen, **Then** they are redirected to the login
   screen rather than shown any cached content.

---

### Edge Cases

- What happens to the example/reference screen that was previously exempted
  from sign-in so it could be viewed before real auth screens existed? It is
  removed entirely as part of this migration — route, page, and its
  middleware exemption — now that real auth screens exist to demonstrate the
  shell instead.
- What happens when someone deep-links to a specific tool URL while signed
  out? They are redirected to login; after signing in they land on the hub,
  not the originally-requested URL — login always leads to the hub,
  regardless of what triggered the redirect.
- What happens to an already-signed-in visitor who navigates directly to the
  login URL? They are redirected away from it to the hub, never shown the
  login form (existing behavior, carried forward unchanged).
- What happens on the re-skinned auth screens at the narrowest supported
  phone viewport? They remain fully usable and readable, with no horizontal
  scrolling or truncated content, consistent with the rest of the shell.
- What happens to a session that was already valid before this migration
  ships? It continues to work unchanged — this migration touches
  presentation and code organization, not session validity, duration, or
  any other functional auth behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render the existing email-then-code sign-in
  flow using the app's shared visual language and shared page-shell
  components, replacing its current standalone styling, without changing
  what the visitor is asked to do at each step.
- **FR-002**: The system MUST preserve existing sign-in functional behavior
  unchanged: allow-listed-email code delivery, code expiry, one-valid-code-
  per-email, and existing throttling protections, all exactly as already
  established.
- **FR-003**: The system MUST preserve the existing long-lived, sliding
  session behavior unchanged: a session remains valid across app restarts as
  long as it has been used within its existing validity window, and is
  extended by ongoing use.
- **FR-004**: The system MUST preserve existing sign-out behavior unchanged:
  signing out immediately ends the session, and subsequent requests for any
  protected screen redirect to login.
- **FR-005**: The system MUST deny access to every screen other than the
  login screen for a visitor without a valid, current session, redirecting
  them to the login screen — enforced by one shared, central check rather
  than a per-screen check that a new screen could accidentally omit.
- **FR-006**: Any screen added to the app after this feature ships MUST be
  protected by that same central check by default, requiring no additional
  per-screen work to be excluded from unauthenticated access.
- **FR-007**: The system MUST NOT show the login screen to a visitor who
  already holds a valid session, sending them to the app's hub/home screen
  instead (existing behavior, carried forward).
- **FR-008**: On successful sign-in, the system MUST send the visitor to the
  app's hub/home screen, never directly to a specific tool screen,
  regardless of what screen (if any) they originally tried to reach before
  being redirected to login.
- **FR-009**: The login and code-entry screens MUST be visually consistent
  with the rest of the app's shared visual language (typography, spacing,
  color) while remaining structurally distinct from the launcher's card/
  shelf presentation used for tools — they are not tools and MUST NOT be
  wrapped in that pattern. They MUST NOT display a back-to-hub affordance,
  since a signed-out visitor has no hub to return to; each screen instead
  owns whether it shows one (see FR-014).
- **FR-010**: The login and code-entry screens MUST present invalid-code,
  expired-code, and failed-request errors using the app's shared error-state
  pattern, rather than a one-off inline error style.
- **FR-011**: The example/reference screen previously exempted from the
  sign-in requirement (so it could be viewed before real auth screens
  existed) MUST be removed entirely — route, page, and its middleware
  exemption — now that real auth screens exist to demonstrate the shell
  instead.
- **FR-012**: The auth screens MUST remain fully usable at the narrowest
  supported phone viewport, consistent with the rest of the app's
  mobile-first requirement.
- **FR-013**: The system MUST continue to respond identically on the login
  screen whether or not a submitted email is on the allow-list, preserving
  the existing protection against revealing which emails are recognized.
- **FR-014**: The shared page shell's back-to-hub affordance MUST become an
  optional, per-screen element of the page head rather than an automatic
  part of every screen — each screen decides for itself whether to show it,
  instead of the shell forcing it shell-wide. The login and code-entry
  screens are the first screens to opt out.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of screens other than the login screen redirect an
  unauthenticated visitor to the login screen instead of showing any
  protected content, and the previously-exempt example/reference screen no
  longer exists at all (zero routes remain unauthenticated except login).
- **SC-002**: 100% of successful sign-ins land the household member on the
  app's hub/home screen, never a specific tool screen, regardless of what
  URL they originally attempted.
- **SC-003**: The re-skinned login and code-entry screens are recognizable
  by visual inspection as matching the app's established design direction
  (serif oversize mark, sage palette, sans-serif body text), consistent with
  every other screen built on the shared shell.
- **SC-004**: Existing sign-in, session-persistence, and sign-out timings
  and behavior (code expiry, session window, throttling) show zero
  regressions when compared against pre-migration behavior.
- **SC-005**: A person who used the app before this migration completes
  sign-in in the same number of steps and in a comparable amount of time as
  before, with no new step or screen added to the flow.

## Assumptions

- This feature is a migration and visual re-skin of the app's existing
  email one-time-code authentication flow; it does not change the sign-in
  method, session duration, throttling, or the allow-list mechanism — those
  remain exactly as already established. No self-serve public sign-up
  screen is introduced.
- The app's hub/home screen (the launcher every tool screen returns to) is a
  separate, not-yet-built feature. This feature only guarantees that the
  post-sign-in redirect target is that hub/home route, whatever currently
  occupies it — today, the app's existing root placeholder page — matching
  this project's existing precedent of a placeholder screen standing in for
  a not-yet-built one until the real screen ships as its own feature.
- The example/reference screen built to demonstrate the shared shell is
  removed entirely as part of this migration (see FR-011), since the reason
  for its exemption — no real auth screens yet existing to demonstrate the
  shell instead — no longer holds once this feature ships, and the
  maintainer's own TODO on its middleware exemption called for removing the
  route itself, not just protecting it.
- Auth status shown to any part of the app continues to be derived from the
  same server-verified session used everywhere else; this feature adds no
  new user-facing auth capability (e.g. no password step, no multi-factor
  step) beyond what already exists.
- "Small household (currently two people)" continues to describe the
  current number of allow-listed members, not a hard cap the system
  enforces.
- No new database schema changes are needed; this feature only touches
  route protection, session-reading, and the presentation of auth screens
  already backed by existing session data.
- FR-014 narrows a decision already made and documented in
  003-ui-shell-foundation, whose own clarification session concluded the
  shared page shell should give every screen an automatic back-to-hub
  affordance. Building the auth screens surfaced a real case where that
  doesn't hold (a signed-out visitor has no hub yet), so this feature
  changes the shell component to make the affordance opt-in per screen
  rather than shell-wide, and 003's spec should be updated to match once
  this feature lands, so the two specs don't describe contradictory shell
  behavior.
- Specific implementation choices named in the original feature request
  (file/folder structure, the client-side form-state approach, where
  client-readable auth status is stored) are preserved verbatim in this
  spec's Input section above and are addressed during implementation
  planning rather than restated as functional requirements here, since they
  describe how the system is built, not what it must do.
