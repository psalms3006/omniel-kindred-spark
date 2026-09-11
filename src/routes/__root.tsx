import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { VapiWidget } from "@/components/site/vapi-widget";
import { siteUrl } from "@/lib/omniel";
import { Atmosphere } from "@/components/site/atmosphere";

/**
 * Organization structured data. Every field here is either a fact stated
 * elsewhere on the site (name, url, description, founder) or omitted — no
 * invented sameAs/social links, address, founding date, or anything not
 * already public. This is the authoritative signal search engines (and
 * generative answers pulling from search) should prefer over guessing from
 * scattered, unrelated indexed pages.
 */
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OMNIEL",
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
  email: "hello@omniel.com.ng",
  description:
    "OMNIEL is an early-stage AI and technology ecosystem being built from Nigeria: NOVA, VYREN, ARVO and KIWI.",
  founder: {
    "@type": "Person",
    name: "Samuel Asagwara",
    jobTitle: "Founder / AI Engineer",
  },
};

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center overflow-hidden">
      {/* The same meridian as the hero, turned up and centred: the 404 is not
          an apology page bolted on, it is the site's own visual language at a
          different scale. */}
      <Atmosphere />

      <div className="shell relative">
        <div className="max-w-2xl">
          <p className="eyebrow">Error 404</p>
          <h1 className="text-balance-tight mt-6 text-[clamp(2.6rem,9vw,5.5rem)] leading-[0.98]">
            Off the map.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">
            There's nothing at this address. The link may be out of date, or the page may have moved
            somewhere better.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform duration-[var(--motion-base)] hover:-translate-y-0.5"
            >
              Back to OMNIEL
            </Link>
            <Link
              to="/products"
              className="inline-flex h-12 items-center rounded-full border border-hairline px-6 text-sm font-medium transition-colors duration-[var(--motion-base)] hover:bg-surface-strong"
            >
              See the products
            </Link>
          </div>

          <ul className="mt-14 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {[
              { to: "/about" as const, label: "About" },
              { to: "/technology" as const, label: "Technology" },
              { to: "/research" as const, label: "Research" },
              { to: "/contact" as const, label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="underline-offset-4 transition-colors duration-[var(--motion-fast)] hover:text-foreground hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    // Narrowed inside the effect: doing it in the render body created a new
    // Error identity on every render, which would re-fire the report.
    const err = error instanceof Error ? error : new Error(String(error));
    reportLovableError(err, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Something broke.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Not you. This page hit an error loading. Try again, or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OMNIEL: Building intelligence without borders" },
      {
        name: "description",
        content:
          "OMNIEL is an early-stage AI and technology ecosystem being built from Nigeria: NOVA, VYREN, ARVO and KIWI.",
      },
      { name: "author", content: "OMNIEL" },
      { property: "og:site_name", content: "OMNIEL" },
      // og:type, og:url, og:title, og:description and og:image are set
      // per-page by pageHead(). Declaring og:url here made every shared link
      // preview as the homepage, whatever was actually shared.
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${siteUrl}/og-image.png` },
      { name: "theme-color", content: "#0b0d12" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@200;300;400;500&family=Manrope:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      // No canonical here. A canonical in the root is inherited by every
      // route, which told search engines that every page was a duplicate of
      // the homepage. Each route now declares its own via pageHead().
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", href: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", href: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          // Static, developer-authored JSON only — never user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteNav />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
      <VapiWidget />
    </QueryClientProvider>
  );
}
