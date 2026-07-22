import { expect, test } from "@playwright/test";
import { signInAs } from "./auth-helper";
import { getLatestOtpCodeFor } from "./fake-resend";

// Allow-listed in .dev.vars (ALLOWED_EMAILS) for local/CI runs. Each
// test that triggers a real sign-in uses its own email — Supabase's
// per-email resend cooldown (auth.email.max_frequency, 60s) means two
// parallel tests sharing one email can silently suppress the second
// signInWithOtp call.
const ALLOWED_EMAIL = "test-signin@example.com";
const RELOGIN_EMAIL = "test-relogin@example.com";
const NOT_ALLOWED_EMAIL = "not-allowed@example.com";

test("signed-out visitor is sent to /login instead of the main page (FR-001)", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

// This test and the disallowed-email one below are the only two in the
// whole e2e suite that go through the real send-email-hook Worker +
// Resend/fake-capture pipeline (via getLatestOtpCodeFor) — they're the
// ones actually testing OTP delivery (and its FR-003/FR-014 non-delivery
// counterpart). Every other spec signs in as setup only, via
// auth-helper.ts's signInAs, which mints the code directly through
// Supabase's Admin API and skips the email hop entirely.
test("sign in with an allowed email's emailed code reaches the main app (US1)", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email address").fill(ALLOWED_EMAIL);
  await page.getByRole("button", { name: "Send me a code" }).click();

  await expect(page.getByText(`We sent a 6-digit code to ${ALLOWED_EMAIL}`)).toBeVisible();

  const code = await getLatestOtpCodeFor(ALLOWED_EMAIL);
  await page.getByLabel("Enter the code").fill(code);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "HomeBase smoke test" })).toBeVisible();
});

test("a disallowed email produces the identical UI outcome and sends no email (FR-003, FR-014)", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Email address").fill(NOT_ALLOWED_EMAIL);
  await page.getByRole("button", { name: "Send me a code" }).click();

  // Same next-step UI as the allowed-email case — no visible signal that
  // this email isn't recognized.
  await expect(page.getByText(`We sent a 6-digit code to ${NOT_ALLOWED_EMAIL}`)).toBeVisible();

  await expect(async () => {
    await expect(getLatestOtpCodeFor(NOT_ALLOWED_EMAIL, 1_000)).rejects.toThrow();
  }).toPass();
});

test("already-signed-in visitor hitting /login is redirected to the main app (FR-013)", async ({ page }) => {
  await signInAs(page, RELOGIN_EMAIL);

  await page.goto("/login");
  await expect(page).toHaveURL(/\/$/);
});
