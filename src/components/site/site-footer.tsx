import { Link } from "@tanstack/react-router";
import { contactEmail, location, products } from "@/lib/omniel";
import omnielWordmark from "@/assets/omniel-wordmark.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline py-12 md:py-16">
      <div className="shell">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div><img src={omnielWordmark} alt="OMNIEL" className="h-5 w-auto brightness-0 invert" /><p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">An early-stage AI and technology ecosystem being built from {location}, for a global audience.</p><a href={`mailto:${contactEmail}`} className="mt-5 inline-block text-sm text-accent underline-offset-4 hover:underline">{contactEmail}</a></div>
          <div><p className="eyebrow mb-4">Products</p><ul className="space-y-3 text-sm text-muted-foreground">{products.map((product) => <li key={product.slug}><Link to="/products/$slug" params={{ slug: product.slug }} className="hover:text-foreground">{product.name}</Link></li>)}</ul></div>
          <div><p className="eyebrow mb-4">Explore</p><ul className="space-y-3 text-sm text-muted-foreground"><li><Link to="/about" className="hover:text-foreground">About</Link></li><li><Link to="/technology" className="hover:text-foreground">Technology</Link></li><li><Link to="/research" className="hover:text-foreground">Research</Link></li><li><Link to="/careers" className="hover:text-foreground">Careers</Link></li></ul></div>
          <div><p className="eyebrow mb-4">Legal</p><ul className="space-y-3 text-sm text-muted-foreground"><li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li><li><Link to="/terms" className="hover:text-foreground">Terms</Link></li><li><Link to="/contact" className="hover:text-foreground">Contact</Link></li></ul></div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-hairline pt-6 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} OMNIEL</span><span>Early-stage / Pre-launch / Built in {location}</span></div>
      </div>
    </footer>
  );
}