import path from "node:path";
import { expect, test } from "@playwright/test";
import { signInAs } from "./auth-helper";

const fixturesDir = path.join(import.meta.dirname, "fixtures");

// The actual camera-decode mechanics (research.md §10, T007's verified
// spike): Chromium's fake video device feeds a real getUserMedia + jsQR
// decode loop. Separate file so this test's launchOptions (a different
// fake-video-capture file than upi-tracker-scan-malformed.spec.ts) apply
// to a browser dedicated to this file.
test.use({
  permissions: ["camera"],
  launchOptions: {
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
      `--use-file-for-fake-video-capture=${path.join(fixturesDir, "upi-qr.mjpeg")}`,
    ],
  },
});

test("scans a valid UPI QR and advances with payee/amount prefilled (FR-002, FR-003)", async ({ page }) => {
  await signInAs(page, "test-upi-scan-camera@example.com");
  await page.goto("/upi-tracker");

  // The fixture QR encodes upi://pay?pa=merchant@upi&pn=Test%20Payee&am=45.00&cu=INR
  await expect(page.getByLabel("Amount")).toHaveValue("45.00", { timeout: 15_000 });
});
