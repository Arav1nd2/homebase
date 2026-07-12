import { expect, test } from "@playwright/test";

test("round-trips a message through the browser, API, and database (US1)", async ({ page }) => {
  const message = `smoke-${Date.now()}`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hombase smoke test" })).toBeVisible();

  await page.getByPlaceholder("Type a message").fill(message);
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByTestId("smoke-record")).toContainText(message);

  await page.reload();
  await expect(page.getByTestId("smoke-record")).toContainText(message);
});
