import omnielMark from "@/assets/omniel-mark.png";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "rust" | "sand";
}) {
  const color =
    tone === "rust" ? "var(--accent)" : tone === "sand" ? "var(--background)" : "var(--foreground)";

  return (
    <span
      aria-hidden="true"
      className={cn("block", className)}
      style={{
        backgroundColor: color,
        WebkitMaskImage: `url(${omnielMark})`,
        maskImage: `url(${omnielMark})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
