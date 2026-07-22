import { expect, test, type Browser } from "@playwright/test";
import { signInAs } from "./auth-helper";

// Own dedicated email — see auth-signin.spec.ts for why (Supabase's 60s
// per-email resend cooldown vs. parallel test workers).
const ALLOWED_EMAIL = "test-session@example.com";

// Signs in and returns the resulting storage state (cookies), simulating
// "the session this device already has."
async function signInAndCaptureSession(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await signInAs(page, ALLOWED_EMAIL);

  const storageState = await context.storageState();
  await context.close();
  return storageState;
}

// A brand-new BrowserContext with no shared in-memory state carries over
// nothing except the persisted cookie — the closest Playwright-level
// simulation of "the installed PWA was fully closed and reopened later,"
// without needing to restart the underlying server process (session
// validity here is enforced entirely by Supabase Auth + the cookie, not by
// any in-memory state in the Workers preview itself, so restarting that
// process wouldn't exercise anything the cookie-only test above doesn't).
test("a still-valid session reaches the main app with no login prompt after reopening (US2, SC-003)", async ({
  browser,
}) => {
  const storageState = await signInAndCaptureSession(browser);

  const reopenedContext = await browser.newContext({ storageState });
  const reopenedPage = await reopenedContext.newPage();

  await reopenedPage.goto("/");
  await expect(reopenedPage).toHaveURL(/\/$/);
  await expect(reopenedPage.getByRole("heading", { name: "HomeBase smoke test" })).toBeVisible();

  await reopenedContext.close();
});

test("a cleared/invalid session falls back to the login screen, not stale app content", async ({ browser }) => {
  // No storageState at all — equivalent to a session that is no longer valid.
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);

  await context.close();
});
