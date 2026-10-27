import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/lib/omniel";
import omnielWordmarkDarkMetal from "@/assets/omniel-wordmark-dark-metal.webp";
import { cn } from "@/lib/utils";

const NAV_LINKS = ["/products", "/technology", "/research"] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { scrollYProgress } = useScroll();

  useEffect(() => setOpen(false), [pathname]);

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

  const links = navigation.filter((item) => (NAV_LINKS as readonly string[]).includes(item.to));
  const novaActive = pathname === "/nova" || pathname.startsWith("/products/nova");

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-background/95 backdrop-blur-sm">
        <div className="shell grid h-[4.5rem] grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <Link
            to="/"
            aria-label="OMNIEL home"
            className="flex min-w-0 shrink-0 items-center justify-self-start"
          >
            <img
              src={omnielWordmarkDarkMetal}
              alt="OMNIEL"
              width={800}
              height={134}
              className="h-6 w-auto object-contain sm:h-8 lg:h-10"
              fetchPriority="high"
            />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 justify-self-center lg:flex"
          >
            {links.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-[0.82rem] font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 mx-auto h-px w-4 bg-accent transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <Link
              to="/nova"
              hash="waitlist"
              aria-current={novaActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-full border-2 border-foreground bg-accent px-3 py-2 text-[0.64rem] font-semibold text-accent-foreground shadow-[2px_2px_0_0_var(--foreground)] transition-transform hover:-translate-y-0.5 sm:px-4 sm:text-[0.72rem] lg:hidden",
                novaActive && "brightness-110",
              )}
            >
              Waitlist
            </Link>

            <Link
              to="/nova"
              hash="downloads"
              aria-current={novaActive ? "page" : undefined}
              className={cn(
                "hidden items-center justify-center whitespace-nowrap rounded-full border-2 border-foreground bg-accent px-4 py-2.5 text-[0.72rem] font-semibold text-accent-foreground shadow-[2px_2px_0_0_var(--foreground)] transition-transform hover:-translate-y-0.5 lg:inline-flex",
                novaActive && "brightness-110",
              )}
            >
              Download NOVA
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

        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
          style={{ scaleX: scrollYProgress }}
        />
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
            className="fixed inset-0 z-40 overflow-y-auto bg-background px-5 pb-12 pt-24 lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto max-w-md">
              <ul className="divide-y divide-hairline border-y border-hairline">
                {links.map((item, index) => (
                  <li key={item.to}>
                    <Link
                      ref={index === 0 ? firstMenuLink : undefined}
                      to={item.to}
                      className="flex items-center py-5 font-display text-3xl"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                to="/nova"
                hash="waitlist"
                className="mt-8 flex items-center border-b border-hairline py-5 font-display text-3xl text-accent"
              >
                Join the waitlist
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
