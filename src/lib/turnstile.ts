/**
 * Cloudflare Turnstile verification.
 *
 * Server-side only. The secret key must never reach the browser; the site key
 * is the public half and is the only one the widget needs.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: "missing-token" | "rejected" | "unreachable"; codes?: string[] };

export type TurnstileDeps = {
  secretKey: string;
  /** Injectable for tests; defaults to global fetch at call time. */
  fetchImpl?: typeof fetch;
  /** Visitor IP, when the platform gives us one. Improves Cloudflare's scoring. */
  remoteIp?: string;
};

/**
 * Verifies a Turnstile token.
 *
 * Fails closed on a rejected token. An unreachable verification endpoint is
 * reported distinctly ("unreachable") so the caller can decide: this handler
 * treats it as a failure rather than waving the request through, because a
 * challenge that cannot be checked has not been passed.
 */
export async function verifyTurnstile(
  token: string | undefined,
  deps: TurnstileDeps,
): Promise<TurnstileResult> {
  if (!token) return { ok: false, reason: "missing-token" };

  const body = new URLSearchParams({ secret: deps.secretKey, response: token });
  if (deps.remoteIp) body.set("remoteip", deps.remoteIp);

  const doFetch = deps.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await doFetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (!res.ok) return { ok: false, reason: "unreachable" };

  let parsed: { success?: boolean; "error-codes"?: string[] };
  try {
    parsed = (await res.json()) as typeof parsed;
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (parsed.success === true) return { ok: true };
  const codes = parsed["error-codes"];
  return codes ? { ok: false, reason: "rejected", codes } : { ok: false, reason: "rejected" };
}
