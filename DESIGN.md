# OMNIEL design system

The visual language for omniel.com.ng. Read this before adding a component,
a colour, or an animation.

---

## Assessment (2026-09-10)

### Keep

* **Token architecture.** `@theme inline` over oklch custom properties in
  `styles.css`, with the rule "never hardcode colors in components". This is
  already a real design-token system and everything below builds on it.
* **Typography trio.** Sora (display, weight 300, tight tracking), Manrope
  (body), JetBrains Mono (labels/eyebrows). Three faces, clearly assigned
  roles, no decorative fonts.
* **`shell`, `eyebrow`, `hairline-t` utilities.** Consistent measure and
  gutters across every page.
* **Accessibility baseline.** A real `:focus-visible` ring, a skip link, and a
  global `prefers-reduced-motion` block.
* **Content discipline.** The copy is unusually honest for an early-stage
  company. Nothing here changes it.

### Remove

* **`NeuralField`.** A canvas particle-network — floating nodes joined by
  fading lines — rendered on 13 surfaces. It is competently built (rAF paused
  offscreen, DPR capped, node budget by CPU) and it is the single most
  recognisable cliché of a generic AI startup website. It says "this is an AI
  site" instead of saying anything about OMNIEL.
* **Stacked ambient layers.** The homepage hero rendered `AmbientField` *and*
  `NeuralField` on top of each other, plus the aurora gradient. Three
  simultaneous background treatments behind the one paragraph that has to
  explain the company.
* **Infinite ambient animation.** `drift` (26s) and `sheen` (7s) loop forever,
  costing battery and attention permanently in exchange for nothing the
  visitor can act on.
* **Arbitrary product hues.** Each product carried a `hue` number — 205, 78,
  300, 150 — with no meaning beyond "different". Colour that varies without
  reason is noise.

### Improve

* **Glassmorphism.** `glass` and `glass-quiet` appeared on 12 surfaces.
  Translucency is justified where content genuinely passes *behind* an element
  — the fixed navigation. Everywhere else it is a texture, and a costly one
  (`backdrop-filter` forces a compositing layer per element).
* **Motion vocabulary.** Durations and easings were written inline per
  component. Now tokenised.

### Rebuild

* **The background motif** (see *Signature* below).
* **Hero hierarchy** — the company, then the flagship, then the proof.

---

## Signature: the meridian

OMNIEL's one distinctive visual idea.

The positioning is *"Building intelligence without borders"*, from a company
built in Nigeria for a global audience. The motif is therefore a **meridian
system**: thin concentric arcs, the geometry of a globe seen from an angle,
drawn as flat lines rather than a rendered sphere.

Why this and not a particle field:

* It **means something specific to OMNIEL** — borders, reach, a world seen
  whole — rather than gesturing vaguely at "neural networks".
* It is **geometry, not glow**, so it does not date with the current visual
  trend.
* It is **static SVG**: no canvas, no animation frame, no battery cost, and it
  renders identically on a slow phone and a workstation.
* The "O" of the wordmark is a circle. The motif is the same circle, opened
  out. The logo and the background are the same idea at two scales.

Rules:

* Never more than one meridian per viewport.
* It sits behind content at low contrast and must never compete with text.
* Only the homepage hero animates it, and only as a single very slow rotation
  that a visitor should not consciously notice. Everywhere else it is static.

---

## Colour

Dark-first. All values oklch, all defined in `styles.css`.

### Roles

| Token | Use |
|---|---|
| `background` | The page |
| `surface`, `surface-strong` | Raised content: cards, panels |
| `hairline` | Borders and dividers |
| `foreground` | Primary text |
| `muted-foreground` | Secondary text, labels, metadata |
| `primary` | Primary action |
| `ion` | The OMNIEL accent — brand identity and flagship emphasis |
| `ember` | Rare secondary accent. Never decorative |
| `destructive` | Error states only |

### Colour has meaning

Accent colour is **not** distributed evenly across products. NOVA is the
flagship, so NOVA carries `ion`. The other products are rendered in the
neutral system and are distinguished by *type and content*, not by being
assigned a different hue each.

This is the hierarchy the site is meant to communicate — OMNIEL is the
ecosystem, NOVA is the flagship — expressed in colour rather than only in
words.

Do not make every component glow.

---

## Motion

### Tokens

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 150ms | Hover, focus, button feedback |
| `--motion-base` | 300ms | Component transitions |
| `--motion-slow` | 600ms | Entrances, page-level reveals |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default for anything entering |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes both directions |

### Hierarchy

1. **Micro-interactions** — hover, focus, button feedback. `--motion-fast`.
2. **Component transitions** — menus, panels, reveals. `--motion-base`.
3. **Brand motion** — the logo wordmark reveal, the hero meridian. Rare, and
   never more than one on screen at a time.

Levels must not compete. If a section already has brand motion, its contents
do not also animate in.

### The test

Before adding an animation, name which of these it does: communicates state,
guides attention, establishes hierarchy, explains an interaction, provides
feedback, or is a deliberate brand signature.

If the honest answer is "it looks good", it does not ship.

Nothing loops forever.

---

## Components

Defined once in `components/site/primitives.tsx`, reused everywhere.

| Pattern | Component | Notes |
|---|---|---|
| Page width | `Shell` | The only horizontal gutter authority |
| Section | `Section` | Vertical rhythm and `border-t border-hairline` |
| Section header | `SectionHeading` | eyebrow → title → lede |
| Raised content | `Panel` | Solid surface. `interactive` adds hover |
| Primary/ghost action | `ActionLink` | The only two button styles |
| Entrance | `Reveal` | Level 2 motion, stagger via `delay` |
| Label / metadata | `Eyebrow` | Mono, uppercase, wide tracking |

Before building a new component, check this table. If a pattern exists, reuse
it; if it genuinely does not, add it here rather than styling one page.

---

## Responsive

`shell` handles gutters. Layout adapts; the visual language does not change
between breakpoints.

The navigation's wordmark reveal is gated to ≥1024px because below that the
links and the Contact button already consume the row — an interaction that
would push content off-screen is disabled rather than allowed to break the
layout.

Touch targets: 44px minimum.
