const INBUCKET_URL = "http://127.0.0.1:54324";

type MailpitMessageSummary = { ID: string; To: { Address: string }[]; Created: string };
type MailpitMessage = { Text: string };

/** Polls local Supabase's Mailpit/Inbucket for the most recent OTP code sent to `email`. */
export async function getLatestOtpCodeFor(email: string, timeoutMs = 10_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const listRes = await fetch(`${INBUCKET_URL}/api/v1/messages`);
    const list = (await listRes.json()) as { messages: MailpitMessageSummary[] };

    const matches = list.messages
      .filter((m) => m.To.some((to) => to.Address.toLowerCase() === email.toLowerCase()))
      .sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());

    const latest = matches[0];
    if (latest) {
      const detailRes = await fetch(`${INBUCKET_URL}/api/v1/message/${latest.ID}`);
      const detail = (await detailRes.json()) as MailpitMessage;
      const match = detail.Text.match(/\b(\d{6})\b/);
      const code = match?.[1];
      if (code) {
        return code;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`No OTP email arrived for ${email} within ${timeoutMs}ms`);
}

/** Clears Mailpit's mailbox so each test starts from a clean slate. */
export async function clearInbox(): Promise<void> {
  await fetch(`${INBUCKET_URL}/api/v1/messages`, { method: "DELETE" });
}
