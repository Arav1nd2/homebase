import { CacheFirst, ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";
import type { HTTPMethod, PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Runtime caching rules, in priority order (first match wins) — the exact
// order contracts/service-worker-caching.md specifies as the binding
// contract for every future module, not just this feature's own concern.

// 1. FR-009: no Route Handler response is ever cached — this MUST stay
// first so it wins over any broader rule below, for any HTTP method a
// future module's API uses.
const API_METHODS: HTTPMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const networkOnlyApi = new NetworkOnly();
const apiRules: RuntimeCaching[] = API_METHODS.map((method) => ({
  method,
  matcher: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith("/api/"),
  handler: networkOnlyApi,
}));

// 2. FR-006/FR-007: previously loaded screens render offline/on a flaky
// connection — a live response is always preferred when the network
// responds within the short timeout, otherwise the cached shell renders
// instead of hanging indefinitely.
const navigationRule: RuntimeCaching = {
  matcher: ({ request }) => request.mode === "navigate",
  handler: new NetworkFirst({
    cacheName: "navigation",
    networkTimeoutSeconds: 3,
  }),
};

// 3. Fast repeat loads for same-origin static JS/CSS while still picking up
// new deploys promptly (content-hashed filenames make this safe). Bounded
// with an ExpirationPlugin so old-hash entries from previous deploys don't
// accumulate in Cache Storage indefinitely — these are runtime caches, not
// the precache manifest, so Serwist's own precache-cleanup-on-activate
// doesn't touch them.
const staticAssetRule: RuntimeCaching = {
  matcher: ({ sameOrigin, url }) => sameOrigin && (url.pathname.startsWith("/_next/static/") || /\.(?:js|css)$/i.test(url.pathname)),
  handler: new StaleWhileRevalidate({
    cacheName: "static-assets",
    plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: THIRTY_DAYS_IN_SECONDS })],
  }),
};

// 4. Fonts/images rarely change — no need to hit the network once cached.
// Same expiration reasoning as the static-asset rule above.
const fontImageRule: RuntimeCaching = {
  matcher: ({ request }) => request.destination === "font" || request.destination === "image",
  handler: new CacheFirst({
    cacheName: "font-image-assets",
    plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: THIRTY_DAYS_IN_SECONDS })],
  }),
};

const runtimeCaching: RuntimeCaching[] = [...apiRules, navigationRule, staticAssetRule, fontImageRule];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

serwist.addEventListeners();
