import { describe, expect, it, vi, beforeEach } from "vitest";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POST } from "@/app/api/auth/request-code/route";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockedGetContext = vi.mocked(getCloudflareContext);
const mockedCreateClient = vi.mocked(createSupabaseServerClient);

const ALLOWED_EMAIL = "allowed@example.com";
const NOT_ALLOWED_EMAIL = "not-allowed@example.com";

function makeRequest(email: string): Request {
  return new Request("http://localhost/api/auth/request-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

describe("POST /api/auth/request-code — non-disclosure of allow-list membership (FR-003, FR-014)", () => {
  let signInWithOtp: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockedGetContext.mockReturnValue({
      env: { ALLOWED_EMAILS: ALLOWED_EMAIL },
    } as unknown as ReturnType<typeof getCloudflareContext>);

    signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    mockedCreateClient.mockResolvedValue({
      auth: { signInWithOtp },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
  });

  it("returns byte-identical responses for an allow-listed and a non-allow-listed email", async () => {
    const allowedResponse = await POST(makeRequest(ALLOWED_EMAIL) as never);
    const notAllowedResponse = await POST(makeRequest(NOT_ALLOWED_EMAIL) as never);

    expect(allowedResponse.status).toBe(notAllowedResponse.status);
    await expect(allowedResponse.json()).resolves.toEqual(await notAllowedResponse.json());
  });

  it("only calls Supabase signInWithOtp for the allow-listed email", async () => {
    await POST(makeRequest(NOT_ALLOWED_EMAIL) as never);
    expect(signInWithOtp).not.toHaveBeenCalled();

    await POST(makeRequest(ALLOWED_EMAIL) as never);
    expect(signInWithOtp).toHaveBeenCalledTimes(1);
    expect(signInWithOtp).toHaveBeenCalledWith({ email: ALLOWED_EMAIL });
  });
});
