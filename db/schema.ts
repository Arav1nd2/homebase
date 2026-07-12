import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

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
