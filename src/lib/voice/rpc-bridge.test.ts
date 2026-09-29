import { describe, expect, it, vi } from "vitest";
import type { ActionDispatcher } from "./actions";
import { runAgentAction } from "./rpc-bridge";

function fakeDispatcher() {
  const ok = vi.fn(async () => ({ ok: true }));
  return {
    dispatcher: {
      navigate_to_page: ok,
      navigate_to_section: ok,
      open_product: ok,
      navigate_to_product_section: ok,
      open_form: ok,
      fill_form: ok,
    } as unknown as ActionDispatcher,
    ok,
  };
}

describe("runAgentAction", () => {
  it("runs an allowlisted action and returns its result", async () => {
    const { dispatcher, ok } = fakeDispatcher();
    const out = await runAgentAction(
      JSON.stringify({ name: "open_product", args: { slug: "nova" } }),
      dispatcher,
    );
    expect(ok).toHaveBeenCalledWith({ slug: "nova" });
    expect(JSON.parse(out)).toEqual({ ok: true });
  });

  it("reshapes flat fill_form arguments into the dispatcher's fields object", async () => {
    const { dispatcher, ok } = fakeDispatcher();
    await runAgentAction(
      JSON.stringify({
        name: "fill_form",
        args: { formId: "contact", name: "Ada", email: "ada@example.com", category: null },
      }),
      dispatcher,
    );
    expect(ok).toHaveBeenCalledWith({
      formId: "contact",
      fields: { name: "Ada", email: "ada@example.com" },
    });
  });

  it("refuses anything outside the allowlist", async () => {
    const { dispatcher, ok } = fakeDispatcher();
    const out = await runAgentAction(JSON.stringify({ name: "submit_enquiry" }), dispatcher);
    expect(JSON.parse(out)).toMatchObject({ ok: false });
    expect(ok).not.toHaveBeenCalled();
  });

  it("reports malformed payloads and thrown actions instead of throwing", async () => {
    const { dispatcher, ok } = fakeDispatcher();
    expect(JSON.parse(await runAgentAction("{not json", dispatcher))).toMatchObject({ ok: false });

    ok.mockRejectedValueOnce(new Error("boom"));
    const out = await runAgentAction(JSON.stringify({ name: "open_form" }), dispatcher);
    expect(JSON.parse(out)).toMatchObject({ ok: false });
  });
});
