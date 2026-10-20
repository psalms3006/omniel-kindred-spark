import { Link } from "@tanstack/react-router";
import { Atmosphere } from "./atmosphere";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export function Shell({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("shell", className)}>{children}</div>;
}

type RevealFrom = "bottom" | "left" | "right" | "scale";

const revealOffsets: Record<RevealFrom, { x: number; y: number; scale: number }> = {
  bottom: { x: 0, y: 24, scale: 1 },
  left: { x: -32, y: 0, scale: 1 },
  right: { x: 32, y: 0, scale: 1 },
  scale: { x: 0, y: 0, scale: 0.96 },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  from = "bottom",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
  from?: RevealFrom;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -6% 0px" });
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  // Failsafe: content must never stay invisible if the observer never fires.
  const [forceVisible, setForceVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const shown = inView || forceVisible;
  const offset = revealOffsets[from];

  const anim = reduced
    ? {}
    : {
        initial: { opacity: 0, ...offset },
        animate: shown ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, ...offset },
        transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <MotionTag ref={ref} className={className} {...anim}>
      {children}
    </MotionTag>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
      <h2 className="text-balance-tight text-4xl leading-[0.96] sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative py-24 md:py-32", className)}>
      <Shell>{children}</Shell>
    </section>
  );
}

export function Panel({
  className,
  children,
  interactive = false,
  ...rest
}: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "panel rounded-3xl p-6 md:p-8",
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_20px_60px_-35px_rgba(47,107,255,0.9)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Neobrutalism ∪ glassmorphism. The local theme supplies the border/shadow. */
export function NeoPanel({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div className={cn("neo-glass rounded-2xl p-6 md:p-8", className)} {...rest}>
      {children}
    </div>
  );
}

const actionBase =
  "group inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";

export function ActionLink({
  to,
  href,
  params,
  children,
  variant = "primary",
  className,
  showArrow = true,
}: {
  to?: string;
  href?: string;
  params?: Record<string, string>;
  children: ReactNode;
  variant?: "primary" | "accent" | "ghost" | "quiet";
  className?: string;
  showArrow?: boolean;
}) {
  const styles = cn(
    actionBase,
    variant === "primary" &&
      "bg-primary px-6 py-3 text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-20px_rgba(47,107,255,0.95)]",
    variant === "accent" &&
      "bg-accent px-6 py-3 text-accent-foreground hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-18px_rgba(47,107,255,1)]",
    variant === "ghost" &&
      "border border-foreground/20 bg-foreground/[0.04] px-6 py-3 text-foreground backdrop-blur-xl hover:-translate-y-0.5 hover:border-accent/50 hover:bg-foreground/[0.07]",
    variant === "quiet" && "text-muted-foreground hover:text-foreground",
    className,
  );

  const inner = (
    <>
      {children}
      {showArrow ? (
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a href={href} className={styles} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  const LinkAny = Link as unknown as ComponentType<Record<string, unknown>>;
  return (
    <LinkAny to={to ?? "/"} params={params} className={styles}>
      {inner}
    </LinkAny>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
      <Atmosphere variant="band" intensity={1} />
      <Shell className="relative">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-balance-tight mt-6 max-w-4xl text-5xl leading-[0.96] sm:text-6xl md:text-7xl">
            {title}
          </h1>
          {lede ? (
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</p>
          ) : null}
          {children ? <div className="mt-10 flex flex-wrap gap-3">{children}</div> : null}
        </Reveal>
      </Shell>
    </header>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className="font-display text-3xl tracking-tight md:text-4xl">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
