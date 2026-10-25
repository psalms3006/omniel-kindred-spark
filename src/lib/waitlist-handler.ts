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
  /** Override the sender-level reply-to when a message should go elsewhere. */
  replyTo?: string;
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

const COLORS = {
  background: "#f2ebde",
  card: "#faf6ee",
  ink: "#1a1a18",
  muted: "#5f5a51",
  accent: "#6e3038",
  olive: "#4f5d50",
  hairline: "#cfc5b6",
} as const;

const SANS = "system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

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

function sanitizeLine(input: string): string {
  return input.replace(/[\r\n]+/g, " ").trim();
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

function hostOf(siteUrl: string): string {
  try {
    return new URL(siteUrl).host;
  } catch {
    return "omniel.com.ng";
  }
}

function formatTimestamp(iso: string): string {
  try {
    return `${new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Lagos",
    }).format(new Date(iso))} WAT`;
  } catch {
    return iso;
  }
}

function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.7;color:${COLORS.ink};">${html}</p>`;
}

function noteBlock(label: string, html: string): string {
  return `<div style="margin:24px 0;padding:16px 18px;background:#ece5d8;border-left:3px solid ${COLORS.olive};border-radius:12px;">
    <p style="margin:0 0 7px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.14em;line-height:1.4;text-transform:uppercase;color:${COLORS.olive};">${escapeHtml(label)}</p>
    <p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.65;color:${COLORS.ink};">${html}</p>
  </div>`;
}

function button(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${COLORS.accent};color:${COLORS.card};padding:14px 26px;border-radius:999px;text-decoration:none;font-family:${SANS};font-size:15px;font-weight:600;line-height:1;">${escapeHtml(label)}</a>`;
}

function signoff(): string {
  return `<p style="margin:26px 0 0;font-family:${SERIF};font-size:18px;line-height:1.3;color:${COLORS.ink};">— OMNIEL</p>`;
}

function emailFrame(preheader: string, content: string, siteUrl: string): string {
  const host = hostOf(siteUrl);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>OMNIEL</title>
    <style>
      @media only screen and (max-width: 520px) {
        .email-pad { padding-left: 22px !important; padding-right: 22px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.background};">
    <div style="display:none;font-size:1px;color:${COLORS.background};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.background};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.card};border:1px solid ${COLORS.hairline};border-radius:20px;overflow:hidden;">
            <tr>
              <td class="email-pad" style="padding:28px 32px 8px;">
                <div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.28em;line-height:1.4;text-transform:uppercase;color:${COLORS.accent};">OMNIEL</div>
                <div style="height:1px;background:${COLORS.hairline};margin-top:18px;"></div>
              </td>
            </tr>
            <tr>
              <td class="email-pad" style="padding:24px 32px 32px;">${content}</td>
            </tr>
          </table>
          <div style="max-width:560px;margin:16px auto 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${COLORS.muted};text-align:center;">
            OMNIEL &middot; <a href="${escapeHtml(siteUrl)}" style="color:${COLORS.muted};">${escapeHtml(host)}</a><br />
            Questions? <a href="mailto:${escapeHtml(contactEmail)}" style="color:${COLORS.muted};">${escapeHtml(contactEmail)}</a>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderConfirmEmail(input: {
  name: string;
  confirmUrl: string;
  siteUrl: string;
}): Omit<WaitlistEmail, "to"> {
  const first = firstNameOf(input.name);
  const safeFirst = escapeHtml(first);
  const safeUrl = escapeHtml(input.confirmUrl);
  const content = `
      <h1 style="margin:0 0 16px;font-family:${SERIF};font-size:34px;font-weight:400;line-height:1.1;letter-spacing:-0.02em;color:${COLORS.ink};">You're almost on the list.</h1>
      ${paragraph(`Hi ${safeFirst},`)}
      ${paragraph("You asked to join the <strong>NOVA</strong> waitlist. Confirm your email and we'll hold your place.")}
      <p style="margin:0 0 22px;">${button("Confirm my place", input.confirmUrl)}</p>
      <p style="margin:0 0 24px;font-family:${SANS};font-size:12px;line-height:1.65;color:${COLORS.muted};">If the button doesn't work, copy this link into your browser:<br /><a href="${safeUrl}" style="color:${COLORS.accent};word-break:break-all;">${safeUrl}</a></p>
      ${noteBlock("What happens next", "Once you confirm, your place is held. We'll email you when NOVA is ready — nothing in between.")}
      ${paragraph("If you didn't ask for this, ignore this email. You won't be added, and you won't hear from us again.")}
      ${signoff()}
  `;

  const text = [
    `Hi ${first},`,
    "",
    "You asked to join the NOVA waitlist. Confirm your email and we'll hold your place:",
    input.confirmUrl,
    "",
    "Once confirmed, your place is held. We'll email you when NOVA is ready.",
    "",
    "If you didn't ask for this, ignore this email. You won't be added, and you won't hear from us again.",
    "",
    "— OMNIEL",
    `${hostOf(input.siteUrl)} · ${contactEmail}`,
  ].join("\n");

  return {
    subject: "Confirm your email for NOVA",
    html: emailFrame("One click and your place is held.", content, input.siteUrl),
    text,
  };
}

function renderConfirmedEmail(input: { siteUrl: string }): Omit<WaitlistEmail, "to"> {
  const safeContact = escapeHtml(contactEmail);
  const content = `
      <h1 style="margin:0 0 16px;font-family:${SERIF};font-size:34px;font-weight:400;line-height:1.1;letter-spacing:-0.02em;color:${COLORS.ink};">You're on the list.</h1>
      ${paragraph("Your place on the <strong>NOVA</strong> waitlist is confirmed.")}
      ${paragraph("We'll email you when NOVA is ready to try — nothing in between.")}
      ${noteBlock("While you wait", "If you'd like, reply to this email and tell us what you'd use NOVA for. We read every reply.")}
      ${paragraph(`You can leave the list at any time by replying to this email or writing to <a href="mailto:${safeContact}" style="color:${COLORS.accent};">${safeContact}</a>.`)}
      ${signoff()}
  `;

  const text = [
    "You're on the NOVA waitlist.",
    "",
    "Your place is held. We'll email you when NOVA is ready to try — nothing in between.",
    "",
    "If you'd like, reply to this email and tell us what you'd use NOVA for. We read every reply.",
    "",
    `You can leave the list at any time by replying to this email or writing to ${contactEmail}.`,
    "",
    "— OMNIEL",
    hostOf(input.siteUrl),
  ].join("\n");

  return {
    subject: "You're on the NOVA waitlist",
    html: emailFrame(
      "Your place is held. We'll let you know when NOVA is ready.",
      content,
      input.siteUrl,
    ),
    text,
  };
}

function adminRow(label: string, valueHtml: string): string {
  return `<tr>
    <td style="padding:7px 18px 7px 0;vertical-align:top;white-space:nowrap;font-family:${SANS};font-size:12px;line-height:1.55;color:${COLORS.muted};">${escapeHtml(label)}</td>
    <td style="padding:7px 0;vertical-align:top;font-family:${SANS};font-size:14px;line-height:1.55;color:${COLORS.ink};">${valueHtml}</td>
  </tr>`;
}

function renderAdminSignupEmail(input: {
  entry: WaitlistEntry;
  siteUrl: string;
}): Omit<WaitlistEmail, "to"> {
  const { entry } = input;
  const name = sanitizeLine(entry.name);
  const intendedUse = entry.intendedUse.trim();
  const safeEmail = escapeHtml(entry.email);

  const content = `
      <h1 style="margin:0 0 16px;font-family:${SERIF};font-size:34px;font-weight:400;line-height:1.1;letter-spacing:-0.02em;color:${COLORS.ink};">New waitlist signup</h1>
      ${paragraph(`<strong>${escapeHtml(name)}</strong> joined the NOVA waitlist.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px;border-top:1px solid ${COLORS.hairline};border-bottom:1px solid ${COLORS.hairline};">
        ${adminRow("Name", escapeHtml(name))}
        ${adminRow("Email", `<a href="mailto:${safeEmail}" style="color:${COLORS.accent};">${safeEmail}</a>`)}
        ${adminRow("Intended use", intendedUse ? `<span style="white-space:pre-wrap;">${escapeHtml(intendedUse)}</span>` : "Not provided")}
        ${adminRow("Signed up", escapeHtml(formatTimestamp(entry.signedUpAt)))}
        ${adminRow("Status", "Pending confirmation")}
      </table>
      ${noteBlock("What happens next", "They have been sent a confirmation link. Their contact is stored in Resend with <code>source=nova-waitlist</code>. Once they confirm, they move to the confirmed waitlist for updates.")}
      ${paragraph("Reply to this email to reach them directly.")}
  `;

  const text = [
    "New NOVA waitlist signup",
    "",
    `Name: ${name}`,
    `Email: ${entry.email}`,
    `Intended use: ${intendedUse || "Not provided"}`,
    `Signed up: ${formatTimestamp(entry.signedUpAt)}`,
    "Status: Pending confirmation",
    "",
    "They have been sent a confirmation link. Their contact is stored in Resend Contacts with source=nova-waitlist. Once they confirm, they move to the confirmed waitlist for updates.",
    "",
    "Reply to this email to reach them directly.",
    "",
    "— OMNIEL",
    hostOf(input.siteUrl),
  ].join("\n");

  return {
    subject: sanitizeLine(`New NOVA waitlist signup: ${name}`),
    html: emailFrame(`${name} joined the NOVA waitlist.`, content, input.siteUrl),
    text,
  };
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
    const missing: string[] = [];
    if (!tokenSecret) missing.push("WAITLIST_TOKEN_SECRET");
    if (!store) missing.push("RESEND_API_KEY");
    if (!sendEmail) missing.push("RESEND_FROM_EMAIL");
    console.error(`MISSING REQUIRED CONFIGURATION: ${missing.join(", ")}`);
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
      ...renderConfirmEmail({
        name: data.name,
        confirmUrl: confirmUrl.toString(),
        siteUrl: deps.siteUrl,
      }),
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

  // Tell the monitored inbox about a genuinely new signup. Best effort: the
  // person is already saved and has their confirmation email, so a failure
  // here must not turn a successful signup into an error.
  if (stored.state === "created") {
    const admin = await sendEmail({
      to: contactEmail,
      replyTo: entry.email,
      ...renderAdminSignupEmail({ entry, siteUrl: deps.siteUrl }),
    });
    if (!admin.ok) console.error("Waitlist admin notification failed", admin.error);
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
    const missing: string[] = [];
    if (!tokenSecret) missing.push("WAITLIST_TOKEN_SECRET");
    if (!store) missing.push("RESEND_API_KEY");
    console.error(`MISSING REQUIRED CONFIGURATION: ${missing.join(", ")}`);
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
    const sent = await sendEmail({
      to: payload.email,
      ...renderConfirmedEmail({ siteUrl: deps.siteUrl }),
    });
    if (!sent.ok) console.error("Waitlist acknowledgement email failed", sent.error);
  }

  return jsonResponse({ ok: true }, 200);
}
