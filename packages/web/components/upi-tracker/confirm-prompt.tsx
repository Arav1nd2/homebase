import { Button } from "@/components/ui/button";

export type ConfirmPromptProps = {
  onAnswer: (status: "success" | "failed") => void;
  answering?: boolean;
};

/** Shown on return from the UPI app (FR-009). Exactly two response
 *  options (Hick's law) — no third "unconfirmed" button, since that
 *  status is never a user choice (FR-010's non-response default). */
export function ConfirmPrompt({ onAnswer, answering }: ConfirmPromptProps) {
  return (
    <div className="flex flex-col gap-related">
      <p className="text-base leading-base text-text">Did your payment go through?</p>
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          disabled={answering}
          onClick={() => onAnswer("success")}
          className="min-h-tap-target w-full bg-accent-bg-subtle text-base leading-base font-semibold text-accent-text hover:bg-accent-bg-subtle-active active:bg-accent-bg-subtle-active"
        >
          Success
        </Button>
        <button
          type="button"
          disabled={answering}
          onClick={() => onAnswer("failed")}
          className="min-h-tap-target self-start text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
        >
          Failed
        </button>
      </div>
    </div>
  );
}
