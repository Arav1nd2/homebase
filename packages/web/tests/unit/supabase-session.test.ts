import { describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionOrThrow, UnauthorizedError } from "@/lib/supabase/session";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createSupabaseServerClient);

describe("getSessionOrThrow", () => {
  it("returns the user when getUser() resolves a valid session", async () => {
    const user = { id: "user-123", email: "person@example.com" };
    mockedCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    await expect(getSessionOrThrow()).resolves.toEqual(user);
  });

  it("throws UnauthorizedError when there is no valid session", async () => {
    mockedCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: "no session" } }),
      },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    await expect(getSessionOrThrow()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws UnauthorizedError when getUser() returns no user and no error", async () => {
    mockedCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    await expect(getSessionOrThrow()).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
