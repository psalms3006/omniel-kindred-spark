import { createFileRoute } from "@tanstack/react-router";
import { getConfig } from "@/lib/automation/runtime-env";
import { contactEmail, siteUrl } from "@/lib/omniel";
import { handleWaitlistConfirm } from "@/lib/waitlist-handler";
import { createResendEmailSender, createResendWaitlistStore } from "@/lib/waitlist-resend";

/**
 * POST /api/waitlist-confirm
 *
 * Completes double opt-in. Called by the /waitlist-confirm page's button
 * (a POST, not the email link itself) so mail scanners that prefetch links
 * cannot silently confirm someone.
 */
export const Route = createFileRoute("/api/waitlist-confirm")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const deps: Parameters<typeof handleWaitlistConfirm>[1] = { siteUrl };

        const tokenSecret = getConfig("WAITLIST_TOKEN_SECRET");
        if (tokenSecret) deps.tokenSecret = tokenSecret;

        const apiKey = getConfig("RESEND_API_KEY");
        const fromEmail = getConfig("RESEND_FROM_EMAIL");
        const segmentId = getConfig("RESEND_WAITLIST_SEGMENT_ID");
        if (apiKey) {
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

        return handleWaitlistConfirm(request, deps);
      },
    },
  },
});
