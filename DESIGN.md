# Design: Verse Margin
**Date:** 2026-07-18 · **Status:** confirmed

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

Direction only — exact faces, the numeric scale, and weights are Phase 4's job (Type + color). This phase fixes the *voice*:

- **Display:** a sharp screen serif in the Newsreader/Spectral direction — a vertical-axis, screen-cut serif structure (not a print-optimized humanist serif with an angled axis), so it stays crisp at both the H1 sizes and the oversize-punctuation signature sizes. Strictly reserved for display moments (H1s, the signature punctuation marks) — never for body copy or dense UI text.
- **Body:** a clean humanist sans, suited to small mobile sizes (the direction excludes geometric sans forms, which render poorly at body sizes on a pixel grid). Carries all dense-data microcopy, labels, ledger/checklist rows, and UI chrome. This is Medium's reading-view half of the grounding collision — proven serif-at-margin comfort on a phone, but with the sans doing the load-bearing legibility work at small sizes.
- Scale, leading, and weight range are explicitly deferred to Phase 4; this phase commits only to the serif-display/sans-body split and the direction of each.

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

Background is the quiet green-tinted near-white `#fcfdfc` in light mode (the cool-leaning stance named at converge, not warm cream) and a green-tinted near-black `#121312` in dark mode (never flat `#000`, matching the ch09 shadows/dark-surface rule). Full functional-color ramps (error/success/warning/info at 3/9/11 levels shown here) and the complete type-paired token set are extended in Phase 4 — this phase locks the base neutral + accent ramps and confirms both modes clear AA.

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

- Exact display/body typefaces (Newsreader/Spectral direction confirmed here; final selection + full numeric scale) — Phase 4 (Type + color).
- Full functional-color set (error/success/warning/info at complete ramp levels) and the standing green-accent/red-error redundant-cue rule — Phase 4.
- Component-level token tiers (global/alias/component, W3C DTCG format) and the launcher-card + four dense-data-family specs — Phase 5 (Design system).
