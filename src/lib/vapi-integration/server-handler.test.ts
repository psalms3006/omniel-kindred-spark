import { describe, expect, it, vi } from "vitest";
import { handleVapiServerRequest, type VapiServerDeps } from "./server-handler";

const DEPS: VapiServerDeps = {
  serverSecret: "shared-secret",
  resendApiKey: "test_key",
  fromEmail: "OMNIEL <noreply@omniel.test>",
  toEmail: "inbox@omniel.test",
};

function okFetch() {
  return vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ id: "email_1" }), { status: 200 }));
}

function req(body: unknown, secret: string | null = "shared-secret") {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret !== null) headers["x-vapi-secret"] = secret;
  return new Request("http://localhost/api/vapi/webhook", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const toolCall = (args: Record<string, unknown>) => ({
  message: {
    type: "tool-calls",
    toolCallList: [{ id: "call_1", function: { name: "submit_enquiry", arguments: args } }],
  },
});

const validArgs = (overrides: Record<string, unknown> = {}) => ({
  formId: "contact",
  name: "Grace Hopper",
  email: "grace@example.com",
  message: "I would like to know more about NOVA.",
  confirmation: true,
  ...overrides,
});

describe("authentication", () => {
  it("rejects a request with no secret", async () => {
    const res = await handleVapiServerRequest(req(toolCall(validArgs()), null), {
      ...DEPS,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(401);
  });

  it("rejects a request with the wrong secret", async () => {
    const fetchImpl = okFetch();
    const res = await handleVapiServerRequest(req(toolCall(validArgs()), "guess"), {
      ...DEPS,
      fetchImpl,
    });
    expect(res.status).toBe(401);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails closed when no secret is configured on our side", async () => {
    const { serverSecret: _unset, ...withoutSecret } = DEPS;
    const res = await handleVapiServerRequest(req(toolCall(validArgs())), {
      ...withoutSecret,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(503);
  });
});

describe("submit_enquiry tool", () => {
  it("submits a valid enquiry and returns a Vapi tool result", async () => {
    const fetchImpl = okFetch();
    const res = await handleVapiServerRequest(req(toolCall(validArgs())), { ...DEPS, fetchImpl });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { results: { toolCallId: string; result: string }[] };
    expect(body.results).toHaveLength(1);
    expect(body.results[0]!.toolCallId).toBe("call_1");
    expect(body.results[0]!.result).toMatch(/submitted successfully/i);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("accepts arguments sent as a JSON string", async () => {
    const fetchImpl = okFetch();
    const payload = {
      message: {
        type: "tool-calls",
        toolCallList: [
          {
            id: "call_2",
            function: { name: "submit_enquiry", arguments: JSON.stringify(validArgs()) },
          },
        ],
      },
    };
    const res = await handleVapiServerRequest(req(payload), { ...DEPS, fetchImpl });
    const body = (await res.json()) as { results: { result: string }[] };
    expect(res.status).toBe(200);
    expect(body.results[0]!.result).toMatch(/submitted successfully/i);
  });

  it("tells the assistant what is missing instead of failing silently", async () => {
    const fetchImpl = okFetch();
    const res = await handleVapiServerRequest(req(toolCall(validArgs({ email: "not-an-email" }))), {
      ...DEPS,
      fetchImpl,
    });
    const body = (await res.json()) as { results: { result: string }[] };
    expect(res.status).toBe(200);
    expect(body.results[0]!.result).toMatch(/email/i);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("does not claim success when delivery failed", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    const res = await handleVapiServerRequest(req(toolCall(validArgs())), { ...DEPS, fetchImpl });
    const body = (await res.json()) as { results: { result: string }[] };
    expect(body.results[0]!.result).toMatch(/not submitted/i);
  });

  it("refuses a tool name it does not implement", async () => {
    const payload = {
      message: {
        type: "tool-calls",
        toolCallList: [{ id: "call_3", function: { name: "drop_database", arguments: {} } }],
      },
    };
    const res = await handleVapiServerRequest(req(payload), { ...DEPS, fetchImpl: okFetch() });
    const body = (await res.json()) as { results: { result: string }[] };
    expect(body.results[0]!.result).toMatch(/unsupported/i);
  });
});

describe("end-of-call report", () => {
  const report = (analysis: Record<string, unknown>) => ({
    message: {
      type: "end-of-call-report",
      endedReason: "customer-ended-call",
      durationSeconds: 92,
      startedAt: "2026-09-12T10:00:00.000Z",
      call: { id: "call_abc" },
      analysis,
    },
  });

  it("emails a summary with the extracted fields", async () => {
    const fetchImpl = okFetch();
    const res = await handleVapiServerRequest(
      req(
        report({
          summary: "Visitor asked about NOVA availability and offline support.",
          structuredData: {
            visitorName: "Grace Hopper",
            contactEmail: "grace@example.com",
            reason: "Product availability",
            questions: ["When does NOVA launch?"],
            requestedFollowUp: "Email when there is a date",
            leadType: "general",
            actionItems: ["Send NOVA timeline when known"],
          },
        }),
      ),
      { ...DEPS, fetchImpl },
    );
    expect(res.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchImpl.mock.calls[0]![1] as { body: string }).body) as {
      to: string[];
      subject: string;
      text: string;
      reply_to?: string;
    };
    expect(body.to).toEqual(["inbox@omniel.test"]);
    expect(body.subject).toContain("Grace Hopper");
    expect(body.text).toContain("When does NOVA launch?");
    expect(body.text).toContain("Send NOVA timeline when known");
    expect(body.reply_to).toBe("grace@example.com");
  });

  it("sends nothing when the call produced no actionable content", async () => {
    const fetchImpl = okFetch();
    const res = await handleVapiServerRequest(req(report({})), { ...DEPS, fetchImpl });
    expect(res.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("routes summaries to the summary address when one is configured", async () => {
    const fetchImpl = okFetch();
    await handleVapiServerRequest(req(report({ summary: "A real conversation happened." })), {
      ...DEPS,
      summaryToEmail: "calls@omniel.test",
      fetchImpl,
    });
    const body = JSON.parse((fetchImpl.mock.calls[0]![1] as { body: string }).body) as {
      to: string[];
    };
    expect(body.to).toEqual(["calls@omniel.test"]);
  });
});

describe("other message types", () => {
  it("acknowledges unrecognised events without acting on them", async () => {
    const fetchImpl = okFetch();
    const res = await handleVapiServerRequest(
      req({ message: { type: "status-update", status: "in-progress" } }),
      { ...DEPS, fetchImpl },
    );
    expect(res.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects a body with no message envelope", async () => {
    const res = await handleVapiServerRequest(req({ nope: true }), {
      ...DEPS,
      fetchImpl: okFetch(),
    });
    expect(res.status).toBe(400);
  });
});
