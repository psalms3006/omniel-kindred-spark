import { cn } from "@/lib/utils";

/**
 * Dark-page ambient art: a faint dotted plotting grid, a cobalt bloom and a
 * single dotted trajectory. Static SVG only — the NOVA stage owns the WebGL.
 */
type Props = { className?: string; variant?: "hero" | "band"; intensity?: number };

const HERO_PLOTS = [
  "M0 470 C 120 430, 180 500, 300 440 S 480 320, 600 360 S 780 250, 900 280 S 1080 170, 1200 210",
  "M0 520 C 160 500, 240 540, 380 480 S 560 400, 700 420 S 900 330, 1040 360 S 1160 300, 1200 320",
];

const BAND_PLOTS = [
  "M0 430 C 140 410, 220 450, 340 410 S 520 350, 650 370 S 830 290, 960 310 S 1120 240, 1200 260",
];

export function Atmosphere({ className, variant = "hero", intensity = 1 }: Props) {
  const plots = variant === "hero" ? HERO_PLOTS : BAND_PLOTS;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
      style={{ opacity: intensity }}
    >
      <div
        className="lab-grid absolute inset-0 opacity-[0.18]"
        style={{
          maskImage: "linear-gradient(to bottom, black, transparent 86%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 86%)",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(47,107,255,0.28),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(56,214,255,0.1),transparent_38%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        fill="none"
        focusable="false"
      >
        <g
          stroke="var(--color-accent)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 8"
          opacity="0.3"
        >
          {plots.map((d) => (
            <path key={d} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g fill="var(--color-accent)" opacity="0.4">
          <circle cx="300" cy="440" r="2.5" />
          <circle cx="600" cy="360" r="2.5" />
          <circle cx="900" cy="280" r="2.5" />
        </g>
      </svg>
    </div>
  );
}
