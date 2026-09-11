import { createFileRoute } from "@tanstack/react-router";
import { ActionLink, Panel, Reveal, Section, SectionHeading } from "@/components/site/primitives";
import { PageHero } from "@/components/site/primitives";
import { TeamSection } from "@/components/site/team-section";
import { location, positioning, principles } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
    path: "/about",
    title: "About OMNIEL: An AI ecosystem being built from Nigeria",
    description: "OMNIEL is an early-stage AI and technology initiative based in Nigeria, built by a sole founder toward a global frontier AI company.",
    ogTitle: "About OMNIEL",
    ogDescription: "Early-stage, Nigeria-based, and building toward a global frontier AI company.",
    }),
  component: About,
});

const stages = [
  {
    label: "Current",
    body: "An early-stage, pre-launch AI and technology initiative based in Nigeria, with a sole founder and a small circle of collaborators.",
  },
  {
    label: "In development",
    body: "NOVA, VYREN and ARVO are actively being built. KIWI is an emerging project whose public specification is still being established.",
  },
  {
    label: "Planned",
    body: "Downloadable applications, a broader public presence, and an expanded team.",
  },
  {
    label: "Vision",
    body: "A global frontier AI and technology ecosystem whose products reach people regardless of wealth, geography or infrastructure.",
  },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow={`About, ${location}`}
        title="An ecosystem in its first chapter."
        lede={positioning.lede}
      />

      <Section id="belief">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
          <div>
            <blockquote className="text-balance-tight text-2xl leading-[1.25] sm:text-3xl">
              “{positioning.belief}”
            </blockquote>
            <p className="mt-7 text-base leading-relaxed text-muted-foreground">
              This isn't a statement against anyone. It's a simple position: Africa should not only
              supply the resources behind the global economy while the technology shaping the future
              is built and controlled elsewhere. Africa should help build it.
            </p>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              OMNIEL is based in {location}. It has not yet been formally registered, and it is not
              funded, staffed or operating at scale. What exists is a serious product direction and
              the work being done on it right now.
            </p>
          </div>

          <ul className="grid gap-3">
            {stages.map((s, i) => (
              <Reveal as="li" key={s.label} delay={i * 0.05}>
                <Panel className="p-6">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
                    {s.label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </Panel>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="vision" className="border-t border-hairline">
        <SectionHeading
          eyebrow="Vision"
          title="Access shouldn't be the deciding factor."
          lede="These are the working principles behind that, not slogans, just the constraints OMNIEL designs against."
        />
        <ul className="mt-14 grid gap-3 sm:grid-cols-2">
          {principles.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 0.05}>
              <Panel className="h-full p-6">
                <h3 className="text-lg leading-snug">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="team" className="border-t border-hairline">
        <SectionHeading
          eyebrow="The people behind OMNIEL"
          title="Chosen for what they bring, not who they know."
          lede="A small, multidisciplinary team, actively building OMNIEL and its products. Tap a card for more."
        />
        <div className="mt-12">
          <TeamSection />
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <ActionLink to="/careers">Work on OMNIEL</ActionLink>
          <ActionLink to="/contact" variant="ghost">
            Contact
          </ActionLink>
        </div>
      </Section>
    </>
  );
}
