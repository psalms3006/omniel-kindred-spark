import { afterEach, describe, expect, it, vi } from "vitest";
import { deriveWaitlistSigningSecret, resolveWaitlistConfig } from "./waitlist-config";

afterEach(() => {
  delete (globalThis as { __env__?: unknown }).__env__;
  vi.unstubAllEnvs();
});

function requestWithEnv(env: Record<string, unknown>): Request {
  const request = new Request("https://omniel.test/api/waitlist");
  (request as Request & { runtime?: { cloudflare?: { env: Record<string, unknown> } } }).runtime = {
    cloudflare: { env },
  };
  return request;
}

describe("resolveWaitlistConfig", () => {
  it("can run with only the Resend key by deriving the signing secret", () => {
    const request = requestWithEnv({ RESEND_API_KEY: "re_test_key" });
    const config = resolveWaitlistConfig(request);

    expect(config.missing).toEqual([]);
    expect(config.tokenSecretSource).toBe("derived");
    expect(config.tokenSecret).toBe(deriveWaitlistSigningSecret("re_test_key"));
    expect(config.fromEmail).toBe("OMNIEL <noreply@omniel.com.ng>");
    expect(config.fromEmailSource).toBe("default");
  });

  it("prefers the dedicated signing secret and configured sender", () => {
    const request = requestWithEnv({
      RESEND_API_KEY: "re_test_key",
      WAITLIST_TOKEN_SECRET: "dedicated-secret",
      RESEND_FROM_EMAIL: "OMNIEL <custom@omniel.com.ng>",
      RESEND_WAITLIST_SEGMENT_ID: "seg_123",
    });
    const config = resolveWaitlistConfig(request, true);

    expect(config.tokenSecretSource).toBe("dedicated");
    expect(config.tokenSecret).toBe("dedicated-secret");
    expect(config.fromEmailSource).toBe("configured");
    expect(config.fromEmail).toBe("OMNIEL <custom@omniel.com.ng>");
    expect(config.segmentId).toBe("seg_123");
    expect(config.missing).toEqual([]);
  });

  it("reports the missing Resend key instead of treating it as configured", () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("WAITLIST_TOKEN_SECRET", "");
    const request = requestWithEnv({});
    const config = resolveWaitlistConfig(request);

    expect(config.missing).toContain("RESEND_API_KEY");
    expect(config.missing).toContain("WAITLIST_TOKEN_SECRET");
    expect(config.tokenSecretSource).toBe("missing");
    expect(config.tokenSecret).toBeUndefined();
  });
});
