import { z } from "zod";

export const smokeTestInputSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

export type SmokeTestInput = z.infer<typeof smokeTestInputSchema>;
