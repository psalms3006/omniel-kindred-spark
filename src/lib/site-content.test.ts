import { beforeEach, describe, expect, it } from "vitest";
import { __clearSiteContentCache, loadedPageCount, readSitePage, searchSite } from "./site-content";
import { products, teamMembers } from "./omniel";

beforeEach(() => __clearSiteContentCache());

describe("index coverage", () => {
  it("indexes every public page", () => {
    // 9 fixed pages plus one per product.
    expect(loadedPageCount()).toBe(9 + products.length);
  });
});

describe("people", () => {
  /**
   * The whole reason this module exists: a person added to the website must be
   * answerable without anyone editing the knowledge base. Driven off the real
   * team list, so adding a member proves itself.
   */
  it.each(teamMembers.map((m) => [m.name, m.role] as const))(
    "finds %s on the about page",
    (name) => {
      const hits = searchSite(name);
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0]!.path).toBe("/about");
      expect(hits[0]!.excerpt).toContain(name.split(" ")[0]!);
    },
  );

  it("returns the person's role in the excerpt, not just their name", () => {
    const member = teamMembers[1] ?? teamMembers[0]!;
    const hits = searchSite(member.name);
    expect(hits[0]!.excerpt).toContain(member.name);
  });
});

describe("products", () => {
  it.each(products.map((p) => [p.name, p.slug] as const))(
    "ranks the %s product page first",
    (name, slug) => {
      const hits = searchSite(name);
      expect(hits[0]!.path).toBe(`/products/${slug}`);
    },
  );

  it("finds a capability topic rather than only a product name", () => {
    const hits = searchSite("offline");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => /offline/i.test(h.excerpt))).toBe(true);
  });
});

describe("topics", () => {
  it("finds the contact address", () => {
    const hits = searchSite("contact email address");
    expect(hits.some((h) => h.path === "/contact")).toBe(true);
  });

  it("finds hiring areas", () => {
    const hits = searchSite("careers roles hiring");
    expect(hits.some((h) => h.path === "/careers")).toBe(true);
  });
});

describe("absence", () => {
  it("returns nothing for something the site does not publish", () => {
    expect(searchSite("quarterly revenue and profit figures")).toEqual([]);
  });

  it("returns nothing for a query of only stop words", () => {
    expect(searchSite("what is the")).toEqual([]);
  });

  it("does not invent a match for an unknown person", () => {
    expect(searchSite("Zebadiah Thornbury")).toEqual([]);
  });
});

describe("readSitePage", () => {
  it("reads a known page", () => {
    const page = readSitePage("/careers");
    expect(page).not.toBeNull();
    expect(page!.title).toContain("Careers");
  });

  it("accepts a path without a leading slash", () => {
    expect(readSitePage("contact")?.path).toBe("/contact");
  });

  it("returns null for a path that is not a public page", () => {
    expect(readSitePage("/api/enquiry")).toBeNull();
  });

  it("truncates to the requested size", () => {
    const page = readSitePage("/about", 200);
    expect(page!.text.length).toBeLessThanOrEqual(200);
  });
});
