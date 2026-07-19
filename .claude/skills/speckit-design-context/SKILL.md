---
name: "speckit-design-context"
description: "Bridge speckit feature specs with the design-for-ai design system: pull the matching DESIGN.md/JOURNEY.md/design/VOICE.md/design/mocks context into the feature's design-reference.md, and give the rules for keeping design docs and code from drifting apart."
argument-hint: "Feature directory (e.g. specs/003-habit-tracker) or a page/feature name; defaults to the active feature in .specify/feature.json"
compatibility: "Requires a spec-kit project (.specify/) and, optionally, a design-for-ai design system (DESIGN.md/JOURNEY.md at project root)"
metadata:
  author: "project"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Why this skill exists

Two toolchains coexist in this repo and **do not know about each other**:

- **speckit** (`.specify/`, `specs/<feature>/spec.md|plan.md|tasks.md`) — functional requirements, technical plan, task breakdown. `spec.md` is deliberately implementation-agnostic: no tech stack, no visual details, no UI specifics.
- **design-for-ai** (`DESIGN.md`, `JOURNEY.md` at project root; `design/VOICE.md`, `design/mocks/` — see [CLAUDE.md](../../../CLAUDE.md)) — the visual/UX source of truth: locked design tokens, IA, page specs, copy voice, pixel-accurate mocks.

Nothing auto-links a speckit feature to the design docs that govern its UI. This skill is that link: it produces `specs/<feature>/design-reference.md`, a Phase-1-style artifact in the same family as `research.md`/`data-model.md` that already exist in this project's feature directories — a technical contract `plan.md`/`tasks.md` can cite, kept separate from `spec.md` so `spec.md` stays implementation-agnostic.

## When to use this

- After `/speckit-specify`, before `/speckit-plan`, for any feature with a user-facing UI surface.
- Again before `/speckit-implement`, in case the design docs changed since planning.
- Any time DESIGN.md, JOURNEY.md, or `design/VOICE.md` are hand-edited — to refresh every `design-reference.md` file affected.

## Steps

1. **Resolve the feature directory.**
   - Use the directory the user passed, if any.
   - Otherwise read `feature_directory` from `.specify/feature.json`.
   - If neither resolves, ask which feature this run is for — do not guess.

2. **Read the feature's `spec.md`** for its title, user stories, and key nouns (the surface(s) it touches).

3. **Check what design-system state actually exists:**
   ```bash
   ls DESIGN.md JOURNEY.md design/VOICE.md 2>/dev/null
   ```
   - Neither `DESIGN.md` nor `JOURNEY.md` present → write a short `design-reference.md` stating no design system exists yet, and stop. Don't invent tokens or page structure.
   - Present but not locked (no CSS token block in `DESIGN.md`, or `JOURNEY.md` has no `## Page specs` entries) → note that explicitly; treat as wireframe-only.

4. **Match the feature to a `JOURNEY.md` page spec.**
   - Search the `## Page specs` section for an entry whose name/slug/keywords overlap the feature's title or key nouns.
   - Exactly one match → extract the full page-spec block: structure, hierarchy, content slots, the Microcopy block, the Chart-encoding block if present.
   - Multiple plausible matches → list them and ask the user to pick; never guess silently.
   - No match → state plainly "no `JOURNEY.md` page spec matches this feature — this UI surface hasn't been designed yet," suggest `/design-for-ai:plan` as a next step, and do not block speckit's own flow on it.

5. **Pull only the `DESIGN.md` tokens/components the matched page actually uses.**
   - From the page spec, collect every referenced token or component name (e.g. `--accent-solid`, `ToolCard`, `Dense-frame`, the heatmap streak ramp).
   - Quote those specific token values / component-spec sections from `DESIGN.md`. Don't paste the whole file — only what this feature touches.

6. **Pull the relevant voice/tone rule from `design/VOICE.md`.**
   - Read its register-split rule, plus whatever worked example the matched `JOURNEY.md` microcopy block cites by name.

7. **Check for a rendered mock:** `ls design/mocks/*.html`. If one matches the page, cite its path as the pixel-accurate baseline; if none exists, say so.

8. **Write `specs/<feature>/design-reference.md`:**

   ```markdown
   # Design Reference: [Feature Name]

   **Source feature**: [path to spec.md]
   **Design system state**: [locked / wireframe-only / absent] — regenerate this file if DESIGN.md, JOURNEY.md, or design/VOICE.md change.

   ## Matched page spec
   [JOURNEY.md page-spec excerpt, or "none — undesigned surface"]

   ## Tokens & components in play
   [extracted DESIGN.md excerpts, cited by section]

   ## Voice & copy
   [design/VOICE.md register rule + the relevant worked example, if any]

   ## Mock reference
   [design/mocks/<page>.html path, or "none rendered yet"]

   ## Open gaps
   [anything this feature needs that the design docs don't cover — surface it, don't paper over it]
   ```

9. **Report to the user**: what matched, what's missing, and whether it's safe to move on to `/speckit-plan` / `/speckit-implement`, or whether a design-for-ai pass should happen first.

## Revision discipline — read before hand-editing DESIGN.md / JOURNEY.md / design/VOICE.md mid-implementation

These are the design system's source of truth, not per-feature scratch notes. `DESIGN.md`'s token block is "law-once-locked" per the design-for-ai plugin's own doctrine — implementation should never silently drift from it.

- **Token-level tweaks** (a color, a font swap): re-run the design-for-ai plugin's `scripts/palette.mjs` and paste the fresh token block. Never hand-edit hex/rgb values directly in `DESIGN.md`.
- **Page-spec, IA, or copy fixes**: hand-edit `JOURNEY.md` / `design/VOICE.md` directly.
- **Structural changes** (a new page, a new flow, a DNA-level pivot): run a real `/design-for-ai:plan` → `/design-for-ai:mock` → `/design-for-ai:build` pass, not a quick edit — the mock/sign-off gate exists specifically to catch this before it lands in code.
- **Commit the doc change in the same commit as the code change it justifies**, using the `docs(design): ...` convention already used in this repo's history. Never let shipped UI and the design docs diverge silently — the next feature's `design-reference.md` depends on these docs staying trustworthy.
- **Re-run this skill afterward** to refresh every `design-reference.md` the change affects.

## Done When

- [ ] `specs/<feature>/design-reference.md` exists and cites concrete `DESIGN.md`/`JOURNEY.md`/`design/VOICE.md` sections — not paraphrased or invented ones
- [ ] Any mismatch between the feature and the current design docs is surfaced explicitly, not silently resolved
- [ ] User is told whether it's safe to proceed to `/speckit-plan`/`/speckit-implement`, or whether a design pass is needed first
