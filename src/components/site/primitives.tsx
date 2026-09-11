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

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px -8% 0px" });
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  // Failsafe: never leave content invisible.
  //
  // This holds its children at opacity 0 until IntersectionObserver reports
  // them in view. If that never fires -- the observer is unavailable, the
  // element is measured at zero height during a layout pass, the page is
  // restored mid-scroll, or hydration is delayed -- the content stays
  // permanently invisible while sitting in the DOM, which is worse than
  // having no animation at all. Observed twice in review as a blank region
  // where a whole section should be.
  //
  // After a second, reveal regardless. An entrance animation is an
  // enhancement; the content is the point.
  const [forceVisible, setForceVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const shown = inView || forceVisible;

  const anim = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 26, filter: "blur(6px)" },
        animate: shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 26 },
        transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
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
      <h2 className="text-balance-tight text-3xl leading-[1.08] sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {lede ? (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
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
        "glass rounded-3xl p-6 md:p-8",
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-accent/40",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

const actionBase =
  "group inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export function ActionLink({
  to,
  href,
  params,
  children,
  variant = "primary",
  className,
}: {
  to?: string;
  href?: string;
  params?: Record<string, string>;
  children: ReactNode;
  variant?: "primary" | "ghost" | "quiet";
  className?: string;
}) {
  const styles = cn(
    actionBase,
    variant === "primary" &&
      "bg-primary px-6 py-3 text-primary-foreground hover:shadow-[0_16px_50px_-18px_var(--ion)] hover:brightness-110",
    variant === "ghost" &&
      "panel px-6 py-3 text-foreground hover:border-accent/50 hover:bg-surface-strong",
    variant === "quiet" && "text-muted-foreground hover:text-foreground",
    className,
  );

  const inner = (
    <>
      {children}
      <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
        →
      </span>
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
    <header className="relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-48">
      {/* Every page opens in the same environment.
          A design language that stops at the landing page is not a design
          language -- it is a landing page. This is the one component every
          inner route already renders its title through, so putting the
          environment here is what makes About, Technology, Research, Careers,
          Contact, Privacy and Terms belong to the same site as the homepage,
          without touching any of them. */}
      <Atmosphere variant="band" intensity={0.7} />
      <Shell className="relative">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-balance-tight mt-6 max-w-4xl text-4xl leading-[1.04] sm:text-5xl md:text-7xl">
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
