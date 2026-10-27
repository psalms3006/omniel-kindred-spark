const subjects = ["Mathematics", "Biology", "History", "Computer Science"] as const;

const plan = [
  { label: "Quadratic functions — practice set", done: true },
  { label: "Cell division — summary notes", done: true },
  { label: "Cold War timeline — flashcards", done: false },
  { label: "Recursion — two exercises", done: false },
] as const;

/** A glass study workspace, used in the beige "Made for Students" section. */
export function StudyWorkspace() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_70%_20%,rgba(110,48,56,0.14),transparent_62%)] blur-2xl"
      />

      <div className="neo-glass relative overflow-hidden rounded-3xl">
        <div className="flex items-center gap-1.5 border-b border-hairline px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="h-2 w-2 rounded-full bg-sage" />
          <span className="h-2 w-2 rounded-full bg-surface-strong" />
          <span className="ml-2 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
            Study workspace / Thursday
          </span>
          <span className="ml-auto text-[0.55rem] uppercase tracking-[0.14em] text-accent">
            Focus
          </span>
        </div>

        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[9rem_1fr]">
          <aside className="border-r border-hairline p-2.5 sm:p-3">
            <p className="text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
              Subjects
            </p>
            <ul className="mt-2 space-y-1">
              {subjects.map((subject, index) => (
                <li
                  key={subject}
                  className={
                    index === 0
                      ? "rounded-lg bg-accent px-2.5 py-1.5 text-[0.68rem] font-medium text-accent-foreground"
                      : "rounded-lg px-2.5 py-1.5 text-[0.68rem] text-muted-foreground"
                  }
                >
                  {subject}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-hairline bg-foreground/[0.03] p-3">
              <p className="text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
                Streak
              </p>
              <p className="mt-1 font-display text-2xl leading-none">12 days</p>
            </div>
          </aside>

          <div className="p-3 sm:p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Today
                </p>
                <p className="mt-1 font-display text-2xl leading-none">Quadratic functions</p>
              </div>
              <p className="text-[0.62rem] text-muted-foreground">2 / 4 done</p>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full w-1/2 rounded-full bg-accent" />
            </div>

            <ul className="mt-4 space-y-2">
              {plan.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5 text-[0.7rem]">
                  <span
                    className={
                      item.done
                        ? "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent text-[0.55rem] text-accent-foreground"
                        : "mt-0.5 h-4 w-4 shrink-0 rounded-full border border-foreground/25"
                    }
                  >
                    {item.done ? "✓" : ""}
                  </span>
                  <span className={item.done ? "text-muted-foreground line-through" : ""}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2">
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-[0.68rem] text-primary-foreground">
                Explain the quadratic formula.
              </p>
              <p className="max-w-[92%] rounded-2xl rounded-bl-sm border border-hairline bg-foreground/[0.03] px-3 py-2 text-[0.68rem] leading-relaxed text-muted-foreground">
                Start with the discriminant, <span className="text-foreground">b² − 4ac</span>. It
                tells you how many real roots exist before you solve anything.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="neo-glass absolute -bottom-4 -right-3 hidden rounded-xl px-3 py-2 text-[0.6rem] uppercase tracking-[0.12em] sm:block">
        <span className="text-accent">42 min</span> focus
      </div>
    </div>
  );
}
