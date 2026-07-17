# Design: Verse Margin
**Date:** 2026-07-18 · **Status:** confirmed
**Extended:** Phase 4 (Type + color), 2026-07-18 — full type scale + complete functional-color tokens added below; base DNA (archetype/composition/motion/base tokens) unchanged from the Phase 3 lock.

**Archetype:** Sage (primary) with a Caregiver inflection on motion + tone only
**Register:** calm structure · expressive at: empty states set as short verse, the habit day-complete accent fill, oversize punctuation at page heads
**Grounding:** Medium reading view's serif-at-generous-margin comfort, proven on a phone + Penguin Great Ideas covers' punctuation-and-type-as-ornament
**DNA:** Editorial Minimalism + layout discipline from Swiss (the dealt cell) · **Dominant axis:** type voice
**Composition:** `<dealt>` — Editorial Minimalism family under Swiss Modular discipline, variance 3 (`scripts/dealer.mjs`, seed `homebase|2026-07-17|0|pin:hue=green`, hand #4, hue 157.5°)
**Pins:** `hue=green` (user-pinned — research doc taste signal; no brown, no blue) · dealer seed `homebase|2026-07-17|0|pin:hue=green`, reroll 0, ledger `.design-foundations/used-dna.json` · converge: **Candidate 4 "Verse Margin"** — straight pick, no synthesis, no loop (user reviewed all 5 live-rendered candidates and reacted "fantastic")

---

## Archetype derivation

Derived from the personality-word table (`archetypes.md` Part C), not asserted. Full derivation is recorded in `.design-foundations/build/2026-07-17-homebase-phase-3-discovery.md` under "Design Decisions → Archetype derivation" — summarized here for the governing artifact:

Personality words pulled from the research doc + JOURNEY.md's emotional jobs — *calm, measured, restrained, quiet, unhurried, well-kept, literary, in control, reassuring, honest ("stay honest with myself"), never nagging* — cluster onto three table rows: **trustworthy/calm/safe/supportive** → Caregiver, Innocent, Everyman; **smart/precise/rigorous/credible** → Sage, Ruler; **crafted/artisanal/original** → Creator, Explorer. The dominant clusters are *measured/precise* and *calm/in-service*, giving **Sage primary** (core desire: truth/understanding; visual gravity: muted palette, serif or technical type, no decoration — a near-verbatim match to the research doc's own language) with a **Caregiver inflection** confined to one dimension (motion + tone — calm motion, reassuring states), per the mixed-signals heuristic. The differentiation heuristic confirms the pick: this app's category incumbents (gamified, badge-heavy, mascot-cluttered habit/tracking apps — JOURNEY.md's own Push forces name this) sit at Sage's visual-gravity opposite. Innocent/Everyman were rejected as primaries (their gravity reads friendly-generic, not literary-measured); Creator is subsumed — its "restrained canvas + expressive letterforms" quality is exactly what the serif-display constraint already carries.

## Direction

A kept notebook, not a productivity dashboard: quiet structure that lets typography do the expressive work at the moments that matter, while the app's genuinely dense data (heatmaps, ledgers, checklists) stays legally dense inside a metered, hairline-divided grid rather than being aired out into uniform whitespace. It serves two people doing daily life admin who want to feel unhurried and in control, not nagged or gamified. Medium's proven-on-a-phone reading comfort and Penguin's punctuation-as-ornament collide into pages where a single oversize typographic mark carries as much identity as any color or icon would — green rides along not as a brand color but as the sage/moss cue of tending something daily, at reading pace.

## Signature move

**Oversize punctuation as structure.** Each tool page opens with its canonical H1 set beside a display-scale typographic mark rendered in the display serif: Recipes' page head carries a large **¶**, Expenses' carries a large **§**, and an empty state is framed by a 96px bracket (`[` / `]`) rather than an illustration or icon. The mark is never decorative filler — it sits in the same structural role a container or icon would occupy elsewhere, so removing it would leave a visible gap, not a cleaner page. Consistency rule: one mark per page head maximum, always in the display serif, always at the same relative scale to the H1 (roughly 2-3x the H1's cap-height) — never repeated as a motif elsewhere on the page.

## Expressive moments

- **Empty states set as short verse** — first-ever-use empty states (per JOURNEY.md's zero-data-tool rule, all 6 tools) use 2-4 short lines of literary-register copy in the display serif, not a generic "no items yet" line + illustration. Amplitude: modest — a product-surface moment, not a brand hero.
- **Habit day-complete accent fill** — the single highest-frequency, highest-emotional-payoff moment in the app (JOURNEY.md Job section: "two taps... stay honest with myself"). The completed cell fills with the accent-9 solid; this is the one place solid accent fill (not just accent-text) is licensed to appear at that intensity.
- **Oversize punctuation at page heads** — the signature move itself, doubling as its own expressive moment; present on every one of the 7 pages' headers, so it reads as structure rather than a one-off flourish.

Everything else — navigation, forms, the ledger and checklist rows themselves, loading/error states — holds the calm structure register.

## Type

Faces selected and locked (Phase 4). Voice direction from Phase 3 confirmed and specified below with the actual typefaces, numeric scale, and weights.

### Faces

- **Display — Newsreader** (Production Type / Google Fonts, OFL). Selected within the Phase 3 Newsreader/Spectral direction over Spectral because Newsreader is explicitly classified a **Transitional Serif** — the classification that structurally sits with a near-vertical stress axis, as distinct from an old-style/humanist serif's angled axis (chapter-03's Georgia-vs-Garamond rejection criterion: a print-optimized humanist serif's angled axis and delicate curves blur at screen body sizes; a transitional/screen-cut serif's more vertical stress and sturdier serifs don't). Newsreader's own design brief is "primarily intended for continuous on-screen reading in content-rich environments" (Production Type), a direct structural match to the Medium-reading-view half of this DNA's grounding collision. It ships Text/Display optical-size cuts (variable axis, optical size 6–72, weight 200–800); this system uses the **Display** optical cut exclusively, matching the Never-section rule that the serif never carries body copy. Reserved strictly for H1s and the signature oversize-punctuation marks (¶ / § / brackets) — never body or dense UI text.
  - Fallback stack: `"Newsreader", ui-serif, Georgia, serif` — Georgia (not Garamond/Times) as the web-safe fallback, per chapter-03's own worked example: Georgia shares Newsreader's vertical-axis, screen-cut structural family, so a fallback substitution doesn't cross into angled-axis humanist territory.
- **Body — Inter** (Rasmus Andersson, OFL). A realist sans built specifically for computer screens: tall x-height, open apertures (avoids Helvetica-style closed apertures that blur at small sizes), and a near-vertical, largely monoline stem structure — explicitly not geometric (no forced-circular bowls the way Futura is), which is the direction's exclusion criterion (chapter-03: "pixels are relatively incompatible with perfectly circular forms — geometric typefaces render poorly at body sizes on screen"). Carries all dense-data microcopy, labels, ledger/checklist rows, form fields, and UI chrome.
  - Fallback stack: `"Inter", -apple-system, "Segoe UI", Roboto, sans-serif` — the system-UI stack shares Inter's realist/humanist-hybrid screen-native proportions closely enough to avoid a jarring fallback swap.

### Pairing check (letterfit / lowercase "n" test, appendix-fonts-and-typography.md)

Newsreader's **n**: bracketed serifs at the stem terminals, moderate stroke-weight contrast, near-vertical stress consistent with its Transitional classification, generous x-height (built into its screen-reading brief). Inter's **n**: monoline (no stroke contrast), open aperture, no serifs, very tall x-height built for small-size screen legibility. The two do not share letter structure (one carries stroke modulation and serifs, the other doesn't) — this is **not** the harmony mode (matched structures, e.g. Garamond + Gill Sans, both humanist). It also isn't the uncanny-valley middle the doctrine warns against: both faces were independently designed *for the same medium* (continuous on-screen reading / screen UI) with generously tall x-heights and near-vertical stem axes, so their proportions read as compatible even though their decorative treatment intentionally contrasts. Verdict: **deliberate contrast**, not harmony — licensed explicitly by appendix-fonts-and-typography.md's pairing rule ("harmony OR extreme contrast, never the ambiguous middle"), and reinforced by the DNA's own signature move (the serif is meant to visually announce itself as a distinct structural mark against the sans register, not blend into it).

### Weights

- `--font-weight-regular: 400` — default for both faces.
- `--font-weight-medium: 500` — Inter only; dense-data emphasis (active ledger row, selected habit tab), never the serif.
- `--font-weight-semibold: 600` — Inter only; primary CTA labels. No weight above 600 is used anywhere (restraint per the quiet-digital register — no heavy/black display weights).

### Type scale

18px is the floor at which the serif is licensed to appear (`--text-lg` and up), per the Phase 4 constraint that the serif must earn its keep at sizes where its screen-cut structure actually reads, not sit at body sizes where any serif's texture cost outweighs its display value.

```css
:root {
  --font-display: "Newsreader", ui-serif, Georgia, serif;
  --font-body: "Inter", -apple-system, "Segoe UI", Roboto, sans-serif;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  --text-xs: 0.75rem;    /* 12px — timestamps, badges, micro-metadata (Inter) */
  --leading-xs: 1.4;
  --text-sm: 0.875rem;   /* 14px — dense UI: ledger/checklist rows, secondary labels (Inter) */
  --leading-sm: 1.45;
  --text-base: 1rem;     /* 16px — body default: list items, form inputs (Inter); 16px floor avoids iOS input auto-zoom */
  --leading-base: 1.5;
  --text-lg: 1.125rem;   /* 18px — emphasized body; serif-eligible floor (Newsreader may appear inline from here up) */
  --leading-lg: 1.45;
  --text-xl: 1.25rem;    /* 20px — sub-section headers (Inter semibold, or Newsreader for small display accents) */
  --leading-xl: 1.4;
  --text-2xl: 1.5rem;    /* 24px — page subheads, card-group headers */
  --leading-2xl: 1.3;
  --text-3xl: 2rem;      /* 32px — canonical H1 (Newsreader Display) — "Habits", "Expenses", etc. per JOURNEY.md page-spec headers */
  --leading-3xl: 1.2;
  --text-4xl: 2.5rem;    /* 40px — larger display headers (Newsreader Display) */
  --leading-4xl: 1.15;
  --text-5xl: 4.5rem;    /* 72px — the signature oversize-punctuation mark (¶ / § / brackets), Newsreader Display only */
  --leading-5xl: 1;
}
```

**Signature-move sizing check:** DESIGN.md's signature move specifies the oversize punctuation mark sits "roughly 2-3x the H1's cap-height." Newsreader Display's cap-height ratio is ~0.70 of its em. At `--text-3xl` (32px), H1 cap-height ≈ 22.4px. At `--text-5xl` (72px), the mark's cap-height ≈ 50.4px — a 2.25x ratio, inside the specified 2-3x band. Verified by arithmetic, not rendered assumption; confirm visually at Phase 5 component build.

**Squint-test / texture note (chapter-03):** both faces carry even, well-managed stroke weight at their respective use-sizes by design pedigree (Newsreader built for optical-size-aware screen reading; Inter built and battle-tested for UI at small sizes by Figma, GitHub, Linear) — no custom hinting or texture correction is needed at this scale. Full squint-test confirmation against the actual rendered mock happens at Phase 5 (component build) when real content sits in these sizes.

## Color tokens

Generated via `scripts/palette.mjs --seed 157.5 --chroma muted --harmony mono` (Verse Margin's converged seed — re-run fresh for this lock, not copied from the diverge-stage cache). Full command output, verbatim:

```css
/* Generated by design-for-ai palette.mjs */
/* seed: hue 157.5 · chroma: muted · harmony: mono */

:root {
  --neutral-1: #fcfdfc;
  --neutral-2: #f8f9f8;
  --neutral-3: #eef1ef;
  --neutral-4: #e5e9e6;
  --neutral-5: #dae0dc;
  --neutral-6: #cdd4d0;
  --neutral-7: #bdc6c0;
  --neutral-8: #a4aea7;
  --neutral-9: #aebbb3;
  --neutral-10: #9ca8a0;
  --neutral-11: #5e6561;
  --neutral-12: #2b2f2d;
  --accent-1: #fafefb;
  --accent-2: #f4fbf6;
  --accent-3: #e6f5eb;
  --accent-4: #d9eee0;
  --accent-5: #c9e7d4;
  --accent-6: #b7ddc5;
  --accent-7: #a2d0b4;
  --accent-8: #82ba98;
  --accent-9: #84caa0;
  --accent-10: #74b68f;
  --accent-11: #486d57;
  --accent-12: #203327;
  --accent-on-solid: #06100a;
  --error-3: #ffebe9;
  --error-9: #c56c65;
  --error-11: #86534f;
  --success-3: #e6f6e6;
  --success-9: #84cc86;
  --success-11: #486e49;
  --warning-3: #f6f0e4;
  --warning-9: #ceb47e;
  --warning-11: #6f6144;
  --info-3: #e7f2fa;
  --info-9: #7aabce;
  --info-11: #4c677a;
  --background: var(--neutral-1);
  --surface: var(--neutral-2);
  --surface-hover: var(--neutral-3);
  --surface-active: var(--neutral-4);
  --border-subtle: var(--neutral-6);
  --border: var(--neutral-7);
  --border-strong: var(--neutral-8);
  --text-secondary: var(--neutral-11);
  --text: var(--neutral-12);
  --accent-bg-subtle: var(--accent-3);
  --accent-solid: var(--accent-9);
  --accent-solid-hover: var(--accent-10);
  --accent-text: var(--accent-11);

  /* Functional on-solid (Phase 4) — text/icon color for content placed ON TOP
     of a -9 solid fill (badge/chip background), mirroring --accent-on-solid.
     Mode-independent, same convention as -9 itself (see contrast report below). */
  --error-on-solid: #150a09;
  --success-on-solid: #081008;
  --warning-on-solid: #110d04;
  --info-on-solid: #060e15;
}

[data-theme="dark"] {
  --neutral-1: #121312;
  --neutral-2: #191a19;
  --neutral-3: #212321;
  --neutral-4: #282b29;
  --neutral-5: #2f3431;
  --neutral-6: #383d3a;
  --neutral-7: #444b46;
  --neutral-8: #5a635d;
  --neutral-9: #aebbb3;
  --neutral-10: #c2cec6;
  --neutral-11: #b2bab5;
  --neutral-12: #e5e9e6;
  --accent-1: #111312;
  --accent-2: #161b18;
  --accent-3: #1a251e;
  --accent-4: #1e2f24;
  --accent-5: #20392a;
  --accent-6: #234431;
  --accent-7: #29533c;
  --accent-8: #386d4f;
  --accent-9: #84caa0;
  --accent-10: #9adcb4;
  --accent-11: #9bc3aa;
  --accent-12: #d7efe0;
  --accent-on-solid: #06100a;
  --error-3: #2d1d1c;
  --error-9: #c56c65;
  --error-11: #e0a7a1;
  --success-3: #1a261a;
  --success-9: #84cc86;
  --success-11: #9bc49b;
  --warning-3: #262219;
  --warning-9: #ceb47e;
  --warning-11: #c5b696;
  --info-3: #1b2329;
  --info-9: #7aabce;
  --info-11: #9fbcd1;
  --background: var(--neutral-1);
  --surface: var(--neutral-2);
  --surface-hover: var(--neutral-3);
  --surface-active: var(--neutral-4);
  --border-subtle: var(--neutral-6);
  --border: var(--neutral-7);
  --border-strong: var(--neutral-8);
  --text-secondary: var(--neutral-11);
  --text: var(--neutral-12);
  --accent-bg-subtle: var(--accent-3);
  --accent-solid: var(--accent-9);
  --accent-solid-hover: var(--accent-10);
  --accent-text: var(--accent-11);

  --error-on-solid: #150a09;
  --success-on-solid: #081008;
  --warning-on-solid: #110d04;
  --info-on-solid: #060e15;
}
```

**Contrast report (WCAG 2.x) — exit code 0, every pair PASS:**

```
PASS  [light] neutral-11 on neutral-2: 5.65:1 (target 4.5:1)
PASS  [light] neutral-12 on neutral-2: 12.88:1 (target 7:1)
PASS  [light] neutral-12 on neutral-3: 11.98:1 (target 4.5:1)
PASS  [light] accent-11 on neutral-2: 5.52:1 (target 4.5:1)
PASS  [light] accent-11 on accent-2: 5.54:1 (target 4.5:1)
PASS  [light] accent-on-solid on accent-9: 10.04:1 (target 4.5:1)
PASS  [dark] neutral-11 on neutral-2: 8.79:1 (target 4.5:1)
PASS  [dark] neutral-12 on neutral-2: 14.28:1 (target 7:1)
PASS  [dark] neutral-12 on neutral-3: 12.96:1 (target 4.5:1)
PASS  [dark] accent-11 on neutral-2: 8.95:1 (target 4.5:1)
PASS  [dark] accent-11 on accent-2: 8.93:1 (target 4.5:1)
PASS  [dark] accent-on-solid on accent-9: 10.04:1 (target 4.5:1)
```

Background is the quiet green-tinted near-white `#fcfdfc` in light mode (the cool-leaning stance named at converge, not warm cream) and a green-tinted near-black `#121312` in dark mode (never flat `#000`, matching the ch09 shadows/dark-surface rule). This is the base neutral + accent ramp, locked at Phase 3 and unchanged here.

### Functional colors (Phase 4)

Generated by the same `palette.mjs` engine and hue table (`error: 25° · success: 145° · warning: 85° · info: 240°`), at the same `muted` chroma character as the accent ramp — per the Never section's "no saturated functional colors either" rule, these are not exempted from the muted-chroma constraint even though they're free to use conventional hues (chapter-08: HSB/HSL hue rotation for a functional set would give unequal perceptual weight across error/success/warning/info; this system's Lab/OKLCH-based construction keeps that rotation perceptually uniform, extending the same method Phase 3 used for the accent ramp rather than switching to a naive hue picker).

```css
/* already present in the token blocks above — repeated here for the record */
--error-3   / --error-9   / --error-11   (light: #ffebe9 / #c56c65 / #86534f · dark: #2d1d1c / #c56c65 / #e0a7a1)
--success-3 / --success-9 / --success-11 (light: #e6f6e6 / #84cc86 / #486e49 · dark: #1a261a / #84cc86 / #9bc49b)
--warning-3 / --warning-9 / --warning-11 (light: #f6f0e4 / #ceb47e / #6f6144 · dark: #262219 / #ceb47e / #c5b696)
--info-3    / --info-9    / --info-11    (light: #e7f2fa / #7aabce / #4c677a · dark: #1b2329 / #7aabce / #9fbcd1)
--error-on-solid / --success-on-solid / --warning-on-solid / --info-on-solid
  (#150a09 / #081008 / #110d04 / #060e15 — mode-independent, same convention as accent-on-solid)
```

**Functional-color contrast report (WCAG 2.x) — verified independently; `palette.mjs`'s own built-in report only checks neutral/accent/secondary pairs, not functional ones, so this extends it rather than re-running the same report:**

```
-11 (text/icon on surface, target 4.5:1):
PASS  [light] error-11   on neutral-2: 5.91:1
PASS  [light] success-11 on neutral-2: 5.52:1
PASS  [light] warning-11 on neutral-2: 5.74:1
PASS  [light] info-11    on neutral-2: 5.64:1
PASS  [dark]  error-11   on neutral-2: 8.49:1
PASS  [dark]  success-11 on neutral-2: 8.95:1
PASS  [dark]  warning-11 on neutral-2: 8.73:1
PASS  [dark]  info-11    on neutral-2: 8.80:1

-on-solid (text/icon on the -9 solid fill, target 4.5:1; -9 is mode-independent
by this system's own construction — see accent-9 being identical across both
blocks — so on-solid is verified once, not per-mode):
PASS  error-on-solid   on error-9:   5.28:1  (near-black, hue-tinted per accent-on-solid's own convention)
PASS  success-on-solid on success-9: 10.11:1
PASS  warning-on-solid on warning-9: 9.68:1
PASS  info-on-solid    on info-9:    7.91:1
```

**Edge case explicitly checked (per the plan's Phase 4 edge case — a light-mode AA pass doesn't guarantee dark-mode holds):** `error-11`, `success-11`, `warning-11`, `info-11` were verified in *both* light and dark blocks independently above, not assumed to carry over — all 8 pairs pass. The `-9`/on-solid pair is mode-independent by construction (same hex in both blocks, matching how `accent-9`/`accent-on-solid` already work), so it's a single verification rather than two.

**Standing rule for downstream phases (flagged here, owned by Phase 5 and Phase 7):** because the accent is green and the conventional error hue is red, every green/red pairing — most importantly success vs. error — must carry a redundant shape/icon/text cue, never color alone (chapter-08's colorblind-safety rule: ~10% of male users are red-green colorblind). Phase 5's component specs (status badges, form validation) and Phase 7's chart specs (habit heatmap, ledger balance) must each name their redundant cue explicitly, not rely on the color token alone.

## Space, shape, depth

- **Spacing scale:** numeric steps deferred to Phase 4/5, but the composition already commits to the rhythm: **tight-within-group, generous-between** — e.g. tight vertical rhythm inside a ledger's line-items, generous margin between the page header and the first content block. This is a standing guard raised at critique: uniform/averaged spacing is drift away from this DNA, not a safe simplification.
- **Radius:** none. Hairline dividers replace container/card chrome as the structural device — there is no card, no panel, no rounded rectangle anywhere in this system. This is the composition's core structural answer to the nested-cards default (`ai-tells.md`'s Fable-5 #1 measured tell).
- **Borders/shadows:** hairline (1px) dividers only, using `--border-subtle` / `--border`. No shadows, no elevation system, no blur. Density lives inside the module grid — heatmap, ledger, checklist each get a strict metered home — not inside stacked card chrome.

## Motion

- **Timing:** almost none — 200-300ms only.
- **Allowed:** opacity fades and small transform (subtle translate) on state changes only.
- **Never:** bounce/spring easing, ambient or looping motion, parallax, scroll-triggered reveals, decorative motion of any kind.
- **prefers-reduced-motion:** fades and transforms collapse to instant/no-transition; nothing in this system depends on motion to convey information (the day-complete accent fill, for example, must read correctly as a static state too).

## Never (this project's tells at risk)

- **No nested cards / card-in-card containers.** Hairline dividers are the only structural device this system uses. Any component spec that reaches for a card or panel has drifted off this DNA.
- **No centered-everything / strict central-axis layouts.** The module grid stays left-aligned and metered, not center-symmetric — a tell risk this candidate must actively avoid inheriting (flagged at critique against a sibling candidate that carried it).
- **No dark-default.** Light is the primary surface; dark is a fully-supported, equally first-class second mode — never the app's default or "hero" presentation.
- **No vivid/energetic/high-chroma color.** Muted chroma only, throughout — no acid-green, no neon, no saturated functional colors either.
- **No brown, no blue as the accent or dominant hue.** Green is user-pinned as HomeBase's primary/dominant theme color (research doc taste signal) — this rules out brown/blue as the accent, not a blanket ban on the hues appearing anywhere. Functional colors (Phase 4) may use conventional hues, including blue for info, where that best serves the content.
- **No skeuomorphism, no paper texture or grain.** Quiet-digital register — restraint over decoration, not a simulated physical notebook.
- **No mascots, badges, or gamification chrome**, especially in Habits — this is the direct opposite of the category incumbents this app is built to replace (JOURNEY.md's Push forces name this explicitly).
- **No "generic tasteful quiet tool" (Notion-adjacent) gravity.** This was the critique's named weakest point for this exact candidate: sitting near a distributional center of quiet minimal tools. The oversize-punctuation signature and the no-container hairline grid are the two standing defenses — an implementation that loses either of them is no longer this DNA, it's the center it was built to avoid.
- **No uniform/flat spacing.** The tight-within-group / generous-between rhythm must be visibly present in the built surface, not averaged into evenly-spaced whitespace everywhere.

## Open questions

- ~~Exact display/body typefaces~~ — resolved Phase 4: Newsreader (display) + Inter (body), see Type section.
- ~~Full functional-color set + redundant-cue rule~~ — resolved Phase 4: see Functional colors section. Redundant-cue rule stands as a requirement for Phase 5/Phase 7 to implement, not just document.
- Component-level token tiers (global/alias/component, W3C DTCG format) and the launcher-card + four dense-data-family specs — Phase 5 (Design system).
