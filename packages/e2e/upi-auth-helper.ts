import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { getLatestOtpCodeFor } from "./fake-resend";

/** Signs in through the real OTP flow (packages/e2e/auth-signin.spec.ts's
 *  own pattern) — every UPI e2e spec needs an authenticated session
 *  first, and each test must use its own allow-listed email (a shared
 *  email across parallel tests can race on Supabase's per-email resend
 *  cooldown). */
export async function signInAs(page: Page, email: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send me a code" }).click();

  const code = await getLatestOtpCodeFor(email);
  await page.getByLabel("Enter the code").fill(code);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/$/);
}
