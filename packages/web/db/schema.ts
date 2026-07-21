import { pgTable, text, integer, timestamp, check, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Throwaway diagnostic record proving the browser -> API -> database round
// trip works. No `updatedAt`/`userId` by design: write-once, no auth in this
// feature (FR-016). Delete this table once the first real module ships and
// a follow-up feature adds the auth-checked Route Handler convention.
// See specs/001-foundational-infra/data-model.md.
// Uses crypto.randomUUID() (native, no dependency) rather than Prisma's old
// cuid() default — no reason to add a package just for ID generation.
export const smokeTest = pgTable("SmokeTest", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
});

// UPI Payment Tracker (specs/005-upi-payment-tracker). First module with
// real domain tables — see data-model.md for the full column-by-column
// rationale. `userId` is a plain `text` value (Supabase auth.users.id),
// no cross-schema FK, matching 002-email-otp-auth's established pattern.

// A user-defined label for categorizing transactions. `deletedAt` is a
// soft-delete marker (research.md §4): renamed/recolored tags propagate
// live to every transaction that references them (no snapshot copy),
// while a deleted tag is simply excluded from future tag-selection
// queries — existing upiTransactionTag rows are never touched.
export const upiTag = pgTable("UpiTag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  deletedAt: timestamp("deletedAt", { precision: 3 }),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

// A single tracked UPI payment attempt. `payeeVpa`/`payeeName`/
// `amountPaise`/`occurredAt`/`origin` are write-once at creation — only
// `status` and tag associations are ever edited after (FR-015).
// `occurredAt` is deliberately separate from `createdAt`: a backfilled
// transaction's real-world date differs from its row-insert time.
export const upiTransaction = pgTable(
  "UpiTransaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    payeeVpa: text("payeeVpa").notNull(),
    payeeName: text("payeeName"),
    amountPaise: integer("amountPaise").notNull(),
    status: text("status").notNull(),
    origin: text("origin").notNull(),
    note: text("note"),
    occurredAt: timestamp("occurredAt", { precision: 3 }).notNull(),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
  },
  (table) => [
    // Defense-in-depth alongside Zod validation (FR-004, research.md §5).
    check("UpiTransaction_amountPaise_positive", sql`${table.amountPaise} > 0`),
    check(
      "UpiTransaction_status_enum",
      sql`${table.status} in ('pending', 'success', 'failed', 'unconfirmed')`,
    ),
    check("UpiTransaction_origin_enum", sql`${table.origin} in ('scanned', 'manual')`),
  ],
);

// Many-to-many join between transactions and tags. Deliberately omits
// `userId` (research.md §6, plan.md Complexity Tracking): every code path
// reaches this table only after loading and auth-checking the parent
// `upiTransaction` row by `userId` first, so a duplicated ownership column
// here would be an unused fact to keep in sync, not a real auth boundary.
export const upiTransactionTag = pgTable(
  "UpiTransactionTag",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    transactionId: text("transactionId")
      .notNull()
      .references(() => upiTransaction.id, { onDelete: "cascade" }),
    // No cascade action needed — tags are soft-deleted, never hard-deleted
    // (research.md §4), so this FK's parent row is never actually removed.
    tagId: text("tagId")
      .notNull()
      .references(() => upiTag.id),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
  },
  (table) => [unique("UpiTransactionTag_transactionId_tagId_unique").on(table.transactionId, table.tagId)],
);
