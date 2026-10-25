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
