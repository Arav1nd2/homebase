# VOICE.md — Voice & tone

**Date:** 2026-07-18 · **Status:** confirmed (Phase 6 — Words)
**Extends:** DESIGN.md's Register line ("calm structure · expressive at: empty states set as short verse, the habit day-complete accent fill, oversize punctuation at page heads") — this spec makes that register operational as an actual language system, with copy evidence, not just a visual-DNA description.
**Doctrine:** `content-design` (`references/content-design/content-design.md`, `content-principles.md`, `microcopy-patterns.md`)

---

## Voice (stable — Podmajersky's voice-chart method)

Per `content-principles.md`'s explicit warning ("Our voice is friendly, helpful, and clear" is not a voice — these are aspirations any brand claims; a voice must differentiate AND constrain), the four attributes below are concrete, falsifiable, and each paired with a citation to why it's the right constraint for *this* app rather than an arbitrary personality choice.

| Attribute | In-range | Out-of-range | Why (citation) |
|---|---|---|---|
| **Measured** — economical, unhurried sentences; no breathless pacing | "Today's log is saved." | "Amazing! You just logged your habit! Keep the streak alive!!" | Sage's visual gravity (DESIGN.md's archetype derivation: "muted palette... no decoration") extended to word choice; Yifrah: reserve exclamation marks for genuine user successes, never as default punctuation |
| **Exact** — the real number, name, or date; never a vague gesture | "You owe Priya $18.50 for Tuesday's dinner." | "You have some outstanding expenses with a friend." | Redish: plain language means concrete, not vague — "removes the file permanently" beats "destructive action"; also the standing redundant-cue rule (DESIGN.md §Functional colors) that a balance must never rely on color alone — words carry the exact fact |
| **Companionable, not chirpy** — quiet acknowledgment at real completion moments; never forced cheer or a mascot voice | "Saved. That's one more evening worth remembering." | "Woohoo! Review saved! 🎉 You're on a roll!" | DESIGN.md's archetype lock: "a Caregiver inflection on motion + tone only" — this attribute is deliberately a *tone* shift at genuine completion moments (Podmajersky's tone-mapping table: success = warmer, within brand register), not a blanket personality trait; keeping it tone-scoped honors the lock rather than overriding it |
| **Plain about limits** — failure and uncertainty named directly, no spin, no apology theater, no blame (toward the user or the system) | "The bill didn't come through clearly enough to read. Retry the photo, or enter the items yourself." | "Oops! Something went wrong. Please try again later." / "You uploaded an unclear photo." | Yifrah's error formula (what → why → fix, never blame, never a dead-end) + the plan's explicit edge case that the AI-parse failure must carry "zero blame language" toward the user *or* the AI |

Four attributes (within the plan's 3–5 range) — each stable across every page and every state; what changes by content type is **register**, below, not voice.

---

## Register split (Podmajersky: voice is stable; register/formality varies by content type)

This is the word-choice mirror of Phase 4's serif/sans type split — the same boundary line, restated for content rather than typography. DESIGN.md itself draws the line: *"navigation, forms, the ledger and checklist rows themselves, loading/error states — holds the calm structure register"* (i.e., NOT the literary one). Phase 6 makes that explicit as a content rule:

| Register | Where it's licensed | Token | Rule |
|---|---|---|---|
| **Literary** (verse) | First-ever-use empty states, all 7 tools (UPI included) — 2-4 short lines, framed by the 96px bracket signature mark. This is an extensible set: when a new 8th tool is added, add it to this list and its empty-state copy gains the literary register automatically, without re-opening the voice spec. | `--font-display` (Newsreader) at `--text-lg` (18px) — the Phase 4-stated floor: *"18px is the floor at which the serif is licensed to appear... the serif must earn its keep at sizes where its screen-cut structure actually reads."* No DTCG alias yet names this specific combination (Phase 5's `type.*` aliases stop at `display-mark`/72px and `h1`/32px — neither fits multi-line prose); the raw custom properties are already locked and AA-verified, so this phase cites them directly rather than minting a new alias outside its own `Produces` contract. Flagged for a future consolidation pass. | One moment per page maximum (mirrors the signature-move's "one mark per page head" discipline); never used for a sentence that will recur or scroll past a single screenful; never used for anything actionable-repeatable (a CTA label, a form field) |
| **Plain / scannable** (Redish, front-loaded) | Everything else: CTAs, form fields/helper text, dense-data rows (ledger, checklist, heatmap stat labels), all loading/error/success confirmations, the Launcher's quick-start empty invite (see note below) | `--font-body` (Inter) via the existing dense-family aliases — `type.dense`/`type.dense-emphasis`/`type.micro`/`type.body`/`type.cta-label` (all `font.family.body`, Phase 5, unchanged) | Front-loaded (the key fact/action first); active voice; second person; no jargon; digits not words (Redish) |

**Why the Launcher's quick-start empty state is plain, not literary:** DESIGN.md scopes the verse treatment to "first-ever-use empty states... all 7 tools" — a zero-data moment for a *tool*. The Launcher's quick-starts-empty state is a different kind of moment: a persistent chrome nudge ("pin something"), not a tool's first-use moment. Treating it as a "big moment" would be the actual register violation; keeping it plain ("Pin the tools you open daily.") is the consistent read of the lock.

**Why loading/error/success stay plain even though they're "moments":** Yifrah's own tone rule agrees independently — *"Tone: calm and direct. Errors are not the place for personality; they are the place for precision"* — which converges with DESIGN.md's structural line rather than contradicting it. A calm, unadorned register is the correct register for a message the user needs to act on under mild stress, regardless of the app's literary identity elsewhere.

---

## Tone map (Podmajersky: voice stable, tone shifts by moment)

| Moment | Tone direction | What shifts | Example |
|---|---|---|---|
| Empty state (first use, 6 tools) | Literary, unhurried, low-pressure | Full expressive register — the one place tone and register both lean in | "Nothing kept yet. Name the first thing worth doing daily — the streak begins the moment you do." (Habits) |
| Error / failure | Calm, precise, zero personality | Voice stays Measured + Plain-about-limits; no Companionable warmth borrowed here — a stressed moment isn't where warmth reads as sincere | "Today didn't save. The connection may have dropped. Tap Log again; nothing else was lost." |
| Success / completion | Companionable (the one place the Caregiver-inflection tone shift is licensed), still Measured — no exclamation-mark default | Slightly warmer, brief acknowledgment, no confetti/toast chrome (DESIGN.md bars shadows/elevation; this ships as an `aria-live` announcement, not a visible pop-up) | "Saved. That's one more evening worth remembering." (Food Reviews) |
| Loading / in-progress | Plain, present-progressive, real-world terms (Nielsen #2 — not OCR jargon) | Named stages instead of a bare spinner where the wait crosses ~1s | "Reading the photo…" not "Processing OCR extraction…" |
| Warning (non-blocking, e.g. bill-total mismatch) | Plain, exact figures, explicitly non-blocking | States both numbers; never inflates to alarm | "Entered $21.90 · the bill reads $25.90. Tax or tip may explain the gap — you can still save." |

---

## Error message formula (Yifrah) — the standing rule this phase enforces

> **What happened → why (if not obvious) → how to fix it.** Never blame the user. Never a dead-end.

Applied to every error state named in JOURNEY.md's 7 page specs plus the Expenses flow's two branch-specific failures and the Launcher's pin-persistence failure — 10 moments total, each checked against this formula in the Phase 6 discovery file's DW-6.2 evidence table (`.design-foundations/build/2026-07-17-homebase-phase-6-discovery.md`).

### The worked example: Expenses' AI-parse failure (the plan's flagged highest-stakes moment)

Money + trust in an AI system, per the plan's edge case. Before (Phase 5's provisional placeholder, now superseded):

> "We couldn't read this photo. The text was too blurry to pick out line items. Your photo is kept below — retake it, or enter the items yourself."

This fails on one count: **"We couldn't..."** centers the company/system, not the user's problem (`microcopy-patterns.md`'s Anti-patterns table: *"'We' language in error messages... centers the company, not the user's problem"*). The rest of the line already worked (no blame toward the user's photo, a real cause named, two live recovery paths). Fixed:

> "The bill didn't come through clearly enough to read. Low light or a tilted photo can do that. Retry the photo, or enter the items yourself: either way they land in the same ledger."

- **What happened:** "didn't come through clearly enough to read"
- **Why, plain, zero blame toward the user or the AI:** "Low light or a tilted photo can do that" — an external, ordinary, physical cause (not "you took a bad photo," not "the AI couldn't understand it")
- **How to fix:** "retry the photo, or enter the items yourself"
- **No dead-end:** "either way they land in the same ledger" — the manual path isn't a downgrade

Buttons: **Retry photo** (primary) / **Enter items manually** (secondary) — exactly two recovery options (Hick's law, per DESIGN.md's component spec), both already named in the Design-system section and unchanged here.

---

## Citations

Yifrah, *Microcopy: The Complete Guide* (2017/2022) — error formula, exclamation-mark rule, no-blame/no-dead-end. Podmajersky, *Strategic Writing for UX* (2019) — voice/tone/register distinction, voice-chart method, tone-mapping table. Redish, *Letting Go of the Words* (2007/2012) — plain language, front-loading, exactness, scannability. Metts & Welfle, *Writing Is Designing* (2019) — words as design material; the "we"-language anti-pattern. Richards, *Content Design* (2017) — start with user need, not system output.
