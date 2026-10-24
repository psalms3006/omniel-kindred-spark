import { createFileRoute } from "@tanstack/react-router";
import { DownloadCards } from "@/components/site/download-cards";
import { NovaWaves } from "@/components/site/nova-waves";
import { Eyebrow, Reveal, Section } from "@/components/site/primitives";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { pageHead } from "@/lib/seo";
import omnielWordmark from "@/assets/omniel-wordmark.png";

export const Route = createFileRoute("/nova")({
  head: () =>
    pageHead({
      path: "/nova",
      title: "NOVA — Meet NOVA | OMNIEL",
      description:
        "NOVA carries the planning, the follow-ups and the admin. Join the waitlist for the desktop build.",
      ogTitle: "NOVA — Meet NOVA",
      ogDescription: "Meet NOVA.",
    }),
  component: NovaPage,
});

const carries = [
  { number: "01", title: "Plan", body: "A sentence becomes a sequence of steps." },
  { number: "02", title: "Act", body: "It operates the tools the task actually needs." },
  { number: "03", title: "Remember", body: "The thread stays open between sessions." },
] as const;

function NovaPage() {
  return (
    <>
      <section className="theme-dark relative overflow-hidden">
        <NovaWaves />

        <div className="shell relative z-10 flex min-h-[78vh] flex-col items-center justify-center py-40 text-center">
          <img src={omnielWordmark} alt="OMNIEL" className="h-9 w-auto" />

          <p className="eyebrow mt-10">NOVA</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(3.4rem,10vw,9rem)] leading-[0.84] tracking-[-0.045em] text-[#f2ebde]">
            Meet NOVA.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-[#b9b1a4] md:text-lg">
            The everyday intelligence that carries the planning, the follow-ups and the admin. You
            keep the day.
          </p>

          <a
            href="#waitlist"
            className="mt-9 inline-flex items-center gap-2 rounded-full border border-[#f2ebde]/25 px-6 py-3 text-sm font-medium text-[#f2ebde] transition-colors hover:border-[#c97a82] hover:text-[#c97a82]"
          >
            Join the waitlist
            <span aria-hidden>↓</span>
          </a>

          <p className="mt-10 text-[0.6rem] uppercase tracking-[0.16em] text-[#b9b1a4]/70">
            NOVA / A product of OMNIEL
          </p>
        </div>
      </section>

      <Section id="carries" className="border-t border-hairline">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal from="left">
            <Eyebrow>What it carries</Eyebrow>
            <h2 className="mt-6 text-[clamp(2.6rem,5vw,5rem)] leading-[0.94]">
              Three things, every day.
            </h2>
          </Reveal>

          <Reveal from="right" delay={0.08}>
            <ul className="border-t border-hairline">
              {carries.map((item) => (
                <li
                  key={item.number}
                  className="grid gap-4 border-b border-hairline py-7 sm:grid-cols-[3rem_1fr] sm:items-baseline"
                >
                  <span className="font-mono text-[0.7rem] text-accent">{item.number}</span>
                  <div>
                    <h3 className="font-display text-2xl leading-tight md:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section id="downloads" className="border-t border-hairline bg-surface/40">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Downloads</Eyebrow>
            <h2 className="mt-6 text-[clamp(2.6rem,5vw,5rem)] leading-[0.94]">
              Take NOVA with you.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            The desktop build is coming. These will open when it ships.
          </p>
        </div>

        <div className="mt-12">
          <DownloadCards />
        </div>
      </Section>

      <Section id="waitlist" className="scroll-mt-24 border-t border-hairline">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <Reveal from="left">
            <Eyebrow>The waitlist</Eyebrow>
            <h2 className="mt-6 text-[clamp(2.8rem,5.6vw,5.6rem)] leading-[0.92]">
              Be first when it lands.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Join the waitlist and we&apos;ll send you a build when NOVA is ready. No date
              promised, and nothing in between.
            </p>
          </Reveal>

          <Reveal from="right" delay={0.08}>
            <WaitlistForm
              id="nova-waitlist"
              frame="plain"
              title="Join the waitlist"
              description="We only use this to contact you about NOVA."
              className="border-2 border-foreground shadow-[8px_8px_0_0_var(--foreground)]"
            />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
