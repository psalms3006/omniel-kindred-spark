import { describe, expect, it, vi } from "vitest";
import { handleAgentToolRequest, type AgentToolDeps } from "./agent-tools";

const SECRET = "test-agent-secret";

function request(body: unknown, secret: string | null = SECRET): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret !== null) headers["x-agent-secret"] = secret;
  return new Request("https://omniel.test/api/agent/tools", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function deps(overrides: Partial<AgentToolDeps> = {}): AgentToolDeps {
  return { agentSecret: SECRET, enquiry: { toEmail: "team@omniel.test" }, ...overrides };
}

describe("handleAgentToolRequest", () => {
  it("fails closed when the shared secret is not configured", async () => {
    const res = await handleAgentToolRequest(request({ tool: "search_website" }), {
      enquiry: {},
    });
    expect(res.status).toBe(503);
  });

  it("rejects a missing or wrong secret", async () => {
    expect((await handleAgentToolRequest(request({}, null), deps())).status).toBe(401);
    expect((await handleAgentToolRequest(request({}, "nope"), deps())).status).toBe(401);
  });

  it("rejects unknown tools", async () => {
    const res = await handleAgentToolRequest(request({ tool: "delete_everything" }), deps());
    expect(res.status).toBe(400);
  });

  it("tells the model to ask again when no query is given", async () => {
    const res = await handleAgentToolRequest(request({ tool: "search_website", args: {} }), deps());
    const body = (await res.json()) as { result: string };
    expect(res.status).toBe(200);
    expect(body.result).toMatch(/No search terms/);
  });

  it("reports missing enquiry fields back to the model instead of sending", async () => {
    const fetchImpl = vi.fn();
    const res = await handleAgentToolRequest(
      request({ tool: "submit_enquiry", args: { formId: "contact", confirmation: true } }),
      deps({ enquiry: { toEmail: "team@omniel.test", fetchImpl } }),
    );
    const body = (await res.json()) as { result: string };
    expect(body.result).toMatch(/not submitted/);
    expect(body.result).toMatch(/email/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("refuses an enquiry the visitor has not confirmed", async () => {
    const fetchImpl = vi.fn();
    const res = await handleAgentToolRequest(
      request({
        tool: "submit_enquiry",
        args: { formId: "contact", name: "Ada", email: "ada@example.com", message: "Hi" },
      }),
      deps({ enquiry: { toEmail: "team@omniel.test", fetchImpl } }),
    );
    const body = (await res.json()) as { result: string };
    expect(body.result).toMatch(/confirmation/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  describe("join_waitlist", () => {
    function waitlistDeps(overrides: Partial<{ sendEmail: (e: { to: string; subject: string; html: string; text: string }) => Promise<{ ok: boolean; error?: string }>; store: { upsertPending: () => Promise<{ ok: true; state: "created" | "already-pending" | "already-confirmed" }> } }> = {}): AgentToolDeps {
      return {
        agentSecret: SECRET,
        enquiry: { toEmail: "team@omniel.test" },
        waitlist: {
          tokenSecret: "test-token-secret",
          siteUrl: "https://omniel.test",
          sendEmail: overrides.sendEmail ?? (async () => ({ ok: true })),
          store: overrides.store ?? { upsertPending: async () => ({ ok: true, state: "created" as const }) },
        },
      };
    }

    it("rejects a waitlist signup with missing fields", async () => {
      const res = await handleAgentToolRequest(
        request({ tool: "join_waitlist", args: { name: "Ada", confirmation: true } }),
        waitlistDeps(),
      );
      const body = (await res.json()) as { result: string };
      expect(res.status).toBe(200);
      expect(body.result).toMatch(/missing or invalid/);
      expect(body.result).toMatch(/email/);
    });

    it("rejects a waitlist signup with an invalid email", async () => {
      const res = await handleAgentToolRequest(
        request({
          tool: "join_waitlist",
          args: { name: "Ada", email: "not-an-email", confirmation: true },
        }),
        waitlistDeps(),
      );
      const body = (await res.json()) as { result: string };
      expect(res.status).toBe(200);
      expect(body.result).toMatch(/missing or invalid/);
    });

    it("refuses a waitlist signup the visitor has not confirmed", async () => {
      const res = await handleAgentToolRequest(
        request({ tool: "join_waitlist", args: { name: "Ada", email: "ada@example.com" } }),
        waitlistDeps(),
      );
      const body = (await res.json()) as { result: string };
      expect(res.status).toBe(200);
      expect(body.result).toMatch(/missing or invalid/);
      expect(body.result).toMatch(/confirmation/);
    });

    it("submits a waitlist signup and reports pending", async () => {
      const sendEmail = vi.fn().mockResolvedValue({ ok: true });
      const upsertPending = vi.fn().mockResolvedValue({ ok: true, state: "created" as const });
      const res = await handleAgentToolRequest(
        request({
          tool: "join_waitlist",
          args: { name: "Ada", email: "ada@example.com", intendedUse: "daily planning", confirmation: true },
        }),
        waitlistDeps({ sendEmail, store: { upsertPending } }),
      );
      const body = (await res.json()) as { result: string };
      expect(res.status).toBe(200);
      expect(body.result).toMatch(/submitted/);
      expect(body.result).toMatch(/confirmation email/);
      expect(body.result).toMatch(/click/);
      expect(sendEmail).toHaveBeenCalled();
      expect(upsertPending).toHaveBeenCalledWith({
        email: "ada@example.com",
        name: "Ada",
        intendedUse: "daily planning",
        signedUpAt: expect.any(String),
      });
    });

    it("reports an already-confirmed signup", async () => {
      const upsertPending = vi.fn().mockResolvedValue({ ok: true, state: "already-confirmed" as const });
      const res = await handleAgentToolRequest(
        request({
          tool: "join_waitlist",
          args: { name: "Ada", email: "ada@example.com", confirmation: true },
        }),
        waitlistDeps({ store: { upsertPending } }),
      );
      const body = (await res.json()) as { result: string };
      expect(res.status).toBe(200);
      expect(body.result).toMatch(/already/);
    });

    it("reports a failure honestly when the backend fails", async () => {
      const upsertPending = vi.fn().mockResolvedValue({ ok: false, error: "Resend error" });
      const res = await handleAgentToolRequest(
        request({
          tool: "join_waitlist",
          args: { name: "Ada", email: "ada@example.com", confirmation: true },
        }),
        waitlistDeps({ store: { upsertPending } }),
      );
      const body = (await res.json()) as { result: string };
      expect(res.status).toBe(200);
      expect(body.result).toMatch(/not submitted/);
      expect(body.result).toMatch(/couldn't save/);
    });

    it("tells the model to use the website when waitlist is not configured", async () => {
      const res = await handleAgentToolRequest(
        request({ tool: "join_waitlist", args: { name: "Ada", email: "ada@example.com", confirmation: true } }),
        { agentSecret: SECRET, enquiry: { toEmail: "team@omniel.test" } },
      );
      const body = (await res.json()) as { result: string };
      expect(res.status).toBe(200);
      expect(body.result).toMatch(/not configured/);
      expect(body.result).toMatch(/website/);
    });
  });
});
