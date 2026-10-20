# OMNIEL design system (v4 — black, blue, beige)

Read this before adding a component, a colour, or an animation.

---

## Direction

Dark-first, sharp and electric: **ink black, cobalt blue, ice white**, with two
warm **beige** sections as breathing room.

Cards are a deliberate union of **neobrutalism and glassmorphism**: translucent
fills and backdrop blur, a visible border, a hard offset shadow, and an inner
top highlight. The hard shadow is what keeps it brutalist; the blur is what
keeps it modern.

---

## Colour

| Token                         | Value             | Use                                                    |
| ----------------------------- | ----------------- | ------------------------------------------------------ |
| `background`                  | `#05070D`         | page, hero, footer                                     |
| `foreground`                  | `#F2F5FB`         | primary text on dark                                   |
| `accent`                      | `#2F6BFF`         | the signal: active states, borders, shadows, blue text |
| `signal` / `signal-2`         | cyan / periwinkle | artwork and the wave shader only                       |
| `muted-foreground`            | `#97A3B8`         | secondary text                                         |
| `card`                        | translucent navy  | glass cards                                            |
| `beige`                       | `#E7DFD0`         | the two light sections                                 |
| `--neo-surface/border/shadow` | per-theme         | the neo-glass frame                                    |

`.theme-light` flips the local variables to ink-on-beige. Because the theme
variables are inlined into utilities, every child component flips with it.

**Rules**

- Blue is the only UI accent; cyan/periwinkle stay inside artwork.
- Never pure white as a page background. Beige is the light exhale.
- Hard offset shadows are blue on dark and ink on beige. No soft drop shadows
  on neobrutalist cards.
- Glass is for cards, the header and the NOVA stage.

---

## Type

| Role      | Face                      | Use                                         |
| --------- | ------------------------- | ------------------------------------------- |
| Display   | **Equinox** (self-hosted) | hero, section titles, product names         |
| Editorial | **Archivo** at 125% width | the hero's second line, expanded statements |
| Body / UI | **Inter**                 | paragraphs, forms, nav, labels              |
| Terminal  | system monospace          | typewriter, code                            |

**Licensing**

- Equinox permits websites and logos; do not redistribute the files. Archivo
  Expanded is the stand-in.

---

## Layout

1. Header — floating dark-glass pill: wordmark left, nav centred, Contact +
   waitlist right.
2. Hero — centered "Introducing Nova" badge, huge Equinox statement with a blue
   gradient underline, the fullstack-companion subline, one Meet NOVA CTA, then
   three preview windows. The animated dither sits behind it.
3. Products — **Powered by OMNIEL**; three horizontal neo-glass cards: NOVA,
   VYREN, ARVO. NOVA leads with a voice waveform and the online/offline line.
4. Made for Students — **beige**, text left, glass study-workspace card right.
5. Made for Enterprises — **dark, mirrored**: an everyday-work dashboard
   (inbox, approvals, calendar, handoffs, people) left, text right.
6. Made for Creatives — **beige**, text left, neobrutalist glass editor right.
7. NOVA — impact-wave shader stage, task typewriter, three moving cards; one is
   a live voice conversation.
8. Desktop — waitlist plus disabled macOS/Windows download buttons.
9. Footer — dark; socials, ecosystem, company, connect, legal.

`shell` is the only gutter authority: max 84rem, 20/40/64px gutters.

---

## Signature motion

- **Hero dither** — `src/components/ui/neon-dither.tsx`, adapted from 21st.dev.
  Hero-only, always dark, cobalt/cyan, subtle parallax; lazy-loaded and
  unmounted when the hero leaves the viewport.
- **Impact waves** — `src/components/ui/colorful-wave-pattern-1.tsx`, adapted
  from 21st.dev. Tinted blue/cyan, lazy-loaded and client-only, paused
  offscreen, with a static gradient fallback for reduced motion.
- **Typewriter** — cycles example tasks in the NOVA stage. `aria-hidden`; a
  static sentence carries the meaning for assistive tech.
- **Marquee** — three example-task cards drift horizontally; one is a live voice
  conversation, with beige rather than blue accents. Pause on hover; static
  grid under reduced motion.
- **Scroll reveals** — `Reveal from="bottom|left|right|scale"`; the hero uses a
  CSS line-mask reveal that works without JavaScript.
- Nothing animates blur/filter. Everything stops under
  `prefers-reduced-motion`.

---

## Accessibility

- AA contrast on ink and beige.
- Visible `:focus-visible` ring; never suppress it.
- 44px minimum touch targets.
- Shader and decorative art are `aria-hidden`; the typewriter has a static
  accessible line.
- Forms keep input on failure and never claim success they did not get.

---

## Truthfulness

NOVA is the platform, but it is **in development**. No release dates, invented
benchmarks or claims of scale. The desktop section says "In development / No
date promised."
