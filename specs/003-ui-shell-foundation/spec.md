# Feature Specification: UI Shell Foundation

**Feature Branch**: `003-ui-shell-foundation`

**Created**: 2026-07-19

**Status**: Draft

**Input**: User description: "Build the visual and structural foundation for HomeBase, a personal life-admin hub for a small household (currently two people). This is not a user-facing feature on its own — it's the shell every tool screen will be built on top of. Design register: 'calm structure, not a productivity dashboard.' Literary, editorial, restrained. Mobile-first. No nagging, no gamification, no notification badges, no streak-shaming anywhere in the shell's language or components. Visual direction ('Verse Margin'): a serif display face for oversize punctuation marks at the head of each page/section, paired with a clean sans-serif for dense UI text. Muted green/sage palette throughout, not bright or saturated. Requirements: define the shared visual language once, applied consistently everywhere; every loading/empty/error state uses one consistent pattern across the whole app; no persistent navigation bar and no search anywhere in the shell; establish the base page shell every tool screen renders inside."

## Clarifications

### Session 2026-07-19

- Q: FR-013 asks for shared "transient app-wide notification" infrastructure (a toaster). DESIGN.md's locked design system states failure "is a first-class surface, never a toast," has no shadow/elevation system at all, and every documented success/error microcopy entry across all 7 pages in JOURNEY.md is explicitly screen-reader-only with no visual toast. Should this phase still build shared notification infrastructure? → A: Drop shared notification infrastructure from this phase entirely — build it only when a real future flow needs it (Constitution Principle VIII: no dependency without concrete current need).
- Q: JOURNEY.md's IA states every tool page's header includes "its own header + back-to-hub affordance," since there's no persistent nav bar. Should the shared page shell (FR-006) own this directly, or should each future tool screen add its own? → A: The shell owns it directly — every screen rendered inside the shell gets a back-to-hub affordance automatically, as part of the shared page head.
- Q: DESIGN.md locks both a light-mode and a dark-mode token set and states dark is "a fully-supported, equally first-class second mode," never the default — the original spec didn't mention dark mode at all. Should this phase wire up full dark-mode support now, or defer it? → A: Include it now — both token sets wired end-to-end with a working switch/detect mechanism, verified on the example screen in both modes.
- Q: DESIGN.md already ships a working regression gate (`.design-foundations/build/phase5-spec-check.mjs`) that parses its own locked token/contrast JSON blocks and exits non-zero on any tier-discipline or contrast violation. Should this feature's Definition of Done require that gate to pass against the shipped code, or is design fidelity verified by manual/visual review only? → A: Require the gate to pass — wire `phase5-spec-check.mjs` into this feature's own verification.
- Q: A `/speckit-analyze` pass found that `.design-foundations/` is entirely gitignored ("workflow scratch... not deliverables", zero files tracked) and CI does a real `git` checkout, so `phase5-spec-check.mjs` cannot run in CI at all — and separately, that script only checks `DESIGN.md` against itself, never the shipped implementation. Should this feature instead build a new, git-tracked script comparing the implementation to `DESIGN.md` directly, or drop automated design-token verification from this feature's Definition of Done? → A: Drop it — rely on traditional Vitest unit tests (a token-resolution test confirming token classes resolve to the correct CSS custom property in both modes) plus ordinary code review. If `DESIGN.md` and the implementation diverge over time, that's managed manually, not by a dedicated automated gate (Constitution Principle VIII: no dependency/tooling without concrete current need).

## User Scenarios & Testing *(mandatory)*

<!--
  This feature has no tool-specific content of its own — it is the shared shell
  every future tool screen (Habits, Expenses, Groceries, etc.) will be built on
  top of. The primary "user" of this feature is the maintainer building those
  future screens; the acceptance scenarios describe what they, and anyone
  opening the app before any real tool exists, will observe.
-->

### User Story 1 - One shared visual language for every future screen (Priority: P1)

As the maintainer, I need the app's typography, spacing, and color to be
defined once in a shared source and applied consistently, so that every tool
screen I build from now on automatically matches the app's calm, editorial
register without re-deciding type sizes or colors each time.

**Why this priority**: Every other part of this feature (the shared state
patterns, the page shell) is composed from these values. Without one
consistent source locked first, nothing built on top of it can be
consistent either.

**Independent Test**: Compose two different example screens using the
shared visual language and confirm both use identical type scale, spacing,
and color values with no hardcoded overrides in either screen.

**Acceptance Scenarios**:

1. **Given** the shared visual-language source exists, **When** a new
   screen is composed using it, **Then** its type sizes, spacing, and
   colors all resolve from that shared source rather than being set inline
   per screen.
2. **Given** a value in the shared visual-language source changes,
   **When** any screen using that value is rendered again, **Then** the
   change is reflected everywhere it is used, with no separate copy left
   unchanged.

---

### User Story 2 - One consistent loading, empty, and error pattern everywhere (Priority: P2)

As a person using HomeBase, when a tool screen is loading data, has no data
yet, or fails to load, I want it to look and behave the same way every
time, so I never have to relearn what a stalled or empty screen means as I
move between tools.

**Why this priority**: Named explicitly as a hard constraint in the brief —
a user must never see two different "loading" treatments in different
tools. This directly protects the calm, non-nagging register from drifting
apart as more tools get added later, but it depends on User Story 1's
shared visual language already existing to be built from.

**Independent Test**: Trigger a loading, an empty, and an error condition
on two different example screens that both render inside the shell, and
confirm each condition renders with the identical pattern on both screens.

**Acceptance Scenarios**:

1. **Given** any screen built on the shell, **When** it is waiting on
   data, **Then** it displays the shell's one shared loading pattern, never
   a screen-specific spinner or placeholder.
2. **Given** any screen built on the shell has no content yet, **When** it
   renders, **Then** it displays the shell's one shared empty-state
   pattern.
3. **Given** any screen built on the shell fails to load its data,
   **When** the failure occurs, **Then** it displays the shell's one
   shared error-state pattern.

---

### User Story 3 - A calm first impression with no navigation clutter (Priority: P3)

As a person opening HomeBase, I want the app's shell — even before any tool
has real content — to immediately read as calm and editorial rather than a
generic dashboard, and to never present me with a persistent navigation bar
or a search box to parse.

**Why this priority**: This is the visible payoff of User Stories 1 and 2
and is best demonstrated once the underlying token and state-pattern work
exists, but it is the directly observable proof that the feature succeeded.

**Independent Test**: Render the example/placeholder screen inside the
shell in both light and dark mode and visually confirm the serif oversize
mark, sage palette, and sans-serif body text are present in both, and
confirm no navigation bar or search control is rendered anywhere in the
shell.

**Acceptance Scenarios**:

1. **Given** the example screen renders inside the shell, **When** viewed
   at a phone viewport in light mode (the default), **Then** a serif
   display mark appears at the page head alongside the page title, in the
   muted sage/green palette, with body text set in the sans-serif face.
2. **Given** the same example screen, **When** viewed in dark mode,
   **Then** the same structure, mark, and typography render correctly
   using the dark-mode token values, with no broken contrast or unstyled
   elements.
3. **Given** any screen rendered inside the shell, **When** it is
   inspected, **Then** no persistent navigation bar and no search control
   is present anywhere on screen.

---

### Edge Cases

- What happens when a shared visual-language value needs to change later
  (e.g. a color adjustment)? It MUST be changed in the one shared source
  and propagate to every consumer — no screen may hold its own drifted
  copy.
- What happens if a future tool screen's need doesn't fit the shell (e.g.
  it seems to want a nav-like control)? The "no nav bar, no search"
  constraint MUST be treated as deliberate and permanent — resolved by
  rethinking the screen, never by quietly adding the control to the shell.
- What happens when only part of a screen fails to load while the rest
  succeeds (e.g. one summary value on an otherwise-loaded screen)? Out of
  scope for this phase — no tool screen with multiple independently
  loading regions exists yet; the shared patterns cover whole-screen
  loading/empty/error only.
- What happens at the narrowest supported phone viewport? The shell MUST
  remain fully usable and readable with no horizontal scrolling or
  truncated content.
- What happens when the visitor's OS is set to reduce motion? Any
  transition used by the shared state patterns MUST honor that setting
  rather than animating regardless.
- What happens when the visitor's OS is set to a dark color-scheme
  preference? The shell MUST render in dark mode using the dark-mode token
  values rather than defaulting to light regardless of the OS setting.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST define the app's visual language — type
  scale, spacing scale, and color palette — in exactly one shared source,
  consumed by every screen; no screen may declare its own one-off type
  size, spacing value, or color.
- **FR-002**: The shared visual language MUST implement the app's already
  established design direction: a serif display face reserved for oversize
  punctuation marks at page heads, a sans-serif face for body and dense UI
  text, and a muted, unsaturated sage/green color palette, in both a light
  mode (the default) and a dark mode, per the app's already established
  design documentation.
- **FR-003**: The system MUST provide one shared loading-state pattern,
  used identically by every screen that shows a loading condition.
- **FR-004**: The system MUST provide one shared empty-state pattern, used
  identically by every screen that shows an empty condition.
- **FR-005**: The system MUST provide one shared error-state pattern, used
  identically by every screen that shows an error condition.
- **FR-006**: The system MUST provide one base page shell that every tool
  screen renders inside, including a consistent page head (title paired
  with the oversize punctuation mark, plus a back-to-hub affordance)
  rather than each screen re-implementing its own header or navigation
  path back to the launcher.
- **FR-007**: The shell MUST NOT include a persistent navigation bar
  anywhere.
- **FR-008**: The shell MUST NOT include a search control anywhere.
- **FR-009**: The system MUST include at least one example/placeholder
  screen, reachable without going through any tool-specific flow, that
  renders inside the shell using the shared visual language, with no
  tool-specific content.
- **FR-010**: The shell's language and components MUST NOT use nagging
  phrasing, gamification mechanics, notification badges, or streak-shaming
  patterns anywhere.
- **FR-011**: The shell MUST be designed and verified at phone viewport
  widths first; wider viewports are a progressive enhancement and MUST NOT
  be required for the shell to be usable.
- **FR-012**: The system MUST provide shared client-side infrastructure for
  future data fetching (a shared request/query mechanism) as part of this
  phase, even though no tool screen consumes it yet, so later feature work
  does not have to retrofit it.
- **FR-013**: The system MUST NOT introduce a shared visual toast/
  notification component in this phase. Where a future flow needs to
  confirm an action, it does so through an in-place visual change (per the
  relevant state pattern) plus a screen-reader-only announcement, never a
  floating or elevated toast.
- **FR-014**: The system MUST distinguish unopinionated, low-level UI
  building blocks from higher-level, HomeBase-specific shared patterns (the
  state patterns and page shell), so a future module reuses the right layer
  instead of reimplementing shared patterns from scratch.
- **FR-015**: The system MUST provide a working mechanism to switch or
  detect which color mode (light or dark) applies, defaulting to light, and
  the example screen MUST be verified to render correctly — same shared
  tokens, same shell structure — in both modes.

### Key Entities

- **Design Token**: A named value (a type size, spacing unit, or color)
  defined once in the shared visual-language source and referenced by every
  screen or component that needs it, rather than restated locally. Color
  tokens carry both a light- and a dark-mode value.
- **Page Shell**: The base structural wrapper — page head (oversize
  punctuation mark + title + back-to-hub affordance) plus a content region
  — that every tool screen renders inside. Owns no navigation bar and no
  search control.
- **State Pattern**: One of three canonical treatments (Loading, Empty,
  Error) reused identically by any screen that needs to show that
  condition.
- **Example Screen**: A placeholder screen with no tool-specific content,
  used to demonstrate that the shell and the shared visual language are
  correctly wired together.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every screen rendered in the shell draws its typography,
  spacing, and color entirely from the one shared source — a review of all
  shell screens finds zero hardcoded, one-off style values outside it.
- **SC-002**: A person moving between a loading, an empty, and an error
  condition on different example screens cannot tell which screen they're
  on from the state treatment alone — the pattern is identical across 100%
  of screens that implement these states.
- **SC-003**: The example screen is recognizable as matching the app's
  design direction (serif oversize mark, sage palette, sans-serif body
  text) by visual inspection in both light and dark mode, with zero
  tool-specific content present.
- **SC-004**: Zero screens in the shell present a persistent navigation bar
  or a search control.
- **SC-005**: A future tool screen can be composed entirely by rendering
  inside the shared page shell and reusing the shared state patterns,
  without redefining type scale, spacing, color, or loading/empty/error
  handling from scratch.

## Assumptions

- The visual language (type scale, color palette, spacing, the serif/
  sans-serif pairing) implements the design direction already established
  in this project's design documentation; this feature implements that
  direction in code rather than re-deciding it.
- The "no persistent navigation bar, no search" constraint and the
  hub-and-spoke navigation model are already established in this project's
  design documentation; this feature enforces them structurally rather than
  re-deciding them.
- "Small household (currently two people)" describes the current number of
  people using the app, not a hard limit the shell needs to enforce — the
  shell carries no user-count-specific logic and scales the same regardless
  of household size.
- The example/placeholder screen is reachable at a dedicated, non-nav-gated
  route rather than only existing as an isolated component render, since
  there is no navigation UI to reach it through otherwise; it may be
  removed or repurposed once real tool screens exist. The maintainer has
  flagged removing it specifically once auth is migrated (not yet
  scheduled) — see the `TODO` on its middleware exemption in
  `packages/web/middleware.ts`.
- The example/placeholder screen does not require signing in, since it
  carries no real user data.
- No shared toast/notification component is built in this phase (see
  Clarifications). Every documented flow in JOURNEY.md confirms success or
  failure through an in-place visual change plus a screen-reader-only
  announcement; a shared toast component would have no legitimate use case
  against the currently locked design system, so building one now would be
  a dependency without a concrete current need.
- The shared data-fetching infrastructure (FR-012) is scaffolding only; no
  domain module consumes it in this phase, so there is no live data-fetching
  behavior to verify beyond the plumbing itself being in place.
- This phase establishes only shared/kernel code (design tokens, shared UI
  primitives, the page shell, app-wide providers). It does not create any
  tool-specific module, route, or data model — those are later, separate
  features.
- Accessibility (touch target size, color contrast) follows this project's
  existing accessibility baseline; this feature does not introduce new
  accessibility requirements beyond what's already established, only
  implements the shell in compliance with it.
- No automated check verifies the implemented tokens against `DESIGN.md`
  on an ongoing basis (see Clarifications) — `.design-foundations/build/
  phase5-spec-check.mjs` is gitignored and not CI-reachable, and building a
  replacement was judged more tooling than this phase needs. Token
  fidelity is verified once, by hand, during implementation and
  spot-checked by a Vitest test asserting token classes resolve correctly;
  future drift between `DESIGN.md` and the shipped CSS is caught by
  ordinary code review, not automation.
