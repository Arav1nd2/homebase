import { expect, test } from "@playwright/test";
import { clearInbox, getLatestOtpCodeFor } from "./inbucket";

// Own dedicated email — see auth-signin.spec.ts for why (Supabase's 60s
// per-email resend cooldown vs. parallel test workers).
const ALLOWED_EMAIL = "test-signout@example.com";

test.beforeEach(async () => {
  await clearInbox();
});

test("signing out immediately revokes access to the main app on that device (US3, SC-005)", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(ALLOWED_EMAIL);
  await page.getByRole("button", { name: "Send me a code" }).click();
  const code = await getLatestOtpCodeFor(ALLOWED_EMAIL);
  await page.getByLabel("Enter the code").fill(code);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  // Back-navigation must not reveal cached protected content — the
  // middleware re-checks the (now cleared) session on every request.
  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "HomeBase smoke test" })).not.toBeVisible();
});
