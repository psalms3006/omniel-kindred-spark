import { createFileRoute } from "@tanstack/react-router";
import { contactEmail } from "@/lib/omniel";
import { getConfig, getEnquiriesDb } from "@/lib/automation/runtime-env";
import { handleAgentToolRequest, type AgentToolDeps } from "@/lib/voice/agent-tools";

/**
 * POST /api/agent/tools
 *
 * Called only by the OMNIEL voice agent (agent/), never by the browser. It
 * runs the two tools that need the server: reading the website and submitting
 * an enquiry. See src/lib/voice/agent-tools.ts for the contract.
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

        return handleAgentToolRequest(request, deps);
      },
    },
  },
});
