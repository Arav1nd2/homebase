# Phase 0 Research: UI Shell Foundation

All open questions below were either resolved directly with the user
(marked **User decision**) during `/speckit-plan`, or resolved by reading
this project's own already-locked design documentation and existing
prototype artifacts (marked **Grounded in repo**) rather than invented.
Nothing here was decided by generic best-practice guessing alone where a
repo-specific answer already existed.

## 1. Tailwind CSS major version

**Decision**: Tailwind CSS v4 (`tailwindcss` + `@tailwindcss/postcss`),
CSS-first configuration via an `@theme` block in `styles/globals.css`. No
`tailwind.config.ts`.

**Rationale (User decision)**: Asked directly since nothing is installed
yet (`packages/web/package.json` has zero Tailwind/shadcn dependencies,
confirmed by inspection) — no migration cost either way. v4's `@theme`
directive makes CSS custom properties *be* the theme source, which is a
more direct match for FR-001/FR-002's "CSS variables, no hard-coded
values" requirement than v3's `tailwind.config.ts` (where JS theme values
merely *reference* CSS variables one layer removed). It's also shadcn/ui's
current default for new installs as of this project's era.

**Alternatives considered**: Tailwind v3 (`tailwind.config.ts` +
`theme.extend`) — more mature ecosystem/examples, but adds an indirection
layer the brief doesn't need and there's no existing v3 investment to
preserve.

**Integration note**: Tailwind v4 changed how the `dark:` variant is
derived — by default it follows `prefers-color-scheme` only. Supporting a
class/attribute-based override (needed for §2 below) requires redefining
the variant in `globals.css`:
```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```
This must ship alongside the `@theme` block — a bare v4 install without it
would silently fall back to OS-only dark mode and break the forceable
override FR-015 requires.

## 2. Light/dark mode switching mechanism

**Decision**: `next-themes`, configured with `attribute="data-theme"`,
`defaultTheme="system"`, no visible in-app toggle UI. A force-override for
verification only (e.g. `/styleguide?theme=dark`), not a shipped user
control.

**Rationale (User decision + Grounded in repo)**: Asked directly because
FR-015 requires the example screen to be *verifiably* rendered in both
modes, which a pure `prefers-color-scheme` CSS media query can't satisfy
without changing OS/devtools settings — `next-themes` gives a
`ThemeProvider` that still defaults to system preference but can be
overridden programmatically. The `attribute="data-theme"` choice (rather
than the more common `attribute="class"`) is not arbitrary: it matches the
*exact* mechanism already prototyped in this project's own design-phase
rendered mock,
`.design-foundations/build/2026-07-17-homebase-phase-7-mock.html`:
```html
<button class="toggle" onclick="document.documentElement.dataset.theme =
  document.documentElement.dataset.theme === 'dark' ? '' : 'dark'">toggle theme</button>
```
```css
[data-theme="dark"] { --neutral-1: #121312; ... }
```
Using the same attribute the design phase already validated against means
the CSS token blocks below can be lifted close to verbatim rather than
re-authored under a different convention.

**Alternatives considered**: CSS-only `prefers-color-scheme` (zero
dependency, but no in-app way to force a mode for verification — rejected
per FR-015). A manual visible toggle switch — rejected because no
theme-switch control exists anywhere in `JOURNEY.md`'s locked page specs
across all 7 pages; inventing one would add UI surface the design system
never asked for.

**SSR/hydration note**: `next-themes` requires `suppressHydrationWarning`
on `<html>` in `app/layout.tsx`, since the resolved theme is only known
client-side on first paint.

## 3. Design token values and how they reach the shipped CSS

**Decision**: `styles/globals.css`'s `@theme` block and `:root` /
`[data-theme="dark"]` custom-property blocks are transcribed by hand
directly from `DESIGN.md`'s own `<!-- dtcg:global -->` / `<!-- dtcg:alias -->`
/ `<!-- dtcg:component -->` JSON blocks (§Design system) — not re-derived,
not approximated. The already-rendered mock at
`.design-foundations/build/2026-07-17-homebase-phase-7-mock.html` (and its
siblings for phases 4-6) contains a working CSS translation of these exact
values already reviewed and screenshotted in both modes
(`.design-foundations/build/screenshots/phase5-dw54-{light,dark}-full.png`,
etc.) — it is the ground-truth reference to transcribe from, not a
from-scratch re-authoring of `DESIGN.md`'s prose.

**Automated drift-checking — considered and declined**: An earlier version
of this plan required an automated check verifying the shipped tokens
against `DESIGN.md` on every PR (former FR-016/SC-006), built around
`.design-foundations/build/phase5-spec-check.mjs`. A `/speckit-analyze`
pass surfaced two problems:

1. That script parses `DESIGN.md`'s own DTCG JSON blocks and CSS prose and
   checks *that document's internal consistency* — it does not read
   anything under `packages/web/`, so it was never actually capable of
   verifying the implementation matched the documentation.
2. `.design-foundations/` is entirely gitignored (`.gitignore`:
   "design-for-ai workflow scratch... not deliverables"; confirmed zero
   files tracked via `git ls-files .design-foundations/`). CI does a real
   `actions/checkout@v4`, so the script wouldn't even exist to run there.

A replacement script comparing `DESIGN.md` directly against `globals.css`
was drafted, but the user judged the added tooling unnecessary for this
phase (Constitution Principle VIII — no dependency/tooling without
concrete current need): if the implementation and `DESIGN.md` diverge over
time, that's caught by ordinary code review, not a dedicated automated
gate. Token fidelity for this feature is instead verified once by hand
during transcription (T012-T015) and spot-checked by a Vitest test
asserting token classes resolve to the correct CSS custom property in
both modes — Constitution Principle VII's ordinary unit-test bar, nothing
bespoke.

**Alternatives considered**: Hand-transcribing values from reading
`DESIGN.md`'s prose rather than its DTCG JSON blocks — rejected regardless
of the automation decision above, since the mock's already-reviewed CSS
translation remains the more reliable reference to copy from than
re-deriving values from prose.

## 4. shadcn/ui setup

**Decision**: Initialize via the shadcn/ui CLI (`components.json`), style
preset `new-york` (sharper/flatter defaults, closest starting point to
`DESIGN.md`'s no-radius/no-shadow lock), then override every themed value
to reference this project's own CSS variables rather than shadcn's
defaults. Components installed on demand into `components/ui/` as the
shell and later domains need them (`button`, `input`, `card` primitive —
used unstyled as a layout box only, `skeleton`, `badge`, already
referenced in this repo's own allow-listed dev commands).

**Rationale**: shadcn/ui ships source, not a package dependency — "themed
to match Verse Margin rather than default shadcn styling" (original
brief) means every color/radius/shadow token shadcn generates by default
must be pointed at this project's own tokens. `new-york` starts closer
(smaller default radius) but both presets get fully overridden regardless
per `DESIGN.md`'s Never section ("no radius... no shadows, no elevation
system").

**Alternatives considered**: `default` shadcn style — equally valid
starting point given everything gets overridden; `new-york` chosen only
as the marginally smaller diff to the target.

## 5. Fonts (Newsreader + Inter)

**Decision**: `next/font/google`, not a `<link>` tag to Google Fonts.

**Rationale**: Next.js self-hosts the font files at build time when using
`next/font/google` — zero runtime request to Google's CDN, avoiding both
a third-party network dependency for every page load and a
privacy/tracking surface, and it composes cleanly with the project's
eventual PWA offline requirement (Principle IV, currently deferred — see
plan.md Complexity Tracking) since the fonts become part of the built app
shell rather than a live external fetch. Matches `DESIGN.md`'s own
fallback-stack guidance (`"Newsreader", ui-serif, Georgia, serif` /
`"Inter", -apple-system, "Segoe UI", Roboto, sans-serif`) for the
`font-display` swap-in period.

**Alternatives considered**: A `<link rel="preconnect">` + stylesheet tag
(what the design-phase mock HTML files use, since those are standalone
static specimens, not part of the Next.js build) — appropriate for a
one-off static mock, not for the shipped app.

## 6. TanStack Query + Next.js App Router

**Decision**: `lib/query-client.ts` exports a `getQueryClient()` following
TanStack Query's documented Next.js App Router pattern — a fresh
`QueryClient` per request on the server (via `React.cache`), a
module-level singleton in the browser. `AppProviders` (Client Component)
constructs it once via `useState(() => getQueryClient())` and wraps
`children` in `QueryClientProvider`.

**Rationale**: This is the officially documented pattern for avoiding two
known failure modes: sharing one `QueryClient` across concurrent server
requests (cross-request cache leakage) and re-creating it on every client
render (losing the cache on re-render). No domain consumes it yet
(FR-012), so this phase only needs the plumbing to be correct, not
exercised.

**Alternatives considered**: A plain module-level singleton with no
server/client split — rejected, it's the exact pattern TanStack's own
Next.js docs warn against for App Router (server-side cross-request
leakage).

## 7. Back-to-hub affordance — no existing visual reference

**Finding**: Unlike the page-head mark + title (§8 below), no rendered
mock in `.design-foundations/build/` shows the back-to-hub affordance's
visual placement — the phase 5 component-specimen mock's `.page-head`
markup (`<header class="page-head"><span class="mark" aria-hidden="true">
§</span><h2>Expenses</h2></header>`) omits it, since that mock's stated
purpose is demonstrating the `ToolCard`/dense-frame organisms in
isolation, not full page chrome. `JOURNEY.md`'s IA section requires it
regardless ("its own header + back-to-hub affordance"), and this
session's clarification put ownership in the shared `PageHeader` (FR-006).

**Decision**: `PageHeader` renders a plain-text back link (e.g. "‹
HomeBase"), Inter, at `--tap-target` minimum height, to the left of or
above the mark+title group — no icon-only control (would need its own
accessible name for no visual gain), no card/button chrome (`DESIGN.md`'s
Never section: no radius, no shadow, hairline dividers only). Left as an
explicit open detail for the tasks/implementation phase to pixel-place
against `DESIGN.md`'s spacing tokens, since no existing artifact settles
it exactly.

**Rationale**: Consistent with every other shell element's chrome rules
(plain text/hairline, not a boxed control) rather than inventing a new
visual pattern this design system doesn't otherwise use.

## 8. Page-head (mark + title) structure — existing visual reference

**Grounded in repo**: `.design-foundations/build/2026-07-17-homebase-phase-5-mock.html`
already contains a working, reviewed CSS/HTML translation of `DESIGN.md`'s
signature move:
```css
.page-head { display: flex; align-items: baseline; gap: var(--space-3); padding: var(--space-6) var(--space-page-margin) 0; }
.page-head .mark { font-family: var(--font-display); font-size: var(--text-5xl); line-height: var(--leading-5xl); }
.page-head h2 { font-family: var(--font-display); font-size: var(--text-3xl); line-height: var(--leading-3xl); font-weight: var(--font-weight-regular); }
```
```html
<header class="page-head"><span class="mark" aria-hidden="true">§</span><h2>Expenses</h2></header>
```
The mark is `aria-hidden="true"` (decorative identity, not information —
consistent with `DESIGN.md`'s a11y note for the same mark used on
`ToolCard`). `PageHeader`'s implementation should follow this structure
directly (as a reusable component taking a `mark` and `title` prop) rather
than re-deriving the layout from `DESIGN.md`'s prose description alone.

## 9. Next.js/React implementation approach (Vercel App Router guidance)

No installed Claude Code skill covers this (checked; none found under
this name in installed or marketplace-listed skills/plugins) — applied
directly from documented Next.js App Router / React practice instead:

- **Server Components by default.** `app/layout.tsx`, `app/styleguide/page.tsx`,
  and the state-pattern presentational components (`EmptyState`,
  `ErrorState`'s static message, `LoadingState`'s skeleton markup) render
  as Server Components. `'use client'` is scoped to the smallest boundary
  that actually needs it: `AppProviders` (needs `useState`/context),
  `next-themes`' `ThemeProvider`, and any interactive bit of `ErrorState`
  (a retry button needs an event handler).
- **Colocate the client boundary at the provider, not the page.** Pages
  stay Server Components and import `AppProviders` (already a client
  boundary) rather than each page opting into `'use client'` itself.
- **`next/font` over manual `<link>` tags** (§5) — standard Next.js
  guidance for both performance (no extra round trip, no layout shift via
  automatic `font-display` handling) and avoiding a third-party runtime
  request.
- **Metadata API, not manual `<title>`.** `app/styleguide/page.tsx` exports
  `metadata` rather than rendering a `<title>` tag by hand.
