import { lazy, Suspense, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { ClientOnly } from "./client-only";

const NeonDither = lazy(() => import("@/components/ui/neon-dither"));

/**
 * The hero's animated ground. The static blue wash is always present; the
 * dither shader mounts after hydration and unmounts when the hero leaves the
 * viewport, so it never runs behind the rest of the page.
 */
export function HeroDither() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px" });
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#05070d]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(47,107,255,0.34),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(56,214,255,0.12),transparent_38%)]" />

      {!reduced && inView ? (
        <ClientOnly>
          <Suspense fallback={null}>
            <NeonDither intensity={0.55} parallax className="opacity-80" />
          </Suspense>
        </ClientOnly>
      ) : null}

      {/* Scrim: keeps the headline and subline readable over the moving dither. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(5,7,13,0.9)_0%,rgba(5,7,13,0.62)_42%,transparent_72%)]" />

      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[#05070d]" />
    </div>
  );
}
