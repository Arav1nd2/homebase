# Contract: Service Worker Caching Strategy

Source: `packages/web/app/sw.ts` (compiled by `@serwist/next` into `public/sw.js`, research.md §1). This is the binding contract every future module MUST keep working with — not just this feature's own concern.

## Precache (build-time)

All static build assets (`_next/static/*`, fonts, the manifest's icon files) are precached automatically via Serwist's injected precache manifest — content-hashed, so a new deploy's changed assets are fetched fresh and stale ones are pruned (research.md §5). No manual list to maintain.

## Runtime caching rules (in priority order)

| Route pattern | Strategy | Rationale |
|---|---|---|
| `/api/.*` | `NetworkOnly` | **MUST come first / take precedence over any broader rule.** No Route Handler response is ever cached (FR-009) — every module's API data stays live-network-only, always. |
| Navigation requests (HTML documents, e.g. `/`, `/login`) | `NetworkFirst` (short network timeout, falls back to cache) | FR-006/FR-007 — previously loaded screens render offline/on a flaky connection; a live network response is always preferred when available. |
| `_next/static/*`, other same-origin JS/CSS | `StaleWhileRevalidate` | Fast repeat loads while still picking up new deploys promptly. |
| Fonts, images | `CacheFirst` | Rarely change; no need to hit the network once cached. |

## Binding constraint for future modules

Because navigation responses are cached, any Next.js Server Component that renders user-specific data directly into a page's server-rendered HTML (rather than fetching it client-side after mount, as every existing page does today) would risk that personal data being served from a stale offline cache to whoever next opens that cached page on that device. Every module built on top of this shell MUST keep fetching personalized data client-side (the existing Route Handler + client `fetch()` convention), not bake it into SSR output, for this caching strategy's safety guarantee (research.md §4) to keep holding. This isn't enforced by tooling — it's a documented convention future feature plans should call out in their own Constitution Check if they'd otherwise break it.

## Explicitly out of scope

No background sync, no push notifications, no offline write queueing (spec Assumptions) — an offline mutation attempt simply reaches the `NetworkOnly` rule above, fails immediately, and surfaces the existing `{ error: { message, code } }` shape through `ErrorState` (FR-010).
