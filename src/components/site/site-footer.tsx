import { Link } from "@tanstack/react-router";
import { contactEmail, location, products } from "@/lib/omniel";
import omnielWordmark from "@/assets/omniel-wordmark.png";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" as const },
      { label: "Technology", to: "/technology" as const },
      { label: "Research & future", to: "/research" as const },
      { label: "Careers", to: "/careers" as const },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact", to: "/contact" as const },
      { label: "Partnerships", to: "/contact" as const },
      { label: "Investment interest", to: "/contact" as const },
      { label: "Privacy", to: "/privacy" as const },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden pt-24">
      <div className="shell">
        <div className="grid gap-12 border-t border-hairline pt-16 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <img src={omnielWordmark} alt="OMNIEL" className="h-8 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              An early-stage AI and technology ecosystem being built from {location}, for a global
              audience.
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-6 inline-block break-all text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {contactEmail}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="eyebrow mb-4">Products</p>
              <ul className="space-y-3">
                {products.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to="/products/$slug"
                      params={{ slug: p.slug }}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/products"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    All products
                  </Link>
                </li>
              </ul>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow mb-4">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-hairline py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} OMNIEL. Early-stage, pre-launch. Built in {location}.</p>
          <ul className="flex flex-wrap gap-6">
            <li>
              <Link to="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition-colors hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
