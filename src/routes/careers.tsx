import { createFileRoute } from "@tanstack/react-router";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageHero, Panel, Reveal, Section, SectionHeading } from "@/components/site/primitives";
import { careerAreas } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/careers")({
  head: () =>
    pageHead({
    path: "/careers",
    title: "Careers: Build OMNIEL from the beginning",
    description: "OMNIEL is an early-stage team in Nigeria. There are no formal openings listed yet, but you can register interest across engineering, AI, research, design, product and more.",
    ogTitle: "Careers at OMNIEL",
    ogDescription: "No formal openings listed yet. Register your interest in building OMNIEL.",
    }),
  component: Careers,
});

const realities = [
  {
    title: "Early means early",
    body: "OMNIEL is pre-launch with a sole founder. There is no large staff, no funding announcement and no corporate machinery.",
  },
  {
    title: "No listed openings yet",
    body: "We are not advertising specific roles. You can still register interest and be contacted as the team expands.",
  },
  {
    title: "Work that is visible",
    body: "At this stage, what one person builds is a meaningful share of the whole product.",
  },
];

function Careers() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Come in early."
        lede="OMNIEL is still building its team. If you want to help build a frontier AI ecosystem from Nigeria, tell us where you fit, even if no formal role is listed."
      />

      <Section id="reality">
        <ul className="grid gap-3 sm:grid-cols-3">
          {realities.map((r, i) => (
            <Reveal as="li" key={r.title} delay={i * 0.05}>
              <Panel className="h-full p-6">
                <h2 className="text-lg leading-snug">{r.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section className="border-t border-hairline">
        <SectionHeading
          eyebrow="Areas"
          title="Where people are needed."
          lede="Choose the closest area. If nothing fits, choose Other and describe what you do."
        />
        <ul className="mt-10 flex flex-wrap gap-2">
          {careerAreas.map((a) => (
            <li
              key={a}
              className="rounded-full border border-hairline px-4 py-2 text-sm text-foreground"
            >
              {a}
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <InquiryForm
            id="careers"
            title="Register your interest"
            description="Tell us who you are and what you would want to build. There is no formal application process yet."
            categories={careerAreas}
            categoryLabel="Area of interest"
            submitLabel="Send interest"
          />
        </div>
      </Section>
    </>
  );
}
