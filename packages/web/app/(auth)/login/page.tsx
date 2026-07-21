"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/shared/form-field";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { apiClient, ApiError, type ApiResponse } from "@/lib/api-client";
import { AUTH_API_PATHS, type RequestCodeResponse, type VerifyCodeResponse } from "@/lib/auth/api";
import { emailInputSchema, verifyCodeInputSchema } from "@/lib/validation/auth";

type Step = "email" | "code";

const ctaClassName =
  "min-h-tap-target w-full bg-accent-bg-subtle text-base leading-base font-semibold text-accent-text hover:bg-accent-bg-subtle-active active:bg-accent-bg-subtle-active";

// Two-step sign-in flow (email -> code), re-skinned in the shared shell
// (004-auth-shell-migration) but functionally unchanged from
// 002-email-otp-auth: same allow-list check, same code delivery, same
// error handling — only presentation and form-state management changed.
// `PageHeader`'s back-to-hub affordance is intentionally suppressed
// (FR-009/FR-014) — a signed-out visitor has no hub to return to yet.
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const emailForm = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await apiClient<ApiResponse<RequestCodeResponse>>(AUTH_API_PATHS.requestCode, {
          method: "POST",
          body: JSON.stringify({ email: value.email }),
        });
        setEmail(value.email);
        setStep("code");
      } catch {
        setError("Could not send a code right now. Please try again.");
      }
    },
  });

  const codeForm = useForm({
    defaultValues: { code: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const body = await apiClient<ApiResponse<VerifyCodeResponse>>(AUTH_API_PATHS.verifyCode, {
          method: "POST",
          body: JSON.stringify({ email, code: value.code }),
        });
        router.push(body.data.redirectTo);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "That code is incorrect or expired. Request a new one.",
        );
      }
    },
  });

  return (
    <>
      <PageHeader mark="⁂" title="Sign in" back={false} />
      <main className="flex flex-col gap-related px-page-margin py-8">
        {error ? <ErrorState message={error} /> : null}

        {step === "email" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void emailForm.handleSubmit();
            }}
            className="flex flex-col gap-between-group"
          >
            <emailForm.Field
              name="email"
              validators={{
                onBlur: ({ value }) => {
                  const result = emailInputSchema.shape.email.safeParse(value);
                  return result.success ? undefined : (result.error.issues[0]?.message ?? "Enter a valid email address.");
                },
              }}
            >
              {(field) => (
                <FormField
                  id="email"
                  label="Email address"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.isBlurred ? field.state.meta.errors[0] : undefined}
                />
              )}
            </emailForm.Field>

            <emailForm.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting} className={ctaClassName}>
                  {isSubmitting ? "Sending…" : "Send me a code"}
                </Button>
              )}
            </emailForm.Subscribe>
          </form>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void codeForm.handleSubmit();
            }}
            className="flex flex-col gap-between-group"
          >
            <p className="text-sm leading-sm text-text-secondary">We sent a 6-digit code to {email}.</p>

            <codeForm.Field
              name="code"
              validators={{
                onBlur: ({ value }) => {
                  const result = verifyCodeInputSchema.shape.code.safeParse(value);
                  return result.success ? undefined : (result.error.issues[0]?.message ?? "Enter the 6-digit code.");
                },
              }}
            >
              {(field) => (
                <FormField
                  id="code"
                  label="Enter the code"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="123456"
                  required
                  className="text-center text-lg tracking-[0.5rem]"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value.replace(/\D/g, ""))}
                  onBlur={field.handleBlur}
                  error={field.state.meta.isBlurred ? field.state.meta.errors[0] : undefined}
                />
              )}
            </codeForm.Field>

            <codeForm.Subscribe selector={(state) => [state.isSubmitting, state.values.code] as const}>
              {([isSubmitting, code]) => (
                <Button type="submit" disabled={isSubmitting || code.length !== 6} className={ctaClassName}>
                  {isSubmitting ? "Verifying…" : "Sign in"}
                </Button>
              )}
            </codeForm.Subscribe>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
                codeForm.reset();
              }}
              className="min-h-tap-target self-start text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
            >
              Use a different email
            </button>
          </form>
        )}
      </main>
    </>
  );
}
