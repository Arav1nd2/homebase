import { defineConfig } from "@playwright/test";

// T007's camera-decode spike (research.md §10) deliberately runs against
// a minimal static fixture page, not the full Next.js/Workers app — no
// `webServer` needed here, unlike playwright.config.ts's three-server
// setup for the real feature specs.
export default defineConfig({
  testDir: ".",
  testMatch: "upi-camera-spike.spec.ts",
  fullyParallel: false,
});
