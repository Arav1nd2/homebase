import { defineConfig } from "@playwright/test";

const PORT = 8787;

// Always the real Workers runtime (Miniflare via Wrangler), never `next dev`
// — constitution Principle VI, Environment Parity. `webServer` builds and
// starts it, waits until it's ready, and tears it down after the run;
// `reuseExistingServer` lets a `npm run dev` already running locally be
// reused instead of starting a second instance.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build:workers && npm run preview:workers",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
