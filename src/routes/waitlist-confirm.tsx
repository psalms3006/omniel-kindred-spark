import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eyebrow, PageHero, Panel, Section } from "@/components/site/primitives";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/waitlist-confirm")({
  // The token arrives in the query string of the emailed link. Reading it here
  // (rather than trusting it in a GET handler) means a link prefetcher opening
  // the URL changes nothing — confirmation only happens on the POST below.
  validateSearch: (search: Record<string, unknown>): { token?: string } => {
    const token = search["token"];
    return typeof token === "string" && token.length > 0 ? { token } : {};
  },
  head: () =>
    pageHead({
      path: "/waitlist-confirm",
      title: "Confirm your NOVA waitlist place | OMNIEL",
      description: "Confirm your place on the NOVA waitlist.",
      noindex: true,
    }),
  component: ConfirmWaitlist,
});

type State = "idle" | "working" | "done" | "error";

function ConfirmWaitlist() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function confirm() {
    if (!token) return;
    setState("working");
    setMessage(null);
    try {
      const res = await fetch("/api/waitlist-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setState("done");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: unknown };
      setMessage(
        typeof body.error === "string"
          ? body.error
          : "We couldn't confirm your place. Please try the link again.",
      );
    } catch {
      setMessage("We couldn't reach the server. Check your connection and try again.");
    }
    setState("error");
  }

  return (
    <>
      <PageHero
        eyebrow="NOVA / Waitlist"
        title="One click to confirm."
        lede="This confirms the email address you signed up with. It doesn't commit you to anything."
      />

      <Section>
        <Panel className="max-w-xl p-7 md:p-9">
          {!token ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              This link is incomplete. Open the confirmation link from your email exactly as it was
              sent, or{" "}
              <a href="/waitlist" className="text-foreground underline underline-offset-4">
                sign up again
              </a>
              .
            </p>
          ) : state === "done" ? (
            <div>
              <Eyebrow>Confirmed</Eyebrow>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                You're on the NOVA waitlist. We'll email you when there's something to try.
              </p>
              <a
                href="/"
                className="mt-6 inline-block rounded-full border border-hairline px-6 py-3 text-sm font-medium transition-colors hover:bg-surface-strong"
              >
                Back to OMNIEL
              </a>
            </div>
          ) : (
            <div>
              <Eyebrow>Almost there</Eyebrow>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Press the button below to confirm your email and hold your place on the NOVA
                waitlist.
              </p>
              <button
                type="button"
                onClick={confirm}
                disabled={state === "working"}
                className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-[var(--motion-base)] hover:brightness-110 disabled:opacity-60"
              >
                {state === "working" ? "Confirming…" : "Confirm my place"}
              </button>
              {state === "error" && message ? (
                <p className="mt-4 text-xs leading-relaxed text-foreground" aria-live="polite">
                  {message}
                </p>
              ) : null}
            </div>
          )}
        </Panel>
      </Section>
    </>
  );
}
