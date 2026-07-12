import { defineConfig } from "@playwright/test";

// baseURL defaults to `next dev`'s port for local iteration; CI overrides it
// to the OpenNext/Wrangler local Workers preview URL (research.md §2, T025).
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
});
