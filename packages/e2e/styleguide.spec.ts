import { expect, test } from "@playwright/test";

// /styleguide is deliberately exempt from sign-in (middleware.ts) — it's a
// kernel/dev-facing example screen with no real user data, not a product
// page, so this test doesn't need the auth flow the other e2e specs do.
test("the shell's example screen renders with no nav bar or search (US3)", async ({ page }) => {
  await page.goto("/styleguide");

  await expect(page.getByRole("heading", { level: 1, name: "Styleguide" })).toBeVisible();
  await expect(page.getByRole("link", { name: "HomeBase" })).toHaveAttribute("href", "/");

  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByText("Nothing here yet. This space is waiting, not broken.")).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "That didn't save" })).toBeVisible();

  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByRole("search")).toHaveCount(0);
});

test("the ?theme= override forces dark mode for verification (FR-015)", async ({ page }) => {
  await page.goto("/styleguide?theme=dark");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("heading", { level: 1, name: "Styleguide" })).toBeVisible();
});
