# Data Model: Foundational Project Infrastructure

## SmokeTest

The only data entity this feature introduces. A throwaway diagnostic record
used solely to prove the browser → API → database round trip works (spec
Key Entity: "Smoke-test record"). It is not part of any real module's data
model and carries no ownership/user association, consistent with FR-016
(this feature's endpoints are public, no auth).

| Field       | Type       | Notes                                          |
|-------------|------------|-------------------------------------------------|
| `id`        | `String`   | `cuid()`, primary key                          |
| `message`   | `String`   | Free-text value the visitor submits            |
| `createdAt` | `DateTime` | `@default(now())`                              |

Prisma model (naming follows constitution Principle II — PascalCase model,
camelCase fields):

```prisma
model SmokeTest {
  id        String   @id @default(cuid())
  message   String
  createdAt DateTime @default(now())
}
```

**Deviation from the standard module-table convention**: Principle II
normally requires every model to carry `updatedAt` and a `userId`/ownership
field. `SmokeTest` intentionally omits both:
- No `updatedAt` — records are write-once (created, then only ever read),
  never updated.
- No `userId` — this feature has no auth (see `research.md` §5 and
  `plan.md` Complexity Tracking); the table holds no user-owned data.

This model is expected to be deleted once the first real module ships and a
follow-up feature adds the auth-checked Route Handler convention.

## No other entities

The spec's other Key Entity, "Environment" (Local Development, CI/Test,
Production), is an infrastructure/deployment concept — distinct Supabase
projects/instances and distinct configuration/credentials per environment —
not a database table, and is not modeled in Prisma.
