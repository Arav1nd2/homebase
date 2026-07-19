import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // tsconfig.json's "jsx": "preserve" is a Next.js/SWC-specific setting;
  // esbuild (Vitest's transform) doesn't understand it and falls back to
  // the classic runtime (requiring React in scope) without this override.
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
    // Component tests (rendering shared UI, checking computed styles) need
    // a DOM; everything else stays on the lighter "node" environment
    // unchanged, so this doesn't alter existing non-component test behavior.
    environmentMatchGlobs: [["tests/unit/**/*.test.tsx", "jsdom"]],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/unit/setup-dom.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
