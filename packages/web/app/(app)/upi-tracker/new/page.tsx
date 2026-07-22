"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { TagPicker } from "@/components/upi-tracker/tag-picker";
import { apiClient, ApiError, type ApiResponse } from "@/lib/api-client";
import { UPI_TRACKER_API_PATHS, type UpiTagDto } from "@/lib/api/upi-tracker";
import { TRANSACTION_STATUSES, type TransactionStatus } from "@/lib/validation/upi-tracker";

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Retrospective backfill entry point (US3, FR-016) — a payment made
 *  outside the tool, recorded with the same structure as a scanned one.
 *  Independent of the main flow's camera-denied fallback (T015); this is
 *  the dedicated, always-available "record a past payment" surface. */
export default function UpiNewTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [payeeVpa, setPayeeVpa] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [date, setDate] = useState(todayDateInputValue());
  const [status, setStatus] = useState<TransactionStatus>("success");
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const tagsQuery = useQuery({
    queryKey: ["upi-tracker", "tags"],
    queryFn: () => apiClient<ApiResponse<UpiTagDto[]>>(UPI_TRACKER_API_PATHS.tags).then((res) => res.data),
  });

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function createTag(input: { name: string; color: string }) {
    setCreatingTag(true);
    setTagError(null);
    try {
      const response = await apiClient<ApiResponse<UpiTagDto>>(UPI_TRACKER_API_PATHS.tags, {
        method: "POST",
        body: JSON.stringify(input),
      });
      await queryClient.invalidateQueries({ queryKey: ["upi-tracker", "tags"] });
      setTagIds((prev) => [...prev, response.data.id]);
    } catch (err) {
      setTagError(err instanceof ApiError ? err.message : "Could not save the tag. Try again.");
    } finally {
      setCreatingTag(false);
    }
  }

  async function handleSave() {
    setSaveError(null);
    const amount = Number(amountInput.replace(/[^0-9.-]/g, ""));
    if (!payeeVpa.trim()) {
      setSaveError("Enter the payee's UPI VPA.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setSaveError("Enter an amount greater than zero.");
      return;
    }

    setSaving(true);
    try {
      await apiClient(UPI_TRACKER_API_PATHS.transactions, {
        method: "POST",
        body: JSON.stringify({
          payeeVpa: payeeVpa.trim(),
          payeeName: payeeName.trim() || null,
          amountPaise: Math.round(amount * 100),
          origin: "manual",
          tagIds,
          status,
          occurredAt: new Date(date).toISOString(),
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["upi-tracker", "transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["upi-tracker", "summary"] });
      router.push("/upi-tracker/history");
    } catch (err) {
      setSaveError(
        err instanceof ApiError
          ? err.message
          : "That transaction didn't save. Check your connection and try again. Everything you've entered is still here.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Add manually" back={{ mode: "parent", href: "/upi-tracker/history", label: "History" }} />
      <main className="flex flex-col gap-between-group px-page-margin py-8">
        <FormField id="new-payee-name" label="Payee name" value={payeeName} onChange={(e) => setPayeeName(e.target.value)} />
        <FormField id="new-payee-vpa" label="Payee VPA" value={payeeVpa} onChange={(e) => setPayeeVpa(e.target.value)} />
        <FormField
          id="new-amount"
          label="Amount"
          inputMode="decimal"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
        />
        <FormField
          id="new-date"
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {tagsQuery.data ? (
          <TagPicker
            tags={tagsQuery.data}
            selectedIds={tagIds}
            onToggle={toggleTag}
            onCreate={(input) => void createTag(input)}
            creating={creatingTag}
            createError={tagError}
          />
        ) : null}

        <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
          {TRANSACTION_STATUSES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => setStatus(value)}
              className={`min-h-tap-target px-3 text-xs leading-xs ${
                status === value ? "bg-accent-bg-subtle text-accent-text" : "border border-border text-text-secondary"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {saveError ? <ErrorState message={saveError} /> : null}

        <Button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="min-h-tap-target w-full bg-accent-bg-subtle text-base leading-base font-semibold text-accent-text hover:bg-accent-bg-subtle-active active:bg-accent-bg-subtle-active"
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </main>
    </>
  );
}
