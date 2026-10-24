import { createFileRoute } from "@tanstack/react-router";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { Eyebrow, PageHero, Section } from "@/components/site/primitives";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/waitlist")({
  head: () =>
    pageHead({
      path: "/waitlist",
      title: "Join the NOVA waitlist | OMNIEL",
      description:
        "NOVA is OMNIEL's everyday intelligence. Join the waitlist and we'll email you when there is something to try.",
      ogTitle: "Join the NOVA waitlist",
      ogDescription: "Add your name and we'll contact you when NOVA is ready.",
    }),
  component: WaitlistPage,
});

function WaitlistPage() {
  return (
    <>
      <PageHero
        eyebrow="NOVA / Early access"
        title="Be first to use NOVA."
        lede="NOVA is OMNIEL's everyday intelligence. Join the waitlist and we'll email you when there is something worth showing you. No newsletters in between."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Eyebrow>What happens next</Eyebrow>
            <ul className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                We send a confirmation link. You're only added once you open it — that keeps someone
                else from adding your address.
              </li>
              <li>
                After that, you hear from us when NOVA is ready, and not before. No release date is
                promised, because none has been set.
              </li>
              <li>You can leave the list at any time by replying to any email from us.</li>
            </ul>
          </div>

          <WaitlistForm id="waitlist" />
        </div>
      </Section>
    </>
  );
}
