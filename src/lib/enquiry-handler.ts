import { enquirySchema, type EnquiryInput } from "./enquiry-schema";
import { verifyTurnstile } from "./turnstile";
import { createResendChannel, type NotificationChannel } from "./automation/notify";
import { acknowledgement, adminNotification, sanitizeLine } from "./automation/templates";
import {
  generateEnquiryId,
  isDuplicate,
  recordDelivery,
  saveEnquiry,
  type D1Database,
  type EnquiryOrigin,
  type EnquiryRecord,
} from "./automation/store";

export type EnquiryDeps = {
  /** Server-only secret. Must never be read from a VITE_-prefixed var. */
  resendApiKey?: string;
  /** Verified Resend sending address/domain. Also server-only config. */
  fromEmail?: string;
  /** Approved OMNIEL receiving address. Never invent this — fail closed if absent. */
  toEmail?: string;
  /** D1 binding. Absent in local dev without wrangler, and in unit tests. */
  db?: D1Database;
  /** Turnstile secret. Server-only; the site key is the public half. */
  turnstileSecretKey?: string;
  /** Visitor IP when the platform provides one. Improves Turnstile scoring. */
  remoteIp?: string;
  /** Where this submission came from. Decides whether a Turnstile token is required. */
  origin?: EnquiryOrigin;
  /**
   * Extra notification channels (Telegram, WhatsApp, Slack). Empty today.
   * Constructed by the caller only when their credentials exist, so an
   * unconfigured channel is absent rather than silently failing.
   */
  extraChannels?: NotificationChannel[];
  /** Injectable for tests; defaults to global fetch at call time. */
  fetchImpl?: typeof fetch;
};

export type EnquiryOutcome = {
  status: number;
  body: Record<string, unknown>;
};

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Runs one validated enquiry through the full pipeline.
 *
 * Order matters: spam check, then durable storage, then notifications. The
 * enquiry is persisted before anyone is told about it, so a notification
 * failure leaves a recoverable row rather than losing the enquiry entirely.
 *
 * Success is reported only when at least one durable thing actually happened
 * (the row was written, or the team was emailed). If both fail, the caller is
 * told it failed, because it did.
 */
export async function processEnquiry(
  input: EnquiryInput,
  deps: EnquiryDeps,
): Promise<EnquiryOutcome> {
  const origin: EnquiryOrigin = deps.origin ?? "website";

  if (!deps.resendApiKey) {
    console.error("MISSING REQUIRED CONFIGURATION: RESEND_API_KEY");
    return { status: 503, body: { ok: false, error: "Enquiry service is not configured yet." } };
  }
  if (!deps.fromEmail) {
    console.error("MISSING REQUIRED CONFIGURATION: RESEND_FROM_EMAIL");
    return { status: 503, body: { ok: false, error: "Enquiry service is not configured yet." } };
  }
  if (!deps.toEmail) {
    console.error("MISSING REQUIRED CONFIGURATION: OMNIEL ENQUIRY RECEIVING ADDRESS");
    return { status: 503, body: { ok: false, error: "Enquiry service is not configured yet." } };
  }

  // Turnstile applies to browser submissions only. The assistant has no
  // browser to solve a challenge; its route authenticates with a shared
  // secret before it ever reaches this function.
  if (origin === "website" && deps.turnstileSecretKey) {
    const check = await verifyTurnstile(input.turnstileToken, {
      secretKey: deps.turnstileSecretKey,
      ...(deps.remoteIp ? { remoteIp: deps.remoteIp } : {}),
      ...(deps.fetchImpl ? { fetchImpl: deps.fetchImpl } : {}),
    });
    if (!check.ok) {
      console.warn("[enquiry] turnstile rejected", check.reason, check.codes ?? "");
      return {
        status: 403,
        body: { ok: false, error: "Could not verify that you are human. Please try again." },
      };
    }
  }

  const record: EnquiryRecord = {
    id: generateEnquiryId(),
    formId: input.formId,
    name: sanitizeLine(input.name),
    email: sanitizeLine(input.email),
    phone: sanitizeLine(input.phone ?? ""),
    category: sanitizeLine(input.category ?? ""),
    message: input.message,
    source: sanitizeLine(input.source ?? ""),
    origin,
    createdAt: new Date().toISOString(),
  };

  let stored = false;
  if (deps.db) {
    if (await isDuplicate(deps.db, record)) {
      return { status: 409, body: { ok: false, error: "That message has already been sent." } };
    }
    const result = await saveEnquiry(deps.db, record);
    stored = result.ok;
    if (!result.ok) {
      // Not fatal on its own. The notification below is still attempted so the
      // enquiry is not lost, and the failure is logged for follow-up.
      console.error("[enquiry] storage failed, continuing to notify", result.error);
    }
  } else {
    console.error(
      "MISSING REQUIRED CONFIGURATION: D1 binding ENQUIRIES_DB — enquiry not persisted, notification only",
    );
  }

  const channel = createResendChannel({
    apiKey: deps.resendApiKey,
    from: deps.fromEmail,
    ...(deps.fetchImpl ? { fetchImpl: deps.fetchImpl } : {}),
  });
  const channels: NotificationChannel[] = [channel, ...(deps.extraChannels ?? [])];

  const admin = adminNotification(record);
  const adminResults = await Promise.all(
    channels.map((c) =>
      c.send({
        to: deps.toEmail as string,
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
        replyTo: record.email,
      }),
    ),
  );
  const notified = adminResults.some((r) => r.ok);
  const notifyError = adminResults.find((r) => !r.ok);

  // Nothing durable happened. Do not tell the visitor it worked.
  if (!stored && !notified) {
    return {
      status: 502,
      body: { ok: false, error: "We could not record your message. Please try again." },
    };
  }

  // Acknowledgement is best effort by design. The enquiry is already safe at
  // this point, and failing the whole request because a courtesy email
  // bounced would make the visitor resubmit for no reason.
  const ack = acknowledgement(record);
  const ackResult = await channel.send({
    to: record.email,
    subject: ack.subject,
    html: ack.html,
    text: ack.text,
    replyTo: deps.toEmail,
  });

  if (deps.db && stored) {
    await recordDelivery(deps.db, record.id, {
      adminNotified: notified,
      acknowledged: ackResult.ok,
      ...(notifyError && !notifyError.ok ? { error: notifyError.error } : {}),
    });
  }

  if (!notified) {
    console.error(
      "[enquiry] stored but nobody was notified. Replay with: SELECT * FROM enquiries WHERE admin_notified = 0",
    );
  }

  return { status: 200, body: { ok: true, formId: record.formId, reference: record.id } };
}

/**
 * POST /api/enquiry — the browser form's endpoint.
 *
 * Untrusted input. The schema is re-checked here regardless of what the
 * client claims, and every field is sanitised before it reaches an email.
 */
export async function handleEnquiryRequest(request: Request, deps: EnquiryDeps): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(
      { ok: false, error: "Validation failed.", issues: parsed.error.flatten() },
      400,
    );
  }

  const outcome = await processEnquiry(parsed.data, deps);
  return jsonResponse(outcome.body, outcome.status);
}
