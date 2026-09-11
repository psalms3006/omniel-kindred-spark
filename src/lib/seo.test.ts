import { describe, expect, it } from "vitest";
import { absoluteUrl, pageHead } from "./seo";
import { siteUrl, products } from "./omniel";

/**
 * The site previously shipped `rel="canonical"` pointing at the homepage on
 * every single page — verified live on /about, /products, /products/nova and
 * /research. That instructs search engines to drop every page but the
 * homepage from the index, and nothing in the rendered page reveals it.
 *
 * These tests exist so that never silently returns.
 */

const canonicalOf = (head: ReturnType<typeof pageHead>) =>
  head.links?.find((l) => l.rel === "canonical")?.href;

const metaOf = (head: ReturnType<typeof pageHead>, key: string) =>
  head.meta.find((m) => m["property"] === key || m["name"] === key)?.["content"];

describe("absoluteUrl", () => {
  it("maps the site root to the bare origin, with no trailing slash", () => {
    expect(absoluteUrl("/")).toBe(siteUrl.replace(/\/+$/, ""));
  });

  it("joins a path without doubling or dropping the slash", () => {
    expect(absoluteUrl("/about")).toBe(`${siteUrl}/about`);
    expect(absoluteUrl("about")).toBe(`${siteUrl}/about`);
  });

  it("never produces a double slash", () => {
    expect(absoluteUrl("//about")).not.toContain(".ng//");
  });
});

describe("pageHead canonical", () => {
  it("points at the page's own URL, not the homepage", () => {
    expect(canonicalOf(pageHead({ path: "/about", title: "A", description: "B" }))).toBe(
      `${siteUrl}/about`,
    );
  });

  it("gives the homepage the bare origin", () => {
    expect(canonicalOf(pageHead({ path: "/", title: "A", description: "B" }))).toBe(siteUrl);
  });

  it("gives every product page a distinct canonical", () => {
    const urls = products.map((p) =>
      canonicalOf(pageHead({ path: `/products/${p.slug}`, title: p.name, description: "x" }))!,
    );
    expect(new Set(urls).size).toBe(products.length);
    for (const u of urls) expect(u).not.toBe(siteUrl);
  });

  it("omits the canonical entirely on a noindex page", () => {
    const head = pageHead({ path: "/products", title: "x", description: "y", noindex: true });
    expect(head.links).toBeUndefined();
    expect(metaOf(head, "robots")).toContain("noindex");
  });
});

describe("pageHead social metadata", () => {
  it("sets og:url per page, so a shared link does not preview as the homepage", () => {
    const head = pageHead({ path: "/research", title: "R", description: "D" });
    expect(metaOf(head, "og:url")).toBe(`${siteUrl}/research`);
  });

  it("falls back to the page title and description for social tags", () => {
    const head = pageHead({ path: "/x", title: "T", description: "D" });
    expect(metaOf(head, "og:title")).toBe("T");
    expect(metaOf(head, "twitter:description")).toBe("D");
  });

  it("prefers explicit social overrides when given", () => {
    const head = pageHead({
      path: "/x",
      title: "T",
      description: "D",
      ogTitle: "OG",
      ogDescription: "OGD",
    });
    expect(metaOf(head, "og:title")).toBe("OG");
    expect(metaOf(head, "og:description")).toBe("OGD");
  });

  it("resolves a root-relative image to an absolute URL", () => {
    // Social crawlers do not resolve relative image paths.
    const head = pageHead({ path: "/x", title: "T", description: "D", image: "/nova-mark.png" });
    expect(metaOf(head, "og:image")).toBe(`${siteUrl}/nova-mark.png`);
  });

  it("leaves an already-absolute image untouched", () => {
    const head = pageHead({
      path: "/x",
      title: "T",
      description: "D",
      image: "https://cdn.example.com/a.png",
    });
    expect(metaOf(head, "og:image")).toBe("https://cdn.example.com/a.png");
  });

  it("always supplies a default image so no page shares without a preview", () => {
    expect(metaOf(pageHead({ path: "/x", title: "T", description: "D" }), "og:image")).toBe(
      `${siteUrl}/og-image.png`,
    );
  });
});
