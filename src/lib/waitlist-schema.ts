import { z } from "zod";

export const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Not a valid email address.")
    .max(200),
  /** Optional: a short note on what the person would want from NOVA. */
  intendedUse: z
    .string()
    .trim()
    .max(500, "Please keep this under 500 characters.")
    .optional()
    .default(""),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
