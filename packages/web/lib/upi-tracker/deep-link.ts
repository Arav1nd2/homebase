/** A UPI QR code's decoded payload, before any amount validation
 *  (FR-003/FR-004 happen at the Amount step, not here). */
export type ParsedUpiDeepLink = {
  payeeVpa: string;
  payeeName: string | null;
  /** `null` when the QR carried no `am` param (FR-003's empty-amount case). */
  amountPaise: number | null;
};

export type ParseUpiDeepLinkResult =
  | { success: true; data: ParsedUpiDeepLink }
  | { success: false; error: string };

/**
 * Parses a `upi://pay?...` URI per the NPCI UPI Linking Specification
 * (research.md §2), using the platform's own `URL`/`URLSearchParams`
 * rather than a dedicated npm package (Principle VIII — no dependency
 * beyond ~20 lines of platform code). `pa` is required; `pn` and `am` are
 * both optional per the spec itself, and some real-world QR codes omit
 * either.
 */
export function parseUpiDeepLink(url: string): ParseUpiDeepLinkResult {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { success: false, error: "Not a valid URL." };
  }

  if (parsed.protocol !== "upi:" || parsed.host !== "pay") {
    return { success: false, error: "Not a UPI payment code." };
  }

  const payeeVpa = parsed.searchParams.get("pa");
  if (!payeeVpa) {
    return { success: false, error: "Missing payee VPA (pa)." };
  }

  const payeeName = parsed.searchParams.get("pn");

  const amountRaw = parsed.searchParams.get("am");
  let amountPaise: number | null = null;
  if (amountRaw !== null && amountRaw.trim() !== "") {
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount)) {
      return { success: false, error: "Amount (am) is not a number." };
    }
    amountPaise = Math.round(amount * 100);
  }

  return {
    success: true,
    data: { payeeVpa, payeeName: payeeName ?? null, amountPaise },
  };
}

export type BuildUpiDeepLinkInput = {
  payeeVpa: string;
  payeeName?: string | null;
  /** The confirmed amount, in paise — formatted to 2 decimal rupees on
   *  the link (research.md §5's storage unit, converted only at the
   *  boundary that needs rupees). */
  amountPaise: number;
};

/** Fixed, generic app note (`tn`) — never the transaction's tag names,
 *  which are HomeBase's own private categorization and have no reason to
 *  appear inside the payee's own UPI app (research.md §2). */
const APP_NOTE = "HomeBase UPI Tracker";

/** Constructs the outbound `upi://pay` deep link the tool redirects to
 *  on "Pay" (FR-008). Never includes anything payment-authorizing
 *  (FR-019) — only `pa`/`pn`/`am`/`cu`/`tn`. */
export function buildUpiDeepLink(input: BuildUpiDeepLinkInput): string {
  const params = new URLSearchParams();
  params.set("pa", input.payeeVpa);
  if (input.payeeName) {
    params.set("pn", input.payeeName);
  }
  params.set("am", (input.amountPaise / 100).toFixed(2));
  params.set("cu", "INR");
  params.set("tn", APP_NOTE);
  return `upi://pay?${params.toString()}`;
}
