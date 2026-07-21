"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { TAG_COLORS, type TagColor } from "@/lib/validation/upi-tracker";

export type TagPickerOption = { id: string; name: string; color: TagColor };

/** The 8-swatch tag color ramp (DESIGN.md §Tag color ramp) — fill =
 *  each hue's -4 step, text = each hue's -11 step. Written as complete,
 *  literal class strings (not built via template interpolation) so
 *  Tailwind's static scanner can see every one of them. */
export const TAG_SWATCH_CLASSES: Record<TagColor, string> = {
  teal: "bg-tag-teal-fill text-tag-teal-text",
  indigo: "bg-tag-indigo-fill text-tag-indigo-text",
  violet: "bg-tag-violet-fill text-tag-violet-text",
  orchid: "bg-tag-orchid-fill text-tag-orchid-text",
  plum: "bg-tag-plum-fill text-tag-plum-text",
  magenta: "bg-tag-magenta-fill text-tag-magenta-text",
  rose: "bg-tag-rose-fill text-tag-rose-text",
  berry: "bg-tag-berry-fill text-tag-berry-text",
};

export type TagPickerProps = {
  tags: TagPickerOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCreate: (input: { name: string; color: TagColor }) => void;
  creating?: boolean;
  createError?: string | null;
};

/** Existing tags as tappable chips (FR-005) + inline "add new tag"
 *  (FR-006); zero, one, or many may be selected (FR-007) — a tag is
 *  never required to proceed. A newly created tag is auto-assigned the
 *  next swatch by creation order, `index mod 8` (DESIGN.md's cycling
 *  rule) — no per-tag color choice UI. */
export function TagPicker({ tags, selectedIds, onToggle, onCreate, creating, createError }: TagPickerProps) {
  const [newName, setNewName] = useState("");

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      return;
    }
    const color = TAG_COLORS[tags.length % TAG_COLORS.length] ?? TAG_COLORS[0];
    onCreate({ name: trimmed, color });
    setNewName("");
  }

  return (
    <div className="flex flex-col gap-related">
      <div role="group" aria-label="Tag this payment (optional)" className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const selected = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(tag.id)}
              className={`inline-flex min-h-tap-target items-center gap-1 px-3 text-xs leading-xs ${TAG_SWATCH_CLASSES[tag.color]}`}
            >
              {selected ? <Check aria-hidden="true" size={12} /> : null}
              {tag.name}
            </button>
          );
        })}
      </div>
      <form onSubmit={handleCreate} className="flex items-end gap-2">
        <div className="flex-1">
          <FormField
            id="new-tag-name"
            label="Add new tag"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            error={createError ?? undefined}
          />
        </div>
        <Button type="submit" disabled={creating || !newName.trim()}>
          Add
        </Button>
      </form>
    </div>
  );
}
