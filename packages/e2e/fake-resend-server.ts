import { createServer, type IncomingMessage } from "node:http";

// Hermetic stand-in for Resend's real API, used only in local/CI e2e runs
// (send-email's RESEND_BASE_URL points here instead of api.resend.com —
// see packages/send-email/.dev.vars.example). Captures what would have
// been sent so tests can read the OTP code back out, without any live
// network call or real email delivery. Mirrors Resend's actual contract:
// POST /emails -> { data, error } shape check via HTTP status.
const PORT = 9999;

interface CapturedEmail {
  id: string;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Human-facing index for local dev: `npm run dev` boots this server so
// sign-in works without a real inbox — this page is how you actually see
// what was "sent" instead of reading escaped JSON.
function renderIndex(): string {
  const rows = [...capturedEmails]
    .sort((a, b) => b.receivedAt - a.receivedAt)
    .map((email) => {
      const to = toRecipientList(email.to).join(", ");
      return `<tr>
        <td>${new Date(email.receivedAt).toLocaleTimeString()}</td>
        <td>${escapeHtml(to)}</td>
        <td>${escapeHtml(email.subject)}</td>
        <td><a href="/view?id=${encodeURIComponent(email.id)}">view</a></td>
      </tr>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<title>Fake Resend inbox</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; color: #222; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 0.5rem 1rem 0.5rem 0; border-bottom: 1px solid #eee; }
  a { color: #2563eb; }
</style>
</head>
<body>
<h1>Fake Resend inbox</h1>
<p>Captured emails from this local dev session (${capturedEmails.length} total). Newest first.</p>
<table>
<thead><tr><th>Time</th><th>To</th><th>Subject</th><th></th></tr></thead>
<tbody>${rows || '<tr><td colspan="4">No emails captured yet.</td></tr>'}</tbody>
</table>
</body>
</html>`;
}

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/emails") {
    const body = await readBody(req);
    const parsed = JSON.parse(body) as Omit<CapturedEmail, "id" | "receivedAt">;
    const id = `fake-email-${capturedEmails.length + 1}`;
    capturedEmails.push({ ...parsed, id, receivedAt: Date.now() });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ id }));
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

  // Renders the actual email HTML in a browser, the way the recipient
  // would see it — the JSON in GET /emails is for tests, not eyeballs.
  // Pass ?id=<id> for a specific email or ?to=<address> for the latest
  // one sent to that address.
  if (req.method === "GET" && req.url?.startsWith("/view")) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const id = url.searchParams.get("id");
    const to = url.searchParams.get("to")?.toLowerCase();

    const match = id
      ? capturedEmails.find((email) => email.id === id)
      : [...capturedEmails]
          .sort((a, b) => b.receivedAt - a.receivedAt)
          .find((email) => toRecipientList(email.to).some((r) => r.toLowerCase() === to));

    if (!match) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<p>No matching email found.</p>");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(match.html);
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderIndex());
    return;
  }

  // 400, not 404: Playwright's webServer.url readiness check only accepts
  // 2xx/3xx/400/401/402/403 as "server is up" — its GET / probe (and every
  // other unmatched route) needs to land in that set.
  res.writeHead(400, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => {
  console.log(`Fake Resend capture server listening on http://localhost:${PORT}`);
});
