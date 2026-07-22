import { describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GET, POST } from "@/app/api/upi-tracker/tags/route";
import { DELETE, PATCH } from "@/app/api/upi-tracker/tags/[id]/route";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createSupabaseServerClient);

function mockNoSession() {
  mockedCreateClient.mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
}

function makeRequest(method: string, body?: unknown): Request {
  return new Request("http://localhost/api/upi-tracker/tags", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// Substantive DB-backed behavior (rename/recolor propagation, delete
// excluding a tag while leaving historical transactions untouched,
// name-uniqueness-among-active, and cross-user isolation) is verified in
// packages/e2e/upi-tracker-tags.spec.ts against a real database — these
// Route Handlers hit Postgres directly and CI's unit job has none
// available (only the e2e job provisions one), matching this project's
// existing test-layering convention.
describe("UPI tags Route Handlers — auth check on all four endpoints (Principle VII, FR-018)", () => {
  it("rejects an unauthenticated GET /tags with 401", async () => {
    mockNoSession();
    const response = await GET();
    const json = (await response.json()) as { error: { code: string } };
    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects an unauthenticated POST /tags with 401", async () => {
    mockNoSession();
    const response = await POST(makeRequest("POST", { name: "Groceries", color: "teal" }) as never);
    const json = (await response.json()) as { error: { code: string } };
    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects an unauthenticated PATCH /tags/[id] with 401", async () => {
    mockNoSession();
    const response = await PATCH(makeRequest("PATCH", { name: "Household" }) as never, {
      params: Promise.resolve({ id: "some-id" }),
    });
    const json = (await response.json()) as { error: { code: string } };
    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects an unauthenticated DELETE /tags/[id] with 401", async () => {
    mockNoSession();
    const response = await DELETE(makeRequest("DELETE") as never, {
      params: Promise.resolve({ id: "some-id" }),
    });
    const json = (await response.json()) as { error: { code: string } };
    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });
});
