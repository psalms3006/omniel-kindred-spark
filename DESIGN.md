# OMNIEL design system (v5 — warm mineral)

Read this before adding a component, a colour, or an animation.

---

## The narrative

The site moved from **what OMNIEL does** to **what the person stops carrying**.

- Brand platform: **“Do less. Get more done.”**
- Product line and primary CTA: **“Meet NOVA.”**
- The enemy is the mental load — the list, the follow-ups, the rebuilt context.
- Audience: students, teams and creatives. The story stays universal; the three
  audience sections are proof, not separate pitches.

Retire from the homepage: superintelligence, frontier, agentic, seamless,
empower, unlock, AI-powered. “Superintelligence” belongs on the company/about
page, not the hero.

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
- No chrome on sand. Chrome is reserved for the dark NOVA stage and footer.
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

The mark is the split-O. Use it as a **one-colour silhouette**:

- Navigation/footer light: split-O + “OMNIEL” in Clash Display, obsidian.
- Dark NOVA stage/footer: the chrome wordmark may be used — it is the only
  “silicon” material in the identity.
- Never place the chrome wordmark on sand.

`BrandMark` uses the PNG's alpha channel as a mask, so the mark can be ink,
oxblood or sand without the cool gradient. The nav uses the original full
wordmark, restored and enlarged; the chrome version is reserved for the dark
footer and the NOVA stage.

---

## Layout

1. **Fixed full-width nav** — sand, 1px line, the original wordmark left, links
   truly centred with a `[1fr_auto_1fr]` grid, a “Download NOVA” link right. No
   floating pill.
2. **Hero** — two columns, top aligned: “OMNIEL builds intelligence for everyday
   use.”, the main “Do less. Get more done.”, and a work portrait (the
   `black creatives` image) on the right, rounded as a rectangle. No CTA.
3. **Origin** — a huge “OMNIEL.”, a centered 2:1 rounded image with a warm
   treatment, then “Building the right kind of intelligence. The kind we need.”
   plus a short note: OMNIEL builds practical intelligence for everyday problems,
   and NOVA is the first product. No side copy and no country name.
4. **Everyone** — “Built for the work you actually do.” left; a collage of the
   students, creatives and teams work images right.
5. **Introducing NOVA** — warm impact waves, typewriter, moving cards, the CTA
   “Meet NOVA”, then a short explanation of NOVA as a voice-first desktop
   assistant.
6. **Students** — study-workspace UI, no CTA; then a near-full-width student
   image.
7. **Teams** — everyday-work dashboard, no CTA.
8. **Creatives** — neobrutalist editor, no CTA.
9. **Values** — “The standards we build to.” and a short animated
   “Access / Privacy / Offline / Action” marquee. No long principles list.
10. **Closing** — “Do less. Get more done.” and the `for teams` work image; no
    paragraph, no CTA.
11. **Footer** — dark; chrome wordmark, socials, ecosystem, company, contact.

### NOVA page — `/nova`

- Warm impact waves on obsidian, plus a rotating 3D NOVA mark.
- Chrome wordmark, “Meet NOVA.”, a short paragraph.
- Three short lines: Plan, Act, Remember.
- Neobrutalist download cards for macOS and Windows, both “coming soon”.
- The waitlist form (the page's primary action).
- `/products/nova` permanently redirects to `/nova`.

---

## Motion

- **Homepage:** a static warm wash in the hero; the contained “Introducing
  NOVA” stage uses the warm impact waves as its product moment.
- **NOVA page:** the warm impact waves, plus the rotating 3D NOVA mark.
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
- `nova-waves.tsx` / `colorful-wave-pattern-1.tsx` — warm NOVA waves.
- `nova-icon-3d.tsx` — the rotating extruded NOVA mark.
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
