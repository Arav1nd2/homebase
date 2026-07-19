# Phase 1 Data Model: UI Shell Foundation

This feature persists nothing to a database (spec Storage: N/A — Drizzle/
Postgres untouched). "Data model" here means the shape of the shared
kernel concepts from spec.md's Key Entities section, expressed as the
TypeScript contracts every future tool screen will consume. There are no
relationships to a persistence layer and no lifecycle/state-transition
table, since none of these entities are stored — they're either compile-
time CSS custom properties or React component props.

## Design Token

A named value (type size, spacing unit, or color) defined once in
`styles/globals.css`'s `@theme` block and `:root`/`[data-theme="dark"]`
blocks, sourced verbatim from `DESIGN.md`'s DTCG blocks (research.md §3).

| Field | Type | Notes |
|---|---|---|
| CSS custom property name | `string` (e.g. `--text-3xl`, `--color-accent-9`) | Matches `DESIGN.md`'s DTCG token path, translated to kebab-case per the existing mock's convention (research.md §3, §8). |
| Light value | CSS value | Defined in `:root`. |
| Dark value | CSS value | Defined in `[data-theme="dark"]`, only for color tokens (type/spacing tokens are mode-independent). |
| Tailwind mapping | `@theme` entry | Exposes the variable as a Tailwind utility (e.g. `text-3xl`, `bg-accent-9`) so components consume it via Tailwind classes, never a raw hex/px value (FR-001). |

**Validation rule**: Every color/type/spacing value used by any component
under `components/ui` or `components/shared` MUST resolve to one of these
tokens (SC-001). Enforced by code review and a Vitest test asserting token
classes resolve correctly — no automated design-doc-vs-implementation
drift check (considered and declined; see research.md §3 and spec.md's
Clarifications).

## Page Shell

The base structural wrapper every tool screen renders inside
(`PageHeader` + a content region). Not a data entity so much as a React
component contract:

```ts
type PageHeaderProps = {
  /** The oversize display-serif mark (e.g. "¶", "§") — decorative, aria-hidden (research.md §8). */
  mark?: string;
  /** Canonical page title (e.g. "Habits", "Expenses") — matches JOURNEY.md's canonical labeling table. */
  title: string;
  /** Back-to-hub affordance is always rendered; no prop to suppress it (FR-006, FR-007/FR-008 — the shell owns navigation-back, not the caller). */
};
```

**Validation rule**: `PageHeader` always renders the back-to-hub
affordance and never renders a persistent nav bar or search control —
these are not configurable per the shell's own constraints (FR-007,
FR-008), so there is deliberately no prop that could turn them on.

## State Pattern

One of three canonical treatments, each a component contract rather than
stored data:

```ts
type LoadingStateProps = {
  /** Optional label for screen readers while content resolves. */
  label?: string;
};

type EmptyStateProps = {
  /** Short literary-register copy (DESIGN.md's "empty states set as short verse") — supplied by the caller per-tool, not hardcoded in the shell. */
  message: React.ReactNode;
};

type ErrorStateProps = {
  /** Plain-register message describing what happened (JOURNEY.md's Yifrah-formula error copy is a caller concern; the shell only provides the structural pattern). */
  message: React.ReactNode;
  /** Optional retry affordance — same tap, not a separate recovery flow (JOURNEY.md's repeated "retry is the same tap" rule). */
  onRetry?: () => void;
};
```

**Validation rule**: All three patterns share one visual structure
(consistent padding, typography, icon/mark treatment) regardless of which
tool renders them (SC-002) — enforced by all three living in
`components/shared` and no tool screen implementing its own variant.

## Example Screen

`app/styleguide/page.tsx` — not a reusable entity, the one concrete
instance proving the above three compose correctly. No props (it's a
route, not a component); renders `PageHeader` plus one instance of each
`State Pattern` so all four (shell + 3 states) are visible on one page for
verification (FR-009, User Story 3's acceptance scenarios).

## Explicitly out of scope for this data model

- **Toast/notification data** — no shape defined; FR-013 (this session's
  clarification) rules out a shared visual toast component entirely.
- **Query/API response shapes** — `lib/query-client.ts` and
  `lib/api-client.ts` are scaffolding only (FR-012); no domain response
  shape exists yet to model.
