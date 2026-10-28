import { createFileRoute } from "@tanstack/react-router";
import { contactEmail, siteUrl } from "@/lib/omniel";
import { getConfig, getEnquiriesDb } from "@/lib/automation/runtime-env";
import { handleAgentToolRequest, type AgentToolDeps } from "@/lib/voice/agent-tools";
import { createResendEmailSender, createResendWaitlistStore } from "@/lib/waitlist-resend";

/**
 * POST /api/agent/tools
 *
 * Called only by the OMNIEL voice agent (agent/), never by the browser. It
 * runs the tools that need the server: reading the website, submitting an
 * enquiry, and joining the NOVA waitlist. See src/lib/voice/agent-tools.ts
 * for the contract.
 */
export const Route = createFileRoute("/api/agent/tools")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const deps: AgentToolDeps = {
          enquiry: { toEmail: getConfig("OMNIEL_ENQUIRY_EMAIL") || contactEmail },
        };

        const agentSecret = getConfig("AGENT_SHARED_SECRET");
        if (agentSecret) deps.agentSecret = agentSecret;
        const resendApiKey = getConfig("RESEND_API_KEY");
        if (resendApiKey) deps.enquiry.resendApiKey = resendApiKey;
        const fromEmail = getConfig("RESEND_FROM_EMAIL");
        if (fromEmail) deps.enquiry.fromEmail = fromEmail;
        const db = getEnquiriesDb();
        if (db) deps.enquiry.db = db;

        // Waitlist pipeline (server-only). Mirrors /api/waitlist's setup so
        // the agent joins the same waitlist with the same double opt-in.
        const tokenSecret = getConfig("WAITLIST_TOKEN_SECRET");
        const waitlistApiKey = getConfig("RESEND_API_KEY");
        const waitlistFrom = getConfig("RESEND_FROM_EMAIL");
        if (tokenSecret && waitlistApiKey && waitlistFrom) {
          deps.waitlist = {
            store: createResendWaitlistStore({ apiKey: waitlistApiKey }),
            sendEmail: createResendEmailSender({
              apiKey: waitlistApiKey,
              from: waitlistFrom,
              replyTo: contactEmail,
            }),
            tokenSecret,
            siteUrl,
          };
        }

        return handleAgentToolRequest(request, deps);
      },
    },
  },
});
