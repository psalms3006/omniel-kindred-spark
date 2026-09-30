# Hyperframes Composition Brief: NOVA — "Coming online"

Contract: `brag-plan.md` (storyboard, sources, honesty guardrails). Output: `nova.mp4` (1920x1080, 25.5s), poster `nova-poster.jpg`, project `composition/`.

## Source material (read-only)
`C:\Users\Lenovo\project-nova\desk\ui` — orb (`SpatialCanvas.tsx`), states (`nova/visual.ts`), wording (`nova/runtime.tsx`), layout (`PresenceScreen.tsx`), Warm Graphite theme (`theme/themes.ts`), app icon (`public/nova-icon.png`), fonts (@fontsource Space Grotesk / Inter / JetBrains Mono from its node_modules), Three.js 0.186 (`build/three.module.js`, vendored locally).

## Implementation decisions
- The orb is a deterministic port of `SpatialCanvas`: same Fibonacci sphere, ring, pulse/amplitude/phase formulas, tint and ring behaviour, driven by NOVA's own state targets on a scripted schedule (SLEEPING → AWAKENING → IDLE → LISTENING → VISION → SPEAKING → MEMORY_RETRIEVAL → TOOL_EXECUTION → SUCCESS → IDLE). Seeded randomness; rotation rates integrated so state changes never jump; rendered from HyperFrames time (`hf-seek`).
- The interface (HUD, pill, transcript, Activity, Agents, status card, rail, input bar, footer) is rebuilt in HTML from `PresenceScreen` with NOVA's wording; GSAP drives it.
- Audio: `assets/music/nova-bed.wav` — generated low drone (A1/E2) + the bundled vol-1 track low-passed to a distant pulse, enveloped to the story; Kenney SFX (click_003, bong_001, rollover2, impactSoft_medium_001), all low HF risk.
- Beat use: agents start on 15.02 / 16.02 / 17.02s; signature on the 23.02s strong cue.
- Audio-reactive: none — orb motion follows NOVA's own state parameters instead.

## Gate
`npx hyperframes check` passed (0 errors; 71/71 WCAG AA text checks; remaining info findings are the intended label crossfades). Snapshots of all eight scenes and a frame grid of the final render were inspected.
