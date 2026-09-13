import { createFileRoute } from "@tanstack/react-router";
import { contactEmail } from "@/lib/omniel";
import { handleEnquiryRequest, type EnquiryDeps } from "@/lib/enquiry-handler";
import { getConfig, getEnquiriesDb, getRemoteIp } from "@/lib/automation/runtime-env";

/**
 * POST /api/enquiry
 *
 * The website form's submission endpoint. Browser-facing, so it is protected
 * by Cloudflare Turnstile.
 *
 * The voice assistant does NOT post here. It has its own endpoint at
 * /api/vapi/tools, which speaks Vapi's tool-call envelope and authenticates
 * with a shared secret instead of a browser challenge.
 *
 * All secrets are read from server-only config here, never from anything
 * VITE_-prefixed, and never returned in a response body.
 */
export const Route = createFileRoute("/api/enquiry")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const deps: EnquiryDeps = {
          toEmail: getConfig("OMNIEL_ENQUIRY_EMAIL") || contactEmail,
          origin: "website",
        };

        const resendApiKey = getConfig("RESEND_API_KEY");
        if (resendApiKey) deps.resendApiKey = resendApiKey;
        const fromEmail = getConfig("RESEND_FROM_EMAIL");
        if (fromEmail) deps.fromEmail = fromEmail;
        const turnstileSecretKey = getConfig("TURNSTILE_SECRET_KEY");
        if (turnstileSecretKey) deps.turnstileSecretKey = turnstileSecretKey;

        const db = getEnquiriesDb();
        if (db) deps.db = db;
        const remoteIp = getRemoteIp(request);
        if (remoteIp) deps.remoteIp = remoteIp;

        return handleEnquiryRequest(request, deps);
      },
    },
  },
});
