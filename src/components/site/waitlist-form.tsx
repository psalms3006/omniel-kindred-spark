import { useId, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** Anchor id. Omitted when the surrounding section already provides one. */
  id?: string;
  className?: string;
  /** Optional heading for a page/panel that does not supply its own. */
  title?: string;
  description?: string;
  /** "plain" lets a caller supply its own neobrutalist frame. */
  frame?: "panel" | "plain";
};

type Status = "idle" | "sending" | "pending" | "confirmed" | "failed";

const field =
  "w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus-visible:border-accent/60";

function failureCopy(status: number | null): string {
  if (status === 503)
    return "The waitlist isn't accepting signups right now. Nothing was saved — please try again later or email us directly.";
  if (status === 502)
    return "Something went wrong on our side. Nothing was saved — please try again in a moment.";
  if (status === 400)
    return "Something in the form wasn't accepted. Check the details and try again.";
  if (status === null) return "We couldn't reach the server. Check your connection and try again.";
  return "That didn't go through. Please try again.";
}

export function WaitlistForm({ id, className, title, description, frame = "panel" }: Props) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [failureStatus, setFailureStatus] = useState<number | null>(null);
  const [sentTo, setSentTo] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");

    setStatus("sending");
    setFailureStatus(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email,
          intendedUse: String(data.get("intendedUse") ?? ""),
        }),
      });
      if (res.ok) {
        const body = (await res.json().catch(() => ({}))) as { status?: unknown };
        setStatus(body.status === "confirmed" ? "confirmed" : "pending");
        setSentTo(email);
        form.reset();
        return;
      }
      setFailureStatus(res.status);
    } catch {
      setFailureStatus(null);
    }
    setStatus("failed");
  }

  return (
    <div
      id={id}
      className={cn(
        frame === "panel" ? "panel" : "bg-card",
        "scroll-mt-28 rounded-3xl p-6 md:p-9",
        className,
      )}
    >
      {title ? <h3 className="text-2xl leading-snug">{title}</h3> : null}
      {description ? (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      <form
        className={cn("grid gap-4 sm:grid-cols-2", (title || description) && "mt-6")}
        onSubmit={onSubmit}
      >
        <div>
          <label htmlFor={`${uid}-name`} className="eyebrow mb-2 block">
            Name
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            data-field="name"
            required
            autoComplete="name"
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="eyebrow mb-2 block">
            Email
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            data-field="email"
            type="email"
            required
            autoComplete="email"
            className={field}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-use`} className="eyebrow mb-2 block">
            What would you want to use NOVA for?
          </label>
          <textarea
            id={`${uid}-use`}
            name="intendedUse"
            data-field="intendedUse"
            rows={3}
            maxLength={500}
            placeholder="Optional, but it helps us understand what matters to you."
            className={cn(field, "resize-y")}
          />
        </div>

        <div className="grid gap-4 sm:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-[var(--motion-base)] hover:brightness-110 disabled:opacity-60"
            >
              {status === "sending"
                ? "Sending…"
                : status === "failed"
                  ? "Try again"
                  : "Join the waitlist"}
            </button>
          </div>

          <p
            className={cn(
              "text-xs leading-relaxed",
              status === "failed" ? "text-foreground" : "text-muted-foreground",
            )}
            aria-live="polite"
          >
            {status === "idle" &&
              "We only use this to contact you about NOVA. You can ask to be removed at any time."}
            {status === "sending" && "Sending…"}
            {status === "pending" && (
              <>
                Almost there. We've sent a confirmation link to{" "}
                <span className="text-foreground">{sentTo}</span> — open it to hold your place.
              </>
            )}
            {status === "confirmed" && "You're already on the list. We'll be in touch."}
            {status === "failed" && failureCopy(failureStatus)}
          </p>
        </div>
      </form>
    </div>
  );
}
