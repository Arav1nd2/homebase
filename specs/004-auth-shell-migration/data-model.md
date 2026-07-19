# Phase 1 Data Model: Auth Shell Migration

This feature persists nothing new to a database — the Household Member
Account, Sign-In Session, One-Time Code Challenge, and Allowed Email List
entities are all defined and unchanged in
`specs/002-email-otp-auth/data-model.md`; this feature only changes how
they're presented and how access to them is organized in code. What
follows is the shape of the new/changed UI-layer contracts, extending
`specs/003-ui-shell-foundation/data-model.md`'s "Design Token" and "Page
Shell" entities rather than replacing them.

## Design Token (extended)

003-ui-shell-foundation defined this entity and transcribed Tier 1
(global) and Tier 2 (alias) tokens. This feature adds the first Tier 3
(component) tokens to be transcribed into code — `form-field-*` and
`cta-*`, both already locked in `DESIGN.md` but not yet implemented
(research.md §6).

| Field | Type | Notes |
|---|---|---|
| CSS custom property name | `string` (e.g. `--form-field-label-color`, `--cta-background`) | Matches `DESIGN.md`'s Tier 3 DTCG token path (`form-field.label.color`, `cta.background`), kebab-cased per the existing convention. |
| Resolves to | Tier 1/2 reference | Every new Tier 3 value points at an already-existing Tier 1/2 primitive (e.g. `--cta-background: var(--accent-3)`) — no new color/size decision, only new names for already-locked values. |
| Mode-dependent? | `boolean` | Color tokens (`form-field-input-border`, `cta-background`, etc.) need both `:root` and `[data-theme="dark"]` values; the two new dimension-only tokens (`form-field-gap`, `cta-min-height`) do not. |

**Validation rule**: Every color/typography/spacing value used by
`components/shared/form-field.tsx` and the login screen's submit button
MUST resolve to one of these tokens — no inline hex/px value (inherits
003's FR-001 rule, now exercised by a form for the first time).

## Page Shell (extended)

003-ui-shell-foundation's `PageHeader` contract stated the back-to-hub
affordance is always rendered, with no suppressing prop. This feature
changes that contract (Clarifications session, FR-014):

```ts
type PageHeaderProps = {
  mark?: string;
  title: string;
  /**
   * Whether the back-to-hub affordance renders. Defaults to `true` so
   * every existing/future tool-screen call site is unaffected; the auth
   * screens are the first (and, as of this feature, only) caller passing
   * `false` — a signed-out visitor has no hub to return to (research.md §8).
   */
  showBackToHub?: boolean;
};
```

**Validation rule**: `mark`, `title`, and the shell's typography/spacing
tokens behave identically to 003's original contract; only the back-to-hub
affordance's presence becomes conditional. No other configurability is
added — the shell still owns nav-bar/search suppression unconditionally
(003 FR-007/FR-008, untouched).

## Form Field (new)

A new shared molecule, matching `DESIGN.md`'s already-locked "Form field"
component spec (line 851) — not a data entity, a component contract:

```ts
type FormFieldProps = {
  /** Field id, shared between the <label htmlFor> and <input id>. */
  id: string;
  /** Visible label text (form-field-label-* tokens). */
  label: string;
  /** Validation error, shown under the field with an icon + boundary
   *  color change once the field has been blurred and TanStack Form's
   *  on-blur validator has run — never per-keystroke (DESIGN.md: "reward
   *  early, punish late"). */
  error?: string;
} & React.ComponentProps<"input">;
```

**Validation rule**: An error is never shown before the field's first
blur (matches `DESIGN.md`'s on-blur validation rule and TanStack Form's
`validators.onBlur`). When present, the error is carried by three
redundant cues — boundary color, icon glyph, message text — never color
alone, matching the existing `ErrorState`/`checklist`/`heatmap` pattern
already established for every other feedback surface in `DESIGN.md`'s
"Redundant-cue discharge" table.

## Auth Screen Form State (client-only, not persisted)

The login screen's own UI state — not an entity, since none of it is
stored beyond the page's lifetime:

| Field | Type | Notes |
|---|---|---|
| `step` | `"email" \| "code"` | Which half of the flow is showing. Local `useState`, not TanStack Form or a global store (research.md §3) — it's page-navigation state, not form field state. |
| `email` field state | TanStack Form field, validated against `emailInputSchema` | On blur. |
| `code` field state | TanStack Form field, validated against `verifyCodeInputSchema` | On blur; numeric-only input mode preserved from the existing implementation. |
| `submitting` | `boolean` | Drives the submit button's disabled/label state (unchanged behavior from the existing implementation, now sourced from TanStack Form's own submission state where applicable). |
| Server-rejected error (wrong/expired code, request failure) | `string`, rendered via `ErrorState` | Distinct from a field-level validation error — this is a whole-step failure (FR-010), not a single field's blur-validation message. |

## Explicitly out of scope for this data model

- **Any client-readable "am I authenticated" state** — no store, no
  context; see research.md §3. Every access-control decision remains
  server-side (`middleware.ts`, `getSessionOrThrow()`), unchanged from
  002-email-otp-auth.
- **New Route Handler request/response shapes** — none change; see
  `specs/002-email-otp-auth/contracts/auth-api.md`, still authoritative
  and referenced, not duplicated, by `contracts/auth-ui.md` in this
  feature.
