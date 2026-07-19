import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormField } from "@/components/shared/form-field";

afterEach(() => {
  cleanup();
});

describe("FormField", () => {
  it("renders a label associated with its input", () => {
    render(<FormField id="email" label="Email address" />);
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("renders no error message when the error prop is omitted", () => {
    render(<FormField id="email" label="Email address" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders the error message and marks the input invalid only when the error prop is supplied", () => {
    render(<FormField id="email" label="Email address" error="Enter a valid email address." />);
    const input = screen.getByLabelText("Email address");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
  });

  it("passes through native input props unchanged", () => {
    render(<FormField id="code" label="Enter the code" inputMode="numeric" maxLength={6} />);
    const input = screen.getByLabelText("Enter the code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("maxlength", "6");
  });
});
