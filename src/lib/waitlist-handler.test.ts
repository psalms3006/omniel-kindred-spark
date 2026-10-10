import { describe, expect, it, vi } from "vitest";
import {
  handleWaitlistConfirm,
  handleWaitlistSignup,
  type WaitlistEmail,
  type WaitlistStore,
} from "./waitlist-handler";
import { signWaitlistToken } from "./waitlist-token";

const SITE = "https://omniel.test";
const SECRET = "test-secret";
const NOW = 1_700_000_000_000;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function req(body: unknown) {
  return new Request(`${SITE}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function makeStore(overrides: Partial<WaitlistStore> = {}): WaitlistStore {
  return {
    upsertPending: vi.fn().mockResolvedValue({ ok: true, state: "created" }),
    confirm: vi.fn().mockResolvedValue({ ok: true }),
    ...overrides,
  } as WaitlistStore;
}

function makeSender() {
  return vi.fn(async (_email: WaitlistEmail) => ({ ok: true as const }));
}

const valid = { name: "Ada Lovelace", email: "Ada@Example.com", intendedUse: "Writing" };

describe("handleWaitlistSignup", () => {
  it("stores the contact (lowercased) and sends a confirmation link", async () => {
    const store = makeStore();
    const sendEmail = makeSender();
    const res = await handleWaitlistSignup(req(valid), {
      store,
      sendEmail,
      tokenSecret: SECRET,
      siteUrl: SITE,
      now: () => NOW,
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, status: "pending" });
    expect(store.upsertPending).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.com", name: "Ada Lovelace" }),
    );
    const sent = sendEmail.mock.calls[0]![0];
    expect(sent.to).toBe("ada@example.com");
    expect(sent.text).toContain(`${SITE}/waitlist-confirm?token=`);
  });

  it("rejects invalid input without touching the store", async () => {
    const store = makeStore();
    const res = await handleWaitlistSignup(req({ ...valid, email: "nope" }), {
      store,
      sendEmail: makeSender(),
      tokenSecret: SECRET,
      siteUrl: SITE,
    });
    expect(res.status).toBe(400);
    expect(store.upsertPending).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const res = await handleWaitlistSignup(req("{not json"), {
      store: makeStore(),
      sendEmail: makeSender(),
      tokenSecret: SECRET,
      siteUrl: SITE,
    });
    expect(res.status).toBe(400);
  });

  it("fails closed when the token secret is missing", async () => {
    const store = makeStore();
    const res = await handleWaitlistSignup(req(valid), {
      store,
      sendEmail: makeSender(),
      siteUrl: SITE,
    });
    expect(res.status).toBe(503);
    expect(store.upsertPending).not.toHaveBeenCalled();
  });

  it("returns 502 when the store fails", async () => {
    const res = await handleWaitlistSignup(req(valid), {
      store: makeStore({ upsertPending: vi.fn().mockResolvedValue({ ok: false, error: "boom" }) }),
      sendEmail: makeSender(),
      tokenSecret: SECRET,
      siteUrl: SITE,
    });
    expect(res.status).toBe(502);
  });

  it("returns 502 when the confirmation email fails", async () => {
    const res = await handleWaitlistSignup(req(valid), {
      store: makeStore(),
      sendEmail: vi.fn(async () => ({ ok: false as const, error: "smtp down" })),
      tokenSecret: SECRET,
      siteUrl: SITE,
    });
    expect(res.status).toBe(502);
  });

  it("does not re-email an already-confirmed signup", async () => {
    const store = makeStore({
      upsertPending: vi.fn().mockResolvedValue({ ok: true, state: "already-confirmed" }),
    });
    const sendEmail = makeSender();
    const res = await handleWaitlistSignup(req(valid), {
      store,
      sendEmail,
      tokenSecret: SECRET,
      siteUrl: SITE,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, status: "confirmed" });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("re-sends the confirmation for an already-pending signup", async () => {
    const sendEmail = makeSender();
    const res = await handleWaitlistSignup(req(valid), {
      store: makeStore({
        upsertPending: vi.fn().mockResolvedValue({ ok: true, state: "already-pending" }),
      }),
      sendEmail,
      tokenSecret: SECRET,
      siteUrl: SITE,
    });
    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});

describe("handleWaitlistConfirm", () => {
  it("confirms a valid token and acknowledges by email", async () => {
    const token = await signWaitlistToken("ada@example.com", SECRET, NOW);
    const store = makeStore();
    const sendEmail = makeSender();
    const res = await handleWaitlistConfirm(req({ token }), {
      store,
      sendEmail,
      tokenSecret: SECRET,
      siteUrl: SITE,
      now: () => NOW,
      tokenMaxAgeMs: MAX_AGE,
    });

    expect(res.status).toBe(200);
    expect(store.confirm).toHaveBeenCalledWith("ada@example.com", expect.any(String));
    expect(sendEmail.mock.calls[0]![0].subject).toContain("NOVA waitlist");
  });

  it("rejects a missing token", async () => {
    const res = await handleWaitlistConfirm(req({}), {
      store: makeStore(),
      tokenSecret: SECRET,
      siteUrl: SITE,
    });
    expect(res.status).toBe(400);
  });

  it("rejects an expired token", async () => {
    const token = await signWaitlistToken("ada@example.com", SECRET, NOW);
    const res = await handleWaitlistConfirm(req({ token }), {
      store: makeStore(),
      tokenSecret: SECRET,
      siteUrl: SITE,
      now: () => NOW + MAX_AGE + 1,
      tokenMaxAgeMs: MAX_AGE,
    });
    expect(res.status).toBe(400);
  });

  it("returns 502 when the store fails to confirm", async () => {
    const token = await signWaitlistToken("ada@example.com", SECRET, NOW);
    const res = await handleWaitlistConfirm(req({ token }), {
      store: makeStore({ confirm: vi.fn().mockResolvedValue({ ok: false, error: "boom" }) }),
      tokenSecret: SECRET,
      siteUrl: SITE,
      now: () => NOW,
    });
    expect(res.status).toBe(502);
  });

  it("still succeeds when only the acknowledgement email fails", async () => {
    const token = await signWaitlistToken("ada@example.com", SECRET, NOW);
    const res = await handleWaitlistConfirm(req({ token }), {
      store: makeStore(),
      sendEmail: vi.fn(async () => ({ ok: false as const, error: "smtp down" })),
      tokenSecret: SECRET,
      siteUrl: SITE,
      now: () => NOW,
    });
    expect(res.status).toBe(200);
  });
});
