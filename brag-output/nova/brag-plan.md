# Brag Plan: NOVA — "Coming online"

## What is this app?
NOVA is OMNIEL's voice-first assistant for the computer: it listens, looks at the screen, remembers, and sends agents to do the work (research, browser, files) — presented through a living particle orb. It is in development.

## Source of truth (read, never modified)
`C:\Users\Lenovo\project-nova\desk\ui` — the real NOVA desktop interface:
- `components/three/SpatialCanvas.tsx` — the orb: Fibonacci-sphere particles (r = 35), tilted ring (r = 43), per-state motion (pulse, amplitude, phase, ring tilt/scale/spin, tint toward accent while working/looking).
- `nova/visual.ts` — the 15 visual states and their parameter targets (SLEEPING, AWAKENING, IDLE, LISTENING, VISION, MEMORY_RETRIEVAL, TOOL_EXECUTION, SPEAKING…).
- `nova/runtime.tsx` — the interface's own words: "Coming online", "Present", "Hearing you", "Looking at the screen", "Recalling", "Remembering that", "Working", "Searching the web", "Opening a page", "Working with files".
- `screens/PresenceScreen.tsx` — layout: status card, Agents panel (NOVA · Research · Browser · Computer · Creative, "standby" / live action, "N running"), orb with state pill, transcript bubbles, Activity feed, input bar "Type to NOVA and press Enter…", footer "NOVA 1.0.0 · online" / "OMNIEL".
- `theme/themes.ts` — default theme **Warm Graphite** (NovaStateContext falls back to it).
- `public/nova-icon.png` — NOVA's app icon (woven star). Note: the website uses a different NOVA mark; this film uses the product's own icon.

## The angle
NOVA's interface literally says "Coming online" when it wakes. The film is that moment, stretched into 25 seconds: NOVA wakes from rest, notices you, listens, looks, recalls, goes to work — and ends on its own honest status: still coming online. Anticipation without a single invented claim.

## Hook (first 2-3 seconds)
Near-black warm graphite. Nothing — then a dim amber particle sphere surfaces from rest (NOVA's real SLEEPING → AWAKENING transition: opacity and energy rising, ring appearing). One tiny mono label in the corner: `NOVA · Coming online`.

## Key moments
- It listens: the ring draws in, the pill reads "Hearing you", the visitor's words appear as a live transcript.
- It sees: the ring tilts upright and sweeps (NOVA's real vision state) while a glass "screen" frame is scanned; pill "Looking at the screen".
- It remembers: pill "Recalling"; an Activity card surfaces the recalled preference in NOVA's own format.
- It works: the Agents panel lights up one agent at a time — Research "Searching the web", Browser "Opening a page", Computer "Working with files" — "3 running"; the orb warms and spins with tool energy.

## Outro
Pull back to the whole NOVA interface (one coherent frame, not a checklist), then darkness, the orb small and calm, the NOVA icon and name, and the mono status "Coming online" with a live amber dot. Signature: "In development · An OMNIEL product" + OMNIEL wordmark.

## User flow worth showing
Wake → speak ("Can you look at my screen?") → NOVA looks → recalls a preference → dispatches agents → working. Every state and label is taken from the NOVA source.

## Tone
- Preset: cinematic (restrained)
- Creative direction: "a product waking up" — premium anticipation teaser, not a trailer
- Interpretation: slow, dark, patient opening; the middle gains energy only when NOVA works; no booms, no neon, text only where the product itself shows text.

## Format: landscape — 1920x1080
## Duration: 25.5s

## Visual identity (from NOVA, Warm Graphite)
- Background `#101012`, elevated `#17171a`, glass `rgba(24,23,27,0.68)`, glass border `rgba(235,215,185,0.10)`
- Text `#faf8f5`, secondary `#d5cfc7`, muted `#878077`
- Accent (champagne / amber core) `#dfc096`, accent muted `#a38d70`; orb particles `#dfc096` → `#b89972`; ring `#d5cfc7`
- Live dot green (listening) as in the interface
- Fonts: Space Grotesk (UI / display), Inter (body), JetBrains Mono (labels)
- OMNIEL continuity: the OMNIEL wordmark and "An OMNIEL product" sign-off; mono uppercase labels shared with the OMNIEL site

## Share copy (draft)
NOVA is coming online. A voice-first assistant from OMNIEL that listens, looks at your screen, remembers, and gets to work. In development.

## Audio direction
- Role: restrained cinematic bed — low atmospheric texture with a slow pulse
- Music: bundled `happy-beats-business-moves-vol-1` low-passed and lowered to a distant pulse, layered with a generated low drone (A1/E2) that swells as NOVA wakes and at the reveal — made locally with ffmpeg, deterministic
- Music treatment: near-silent open, drone swell 0–3s, pulse present through the middle, lifts slightly for "It works", falls to drone for the reveal, fade out
- Music cue guidance: vol-1 preset (~120 BPM, beats from 3.02s). Agent activations on beats ≈ 15.02, 16.02, 17.02s (every other beat, each label holds ≥1.2s). Reveal wordmark near strong cue 23.02s.
- Audio-reactive treatment: none (orb motion is driven by NOVA's own state parameters, the more honest choice)
- SFX (Kenney, low HF risk): soft click on each state-pill change, tick for transcript words, `bong` when memory surfaces, `rollover2` for each agent starting, one `impactSoft_medium` at the reveal. Restraint: nothing louder than the bed.

## Storyboard

### Scene 1 — Coming online — 3.0s (0.0–3.0)
Dark. Orb rises from rest: opacity 0 → 1, energy up, ring fades in. Corner mono `NOVA · Coming online`.
Sequential/interaction: none. Audio: drone swell. Transition: soft → 2.

### Scene 2 — Present — 2.5s (3.0–5.5)
Orb breathing at rest, centred; the state pill below reads "● Present". No other text.
Audio: pulse enters. Transition: none (same shot continues).

### Scene 3 — It listens — 3.3s (5.5–8.8)
Pill → "● Hearing you" (green dot); ring draws inward and brightens (listenRings); user transcript bubble writes on word by word: "Can you look at my screen?" (holds ≥1.5s).
Audio: tick per word, click on pill change. Transition: continuous.

### Scene 4 — It sees — 3.0s (8.8–11.8)
Pill → "● Looking at the screen"; ring tilts upright and sweeps; orb tints toward accent. A glass window frame slides in left of the orb with a scan band passing over abstract content lines. NOVA bubble: "I can see it."
Audio: click. Transition: continuous.

### Scene 5 — It remembers — 2.5s (11.8–14.3)
Pill → "● Recalling"; Activity card slides in on the right: `memory · now` / "Recalling — You like plans before 9am." (neutral example, NOVA's real format).
Audio: bong. Transition: continuous.

### Scene 6 — It works — 4.5s (14.3–18.8)
Pill → "● Working"; orb warms, spins with tool energy. Agents panel slides in left: NOVA, Research, Browser, Computer, Creative. Research → "Searching the web" (15.02), Browser → "Opening a page" (16.02), Computer → "Working with files" (17.02); header "3 running". Full panel holds ≥1.3s.
Audio: rollover2 per agent. Transition: pull back → 7.

### Scene 7 — All of it, together — 2.5s (18.8–21.3)
Camera pulls back: the whole NOVA interface in one frame — top bar (● NOVA / Connected / Presence), status card, agents, orb with pill, transcript, activity, input bar, footer "NOVA 1.0.0 · online" / "OMNIEL".
Audio: bed at its fullest, no SFX. Transition: dissolve to dark → 8.

### Scene 8 — Coming online — 4.2s (21.3–25.5)
Interface dissolves; orb small and calm above centre. NOVA icon + "NOVA" (Space Grotesk). Mono status "● Coming online" with a live amber dot. Then small: "In development · An OMNIEL product" + OMNIEL wordmark (near 23.02s cue). Hold to end.
Audio: pulse drops out, drone + one soft impact at the name; fade out.

Duration check: 3.0 + 2.5 + 3.3 + 3.0 + 2.5 + 4.5 + 2.5 + 4.2 = 25.5s.

## Honesty guardrails
- Every capability shown exists in NOVA's code (voice session, look_at_screen, recall_memory/remember_fact, research/browser/computer agents, activity feed).
- The transcript, "I can see it.", and the recalled preference are illustrative content, not claims of a benchmark or a finished release. No personal data from the real app appears.
- No performance figures, no launch date. The film ends on "Coming online" / "In development".
