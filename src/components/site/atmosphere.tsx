import { cn } from "@/lib/utils";

/**
 * Ambient art for inner-page headers: a warm dotted grid, a rust wash and a
 * quiet olive counterweight. Static SVG only.
 */
type Props = { className?: string; variant?: "hero" | "band"; intensity?: number };

export function Atmosphere({ className, variant = "hero", intensity = 1 }: Props) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
      style={{ opacity: intensity }}
    >
      <div
        className="lab-grid absolute inset-0 opacity-25"
        style={{
          maskImage: "linear-gradient(to bottom, black, transparent 88%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 88%)",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(110,48,56,0.10),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_78%,rgba(90,107,92,0.09),transparent_40%)]" />

      {variant === "hero" ? (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          fill="none"
          focusable="false"
        >
          <path
            d="M0 470 C 160 440, 250 500, 400 450 S 650 370, 800 390 S 1030 320, 1200 340"
            stroke="var(--color-accent)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeDasharray="2 9"
            opacity="0.25"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
    </div>
  );
}
