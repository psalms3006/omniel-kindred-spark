import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/lib/omniel";
import omnielWordmarkDarkMetal from "@/assets/omniel-wordmark-dark-metal.png";
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
        <div className="shell grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-6">
          <Link
            to="/"
            aria-label="OMNIEL home"
            className="flex shrink-0 items-center justify-self-start"
          >
            <img
              src={omnielWordmarkDarkMetal}
              alt="OMNIEL"
              className="h-9 w-auto object-contain drop-shadow-[0_2px_2px_rgba(26,24,20,0.28)] md:h-11"
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

          <div className="flex items-center gap-3 justify-self-end">
            <Link
              to="/nova"
              hash="downloads"
              aria-current={novaActive ? "page" : undefined}
              className={cn(
                "hidden items-center gap-1.5 rounded-full border border-hairline px-4 py-2 text-[0.78rem] font-semibold text-accent transition-colors hover:border-accent/50 hover:text-foreground lg:inline-flex",
                novaActive && "text-foreground",
              )}
            >
              Download NOVA
              <span aria-hidden>↓</span>
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
            className="fixed inset-0 z-40 overflow-y-auto bg-background px-5 pb-12 pt-28 lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto max-w-md">
              <ul className="divide-y divide-hairline border-y border-hairline">
                {navigation.map((item, index) => (
                  <li key={item.to}>
                    <Link
                      ref={index === 0 ? firstMenuLink : undefined}
                      to={item.to}
                      className="flex items-center justify-between py-5 font-display text-3xl"
                    >
                      {item.label}
                      <span aria-hidden className="text-muted-foreground">
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                to="/nova"
                hash="downloads"
                className="mt-8 flex items-center justify-between border-b border-hairline py-5 font-display text-3xl text-accent"
              >
                Download NOVA
                <span aria-hidden>↓</span>
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
