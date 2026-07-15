const FAKE_RESEND_URL = "http://localhost:9999";

interface CapturedEmail {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Polls the local fake-Resend capture server (fake-resend-server.mjs) for
 * the most recent OTP code sent to `email`. Since the Send Email Hook
 * pivot, Supabase no longer sends OTP emails itself — the send-email-hook
 * Worker calls Resend directly, so Inbucket/Mailpit no longer sees
 * anything. See specs/002-email-otp-auth/research.md §10.
 */
export async function getLatestOtpCodeFor(email: string, timeoutMs = 10_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(`${FAKE_RESEND_URL}/emails?to=${encodeURIComponent(email)}`);
    const { emails } = (await res.json()) as { emails: CapturedEmail[] };
    const latest = emails[0];
    if (latest) {
      const match = latest.html.match(/\b(\d{6})\b/);
      const code = match?.[1];
      if (code) {
        return code;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`No OTP email arrived for ${email} within ${timeoutMs}ms`);
}
