import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { Reveal } from "./primitives";
import { products, type ProductSlug } from "@/lib/omniel";

function NovaVisual() {
  return (
    <div>
      <div className="flex items-center gap-2 text-[0.55rem] uppercase tracking-[0.14em] text-ember">
        <Mic className="h-3 w-3" />
        General assistant / online + offline
      </div>
      <div className="mt-4 flex h-10 items-end gap-1" aria-hidden="true">
        {[32, 56, 78, 42, 88, 52, 70, 36, 84, 58, 30, 66].map((height, index) => (
          <span
            key={index}
            className="w-1.5 rounded-full bg-ember/60"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <p className="mt-3 text-[0.62rem] text-muted-foreground">&quot;Plan my day.&quot;</p>
      <p className="mt-1 text-[0.62rem] text-foreground">
        Three priorities, one plan. Still useful offline.
      </p>
    </div>
  );
}

function VyrenVisual() {
  return (
    <div className="font-mono text-[0.62rem] leading-relaxed text-muted-foreground">
      <p className="text-foreground">src/agent/plan.ts</p>
      <p>
        <span className="text-signal-2">const</span> plan ={" "}
        <span className="text-signal">await</span> reason(task);
      </p>
      <p>
        <span className="text-signal-2">for</span> (step <span className="text-signal-2">of</span>{" "}
        plan) {"{"}
      </p>
      <p className="pl-4">await execute(step);</p>
      <p>{"}"}</p>
      <p className="text-accent">✓ 6 steps verified</p>
    </div>
  );
}

function ArvoVisual() {
  return (
    <div>
      <div className="flex h-10 items-end gap-1" aria-hidden="true">
        {[30, 54, 76, 42, 88, 60, 96, 46, 70, 38, 82, 56].map((height, index) => (
          <span
            key={index}
            className="w-1.5 rounded-full bg-ember/60"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <p className="mt-3 text-[0.65rem] text-muted-foreground">
        &quot;Keep going. I&apos;m listening.&quot;
      </p>
      <p className="mt-1 text-[0.55rem] uppercase tracking-[0.14em] text-ember">
        Continuous / voice-first
      </p>
    </div>
  );
}

const visuals: Record<string, ReactNode> = {
  nova: <NovaVisual />,
  vyren: <VyrenVisual />,
  arvo: <ArvoVisual />,
};

export function ProductShowcase() {
  const featured = products.filter((product) =>
    (["nova", "vyren", "arvo"] as ProductSlug[]).includes(product.slug),
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {featured.map((product, index) => (
        <Reveal key={product.slug} delay={index * 0.08} className="h-full">
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="neo-glass group flex h-full flex-col rounded-3xl p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--neo-shadow)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-3xl leading-none tracking-[-0.02em]">
                  {product.name}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {product.slug === "nova"
                    ? "General assistant, designed to work online and offline."
                    : product.role}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-foreground/20 px-3 py-1 text-[0.56rem] uppercase tracking-[0.14em] text-ember">
                {product.kind}
              </span>
            </div>

            <div className="mt-6 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
              {visuals[product.slug]}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                {product.status}
              </span>
              <span
                aria-hidden
                className="text-accent transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
