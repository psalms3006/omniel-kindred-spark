import { Eye, Layers, MousePointer2, PenTool, Sparkles, Square, Type } from "lucide-react";

const tools = [
  { icon: MousePointer2, label: "Select" },
  { icon: PenTool, label: "Pen" },
  { icon: Square, label: "Shape" },
  { icon: Type, label: "Type" },
] as const;

const layers = ["Poster 01", "Type — NOVA", "Grain", "Colour grade"] as const;

/** Neobrutalist glass editor for the beige "Made for Creatives" section. */
export function CreativeEditor() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_60%_30%,rgba(110,48,56,0.14),transparent_62%)] blur-2xl"
      />

      <div className="neo-glass relative overflow-hidden rounded-3xl">
        <div className="flex items-center gap-1.5 border-b border-hairline px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="h-2 w-2 rounded-full bg-sage" />
          <span className="h-2 w-2 rounded-full bg-surface-strong" />
          <span className="ml-2 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
            studio / poster-01
          </span>
          <span className="ml-auto rounded-full bg-accent px-3 py-1 text-[0.55rem] font-medium uppercase tracking-[0.12em] text-accent-foreground">
            Export
          </span>
        </div>

        <div className="grid sm:grid-cols-[2.6rem_1fr_7.5rem]">
          <div className="flex flex-row gap-1 border-b border-hairline p-2 sm:flex-col sm:border-b-0 sm:border-r">
            {tools.map((tool, index) => (
              <span
                key={tool.label}
                aria-label={tool.label}
                className={
                  index === 0
                    ? "grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"
                    : "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground"
                }
              >
                <tool.icon className="h-3.5 w-3.5" strokeWidth={1.7} />
              </span>
            ))}
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-hairline bg-[radial-gradient(circle_at_34%_28%,#e3dccf,#8a3b42_46%,#1a1a18)]">
                <span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#faf6ee]/80 blur-[1px]" />
                <span className="absolute bottom-2 left-2 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-white/70">
                  01 / Signal
                </span>
              </div>

              <div className="relative aspect-square overflow-hidden rounded-xl border border-hairline bg-[#1a1a18]">
                <span className="absolute left-3 top-3 h-12 w-12 rounded-full bg-[#f2ebde]" />
                <span className="absolute bottom-4 right-3 h-16 w-10 rotate-12 rounded-sm bg-[#6e3038]" />
                <span className="absolute bottom-3 left-3 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-white/60">
                  02 / Form
                </span>
              </div>

              <div className="relative col-span-2 aspect-[2/1] overflow-hidden rounded-xl border border-hairline bg-[linear-gradient(180deg,#1a1a18_0%,#3a2a22_52%,#6e3038_100%)]">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[repeating-linear-gradient(90deg,transparent_0_12px,rgba(233,223,208,0.35)_12px_13px)] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
                <span className="absolute left-4 top-3 font-display text-2xl text-white">NOVA</span>
                <span className="absolute bottom-3 right-3 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-white/70">
                  03 / Horizon
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-hairline bg-foreground/[0.03] px-3 py-2">
              <span className="text-[0.62rem] text-muted-foreground">Selected / Poster 01</span>
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded-full bg-accent" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#a9b5a4]" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#1a1a18]" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#f2ebde]" />
              </span>
            </div>
          </div>

          <div className="hidden border-l border-hairline p-3 sm:block">
            <p className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
              <Layers className="h-3 w-3" /> Layers
            </p>
            <ul className="mt-2 space-y-1.5">
              {layers.map((layer, index) => (
                <li
                  key={layer}
                  className={
                    index === 0
                      ? "flex items-center justify-between rounded-lg bg-accent px-2 py-1 text-[0.58rem] text-accent-foreground"
                      : "flex items-center justify-between rounded-lg px-2 py-1 text-[0.58rem] text-muted-foreground"
                  }
                >
                  <span className="truncate">{layer}</span>
                  <Eye className="h-3 w-3 shrink-0" strokeWidth={1.6} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="neo-glass absolute -bottom-4 left-4 flex items-center gap-2 rounded-xl px-3 py-2 text-[0.6rem] uppercase tracking-[0.12em]">
        <Sparkles className="h-3 w-3 text-accent" />
        <span className="text-accent">12</span> variants ready
      </div>
    </div>
  );
}
