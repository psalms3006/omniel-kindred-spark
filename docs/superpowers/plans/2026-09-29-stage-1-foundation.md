# Stage 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the whole OMNIEL site its new "light & air" design system and "calm physics" motion system, so every existing page immediately renders in the new language and later stages build on shared tokens and primitives.

**Architecture:** Design tokens live in `src/styles.css` (CSS custom properties, with the shadcn semantic tokens remapped onto them so `src/components/ui/*` keeps working). Motion tokens and the reduced-motion hook live in `src/lib/motion.ts`; every animated component takes its springs from there. Motion primitives live in `src/components/motion/`. The global shell (nav, footer, voice button, filter bar) is restyled on top of both. Pure decision logic (nav mode, parallax distance, pointer position, audio-level scale, contrast) is kept in small functions with unit tests; React components stay thin.

**Tech Stack:** TanStack Start/Router, React 19, Tailwind v4, `motion` 12 (`motion/react`), `lenis` 1.3, `livekit-client`, vitest (+ jsdom for DOM tests).

**Spec:** `docs/superpowers/specs/2026-09-29-omniel-redesign-design.md` (§2, §3, §4, §9–§11 for this stage).

## Global Constraints

- Every existing piece of copy stays byte-for-byte unchanged. This stage changes presentation only.
- Animate only `transform` and `opacity`; `filter: blur()` only during a title's entrance.
- Every spring or duration comes from `src/lib/motion.ts` (`settle`, `respond`, `drift`, `reducedFade`). No component defines its own.
- Reduced motion (`prefers-reduced-motion: reduce`): entrances become a 150ms opacity fade, no parallax, no smooth scroll, no looping motion.
- Text contrast ≥ 4.5:1 against `--paper`; focus rings ≥ 3:1.
- Light-first only: no `dark:` variants and no dark theme toggle.
- Product colour is only ever read through `var(--light)` / `var(--light-text)`, set by `data-light="nova|vyren|arvo|kiwi"`; `:root` defaults to NOVA.
- Initial JavaScript may grow by about 15KB at most. `lenis` is loaded with a dynamic `import()`, only when smooth scrolling is enabled.
- The tsconfig is strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`); all code must typecheck under it.
- Work on branch `redesign/stage-1-foundation`. Nothing in this stage is promoted to production; the stage ends with a preview upload.

## Review Focus

1. **Content never stays invisible.** If IntersectionObserver never fires (restored scroll, zero-height layout pass, old browser), revealed content must still appear within 1s. Pinned by the failsafe test in Task 3.
2. **Reduced motion is honoured everywhere, not just in CSS.** JS-driven motion (reveals, parallax, Lenis, the voice dot's breathing) must check the preference. Pinned by `usePrefersReducedMotion` tests (Task 1), the reveal reduced-motion test (Task 3) and the `shouldSmoothScroll` test (Task 5).
3. **Muted and product-coloured text stays readable on paper.** Every product's text tone and `--ink-muted` must pass 4.5:1. Pinned by the contrast test in Task 2.
4. **The nav never hides while it's in use.** Near the top, with the mobile menu open, or with keyboard focus inside it, it must stay visible. Pinned by the `navModeFor` tests in Task 6.
5. **Filter popovers keep their product colour.** The popover is portalled to `<body>`, outside any `data-light` section, so it must copy the anchor's `data-light`. Pinned by the portal test in Task 9.

---

## File structure

| File | Responsibility | Task |
|---|---|---|
| `src/lib/motion.ts` | motion tokens, reveal timing, `usePrefersReducedMotion` | 1 |
| `src/lib/motion.test.ts` | spring damping ratios, reveal timing, reduced-motion hook | 1 |
| `src/test/dom.tsx` | jsdom render helper and browser stubs for tests | 1 |
| `src/styles.css` | colour, type, surface tokens; `glass`; product light; view transitions; Lenis rules | 2 |
| `src/styles.test.ts` | parses `styles.css`, checks contrast of text tokens | 2 |
| `src/router.tsx` | enable view transitions | 2 |
| `src/components/motion/reveal.tsx` | `useRevealState`, `Reveal`, `RevealGroup`, `RevealItem`, `REVEAL_FAILSAFE_MS` | 3 |
| `src/components/motion/split-title.tsx` | word-by-word accessible headline reveal | 3 |
| `src/components/motion/reveal.test.tsx` | failsafe, reduced motion, SplitTitle accessibility | 3 |
| `src/components/motion/parallax.tsx` | `Parallax`, `parallaxDistance` | 4 |
| `src/components/motion/pointer.tsx` | `pointerPercent`, `usePointerLight`, `Magnetic` | 4 |
| `src/components/motion/motion-utils.test.ts` | `parallaxDistance`, `pointerPercent` | 4 |
| `src/components/site/primitives.tsx` | `Reveal` re-export, `Panel`, `ActionLink`, `Section`, `PageHero` restyled | 4 |
| `src/components/site/atmosphere.tsx` | light-mode ambient light | 4 |
| `src/components/motion/smooth-scroll.tsx` | `SmoothScroll`, `shouldSmoothScroll` | 5 |
| `src/components/motion/smooth-scroll.test.ts` | `shouldSmoothScroll` | 5 |
| `src/components/motion/index.ts` | barrel export | 5 |
| `src/routes/__root.tsx` | mount `SmoothScroll` | 5 |
| `src/components/site/nav-mode.ts` | `navModeFor`, `NavMode`, `INITIAL_NAV_MODE` | 6 |
| `src/components/site/nav-mode.test.ts` | nav mode rules | 6 |
| `src/components/site/site-nav.tsx` | glass nav | 6 |
| `src/components/site/site-footer.tsx` | footer restyle | 7 |
| `src/lib/voice/audio-level.ts` | `levelToScale` | 8 |
| `src/lib/voice/audio-level.test.ts` | `levelToScale` | 8 |
| `src/components/site/livekit-widget.tsx` | voice button restyle | 8 |
| `src/components/ui/filter-token-bar.tsx` | token restyle, `data-light` on the portal | 9 |
| `src/components/ui/filter-token-bar.test.tsx` | palette check, portal colour | 9 |
| `docs/superpowers/specs/2026-09-29-omniel-redesign-design.md` | correct `settle` damping to 27 | 1 |

---

### Task 1: Motion tokens and the reduced-motion hook

**Files:**
- Create: `src/lib/motion.ts`, `src/lib/motion.test.ts`, `src/test/dom.tsx`
- Modify: `docs/superpowers/specs/2026-09-29-omniel-redesign-design.md` (§3.1 table: `damping 26` → `damping 27`)

**Interfaces:**
- Produces: `settle`, `respond`, `drift`, `reducedFade` (motion `Transition` objects); `REVEAL_STAGGER = 0.06`; `revealDepths`, `type RevealDepth = "light" | "surface" | "title" | "body" | "action"`; `revealDelay(depth: RevealDepth, base?: number): number`; `dampingRatio(t: { stiffness: number; damping: number; mass: number }): number`; `usePrefersReducedMotion(): boolean`.
- Produces (test helper): `render(ui: ReactNode): Promise<{ container: HTMLElement; unmount(): Promise<void> }>`, `stubBrowser(opts?: { reducedMotion?: boolean; coarsePointer?: boolean }): void`.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b redesign/stage-1-foundation
```

- [ ] **Step 2: Write the test helper** `src/test/dom.tsx`

```tsx
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

/**
 * Minimal DOM render helper for jsdom tests. The project does not use
 * Testing Library; this is the smallest thing that renders, flushes effects
 * inside act(), and cleans up.
 */
export async function render(ui: ReactNode) {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(ui);
  });
  return {
    container,
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

/** jsdom has neither matchMedia nor IntersectionObserver; motion code needs both. */
export function stubBrowser({
  reducedMotion = false,
  coarsePointer = false,
}: { reducedMotion?: boolean; coarsePointer?: boolean } = {}) {
  window.matchMedia = ((query: string) => ({
    matches:
      (query.includes("prefers-reduced-motion") && reducedMotion) ||
      (query.includes("pointer: coarse") && coarsePointer),
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  // Never fires: tests that need "in view" must not rely on it, which is
  // exactly the condition the reveal failsafe exists for.
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}
```

- [ ] **Step 3: Write the failing tests** `src/lib/motion.test.ts`

```ts
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { render, stubBrowser } from "@/test/dom";
import {
  REVEAL_STAGGER,
  dampingRatio,
  respond,
  revealDelay,
  settle,
  usePrefersReducedMotion,
} from "./motion";

describe("motion tokens", () => {
  it("settle never overshoots (critically damped or more)", () => {
    expect(dampingRatio(settle)).toBeGreaterThanOrEqual(1);
  });

  it("respond has a hint of life but stays controlled", () => {
    const ratio = dampingRatio(respond);
    expect(ratio).toBeGreaterThan(0.8);
    expect(ratio).toBeLessThan(1);
  });

  it("orders reveal depths 60ms apart, from the given base", () => {
    expect(REVEAL_STAGGER).toBe(0.06);
    expect(revealDelay("light")).toBe(0);
    expect(revealDelay("title")).toBeCloseTo(0.12);
    expect(revealDelay("action", 0.2)).toBeCloseTo(0.44);
  });
});

function Probe() {
  return <span>{usePrefersReducedMotion() ? "reduced" : "full"}</span>;
}

describe("usePrefersReducedMotion", () => {
  let cleanup: (() => Promise<void>) | undefined;
  afterEach(async () => {
    await cleanup?.();
  });

  it("reports the user's reduced-motion preference", async () => {
    stubBrowser({ reducedMotion: true });
    const view = await render(<Probe />);
    cleanup = view.unmount;
    expect(view.container.textContent).toBe("reduced");
  });

  it("defaults to full motion", async () => {
    stubBrowser();
    const view = await render(<Probe />);
    cleanup = view.unmount;
    expect(view.container.textContent).toBe("full");
  });
});
```

Rename the file to `src/lib/motion.test.tsx` (it contains JSX).

- [ ] **Step 4: Run to see it fail**

Run: `npx vitest run src/lib/motion.test.tsx`
Expected: FAIL — cannot resolve `./motion`.

- [ ] **Step 5: Implement** `src/lib/motion.ts`

```ts
import { useEffect, useState } from "react";

/**
 * OMNIEL's motion vocabulary. Every animation on the site takes its timing
 * from here, which is what makes motion feel like one system rather than a
 * collection of effects. Do not define springs or durations in components.
 */

/** Soft, critically damped: things arriving and settling into place. */
export const settle = { type: "spring", stiffness: 170, damping: 27, mass: 1 } as const;

/** Quick and firm with a hint of life: responses to the visitor's hand. */
export const respond = { type: "spring", stiffness: 520, damping: 32, mass: 0.6 } as const;

/** Slow, continuous, ambient: light, breathing, parallax. */
export const drift = { duration: 9, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" } as const;

/** What every entrance becomes under reduced motion. */
export const reducedFade = { duration: 0.15, ease: "linear" } as const;

/** Layered reveals: each depth enters this long after the one before. */
export const REVEAL_STAGGER = 0.06;
export const revealDepths = ["light", "surface", "title", "body", "action"] as const;
export type RevealDepth = (typeof revealDepths)[number];

export function revealDelay(depth: RevealDepth, base = 0): number {
  return base + revealDepths.indexOf(depth) * REVEAL_STAGGER;
}

/** ≥ 1 means no overshoot; below 1 the spring rings. */
export function dampingRatio(t: { stiffness: number; damping: number; mass: number }): number {
  return t.damping / (2 * Math.sqrt(t.stiffness * t.mass));
}

/**
 * Our own hook rather than motion's `useReducedMotion`, which caches the
 * preference module-wide on first read. This one follows live changes and is
 * testable.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}
```

- [ ] **Step 6: Run to see it pass**

Run: `npx vitest run src/lib/motion.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 7: Correct the spec** — in `docs/superpowers/specs/2026-09-29-omniel-redesign-design.md` §3.1, change `stiffness 170, damping 26, mass 1 (no overshoot)` to `stiffness 170, damping 27, mass 1 (no overshoot; 26 rings slightly)`.

- [ ] **Step 8: Commit**

```bash
git add src/lib/motion.ts src/lib/motion.test.tsx src/test/dom.tsx docs/superpowers/specs/2026-09-29-omniel-redesign-design.md
git commit -m "Add OMNIEL motion tokens and a reduced-motion hook"
```

---

### Task 2: Light & air design tokens

**Files:**
- Modify: `src/styles.css` (replace the whole `:root` block, `.mark-silver`, `eyebrow`, `panel`, `panel-strong`, base layer; add new utilities and rules)
- Modify: `src/router.tsx`
- Create: `src/styles.test.ts`

**Interfaces:**
- Produces CSS custom properties: `--paper`, `--paper-deep`, `--ink`, `--ink-muted`, `--night`, `--light-{nova,vyren,arvo,kiwi}`, `--light-text-{nova,vyren,arvo,kiwi}`, `--light`, `--light-text`, and all existing shadcn tokens remapped.
- Produces utilities/classes: `glass`, `mark-ink`, `display-hero`, `display-section`; keeps `shell`, `eyebrow`, `panel`, `panel-strong`, `text-balance-tight`, `hairline-t`, `lab-grid`, `lab-rule`.
- Produces: `[data-light="…"]` selectors that set `--light` and `--light-text`.

- [ ] **Step 1: Write the failing contrast test** `src/styles.test.ts`

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(__dirname, "styles.css"), "utf8");

function token(name: string): [number, number, number] {
  const match = css.match(new RegExp(`--${name}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\)`));
  if (!match) throw new Error(`token --${name} missing or not a plain oklch() value`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** OKLCH → relative luminance (WCAG), via OKLab and linear sRGB. */
function luminance([l, c, h]: [number, number, number]): number {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const r = clamp(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_);
  const g = clamp(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_);
  const bl = clamp(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_);
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

function contrast(fg: string, bg: string): number {
  const [hi, lo] = [luminance(token(fg)), luminance(token(bg))].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe("design tokens", () => {
  it("body and muted text are readable on paper", () => {
    expect(contrast("ink", "paper")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("ink-muted", "paper")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("ink-muted", "paper-deep")).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["nova", "vyren", "arvo", "kiwi"])("%s text tone is readable on paper", (product) => {
    expect(contrast(`light-text-${product}`, "paper")).toBeGreaterThanOrEqual(4.5);
  });

  it("defines a data-light scope for every product", () => {
    for (const product of ["nova", "vyren", "arvo", "kiwi"]) {
      expect(css).toContain(`[data-light="${product}"]`);
    }
  });

  it("ships no dark-theme variant", () => {
    expect(css).not.toMatch(/@custom-variant dark/);
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run src/styles.test.ts`
Expected: FAIL — `token --paper missing`.

- [ ] **Step 3: Replace the tokens in `src/styles.css`**

Delete line 5 (`@custom-variant dark (&:is(.dark *));`). In the `@theme inline` block add these lines after `--color-ember: var(--ember);`:

```css
  --color-paper: var(--paper);
  --color-paper-deep: var(--paper-deep);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-night: var(--night);
  --color-light: var(--light);
  --color-light-text: var(--light-text);
```

Replace the entire `:root { … }` block and the `.mark-silver` rule with:

```css
:root {
  --radius: 0.9rem;

  /* Light & air. Paper is warm, never #fff: large white areas read as
     screens, warm paper reads as a material. Ink is a blue-leaning graphite
     so text feels printed rather than black. */
  --paper: oklch(0.975 0.006 85);
  --paper-deep: oklch(0.95 0.008 85);
  --ink: oklch(0.22 0.012 250);
  --ink-muted: oklch(0.48 0.012 250);
  --night: oklch(0.14 0.01 250);

  /* Product light. The only saturated colour on the site, and it always
     means "this product". Glow tones light things; text tones are the same
     hue darkened to pass 4.5:1 on paper. NOVA is sampled from its mark. */
  --light-nova: oklch(0.56 0.12 240);
  --light-vyren: oklch(0.5 0.13 290);
  --light-arvo: oklch(0.72 0.12 70);
  --light-kiwi: oklch(0.7 0.1 130);
  --light-text-nova: oklch(0.5 0.12 240);
  --light-text-vyren: oklch(0.47 0.13 290);
  --light-text-arvo: oklch(0.5 0.1 65);
  --light-text-kiwi: oklch(0.48 0.08 135);
  --light: var(--light-nova);
  --light-text: var(--light-text-nova);

  /* shadcn semantic tokens, remapped so src/components/ui keeps working. */
  --background: var(--paper);
  --foreground: var(--ink);
  --card: oklch(1 0 0 / 62%);
  --card-foreground: var(--ink);
  --popover: oklch(0.99 0.004 85);
  --popover-foreground: var(--ink);
  --primary: var(--ink);
  --primary-foreground: var(--paper);
  --secondary: var(--paper-deep);
  --secondary-foreground: var(--ink);
  --muted: var(--paper-deep);
  --muted-foreground: var(--ink-muted);
  --accent: var(--light-text);
  --accent-foreground: var(--paper);
  --destructive: oklch(0.55 0.19 28);
  --destructive-foreground: var(--paper);
  --border: oklch(0.22 0.012 250 / 10%);
  --input: oklch(0.22 0.012 250 / 16%);
  --ring: var(--light-text);
  --surface: var(--paper-deep);
  --surface-strong: oklch(0.93 0.01 85);
  --hairline: oklch(0.22 0.012 250 / 10%);
  --ion: var(--light);
  --ember: var(--light-arvo);
  --motion-fast: 150ms;
  --motion-base: 300ms;
  --motion-slow: 700ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

[data-light="nova"] {
  --light: var(--light-nova);
  --light-text: var(--light-text-nova);
}
[data-light="vyren"] {
  --light: var(--light-vyren);
  --light-text: var(--light-text-vyren);
}
[data-light="arvo"] {
  --light: var(--light-arvo);
  --light-text: var(--light-text-arvo);
}
[data-light="kiwi"] {
  --light: var(--light-kiwi);
  --light-text: var(--light-text-kiwi);
}

/* The wordmark PNG is brushed silver, drawn for dark grounds. On paper it
   would vanish, so it is printed in ink instead. */
.mark-ink {
  filter: brightness(0) opacity(0.86);
}
```

Replace the `eyebrow`, `panel` and `panel-strong` utilities with:

```css
@utility eyebrow {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  line-height: 1.4;
  text-transform: uppercase;
}

@utility panel {
  background: var(--color-surface);
  border: 1px solid var(--color-hairline);
}

@utility panel-strong {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-hairline);
}

/* Floating glass. The highlight follows the pointer through --mx/--my
   (set by usePointerLight); at rest it sits above the top edge, like
   daylight from a window. */
@utility glass {
  background-color: oklch(1 0 0 / 62%);
  background-image: radial-gradient(
    28rem circle at var(--mx, 50%) var(--my, -30%),
    oklch(1 0 0 / 55%),
    transparent 60%
  );
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid oklch(1 0 0 / 70%);
  box-shadow:
    0 30px 80px -40px oklch(0.22 0.012 250 / 18%),
    inset 0 1px 0 oklch(1 0 0 / 80%);
}

@utility display-hero {
  font-family: var(--font-display);
  font-size: clamp(3.4rem, 8vw, 8.5rem);
  line-height: 0.92;
  letter-spacing: -0.05em;
}

@utility display-section {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 5vw, 5.5rem);
  line-height: 1;
  letter-spacing: -0.03em;
}
```

In `@layer base`, replace the `body` rule and the heading rule with:

```css
  body {
    min-width: 320px;
    background: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    font-size: 1.0625rem;
    line-height: 1.6;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-display);
    font-weight: 500;
    text-wrap: balance;
  }
  p {
    text-wrap: pretty;
  }
```

Append at the end of the file, before the reduced-motion block:

```css
/* Page transitions: the old page recedes, the new one rises. */
::view-transition-old(root) {
  animation: 200ms cubic-bezier(0.4, 0, 1, 1) both vt-recede;
}
::view-transition-new(root) {
  animation: 420ms cubic-bezier(0.16, 1, 0.3, 1) both vt-rise;
}
@keyframes vt-recede {
  to {
    opacity: 0;
    transform: scale(0.985);
  }
}
@keyframes vt-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

/* Lenis. Native smooth scrolling must be off while Lenis drives the page. */
html.lenis,
html.lenis body {
  height: auto;
  scroll-behavior: auto;
}
.lenis.lenis-stopped {
  overflow: clip;
}
.lenis [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.lenis.lenis-smooth iframe {
  pointer-events: none;
}
```

- [ ] **Step 4: Enable view transitions in `src/router.tsx`**

First confirm the option name: `grep -rn "defaultViewTransition" node_modules/@tanstack/router-core/dist/esm/router.d.ts`. Expected: a match. Then add `defaultViewTransition: true,` after `scrollRestoration: true,`.

- [ ] **Step 5: Run the tests and the typecheck**

Run: `npx vitest run src/styles.test.ts && npx tsc --noEmit -p .`
Expected: PASS (7 tests); tsc prints nothing.

- [ ] **Step 6: Remove remaining `dark:` classes** that now have no variant

Run: `grep -rln "dark:" src --include=*.tsx`. For each file outside `src/components/ui/filter-token-bar.tsx` (handled in Task 9) and outside the shadcn files in `src/components/ui/` (left as generated), delete every `dark:…` class token. Expected after: `grep -rn "dark:" src --include=*.tsx | grep -v "components/ui/"` prints nothing.

- [ ] **Step 7: Commit**

```bash
git add src/styles.css src/styles.test.ts src/router.tsx src
git commit -m "Introduce the light and air design tokens"
```

---

### Task 3: Reveal and SplitTitle

**Files:**
- Create: `src/components/motion/reveal.tsx`, `src/components/motion/split-title.tsx`, `src/components/motion/reveal.test.tsx`

**Interfaces:**
- Consumes: `settle`, `reducedFade`, `revealDelay`, `RevealDepth`, `usePrefersReducedMotion` from `@/lib/motion`.
- Produces:
  - `REVEAL_FAILSAFE_MS = 1000`
  - `useRevealState(ref: RefObject<Element | null>): { shown: boolean; reduced: boolean }`
  - `Reveal(props: { children: ReactNode; delay?: number; className?: string; as?: RevealTag })`: a single element that reveals itself (same API as today's `Reveal` in `primitives.tsx`).
  - `RevealGroup(props: { children: ReactNode; delay?: number; className?: string; as?: RevealTag })` and `RevealItem(props: { depth?: RevealDepth; children: ReactNode; className?: string; as?: RevealTag })`: layered entrances.
  - `type RevealTag = "div" | "section" | "li" | "span" | "header" | "p"`
  - `SplitTitle(props: { text: string; as?: "h1" | "h2" | "h3"; className?: string; delay?: number })`

- [ ] **Step 1: Write the failing tests** `src/components/motion/reveal.test.tsx`

```tsx
// @vitest-environment jsdom
import { act, useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, stubBrowser } from "@/test/dom";
import { REVEAL_FAILSAFE_MS, useRevealState } from "./reveal";
import { SplitTitle } from "./split-title";

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const { shown, reduced } = useRevealState(ref);
  return <div ref={ref}>{`${shown ? "shown" : "hidden"}/${reduced ? "reduced" : "full"}`}</div>;
}

describe("useRevealState", () => {
  let cleanup: (() => Promise<void>) | undefined;
  afterEach(async () => {
    await cleanup?.();
    vi.useRealTimers();
  });

  it("shows content after the failsafe even if the observer never fires", async () => {
    vi.useFakeTimers();
    stubBrowser();
    const view = await render(<Probe />);
    cleanup = view.unmount;
    expect(view.container.textContent).toBe("hidden/full");
    await act(async () => {
      vi.advanceTimersByTime(REVEAL_FAILSAFE_MS);
    });
    expect(view.container.textContent).toBe("shown/full");
  });

  it("reports reduced motion so entrances can fall back to a fade", async () => {
    stubBrowser({ reducedMotion: true });
    const view = await render(<Probe />);
    cleanup = view.unmount;
    expect(view.container.textContent).toContain("reduced");
  });
});

describe("SplitTitle", () => {
  it("keeps the headline as one readable string for assistive technology", async () => {
    stubBrowser();
    const view = await render(<SplitTitle as="h2" text="Intelligence without borders." />);
    const heading = view.container.querySelector("h2");
    expect(heading?.querySelector(".sr-only")?.textContent).toBe("Intelligence without borders.");
    const visual = heading?.querySelectorAll("[aria-hidden='true']") ?? [];
    expect(visual.length).toBe(3);
    await view.unmount();
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run src/components/motion/reveal.test.tsx`
Expected: FAIL — cannot resolve `./reveal`.

- [ ] **Step 3: Implement** `src/components/motion/reveal.tsx`

```tsx
import { motion, useInView } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { reducedFade, revealDelay, settle, usePrefersReducedMotion, type RevealDepth } from "@/lib/motion";

export type RevealTag = "div" | "section" | "li" | "span" | "header" | "p";

/**
 * How long an entrance may wait for IntersectionObserver before the content
 * is shown anyway. An entrance animation is an enhancement; the content is the
 * point, and a region stuck at opacity 0 is worse than no animation at all.
 */
export const REVEAL_FAILSAFE_MS = 1000;

export function useRevealState(ref: RefObject<Element | null>) {
  const inView = useInView(ref, { once: true, margin: "-12% 0px -8% 0px" });
  const reduced = usePrefersReducedMotion();
  const [forced, setForced] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setForced(true), REVEAL_FAILSAFE_MS);
    return () => clearTimeout(timer);
  }, []);
  return { shown: inView || forced, reduced };
}

const hiddenFor: Record<RevealDepth, Record<string, number | string>> = {
  light: { opacity: 0, scale: 1.02 },
  surface: { opacity: 0, y: 8 },
  title: { opacity: 0, y: 12, filter: "blur(6px)" },
  body: { opacity: 0, y: 8 },
  action: { opacity: 0, y: 8 },
};

const visibleFor: Record<RevealDepth, Record<string, number | string>> = {
  light: { opacity: 1, scale: 1 },
  surface: { opacity: 1, y: 0 },
  title: { opacity: 1, y: 0, filter: "blur(0px)" },
  body: { opacity: 1, y: 0 },
  action: { opacity: 1, y: 0 },
};

function animationFor(depth: RevealDepth, shown: boolean, reduced: boolean, base: number) {
  if (reduced) {
    return { initial: { opacity: 0 }, animate: { opacity: shown ? 1 : 0 }, transition: reducedFade };
  }
  return {
    initial: hiddenFor[depth],
    animate: shown ? visibleFor[depth] : hiddenFor[depth],
    transition: { ...settle, delay: revealDelay(depth, base) },
  };
}

/** A single element that reveals itself. Same API as the original Reveal. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: RevealTag;
}) {
  const ref = useRef<HTMLElement>(null);
  const { shown, reduced } = useRevealState(ref);
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      ref={ref as RefObject<HTMLDivElement>}
      className={className}
      {...animationFor("body", shown, reduced, delay)}
    >
      {children}
    </MotionTag>
  );
}

type GroupState = { shown: boolean; reduced: boolean; base: number };
const RevealContext = createContext<GroupState | null>(null);

/** Watches one region; its RevealItems enter in depth order when it is in view. */
export function RevealGroup({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: RevealTag;
}) {
  const ref = useRef<HTMLElement>(null);
  const { shown, reduced } = useRevealState(ref);
  const Tag = as;
  return (
    <RevealContext.Provider value={{ shown, reduced, base: delay }}>
      <Tag ref={ref as RefObject<never>} className={className}>
        {children}
      </Tag>
    </RevealContext.Provider>
  );
}

export function RevealItem({
  depth = "body",
  children,
  className,
  as = "div",
}: {
  depth?: RevealDepth;
  children: ReactNode;
  className?: string;
  as?: RevealTag;
}) {
  const group = useContext(RevealContext);
  const MotionTag = motion[as] as typeof motion.div;
  if (!group) return <MotionTag className={className}>{children}</MotionTag>;
  return (
    <MotionTag className={className} {...animationFor(depth, group.shown, group.reduced, group.base)}>
      {children}
    </MotionTag>
  );
}
```

- [ ] **Step 4: Implement** `src/components/motion/split-title.tsx`

```tsx
import { motion } from "motion/react";
import { useRef, type RefObject } from "react";
import { reducedFade, settle } from "@/lib/motion";
import { useRevealState } from "./reveal";

/**
 * A headline whose words rise into place from behind a mask. The full text is
 * in a visually hidden span, so assistive technology reads one sentence, not
 * a list of fragments; the animated words are aria-hidden.
 */
export function SplitTitle({
  text,
  as = "h2",
  className,
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { shown, reduced } = useRevealState(ref);
  const words = text.split(/\s+/).filter(Boolean);
  const Tag = as;

  return (
    <Tag ref={ref as RefObject<HTMLHeadingElement>} className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.1em] align-top">
            <motion.span
              className="inline-block"
              initial={reduced ? { opacity: 0 } : { y: "105%" }}
              animate={shown ? (reduced ? { opacity: 1 } : { y: "0%" }) : undefined}
              transition={reduced ? reducedFade : { ...settle, delay: delay + index * 0.03 }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
```

- [ ] **Step 5: Run to see it pass**

Run: `npx vitest run src/components/motion/reveal.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/motion/reveal.tsx src/components/motion/split-title.tsx src/components/motion/reveal.test.tsx
git commit -m "Add layered reveals and an accessible split headline"
```

---

### Task 4: Parallax, pointer light, and the restyled primitives

**Files:**
- Create: `src/components/motion/parallax.tsx`, `src/components/motion/pointer.tsx`, `src/components/motion/motion-utils.test.ts`
- Modify: `src/components/site/primitives.tsx` (entire file), `src/components/site/atmosphere.tsx` (entire file)

**Interfaces:**
- Consumes: `Reveal` from `./reveal`; `respond`, `usePrefersReducedMotion` from `@/lib/motion`.
- Produces: `parallaxDistance(speed: number, span?: number): number`; `Parallax(props: { speed?: number; children: ReactNode; className?: string })`; `pointerPercent(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }): { x: number; y: number }`; `usePointerLight<T extends HTMLElement>(): RefObject<T | null>`; `Magnetic(props: { children: ReactNode; className?: string })`.
- `primitives.tsx` keeps every existing export and signature (`Shell`, `Reveal`, `Eyebrow`, `SectionHeading`, `Section`, `Panel`, `ActionLink`, `PageHero`, `Stat`).

- [ ] **Step 1: Write the failing tests** `src/components/motion/motion-utils.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { parallaxDistance } from "./parallax";
import { pointerPercent } from "./pointer";

describe("parallaxDistance", () => {
  it("moves 10% slower than scroll at the default speed", () => {
    expect(parallaxDistance(0.9)).toBe(40);
  });
  it("never exceeds the calm range, whatever it is asked for", () => {
    expect(parallaxDistance(0.2)).toBe(60);
    expect(parallaxDistance(1.4)).toBe(20);
  });
});

describe("pointerPercent", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  it("maps a pointer to percentages of the element", () => {
    expect(pointerPercent(200, 100, rect)).toEqual({ x: 50, y: 50 });
  });
  it("clamps outside the element", () => {
    expect(pointerPercent(0, 400, rect)).toEqual({ x: 0, y: 100 });
  });
  it("centres on a zero-size element instead of dividing by zero", () => {
    expect(pointerPercent(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 50, y: 50 });
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run src/components/motion/motion-utils.test.ts`
Expected: FAIL — cannot resolve `./parallax`.

- [ ] **Step 3: Implement** `src/components/motion/parallax.tsx`

```tsx
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Pixels a layer travels across its scroll range. Speed is clamped to
 * 0.85–0.95: enough to read as depth, never enough to feel like motion
 * sickness.
 */
export function parallaxDistance(speed: number, span = 400): number {
  const clamped = Math.min(0.95, Math.max(0.85, speed));
  return Math.round((1 - clamped) * span);
}

export function Parallax({
  speed = 0.9,
  children,
  className,
}: {
  speed?: number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const distance = parallaxDistance(speed);
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} className={className} style={reduced ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Implement** `src/components/motion/pointer.tsx`

```tsx
import { motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { respond, usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function pointerPercent(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } {
  const clamp = (v: number) => Math.min(100, Math.max(0, v));
  const x = rect.width ? clamp(((clientX - rect.left) / rect.width) * 100) : 50;
  const y = rect.height ? clamp(((clientY - rect.top) / rect.height) * 100) : 50;
  return { x: Math.round(x), y: Math.round(y) };
}

/**
 * Makes a `glass` surface's highlight follow the pointer by setting --mx/--my.
 * One write per animation frame at most; nothing on touch devices.
 */
export function usePointerLight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.("(pointer: coarse)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      frame = 0;
      if (!last) return;
      const { x, y } = pointerPercent(last.clientX, last.clientY, el.getBoundingClientRect());
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return ref;
}

/** A small lift under the pointer and a press on click, on the `respond` spring. */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.span
      className={cn("inline-flex", className)}
      whileHover={reduced ? undefined : { y: -1.5 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={respond}
    >
      {children}
    </motion.span>
  );
}
```

- [ ] **Step 5: Run to see it pass**

Run: `npx vitest run src/components/motion/motion-utils.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Replace** `src/components/site/atmosphere.tsx`

```tsx
import { cn } from "@/lib/utils";

type Props = { className?: string; variant?: "hero" | "band"; intensity?: number };

/**
 * Ambient daylight behind a page's opening. The product's own light pools in
 * the upper right; a faint drafting grid fades out downward.
 */
export function Atmosphere({ className, variant = "hero", intensity = 1 }: Props) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
      style={{ opacity: intensity }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(${variant === "hero" ? "60% 55%" : "50% 45%"} at 82% 8%,` +
            " color-mix(in oklab, var(--light) 16%, transparent), transparent 70%)," +
            " radial-gradient(40% 40% at 8% 92%," +
            " color-mix(in oklab, var(--light) 6%, transparent), transparent 70%)",
        }}
      />
      <div className="lab-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}
```

- [ ] **Step 7: Replace** `src/components/site/primitives.tsx`

```tsx
import { Link } from "@tanstack/react-router";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { Magnetic, usePointerLight } from "@/components/motion/pointer";
import { cn } from "@/lib/utils";
import { Atmosphere } from "./atmosphere";

export { Reveal } from "@/components/motion/reveal";

export function Shell({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("shell", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
      <h2 className="text-3xl leading-[1.06] tracking-[-0.03em] sm:text-4xl md:text-5xl">{title}</h2>
      {lede ? (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

/** Section rhythm: 96px on phones, 160px on tablets, 208px on desktop. */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative py-24 md:py-40 lg:py-52", className)}>
      <Shell>{children}</Shell>
    </section>
  );
}

export function Panel({
  className,
  children,
  interactive = false,
  ...rest
}: ComponentProps<"div"> & { interactive?: boolean }) {
  const ref = usePointerLight<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        "glass rounded-3xl p-6 md:p-8",
        interactive &&
          "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

const actionBase =
  "group inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors duration-300";

export function ActionLink({
  to,
  href,
  params,
  children,
  variant = "primary",
  className,
}: {
  to?: string;
  href?: string;
  params?: Record<string, string>;
  children: ReactNode;
  variant?: "primary" | "ghost" | "quiet";
  className?: string;
}) {
  const styles = cn(
    actionBase,
    variant === "primary" &&
      "bg-primary px-6 py-3 text-primary-foreground shadow-[0_18px_40px_-22px_var(--color-ink)]",
    variant === "ghost" && "glass px-6 py-3 text-foreground",
    variant === "quiet" && "text-muted-foreground hover:text-foreground",
    className,
  );

  const inner = (
    <>
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </>
  );

  if (href) {
    return (
      <Magnetic>
        <a href={href} className={styles} target="_blank" rel="noreferrer">
          {inner}
        </a>
      </Magnetic>
    );
  }
  const LinkAny = Link as unknown as ComponentType<Record<string, unknown>>;
  return (
    <Magnetic>
      <LinkAny to={to ?? "/"} params={params} className={styles}>
        {inner}
      </LinkAny>
    </Magnetic>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden pb-16 pt-40 md:pb-24 md:pt-52">
      {/* Every page opens in the same daylight. PageHero is the one component
          every inner route renders its title through, so the environment
          lives here. */}
      <Atmosphere variant="band" intensity={0.9} />
      <Shell className="relative">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="display-section mt-6 max-w-4xl">{title}</h1>
          {lede ? (
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</p>
          ) : null}
          {children ? <div className="mt-10 flex flex-wrap gap-3">{children}</div> : null}
        </Reveal>
      </Shell>
    </header>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className="font-display text-3xl tracking-tight md:text-4xl">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
```

- [ ] **Step 8: Typecheck and run all tests**

Run: `npx tsc --noEmit -p . && npx vitest run`
Expected: tsc prints nothing; all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/motion/parallax.tsx src/components/motion/pointer.tsx src/components/motion/motion-utils.test.ts src/components/site/primitives.tsx src/components/site/atmosphere.tsx
git commit -m "Add parallax and pointer light, restyle the shared primitives"
```

---

### Task 5: Smooth scrolling

**Files:**
- Create: `src/components/motion/smooth-scroll.tsx`, `src/components/motion/smooth-scroll.test.ts`, `src/components/motion/index.ts`
- Modify: `src/routes/__root.tsx` (mount `<SmoothScroll />` inside `RootComponent`, before `<SiteNav />`), `package.json` (add `lenis`)

**Interfaces:**
- Produces: `shouldSmoothScroll(env: { reducedMotion: boolean; coarsePointer: boolean }): boolean`; `SmoothScroll(): null`.
- Produces barrel `@/components/motion`: re-exports everything from `reveal`, `split-title`, `parallax`, `pointer`, `smooth-scroll`.

- [ ] **Step 1: Install Lenis**

Run: `npm install lenis@^1.3.26`
Expected: `package.json` lists `"lenis"` under dependencies.

- [ ] **Step 2: Write the failing test** `src/components/motion/smooth-scroll.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { shouldSmoothScroll } from "./smooth-scroll";

describe("shouldSmoothScroll", () => {
  it("smooths scrolling for a mouse or trackpad with full motion", () => {
    expect(shouldSmoothScroll({ reducedMotion: false, coarsePointer: false })).toBe(true);
  });
  it("leaves scrolling native when the visitor asked for reduced motion", () => {
    expect(shouldSmoothScroll({ reducedMotion: true, coarsePointer: false })).toBe(false);
  });
  it("leaves touch scrolling native (phones already have momentum)", () => {
    expect(shouldSmoothScroll({ reducedMotion: false, coarsePointer: true })).toBe(false);
  });
});
```

- [ ] **Step 3: Run to see it fail**

Run: `npx vitest run src/components/motion/smooth-scroll.test.ts`
Expected: FAIL — cannot resolve `./smooth-scroll`.

- [ ] **Step 4: Implement** `src/components/motion/smooth-scroll.tsx`

First confirm the constructor options: `grep -n "autoRaf\|anchors\|lerp" node_modules/lenis/dist/lenis.d.ts`. Expected: all three present. (If `autoRaf` is absent, drive `lenis.raf(time)` from a `requestAnimationFrame` loop instead and cancel it in cleanup.)

```tsx
import { useEffect } from "react";

export function shouldSmoothScroll(env: { reducedMotion: boolean; coarsePointer: boolean }): boolean {
  return !env.reducedMotion && !env.coarsePointer;
}

/**
 * Inertial scrolling for mouse and trackpad. Loaded on demand, so visitors on
 * phones or with reduced motion never download it.
 */
export function SmoothScroll(): null {
  useEffect(() => {
    const env = {
      reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
      coarsePointer: window.matchMedia?.("(pointer: coarse)").matches ?? false,
    };
    if (!shouldSmoothScroll(env)) return;

    let disposed = false;
    let destroy: (() => void) | undefined;
    void import("lenis").then(({ default: Lenis }) => {
      if (disposed) return;
      const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: true });
      destroy = () => lenis.destroy();
    });
    return () => {
      disposed = true;
      destroy?.();
    };
  }, []);
  return null;
}
```

- [ ] **Step 5: Create the barrel** `src/components/motion/index.ts`

```ts
export * from "./reveal";
export * from "./split-title";
export * from "./parallax";
export * from "./pointer";
export * from "./smooth-scroll";
```

- [ ] **Step 6: Mount it** in `src/routes/__root.tsx`

Add `import { SmoothScroll } from "@/components/motion/smooth-scroll";` with the other component imports, and inside `RootComponent`, directly after `<QueryClientProvider client={queryClient}>`, add `<SmoothScroll />`.

- [ ] **Step 7: Run tests and typecheck**

Run: `npx vitest run src/components/motion && npx tsc --noEmit -p .`
Expected: PASS; tsc prints nothing.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/components/motion/smooth-scroll.tsx src/components/motion/smooth-scroll.test.ts src/components/motion/index.ts src/routes/__root.tsx
git commit -m "Add inertial smooth scrolling for pointer devices"
```

---

### Task 6: The glass navigation

**Files:**
- Create: `src/components/site/nav-mode.ts`, `src/components/site/nav-mode.test.ts`
- Modify: `src/components/site/site-nav.tsx` (entire file)

**Interfaces:**
- Consumes: `respond`, `settle`, `usePrefersReducedMotion` from `@/lib/motion`; `Magnetic` from `@/components/motion/pointer`; `navigation`, `products` from `@/lib/omniel`.
- Produces: `type NavMode = { condensed: boolean; hidden: boolean }`; `INITIAL_NAV_MODE: NavMode`; `navModeFor(input: { y: number; prevY: number; prev: NavMode; pinned: boolean }): NavMode`.

- [ ] **Step 1: Write the failing tests** `src/components/site/nav-mode.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { INITIAL_NAV_MODE, navModeFor } from "./nav-mode";

const shown = { condensed: true, hidden: false };
const hidden = { condensed: true, hidden: true };

describe("navModeFor", () => {
  it("starts open and uncondensed at the top of the page", () => {
    expect(navModeFor({ y: 0, prevY: 0, prev: INITIAL_NAV_MODE, pinned: false })).toEqual({
      condensed: false,
      hidden: false,
    });
  });
  it("condenses after 80px", () => {
    expect(navModeFor({ y: 81, prevY: 70, prev: INITIAL_NAV_MODE, pinned: false }).condensed).toBe(true);
  });
  it("hides when scrolling down past the opening screen", () => {
    expect(navModeFor({ y: 600, prevY: 580, prev: shown, pinned: false }).hidden).toBe(true);
  });
  it("returns as soon as the visitor scrolls up", () => {
    expect(navModeFor({ y: 560, prevY: 600, prev: hidden, pinned: false }).hidden).toBe(false);
  });
  it("ignores scroll jitter under 6px", () => {
    expect(navModeFor({ y: 603, prevY: 600, prev: shown, pinned: false }).hidden).toBe(false);
    expect(navModeFor({ y: 597, prevY: 600, prev: hidden, pinned: false }).hidden).toBe(true);
  });
  it("never hides near the top", () => {
    expect(navModeFor({ y: 100, prevY: 60, prev: shown, pinned: false }).hidden).toBe(false);
  });
  it("never hides while it is in use (menu open or keyboard focus inside)", () => {
    expect(navModeFor({ y: 900, prevY: 800, prev: shown, pinned: true }).hidden).toBe(false);
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run src/components/site/nav-mode.test.ts`
Expected: FAIL — cannot resolve `./nav-mode`.

- [ ] **Step 3: Implement** `src/components/site/nav-mode.ts`

```ts
export type NavMode = { condensed: boolean; hidden: boolean };

export const INITIAL_NAV_MODE: NavMode = { condensed: false, hidden: false };

const CONDENSE_AFTER = 80;
const NEVER_HIDE_ABOVE = 120;
const JITTER = 6;

/**
 * The nav condenses once the page has moved, gets out of the way while the
 * visitor reads downward, and returns the moment they scroll up. It never
 * hides near the top or while it is in use.
 */
export function navModeFor({
  y,
  prevY,
  prev,
  pinned,
}: {
  y: number;
  prevY: number;
  prev: NavMode;
  pinned: boolean;
}): NavMode {
  const condensed = y > CONDENSE_AFTER;
  if (pinned || y < NEVER_HIDE_ABOVE) return { condensed, hidden: false };
  const delta = y - prevY;
  if (delta > JITTER) return { condensed, hidden: true };
  if (delta < -JITTER) return { condensed, hidden: false };
  return { condensed, hidden: prev.hidden };
}
```

- [ ] **Step 4: Run to see it pass**

Run: `npx vitest run src/components/site/nav-mode.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Replace** `src/components/site/site-nav.tsx`

The spec's "88px → 64px" condensing is expressed with transform and opacity only (§3.4): the bar is always 64px tall; at the top it sits 12px lower with no glass behind it, and condensing lifts it into place while the glass fades in.

```tsx
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import omnielWordmark from "@/assets/omniel-wordmark.png";
import { Magnetic } from "@/components/motion/pointer";
import { respond, settle, usePrefersReducedMotion } from "@/lib/motion";
import { navigation, products } from "@/lib/omniel";
import { cn } from "@/lib/utils";
import { INITIAL_NAV_MODE, navModeFor, type NavMode } from "./nav-mode";

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<NavMode>(INITIAL_NAV_MODE);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduced = usePrefersReducedMotion();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    let prevY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const pinned = headerRef.current?.contains(document.activeElement) ?? false;
      setMode((prev) => navModeFor({ y, prevY, prev, pinned }));
      prevY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const hidden = mode.hidden && !open;
  const instant = { duration: 0 };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <motion.header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
        initial={false}
        animate={{ y: hidden ? "-130%" : mode.condensed ? "0%" : "12px" }}
        transition={reduced ? instant : respond}
        onFocusCapture={() => setMode((m) => ({ ...m, hidden: false }))}
      >
        <nav
          aria-label="Primary"
          className="relative isolate mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-6 rounded-full px-4 md:px-6"
        >
          <motion.span
            aria-hidden
            className="glass absolute inset-0 -z-10 rounded-full"
            initial={false}
            animate={{ opacity: mode.condensed || open ? 1 : 0 }}
            transition={reduced ? instant : settle}
          />
          <Link to="/" aria-label="OMNIEL home" className="shrink-0">
            <img src={omnielWordmark} alt="OMNIEL" className="mark-ink h-5 w-auto" />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <li key={item.to} className="relative">
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 text-sm transition-colors",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId="nav-pill"
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-foreground/[0.06]"
                        transition={reduced ? instant : respond}
                      />
                    ) : null}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <Magnetic className="hidden sm:inline-flex">
              <Link
                to="/contact"
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Contact
              </Link>
            </Magnetic>
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full text-foreground md:hidden"
            >
              <span className="relative block h-3.5 w-4">
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform",
                    open ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform",
                    open ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? instant : settle}
            className="fixed inset-0 z-40 overflow-y-auto bg-background/80 px-5 pb-12 pt-28 backdrop-blur-2xl md:hidden"
          >
            <ul className="divide-y divide-hairline border-y border-hairline">
              {navigation.map((item, index) => (
                <motion.li
                  key={item.to}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduced ? instant : { ...settle, delay: 0.04 * index }}
                >
                  <Link to={item.to} className="block py-5 font-display text-3xl tracking-[-0.03em]">
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-10 grid gap-3">
              {products.map((product) => (
                <Link
                  key={product.slug}
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  data-light={product.slug}
                  className="glass rounded-2xl p-4"
                >
                  <span className="font-display text-xl text-accent">{product.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{product.role}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 6: Typecheck and run tests**

Run: `npx tsc --noEmit -p . && npx vitest run`
Expected: tsc prints nothing; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/site/nav-mode.ts src/components/site/nav-mode.test.ts src/components/site/site-nav.tsx
git commit -m "Rebuild the navigation as a floating glass bar"
```

---

### Task 7: Footer

**Files:**
- Modify: `src/components/site/site-footer.tsx`

**Interfaces:** none new. Copy and link targets are unchanged.

- [ ] **Step 1: Restyle.** In `src/components/site/site-footer.tsx`, make these exact replacements:
  - `<footer className="border-t border-hairline py-12 md:py-16">` → `<footer className="border-t border-hairline bg-paper-deep py-16 md:py-24">`
  - `className="mark-silver h-5 w-auto"` → `className="mark-ink h-5 w-auto"`
  - `className="mt-5 inline-block text-sm text-accent underline-offset-4 hover:underline"` → `className="mt-5 inline-block text-sm text-foreground underline decoration-hairline underline-offset-4 transition-colors hover:decoration-current"`
  - each `className="hover:text-foreground"` → `className="transition-colors hover:text-foreground"`

- [ ] **Step 2: Verify the copy is unchanged**

Run: `git diff src/components/site/site-footer.tsx | grep "^[-+]" | grep -v className`
Expected: only the `---`/`+++` header lines; no text changes.

- [ ] **Step 3: Commit**

```bash
git add src/components/site/site-footer.tsx
git commit -m "Restyle the footer for paper"
```

---

### Task 8: The voice button

**Files:**
- Create: `src/lib/voice/audio-level.ts`, `src/lib/voice/audio-level.test.ts`
- Modify: `src/components/site/livekit-widget.tsx`

**Interfaces:**
- Consumes: `respond`, `usePrefersReducedMotion` from `@/lib/motion`.
- Produces: `levelToScale(level: number): number` (1 at silence, 1.8 at full level, clamped).

- [ ] **Step 1: Write the failing test** `src/lib/voice/audio-level.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { levelToScale } from "./audio-level";

describe("levelToScale", () => {
  it("rests at 1 in silence", () => expect(levelToScale(0)).toBe(1));
  it("grows with the voice", () => expect(levelToScale(0.5)).toBeCloseTo(1.4));
  it("is clamped against odd readings", () => {
    expect(levelToScale(3)).toBeCloseTo(1.8);
    expect(levelToScale(-1)).toBe(1);
    expect(levelToScale(Number.NaN)).toBe(1);
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run src/lib/voice/audio-level.test.ts`
Expected: FAIL — cannot resolve `./audio-level`.

- [ ] **Step 3: Implement** `src/lib/voice/audio-level.ts`

```ts
/** Maps the agent's audio level (0–1, from LiveKit) to the voice dot's scale. */
export function levelToScale(level: number): number {
  const safe = Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0;
  return 1 + safe * 0.8;
}
```

- [ ] **Step 4: Run to see it pass**

Run: `npx vitest run src/lib/voice/audio-level.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Restyle the widget** `src/components/site/livekit-widget.tsx`

1. Imports: keep the existing `react` import as it is, and add:
   ```tsx
   import { motion, useMotionValue } from "motion/react";
   import { respond, usePrefersReducedMotion } from "@/lib/motion";
   import { levelToScale } from "@/lib/voice/audio-level";
   ```
   and change the type import to `import type { Participant, RemoteParticipant, RemoteTrack, Room } from "livekit-client";`.
2. Inside `LiveKitWidget`, after the existing `useState` lines, add:
   ```tsx
   const agentRef = useRef<RemoteParticipant | null>(null);
   const dotScale = useMotionValue(1);
   const reduced = usePrefersReducedMotion();

   // While OMNIEL speaks, the dot follows the loudness of its voice.
   useEffect(() => {
     if (state !== "speaking" || reduced) {
       dotScale.set(1);
       return;
     }
     let frame = 0;
     const tick = () => {
       dotScale.set(levelToScale(agentRef.current?.audioLevel ?? 0));
       frame = requestAnimationFrame(tick);
     };
     frame = requestAnimationFrame(tick);
     return () => cancelAnimationFrame(frame);
   }, [state, reduced, dotScale]);
   ```
3. In the `RoomEvent.TrackSubscribed` handler, change the signature to `(track: RemoteTrack, _publication, participant: RemoteParticipant)` and add `agentRef.current = participant;` as its first line. In the `RoomEvent.Disconnected` handler add `agentRef.current = null;`.
4. Replace the `<button …>…</button>` element with:
   ```tsx
   <motion.button
     type="button"
     onClick={isLive ? stop : start}
     disabled={isBusy}
     aria-label={isLive ? "End the call with OMNIEL" : "Talk to OMNIEL"}
     whileHover={reduced || isBusy ? undefined : { y: -1.5 }}
     whileTap={reduced || isBusy ? undefined : { scale: 0.98 }}
     transition={respond}
     className={cn(
       // A 56px capsule: thumb-sized, and made of OMNIEL's own surfaces so it
       // reads as part of the site rather than a pasted-on widget.
       "flex h-14 items-center gap-3 rounded-full px-5 text-sm font-medium",
       "focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60",
       isLive
         ? "glass text-foreground"
         : "bg-primary text-primary-foreground shadow-[0_18px_40px_-22px_var(--color-ink)]",
     )}
   >
     <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
       <motion.span
         className={cn(
           "relative inline-flex h-2.5 w-2.5 rounded-full",
           state === "error" ? "bg-destructive" : "bg-[var(--light)]",
         )}
         style={{ scale: dotScale }}
         animate={
           state === "listening" && !reduced ? { opacity: [0.45, 1, 0.45] } : { opacity: 1 }
         }
         transition={
           state === "listening" && !reduced
             ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
             : respond
         }
       />
     </span>
     {isLive ? "End call" : state === "connecting" ? "Connecting…" : "Talk to OMNIEL"}
   </motion.button>
   ```
5. Replace the two status bubbles' `panel` class with `glass` (keep all other classes).

- [ ] **Step 6: Typecheck, test and check the build output still splits LiveKit out**

Run: `npx tsc --noEmit -p . && npx vitest run && npx vite build && ls .output/public/assets | grep -c livekit-client`
Expected: tsc silent; tests pass; build succeeds; count `1` (livekit-client is still its own chunk).

- [ ] **Step 7: Commit**

```bash
git add src/lib/voice/audio-level.ts src/lib/voice/audio-level.test.ts src/components/site/livekit-widget.tsx
git commit -m "Make the voice button breathe and follow OMNIEL's voice"
```

---

### Task 9: Filter bar in OMNIEL's tokens

**Files:**
- Modify: `src/components/ui/filter-token-bar.tsx`
- Create: `src/components/ui/filter-token-bar.test.tsx`

**Interfaces:**
- Consumes: `respond` from `@/lib/motion`.
- Produces: unchanged public API (`FilterBar`, `Filter`, `FilterFieldDef`, `FilterOption`, `FilterOperatorDef`).

- [ ] **Step 1: Write the failing tests** `src/components/ui/filter-token-bar.test.tsx`

```tsx
// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { render, stubBrowser } from "@/test/dom";
import { FilterBar, type FilterFieldDef } from "./filter-token-bar";

const fields: FilterFieldDef[] = [
  {
    id: "product",
    label: "Product",
    operators: [{ value: "is", label: "is" }],
    options: [{ value: "nova", label: "NOVA" }],
  },
];

describe("FilterBar", () => {
  it("uses OMNIEL's tokens, not a hard-coded palette", () => {
    const source = readFileSync(resolve(__dirname, "filter-token-bar.tsx"), "utf8");
    expect(source).not.toMatch(/\b(zinc|blue|white)-\d|bg-white\b|\bdark:/);
  });

  it("carries the section's product light into its popover", async () => {
    stubBrowser();
    const view = await render(
      <div data-light="vyren">
        <FilterBar fields={fields} value={[]} onChange={() => {}} />
      </div>,
    );
    const add = view.container.querySelector<HTMLButtonElement>("[data-fb-anchor='add']");
    await act(async () => {
      add?.click();
    });
    const dialog = document.body.querySelector("[role='dialog']");
    expect(dialog?.closest("[data-light]")?.getAttribute("data-light")).toBe("vyren");
    await view.unmount();
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run src/components/ui/filter-token-bar.test.tsx`
Expected: FAIL on both tests (palette match; `data-light` is null).

- [ ] **Step 3: Carry `data-light` into the portal.** In `Popover`:
  - Replace `const [dark, setDark] = React.useState(false);` with `const [light, setLight] = React.useState<string | null>(null);`
  - Replace `setDark(!!el?.closest(".dark"));` with `setLight(el?.closest("[data-light]")?.getAttribute("data-light") ?? null);`
  - Replace `<div className={dark ? "dark" : ""} style={{ display: "contents" }}>` with `<div data-light={light ?? undefined} style={{ display: "contents" }}>`
  - Replace the popover `className` with `"glass min-w-[13rem] max-w-[18rem] overflow-hidden rounded-xl"`.

- [ ] **Step 4: Replace the palette.** Apply these exact substitutions throughout the file (every occurrence), then delete any remaining `dark:…` class tokens:

| Old | New |
|---|---|
| `import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";` | `import { AnimatePresence, motion, useReducedMotion } from "motion/react";` plus a new line `import { respond } from "@/lib/motion";` |
| `const springy: Transition = { type: "spring", stiffness: 560, damping: 34, mass: 0.7 };` | (delete the line) |
| `transition={springy}` | `transition={respond}` |
| `border-b border-zinc-950/8 p-1.5 dark:border-white/8` | `border-b border-hairline p-1.5` |
| `text-zinc-900` / `text-zinc-800` / `text-zinc-50` | `text-foreground` |
| `text-zinc-600` / `text-zinc-500` / `text-zinc-400` | `text-muted-foreground` |
| `placeholder:text-zinc-400` | `placeholder:text-muted-foreground` |
| `bg-zinc-100 dark:bg-white/10` (active option) | `bg-foreground/[0.06]` |
| `border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900` | `border-foreground bg-foreground text-background` |
| `border-zinc-300 dark:border-zinc-600` | `border-foreground/25` |
| `focus-visible:ring-blue-500/70` and `focus-visible:ring-blue-500/60` | `focus-visible:ring-ring` |
| `decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500` | `decoration-hairline underline-offset-2 hover:decoration-current` |
| `bg-zinc-200/70 dark:bg-white/[0.12]` (active segment) | `bg-foreground/[0.08]` |
| `hover:bg-zinc-200/60 dark:hover:bg-white/[0.08]` | `hover:bg-foreground/[0.05]` |
| chip wrapper `border border-zinc-950/[0.09] bg-zinc-100/80 dark:border-white/[0.08] dark:bg-white/[0.05]` | `border border-hairline bg-[oklch(1_0_0/0.6)] backdrop-blur-md` |
| divider `bg-zinc-950/[0.07] dark:bg-white/[0.08]` | `bg-hairline` |
| remove button `text-zinc-400 … hover:bg-zinc-200/60 hover:text-zinc-700 … dark:…` | `text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:scale-[0.98]` |
| add button colours `border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900` | `border-foreground/25 text-muted-foreground hover:border-foreground/40 hover:bg-foreground/[0.04] hover:text-foreground` |
| clear button `text-zinc-500 … hover:bg-zinc-100 hover:text-zinc-800 …` | `text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` |
| flash keyframe `background-color: rgba(59, 130, 246, 0.18);` | `background-color: color-mix(in oklab, var(--light) 18%, transparent);` |

- [ ] **Step 5: Run to see it pass**

Run: `npx vitest run src/components/ui/filter-token-bar.test.tsx && npx tsc --noEmit -p .`
Expected: PASS (2 tests); tsc silent.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/filter-token-bar.tsx src/components/ui/filter-token-bar.test.tsx
git commit -m "Restyle the filter bar in OMNIEL's tokens"
```

---

### Task 10: Verify, preview, report

**Files:** none new.

- [ ] **Step 1: Full checks**

Run: `npx tsc --noEmit -p . && npx vitest run && npx vite build`
Expected: tsc silent; all tests pass (the 90 existing plus this stage's); build succeeds.

- [ ] **Step 2: Copy is unchanged**

Run: `git diff production-backend-vapi-design...HEAD -- src/routes src/lib/omniel.ts | grep "^[-+]" | grep -vE "className|^[-+]{3}|dark:" | head`
Expected: no lines, meaning no text content changed in routes or content.

- [ ] **Step 3: Browser QA.** Start the dev server (`.claude/launch.json` entry running `npm run dev` on port 8080, via the preview tool), then for each of `/`, `/products/nova`, `/technology`, `/about`, `/contact`:
  - screenshot at 390×844, 1024×768 and 1440×900;
  - scroll the full page and confirm the nav hides on scroll-down and returns on scroll-up, with the active page pill in place;
  - check that no text is unreadable over any background (the home hero still uses the old dark photograph until Stage 2; note it, don't fix it here);
  - emulate `prefers-reduced-motion: reduce` and confirm content appears with fades only and scrolling is native.
  Record issues found; fix any that break the Global Constraints before continuing.

- [ ] **Step 4: Lighthouse** (Chrome DevTools MCP `lighthouse_audit`) on `/` and `/technology`, mobile and desktop, against the local production preview (`npx vite preview`). Record scores. Accessibility, Best Practices and SEO must be 100; investigate any drop from the current site.

- [ ] **Step 5: Upload a preview version** (not production)

Run: `npx wrangler versions upload --preview-alias stage-1`
Expected: a preview URL. If preview URLs are disabled for the Worker, skip this step and report that the stage was verified locally only. Do **not** run `wrangler deploy` or `wrangler versions deploy`.

- [ ] **Step 6: Push the branch and report**

```bash
git push -u origin redesign/stage-1-foundation
```

Report to the owner: the preview URL (or local-only note), screenshots of home, NOVA and Technology at desktop and phone widths, Lighthouse scores, and the known interim issue (the home hero photograph is replaced in Stage 2). Ask whether to promote Stage 1 to production now or wait until Stage 2 so the home page changes in one piece.
