import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HeroBackdrop } from "@/components/site/hero-backdrop";
import {
  ActionLink,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
  Shell,
} from "@/components/site/primitives";
import { positioning, principles, products } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "OMNIEL: Intelligence without borders",
      description:
        "OMNIEL is an early-stage AI and technology ecosystem being built from Nigeria. NOVA is the flagship product currently in development, with VYREN, ARVO and KIWI as the wider roadmap.",
      ogTitle: "OMNIEL: Intelligence without borders",
      ogDescription: "NOVA first. The rest of the OMNIEL ecosystem follows.",
    }),
  component: Home,
});

function Hero() {
  return (
    <section className="relative min-h-[48rem] overflow-hidden border-b border-hairline pt-28 md:min-h-[52rem] md:pt-36">
      {/* The core is the hero's ground now, not a framed study beside the
          copy. The lab grid stays on top of it, at low opacity, so the
          drawing-board texture still reads across the whole band. */}
      <HeroBackdrop />
      <div className="absolute inset-0 lab-grid opacity-[0.14]" />
      <Shell className="relative grid min-h-[44rem] items-center gap-12">
        <div className="relative z-10 max-w-xl pb-12 lg:pb-0">
          <Eyebrow>OMNIEL / Nigeria</Eyebrow>
          <h1 className="text-balance-tight mt-7 text-[clamp(3.4rem,7vw,7.8rem)] leading-[0.92] tracking-[-0.05em]">
            Intelligence <span className="text-accent">without</span> borders.
          </h1>
          <p className="mt-8 max-w-[37ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
            {positioning.lede}
          </p>
          <div className="mt-10">
            <ActionLink to="/products/$slug" params={{ slug: "nova" }}>
              Explore NOVA
            </ActionLink>
          </div>
          <div className="mt-16 flex items-center gap-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" />
            <span>Early-stage / Pre-launch</span>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function BeliefSection() {
  return (
    <section className="border-b border-hairline bg-primary py-28 text-primary-foreground md:py-40">
      <Shell>
        <div className="max-w-6xl">
          <Eyebrow className="text-primary-foreground/60">A working belief</Eyebrow>
          <h2 className="text-balance-tight mt-8 max-w-5xl text-[clamp(2.5rem,5.8vw,6.4rem)] leading-[0.98] tracking-[-0.045em]">
            {positioning.belief}
          </h2>
        </div>
      </Shell>
    </section>
  );
}

function NovaStage() {
  const nova = products.find((product) => product.slug === "nova");
  if (!nova) return null;

  return (
    <section className="relative overflow-hidden bg-surface py-28 md:py-40">
      <Shell>
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Eyebrow>Flagship system / Building now</Eyebrow>
            <h2 className="mt-5 text-5xl tracking-[-0.04em] md:text-7xl">NOVA Stage</h2>
          </div>
          <p className="max-w-[38ch] text-base leading-relaxed text-muted-foreground">
            {nova.summary}
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="relative min-h-[22rem] overflow-hidden border border-hairline bg-background p-6 lg:col-span-8 md:min-h-[34rem]">
            <div className="absolute inset-0 lab-grid opacity-30" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Interface perspective</span>
                <span>In development</span>
              </div>
              <div className="mx-auto w-full max-w-2xl border border-hairline bg-surface p-5 shadow-[0_22px_70px_-35px_oklch(0_0_0_/_90%)] md:p-8">
                <div className="flex items-center justify-between border-b border-hairline pb-4 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
                  <span>NOVA / Workspace</span>
                  <span className="text-accent">Ready</span>
                </div>
                <div className="grid gap-4 py-8 md:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <p className="font-display text-2xl leading-tight md:text-3xl">
                      Do more, with less unnecessary manual work.
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      Voice and text interaction, computer control, vision, web search, memory and
                      planning are directions being developed across NOVA.
                    </p>
                  </div>
                  <div className="space-y-2 border-l border-hairline pl-4 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground md:pl-6">
                    {nova.capabilities.slice(0, 4).map((capability) => (
                      <div key={capability.title} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 bg-accent" />
                        {capability.title}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-accent/70" />
              </div>
              <div className="flex justify-between font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Generalist assistant</span>
                <span>01 / flagship</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="border border-hairline bg-background p-7">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-accent">
                01 / Context
              </span>
              <h3 className="mt-8 text-2xl">Memory and planning</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Persistent context, planning and background tasks so long work does not restart from
                zero.
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-between border border-hairline bg-background p-7">
              <div>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-accent">
                  02 / Direction
                </span>
                <h3 className="mt-8 text-2xl">Useful offline</h3>
              </div>
              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                A core direction for NOVA: staying useful when connectivity is poor, expensive or
                unavailable.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <ActionLink to="/products/$slug" params={{ slug: "nova" }} variant="ghost">
            Read about NOVA
          </ActionLink>
        </div>
      </Shell>
    </section>
  );
}

function EcosystemSection() {
  const [active, setActive] = useState("vyren");
  const rest = products.filter((product) => product.slug !== "nova");
  const selected = rest.find((product) => product.slug === active) ?? rest[0];
  if (!selected) return null;

  return (
    <Section id="ecosystem" className="border-b border-hairline">
      <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
        <div>
          <Eyebrow>The wider ecosystem</Eyebrow>
          <h2 className="mt-6 max-w-md text-4xl leading-[1.02] tracking-[-0.04em] md:text-6xl">
            Different systems. One direction.
          </h2>
          <p className="mt-7 max-w-md leading-relaxed text-muted-foreground">
            NOVA is first. These are the other systems in the roadmap, each at an earlier stage of
            development.
          </p>
          <div className="mt-12 border-t border-hairline pt-4 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
            Select a system to study
          </div>
        </div>
        <div>
          <div className="mb-8 flex min-h-56 items-center justify-center border border-hairline bg-surface-strong p-8 md:min-h-72">
            <div className="relative h-44 w-44 border border-accent/50 md:h-56 md:w-56">
              <div className="absolute inset-6 border border-accent/30" />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-accent" />
              <div className="absolute left-1/2 top-0 h-full w-px bg-accent/25" />
              <div className="absolute left-0 top-1/2 h-px w-full bg-accent/25" />
              <span className="absolute -bottom-7 left-0 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
                {selected.status}
              </span>
            </div>
          </div>
          <div className="divide-y divide-hairline border-y border-hairline">
            {rest.map((product, index) => (
              <Link
                key={product.slug}
                to="/products/$slug"
                params={{ slug: product.slug }}
                onMouseEnter={() => setActive(product.slug)}
                onFocus={() => setActive(product.slug)}
                className="group flex items-center gap-5 py-6 transition-colors hover:text-accent"
              >
                <span className="font-mono text-[0.6rem] text-muted-foreground">0{index + 2}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-3xl tracking-[-0.04em]">
                    {product.name}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{product.role}</span>
                </span>
                <span
                  aria-hidden
                  className="text-xl text-muted-foreground transition-transform group-hover:translate-x-1"
                >
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function PrinciplesSection() {
  return (
    <Section className="border-b border-hairline">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <SectionHeading
          eyebrow="How OMNIEL thinks"
          title="Technology should meet people where they are."
          lede="The work is early, but the direction is deliberate: useful systems that respect context, access and permission."
        />
        <ul className="divide-y divide-hairline border-y border-hairline">
          {principles.map((principle, index) => (
            <Reveal
              as="li"
              key={principle.id}
              delay={index * 0.04}
              className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr]"
            >
              <span className="font-mono text-[0.6rem] text-accent">0{index + 1}</span>
              <div>
                <h3 className="text-xl">{principle.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {principle.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function ClosingSection() {
  return (
    <section className="bg-primary py-28 text-primary-foreground md:py-40">
      <Shell className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <Eyebrow className="text-primary-foreground/60">Get involved</Eyebrow>
          <h2 className="mt-7 max-w-3xl text-[clamp(3rem,6vw,7rem)] leading-[0.92] tracking-[-0.05em]">
            Small team. Large ambition. Early enough to matter.
          </h2>
        </div>
        <div className="md:pb-2">
          <p className="max-w-sm text-base leading-relaxed text-primary-foreground/70">
            If you want to work on it, partner with it, or support what is being built, this is the
            moment to reach out.
          </p>
          <ActionLink
            to="/contact"
            variant="ghost"
            className="mt-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            Start a conversation
          </ActionLink>
        </div>
      </Shell>
    </section>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <BeliefSection />
      <NovaStage />
      <EcosystemSection />
      <PrinciplesSection />
      <ClosingSection />
    </>
  );
}
