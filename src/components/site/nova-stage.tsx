import { Mic } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { ActionLink } from "./primitives";
import { NovaWaves } from "./nova-waves";
import { Typewriter } from "./typewriter";

const tasks = [
  {
    kind: "chat",
    prompt: "Plan my week.",
    reply: "Three things matter: the brief (Tue), the deck (Wed), the build (Fri).",
    status: "Planned",
  },
  {
    kind: "voice",
    prompt: "Book the 08:10 for Thursday.",
    reply: "Booked. 08:10, seat 4A. Confirmation sent.",
    status: "Live",
  },
  {
    kind: "chat",
    prompt: "Send the brief.",
    reply: "Sent to four people. Two replies are already in.",
    status: "Sent",
  },
] as const;

function VoiceConversation() {
  return (
    <div>
      <div className="flex items-center gap-2 text-[0.55rem] uppercase tracking-[0.14em] text-olive">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-olive" />
        </span>
        Listening
      </div>

      <div className="mt-4 flex h-10 items-end gap-1" aria-hidden="true">
        {[34, 58, 82, 44, 90, 54, 72, 38, 86, 60, 32, 68].map((height, index) => (
          <span
            key={index}
            className="w-1.5 rounded-full bg-sage"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">&quot;Book the 08:10 for Thursday.&quot;</p>
      <p className="mt-2 text-xs text-foreground">Booked. 08:10, seat 4A. Confirmation sent.</p>
    </div>
  );
}

function TaskCard({ task }: { task: (typeof tasks)[number] }) {
  return (
    <article className="neo-glass w-[17rem] shrink-0 rounded-2xl p-5 md:w-[22rem]">
      <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          {task.kind === "voice" ? <Mic className="h-3 w-3 text-accent" /> : null}
          {task.kind === "voice" ? "NOVA / voice" : "NOVA / chat"}
        </span>
        <span className="rounded-full border border-hairline px-2 py-0.5 text-accent">
          {task.status}
        </span>
      </div>

      {task.kind === "voice" ? (
        <div className="mt-4">
          <VoiceConversation />
        </div>
      ) : (
        <>
          <p className="mt-5 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground">
            {task.prompt}
          </p>
          <p className="mt-3 max-w-[92%] rounded-2xl rounded-bl-sm border border-hairline bg-background/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {task.reply}
          </p>
        </>
      )}

      <div className="mt-5 flex items-center gap-2 text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
        Voice-first / continuous
      </div>
    </article>
  );
}

function TaskMarquee() {
  return (
    <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="marquee flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-4 pr-4" aria-hidden={copy === 1 ? "true" : undefined}>
            {tasks.map((task) => (
              <TaskCard key={`${copy}-${task.prompt}`} task={task} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function NovaStage() {
  const reduced = useReducedMotion();

  return (
    <div>
      <div className="theme-dark relative overflow-hidden rounded-[2rem] border border-hairline">
        <NovaWaves fade={false} />

        <div className="relative z-10 flex min-h-[32rem] flex-col items-center justify-center px-6 py-20 text-center">
          <p className="eyebrow">Introducing NOVA</p>
          <h2 className="mt-5 text-[clamp(3rem,7vw,6rem)] leading-[0.9] text-[#f2ebde]">
            The everyday intelligence.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#b9b1a4] md:text-base">
            NOVA carries the planning, the follow-ups and the admin. You keep the day.
          </p>

          <div className="mt-8 w-full max-w-xl rounded-2xl border border-[#f2ebde]/15 bg-[#1a1a18]/55 px-6 py-5">
            <p className="min-h-[2.5rem] text-2xl leading-tight text-[#f2ebde] md:text-4xl">
              <Typewriter className="text-[#f2ebde]" />
            </p>
            <p className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-[#b9b1a4]/70">
              One conversation / no reset
            </p>
          </div>

          <p className="sr-only">
            NOVA is a voice-first assistant. It plans a task, executes it, and stays in the
            conversation. Examples include planning a week, booking a train, and sending a brief.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {["Voice-first", "Plans and acts", "Always on"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#f2ebde]/20 bg-[#1a1a18]/40 px-4 py-2 text-xs text-[#f2ebde]/80"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-7">
            <ActionLink to="/nova">Meet NOVA</ActionLink>
          </div>
        </div>
      </div>

      {reduced ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.prompt} task={task} />
          ))}
        </div>
      ) : (
        <TaskMarquee />
      )}
    </div>
  );
}
