import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { contactEmail, products } from "@/lib/omniel";
import omnielWordmarkLightMetal from "@/assets/omniel-wordmark-light-metal.webp";

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Technology", to: "/technology" },
  { label: "Research", to: "/research" },
] as const;

const connectLinks: { label: string; to: string; hash?: string }[] = [
  { label: "Contact", to: "/contact" },
  { label: "NOVA waitlist", to: "/nova", hash: "waitlist" },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.8 2h6.4l4.4 5.8L18.9 2Zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20Z" />
    </svg>
  );
}

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/omniel-ai-limited/",
    icon: Linkedin,
  },
  { label: "Instagram", href: "https://www.instagram.com/_omnielai/?hl=en", icon: Instagram },
  { label: "X", href: "https://X.com/OMNIELAIng", icon: XIcon },
  { label: "Email", href: `mailto:${contactEmail}`, icon: Mail },
] as const;

export function SiteFooter() {
  return (
    <footer className="theme-dark relative overflow-hidden border-t border-hairline bg-background">
      <div className="lab-grid pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />

      <div className="shell relative py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1.5fr] lg:items-start lg:gap-16">
          <div>
            <Link to="/" aria-label="OMNIEL home" className="inline-block">
              <img
                src={omnielWordmarkLightMetal}
                alt="OMNIEL"
                width={800}
                height={134}
                className="h-6 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] md:h-9"
                loading="lazy"
              />
            </Link>
            <p className="mt-4 max-w-[17rem] font-display text-2xl leading-[1.05] tracking-[-0.02em]">
              Do less. Get more done.
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Everyday intelligence from OMNIEL.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={`mailto:${contactEmail}`}
                className="text-sm text-foreground underline decoration-accent decoration-1 underline-offset-4 hover:decoration-2"
              >
                {contactEmail}
              </a>
              <span aria-hidden className="hidden h-3 w-px bg-hairline sm:block" />
              <div className="flex items-center gap-2">
                {socials.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer" : undefined}
                    className="grid h-8 w-8 place-items-center rounded-full border border-hairline text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div>
              <p className="eyebrow mb-3">Ecosystem</p>
              <ul className="space-y-2 text-[0.8rem] text-muted-foreground">
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
                          <span className="ml-1 text-[0.48rem] uppercase tracking-[0.1em] text-muted-foreground/70">
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
              <p className="eyebrow mb-3">Company</p>
              <ul className="space-y-2 text-[0.8rem] text-muted-foreground">
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
              <p className="eyebrow mb-3">Connect</p>
              <ul className="space-y-2 text-[0.8rem] text-muted-foreground">
                {connectLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      {...(item.hash ? { hash: item.hash } : {})}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-hairline pt-4 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
