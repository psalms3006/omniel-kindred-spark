// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { attachToolHandlers } from "./tool-handlers";
import type { ActionDispatcher } from "./actions";

type MessageHandler = (message: unknown) => void;

function makeFakeVapi() {
  let handler: MessageHandler | null = null;
  return {
    on: vi.fn((_event: string, cb: MessageHandler) => {
      handler = cb;
    }),
    removeListener: vi.fn(),
    send: vi.fn(),
    emit(message: unknown) {
      handler?.(message);
    },
  };
}

function makeFakeDispatcher(): ActionDispatcher {
  return {
    navigate_to_page: vi.fn().mockResolvedValue({ ok: true, page: "careers", path: "/careers" }),
    navigate_to_section: vi
      .fn()
      .mockResolvedValue({ ok: true, section: "reality", path: "/careers" }),
    open_product: vi.fn().mockResolvedValue({ ok: true, slug: "nova", path: "/products/nova" }),
    open_form: vi.fn().mockResolvedValue({ ok: true, formId: "contact", path: "/contact" }),
    fill_form: vi
      .fn()
      .mockResolvedValue({ ok: true, formId: "contact", filled: ["name"], skipped: [] }),
  } as unknown as ActionDispatcher;
}

function toolCallMessage(name: string, args: Record<string, unknown>) {
  return {
    type: "tool-calls",
    toolCalls: [{ id: "call_1", function: { name, arguments: JSON.stringify(args) } }],
  };
}

describe("attachToolHandlers", () => {
  it("dispatches a known client tool with its args", async () => {
    const vapi = makeFakeVapi();
    const dispatcher = makeFakeDispatcher();
    attachToolHandlers(vapi as never, dispatcher);

    vapi.emit(toolCallMessage("open_product", { slug: "nova" }));
    await new Promise((r) => setTimeout(r, 0));

    expect(dispatcher.open_product).toHaveBeenCalledWith({ slug: "nova" });
  });

  it("adapts flat fill_form args into the nested {formId, fields} shape the dispatcher expects", async () => {
    const vapi = makeFakeVapi();
    const dispatcher = makeFakeDispatcher();
    attachToolHandlers(vapi as never, dispatcher);

    vapi.emit(
      toolCallMessage("fill_form", {
        formId: "contact",
        name: "Ada Lovelace",
        email: "ada@example.com",
      }),
    );
    await new Promise((r) => setTimeout(r, 0));

    expect(dispatcher.fill_form).toHaveBeenCalledWith({
      formId: "contact",
      fields: { name: "Ada Lovelace", email: "ada@example.com" },
    });
  });

  it("ignores submit_enquiry — that tool is server-side only, never dispatched from the browser", async () => {
    const vapi = makeFakeVapi();
    const dispatcher = makeFakeDispatcher();
    attachToolHandlers(vapi as never, dispatcher);

    vapi.emit(
      toolCallMessage("submit_enquiry", {
        formId: "contact",
        name: "Ada",
        email: "ada@example.com",
        message: "Hi",
        confirmation: true,
      }),
    );
    await new Promise((r) => setTimeout(r, 0));

    expect(dispatcher.open_form).not.toHaveBeenCalled();
    expect(dispatcher.fill_form).not.toHaveBeenCalled();
  });

  it("ignores an unrecognized tool name entirely", async () => {
    const vapi = makeFakeVapi();
    const dispatcher = makeFakeDispatcher();
    attachToolHandlers(vapi as never, dispatcher);

    vapi.emit(toolCallMessage("delete_everything", {}));
    await new Promise((r) => setTimeout(r, 0));

    for (const fn of Object.values(dispatcher)) {
      expect(fn).not.toHaveBeenCalled();
    }
  });

  it("ignores non-tool-calls messages", async () => {
    const vapi = makeFakeVapi();
    const dispatcher = makeFakeDispatcher();
    attachToolHandlers(vapi as never, dispatcher);

    vapi.emit({ type: "transcript", text: "hello" });
    await new Promise((r) => setTimeout(r, 0));

    for (const fn of Object.values(dispatcher)) {
      expect(fn).not.toHaveBeenCalled();
    }
  });

  it("removeListener detaches on cleanup", () => {
    const vapi = makeFakeVapi();
    const dispatcher = makeFakeDispatcher();
    const detach = attachToolHandlers(vapi as never, dispatcher);

    detach();

    expect(vapi.removeListener).toHaveBeenCalledWith("message", expect.any(Function));
  });
});
