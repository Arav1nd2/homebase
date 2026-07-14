import { describe, expect, it, vi } from "vitest";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isEmailAllowed } from "@/lib/auth/allowlist";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(),
}));

const mockedGetContext = vi.mocked(getCloudflareContext);

const ALLOWED_EMAIL = "Household.Member@Example.com";

function mockEnv(env: Record<string, string | undefined>) {
  mockedGetContext.mockReturnValue({ env } as unknown as ReturnType<typeof getCloudflareContext>);
}

describe("isEmailAllowed", () => {
  it("allows an email matching an entry in the allow-list", () => {
    mockEnv({ ALLOWED_EMAILS: ALLOWED_EMAIL });

    expect(isEmailAllowed(ALLOWED_EMAIL)).toBe(true);
  });

  it("normalizes case and whitespace before comparing", () => {
    mockEnv({ ALLOWED_EMAILS: ALLOWED_EMAIL });

    expect(isEmailAllowed("  household.MEMBER@example.COM  ")).toBe(true);
  });

  it("rejects an email with no matching allow-list entry", () => {
    mockEnv({ ALLOWED_EMAILS: ALLOWED_EMAIL });

    expect(isEmailAllowed("someone-else@example.com")).toBe(false);
  });

  it("checks against every entry in a comma-separated list", () => {
    mockEnv({ ALLOWED_EMAILS: `first@example.com,${ALLOWED_EMAIL}` });

    expect(isEmailAllowed(ALLOWED_EMAIL)).toBe(true);
  });

  it("throws a clear configuration error when the allow-list secret is missing", () => {
    mockEnv({});

    expect(() => isEmailAllowed(ALLOWED_EMAIL)).toThrow(/not configured/);
  });
});
