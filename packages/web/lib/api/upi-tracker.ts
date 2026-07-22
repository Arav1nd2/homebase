import type { TagColor, TransactionOrigin, TransactionStatus } from "@/lib/validation/upi-tracker";

/** Client-side paths for the UPI tracker Route Handlers
 *  (contracts/upi-tracker-api.md). */
export const UPI_TRACKER_API_PATHS = {
  tags: "/api/upi-tracker/tags",
  tag: (id: string) => `/api/upi-tracker/tags/${id}`,
  transactions: "/api/upi-tracker/transactions",
  transaction: (id: string) => `/api/upi-tracker/transactions/${id}`,
  transactionsSummary: "/api/upi-tracker/transactions/summary",
} as const;

/** A tag as returned by every tag endpoint (contracts/upi-tracker-api.md). */
export type UpiTagDto = {
  id: string;
  name: string;
  color: TagColor;
  createdAt: string;
};

/** `POST /api/upi-tracker/tags` request body. */
export type TagCreateRequest = {
  name: string;
  color: TagColor;
};

/** `PATCH /api/upi-tracker/tags/[id]` request body (either or both fields). */
export type TagUpdateRequest = {
  name?: string;
  color?: TagColor;
};

/** A tag reference embedded inline on a transaction. */
export type UpiTransactionTagDto = {
  id: string;
  name: string;
  color: TagColor;
};

/** A transaction as returned by every transaction endpoint
 *  (contracts/upi-tracker-api.md). */
export type UpiTransactionDto = {
  id: string;
  payeeVpa: string;
  payeeName: string | null;
  amountPaise: number;
  status: TransactionStatus;
  origin: TransactionOrigin;
  note: string | null;
  occurredAt: string;
  tags: UpiTransactionTagDto[];
};

/**
 * `POST /api/upi-tracker/transactions` request body. Omitting `status`
 * is a live "tap Pay now" moment (server writes `pending`); including it
 * is a retrospective backfill and requires `occurredAt` in the same
 * request (contracts/upi-tracker-api.md's `POST /transactions` section —
 * `origin` and "is this a backfill" are independent axes).
 */
export type TransactionCreateRequest = {
  payeeVpa: string;
  payeeName?: string | null;
  amountPaise: number;
  origin: TransactionOrigin;
  tagIds?: string[];
  note?: string | null;
  occurredAt?: string;
  status?: TransactionStatus;
};

/** `PATCH /api/upi-tracker/transactions/[id]` request body (either or
 *  both fields — other fields are immutable after creation). */
export type TransactionUpdateRequest = {
  status?: TransactionStatus;
  tagIds?: string[];
};

/** `GET /api/upi-tracker/transactions/summary` response row. */
export type UpiTransactionSummaryRow = {
  tagId: string;
  tagName: string;
  totalPaise: number;
  transactionCount: number;
};
