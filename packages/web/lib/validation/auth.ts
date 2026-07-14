import { z } from "zod";

export const emailInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export type EmailInput = z.infer<typeof emailInputSchema>;

export const verifyCodeInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits."),
});

export type VerifyCodeInput = z.infer<typeof verifyCodeInputSchema>;
