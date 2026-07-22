import { createReadStream } from "node:fs";
import { createRequire } from "node:module";
import http from "node:http";
import path from "node:path";
import { chromium, expect, test } from "@playwright/test";

// T007 (tasks.md): "verify Playwright's fake-camera mechanism works in
// this project before building the rest of the story on it." This spec
// launches its own Chromium instance directly (not through this file's
// `test` fixture's default context) so it can pass
// --use-fake-device-for-media-stream / --use-file-for-fake-video-capture
// at launch time — Playwright's `launchOptions.args` only takes effect
// for a fresh browser process, and this needs to be independently
// re-runnable without the rest of the suite's shared browser.
//
// It exercises getUserMedia + jsQR against a minimal static fixture page
// (fixtures/camera-spike.html), not the full Next.js app — the point is
// to prove the *mechanism* (fake video device -> real decode) works in
// this project's Chromium build, isolated from anything the app itself
// could get wrong. research.md §10 / §1.
const __dirname = import.meta.dirname;
const fixturesDir = path.join(__dirname, "fixtures");
const require = createRequire(import.meta.url);
const jsQrPath = require.resolve("jsqr/dist/jsQR.js");

function serveFixtures(): Promise<{ url: string; close: () => Promise<void> }> {
  const server = http.createServer((req, res) => {
    const requestPath = (req.url ?? "/").split("?")[0];
    if (requestPath === "/jsQR.js") {
      res.setHeader("Content-Type", "application/javascript");
      createReadStream(jsQrPath).pipe(res);
      return;
    }
    if (requestPath === "/" || requestPath === "/camera-spike.html") {
      res.setHeader("Content-Type", "text/html");
      createReadStream(path.join(fixturesDir, "camera-spike.html")).pipe(res);
      return;
    }
    res.statusCode = 404;
    res.end("not found");
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        url: `http://127.0.0.1:${port}/camera-spike.html`,
        close: () => new Promise((res) => server.close(() => res())),
      });
    });
  });
}

test("fake video device feeds a real getUserMedia + jsQR decode (spike)", async () => {
  const fixture = await serveFixtures();
  const browser = await chromium.launch({
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
      `--use-file-for-fake-video-capture=${path.join(fixturesDir, "upi-qr.mjpeg")}`,
    ],
  });

  try {
    const context = await browser.newContext({ permissions: ["camera"] });
    const page = await context.newPage();
    await page.goto(fixture.url);

    await expect(page.locator("#status")).toHaveText("decoded", { timeout: 15_000 });
    await expect(page.locator("#result")).toHaveText(
      "upi://pay?pa=merchant@upi&pn=Test%20Payee&am=45.00&cu=INR",
    );
  } finally {
    await browser.close();
    await fixture.close();
  }
});
