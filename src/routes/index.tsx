import { createFileRoute, Link } from "@tanstack/react-router";
import { CapabilityRail } from "@/components/site/capability-rail";
import { CreativeEditor } from "@/components/site/creative-editor";
import { EverydayWork } from "@/components/site/everyday-work";
import { NovaStage } from "@/components/site/nova-stage";
import { ResponsivePhoto } from "@/components/site/responsive-photo";
import { ScrollExpand } from "@/components/site/scroll-expand";
import { StudyWorkspace } from "@/components/site/study-workspace";
import { Eyebrow, Reveal, Section, Shell, Stat } from "@/components/site/primitives";
import omnielWordmarkDarkMetalLarge from "@/assets/omniel-wordmark-dark-metal-large.webp";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "Omniel | Get more done.",
      description:
        "Omniel builds the right kind of intelligence: useful, human, and clear to people who don't write code.",
      ogTitle: "Omniel | Get more done.",
      ogDescription: "Omniel builds intelligence for everyday use.",
    }),
  component: Home,
});

function Hero() {
  return (
    <section className="relative overflow-hidden pt-[clamp(6.5rem,13svh,9rem)]">
      <Shell className="relative z-10">
        <div className="max-w-4xl">
          <Eyebrow>Everyday intelligence</Eyebrow>
          <h1 className="mt-5 text-[clamp(3rem,9vw,8rem)] leading-[0.88] tracking-[-0.015em] text-left [word-spacing:0.08em] md:[word-spacing:0.12em]">
            <span className="reveal-line">
              <span className="block">Do less.</span>
            </span>
            <span className="reveal-line [--reveal-delay:110ms]">
              <span className="block">
                Get more done<span className="text-accent">.</span>
              </span>
            </span>
          </h1>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-[1.125rem] font-normal leading-relaxed text-foreground/80 md:text-lg">
              NOVA plans it, books it and files it, then tells you when it&apos;s done. A
              voice-first assistant for the work between the work.
            </p>
          </Reveal>

          <Reveal delay={0.22}>
            <div className="mt-8">
              <Link
                to="/nova"
                hash="waitlist"
                className="neo inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                Join the waitlist
              </Link>
            </div>
          </Reveal>
        </div>
      </Shell>

      <div className="relative mt-12 md:mt-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="overflow-hidden rounded-t-[2rem] border border-b-0 border-hairline bg-card">
            <ResponsivePhoto
              name="students-with-omniel"
              alt="Students working together."
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="aspect-[16/9] w-full object-cover md:aspect-[2.4/1]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Origin() {
  return (
    <Section id="origin" className="border-t border-hairline">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="mx-auto max-w-2xl">
          <img
            src={omnielWordmarkDarkMetalLarge}
            alt="OMNIEL"
            width={1600}
            height={269}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        </h2>

        <div className="relative mx-auto mt-10 overflow-hidden rounded-[2rem] border border-hairline bg-card">
          <ResponsivePhoto
            name="nigeria-omniel"
            alt="A group portrait of young people in red, green and black."
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="aspect-[2/1] w-full object-cover [filter:saturate(0.85)_contrast(1.05)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(110,48,56,0.18),transparent_45%,rgba(79,93,80,0.18))] mix-blend-multiply"
          />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-2xl leading-snug md:text-4xl">
          Building the right kind of intelligence. The kind we need.
        </p>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Practical intelligence for everyday problems, built to fit the work people actually do.
        </p>
      </div>
    </Section>
  );
}

function Everyone() {
  return (
    <Section id="everyone" className="border-t border-hairline">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal from="left">
          <h2 className="text-[clamp(2.8rem,5.5vw,5.5rem)] font-semibold leading-[0.94]">
            Built for the work you actually do.
          </h2>
        </Reveal>

        <Reveal from="right" delay={0.08}>
          <div className="grid grid-cols-2 gap-3">
            <figure className="col-span-2">
              <div className="overflow-hidden rounded-[1.75rem] border border-hairline bg-card">
                <ResponsivePhoto
                  name="students-with-omniel"
                  alt="Students working together."
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
              <figcaption className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                For students.
              </figcaption>
            </figure>

            <figure>
              <div className="overflow-hidden rounded-[1.5rem] border border-hairline bg-card">
                <ResponsivePhoto
                  name="creatives-on-laptops"
                  alt="A creative team working on laptops."
                  sizes="(min-width: 640px) 28vw, 50vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <figcaption className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                For creatives.
              </figcaption>
            </figure>

            <figure>
              <div className="overflow-hidden rounded-[1.5rem] border border-hairline bg-card">
                <ResponsivePhoto
                  name="black-for-teams"
                  alt="A team reviewing work around a laptop."
                  sizes="(min-width: 640px) 28vw, 50vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <figcaption className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                For teams.
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function NovaSection() {
  return (
    <Section id="nova" className="scroll-mt-24 border-t border-hairline">
      <ScrollExpand>
        <NovaStage />
      </ScrollExpand>

      <div className="mx-auto mt-12 max-w-3xl border-t border-hairline pt-8">
        <h3 className="font-display text-2xl md:text-3xl">A voice-first desktop assistant.</h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          NOVA stays online and in the conversation, keeps context between sessions, and carries the
          task through — opening apps, working with files, searching the web and following up. You
          speak; it handles the steps.
        </p>
      </div>
    </Section>
  );
}

function Students() {
  return (
    <Section id="students" className="border-t border-hairline">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <Reveal from="left">
          <Eyebrow>For students</Eyebrow>
          <h2 className="mt-6 text-[clamp(2.6rem,5.4vw,5.4rem)] leading-[0.94]">
            Study smarter.
            <br />
            Get the work done.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            NOVA turns a stack of deadlines into a plan, explains the parts that don&apos;t make
            sense, and remembers where you stopped. The list stops living in your head.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat value="24/7" label="A study partner" />
            <Stat value="1 plan" label="Every deadline" />
            <Stat value="Offline" label="Where possible" />
          </div>
        </Reveal>

        <ScrollExpand className="origin-center">
          <StudyWorkspace />
        </ScrollExpand>
      </div>
    </Section>
  );
}

function StudentImage() {
  return (
    <section className="border-t border-hairline">
      <div className="shell py-6 md:py-8">
        <div className="overflow-hidden rounded-[2rem] border border-hairline bg-card">
          <ResponsivePhoto
            name="students-omniel"
            alt="Students studying together in a lecture hall."
            sizes="100vw"
            className="aspect-[16/9] w-full object-cover md:aspect-[2.2/1]"
          />
        </div>
      </div>
    </section>
  );
}

function Enterprises() {
  return (
    <Section id="enterprises" className="border-t border-hairline bg-surface/40">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <ScrollExpand className="origin-center">
          <EverydayWork />
        </ScrollExpand>

        <Reveal from="right" delay={0.08}>
          <Eyebrow>For teams</Eyebrow>
          <h2 className="mt-6 text-[clamp(2.6rem,5.4vw,5.4rem)] leading-[0.94]">
            Ship the work
            <br />
            At your pace.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            NOVA takes the repetitive work off the people doing the real work — the inbox, the
            approvals, the handoffs and keeps everyone in the same context.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat value="Every person" label="Their own assistant" />
            <Stat value="Every team" label="One shared context" />
            <Stat value="Every day" label="Work that moves" />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Creatives() {
  return (
    <Section id="creatives" className="border-t border-hairline">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <Reveal from="left">
          <Eyebrow>For creatives</Eyebrow>
          <h2 className="mt-6 text-[clamp(2.6rem,5.4vw,5.4rem)] leading-[0.94]">
            Make the thing.
            <br />
            We do the busywork.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            OMNIEL&apos;s NOVA handles your creative work, from first draft to references.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat value="12" label="Variants from one direction" />
            <Stat value="1 canvas" label="Every reference" />
            <Stat value="Yours" label="The final call" />
          </div>
        </Reveal>

        <ScrollExpand className="origin-center">
          <CreativeEditor />
        </ScrollExpand>
      </div>
    </Section>
  );
}

const values = ["Access", "Privacy", "Offline", "Action"] as const;

function Values() {
  return (
    <section className="border-t border-hairline bg-surface/40 py-16 md:py-20">
      <div className="shell">
        <h2 className="max-w-4xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.94]">
          The standards we build to.
        </h2>
      </div>

      <div className="mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="marquee flex w-max">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex items-center gap-10 pr-10"
              aria-hidden={copy === 1 ? "true" : undefined}
            >
              {values.map((value) => (
                <span
                  key={value}
                  className="whitespace-nowrap font-display text-[clamp(2.5rem,6vw,6rem)] leading-none"
                >
                  {value}
                  <span className="text-accent">.</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <Section className="border-t border-hairline">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div>
          <h2 className="text-[clamp(3rem,7vw,7rem)] leading-[0.9]">
            Do less. Get more done<span className="text-accent">.</span>
          </h2>
        </div>

        <Reveal from="right" delay={0.08}>
          <div className="overflow-hidden rounded-[2rem] border border-hairline bg-card">
            <ResponsivePhoto
              name="for-teams"
              alt="A team working together around a table."
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <CapabilityRail />
      <Origin />
      <Everyone />
      <NovaSection />
      <Students />
      <StudentImage />
      <Enterprises />
      <Creatives />
      <Values />
      <Closing />
    </>
  );
}
