import { expect, test } from "@playwright/test";
import { signInAs } from "./auth-helper";

// Own dedicated email — see auth-signin.spec.ts for why (Supabase's 60s
// per-email resend cooldown vs. parallel test workers).
const ALLOWED_EMAIL = "test-signout@example.com";

test("signing out immediately revokes access to the main app on that device (US3, SC-005)", async ({ page }) => {
  await signInAs(page, ALLOWED_EMAIL);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  // Back-navigation must not reveal cached protected content — the
  // middleware re-checks the (now cleared) session on every request.
  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "HomeBase smoke test" })).not.toBeVisible();
});
