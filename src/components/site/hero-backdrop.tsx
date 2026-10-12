import intelligenceCore from "@/assets/omniel-intelligence-core.jpg";
import { cn } from "@/lib/utils";

/**
 * The intelligence core, used as the hero's ground rather than as a framed
 * panel beside the text.
 *
 * Three layers, in order:
 *  1. the image, anchored right so the monolith sits in the open half of the
 *     layout and the headline never lands on top of it;
 *  2. a horizontal scrim carrying the left edge to near-solid background,
 *     which is what keeps display type and body copy readable over a
 *     photographic ground;
 *  3. a vertical scrim resolving the top and bottom edges into the page so the
 *     hero does not end on a hard seam.
 *
 * The source is 1408px square. It is deliberately not stretched past its
 * natural height on very wide screens: `cover` on a square source at 2560px
 * softens visibly. The image holds the right of the frame and the scrim owns
 * the rest, which keeps it sharp at any width.
 */
export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-cover bg-[center_right] bg-no-repeat opacity-[0.6] md:bg-[length:auto_112%] md:opacity-80"
        style={{ backgroundImage: `url(${intelligenceCore})` }}
      />

      {/* Left-to-right scrim. Solid where the words are, clear where the
          object is. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg," +
            " var(--background) 0%," +
            " color-mix(in oklab, var(--background) 94%, transparent) 30%," +
            " color-mix(in oklab, var(--background) 58%, transparent) 58%," +
            " color-mix(in oklab, var(--background) 26%, transparent) 100%)",
        }}
      />

      {/* Top and bottom falloff, plus one restrained lichen cast so the core's
          green glass sits with OMNIEL's own light rather than beside it. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg," +
            " color-mix(in oklab, var(--background) 74%, transparent) 0%," +
            " transparent 26%," +
            " transparent 64%," +
            " var(--background) 100%)," +
            "radial-gradient(68% 58% at 76% 46%," +
            " color-mix(in oklab, var(--accent) 9%, transparent) 0%," +
            " transparent 70%)",
        }}
      />
    </div>
  );
}
