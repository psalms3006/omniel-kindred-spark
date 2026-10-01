import { cn } from "@/lib/utils";

/**
 * A product mark presented as a liquid-glass app icon: a translucent rounded
 * tile with a specular sheen, a bright rim, and a soft cast shadow.
 */
export function AppIcon({ src, className }: { src: string; className?: string }) {
  return (
    <div className={cn("relative aspect-square", className)}>
      {/* cast shadow on the surface below */}
      <div
        aria-hidden
        className="absolute inset-x-[12%] -bottom-[14%] h-[22%] rounded-[50%] bg-black/70 blur-xl"
      />
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[27%] border border-white/25 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 42%, rgba(0,0,0,0.25) 100%)",
          boxShadow:
            "0 18px 40px -12px rgba(0,0,0,0.85), 0 6px 14px -6px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -10px 24px rgba(0,0,0,0.35)",
        }}
      >
        {/* specular sheen across the top */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/2 rounded-b-[60%]"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))" }}
        />
        <img
          src={src}
          alt=""
          className="relative h-[62%] w-[62%] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]"
        />
      </div>
    </div>
  );
}
