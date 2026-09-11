import { createFileRoute, Link } from "@tanstack/react-router";
import { Atmosphere } from "@/components/site/atmosphere";
import { cn } from "@/lib/utils";
import {
  ActionLink,
  Eyebrow,
  Panel,
  Reveal,
  Section,
  SectionHeading,
  Shell,
} from "@/components/site/primitives";
import { positioning, principles, products, technologyDirections } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "OMNIEL: Building intelligence without borders",
      description:
        "OMNIEL is an early-stage AI and technology ecosystem being built from Nigeria. NOVA is the flagship product currently in development, with VYREN, ARVO and KIWI as the wider roadmap.",
      ogTitle: "OMNIEL: Building intelligence without borders",
      ogDescription:
        "NOVA is OMNIEL's flagship product, building now. The rest of the ecosystem follows.",
    }),
  component: Home,
});

/* The floating cards from the hero.
 *
 * The reference designs all anchor their hero with small translucent cards
 * carrying a label and a figure. The pattern works because it gives the eye
 * somewhere to land after the headline and makes the page feel like a product
 * rather than a poster.
 *
 * OMNIEL has no metrics to put in them, and inventing some -- "96%", "12m+
 * customers" -- is exactly the fabrication the content rules forbid. So these
 * carry facts that are true and specific instead: what the flagship is, and
 * where it is being built. The form is borrowed; the substance is real.
 */
const heroCards = [
  {
    label: "Flagship",
    value: "NOVA",
    detail: "In active development",
    to: "/products/$slug" as const,
    params: { slug: "nova" },
  },
  {
    label: "Built in",
    value: "Nigeria",
    detail: "For a global audience",
    to: "/about" as const,
  },
];

function HeroCard({ card, className }: { card: (typeof heroCards)[number]; className?: string }) {
  return (
    <Link
      to={card.to}
      {...("params" in card ? { params: card.params } : {})}
      className={cn(
        "group block rounded-2xl border border-hairline bg-surface/80 p-5 backdrop-blur-xl",
        "transition-[transform,border-color,background-color] duration-[var(--motion-base)]",
        "hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--ion)_45%,transparent)] hover:bg-surface-strong",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="eyebrow">{card.label}</span>
        <span
          aria-hidden
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline text-xs text-muted-foreground transition-colors duration-[var(--motion-fast)] group-hover:border-transparent group-hover:bg-primary group-hover:text-primary-foreground"
        >
          ↗
        </span>
      </div>
      <p className="mt-4 font-display text-2xl tracking-tight">{card.value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
    </Link>
  );
}

function Hero() {
  return (
    <div className="relative flex min-h-[86svh] w-full items-center overflow-hidden pb-24 pt-36 md:pb-28 md:pt-40">
      {/* One background treatment, not three. This previously stacked
          AmbientField, NeuralField and the aurora gradient behind the single
          paragraph that has to explain the company. */}
      <Atmosphere />

      <Shell>
        <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)]">
          <div className="max-w-3xl">
            <Eyebrow>OMNIEL, Nigeria</Eyebrow>
            <h1 className="text-balance-tight mt-6 text-[clamp(2.4rem,6.5vw,4.9rem)] leading-[1.04]">
              {positioning.headline}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {positioning.lede}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <ActionLink to="/products/$slug" params={{ slug: "nova" }}>
                See NOVA
              </ActionLink>
              <ActionLink to="/products" variant="ghost">
                Explore the ecosystem
              </ActionLink>
            </div>
            <p className="mt-12 max-w-md text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Early-stage · Pre-launch · Built in Nigeria for a global audience
            </p>
          </div>

          {/* Stacked below the copy on phones, offset beside it on desktop --
              adapted for the smaller screen rather than merely shrunk. */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5 lg:pl-4">
            {heroCards.map((card, i) => (
              <Reveal key={card.value} delay={0.15 + i * 0.08}>
                <HeroCard card={card} className={i === 1 ? "lg:ml-10" : ""} />
              </Reveal>
            ))}
          </div>
        </div>
      </Shell>
    </div>
  );
}

function NovaSpotlightSection() {
  const nova = products.find((p) => p.slug === "nova")!;
  return (
    <Section id="nova" className="border-t border-hairline">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[2rem] border border-hairline">
          <div className="h-64 md:h-full md:min-h-[22rem]">
            <Atmosphere variant="band" intensity={0.85} />
          </div>
          {nova.icon && (
            <img
              src={nova.icon}
              alt=""
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 md:h-32 md:w-32"
            />
          )}
        </div>
        <div>
          <Eyebrow>OMNIEL's flagship · Building now</Eyebrow>
          <h2 className="text-balance-tight mt-6 text-3xl leading-[1.1] md:text-5xl">
            NOVA is the first OMNIEL product being brought forward.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {nova.summary} It's where the majority of current engineering effort is going, ahead of
            anything else in the ecosystem.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ActionLink to="/products/$slug" params={{ slug: "nova" }}>
              Explore NOVA
            </ActionLink>
            <ActionLink to="/technology" variant="ghost">
              How it's built
            </ActionLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* The ecosystem, as an architecture rather than a card grid.
 *
 * This was four identical cards, each with its own meridian thumbnail: the
 * heading-paragraph-cards rhythm that makes a page read as assembled from a
 * template, and a motif repeated until it stopped meaning anything.
 *
 * Rows instead. An index, the name at display size, what it is, and where it
 * has actually got to -- read down, they state the shape of the company: one
 * flagship and three systems behind it, at different stages. The card grid
 * flattened that into four equal tiles and said the opposite.
 */
function EcosystemSection() {
  const rest = products.filter((p) => p.slug !== "nova");
  return (
    <Section id="products" className="border-t border-hairline">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>The wider ecosystem</Eyebrow>
          <h2 className="text-balance-tight mt-6 text-3xl leading-[1.08] md:text-[2.75rem]">
            What OMNIEL is building next.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            NOVA is first. These are the other systems in the roadmap, each solving a different
            class of problem, at earlier stages of development.
          </p>
        </div>

        <ul>
          {rest.map((product, i) => (
            <li key={product.slug}>
              <Reveal delay={i * 0.05}>
                <Link
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  id={product.slug}
                  className="group flex scroll-mt-28 items-baseline gap-6 border-t border-hairline py-7 transition-colors duration-[var(--motion-base)] hover:border-[color-mix(in_oklab,var(--ion)_40%,transparent)] sm:gap-10 sm:py-9"
                >
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {String(i + 2).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="font-display text-2xl tracking-[0.16em] transition-colors duration-[var(--motion-base)] group-hover:text-[var(--ion)] sm:text-3xl">
                        {product.name}
                      </span>
                      <span className="eyebrow">{product.status}</span>
                    </span>
                    <span className="mt-2 block max-w-md text-sm leading-relaxed text-muted-foreground">
                      {product.role}
                    </span>
                  </span>

                  <span
                    aria-hidden
                    className="shrink-0 text-muted-foreground transition-transform duration-[var(--motion-base)] group-hover:translate-x-1 group-hover:text-foreground"
                  >
                    →
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function BeliefSection() {
  return (
    <Section id="about" className="border-t border-hairline">
      <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <Eyebrow>Why OMNIEL exists</Eyebrow>
          <blockquote className="text-balance-tight mt-6 text-2xl leading-[1.25] sm:text-3xl md:text-4xl">
            "{positioning.belief}"
          </blockquote>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground">
            Africa supplies a great deal of what the global economy runs on. OMNIEL is being built
            from Nigeria on the belief that it can also build the technology shaping what comes
            next, seriously, and to a global standard.
          </p>
          <div className="mt-10">
            <ActionLink to="/about" variant="ghost">
              About OMNIEL
            </ActionLink>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {principles.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 0.05}>
              <Panel className="h-full p-6">
                <h3 className="text-lg leading-snug">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function TechnologySection() {
  return (
    <Section className="border-t border-hairline">
      <SectionHeading
        eyebrow="Technology direction"
        title="What is actually being built."
        lede="These are directions under active development across the ecosystem, at different levels of maturity. Nothing here is presented as finished."
      />
      <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {technologyDirections.map((d, i) => (
          <Reveal as="li" key={d.id} delay={i * 0.04}>
            <Panel interactive className="h-full p-6">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
                {d.stage}
              </p>
              <h3 className="mt-4 text-xl">{d.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
            </Panel>
          </Reveal>
        ))}
      </ul>
      <div className="mt-12">
        <ActionLink to="/technology" variant="ghost">
          Read the technology direction
        </ActionLink>
      </div>
    </Section>
  );
}

function ClosingSection() {
  return (
    <Section className="border-t border-hairline">
      <div className="glass relative overflow-hidden rounded-[2rem] p-8 md:p-16">
        <div className="relative max-w-2xl">
          <Eyebrow>Get involved</Eyebrow>
          <h2 className="text-balance-tight mt-6 text-3xl leading-[1.1] md:text-5xl">
            Small team. Large ambition. Early enough to matter.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            OMNIEL is building toward becoming a global frontier AI and technology company. If you
            want to work on it, partner with it, or support it, this is the moment to reach out.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ActionLink to="/careers">Careers</ActionLink>
            <ActionLink to="/contact" variant="ghost">
              Contact
            </ActionLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <NovaSpotlightSection />
      <EcosystemSection />
      <BeliefSection />
      <TechnologySection />
      <ClosingSection />
    </>
  );
}
