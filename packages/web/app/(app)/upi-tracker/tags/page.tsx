"use client";

import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { TAG_SWATCH_CLASSES } from "@/components/upi-tracker/tag-picker";
import { apiClient, ApiError } from "@/lib/api-client";
import { UPI_TRACKER_API_PATHS, type UpiTagDto } from "@/lib/api/upi-tracker";
import { TAG_COLORS, type TagColor } from "@/lib/validation/upi-tracker";

const TAGS_QUERY_KEY = ["upi-tracker", "tags"];

/** Create, rename, recolor, and delete tags (FR-017) — the full
 *  management surface, secondary to the main flow's own inline "add new
 *  tag" quick-add. */
export default function UpiTagsPage() {
  const queryClient = useQueryClient();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [recoloringId, setRecoloringId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<TagColor>("teal");
  const [creating, setCreating] = useState(false);

  const tagsQuery = useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: () => apiClient<{ data: UpiTagDto[] }>(UPI_TRACKER_API_PATHS.tags).then((res) => res.data),
  });

  function invalidateTags() {
    return queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
  }

  async function handleRename(id: string) {
    setActionError(null);
    try {
      await apiClient(UPI_TRACKER_API_PATHS.tag(id), {
        method: "PATCH",
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      await invalidateTags();
      setRenamingId(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That change didn't stick. The tag stayed as it was. Try again.");
    }
  }

  async function handleRecolor(id: string, color: TagColor) {
    setActionError(null);
    try {
      await apiClient(UPI_TRACKER_API_PATHS.tag(id), { method: "PATCH", body: JSON.stringify({ color }) });
      await invalidateTags();
      setRecoloringId(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That change didn't stick. The tag stayed as it was. Try again.");
    }
  }

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await apiClient(UPI_TRACKER_API_PATHS.tag(id), { method: "DELETE" });
      await invalidateTags();
      setConfirmingDeleteId(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That change didn't stick. The tag stayed as it was. Try again.");
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      return;
    }
    setCreating(true);
    setActionError(null);
    try {
      await apiClient(UPI_TRACKER_API_PATHS.tags, {
        method: "POST",
        body: JSON.stringify({ name: trimmed, color: newColor }),
      });
      await invalidateTags();
      setNewName("");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not save the tag. Try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <PageHeader title="Tags" back={{ mode: "parent", href: "/upi-tracker/history", label: "History" }} />
      <main className="flex flex-col gap-between-group px-page-margin py-8">
        {actionError ? <ErrorState message={actionError} /> : null}

        {tagsQuery.isLoading ? (
          <LoadingState label="Loading your tags." />
        ) : tagsQuery.isError ? (
          <ErrorState message="Your tags didn't load. Try again." onRetry={() => void tagsQuery.refetch()} />
        ) : (tagsQuery.data ?? []).length === 0 ? (
          <EmptyState message="No tags yet. The first one shapes how you'll track everything." />
        ) : (
          <ul className="flex flex-col border-t border-border">
            {(tagsQuery.data ?? []).map((tag) => (
              <li key={tag.id} className="flex flex-col gap-2 border-b border-border py-3">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs leading-xs ${TAG_SWATCH_CLASSES[tag.color]}`}
                  >
                    {tag.name}
                  </span>
                  {confirmingDeleteId !== tag.id ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(tag.id);
                          setRenameValue(tag.name);
                        }}
                        className="min-h-tap-target text-sm leading-sm text-accent-text underline decoration-border underline-offset-2"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecoloringId(recoloringId === tag.id ? null : tag.id)}
                        className="min-h-tap-target text-sm leading-sm text-accent-text underline decoration-border underline-offset-2"
                      >
                        Change color
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(tag.id)}
                        className="min-h-tap-target text-sm leading-sm text-error-11 underline decoration-border underline-offset-2"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => void handleDelete(tag.id)}
                        className="min-h-tap-target text-sm leading-sm text-error-11 underline decoration-border underline-offset-2"
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className="min-h-tap-target text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {renamingId === tag.id ? (
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormField
                        id={`rename-${tag.id}`}
                        label="Rename tag"
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                      />
                    </div>
                    <Button type="button" onClick={() => void handleRename(tag.id)}>
                      Save
                    </Button>
                    <button
                      type="button"
                      onClick={() => setRenamingId(null)}
                      className="min-h-tap-target text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}

                {recoloringId === tag.id ? (
                  <div role="group" aria-label="Change color" className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-pressed={tag.color === color}
                        onClick={() => void handleRecolor(tag.id, color)}
                        className={`inline-flex min-h-tap-target items-center px-3 text-xs leading-xs ${TAG_SWATCH_CLASSES[color]}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleCreate} className="flex items-end gap-2">
          <div className="flex-1">
            <FormField
              id="add-tag-name"
              label="Add a tag"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
          </div>
          <select
            aria-label="Color"
            value={newColor}
            onChange={(event) => setNewColor(event.target.value as TagColor)}
            className="h-8 border border-input bg-transparent px-2 text-sm text-text"
          >
            {TAG_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={creating || !newName.trim()}>
            Add
          </Button>
        </form>
      </main>
    </>
  );
}
