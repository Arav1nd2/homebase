import { expect, test } from "@playwright/test";
import { signInAs } from "./upi-auth-helper";

// quickstart.md Scenario 6 (User Story 4).
test("renaming a tag propagates live to its transactions; deleting excludes it from selection but preserves history (US4)", async ({
  page,
}) => {
  const suffix = Date.now();
  const tagName = `Temp Tag ${suffix}`;
  const renamedName = `Household ${suffix}`;

  await signInAs(page, "test-upi-tags@example.com");

  const tagRes = await page.request.post("/api/upi-tracker/tags", { data: { name: tagName, color: "teal" } });
  const { data: tag } = (await tagRes.json()) as { data: { id: string } };
  const txRes = await page.request.post("/api/upi-tracker/transactions", {
    data: {
      payeeVpa: `tagged-${suffix}@upi`,
      amountPaise: 500,
      origin: "manual",
      status: "success",
      occurredAt: "2026-07-01T10:00:00.000Z",
      tagIds: [tag.id],
    },
  });
  expect(txRes.ok()).toBe(true);

  await page.goto("/upi-tracker/tags");
  const tagRow = page.getByRole("listitem").filter({ hasText: tagName });
  await tagRow.getByRole("button", { name: "Rename" }).click();
  await tagRow.getByLabel("Rename tag").fill(renamedName);
  await tagRow.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: renamedName })).toBeVisible();

  // Propagates immediately to the transaction that already carries it.
  await page.goto("/upi-tracker/history");
  await expect(page.getByRole("listitem").filter({ hasText: renamedName })).toBeVisible();

  // Delete it — inline two-option confirm, not a modal.
  await page.goto("/upi-tracker/tags");
  const renamedRow = page.getByRole("listitem").filter({ hasText: renamedName });
  await renamedRow.getByRole("button", { name: "Delete" }).click();
  await renamedRow.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: renamedName })).not.toBeVisible();

  // Historical transaction keeps the tag's last label — never blank.
  await page.goto("/upi-tracker/history");
  await expect(page.getByRole("listitem").filter({ hasText: renamedName })).toBeVisible();

  // No longer a selectable option for new tagging.
  await page.goto("/upi-tracker/new");
  await expect(page.getByRole("button", { name: renamedName })).not.toBeVisible();
});
