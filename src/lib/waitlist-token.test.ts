import { describe, expect, it } from "vitest";
import { signWaitlistToken, verifyWaitlistToken } from "./waitlist-token";

const SECRET = "test-secret";
const OTHER_SECRET = "a-different-secret";
const NOW = 1_700_000_000_000;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

describe("waitlist tokens", () => {
  it("round-trips, lowercasing the email", async () => {
    const token = await signWaitlistToken("Ada@Example.com", SECRET, NOW);
    const payload = await verifyWaitlistToken(token, SECRET, { now: NOW, maxAgeMs: MAX_AGE });
    expect(payload).toEqual({ email: "ada@example.com", iat: NOW });
  });

  it("rejects a tampered payload", async () => {
    const token = await signWaitlistToken("ada@example.com", SECRET, NOW);
    const [payloadPart, signature] = token.split(".");
    const tampered = `${payloadPart}x.${signature}`;
    expect(await verifyWaitlistToken(tampered, SECRET, { now: NOW, maxAgeMs: MAX_AGE })).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signWaitlistToken("ada@example.com", OTHER_SECRET, NOW);
    expect(await verifyWaitlistToken(token, SECRET, { now: NOW, maxAgeMs: MAX_AGE })).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signWaitlistToken("ada@example.com", SECRET, NOW);
    expect(
      await verifyWaitlistToken(token, SECRET, { now: NOW + MAX_AGE + 1, maxAgeMs: MAX_AGE }),
    ).toBeNull();
  });

  it("accepts a token exactly at the age limit", async () => {
    const token = await signWaitlistToken("ada@example.com", SECRET, NOW);
    expect(
      await verifyWaitlistToken(token, SECRET, { now: NOW + MAX_AGE, maxAgeMs: MAX_AGE }),
    ).not.toBeNull();
  });

  it.each(["", "no-dot", "a.b.c", "payload.", ".signature"])(
    "rejects a malformed token (%j)",
    async (token) => {
      expect(await verifyWaitlistToken(token, SECRET, { now: NOW, maxAgeMs: MAX_AGE })).toBeNull();
    },
  );
});
