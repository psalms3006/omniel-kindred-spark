import { createFileRoute } from "@tanstack/react-router";
import { getConfig } from "@/lib/automation/runtime-env";
import { contactEmail } from "@/lib/omniel";
import { handleEnquiryRequest } from "@/lib/enquiry-handler";

/**
 * POST /api/enquiry
 *
 * Real submission backend for the site's InquiryForm instances, and the
 * target for the server-side Vapi `submit_enquiry` tool (configured in the
 * Vapi Dashboard with this endpoint's production URL — see the deliverable
 * report for the exact contract).
 *
 * All secrets are read from server-only env vars here, never from anything
 * VITE_-prefixed, and never returned in a response body.
 */
export const Route = createFileRoute("/api/enquiry")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const deps: Parameters<typeof handleEnquiryRequest>[1] = {
          toEmail: getConfig("OMNIEL_ENQUIRY_EMAIL") || contactEmail,
        };
        const resendApiKey = getConfig("RESEND_API_KEY");
        if (resendApiKey) deps.resendApiKey = resendApiKey;
        const fromEmail = getConfig("RESEND_FROM_EMAIL");
        if (fromEmail) deps.fromEmail = fromEmail;
        return handleEnquiryRequest(request, deps);
      },
    },
  },
});
