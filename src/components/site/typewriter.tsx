import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Typewriter for the NOVA stage. The animated line is hidden from assistive
 * tech; the stage supplies a static readable sentence. Reduced motion shows one
 * phrase without cycling.
 */
const DEFAULT_PHRASES = ["Plan my week.", "Book the 08:10.", "Send the brief."] as const;

export function Typewriter({
  className,
  phrases = DEFAULT_PHRASES,
}: {
  className?: string;
  phrases?: readonly string[];
}) {
  const reduced = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced) {
      setText(phrases[0] ?? "");
      return;
    }

    const phrase = phrases[phraseIndex] ?? "";
    const atEnd = !deleting && text === phrase;
    const atStart = deleting && text === "";

    if (atEnd) {
      const pause = window.setTimeout(() => setDeleting(true), 1600);
      return () => window.clearTimeout(pause);
    }

    if (atStart) {
      setDeleting(false);
      setPhraseIndex((index) => (index + 1) % phrases.length);
      return;
    }

    const tick = window.setTimeout(
      () => {
        setText(deleting ? phrase.slice(0, text.length - 1) : phrase.slice(0, text.length + 1));
      },
      deleting ? 26 : 62,
    );
    return () => window.clearTimeout(tick);
  }, [text, deleting, phraseIndex, reduced, phrases]);

  return (
    <span className={cn("font-mono", className)} aria-hidden="true">
      {text}
      <span className="ml-1 inline-block h-[0.9em] w-[2px] translate-y-[0.08em] animate-pulse bg-ember" />
    </span>
  );
}
