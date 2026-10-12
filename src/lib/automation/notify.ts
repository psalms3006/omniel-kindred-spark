/**
 * Notification channels.
 *
 * One interface, one implementation today (email via Resend). The indirection
 * exists so that adding WhatsApp, Telegram or Slack later is a new file plus
 * one registry entry, with no change to the enquiry handler.
 *
 * Nothing here pretends to be configured when it is not. A channel is only
 * constructed when its credentials are actually present, and a channel that
 * fails reports the failure rather than swallowing it.
 */

export type OutboundMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Where a reply should go, when that differs from the sending address. */
  replyTo?: string;
};

export type SendOutcome = { ok: true } | { ok: false; error: string };

export type NotificationChannel = {
  readonly name: string;
  send(message: OutboundMessage): Promise<SendOutcome>;
};

export type ResendConfig = {
  apiKey: string;
  /** Verified sending identity, e.g. "OMNIEL <noreply@omniel.com.ng>". */
  from: string;
  fetchImpl?: typeof fetch;
};

export function createResendChannel(config: ResendConfig): NotificationChannel {
  return {
    name: "resend-email",
    async send(message) {
      const doFetch = config.fetchImpl ?? fetch;
      const payload: Record<string, unknown> = {
        from: config.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      };
      if (message.replyTo) payload["reply_to"] = message.replyTo;

      try {
        const res = await doFetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          // Body is read for the log only. It can contain the rejected
          // address but never the API key, so this is safe to record.
          const body = await res.text().catch(() => "");
          const error = `Resend responded ${res.status}: ${body.slice(0, 300)}`;
          console.error("[notify] email delivery failed", error);
          return { ok: false, error };
        }
        return { ok: true };
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        console.error("[notify] email request threw", error);
        return { ok: false, error };
      }
    },
  };
}

/*
 * Adding a channel later:
 *
 *   export function createTelegramChannel(cfg: { botToken: string; chatId: string }):
 *     NotificationChannel { ... }
 *
 * then construct it in the route handler only when its env vars are present,
 * and pass it in alongside the email channel. Credentials always arrive as
 * arguments, never read from a module-level global, so channels stay testable
 * and nothing is hard-coded.
 */
