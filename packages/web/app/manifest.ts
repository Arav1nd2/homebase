import type { MetadataRoute } from "next";

// Verse Margin tokens (styles/globals.css, light mode) — background_color is
// the splash-screen fill shown before CSS loads; theme_color is the OS
// status-bar/tab-switcher chrome color. Contracts/pwa-manifest.md.
const BACKGROUND_COLOR = "#fcfdfc"; // --neutral-1 / --background
const THEME_COLOR = "#84caa0"; // --accent-9 / --accent-solid

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeBase",
    short_name: "HomeBase",
    description: "Personal life-management app",
    start_url: "/",
    display: "standalone",
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
