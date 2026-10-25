import { cn } from "@/lib/utils";

const LAYERS = 16;

/**
 * A 3D extruded NOVA mark.
 *
 * The 2D PNG's alpha channel is used as a mask on a stack of faces; the stack
 * is rotated in CSS 3D, so it reads as a rendered mark without shipping a 3D
 * engine. The front face carries the cream/oxblood gradient; the extruded
 * layers use oxblood and olive.
 */
export function NovaIcon3D({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative mx-auto aspect-square w-36 [perspective:700px] md:w-44", className)}
    >
      <div className="nova-spin relative h-full w-full [transform-style:preserve-3d]">
        {Array.from({ length: LAYERS }, (_, index) => {
          const front = index === LAYERS - 1;
          const z = (index - (LAYERS - 1)) * 1.6;

          return (
            <span
              key={index}
              className="absolute inset-0"
              style={{
                transform: `translateZ(${z}px)`,
                background: front
                  ? "linear-gradient(145deg, #f2ebde 0%, #c97a82 46%, #6e3038 100%)"
                  : index % 4 === 0
                    ? "var(--olive)"
                    : "var(--accent)",
                WebkitMaskImage: "url(/nova-mark.png)",
                maskImage: "url(/nova-mark.png)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                filter: front ? "drop-shadow(0 12px 18px rgba(0, 0, 0, 0.35))" : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
