# Feature Specification: PWA Installability

**Feature Branch**: `feat/pwa-installability`

**Created**: 2026-07-19

**Status**: Draft

**Input**: User description: "Close HomeBase's currently-open installable-PWA gap (constitution Principle IV): make the app installable on iOS Safari and Android Chrome via a valid web app manifest, and add a service worker that caches the app shell and static assets so previously loaded screens keep working offline or on a flaky connection, with write actions failing visibly rather than silently when offline. This is project-wide shell infrastructure, not tied to any one tool module. It must land (or land alongside) before any real domain module ships, per the Bootstrap Sequencing Exception recorded in 003-ui-shell-foundation's and 004-auth-shell-migration's plans — 005-upi-payment-tracker is the first real module waiting on it, but this feature is scoped and built independently of that one."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install HomeBase to the home screen (Priority: P1)

A user wants HomeBase to feel like one of the native single-purpose apps it's replacing, not a bookmarked browser tab — they add it to their phone's home screen and open it from there going forward.

**Why this priority**: This is the literal constitutional requirement (Principle IV) and the direct trigger for every other story here — without a valid manifest there is no "installed app" to make reliable.

**Independent Test**: On both a real/simulated iOS Safari session and an Android Chrome session, install the app to the home screen and verify it opens standalone (its own icon, name, theme color, no browser address bar/chrome) and that backgrounding it (switching to another app) and returning preserves whatever screen/state was showing.

**Acceptance Scenarios**:

1. **Given** the app is opened in Android Chrome, **When** the user is shown the install prompt and accepts it (or installs via the browser menu), **Then** the app installs with its own home-screen icon and name.
2. **Given** the app is opened in iOS Safari, **When** the user chooses "Add to Home Screen," **Then** the app installs with its own home-screen icon and name.
3. **Given** the app has been installed on either platform, **When** the user opens it from the home screen, **Then** it launches in standalone display mode (no browser address bar or navigation chrome) with the correct theme/background color.
4. **Given** the installed app is open, **When** the user switches to another app and returns, **Then** HomeBase resumes showing the same screen/state rather than restarting from the beginning.

---

### User Story 2 - Previously loaded screens stay usable offline or on a flaky connection (Priority: P1)

A user who has already opened HomeBase before loses signal (elevator, basement, subway) and reopens the app expecting to at least see what they saw last, not a blank page or a browser-level error.

**Why this priority**: This is the concrete reliability payoff of Principle IV beyond the install prompt itself, and it's the specific behavior every future tool module (starting with UPI Payment Tracker) is depending on already existing rather than being invented per-module.

**Independent Test**: Load the app once while online, then simulate full offline and a throttled/flaky connection (e.g. via browser dev tools network conditions), reopen the app in both conditions, and verify the previously loaded shell and static assets render instead of a blank page or a native "no internet" browser error.

**Acceptance Scenarios**:

1. **Given** the app has been opened at least once while online, **When** the device has no network connection and the user reopens the app, **Then** the previously loaded app shell renders instead of a blank page or browser error.
2. **Given** the same prior-load condition, **When** the connection is present but severely degraded/flaky, **Then** the app shell and static assets still render without hanging indefinitely on a network request for them.
3. **Given** a brand new deploy has shipped, **When** a user who already has the app installed reopens it, **Then** they eventually see the updated version (no user action like manually clearing site data required) rather than being stuck on a stale cached version indefinitely.

---

### User Story 3 - Offline write attempts fail visibly (Priority: P2)

A signed-in user tries to save something (a form submission, a status update — whatever the currently-available screens support) while offline, and needs to know immediately that it didn't go through, rather than watching a spinner forever or believing it saved when it didn't.

**Why this priority**: Directly required by Principle IV's own text ("write actions... MUST fail visibly... no silent data loss, no infinite spinner") and the failure mode it's built to prevent (belief that data saved when it didn't) is worse than simply not supporting offline writes at all.

**Independent Test**: Go offline, attempt a write action (e.g. the existing smoke-test form's save action), and verify a clear, immediate failure message appears rather than an indefinite loading state or a silently dropped request.

**Acceptance Scenarios**:

1. **Given** the device has no network connection, **When** the user submits a write action, **Then** a clear error message appears within a few seconds explaining the action didn't go through.
2. **Given** the same offline condition, **When** the write fails, **Then** no loading/spinner state is left indefinitely active, and the user is not shown any success confirmation.

---

### Edge Cases

- What happens on a user's very first-ever visit, before anything has been cached yet, if they have no connectivity at that moment? The offline guarantee (User Story 2) only covers screens/assets previously loaded successfully — a true first load with zero connectivity is not required to work, and the constitution's own language ("previously loaded screens") reflects this.
- What happens to a signed-out visitor's cached shell if a different user later opens the app on the same shared/borrowed device? The cached app shell is generic static markup and assets, not any user's personal data — no API/data responses are cached (see FR-009), so there's no cross-user data leakage risk from the cache itself; the existing sign-in/session boundary is unaffected by any of this feature's caching.
- What happens when the manifest/service worker registration itself fails to install (e.g. an unsupported older browser)? The app MUST continue to function as a normal (uninstalled) web page — none of this is allowed to break the app for browsers that don't support service workers or installation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide a valid web app manifest (name, icons at the sizes iOS/Android require, `display: standalone`, theme color, background color).
- **FR-002**: The app MUST be installable to the home screen on Android Chrome via the standard install-prompt mechanism.
- **FR-003**: The app MUST be installable to the home screen on iOS Safari via "Add to Home Screen."
- **FR-004**: An installed instance MUST launch in standalone display mode, with no browser address bar or navigation chrome.
- **FR-005**: The app MUST register a service worker that precaches the app shell and static build assets.
- **FR-006**: Previously loaded screens MUST render when the app is reopened with no network connectivity, instead of a blank page or a native browser error.
- **FR-007**: Previously loaded screens and their static assets MUST render on a severely degraded/flaky connection without hanging indefinitely waiting on a network request for already-cached content.
- **FR-008**: The service worker's cache MUST be versioned so that a new deploy is picked up by already-installed clients without requiring the user to manually clear site data.
- **FR-009**: The service worker's cache MUST NOT store API/Route Handler responses (i.e. no user data) — only the static app shell and build assets — so caching never risks serving one user's or one session's data to another.
- **FR-010**: A write action (e.g. a form submission) attempted while offline MUST fail visibly with a clear message within a few seconds, rather than hanging indefinitely or silently losing the attempted change.
- **FR-011**: If the browser doesn't support service workers or PWA installation, the app MUST continue to function as a normal web page — none of this feature's behavior may be a hard dependency for basic app usage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can install the app to their home screen and launch it standalone (no browser chrome) on both a recent iOS Safari and a recent Android Chrome device.
- **SC-002**: A user who has previously opened the app can reopen it with no network connection and see the previously loaded shell within 2 seconds, instead of a blank page or browser error.
- **SC-003**: 100% of write actions attempted while offline surface a visible failure message within a few seconds — none hang indefinitely or silently drop the attempted change.
- **SC-004**: A user with the app already installed sees a newly deployed version within one app reopen after that deploy, with no manual cache-clearing step.

## Assumptions

- This feature closes the constitution's Principle IV gap that `specs/003-ui-shell-foundation` deliberately deferred (its own Complexity Tracking: "this gap is permitted only until the first real tool module ships — that feature MUST close this gap first or alongside it") and that `specs/004-auth-shell-migration` explicitly carried forward unchanged (not being the trigger feature itself). `specs/005-upi-payment-tracker` is the first real tool module and is the reason this can no longer be deferred, but per the requester's decision this is its own standalone feature, built and landed independently rather than bundled into 005's scope.
- Service worker tooling is Serwist (`@serwist/next`), not `next-pwa` — recorded as a constitution amendment (Principle IV, version 3.3.0 → 3.4.0) because `next-pwa` is no longer actively maintained and Serwist is its purpose-built, actively maintained successor for the Next.js App Router. This amendment already exists in `.specify/memory/constitution.md` independent of which feature does the work.
- No screen currently in the app has meaningful domain content beyond the existing login screen and the smoke-test placeholder (`app/(app)/page.tsx`) — this feature proves the installability/offline mechanism generically against whatever screens exist today; it does not need to wait for a real domain module's screens to exist first.
- Background sync / offline write queueing is explicitly out of scope — offline writes fail visibly (FR-010) rather than being queued for automatic retry later.
- Push notifications and any other PWA capability beyond installability + offline shell caching are out of scope for this feature.
- Manual verification on a real or simulated iOS Safari session and an Android Chrome session (per the constitution's own testing mandate for any change touching the manifest/service worker/caching strategy) happens as part of this feature's validation, not as a separately tracked follow-up.
