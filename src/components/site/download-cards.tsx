import { Download, Laptop, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const platforms = [
  {
    name: "macOS",
    note: "Apple silicon and Intel",
    icon: Laptop,
    status: "Coming soon",
    action: "Not available yet",
    href: null,
  },
  {
    name: "Windows",
    note: "Windows 10 and 11",
    icon: Monitor,
    status: "Coming Soon",
    action: "Join the Waitlist",
    href: "#waitlist",
  },
] as const;

function CardContent({ platform }: { platform: (typeof platforms)[number] }) {
  const Icon = platform.icon;
  const emphasized = platform.href !== null;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Icon
          className={cn("h-5 w-5", emphasized ? "text-accent-foreground" : "text-accent")}
          strokeWidth={1.6}
        />
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-[0.55rem] uppercase tracking-[0.14em]",
            emphasized
              ? "border-accent/20 bg-background font-semibold text-accent"
              : "border-hairline text-muted-foreground",
          )}
        >
          {platform.status}
        </span>
      </div>

      <p
        className={cn(
          "mt-7 font-display text-2xl leading-none",
          emphasized && "text-accent-foreground",
        )}
      >
        {platform.name}
      </p>
      <p
        className={cn(
          "mt-2 text-sm",
          emphasized ? "text-accent-foreground/75" : "text-muted-foreground",
        )}
      >
        {platform.note}
      </p>

      {emphasized ? (
        <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-background px-3.5 py-2 text-xs font-semibold text-accent">
          <Download className="h-3.5 w-3.5" />
          {platform.action}
        </span>
      ) : (
        <div className="mt-7 flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
          <Download className="h-3.5 w-3.5" />
          {platform.action}
        </div>
      )}
    </>
  );
}

export function DownloadCards() {
  return (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      {platforms.map((platform) =>
        platform.href ? (
          <a
            key={platform.name}
            href={platform.href}
            className="neo relative rounded-2xl bg-accent p-6 text-accent-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <CardContent platform={platform} />
          </a>
        ) : (
          <div
            key={platform.name}
            aria-disabled="true"
            className="neo-glass cursor-not-allowed rounded-2xl p-6 opacity-80"
          >
            <CardContent platform={platform} />
          </div>
        ),
      )}
    </div>
  );
}
