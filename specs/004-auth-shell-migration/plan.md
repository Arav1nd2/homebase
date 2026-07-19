# Implementation Plan: Auth Shell Migration

**Branch**: `feat/auth-migration` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-auth-shell-migration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Re-skin the existing email-then-code sign-in flow (built in
002-email-otp-auth, currently unstyled) into the Verse Margin visual
language established by 003-ui-shell-foundation, and reorganize the
existing route-protection logic so "protected by default" is a visible
codebase convention rather than a middleware string list. This is
presentation and file-organization work, not a redesign: sign-in method,
session duration, throttling, and the allow-list mechanism are all
untouched. Two structural changes ride along, both surfaced during
`/speckit-clarify`: the shared `PageHeader`'s back-to-hub affordance
becomes optional (auth screens have no hub to return to pre-auth), and the
003-era `/styleguide` example screen — whose own middleware TODO called
for this — is deleted now that real auth screens exist to prove the shell
instead. Two items from the original request's "Technical stack" section
are deliberately *not* built this phase (a Zustand/context auth-status
store, and forcing existing auth logic into one `lib/auth.ts` file) — see
Constitution Check and research.md §3/§4 for why.

## Technical Context

**Language/Version**: TypeScript 5.7, `strict` mode (existing
`packages/web/tsconfig.json`) — Constitution Principle I.

**Primary Dependencies**:
- Next.js 15 (App Router) + React 19, `@supabase/ssr` + `@supabase/supabase-js`
  — all existing, untouched (002-email-otp-auth).
- shadcn/ui — two new raw primitives added via the CLI: `input`, `label`
  (joining the existing `button`, `skeleton`). No new npm package beyond
  what the CLI pulls in; `radius-ui` and `class-variance-authority` are
  already installed.
- `@tanstack/react-form` — **new dependency**. This is the first form in
  the app with real client-side state (multi-step, per-field validation,
  submit/error state), which is exactly the trigger condition the original
  request itself named ("If login has any client-side form state... use
  TanStack Form + Zod, matching the pattern every other form in the app
  will use"). Paired with the existing `emailInputSchema` /
  `verifyCodeInputSchema` (`lib/validation/auth.ts`, unchanged) for
  per-field Zod validation. See research.md §1.
- Zustand — **not added this phase**. See Constitution Check / research.md
  §3: no client component today needs to read auth status reactively.

**Storage**: N/A — no database change. Session data continues to live
entirely in Supabase Auth, read via the existing `getSessionOrThrow()` /
middleware `getUser()` calls (Constitution Principle II does not apply).

**Testing**: Vitest (`packages/web`) for the two modified/new shared
components (`PageHeader`'s new prop, the new `FormField` composition) per
Constitution Principle VII. Playwright (`packages/e2e`) — the three
existing auth specs (`auth-signin`, `auth-signout`,
`auth-session-persistence`) continue to exercise the same flow through the
re-skinned UI; they are updated only where the DOM changes (accessible
names for the email/code fields and buttons are preserved verbatim so
these specs need no behavioral rewrite — FR-001). `styleguide.spec.ts` is
deleted alongside its route (FR-011).

**Target Platform**: Cloudflare Workers via OpenNext (`packages/web`,
Worker `hombase`) — unchanged, Constitution Principle VI. No new binding,
no new infrastructure access.

**Project Type**: Web application — single Next.js App Router project,
existing `packages/web`. No new package.

**Performance Goals**: None newly introduced; inherits the project's
general mobile-first responsiveness expectation (Principle III).

**Constraints**:
- Mobile-first, phone viewport first (Principle III / spec FR-012).
- No back-to-hub affordance on auth screens (spec FR-009/FR-014 — a
  signed-out visitor has no hub to return to).
- No shared toast component (003's FR-013, unchanged/inherited) —
  invalid-code/failed-request errors use the existing `ErrorState` pattern
  in place (spec FR-010).
- **PWA installability remains an open, project-wide gap**, carried
  forward unchanged from 003-ui-shell-foundation's Complexity Tracking —
  see Constitution Check below for why this feature still doesn't close
  it.

**Scale/Scope**: One route moves and is restyled (`/login`), one route is
deleted (`/styleguide`), one existing route is moved without modification
(`/` — the smoke-test placeholder, into the `(app)` route group), two
shared components are touched (`PageHeader` modified, `FormField` added),
`middleware.ts` loses one exemption. No new database table, no new/changed
Route Handler. Household scale (2 people, no hard cap) has no bearing here.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Strict TypeScript Everywhere | PASS | New/modified components (`PageHeader`, `FormField`) get explicit prop types; TanStack Form + the existing Zod schemas give end-to-end typed form state with no `any`. |
| II. Consistent Drizzle Schema Conventions | N/A | No database access in this feature. |
| III. Mobile-First, Responsive by Default | PASS | Spec FR-012 states this directly; re-skinned auth screens are built and verified at phone width first, reusing tokens already verified mobile-first in 003. |
| IV. Installable, Reliable PWA | **DEFERRED (carried forward, unchanged)** | 003-ui-shell-foundation's Complexity Tracking deferred this gap until "the first real tool module" ships, and committed that feature must close it. This feature ships no new product capability — it relocates and re-skins auth that already existed — so it is not that trigger feature; the gap and its trigger condition are unchanged. Not re-listed in this plan's own Complexity Tracking since it's not a new deferral introduced here. |
| V. Consistent Route Handler API Conventions | N/A | No Route Handler is added, removed, or behaviorally changed (spec FR-002/FR-003/FR-004 — preserved unchanged). `request-code`/`verify-code`/`sign-out` keep their existing contract verbatim (specs/002-email-otp-auth/contracts/auth-api.md still applies as-is). |
| VI. Cloudflare Workers Runtime Constraints | PASS | `@tanstack/react-form` is a client-side React library with no Node-only APIs; everything else is existing. Single deployment target preserved. |
| VII. Pragmatic Testing | PASS | `FormField` and `PageHeader`'s new prop are shared code (Principle VII: shared code used by multiple call sites MUST have unit tests). Existing e2e auth coverage continues via preserved accessible names; `styleguide.spec.ts` removed alongside its route. |
| VIII. Simplicity Over Premature Abstraction | PASS | Three deliberate scope-narrowing calls, each justified by "no concrete current need": (1) no Zustand/context store — no client component reads auth status reactively; (2) no forced single `lib/auth.ts` — the existing `lib/auth/`, `lib/supabase/`, `lib/validation/auth.ts` split already satisfies "not scattered per-page," the actual concern behind that request; (3) no `domains/auth/` — the auth surface (one screen, three pre-existing API routes) doesn't meet the "large enough to warrant its own domain" bar the original request itself set, and no `domains/` folder exists anywhere yet in this codebase. See research.md §3–§5. |

**Additional Constraints check**: Single deployment target — preserved (no
new service). Auth/storage stay managed — Supabase Auth untouched, no
custom auth logic added. Module isolation — N/A (no domains touched).
Accessibility baseline — the `form-field` component tokens being
transcribed from `DESIGN.md` carry documented redundant cues (boundary
color + icon + text for validation errors, never color alone), consistent
with the existing baseline (research.md §6).

One inherited DEFERRED item (Principle IV) is carried forward from
003-ui-shell-foundation, not newly introduced — no Complexity Tracking row
is needed for it here since this feature doesn't change its status or
trigger condition.

*Post-Phase-1 re-check: unchanged — Phase 0/1 design didn't introduce a new
gate or resolve the PWA deferral differently than stated above.*

## Project Structure

### Documentation (this feature)

```text
specs/004-auth-shell-migration/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/web/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # MOVED + rewritten from app/login/page.tsx:
│   │                              #   two-step form (email → code) rebuilt on
│   │                              #   TanStack Form + Zod, shadcn Input/Label,
│   │                              #   PageHeader (showBackToHub={false}),
│   │                              #   ErrorState for invalid/expired code
│   │                              #   (FR-001, FR-009, FR-010, FR-014)
│   ├── (app)/
│   │   └── page.tsx               # MOVED unchanged from app/page.tsx (the
│   │                              #   smoke-test placeholder) — a pure file
│   │                              #   move into the protected route group,
│   │                              #   no content/behavior change (spec
│   │                              #   Assumptions: hub is a separate feature)
│   ├── layout.tsx                  # unchanged
│   ├── styleguide/                 # DELETED (FR-011)
│   └── api/
│       ├── auth/...                 # unchanged (FR-002/FR-003/FR-004)
│       └── smoke/...                 # unchanged
│
├── components/
│   ├── ui/
│   │   ├── input.tsx               # NEW — shadcn primitive, unopinionated
│   │   ├── label.tsx               # NEW — shadcn primitive, unopinionated
│   │   ├── button.tsx               # unchanged, reused for form submit actions
│   │   └── skeleton.tsx             # unchanged
│   └── shared/
│       ├── page-header.tsx          # MODIFIED — new optional
│       │                            #   `showBackToHub` prop, default `true`
│       │                            #   (FR-014)
│       ├── form-field.tsx            # NEW — label + input + on-blur
│       │                            #   validation error, composed from
│       │                            #   ui/input.tsx + ui/label.tsx using
│       │                            #   the new form-field-* tokens
│       ├── error-state.tsx           # unchanged, reused by the login screen
│       │                            #   (FR-010)
│       ├── loading-state.tsx         # unchanged
│       └── empty-state.tsx           # unchanged
│
├── lib/
│   ├── auth/allowlist.ts             # unchanged
│   ├── supabase/session.ts           # unchanged
│   ├── supabase/middleware.ts         # unchanged
│   └── validation/auth.ts             # unchanged — reused as the Zod
│                                      #   schemas TanStack Form validates
│                                      #   against
│
├── middleware.ts                      # MODIFIED — drop the `/styleguide`
│                                      #   exemption and its TODO comment;
│                                      #   update path references for the
│                                      #   `(auth)`/`(app)` route-group move
│                                      #   (route groups don't change URLs,
│                                      #   so the exemption logic itself is
│                                      #   otherwise unchanged — research.md §2)
│
├── styles/globals.css                  # MODIFIED — add the `form-field-*`
│                                      #   and `cta-*` Tier-3 component
│                                      #   tokens (already locked in
│                                      #   DESIGN.md's Tier 3 JSON block,
│                                      #   not yet transcribed into code —
│                                      #   research.md §6), plus the two
│                                      #   missing Tier-2 aliases they
│                                      #   reference (`accent-subtle-bg`,
│                                      #   `accent-subtle-bg-active`) and
│                                      #   the `cta-label` type-scale entry
│
└── package.json                        # + @tanstack/react-form

packages/web/tests/unit/
├── page-header.test.tsx                # MODIFIED — the existing "always
│                                       #   renders... no prop to suppress
│                                       #   it" assertion is now false;
│                                       #   replaced with coverage for both
│                                       #   the default-on and opted-out
│                                       #   states (FR-014)
└── form-field.test.tsx                  # NEW

packages/e2e/
├── styleguide.spec.ts                   # DELETED (FR-011)
├── auth-signin.spec.ts                  # unchanged assertions; passes
│                                       #   against the re-skinned DOM
│                                       #   because accessible names are
│                                       #   preserved (FR-001)
├── auth-signout.spec.ts                 # unchanged assertions
└── auth-session-persistence.spec.ts     # unchanged assertions
```

**Structure Decision**: Everything stays inside the existing single
Next.js App Router project (`packages/web`) — no new package. Auth routes
move into an `app/(auth)/` route group and the existing protected route
moves into `app/(app)/`, per the original request's explicit ask; this is
file-organization only (Next.js route groups don't affect the URL or
middleware matching — `middleware.ts` still enumerates `/login` as the one
public page path, exactly as it does today). No `domains/` folder is
created — the auth surface doesn't meet the "large enough to warrant its
own domain" bar the original request itself set, and this project has no
`domains/` folder anywhere yet (Constitution Principle VIII).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No new violations. The one inherited DEFERRED item (Principle IV, PWA) is
carried forward unchanged from 003-ui-shell-foundation's own Complexity
Tracking — see Constitution Check above.*
