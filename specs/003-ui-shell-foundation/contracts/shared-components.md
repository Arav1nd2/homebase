# Contracts: Shared Shell Components

This feature has no REST/API contract of its own (no new Route Handler —
plan.md Constitution Check marks Principle V N/A). Its "public interface"
is the set of shared components, providers, and client utilities every
future tool module will import. This document is that interface contract
— the surface future domains code against, not its internal
implementation.

## `components/shared/page-header.tsx`

```ts
export type PageHeaderProps = {
  mark?: string;      // e.g. "¶", "§" — omit for the launcher/hub itself, which JOURNEY.md's page spec shows with no mark (research.md §8)
  title: string;      // canonical name only (JOURNEY.md's Canonical labeling table) — no per-caller phrasing variants
  showBackToHub?: boolean; // defaults to true — see 004-auth-shell-migration note below
};

export function PageHeader(props: PageHeaderProps): JSX.Element;
```

**Guarantees to callers**:
- Renders the back-to-hub affordance by default (FR-006); every tool
  screen call site is unaffected. **Superseded by
  004-auth-shell-migration's FR-014**: the affordance is now optional via
  `showBackToHub` (default `true`) — the auth screens are the first caller
  to pass `false`, since a signed-out visitor has no hub to return to.
  Originally this guarantee had no suppressing prop at all; that no longer
  holds.
- Never renders a nav bar or search control (FR-007, FR-008).
- `mark`, when present, is `aria-hidden` — callers must not rely on it for
  accessible content; `title` alone must be a complete accessible page
  name.

## `components/shared/loading-state.tsx`, `empty-state.tsx`, `error-state.tsx`

```ts
export type LoadingStateProps = { label?: string };
export function LoadingState(props: LoadingStateProps): JSX.Element;

export type EmptyStateProps = { message: React.ReactNode };
export function EmptyState(props: EmptyStateProps): JSX.Element;

export type ErrorStateProps = { message: React.ReactNode; onRetry?: () => void };
export function ErrorState(props: ErrorStateProps): JSX.Element;
```

**Guarantees to callers**:
- Visual structure is identical across every call site (SC-002) — callers
  supply content (`message`, `label`, `onRetry`), never layout/styling
  overrides. None of these components accept a `className` escape hatch
  for structural changes (content-only props keep FR-001/SC-001 true by
  construction — a caller cannot introduce a one-off layout via prop
  injection).
- `ErrorState` never renders a toast; `onRetry`, when provided, re-runs
  the same action in place (JOURNEY.md's "retry is the same tap" rule) —
  it does not navigate or reset unrelated state.

## `providers/app-providers.tsx`

```ts
export function AppProviders(props: { children: React.ReactNode }): JSX.Element;
```

**Guarantees to callers**: Wraps `children` in (a) a `next-themes`
`ThemeProvider` (`attribute="data-theme"`, `defaultTheme="system"`) and
(b) a TanStack Query `QueryClientProvider` backed by
`lib/query-client.ts`'s `getQueryClient()`. Does **not** provide a toast/
notification context (FR-013) — there is no `useToast()` or equivalent
exported by this feature; a future feature that adds one does so as its
own explicit dependency decision, not by discovering dead scaffolding
here.

## `lib/query-client.ts`

```ts
export function getQueryClient(): QueryClient;
```

**Guarantees to callers**: Safe to call in both Server and Client
Component contexts per TanStack Query's Next.js App Router pattern
(research.md §6) — server calls get a fresh client per request via
`React.cache`, browser calls get a stable singleton. No domain-specific
query keys or default options are set by this feature (none exist yet).

## `lib/api-client.ts`

```ts
export function apiClient<T>(path: string, init?: RequestInit): Promise<T>;
```

**Guarantees to callers**: A thin `fetch` wrapper — resolves relative to
the app's own origin, parses JSON, and throws on a non-2xx response using
the shared error shape already established by Constitution Principle V
(`{ error: { message, code } }`) for any *future* Route Handler this calls
into. This feature does not call it from anywhere (FR-012 scaffolding
only) — no request/response pair is contract-tested here because none
exists yet.

**Caveat for future callers**: `apiClient<T>` types its return as `T` by
assertion, not runtime validation — it guarantees only "valid JSON from a
2xx response," not that the JSON actually matches `T`. The first real
caller MUST validate the parsed response with its own Zod schema
(Constitution Principle I) before trusting it as `T`.

## What is deliberately not a contract here

- No REST endpoint contract — no Route Handler is added by this feature.
- No toast/notification API (FR-013).
- No `domains/`-level contract — this phase ships kernel code only.
