import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Full hero treatment: sky, horizon glow, layered terrain, haze.
   *  "band" is the quieter version for section headers -- sky and glow only,
   *  no terrain, so it reads as continuous atmosphere rather than a second
   *  landscape competing with the first. */
  variant?: "hero" | "band";
  /** 0..1. Pull it down wherever the atmosphere sits close to body text. */
  intensity?: number;
};

/**
 * The OMNIEL atmosphere — a twilight horizon, drawn rather than photographed.
 *
 * The two reference directions are a soft-focus lilac dusk and a warm, earthy
 * editorial landscape. They are not actually opposites: they are the same
 * scene at two moments. This is the moment they share — a cool lilac sky over
 * warm ground, with the sun just below the horizon lighting the boundary
 * between them.
 *
 * WHY IT IS DRAWN, NOT PHOTOGRAPHED
 *
 * The references are carried by commissioned photography and 3D renders.
 * OMNIEL has neither, and a stock landscape would say nothing about the
 * company while costing hundreds of kilobytes. This is built from gradients
 * and blurred SVG paths: a few kilobytes, resolution-independent, recoloured
 * by changing a token, and it cannot pixellate on a large display.
 *
 * It is also honest about what it is. It does not pretend to be a photograph
 * of somewhere; it is an abstract horizon, which is the right register for a
 * company whose subject is infrastructure rather than places.
 *
 * Everything here is static. No canvas, no animation frame, no scroll
 * listener. The only motion is a very slow drift on the haze, which is
 * disabled under prefers-reduced-motion by the global rule in styles.css.
 */
export function Atmosphere({ className, variant = "hero", intensity = 1 }: Props) {
  const hero = variant === "hero";

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
      style={{ opacity: intensity }}
    >
      {/* Sky: cool lilac at altitude, warming as it approaches the horizon. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--env-high) 0%, var(--env-mid) 42%, var(--env-low) 72%, var(--env-horizon) 100%)",
        }}
      />

      {/* The sun below the horizon. Off-centre, because a centred light source
          reads as a lamp rather than a sunset. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background: "radial-gradient(60% 100% at 68% 100%, var(--env-glow), transparent 70%)",
        }}
      />

      {hero && (
        <>
          {/* Terrain. Three ridges, each softer and cooler than the one in
              front, which is what actually produces depth -- aerial
              perspective, not blur alone. */}
          <svg
            className="absolute inset-x-0 bottom-0 h-[58%] w-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M0 96 C 180 56, 320 112, 520 84 C 720 56, 900 106, 1120 78 C 1280 58, 1380 84, 1440 74 L1440 320 L0 320 Z"
              fill="var(--ridge-far)"
              opacity="0.55"
              style={{ filter: "blur(14px)" }}
            />
            <path
              d="M0 158 C 220 122, 400 172, 640 148 C 880 124, 1060 170, 1280 144 C 1360 134, 1410 144, 1440 140 L1440 320 L0 320 Z"
              fill="var(--ridge-mid)"
              opacity="0.75"
              style={{ filter: "blur(8px)" }}
            />
            <path
              d="M0 226 C 260 200, 480 238, 760 218 C 1020 200, 1220 236, 1440 214 L1440 320 L0 320 Z"
              fill="var(--ridge-near)"
              style={{ filter: "blur(3px)" }}
            />
          </svg>

          {/* Ground haze: the soft-focus band where terrain meets light. */}
          <div
            className="absolute inset-x-0 bottom-0 h-[46%] motion-safe:animate-[haze-drift_38s_ease-in-out_infinite]"
            style={{
              background:
                "linear-gradient(0deg, var(--haze) 0%, color-mix(in oklab, var(--haze) 35%, transparent) 55%, transparent 100%)",
            }}
          />
        </>
      )}

      {/* Settles the whole frame so foreground text always has ground to sit
          on, whatever the viewport height does to the gradients above. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--env-high) 45%, transparent) 0%, transparent 30%)",
        }}
      />
    </div>
  );
}
