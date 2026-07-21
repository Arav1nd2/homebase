import { expect, test } from "@playwright/test";
import { signInAs } from "./upi-auth-helper";

// quickstart.md Scenario 5 (User Story 3). VPAs embed a run-unique suffix
// so repeated local runs against the same persistent dev database never
// collide with a prior run's rows under the same test user.
test("editing a transaction's status persists; a manual backfill appears identically to a scanned one (US3)", async ({
  page,
}) => {
  const suffix = Date.now();
  const editVpa = `edit-me-${suffix}@upi`;
  const backfillVpa = `backfilled-${suffix}@upi`;
  const backfillPayeeName = `Backfilled Store ${suffix}`;

  await signInAs(page, "test-upi-edit-backfill@example.com");

  const created = await page.request.post("/api/upi-tracker/transactions", {
    data: {
      payeeVpa: editVpa,
      amountPaise: 1200,
      origin: "manual",
      status: "success",
      occurredAt: "2026-07-01T10:00:00.000Z",
    },
  });
  expect(created.ok()).toBe(true);

  await page.goto("/upi-tracker/history");
  const editRow = page.getByRole("listitem").filter({ hasText: editVpa });
  await expect(editRow).toBeVisible();
  await expect(editRow.getByText("Success")).toBeVisible();

  await editRow.getByRole("button", { name: "Edit" }).click();
  await editRow.getByRole("button", { name: "failed", exact: true }).click();
  await editRow.getByRole("button", { name: "Save" }).click();

  await expect(editRow.getByText("Failed")).toBeVisible();

  // Add a manual backfill transaction via the dedicated /new entry point.
  await page.getByRole("link", { name: "+ Add manually" }).click();
  await expect(page).toHaveURL(/\/upi-tracker\/new$/);

  await page.getByLabel("Payee name").fill(backfillPayeeName);
  await page.getByLabel("Payee VPA").fill(backfillVpa);
  await page.getByLabel("Amount").fill("99.00");
  await page.getByLabel("Date").fill("2026-06-15");
  await page.getByRole("button", { name: "unconfirmed", exact: true }).click();
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page).toHaveURL(/\/upi-tracker\/history$/);
  const backfillRow = page.getByRole("listitem").filter({ hasText: backfillPayeeName });
  await expect(backfillRow).toBeVisible();
  await expect(backfillRow.getByText("Unconfirmed")).toBeVisible();
  // Same row structure as any scanned/live transaction — payee, amount,
  // status cue, and an Edit affordance all present (FR-016).
  await expect(backfillRow.getByText("₹99.00")).toBeVisible();
  await expect(backfillRow.getByRole("button", { name: "Edit" })).toBeVisible();
});
