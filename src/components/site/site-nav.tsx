import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useScroll } from "motion/react";
import { navigation } from "@/lib/omniel";
import omnielWordmarkDarkMetal from "@/assets/omniel-wordmark-dark-metal.webp";
import { cn } from "@/lib/utils";

const NAV_LINKS = ["/products", "/technology", "/research"] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { scrollYProgress } = useScroll();

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
        <div className="shell">
          <div className="flex h-14 items-center justify-between gap-3 lg:grid lg:h-[4.5rem] lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
            <Link
              to="/"
              aria-label="OMNIEL home"
              className="flex shrink-0 items-center justify-self-start"
            >
              <img
                src={omnielWordmarkDarkMetal}
                alt="OMNIEL"
                width={800}
                height={134}
                className="h-6 w-auto object-contain drop-shadow-[0_2px_2px_rgba(26,24,20,0.28)] sm:h-8 lg:h-10"
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

            <div className="flex items-center justify-self-end">
              <Link
                to="/nova"
                hash="downloads"
                aria-current={novaActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1.5 text-[0.62rem] font-semibold text-accent transition-colors hover:border-accent/50 hover:text-foreground sm:px-3 sm:text-[0.68rem] lg:px-4 lg:py-2 lg:text-[0.78rem]",
                  novaActive && "text-foreground",
                )}
              >
                Download NOVA
                <span aria-hidden>↓</span>
              </Link>
            </div>
          </div>

          <nav aria-label="Primary mobile" className="border-t border-hairline lg:hidden">
            <ul className="flex items-center justify-between gap-1 py-2">
              {links.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <li key={item.to} className="flex-1 text-center">
                    <Link
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative inline-flex py-1 text-[0.7rem] font-medium text-muted-foreground transition-colors hover:text-foreground",
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
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
          style={{ scaleX: scrollYProgress }}
        />
      </header>
    </>
  );
}
