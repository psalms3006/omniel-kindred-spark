import { lazy, Suspense } from "react";
import { Mic } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { ClientOnly } from "./client-only";
import { Typewriter } from "./typewriter";
import { cn } from "@/lib/utils";

const ElectricWavesShader = lazy(() => import("@/components/ui/colorful-wave-pattern-1"));

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

function StaticWaves({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 overflow-hidden bg-[#03050a]",
        "bg-[radial-gradient(ellipse_at_center,rgba(47,107,255,0.38),transparent_58%)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_center,transparent_0_38px,rgba(56,214,255,0.1)_39px_40px)] opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(5,7,13,0.75))]" />
    </div>
  );
}

function VoiceConversation() {
  return (
    <div>
      <div className="flex items-center gap-2 text-[0.55rem] uppercase tracking-[0.14em] text-ember">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember/50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
        </span>
        Listening
      </div>

      <div className="mt-4 flex h-10 items-end gap-1" aria-hidden="true">
        {[34, 58, 82, 44, 90, 54, 72, 38, 86, 60, 32, 68].map((height, index) => (
          <span
            key={index}
            className="w-1.5 rounded-full bg-ember/60"
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
          {task.kind === "voice" ? <Mic className="h-3 w-3 text-ember" /> : null}
          {task.kind === "voice" ? "NOVA / voice" : "NOVA / chat"}
        </span>
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-ember">
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
          <p className="mt-3 max-w-[92%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {task.reply}
          </p>
        </>
      )}

      <div className="mt-5 flex items-center gap-2 text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-ember" />
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
      <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#03050a]">
        {reduced ? (
          <StaticWaves />
        ) : (
          <ClientOnly fallback={<StaticWaves />}>
            <Suspense fallback={<StaticWaves />}>
              <ElectricWavesShader
                waveCount={6}
                amplitude={0.12}
                frequency={2.4}
                brightness={0.006}
                colorSeparation={0.12}
              />
            </Suspense>
          </ClientOnly>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,rgba(5,7,13,0.78)_78%)]" />

        <div className="relative flex min-h-[36rem] flex-col items-center justify-center px-6 py-24 text-center md:min-h-[40rem]">
          <p className="eyebrow">Introducing our latest product</p>
          <h2 className="mt-5 text-[clamp(4rem,12vw,9rem)] leading-[0.85] text-white">NOVA</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
            One conversation. From thought to done.
          </p>

          <div className="mt-9 w-full max-w-xl rounded-2xl border border-white/15 bg-black/40 px-6 py-5 backdrop-blur-xl">
            <p className="min-h-[2.5rem] text-2xl leading-tight text-white md:text-4xl">
              <Typewriter className="text-white" />
            </p>
            <p className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-white/55">
              One conversation / no reset
            </p>
          </div>

          <p className="sr-only">
            NOVA is a voice-first assistant. It plans a task, executes it, and stays in the
            conversation. Examples include planning a week, booking a train, and sending a brief.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["Voice-first", "Plans and acts", "Always on"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs text-white/80 backdrop-blur-xl"
              >
                {chip}
              </span>
            ))}
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
