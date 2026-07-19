# Research: PWA Installability

## 1. Service worker tooling: Serwist, not next-pwa

**Decision**: Use Serwist (`serwist` + `@serwist/next`) to generate and manage the service worker.

**Rationale**: The constitution named `next-pwa` but pre-authorized swapping it for "an actively maintained equivalent if next-pwa becomes unmaintained." next-pwa is no longer actively maintained and doesn't support Turbopack. Serwist is its purpose-built successor for the Next.js App Router — actively maintained, and it works as a pure build-time Next.js plugin (`withSerwist` wrapping `next.config`) that compiles a source file (e.g. `app/sw.ts`) into a static `public/sw.js`. It requires no Edge Runtime route and never executes server-side — the service worker only ever runs in the browser. This means it doesn't intersect with any of `@opennextjs/cloudflare`'s known runtime-manifest issues (e.g. GH #1232, #1090 — both about server-side `require()` calls against `.next/*.json` at Worker request time), since `public/sw.js` is just another static file `next build` emits, already picked up by `opennextjs-cloudflare build`'s copy into `.open-next/assets` — the same mechanism serving every other `public/` file via the existing `ASSETS` binding in `wrangler.jsonc`.

Recorded as a constitution amendment (3.3.0 → 3.4.0) per Principle IV's own pre-authorized escape hatch, not a Complexity Tracking violation — the requirement itself (installable PWA, offline app-shell caching) is unchanged; only the named tool is.

**Alternatives considered**:
- `next-pwa` as literally named: rejected — unmaintained, no Turbopack support, the exact condition the constitution's escape hatch anticipated.
- `@ducanh2912/next-pwa` (community fork): still webpack-only and less actively developed; Serwist is the fork that became the de facto successor and what Next.js's own PWA guide now points to.
- Hand-rolled service worker (no library): rejected — Serwist is a thin, well-tested wrapper around exactly the caching-strategy code (precache manifest injection, cache versioning/cleanup on deploy) we'd otherwise hand-write, and getting that wrong has real correctness risk (stale-cache bugs).

## 2. Manifest: Next.js's native `app/manifest.ts`, not a static `public/manifest.json`

**Decision**: Use Next.js App Router's built-in metadata route convention — `app/manifest.ts` exporting a `MetadataRoute.Manifest` object — rather than hand-writing `public/manifest.json`.

**Rationale**: This has been a first-class Next.js App Router feature since 13.3 (Next's own "Guides: PWAs" documentation recommends exactly this), needs no extra dependency, integrates with the existing `metadata` export pattern already used in `app/layout.tsx`, and Next.js auto-injects the correct `<link rel="manifest">` — no manual `<head>` edit needed. It compiles to a normal Next.js route (not an Edge-runtime-specific feature), so it carries no different risk profile under the Node-runtime-only OpenNext Cloudflare adapter than any other route already in the app.

**Alternatives considered**: static `public/manifest.json` — works too, but would need a manual `<link rel="manifest" href="/manifest.json">` in `app/layout.tsx` and loses the type-checked `MetadataRoute.Manifest` shape; no concrete advantage over the native route.

## 3. Icons

**Decision**: Generate a minimal icon set now (192×192 and 512×512 PNG for Android/Chrome, both a standard and a `maskable` purpose variant; 180×180 for iOS's `apple-touch-icon`) from the Verse Margin brand tokens (`DESIGN.md`) — there are currently no icon/logo assets anywhere in the repo (`public/` doesn't even exist yet).

**Rationale**: A manifest without valid icons at the required sizes fails Chrome's installability criteria outright and produces a blank/default icon on iOS — this is a hard requirement, not a nice-to-have, and there's nothing to reuse from elsewhere in the codebase.

## 4. Runtime caching strategy (what gets cached, what doesn't)

**Decision**: Start from Serwist's recommended default runtime-caching rules (Workbox-derived: `CacheFirst` for fonts/images, `StaleWhileRevalidate` for JS/CSS, `NetworkFirst` for navigation/document requests), but **prepend an explicit `NetworkOnly` rule matching `/api/.*`**, overriding the library default (which otherwise applies a caching strategy to GET API responses too).

**Rationale**: This is the mechanism behind FR-009 (no API/Route Handler responses in the service worker cache) and is the one place a default config would silently violate the spec if left unreviewed — Serwist/Workbox's out-of-the-box recipe set is written for generic apps and does cache same-origin GET API calls by default. Explicitly routing `/api/*` to `NetworkOnly` means an offline API call fails immediately and visibly (surfaced via the existing `errorResponse` shape and `ErrorState` component) instead of ever returning stale cached JSON — which matters here specifically because Route Handler responses carry per-user data (Constitution Principle V/II), and serving a stale one from a shared browser cache after a session or account change would be a real correctness/privacy bug, not just a UX one.

**A subtlety this surfaces for future modules**: caching navigation (HTML) responses is safe here specifically *because* this app's pages don't embed personalized data in their server-rendered HTML — the existing convention (established by the smoke-test page, and Route Handler-based API access generally) is that pages are client components that `fetch()` their own data after mount. As long as future modules keep following that pattern (Server Components that don't inline user-specific query results directly into the rendered HTML), a cached navigation response is just generic markup/shell, not stale personal data. If a future module's Server Component were to render user-specific data server-side, offline-cached HTML for that route could show stale personal data — worth a note in this feature's constraints for future authors, not something to solve now (no such Server Component exists yet).

## 5. Cache versioning across deploys (FR-008)

**Decision**: Rely on Serwist's built-in precache manifest (content-hashed asset URLs regenerated every build) plus its default `skipWaiting`/`clientsClaim` activation behavior, so a new deploy's service worker activates and takes over open tabs promptly rather than waiting for every tab to fully close first.

**Rationale**: This is exactly what Workbox-derived tooling is built to handle correctly (it's a well-known, easy-to-get-wrong problem by hand — stale precache references, waiting forever for old service workers to release control). No custom cache-busting logic is needed beyond enabling the standard behavior.

## 6. Testing approach

**Decision**: Automate what Playwright (Chromium) can exercise directly — installability criteria via Lighthouse-style checks are out of scope for this project's existing toolchain, but offline behavior (`browserContext.setOffline(true)`, reload, assert cached shell renders; attempt a write, assert visible failure) is fully testable in Playwright and gets a spec in `packages/e2e`. Manual verification on a real or simulated iOS Safari session and an Android Chrome session (installing to home screen, launching standalone, background/foreground resume) happens per the constitution's own explicit mandate for any change touching the manifest/service worker/caching strategy — this can't be meaningfully automated in this project's current CI (no iOS Safari automation exists here), so it's a manual pre-merge step, not a gap.

**Rationale**: Matches Principle VII's pragmatic-testing stance — automate the deterministic, CI-friendly parts (offline caching, visible-failure behavior), rely on manual verification for the cross-platform install/launch experience the constitution itself already calls out as needing hands-on checking.
