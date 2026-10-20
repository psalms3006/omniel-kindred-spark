import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/lib/omniel";
import omnielWordmark from "@/assets/omniel-wordmark.png";
import { cn } from "@/lib/utils";

/** Desktop links. About and Contact live in the footer / right side respectively. */
const HEADER_LINKS = ["/products", "/technology", "/research", "/careers"] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    firstMenuLink.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = navigation.filter((item) => (HEADER_LINKS as readonly string[]).includes(item.to));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:text-accent-foreground"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
        <div
          className={cn(
            "relative mx-auto flex h-16 max-w-[72rem] items-center justify-between gap-4 rounded-full border border-hairline px-4 backdrop-blur-xl",
            "transition-[background-color,box-shadow,border-color] duration-300",
            scrolled
              ? "bg-background/85 shadow-[0_18px_50px_-34px_oklch(0.19_0.012_265_/_45%)]"
              : "bg-background/70",
          )}
        >
          <Link to="/" aria-label="OMNIEL home" className="shrink-0">
            <img
              src={omnielWordmark}
              alt="OMNIEL"
              className="h-5 w-auto brightness-0 invert sm:h-6"
            />
          </Link>

          <nav
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex"
          >
            {links.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 mx-auto h-px w-5 bg-accent transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/contact"
              className="hidden text-[0.8rem] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Contact
            </Link>
            <Link
              to="/waitlist"
              className="hidden h-9 items-center rounded-full bg-primary px-4 text-[0.78rem] font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--color-accent)] sm:inline-flex"
            >
              Join waitlist
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full border border-hairline text-foreground lg:hidden"
            >
              <span className="relative block h-3.5 w-4">
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-200",
                    open ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-200",
                    open ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-background px-5 pb-12 pt-28 lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto max-w-md">
              <ul className="divide-y divide-hairline border-y border-hairline">
                {navigation.map((item, index) => (
                  <li key={item.to}>
                    <Link
                      ref={index === 0 ? firstMenuLink : undefined}
                      to={item.to}
                      className="flex items-center justify-between py-5 text-2xl"
                    >
                      {item.label}
                      <span aria-hidden className="text-muted-foreground">
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid gap-3">
                <Link
                  to="/waitlist"
                  className="flex h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  Join the NOVA waitlist
                </Link>
                <Link
                  to="/contact"
                  className="flex h-12 items-center justify-center rounded-full border border-hairline px-5 text-sm font-medium"
                >
                  Contact OMNIEL
                </Link>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
