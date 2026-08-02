import { useMemo } from "react";
import { BarChart3, Download } from "lucide-react";

type Log = Record<string, number>;

const key = (d: Date) => d.toISOString().slice(0, 10);

export function InsightsCard({ logs, goal, now }: { logs: Log; goal: number; now: Date | null }) {
  const days = useMemo(() => {
    const base = now ?? new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() - (6 - i));
      const ml = logs[key(d)] ?? 0;
      return {
        k: key(d),
        ml,
        label: d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 1),
        pct: Math.min(100, Math.round((ml / goal) * 100)),
      };
    });
  }, [logs, goal, now]);

  const avg = Math.round(days.reduce((a, b) => a + b.ml, 0) / 7);
  const score = Math.min(100, Math.round(days.reduce((a, b) => a + b.pct, 0) / 7));
  const best = days.reduce((a, b) => (b.ml > a.ml ? b : a), days[0]);

  const exportCsv = () => {
    const rows = [["date", "ml", "goal_ml", "goal_met"]].concat(
      Object.entries(logs)
        .sort()
        .map(([d, v]) => [d, String(v), String(goal), v >= goal ? "yes" : "no"]),
    );
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `sip-hydration-${key(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--cream)] text-[oklch(0.35_0.08_70)]">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold leading-none">Weekly insights</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">Pichhle 7 din ka hydration score</p>
          </div>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="mt-5 flex h-28 items-end justify-between gap-2">
        {days.map((d) => (
          <div key={d.k} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-20 w-full items-end rounded-lg bg-[var(--cream)]">
              <div
                className="w-full rounded-lg bg-[var(--honey-deep)] transition-all"
                style={{ height: `${Math.max(4, d.pct)}%` }}
                title={`${d.ml} ml`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric value={`${score}%`} label="score" />
        <Metric value={`${(avg / 1000).toFixed(1)}L`} label="daily avg" />
        <Metric value={`${(best.ml / 1000).toFixed(1)}L`} label="best day" />
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-[var(--cream)] px-2 py-3">
      <p className="font-display text-lg font-bold leading-none text-[oklch(0.28_0.05_60)]">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-[oklch(0.45_0.08_70)]">{label}</p>
    </div>
  );
}
