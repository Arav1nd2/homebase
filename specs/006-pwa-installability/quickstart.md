# Quickstart: Validating PWA Installability

Prerequisites: `npm install`, local Supabase running (`npm run db:start`), the app served via the real Workers preview per Environment Parity — `npm run dev` from repo root (starts Supabase, migrates, builds, and serves `packages/web` through Wrangler/Miniflare). PWA install prompts and service worker registration require a secure context; the Workers preview serves over `https://localhost` or is otherwise treated as a secure origin by Chrome/Safari — confirm this holds once `preview:workers` is running (see troubleshooting note below if not).

## 1. Manifest and installability (User Story 1 / SC-001)

- Open the running app in Chrome (desktop or Android) and check DevTools → Application → Manifest: name, icons, `display: standalone`, theme/background color all populate with no errors, and Chrome's own installability checklist in that panel shows no failures.
- On an Android Chrome device (or Chrome's device emulation + a real device for final sign-off per the constitution's manual-verification mandate), open the app and confirm the install prompt appears (or install via the browser menu); confirm it launches standalone afterward.
- On a real or simulated iOS Safari session, open the app, use Share → "Add to Home Screen," and confirm it installs with the correct icon/name and launches standalone from the home screen.

## 2. Offline shell (User Story 2 / SC-002)

- With the app open and fully loaded, open DevTools → Application → Service Workers and confirm one is registered and activated.
- DevTools → Network → set to "Offline," then reload. Expect: the previously loaded shell renders (no blank page, no browser-native offline error).
- Repeat with Network throttled to a slow/flaky profile instead of fully offline — same expectation, without hanging indefinitely.
- Make an unrelated code change, redeploy/rebuild, reopen the app: expect the update to appear without manually clearing site data (FR-008/SC-004).

## 3. Offline write failure (User Story 3 / SC-003)

- With the app offline (per step 2), attempt the existing smoke-test form's save action.
- Expect a clear, visible error message within a few seconds — no indefinite spinner, no false "saved" confirmation.

## 4. No stale API data (FR-009)

- While online, load a page that fetches from `/api/smoke`; go offline; reload. Expect the shell to render but the data section to show its existing loading/error state (not stale cached JSON) — confirms `/api/*` is `NetworkOnly`, per contracts/service-worker-caching.md.

## 5. Graceful degradation (FR-011, edge case)

- In a browser without service worker support (or with it disabled via DevTools), confirm the app still loads and functions normally as an ordinary web page.
