import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { navigation, products } from "@/lib/omniel";
import omnielWordmark from "@/assets/omniel-wordmark.png";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[60] focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-background/90 backdrop-blur-md">
        <div className="shell">
          <nav aria-label="Primary" className="flex h-16 items-center justify-between gap-8">
            <Link to="/" aria-label="OMNIEL home" className="shrink-0">
              <img src={omnielWordmark} alt="OMNIEL" className="mark-silver h-5 w-auto" />
            </Link>
            <div className="hidden items-center gap-8 md:flex">
              {navigation
                .filter((item) => ["/products", "/technology", "/research"].includes(item.to))
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
            </div>
            <div className="flex items-center gap-5">
              <Link
                to="/contact"
                className="hidden border-b border-accent pb-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-foreground sm:inline-flex"
              >
                Contact
              </Link>
              <button
                type="button"
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((value) => !value)}
                className="grid h-10 w-10 place-items-center border border-hairline text-foreground md:hidden"
              >
                <span className="relative block h-3.5 w-4">
                  <span
                    className={cn(
                      "absolute left-0 h-px w-full bg-current transition-transform",
                      open ? "top-1.5 rotate-45" : "top-0",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 h-px w-full bg-current transition-transform",
                      open ? "top-1.5 -rotate-45" : "top-3",
                    )}
                  />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-background px-5 pb-12 pt-24 md:hidden"
          >
            <div className="shell px-0">
              <div className="mb-10 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent">
                OMNIEL / Navigation
              </div>
              <ul className="divide-y divide-hairline border-y border-hairline">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="block py-5 font-display text-3xl">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-10 grid gap-3">
                {products.map((product) => (
                  <Link
                    key={product.slug}
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    className="panel p-4"
                  >
                    <span className="font-display text-xl">{product.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{product.role}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
