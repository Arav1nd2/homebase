import { expect, request, test } from "@playwright/test";
import { getLatestOtpCodeFor } from "./fake-resend";

// Own dedicated email — see tests/e2e/auth-signin.spec.ts for why
// (Supabase's 60s per-email resend cooldown vs. parallel test workers).
const ALLOWED_EMAIL = "test-smoke@example.com";

// Direct API-level check, independent of the UI: fails with an unambiguous
// "database connection" signal rather than a generic UI assertion failure,
// so a broken DB binding (e.g. the Hyperdrive access bug this test was
// added to catch) is immediately distinguishable from a broken page.
test("the API can actually reach the database (US1)", async ({ baseURL }) => {
  const api = await request.newContext({ baseURL });
  const message = `smoke-api-${Date.now()}`;

  const postRes = await api.post("/api/smoke", { data: { message } });
  expect(postRes.ok(), `POST /api/smoke failed: ${await postRes.text()}`).toBeTruthy();
  const posted = (await postRes.json()) as { data: { id: string; message: string } };
  expect(posted.data.message).toBe(message);

  const getRes = await api.get("/api/smoke");
  expect(getRes.ok(), `GET /api/smoke failed: ${await getRes.text()}`).toBeTruthy();
  const fetched = (await getRes.json()) as { data: { message: string } | null };
  expect(fetched.data?.message).toBe(message);
});

test("round-trips a message through the browser, API, and database (US1)", async ({ page }) => {
  const message = `smoke-${Date.now()}`;

  // This page is now gated behind sign-in (002-email-otp-auth FR-001) —
  // sign in first so the round trip is exercised on the actual protected
  // page, not the login screen it would otherwise land on.
  await page.goto("/login");
  await page.getByLabel("Email address").fill(ALLOWED_EMAIL);
  await page.getByRole("button", { name: "Send me a code" }).click();
  const code = await getLatestOtpCodeFor(ALLOWED_EMAIL);
  await page.getByLabel("Enter the code").fill(code);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "HomeBase smoke test" })).toBeVisible();

  await page.getByPlaceholder("Type a message").fill(message);
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByTestId("smoke-record")).toContainText(message);

  await page.reload();
  await expect(page.getByTestId("smoke-record")).toContainText(message);
});
