import { useMemo } from "react";
import { Award, Lock } from "lucide-react";

type Log = Record<string, number>;

export function AchievementsCard({ logs, goal }: { logs: Log; goal: number }) {
  const stats = useMemo(() => {
    const values = Object.values(logs);
    const metDays = values.filter((v) => v >= goal).length;
    const total = values.reduce((a, b) => a + b, 0);
    let streak = 0;
    const d = new Date();
    while ((logs[d.toISOString().slice(0, 10)] ?? 0) >= goal) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return { metDays, total, streak };
  }, [logs, goal]);

  const badges = [
    { emoji: "💧", name: "First sip", done: stats.total > 0, hint: "Pehla cup log karein" },
    { emoji: "🎯", name: "Goal hit", done: stats.metDays >= 1, hint: "1 din goal poora" },
    { emoji: "🔥", name: "3-day streak", done: stats.streak >= 3, hint: "3 din lagataar" },
    { emoji: "⭐", name: "Week warrior", done: stats.streak >= 7, hint: "7 din lagataar" },
    { emoji: "🏆", name: "10 goals", done: stats.metDays >= 10, hint: "10 din goal poora" },
    { emoji: "🌊", name: "100L club", done: stats.total >= 100000, hint: "Total 100 litre" },
  ];

  const unlocked = badges.filter((b) => b.done).length;

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--cream)] text-[oklch(0.35_0.08_70)]">
          <Award className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold leading-none">Achievements</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {unlocked} / {badges.length} unlocked
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {badges.map((b) => (
          <div
            key={b.name}
            className={`rounded-2xl border p-3 text-center transition ${
              b.done
                ? "border-[var(--honey-deep)] bg-[var(--cream)]"
                : "border-dashed border-border opacity-60"
            }`}
          >
            <div className="text-xl leading-none">
              {b.done ? b.emoji : <Lock className="mx-auto h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="mt-1.5 text-[11px] font-medium leading-tight">{b.name}</p>
            <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground">{b.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
