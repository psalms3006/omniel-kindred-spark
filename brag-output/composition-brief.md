# Hyperframes Composition Brief: OMNIEL

## Objective
Create a short, polished launch-style brag video for OMNIEL.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 21s

## Source Material
- Project root: `C:\Users\Lenovo\omniel-kindred-spark`
- Primary files read: `src/lib/omniel.ts` (all copy), `src/routes/index.tsx` (hero, NOVA Stage card, ecosystem list, closing), `src/styles.css` (tokens), `src/components/site/livekit-widget.tsx` (voice button states)
- Product name: OMNIEL (flagship: NOVA)
- Tagline / strongest claim: "Intelligence without borders."
- Key UI to recreate: the NOVA Stage workspace card; the "Talk to OMNIEL" voice capsule and its Listening state; the ecosystem list
- Copy that must appear verbatim:
  - OMNIEL / Nigeria · Intelligence without borders.
  - NOVA / Workspace · Ready · Do more, with less unnecessary manual work.
  - Voice and text · Computer interaction · Vision and web · Memory and planning
  - Talk to OMNIEL · Listening…
  - NOVA is OMNIEL's generalist assistant. (first clause of the site's NOVA summary)
  - Different systems. One direction.
  - NOVA — Generalist AI assistant · VYREN — Specialist AI for complex technical work · ARVO — Voice-first AI system · KIWI — An emerging OMNIEL project
  - Small team. Large ambition. Early enough to matter.
  - Early-stage / Pre-launch · omniel.com.ng

## Creative Direction
- Tone preset: polished
- Creative direction: quiet premium product film — "a lab in Lagos, lit from inside"
- Interpretation: five scenes, long holds, soft crossfades and slides, no hype words, nothing the site does not itself claim.
- Hook: dark graphite frame, the glowing intelligence core photograph, "Intelligence / without / borders." rising line by line with "without" in lichen.
- Outro: the off-white closing band, "Small team. Large ambition. Early enough to matter.", then the wordmark and URL.
- Avoid: generic SaaS language, abstract filler, invented metrics or claims, redesigning the brand.

## Visual Identity
- Background `oklch(0.16 0.018 165)`; surfaces `oklch(0.205 0.026 155)` / `oklch(0.245 0.035 155)`; hairline `oklch(0.93 0.02 120 / 12%)`
- Text `oklch(0.94 0.018 120)`; muted `oklch(0.73 0.035 125)`; accent (lichen) `oklch(0.73 0.09 125)`; off-white `oklch(0.928 0.028 88)`
- Fonts: Sora 500/600 (display), Manrope 400/500 (body), JetBrains Mono 400 (labels) — local woff2 in `assets/fonts/` from @fontsource
- Visual references: `assets/img/omniel-intelligence-core.jpg`, `assets/img/omniel-wordmark.png`, the site's lab-grid texture, square lichen bullets, mono uppercase labels

## Storyboard (contract: `brag-plan.md`; timings adjusted for readability)
1. Hook — 0.0–3.5s — eyebrow + three headline lines rise, hold ≥1.5s.
2. NOVA — 3.5–8.5s — NOVA workspace card; four capability rows on every other beat (4.02, 5.03, 6.03, 7.02), full card held ≥1.1s.
3. Talk to OMNIEL — 8.5–13.0s — cursor presses the capsule → "Listening…" → "What is NOVA?" → answer caption, held ≥2s.
4. One direction — 13.0–17.0s — four ecosystem rows revealed quickly on consecutive beats (13.52–15.02), full list held ≥1.7s.
5. Close — 17.0–21.0s — off-white band; line beat-locked at 17.02s; wordmark + URL beat-locked at 18.52s; hold to end.

## Audio
- Role: warm, understated bed with sparse accents.
- Music: `assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`, volume ~0.55, 1s fade-in, 1.5s fade-out at the end.
- Cue source: bundled preset `cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json` (~120 BPM). Strong-cue locks: 17.02s, 18.52s. Beat grid used for Scene 2 and Scene 4 rows.
- Audio-reactive treatment: none — ruled out for restraint in a polished film; the core's glow moves on a slow deterministic drift instead.
- SFX (Kenney, low HF risk): `ui/rollover2` on each capability row (quiet), `ui/click2` on the button press, `interface/bong_001` when the answer appears, `impact/impactSoft_medium_001` on the wordmark. Scene 4 rows are silent (restraint).
