import { useMemo, useState } from "react";
import { Calculator, Wand2 } from "lucide-react";

type Props = {
  goal: number;
  setGoal: (n: number) => void;
};

const ACTIVITY = [
  { key: "low", label: "Low", hindi: "kam chalna", add: 0 },
  { key: "medium", label: "Active", hindi: "thoda workout", add: 350 },
  { key: "high", label: "Athlete", hindi: "roz gym", add: 700 },
] as const;

const CLIMATE = [
  { key: "cool", label: "Cool", add: 0 },
  { key: "normal", label: "Normal", add: 200 },
  { key: "hot", label: "Hot / humid", add: 450 },
] as const;

export function SmartGoalCard({ goal, setGoal }: Props) {
  const [weight, setWeight] = useState(60);
  const [activity, setActivity] = useState<(typeof ACTIVITY)[number]["key"]>("medium");
  const [climate, setClimate] = useState<(typeof CLIMATE)[number]["key"]>("normal");

  const suggested = useMemo(() => {
    const base = weight * 33; // ~33ml per kg
    const a = ACTIVITY.find((x) => x.key === activity)!.add;
    const c = CLIMATE.find((x) => x.key === climate)!.add;
    return Math.round((base + a + c) / 50) * 50;
  }, [weight, activity, climate]);

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--cream)] text-[oklch(0.35_0.08_70)]">
          <Calculator className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold leading-none">Smart goal calculator</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Weight, activity aur mausam se aapka sahi target
          </p>
        </div>
      </div>

      <label className="mt-5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Weight — {weight} kg
      </label>
      <input
        type="range"
        min={30}
        max={150}
        step={1}
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--honey-deep)]"
        aria-label="Body weight in kilograms"
      />

      <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Activity level
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ACTIVITY.map((a) => (
          <button
            key={a.key}
            onClick={() => setActivity(a.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              activity === a.key
                ? "border-[var(--honey-deep)] bg-[var(--cream)] text-[oklch(0.3_0.05_60)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Climate
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {CLIMATE.map((c) => (
          <button
            key={c.key}
            onClick={() => setClimate(c.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              climate === c.key
                ? "border-[var(--honey-deep)] bg-[var(--cream)] text-[oklch(0.3_0.05_60)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[var(--cream)] p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[oklch(0.45_0.08_70)]">Suggested</p>
          <p className="font-display text-2xl font-bold text-[oklch(0.28_0.05_60)]">
            {(suggested / 1000).toFixed(2)}L
          </p>
        </div>
        <button
          onClick={() => setGoal(suggested)}
          disabled={goal === suggested}
          className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.25_0.04_60)] px-4 py-2 text-sm font-medium text-[oklch(0.98_0.02_85)] transition hover:bg-[oklch(0.2_0.04_60)] disabled:opacity-40"
        >
          <Wand2 className="h-4 w-4" />
          {goal === suggested ? "Applied" : "Use this goal"}
        </button>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        General wellness guidance only — medical advice nahi hai. Pregnancy, kidney ya heart
        conditions mein apne doctor se poochein.
      </p>
    </section>
  );
}
