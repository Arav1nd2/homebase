import { createServer, type IncomingMessage } from "node:http";

// Hermetic stand-in for Resend's real API, used only in local/CI e2e runs
// (send-email's RESEND_BASE_URL points here instead of api.resend.com —
// see packages/send-email/.dev.vars.example). Captures what would have
// been sent so tests can read the OTP code back out, without any live
// network call or real email delivery. Mirrors Resend's actual contract:
// POST /emails -> { data, error } shape check via HTTP status.
const PORT = 9999;

interface CapturedEmail {
  to: string | string[];
  subject: string;
  html: string;
  receivedAt: number;
}

const capturedEmails: CapturedEmail[] = [];

function toRecipientList(to: string | string[]): string[] {
  return Array.isArray(to) ? to : [to];
}

async function readBody(req: IncomingMessage): Promise<string> {
  let body = "";
  for await (const chunk of req) {
    body += String(chunk);
  }
  return body;
}

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/emails") {
    const body = await readBody(req);
    const parsed = JSON.parse(body) as Omit<CapturedEmail, "receivedAt">;
    capturedEmails.push({ ...parsed, receivedAt: Date.now() });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ id: `fake-email-${capturedEmails.length}` }));
    return;
  }

  if (req.method === "GET" && req.url?.startsWith("/emails")) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const to = url.searchParams.get("to")?.toLowerCase();
    const matches = capturedEmails
      .filter((email) => toRecipientList(email.to).some((r) => r.toLowerCase() === to))
      .sort((a, b) => b.receivedAt - a.receivedAt);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ emails: matches }));
    return;
  }

  // 400, not 404: Playwright's webServer.url readiness check only accepts
  // 2xx/3xx/400/401/402/403 as "server is up" — its GET / probe needs to
  // land in that set.
  res.writeHead(400, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => {
  console.log(`Fake Resend capture server listening on http://localhost:${PORT}`);
});
