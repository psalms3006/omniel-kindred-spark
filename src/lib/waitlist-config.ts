import { getConfig } from "./automation/runtime-env";

/**
 * The sender address is not a secret and is already published on the site.
 * Keeping a default here means a missing RESEND_FROM_EMAIL cannot take the
 * waitlist down on its own; Resend still has to accept the verified domain.
 */
export const DEFAULT_WAITLIST_FROM = "OMNIEL <noreply@omniel.com.ng>";

/**
 * Derive a signing key from the Resend key only when the dedicated
 * WAITLIST_TOKEN_SECRET has not been set. The prefix domain-separates the
 * HMAC use from the Resend API use. A dedicated secret is still preferred.
 */
export function deriveWaitlistSigningSecret(resendApiKey: string): string {
  return `omniel-waitlist-v1:${resendApiKey}`;
}

export type WaitlistConfig = {
  tokenSecret?: string;
  tokenSecretSource: "dedicated" | "derived" | "missing";
  apiKey?: string;
  fromEmail: string;
  fromEmailSource: "configured" | "default";
  segmentId?: string;
  missing: string[];
};

/**
 * Resolve every runtime value the waitlist needs from one request.
 *
 * The waitlist can run with only RESEND_API_KEY because the confirmation
 * signing secret falls back to a domain-separated derivation of that key and
 * the sender falls back to the verified default address. The health endpoint
 * exposes which mode is active without ever returning a secret value.
 */
export function resolveWaitlistConfig(request: Request, includeSegment = false): WaitlistConfig {
  const apiKey = getConfig("RESEND_API_KEY", request);
  const dedicatedSecret = getConfig("WAITLIST_TOKEN_SECRET", request);
  const configuredFrom = getConfig("RESEND_FROM_EMAIL", request);
  const segmentId = includeSegment ? getConfig("RESEND_WAITLIST_SEGMENT_ID", request) : undefined;

  const tokenSecret = dedicatedSecret ?? (apiKey ? deriveWaitlistSigningSecret(apiKey) : undefined);
  const tokenSecretSource = dedicatedSecret ? "dedicated" : apiKey ? "derived" : "missing";

  const fromEmail = configuredFrom ?? DEFAULT_WAITLIST_FROM;

  const missing: string[] = [];
  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!tokenSecret) missing.push("WAITLIST_TOKEN_SECRET");

  return {
    ...(tokenSecret ? { tokenSecret } : {}),
    tokenSecretSource,
    ...(apiKey ? { apiKey } : {}),
    fromEmail,
    fromEmailSource: configuredFrom ? "configured" : "default",
    ...(segmentId ? { segmentId } : {}),
    missing,
  };
}
