import { z } from "zod";

/**
 * The only form ids that actually exist in the app (see InquiryForm usages in
 * src/routes/contact.tsx and src/routes/careers.tsx). Never widen this list
 * to accept an id "in case it's needed later" — an unrecognized formId must
 * be rejected, not guessed at.
 */
export const ENQUIRY_FORM_IDS = ["contact", "partnerships", "investment", "careers"] as const;
export type EnquiryFormId = (typeof ENQUIRY_FORM_IDS)[number];

/**
 * Server-side source of truth for enquiry submissions. The browser (manual
 * form submit or a Vapi client tool) is untrusted input — this schema is
 * re-checked on every request regardless of what the client claims.
 */
export const enquirySchema = z.object({
  formId: z.enum(ENQUIRY_FORM_IDS),
  name: z.string().trim().min(1, "Name is required.").max(120, "Name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Not a valid email address.")
    .max(200),
  category: z.string().trim().max(80, "Category is too long.").optional().default(""),
  message: z.string().trim().min(1, "Message is required.").max(4000, "Message is too long."),
  // Must be the literal boolean `true`. Missing, `false`, or truthy-but-not-`true`
  // values (e.g. the string "true") are all rejected — the assistant must not
  // be able to talk its way past explicit user confirmation.
  confirmation: z.literal(true, {
    errorMap: () => ({ message: "Confirmation is required before an enquiry can be submitted." }),
  }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const ENQUIRY_FORM_LABELS: Record<EnquiryFormId, string> = {
  contact: "General Enquiry",
  partnerships: "Partnership Enquiry",
  investment: "Support / Investment Interest",
  careers: "Careers Interest",
};
