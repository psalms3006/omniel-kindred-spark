import { createFileRoute } from "@tanstack/react-router";
import {
  ActionLink,
  Eyebrow,
  PageHero,
  Panel,
  Reveal,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { products, technologyDirections } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/technology")({
  head: () =>
    pageHead({
    path: "/technology",
    title: "Technology direction | OMNIEL",
    description: "The engineering directions behind OMNIEL: online and offline intelligence, memory, computer interaction, voice, vision, and tool use.",
    ogTitle: "OMNIEL technology direction",
    ogDescription: "What OMNIEL is building, at the level of honest engineering direction.",
    }),
  component: Technology,
});

function Technology() {
  return (
    <>
      <PageHero
        eyebrow="Technology"
        title="Directions, not declarations."
        lede="OMNIEL is early. This page describes the engineering directions being worked on, and where each one currently stands, rather than claiming a finished platform."
      />

      <Section id="directions">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {technologyDirections.map((d, i) => (
            <Reveal as="li" key={d.id} delay={i * 0.04}>
              <Panel interactive id={d.id} className="h-full scroll-mt-28 p-6">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
                  {d.stage}
                </p>
                <h2 className="mt-4 text-xl">{d.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="offline" className="border-t border-hairline">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <SectionHeading
            eyebrow="Offline intelligence"
            title="Useful when the network is not."
            lede="One of the harder engineering directions in the ecosystem, and one of the most worth getting right."
          />
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Large parts of the world work with connectivity that is unreliable, expensive or
              simply unavailable, and many people prefer their work to stay on their own machine
              regardless of connection quality.
            </p>
            <p>
              OMNIEL treats that as a design constraint rather than an edge case. Where a task can
              be handled locally, it should be; where it genuinely needs more, the system should say
              so instead of failing quietly.
            </p>
            <p className="text-sm">
              No OMNIEL product is claimed to be fully offline. Support differs between NOVA, VYREN,
              ARVO and KIWI, and is still being built.
            </p>
          </div>
        </div>
      </Section>

      <Section id="per-product" className="border-t border-hairline">
        <Eyebrow>Where the directions land</Eyebrow>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {products.map((p) => (
            <li key={p.slug}>
              <Panel className="h-full p-6">
                <p className="font-display text-lg tracking-[0.25em]">{p.name}</p>
                <p className="mt-2 text-sm text-accent">{p.kind}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
              </Panel>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <ActionLink to="/products" variant="ghost">
            See the products
          </ActionLink>
        </div>
      </Section>
    </>
  );
}
