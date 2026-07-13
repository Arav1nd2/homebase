import { describe, expect, it, vi } from "vitest";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { resolveConnectionString } from "@/lib/db";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(),
}));

const mockedGetContext = vi.mocked(getCloudflareContext);

describe("resolveConnectionString", () => {
  it("reads the connection string from DATABASE_URL", () => {
    mockedGetContext.mockReturnValue({
      env: { DATABASE_URL: "postgresql://user:pass@pooler.supabase.com:6543/postgres" },
    } as unknown as ReturnType<typeof getCloudflareContext>);

    expect(resolveConnectionString()).toBe("postgresql://user:pass@pooler.supabase.com:6543/postgres");
  });

  it("throws a clear error when DATABASE_URL is missing", () => {
    mockedGetContext.mockReturnValue({ env: {} } as unknown as ReturnType<typeof getCloudflareContext>);

    expect(() => resolveConnectionString()).toThrow(/No DATABASE_URL found/);
  });

  it("propagates when getCloudflareContext() itself throws (not the real Workers runtime)", () => {
    mockedGetContext.mockImplementation(() => {
      throw new Error("not in a Cloudflare context");
    });

    expect(() => resolveConnectionString()).toThrow(/not in a Cloudflare context/);
  });
});
