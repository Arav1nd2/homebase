"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/upi-tracker/transaction-list";
import { SummaryCard } from "@/components/upi-tracker/summary-card";
import { TagPicker } from "@/components/upi-tracker/tag-picker";
import { apiClient, ApiError, type ApiResponse } from "@/lib/api-client";
import {
  UPI_TRACKER_API_PATHS,
  type UpiTagDto,
  type UpiTransactionDto,
  type UpiTransactionSummaryRow,
} from "@/lib/api/upi-tracker";
import { TRANSACTION_STATUSES, type TransactionStatus } from "@/lib/validation/upi-tracker";

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** List/filter/group/summarize UPI transactions (FR-012, FR-013, FR-014)
 *  — the payoff view for having tagged anything. A bounded three-facet
 *  filter row (tag/status/date), not an open query builder. */
export default function UpiHistoryPage() {
  const queryClient = useQueryClient();
  const [tagId, setTagId] = useState("");
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<TransactionStatus>("pending");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [creatingEditTag, setCreatingEditTag] = useState(false);
  const [editTagError, setEditTagError] = useState<string | null>(null);

  const tagsQuery = useQuery({
    queryKey: ["upi-tracker", "tags"],
    queryFn: () => apiClient<ApiResponse<UpiTagDto[]>>(UPI_TRACKER_API_PATHS.tags).then((res) => res.data),
  });

  function startEdit(transaction: UpiTransactionDto) {
    setEditingId(transaction.id);
    setEditTagIds(transaction.tags.map((tag) => tag.id));
    setEditStatus(transaction.status);
    setEditError(null);
    setEditTagError(null);
  }

  function toggleEditTag(id: string) {
    setEditTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function createEditTag(input: { name: string; color: string }) {
    setCreatingEditTag(true);
    setEditTagError(null);
    try {
      const response = await apiClient<ApiResponse<UpiTagDto>>(UPI_TRACKER_API_PATHS.tags, {
        method: "POST",
        body: JSON.stringify(input),
      });
      await queryClient.invalidateQueries({ queryKey: ["upi-tracker", "tags"] });
      setEditTagIds((prev) => [...prev, response.data.id]);
    } catch (err) {
      setEditTagError(err instanceof ApiError ? err.message : "Could not save the tag. Try again.");
    } finally {
      setCreatingEditTag(false);
    }
  }

  async function saveEdit(id: string) {
    setSavingEdit(true);
    setEditError(null);
    try {
      await apiClient(UPI_TRACKER_API_PATHS.transaction(id), {
        method: "PATCH",
        body: JSON.stringify({ status: editStatus, tagIds: editTagIds }),
      });
      await queryClient.invalidateQueries({ queryKey: ["upi-tracker", "transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["upi-tracker", "summary"] });
      setEditingId(null);
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : "That change didn't save. The list stayed as it was. Try again.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  const listFilters = {
    tagId: tagId || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
  };

  const transactionsQuery = useQuery({
    queryKey: ["upi-tracker", "transactions", listFilters],
    queryFn: () =>
      apiClient<ApiResponse<UpiTransactionDto[]>>(
        `${UPI_TRACKER_API_PATHS.transactions}${buildQuery(listFilters)}`,
      ).then((res) => res.data),
  });

  const summaryFilters = { tagId: tagId || undefined, from: from || undefined, to: to || undefined };
  const summaryQuery = useQuery({
    queryKey: ["upi-tracker", "summary", summaryFilters],
    queryFn: () =>
      apiClient<ApiResponse<UpiTransactionSummaryRow[]>>(
        `${UPI_TRACKER_API_PATHS.transactionsSummary}${buildQuery(summaryFilters)}`,
      ).then((res) => res.data),
  });

  const periodTotalPaise = (transactionsQuery.data ?? []).reduce((sum, tx) => sum + tx.amountPaise, 0);

  return (
    <>
      <PageHeader title="History" back={{ mode: "parent", href: "/upi-tracker", label: "UPI" }} />
      <main className="flex flex-col gap-between-group px-page-margin py-8">
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm leading-sm text-text-secondary">
            By tag
            <select
              value={tagId}
              onChange={(event) => setTagId(event.target.value)}
              className="h-8 border border-input bg-transparent px-2 text-sm text-text"
            >
              <option value="">All</option>
              {(tagsQuery.data ?? []).map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm leading-sm text-text-secondary">
            By status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TransactionStatus | "")}
              className="h-8 border border-input bg-transparent px-2 text-sm text-text"
            >
              <option value="">All</option>
              {TRANSACTION_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm leading-sm text-text-secondary">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="h-8 border border-input bg-transparent px-2 text-sm text-text"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm leading-sm text-text-secondary">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="h-8 border border-input bg-transparent px-2 text-sm text-text"
            />
          </label>
        </div>

        {summaryQuery.data ? <SummaryCard rows={summaryQuery.data} periodTotalPaise={periodTotalPaise} /> : null}

        {transactionsQuery.isLoading ? (
          <LoadingState label="Loading your transaction history." />
        ) : transactionsQuery.isError ? (
          <ErrorState
            message="Your transaction history didn't load. Try again."
            onRetry={() => void transactionsQuery.refetch()}
          />
        ) : (
          <TransactionList
            transactions={transactionsQuery.data ?? []}
            onEdit={startEdit}
            renderExpanded={(transaction) =>
              editingId === transaction.id ? (
                <div className="flex flex-col gap-related border border-border p-3">
                  <TagPicker
                    tags={tagsQuery.data ?? []}
                    selectedIds={editTagIds}
                    onToggle={toggleEditTag}
                    onCreate={(input) => void createEditTag(input)}
                    creating={creatingEditTag}
                    createError={editTagError}
                  />
                  <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
                    {TRANSACTION_STATUSES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={editStatus === value}
                        onClick={() => setEditStatus(value)}
                        className={`min-h-tap-target px-3 text-xs leading-xs ${
                          editStatus === value
                            ? "bg-accent-bg-subtle text-accent-text"
                            : "border border-border text-text-secondary"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  {editError ? <ErrorState message={editError} /> : null}
                  <div className="flex gap-3">
                    <Button type="button" disabled={savingEdit} onClick={() => void saveEdit(transaction.id)}>
                      {savingEdit ? "Saving…" : "Save"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="min-h-tap-target self-center text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null
            }
          />
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/upi-tracker/new"
            className="min-h-tap-target text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
          >
            + Add manually
          </Link>
          <Link
            href="/upi-tracker/tags"
            className="min-h-tap-target text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
          >
            Manage tags
          </Link>
        </div>
      </main>
    </>
  );
}
