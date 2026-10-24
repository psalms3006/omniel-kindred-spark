import { contactEmail } from "./omniel";
import { waitlistSchema } from "./waitlist-schema";
import { signWaitlistToken, verifyWaitlistToken } from "./waitlist-token";

export type WaitlistEntry = {
  email: string;
  name: string;
  intendedUse: string;
  signedUpAt: string;
};

export type UpsertResult =
  | { ok: true; state: "created" | "already-pending" | "already-confirmed" }
  | { ok: false; error: string };

export type WaitlistStore = {
  /** Create the contact if absent; leave a confirmed signup untouched. */
  upsertPending(entry: WaitlistEntry): Promise<UpsertResult>;
  /** Mark an existing contact confirmed. */
  confirm(email: string, confirmedAt: string): Promise<{ ok: true } | { ok: false; error: string }>;
};

export type WaitlistEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendWaitlistEmail = (
  email: WaitlistEmail,
) => Promise<{ ok: true } | { ok: false; error: string }>;

export type WaitlistDeps = {
  store?: WaitlistStore;
  sendEmail?: SendWaitlistEmail;
  /** Server-only secret. Must never be read from a VITE_-prefixed var. */
  tokenSecret?: string;
  /** Absolute site origin, used to build the confirmation link. */
  siteUrl: string;
  now?: () => number;
  /** How long a confirmation link stays valid. Defaults to 7 days. */
  tokenMaxAgeMs?: number;
};

const DEFAULT_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function renderConfirmEmail(input: {
  name: string;
  confirmUrl: string;
}): Omit<WaitlistEmail, "to"> {
  const first = firstNameOf(input.name);
  const safeFirst = escapeHtml(first);
  const safeUrl = escapeHtml(input.confirmUrl);
  const subject = "Confirm your place on the NOVA waitlist";
  const text = [
    `Hi ${first},`,
    "",
    "You asked to join the waitlist for NOVA, OMNIEL's everyday intelligence. NOVA is on its way, and there is no release date to give you yet.",
    "",
    "Confirm your email to hold your place:",
    input.confirmUrl,
    "",
    "If you didn't ask for this, ignore this email. You won't be added, and you won't hear from us again.",
    "",
    "— OMNIEL",
  ].join("\n");
  const html = `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#111;max-width:36rem">
  <p>Hi ${safeFirst},</p>
  <p>You asked to join the waitlist for <strong>NOVA</strong>, OMNIEL's everyday intelligence. NOVA is on its way, and there is no release date to give you yet.</p>
  <p>Confirm your email to hold your place:</p>
  <p><a href="${safeUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Confirm my spot</a></p>
  <p style="color:#555;font-size:13px">If the button doesn't work, paste this into your browser:<br /><a href="${safeUrl}">${safeUrl}</a></p>
  <p style="color:#555;font-size:13px">If you didn't ask for this, ignore this email. You won't be added, and you won't hear from us again.</p>
  <p>— OMNIEL</p>
</div>`.trim();
  return { subject, html, text };
}

function renderConfirmedEmail(): Omit<WaitlistEmail, "to"> {
  const subject = "You're on the NOVA waitlist";
  const text = [
    "You're confirmed — your place on the NOVA waitlist is held.",
    "",
    "We'll email you when there is something worth showing you. Nothing in between.",
    "",
    `You can leave the list at any time by replying to this email, or by writing to ${contactEmail}.`,
    "",
    "— OMNIEL",
  ].join("\n");
  const html = `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#111;max-width:36rem">
  <p>You're confirmed — your place on the <strong>NOVA</strong> waitlist is held.</p>
  <p>We'll email you when there is something worth showing you. Nothing in between.</p>
  <p style="color:#555;font-size:13px">You can leave the list at any time by replying to this email, or by writing to <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>.</p>
  <p>— OMNIEL</p>
</div>`.trim();
  return { subject, html, text };
}

/** POST body: { name, email, intendedUse? } */
export async function handleWaitlistSignup(
  request: Request,
  deps: WaitlistDeps,
): Promise<Response> {
  const raw = await readJson(request);
  if (raw === undefined) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);

  const parsed = waitlistSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(
      { ok: false, error: "Validation failed.", issues: parsed.error.flatten() },
      400,
    );
  }
  const data = parsed.data;

  const { store, sendEmail, tokenSecret } = deps;
  if (!tokenSecret || !store || !sendEmail) {
    const missing = !tokenSecret
      ? "WAITLIST_TOKEN_SECRET"
      : !store
        ? "waitlist store (RESEND_API_KEY)"
        : "waitlist email sender (RESEND_FROM_EMAIL)";
    console.error(`MISSING REQUIRED CONFIGURATION: ${missing}`);
    return jsonResponse({ ok: false, error: "The waitlist is not configured yet." }, 503);
  }

  const now = deps.now?.() ?? Date.now();
  const entry: WaitlistEntry = {
    email: data.email.toLowerCase(),
    name: data.name,
    intendedUse: data.intendedUse,
    signedUpAt: new Date(now).toISOString(),
  };

  const stored = await store.upsertPending(entry);
  if (!stored.ok) {
    console.error("Waitlist store failed", stored.error);
    return jsonResponse(
      { ok: false, error: "We couldn't save your signup. Please try again." },
      502,
    );
  }

  // An already-confirmed signup is left alone — no second confirmation email,
  // and the response tells the client so it can say "you're already on it".
  if (stored.state !== "already-confirmed") {
    const token = await signWaitlistToken(entry.email, tokenSecret, now);
    const confirmUrl = new URL("/waitlist-confirm", deps.siteUrl);
    confirmUrl.searchParams.set("token", token);
    const sent = await sendEmail({
      to: entry.email,
      ...renderConfirmEmail({ name: data.name, confirmUrl: confirmUrl.toString() }),
    });
    if (!sent.ok) {
      console.error("Waitlist confirmation email failed", sent.error);
      return jsonResponse(
        {
          ok: false,
          error:
            "We saved your details but couldn't send the confirmation email. Please try again.",
        },
        502,
      );
    }
  }

  return jsonResponse(
    { ok: true, status: stored.state === "already-confirmed" ? "confirmed" : "pending" },
    200,
  );
}

/** POST body: { token } */
export async function handleWaitlistConfirm(
  request: Request,
  deps: WaitlistDeps,
): Promise<Response> {
  const raw = await readJson(request);
  if (typeof raw !== "object" || raw === null) {
    return jsonResponse({ ok: false, error: "Invalid request." }, 400);
  }
  const token = (raw as Record<string, unknown>)["token"];
  if (typeof token !== "string" || token.length === 0) {
    return jsonResponse({ ok: false, error: "Missing confirmation token." }, 400);
  }

  const { store, sendEmail, tokenSecret } = deps;
  if (!tokenSecret || !store) {
    console.error(
      `MISSING REQUIRED CONFIGURATION: ${!tokenSecret ? "WAITLIST_TOKEN_SECRET" : "waitlist store (RESEND_API_KEY)"}`,
    );
    return jsonResponse({ ok: false, error: "The waitlist is not configured yet." }, 503);
  }

  const now = deps.now?.() ?? Date.now();
  const payload = await verifyWaitlistToken(token, tokenSecret, {
    now,
    maxAgeMs: deps.tokenMaxAgeMs ?? DEFAULT_TOKEN_MAX_AGE_MS,
  });
  if (!payload) {
    return jsonResponse(
      { ok: false, error: "This confirmation link is invalid or has expired." },
      400,
    );
  }

  const confirmed = await store.confirm(payload.email, new Date(now).toISOString());
  if (!confirmed.ok) {
    console.error("Waitlist confirm failed", confirmed.error);
    return jsonResponse(
      { ok: false, error: "We couldn't confirm your spot. Please try again." },
      502,
    );
  }

  // Best-effort: the person is confirmed whether or not the acknowledgement
  // lands, so a failure here must not be reported as a failed confirmation.
  if (sendEmail) {
    const sent = await sendEmail({ to: payload.email, ...renderConfirmedEmail() });
    if (!sent.ok) console.error("Waitlist acknowledgement email failed", sent.error);
  }

  return jsonResponse({ ok: true }, 200);
}
