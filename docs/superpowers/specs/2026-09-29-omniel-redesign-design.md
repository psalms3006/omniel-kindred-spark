# OMNIEL website redesign — design spec

Date: 2026-09-29
Status: awaiting review
Stack: TanStack Start, React 19, Tailwind v4, shadcn/ui, `motion` 12, Cloudflare Workers

## 1. Intent

**Outcome.** A visitor leaves feeling OMNIEL "already exists ten years in the
future" — and remembers one thing about NOVA: *it stays useful when the
connection dies.*

**Who it is for.** Prospective users of NOVA, collaborators, partners and
supporters, arriving mostly cold from links and search.

**Success criteria.**
- The NOVA constellation and the signal-fade moment are the thing people describe afterwards.
- Every existing piece of copy survives unchanged (the current site's text is correct).
- Nothing on the site states or implies a capability, launch, customer or figure that does not exist (the accuracy rules at the top of `src/lib/omniel.ts` stand).
- Lighthouse: Accessibility, Best Practices and SEO 100; Performance ≥ 95 desktop, ≥ 90 mobile. CLS < 0.05.
- Motion never janks: 60 fps on a mid-range laptop, and a complete, dignified experience with reduced motion on.

**Decided with the owner.**
| Decision | Choice |
|---|---|
| Visual direction | Light & air (light-first; no dark theme toggle) |
| 3D | Real-time WebGL on the home page only; still image elsewhere and as fallback |
| Signature moment | "Works when the signal dies" (offline intelligence) |
| 3D object | NOVA constellation: the NOVA mark assembled from light, tethered to the wider ecosystem |
| Colour | OMNIEL is neutral; each product carries its own light; NOVA is blue |
| Home story | OMNIEL words, NOVA light |
| NOVA primary action | Talk to OMNIEL about NOVA (the live voice assistant) |
| Filter bar | Capability explorer on the Technology page |
| Imagery | Photography as material, as today, re-shot in daylight; generated series approved by the owner |

**Assumptions (not stated by the owner).** Content, routes and backend are
unchanged; this is an experience redesign. The voice agent and enquiry forms are
restyled, not re-engineered, except for the NOVA topic hand-off in §6.3.

## 2. Visual language — "Light & air"

### 2.1 Colour tokens (`src/styles.css`, replacing the Graphite/Lichen set)
| Token | Value | Use |
|---|---|---|
| `--paper` | `oklch(0.975 0.006 85)` | page ground — warm, never `#fff` |
| `--paper-deep` | `oklch(0.95 0.008 85)` | alternate section ground |
| `--ink` | `oklch(0.22 0.012 250)` | text, marks |
| `--ink-muted` | `oklch(0.48 0.012 250)` | secondary text (≥ 4.5:1 on paper) |
| `--hairline` | `--ink` at 10% | borders, rules |
| `--glass` | white at 62%, `backdrop-filter: blur(24px) saturate(140%)`, 1px white/70% inner border | panels |
| `--night` | `oklch(0.14 0.01 250)` | the signal-fade chapter only |

Product light — the only saturated colour on the site, and it always means "this product":
| Product | Token | Value |
|---|---|---|
| NOVA | `--light-nova` | `oklch(0.56 0.12 240)` — sampled from `public/nova-mark.png` |
| VYREN | `--light-vyren` | `oklch(0.50 0.13 290)` (proposed) |
| ARVO | `--light-arvo` | `oklch(0.72 0.12 70)` (proposed) |
| KIWI | `--light-kiwi` | `oklch(0.70 0.10 130)` (proposed; inherits the old lichen) |

A `data-light="nova|vyren|arvo|kiwi"` attribute on a section sets `--light`,
so components use `var(--light)` and never name a product colour directly. A new
product is one token and one attribute.

Existing shadcn semantic tokens (`--background`, `--foreground`, `--primary`,
`--accent`, `--border`, …) are remapped onto these so `src/components/ui/*` keep
working unchanged.

### 2.2 Typography
- Display: Sora. Body: Manrope. Labels: JetBrains Mono. (Already loaded; no new fonts.)
- Scale: hero `clamp(3.4rem, 8vw, 8.5rem)`, section `clamp(2.4rem, 5vw, 5.5rem)`, body 17–19px.
- Optical tracking: −0.05em at hero size, −0.03em at section size, 0 at body, +0.16em on mono labels.
- `text-wrap: balance` on headings, `pretty` on paragraphs.

### 2.3 Space and surfaces
- 12-column grid, 1440px max content, 24px gutters mobile / 32px desktop.
- Section rhythm: 160–240px vertical padding desktop, 96–128px mobile.
- Depth comes from light and translucency, not heavy shadows: one soft ambient shadow (`0 30px 80px -40px ink/18%`) on floating glass only.
- A pointer-following specular highlight on glass (CSS radial gradient driven by `--mx/--my` custom properties, updated with `requestAnimationFrame`).

### 2.4 Imagery
Photography as material, in the art direction of the current
`src/assets/omniel-intelligence-core.jpg`, re-lit for daylight: pale stone and
clear glass sculptures, soft window light, the product's light glowing inside.
- Series of 5: home hero, NOVA, Technology, About, Contact. Generated to one
  shared prompt so they read as a set; each approved by the owner before use.
- Blended into the page with directional scrims tinted by `--light` (same
  technique as today's `HeroBackdrop`).
- The existing dark core photograph is kept and becomes the ground of the
  signal-fade chapter (§5.2).
- Delivered as AVIF + WebP with `srcset`; hero image preloaded; all others lazy.
- No stock photography. Team portraits keep a monogram placeholder until real ones exist.

## 3. Motion system — "calm physics"

### 3.1 Tokens (`src/lib/motion.ts`)
| Token | Definition | Use |
|---|---|---|
| `settle` | spring, stiffness 170, damping 26, mass 1 (no overshoot) | reveals, panels, layout |
| `respond` | spring, stiffness 520, damping 32, mass 0.6 | hover, press, toggles, chips |
| `drift` | 6–12s sine loops, or scroll-linked with no easing | ambient light, 3D breathing, parallax |

No component defines its own spring or duration.

### 3.2 Choreography primitives (`src/components/motion/`)
- `<Reveal>`: in-view layered entrance. Children declare a depth (`light`, `surface`, `title`, `body`, `action`) and enter in that order, 60ms apart. Titles rise 12px and sharpen from a 6px blur; everything else fades and rises 8px.
- `<SplitTitle>`: line-by-line headline reveal with a clipping mask; the text stays one accessible string.
- `<Parallax speed={0.85–0.95}>`: scroll-linked `translateY` only.
- `<Magnetic>`: 1–2px lift and pointer-following highlight for buttons and cards; press to 0.98 on `respond`.
- `<PageTransition>`: View Transitions API (old page recedes, new page rises); plain cross-fade fallback.

### 3.3 Scrolling
Lenis smooth scroll (`lenis`, about 4KB), `lerp: 0.1`, native scrolling on touch
devices, disabled under reduced motion. Scroll-linked values read from
`motion`'s `useScroll`, fed by Lenis.

### 3.4 Guarantees
- Animate only `transform` and `opacity` (blur only during short entrances).
- Everything is interruptible; no input waits on an animation.
- `prefers-reduced-motion`: reveals become 150ms opacity fades, parallax and Lenis are off, the 3D is a still image, the signal-fade becomes a cross-fade.

## 4. Global shell
- **Nav:** glass bar that condenses from 88px to 64px after 80px of scroll, hides on scroll-down and returns on scroll-up. The active page is a pill that springs between links (`layoutId`). Mobile: full-screen glass sheet with staggered links.
- **Footer:** quiet paper-deep band; the wordmark, navigation, contact, legal.
- **Voice button:** keeps its behaviour. Restyled as a glass capsule; the dot breathes in `--light` while listening and pulses with the agent's audio level while speaking (from the remote audio track's volume).
- **Filter bar** (`src/components/ui/filter-token-bar.tsx`): the zinc/blue palette is replaced with the tokens (glass chips, ink text, `--light` focus ring). Behaviour is unchanged.

## 5. Home

### 5.1 Hero — "OMNIEL words, NOVA light"
- Copy unchanged: eyebrow "OMNIEL / Nigeria", "Intelligence without borders.", `positioning.lede`, "Explore NOVA", the pre-launch line.
- Ground: the daylight home photograph under a paper scrim.
- **NOVA constellation** (right half desktop, behind the copy on mobile as a still image):
  - On load, about 60 scattered points of light drift in and assemble, filament by filament, into the NOVA mark (root, stem, six branches, six nodes, from `nova-mark.png`'s geometry), rendered as thin glass tubes with emissive nodes in `--light-nova`.
  - At rest it breathes (`drift`), turns up to 6° toward the pointer, and its six upper nodes send faint threads outward to distant, dimmer bodies: VYREN, ARVO and KIWI in their own lights, plus unnamed network points.

### 5.2 Signal-fade chapter (the signature moment)
A pinned sequence, about 180vh of scroll:
1. A small signal indicator (four bars, mono label "Online") appears top-right of the pinned frame.
2. As the visitor scrolls, the bars drop one by one, the label moves "Online → Weak → Offline", and the page ground crossfades from paper to `--night` with the existing dark core photograph fading in.
3. In the 3D, the outward threads snap (a short retraction, then a fade) and the distant bodies dim to 10%. The NOVA mark keeps its full light.
4. The copy lands, from existing content: the "Useful without a connection" principle title and its body, then NOVA's "Offline intelligence" capability line.
5. Scrolling on, light returns to paper and the NOVA chapter begins.

Reduced motion or no WebGL: the same four steps as three stacked, cross-faded frames with the still image.

### 5.3 Remaining home sections (existing copy, new treatment)
NOVA chapter (the six capabilities as layered glass panels over the NOVA
photograph, "Read about NOVA") → Belief (full-width statement, `SplitTitle`) →
Ecosystem (the other products as the dim bodies from the hero, now named, each
linking to its page) → Principles → Get involved.

## 6. Products

### 6.1 NOVA page (flagship template)
`data-light="nova"`. Sections: hero (name, `statement`, `summary`, the NOVA
photograph, the mark in glass) → capabilities as a pinned sequence (one glass
panel per capability, the panel stack advancing with scroll; on mobile a plain
vertical list) → audience → notes (kept verbatim; the honesty is part of the
brand) → closing action.

### 6.2 VYREN, ARVO, KIWI (shared template)
A quieter version of the NOVA template driven entirely by the product record
and `data-light`. KIWI renders its "deliberately quiet" state with no
capabilities grid. Adding a product needs a data entry and a light token, not a
new page.

### 6.3 Primary action: "Talk to OMNIEL about NOVA"
- A `VoiceProvider` context replaces the widget's internal-only state and exposes `startCall({ topic?: ProductSlug })`. The floating button and the NOVA call to action both use it; there is one call at a time.
- `/api/livekit/token` accepts an optional `topic` (validated against product slugs) and writes it into the participant's metadata.
- The agent reads the visitor's metadata and, when a topic is set, greets with that product in mind ("You're looking at NOVA — what would you like to know?") and searches that product's page first. No other agent behaviour changes.

## 7. Technology — capability explorer
- The six `technologyDirections` stay as the page's opening section.
- Below them, a grid of every capability across all products, built from `products[].capabilities`.
- A new optional `direction` field on each capability (one of the six direction ids) is added in `src/lib/omniel.ts`. It is set only where the mapping is exact; unmapped capabilities show under "Other". The mapping is listed in the implementation plan for owner review before it ships.
- The filter bar controls it with three fields: **Product** (is / is any of), **Direction** (is any of), **Stage** (is). The default is `Product is NOVA`.
- Cards animate in and out with `layout` + `settle`; empty results show a quiet "Nothing matches these filters" and a Clear action.
- The filter state is reflected in the URL (`?product=nova&direction=offline`) so filtered views can be shared, and the grid is server-rendered in its default state.

## 8. Other pages
About (team with monogram portraits), Research, Careers, Contact, Privacy and
Terms take the visual language, `Reveal`, and the section rhythm. Copy and form
behaviour are unchanged. The contact page uses the Contact photograph.

## 9. Performance and loading
- The 3D uses `three` + `@react-three/fiber`, split into its own chunk, imported only on the home page, and started after first paint and idle (`requestIdleCallback`). Budget: ≤ 180KB gzipped.
- The 3D is not loaded at all when any of these hold: viewport < 768px, `prefers-reduced-motion`, `navigator.connection.saveData`, WebGL2 unavailable, or `deviceMemory` < 4. The still image shows instead.
- The render loop pauses when off-screen (IntersectionObserver) or the tab is hidden, and caps its pixel ratio at 1.75.
- Initial JavaScript grows by no more than about 15KB (Lenis plus motion primitives) over the current site.

## 10. Accessibility
- Colour contrast ≥ 4.5:1 for all text, including over photographs (enforced by the scrims).
- All reveals keep content in the DOM and readable by assistive technology at all times; nothing depends on animation to be understood.
- The signal-fade chapter's text is ordinary document content; the indicator is `aria-hidden` and its meaning is stated in the copy.
- The filter bar keeps its toolbar keyboard model; explorer results are announced through a polite live region ("6 capabilities").
- Focus rings stay visible on glass (2px `--light` ring with a paper offset).

## 11. Testing
- Unit (vitest): motion token shape; explorer filtering and URL state; `direction` mapping integrity (every value is a real direction id); token route `topic` validation.
- Visual QA in the browser at 390px, 1024px and 1440px widths, with and without reduced motion, for every page.
- Lighthouse on home, NOVA and Technology (mobile and desktop) against §1's targets, recorded in the PR.
- Existing tests stay green.

## 12. Delivery stages
Each stage is planned, reviewed, deployed and committed separately.
1. **Foundation:** tokens, type, surfaces, motion tokens and primitives, Lenis, nav, footer, voice button, filter bar restyle.
2. **Home:** hero, NOVA constellation (3D), signal-fade chapter, remaining sections.
3. **Products:** NOVA template and topic hand-off (§6.3), then the shared template.
4. **Technology explorer**, then the remaining pages.
5. **Imagery:** generate the series, owner approval, optimise, apply.

## 13. Out of scope
New copy, new pages, a dark theme, CMS or blog, changes to the enquiry
pipeline, and 3D anywhere but the home page.
