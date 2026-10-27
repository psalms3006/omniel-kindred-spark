import { describe, expect, it, vi } from "vitest";
import { createResendEmailSender, createResendWaitlistStore } from "./waitlist-resend";

type FetchArgs = [RequestInfo | URL, RequestInit | undefined];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const ENTRY = {
  email: "ada@example.com",
  name: "Ada Lovelace",
  intendedUse: "Writing",
  signedUpAt: "2026-01-01T00:00:00.000Z",
};

describe("createResendWaitlistStore", () => {
  it("creates a pending contact without joining the broadcast segment", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ id: "c1" }));
    const store = createResendWaitlistStore({ apiKey: "k", segmentId: "seg_1", fetchImpl });

    const result = await store.upsertPending(ENTRY);

    expect(result).toEqual({ ok: true, state: "created" });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as FetchArgs;
    expect(url).toBe("https://api.resend.com/contacts");
    const body = JSON.parse(String(init?.body));
    expect(body.email).toBe("ada@example.com");
    expect(body.properties.status).toBe("pending");
    expect(body.properties.source).toBe("nova-waitlist");
    expect(body.segments).toBeUndefined();
  });

  it("treats an existing confirmed contact as already-confirmed and does not downgrade it", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/contacts") && init?.method === "POST") {
        return jsonResponse({ message: "contact already exists" }, 409);
      }
      return jsonResponse({ properties: { status: { value: "confirmed", type: "string" } } });
    });
    const store = createResendWaitlistStore({ apiKey: "k", fetchImpl });

    const result = await store.upsertPending(ENTRY);

    expect(result).toEqual({ ok: true, state: "already-confirmed" });
    const patches = (fetchImpl.mock.calls as unknown as FetchArgs[]).filter(
      ([, init]) => init?.method === "PATCH",
    );
    expect(patches).toHaveLength(0);
  });

  it("refreshes an existing pending contact", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/contacts") && init?.method === "POST") {
        return jsonResponse({ message: "exists" }, 409);
      }
      if (init?.method === "PATCH") return jsonResponse({ id: "c1" });
      return jsonResponse({ properties: { status: { value: "pending", type: "string" } } });
    });
    const store = createResendWaitlistStore({ apiKey: "k", fetchImpl });

    const result = await store.upsertPending(ENTRY);

    expect(result).toEqual({ ok: true, state: "already-pending" });
    const patches = (fetchImpl.mock.calls as unknown as FetchArgs[]).filter(
      ([, init]) => init?.method === "PATCH",
    );
    expect(patches).toHaveLength(1);
  });

  it("returns an error when the create fails and the contact cannot be read", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ message: "nope" }, 500));
    const store = createResendWaitlistStore({ apiKey: "k", fetchImpl });

    const result = await store.upsertPending(ENTRY);

    expect(result.ok).toBe(false);
  });

  it("confirms by patching the contact status", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ id: "c1" }));
    const store = createResendWaitlistStore({ apiKey: "k", fetchImpl });

    const result = await store.confirm("ada@example.com", "2026-01-02T00:00:00.000Z");

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as FetchArgs;
    expect(url).toBe("https://api.resend.com/contacts/ada%40example.com");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body)).properties.status).toBe("confirmed");
  });

  it("adds a confirmed contact to the broadcast segment", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ id: "c1" }));
    const store = createResendWaitlistStore({ apiKey: "k", segmentId: "seg_1", fetchImpl });

    const result = await store.confirm("ada@example.com", "2026-01-02T00:00:00.000Z");

    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const [url, init] = fetchImpl.mock.calls[1] as unknown as FetchArgs;
    expect(url).toBe("https://api.resend.com/contacts/ada%40example.com/segments/seg_1");
    expect(init?.method).toBe("POST");
  });

  it("still confirms when adding to the segment fails", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/segments/")) return jsonResponse({ message: "nope" }, 500);
      return init?.method === "PATCH" ? jsonResponse({ id: "c1" }) : jsonResponse({ id: "c1" });
    });
    const store = createResendWaitlistStore({ apiKey: "k", segmentId: "seg_1", fetchImpl });

    const result = await store.confirm("ada@example.com", "2026-01-02T00:00:00.000Z");

    expect(result).toEqual({ ok: true });
  });
});

describe("createResendEmailSender", () => {
  it("posts the email to Resend", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ id: "e1" }));
    const send = createResendEmailSender({
      apiKey: "k",
      from: "OMNIEL <noreply@omniel.test>",
      replyTo: "info@omniel.test",
      fetchImpl,
    });

    const result = await send({
      to: "ada@example.com",
      subject: "Subject",
      html: "<p>hi</p>",
      text: "hi",
    });

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as FetchArgs;
    expect(url).toBe("https://api.resend.com/emails");
    const body = JSON.parse(String(init?.body));
    expect(body.to).toEqual(["ada@example.com"]);
    expect(body.from).toBe("OMNIEL <noreply@omniel.test>");
    expect(body.reply_to).toBe("info@omniel.test");
  });

  it("uses a message-level reply-to when one is provided", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ id: "e1" }));
    const send = createResendEmailSender({
      apiKey: "k",
      from: "OMNIEL <noreply@omniel.test>",
      replyTo: "info@omniel.test",
      fetchImpl,
    });

    await send({
      to: "info@omniel.test",
      replyTo: "ada@example.com",
      subject: "Subject",
      html: "<p>hi</p>",
      text: "hi",
    });

    const [, init] = fetchImpl.mock.calls[0] as unknown as FetchArgs;
    expect(JSON.parse(String(init?.body)).reply_to).toBe("ada@example.com");
  });

  it("reports failure instead of throwing", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ message: "bad" }, 422));
    const send = createResendEmailSender({ apiKey: "k", from: "a@b.c", fetchImpl });
    const result = await send({ to: "x@y.z", subject: "s", html: "h", text: "t" });
    expect(result.ok).toBe(false);
  });
});
