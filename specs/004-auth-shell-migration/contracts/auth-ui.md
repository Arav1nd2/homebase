# Contracts: Auth Screens & Shared Component Changes

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

This feature adds no Route Handler and changes no request/response shape
— `specs/002-email-otp-auth/contracts/auth-api.md` remains the
authoritative contract for `/api/auth/request-code`, `/api/auth/verify-code`,
`/api/auth/sign-out`, and `middleware.ts`'s page-gating behavior, and is
not duplicated here. What changes is (a) which components the login screen
is built from and (b) one existing shared component's prop contract.

## `components/shared/page-header.tsx` (changed contract)

Supersedes the guarantee documented in
`specs/003-ui-shell-foundation/contracts/shared-components.md` ("Always
renders the back-to-hub affordance — no prop suppresses it").

```ts
export type PageHeaderProps = {
  mark?: string;
  title: string;
  /** Defaults to `true`. Pass `false` to omit the back-to-hub affordance. */
  showBackToHub?: boolean;
};

export function PageHeader(props: PageHeaderProps): JSX.Element;
```

**Guarantees to callers**:
- With `showBackToHub` omitted or `true` (every existing/future
  tool-screen call site): identical output to 003's original contract —
  no behavior change for any current caller.
- With `showBackToHub={false}` (the auth screens, the only caller passing
  this as of this feature): the back-to-hub `<Link>` is not rendered; the
  mark + title head renders unchanged.
- Never renders a persistent nav bar or search control, in either mode
  (003 FR-007/FR-008, untouched).

## `components/shared/form-field.tsx` (new)

```ts
export type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
} & React.ComponentProps<"input">;

export function FormField(props: FormFieldProps): JSX.Element;
```

**Guarantees to callers**:
- Renders a `<label htmlFor={id}>` + `<input id={id}>` pair using the
  `form-field-*` design tokens (label typography/color, input
  typography/border, 16px input text) — callers never pass raw
  className-based styling overrides for these properties.
- `error`, when present, is shown under the field via three redundant
  cues (boundary color, icon glyph, message text) — never color alone —
  and is expected to only be passed once the caller's own on-blur
  validation has actually run (this component does not itself decide
  when to validate; it only renders whatever `error` it's given).
- All other native `<input>` props (`type`, `inputMode`, `pattern`,
  `maxLength`, `autoComplete`, `value`, `onChange`, `onBlur`, ...) pass
  through directly, since TanStack Form's field API needs to wire these
  itself.

## `app/(auth)/login/page.tsx` (composition, not a new export)

Not a reusable contract (it's a route, not a library export) — recorded
here for traceability against spec.md's acceptance scenarios:

- Renders `PageHeader` with `showBackToHub={false}` (spec FR-009,
  Acceptance Scenario 5).
- Step 1 (email): one `FormField` (type `email`, `inputMode="email"`,
  `autoComplete="email"`), submit button styled with the `cta-*` tokens,
  labeled "Send me a code" — accessible name preserved verbatim from the
  pre-migration implementation so `packages/e2e/auth-signin.spec.ts` and
  siblings need no rewrite (spec FR-001).
- Step 2 (code): one `FormField` (type `text`, `inputMode="numeric"`,
  `pattern="\d{6}"`, `maxLength={6}`, `autoComplete="one-time-code"`),
  submit button labeled "Sign in", secondary plain-text action "Use a
  different email" returning to step 1 — all accessible names preserved
  verbatim, same reason.
- A server-rejected error (invalid/expired code, request failure) renders
  via `ErrorState`, not `FormField`'s own per-field error slot (spec
  FR-010; data-model.md's "Auth Screen Form State" distinguishes the two).

## What is deliberately not a contract here

- No new/changed Route Handler request or response shape (spec
  FR-002/FR-003/FR-004 — preserved unchanged; see
  `specs/002-email-otp-auth/contracts/auth-api.md`).
- No client-readable auth-status API (no store, no context, no exported
  hook) — research.md §3.
- No `domains/auth/`-level contract — research.md §5.
