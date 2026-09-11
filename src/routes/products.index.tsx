import { createFileRoute, Link } from "@tanstack/react-router";
import { Atmosphere } from "@/components/site/atmosphere";
import {
  ActionLink,
  Eyebrow,
  PageHero,
  Panel,
  Reveal,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { products } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/products/")({
  head: () =>
    pageHead({
    path: "/products",
    title: "Products: NOVA and the OMNIEL roadmap | OMNIEL",
    description: "NOVA is OMNIEL's flagship product, in active development. VYREN, ARVO and KIWI are the wider roadmap.",
    ogTitle: "OMNIEL products",
    ogDescription: "NOVA first. The rest of the OMNIEL ecosystem follows.",
    }),
  component: ProductsIndex,
});

function ProductsIndex() {
  const nova = products.find((p) => p.slug === "nova")!;
  const rest = products.filter((p) => p.slug !== "nova");

  return (
    <>
      <PageHero
        eyebrow="Products"
        title="NOVA first. The rest of the roadmap follows."
        lede="NOVA is OMNIEL's flagship product and current development focus. The other systems are real, in-progress parts of the ecosystem, not yet the release priority."
      />

      <Section id="nova">
        <Eyebrow>Flagship · Building now</Eyebrow>
        <Link to="/products/$slug" params={{ slug: "nova" }} className="mt-6 block">
          <Panel interactive className="overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[1fr_1.2fr]">
              <div className="relative h-48 border-b border-hairline lg:h-full lg:border-b-0 lg:border-r">
                <Atmosphere variant="band" intensity={0.9} />
                {nova.icon && (
                  <img
                    src={nova.icon}
                    alt=""
                    className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2"
                  />
                )}
              </div>
              <div className="p-8 md:p-10">
                <p className="font-display text-3xl tracking-[0.3em]">{nova.name}</p>
                <p className="mt-3 text-base text-muted-foreground">{nova.role}</p>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {nova.summary}
                </p>
                <p className="mt-7 text-sm text-foreground">Explore NOVA →</p>
              </div>
            </div>
          </Panel>
        </Link>
      </Section>

      <Section id="ecosystem" className="border-t border-hairline">
        <SectionHeading
          eyebrow="The roadmap"
          title="What's next."
          lede="Each of these solves a different problem from NOVA and from each other. They're at earlier stages, not abandoned."
        />
        <ul className="mt-14 grid gap-4 md:grid-cols-2">
          {rest.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.05}>
              <Link
                to="/products/$slug"
                params={{ slug: p.slug }}
                id={p.slug}
                className="block h-full scroll-mt-28"
              >
                <Panel interactive className="h-full overflow-hidden p-0">
                  <div className="relative h-28 border-b border-hairline">
                    <Atmosphere variant="band" intensity={0.6} />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-display text-xl tracking-[0.3em]">{p.name}</p>
                      <span className="rounded-full border border-hairline px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
                        {p.kind}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{p.role}</p>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {p.summary}
                    </p>
                    <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                      {p.status}
                    </p>
                  </div>
                </Panel>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="compare" className="border-t border-hairline">
        <SectionHeading
          eyebrow="Compare"
          title="Which one is for what."
          lede="A plain comparison."
        />
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <caption className="sr-only">Comparison of OMNIEL products</caption>
            <thead>
              <tr className="border-b border-hairline text-muted-foreground">
                <th scope="col" className="py-4 pr-6 font-normal">
                  Product
                </th>
                <th scope="col" className="py-4 pr-6 font-normal">
                  Position
                </th>
                <th scope="col" className="py-4 pr-6 font-normal">
                  Primary audience
                </th>
                <th scope="col" className="py-4 font-normal">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug} className="border-b border-hairline align-top">
                  <th scope="row" className="py-5 pr-6 font-display text-lg tracking-[0.2em]">
                    {p.name}
                    {p.priority === "flagship" && (
                      <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent">
                        Flagship
                      </span>
                    )}
                  </th>
                  <td className="py-5 pr-6 text-muted-foreground">{p.kind}</td>
                  <td className="py-5 pr-6 text-muted-foreground">{p.audience.join(", ")}</td>
                  <td className="py-5 text-muted-foreground">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
