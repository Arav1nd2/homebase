import { Webhook } from "standardwebhooks";
import { Resend } from "resend";
import { MAGIC_LINK_HTML, TOKEN_PLACEHOLDER } from "./generated/magic-link-html";

export interface Env {
  SEND_EMAIL_HOOK_SECRET: string;
  RESEND_API_KEY: string;
  /** Overrides Resend's API base URL — set only in local/CI tests to point at a fake capture endpoint instead of the real Resend API. Never set in production. */
  RESEND_BASE_URL?: string;
  /** The verified sending address (e.g. "HomeBase <sign-in@yourdomain.com>"). */
  RESEND_FROM_ADDRESS: string;
}

interface SendEmailHookPayload {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Receives Supabase Auth's Send Email Hook webhook (fired instead of
 * Supabase's own SMTP+template email path — see
 * specs/002-email-otp-auth/research.md §10), renders the sign-in code
 * email, and sends it via Resend. Narrowly scoped per constitution's
 * Additional Constraints "Single deployment target" exception: this
 * Worker does nothing beyond receiving, verifying, and acting on this one
 * callback.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      // 400, not 405: Playwright's webServer.url readiness check only
      // accepts 2xx/3xx/400/401/402/403 as "server is up" — a GET health
      // check against this POST-only endpoint needs to land in that set.
      return jsonResponse({ error: { message: "This endpoint only accepts POST requests" } }, 400);
    }

    const payload = await request.text();
    const headers = Object.fromEntries(request.headers);

    // Supabase provides the secret as "v1,whsec_<base64>"; standardwebhooks
    // expects just the base64 portion, matching Supabase's own reference
    // implementation.
    const hookSecret = env.SEND_EMAIL_HOOK_SECRET.replace("v1,whsec_", "");
    const wh = new Webhook(hookSecret);

    let user: SendEmailHookPayload["user"];
    let emailData: SendEmailHookPayload["email_data"];
    try {
      const verified = wh.verify(payload, headers) as SendEmailHookPayload;
      user = verified.user;
      emailData = verified.email_data;
    } catch {
      // Never echo back the raw payload/headers here — could contain the
      // OTP token or other sign-in details.
      return jsonResponse({ error: { message: "Invalid webhook signature" } }, 401);
    }

    const html = MAGIC_LINK_HTML.replaceAll(TOKEN_PLACEHOLDER, emailData.token);

    const resend = new Resend(env.RESEND_API_KEY, env.RESEND_BASE_URL ? { baseUrl: env.RESEND_BASE_URL } : undefined);

    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_ADDRESS,
      to: [user.email],
      subject: "Your HomeBase sign-in code",
      html,
    });

    if (error) {
      console.error("send-email-hook: Resend error:", error.message);
      return jsonResponse({ error: { message: "Failed to send email" } }, 500);
    }

    // Supabase's Send Email Hook expects an empty 200 JSON response on success.
    return jsonResponse({}, 200);
  },
};
