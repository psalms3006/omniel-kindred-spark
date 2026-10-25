import {
  CalendarCheck,
  FolderOpen,
  Mic,
  Monitor,
  Pause,
  PenLine,
  Play,
  Search,
  Terminal,
  WifiOff,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const capabilities = [
  {
    icon: WifiOff,
    label: "Offline models",
    copy: "Keeps working when the connection doesn't.",
  },
  {
    icon: Mic,
    label: "Always-on voice",
    copy: "A companion that stays in the room.",
  },
  {
    icon: FolderOpen,
    label: "Files & folders",
    copy: "The mess, organized.",
  },
  {
    icon: CalendarCheck,
    label: "Calendar & follow-ups",
    copy: "Nothing left hanging.",
  },
  {
    icon: Search,
    label: "Research",
    copy: "The reading, done.",
  },
  {
    icon: PenLine,
    label: "Writing",
    copy: "The first draft, started.",
  },
  {
    icon: Monitor,
    label: "Your desktop",
    copy: "Apps, clicks, tabs — handled.",
  },
  {
    icon: Terminal,
    label: "Code & terminal",
    copy: "The tools you already use.",
  },
] as const;

function CapabilityCard({
  capability,
  index,
}: {
  capability: (typeof capabilities)[number];
  index: number;
}) {
  const Icon = capability.icon;

  return (
    <article className="w-[18rem] shrink-0 rounded-2xl border border-hairline bg-card/70 p-5 md:w-[20rem]">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-hairline bg-background/60 text-accent">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <h3 className="mt-5 font-display text-xl leading-tight">{capability.label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{capability.copy}</p>
    </article>
  );
}

export function CapabilityRail() {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const animate = !reduced;

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-title"
      className="border-y border-hairline bg-surface/50 py-14 md:py-20"
    >
      <div className="shell flex items-end justify-between gap-6">
        <h2
          id="capabilities-title"
          className="max-w-2xl text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.05]"
        >
          The work we build for.
        </h2>

        {animate ? (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="hidden shrink-0 items-center gap-2 rounded-full border border-hairline px-3.5 py-2 text-[0.7rem] font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground md:inline-flex"
            aria-label={paused ? "Play capability cards" : "Pause capability cards"}
          >
            {paused ? (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {paused ? "Play" : "Pause"}
          </button>
        ) : null}
      </div>

      <div className="mt-8 overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] md:overflow-hidden">
        <div
          className={cn("flex w-max gap-4 px-4 md:px-6", animate && "capability-marquee")}
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className={cn("flex gap-4 pr-4", copy === 1 && "hidden md:flex")}
              aria-hidden={copy === 1 ? "true" : undefined}
            >
              {capabilities.map((capability, index) => (
                <CapabilityCard
                  key={`${copy}-${capability.label}`}
                  capability={capability}
                  index={index}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
