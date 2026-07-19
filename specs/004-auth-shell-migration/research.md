# Phase 0 Research: Auth Shell Migration

No `NEEDS CLARIFICATION` markers remained in Technical Context — this
feature reuses an already-locked design system (003-ui-shell-foundation)
and an already-locked auth backend (002-email-otp-auth), so most
"research" here is auditing exactly what already exists and deciding how
much of the original request's technical-stack section to act on now. Each
decision below follows the Decision / Rationale / Alternatives format.

## §1. Form-state library: TanStack Form + Zod

**Decision**: Add `@tanstack/react-form`. Use it for both the email-entry
and code-entry steps, validating each field on blur against the existing
`emailInputSchema` / `verifyCodeInputSchema` (`lib/validation/auth.ts`,
unchanged).

**Rationale**: The current `app/login/page.tsx` already has non-trivial
client-side state (a `step` union, `email`/`code`/`error`/`submitting`
fields, manual `preventDefault`/`fetch`/`try-catch` per step) — exactly
the condition the original request named as the trigger for TanStack Form.
It's also the first form the app has ever had, and `DESIGN.md`'s own
"Form field + the bill edit form" component spec (line 851) explicitly
names a second, near-future consumer (the bill edit form) with an
identical "validate on blur, never per keystroke" rule — TanStack Form's
field-level `onBlur` validators are a direct fit for that rule, not a
retrofit. Setting the pattern now, on the simplest possible form, is lower
risk than introducing it for the first time on the three-chunk bill edit
form later.

**Alternatives considered**:
- **Keep plain `useState`** (status quo): rejected — doesn't establish the
  "pattern every other form in the app will use" the request explicitly
  asked for, and the bill edit form's on-blur validation rule would need
  the same manual wiring duplicated later anyway.
- **`react-hook-form`**: rejected — not requested, and shadcn's generated
  `form.tsx` (which wraps `react-hook-form`) was deliberately not added;
  introducing a second form library alongside a requested one would be the
  opposite of Principle VIII.

## §2. Route protection structure: `(auth)` / `(app)` route groups

**Decision**: Move `app/login/page.tsx` → `app/(auth)/login/page.tsx` and
`app/page.tsx` → `app/(app)/page.tsx`. `middleware.ts` keeps its existing
default-deny logic (redirect to `/login` unless the request is for
`/login` itself) — the route-group move does not change what it checks.

**Rationale**: Next.js route groups (`(name)`) are a source-organization
construct only; they're stripped from the URL, so `middleware.ts` (which
matches on `request.nextUrl.pathname`, the real URL) cannot use folder
membership to decide what's protected — it still needs to know `/login` is
the one public page path, exactly as today. The value of the move is
purely legibility: a future contributor sees at a glance, from the file
tree, which screens are pre-auth vs. protected, matching the original
request's explicit ask. This doesn't strengthen FR-006's "protected by
default" guarantee beyond what the existing default-deny middleware
pattern already provides — that guarantee comes from the middleware's
allow-list being short and explicit, not from the folder structure.

**Alternatives considered**:
- **Leave routes flat, skip the route-group move**: would satisfy the FRs
  identically (the middleware logic is what enforces protection, not
  folder placement) but ignores an explicit, cheap, low-risk part of the
  original request with no offsetting cost — not adopted.
- **Derive protection from route-group membership at runtime** (e.g. a
  build step that lists `(app)` routes and generates the middleware
  allow-list): rejected as unneeded machinery for a two-route app
  (Principle VIII) — the manual allow-list is one line and changes
  rarely.

## §3. Client-side auth-status store: not built this phase

**Decision**: Do not add Zustand or a React context for auth status. The
login form's own step/field state stays local (managed by TanStack Form
plus one local `step` state value); every other screen's access control is
already enforced server-side (`middleware.ts` + `getSessionOrThrow()`).

**Rationale**: Principle VIII requires a concrete current need before
adding a dependency or a shared abstraction. Auditing every existing and
newly-added client component in this feature (the login form, the
unchanged smoke-test page) turns up zero components that need to read
"am I signed in" reactively — the login form doesn't need it (it's
definitionally pre-auth), and the smoke-test page's existing sign-out
button just does a `fetch` + redirect, no reactive state required. A store
with zero consumers is the exact "we might need it when we add module N"
case Principle VIII names directly. The trigger for building this is a
real future client component that needs to conditionally render based on
auth state (e.g., a header showing the signed-in member's email) — at that
point it's one small, well-scoped addition, not a speculative one now.

**Alternatives considered**:
- **Build the Zustand store as originally requested, unused for now**:
  rejected — this is precisely the "dependency without a concrete current
  need" Principle VIII forbids; flagged explicitly in this plan's
  Constitution Check and the completion report so the decision is visible
  and reversible, not silently dropped.
- **React context instead of Zustand**: same objection applies regardless
  of mechanism — the question isn't which store, it's whether one is
  needed yet.

## §4. Auth logic organization: keep the existing `lib/` split

**Decision**: Do not consolidate `lib/auth/allowlist.ts`,
`lib/supabase/session.ts`, `lib/supabase/middleware.ts`, and
`lib/validation/auth.ts` into a single `lib/auth.ts`. Leave all four files
exactly where they are.

**Rationale**: The original request's stated concern was auth logic "not
scattered per-page" — but it already isn't. These four files are the
single, centralized location every Route Handler and `middleware.ts`
already imports from; nothing duplicates auth logic inside a page
component today. Renaming/merging working, well-scoped files into one
larger file would be pure churn (violates the top-level instruction
against refactoring beyond what a task requires) with no behavior change
and no reduction in "scatter," since there isn't any to reduce.

**Alternatives considered**:
- **Literal `lib/auth.ts` re-export barrel**: considered as a lighter-touch
  compromise (one new file re-exporting the existing four), but rejected —
  it would be a file that exists solely to satisfy a literal filename from
  the original request with no functional purpose, which is the same
  churn objection in a smaller package.

## §5. Domain placement: `app/(auth)/` + existing `lib/`, not `domains/auth/`

**Decision**: No `domains/` folder is created. Auth routes live under
`app/(auth)/`; auth logic stays in the existing `lib/` locations (§4).

**Rationale**: The original request itself set the bar — `domains/auth/`
"if the auth surface is large enough to warrant its own domain." This
feature's entire auth surface is one screen (two steps of one page) plus
three pre-existing, unchanged API routes. No `domains/` folder exists
anywhere in this codebase yet (003-ui-shell-foundation's plan explicitly
notes this); creating the first one for the smallest possible surface,
ahead of any real tool module needing the pattern, would be exactly the
premature abstraction Principle VIII rules out.

**Alternatives considered**: None seriously — the original request's own
conditional criterion, applied honestly to the actual surface size, points
one way.

## §6. Design tokens: transcribing the locked `form-field` / `cta` spec

**Decision**: Add new CSS custom properties to `styles/globals.css` for
the `form-field-*` and `cta-*` component tokens, transcribed verbatim from
`DESIGN.md`'s Tier 3 JSON block (lines 690–726), following the exact
method 003-ui-shell-foundation used for the tokens it transcribed. Two
Tier-2 aliases these reference don't exist in code yet either
(`accent-subtle-bg`, `accent-subtle-bg-active` — the CTA surface/pressed
colors) and one Tier-2 typography entry (`cta-label`) — all three are
added alongside, resolving to already-present Tier-1 primitives
(`--accent-3`, `--accent-4`, the existing `--text-sm`/`font-weight`
scale), so no new color/size decision is being made, only wiring already-
locked values into code.

**Rationale**: `DESIGN.md` already specifies this exact component
("Form field + the bill edit form", "Primary CTA") — on-blur validation,
three redundant error cues (boundary color + icon + text), 16px input
text (the iOS auto-zoom floor), CTA min-height at the tap-target size. It
was locked before this feature but never implemented, because
003-ui-shell-foundation's scope was kernel-only (page shell + state
patterns, explicitly no form anywhere). This feature is the first
consumer, so it's responsible for transcribing it — the same relationship
003 had to the base type/space/color tokens it transcribed from `DESIGN.md`
Tier 1/2.

**Alternatives considered**:
- **Style the login form ad hoc, ignore the locked `form-field`/`cta`
  spec**: rejected outright — this is exactly the "one-off inline error
  style" spec FR-010 explicitly forbids, and would contradict FR-001's
  requirement to use the app's shared visual language.
- **Full bottom-fixed-bar CTA chrome** (the `cta.bar.*` wrapper tokens —
  background, top divider, padding — described alongside the CTA spec):
  scoped down for this feature. The bill-edit-form CTA pattern is
  described for a long, potentially-scrolling page where a sticky bottom
  bar keeps the action reachable; the login form is two fields and fits in
  one phone viewport without scrolling, so a sticky bar has no problem to
  solve here. The submit button reuses the `cta-*` *button* tokens
  (background, label typography/color, min-height, focus-visible, pressed)
  inline in the form, without the `cta.bar.*` fixed-position wrapper. This
  is a scoped, documented simplification, not a silent deviation — should
  a longer auth-adjacent screen appear later, the wrapper tokens are
  already transcribed and ready to use as specified.

## §7. Code-entry field: keep a single text input, not a segmented OTP UI

**Decision**: The 6-digit code step keeps its current single, centered,
letter-spaced numeric text input (re-skinned with the new `form-field`
tokens), rather than introducing shadcn's `input-otp`-backed segmented
box component.

**Rationale**: `input-otp` would be a new npm dependency with no concrete
need behind it — the existing single-input UX already works, is preserved
unchanged in spec FR-002, and nothing in spec.md asks for a visual redesign
of the code step (this is a migration, not a redesign — spec Requirements,
verbatim). Principle VIII again: no dependency without a concrete current
need.

**Alternatives considered**:
- **Adopt `input-otp` for a "nicer" segmented look**: rejected — would be
  a visual redesign of a step the spec explicitly says to carry forward
  unchanged, funded by a new dependency with no functional requirement
  behind it.

## §8. `PageHeader`'s new `showBackToHub` prop: default value

**Decision**: `showBackToHub?: boolean`, defaulting to `true`. The login
screen is the first and only caller that passes `false`.

**Rationale**: Every other current and future consumer of `PageHeader`
(all not-yet-built tool screens) keeps today's behavior with zero changes
required at their call sites — only the auth screen, which has a real
reason to differ (no hub exists pre-auth), opts out explicitly. This
matches the Clarifications session's framing exactly: "the affordance
becomes an optional, per-screen element... the auth screens are the first
to opt out of it," not a flip to opt-in-by-default that would silently
change every future screen's behavior.

**Note for 003-ui-shell-foundation's own docs**: `specs/003-ui-shell-
foundation/contracts/shared-components.md` and `data-model.md` currently
state `PageHeader` "always renders the back-to-hub affordance... no prop
suppresses it" — this is now superseded by this feature's FR-014. Per the
Clarifications session's assumption, those two files should get a short
matching update once this feature lands (out of scope for this plan to
edit directly, since it belongs to a different, already-shipped feature).
