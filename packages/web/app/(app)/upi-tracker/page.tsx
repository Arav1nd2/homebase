"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/upi-tracker/qr-scanner";
import { TagPicker } from "@/components/upi-tracker/tag-picker";
import { ConfirmPrompt } from "@/components/upi-tracker/confirm-prompt";
import { apiClient, ApiError, type ApiResponse } from "@/lib/api-client";
import { UPI_TRACKER_API_PATHS, type UpiTagDto, type UpiTransactionDto } from "@/lib/api/upi-tracker";
import { buildUpiDeepLink, parseUpiDeepLink } from "@/lib/upi-tracker/deep-link";
import { useAppReturnDetection } from "@/lib/upi-tracker/use-app-return";
import type { TransactionOrigin } from "@/lib/validation/upi-tracker";

type FlowStep = "scan" | "details" | "awaiting-return" | "confirm";

type Draft = {
  payeeVpa: string;
  payeeName: string | null;
  origin: TransactionOrigin;
  tagIds: string[];
};

const EMPTY_DRAFT: Draft = {
  payeeVpa: "",
  payeeName: null,
  origin: "scanned",
  tagIds: [],
};

/** How long the tool waits after attempting the `upi://` redirect before
 *  concluding no UPI app handled it (FR-020) — the page is still visible
 *  if the OS never handed off to an external app. */
const NO_APP_TIMEOUT_MS = 2000;

export default function UpiTrackerPage() {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<FlowStep>("scan");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  // Scan step
  const [manualEntry, setManualEntry] = useState(false);
  const [scanPaused, setScanPaused] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualVpa, setManualVpa] = useState("");
  const [manualPayeeName, setManualPayeeName] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  // Details step (amount + tags, one screen)
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  // Pay / confirm
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<UpiTransactionDto | null>(null);
  const [noAppError, setNoAppError] = useState(false);
  const [answering, setAnswering] = useState(false);
  const answeredRef = useRef(false);

  const tagsQuery = useQuery({
    queryKey: ["upi-tracker", "tags"],
    queryFn: () => apiClient<ApiResponse<UpiTagDto[]>>(UPI_TRACKER_API_PATHS.tags).then((res) => res.data),
  });

  function resetToScan() {
    setStep("scan");
    setDraft(EMPTY_DRAFT);
    setManualEntry(false);
    setScanPaused(false);
    setScanError(null);
    setManualVpa("");
    setManualPayeeName("");
    setManualError(null);
    setAmountInput("");
    setAmountError(null);
    setPayError(null);
    setTransaction(null);
    setNoAppError(false);
  }

  function handleDecode(raw: string) {
    const result = parseUpiDeepLink(raw);
    if (!result.success) {
      setScanError(
        "The code didn't scan as a UPI QR. It might be a different kind of code, or the photo was unclear or tilted. Try scanning again, or enter the payee and amount manually.",
      );
      setScanPaused(true);
      return;
    }
    setDraft({
      payeeVpa: result.data.payeeVpa,
      payeeName: result.data.payeeName,
      origin: "scanned",
      tagIds: [],
    });
    setAmountInput(result.data.amountPaise !== null ? (result.data.amountPaise / 100).toFixed(2) : "");
    setStep("details");
  }

  function handleRetryScan() {
    setScanError(null);
    setScanPaused(false);
  }

  function handleManualContinue() {
    const vpa = manualVpa.trim();
    if (!vpa) {
      setManualError("Enter the payee's UPI VPA to continue.");
      return;
    }
    setDraft({
      payeeVpa: vpa,
      payeeName: manualPayeeName.trim() || null,
      origin: "manual",
      tagIds: [],
    });
    setAmountInput("");
    setStep("details");
  }

  function toggleTag(id: string) {
    setDraft((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id) ? prev.tagIds.filter((t) => t !== id) : [...prev.tagIds, id],
    }));
  }

  async function handleCreateTag(input: { name: string; color: string }) {
    setCreatingTag(true);
    setTagError(null);
    try {
      const response = await apiClient<ApiResponse<UpiTagDto>>(UPI_TRACKER_API_PATHS.tags, {
        method: "POST",
        body: JSON.stringify(input),
      });
      await queryClient.invalidateQueries({ queryKey: ["upi-tracker", "tags"] });
      setDraft((prev) => ({ ...prev, tagIds: [...prev.tagIds, response.data.id] }));
    } catch (err) {
      setTagError(err instanceof ApiError ? err.message : "Could not save the tag. Try again.");
    } finally {
      setCreatingTag(false);
    }
  }

  function attemptRedirect(tx: UpiTransactionDto) {
    setNoAppError(false);
    const link = buildUpiDeepLink({
      payeeVpa: tx.payeeVpa,
      payeeName: tx.payeeName,
      amountPaise: tx.amountPaise,
    });

    let handedOff = false;
    const markHandedOff = () => {
      handedOff = true;
    };
    document.addEventListener("visibilitychange", markHandedOff, { once: true });

    window.location.href = link;

    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", markHandedOff);
      if (!handedOff && document.visibilityState === "visible") {
        setNoAppError(true);
      }
    }, NO_APP_TIMEOUT_MS);
  }

  async function handlePay() {
    const value = Number(amountInput.replace(/[^0-9.-]/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      setAmountError("Enter an amount greater than zero.");
      return;
    }
    setAmountError(null);

    setPaying(true);
    setPayError(null);
    try {
      const response = await apiClient<ApiResponse<UpiTransactionDto>>(UPI_TRACKER_API_PATHS.transactions, {
        method: "POST",
        body: JSON.stringify({
          payeeVpa: draft.payeeVpa,
          payeeName: draft.payeeName,
          amountPaise: Math.round(value * 100),
          origin: draft.origin,
          tagIds: draft.tagIds,
        }),
      });
      answeredRef.current = false;
      setTransaction(response.data);
      setStep("awaiting-return");
      attemptRedirect(response.data);
    } catch (err) {
      setPayError(err instanceof ApiError ? err.message : "Could not save the transaction. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  useAppReturnDetection(step === "awaiting-return", () => {
    setStep("confirm");
  });

  // FR-010's non-response default: if the user leaves the confirm prompt
  // without answering (e.g. taps "Back"), resolve to unconfirmed rather
  // than a stuck state.
  useEffect(() => {
    if (step !== "confirm" || !transaction) {
      return;
    }
    const transactionId = transaction.id;
    return () => {
      if (!answeredRef.current) {
        void apiClient(UPI_TRACKER_API_PATHS.transaction(transactionId), {
          method: "PATCH",
          body: JSON.stringify({ status: "unconfirmed" }),
        }).catch(() => {});
      }
    };
  }, [step, transaction]);

  async function handleAnswer(status: "success" | "failed") {
    if (!transaction) {
      return;
    }
    answeredRef.current = true;
    setAnswering(true);
    try {
      await apiClient(UPI_TRACKER_API_PATHS.transaction(transaction.id), {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch {
      // Best-effort — the row already exists (SC-004); resetting the flow
      // is still the right outcome even if this particular write failed.
    } finally {
      setAnswering(false);
    }
    resetToScan();
  }

  function handleDismissConfirm() {
    answeredRef.current = true;
    if (transaction) {
      void apiClient(UPI_TRACKER_API_PATHS.transaction(transaction.id), {
        method: "PATCH",
        body: JSON.stringify({ status: "unconfirmed" }),
      }).catch(() => {});
    }
    resetToScan();
  }

  const stepBack =
    step === "scan"
      ? ({ mode: "hub" } as const)
      : step === "details"
        ? ({ mode: "step" as const, onBack: () => setStep("scan") })
        : ({ mode: "step" as const, onBack: handleDismissConfirm });

  return (
    <>
      <PageHeader mark="₹" title="UPI" back={stepBack} />
      <main className="flex flex-col gap-between-group px-page-margin py-8">
        {step === "scan" ? (
          <div className="flex flex-col gap-related">
            {!manualEntry ? (
              <>
                <QrScanner
                  paused={scanPaused}
                  onDecode={handleDecode}
                  onCameraUnavailable={() => setManualEntry(true)}
                />
                {scanError ? (
                  <ErrorState message={scanError} onRetry={handleRetryScan} />
                ) : null}
              </>
            ) : (
              <div className="flex flex-col gap-related">
                {manualError && !scanError ? (
                  <ErrorState message={manualError} />
                ) : (
                  <p className="text-sm leading-sm text-text-secondary">
                    Camera access is blocked. Your device requires permission to use the camera. Grant it
                    to scan, or enter the payee below.
                  </p>
                )}
                <FormField
                  id="manual-vpa"
                  label="Payee VPA"
                  value={manualVpa}
                  onChange={(event) => setManualVpa(event.target.value)}
                  placeholder="payee@upi"
                />
                <FormField
                  id="manual-payee-name"
                  label="Payee name (optional)"
                  value={manualPayeeName}
                  onChange={(event) => setManualPayeeName(event.target.value)}
                />
                <Button
                  type="button"
                  onClick={handleManualContinue}
                  className="min-h-tap-target w-full bg-accent-bg-subtle text-base leading-base font-semibold text-accent-text hover:bg-accent-bg-subtle-active active:bg-accent-bg-subtle-active"
                >
                  Continue
                </Button>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link
                href="/upi-tracker/history"
                className="min-h-tap-target text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
              >
                View transaction history
              </Link>
              {!manualEntry ? (
                <button
                  type="button"
                  onClick={() => setManualEntry(true)}
                  className="min-h-tap-target self-start text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
                >
                  Can&rsquo;t scan? Enter manually
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === "details" ? (
          <div className="flex flex-col gap-between-group">
            <FormField
              id="amount"
              label="Amount"
              inputMode="decimal"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              error={amountError ?? undefined}
            />

            {tagsQuery.isLoading ? (
              <LoadingState label="Loading your tags." />
            ) : tagsQuery.isError ? (
              <ErrorState
                message="Your tags didn't load. You can still pay without a tag."
                onRetry={() => void tagsQuery.refetch()}
              />
            ) : (
              <TagPicker
                tags={tagsQuery.data ?? []}
                selectedIds={draft.tagIds}
                onToggle={toggleTag}
                onCreate={handleCreateTag}
                creating={creatingTag}
                createError={tagError}
              />
            )}

            {payError ? <ErrorState message={payError} /> : null}
            <Button
              type="button"
              disabled={paying}
              onClick={() => void handlePay()}
              className="min-h-tap-target w-full bg-accent-bg-subtle text-base leading-base font-semibold text-accent-text hover:bg-accent-bg-subtle-active active:bg-accent-bg-subtle-active"
            >
              {paying ? "Paying…" : "Pay"}
            </Button>
          </div>
        ) : null}

        {step === "awaiting-return" ? (
          <div className="flex flex-col gap-related">
            {noAppError ? (
              <>
                <ErrorState message="No UPI app was found. Your device doesn't have Google Pay, PhonePe, or another UPI app installed. Install one and try again, or enter this transaction manually." />
                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    onClick={() => transaction && attemptRedirect(transaction)}
                    className="min-h-tap-target w-full bg-accent-bg-subtle text-base leading-base font-semibold text-accent-text hover:bg-accent-bg-subtle-active active:bg-accent-bg-subtle-active"
                  >
                    Retry
                  </Button>
                  <button
                    type="button"
                    onClick={resetToScan}
                    className="min-h-tap-target self-start text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
                  >
                    Back to Scan
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm leading-sm text-text-secondary">Redirecting to your UPI app.</p>
            )}
          </div>
        ) : null}

        {step === "confirm" ? <ConfirmPrompt onAnswer={(status) => void handleAnswer(status)} answering={answering} /> : null}
      </main>
    </>
  );
}
