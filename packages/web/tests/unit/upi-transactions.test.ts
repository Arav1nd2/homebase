import { describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POST } from "@/app/api/upi-tracker/transactions/route";
import { PATCH } from "@/app/api/upi-tracker/transactions/[id]/route";
import { computeTagSummary } from "@/lib/upi-tracker/summary";
import { isNotConfirmed, statusBucket } from "@/lib/upi-tracker/status";
import { transactionCreateInputSchema } from "@/lib/validation/upi-tracker";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createSupabaseServerClient);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/upi-tracker/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("UPI transactions Route Handlers — auth check (Principle VII)", () => {
  it("rejects an unauthenticated POST with 401", async () => {
    mockedCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const response = await POST(
      makeRequest({ payeeVpa: "merchant@upi", amountPaise: 100, origin: "scanned" }) as never,
    );
    const json = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects an unauthenticated PATCH with 401", async () => {
    mockedCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const response = await PATCH(makeRequest({ status: "success" }) as never, {
      params: Promise.resolve({ id: "some-id" }),
    });
    const json = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });
});

describe("computeTagSummary — full-amount-per-tag rule (FR-014)", () => {
  it("counts a multi-tagged transaction's full amount toward each of its tags", () => {
    const rows = [
      { tagId: "tag-groceries", tagName: "Groceries", amountPaise: 5000 },
      { tagId: "tag-shared", tagName: "Shared", amountPaise: 5000 },
    ];

    const summary = computeTagSummary(rows);

    expect(summary).toEqual(
      expect.arrayContaining([
        { tagId: "tag-groceries", tagName: "Groceries", totalPaise: 5000, transactionCount: 1 },
        { tagId: "tag-shared", tagName: "Shared", totalPaise: 5000, transactionCount: 1 },
      ]),
    );
  });

  it("sums multiple transactions under the same tag", () => {
    const rows = [
      { tagId: "tag-groceries", tagName: "Groceries", amountPaise: 1000 },
      { tagId: "tag-groceries", tagName: "Groceries", amountPaise: 2500 },
    ];

    expect(computeTagSummary(rows)).toEqual([
      { tagId: "tag-groceries", tagName: "Groceries", totalPaise: 3500, transactionCount: 2 },
    ]);
  });
});

describe("status bucketing — pending reads as not-confirmed (research.md §3)", () => {
  it("groups pending and unconfirmed into the same bucket", () => {
    expect(statusBucket("pending")).toBe("not-confirmed");
    expect(statusBucket("unconfirmed")).toBe("not-confirmed");
  });

  it("keeps success and failed as their own distinct buckets", () => {
    expect(statusBucket("success")).toBe("success");
    expect(statusBucket("failed")).toBe("failed");
  });

  it("isNotConfirmed is true for pending and unconfirmed, false otherwise", () => {
    expect(isNotConfirmed("pending")).toBe(true);
    expect(isNotConfirmed("unconfirmed")).toBe(true);
    expect(isNotConfirmed("success")).toBe(false);
    expect(isNotConfirmed("failed")).toBe(false);
  });
});

describe("transactionCreateInputSchema — backfill vs. live-flow branch (US3 AC2, T031)", () => {
  const base = { payeeVpa: "merchant@upi", amountPaise: 4500, origin: "manual" as const };

  it("rejects a backfill (status present) without occurredAt", () => {
    const result = transactionCreateInputSchema.safeParse({ ...base, status: "success" });
    expect(result.success).toBe(false);
  });

  it("accepts a backfill with both status and occurredAt, preserving the given status", () => {
    const result = transactionCreateInputSchema.safeParse({
      ...base,
      status: "unconfirmed",
      occurredAt: "2026-07-10T18:30:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("unconfirmed");
    }
  });

  it("accepts a live-flow request (status omitted) with no occurredAt", () => {
    const result = transactionCreateInputSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBeUndefined();
    }
  });
});
