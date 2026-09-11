/**
 * OMNIEL action dispatcher.
 *
 * Deliberately independent of Vapi — it only knows about the TanStack Router
 * instance and the DOM. This is the layer any trigger (Vapi tool calls today,
 * something else tomorrow) should call through, so Vapi-specific code never
 * has to touch routing or form internals directly.
 */
import type { AnyRouter } from "@tanstack/react-router";

export type ActionResult<T extends Record<string, unknown> = Record<string, never>> =
  ({ ok: true } & T) | { ok: false; error: string; validOptions?: string[] };

/**
 * Every key here corresponds to a real `id="..."` anchor discovered in the
 * repository (src/routes/index.tsx, products.index.tsx, careers.tsx,
 * about.tsx, technology.tsx, research.tsx — Phase 6 audit). Do not add a
 * section here unless it actually exists in the markup. Sections that live
 * on the dynamic /products/$slug route ("capabilities", "audience") are
 * intentionally excluded — they don't have one fixed path, and belong to
 * navigate_to_product_section instead.
 */
const SECTIONS = {
  products: "/",
  about: "/",
  ecosystem: "/products",
  compare: "/products",
  reality: "/careers",
  belief: "/about",
  vision: "/about",
  team: "/about",
  directions: "/technology",
  offline: "/technology",
  "per-product": "/technology",
  future: "/research",
} as const;
export type SectionId = keyof typeof SECTIONS;

/** Sections that live on the dynamic /products/$slug route — one per product, not one fixed path. */
const PRODUCT_SECTIONS = ["capabilities", "audience"] as const;
export type ProductSectionId = (typeof PRODUCT_SECTIONS)[number];

/** Matches products in src/lib/omniel.ts — verified against the repository, not invented. */
const PRODUCT_SLUGS = ["nova", "vyren", "arvo", "kiwi"] as const;
export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

/** Matches the four InquiryForm ids actually rendered in contact.tsx / careers.tsx. */
const FORMS = {
  contact: "/contact",
  partnerships: "/contact",
  investment: "/contact",
  careers: "/careers",
} as const;
export type FormId = keyof typeof FORMS;

const FORM_FIELDS = ["name", "email", "category", "message"] as const;
export type FormField = (typeof FORM_FIELDS)[number];

/**
 * Every key here corresponds to a real route discovered in src/routes/
 * (Phase 3 audit). Use this for "go to the X page" with no specific anchor
 * in mind. /products/$slug is intentionally excluded — that's open_product's
 * job, since it needs a slug.
 */
const PAGES = {
  home: "/",
  about: "/about",
  products: "/products",
  careers: "/careers",
  contact: "/contact",
  research: "/research",
  technology: "/technology",
  privacy: "/privacy",
  terms: "/terms",
} as const;
export type PageId = keyof typeof PAGES;

const raf: (cb: FrameRequestCallback) => void =
  typeof requestAnimationFrame === "function"
    ? requestAnimationFrame
    : (cb) => setTimeout(() => cb(Date.now()), 0);

/** Polls for an element by id (post-navigation content may not be mounted yet) and scrolls to it. */
function scrollToId(id: string, maxAttempts = 40): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        resolve(true);
        return;
      }
      attempts += 1;
      if (attempts >= maxAttempts) {
        resolve(false);
        return;
      }
      raf(tick);
    };
    tick();
  });
}

export function createActionDispatcher(router: AnyRouter) {
  async function navigate_to_page(input: {
    page?: string;
  }): Promise<ActionResult<{ page: string; path: string }>> {
    const page = input?.page as PageId | undefined;
    if (!page || !(page in PAGES)) {
      return {
        ok: false,
        error: `Unknown page "${input?.page ?? ""}".`,
        validOptions: Object.keys(PAGES),
      };
    }
    const path = PAGES[page];
    await router.navigate({ to: path });
    return { ok: true, page, path };
  }

  async function navigate_to_section(input: {
    section?: string;
  }): Promise<ActionResult<{ section: string; path: string }>> {
    const section = input?.section as SectionId | undefined;
    if (!section || !(section in SECTIONS)) {
      return {
        ok: false,
        error: `Unknown section "${input?.section ?? ""}".`,
        validOptions: Object.keys(SECTIONS),
      };
    }
    const path = SECTIONS[section];
    if (router.state.location.pathname !== path) {
      await router.navigate({ to: path });
    }
    const found = await scrollToId(section);
    return found
      ? { ok: true, section, path }
      : {
          ok: false,
          error: `Navigated to ${path} but could not find section "${section}" in the DOM.`,
        };
  }

  async function open_product(input: {
    slug?: string;
  }): Promise<ActionResult<{ slug: string; path: string }>> {
    const slug = input?.slug as ProductSlug | undefined;
    if (!slug || !(PRODUCT_SLUGS as readonly string[]).includes(slug)) {
      return {
        ok: false,
        error: `Unknown product "${input?.slug ?? ""}".`,
        validOptions: [...PRODUCT_SLUGS],
      };
    }
    await router.navigate({ to: "/products/$slug", params: { slug } });
    return { ok: true, slug, path: `/products/${slug}` };
  }

  async function navigate_to_product_section(input: {
    slug?: string;
    section?: string;
  }): Promise<ActionResult<{ slug: string; section: string; path: string }>> {
    const slug = input?.slug as ProductSlug | undefined;
    if (!slug || !(PRODUCT_SLUGS as readonly string[]).includes(slug)) {
      return {
        ok: false,
        error: `Unknown product "${input?.slug ?? ""}".`,
        validOptions: [...PRODUCT_SLUGS],
      };
    }
    const section = input?.section as ProductSectionId | undefined;
    if (!section || !(PRODUCT_SECTIONS as readonly string[]).includes(section)) {
      return {
        ok: false,
        error: `Unknown product section "${input?.section ?? ""}".`,
        validOptions: [...PRODUCT_SECTIONS],
      };
    }
    const path = `/products/${slug}`;
    if (router.state.location.pathname !== path) {
      await router.navigate({ to: "/products/$slug", params: { slug } });
    }
    const found = await scrollToId(section);
    // "capabilities" is conditionally rendered (only when the product has any) —
    // a false result there is a legitimate "this product has none", not a bug.
    return found
      ? { ok: true, slug, section, path }
      : {
          ok: false,
          error: `Navigated to ${path} but could not find section "${section}" for ${slug}.`,
        };
  }

  async function open_form(input: {
    formId?: string;
  }): Promise<ActionResult<{ formId: string; path: string }>> {
    const formId = input?.formId as FormId | undefined;
    if (!formId || !(formId in FORMS)) {
      return {
        ok: false,
        error: `Unknown form "${input?.formId ?? ""}".`,
        validOptions: Object.keys(FORMS),
      };
    }
    const path = FORMS[formId];
    if (router.state.location.pathname !== path) {
      await router.navigate({ to: path });
    }
    const found = await scrollToId(formId);
    return found
      ? { ok: true, formId, path }
      : { ok: false, error: `Navigated to ${path} but form "${formId}" is not mounted.` };
  }

  async function fill_form(input: {
    formId?: string;
    fields?: Partial<Record<FormField, string>>;
  }): Promise<ActionResult<{ formId: string; filled: string[]; skipped: string[] }>> {
    const formId = input?.formId as FormId | undefined;
    if (!formId || !(formId in FORMS)) {
      return {
        ok: false,
        error: `Unknown form "${input?.formId ?? ""}".`,
        validOptions: Object.keys(FORMS),
      };
    }
    const root = document.getElementById(formId);
    if (!root) {
      // Per spec: never auto-open a form the caller didn't explicitly open first.
      return { ok: false, error: `Form "${formId}" is not open. Call open_form first.` };
    }

    const filled: string[] = [];
    const skipped: string[] = [];
    for (const [key, value] of Object.entries(input.fields ?? {})) {
      if (value == null) continue;
      if (!(FORM_FIELDS as readonly string[]).includes(key)) {
        skipped.push(key);
        continue;
      }
      const el = root.querySelector(`[data-field="${key}"]`) as
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (!el) {
        skipped.push(key);
        continue;
      }
      el.value = String(value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      filled.push(key);
    }
    return { ok: true, formId, filled, skipped };
  }

  return {
    navigate_to_page,
    navigate_to_section,
    open_product,
    navigate_to_product_section,
    open_form,
    fill_form,
  };
}

export type ActionDispatcher = ReturnType<typeof createActionDispatcher>;
