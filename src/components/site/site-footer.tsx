import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { contactEmail, products } from "@/lib/omniel";
import omnielWordmark from "@/assets/omniel-wordmark.png";

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Technology", to: "/technology" },
  { label: "Research", to: "/research" },
] as const;

const connectLinks = [
  { label: "Contact", to: "/contact" },
  { label: "NOVA waitlist", to: "/nova" },
] as const;

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.8 2h6.4l4.4 5.8L18.9 2Zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20Z" />
    </svg>
  );
}

// TODO: replace the "#" placeholders with the live profile URLs.
const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/omniel-ai-limited/", icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/_omnielai/?hl=en", icon: Instagram },
  { label: "X", href: "#", icon: XIcon },
  { label: "Email", href: `mailto:${contactEmail}`, icon: Mail },
] as const;

export function SiteFooter() {
  return (
    <footer className="theme-dark relative overflow-hidden border-t border-hairline bg-background">
      <div className="lab-grid pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />

      <div className="shell relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1.8fr] lg:gap-20">
          <div>
            <Link to="/" aria-label="OMNIEL home" className="inline-block">
              <img src={omnielWordmark} alt="OMNIEL" className="h-8 w-auto" />
            </Link>
            <p className="mt-7 max-w-xs font-display text-4xl leading-[0.95] tracking-[-0.02em]">
              Do less. Get more done.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Everyday intelligence from OMNIEL.
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-5 inline-block text-sm text-foreground underline decoration-accent decoration-1 underline-offset-4 hover:decoration-2"
            >
              {contactEmail}
            </a>

            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="eyebrow mb-4">Ecosystem</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {products.map((product) => (
                  <li key={product.slug}>
                    {product.slug === "nova" ? (
                      <Link to="/nova" className="transition-colors hover:text-foreground">
                        {product.name}
                      </Link>
                    ) : (
                      <Link
                        to="/products/$slug"
                        params={{ slug: product.slug }}
                        className="transition-colors hover:text-foreground"
                      >
                        {product.name}
                        {product.slug === "kiwi" ? (
                          <span className="ml-2 text-[0.52rem] uppercase tracking-[0.12em] text-muted-foreground/70">
                            Soon
                          </span>
                        ) : null}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow mb-4">Company</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {companyLinks.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow mb-4">Connect</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {connectLinks.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="transition-colors hover:text-foreground"
                  >
                    Email us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-hairline pt-6 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} OMNIEL</span>
          <span className="flex gap-5">
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
