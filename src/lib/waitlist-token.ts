const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type WaitlistTokenPayload = {
  /** Lowercased email the token was issued for. */
  email: string;
  /** Issued-at, milliseconds since epoch. */
  iat: number;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Explicitly backed by ArrayBuffer (not the wider ArrayBufferLike) so it
// satisfies BufferSource for crypto.subtle.verify.
function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.length % 4 === 0 ? value : value + "=".repeat(4 - (value.length % 4));
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Sign a confirmation token. `now` is injected so tests are deterministic. */
export async function signWaitlistToken(
  email: string,
  secret: string,
  now: number,
): Promise<string> {
  const payload: WaitlistTokenPayload = { email: email.toLowerCase(), iat: now };
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(secret),
    encoder.encode(encoded),
  );
  return `${encoded}.${toBase64Url(new Uint8Array(signature))}`;
}

/**
 * Verify a token and return its payload, or `null` when it is malformed,
 * tampered with, signed by a different secret, or older than `maxAgeMs`.
 */
export async function verifyWaitlistToken(
  token: string,
  secret: string,
  options: { now: number; maxAgeMs: number },
): Promise<WaitlistTokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadPart, signaturePart] = parts;
  if (!payloadPart || !signaturePart) return null;

  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      fromBase64Url(signaturePart),
      encoder.encode(payloadPart),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoder.decode(fromBase64Url(payloadPart)));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const { email, iat } = parsed as Record<string, unknown>;
  if (typeof email !== "string" || typeof iat !== "number") return null;
  if (options.now - iat > options.maxAgeMs) return null;

  return { email, iat };
}
