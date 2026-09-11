import { ENQUIRY_FORM_LABELS, enquirySchema } from "./enquiry-schema";

export type EnquiryDeps = {
  /** Server-only secret. Must never be read from a VITE_-prefixed var. */
  resendApiKey?: string;
  /** Verified Resend sending address/domain. Also server-only config. */
  fromEmail?: string;
  /** Approved OMNIEL receiving address. Never invent this — fail closed if absent. */
  toEmail?: string;
  /** Injectable for tests; defaults to global fetch at call time. */
  fetchImpl?: typeof fetch;
};

/**
 * Best-effort, in-process de-duplication only.
 *
 * This is NOT a durable guarantee: Cloudflare Workers (and most edge
 * runtimes) can run multiple isolates concurrently, each with its own copy of
 * this Map, so a determined duplicate or a request landing on a different
 * isolate will not be caught. It only protects against the common case of a
 * double-click or a Vapi tool call firing twice in quick succession on the
 * same isolate. A real guarantee needs Workers KV, D1, or another shared
 * store — explicitly out of scope per the "no database at this stage"
 * decision, so this limitation is intentional and should be revisited if
 * duplicate submissions become a real problem.
 */
const recentSubmissions = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60_000;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips characters that could be used to smuggle extra headers/lines into the outgoing email. */
function sanitizeLine(input: string): string {
  return input.replace(/[\r\n]/g, " ").trim();
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

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
  const data = parsed.data;

  if (!deps.resendApiKey) {
    console.error("MISSING REQUIRED CONFIGURATION: RESEND_API_KEY");
    return jsonResponse({ ok: false, error: "Enquiry service is not configured yet." }, 503);
  }
  if (!deps.fromEmail) {
    console.error("MISSING REQUIRED CONFIGURATION: RESEND_FROM_EMAIL");
    return jsonResponse({ ok: false, error: "Enquiry service is not configured yet." }, 503);
  }
  if (!deps.toEmail) {
    console.error("MISSING REQUIRED CONFIGURATION: OMNIEL ENQUIRY RECEIVING ADDRESS");
    return jsonResponse({ ok: false, error: "Enquiry service is not configured yet." }, 503);
  }

  const dedupeKey = `${data.formId}:${data.email.toLowerCase()}:${data.message.slice(0, 80)}`;
  const now = Date.now();
  const last = recentSubmissions.get(dedupeKey);
  if (last && now - last < DEDUPE_WINDOW_MS) {
    return jsonResponse({ ok: false, error: "Duplicate submission ignored." }, 409);
  }
  recentSubmissions.set(dedupeKey, now);

  const name = sanitizeLine(data.name);
  const email = sanitizeLine(data.email);
  const category = sanitizeLine(data.category ?? "");
  const label = ENQUIRY_FORM_LABELS[data.formId];
  const subject = sanitizeLine(`[OMNIEL] ${label}${category ? ` — ${category}` : ""}`);
  const timestamp = new Date().toISOString();

  const html = [
    `<p><strong>Type:</strong> ${escapeHtml(label)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    category ? `<p><strong>Category:</strong> ${escapeHtml(category)}</p>` : "",
    `<p><strong>Message:</strong></p><p>${escapeHtml(data.message).replace(/\n/g, "<br />")}</p>`,
    `<p><strong>Submitted:</strong> ${escapeHtml(timestamp)}</p>`,
  ]
    .filter(Boolean)
    .join("\n");

  const doFetch = deps.fetchImpl ?? fetch;
  try {
    const res = await doFetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${deps.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: deps.fromEmail,
        to: [deps.toEmail],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Resend delivery failed", res.status, body);
      return jsonResponse({ ok: false, error: "Email delivery failed." }, 502);
    }
  } catch (err) {
    console.error("Resend request threw", err);
    return jsonResponse({ ok: false, error: "Email delivery failed." }, 502);
  }

  return jsonResponse({ ok: true, formId: data.formId }, 200);
}

/** Test-only escape hatch so cases don't bleed into each other via the dedupe window. */
export function __resetDedupeForTests(): void {
  recentSubmissions.clear();
}
