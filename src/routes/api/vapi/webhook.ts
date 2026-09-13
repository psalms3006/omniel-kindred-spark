import { createFileRoute } from "@tanstack/react-router";
import { contactEmail } from "@/lib/omniel";
import {
  handleVapiServerRequest,
  type VapiServerDeps,
} from "@/lib/vapi-integration/server-handler";
import { getConfig, getEnquiriesDb } from "@/lib/automation/runtime-env";

/**
 * POST /api/vapi/webhook
 *
 * The single server URL configured on the OMNIEL assistant in Vapi. It
 * receives server tool calls (submit_enquiry) and end-of-call reports.
 *
 * Authentication is a shared secret in the `x-vapi-secret` header, set both
 * here (VAPI_SERVER_SECRET) and on the assistant in Vapi. Without it this
 * endpoint would let anyone on the internet send OMNIEL email, so it fails
 * closed when the secret is not configured.
 *
 * Turnstile deliberately does not apply: there is no browser in this path.
 */
export const Route = createFileRoute("/api/vapi/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const deps: VapiServerDeps = {
          toEmail: getConfig("OMNIEL_ENQUIRY_EMAIL") || contactEmail,
          origin: "assistant",
          // Read the site this Worker is actually serving, so a preview
          // deployment reads itself rather than production.
          siteOrigin: new URL(request.url).origin,
        };

        const serverSecret = getConfig("VAPI_SERVER_SECRET");
        if (serverSecret) deps.serverSecret = serverSecret;
        const resendApiKey = getConfig("RESEND_API_KEY");
        if (resendApiKey) deps.resendApiKey = resendApiKey;
        const fromEmail = getConfig("RESEND_FROM_EMAIL");
        if (fromEmail) deps.fromEmail = fromEmail;
        const summaryToEmail = getConfig("OMNIEL_SUMMARY_EMAIL");
        if (summaryToEmail) deps.summaryToEmail = summaryToEmail;

        const db = getEnquiriesDb();
        if (db) deps.db = db;

        return handleVapiServerRequest(request, deps);
      },
    },
  },
});
