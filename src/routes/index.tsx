import { createFileRoute } from "@tanstack/react-router";
import { CreativeEditor } from "@/components/site/creative-editor";
import { EverydayWork } from "@/components/site/everyday-work";
import { HeroDither } from "@/components/site/hero-dither";
import { NovaStage } from "@/components/site/nova-stage";
import { ScrollExpand } from "@/components/site/scroll-expand";
import { StudyWorkspace } from "@/components/site/study-workspace";
import { Eyebrow, Reveal, Section, Shell, Stat } from "@/components/site/primitives";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "OMNIEL — Do less, but smart",
      description:
        "OMNIEL is building the right kind of superintelligence: useful, human, and clear to people who don't write code. NOVA is coming.",
      ogTitle: "OMNIEL — Do less, but smart",
      ogDescription: "Building superintelligence for everyday use.",
    }),
  component: Home,
});

function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
      <HeroDither />

      <Shell className="relative z-10">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-sm font-medium leading-relaxed text-foreground md:text-base">
                Building superintelligence for everyday use.
              </p>
            </Reveal>

            <h1 className="mt-7 text-[clamp(3.4rem,8.5vw,8rem)] leading-[0.86] tracking-[-0.045em]">
              <span className="reveal-line">
                <span className="block">Do less,</span>
              </span>
              <span className="reveal-line [--reveal-delay:110ms]">
                <span className="block">
                  but smart<span className="text-accent">.</span>
                </span>
              </span>
            </h1>
          </div>

          <Reveal from="right" delay={0.12}>
            <div className="overflow-hidden rounded-[2rem] border border-hairline bg-card">
              <img
                src="/do%20less%20image%203.jpg"
                alt="A person relaxing with a laptop."
                width={1280}
                height={1920}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="aspect-[4/5] w-full object-cover object-center"
              />
            </div>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

function Origin() {
  return (
    <Section id="origin" className="border-t border-hairline">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-display text-[clamp(4.5rem,13vw,13rem)] font-semibold leading-[0.8] tracking-[-0.05em]">
          OMNIEL<span className="text-accent">.</span>
        </h2>

        <div className="relative mx-auto mt-10 overflow-hidden rounded-[2rem] border border-hairline bg-card">
          <img
            src="/nigeria%20Omniel%20page.jpg"
            alt="A group portrait of young people in red, green and black."
            width={1280}
            height={1920}
            loading="lazy"
            decoding="async"
            className="aspect-[2/1] w-full object-cover object-[center_35%] [filter:saturate(0.85)_contrast(1.05)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(110,48,56,0.18),transparent_45%,rgba(79,93,80,0.18))] mix-blend-multiply"
          />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-2xl leading-snug md:text-4xl">
          Building the right kind of superintelligence. The kind we need.
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
          <Eyebrow>Made for everyone</Eyebrow>
          <h2 className="mt-6 text-[clamp(2.8rem,5.5vw,5.5rem)] font-semibold leading-[0.94]">
            We build products for everyone.
          </h2>
        </Reveal>

        <Reveal from="right" delay={0.08}>
          <div className="grid grid-cols-2 gap-3">
            <figure className="col-span-2">
              <div className="overflow-hidden rounded-[1.75rem] border border-hairline bg-card">
                <img
                  src="/students%20omniel.jpg"
                  alt="Students working together in a lecture hall."
                  width={2000}
                  height={1333}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
              <figcaption className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                For students.
              </figcaption>
            </figure>

            <figure>
              <div className="overflow-hidden rounded-[1.5rem] border border-hairline bg-card">
                <img
                  src="/creatives.jpg"
                  alt="A group of young creatives in a city."
                  width={1280}
                  height={1920}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <figcaption className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                For creatives.
              </figcaption>
            </figure>

            <figure>
              <div className="overflow-hidden rounded-[1.5rem] border border-hairline bg-card">
                <img
                  src="/group%20picture.jpg"
                  alt="A team of young people working together."
                  width={2000}
                  height={1201}
                  loading="lazy"
                  decoding="async"
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
    <Section id="nova" className="border-t border-hairline">
      <ScrollExpand>
        <NovaStage />
      </ScrollExpand>
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
          <img
            src="/students%20with%20omniel.jpg"
            alt="Students studying together outdoors."
            width={2000}
            height={1333}
            loading="lazy"
            decoding="async"
            className="h-[50vh] w-full object-cover md:h-[70vh]"
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
            Ship the work.
            <br />
            Not your peace.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            NOVA takes the repetitive work off the people doing the real work — the inbox, the
            approvals, the handoffs — and keeps everyone in the same context.
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
            Not the busywork.
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
        <Eyebrow>What we stand for</Eyebrow>
        <h2 className="mt-5 max-w-4xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.94]">
          Intelligence for everyone.
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
          <Eyebrow>The invitation</Eyebrow>
          <h2 className="mt-6 text-[clamp(3rem,7vw,7rem)] leading-[0.9]">
            Do less, but smart<span className="text-accent">.</span>
          </h2>
        </div>

        <Reveal from="right" delay={0.08}>
          <div className="overflow-hidden rounded-[2rem] border border-hairline bg-card">
            <img
              src="/do%20less%204.jpg"
              alt="A person relaxing with a laptop."
              width={1280}
              height={1920}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full object-cover"
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
