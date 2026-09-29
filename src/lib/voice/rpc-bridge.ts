import type { ActionDispatcher } from "./actions";

/**
 * The single RPC method the voice agent calls on the visitor's browser.
 *
 * The agent (agent/src/agent.ts) runs as a separate Node service and cannot
 * touch the page, so every on-page action — navigating, scrolling, opening or
 * filling a form — travels as one LiveKit RPC with a `{ name, args }` payload.
 * Unlike Vapi's client tools, an RPC returns a value, so the agent hears what
 * actually happened ("section not found") instead of assuming success.
 *
 * The method name must match AGENT_ACTION_RPC in agent/src/tools.ts.
 */
export const AGENT_ACTION_RPC = "omniel.action";

/**
 * The only dispatcher methods the agent may invoke. This is the allowlist: an
 * RPC naming anything else is refused, even if the dispatcher grows new
 * methods later. Submitting an enquiry is deliberately absent — that happens
 * server-side, where the result is authoritative.
 */
const CLIENT_ACTIONS = [
  "navigate_to_page",
  "navigate_to_section",
  "open_product",
  "navigate_to_product_section",
  "open_form",
  "fill_form",
] as const satisfies readonly (keyof ActionDispatcher)[];

type ClientAction = (typeof CLIENT_ACTIONS)[number];

function isClientAction(value: unknown): value is ClientAction {
  return typeof value === "string" && (CLIENT_ACTIONS as readonly string[]).includes(value);
}

/**
 * The agent's fill_form schema is flat — { formId, name, email, category,
 * message } — because that is what models fill in reliably. The dispatcher's
 * fill_form takes { formId, fields: {...} }. This bridges the two without
 * changing either.
 */
function adaptArgs(name: ClientAction, args: Record<string, unknown>): Record<string, unknown> {
  if (name !== "fill_form") return args;
  const { formId, ...rest } = args;
  const fields: Record<string, unknown> = {};
  for (const key of ["name", "email", "category", "message"]) {
    if (rest[key] != null) fields[key] = rest[key];
  }
  return { formId, fields };
}

/**
 * Runs one RPC payload against the dispatcher and returns the JSON string sent
 * back to the agent. Never throws: a failure is reported to the agent as
 * `{ ok: false, error }` so it can tell the visitor rather than go silent.
 */
export async function runAgentAction(
  payload: string,
  dispatcher: ActionDispatcher,
): Promise<string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return JSON.stringify({ ok: false, error: "Payload was not valid JSON." });
  }

  const { name, args } = (parsed ?? {}) as { name?: unknown; args?: unknown };
  if (!isClientAction(name)) {
    return JSON.stringify({ ok: false, error: `Unknown action "${String(name)}".` });
  }

  const input = args && typeof args === "object" ? (args as Record<string, unknown>) : {};
  try {
    const result = await dispatcher[name](adaptArgs(name, input) as never);
    return JSON.stringify(result);
  } catch (err) {
    console.error(`[voice] action ${name} threw`, err);
    return JSON.stringify({ ok: false, error: "The page could not complete that action." });
  }
}
