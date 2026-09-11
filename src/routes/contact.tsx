import { createFileRoute } from "@tanstack/react-router";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Eyebrow, PageHero, Panel, Section } from "@/components/site/primitives";
import { contactEmail, location, partnershipAreas } from "@/lib/omniel";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
    path: "/contact",
    title: "Contact OMNIEL: Partnership, investment and general enquiries",
    description: "Reach OMNIEL about products, partnerships, or supporting what is being built. Based in Nigeria.",
    ogTitle: "Contact OMNIEL",
    ogDescription: "General, partnership and investment enquiries for OMNIEL, based in Nigeria.",
    }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Start a conversation."
        lede="OMNIEL is early, which means messages reach the person actually building it."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="p-7">
            <Eyebrow>Email</Eyebrow>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-4 block break-all text-lg text-foreground underline-offset-4 hover:underline"
            >
              {contactEmail}
            </a>
          </Panel>
          <Panel className="p-7">
            <Eyebrow>Based in</Eyebrow>
            <p className="mt-4 text-lg">{location}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              No public office address. Enquiries are handled by email.
            </p>
          </Panel>
        </div>

        <div className="mt-4 grid gap-4">
          <InquiryForm
            id="contact"
            title="General enquiry"
            description="Questions about NOVA, VYREN, ARVO, KIWI, or OMNIEL itself."
            submitLabel="Send message"
          />

          <InquiryForm
            id="partnerships"
            title="Partnership interest"
            description="Technology, research, robotics, business, infrastructure or something else."
            categories={partnershipAreas}
            categoryLabel="Partnership area"
            submitLabel="Send partnership interest"
          />

          <InquiryForm
            id="investment"
            title="Express interest in supporting OMNIEL"
            description="There's no public fundraising round right now, this just opens a conversation."
            submitLabel="Express interest"
          />
        </div>
      </Section>
    </>
  );
}
