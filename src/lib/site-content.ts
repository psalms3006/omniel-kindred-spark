import {
  careerAreas,
  contactEmail,
  futureDirections,
  location,
  partnershipAreas,
  positioning,
  principles,
  products,
  teamMembers,
  technologyDirections,
} from "./omniel";

/**
 * A searchable view of everything the website publishes.
 *
 * The point is that the knowledge base should not need rewriting every time
 * the site changes. Add a team member or a product capability to
 * `src/lib/omniel.ts`, deploy, and the assistant can answer about it
 * immediately, with no second copy to keep in sync.
 *
 * Built from the content module rather than by fetching the rendered pages.
 * That was the first approach and it cannot work: a Cloudflare Worker cannot
 * fetch its own origin, so every request came back with zero readable pages.
 * Reading the source data is better regardless. It needs no network, cannot
 * loop, costs no subrequests, adds no latency to a spoken reply, and is
 * exactly in step with what is deployed, because it ships in the same bundle.
 *
 * The answer order the assistant follows is set in the tool description:
 *   1. this content, for anything the site publishes;
 *   2. the knowledge base, for background the site does not carry;
 *   3. an explicit "that is not public", when neither has it.
 */

export type SitePage = { path: string; title: string; text: string };
export type SiteSearchHit = { path: string; title: string; excerpt: string };

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "with",
  "about",
  "as",
  "by",
  "from",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "what",
  "who",
  "whom",
  "which",
  "when",
  "where",
  "why",
  "how",
  "do",
  "does",
  "did",
  "can",
  "could",
  "would",
  "should",
  "tell",
  "me",
  "you",
  "your",
  "i",
  "we",
  "us",
  "our",
  "they",
  "them",
  "their",
  "please",
  "there",
  "has",
  "have",
  "had",
  "any",
  "more",
  "much",
  "many",
  "know",
  "said",
  "say",
  "says",
  "give",
  "get",
  "got",
  "use",
  "used",
  "also",
]);

function join(...parts: (string | undefined)[]): string {
  return parts.filter((p) => p && p.trim()).join(" ");
}

/**
 * Built once per isolate. The inputs are compile-time constants, so there is
 * nothing to invalidate and no TTL to reason about.
 */
let pagesCache: SitePage[] | null = null;

/** Test seam. */
export function __clearSiteContentCache(): void {
  pagesCache = null;
}

function buildPages(): SitePage[] {
  const pages: SitePage[] = [];

  pages.push({
    path: "/",
    title: "OMNIEL: Intelligence without borders",
    text: join(
      positioning.headline,
      positioning.lede,
      positioning.belief,
      `OMNIEL is based in ${location}.`,
      `The flagship product is NOVA. The wider ecosystem is ${products.map((p) => p.name).join(", ")}.`,
    ),
  });

  pages.push({
    path: "/about",
    title: "About OMNIEL",
    text: join(
      positioning.lede,
      positioning.belief,
      `OMNIEL is based in ${location}.`,
      "OMNIEL's principles:",
      principles.map((p) => `${p.title}. ${p.body}`).join(" "),
      "The OMNIEL team:",
      // Each member is written as a small self-contained paragraph so a match
      // on a name returns that person rather than a slice of their neighbour.
      teamMembers
        .map((m) =>
          join(
            `${m.name} is ${m.role} at OMNIEL (${m.relationship}).`,
            m.tagline,
            m.bio,
            `Focus: ${m.focus}`,
            `Areas: ${m.areas.join(", ")}.`,
          ),
        )
        .join(" "),
    ),
  });

  pages.push({
    path: "/products",
    title: "OMNIEL products",
    text: join(
      "The OMNIEL ecosystem.",
      products
        .map((p) =>
          join(
            `${p.name} is OMNIEL's ${p.role.toLowerCase()} (${p.kind}). Status: ${p.status}.`,
            p.statement,
            p.summary,
          ),
        )
        .join(" "),
    ),
  });

  for (const p of products) {
    pages.push({
      path: `/products/${p.slug}`,
      title: `${p.name}: ${p.role}`,
      text: join(
        `${p.name} is OMNIEL's ${p.role.toLowerCase()}. Kind: ${p.kind}. Status: ${p.status}. Priority: ${p.priority}.`,
        p.statement,
        p.summary,
        `Who it is for: ${p.audience.join(", ")}.`,
        "Capabilities:",
        p.capabilities.map((c) => `${c.title}. ${c.body}`).join(" "),
        p.notes.join(" "),
      ),
    });
  }

  pages.push({
    path: "/technology",
    title: "OMNIEL technology",
    text: join(
      "The technical directions OMNIEL is developing.",
      technologyDirections.map((d) => `${d.title} (${d.stage}). ${d.body}`).join(" "),
    ),
  });

  pages.push({
    path: "/research",
    title: "OMNIEL research and future directions",
    text: join(
      "Where OMNIEL intends to go, stated as ambition rather than current capability.",
      futureDirections.map((d) => `${d.title}. ${d.body}`).join(" "),
    ),
  });

  pages.push({
    path: "/careers",
    title: "Careers at OMNIEL",
    text: join(
      "OMNIEL is early-stage and open to people who want to build with it.",
      `Areas of interest: ${careerAreas.join(", ")}.`,
      "Interest is registered through the careers form on the website.",
    ),
  });

  pages.push({
    path: "/contact",
    title: "Contact OMNIEL",
    text: join(
      `OMNIEL can be reached at ${contactEmail}.`,
      `Partnership areas: ${partnershipAreas.join(", ")}.`,
      "General enquiries, partnership enquiries and support or investment interest are all handled through the contact page.",
    ),
  });

  pages.push({
    path: "/privacy",
    title: "OMNIEL privacy notice",
    text: "The privacy notice covers what the website collects, how enquiries are stored and emailed, the voice assistant's handling of audio and conversation summaries, the cookieless analytics in use, and who else receives data.",
  });

  pages.push({
    path: "/terms",
    title: "OMNIEL terms",
    text: "The terms page covers the conditions of using the OMNIEL website.",
  });

  return pages;
}

function getPages(): SitePage[] {
  if (!pagesCache) pagesCache = buildPages();
  return pagesCache;
}

function terms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function countOccurrences(haystack: string, needle: string): number {
  let n = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    n += 1;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return n;
}

/** Builds a readable window around the strongest match rather than the page head. */
function excerptAround(text: string, queryTerms: string[], size = 700): string {
  if (text.length <= size) return text;
  const lower = text.toLowerCase();
  let best = -1;
  let bestScore = 0;

  for (let i = 0; i < lower.length; i += 100) {
    const window = lower.slice(i, i + size);
    let score = 0;
    for (const t of queryTerms) score += countOccurrences(window, t);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }

  if (best === -1) return text.slice(0, size).trim();
  const start = Math.max(0, best - 60);
  const slice = text.slice(start, start + size).trim();
  return (start > 0 ? "... " : "") + slice + (start + size < text.length ? " ..." : "");
}

/**
 * Searches the published content.
 *
 * Term-frequency scoring, not embeddings. The corpus is one company's own
 * writing across a dozen pages, where the signal is almost always a literal
 * name or product word ("Wisdom", "offline", "KIWI"). Embeddings would add an
 * API dependency, latency and a second failure mode for no gain at this size.
 */
export function searchSite(query: string, limit = 3): SiteSearchHit[] {
  const queryTerms = terms(query);
  if (queryTerms.length === 0) return [];

  const scored = getPages().map((page) => {
    const haystack = `${page.title} ${page.text}`.toLowerCase();
    const titleLower = page.title.toLowerCase();
    let score = 0;
    for (const t of queryTerms) {
      score += countOccurrences(haystack, t);
      // A term in the title outranks another passing mention in the body.
      if (titleLower.includes(t)) score += 4;
    }
    return { page, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ page }) => ({
      path: page.path,
      title: page.title,
      excerpt: excerptAround(page.text, queryTerms),
    }));
}

/** Reads one page in full, for "what does the careers page say" style asks. */
export function readSitePage(path: string, maxChars = 4000): SitePage | null {
  const wanted = path.startsWith("/") ? path : `/${path}`;
  const page = getPages().find((p) => p.path === wanted);
  if (!page) return null;
  return { ...page, text: page.text.slice(0, maxChars) };
}

/** Operational signal: how many pages the index holds. */
export function loadedPageCount(): number {
  return getPages().length;
}

export const SITE_CONTENT_ROUTES = [
  "/",
  "/about",
  "/products",
  "/products/nova",
  "/products/vyren",
  "/products/arvo",
  "/products/kiwi",
  "/technology",
  "/research",
  "/careers",
  "/contact",
  "/privacy",
  "/terms",
] as const;
