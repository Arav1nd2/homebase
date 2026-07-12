# Implementation Plan: Foundational Project Infrastructure

**Branch**: `001-foundational-infra` | **Date**: 2026-07-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-foundational-infra/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

**Post-implementation amendment (2026-07-12)**: This plan and the rest of
this feature's docs (`research.md`, `data-model.md`, `contracts/`,
`quickstart.md`) were written against **Prisma**. During implementation,
Prisma on Cloudflare Workers hit a series of unresolved issues (native
engine binary detection needing filesystem access; the newer
engine-free generator still dynamically compiling a WASM query
compiler, which Workers disallows). The project switched to **Drizzle
ORM** instead — a plain TypeScript query builder over `pg` with no
codegen, no engine binary, and no WASM, which is Cloudflare's own
documented pattern for Hyperdrive. Constitution Principle II was amended
accordingly (Prisma → Drizzle). References to Prisma/`schema.prisma`/
`prisma migrate` below are historical; the actual code uses `db/schema.ts`,
`lib/db.ts`, and `drizzle-kit`. See `.specify/memory/constitution.md` for
the current mandated ORM.

## Summary

Stand up the walking skeleton for Hombase: a Next.js/TypeScript app with one
public smoke-test page proving browser → API Route Handler → Prisma →
Supabase Postgres → back to browser works, deployed to Cloudflare Workers
via OpenNext. Pair it with a fully local, offline-capable Supabase CLI dev
environment, a hermetic CI e2e environment (fresh local Supabase stack per
run, Playwright against the actual Workers runtime via OpenNext preview),
and a GitHub Actions CI/CD pipeline that blocks merges on failing checks and
gates production deploys behind a manual-approval GitHub Environment. Per
explicit user direction, this feature deliberately does not wire up
Supabase Auth or PWA support — those land in dedicated follow-up
foundational features before any real module is built.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20+ (local
tooling; Workers Node compatibility runtime in production)

**Primary Dependencies**: Next.js (App Router), `@opennextjs/cloudflare`,
Prisma + `@prisma/adapter-pg` (driver adapters), Supabase CLI, Supabase JS
client (unused by this feature beyond project setup), Zod, Vitest,
Playwright

**Storage**: Supabase Postgres (local via Supabase CLI for dev/CI, cloud
Supabase project for production), accessed exclusively through Prisma

**Testing**: Vitest (unit, shared/data-access code), Playwright (e2e,
against a freshly-provisioned local Supabase CLI stack and the OpenNext
local Workers preview)

**Target Platform**: Cloudflare Workers (production, via OpenNext), Node.js
(local dev and CI)

**Project Type**: Web application — single full-stack Next.js project, no
separate backend service

**Performance Goals**: Smoke-test round trip completes within 3s of the
triggering action (spec SC-002)

**Constraints**: Cloudflare Workers bundle-size and Node-compatibility
limits (constitution Principle VI); local dev and CI e2e must work with no
live cloud dependency (spec FR-003, FR-008); production credentials must
never be reachable from local/CI (spec FR-014)

**Scale/Scope**: One throwaway API route + page, three environments (local,
CI/test, production), two GitHub Actions workflows. No product/module code.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Strict TypeScript Everywhere | PASS | `strict` tsconfig from project init; Zod schema for the one API route's input; no `any`/`!`. |
| II. Consistent Prisma Schema Conventions | PASS (documented deviation) | Single `schema.prisma`, one `SmokeTest` model, PascalCase/camelCase naming. Omits `updatedAt`/`userId` — see `data-model.md` and Complexity Tracking below. |
| III. Mobile-First, Responsive by Default | PASS | Single trivial page/button; phone-width layout by default, trivially satisfied. |
| IV. Installable, Reliable PWA | **DEFERRED** | No manifest/service worker in this feature. See Complexity Tracking — explicit follow-up feature required before module work begins. |
| V. Consistent Route Handler API Conventions | PASS (documented deviation) | `/api/smoke` follows the routing/error/validation/response shape conventions; the auth-check sub-rule is explicitly skipped for this one public route. See Complexity Tracking. |
| VI. Cloudflare Workers Runtime Constraints | PASS | Prisma via `@prisma/adapter-pg` + Hyperdrive (no raw TCP engine); e2e tests run against the actual OpenNext/Workers local runtime to catch incompatibilities early; single deployment target preserved. |
| VII. Pragmatic Testing | PASS | Shared data-access helper (Prisma client wrapper) gets unit tests; the smoke flow gets an e2e test. The "auth-check test per endpoint" sub-rule is not applicable here — there is no auth check on this route (see Principle V note). |
| VIII. Simplicity Over Premature Abstraction | PASS | One model, one route, no module framework, no premature auth/PWA scaffolding — see Complexity Tracking for why that's a deliberate choice, not an oversight. |

Two PASS-with-deviation / DEFERRED items are tracked explicitly in
**Complexity Tracking** below, per governance ("unresolved conflicts MUST be
simplified away or the constitution amended first, not silently bypassed").
Both are staged, tracked gaps with a committed follow-up, not silent
non-compliance.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                 # Smoke-test page (public, no auth)
├── layout.tsx
└── api/
    └── smoke/
        └── route.ts          # GET/POST /api/smoke — see contracts/smoke-api.md

lib/
└── prisma.ts                 # Prisma client wrapper (adapter-pg + Hyperdrive binding)

prisma/
├── schema.prisma              # Single schema; SmokeTest model (see data-model.md)
└── migrations/

supabase/
└── config.toml                # Supabase CLI local stack config

tests/
├── unit/
│   └── prisma.test.ts         # Unit tests for the shared Prisma wrapper
└── e2e/
    └── smoke.spec.ts          # Playwright: full round trip against local stack

.github/
└── workflows/
    ├── ci.yml                 # lint + typecheck + unit + e2e on every PR
    └── deploy.yml              # build + deploy to Cloudflare Workers, gated by
                                 # the "production" GitHub Environment (manual approval)

wrangler.jsonc                 # Cloudflare Workers config (OpenNext output)
open-next.config.ts
```

**Structure Decision**: Single Next.js App Router project at the repository
root (constitution: one codebase, single deployment target — no
`backend/`/`frontend/` split, no separate API service). This is Option 1
("Single project") from the template, adapted to Next.js conventions:
`app/` holds routes, `lib/` holds shared code, `prisma/` holds the one
shared schema, and `tests/` splits `unit/` (Vitest) from `e2e/` (Playwright)
per constitution Principle VII.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| `/api/smoke` skips the Principle V auth check | This is the very first feature in the project; there is no Supabase Auth integration yet to check against, and the spec (FR-016, clarified explicitly with the user) requires this one diagnostic route to be public. | Wiring up Supabase Auth just to satisfy this one throwaway route, before any real module needs auth, would mean building real auth infrastructure inside a "prove the pipes work" feature — the opposite of Principle VIII. Per explicit user decision during planning, auth + the Route Handler auth-check convention will be delivered as its own dedicated foundational feature, and MUST land before any real product module (which does need auth) is built. |
| No PWA manifest/service worker (Principle IV) in this feature | Same bootstrapping rationale: this feature only proves the frontend/API/database/CI/CD pipes work. | Building PWA installability alongside the walking skeleton conflates two independent concerns and delays proving the core stack works. Per the same user decision, PWA setup is a separate, explicitly committed follow-up foundational feature, required before module development starts. |
| `SmokeTest` Prisma model omits `updatedAt` and `userId` (Principle II's standard field set) | The record is write-once/read-only and there is no authenticated user to own it (see above). | Adding fields with no purpose (nothing ever updates the record; there's no user to own it) would violate Principle VIII for no compliance benefit — the model will be deleted once the first real module ships. |
