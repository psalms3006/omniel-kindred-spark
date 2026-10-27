import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Atmosphere } from "@/components/site/atmosphere";
import { Eyebrow, Shell } from "@/components/site/primitives";
import { contactEmail } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      path: "/privacy",
      title: "Privacy policy | OMNIEL",
      description:
        "What omniel.com.ng collects, why we hold it, who processes it, and how to have it removed.",
      ogTitle: "Privacy policy | OMNIEL",
      ogDescription: "A plain-language privacy policy for the OMNIEL website.",
    }),
  component: PrivacyPolicy,
});

const sections = [
  { id: "introduction", index: "01", label: "Introduction" },
  { id: "collect", index: "02", label: "Information we collect" },
  { id: "data-privacy", index: "03", label: "Data privacy" },
  { id: "use-share", index: "04", label: "Use & sharing" },
  { id: "security", index: "05", label: "Security" },
  { id: "cookies", index: "06", label: "Cookie tracking" },
  { id: "contact-privacy", index: "07", label: "Contact our privacy team" },
] as const;

const shortVersion = [
  "We collect what you type into a form, the email you send us, or the details you choose to give the NOVA waitlist.",
  "Cloudflare, Resend, Zoho Mail, LiveKit, Google Fonts and Fontshare are the services that help us run this site and answer you.",
  "We do not sell your data, run advertising or cross-site tracking, or use your enquiry or waitlist note to train AI models.",
];

const collection = [
  {
    tag: "Enquiry forms",
    title: "Messages you send",
    body: "The contact, partnership and investment forms collect the details needed to read your message and reply.",
    points: [
      "Name, email address, category and message",
      "An optional phone number if the voice assistant captures one",
      "The page you sent from and a reference ID",
      "A copy of the notification and acknowledgement emails",
    ],
  },
  {
    tag: "NOVA waitlist",
    title: "Your place in line",
    body: "The waitlist is a double opt-in list held in Resend Contacts. It is not a public profile or an account.",
    points: [
      "Name and email address",
      "Optional note about what you would use NOVA for",
      "Pending or confirmed status and the timestamps for each",
      "The confirmation and welcome emails we send you",
    ],
  },
  {
    tag: "Voice sessions",
    title: "Only when you press the button",
    body: "The microphone is not opened until you tap Talk to OMNIEL and grant browser permission. Closing the session ends it.",
    points: [
      "Microphone audio and the text transcript created while the agent answers",
      "A random room ID, not your name or email",
      "The OMNIEL agent service that listens for the session",
      "No site account and no recording stored by this website",
    ],
  },
  {
    tag: "Technical data",
    title: "What the network sees",
    body: "Like any website, the pages and fonts have to be requested from servers. Those requests carry ordinary technical information.",
    points: [
      "IP address and request metadata in Cloudflare's server logs",
      "Cookieless page views and Core Web Vitals from Cloudflare Web Analytics",
      "A request to Google Fonts and Fontshare for the typefaces",
    ],
  },
] as const;

const privacyRules = [
  {
    title: "Collect less",
    body: "If a field is not needed to answer your message or hold your waitlist place, we do not ask for it. There are no accounts, passwords, payment details or user profiles on this website.",
  },
  {
    title: "Never sell",
    body: "We do not sell, rent or trade personal information. There is no advertising business behind this site, so your details are not a product.",
  },
  {
    title: "No ad profile",
    body: "We do not run Google Analytics, Meta Pixel, TikTok pixel, session replay or cross-site advertising trackers. The only page-view measurement is Cloudflare Web Analytics, which is cookieless and aggregate.",
  },
  {
    title: "No model training",
    body: "We do not use your enquiry, waitlist note or email to train OMNIEL or third-party AI models. Voice audio is processed to run the live session, not to build a training set.",
  },
  {
    title: "Keep it briefly",
    body: "Enquiries stay while we deal with them and for a reasonable follow-up period. Waitlist details stay until you unsubscribe or ask to be removed. Aggregate analytics has no individual profile to keep.",
  },
  {
    title: "Give you control",
    body: "You can ask what we hold, ask us to correct it, or ask us to delete it. You do not need an account to make that request; email is enough.",
  },
  {
    title: "Global processing",
    body: "Our providers operate globally, so data may be processed outside Nigeria. We use established providers that publish their own privacy and security terms, and we keep the list on this page current.",
  },
] as const;

const processors = [
  {
    name: "Resend",
    role: "Email delivery and waitlist contacts",
    data: "Name, email address, intended-use note, waitlist status and timestamps. Also carries enquiry notifications and acknowledgements.",
  },
  {
    name: "Zoho Mail",
    role: "Our mailbox",
    data: "Messages sent to info@omniel.com.ng, including form notifications and replies to you.",
  },
  {
    name: "Cloudflare",
    role: "Hosting, D1 database and analytics",
    data: "Request data including IP address, stored enquiry rows, and aggregate cookieless page-view and performance metrics.",
  },
  {
    name: "LiveKit",
    role: "Voice transport and agent dispatch",
    data: "Audio and conversation data while a voice session is active, plus a random room identity.",
  },
  {
    name: "Google Fonts & Fontshare",
    role: "Typefaces",
    data: "Your IP address and browser request for the font files. They do not receive your form contents.",
  },
] as const;

function PolicySection({
  id,
  index,
  title,
  lede,
  children,
}: {
  id: string;
  index: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-32 border-t border-hairline pt-10 first:border-t-0 first:pt-0 md:pt-14"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center border-2 border-foreground bg-accent text-sm font-semibold text-accent-foreground shadow-[3px_3px_0_0_var(--foreground)]"
        >
          {index}
        </span>
        <div>
          <p className="eyebrow">
            {index} / {String(sections.length).padStart(2, "0")}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-2 text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] tracking-[-0.02em]"
          >
            {title}
          </h2>
          {lede ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lede}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-7 md:mt-9">{children}</div>
    </section>
  );
}

function BodyCopy({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground md:text-base", className)}>
      {children}
    </p>
  );
}

function SummaryCard() {
  return (
    <aside className="neo rounded-2xl bg-card p-6 text-card-foreground shadow-[6px_6px_0_0_var(--foreground)]">
      <p className="eyebrow">The short version</p>
      <ol className="mt-5 space-y-4">
        {shortVersion.map((item, index) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed">
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-foreground/30 font-mono text-[0.58rem]"
            >
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
      <a
        href={`mailto:${contactEmail}?subject=Privacy%20question`}
        className="mt-6 inline-flex items-center gap-2 border-b-2 border-accent pb-1 text-sm font-semibold text-foreground transition-colors hover:text-accent"
      >
        Ask a privacy question
        <span aria-hidden>→</span>
      </a>
    </aside>
  );
}

function PrivacyPolicy() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-hairline pb-14 pt-36 md:pb-20 md:pt-44">
        <Atmosphere variant="hero" intensity={0.65} />
        <Shell className="relative">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end lg:gap-16">
            <div>
              <Eyebrow>Privacy / public website</Eyebrow>
              <h1 className="mt-6 max-w-4xl text-[clamp(3.1rem,7vw,7rem)] leading-[0.86] tracking-[-0.03em]">
                Privacy, without the fog<span className="text-accent">.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                What omniel.com.ng collects, why it exists, who processes it, and how to get it
                removed. Written for this website, not for products that have not shipped.
              </p>
              <div className="mt-8 flex flex-wrap gap-2 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="rounded-full border border-hairline px-3 py-1.5">
                  Last updated 27 Oct 2026
                </span>
                <span className="rounded-full border border-hairline px-3 py-1.5">
                  Website policy only
                </span>
              </div>
            </div>
            <SummaryCard />
          </div>
        </Shell>
      </header>

      <Shell className="py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="neo-glass rounded-2xl p-4">
              <p className="eyebrow">On this page</p>
              <nav aria-label="Privacy policy sections" className="mt-3">
                <ol className="space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="flex gap-3 rounded-lg px-2 py-2 text-[0.72rem] leading-snug text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                      >
                        <span className="font-mono text-[0.58rem] text-accent">
                          {section.index}
                        </span>
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            <div className="mt-4 border-2 border-foreground bg-accent p-5 text-accent-foreground shadow-[4px_4px_0_0_var(--foreground)]">
              <p className="text-sm font-semibold">Need something removed?</p>
              <p className="mt-2 text-xs leading-relaxed text-accent-foreground/80">
                Email the privacy team. A person reads the inbox.
              </p>
              <a
                href={`mailto:${contactEmail}?subject=Privacy%20request`}
                className="mt-4 inline-flex break-all text-xs font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                {contactEmail}
              </a>
            </div>
          </aside>

          <div className="min-w-0 space-y-14 md:space-y-20">
            <PolicySection
              id="introduction"
              index="01"
              title="Introduction"
              lede="Who this policy is for, and what it leaves out."
            >
              <div className="grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-4">
                  <BodyCopy>
                    This policy explains how OMNIEL handles personal information on{" "}
                    <strong className="text-foreground">omniel.com.ng</strong>. It is written for
                    the website as it exists today: a public brochure, an enquiry channel, a NOVA
                    waitlist and an optional voice assistant.
                  </BodyCopy>
                  <BodyCopy>
                    OMNIEL is an early-stage technology company based in Nigeria. The website does
                    not have accounts, logins, user profiles or a customer portal. If you email us
                    directly, that message is handled under this policy too.
                  </BodyCopy>
                  <BodyCopy>
                    For this website, OMNIEL is the organisation responsible for the information
                    described here. The address for privacy questions is at the bottom of the page.
                  </BodyCopy>
                </div>
                <div className="neo-glass rounded-2xl p-5">
                  <p className="eyebrow">Scope</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    This policy covers this website only. NOVA, VYREN, ARVO and KIWI are separate
                    products. When they become publicly available, they will have their own notices.
                    This page will be updated before any new data practice starts on this site.
                  </p>
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="collect"
              index="02"
              title="Information we collect"
              lede="Four buckets, each tied to something you actually do on the site."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {collection.map((item) => (
                  <article key={item.title} className="neo-glass rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="eyebrow">{item.tag}</p>
                      <span
                        aria-hidden
                        className="font-mono text-[0.58rem] text-muted-foreground/60"
                      >
                        {item.tag === "Technical data" ? "automatic" : "when used"}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-2xl leading-none">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                    <ul className="mt-4 space-y-2 border-t border-hairline pt-4 text-xs leading-relaxed text-muted-foreground">
                      {item.points.map((point) => (
                        <li key={point} className="flex gap-2">
                          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 bg-accent" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className="mt-4 border-2 border-foreground bg-surface p-4 text-sm leading-relaxed shadow-[3px_3px_0_0_var(--foreground)]">
                <strong className="text-foreground">Please do not send</strong> passwords, card
                numbers, government IDs, API keys, or another person&apos;s private information
                through any form or the voice assistant. We do not ask for any of these.
              </div>
            </PolicySection>

            <PolicySection
              id="data-privacy"
              index="03"
              title="Data privacy"
              lede="The rules we actually work to, not a slogan above a footer."
            >
              <div className="border-y border-hairline">
                {privacyRules.map((rule) => (
                  <div
                    key={rule.title}
                    className="grid gap-2 border-b border-hairline py-5 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-8"
                  >
                    <p className="font-display text-xl leading-none">{rule.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{rule.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Access", "Ask what we hold and why."],
                  ["Correction", "Ask us to fix something wrong."],
                  ["Deletion", "Ask us to remove it."],
                ].map(([label, copy]) => (
                  <div key={label} className="border-2 border-foreground bg-card p-4">
                    <p className="font-display text-lg">{label}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p>
                  </div>
                ))}
              </div>

              <BodyCopy className="mt-5">
                The site is not aimed at children. If you believe a child has sent us personal
                information, write to the address below and we will remove it. Nothing here takes
                away a right you have under the Nigeria Data Protection Act or your local law.
              </BodyCopy>
            </PolicySection>

            <PolicySection
              id="use-share"
              index="04"
              title="How we use and share information"
              lede="Every use below has a concrete job. If the job is not on this list, we should not be doing it."
            >
              <div className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)]">
                <div className="hidden grid-cols-[10rem_1fr_1.2fr] gap-4 border-b-2 border-foreground bg-surface px-4 py-3 text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground sm:grid">
                  <span>Job</span>
                  <span>What it uses</span>
                  <span>What happens</span>
                </div>
                {[
                  {
                    job: "Reply to you",
                    uses: "Name, email, category, message and optional phone.",
                    happens:
                      "Stored in Cloudflare D1, emailed to the OMNIEL inbox, and acknowledged to you by email.",
                  },
                  {
                    job: "Hold the NOVA waitlist",
                    uses: "Name, email and optional intended-use note.",
                    happens:
                      "Stored in Resend Contacts, confirmed by a signed link, and used to send the welcome email and later NOVA updates.",
                  },
                  {
                    job: "Run the voice assistant",
                    uses: "Microphone audio and the live transcript.",
                    happens:
                      "Streamed through LiveKit to the OMNIEL agent so it can answer. Closing the call ends the session.",
                  },
                  {
                    job: "Understand the site",
                    uses: "Cookieless page views and performance metrics.",
                    happens:
                      "Cloudflare Web Analytics reports aggregate counts and Core Web Vitals. No individual profile is built.",
                  },
                ].map((row) => (
                  <div
                    key={row.job}
                    className="grid gap-2 border-b border-hairline px-4 py-4 last:border-b-0 sm:grid-cols-[10rem_1fr_1.2fr] sm:gap-4"
                  >
                    <p className="font-display text-lg leading-none">{row.job}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{row.uses}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{row.happens}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <p className="eyebrow">Who processes it</p>
                <div className="mt-3 divide-y divide-hairline border-y border-hairline">
                  {processors.map((processor) => (
                    <div
                      key={processor.name}
                      className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
                    >
                      <div>
                        <p className="font-display text-lg leading-none">{processor.name}</p>
                        <p className="mt-1 text-[0.58rem] uppercase tracking-[0.12em] text-accent">
                          {processor.role}
                        </p>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {processor.data}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <BodyCopy className="mt-5">
                We share information only to run the site, answer you, or comply with the law. We do
                not sell or rent it. If we add a provider that receives personal data, it goes on
                this list before it goes live.
              </BodyCopy>
            </PolicySection>

            <PolicySection
              id="security"
              index="05"
              title="Security"
              lede="What we lock down, and what you should never send us."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="neo-glass rounded-2xl p-5">
                  <p className="eyebrow">What we do</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {[
                      "Serve the site over HTTPS.",
                      "Keep Resend, LiveKit and database credentials on the server, never in the browser bundle.",
                      "Sign NOVA waitlist confirmation links so an address cannot be confirmed by a guessed link.",
                      "Store enquiries in Cloudflare D1 and keep the records needed to follow up.",
                      "Validate form input on the server, even when the browser already checked it.",
                      "Keep no passwords, card numbers, government IDs or customer accounts on this site.",
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 bg-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-2 border-foreground bg-accent p-5 text-accent-foreground shadow-[4px_4px_0_0_var(--foreground)]">
                  <p className="text-[0.6rem] uppercase tracking-[0.16em] text-accent-foreground/70">
                    What we never ask for
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                    {[
                      "Passwords or one-time codes",
                      "Card or bank details",
                      "Government identification",
                      "API keys or access tokens",
                      "Someone else's private information",
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <BodyCopy className="mt-5">
                No website can promise perfect security. If we discover a breach that affects your
                information, we will notify you and the relevant authority where the law requires
                it. To report a vulnerability, email{" "}
                <a
                  href={`mailto:${contactEmail}?subject=Security`}
                  className="text-foreground underline decoration-accent underline-offset-4"
                >
                  {contactEmail}
                </a>{" "}
                with <strong className="text-foreground">Security</strong> in the subject line.
              </BodyCopy>
            </PolicySection>

            <PolicySection
              id="cookies"
              index="06"
              title="Cookie tracking"
              lede="The site is cookieless for analytics. There is no advertising tracker hiding in a corner."
            >
              <div className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)]">
                {[
                  {
                    name: "Cloudflare Web Analytics",
                    copy: "No cookie and no local storage. Counts page views and Core Web Vitals in aggregate.",
                  },
                  {
                    name: "Cloudflare security",
                    copy: "If Cloudflare challenges a request, it may set a strictly necessary security cookie (for example __cf_bm or cf_clearance). It is not used for advertising.",
                  },
                  {
                    name: "Google Fonts & Fontshare",
                    copy: "The font files are requested from their servers, so they receive your IP address and browser request. We do not set a cookie for them.",
                  },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="grid gap-2 border-b border-hairline px-4 py-4 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:gap-5"
                  >
                    <p className="font-display text-lg leading-none">{row.name}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{row.copy}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="border-2 border-foreground bg-surface p-4">
                  <p className="eyebrow">Not used</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Google Analytics, Meta Pixel, TikTok pixel, session replay, advertising cookies
                    and retargeting tags are not on this site.
                  </p>
                </div>
                <div className="border-2 border-foreground bg-surface p-4">
                  <p className="eyebrow">No banner?</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    We do not show a cookie banner because we do not use non-essential cookies. If
                    that changes, this page changes before the new cookie is introduced.
                  </p>
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="contact-privacy"
              index="07"
              title="Contact our privacy team"
              lede="A request to access, correct or delete your information does not need a form or an account."
            >
              <div className="border-2 border-foreground bg-accent p-6 text-accent-foreground shadow-[6px_6px_0_0_var(--foreground)] md:p-8">
                <p className="text-[0.6rem] uppercase tracking-[0.16em] text-accent-foreground/70">
                  Privacy team / OMNIEL
                </p>
                <h3 className="mt-4 max-w-xl font-display text-3xl leading-[0.95] md:text-4xl">
                  Tell us what you need, and which email you used.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-accent-foreground/80">
                  Write to the address below with{" "}
                  <strong className="text-accent-foreground">&quot;Privacy request&quot;</strong> in
                  the subject. We may ask a question to confirm the request is really yours. Do not
                  send a government ID unless we ask for one.
                </p>
                <a
                  href={`mailto:${contactEmail}?subject=Privacy%20request`}
                  className="mt-6 inline-flex max-w-full flex-wrap items-center gap-2 border-2 border-foreground bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-transform hover:-translate-y-0.5"
                >
                  {contactEmail}
                  <span aria-hidden>→</span>
                </a>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="neo-glass rounded-2xl p-4">
                  <p className="eyebrow">NOVA waitlist</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Reply to any waitlist email or write to the privacy address. We will remove the
                    contact and stop the updates.
                  </p>
                </div>
                <div className="neo-glass rounded-2xl p-4">
                  <p className="eyebrow">Security</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Use the same address with <strong className="text-foreground">Security</strong>{" "}
                    in the subject. Please do not include live credentials in the first message.
                  </p>
                </div>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Last updated 27 October 2026. This policy describes the website as it runs today. If
                our data practices change, this page changes before the new practice starts.
              </p>
            </PolicySection>
          </div>
        </div>
      </Shell>
    </>
  );
}
