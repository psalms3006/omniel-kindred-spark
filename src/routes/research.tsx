import { createFileRoute } from "@tanstack/react-router";
import {
  ActionLink,
  PageHero,
  Panel,
  Reveal,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { futureDirections } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/research")({
  head: () =>
    pageHead({
    path: "/research",
    title: "Research and future direction | OMNIEL",
    description: "OMNIEL's long-term ambitions: frontier AI, research, robotics, games, enterprise and consumer technology, agents and AI infrastructure.",
    ogTitle: "OMNIEL research and future direction",
    ogDescription: "Long-term ambitions, clearly separated from what exists today.",
    }),
  component: Research,
});

function Research() {
  return (
    <>
      <PageHero
        eyebrow="Research and future"
        title="Where this is going."
        lede="Everything on this page is long-term direction. OMNIEL does not currently operate a research laboratory, a robotics division, or any of the areas below as active business units."
      />

      <Section id="future">
        <SectionHeading
          eyebrow="Long-term direction"
          title="Ambitions, labelled as ambitions."
          lede="These are areas OMNIEL intends to explore and build toward as the ecosystem matures."
        />
        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {futureDirections.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 0.04}>
              <Panel interactive className="h-full p-6">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
                  Exploring
                </p>
                <h2 className="mt-4 text-lg leading-snug">{f.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section className="border-t border-hairline">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <SectionHeading
            eyebrow="Publishing"
            title="No results until there are results."
            lede="OMNIEL has not published research, benchmarks or partnerships. When there is work worth publishing, it will appear here with its methodology attached."
          />
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              It is easy for an early company to borrow credibility with numbers it cannot defend.
              OMNIEL would rather be small and accurate than impressive and wrong.
            </p>
            <p>
              Internal targets are not published as figures. A number travels further than the
              caveat attached to it, so OMNIEL publishes performance claims only once something has
              actually been measured.
            </p>
            <div className="pt-2">
              <ActionLink to="/contact" variant="ghost">
                Research or partnership enquiries
              </ActionLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
