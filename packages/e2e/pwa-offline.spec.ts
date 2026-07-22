import { expect, test, type Page } from "@playwright/test";
import { signInAs } from "./auth-helper";

// Own dedicated emails per test — see auth-signin.spec.ts for why
// (Supabase's 60s per-email resend cooldown vs. parallel test workers).
const OFFLINE_EMAIL = "test-pwa-offline@example.com";
const FLAKY_EMAIL = "test-pwa-flaky@example.com";
const WRITE_EMAIL = "test-pwa-write@example.com";
const NO_SW_EMAIL = "test-pwa-no-sw@example.com";

async function signIn(page: Page, email: string) {
  await signInAs(page, email);
  await expect(page.getByRole("heading", { name: "HomeBase smoke test" })).toBeVisible();
}

// Serwist's `clientsClaim` takes control of already-open pages as soon as
// the service worker activates, but the *current* page load was itself
// fetched before any service worker existed — it never went through the
// SW's own fetch handler. One more online reload, after the SW is active
// and controlling, is what actually exercises the runtime `NetworkFirst`/
// `StaleWhileRevalidate` rules and populates their caches
// (contracts/service-worker-caching.md) — this is the Playwright-level
// equivalent of "the app has been opened at least once while online"
// (spec Acceptance Scenarios).
async function primeServiceWorkerCache(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole("heading", { name: "HomeBase smoke test" })).toBeVisible();
}

test("a previously loaded screen renders when fully offline, instead of a blank page or browser error (US2, SC-002)", async ({
  page,
  context,
}) => {
  await signIn(page, OFFLINE_EMAIL);
  await primeServiceWorkerCache(page);

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole("heading", { name: "HomeBase smoke test" })).toBeVisible();
  // FR-009: /api/* is NetworkOnly, never cached — the data section falls
  // back to its own existing error state instead of showing stale JSON.
  await expect(page.getByText(/could not load the smoke-test record/i)).toBeVisible();

  await context.setOffline(false);
});

test("a previously loaded screen renders on a severely degraded connection without hanging indefinitely (US2, FR-007)", async ({
  page,
  context,
}) => {
  await signIn(page, FLAKY_EMAIL);
  await primeServiceWorkerCache(page);

  // Simulate "severely degraded/flaky" by delaying the navigation response
  // well past the service worker's `networkTimeoutSeconds: 3` — NetworkFirst
  // is expected to give up waiting and fall back to the cached shell rather
  // than hang for the full delay.
  await context.route("**/*", async (route) => {
    if (route.request().isNavigationRequest()) {
      await new Promise((resolve) => setTimeout(resolve, 8_000));
    }
    await route.continue();
  });

  const start = Date.now();
  await page.reload();
  await expect(page.getByRole("heading", { name: "HomeBase smoke test" })).toBeVisible({ timeout: 6_000 });
  const elapsedMs = Date.now() - start;

  await context.unroute("**/*");

  expect(elapsedMs, "shell should render from the cache fallback, not wait out the full slow response").toBeLessThan(6_000);
});

test("an offline write attempt fails visibly with no infinite spinner and no false success (US3, SC-003)", async ({
  page,
  context,
}) => {
  await signIn(page, WRITE_EMAIL);
  await primeServiceWorkerCache(page);

  // Establish a known baseline record while still online. `/api/smoke`'s
  // GET returns the single globally-latest record, not one scoped to this
  // user (see app/api/smoke/route.ts) — so asserting "the record doesn't
  // contain the offline message" isn't reliable on its own: on a freshly
  // reset CI database, with fullyParallel tests, no record may exist yet
  // at all, and Playwright's negated `.not.toContainText()` treats "no
  // matching element" as a failure rather than a vacuous pass. Writing a
  // known baseline first makes the assertion below self-contained.
  const baselineMessage = `baseline-${Date.now()}`;
  await page.getByPlaceholder("Type a message").fill(baselineMessage);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("smoke-record")).toContainText(baselineMessage);

  await context.setOffline(true);

  const offlineMessage = `offline-write-${Date.now()}`;
  await page.getByPlaceholder("Type a message").fill(offlineMessage);
  await page.getByRole("button", { name: "Save" }).click();

  // Next.js's own route announcer also carries `role="alert"`, so scope to
  // the actual error text rather than the bare role.
  await expect(page.getByText(/could not save the smoke-test record/i)).toBeVisible({ timeout: 5_000 });

  // No false success confirmation and no button left stuck in a "Saving…"
  // state — the record shown is still the baseline, not the offline attempt.
  await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
  await expect(page.getByTestId("smoke-record")).toContainText(baselineMessage);

  await context.setOffline(false);
});

test.describe("graceful degradation without a service worker (FR-011)", () => {
  test.use({ serviceWorkers: "block" });

  test("sign-in and the smoke-test round trip still work normally with no service worker registered", async ({
    page,
  }) => {
    await signIn(page, NO_SW_EMAIL);

    const message = `no-sw-${Date.now()}`;
    await page.getByPlaceholder("Type a message").fill(message);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("smoke-record")).toContainText(message);
  });
});
