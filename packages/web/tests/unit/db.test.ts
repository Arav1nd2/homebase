import { describe, expect, it, vi } from "vitest";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { resolveConnectionString } from "@/lib/db";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(),
}));

const mockedGetContext = vi.mocked(getCloudflareContext);

describe("resolveConnectionString", () => {
  it("reads the connection string from the HYPERDRIVE binding", () => {
    mockedGetContext.mockReturnValue({
      env: { HYPERDRIVE: { connectionString: "postgresql://user:pass@hyperdrive/db" } },
    } as unknown as ReturnType<typeof getCloudflareContext>);

    expect(resolveConnectionString()).toBe("postgresql://user:pass@hyperdrive/db");
  });

  it("throws a clear error when the HYPERDRIVE binding is missing", () => {
    mockedGetContext.mockReturnValue({ env: {} } as unknown as ReturnType<typeof getCloudflareContext>);

    expect(() => resolveConnectionString()).toThrow(/No HYPERDRIVE binding found/);
  });

  it("propagates when getCloudflareContext() itself throws (not the real Workers runtime)", () => {
    mockedGetContext.mockImplementation(() => {
      throw new Error("not in a Cloudflare context");
    });

    expect(() => resolveConnectionString()).toThrow(/not in a Cloudflare context/);
  });
});
