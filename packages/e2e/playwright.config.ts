import { defineConfig } from "@playwright/test";
import path from "node:path";

const __dirname = import.meta.dirname;

const PORT = 8787;
const SEND_EMAIL_PORT = 8788;
const FAKE_RESEND_PORT = 9999;

// Always the real Workers runtime (Miniflare via Wrangler), never `next dev`
// — constitution Principle VI, Environment Parity. `webServer` builds and
// starts it, waits until it's ready, and tears it down after the run;
// `reuseExistingServer` lets a `npm run dev` already running locally be
// reused instead of starting a second instance.
//
// Three servers now, since Supabase's Send Email Hook delegates OTP
// delivery entirely to the send-email Worker (Mailpit/Inbucket no longer
// sees anything): the main app, that Worker, and a fake-Resend capture
// server it's configured (via its own .dev.vars RESEND_BASE_URL) to call
// instead of the real Resend API — see
// specs/002-email-otp-auth/research.md §10.
export default defineConfig({
  testDir: ".",
  // upi-camera-spike.spec.ts (T007) is a one-time, already-verified
  // assumption check (research.md §10) — it launches its own bare
  // Chromium instance against a static fixture page, not this app, and
  // has no reason to redo that verification (plus this whole webServer
  // stack's boot cost) on every ordinary test run. Run it directly via
  // `npx playwright test --config=playwright.spike.config.ts` instead.
  testIgnore: "upi-camera-spike.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run build:workers && npm run preview:workers",
      cwd: path.join(__dirname, "../web"),
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `npm run dev -- --port ${SEND_EMAIL_PORT}`,
      cwd: path.join(__dirname, "../send-email"),
      url: `http://localhost:${SEND_EMAIL_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "npx tsx fake-resend-server.ts",
      cwd: __dirname,
      url: `http://localhost:${FAKE_RESEND_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
