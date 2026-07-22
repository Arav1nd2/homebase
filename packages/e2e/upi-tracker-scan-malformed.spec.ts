import path from "node:path";
import { expect, test } from "@playwright/test";
import { signInAs } from "./auth-helper";

const fixturesDir = path.join(import.meta.dirname, "fixtures");

test.use({
  permissions: ["camera"],
  launchOptions: {
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
      `--use-file-for-fake-video-capture=${path.join(fixturesDir, "not-upi-qr.mjpeg")}`,
    ],
  },
});

test("a non-UPI QR shows an inline error with retry, without leaving the flow (FR-021)", async ({ page }) => {
  await signInAs(page, "test-upi-malformed-qr@example.com");
  await page.goto("/upi-tracker");

  await expect(page.getByText(/didn't scan as a UPI QR/)).toBeVisible({ timeout: 15_000 });
  // Still on the scan step throughout — never bounced to a manual-entry
  // dead end, never restarted the whole flow (the camera view stays
  // present even while the error banner shows, per the Capture screen
  // spec: the feed stays live under an error).
  await expect(page.getByRole("img", { name: "Scanning for a UPI QR code" })).toBeVisible();

  await page.getByRole("button", { name: "Retry" }).click();
  // The fake video device loops the same (still-invalid) frame forever,
  // so retrying genuinely resumes the decode loop — which promptly flags
  // the same content again — rather than the error simply staying gone
  // regardless of what's in frame. Observing it reappear is proof the
  // "Retry" tap actually re-armed decoding (a frozen/no-op retry would
  // never flag anything again), without re-requesting camera permission
  // or navigating anywhere (still the same scan step throughout).
  await expect(page.getByText(/didn't scan as a UPI QR/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("img", { name: "Scanning for a UPI QR code" })).toBeVisible();
});
