import { enquirySchema } from "../enquiry-schema";
import { processEnquiry, type EnquiryDeps } from "../enquiry-handler";
import { createResendChannel } from "../automation/notify";
import { callSummaryNotification, type CallSummaryData } from "../automation/templates";

/**
 * Vapi's server webhook.
 *
 * Vapi sends every server-side event to a single URL and distinguishes them by
 * `message.type`, so this is one endpoint with a switch rather than several
 * routes. Two types are acted on:
 *
 *  - "tool-calls": the assistant invoked a server tool. Today that means
 *    submit_enquiry, which runs the same pipeline as the website form.
 *  - "end-of-call-report": a conversation finished. Vapi has already produced
 *    the summary and structured extraction (configured on the assistant's
 *    analysis plan), so this formats and emails it.
 *
 * Everything else is acknowledged with 200 and ignored. Returning an error for
 * unrecognised event types would make Vapi retry events we simply do not use.
 */

export type VapiServerDeps = EnquiryDeps & {
  /** Shared secret Vapi sends as `x-vapi-secret`. Required; requests without it are rejected. */
  serverSecret?: string;
  /** Where conversation summaries are emailed. Falls back to the enquiry address. */
  summaryToEmail?: string;
};

type ToolCall = {
  id?: string;
  function?: { name?: string; arguments?: unknown };
};

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
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

/** Vapi sends tool arguments as an object, but has historically sent a JSON string. Accept both. */
function parseArguments(raw: unknown): Record<string, unknown> | undefined {
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

async function handleToolCalls(
  toolCalls: ToolCall[],
  deps: VapiServerDeps,
): Promise<Record<string, unknown>> {
  const results: { toolCallId: string; result: string }[] = [];

  for (const call of toolCalls) {
    const toolCallId = call.id ?? "";
    const name = call.function?.name;

    if (name !== "submit_enquiry") {
      // Client-side tools are dispatched in the browser and should never
      // arrive here. Say so plainly rather than failing silently.
      results.push({
        toolCallId,
        result: `Unsupported server tool: ${String(name)}. No action was taken.`,
      });
      continue;
    }

    const args = parseArguments(call.function?.arguments);
    if (!args) {
      results.push({ toolCallId, result: "The enquiry could not be read. Nothing was submitted." });
      continue;
    }

    const parsed = enquirySchema.safeParse({
      ...args,
      source: typeof args["source"] === "string" ? args["source"] : "vapi-assistant",
    });
    if (!parsed.success) {
      const missing = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
      results.push({
        toolCallId,
        result: `The enquiry was not submitted because these details are missing or invalid: ${missing}. Ask the visitor for them and try again.`,
      });
      continue;
    }

    const outcome = await processEnquiry(parsed.data, { ...deps, origin: "assistant" });
    results.push({
      toolCallId,
      result:
        outcome.status === 200
          ? `The enquiry was submitted successfully. Reference ${String(outcome.body["reference"])}.`
          : `The enquiry was not submitted: ${String(outcome.body["error"] ?? "unknown error")}. Tell the visitor it did not go through and offer the email address instead.`,
    });
  }

  return { results };
}

function extractStructuredData(analysis: Record<string, unknown> | undefined): CallSummaryData {
  const raw = analysis?.["structuredData"];
  if (!raw || typeof raw !== "object") return {};
  const d = raw as Record<string, unknown>;
  const str = (k: string): string | undefined =>
    typeof d[k] === "string" ? (d[k] as string) : undefined;
  const arr = (k: string): string[] | undefined =>
    Array.isArray(d[k])
      ? (d[k] as unknown[]).filter((v): v is string => typeof v === "string")
      : undefined;

  const out: CallSummaryData = {};
  const visitorName = str("visitorName");
  if (visitorName) out.visitorName = visitorName;
  const contactEmail = str("contactEmail");
  if (contactEmail) out.contactEmail = contactEmail;
  const contactPhone = str("contactPhone");
  if (contactPhone) out.contactPhone = contactPhone;
  const reason = str("reason");
  if (reason) out.reason = reason;
  const requestedFollowUp = str("requestedFollowUp");
  if (requestedFollowUp) out.requestedFollowUp = requestedFollowUp;
  const leadType = str("leadType");
  if (leadType) out.leadType = leadType;
  const questions = arr("questions");
  if (questions?.length) out.questions = questions;
  const actionItems = arr("actionItems");
  if (actionItems?.length) out.actionItems = actionItems;
  return out;
}

async function handleEndOfCall(
  message: Record<string, unknown>,
  deps: VapiServerDeps,
): Promise<Record<string, unknown>> {
  const to = deps.summaryToEmail ?? deps.toEmail;
  if (!deps.resendApiKey || !deps.fromEmail || !to) {
    console.error("MISSING REQUIRED CONFIGURATION: cannot email call summary");
    return { ok: false };
  }

  const analysis =
    message["analysis"] && typeof message["analysis"] === "object"
      ? (message["analysis"] as Record<string, unknown>)
      : undefined;
  const call =
    message["call"] && typeof message["call"] === "object"
      ? (message["call"] as Record<string, unknown>)
      : undefined;

  const summary =
    (typeof analysis?.["summary"] === "string" ? (analysis["summary"] as string) : undefined) ??
    (typeof message["summary"] === "string" ? (message["summary"] as string) : undefined);

  const data = extractStructuredData(analysis);

  // A call where nobody said anything useful is not worth an email. This is
  // the "meaningful conversation" filter: no summary and nothing extracted
  // means there is nothing for a person to act on.
  const hasContent =
    Boolean(summary?.trim()) ||
    Boolean(data.visitorName || data.contactEmail || data.reason || data.actionItems?.length);
  if (!hasContent) {
    console.log("[vapi] end-of-call report had no actionable content, no email sent");
    return { ok: true, skipped: true };
  }

  const durationSeconds =
    typeof message["durationSeconds"] === "number"
      ? (message["durationSeconds"] as number)
      : undefined;

  const notification = callSummaryNotification({
    ...(summary ? { summary } : {}),
    data,
    ...(typeof message["endedReason"] === "string"
      ? { endedReason: message["endedReason"] as string }
      : {}),
    ...(durationSeconds !== undefined ? { durationSeconds } : {}),
    ...(typeof message["startedAt"] === "string"
      ? { startedAt: message["startedAt"] as string }
      : {}),
    ...(typeof call?.["id"] === "string" ? { callId: call["id"] as string } : {}),
  });

  const channel = createResendChannel({
    apiKey: deps.resendApiKey,
    from: deps.fromEmail,
    ...(deps.fetchImpl ? { fetchImpl: deps.fetchImpl } : {}),
  });

  const sent = await channel.send({
    to,
    subject: notification.subject,
    html: notification.html,
    text: notification.text,
    ...(data.contactEmail ? { replyTo: data.contactEmail } : {}),
  });

  if (!sent.ok) console.error("[vapi] call summary email failed", sent.error);
  return { ok: sent.ok };
}

export async function handleVapiServerRequest(
  request: Request,
  deps: VapiServerDeps,
): Promise<Response> {
  if (!deps.serverSecret) {
    console.error("MISSING REQUIRED CONFIGURATION: VAPI_SERVER_SECRET");
    return json({ error: "Not configured." }, 503);
  }

  const provided = request.headers.get("x-vapi-secret") ?? "";
  if (!secretsMatch(provided, deps.serverSecret)) {
    console.warn("[vapi] rejected a request with a missing or incorrect secret");
    return json({ error: "Unauthorized." }, 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const message =
    payload && typeof payload === "object" && "message" in payload
      ? ((payload as { message?: unknown }).message as Record<string, unknown> | undefined)
      : undefined;

  if (!message || typeof message !== "object") {
    return json({ error: "Missing message envelope." }, 400);
  }

  const type = typeof message["type"] === "string" ? (message["type"] as string) : "";

  if (type === "tool-calls") {
    const rawList = message["toolCallList"] ?? message["toolCalls"];
    const toolCalls = Array.isArray(rawList) ? (rawList as ToolCall[]) : [];
    if (toolCalls.length === 0) return json({ results: [] }, 200);
    return json(await handleToolCalls(toolCalls, deps), 200);
  }

  if (type === "end-of-call-report") {
    return json(await handleEndOfCall(message, deps), 200);
  }

  // Acknowledged and ignored on purpose. Vapi retries non-2xx responses.
  return json({ ok: true, ignored: type }, 200);
}
