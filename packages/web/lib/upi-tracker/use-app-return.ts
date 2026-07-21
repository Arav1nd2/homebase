import { useEffect, useRef } from "react";

/**
 * Detects "the user has returned to the tool" after the UPI-app redirect
 * (FR-009): `visibilitychange` is the primary signal, `focus` a fallback
 * for browser/OS combinations where visibility fires unreliably after an
 * external-app hand-off (research.md §7). Both listeners attach only
 * while `armed` is true (the post-redirect, awaiting-return window) and
 * detach once the confirm prompt is answered/dismissed — never left
 * running outside that window.
 */
export function useAppReturnDetection(armed: boolean, onReturn: () => void): void {
  const onReturnRef = useRef(onReturn);
  onReturnRef.current = onReturn;

  useEffect(() => {
    if (!armed) {
      return;
    }

    function handleReturn() {
      if (document.visibilityState === "visible") {
        onReturnRef.current();
      }
    }

    document.addEventListener("visibilitychange", handleReturn);
    window.addEventListener("focus", handleReturn);

    return () => {
      document.removeEventListener("visibilitychange", handleReturn);
      window.removeEventListener("focus", handleReturn);
    };
  }, [armed]);
}
