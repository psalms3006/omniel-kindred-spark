import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Panel, Section, SectionHeading } from "@/components/site/primitives";
import { contactEmail } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      path: "/privacy",
      title: "Privacy | OMNIEL",
      description:
        "How the OMNIEL website handles information while the ecosystem is in development.",
      ogTitle: "Privacy | OMNIEL",
      ogDescription: "Privacy notice for the OMNIEL website.",
    }),
  component: Privacy,
});

const dontDo = [
  "We don't run accounts, logins or user profiles on this site.",
  "We don't set cookies, and we don't use advertising or cross-site trackers.",
  "We don't use analytics that identify you. The page-view counts described below are anonymous and cookieless.",
  "We don't sell or rent your information to anyone.",
  "We don't use anything you send us to train any AI model.",
  "We don't show ads or work with advertising networks.",
];

/* The third parties that actually receive data when you use this site.
   Audited 2026-09-10 against the source, not assumed. An earlier draft of
   this notice said "no tracking scripts of any kind" and listed name, email
   and message as "the entire list" -- both were wrong: the site loads fonts
   from Google on every page, and the voice assistant sends audio to Vapi. */
const processors = [
  {
    name: "Google Fonts",
    what: "Your IP address and browser details",
    why: "The site's typefaces are loaded from Google's font servers on every page, so Google receives a request from your browser. No cookie is set and we receive nothing back.",
  },
  {
    name: "Vapi",
    what: "Your voice, and a transcript of what you say",
    why: "Only if you start the voice assistant. It asks for microphone permission first, and audio is streamed to Vapi (and its WebRTC provider) to be understood and answered. Closing the assistant ends it.",
  },
  {
    name: "Resend",
    what: "Your name, email address and message, and any NOVA waitlist details",
    why: "Delivers form submissions to OMNIEL as email, stores the NOVA waitlist, and sends its confirmation emails.",
  },
  {
    name: "Cloudflare",
    what: "Standard request data (including your IP address), and anonymous, cookieless page-view and performance metrics",
    why: "Hosts and serves the site, and provides our analytics through Cloudflare Web Analytics. It sets no cookies and does not track you across sites. Any web host necessarily sees request data in order to send you a page.",
  },
];

/* PLACEHOLDER: this notice is a plain-language draft, not legal advice.
   Replace with a reviewed policy before any formal launch. */
function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Privacy notice"
        lede="OMNIEL is pre-launch. This notice describes the website only, and will be replaced with a reviewed policy before any formal launch."
      />

      <Section id="scope">
        <SectionHeading eyebrow="01" title="Who this applies to" />
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          This notice covers omniel.com.ng, the public website. It does not cover NOVA, VYREN, ARVO
          or KIWI themselves, which are separate, unlaunched systems with their own data practices
          to be described when they're publicly available.
        </p>
      </Section>

      <Section id="collect" className="border-t border-hairline">
        <SectionHeading eyebrow="02" title="What we collect" />
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          What you choose to give us: your name, email address, and whatever you write when you use
          a form on this site or email {contactEmail} directly.
        </p>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          If you start the voice assistant, it records your voice while the conversation is running,
          because that is the only way it can hear you. It asks your browser for microphone
          permission first, and you can refuse or close it at any point. We don't keep the
          recordings.
        </p>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          If you join the NOVA waitlist, we store your email address, your name, and anything you
          tell us you'd want to use NOVA for, so we can confirm your interest and contact you when
          NOVA is available. We keep that until you ask us to remove it, and you can leave the list
          at any time.
        </p>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          We also count page views with Cloudflare Web Analytics. It sets no cookies, stores
          nothing on your device, and does not fingerprint you or follow you to other sites. It
          reports how many people visited which pages and how quickly they loaded, not who they
          were. That is the only analytics on this site.
        </p>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Our host also records ordinary server logs, including your IP address, as every web
          server does.
        </p>
      </Section>

      <Section id="use" className="border-t border-hairline">
        <SectionHeading eyebrow="03" title="How it's used" />
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Solely to read your message and reply to you. Form submissions send directly to us; if
          that fails, your own email client opens as a fallback so your message isn't lost either
          way. We keep it only for as long as it takes to have that conversation.
        </p>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Waitlist details are used only to confirm your interest and to contact you about NOVA.
        </p>
      </Section>

      <Section id="processors" className="border-t border-hairline">
        <SectionHeading
          eyebrow="04"
          title="Who else sees anything"
          lede="Four third parties are involved in running this site. This is the complete list."
        />
        <ul className="mt-10 grid max-w-3xl gap-3">
          {processors.map((p) => (
            <li key={p.name}>
              <Panel className="p-5">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.what}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.why}</p>
              </Panel>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="dont-do" className="border-t border-hairline">
        <SectionHeading eyebrow="05" title="What we don't do" />
        <ul className="grid max-w-2xl gap-3">
          {dontDo.map((item) => (
            <li key={item}>
              <Panel className="p-5 text-sm leading-relaxed text-muted-foreground">{item}</Panel>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          If any of this changes (new third parties, hosted forms, product accounts), it will be
          described here, and this notice updated, before it's introduced.
        </p>
      </Section>

      <Section id="rights" className="border-t border-hairline">
        <SectionHeading eyebrow="06" title="Your rights" />
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          You can ask what we hold about you, or ask us to delete it, at any time. Write to{" "}
          <a
            className="text-foreground underline underline-offset-4"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
      </Section>

      <Section id="changes" className="border-t border-hairline">
        <SectionHeading eyebrow="07" title="Changes to this notice" />
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          As OMNIEL's actual practices change, this page will change with them, not the other way
          around. Last updated October 2026.
        </p>
      </Section>

      <Section id="contact" className="border-t border-hairline">
        <SectionHeading eyebrow="08" title="Contact" />
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Questions about this notice can go to the same address:{" "}
          <a
            className="text-foreground underline underline-offset-4"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
      </Section>
    </>
  );
}
