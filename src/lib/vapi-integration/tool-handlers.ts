import type Vapi from "@vapi-ai/web";
import type { ActionDispatcher } from "./actions";
import { CLIENT_TOOL_NAMES } from "./tool-registry";

type ToolCallMessage = {
  type: "tool-calls";
  toolCalls?: Array<{
    id: string;
    function?: { name?: string; arguments?: unknown };
  }>;
};

type ClientActionName = keyof ActionDispatcher;

function isClientToolName(value: unknown): value is ClientActionName {
  return typeof value === "string" && (CLIENT_TOOL_NAMES as readonly string[]).includes(value);
}

function parseArgs(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return raw as Record<string, unknown>;
}

/**
 * The registry's fill_form schema (tool-registry.ts) is intentionally flat —
 * { formId, name, email, category, message } — because that's what LLMs
 * fill in reliably. The dispatcher's fill_form (actions.ts) intentionally
 * takes { formId, fields: {...} } — a plain, already-tested, non-Vapi-shaped
 * API. This bridges the two without changing either.
 */
function adaptArgs(name: string, args: Record<string, unknown>): Record<string, unknown> {
  if (name !== "fill_form") return args;
  const { formId, ...rest } = args;
  const fields: Record<string, unknown> = {};
  for (const key of ["name", "email", "category", "message"]) {
    if (rest[key] != null) fields[key] = rest[key];
  }
  return { formId, fields };
}

/**
 * Wires Vapi's `tool-calls` client messages to the action dispatcher.
 *
 * The tool names this accepts come from tool-registry.ts's CLIENT_TOOL_NAMES
 * (everything marked executionLocation: "client") — that's the single
 * allowlist, so a tool can't be silently invoked here unless it's declared
 * in the registry first. `submit_enquiry` is intentionally absent from that
 * list — per Vapi's own docs, client-side tools cannot reliably return a
 * result to the model for further reasoning
 * (https://docs.vapi.ai/tools/client-side-websdk). Since the assistant must
 * only ever report a real success/failure for a submission, `submit_enquiry`
 * has to be a Vapi *server-side* tool hitting POST /api/enquiry directly —
 * see the deliverable report for that contract. The tools handled here are
 * fire-and-forget UI actions where that limitation doesn't matter.
 */
export function attachToolHandlers(vapi: Vapi, dispatcher: ActionDispatcher): () => void {
  const onMessage = (message: unknown) => {
    const msg = message as ToolCallMessage;
    if (msg?.type !== "tool-calls" || !Array.isArray(msg.toolCalls)) return;

    for (const call of msg.toolCalls) {
      const name = call.function?.name;
      if (!isClientToolName(name)) {
        if (name) console.warn(`[VAPI TOOL] ignoring unknown/non-client tool "${name}"`);
        continue;
      }

      const args = adaptArgs(name, parseArgs(call.function?.arguments));
      console.log(`[VAPI TOOL] ${name} called with`, args);

      void dispatcher[name](args as never)
        .then((result) => {
          console.log(`[VAPI TOOL RESULT] ${name} ->`, result);
          // Best-effort visibility only — not a guaranteed model-visible tool
          // result (see module comment above). Safe to ignore if unsupported.
          try {
            vapi.send({
              type: "add-message",
              message: {
                role: "system",
                content: `Result of ${name}: ${JSON.stringify(result)}`,
              },
            });
          } catch {
            // Non-fatal — the UI action already happened regardless.
          }
        })
        .catch((err: unknown) => {
          console.error(`[VAPI TOOL ERROR] ${name} threw`, err);
        });
    }
  };

  vapi.on("message", onMessage);
  return () => vapi.removeListener("message", onMessage);
}
