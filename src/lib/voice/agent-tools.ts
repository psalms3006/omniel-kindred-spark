import { processEnquiry, type EnquiryDeps } from "../enquiry-handler";
import { enquirySchema } from "../enquiry-schema";
import { loadedPageCount, readSitePage, searchSite } from "../site-content";
import { processWaitlistSignup, type WaitlistDeps } from "../waitlist-handler";
import { waitlistSchema } from "../waitlist-schema";

/**
 * Server side of the voice agent's tools.
 *
 * The agent (agent/, a separate Node service) has no copy of the website or
 * the enquiry pipeline. It calls POST /api/agent/tools with
 * `{ tool, args }` and gets back `{ result }`, a string written to be read by
 * the model: it says what was found and, crucially, what to do when nothing
 * was. The "not publicly available" instruction lives here rather than only in
 * the prompt, because this is the moment the model decides whether to invent
 * something.
 *
 * Authentication is a shared secret in `x-agent-secret`, set both here
 * (AGENT_SHARED_SECRET) and on the agent. Without it this endpoint would let
 * anyone on the internet send OMNIEL email, so it fails closed when the secret
 * is not configured.
 */

export type AgentToolDeps = {
  /** Shared secret the agent sends as `x-agent-secret`. Required. */
  agentSecret?: string;
  /** Passed straight through to the enquiry pipeline. */
  enquiry: EnquiryDeps;
  /** Waitlist pipeline deps (store, email sender, token secret, site URL). */
  waitlist?: WaitlistDeps;
};

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/**
 * Length-independent comparison.
 *
 * A plain `===` on secrets leaks length and prefix information through timing.
 * The cost here is negligible and it removes the question entirely.
 */
function secretsMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function runSiteLookup(args: Record<string, unknown>): string {
  const query = typeof args["query"] === "string" ? args["query"].trim() : "";
  const page = typeof args["page"] === "string" ? args["page"] : undefined;

  try {
    if (page) {
      const found = readSitePage(page);
      if (found) {
        return `From the OMNIEL website page ${found.path} ("${found.title}"):\n\n${found.text}`;
      }
    }

    if (!query) {
      return "No search terms were given, so nothing was looked up. Ask the visitor to be more specific.";
    }

    const hits = searchSite(query);
    if (hits.length === 0) {
      console.log(`[agent] site lookup miss for "${query}" (pages indexed: ${loadedPageCount()})`);
      return `The OMNIEL website has nothing about "${query}". Tell the visitor plainly that this is not publicly available information and offer to pass their question to the OMNIEL team. Do not guess.`;
    }

    const body = hits.map((h) => `PAGE ${h.path} ("${h.title}")\n${h.excerpt}`).join("\n\n---\n\n");
    return `Current content from the OMNIEL website. Answer only from this, in two or three sentences, and offer to open the page:\n\n${body}`;
  } catch (err) {
    console.error("[agent] site lookup failed", err);
    return "The website could not be read just now. Say the information is not available at the moment and offer to pass the question to the OMNIEL team.";
  }
}

/**
 * Sends an enquiry through the same pipeline as the website form, so
 * validation (including the literal `confirmation: true`), de-duplication,
 * and email delivery behave identically whichever way it arrives.
 */
export async function runSubmitEnquiry(
  args: Record<string, unknown>,
  deps: EnquiryDeps,
): Promise<string> {
  const parsed = enquirySchema.safeParse({ ...args, source: "voice-assistant" });
  if (!parsed.success) {
    const missing = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
    return `The enquiry was not submitted because these details are missing or invalid: ${missing}. Ask the visitor for them and try again.`;
  }

  const outcome = await processEnquiry(parsed.data, { ...deps, origin: "assistant" });
  return outcome.status === 200
    ? `The enquiry was submitted successfully. Reference ${String(outcome.body["reference"])}. Tell the visitor it has been sent.`
    : `The enquiry was not submitted: ${String(outcome.body["error"] ?? "unknown error")}. Tell the visitor it did not go through and offer the contact page instead.`;
}

/**
 * Joins the NOVA waitlist on the visitor's behalf, using the same double
 * opt-in pipeline as the website's waitlist form. The result tells the model
 * exactly what happened: pending (confirmation email sent) or confirmed
 * (already on the list). Nothing is ever claimed as succeeded unless the
 * backend actually confirmed it.
 */
export async function runJoinWaitlist(
  args: Record<string, unknown>,
  deps: WaitlistDeps,
): Promise<string> {
  // Confirmation is a hard gate — the visitor must explicitly say yes before
  // anything is submitted. It is not part of waitlistSchema because that
  // schema is also used by the website form, which gets confirmation from the
  // user clicking "Join the waitlist" in the browser.
  if (args.confirmation !== true) {
    const missing: string[] = [];
    if (!args.name) missing.push("name");
    if (!args.email || typeof args.email !== "string") missing.push("email");
    missing.push("confirmation");
    return `The waitlist signup was not submitted because these details are missing or invalid: ${missing.join(", ")}. Ask the visitor for them and try again.`;
  }

  const parsed = waitlistSchema.safeParse(args);
  if (!parsed.success) {
    const missing = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
    return `The waitlist signup was not submitted because these details are missing or invalid: ${missing}. Ask the visitor for them and try again.`;
  }

  const outcome = await processWaitlistSignup(parsed.data, deps);
  if (!outcome.ok) {
    return `The waitlist signup was not submitted: ${outcome.error}. Tell the visitor it did not go through and offer the waitlist page instead.`;
  }

  if (outcome.status === "confirmed") {
    return `The visitor is already on the NOVA waitlist. Their place is confirmed — we'll email them when NOVA is ready.`;
  }

  return `The waitlist signup was submitted. A confirmation email has been sent to ${outcome.email}. Tell the visitor they need to open that email and click the confirmation link to hold their place — nothing happens until they confirm.`;
}

export async function handleAgentToolRequest(
  request: Request,
  deps: AgentToolDeps,
): Promise<Response> {
  if (!deps.agentSecret) {
    console.error("MISSING REQUIRED CONFIGURATION: AGENT_SHARED_SECRET");
    return json({ error: "Not configured." }, 503);
  }
  if (!secretsMatch(request.headers.get("x-agent-secret") ?? "", deps.agentSecret)) {
    console.warn("[agent] rejected a request with a missing or incorrect secret");
    return json({ error: "Unauthorized." }, 401);
  }

  let payload: { tool?: unknown; args?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const args =
    payload.args && typeof payload.args === "object"
      ? (payload.args as Record<string, unknown>)
      : {};

  switch (payload.tool) {
    case "search_website":
      return json({ result: runSiteLookup(args) }, 200);
    case "submit_enquiry":
      return json({ result: await runSubmitEnquiry(args, deps.enquiry) }, 200);
    case "join_waitlist": {
      const wl = deps.waitlist;
      if (!wl) {
        return json(
          { result: "The waitlist is not configured on the server. Tell the visitor to use the waitlist page on the website instead." },
          200,
        );
      }
      return json({ result: await runJoinWaitlist(args, wl) }, 200);
    }
    default:
      return json({ error: `Unknown tool "${String(payload.tool)}".` }, 400);
  }
}
