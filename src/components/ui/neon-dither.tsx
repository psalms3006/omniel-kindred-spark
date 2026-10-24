import { useEffect, useMemo, useRef } from "react";
import { Dithering } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";

/**
 * Hero dither, adapted from the 21st.dev component.
 *
 * The original is a fixed full-page background with system light/dark modes and
 * a gold/light palette. Here it is:
 *  - scoped to the hero (absolute, not fixed);
 *  - always dark, with a cobalt → cyan front colour;
 *  - free of the global `.dark` class toggle (the site is fixed dark);
 *  - mounted only while the hero is in view.
 */
type Props = {
  intensity?: number;
  parallax?: boolean;
  className?: string;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function mix(a: string, b: string, t: number): string {
  const ai = parseInt(a.replace("#", ""), 16);
  const bi = parseInt(b.replace("#", ""), 16);
  const ar = (ai >> 16) & 0xff;
  const ag = (ai >> 8) & 0xff;
  const ab = ai & 0xff;
  const br = (bi >> 16) & 0xff;
  const bg = (bi >> 8) & 0xff;
  const bb = bi & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1)}`;
}

export function NeonDither({ intensity = 0.68, parallax = true, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const t = clamp(intensity);
  const front = useMemo(() => mix("#6E3038", "#5A6B5C", t * 0.45), [t]);

  useEffect(() => {
    if (!parallax) return;
    const root = ref.current;
    if (!root) return;

    const strength = 6;
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      root.style.setProperty("--dither-x", `${(-x * strength).toFixed(2)}px`);
      root.style.setProperty("--dither-y", `${(-y * strength).toFixed(2)}px`);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [parallax]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-[#f2ebde]", className)}
      style={{
        transform: parallax ? "translate3d(var(--dither-x,0), var(--dither-y,0), 0)" : undefined,
        willChange: parallax ? "transform" : undefined,
      }}
    >
      <Dithering
        colorBack="#f2ebde"
        colorFront={front}
        speed={0.18 + t * 0.22}
        shape="wave"
        type="4x4"
        size={Math.round(2 + t * 2)}
        scale={1.05 + t * 0.12}
        style={{ width: "100%", height: "100%" }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(60% 40% at 50% 40%, rgba(110,48,56,0.10), transparent 70%)",
          mixBlendMode: "multiply",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 50%, rgba(242,235,222,0) 55%, rgba(242,235,222,0.55) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 35%)",
        }}
      />
    </div>
  );
}

export default NeonDither;
