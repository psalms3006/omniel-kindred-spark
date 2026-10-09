/**
 * Resend implementation of the NOVA waitlist store and email sender.
 *
 * This is the only file that knows Resend's REST shape. The handler talks to
 * the interfaces in waitlist-handler.ts, so swapping Resend for Cloudflare D1
 * later means writing one new adapter, not touching the flow.
 *
 * The list lives in Resend Contacts, using custom properties:
 *   source        "nova-waitlist" (so the account stays filterable)
 *   status        "pending" | "confirmed"
 *   intended_use  free text from the form
 *   signed_up_at  ISO timestamp
 *   confirmed_at  ISO timestamp, set on confirmation
 */
import type {
  SendWaitlistEmail,
  UpsertResult,
  WaitlistEmail,
  WaitlistEntry,
  WaitlistStore,
} from "./waitlist-handler";

const RESEND_API = "https://api.resend.com";

type FetchLike = typeof fetch;

export function createResendWaitlistStore(options: {
  apiKey: string;
  /** Optional Segment to add contacts to, for later broadcasts. */
  segmentId?: string;
  fetchImpl?: FetchLike;
}): WaitlistStore {
  const doFetch = options.fetchImpl ?? fetch;
  const headers = {
    Authorization: `Bearer ${options.apiKey}`,
    "Content-Type": "application/json",
  };

  async function getProperty(email: string, key: string): Promise<unknown> {
    try {
      const res = await doFetch(`${RESEND_API}/contacts/${encodeURIComponent(email)}`, { headers });
      if (!res.ok) return undefined;
      const body = (await res.json()) as {
        properties?: Record<string, { value?: unknown } | undefined> | undefined;
      };
      return body.properties?.[key]?.value;
    } catch {
      return undefined;
    }
  }

  return {
    async upsertPending(entry: WaitlistEntry): Promise<UpsertResult> {
      const payload: Record<string, unknown> = {
        email: entry.email,
        // The form collects one name field; Resend's nearest fit is first_name.
        first_name: entry.name,
        unsubscribed: false,
        properties: {
          source: "nova-waitlist",
          status: "pending",
          intended_use: entry.intendedUse || null,
          signed_up_at: entry.signedUpAt,
        },
      };
      if (options.segmentId) payload["segments"] = [{ id: options.segmentId }];

      let res: Response;
      try {
        res = await doFetch(`${RESEND_API}/contacts`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      } catch (err) {
        return { ok: false, error: `contact create threw: ${String(err)}` };
      }
      if (res.ok) return { ok: true, state: "created" };

      // Creation failed — most likely the contact already exists. Never
      // downgrade someone who has already confirmed back to "pending".
      const status = await getProperty(entry.email, "status");
      if (status === "confirmed") return { ok: true, state: "already-confirmed" };
      if (status !== undefined) {
        // Still pending: refresh the timestamp so the newest link is current.
        await doFetch(`${RESEND_API}/contacts/${encodeURIComponent(entry.email)}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            properties: {
              status: "pending",
              intended_use: entry.intendedUse || null,
              signed_up_at: entry.signedUpAt,
            },
          }),
        }).catch(() => undefined);
        return { ok: true, state: "already-pending" };
      }

      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Resend contact create failed ${res.status}: ${body.slice(0, 200)}`,
      };
    },

    async confirm(email: string, confirmedAt: string) {
      try {
        const res = await doFetch(`${RESEND_API}/contacts/${encodeURIComponent(email)}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            properties: { status: "confirmed", confirmed_at: confirmedAt },
          }),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          return { ok: false, error: `Resend confirm failed ${res.status}: ${body.slice(0, 200)}` };
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, error: `confirm request threw: ${String(err)}` };
      }
    },
  };
}

export function createResendEmailSender(options: {
  apiKey: string;
  /** Verified sending address, e.g. "OMNIEL <noreply@omniel.com.ng>". */
  from: string;
  /** Monitored inbox replies should reach, since the emails invite replies. */
  replyTo?: string;
  fetchImpl?: FetchLike;
}): SendWaitlistEmail {
  const doFetch = options.fetchImpl ?? fetch;
  return async (email: WaitlistEmail) => {
    try {
      const res = await doFetch(`${RESEND_API}/emails`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: options.from,
          to: [email.to],
          ...(options.replyTo ? { reply_to: options.replyTo } : {}),
          subject: email.subject,
          html: email.html,
          text: email.text,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return { ok: false, error: `Resend email failed ${res.status}: ${body.slice(0, 200)}` };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `email request threw: ${String(err)}` };
    }
  };
}
