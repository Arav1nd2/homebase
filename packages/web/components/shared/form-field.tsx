import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FormFieldProps = {
  id: string;
  label: string;
  /** Validation/server error, shown under the field. Caller decides when
   *  to pass this (e.g. on blur, DESIGN.md's "reward early, punish late"
   *  rule) — this component only renders whatever it's given. */
  error?: string;
} & Omit<ComponentProps<"input">, "id">;

// Field molecule (DESIGN.md "Form field + the bill edit form", line 851):
// top-aligned label above the input. Radius and the input's boundary ink
// already resolve correctly through the shared `--radius`/`--color-input`
// tokens shadcn's Input primitive consumes (globals.css) — no override
// needed here for those. An error state layers on three redundant cues
// (boundary color switch, icon glyph, message text — never color alone,
// matching every other feedback surface in this app).
export function FormField({ id, label, error, className, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-grouped">
      <Label htmlFor={id} className="text-sm leading-sm font-normal text-text-secondary">
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(error && "border-error-9 focus-visible:ring-error-9/50", className)}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-2 text-sm leading-sm text-error-11">
          <span aria-hidden="true" className="font-display text-base leading-none">
            !
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
