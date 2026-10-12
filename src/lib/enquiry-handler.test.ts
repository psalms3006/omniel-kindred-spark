import { describe, expect, it, vi } from "vitest";
import { handleEnquiryRequest, type EnquiryDeps } from "./enquiry-handler";
import type { D1Database, D1PreparedStatement } from "./automation/store";

const DEPS: EnquiryDeps = {
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

/** Resend accepts everything. Two calls are expected per successful enquiry: admin, then acknowledgement. */
function okFetch() {
  return vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ id: "email_1" }), { status: 200 }));
}

/**
 * Minimal in-memory stand-in for D1.
 *
 * Only the three statements the store actually issues are recognised, matched
 * on a distinctive keyword. Anything else throws, so a query added later
 * without a matching test fails loudly instead of silently returning nothing.
 */
function fakeDb(options: { failInsert?: boolean; existingDuplicate?: boolean } = {}) {
  const rows: Record<string, unknown>[] = [];
  const db: D1Database = {
    prepare(query: string): D1PreparedStatement {
      const stmt: D1PreparedStatement = {
        bind(...values: unknown[]) {
          if (query.includes("SELECT")) {
            return {
              ...stmt,
              first: async () => (options.existingDuplicate ? { id: "existing" } : null),
            } as D1PreparedStatement;
          }
          if (query.includes("INSERT")) {
            return {
              ...stmt,
              run: async () => {
                if (options.failInsert) throw new Error("d1 insert failed");
                rows.push({ values });
                return { success: true };
              },
            } as D1PreparedStatement;
          }
          if (query.includes("UPDATE")) {
            return { ...stmt, run: async () => ({ success: true }) } as D1PreparedStatement;
          }
          throw new Error(`Unexpected query: ${query}`);
        },
        run: async () => ({ success: true }),
        first: async () => null,
        all: async () => ({ success: true, results: [] }),
      };
      return stmt;
    },
    batch: async () => [],
  };
  return { db, rows };
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
      const body = (await res.json()) as { ok: boolean; reference: string };
      expect(body.ok).toBe(true);
      expect(body.reference).toMatch(/^[0-9a-f-]{36}$/);
      // One notification to OMNIEL, one acknowledgement to the sender.
      expect(fetchImpl).toHaveBeenCalledTimes(2);
      expect(fetchImpl.mock.calls[0]![0]!).toBe("https://api.resend.com/emails");
    },
  );

  it("sends the acknowledgement to the person who submitted", async () => {
    const fetchImpl = okFetch();
    await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    const ackBody = JSON.parse((fetchImpl.mock.calls[1]![1] as { body: string }).body) as Record<
      string,
      unknown
    >;
    expect(ackBody["to"]).toEqual(["ada@example.com"]);
    expect(ackBody["subject"]).toBe("We received your message");
  });

  it("sends the admin notification to the OMNIEL address, replying to the visitor", async () => {
    const fetchImpl = okFetch();
    await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    const adminBody = JSON.parse((fetchImpl.mock.calls[0]![1] as { body: string }).body) as Record<
      string,
      unknown
    >;
    expect(adminBody["to"]).toEqual(["inbox@omniel.test"]);
    expect(adminBody["reply_to"]).toBe("ada@example.com");
  });

  it("makes no promise about response times in the acknowledgement", async () => {
    const fetchImpl = okFetch();
    await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    const ack = JSON.parse((fetchImpl.mock.calls[1]![1] as { body: string }).body) as {
      html: string;
      text: string;
    };
    const forbidden = [
      /24 hours/i,
      /business day/i,
      /has been reviewed/i,
      /specialist/i,
      /assigned/i,
    ];
    for (const pattern of forbidden) {
      expect(ack.html).not.toMatch(pattern);
      expect(ack.text).not.toMatch(pattern);
    }
  });

  it("captures phone and source when supplied", async () => {
    const fetchImpl = okFetch();
    await handleEnquiryRequest(
      req(validPayload({ phone: "+234 800 000 0000", source: "/contact" })),
      { ...DEPS, fetchImpl },
    );
    const admin = JSON.parse((fetchImpl.mock.calls[0]![1] as { body: string }).body) as {
      text: string;
    };
    expect(admin.text).toContain("+234 800 000 0000");
    expect(admin.text).toContain("/contact");
  });
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
      headers: { "Content-Type": "application/json" },
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
      fromEmail: "OMNIEL <noreply@omniel.test>",
      toEmail: "inbox@omniel.test",
      fetchImpl,
    });
    expect(res.status).toBe(503);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails closed when the receiving address is missing", async () => {
    const fetchImpl = okFetch();
    const res = await handleEnquiryRequest(req(validPayload()), {
      resendApiKey: "test_key",
      fromEmail: "OMNIEL <noreply@omniel.test>",
      fetchImpl,
    });
    expect(res.status).toBe(503);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("turnstile", () => {
  const turnstileDeps = { ...DEPS, turnstileSecretKey: "secret" };

  function fetchWith(turnstileOk: boolean) {
    return vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("challenges.cloudflare.com")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ success: turnstileOk, "error-codes": ["invalid-input-response"] }),
            {
              status: 200,
            },
          ),
        );
      }
      return Promise.resolve(new Response(JSON.stringify({ id: "email_1" }), { status: 200 }));
    });
  }

  it("rejects a website submission with no token when Turnstile is configured", async () => {
    const fetchImpl = fetchWith(true);
    const res = await handleEnquiryRequest(req(validPayload()), { ...turnstileDeps, fetchImpl });
    expect(res.status).toBe(403);
    // Rejected before any network call: no verification, no email.
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects a submission whose token Turnstile refuses", async () => {
    const fetchImpl = fetchWith(false);
    const res = await handleEnquiryRequest(req(validPayload({ turnstileToken: "bad" })), {
      ...turnstileDeps,
      fetchImpl,
    });
    expect(res.status).toBe(403);
    // The challenge was checked and no email was sent.
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("accepts a submission whose token Turnstile approves", async () => {
    const fetchImpl = fetchWith(true);
    const res = await handleEnquiryRequest(req(validPayload({ turnstileToken: "good" })), {
      ...turnstileDeps,
      fetchImpl,
    });
    expect(res.status).toBe(200);
    // Verification, admin notification, acknowledgement.
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("does not require a token for assistant submissions", async () => {
    const fetchImpl = okFetch();
    const res = await handleEnquiryRequest(req(validPayload()), {
      ...turnstileDeps,
      origin: "assistant",
      fetchImpl,
    });
    expect(res.status).toBe(200);
  });
});

describe("storage", () => {
  it("stores the enquiry when a database is bound", async () => {
    const { db, rows } = fakeDb();
    const res = await handleEnquiryRequest(req(validPayload()), {
      ...DEPS,
      db,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(200);
    expect(rows).toHaveLength(1);
  });

  it("rejects a duplicate within the dedupe window", async () => {
    const { db } = fakeDb({ existingDuplicate: true });
    const fetchImpl = okFetch();
    const res = await handleEnquiryRequest(req(validPayload()), { ...DEPS, db, fetchImpl });
    expect(res.status).toBe(409);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("still notifies when the insert fails, so the enquiry is not lost", async () => {
    const { db } = fakeDb({ failInsert: true });
    const fetchImpl = okFetch();
    const res = await handleEnquiryRequest(req(validPayload()), { ...DEPS, db, fetchImpl });
    expect(res.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalled();
  });
});

describe("delivery", () => {
  it("returns 502 and does not claim success when nothing durable succeeded", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    const res = await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    expect(res.status).toBe(502);
    expect(((await res.json()) as { ok: boolean }).ok).toBe(false);
  });

  it("returns 502 when the Resend request throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const res = await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    expect(res.status).toBe(502);
  });

  it("still reports success when only the acknowledgement fails", async () => {
    let call = 0;
    const fetchImpl = vi.fn().mockImplementation(() => {
      call += 1;
      return Promise.resolve(
        call === 1
          ? new Response(JSON.stringify({ id: "email_1" }), { status: 200 })
          : new Response("bounced", { status: 500 }),
      );
    });
    const res = await handleEnquiryRequest(req(validPayload()), { ...DEPS, fetchImpl });
    expect(res.status).toBe(200);
  });

  it("reports success when storage worked even though notification failed", async () => {
    const { db } = fakeDb();
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    const res = await handleEnquiryRequest(req(validPayload()), { ...DEPS, db, fetchImpl });
    expect(res.status).toBe(200);
  });
});
