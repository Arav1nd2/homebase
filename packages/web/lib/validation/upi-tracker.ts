import { z } from "zod";

/** The 8-swatch tag color ramp (DESIGN.md §Tag color ramp) — a constrained
 *  token set, never a freeform hex value (research.md §9). */
export const TAG_COLORS = [
  "teal",
  "indigo",
  "violet",
  "orchid",
  "plum",
  "magenta",
  "rose",
  "berry",
] as const;
export const tagColorSchema = z.enum(TAG_COLORS);
export type TagColor = z.infer<typeof tagColorSchema>;

export const TRANSACTION_STATUSES = ["pending", "success", "failed", "unconfirmed"] as const;
export const transactionStatusSchema = z.enum(TRANSACTION_STATUSES);
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

export const TRANSACTION_ORIGINS = ["scanned", "manual"] as const;
export const transactionOriginSchema = z.enum(TRANSACTION_ORIGINS);
export type TransactionOrigin = z.infer<typeof transactionOriginSchema>;

/** Forgiving date parsing (Postel's law, matching the amount-field
 *  precedent) — any string `Date.parse` can read, not a strict ISO-only
 *  format, since `occurredAt`/`from`/`to` may come from a native
 *  `<input type="date">` (date-only) or a full timestamp. */
const dateStringSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Must be a valid date.",
});

const tagIdSchema = z.string().min(1);

export const tagCreateInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  color: tagColorSchema,
});
export type TagCreateInput = z.infer<typeof tagCreateInputSchema>;

export const tagUpdateInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(100).optional(),
    color: tagColorSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.color !== undefined, {
    message: "At least one of name or color must be provided.",
  });
export type TagUpdateInput = z.infer<typeof tagUpdateInputSchema>;

/**
 * Covers three moments (contracts/upi-tracker-api.md's `POST /transactions`
 * section): a scanned "Pay" tap, the FR-022 camera-denied "Pay" tap, and a
 * US3 retrospective backfill. `origin` is purely descriptive (FR-011) and
 * independent of whether `status` is present — see the contract's own
 * explicit warning not to conflate the two.
 */
export const transactionCreateInputSchema = z
  .object({
    payeeVpa: z.string().trim().min(1, "Payee VPA is required."),
    payeeName: z.string().trim().min(1).optional().nullable(),
    amountPaise: z.number().int().positive("Amount must be a positive integer."),
    origin: transactionOriginSchema,
    tagIds: z.array(tagIdSchema).default([]),
    note: z.string().trim().min(1).optional().nullable(),
    occurredAt: dateStringSchema.optional(),
    status: transactionStatusSchema.optional(),
  })
  .refine((data) => data.status === undefined || data.occurredAt !== undefined, {
    message: "occurredAt is required when status is provided (a retrospective backfill).",
    path: ["occurredAt"],
  });
export type TransactionCreateInput = z.infer<typeof transactionCreateInputSchema>;

/** Only `status`/`tagIds` are ever accepted on `PATCH` (FR-015) — any
 *  other field in the body is ignored by the caller, not rejected here,
 *  matching the contract's own "sending any other field is ignored, not
 *  an error" rule. */
export const transactionUpdateInputSchema = z.object({
  status: transactionStatusSchema.optional(),
  tagIds: z.array(tagIdSchema).optional(),
});
export type TransactionUpdateInput = z.infer<typeof transactionUpdateInputSchema>;

export const transactionListQuerySchema = z.object({
  tagId: z.array(tagIdSchema).default([]),
  status: transactionStatusSchema.optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});
export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>;

export const summaryQuerySchema = z.object({
  tagId: z.array(tagIdSchema).default([]),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});
export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
