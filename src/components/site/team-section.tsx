import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Atmosphere } from "@/components/site/atmosphere";
import { Panel, Reveal } from "@/components/site/primitives";
import { teamMembers, type TeamMember } from "@/lib/omniel";

/**
 * Placeholder for a real profile photo — none have been collected yet.
 * Reuses the same meridian motif as the product cards instead
 * of a generic avatar icon or stock photo, so it reads as intentional.
 */
function PersonMark({ member, size = "md" }: { member: TeamMember; size?: "md" | "lg" }) {
  return (
    <div
      className={
        size === "lg"
          ? "relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-hairline"
          : "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-hairline"
      }
    >
      {member.photo ? (
        <img src={member.photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <Atmosphere variant="band" intensity={0.55} />
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center font-display text-sm tracking-[0.2em] text-foreground/80"
          >
            {member.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </span>
        </>
      )}
    </div>
  );
}

function SocialLinks({ social }: { social: TeamMember["social"] }) {
  if (!social) return null;
  const entries = Object.entries(social).filter(([, url]) => url);
  if (entries.length === 0) return null;
  return (
    <ul className="mt-6 flex flex-wrap gap-3 text-sm">
      {entries.map(([key, url]) => (
        <li key={key}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            {key}
          </a>
        </li>
      ))}
    </ul>
  );
}

function ProfileOverlay({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} profile`}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.button
        aria-label="Close profile"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="glass relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] p-8 sm:rounded-[2rem] md:p-10"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 text-sm text-muted-foreground hover:text-foreground"
        >
          Close
        </button>

        <PersonMark member={member} size="lg" />
        <h2 className="mt-6 text-2xl leading-snug text-foreground">{member.name}</h2>
        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
          {member.role}
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {member.relationship}
        </p>

        <p className="mt-6 text-base leading-relaxed text-muted-foreground">{member.bio}</p>

        <div className="mt-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
            Current focus
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{member.focus}</p>
        </div>

        <div className="mt-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">Areas</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {member.areas.map((a) => (
              <li
                key={a}
                className="rounded-full border border-hairline px-3 py-1 text-xs text-foreground"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>

        <SocialLinks social={member.social} />
      </motion.div>
    </motion.div>
  );
}

export function TeamSection() {
  const [active, setActive] = useState<TeamMember | null>(null);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {teamMembers.map((member, i) => (
          <Reveal key={member.slug} delay={i * 0.05}>
            <button
              type="button"
              onClick={() => setActive(member)}
              className="block h-full w-full text-left"
              aria-haspopup="dialog"
            >
              <Panel interactive className="flex h-full items-start gap-4 p-6">
                <PersonMark member={member} />
                <div className="min-w-0">
                  <p className="text-lg leading-snug text-foreground">{member.name}</p>
                  <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent">
                    {member.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {member.tagline}
                  </p>
                </div>
              </Panel>
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {active && <ProfileOverlay member={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
}
