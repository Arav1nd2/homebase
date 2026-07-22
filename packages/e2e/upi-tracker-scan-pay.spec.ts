import { expect, test } from "@playwright/test";
import { signInAs } from "./auth-helper";

// quickstart.md Scenarios 1-3 (User Story 1). These tests run under the
// default browser context, which has no camera permission granted and no
// fake-media-stream flags — Chromium auto-denies getUserMedia in that
// case (NotAllowedError), which is exactly the FR-022 camera-denied
// fallback path. That makes this file's tests independent of the
// fake-video-device mechanism entirely (research.md §10's point of the
// manual-entry path: it gives the rest of the suite a camera-free way to
// reach the same downstream steps). The camera-scan-specific mechanics
// (a QR that actually decodes) are covered separately in
// upi-tracker-scan-camera.spec.ts and upi-tracker-scan-malformed.spec.ts.

async function goToManualEntry(page: import("@playwright/test").Page) {
  await page.goto("/upi-tracker");
  await expect(page.getByLabel("Payee VPA")).toBeVisible();
}

async function fillManualPayeeAndContinue(
  page: import("@playwright/test").Page,
  vpa: string,
  payeeName = "Local Store",
) {
  await page.getByLabel("Payee VPA").fill(vpa);
  await page.getByLabel("Payee name (optional)").fill(payeeName);
  await page.getByRole("button", { name: "Continue" }).click();
}

test("camera-denied fallback offers manual entry, never a dead end (FR-022)", async ({ page }) => {
  await signInAs(page, "test-upi-camera-denied@example.com");
  await goToManualEntry(page);
  await expect(
    page.getByText(/Camera access is blocked/),
  ).toBeVisible();
});

test("zero or negative amount blocks proceeding until a positive amount is entered (FR-004)", async ({
  page,
}) => {
  await signInAs(page, "test-upi-zero-amount@example.com");
  await goToManualEntry(page);
  await fillManualPayeeAndContinue(page, "merchant@upi");

  await page.getByLabel("Amount").fill("0");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter an amount greater than zero.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay" })).not.toBeVisible();

  await page.getByLabel("Amount").fill("-5");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter an amount greater than zero.")).toBeVisible();

  await page.getByLabel("Amount").fill("10.50");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("button", { name: "Pay" })).toBeVisible();
});

test("no UPI app installed shows a clear message; the pending transaction is preserved (FR-020, SC-004)", async ({
  page,
}) => {
  await signInAs(page, "test-upi-no-app@example.com");
  await goToManualEntry(page);
  await fillManualPayeeAndContinue(page, "merchant@upi");
  await page.getByLabel("Amount").fill("25.00");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Pay" }).click();

  // No real UPI app handler exists in this test browser, so the
  // upi:// redirect silently no-ops and the page never leaves — the
  // exact real-world condition FR-020 names.
  await expect(page.getByText(/No UPI app was found/)).toBeVisible({ timeout: 5_000 });
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to Scan" })).toBeVisible();

  const list = await page.request.get("/api/upi-tracker/transactions?status=pending");
  const body = (await list.json()) as { data: Array<{ payeeVpa: string; status: string }> };
  expect(body.data.some((tx) => tx.payeeVpa === "merchant@upi" && tx.status === "pending")).toBe(true);
});

test("abandoning the confirm prompt resolves to unconfirmed, never lost (FR-010, SC-004)", async ({
  page,
}) => {
  await signInAs(page, "test-upi-abandoned@example.com");
  await goToManualEntry(page);
  await fillManualPayeeAndContinue(page, "abandoned@upi");
  await page.getByLabel("Amount").fill("15.00");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Pay" }).click();

  // Wait until the app has actually reached its post-redirect,
  // awaiting-return state (the POST + redirect attempt is async) before
  // simulating "the user switched to their UPI app and came back" — the
  // return-detection listener only exists once that state is live.
  await expect(page.getByText("Redirecting to your UPI app.")).toBeVisible();
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(page.getByText("Did your payment go through?")).toBeVisible();

  // Navigate away instead of answering — the confirm step's back control.
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Payee VPA")).toBeVisible();

  const list = await page.request.get("/api/upi-tracker/transactions?status=unconfirmed");
  const body = (await list.json()) as { data: Array<{ payeeVpa: string; status: string }> };
  expect(body.data.some((tx) => tx.payeeVpa === "abandoned@upi" && tx.status === "unconfirmed")).toBe(true);
});

test("full manual-entry journey: pay, return, confirm success (US1 happy path)", async ({ page }) => {
  await signInAs(page, "test-upi-scan-pay@example.com");
  await goToManualEntry(page);
  await fillManualPayeeAndContinue(page, "success@upi");
  await page.getByLabel("Amount").fill("45.00");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Pay" }).click();

  await expect(page.getByText("Redirecting to your UPI app.")).toBeVisible();
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(page.getByText("Did your payment go through?")).toBeVisible();
  await page.getByRole("button", { name: "Success" }).click();

  await expect(page.getByLabel("Payee VPA")).toBeVisible();

  const list = await page.request.get("/api/upi-tracker/transactions?status=success");
  const body = (await list.json()) as { data: Array<{ payeeVpa: string; status: string; amountPaise: number }> };
  const created = body.data.find((tx) => tx.payeeVpa === "success@upi");
  expect(created?.status).toBe("success");
  expect(created?.amountPaise).toBe(4500);
});
