import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { mintOtpCodeFor } from "./supabase-admin";

/** Signs in for e2e specs where an authenticated session is just setup,
 *  not the thing under test — every UPI e2e spec needs one first, and
 *  each test must use its own allow-listed email (a shared email across
 *  parallel tests can race on Supabase's per-email resend cooldown).
 *
 *  Mints the OTP directly via Supabase's Admin API (see
 *  supabase-admin.ts) instead of sending a real email and polling the
 *  fake-Resend capture server for it — same real `/api/auth/verify-code`
 *  handler, just without the email hop that flakes under parallel load.
 *  That real pipeline is deliberately still exercised, but only by
 *  auth-signin.spec.ts's dedicated OTP-delivery tests. */
export async function signInAs(page: Page, email: string): Promise<void> {
  const code = await mintOtpCodeFor(email);

  const response = await page.request.post("/api/auth/verify-code", {
    data: { email, code },
  });
  if (!response.ok()) {
    throw new Error(`verify-code failed for ${email}: ${response.status()} ${await response.text()}`);
  }

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
}
