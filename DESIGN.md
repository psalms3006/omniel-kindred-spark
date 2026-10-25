# OMNIEL design system (v5 — warm mineral)

Read this before adding a component, a colour, or an animation.

---

## The narrative

- Brand platform: **“Do less, but smart.”**
- Supporting idea: “Less to carry.”
- Product line and primary CTA: **“Leave it to NOVA.”**

- Audience: students, teams and creatives. The story stays universal; the three
  audience sections are proof, not separate pitches.

---

## Colour — warm mineral

| Token          | Value     | Use                                 |
| -------------- | --------- | ----------------------------------- |
| Sand           | `#F2EBDE` | page base                           |
| Bone           | `#FAF6EE` | cards, lightest surface             |
| Oatmeal        | `#E3DCCF` | quiet bands, inputs                 |
| Line           | `#CFC5B6` | borders and dividers                |
| Obsidian       | `#1A1A18` | text, structure                     |
| Oxblood        | `#6E3038` | primary accent, small text, links   |
| Oxblood bright | `#8A3B42` | large art, underlines, dark accents |
| Rose (on dark) | `#C97A82` | dark-section accent                 |
| Olive          | `#4F5D50` | secondary accent, quiet states      |
| Sage           | `#A9B5A4` | tints, status, waveforms            |

Rules:

- Oxblood is the primary pop; olive is the quiet counterweight. The earlier
  orange was retired because it sat too close to Anthropic.
- Small text never uses `#C85A32` on sand — use `#B64A2A` for contrast.
- No bright chrome on sand. The only metal on sand is the dark-gunmetal
  wordmark; light chrome is reserved for the dark NOVA stage and footer.
- Dark is not a second theme; it is a material used in two places: the footer
  and the NOVA stage.
- Dotted grids and 4% paper grain are allowed. No glows, no blue gradients, no
  glassmorphism.

---

## Type

| Role           | Face                  | Source       |
| -------------- | --------------------- | ------------ |
| Display        | **Clash Display**     | Fontshare    |
| Body / UI      | **Plus Jakarta Sans** | Google Fonts |
| Technical meta | system monospace      | OS           |

Equinox, Archivo and Galiscka are retired from the site UI. Clash Display is
used for statement headlines and product names; Plus Jakarta carries dense copy,
navigation and forms. Sentence case, generous leading, no all-caps paragraphs.

---

## Logo

The mark is the split-O OMNIEL wordmark, finished as a shallow 3D metal.

- Navigation: `omniel-wordmark-dark-metal.png` — warm dark gunmetal with a
  baked vertical bevel and a soft drop shadow.
- Footer and dark NOVA stage: `omniel-wordmark-light-metal.png` — warm light
  chrome.
- Never place the light-metal/chrome wordmark on sand.

Both assets are generated from the same silhouette. The shape stays fixed; only
the finish changes with the surface. `BrandMark` remains available for
one-colour uses, but the nav and footer use the metal assets.

---

## Layout

1. **Fixed full-width nav** — sand, 1px line, the original wordmark left, links
   centre, one NOVA link right. No floating pill.
2. **Hero** — centered: “Do less, but smart.”, one sentence, one CTA
   (“Leave it to NOVA”), the warm dither.
3. **Origin** — a centered, curved origin image and a triptych for students,
   creatives and teams. The image carries the signal; the copy never names the
   country.
4. **The weight** — the list, the follow-ups, the context. Editorial, no cards.
5. **Introducing NOVA** — the retained product moment: warm impact waves,
   typewriter, moving cards. A text link to `/nova`.
6. **Students** — curved student photo + study-workspace UI, no CTA.
7. **Teams** — everyday-work dashboard, no CTA.
8. **Creatives** — neobrutalist editor, no CTA.
9. **Why we build** — access, privacy, offline, action.
10. **Closing** — “Do less, but smart.” and the one primary CTA.
11. **Footer** — dark; chrome wordmark, socials, ecosystem, company, contact.

### NOVA page — `/nova`

- One primary animation: the warm impact waves on obsidian.
- Chrome wordmark, “Leave it to NOVA.”, a short paragraph.
- Three short lines: Plan, Act, Remember.
- Neobrutalist download cards for macOS and Windows, both “coming soon”.
- The waitlist form (the page's primary action).
- `/products/nova` permanently redirects to `/nova`.

---

## Motion

- **Homepage:** the warm dither is the page atmosphere; the contained
  “Introducing NOVA” stage uses the warm impact waves as its product moment.
- **NOVA page:** the warm impact waves are the single primary animation.
- **NOVA box:** typewriter + a slow marquee of three example cards; one is a
  live voice conversation. No blue shader.
- **ScrollExpand:** audience visuals settle from 95% to 100% as they scroll.
- **Reveal:** bottom / left / right / scale variants.
- **Nav:** a 1px oxblood scroll-progress line.

Nothing animates blur/filter. Everything stops under `prefers-reduced-motion`.

---

## Components

- `primitives.tsx` — Shell, Section, SectionHeading, Panel, NeoPanel,
  ActionLink, Reveal, Eyebrow, PageHero, Stat.
- `brand-mark.tsx` — one-colour split-O.
- `scroll-expand.tsx` — the slow scroll expansion.
- `hero-dither.tsx` / `neon-dither.tsx` — warm homepage dither.
- `nova-waves.tsx` / `colorful-wave-pattern-1.tsx` — warm NOVA waves.
- `nova-stage.tsx` — the retained homepage product box.
- `study-workspace.tsx`, `everyday-work.tsx`, `creative-editor.tsx` — audience
  proof.
- `download-cards.tsx` — NOVA downloads.

---

## Accessibility

- AA contrast on sand and obsidian.
- Visible `:focus-visible` ring; never suppress it.
- 44px minimum touch targets.
- Shaders and decorative art are `aria-hidden`.
- Typewriter has a static accessible line.
- Forms keep input on failure and never claim success they did not get.

---

## Truthfulness

NOVA is **coming soon**. No release dates, invented benchmarks or claims of
scale. The waitlist says “No date promised.”
