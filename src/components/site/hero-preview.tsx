import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function WindowCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("neo-glass rounded-2xl", className)}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/** Three product preview windows, echoing the xAI hero silhouette. */
export function HeroPreview() {
  return (
    <div className="relative mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 -top-16 h-40 bg-[radial-gradient(ellipse_at_center,rgba(47,107,255,0.35),transparent_70%)] blur-2xl"
      />

      <WindowCard title="NOVA / Chat" className="md:translate-y-4">
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
            Plan my week.
          </p>
          <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-foreground">Three things matter:</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>
                <span className="text-accent">01</span> Finish the brief — Tue
              </li>
              <li>
                <span className="text-accent">02</span> Review the deck — Wed
              </li>
              <li>
                <span className="text-accent">03</span> Ship the build — Fri
              </li>
            </ul>
          </div>
          <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            Planned in 1.8s
          </p>
        </div>
      </WindowCard>

      <WindowCard title="projects/nova">
        <div className="space-y-1.5 font-mono text-[0.65rem] leading-relaxed">
          <p>
            <span className="text-signal">$</span>{" "}
            <span className="text-foreground">nova run &quot;month-end inventory&quot;</span>
          </p>
          <p className="text-muted-foreground">
            › read orders-oct.csv <span className="text-signal-2">42ms</span>
          </p>
          <p className="text-muted-foreground">
            › reconcile 1,284 SKUs <span className="text-signal-2">1.2s</span>
          </p>
          <p className="text-muted-foreground">› flag 3 variances</p>
          <p className="text-signal">✓ report ready</p>
        </div>
      </WindowCard>

      <WindowCard title="NOVA / Voice" className="md:translate-y-4">
        <div className="flex h-14 items-end gap-1" aria-hidden="true">
          {[38, 62, 84, 48, 92, 58, 74, 42, 88, 64, 36, 70, 52].map((height, index) => (
            <span
              key={index}
              className="w-1.5 rounded-full bg-accent/70"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">&quot;Book the 08:10.&quot;</p>
        <p className="mt-1 text-xs text-foreground">Booked. Confirmation sent.</p>
      </WindowCard>
    </div>
  );
}
