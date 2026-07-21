# Design Reference: UPI Payment Tracker

**Source feature**: [spec.md](./spec.md)
**Design system state**: **Locked, and this feature is now designed within it.** The `.design-foundations/plans/2026-07-20-upi-shell-nav.md` design plan (all 6 phases) has been built and committed (2026-07-20/21) — `DESIGN.md` and `JOURNEY.md` both now carry complete UPI content, closing every gap this file previously flagged as open. Regenerate this file again if `DESIGN.md`, `JOURNEY.md`, or `design/VOICE.md` change further.

## Matched page spec

**Four complete entries**, added to `JOURNEY.md`'s `## Page specs` section:

- **"UPI (main flow)"** — `JOURNEY.md:553-586`. Route `app/(app)/upi-tracker/page.tsx`, one route, a client-side step machine with 5 named steps (Scan/Amount/Tag/Pay/Confirm), each with all four states (empty/loading/error/success) named explicitly.
- **"UPI — History"** — `JOURNEY.md:587-611`. Route `/upi-tracker/history`.
- **"UPI — Add manually"** — `JOURNEY.md:613-634`. Route `/upi-tracker/new`.
- **"UPI — Tags"** — `JOURNEY.md:636-658`. Route `/upi-tracker/tags`.

Plus supporting sections this feature specifically added: the **Job story** (`JOURNEY.md:121-134`, Moesta four forces), the **Navigation model — UPI's 3-level exception** amendment (`JOURNEY.md:186-204` — UPI is the first HomeBase tool with internal sub-navigation beyond the hub→spoke 2-level rule), and the branching **"Scan, tag, and pay (UPI)"** user flow (`JOURNEY.md:337-358`).

**Canonical name resolved: "UPI"** — not "UPI Payment Tracker" (that's `spec.md`'s feature title, not the UI label). This closes this file's original gap #1: the working title broke JOURNEY.md's noun-phrase naming convention; "UPI" is what the `ToolCard` entry and every page spec actually use.

## Tokens & components in play

All in `DESIGN.md`, additive to the locked Phase 4-7 token set — no locked value changed:

- **`ToolCard` entry for UPI** (`DESIGN.md:935`): `{ id: "upi-tracker", label: "UPI", mark: "₹", route: "/upi-tracker", toolType: "ledger", badge: { kind: "count", unit: "tracked" }, pinned: false }`. `toolType: "ledger"` — UPI's history adapts the existing Ledger family rather than a new 5th dense-frame family. **Open flag from DESIGN.md itself:** the `₹` glyph's coverage in Newsreader Display is assumed from general Unicode range, not yet visually confirmed — flagged for a render-time check.
- **Icon usage — standing system rule** (`DESIGN.md:941-954`): licenses `lucide-react` (already a dependency) for exactly 4 controls with no prior typographic answer — theme toggle, back chevron, camera controls, transaction-status glyph. Does not reopen any existing typographic mark or glyph (ToolCard marks, checklist checkmarks, etc.).
- **Shell chrome — PageHeader** (`DESIGN.md:956-981`): the shared `PageHeader` (`packages/web/components/shared/page-header.tsx`) gets one `back` contract with 4 values — `{mode:"hub"}` (default, unchanged for the other 6 tools), `{mode:"step", onBack}` (UPI's mid-flow steps), `{mode:"parent", href, label}` (UPI's Level-3 sub-pages), `false` (login's existing exception). Plus a theme-toggle control (`Sun`/`Moon`, wired to `next-themes`). **App-wide — not UPI-scoped.**
- **Tag color ramp** (`DESIGN.md:1028-1042`): 8 swatches (teal, indigo, violet, orchid, plum, magenta, rose, berry), fill = each hue's `-4` step, text = `-11` step, all pairs WCAG AA both modes (light 4.80-5.06:1, dark 7.01-7.21:1). Verified distinct from the 4 functional hues + accent (≥25° margin).
- **Transaction status indicator** (`DESIGN.md:1044-1052`): 4-state (pending/success/failed/unconfirmed), words + `lucide-react` icon (`Clock`/`CheckCircle2`/`XCircle`/`HelpCircle`), reusing the 4 already-verified functional inks 1:1 — no new color tokens.
- **Flow-screen specs** (`DESIGN.md:1054-1087`): Capture screen — Scan step (4 states; camera-denied is a single fallback path, not a 2-option error), Amount step (reuses `{form-field.*}` unchanged), Tag step (chips + inline-create, reuses the tag ramp), Pay step + no-UPI-app error, Confirm-prompt (reuses the status indicator unchanged).
- **Data-screen specs** (`DESIGN.md:989-995`, `1089-1118`): the Ledger (Expenses) dense-frame is **extended, not replaced** (`DESIGN.md:994-995`) with a tag-chip row + status cue added *below* the existing row, never inside it. Summary totals as plain numeric rows (full-amount-per-tag rule stated explicitly, no chart). Manual-entry form and tag management (delete confirmation, deleted-tag dashed/fill-less treatment) fully specified.

## Voice & copy

From `design/VOICE.md`:

- **Register split** (`VOICE.md:24-33`) — already amended: *"First-ever-use empty states, all 7 tools (UPI included)... This is an extensible set."* The 6-tool cap this file originally flagged as a gap is resolved and documented, not a silent one-off for UPI.
- **Error formula** (Yifrah, `VOICE.md:51-73`) — what → why → fix, zero blame. UPI's three first-class error states follow this, matching the cited Expenses AI-parse-failure worked example structurally.
- **Actual UPI microcopy** is already written directly into `JOURNEY.md`'s page specs (not just planned) — see the Microcopy blocks at `JOURNEY.md:574-582` (main flow: empty state, all 3 error messages, loading/success screen-reader text), `603-608` (history), `627-631` (add manually), `650-655` (tags).

## Mock reference

`design/mocks/upi-landing.html` and `design/mocks/upi-history.html` exist and were the approved direction-check mocks. **Flag:** both render the mock checkpoint's *throwaway* placeholder tag-ramp (6 hues at each hue's `-3` step) — the real, locked ramp (`DESIGN.md:1028-1042`) landed with 8 hues at `-4` for better separation. The direction is still valid; the exact pixel values in these two files are now superseded. Not blocking, but don't treat them as pixel-perfect against the final tokens.

## Open gaps

The original 7 gaps this file flagged are now resolved (name, mark, toolType, tag ramp, status indicator, page specs, empty-state register — see citations above). What's still open, surfaced honestly rather than papered over:

1. **Shell-chrome implementation has no task anywhere.** The `PageHeader` back-control/theme-toggle spec (`DESIGN.md:956-981`) is a cross-cutting change to `specs/003-ui-shell-foundation`'s actual component, affecting all 7 tools + launcher — but no task in this feature's `tasks.md`, nor any other feature's, currently covers writing that code. Needs either a task added here (as a shared-dependency note) or a small standalone addendum before any UI task that assumes the new back-control contract gets built.
2. **`₹` glyph coverage is assumed, not confirmed** (DESIGN.md's own flagged open question) — needs a quick visual check in Newsreader Display, naturally done whenever the launcher shelf is first built with UPI present (no launcher UI exists in code yet — `app/(app)/page.tsx` is still the pre-shell smoke-test page).
3. **Tags-management entry point from History is unplaced.** `JOURNEY.md:639` explicitly defers "filter row vs. a dedicated affordance" to "a later phase's job" — that phase hasn't happened; implementation will need to make this specific call.
4. The two mocks are stale relative to final tokens (cosmetic — see Mock reference above).

## Recommendation

**Safe to proceed to `/speckit-implement`** for the previously-blocked UI tasks (T015-T020, T027-T028, T032-T033, T038) — every visual/token question those tasks needed is now answered in `DESIGN.md`/`JOURNEY.md` with concrete, citable values, not placeholders. Two things worth doing first: (1) add a task or short note covering the actual `PageHeader.tsx` code change (gap #1 above) so it doesn't get invented ad hoc inside a component file; (2) resolve the Tags-entry-point placement (gap #3) before or during T038.
