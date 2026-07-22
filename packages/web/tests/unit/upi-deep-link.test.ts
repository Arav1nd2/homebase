import { describe, expect, it } from "vitest";
import { buildUpiDeepLink, parseUpiDeepLink } from "@/lib/upi-tracker/deep-link";

describe("parseUpiDeepLink", () => {
  it("parses a valid link with an amount", () => {
    const result = parseUpiDeepLink("upi://pay?pa=merchant@upi&pn=Local%20Store&am=450.00&cu=INR");
    expect(result).toEqual({
      success: true,
      data: { payeeVpa: "merchant@upi", payeeName: "Local Store", amountPaise: 45000 },
    });
  });

  it("parses a valid link without an amount — amountPaise is null (FR-003)", () => {
    const result = parseUpiDeepLink("upi://pay?pa=merchant@upi&pn=Local%20Store");
    expect(result).toEqual({
      success: true,
      data: { payeeVpa: "merchant@upi", payeeName: "Local Store", amountPaise: null },
    });
  });

  it("fails to parse when pa is missing (FR-021)", () => {
    const result = parseUpiDeepLink("upi://pay?pn=Local%20Store&am=450.00");
    expect(result.success).toBe(false);
  });

  it("still parses when pn is missing — payeeName is null, not a failure", () => {
    const result = parseUpiDeepLink("upi://pay?pa=merchant@upi&am=450.00");
    expect(result).toEqual({
      success: true,
      data: { payeeVpa: "merchant@upi", payeeName: null, amountPaise: 45000 },
    });
  });

  it("fails to parse when am is non-numeric", () => {
    const result = parseUpiDeepLink("upi://pay?pa=merchant@upi&am=not-a-number");
    expect(result.success).toBe(false);
  });

  it("fails to parse a non-UPI URL", () => {
    const result = parseUpiDeepLink("https://example.com/not-a-upi-code");
    expect(result.success).toBe(false);
  });

  it("fails to parse a non-URL string without throwing", () => {
    const result = parseUpiDeepLink("not a url at all");
    expect(result.success).toBe(false);
  });
});

describe("buildUpiDeepLink", () => {
  it("builds a upi://pay link with pa/pn/am/cu/tn", () => {
    const link = buildUpiDeepLink({
      payeeVpa: "merchant@upi",
      payeeName: "Local Store",
      amountPaise: 45000,
    });
    const parsed = new URL(link);
    expect(parsed.protocol).toBe("upi:");
    expect(parsed.host).toBe("pay");
    expect(parsed.searchParams.get("pa")).toBe("merchant@upi");
    expect(parsed.searchParams.get("pn")).toBe("Local Store");
    expect(parsed.searchParams.get("am")).toBe("450.00");
    expect(parsed.searchParams.get("cu")).toBe("INR");
    expect(parsed.searchParams.get("tn")).toBeTruthy();
  });

  it("omits pn when payeeName is absent", () => {
    const link = buildUpiDeepLink({ payeeVpa: "merchant@upi", amountPaise: 100 });
    const parsed = new URL(link);
    expect(parsed.searchParams.has("pn")).toBe(false);
    expect(parsed.searchParams.get("am")).toBe("1.00");
  });
});
