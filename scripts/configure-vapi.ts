/**
 * Configures the OMNIEL assistant in Vapi from this repository.
 *
 * The tool registry in src/lib/vapi-integration/tool-registry.ts is the single
 * source of truth. This script pushes it to Vapi rather than anyone retyping
 * seven JSON schemas into a dashboard, which is how the account ended up with
 * a tool literally named "function_tool" that nothing could ever dispatch.
 *
 * Run:
 *   node --env-file=.env scripts/configure-vapi.ts          # show the plan
 *   node --env-file=.env scripts/configure-vapi.ts --apply  # write it
 *
 * Idempotent: tools are matched by name and updated in place, so running it
 * twice does not create duplicates.
 */
import { TOOL_REGISTRY } from "../src/lib/vapi-integration/tool-registry.ts";

const API = "https://api.vapi.ai";

const PRIVATE_KEY = process.env["VAPI_PRIVATE_KEY"];
const ASSISTANT_ID = process.env["VITE_VAPI_ASSISTANT_ID"];
const SERVER_SECRET = process.env["VAPI_SERVER_SECRET"];
const WEBHOOK_URL = process.env["VAPI_WEBHOOK_URL"] ?? "https://omniel.com.ng/api/vapi/webhook";

const APPLY = process.argv.includes("--apply");

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`MISSING REQUIRED CONFIGURATION: ${name}`);
    process.exit(1);
  }
  return value;
}

const privateKey = requireEnv("VAPI_PRIVATE_KEY", PRIVATE_KEY);
const assistantId = requireEnv("VITE_VAPI_ASSISTANT_ID", ASSISTANT_ID);
const serverSecret = requireEnv("VAPI_SERVER_SECRET", SERVER_SECRET);

async function vapi(path: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${privateKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} failed ${res.status}: ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : null;
}

type VapiTool = { id: string; function?: { name?: string } };

/**
 * Where Vapi sends server-side work, and how it proves it is Vapi.
 *
 * The secret travels as an explicit header rather than Vapi's `secret` field.
 * Both end up as `x-vapi-secret` on the request, but `secret` is write-only:
 * it never comes back on a GET, so there is no way to confirm it was actually
 * stored. `headers` is returned, so the configuration can be verified instead
 * of assumed. That matters here because a silently missing secret would make
 * every real webhook call fail with 401.
 */
function serverConfig() {
  return { url: WEBHOOK_URL, headers: { "x-vapi-secret": serverSecret } };
}

/**
 * The structured extraction Vapi runs against each finished conversation.
 *
 * These field names are the contract with extractStructuredData() in
 * src/lib/vapi-integration/server-handler.ts. Changing one without the other
 * silently produces empty summary emails.
 */
const STRUCTURED_DATA_SCHEMA = {
  type: "object",
  properties: {
    visitorName: { type: "string", description: "The visitor's name, if they gave one." },
    contactEmail: { type: "string", description: "Email address, if they gave one." },
    contactPhone: { type: "string", description: "Phone number, if they gave one." },
    reason: { type: "string", description: "Why they contacted OMNIEL, in one short phrase." },
    questions: {
      type: "array",
      items: { type: "string" },
      description: "Questions the visitor asked.",
    },
    requestedFollowUp: {
      type: "string",
      description: "Any follow-up the visitor explicitly asked for. Empty if none.",
    },
    leadType: {
      type: "string",
      description: "One of: general, partnership, investment, careers, none.",
    },
    actionItems: {
      type: "array",
      items: { type: "string" },
      description: "Concrete things OMNIEL needs to do. Empty if none.",
    },
  },
  required: [],
};

async function main() {
  console.log(`Assistant : ${assistantId}`);
  console.log(`Webhook   : ${WEBHOOK_URL}`);
  console.log(`Mode      : ${APPLY ? "APPLY" : "dry run (pass --apply to write)"}`);
  console.log("");

  const existing = (await vapi("/tool")) as VapiTool[];
  const byName = new Map<string, string>();
  for (const t of existing) {
    const name = t.function?.name;
    if (name) byName.set(name, t.id);
  }

  const toolIds: string[] = [];

  for (const tool of TOOL_REGISTRY) {
    const isServerTool = tool.executionLocation === "server";
    const payload: Record<string, unknown> = {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    };
    // Only the server tool gets a destination. Tools without one are
    // dispatched to the browser by the Web SDK, which is where the
    // navigation and form-filling handlers live.
    if (isServerTool) {
      payload["server"] = serverConfig();
    }

    const existingId = byName.get(tool.name);
    const where = isServerTool ? "server" : "client";

    if (!APPLY) {
      console.log(`${existingId ? "update" : "create"}  ${tool.name.padEnd(28)} (${where})`);
      if (existingId) toolIds.push(existingId);
      continue;
    }

    if (existingId) {
      await vapi(`/tool/${existingId}`, { method: "PATCH", body: JSON.stringify(payload) });
      toolIds.push(existingId);
      console.log(`updated  ${tool.name} (${where})`);
    } else {
      const created = (await vapi("/tool", {
        method: "POST",
        body: JSON.stringify(payload),
      })) as VapiTool;
      toolIds.push(created.id);
      console.log(`created  ${tool.name} (${where}) -> ${created.id}`);
    }
  }

  const assistantPatch = {
    model: {
      // Preserved from the live assistant; this script must not rewrite the
      // system prompt, which is maintained in the Vapi dashboard.
      toolIds,
    },
    server: serverConfig(),
    // End-of-call reports go to the server. Tool calls deliberately do not:
    // the client tools must reach the browser, and the one server tool has its
    // own server URL on the tool itself.
    serverMessages: ["end-of-call-report"],
    // "tool-calls" is the one that matters: it is how the browser receives
    // navigation and form-filling calls. The rest are what the widget already
    // relies on for its listening/speaking states.
    clientMessages: [
      "tool-calls",
      "transcript",
      "hang",
      "speech-update",
      "status-update",
      "conversation-update",
    ],
    analysisPlan: {
      summaryPlan: { enabled: true },
      structuredDataPlan: { enabled: true, schema: STRUCTURED_DATA_SCHEMA },
    },
  };

  console.log("");
  if (!APPLY) {
    console.log("assistant patch that would be sent:");
    console.log(
      JSON.stringify(
        { ...assistantPatch, server: { url: WEBHOOK_URL, secret: "[redacted]" } },
        null,
        2,
      ),
    );
    return;
  }

  // Read the live model config first so patching toolIds does not drop the
  // provider, model name or the system prompt.
  const current = (await vapi(`/assistant/${assistantId}`)) as {
    model?: Record<string, unknown>;
  };
  const mergedModel = { ...(current.model ?? {}), toolIds };

  await vapi(`/assistant/${assistantId}`, {
    method: "PATCH",
    body: JSON.stringify({ ...assistantPatch, model: mergedModel }),
  });
  console.log(`assistant updated with ${toolIds.length} tools, analysis plan and webhook`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
