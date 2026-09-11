import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetDedupeForTests, handleEnquiryRequest } from "./enquiry-handler";

const DEPS = {
  resendApiKey: "test_key",
  fromEmail: "OMNIEL <noreply@omniel.test>",
  toEmail: "inbox@omniel.test",
};

function req(body: unknown) {
  return new Request("http://localhost/api/enquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function okFetch() {
  return vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ id: "email_1" }), { status: 200 }));
}

const validPayload = (overrides: Record<string, unknown> = {}) => ({
  formId: "contact",
  name: "Ada Lovelace",
  email: "ada@example.com",
  category: "",
  message: "Hello, interested in OMNIEL.",
  confirmation: true,
  ...overrides,
});

beforeEach(() => {
  __resetDedupeForTests();
});

describe("valid submissions", () => {
  it.each(["contact", "partnerships", "investment", "careers"] as const)(
    "accepts a valid %s enquiry",
    async (formId) => {
      const fetchImpl = okFetch();
      const res = await handleEnquiryRequest(req(validPayload({ formId })), {
        ...DEPS,
        fetchImpl,
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ ok: true, formId });
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      expect(fetchImpl.mock.calls[0]![0]!).toBe("https://api.resend.com/emails");
    },
  );
});

describe("validation failures", () => {
  it("rejects missing name", async () => {
    const fetchImpl = okFetch();
    const res = await handleEnquiryRequest(req(validPayload({ name: "" })), { ...DEPS, fetchImpl });
    expect(res.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const res = await handleEnquiryRequest(req(validPayload({ email: "not-an-email" })), {
      ...DEPS,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(400);
  });

  it("rejects missing message", async () => {
    const res = await handleEnquiryRequest(req(validPayload({ message: "" })), {
      ...DEPS,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(400);
  });

  it("rejects an unknown formId", async () => {
    const res = await handleEnquiryRequest(req(validPayload({ formId: "sales" })), {
      ...DEPS,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(400);
  });

  it("rejects confirmation: false", async () => {
    const res = await handleEnquiryRequest(req(validPayload({ confirmation: false })), {
      ...DEPS,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(400);
  });

  it("rejects a missing confirmation field", async () => {
    const payload = validPayload();
    delete (payload as Record<string, unknown>)["confirmation"];
    const res = await handleEnquiryRequest(req(payload), { ...DEPS, fetchImpl: okFetch() });
    expect(res.status).toBe(400);
  });

  it("rejects an oversized message", async () => {
    const res = await handleEnquiryRequest(req(validPayload({ message: "x".repeat(5000) })), {
      ...DEPS,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(400);
  });

  it("rejects an oversized name", async () => {
    const res = await handleEnquiryRequest(req(validPayload({ name: "x".repeat(200) })), {
      ...DEPS,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    const badReq = new Request("http://localhost/api/enquiry", {
      method: "POST",
      body: "{not json",
    });
    const res = await handleEnquiryRequest(badReq, { ...DEPS, fetchImpl: okFetch() });
    expect(res.status).toBe(400);
  });
});

describe("configuration", () => {
  it("fails closed when RESEND_API_KEY is missing", async () => {
    const fetchImpl = okFetch();
    const res = await handleEnquiryRequest(req(validPayload()), {
      fromEmail: DEPS.fromEmail,
      toEmail: DEPS.toEmail,
      fetchImpl,
    });
    expect(res.status).toBe(503);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails closed when the receiving address is missing", async () => {
    const res = await handleEnquiryRequest(req(validPayload()), {
      resendApiKey: DEPS.resendApiKey,
      fromEmail: DEPS.fromEmail,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(503);
  });
});

describe("delivery", () => {
  it("returns 502 and does not claim success when Resend fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("bad request", { status: 422 }));
    const res = await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it("returns 502 when the Resend request throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const res = await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    expect(res.status).toBe(502);
  });
});

describe("duplicate submissions", () => {
  it("rejects an identical resubmission within the dedupe window", async () => {
    const fetchImpl = okFetch();
    const first = await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    expect(first.status).toBe(200);

    const second = await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    expect(second.status).toBe(409);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
