// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createActionDispatcher } from "./actions";
import type { AnyRouter } from "@tanstack/react-router";

function makeFakeRouter(initialPath = "/") {
  const state = { location: { pathname: initialPath } };
  const navigate = vi.fn(async (opts: { to: string; params?: Record<string, string> }) => {
    if (opts.to === "/products/$slug" && opts.params?.["slug"]) {
      state.location.pathname = `/products/${opts.params["slug"]}`;
    } else {
      state.location.pathname = opts.to;
    }
  });
  return { state, navigate } as unknown as AnyRouter;
}

function mountSection(id: string) {
  const el = document.createElement("section");
  el.id = id;
  el.scrollIntoView = vi.fn();
  document.body.appendChild(el);
  return el;
}

function mountForm(id: string, fields: string[]) {
  const root = mountSection(id);
  for (const f of fields) {
    const input = document.createElement("input");
    input.setAttribute("data-field", f);
    root.appendChild(input);
  }
  return root;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("navigate_to_page", () => {
  it("navigates to a known top-level page", async () => {
    const router = makeFakeRouter("/");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.navigate_to_page({ page: "careers" });

    expect(result).toEqual({ ok: true, page: "careers", path: "/careers" });
    expect(router.navigate).toHaveBeenCalledWith({ to: "/careers" });
  });

  it("rejects an unknown page without inventing one", async () => {
    const router = makeFakeRouter("/");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.navigate_to_page({ page: "blog" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.validOptions).toEqual(
        expect.arrayContaining(["home", "about", "products", "careers", "contact"]),
      );
    }
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

describe("navigate_to_section", () => {
  it("navigates and scrolls to a known section", async () => {
    const router = makeFakeRouter("/somewhere-else");
    mountSection("ecosystem");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.navigate_to_section({ section: "ecosystem" });

    expect(result).toEqual({ ok: true, section: "ecosystem", path: "/products" });
    expect(router.navigate).toHaveBeenCalledWith({ to: "/products" });
  });

  it("rejects an unknown section without inventing one", async () => {
    const router = makeFakeRouter("/");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.navigate_to_section({ section: "pricing" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.validOptions).toEqual(
        expect.arrayContaining(["products", "about", "ecosystem", "compare", "reality"]),
      );
    }
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("navigates to a section added in the Phase 6 audit (about/technology/research)", async () => {
    const router = makeFakeRouter("/");
    mountSection("vision");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.navigate_to_section({ section: "vision" });

    expect(result).toEqual({ ok: true, section: "vision", path: "/about" });
  });
});

describe("open_product", () => {
  it("navigates to a real product slug", async () => {
    const router = makeFakeRouter("/products");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.open_product({ slug: "nova" });

    expect(result).toEqual({ ok: true, slug: "nova", path: "/products/nova" });
    expect(router.navigate).toHaveBeenCalledWith({
      to: "/products/$slug",
      params: { slug: "nova" },
    });
  });

  it("rejects an unknown product slug", async () => {
    const router = makeFakeRouter("/products");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.open_product({ slug: "frontier" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.validOptions).toEqual(["nova", "vyren", "arvo", "kiwi"]);
    }
  });
});

describe("navigate_to_product_section", () => {
  it("navigates to the product page and scrolls to a known section", async () => {
    const router = makeFakeRouter("/");
    mountSection("capabilities");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.navigate_to_product_section({
      slug: "nova",
      section: "capabilities",
    });

    expect(result).toEqual({
      ok: true,
      slug: "nova",
      section: "capabilities",
      path: "/products/nova",
    });
    expect(router.navigate).toHaveBeenCalledWith({
      to: "/products/$slug",
      params: { slug: "nova" },
    });
  });

  it("rejects an unknown product slug", async () => {
    const router = makeFakeRouter("/");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.navigate_to_product_section({
      slug: "frontier",
      section: "capabilities",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.validOptions).toEqual(["nova", "vyren", "arvo", "kiwi"]);
    }
  });

  it("rejects an unknown section without inventing one", async () => {
    const router = makeFakeRouter("/");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.navigate_to_product_section({
      slug: "nova",
      section: "pricing",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.validOptions).toEqual(["capabilities", "audience"]);
    }
  });

  it("reports a section that doesn't exist for that product (e.g. no capabilities listed)", async () => {
    const router = makeFakeRouter("/");
    // deliberately do not mount "capabilities" — simulates a product with none
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.navigate_to_product_section({
      slug: "kiwi",
      section: "capabilities",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("kiwi");
    }
  });
});

describe("open_form", () => {
  it("navigates and scrolls to a known form", async () => {
    const router = makeFakeRouter("/");
    mountSection("partnerships");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.open_form({ formId: "partnerships" });

    expect(result).toEqual({ ok: true, formId: "partnerships", path: "/contact" });
  });

  it("rejects an unknown formId", async () => {
    const router = makeFakeRouter("/");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.open_form({ formId: "newsletter" });

    expect(result.ok).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

describe("fill_form", () => {
  it("fills known fields on an already-open form", async () => {
    const router = makeFakeRouter("/contact");
    mountForm("contact", ["name", "email", "message"]);
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.fill_form({
      formId: "contact",
      fields: { name: "Ada", email: "ada@example.com", message: "Hi" },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.filled.sort()).toEqual(["email", "message", "name"]);
      expect(result.skipped).toEqual([]);
    }
    const nameInput = document.querySelector('#contact [data-field="name"]') as HTMLInputElement;
    expect(nameInput.value).toBe("Ada");
  });

  it("does not auto-open a form that isn't mounted", async () => {
    const router = makeFakeRouter("/contact");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.fill_form({ formId: "contact", fields: { name: "Ada" } });

    expect(result).toEqual({
      ok: false,
      error: 'Form "contact" is not open. Call open_form first.',
    });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("skips fields with no matching data-field element", async () => {
    const router = makeFakeRouter("/contact");
    mountForm("contact", ["name"]);
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.fill_form({
      formId: "contact",
      fields: { name: "Ada", category: "Partnership" },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.filled).toEqual(["name"]);
      expect(result.skipped).toEqual(["category"]);
    }
  });

  it("rejects an unknown formId", async () => {
    const router = makeFakeRouter("/contact");
    const dispatcher = createActionDispatcher(router);

    const result = await dispatcher.fill_form({ formId: "newsletter", fields: { name: "Ada" } });

    expect(result.ok).toBe(false);
  });
});
