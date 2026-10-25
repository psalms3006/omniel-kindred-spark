import { createFileRoute } from "@tanstack/react-router";
import { getConfig } from "@/lib/automation/runtime-env";
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

        const tokenSecret = getConfig("WAITLIST_TOKEN_SECRET");
        if (tokenSecret) deps.tokenSecret = tokenSecret;

        const apiKey = getConfig("RESEND_API_KEY");
        const fromEmail = getConfig("RESEND_FROM_EMAIL");
        if (apiKey) {
          // Segment membership is added on confirmation, not here, so pending
          // addresses can never receive a broadcast.
          deps.store = createResendWaitlistStore({ apiKey });
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
