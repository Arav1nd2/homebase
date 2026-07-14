"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiError = { error: { message: string; code: string } };

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json()) as ApiError;
        throw new Error(body.error.message);
      }
      setStep("code");
    } catch {
      setError("Could not send a code right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const body = (await res.json()) as ApiError;
        throw new Error(body.error.message);
      }
      const body = (await res.json()) as { data: { redirectTo: string } };
      router.push(body.data.redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is incorrect or expired. Request a new one.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 400,
        margin: "3rem auto",
        padding: "0 1rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Sign in to HomeBase</h1>

      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}

      {step === "email" ? (
        <form onSubmit={handleRequestCode}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            inputMode="email"
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", marginBottom: "1rem" }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem" }}
          >
            {submitting ? "Sending…" : "Send me a code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <p>We sent a 6-digit code to {email}.</p>
          <label htmlFor="code" style={{ display: "block", marginBottom: "0.5rem" }}>
            Enter the code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            required
            autoComplete="one-time-code"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1.5rem",
              letterSpacing: "0.5rem",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          />
          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem" }}
          >
            {submitting ? "Verifying…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "0.9rem",
              marginTop: "0.5rem",
              background: "none",
              border: "none",
              textDecoration: "underline",
            }}
          >
            Use a different email
          </button>
        </form>
      )}
    </main>
  );
}
