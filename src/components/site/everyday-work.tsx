import { CalendarDays, Check, Clock3, Inbox, Users } from "lucide-react";

const approvals = [
  { title: "Invoice #204 — Northline", who: "Finance", initials: "FN", done: false },
  { title: "Reply to Priya — scope", who: "Client", initials: "PK", done: false },
  { title: "Site visit — Thursday", who: "Operations", initials: "OP", done: true },
] as const;

const calendar = [
  { time: "09:00", label: "Daily standup", with: "Team" },
  { time: "11:30", label: "Client call — Priya", with: "Maya" },
  { time: "15:00", label: "Q3 review", with: "Finance" },
] as const;

/** A dark glass "everyday work" dashboard for the enterprise section. */
export function EverydayWork() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,rgba(47,107,255,0.28),transparent_62%)] blur-2xl"
      />

      <div className="neo-glass relative overflow-hidden rounded-3xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
            NOVA / Workday
          </span>
          <span className="ml-auto text-[0.55rem] uppercase tracking-[0.14em] text-ember">
            Tue 20 Oct
          </span>
        </div>

        <div className="grid sm:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-white/10 p-4 sm:border-b-0 sm:border-r">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
                <Inbox className="h-3 w-3" /> Waiting on you
              </p>
              <span className="text-[0.55rem] text-ember">3 items</span>
            </div>

            <ul className="mt-3 space-y-2">
              {approvals.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ember text-[0.55rem] font-semibold text-[#05070d]">
                    {item.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.68rem] text-foreground">
                      {item.title}
                    </span>
                    <span className="text-[0.55rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {item.who}
                    </span>
                  </span>
                  <span
                    className={
                      item.done
                        ? "grid h-6 w-6 place-items-center rounded-full bg-white/10 text-ember"
                        : "grid h-6 w-6 place-items-center rounded-full border border-white/20 text-muted-foreground"
                    }
                  >
                    <Check className="h-3 w-3" />
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <p className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
                <Users className="h-3 w-3" /> Team thread
              </p>
              <p className="mt-2 text-[0.68rem] leading-relaxed text-muted-foreground">
                <span className="text-foreground">Maya</span> — Q3 numbers are in.
              </p>
              <p className="mt-1 text-[0.68rem] leading-relaxed text-muted-foreground">
                <span className="text-ember">NOVA</span> — Reconciled. Two variances flagged for
                Priya.
              </p>
            </div>
          </div>

          <div className="p-4">
            <p className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
              <CalendarDays className="h-3 w-3" /> Today
            </p>

            <ul className="mt-3 space-y-3">
              {calendar.map((item) => (
                <li key={item.time} className="flex gap-3">
                  <span className="flex w-10 shrink-0 items-center gap-1 text-[0.55rem] text-muted-foreground">
                    <Clock3 className="h-2.5 w-2.5" />
                    {item.time}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.66rem] text-foreground">{item.label}</span>
                    <span className="text-[0.55rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {item.with}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
                Handled today
              </p>
              <p className="mt-1 font-display text-2xl leading-none">14 tasks</p>
              <p className="mt-1 text-[0.58rem] text-muted-foreground">
                Inbox, approvals, invoices and scheduling.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-[0.58rem] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            Every person, every handoff
          </span>
          <span className="text-ember">3 waiting for you</span>
        </div>
      </div>
    </div>
  );
}
