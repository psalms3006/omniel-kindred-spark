import { afterEach, describe, expect, it, vi } from "vitest";
import { getConfig } from "./runtime-env";

afterEach(() => {
  delete (globalThis as { __env__?: unknown }).__env__;
  vi.unstubAllEnvs();
});

describe("getConfig", () => {
  it("prefers a Cloudflare Worker binding over process.env", () => {
    (globalThis as { __env__?: unknown }).__env__ = {
      RESEND_API_KEY: "worker-key",
    };
    vi.stubEnv("RESEND_API_KEY", "process-key");

    expect(getConfig("RESEND_API_KEY")).toBe("worker-key");
  });

  it("reads the request-scoped Cloudflare env before the global binding", () => {
    (globalThis as { __env__?: unknown }).__env__ = { RESEND_API_KEY: "global-key" };
    const request = new Request("https://omniel.test/api/waitlist");
    (
      request as Request & {
        runtime?: { cloudflare?: { env: Record<string, unknown> } };
      }
    ).runtime = { cloudflare: { env: { RESEND_API_KEY: "request-key" } } };

    expect(getConfig("RESEND_API_KEY", request)).toBe("request-key");
  });

  it("falls back to process.env for local development", () => {
    vi.stubEnv("RESEND_FROM_EMAIL", "OMNIEL <noreply@omniel.com.ng>");

    expect(getConfig("RESEND_FROM_EMAIL")).toBe("OMNIEL <noreply@omniel.com.ng>");
  });

  it("treats an empty binding or env value as unset", () => {
    (globalThis as { __env__?: unknown }).__env__ = {
      WAITLIST_TOKEN_SECRET: "",
    };
    vi.stubEnv("WAITLIST_TOKEN_SECRET", "");

    expect(getConfig("WAITLIST_TOKEN_SECRET")).toBeUndefined();
  });
});
