import { expect, test } from "@playwright/test";
import { signInAs } from "./auth-helper";

// quickstart.md Scenario 4 (User Story 2): seed transactions via the API
// (this feature has no import tool — the API is the fastest, most direct
// way to get realistic data in place), then verify filter/group
// correctness and summary totals through the real History UI.
test("history lists, filters by tag/status, and summarizes per-tag totals correctly (US2)", async ({
  page,
}) => {
  await signInAs(page, "test-upi-history@example.com");

  // Tag names are unique-among-active per user — suffix them so repeated
  // local runs against the same persistent dev database never collide
  // with a prior run's tags under this same test user.
  const suffix = Date.now();
  const groceriesName = `Groceries ${suffix}`;
  const rentName = `Rent ${suffix}`;

  const groceriesRes = await page.request.post("/api/upi-tracker/tags", {
    data: { name: groceriesName, color: "teal" },
  });
  expect(groceriesRes.ok()).toBe(true);
  const { data: groceries } = (await groceriesRes.json()) as { data: { id: string } };
  const rentRes = await page.request.post("/api/upi-tracker/tags", {
    data: { name: rentName, color: "indigo" },
  });
  expect(rentRes.ok()).toBe(true);
  const { data: rent } = (await rentRes.json()) as { data: { id: string } };

  async function seed(payeeVpa: string, amountPaise: number, tagIds: string[], status: string, occurredAt: string) {
    const res = await page.request.post("/api/upi-tracker/transactions", {
      data: { payeeVpa, amountPaise, origin: "manual", tagIds, status, occurredAt },
    });
    expect(res.ok()).toBe(true);
  }

  // VPAs embed the same run-unique suffix so repeated local runs never
  // accumulate colliding rows under this test user.
  const storeA = `store-a-${suffix}@upi`;
  const storeB = `store-b-${suffix}@upi`;
  const storeC = `store-c-${suffix}@upi`;
  const landlord = `landlord-${suffix}@upi`;

  await seed(storeA, 2000, [groceries.id], "success", "2026-07-01T10:00:00.000Z");
  await seed(storeB, 3000, [groceries.id], "success", "2026-07-05T10:00:00.000Z");
  await seed(landlord, 50000, [rent.id], "success", "2026-07-01T09:00:00.000Z");
  await seed(storeC, 1500, [groceries.id, rent.id], "unconfirmed", "2026-07-10T09:00:00.000Z");

  await page.goto("/upi-tracker/history");

  await expect(page.getByText(storeA)).toBeVisible();
  await expect(page.getByText(landlord)).toBeVisible();

  // Filter by tag — only Groceries-tagged transactions remain, and the
  // subtotal counts store-c's full amount too (FR-014, no splitting).
  await page.getByLabel("By tag").selectOption({ label: groceriesName });
  await expect(page.getByText(storeA)).toBeVisible();
  await expect(page.getByText(storeC)).toBeVisible();
  await expect(page.getByText(landlord)).not.toBeVisible();
  const groceriesSubtotalRow = page.locator(
    `xpath=//span[normalize-space()='Subtotal — ${groceriesName}']/..`,
  );
  await expect(groceriesSubtotalRow).toBeVisible();
  await expect(groceriesSubtotalRow).toContainText("₹65.00");

  // Reset the tag filter, filter by status instead.
  await page.getByLabel("By tag").selectOption({ label: "All" });
  await page.getByLabel("By status").selectOption("unconfirmed");
  await expect(page.getByText(storeC)).toBeVisible();
  await expect(page.getByText(storeA)).not.toBeVisible();

  // Reset status, filter by date range excluding the 07-10 transaction.
  await page.getByLabel("By status").selectOption("");
  await page.getByLabel("From", { exact: true }).fill("2026-07-01");
  await page.getByLabel("To", { exact: true }).fill("2026-07-06");
  await expect(page.getByText(storeA)).toBeVisible();
  await expect(page.getByText(storeB)).toBeVisible();
  await expect(page.getByText(storeC)).not.toBeVisible();
});
