import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { CreativeEditor } from "@/components/site/creative-editor";
import { EverydayWork } from "@/components/site/everyday-work";
import { HeroDither } from "@/components/site/hero-dither";
import { HeroPreview } from "@/components/site/hero-preview";
import { NovaStage } from "@/components/site/nova-stage";
import { ProductShowcase } from "@/components/site/product-showcase";
import { StudyWorkspace } from "@/components/site/study-workspace";
import {
  ActionLink,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
  Shell,
  Stat,
} from "@/components/site/primitives";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "Omniel | Superintelligence for everyone",
      description:
        "NOVA is OMNIEL's voice-first AI platform: it plans, executes and stays in the conversation. Built for everyday use, from Nigeria. In development.",
      ogTitle: "Omniel | Superintelligence for everyone",
      ogDescription: "NOVA is the platform. The rest of the ecosystem follows.",
    }),
  component: Home,
});

function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-36 md:pb-28 md:pt-44">
      <HeroDither />

      <Shell className="relative z-10">
        <div className="mx-auto max-w-7xl text-center">
          <Reveal>
            <a
              href="#nova"
              className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-xs backdrop-blur-xl transition-colors hover:border-accent/50"
            >
              <span className="rounded-full bg-accent px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                New
              </span>
              <span className="font-medium text-foreground">Introducing Nova</span>
              <span aria-hidden className="text-accent">
                →
              </span>
            </a>
          </Reveal>

          <h1 className="mt-10 text-[clamp(1.45rem,6.6vw,6.2rem)] leading-[0.9] tracking-[-0.045em]">
            <span className="reveal-line">
              <span className="block uppercase">Building</span>
            </span>
            <span className="reveal-line">
              <span className="block uppercase">Superintelligence</span>
            </span>
            <span className="fade-in-up editorial mt-4 block normal-case [--reveal-delay:160ms] md:mt-6">
              for{" "}
              <span className="relative inline-block">
                everyday use.
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-accent via-signal-2 to-signal"
                />
              </span>
            </span>
          </h1>

          <Reveal delay={0.15}>
            <p className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-base">
              Your fullstack AI companion is finally home. Think it. Say it. Done.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.22} className="mt-16">
          <HeroPreview />
        </Reveal>
      </Shell>
    </section>
  );
}

function Products() {
  return (
    <Section id="products" className="border-t border-hairline">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow="Products" title="Powered by OMNIEL" />
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          We believe superintelligence should be accessible to everyone — and useful in every field.
        </p>
      </div>
      <div className="mt-12">
        <ProductShowcase />
      </div>
    </Section>
  );
}

function Students() {
  return (
    <Section id="students" className="theme-light border-t border-hairline bg-background">
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
            sense, and remembers where you stopped.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat value="24/7" label="A study partner" />
            <Stat value="1 plan" label="Every deadline" />
            <Stat value="Offline" label="Where possible" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <ActionLink to="/waitlist" variant="accent">
              Join the waitlist
            </ActionLink>
          </div>
        </Reveal>

        <Reveal from="right" delay={0.1}>
          <StudyWorkspace />
        </Reveal>
      </div>
    </Section>
  );
}

function Enterprises() {
  return (
    <Section id="enterprises" className="border-t border-hairline">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Reveal from="left">
          <EverydayWork />
        </Reveal>

        <Reveal from="right" delay={0.1}>
          <Eyebrow>For enterprises</Eyebrow>
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

          <div className="mt-8 flex flex-wrap gap-3">
            <ActionLink to="/contact" variant="accent" showArrow={false}>
              Talk to us
            </ActionLink>
            <ActionLink to="/products" variant="ghost" showArrow={false}>
              See the platform
            </ActionLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Creatives() {
  return (
    <Section id="creatives" className="theme-light border-t border-hairline bg-background">
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

        <Reveal from="right" delay={0.1}>
          <CreativeEditor />
        </Reveal>
      </div>
    </Section>
  );
}

function Desktop() {
  return (
    <Section id="desktop" className="border-t border-hairline">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 px-6 py-16 md:px-16 md:py-24">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(47,107,255,0.42),transparent_68%)]"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Eyebrow>Desktop / Coming soon</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-3xl text-[clamp(2.8rem,6vw,5.8rem)] leading-[0.92]">
            NOVA, on your desktop.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            The desktop application is in development. Join the waitlist and we&apos;ll send you a
            build when it&apos;s ready.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ActionLink to="/waitlist">Join the waitlist</ActionLink>
            <span className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 text-sm font-medium text-muted-foreground opacity-60">
              <Download className="h-4 w-4" />
              macOS — coming soon
            </span>
            <span className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 text-sm font-medium text-muted-foreground opacity-60">
              <Download className="h-4 w-4" />
              Windows — coming soon
            </span>
          </div>

          <p className="mt-6 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            In development / No date promised
          </p>
        </div>
      </div>
    </Section>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <Products />
      <Students />
      <Enterprises />
      <Creatives />
      <Section id="nova" className="border-t border-hairline">
        <NovaStage />
      </Section>
      <Desktop />
    </>
  );
}
