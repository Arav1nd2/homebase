"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SmokeTestRecord = {
  id: string;
  message: string;
  createdAt: string;
};

type ApiError = { error: { message: string; code: string } };

export default function SmokeTestPage() {
  const router = useRouter();
  const [record, setRecord] = useState<SmokeTestRecord | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const res = await fetch("/api/auth/sign-out", { method: "POST" });
      if (res.ok) {
        const body = (await res.json()) as { data: { redirectTo: string } };
        router.push(body.data.redirectTo);
        router.refresh();
      }
    } finally {
      setSigningOut(false);
    }
  }

  async function loadLatest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/smoke");
      if (!res.ok) {
        const body = (await res.json()) as ApiError;
        throw new Error(body.error.message);
      }
      const body = (await res.json()) as { data: SmokeTestRecord | null };
      setRecord(body.data);
    } catch {
      setError("Could not load the smoke-test record. The database may be unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLatest();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/smoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const body = (await res.json()) as ApiError;
        throw new Error(body.error.message);
      }
      const body = (await res.json()) as { data: SmokeTestRecord };
      setRecord(body.data);
      setMessage("");
    } catch {
      setError("Could not save the smoke-test record. The database may be unavailable.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "3rem auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>HomeBase smoke test</h1>
        <button type="button" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
      <p>Proves browser → API → database → browser works end-to-end.</p>

      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a message"
          required
          maxLength={500}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </button>
      </form>

      <h2>Latest record</h2>
      {loading ? (
        <p>Loading…</p>
      ) : record ? (
        <p data-testid="smoke-record">
          &ldquo;{record.message}&rdquo; — saved {new Date(record.createdAt).toLocaleString()}
        </p>
      ) : (
        <p>No record yet.</p>
      )}
    </main>
  );
}
