import { lazy, Suspense, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { ClientOnly } from "./client-only";

const ElectricWavesShader = lazy(() => import("@/components/ui/colorful-wave-pattern-1"));

function StaticWaves() {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-[#1a1a18]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(110,48,56,0.35),transparent_58%)]" />
      <div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_center,transparent_0_38px,rgba(201,122,130,0.10)_39px_40px)] opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(26,26,24,0.7))]" />
    </div>
  );
}

/**
 * The NOVA page's single primary animation: warm impact waves on obsidian.
 * Lazy-loaded, client-only, paused offscreen, with a static fallback.
 */
export function NovaWaves({ fade = true }: { fade?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px" });
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#1a1a18]"
    >
      <StaticWaves />

      {!reduced && inView ? (
        <ClientOnly>
          <Suspense fallback={null}>
            <ElectricWavesShader
              waveCount={6}
              amplitude={0.12}
              frequency={2.4}
              brightness={0.006}
              colorSeparation={0.12}
            />
          </Suspense>
        </ClientOnly>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,rgba(26,26,24,0.7)_80%)]" />
      {fade ? (
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#f2ebde]" />
      ) : null}
    </div>
  );
}
