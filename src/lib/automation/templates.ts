import { ENQUIRY_FORM_LABELS, type EnquiryFormId } from "../enquiry-schema";
import type { EnquiryRecord } from "./store";

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips characters that could smuggle extra headers or lines into an outgoing email. */
export function sanitizeLine(input: string): string {
  return input.replace(/[\r\n]/g, " ").trim();
}

function formatTimestamp(iso: string): string {
  // West Africa Time, since that is where the team reads these.
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Lagos",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function label(formId: string): string {
  return ENQUIRY_FORM_LABELS[formId as EnquiryFormId] ?? "Enquiry";
}

function originLabel(record: EnquiryRecord): string {
  return record.origin === "assistant" ? "Voice assistant" : "Website";
}

const BODY_STYLE =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;" +
  "font-size:15px;line-height:1.6;color:#1c1e22;";
const LABEL_STYLE =
  "padding:6px 14px 6px 0;color:#6b7075;font-size:13px;vertical-align:top;white-space:nowrap;";
const VALUE_STYLE = "padding:6px 0;color:#1c1e22;font-size:15px;";

function row(name: string, value: string): string {
  if (!value) return "";
  return (
    `<tr><td style="${LABEL_STYLE}">${escapeHtml(name)}</td>` +
    `<td style="${VALUE_STYLE}">${escapeHtml(value)}</td></tr>`
  );
}

/**
 * Internal notification.
 *
 * Contains everything needed to act on the enquiry without opening a
 * dashboard or reading a log, which is the whole point of it.
 */
export function adminNotification(record: EnquiryRecord): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = sanitizeLine(
    `New OMNIEL enquiry: ${label(record.formId)}${record.category ? ` (${record.category})` : ""}`,
  );

  const html = `<div style="${BODY_STYLE}">
  <p style="margin:0 0 18px;font-size:17px;font-weight:600;">New OMNIEL Enquiry</p>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
    ${row("Name", record.name)}
    ${row("Email", record.email)}
    ${row("Phone", record.phone)}
    ${row("Type", label(record.formId))}
    ${row("Category", record.category)}
    ${row("Time", formatTimestamp(record.createdAt))}
    ${row("Source", originLabel(record))}
    ${row("Page", record.source)}
    ${row("Reference", record.id)}
  </table>
  <p style="margin:0 0 6px;color:#6b7075;font-size:13px;">Message</p>
  <div style="padding:14px 16px;background:#f4f4f2;border-radius:8px;white-space:pre-wrap;">${escapeHtml(
    record.message,
  )}</div>
  <p style="margin:20px 0 0;color:#6b7075;font-size:13px;">Reply to this email to answer ${escapeHtml(
    record.name,
  )} directly.</p>
</div>`;

  const text = [
    "New OMNIEL Enquiry",
    "",
    `Name: ${record.name}`,
    `Email: ${record.email}`,
    record.phone ? `Phone: ${record.phone}` : "",
    `Type: ${label(record.formId)}`,
    record.category ? `Category: ${record.category}` : "",
    `Time: ${formatTimestamp(record.createdAt)}`,
    `Source: ${originLabel(record)}`,
    record.source ? `Page: ${record.source}` : "",
    `Reference: ${record.id}`,
    "",
    "Message:",
    record.message,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject, html, text };
}

/**
 * Acknowledgement sent to the person who submitted.
 *
 * Claims nothing the system does not actually do. There is no response-time
 * commitment, no "our team has reviewed this", and no assigned owner, because
 * none of those things happen. It confirms receipt and shows them what was
 * recorded, which is all that is true at this point.
 */
export function acknowledgement(record: EnquiryRecord): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "We received your message";
  const firstName = record.name.split(/\s+/)[0] || record.name;

  const html = `<div style="${BODY_STYLE}">
  <p style="margin:0 0 16px;">Hello ${escapeHtml(firstName)},</p>
  <p style="margin:0 0 16px;">
    Your message reached OMNIEL and has been recorded. Someone will read it.
    We have not set a response time, so we are not going to quote you one.
  </p>
  <p style="margin:0 0 8px;color:#6b7075;font-size:13px;">What you sent</p>
  <div style="padding:14px 16px;background:#f4f4f2;border-radius:8px;white-space:pre-wrap;margin-bottom:18px;">${escapeHtml(
    record.message,
  )}</div>
  <p style="margin:0 0 16px;">
    If you need to add anything, reply to this email and it will reach the same place.
  </p>
  <p style="margin:0;color:#6b7075;font-size:13px;">
    OMNIEL<br />Reference ${escapeHtml(record.id)}
  </p>
</div>`;

  const text = [
    `Hello ${firstName},`,
    "",
    "Your message reached OMNIEL and has been recorded. Someone will read it.",
    "We have not set a response time, so we are not going to quote you one.",
    "",
    "What you sent:",
    record.message,
    "",
    "If you need to add anything, reply to this email and it will reach the same place.",
    "",
    "OMNIEL",
    `Reference ${record.id}`,
  ].join("\n");

  return { subject, html, text };
}

/**
 * Structured data extracted from a voice conversation.
 *
 * Every field is optional because it is produced by a model reading a
 * transcript, and a caller who never gave their name does not have one. The
 * template renders only what is actually present rather than printing empty
 * labels or inventing values.
 */
export type CallSummaryData = {
  visitorName?: string;
  contactEmail?: string;
  contactPhone?: string;
  reason?: string;
  questions?: string[];
  requestedFollowUp?: string;
  leadType?: string;
  actionItems?: string[];
};

export type CallSummaryInput = {
  summary?: string;
  data?: CallSummaryData;
  endedReason?: string;
  durationSeconds?: number;
  startedAt?: string;
  callId?: string;
};

function list(items: string[] | undefined): string {
  if (!items || items.length === 0) return "";
  return items.map((i) => `<li style="margin:0 0 4px;">${escapeHtml(i)}</li>`).join("");
}

function duration(seconds: number | undefined): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/**
 * Internal notification for a completed voice conversation.
 *
 * Nothing in here is shown to the visitor. It is written for whoever at
 * OMNIEL has to decide whether the conversation needs a human reply.
 */
export function callSummaryNotification(input: CallSummaryInput): {
  subject: string;
  html: string;
  text: string;
} {
  const d = input.data ?? {};
  const who = d.visitorName?.trim() || "Unidentified visitor";
  const subject = sanitizeLine(`New OMNIEL conversation: ${who}`);

  const questionItems = list(d.questions);
  const actionItems = list(d.actionItems);

  const html = `<div style="${BODY_STYLE}">
  <p style="margin:0 0 18px;font-size:17px;font-weight:600;">New OMNIEL Conversation</p>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
    ${row("Visitor", who)}
    ${row("Email", d.contactEmail ?? "")}
    ${row("Phone", d.contactPhone ?? "")}
    ${row("Purpose", d.reason ?? "")}
    ${row("Lead type", d.leadType ?? "")}
    ${row("Requested follow-up", d.requestedFollowUp ?? "")}
    ${row("Ended", input.endedReason ?? "")}
    ${row("Duration", duration(input.durationSeconds))}
    ${row("Started", input.startedAt ? formatTimestamp(input.startedAt) : "")}
    ${row("Call id", input.callId ?? "")}
  </table>
  ${
    input.summary
      ? `<p style="margin:0 0 6px;color:#6b7075;font-size:13px;">Summary</p>
  <div style="padding:14px 16px;background:#f4f4f2;border-radius:8px;white-space:pre-wrap;margin-bottom:18px;">${escapeHtml(
    input.summary,
  )}</div>`
      : ""
  }
  ${
    questionItems
      ? `<p style="margin:0 0 6px;color:#6b7075;font-size:13px;">Questions asked</p>
  <ul style="margin:0 0 18px;padding-left:20px;">${questionItems}</ul>`
      : ""
  }
  ${
    actionItems
      ? `<p style="margin:0 0 6px;color:#6b7075;font-size:13px;">Action required</p>
  <ul style="margin:0 0 18px;padding-left:20px;">${actionItems}</ul>`
      : ""
  }
</div>`;

  const text = [
    "New OMNIEL Conversation",
    "",
    `Visitor: ${who}`,
    d.contactEmail ? `Email: ${d.contactEmail}` : "",
    d.contactPhone ? `Phone: ${d.contactPhone}` : "",
    d.reason ? `Purpose: ${d.reason}` : "",
    d.leadType ? `Lead type: ${d.leadType}` : "",
    d.requestedFollowUp ? `Requested follow-up: ${d.requestedFollowUp}` : "",
    input.endedReason ? `Ended: ${input.endedReason}` : "",
    duration(input.durationSeconds) ? `Duration: ${duration(input.durationSeconds)}` : "",
    input.callId ? `Call id: ${input.callId}` : "",
    "",
    input.summary ? `Summary:\n${input.summary}` : "",
    d.questions?.length ? `\nQuestions asked:\n- ${d.questions.join("\n- ")}` : "",
    d.actionItems?.length ? `\nAction required:\n- ${d.actionItems.join("\n- ")}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject, html, text };
}
