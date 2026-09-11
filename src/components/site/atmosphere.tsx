import { cn } from "@/lib/utils";

type Props = { className?: string; variant?: "hero" | "band"; intensity?: number };

export function Atmosphere({ className, variant = "hero", intensity = 1 }: Props) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
      style={{ opacity: intensity }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,color-mix(in_oklab,var(--color-accent)_13%,transparent),transparent_30%),linear-gradient(120deg,var(--color-background),var(--color-surface)_58%,var(--color-background))]" />
      <div className="lab-grid absolute inset-0 opacity-35" />
      <div className={cn("absolute rounded-full border border-accent/20", variant === "hero" ? "-right-40 top-24 h-[38rem] w-[38rem]" : "-right-56 top-10 h-[28rem] w-[28rem]")} />
      <div className={cn("absolute rounded-full border border-accent/10", variant === "hero" ? "-right-24 top-40 h-[30rem] w-[30rem]" : "-right-36 top-24 h-[22rem] w-[22rem]")} />
    </div>
  );
}