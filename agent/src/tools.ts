import { llm } from "@livekit/agents";
import type { Room } from "@livekit/rtc-node";
import { z } from "zod";
import type { AgentConfig } from "./config.js";

/**
 * Every tool the OMNIEL agent can call.
 *
 * Two kinds, decided by where the work has to happen:
 *  - Site tools (search_website, submit_enquiry) run on the website's server,
 *    reached over HTTP at POST {SITE_URL}/api/agent/tools. The website owns the
 *    content index and the enquiry pipeline; the agent never duplicates them.
 *  - Page tools (navigation, forms) run in the visitor's browser, reached by a
 *    LiveKit RPC. The browser executes them through the site's action
 *    dispatcher and returns the real outcome.
 *
 * The enums below mirror src/lib/voice/actions.ts and src/lib/enquiry-schema.ts
 * in the website. The browser and server re-validate everything, so drift
 * here produces a clear "unknown X" answer rather than a wrong action — but
 * keep them in step.
 */

/** Must match AGENT_ACTION_RPC in src/lib/voice/rpc-bridge.ts. */
const AGENT_ACTION_RPC = "omniel.action";

const PAGES = [
  "home", "about", "products", "careers", "contact", "research", "technology", "privacy", "terms",
] as const;
const SECTIONS = [
  "products", "about", "ecosystem", "compare", "reality", "belief", "vision", "team",
  "directions", "offline", "per-product", "future",
] as const;
const PRODUCTS = ["nova", "vyren", "arvo", "kiwi"] as const;
const FORMS = ["contact", "partnerships", "investment", "careers"] as const;
const SITE_PATHS = [
  "/", "/about", "/products", "/products/nova", "/products/vyren", "/products/arvo",
  "/products/kiwi", "/technology", "/research", "/careers", "/contact", "/privacy", "/terms",
] as const;

/** Site tool calls must answer well inside a spoken pause. */
const SITE_TIMEOUT_MS = 8_000;
const RPC_TIMEOUT_MS = 8_000;

async function callSite(config: AgentConfig, tool: string, args: unknown): Promise<string> {
  try {
    const response = await fetch(new URL("/api/agent/tools", config.siteUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-agent-secret": config.sharedSecret },
      body: JSON.stringify({ tool, args }),
      signal: AbortSignal.timeout(SITE_TIMEOUT_MS),
    });
    const body = (await response.json().catch(() => ({}))) as { result?: unknown };
    if (response.ok && typeof body.result === "string") return body.result;
    console.error(`[agent] ${tool} returned HTTP ${response.status}`);
  } catch (err) {
    console.error(`[agent] ${tool} failed`, err);
  }
  return "The website could not be reached just now. Tell the visitor you cannot check that at the moment, and offer the contact page instead. Do not guess.";
}

/** The visitor is the room's one non-agent participant (identity `visitor-…`, see the token route). */
function findVisitor(room: Room): string | undefined {
  for (const participant of room.remoteParticipants.values()) {
    if (participant.identity.startsWith("visitor-")) return participant.identity;
  }
  return undefined;
}

async function callPage(room: Room, name: string, args: unknown): Promise<string> {
  const visitor = findVisitor(room);
  if (!visitor || !room.localParticipant) {
    return "The visitor's page is not connected, so nothing changed on screen.";
  }
  try {
    return await room.localParticipant.performRpc({
      destinationIdentity: visitor,
      method: AGENT_ACTION_RPC,
      payload: JSON.stringify({ name, args }),
      responseTimeout: RPC_TIMEOUT_MS,
    });
  } catch (err) {
    console.error(`[agent] page action ${name} failed`, err);
    return JSON.stringify({ ok: false, error: "The page did not respond." });
  }
}

export function createTools(config: AgentConfig, room: Room) {
  return {
    search_website: llm.tool({
      description:
        "Read what the OMNIEL website says right now. USE THIS FIRST, before answering, for any question about OMNIEL's people and team, products (NOVA, VYREN, ARVO, KIWI), technology, research, careers, or contact details. Answer only from what it returns. If it returns nothing relevant, say plainly that the information is not publicly available and offer to pass the question to OMNIEL. Never fill a gap with a guess.",
      parameters: z.object({
        query: z
          .string()
          .describe(
            "What to look up, in the visitor's own words. For a person, their name. For a topic, the key words, e.g. 'offline capability'.",
          ),
        page: z
          .enum(SITE_PATHS)
          .optional()
          .describe("Only when the visitor names a specific page: restrict the lookup to it."),
      }),
      execute: (args) => callSite(config, "search_website", args),
    }),

    submit_enquiry: llm.tool({
      description:
        "Send an enquiry to OMNIEL by email on the visitor's behalf. ONLY after reading the details back and the visitor explicitly saying yes to 'Would you like me to send this?'.",
      parameters: z.object({
        formId: z.enum(FORMS).describe("Which kind of enquiry this is."),
        name: z.string().describe("The visitor's name."),
        email: z.string().describe("The visitor's email address, spelled back and confirmed."),
        category: z.string().optional().describe("Category or area, if relevant."),
        message: z.string().describe("The enquiry, in the visitor's words."),
        confirmation: z
          .boolean()
          .describe("True only once the visitor has explicitly confirmed sending."),
      }),
      execute: (args) => callSite(config, "submit_enquiry", args),
    }),

    navigate_to_page: llm.tool({
      description: "Open a top-level OMNIEL page when the visitor asks to go somewhere.",
      parameters: z.object({ page: z.enum(PAGES) }),
      execute: (args) => callPage(room, "navigate_to_page", args),
    }),

    navigate_to_section: llm.tool({
      description:
        "Open the page that holds a named section and scroll to it. More precise than navigate_to_page when the visitor names a part of a page.",
      parameters: z.object({ section: z.enum(SECTIONS) }),
      execute: (args) => callPage(room, "navigate_to_section", args),
    }),

    open_product: llm.tool({
      description: "Open a product's page.",
      parameters: z.object({ slug: z.enum(PRODUCTS) }),
      execute: (args) => callPage(room, "open_product", args),
    }),

    navigate_to_product_section: llm.tool({
      description: "Open a product's page and scroll to its capabilities or audience section.",
      parameters: z.object({
        slug: z.enum(PRODUCTS),
        section: z.enum(["capabilities", "audience"]),
      }),
      execute: (args) => callPage(room, "navigate_to_product_section", args),
    }),

    open_form: llm.tool({
      description: "Open an enquiry form and scroll to it. Call before fill_form.",
      parameters: z.object({ formId: z.enum(FORMS) }),
      execute: (args) => callPage(room, "open_form", args),
    }),

    fill_form: llm.tool({
      description:
        "Fill fields on a form that is already open, so the visitor can see and check them. Does not send anything.",
      parameters: z.object({
        formId: z.enum(FORMS),
        name: z.string().optional(),
        email: z.string().optional(),
        category: z.string().optional(),
        message: z.string().optional(),
      }),
      execute: (args) => callPage(room, "fill_form", args),
    }),
  };
}
