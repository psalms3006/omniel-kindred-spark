import { createFileRoute } from "@tanstack/react-router";
import { contactEmail, siteUrl } from "@/lib/omniel";
import { resolveWaitlistConfig } from "@/lib/waitlist-config";
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
        const config = resolveWaitlistConfig(request, true);

        if (config.tokenSecretSource === "derived") {
          console.warn(
            "WAITLIST_TOKEN_SECRET is not set; verifying the confirmation with a key derived from RESEND_API_KEY.",
          );
        }

        if (config.tokenSecret) deps.tokenSecret = config.tokenSecret;
        if (config.apiKey) {
          deps.store = config.segmentId
            ? createResendWaitlistStore({ apiKey: config.apiKey, segmentId: config.segmentId })
            : createResendWaitlistStore({ apiKey: config.apiKey });
          deps.sendEmail = createResendEmailSender({
            apiKey: config.apiKey,
            from: config.fromEmail,
            replyTo: contactEmail,
          });
        }

        return handleWaitlistConfirm(request, deps);
      },
    },
  },
});
