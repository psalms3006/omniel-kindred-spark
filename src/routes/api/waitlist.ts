import { createFileRoute } from "@tanstack/react-router";
import { contactEmail, siteUrl } from "@/lib/omniel";
import { handleWaitlistSignup } from "@/lib/waitlist-handler";
import { createResendEmailSender, createResendWaitlistStore } from "@/lib/waitlist-resend";

/**
 * POST /api/waitlist
 *
 * NOVA waitlist signup. Stores the contact in Resend and sends the
 * double opt-in confirmation email. All secrets are read from server-only env
 * vars, never from anything VITE_-prefixed, and never returned in a response.
 */
export const Route = createFileRoute("/api/waitlist")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const deps: Parameters<typeof handleWaitlistSignup>[1] = { siteUrl };

        const tokenSecret = process.env["WAITLIST_TOKEN_SECRET"];
        if (tokenSecret) deps.tokenSecret = tokenSecret;

        const apiKey = process.env["RESEND_API_KEY"];
        const fromEmail = process.env["RESEND_FROM_EMAIL"];
        if (apiKey) {
          const segmentId = process.env["RESEND_WAITLIST_SEGMENT_ID"];
          deps.store = segmentId
            ? createResendWaitlistStore({ apiKey, segmentId })
            : createResendWaitlistStore({ apiKey });
          if (fromEmail)
            deps.sendEmail = createResendEmailSender({
              apiKey,
              from: fromEmail,
              replyTo: contactEmail,
            });
        }

        return handleWaitlistSignup(request, deps);
      },
    },
  },
});
