# Contract: Web App Manifest

Source: `packages/web/app/manifest.ts` (Next.js native metadata route — research.md §2), served at `/manifest.webmanifest`, auto-linked by Next.js into every page's `<head>`.

## Required fields (FR-001)

| Field | Value | Why |
|---|---|---|
| `name` | `"HomeBase"` | Full name, matches `app/layout.tsx`'s existing `metadata.title`. |
| `short_name` | `"HomeBase"` | Home-screen label; short enough not to truncate on either platform. |
| `description` | `"Personal life-management app"` | Matches existing `metadata.description`. |
| `start_url` | `"/"` | Opens to the existing protected root, which itself redirects to `/login` when signed out (middleware, unchanged). |
| `display` | `"standalone"` | FR-004 — no browser chrome. |
| `background_color` | Verse Margin's base background token (light mode value, `DESIGN.md`) | Shown as the splash-screen background before CSS loads. |
| `theme_color` | Verse Margin's accent/theme token (`DESIGN.md`) | Matches the existing `next-themes`-driven theme color; the OS status bar/tab-switcher chrome color. |
| `icons` | See below | FR-001. |

## Icons (research.md §3)

| Purpose | Sizes | Format |
|---|---|---|
| Standard | 192×192, 512×512 | PNG |
| Maskable (Android adaptive icon safe zone) | 512×512 | PNG, `"purpose": "maskable"` |
| Apple touch icon | 180×180 | PNG, referenced separately via `app/layout.tsx`'s `icons` metadata field (iOS Safari does not read the manifest's `icons` array for "Add to Home Screen" — it needs the `apple-touch-icon` link explicitly) |

## Non-goals

No `shortcuts`, `share_target`, `protocol_handlers`, or other advanced manifest members — none are required by any current screen (Principle VIII: no speculative capability surface).
