/**
 * Per-page SEO metadata.
 *
 * WHY THIS EXISTS
 *
 * The root route declared a single `rel="canonical"` pointing at the site
 * root, and no child route overrode it. Because TanStack Router merges the
 * root's `links` into every page, that shipped `<link rel="canonical"
 * href="https://omniel.com.ng">` on *every* URL — verified live on /about,
 * /products, /products/nova and /research.
 *
 * A canonical tag is an instruction, not a hint: it tells search engines that
 * the current URL is a duplicate of the one named, and that the named one is
 * the version to index. Pointing every page at the homepage therefore asks
 * Google to drop the entire site except the homepage from its index — the
 * exact opposite of the discoverability the site needs, and invisible in the
 * rendered page.
 *
 * `og:url` had the same defect, so every shared link previewed as the
 * homepage regardless of what was actually shared.
 *
 * Every route now builds its head through `pageHead()`, which requires a
 * path. Getting a canonical wrong is now a type error rather than a silent
 * de-indexing.
 */
import { siteUrl } from "./omniel";

export type PageHeadInput = {
  /** Site-root-relative path, with a leading slash. "/" for the homepage. */
  path: string;
  title: string;
  description: string;
  /** Defaults to `title` — set when the social title should read differently. */
  ogTitle?: string;
  /** Defaults to `description`. */
  ogDescription?: string;
  /** Absolute or root-relative image URL. Defaults to the site OG image. */
  image?: string;
  /** "website" for ordinary pages, "article" where genuinely appropriate. */
  ogType?: "website" | "article";
  /** Set for pages that must not be indexed (e.g. an unknown product slug). */
  noindex?: boolean;
};

/** Join the site origin with a path, tolerating a missing or doubled slash. */
export function absoluteUrl(path: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  if (!path || path === "/") return base;
  return `${base}/${path.replace(/^\/+/, "")}`;
}

export function pageHead(input: PageHeadInput) {
  const url = absoluteUrl(input.path);
  const image = input.image
    ? input.image.startsWith("http")
      ? input.image
      : absoluteUrl(input.image)
    : absoluteUrl("/og-image.png");

  const meta: Array<Record<string, string>> = [
    { title: input.title },
    { name: "description", content: input.description },
    { property: "og:title", content: input.ogTitle ?? input.title },
    { property: "og:description", content: input.ogDescription ?? input.description },
    { property: "og:url", content: url },
    { property: "og:type", content: input.ogType ?? "website" },
    { property: "og:image", content: image },
    { name: "twitter:title", content: input.ogTitle ?? input.title },
    { name: "twitter:description", content: input.ogDescription ?? input.description },
    { name: "twitter:image", content: image },
  ];

  if (input.noindex) {
    // A page we do not want indexed must also not claim to be canonical for
    // anything, so the canonical link is deliberately omitted below.
    meta.push({ name: "robots", content: "noindex, follow" });
    return { meta };
  }

  return { meta, links: [{ rel: "canonical", href: url }] };
}
