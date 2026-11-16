import { createFileRoute } from "@tanstack/react-router";
import { contactEmail, siteUrl } from "@/lib/omniel";
import { resolveWaitlistConfig } from "@/lib/waitlist-config";
import { handleWaitlistSignup } from "@/lib/waitlist-handler";
import { createResendEmailSender, createResendWaitlistStore } from "@/lib/waitlist-resend";

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/waitlist")({
  server: {
    handlers: {
      /**
       * A read-only configuration check for operators. It never creates a
       * contact, sends an email, or returns a secret value.
       */
      GET: ({ request }) => {
        const config = resolveWaitlistConfig(request);
        return json(
          {
            ok: true,
            configured: config.missing.length === 0,
            missing: config.missing,
            signingKey: config.tokenSecretSource,
            fromEmail: config.fromEmailSource,
          },
          200,
        );
      },

      POST: ({ request }) => {
        const deps: Parameters<typeof handleWaitlistSignup>[1] = { siteUrl };
        const config = resolveWaitlistConfig(request);

        if (config.tokenSecretSource === "derived") {
          console.warn(
            "WAITLIST_TOKEN_SECRET is not set; using a key derived from RESEND_API_KEY for confirmation links.",
          );
        }

        if (config.tokenSecret) deps.tokenSecret = config.tokenSecret;
        if (config.apiKey) {
          // Segment membership is added on confirmation, not here, so pending
          // addresses can never receive a broadcast.
          deps.store = createResendWaitlistStore({ apiKey: config.apiKey });
          deps.sendEmail = createResendEmailSender({
            apiKey: config.apiKey,
            from: config.fromEmail,
            replyTo: contactEmail,
          });
        }

        return handleWaitlistSignup(request, deps);
      },
    },
  },
});
