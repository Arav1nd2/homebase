# Implementation Plan: PWA Installability

**Branch**: `feat/pwa-installability` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-pwa-installability/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Close the constitution's Principle IV gap — the app currently has no `manifest`, no service worker, and no `public/` directory at all. Add Next.js's native `app/manifest.ts` metadata route plus a Serwist-generated service worker (`app/sw.ts` → `public/sw.js`) that precaches the static build and applies a runtime caching strategy explicitly excluding `/api/*` from any cache (NetworkOnly), so the app installs on iOS Safari and Android Chrome, previously loaded screens keep rendering offline/on a flaky connection, and offline writes fail visibly rather than silently. This is pure shell/kernel infrastructure — no new database table, no new Route Handler, no domain logic — split out as its own feature (rather than bundled into 005-upi-payment-tracker) so the two ship and review independently, per the requester's explicit decision.

## Technical Context

**Language/Version**: TypeScript 5.7, `strict` mode (existing `packages/web/tsconfig.json`) — Constitution Principle I.

**Primary Dependencies**:
- `serwist` + `@serwist/next` — **new dependency**, replacing the constitution's previously-named `next-pwa` (research.md §1; constitution amendment 3.3.0 → 3.4.0). Wraps `next.config.ts` (`withSerwist`) and compiles `app/sw.ts` into `public/sw.js` at build time.
- Next.js's built-in `app/manifest.ts` metadata route (research.md §2) — no new dependency, a framework feature already available in the installed Next.js 15.
- No new runtime dependency for icon generation — icons are produced as static PNG assets (research.md §3), not generated at request time.

**Storage**: N/A — no database change, no new table, no new Route Handler.

**Testing**: Playwright (`packages/e2e`) — new spec covering offline shell rendering, offline write failure, and confirming `/api/*` isn't served from cache (quickstart.md §2–4). Manual verification on a real/simulated iOS Safari session and an Android Chrome session for install/standalone-launch behavior (quickstart.md §1), per the constitution's explicit mandate for any manifest/service-worker/caching change — not automatable in this project's current CI.

**Target Platform**: Cloudflare Workers via OpenNext (`packages/web`, Worker `hombase`) — unchanged, Constitution Principle VI. `public/sw.js` and the manifest route are both static-asset/build output already covered by the existing `ASSETS` binding in `wrangler.jsonc`; no new binding needed.

**Project Type**: Web application — single Next.js App Router project, existing `packages/web`. No new package.

**Performance Goals**: None newly introduced beyond the constitution's own reliability bar (offline shell render, per SC-002, within 2 seconds).

**Constraints**:
- Mobile-first, phone viewport first (Principle III) — inherited, no new screen introduced.
- The service worker MUST NOT cache `/api/*` responses (FR-009) — see contracts/service-worker-caching.md for the exact rule ordering, since Serwist's default recommended runtime-caching rules would otherwise cache same-origin GET API calls.
- Every future module MUST keep fetching personalized data client-side (the existing convention) rather than baking it into server-rendered HTML, for the navigation-caching strategy's safety guarantee to keep holding (research.md §4; contracts/service-worker-caching.md's binding constraint) — this plan documents that constraint for future feature plans to inherit, it does not change any existing page.
- No new abstraction: this is shell-level work like 003-ui-shell-foundation, not a domain module — no `domains/` folder is introduced here either.

**Scale/Scope**: One new Next.js metadata route (`app/manifest.ts`), one new service worker source file (`app/sw.ts`) plus its generated `public/sw.js`, a small set of new static icon assets, a `next.config.ts` wrapper, one new e2e spec. No existing route, component, or Route Handler is modified.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Strict TypeScript Everywhere | PASS | `app/manifest.ts` is typed via Next.js's own `MetadataRoute.Manifest`; `app/sw.ts` is typed via `@serwist/next`'s provided types (`serwist/window` / `@serwist/next/typings`, per research.md §1's setup). No `any`. |
| II. Consistent Drizzle Schema Conventions | N/A | No database access in this feature. |
| III. Mobile-First, Responsive by Default | PASS | No new screen; existing mobile-first screens are what's being made installable/offline-resilient. |
| IV. Installable, Reliable PWA on iOS Safari and Android Chrome | **PASS (this feature closes the gap)** | This is the feature 003-ui-shell-foundation's Complexity Tracking named as the one that "MUST close this gap first or alongside it" and that 004-auth-shell-migration explicitly deferred (not being that trigger feature). Service worker tooling is Serwist rather than the literally-named `next-pwa`, recorded as a constitution amendment per the principle's own pre-authorized swap clause (research.md §1). |
| V. Consistent Route Handler API Conventions | N/A | No Route Handler added, removed, or changed. |
| VI. Cloudflare Workers Runtime Constraints | PASS | Both the manifest route and the service worker are static/build-time artifacts served via the existing `ASSETS` binding — no new binding, no Node-only API, no risk to the Worker's own server-side bundle size (the service worker ships to the browser only). |
| VII. Pragmatic Testing | PASS | The genuinely novel, hard-to-get-right integration risk (offline caching behavior, visible-failure-on-offline-write) gets Playwright coverage; the cross-platform install/launch experience gets the constitution's own mandated manual verification, matching Principle VII's "automate what's deterministic, don't force-automate the rest" stance. |
| VIII. Simplicity Over Premature Abstraction | PASS | One library (Serwist) added only because Principle IV requires a service worker and no framework-native alternative exists; no background-sync/push-notification/offline-write-queue infrastructure is built since nothing in the spec asks for it (spec Assumptions). No `domains/` folder introduced — this is shell/kernel work, same category as 003-ui-shell-foundation. |

**Additional Constraints check**: Single deployment target — preserved (no new service, no new Worker). Auth/storage stay managed — untouched; note the offline-caching/middleware interaction documented in research.md §4 is an intentional, reasoned consequence of caching previously-authenticated navigations for the *same device*, not a new access grant. Module isolation — N/A (no domains touched). Accessibility baseline — N/A (no new UI surface; the install prompt/add-to-home-screen UI is the browser's own).

*Post-Phase-1 re-check: unchanged — Phase 0/1 design resolved Principle IV as PASS via the recorded amendment and didn't introduce any new gate.*

## Project Structure

### Documentation (this feature)

```text
specs/006-pwa-installability/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Not generated — no data entities in this feature (N/A)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
│   ├── pwa-manifest.md
│   └── service-worker-caching.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/web/
├── app/
│   ├── manifest.ts              # NEW — Next.js native manifest route
│   │                              #   (contracts/pwa-manifest.md, FR-001)
│   ├── sw.ts                     # NEW — Serwist service worker source,
│   │                              #   compiled to public/sw.js at build time
│   │                              #   (contracts/service-worker-caching.md,
│   │                              #   FR-005–FR-009)
│   └── layout.tsx                 # MODIFIED — add `apple-touch-icon` link
│                                  #   via the `icons` metadata field (iOS
│                                  #   Safari doesn't read the manifest's
│                                  #   icons array for Add to Home Screen —
│                                  #   research.md §3 / contracts/pwa-manifest.md)
│
├── public/                        # NEW directory — didn't exist before
│   ├── icon-192.png               # NEW
│   ├── icon-512.png                # NEW
│   ├── icon-512-maskable.png        # NEW
│   └── apple-touch-icon.png          # NEW (180×180)
│
├── next.config.ts                  # MODIFIED — wrap existing config with
│                                  #   `withSerwist` (research.md §1)
│
└── package.json                    # + serwist, @serwist/next

packages/web/tsconfig.json           # MODIFIED — add `@serwist/next/typings`
                                     # and `webworker` lib, per Serwist's
                                     # documented setup (research.md §1)

packages/e2e/
└── pwa-offline.spec.ts               # NEW — offline shell render, offline
                                     #   write failure, /api/* not served
                                     #   from cache (quickstart.md §2–4)
```

**Structure Decision**: Everything stays inside the existing single Next.js App Router project (`packages/web`) — no new package, no `domains/` folder (this is shell infrastructure, not a domain module, same category as 003-ui-shell-foundation). This is the first feature to create a `public/` directory in this repo.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations. The one item that might otherwise appear here — the `next-pwa` → Serwist tool swap — is resolved via the constitution's own pre-authorized amendment path (Principle IV's text), not a Complexity Tracking justification; see Constitution Check above and research.md §1.*
