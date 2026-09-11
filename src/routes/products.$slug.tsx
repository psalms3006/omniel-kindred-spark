import { createFileRoute, notFound, redirect, Link } from "@tanstack/react-router";
import { Atmosphere } from "@/components/site/atmosphere";
import {
  ActionLink,
  Eyebrow,
  Panel,
  Reveal,
  Section,
  SectionHeading,
  Shell,
} from "@/components/site/primitives";
import { productBySlug, products } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    // Slugs that were public once and are not any more.
    //
    // /products/orin was live long enough to be crawled, so it exists in
    // search indexes and possibly in links. Letting it 404 wastes that and
    // shows visitors an error for a page that was deliberately withdrawn; a
    // permanent redirect to the product index is the honest answer -- the
    // page is gone, here is where products live -- and it consolidates any
    // ranking signal instead of discarding it.
    const RETIRED_SLUGS = new Set(["orin"]);
    if (RETIRED_SLUGS.has(params.slug)) {
      throw redirect({ to: "/products", statusCode: 301 });
    }

    const product = productBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      // Deliberately no canonical: a slug that does not resolve must not claim
      // to be the indexable version of anything.
      return pageHead({
        path: "/products",
        title: "Product not found | OMNIEL",
        description: "This product page does not exist.",
        noindex: true,
      });
    }
    const { product } = loaderData;
    const title = `${product.name}: ${product.role} | OMNIEL`;
    return pageHead({
      path: `/products/${product.slug}`,
      title,
      description: product.summary,
      ...(product.icon ? { image: product.icon } : {}),
    });
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const others = products.filter((p) => p.slug !== product.slug);

  return (
    <>
      <header id={product.slug} className="relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-48">
        <div className="absolute inset-0 -z-10">
          <Atmosphere variant="band" intensity={product.priority === "flagship" ? 0.95 : 0.7} />
        </div>
        <Shell>
          {product.icon && <img src={product.icon} alt="" className="mb-6 h-12 w-12" />}
          <Eyebrow>
            {product.priority === "flagship" ? "Flagship · " : ""}
            {product.kind} · {product.status}
          </Eyebrow>
          <h1 className="text-balance-tight mt-6 max-w-3xl text-4xl leading-[1.05] sm:text-5xl md:text-7xl">
            {product.name}
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-foreground">{product.statement}</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {product.summary}
          </p>
        </Shell>
      </header>

      {product.capabilities.length > 0 ? (
        <Section id="capabilities" className="border-t border-hairline">
          <SectionHeading
            eyebrow="Capabilities"
            title={`What ${product.name} is being built to do.`}
            lede="Capabilities are at different stages of maturity. Nothing here should be read as a finished, production-ready guarantee."
          />
          <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {product.capabilities.map((c, i) => (
              <Reveal as="li" key={c.title} delay={i * 0.04}>
                <Panel interactive className="h-full p-6">
                  <h2 className="text-lg leading-snug">{c.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </Panel>
              </Reveal>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section id="audience" className="border-t border-hairline">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>Who it is for</Eyebrow>
            <ul className="mt-6 flex flex-wrap gap-2">
              {product.audience.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-hairline px-4 py-2 text-sm text-foreground"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow>Status and honest notes</Eyebrow>
            <ul className="mt-6 space-y-4">
              {product.notes.map((n) => (
                <li key={n} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-accent/60" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <ActionLink to="/contact">Ask about {product.name}</ActionLink>
          <ActionLink to="/technology" variant="ghost">
            Technology direction
          </ActionLink>
        </div>
        {product.priority === "roadmap" && (
          <p className="mt-8 text-sm text-muted-foreground">
            {product.name} is part of the OMNIEL roadmap.{" "}
            <Link
              to="/products/$slug"
              params={{ slug: "nova" }}
              className="text-foreground underline underline-offset-4"
            >
              NOVA
            </Link>{" "}
            is the current flagship, in active development now.
          </p>
        )}
      </Section>

      <Section className="border-t border-hairline">
        <Eyebrow>Elsewhere in the ecosystem</Eyebrow>
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {others.map((p) => (
            <li key={p.slug}>
              <Link to="/products/$slug" params={{ slug: p.slug }} className="block h-full">
                <Panel interactive className="h-full p-6">
                  <p className="font-display text-lg tracking-[0.25em]">{p.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.role}</p>
                </Panel>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
