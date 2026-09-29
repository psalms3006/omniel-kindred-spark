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
});
