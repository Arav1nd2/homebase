# Design: Verse Margin
**Date:** 2026-07-18 · **Status:** confirmed
**Extended:** Phase 4 (Type + color), 2026-07-18 — full type scale + complete functional-color tokens added below; base DNA (archetype/composition/motion/base tokens) unchanged from the Phase 3 lock.
**Extended:** Phase 5 (Design system), 2026-07-18 — three-tier W3C DTCG token hierarchy + component specs added below (§Design system); no locked value changed.
**Extended:** UPI plan, Phase 2 (Tag ramp + status indicator + ToolCard), 2026-07-20 — an 8-swatch categorical tag-color ramp, a Transaction-status redundant-cue row, and UPI's ToolCard instantiation added below; no locked value changed.
**Extended:** UPI plan, Phase 3 (Shell chrome — back control, theme toggle, icon-usage rule), 2026-07-20 — a unified `PageHeader` back-control contract (hub / step / sub-page), a visible theme-toggle control wired to `next-themes`, and the icon-usage standing rule added below; no locked value changed. `specs/003-ui-shell-foundation/research.md` §2 flagged for correction (its no-visible-toggle rationale is now superseded — see the new §Shell chrome — PageHeader subsection).

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

  /* Tag color ramp (Phase 2, UPI) — 8 swatches, one palette.mjs run per hue
     (--seed <hue> --chroma muted --harmony mono), fill = each hue's -4 step,
     text = each hue's -11 step. See §Tag color ramp for the full derivation. */
  --tag-teal-fill: #d8edec;       --tag-teal-text: #486b6b;
  --tag-indigo-fill: #e0e7ff;     --tag-indigo-text: #555f91;
  --tag-violet-fill: #e6e5ff;     --tag-violet-text: #605c8e;
  --tag-orchid-fill: #ebe3ff;     --tag-orchid-text: #6a598a;
  --tag-plum-fill: #f2e0fd;       --tag-plum-text: #745585;
  --tag-magenta-fill: #f9def9;    --tag-magenta-text: #7c517d;
  --tag-rose-fill: #fcdef1;       --tag-rose-text: #815172;
  --tag-berry-fill: #fedeea;      --tag-berry-text: #835268;
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

  /* Tag color ramp (Phase 2, UPI) — dark-mode fills/text for the same 8 hues. */
  --tag-teal-fill: #1d2e2d;       --tag-teal-text: #9ac0c0;
  --tag-indigo-fill: #23283f;     --tag-indigo-text: #a7b4eb;
  --tag-violet-fill: #29273e;     --tag-violet-text: #b3b0e8;
  --tag-orchid-fill: #2d253c;     --tag-orchid-text: #bface3;
  --tag-plum-fill: #32243a;       --tag-plum-text: #caa8dd;
  --tag-magenta-fill: #362236;    --tag-magenta-text: #d4a5d5;
  --tag-rose-fill: #382231;       --tag-rose-text: #daa4c8;
  --tag-berry-fill: #39222c;      --tag-berry-text: #dda5bc;
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

## Design system

**Phase 5, 2026-07-18.** The locked DNA becomes a machine: a three-tier token hierarchy in W3C DTCG format (stable Oct 2025) and the component architecture — the ToolCard organism (Frost, *Atomic Design* 2013) that keeps the launcher open-ended, and the dense-frame functional pattern (Kholmatova, *Design Systems* 2017) that makes the four dense-data families read as one family. Nothing locked above changes; this section consumes it. The standing regression gate is `.design-foundations/build/phase5-spec-check.mjs`: it parses this section's three JSON blocks directly and exits non-zero on any tier-discipline or contrast violation.

**Governance (named, not invented — Mall, *Design That Scales* 2023):** single owner, the maintainer. Global tokens change only by re-running `palette.mjs` — never hand-edited hex (the spec-check cross-checks every DTCG global color against the CSS blocks above, so the two representations cannot drift). Alias/component changes are edits to this section, gated by the spec-check. No RFC, semver, or deprecation process: a single-owner personal app sits below the governance ROI threshold, and inventing that machinery would violate the project's own no-abstraction-without-need principle.

### Token tiers (W3C DTCG format)

| Tier | Encodes | May reference | Source |
|------|---------|---------------|--------|
| **Global** | what values exist | nothing — raw values only | `palette.mjs` (color) + Phase 5 mints (space / size / border-width) |
| **Alias** | what role a value plays | global tokens only | this section |
| **Component** | what one component uses | alias tokens only | this section |

No component spec references a raw global or a hex value — the alias tier always mediates (design-systems doctrine: the tier boundary is the design-decision layer, not a rename layer). The spec-check enforces all four failure modes: unresolved references, alias→non-global references, component→non-alias references, and global token names or raw hex in component-spec prose.

**Mode handling.** DTCG has no native theming construct. Dark-mode values ride per token in `$extensions["homebase.mode"].dark` — the spec's sanctioned extension point — mirroring the `[data-theme="dark"]` CSS redeclaration above. Mode-independent tokens (every solid `9` step, every on-solid ink, `neutral-9`) carry no extension: identical-in-both-modes is by construction, per §Functional colors.

**Spacing scale (the §Space deferral, minted here).** 4px-base globals `space.1`–`space.9` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px. The locked rhythm — tight-within-group, generous-between — is encoded at the **alias tier**, not left to per-component judgment: `space.dense` (4) for gaps inside dense interiors, `space.grouped` (8) for rows within one group, `space.related` (16) between associated blocks, `space.page-margin` (24) as the horizontal gutter, `space.between-group` (32) between module frames, `space.after-page-head` (48) below the H1 + signature mark. Because `space.grouped ≪ space.between-group` is a token relationship, uniform-spacing drift (a Never item) becomes detectable token misuse, not a taste call. Tap-target floor `size.tap-target` = 44px (Fitts 1954; platform HIG convention); control glyph `size.glyph` = 20px; `border-width.1` = 1px (the hairline).

**New pairings decided and verified this phase** (WCAG 2.x, both modes, machine-checked on every spec-check run — exact ratios printed by the script):

| Decision | Pairing | Light | Dark | Target |
|----------|---------|-------|------|--------|
| `color.border.input` → neutral-11 ink, **not** neutral-7 | input boundary vs page background | 5.87:1 | 9.39:1 | 3:1 — WCAG 1.4.11: a form control's boundary identifies it; neutral-7 = 1.72:1 fails, even neutral-8 = 2.24:1 fails |
| CTA = accent-3 surface + accent-11 ink, **not** accent-9 solid | label vs fill | 5.17:1 | 8.12:1 | 4.5:1 |
| Feedback-banner ink on its own tinted surface | each functional -11 vs its own -3 | ≥5.19:1 | ≥7.83:1 | 4.5:1 (all four hues pass both modes; Phase 4 verified -11 on neutral-2 only) |
| Heatmap complete cell carries an in-cell mark | accent-on-solid vs accent-9 fill | 10.07:1 | 10.07:1 | 4.5:1 — accent-9 vs the light background is 1.88:1, so the fill stays the expressive layer and the mark carries the information |
| Error boundary/chip solid vs background | error-9 vs background | 3.61:1 | 5.06:1 | 3:1 |

Why the CTA is not the accent solid: §Expressive moments reserves solid accent-9 fill "at that intensity" for the habit day-complete cell alone. The CTA isolates instead by being the only accent-tinted block on any page (Von Restorff isolation effect), full-width and bottom-fixed at tap-target height (Fitts 1954) — prominence without spending the one licensed solid moment. The heatmap decision is an addition to the lock, not an override: the accent-9 fill stands exactly as licensed; the on-solid mark rides on top and simultaneously discharges the Phase 4 redundant-cue standing rule for the heatmap.

#### Tier 1 — Global

<!-- dtcg:global -->
```json
{
  "color": {
    "neutral": {
      "1": { "$value": "#fcfdfc", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#121312" } } },
      "2": { "$value": "#f8f9f8", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#191a19" } } },
      "3": { "$value": "#eef1ef", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#212321" } } },
      "4": { "$value": "#e5e9e6", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#282b29" } } },
      "5": { "$value": "#dae0dc", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#2f3431" } } },
      "6": { "$value": "#cdd4d0", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#383d3a" } } },
      "7": { "$value": "#bdc6c0", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#444b46" } } },
      "8": { "$value": "#a4aea7", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#5a635d" } } },
      "9": { "$value": "#aebbb3", "$type": "color" },
      "10": { "$value": "#9ca8a0", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#c2cec6" } } },
      "11": { "$value": "#5e6561", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#b2bab5" } } },
      "12": { "$value": "#2b2f2d", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#e5e9e6" } } }
    },
    "accent": {
      "1": { "$value": "#fafefb", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#111312" } } },
      "2": { "$value": "#f4fbf6", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#161b18" } } },
      "3": { "$value": "#e6f5eb", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#1a251e" } } },
      "4": { "$value": "#d9eee0", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#1e2f24" } } },
      "5": { "$value": "#c9e7d4", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#20392a" } } },
      "6": { "$value": "#b7ddc5", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#234431" } } },
      "7": { "$value": "#a2d0b4", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#29533c" } } },
      "8": { "$value": "#82ba98", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#386d4f" } } },
      "9": { "$value": "#84caa0", "$type": "color" },
      "10": { "$value": "#74b68f", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#9adcb4" } } },
      "11": { "$value": "#486d57", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#9bc3aa" } } },
      "12": { "$value": "#203327", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#d7efe0" } } },
      "on-solid": { "$value": "#06100a", "$type": "color" }
    },
    "error": {
      "3": { "$value": "#ffebe9", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#2d1d1c" } } },
      "9": { "$value": "#c56c65", "$type": "color" },
      "11": { "$value": "#86534f", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#e0a7a1" } } },
      "on-solid": { "$value": "#150a09", "$type": "color" }
    },
    "success": {
      "3": { "$value": "#e6f6e6", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#1a261a" } } },
      "9": { "$value": "#84cc86", "$type": "color" },
      "11": { "$value": "#486e49", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#9bc49b" } } },
      "on-solid": { "$value": "#081008", "$type": "color" }
    },
    "warning": {
      "3": { "$value": "#f6f0e4", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#262219" } } },
      "9": { "$value": "#ceb47e", "$type": "color" },
      "11": { "$value": "#6f6144", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#c5b696" } } },
      "on-solid": { "$value": "#110d04", "$type": "color" }
    },
    "info": {
      "3": { "$value": "#e7f2fa", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#1b2329" } } },
      "9": { "$value": "#7aabce", "$type": "color" },
      "11": { "$value": "#4c677a", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#9fbcd1" } } },
      "on-solid": { "$value": "#060e15", "$type": "color" }
    },
    "tag": {
      "teal":    { "fill-raw": { "$value": "#d8edec", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#1d2e2d" } } }, "text-raw": { "$value": "#486b6b", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#9ac0c0" } } } },
      "indigo":  { "fill-raw": { "$value": "#e0e7ff", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#23283f" } } }, "text-raw": { "$value": "#555f91", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#a7b4eb" } } } },
      "violet":  { "fill-raw": { "$value": "#e6e5ff", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#29273e" } } }, "text-raw": { "$value": "#605c8e", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#b3b0e8" } } } },
      "orchid":  { "fill-raw": { "$value": "#ebe3ff", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#2d253c" } } }, "text-raw": { "$value": "#6a598a", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#bface3" } } } },
      "plum":    { "fill-raw": { "$value": "#f2e0fd", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#32243a" } } }, "text-raw": { "$value": "#745585", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#caa8dd" } } } },
      "magenta": { "fill-raw": { "$value": "#f9def9", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#362236" } } }, "text-raw": { "$value": "#7c517d", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#d4a5d5" } } } },
      "rose":    { "fill-raw": { "$value": "#fcdef1", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#382231" } } }, "text-raw": { "$value": "#815172", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#daa4c8" } } } },
      "berry":   { "fill-raw": { "$value": "#fedeea", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#39222c" } } }, "text-raw": { "$value": "#835268", "$type": "color", "$extensions": { "homebase.mode": { "dark": "#dda5bc" } } } }
    }
  },
  "font": {
    "family": {
      "display": { "$value": "\"Newsreader\", ui-serif, Georgia, serif", "$type": "fontFamily" },
      "body": { "$value": "\"Inter\", -apple-system, \"Segoe UI\", Roboto, sans-serif", "$type": "fontFamily" }
    },
    "weight": {
      "regular": { "$value": 400, "$type": "fontWeight" },
      "medium": { "$value": 500, "$type": "fontWeight" },
      "semibold": { "$value": 600, "$type": "fontWeight" }
    },
    "size": {
      "xs": { "$value": "0.75rem", "$type": "dimension" },
      "sm": { "$value": "0.875rem", "$type": "dimension" },
      "base": { "$value": "1rem", "$type": "dimension" },
      "lg": { "$value": "1.125rem", "$type": "dimension" },
      "xl": { "$value": "1.25rem", "$type": "dimension" },
      "2xl": { "$value": "1.5rem", "$type": "dimension" },
      "3xl": { "$value": "2rem", "$type": "dimension" },
      "4xl": { "$value": "2.5rem", "$type": "dimension" },
      "5xl": { "$value": "4.5rem", "$type": "dimension" }
    },
    "leading": {
      "xs": { "$value": 1.4, "$type": "number" },
      "sm": { "$value": 1.45, "$type": "number" },
      "base": { "$value": 1.5, "$type": "number" },
      "lg": { "$value": 1.45, "$type": "number" },
      "xl": { "$value": 1.4, "$type": "number" },
      "2xl": { "$value": 1.3, "$type": "number" },
      "3xl": { "$value": 1.2, "$type": "number" },
      "4xl": { "$value": 1.15, "$type": "number" },
      "5xl": { "$value": 1, "$type": "number" }
    }
  },
  "space": {
    "1": { "$value": "4px", "$type": "dimension" },
    "2": { "$value": "8px", "$type": "dimension" },
    "3": { "$value": "12px", "$type": "dimension" },
    "4": { "$value": "16px", "$type": "dimension" },
    "5": { "$value": "24px", "$type": "dimension" },
    "6": { "$value": "32px", "$type": "dimension" },
    "7": { "$value": "48px", "$type": "dimension" },
    "8": { "$value": "64px", "$type": "dimension" },
    "9": { "$value": "96px", "$type": "dimension" }
  },
  "size": {
    "tap-target": { "$value": "44px", "$type": "dimension", "$description": "Interactive minimum (Fitts 1954; platform HIG)" },
    "glyph": { "$value": "20px", "$type": "dimension", "$description": "Control glyph (checkbox box, inline icon)" }
  },
  "border-width": {
    "1": { "$value": "1px", "$type": "dimension", "$description": "The hairline — this system's only structural line weight" }
  }
}
```

#### Tier 2 — Alias

<!-- dtcg:alias -->
```json
{
  "color": {
    "background": { "$value": "{color.neutral.1}", "$type": "color", "$description": "Page background — the only page surface; no card fills" },
    "surface": {
      "default": { "$value": "{color.neutral.2}", "$type": "color", "$description": "Quiet raised-content tint (skeletons, image placeholders)" },
      "hover": { "$value": "{color.neutral.3}", "$type": "color" },
      "active": { "$value": "{color.neutral.4}", "$type": "color", "$description": "Pressed-row wash; skeleton blocks" }
    },
    "border": {
      "subtle": { "$value": "{color.neutral.6}", "$type": "color", "$description": "Interior hairline dividers" },
      "default": { "$value": "{color.neutral.7}", "$type": "color", "$description": "Frame-edge hairlines, image frames" },
      "strong": { "$value": "{color.neutral.8}", "$type": "color" },
      "input": { "$value": "{color.neutral.11}", "$type": "color", "$description": "Form-control boundary — an ink, not a hairline grey: WCAG 1.4.11 needs 3:1 for a boundary that identifies a control" }
    },
    "text": {
      "primary": { "$value": "{color.neutral.12}", "$type": "color" },
      "secondary": { "$value": "{color.neutral.11}", "$type": "color" }
    },
    "accent": {
      "subtle-bg": { "$value": "{color.accent.3}", "$type": "color", "$description": "The CTA surface — the only accent-tinted block on a page (Von Restorff)" },
      "subtle-bg-active": { "$value": "{color.accent.4}", "$type": "color", "$description": "CTA pressed state" },
      "solid": { "$value": "{color.accent.9}", "$type": "color", "$description": "Licensed solid fill — habit day-complete cell ONLY (§Expressive moments)" },
      "solid-hover": { "$value": "{color.accent.10}", "$type": "color" },
      "text": { "$value": "{color.accent.11}", "$type": "color", "$description": "Accent ink — CTA labels, done-stage markers, progress fill" }
    },
    "on-accent": { "$value": "{color.accent.on-solid}", "$type": "color", "$description": "Ink placed on the accent solid fill" },
    "feedback": {
      "error": {
        "surface": { "$value": "{color.error.3}", "$type": "color" },
        "solid": { "$value": "{color.error.9}", "$type": "color" },
        "text": { "$value": "{color.error.11}", "$type": "color" },
        "on-solid": { "$value": "{color.error.on-solid}", "$type": "color" }
      },
      "success": {
        "surface": { "$value": "{color.success.3}", "$type": "color" },
        "solid": { "$value": "{color.success.9}", "$type": "color" },
        "text": { "$value": "{color.success.11}", "$type": "color" },
        "on-solid": { "$value": "{color.success.on-solid}", "$type": "color" }
      },
      "warning": {
        "surface": { "$value": "{color.warning.3}", "$type": "color" },
        "solid": { "$value": "{color.warning.9}", "$type": "color" },
        "text": { "$value": "{color.warning.11}", "$type": "color" },
        "on-solid": { "$value": "{color.warning.on-solid}", "$type": "color" }
      },
      "info": {
        "surface": { "$value": "{color.info.3}", "$type": "color" },
        "solid": { "$value": "{color.info.9}", "$type": "color" },
        "text": { "$value": "{color.info.11}", "$type": "color" },
        "on-solid": { "$value": "{color.info.on-solid}", "$type": "color" }
      }
    },
    "chart": {
      "streak": {
        "level-1": { "$value": "{color.accent.5}", "$type": "color", "$description": "Phase 7 — habit heatmap streak-depth level 1 (1-2 day streak)" },
        "level-2": { "$value": "{color.accent.6}", "$type": "color", "$description": "Streak-depth level 2 (3-6 days)" },
        "level-3": { "$value": "{color.accent.7}", "$type": "color", "$description": "Streak-depth level 3 (7-13 days). Level 4/cap (14+ days) reuses {color.accent.solid} unchanged — the licensed habit day-complete intensity, preserved as this ramp's ceiling, never a fifth alias." }
      },
      "balance": {
        "positive": { "$value": "{color.accent.11}", "$type": "color", "$description": "Phase 7 — ledger balance marker, you're owed. Reuses the accent ink already licensed elsewhere for done-stage markers/progress fill." },
        "negative": { "$value": "{color.warning.11}", "$type": "color", "$description": "Ledger balance marker, you owe. Deliberately warning (amber), not error (red) — avoids reconstructing the flagged green/red pairing against the positive accent, and matches design/VOICE.md's non-alarmist register (owing a split is not an error state)." },
        "neutral": { "$value": "{color.neutral.11}", "$type": "color", "$description": "Ledger balance marker, all settled — a genuinely neutral ink, not a faded positive or negative." }
      }
    },
    "tag": {
      "teal":    { "fill": { "$value": "{color.tag.teal.fill-raw}", "$type": "color" },    "text": { "$value": "{color.tag.teal.text-raw}", "$type": "color" } },
      "indigo":  { "fill": { "$value": "{color.tag.indigo.fill-raw}", "$type": "color" },  "text": { "$value": "{color.tag.indigo.text-raw}", "$type": "color" } },
      "violet":  { "fill": { "$value": "{color.tag.violet.fill-raw}", "$type": "color" },  "text": { "$value": "{color.tag.violet.text-raw}", "$type": "color" } },
      "orchid":  { "fill": { "$value": "{color.tag.orchid.fill-raw}", "$type": "color" },  "text": { "$value": "{color.tag.orchid.text-raw}", "$type": "color" } },
      "plum":    { "fill": { "$value": "{color.tag.plum.fill-raw}", "$type": "color" },    "text": { "$value": "{color.tag.plum.text-raw}", "$type": "color" } },
      "magenta": { "fill": { "$value": "{color.tag.magenta.fill-raw}", "$type": "color" }, "text": { "$value": "{color.tag.magenta.text-raw}", "$type": "color" } },
      "rose":    { "fill": { "$value": "{color.tag.rose.fill-raw}", "$type": "color" },    "text": { "$value": "{color.tag.rose.text-raw}", "$type": "color" } },
      "berry":   { "fill": { "$value": "{color.tag.berry.fill-raw}", "$type": "color" },   "text": { "$value": "{color.tag.berry.text-raw}", "$type": "color" } }
    }
  },
  "space": {
    "dense": { "$value": "{space.1}", "$type": "dimension", "$description": "Gaps inside dense interiors (heatmap cell gap)" },
    "grouped": { "$value": "{space.2}", "$type": "dimension", "$description": "Tight-within-group: rows inside one module" },
    "related": { "$value": "{space.4}", "$type": "dimension", "$description": "Between associated blocks" },
    "page-margin": { "$value": "{space.5}", "$type": "dimension", "$description": "Horizontal gutter" },
    "between-group": { "$value": "{space.6}", "$type": "dimension", "$description": "Generous-between: separates module frames — must stay visibly ≫ space.grouped (Never: no uniform spacing)" },
    "after-page-head": { "$value": "{space.7}", "$type": "dimension", "$description": "Below the H1 + signature mark" }
  },
  "size": {
    "interactive": {
      "min": { "$value": "{size.tap-target}", "$type": "dimension", "$description": "Minimum height/hit area of anything tappable" }
    },
    "control-glyph": { "$value": "{size.glyph}", "$type": "dimension" }
  },
  "border": {
    "hairline": { "$value": "{border-width.1}", "$type": "dimension" }
  },
  "type": {
    "display-mark": { "$type": "typography", "$value": { "fontFamily": "{font.family.display}", "fontSize": "{font.size.5xl}", "fontWeight": "{font.weight.regular}", "lineHeight": "{font.leading.5xl}" }, "$description": "The signature oversize punctuation mark — one per page head, display serif only" },
    "h1": { "$type": "typography", "$value": { "fontFamily": "{font.family.display}", "fontSize": "{font.size.3xl}", "fontWeight": "{font.weight.regular}", "lineHeight": "{font.leading.3xl}" } },
    "mark-inline": { "$type": "typography", "$value": { "fontFamily": "{font.family.display}", "fontSize": "{font.size.2xl}", "fontWeight": "{font.weight.regular}", "lineHeight": "{font.leading.2xl}" }, "$description": "A tool's mark at row scale (ToolCard leading glyph)" },
    "section-label": { "$type": "typography", "$value": { "fontFamily": "{font.family.body}", "fontSize": "{font.size.xl}", "fontWeight": "{font.weight.semibold}", "lineHeight": "{font.leading.xl}" }, "$description": "Dense-frame headers / sub-section heads" },
    "body": { "$type": "typography", "$value": { "fontFamily": "{font.family.body}", "fontSize": "{font.size.base}", "fontWeight": "{font.weight.regular}", "lineHeight": "{font.leading.base}" } },
    "cta-label": { "$type": "typography", "$value": { "fontFamily": "{font.family.body}", "fontSize": "{font.size.base}", "fontWeight": "{font.weight.semibold}", "lineHeight": "{font.leading.base}" } },
    "dense": { "$type": "typography", "$value": { "fontFamily": "{font.family.body}", "fontSize": "{font.size.sm}", "fontWeight": "{font.weight.regular}", "lineHeight": "{font.leading.sm}" }, "$description": "Ledger/checklist rows, dense labels" },
    "dense-emphasis": { "$type": "typography", "$value": { "fontFamily": "{font.family.body}", "fontSize": "{font.size.sm}", "fontWeight": "{font.weight.medium}", "lineHeight": "{font.leading.sm}" }, "$description": "Active/emphasized dense data (ledger amounts)" },
    "micro": { "$type": "typography", "$value": { "fontFamily": "{font.family.body}", "fontSize": "{font.size.xs}", "fontWeight": "{font.weight.regular}", "lineHeight": "{font.leading.xs}" }, "$description": "Timestamps, badges, micro-metadata" }
  }
}
```

#### Tier 3 — Component

<!-- dtcg:component -->
```json
{
  "tool-card": {
    "min-height": { "$value": "{size.interactive.min}", "$type": "dimension" },
    "padding-x": { "$value": "{space.page-margin}", "$type": "dimension" },
    "padding-y": { "$value": "{space.grouped}", "$type": "dimension" },
    "gap": { "$value": "{space.grouped}", "$type": "dimension" },
    "divider": {
      "color": { "$value": "{color.border.subtle}", "$type": "color" },
      "width": { "$value": "{border.hairline}", "$type": "dimension" }
    },
    "label": {
      "typography": { "$value": "{type.body}", "$type": "typography" },
      "color": { "$value": "{color.text.primary}", "$type": "color" }
    },
    "mark": {
      "typography": { "$value": "{type.mark-inline}", "$type": "typography" },
      "color": { "$value": "{color.text.secondary}", "$type": "color" }
    },
    "badge": {
      "typography": { "$value": "{type.micro}", "$type": "typography" },
      "color": { "$value": "{color.text.secondary}", "$type": "color" }
    },
    "pin": {
      "active-color": { "$value": "{color.accent.text}", "$type": "color" },
      "inactive-color": { "$value": "{color.text.secondary}", "$type": "color" }
    },
    "pressed": {
      "background": { "$value": "{color.surface.active}", "$type": "color" }
    }
  },
  "dense-frame": {
    "header": {
      "typography": { "$value": "{type.section-label}", "$type": "typography" },
      "color": { "$value": "{color.text.primary}", "$type": "color" }
    },
    "edge": {
      "color": { "$value": "{color.border.default}", "$type": "color" },
      "width": { "$value": "{border.hairline}", "$type": "dimension" }
    },
    "divider": {
      "color": { "$value": "{color.border.subtle}", "$type": "color" },
      "width": { "$value": "{border.hairline}", "$type": "dimension" }
    },
    "row": {
      "min-height": { "$value": "{size.interactive.min}", "$type": "dimension" },
      "padding": { "$value": "{space.grouped}", "$type": "dimension" }
    },
    "padding-x": { "$value": "{space.page-margin}", "$type": "dimension" },
    "stack-gap": { "$value": "{space.between-group}", "$type": "dimension" }
  },
  "heatmap": {
    "cell": {
      "gap": { "$value": "{space.dense}", "$type": "dimension" },
      "complete": {
        "fill": { "$value": "{color.accent.solid}", "$type": "color" },
        "mark": { "$value": "{color.on-accent}", "$type": "color" }
      },
      "incomplete": {
        "fill": { "$value": "{color.surface.active}", "$type": "color" }
      },
      "streak": {
        "level-1": { "fill": { "$value": "{color.chart.streak.level-1}", "$type": "color" }, "mark": { "$value": "{color.text.primary}", "$type": "color" } },
        "level-2": { "fill": { "$value": "{color.chart.streak.level-2}", "$type": "color" }, "mark": { "$value": "{color.text.primary}", "$type": "color" } },
        "level-3": { "fill": { "$value": "{color.chart.streak.level-3}", "$type": "color" }, "mark": { "$value": "{color.text.primary}", "$type": "color" } }
      }
    },
    "legend": {
      "typography": { "$value": "{type.micro}", "$type": "typography" },
      "color": { "$value": "{color.text.secondary}", "$type": "color" }
    },
    "caption": {
      "typography": { "$value": "{type.dense}", "$type": "typography" },
      "color": { "$value": "{color.text.secondary}", "$type": "color" }
    },
    "label": {
      "typography": { "$value": "{type.micro}", "$type": "typography" },
      "color": { "$value": "{color.text.secondary}", "$type": "color" }
    }
  },
  "ledger": {
    "row": {
      "typography": { "$value": "{type.dense}", "$type": "typography" }
    },
    "amount": {
      "typography": { "$value": "{type.dense-emphasis}", "$type": "typography" },
      "color": { "$value": "{color.text.primary}", "$type": "color" }
    },
    "meta": {
      "typography": { "$value": "{type.micro}", "$type": "typography" },
      "color": { "$value": "{color.text.secondary}", "$type": "color" }
    }
  },
  "ledger-balance": {
    "track": { "$value": "{color.border.subtle}", "$type": "color" },
    "tick": { "$value": "{color.border.default}", "$type": "color" },
    "marker": {
      "positive": { "$value": "{color.chart.balance.positive}", "$type": "color" },
      "negative": { "$value": "{color.chart.balance.negative}", "$type": "color" },
      "neutral": { "$value": "{color.chart.balance.neutral}", "$type": "color" }
    },
    "label": {
      "typography": { "$value": "{type.dense}", "$type": "typography" },
      "color": { "$value": "{color.text.primary}", "$type": "color" }
    }
  },
  "checklist": {
    "box": {
      "size": { "$value": "{size.control-glyph}", "$type": "dimension" },
      "border": { "$value": "{color.border.input}", "$type": "color" },
      "border-width": { "$value": "{border.hairline}", "$type": "dimension" }
    },
    "checked": {
      "fill": { "$value": "{color.accent.subtle-bg}", "$type": "color" },
      "mark": { "$value": "{color.accent.text}", "$type": "color" },
      "label": { "$value": "{color.text.secondary}", "$type": "color" }
    }
  },
  "photo-card": {
    "frame": {
      "border": { "$value": "{color.border.default}", "$type": "color" },
      "width": { "$value": "{border.hairline}", "$type": "dimension" }
    },
    "gap": { "$value": "{space.grouped}", "$type": "dimension" },
    "caption": {
      "typography": { "$value": "{type.dense}", "$type": "typography" },
      "color": { "$value": "{color.text.primary}", "$type": "color" }
    },
    "meta": {
      "typography": { "$value": "{type.micro}", "$type": "typography" },
      "color": { "$value": "{color.text.secondary}", "$type": "color" }
    }
  },
  "cta": {
    "background": { "$value": "{color.accent.subtle-bg}", "$type": "color" },
    "background-active": { "$value": "{color.accent.subtle-bg-active}", "$type": "color" },
    "border": {
      "color": { "$value": "{color.accent.text}", "$type": "color" },
      "width": { "$value": "{border.hairline}", "$type": "dimension" }
    },
    "label": {
      "typography": { "$value": "{type.cta-label}", "$type": "typography" },
      "color": { "$value": "{color.accent.text}", "$type": "color" }
    },
    "min-height": { "$value": "{size.interactive.min}", "$type": "dimension" },
    "bar": {
      "background": { "$value": "{color.background}", "$type": "color" },
      "divider": { "$value": "{color.border.subtle}", "$type": "color" },
      "padding": { "$value": "{space.related}", "$type": "dimension" }
    }
  },
  "form-field": {
    "label": {
      "typography": { "$value": "{type.dense}", "$type": "typography" },
      "color": { "$value": "{color.text.secondary}", "$type": "color" }
    },
    "input": {
      "typography": { "$value": "{type.body}", "$type": "typography" },
      "text": { "$value": "{color.text.primary}", "$type": "color" },
      "background": { "$value": "{color.background}", "$type": "color" },
      "border": { "$value": "{color.border.input}", "$type": "color" },
      "border-width": { "$value": "{border.hairline}", "$type": "dimension" }
    },
    "error": {
      "border": { "$value": "{color.feedback.error.solid}", "$type": "color" },
      "text": { "$value": "{color.feedback.error.text}", "$type": "color" }
    },
    "gap": { "$value": "{space.grouped}", "$type": "dimension" },
    "group-gap": { "$value": "{space.between-group}", "$type": "dimension" }
  },
  "parse-status": {
    "stage": {
      "done": { "color": { "$value": "{color.accent.text}", "$type": "color" } },
      "active": { "color": { "$value": "{color.text.primary}", "$type": "color" } },
      "pending": { "color": { "$value": "{color.text.secondary}", "$type": "color" } }
    },
    "track": { "color": { "$value": "{color.border.subtle}", "$type": "color" } },
    "fill": { "color": { "$value": "{color.accent.text}", "$type": "color" } },
    "gap": { "$value": "{space.related}", "$type": "dimension" }
  },
  "banner": {
    "padding": { "$value": "{space.related}", "$type": "dimension" },
    "surface": {
      "error": { "$value": "{color.feedback.error.surface}", "$type": "color" },
      "success": { "$value": "{color.feedback.success.surface}", "$type": "color" },
      "warning": { "$value": "{color.feedback.warning.surface}", "$type": "color" },
      "info": { "$value": "{color.feedback.info.surface}", "$type": "color" }
    },
    "text": {
      "error": { "$value": "{color.feedback.error.text}", "$type": "color" },
      "success": { "$value": "{color.feedback.success.text}", "$type": "color" },
      "warning": { "$value": "{color.feedback.warning.text}", "$type": "color" },
      "info": { "$value": "{color.feedback.info.text}", "$type": "color" }
    }
  },
  "tag-chip": {
    "typography": { "$value": "{type.micro}", "$type": "typography" },
    "swatch": {
      "teal":    { "fill": { "$value": "{color.tag.teal.fill}", "$type": "color" },    "text": { "$value": "{color.tag.teal.text}", "$type": "color" } },
      "indigo":  { "fill": { "$value": "{color.tag.indigo.fill}", "$type": "color" },  "text": { "$value": "{color.tag.indigo.text}", "$type": "color" } },
      "violet":  { "fill": { "$value": "{color.tag.violet.fill}", "$type": "color" },  "text": { "$value": "{color.tag.violet.text}", "$type": "color" } },
      "orchid":  { "fill": { "$value": "{color.tag.orchid.fill}", "$type": "color" },  "text": { "$value": "{color.tag.orchid.text}", "$type": "color" } },
      "plum":    { "fill": { "$value": "{color.tag.plum.fill}", "$type": "color" },    "text": { "$value": "{color.tag.plum.text}", "$type": "color" } },
      "magenta": { "fill": { "$value": "{color.tag.magenta.fill}", "$type": "color" }, "text": { "$value": "{color.tag.magenta.text}", "$type": "color" } },
      "rose":    { "fill": { "$value": "{color.tag.rose.fill}", "$type": "color" },    "text": { "$value": "{color.tag.rose.text}", "$type": "color" } },
      "berry":   { "fill": { "$value": "{color.tag.berry.fill}", "$type": "color" },   "text": { "$value": "{color.tag.berry.text}", "$type": "color" } }
    }
  },
  "transaction-status": {
    "typography": { "$value": "{type.micro}", "$type": "typography" },
    "success":     { "color": { "$value": "{color.feedback.success.text}", "$type": "color" } },
    "failed":      { "color": { "$value": "{color.feedback.error.text}", "$type": "color" } },
    "pending":     { "color": { "$value": "{color.feedback.info.text}", "$type": "color" } },
    "unconfirmed": { "color": { "$value": "{color.feedback.warning.text}", "$type": "color" } }
  },
  "shell-header": {
    "back": {
      "min-height": { "$value": "{size.interactive.min}", "$type": "dimension" },
      "gap": { "$value": "{space.grouped}", "$type": "dimension" },
      "icon-size": { "$value": "{size.control-glyph}", "$type": "dimension" },
      "icon-color": { "$value": "{color.text.secondary}", "$type": "color" },
      "label": {
        "typography": { "$value": "{type.dense}", "$type": "typography" },
        "color": { "$value": "{color.text.secondary}", "$type": "color" }
      }
    },
    "theme-toggle": {
      "min-height": { "$value": "{size.interactive.min}", "$type": "dimension" },
      "min-width": { "$value": "{size.interactive.min}", "$type": "dimension" },
      "icon-size": { "$value": "{size.control-glyph}", "$type": "dimension" },
      "icon-color": { "$value": "{color.text.secondary}", "$type": "color" }
    }
  }
}
```

### Component specs

<!-- spec-check:prose-start -->

Atomic inventory (Frost 2013 — a composition model, not a file structure):

| Level | Units |
|-------|-------|
| Atoms | mark glyph · label · badge text · pin toggle · text input · checkbox box · heatmap cell · hairline divider · photo frame · stage row |
| Molecules | form field (label + input + error line) · badge (kind formatter + value) · reconciliation row · quick-add (input + add action) · stage list |
| Organisms | ToolCard · the four dense-frame instances · parse-status block · parse-failure banner + recovery actions · bill edit form · PageHeader (back control + theme toggle, Phase 3) |
| Templates | page head (mark + H1, then {space.after-page-head}) + stacked module frames — arrangements already specified per page in JOURNEY.md |
| Pages | JOURNEY.md's seven page specs with real content |

Pattern selections (usability bridge — the principle picks the pattern):

| Surface | Selection | Selecting principle |
|---------|-----------|--------------------|
| Navigation | Hub-and-spoke held from IA; full-width shelf rows; capped quick-start row | Fitts (1954) — maximal targets; Hick–Hyman (1952) — capped daily choice set |
| Bill edit form | Three chunks (items / adjustments / split), on-blur validation, forgiving amount parsing, reconciliation row | Miller/Cowan ~4±1 · "reward early, punish late" · Postel · Nielsen #5 error prevention |
| AI-parse feedback | Staged determinate progress over a bare spinner; cancel always present | Nielsen #1 visibility of status · the 1–10s feedback band · Nielsen #3 user control |
| Parse failure | Plain-language failure surface with exactly two recovery options; photo kept on screen | Nielsen #9 error recovery · Hick (two options) · Nielsen #6 recognition over recall |

#### ToolCard — the launcher organism

One organism renders every tool on the launcher, in both contexts. Adding a tool is a data entry, never a component.

**Closed props set** (a new tool may only supply these — if it needs anything else, the organism is mis-abstracted and this spec must be revised, not worked around):

| Prop | Type | Notes |
|------|------|-------|
| `id` | string | Stable key; doubles as the route segment |
| `label` | string | The canonical name from JOURNEY.md's labeling table — identical on every surface, never re-phrased |
| `mark` | string (one glyph) | The tool's punctuation mark, rendered in the display serif at {tool-card.mark.typography} — data, not component art. Expenses "§" and Recipes "¶" per the lock; every tool contributes its own |
| `icon` | asset ref, optional | Reserved pictographic override; v1 supplies none — the mark IS the icon (typographic identification, per the Penguin grounding; no icon library) |
| `route` | string | Spoke destination (hub-and-spoke; no spoke-to-spoke nav) |
| `toolType` | enum: `heatmap` · `ledger` · `checklist` · `photo-card` | Binds the tool to its dense-family interior; on the card itself it drives only a11y labeling and badge formatting defaults |
| `badge` | `{ kind, value, unit? }` where kind ∈ `count` · `streak` · `balance` · `none` | A closed set of format kinds. A new tool picks a kind; it never adds a badge molecule. `balance` formats with an explicit sign word ("owed to you") in plain ink — never color-coded on the launcher |
| `pinned` | boolean | Quick-start membership; user-curated via the pin flow (JOURNEY.md) |

**Contexts, not variants:** the shelf row and the quick-start pin are two presentation modes of the same organism, selected by the parent — a full-width hairline-divided row ({tool-card.divider.color} at {tool-card.divider.width}) on the shelf; a text-first block in the quick-start rail. No card chrome in either: no fill, no radius, no shadow (Never section). Row anatomy: mark glyph ({tool-card.mark.color}) · label ({tool-card.label.color}) · badge text right-aligned ({tool-card.badge.color}) · pin toggle. Minimum height {tool-card.min-height}; gutters {tool-card.padding-x}.

**The 7th-tool proof:** a hypothetical "Plants" tool is one new data entry — `{ id: "plants", label: "Plants", mark: "†", route: "/plants", toolType: "checklist", badge: { kind: "count", unit: "to water" }, pinned: false }`. The shelf re-sorts alphabetically (IA's exact scheme), the badge reuses the `count` formatter, the interior reuses the checklist family. No new component, variant, or zone anywhere. The phase mock renders all seven tools — Plants included — from one render function over one data array.

**UPI — the actual 7th tool (Phase 2, 2026-07-20):** the proof above was hypothetical; UPI is HomeBase's real 7th tool and instantiates the same closed props set, no exception — `{ id: "upi-tracker", label: "UPI", mark: "₹", route: "/upi-tracker", toolType: "ledger", badge: { kind: "count", unit: "tracked" }, pinned: false }`. `toolType: "ledger"` because the plan's own constraint adapts UPI's transaction history from the existing Ledger dense-frame family rather than defining a genuine 5th family (§Dense-frame — Ledger (Expenses) interior, extended with this phase's tag chips + status indicator in the data-screens phase). `mark: "₹"` (the rupee sign) — thematically direct for a payment tool, and distinct from every mark already in use (Habits `*`, Movies & TV `"`, Expenses `§`, Food Reviews `‡`, Recipes `¶`, Groceries `&`, the hypothetical Plants `†`): no two tools ever share a mark. `₹` stays typographic per the closed props set's own rule (`icon` is reserved, unused here — the mark IS the icon) — Newsreader Display's currency-symbol glyph coverage is assumed from its broad general-text Unicode range but not yet visually confirmed; flagged for a render-time check at the phase that first builds the launcher shelf with UPI present (the signature-move sizing check above set the same kind of precedent — arithmetic/assumption now, visual confirmation at build). `badge: { kind: "count", unit: "tracked" }` reuses the existing `count` formatter (no new badge kind), matching how Recipes and Food Reviews already badge a running total rather than a streak or balance — UPI's badge counts transactions tracked, not a shared-split balance (that semantic stays Expenses' alone).

**States:** default · pressed ({tool-card.pressed.background} row wash, no transform) · focus-visible (outline in {color.border.input}, offset outside the row) · badge loading ({color.surface.active} skeleton line; mark + label render immediately — they are static data) · badge error (muted inline dash in {tool-card.badge.color}; the card stays fully tappable, per JOURNEY.md's launcher error state) · disabled: not a state this organism has — tools are never disabled or hidden (IA rule: presence is not contingent on data).

**A11y:** the row is a single link (semantic `a`, no ARIA patch needed); accessible name = label + badge text (the mark is `aria-hidden` — it is identity, not information). Pin state is conveyed by glyph shape (filled vs outline) plus presence in the quick-start rail — location and shape cues, never color alone; toggle carries `aria-pressed`.

#### Icon usage — standing system rule (Phase 3, UPI plan, 2026-07-20)

This phase licenses `lucide-react` (already a project dependency — no new install) for real icon glyphs, scoped narrowly. It does **not** reverse ToolCard's "the mark IS the icon" rule above — tool identity marks (Habits `*`, Expenses `§`, UPI `₹`, and every other `ToolCard.mark`) stay typographic, unchanged, no exceptions. The scope test, stated once so any future control can be checked against it: **an icon is licensed only for a functional control that has no existing typographic answer** — a gap-fill, never a stylistic upgrade over working typographic chrome.

Four controls currently pass this test — two from this phase, two from the UPI plan's earlier Phase 2 (`.design-foundations/plans/2026-07-20-upi-shell-nav.md`):

| Control | Licensed by | Why no typographic answer exists |
|---|---|---|
| Theme toggle | Phase 3 (below) | No prior control of any kind — nothing to displace, nothing typographic to prefer |
| Back chevron | Phase 3 (below) | The current `‹` is a bare Unicode character pressed into service, not a mark drawn from this system's own type ladder — the signature Newsreader punctuation (§Signature move) is reserved for page-head identity and was never meant to double as chrome. Replacing it with `ChevronLeft` corrects a placeholder; it doesn't reverse a design decision |
| Camera controls (scan viewfinder) | Phase 2 | UPI's capture screen has no prior surface at all |
| Transaction-status glyph | Phase 2 | A 4-state distinction (pending/success/failed/unconfirmed) with no existing typographic device to carry it |

Every other functional glyph already specified in this document — the checklist check mark, the pin toggle's filled/outline shape, the parse-status stage check — is unaffected; this rule doesn't reopen them. It governs new controls only, and any future one must clear the same test before reaching for `lucide-react` instead of type.

#### Shell chrome — PageHeader (Phase 3, `design-systems` + `usability`, 2026-07-20)

The shared `PageHeader` (`packages/web/components/shared/page-header.tsx`) renders on every tool screen and the launcher; this phase gives it a context-aware back control and adds a theme toggle, both app-wide (all 7 tools + launcher) — not UPI-scoped chrome. Same closed-contract discipline as ToolCard above: a new navigational context is a new `back` value handled here, never a bespoke header built beside this one.

**Back control — one contract, three navigational behaviors:**

| `back` value | Behavior | Who uses it |
|---|---|---|
| `{ mode: "hub" }` (default) | Renders "‹ HomeBase", links to `/` — unchanged from today's implementation | All 6 pre-UPI tools' single page; UPI's own Scan/landing state (Level 2 of the 3-level IA — JOURNEY.md §Navigation model, UPI's 3-level exception) |
| `{ mode: "step", onBack }` | Renders "‹ Back" (exact copy: Phase 6), calls `onBack()` instead of navigating — moves the client-side step machine backward one step, no route change | UPI's Amount/Tag/Pay/Confirm steps — the flow is mid-transaction; a "back to hub" tap here would silently abandon it, which is why this is its own mode and not a reuse of `hub` |
| `{ mode: "parent", href, label }` | Renders "‹ [label]", links to `href` — one level up, not to the hub | UPI's Level-3 sub-pages (`/history`, `/tags`, `/new`) — back goes to the UPI spoke (Scan/landing), matching JOURNEY.md's explicit rule: "a Level-3 page's 'back' goes up to the UPI spoke... not straight to the hub." A second tap from there is an ordinary `hub` back, unchanged |
| `false` | Renders nothing — no back control at all | The login page's existing exception (a signed-out visitor has no hub to return to); today's `showBackToHub={false}` maps onto this value directly and may stay as a backward-compatible alias at the implementation layer |

Because `{ mode: "hub" }` is the default when the prop is omitted entirely, every existing call site across the other six tools is unaffected — the plan's own no-regression constraint, satisfied by construction rather than a special case. Visual treatment is identical across all three navigational modes (only the label text and the tap destination change): a leading `ChevronLeft` icon at {shell-header.back.icon-size} in {shell-header.back.icon-color}, then the label in {shell-header.back.label.typography} / {shell-header.back.label.color}, gap {shell-header.back.gap} — the same plain-text-and-hairline register as the rest of this system, an icon added only per the rule above, not card or button chrome. Minimum tap height {shell-header.back.min-height} (= {size.interactive.min}, 44px — Fitts's law, Fitts 1954, this project's standing tap-target floor, cited not re-derived).

**Theme toggle:**

An icon-only button, {shell-header.theme-toggle.min-height} × {shell-header.theme-toggle.min-width} minimum (44px square — Fitts 1954, same floor), positioned at the header row's trailing edge, opposite the back control — a two-end row, not centered, per the Never section's standing anti-center-axis rule. Wired to `next-themes`' `setTheme`: on tap, flips the *resolved* theme explicitly (`light` ⇄ `dark`), giving a persistent manual override rather than a one-shot nudge back to `system` — the same `data-theme` mechanism `specs/003-ui-shell-foundation/research.md` §2 already validated for verification-only use, now shipped as a real user control too.

- **Icon states:** `Sun` renders when the resolved theme is light (tapping switches to dark); `Moon` renders when the resolved theme is dark (tapping switches to light) — the glyph reports current state, matching how the pin toggle's filled/outline shape already reports state elsewhere in this system, rather than one static icon that never changes.
- **`aria-pressed`:** modeled as a two-state toggle (WAI-ARIA toggle-button pattern) — `true` when dark mode is the resolved theme, `false` when light. The accessible name states the action, not the current state ("Switch to dark mode" / "Switch to light mode" — exact copy: Phase 6, matching how every other control in this document defers its words), so the pressed state and the name don't repeat the same fact.
- **Icon color, both modes (DW-3.2 — no new computation, the already-locked base pairs):** {shell-header.theme-toggle.icon-color} resolves to {color.text.secondary} — the identical ink the back control uses — against {color.background}. This exact ink is already contrast-verified above (§Color tokens' contrast report) against {color.surface.default}: **light 5.65:1, dark 8.79:1**, both clearing the 4.5:1 AA target with real margin. {color.background} is, in both modes, the more extreme of the two neutral surfaces relative to {color.text.secondary}'s mid-tone — lighter than {color.surface.default} in light mode, darker than it in dark mode (see §Color tokens above for the underlying values) — so the already-verified surface pairing is the conservative floor, not an assumption stretched past what was measured. Both icon states (`Sun` and `Moon`) share this one ink token; only the glyph shape changes with mode, not the color — one verified ratio pair covers all four cells (2 icons × 2 modes).

**Regression guard (the plan's dirty case):** the login page's `back={false}` case renders no back control, exactly as today's `showBackToHub={false}` — a rendering omission, not a behavior change, so nothing about the `hub`/`step`/`parent` modes above touches it. The theme toggle is unaffected by `back`'s value and renders regardless of it — dark/light preference isn't gated behind sign-in, unlike the hub link, which needs a hub to point at.

**`specs/003-ui-shell-foundation/research.md` §2 — flagged for correction:** that section's rejection of a visible toggle states: *"A manual visible toggle switch — rejected because no theme-switch control exists anywhere in `JOURNEY.md`'s locked page specs across all 7 pages; inventing one would add UI surface the design system never asked for."* JOURNEY.md's UPI Navigation-model amendment and this section now both specify one, so that sentence is superseded, not merely outdated — it must be corrected, not left standing beside the component spec it now contradicts. A short correction note pointing here has been added directly to that file; a full rewrite of §2 is implementation-phase work, not this phase's.

#### Dense-frame — the shared functional pattern

The four dense-data families are one functional pattern (Kholmatova: shared UI behavior) with four documented interiors. The outer chrome is identical everywhere, enforced by shared component tokens — that shared perceptual rhythm is what makes four genuinely different data shapes read as one family, without airing any of them out (§Direction: dense within the calm frame, by design).

**Chrome (every instance):** section header in {dense-frame.header.typography} / {dense-frame.header.color} → frame-edge hairline ({dense-frame.edge.color} at {dense-frame.edge.width}) → dense body → terminal frame-edge hairline. Interior row separation uses {dense-frame.divider.color}. Rows sit at {dense-frame.row.min-height} minimum with {dense-frame.row.padding} padding; the frame runs full-bleed to the {dense-frame.padding-x} gutters; consecutive frames are separated by {dense-frame.stack-gap} — the tight-inside / generous-between rhythm made structural.

**Shared states:** loading = skeleton rows in {color.surface.active} inside the real chrome (the frame never skeletons — structure is static); empty = the tool's verse empty state (§Expressive moments) replaces the interior, frame and header stay; error = inline at the affected row, never a frame-level takeover; success = the populated interior below.

**Interiors (each family's own layout):**

- **Heatmap (Habits):** a 7-column calendar grid of square cells, gap {heatmap.cell.gap}; weekday labels in {heatmap.label.typography} / {heatmap.label.color}. Complete cell: {heatmap.cell.complete.fill} — the one licensed solid-accent moment, exactly as locked — carrying an in-cell mark in {heatmap.cell.complete.mark} (v1 glyph: the asterisk, echoing the Habits mark). The mark, not the fill, carries complete/incomplete: the fill's contrast against the light page background is expressive, not informational (verified in the spec-check contrast set). This discharges the Phase 4 redundant-cue rule for the heatmap ahead of Phase 7's numeric-on-tap. Incomplete cell: {heatmap.cell.incomplete.fill}. Streak cap, legend, and full encoding: see §Heatmap streak ramp below.
- **Ledger (Expenses):** three-column rows — description in {ledger.row.typography}, date/payer meta in {ledger.meta.typography} / {ledger.meta.color}, amount right-aligned in {ledger.amount.typography} / {ledger.amount.color} with `font-variant-numeric: tabular-nums` so columns of figures align. The balance line states "you owe" / "you're owed" in words with an explicit sign as the primary cue; color is secondary reinforcement — see §Ledger balance indicator below.
- **Checklist (Groceries):** rows of checkbox box ({checklist.box.size} square, border {checklist.box.border} at {checklist.box.border-width} — the form-boundary ink, 3:1 verified) + item label. Checked: box fills {checklist.checked.fill} with a check mark in {checklist.checked.mark}, label struck through in {checklist.checked.label} — three redundant cues (fill, mark shape, strikethrough), never color alone.
- **Photo-card (Movies & TV · Food Reviews):** a 2-column grid, gap {photo-card.gap}; user imagery in original color inside hairline frames ({photo-card.frame.border} at {photo-card.frame.width}) — the frame is §Direction's imagery-containment device, not card chrome: no fill, no radius, no shadow. Caption in {photo-card.caption.typography} / {photo-card.caption.color} and meta in {photo-card.meta.typography} / {photo-card.meta.color} sit below the frame, unboxed.

#### Heatmap streak ramp + legend (Phase 7, `data-viz`)

**Chart type:** calendar heatmap — the Trend/time-series relationship, cited to the chart-selection decision table (Few/Cairo/Munzner); position already encodes the two temporal axes (day-of-week, week), so color is the one channel left for a third dimension, per Munzner's marks-and-channels framework. Full citation and the data-relationship reasoning live in the Phase 7 discovery note; this section specifies the built tokens.

**What the ramp encodes:** streak depth, not raw completion — completion itself stays the binary {heatmap.cell.complete.fill}/{heatmap.cell.incomplete.fill} split above, discharged by the in-cell mark. The ramp is a second, additional dimension layered on top of a completed cell: how many consecutive days precede and include it. Four levels, capped:

| Streak depth | Fill | In-cell mark |
|---|---|---|
| 1–2 days | {heatmap.cell.streak.level-1.fill} | {heatmap.cell.streak.level-1.mark} |
| 3–6 days | {heatmap.cell.streak.level-2.fill} | {heatmap.cell.streak.level-2.mark} |
| 7–13 days | {heatmap.cell.streak.level-3.fill} | {heatmap.cell.streak.level-3.mark} |
| 14+ days (cap) | {heatmap.cell.complete.fill} | {heatmap.cell.complete.mark} |

The cap reuses the existing complete-cell tokens unchanged — the licensed habit day-complete intensity is preserved as this ramp's ceiling, never exceeded, never diluted to every completed day. The three lighter levels use a mark ink token distinct from the cap's own ({heatmap.cell.streak.level-1.mark} etc., not {heatmap.cell.complete.mark}) because the cap's ink is fixed (mode-independent, matching its own mode-independent fill) while the lighter levels' fills are mode-dependent — a single fixed ink cannot legibly serve both; each pairing is independently contrast-verified by the spec-check (see the pairs added this phase). The ramp's ordering (every step relative to every other, in both modes) is monotonic by construction and verified by direct computation, not visual guess — see the Phase 7 discovery note and `phase7-dataviz-check.mjs`.

**Legend:** rendered once per heatmap, in {heatmap.legend.typography} / {heatmap.legend.color} — "Less" · four small swatches (incomplete → level-1 → level-2 → level-3 → cap) · "More, capped at 14+ days." The disclosed cap is what keeps an unbroken streak from breaking the scale (Cairo: a labeled truncation is not a lie).

**Redundant non-color cue (never color alone):** every cell carries a permanent, always-on accessible name stating the date, complete/not-complete, and streak-day count in plain text — independent of any interaction, so it isn't gated behind a tap for assistive tech. On tap/press, the same information surfaces visibly for sighted users as an inline caption in {heatmap.caption.typography} / {heatmap.caption.color} near the module header — no new chrome, no floating tooltip (this system has no elevation layer).

#### Ledger balance indicator (Phase 7, `data-viz`)

**Chart type:** a position-encoded diverging indicator — the Deviation-from-baseline relationship (chart-selection decision table), where the baseline is a true zero ("nobody owes anybody"). Built as a marker's position along a shared, zero-anchored hairline track rather than a filled bar: position is the most accurate channel (Cleveland & McGill), it needs less ink than a filled bar (Tufte), and it avoids a second claim on the one licensed solid-accent-fill moment reserved for the habit day-complete cell above.

**Anatomy:** a track in {ledger-balance.track} spans a fixed width; a center tick in {ledger-balance.tick} marks true zero. One marker per counterparty (a single row in the common two-person case): left of the tick in {ledger-balance.marker.negative} for "you owe," right of the tick in {ledger-balance.marker.positive} for "you're owed," resting exactly on the tick in {ledger-balance.marker.neutral} for "all settled." The marker is `aria-hidden` — the words-first balance line ("you owe $18.50" / "you're owed $12.00" / "all settled") is the primary, already-accessible cue; the marker is a sighted-only secondary reinforcement, never the sole carrier of the sign.

**Scale:** when two or more counterparties are shown, every row shares the same zero position and the same scale, sized to the largest balance currently shown (Few's scale-consistency rule) — the track's extent reflects real data, never an arbitrary fixed maximum. With a single counterparty, the marker sits at a fixed directional offset rather than a proportional one, since there is nothing to scale relative to yet — this avoids implying a precision the single value doesn't carry.

**Color choice:** {ledger-balance.marker.negative} deliberately draws from the warning family, not the error family — reusing error/red here would reconstruct the exact green/red pairing Phase 4's standing rule flags, and would overstate the tone (owing a normal split is not an error). {ledger-balance.marker.positive} reuses the accent ink already licensed elsewhere for done-stage markers and progress fill. {ledger-balance.marker.neutral} is a genuinely neutral ink, not a faded version of either extreme — the zero-balance state gets its own true representation, per the edge case.

#### Tag color ramp (Phase 2, `color` + `design-systems`)

**What it's for:** UPI's open-ended, user-defined transaction tags (Groceries, Rent, Dining, ...) need a categorical color aid so the transaction list and filter chips scan quickly — color is a secondary categorization channel here, never the tag's identity: the tag's own text label is always rendered alongside its swatch (chapter-08's actual "Must pass" bar — color is never the SOLE differentiator — is discharged structurally, by construction, not by this ramp's quality).

**Derivation method:** the same Lab/OKLCH-via-`palette.mjs` method the locked accent and functional ramps used (one `palette.mjs` invocation per hue — that hue as the seed, muted chroma, mono harmony), not a new engine. 8 swatches (the DW-2.1 floor) — fewer, more widely-spaced hues, chosen deliberately over the plan's 12-swatch ceiling once the derivation (below) showed that at this muted chroma, adding swatches measurably shrinks the space between them. Fill = each hue's **{tag-chip.swatch.\<name\>.fill}** (`-4` ramp step); text = **{tag-chip.swatch.\<name\>.text}** (`-11` step, the same ink role every other ramp in this system uses for on-tint text).

**Hue selection — distinct from the four functional hues, defensively also the accent:** every candidate hue was required to clear a >=25° circular margin from error (25°), warning (85°), success (145°), info (240°), *and* accent (157.5°) — the plan's own constraint names the four functional hues; accent is added here defensively, since a tag reading as "the app's own accent green" would be a worse collision than reading as e.g. the info blue. That leaves two safe arcs: a narrow teal/cyan gap between success/accent and info (~182.5°-215°) and a wide violet-through-pink gap between info and error (~267°-358°, capped below the hueName "red" bucket). One hue anchors the narrow arc (teal, 196°); the other 7 spread evenly across the wide arc (indigo 274°, violet 287°, orchid 300°, plum 313°, magenta 326°, rose 339°, berry 352°). Verified independently by `.design-foundations/build/upi-tag-ramp-check.mjs` (committed this phase) — PASS, exit 0: all 8 hues clear the >=25° reserved-hue margin, all pairwise >=8° apart, and every fill/text pair clears WCAG AA in both modes (light 4.80:1-5.06:1, dark 7.01:1-7.21:1, target 4.5:1 — see the script's run output for exact per-swatch figures).

**Why `-4`, not `-3`:** the mock's placeholder ramp used each hue's `-3` step. This phase's derivation found `-3`'s worst-case pairwise OKLab distance between adjacent swatches (full color vision, no simulation) was 0.0027-0.0044 — visually close to indistinguishable even before any colorblindness is considered. `-4` roughly doubles that separation (worst case 0.0080, between {tag-chip.swatch.violet.fill} and {tag-chip.swatch.orchid.fill}) while its contrast against `-11` text still clears AA with real margin in both modes — a strict improvement on both axes, not a tradeoff. This is the concrete instance of this phase's brief not rubber-stamping the mock's throwaway choice.

**Disclosed limitation (colorblind simulation):** `upi-tag-ramp-check.mjs` also ran the Viénot/Brettel/Mollon (1999) protanopia/deuteranopia simulation this project already uses (`.design-foundations/build/phase7-dataviz-check.mjs`) across all 28 swatch pairs, both modes. 9 of 112 simulated pairs (8%) fall under a 0.01 OKLab near-identity floor — mostly the tightly-packed middle of the wide arc (violet/orchid, rose/berry). This is a real, disclosed tradeoff of packing 8 hues into ~150° of hue space left over once the 5 reserved hues are excluded: full mutual distinguishability under both a reserved-hue exclusion *and* a colorblindness simulation is not achievable at 8 swatches without either raising chroma past "muted" (ruled out — the Never section's "no vivid/energetic/high-chroma color... throughout" is a whole-system rule, not accent-only) or dropping below the DW-2.1 floor of 8 swatches. Because tag identity's actual accessibility guarantee is the always-rendered text label (never the swatch alone), this is accepted rather than forced — matching how Phase 7 itself treated the CVD check for the heatmap (a secondary usefulness signal, not a redundant-cue requirement) rather than the stricter must-stay-distinguishable bar it used for the ledger's 3-state diverging indicator, where color IS a secondary carrier of a right/wrong answer.

**Cycling rule (the plan's stated edge case):** a 9th+ user-created tag reuses swatches by creation order, `index mod 8` — the 9th tag gets {tag-chip.swatch.teal.fill} again, the 10th gets indigo's, and so on. This is a stated, intentional rule, not a silent break: because the tag's text label is always the primary identity cue, two tags sharing a swatch past the 8th is a cosmetic repeat, not an ambiguity.

**Chip rendering:** {tag-chip.typography} (reuses {type.micro} — 12px, regular weight, matching this ramp's actual on-page size; no new type token minted for an 8-swatch chip). Zero border-radius, per the locked no-radius rule — a tinted rectangle, not a pill.

#### Transaction status indicator (Phase 2, `usability` + `color`)

UPI transactions carry one of 4 states — pending / success / failed / unconfirmed — and this is exactly the case chapter-08's Pattern 2 (Color-Only Status Indicators to Redundant-Cue Indicators) names directly: a status distinction with a real right/wrong reading, so color is never sufficient alone (unlike the tag ramp above, which has no "correct" answer to get wrong).

**Discharge — words + icon glyph, color as reinforcement only:** each state renders its plain-language word (Success / Failed / Pending / Unconfirmed — VOICE.md owns the exact copy, Phase 6) plus a leading icon glyph, both in {transaction-status.\<state\>.color}. Icon choice is licensed by this plan's icon-scope decision (lucide-react, since no existing typographic mark covers a 4-state status): `CheckCircle2` (success), `XCircle` (failed), `Clock` (pending), `HelpCircle` (unconfirmed — a genuinely open, not-yet-known state, not an error). Shape is the redundant cue a colorblind user reads when the color itself doesn't register — four visually distinct silhouettes, not four tinted copies of one glyph.

**Color reuse, not new tokens:** rather than minting a 5th color family, this reuses the four already-locked, already-contrast-verified functional inks 1:1 — success->{transaction-status.success.color} (={color.feedback.success.text}), failed->{transaction-status.failed.color} (={color.feedback.error.text}), pending->{transaction-status.pending.color} (={color.feedback.info.text}), unconfirmed->{transaction-status.unconfirmed.color} (={color.feedback.warning.text}). No new contrast verification is needed for the color layer — Phase 4's functional-ink-on-page-background report (both modes, all four hues) already covers it, and this phase's spec-check pairs additions re-verify the same four inks against {color.background} directly for the record; {transaction-status.typography} reuses {type.micro}, same as the tag chip above.

**Why `pending`->info and `unconfirmed`->warning (not the reverse):** pending is a normal, expected in-flight state (the payment is genuinely being processed) — info's calm blue fits Norman's affordance-signaling better than borrowing warning's amber for a non-problem. Unconfirmed is a real open question (the user tapped confirm and the app never got a definitive answer) — warning's "needs your attention" register fits better than info's fully-routine tone, and it avoids implying outright failure, which error/{color.feedback.error.text} would.

#### Primary CTA

One per page (Von Restorff — the isolated item is the remembered one; a second accent block would dissolve the isolation). A bottom-fixed bar ({cta.bar.background}, top hairline {cta.bar.divider}, padding {cta.bar.padding}) holds a full-width block: fill {cta.background}, label in {cta.label.typography} / {cta.label.color}, minimum height {cta.min-height} (Fitts 1954 — the largest, closest target on the page for each page's named primary action). **No drawn border at rest** — a filled block wrapped in its own hairline box is card chrome, and the locked Borders rule allows hairline *dividers* only (the two licensed exceptions — the photo-card's imagery frame and the form-control boundary ink — don't apply: unlike an empty input or checkbox, this control is identified without a boundary by its fill, semibold label, width, and position, so the bar's top hairline stays the only structural line). The accent tint is the isolation device (Von Restorff): the block is the page's sole accent-tinted region. Focus-visible: outline in {cta.border.color} at {cta.border.width}, offset outside the block (WCAG 2.4.7 — the border tokens' one consumer). Pressed: {cta.background-active}, no transform. Disabled: {color.surface.active} fill, {color.text.secondary} label — visually quiet, still readable. Loading: label swaps to a progress phrase; the block never becomes a spinner-only target. Secondary actions are plain text at {cta.min-height} tap height, physically separated from the bar (JOURNEY.md: a rushed tap must not misfire).

#### Form field + the bill edit form

**Field molecule:** top-aligned label ({form-field.label.typography} / {form-field.label.color}) above the input ({form-field.input.typography} at 16px — the iOS auto-zoom floor from §Type scale — text {form-field.input.text} on {form-field.input.background}, boundary {form-field.input.border} at {form-field.input.border-width}). Fields inside a group sit {form-field.gap} apart; groups sit {form-field.group-gap} apart — the same rhythm tokens as everything else.

**Validation:** on blur, never per keystroke ("reward early, punish late"). Error state = three redundant cues: boundary switches to {form-field.error.border}, an icon glyph appears, and a message in {form-field.error.text} sits under the field (microcopy: Phase 6, Yifrah's what/why/fix formula). Amount inputs are forgiving (Postel): "12", "12.5", "$12.50", and comma decimals all accepted, normalized on blur — the system absorbs format complexity (Tesler), the user is never corrected for a parseable answer.

**The bill edit form** (the line-item edit screen, per the flow's Miller/Cowan flag): exactly three chunks — Items, Adjustments (tax · tip · discount), Split — each a labeled group (~4±1 held; the user compares the screen against a physical receipt, which is real working-memory load, not a menu-cap misuse). A **reconciliation row** (Nielsen #5, error prevention) is pinned above the CTA: the entered-items sum vs the detected bill total, both shown as figures. On mismatch it becomes a warning banner ({banner.surface.warning} / {banner.text.warning}, icon + text) naming both numbers; it warns, it never blocks — totals can legitimately differ, and the user's judgment wins.

#### AI-parse status (Nielsen #1)

Parsing a bill takes seconds — squarely in the 1–10s feedback band, so the surface is **staged determinate progress**, not a bare spinner: three stages named in bill terms, not OCR jargon (Nielsen #2) — *Capture* → *Reading the photo* → *Itemizing*. Done stages in {parse-status.stage.done.color} with a leading check glyph (shape + ink, not color alone), the active stage in {parse-status.stage.active.color}, pending in {parse-status.stage.pending.color}; stages sit {parse-status.gap} apart above a thin track ({parse-status.track.color}) whose fill ({parse-status.fill.color}) advances per completed stage — honest stage-level progress, never a fake percentage. The captured photo stays on screen, full-bleed between frame-edge hairlines ({dense-frame.edge.color} at {dense-frame.edge.width}) — the same edge treatment as every dense-frame module, never an inset framed box, which would read as card chrome (Never: hairline dividers are the only structural device) (Nielsen #6 — the user can verify what the system is reading). **Cancel is always present** (Nielsen #3): a plain-text exit at {cta.min-height} tap height that returns to capture with the photo retained; the capture screen also carries "enter items manually" as a standing secondary path (Nielsen #7 — manual entry is an always-available route, not a failure-only concession). Past ~10s a stage appends a still-working line and Cancel remains (the 10s+ rule). Motion: opacity fades within the §Motion budget; under reduced-motion, state changes are instant.

#### Parse failure + manual entry (Nielsen #9)

Failure is a first-class surface, never a toast. A banner ({banner.surface.error} / {banner.text.error}, leading icon glyph + text — kind is never encoded by hue alone) states what happened and why in plain terms, with zero blame toward the user or the photo (microcopy: Phase 6, Yifrah formula). The captured photo stays on screen (Nielsen #6). Exactly **two** recovery options (Hick — a rattled moment is the worst time for a menu): **Retry photo** (primary CTA styling, returns to capture) and **Enter items manually** (secondary, equal tap height). Manual entry is a real form, not a consolation: it shares the ledger interior (same row anatomy: description + right-aligned tabular-numeral amount), the same three-chunk edit form, and the same reconciliation row against the detected total when one exists — everything downstream (confirm & save, ledger update) is identical (Nielsen #4; Jakob — one learned shape). The AI path is an accelerator, never a gatekeeper.

#### Redundant-cue discharge (the Phase 4 standing rule)

Green accent + red error means every state distinction must survive without color (~10% of male users are red-green colorblind). Discharged per component:

| Surface | Color layer | Non-color cue that carries the information |
|---------|------------|--------------------------------------------|
| Heatmap complete cell | {heatmap.cell.complete.fill} | In-cell mark in {heatmap.cell.complete.mark} |
| Heatmap streak ramp (Phase 7) | {heatmap.cell.streak.level-1.fill} / level-2 / level-3 | Always-on accessible text per cell (date + streak-day count) + numeric caption on tap; ramp order also verified to survive CVD simulation as a secondary check |
| Form validation error | {form-field.error.border} / {form-field.error.text} | Icon glyph + message + boundary state change |
| Feedback banners (all four kinds) | {banner.surface.*} / {banner.text.*} | Leading icon glyph + plain-language text |
| Ledger balance (Phase 7) | {ledger-balance.marker.positive} / .negative / .neutral | "you owe" / "you're owed" / "all settled" words + explicit sign, primary — the marker is `aria-hidden` and secondary |
| Checklist checked | {checklist.checked.fill} | Check-mark shape + label strikethrough |
| Parse stages | {parse-status.stage.done.color} | Check glyph + list position |
| Pin state | {tool-card.pin.active-color} | Glyph shape (filled vs outline) + presence in the rail |
| Transaction status (Phase 2, UPI) | {transaction-status.success.color} / .failed / .pending / .unconfirmed | Plain-language word (Success/Failed/Pending/Unconfirmed) + a distinct lucide icon glyph per state (CheckCircle2/XCircle/Clock/HelpCircle) — reuses the four already-verified functional inks, no new color |

<!-- spec-check:prose-end -->

## Open questions

- ~~Exact display/body typefaces~~ — resolved Phase 4: Newsreader (display) + Inter (body), see Type section.
- ~~Full functional-color set + redundant-cue rule~~ — resolved Phase 4: see Functional colors section. Redundant-cue rule stands as a requirement for Phase 5/Phase 7 to implement, not just document.
- ~~Component-level token tiers (global/alias/component, W3C DTCG format) and the launcher-card + four dense-data-family specs~~ — resolved Phase 5: see Design system section. Heatmap/ledger encoding detail (streak cap, legend, balance color semantics) remains with Phase 7; microcopy with Phase 6.
- ~~Heatmap streak ramp (cap + legend) and ledger balance diverging encoding~~ — resolved Phase 7: see §Heatmap streak ramp + legend and §Ledger balance indicator. Both colorblind-verified (`phase7-dataviz-check.mjs`) and checked against the Cairo lie taxonomy (Phase 7 discovery note).
- ~~UPI's tag color ramp, transaction-status redundant cue, and ToolCard glyph~~ — resolved UPI-plan Phase 2 (2026-07-20): see §Tag color ramp, §Transaction status indicator, and the ToolCard section's new UPI instantiation. Ramp colorblind-verified (`upi-tag-ramp-check.mjs`) with a disclosed limitation (8% of simulated swatch pairs fall under the near-identity floor — accepted because tag color is never the sole identity channel, the text label always is). `mark: "₹"`'s Newsreader glyph coverage is assumed, not yet visually confirmed — flagged for the phase that first renders the launcher shelf with UPI present.
- ~~PageHeader's back-control behavior for UPI's 3-level exception, a visible theme toggle, and the icon-usage scope~~ — resolved UPI-plan Phase 3 (2026-07-20): see §Icon usage and §Shell chrome — PageHeader. Back control unified into one `hub`/`step`/`parent`/`false` contract (all 6 pre-UPI tools default to `hub`, unaffected); theme toggle wired to `next-themes`, both icon states verified against the already-locked neutral-11/background pairing (light 5.65:1, dark 8.79:1). `specs/003-ui-shell-foundation/research.md` §2's no-visible-toggle rationale is now superseded — a correction note was added directly to that file rather than silently left contradicting this section.
