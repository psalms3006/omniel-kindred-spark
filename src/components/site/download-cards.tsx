import { Download, Laptop, Monitor } from "lucide-react";

const platforms = [
  { name: "macOS", note: "Apple silicon and Intel", icon: Laptop },
  { name: "Windows", note: "Windows 10 and 11", icon: Monitor },
] as const;

export function DownloadCards() {
  return (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      {platforms.map((platform) => (
        <div
          key={platform.name}
          aria-disabled="true"
          className="neo-glass cursor-not-allowed rounded-2xl p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <platform.icon className="h-5 w-5 text-accent" strokeWidth={1.6} />
            <span className="rounded-full border border-hairline px-3 py-1 text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
              Coming soon
            </span>
          </div>

          <p className="mt-7 font-display text-2xl leading-none">{platform.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{platform.note}</p>

          <div className="mt-7 flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
            <Download className="h-3.5 w-3.5" />
            Not available yet
          </div>
        </div>
      ))}
    </div>
  );
}
