import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Droplet, Minus, Plus, Bell, BellOff, Trophy, Flame, X, Moon, Sun, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sip — Water Reminder" },
      { name: "description", content: "Track your daily water intake with gentle hourly reminders." },
    ],
  }),
  component: Index,
});

const DAILY_GOAL_ML = 2000;
const CUP_ML = 250;

type Log = Record<string, number>; // ISO date -> ml

const todayKey = () => new Date().toISOString().slice(0, 10);

function useLogs() {
  const [logs, setLogs] = useState<Log>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sip.logs");
      if (raw) setLogs(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("sip.logs", JSON.stringify(logs));
  }, [logs]);
  return [logs, setLogs] as const;
}

type ReminderSettings = {
  enabled: boolean;
  intervalMin: number;
  wake: string; // "HH:MM" – start of active window
  sleep: string; // "HH:MM" – start of quiet hours
};

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  intervalMin: 60,
  wake: "08:00",
  sleep: "22:00",
};

function useReminderSettings() {
  const [s, setS] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sip.reminders");
      if (raw) setS({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("sip.reminders", JSON.stringify(s));
  }, [s]);
  return [s, setS] as const;
}

// Minutes since midnight from "HH:MM"
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fromMin = (n: number) => {
  const x = ((n % 1440) + 1440) % 1440;
  return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
};
const fmt12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
};

function computeTimes(s: ReminderSettings): string[] {
  if (s.intervalMin <= 0) return [];
  const w = toMin(s.wake);
  const sl = toMin(s.sleep);
  // active window length (handles overnight wake > sleep)
  const span = sl > w ? sl - w : 1440 - w + sl;
  const out: string[] = [];
  for (let t = 0; t <= span; t += s.intervalMin) out.push(fromMin(w + t));
  return out;
}

function Index() {
  const [logs, setLogs] = useLogs();
  const [settings, setSettings] = useReminderSettings();
  const today = todayKey();
  const ml = logs[today] ?? 0;
  const pct = Math.min(100, Math.round((ml / DAILY_GOAL_ML) * 100));

  const add = (amount: number) =>
    setLogs((l) => ({ ...l, [today]: Math.max(0, (l[today] ?? 0) + amount) }));

  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    while ((logs[d.toISOString().slice(0, 10)] ?? 0) >= DAILY_GOAL_ML) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [logs]);

  const completedThisMonth = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return Object.entries(logs).filter(([k, v]) => k.startsWith(ym) && v >= DAILY_GOAL_ML).length;
  }, [logs]);

  const allTime = useMemo(
    () => Object.values(logs).filter((v) => v >= DAILY_GOAL_ML).length,
    [logs],
  );

  const times = useMemo(() => computeTimes(settings), [settings]);

  // Scheduler: fire a browser notification when the current minute matches a scheduled time.
  const firedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!settings.enabled) return;
    const tick = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const stamp = `${todayKey()} ${hhmm}`;
      if (times.includes(hhmm) && !firedRef.current.has(stamp)) {
        firedRef.current.add(stamp);
        fireReminder();
      }
    };
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [settings.enabled, times]);

  const toggleReminders = useCallback(async () => {
    if (!settings.enabled && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch {}
    }
    setSettings((s) => ({ ...s, enabled: !s.enabled }));
  }, [settings.enabled, setSettings]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-md px-5 pb-24 pt-10 sm:max-w-xl sm:px-8">
        <Header />

        <HeroCard ml={ml} pct={pct} onAdd={add} />

        <QuickAdd onAdd={add} />

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatChip icon={<Check className="h-4 w-4" />} value={completedThisMonth} label="this month" />
          <StatChip icon={<Trophy className="h-4 w-4" />} value={allTime} label="all time" />
          <StatChip icon={<Flame className="h-4 w-4" />} value={streak} label="day streak" />
        </div>

        <CalendarCard logs={logs} />

        <ReminderCard
          settings={settings}
          setSettings={setSettings}
          times={times}
          onToggle={toggleReminders}
        />

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Stay hydrated · {DAILY_GOAL_ML / 1000}L daily goal
        </footer>
      </div>
    </div>
  );
}

function fireReminder() {
  const body = "Time for a sip of water 💧";
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Sip", { body, icon: "/favicon.ico" });
    }
  } catch {}
  // Soft chime via WebAudio (no asset needed)
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (Ctx) {
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.65);
    }
  } catch {}
}

function Header() {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--honey)] text-[oklch(0.25_0.05_70)] shadow-[var(--shadow-soft)]">
          <Droplet className="h-4 w-4 fill-current" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Productivity</p>
          <h1 className="font-display text-xl font-semibold leading-none">Sip</h1>
        </div>
      </div>
      <button className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </header>
  );
}

function HeroCard({ ml, pct, onAdd }: { ml: number; pct: number; onAdd: (n: number) => void }) {
  const left = Math.max(0, DAILY_GOAL_ML - ml);
  return (
    <section
      className="relative overflow-hidden rounded-[28px] p-7 shadow-[var(--shadow-soft)]"
      style={{ background: "var(--gradient-cream)" }}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[oklch(0.45_0.08_70)]">
        Today
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-6xl font-bold leading-none tracking-tight text-[oklch(0.28_0.05_60)]">
          {(ml / 1000).toFixed(2)}
        </span>
        <span className="font-display text-2xl font-semibold text-[oklch(0.4_0.06_65)]">L</span>
      </div>
      <p className="mt-1 text-sm text-[oklch(0.4_0.05_65)]">
        {left > 0 ? `${(left / 1000).toFixed(2)}L to your goal` : "Goal reached — beautifully done."}
      </p>

      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-[oklch(1_0_0/0.5)]">
        <div
          className="h-full rounded-full bg-[var(--honey-deep)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-[oklch(0.4_0.05_65)]">
        <span>{pct}%</span>
        <span>{DAILY_GOAL_ML / 1000}L</span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => onAdd(-CUP_ML)}
          className="grid h-12 w-12 place-items-center rounded-full bg-[oklch(1_0_0/0.6)] text-[oklch(0.3_0.05_60)] backdrop-blur transition hover:bg-[oklch(1_0_0/0.9)]"
          aria-label="Remove a cup"
        >
          <Minus className="h-5 w-5" />
        </button>
        <button
          onClick={() => onAdd(CUP_ML)}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[oklch(0.25_0.04_60)] font-medium text-[oklch(0.98_0.02_85)] transition hover:bg-[oklch(0.2_0.04_60)]"
        >
          <Plus className="h-4 w-4" /> Add a cup · 250ml
        </button>
      </div>
    </section>
  );
}

function QuickAdd({ onAdd }: { onAdd: (n: number) => void }) {
  const options = [
    { ml: 150, label: "Espresso", emoji: "☕" },
    { ml: 250, label: "Glass", emoji: "🥛" },
    { ml: 350, label: "Mug", emoji: "🍵" },
    { ml: 500, label: "Bottle", emoji: "🧴" },
  ];
  return (
    <section className="mt-6">
      <h2 className="mb-3 px-1 text-sm font-medium text-muted-foreground">Quick add</h2>
      <div className="grid grid-cols-4 gap-3">
        {options.map((o) => (
          <button
            key={o.label}
            onClick={() => onAdd(o.ml)}
            className="group flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-4 transition hover:border-[var(--honey)] hover:shadow-[var(--shadow-soft)]"
          >
            <span className="text-2xl transition-transform group-hover:scale-110">{o.emoji}</span>
            <span className="text-xs font-medium">{o.label}</span>
            <span className="text-[10px] text-muted-foreground">{o.ml}ml</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function StatChip({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--cream)] text-[oklch(0.4_0.08_70)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-display text-lg font-bold leading-none">{value}</p>
        <p className="truncate text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function CalendarCard({ logs }: { logs: Log }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString("en", { month: "long", year: "numeric" });
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const startWeekday = (first.getDay() + 6) % 7; // Mon-start
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const todayDate = now.getDate();

  return (
    <section className="mt-6 rounded-[28px] border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{monthName}</h2>
        <span className="text-xs text-muted-foreground">Goal met days</span>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const k = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayMl = logs[k] ?? 0;
          const done = dayMl >= DAILY_GOAL_ML;
          const partial = dayMl > 0 && !done;
          const isToday = d === todayDate;
          return (
            <div
              key={i}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-xs transition ${
                isToday ? "bg-[var(--cream)] font-semibold" : ""
              }`}
            >
              <span className={`text-[11px] ${isToday ? "text-[oklch(0.3_0.05_60)]" : "text-muted-foreground"}`}>
                {d}
              </span>
              {done ? (
                <span className="mt-1 grid h-4 w-4 place-items-center rounded-full bg-[var(--honey)]">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                </span>
              ) : partial ? (
                <span className="mt-1 h-4 w-4 rounded-full border-2 border-[var(--honey)]" />
              ) : (
                <span className="mt-1 h-1 w-1 rounded-full bg-border" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ReminderCard({
  settings,
  setSettings,
  times,
  onToggle,
}: {
  settings: ReminderSettings;
  setSettings: React.Dispatch<React.SetStateAction<ReminderSettings>>;
  times: string[];
  onToggle: () => void;
}) {
  const { enabled, intervalMin, wake, sleep } = settings;
  const perm = typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default";

  // Next upcoming reminder today
  const next = useMemo(() => {
    if (!enabled || times.length === 0) return null;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return times.find((t) => toMin(t) > nowMin) ?? null;
  }, [enabled, times]);

  return (
    <section className="mt-6 rounded-[28px] border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--cream)] text-[oklch(0.35_0.08_70)]">
            {enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </div>
          <div>
            <h2 className="font-display text-base font-semibold">Reminder scheduler</h2>
            <p className="text-xs text-muted-foreground">
              {enabled
                ? `Every ${intervalMin}m · ${times.length} sips · ${fmt12(wake)}–${fmt12(sleep)}`
                : "Off — turn on to get gentle nudges."}
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            enabled ? "bg-[var(--honey-deep)]" : "bg-border"
          }`}
          aria-label="Toggle reminders"
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
              enabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Interval */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Every
          </span>
          <span className="text-xs font-medium text-foreground">{intervalMin} min</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[15, 30, 45, 60, 90, 120, 180].map((n) => (
            <button
              key={n}
              onClick={() => setSettings((s) => ({ ...s, intervalMin: n }))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                intervalMin === n
                  ? "border-[var(--honey-deep)] bg-[var(--cream)] text-[oklch(0.3_0.05_60)]"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {n}m
            </button>
          ))}
        </div>
      </div>

      {/* Active window / quiet hours */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <TimeField
          icon={<Sun className="h-3.5 w-3.5" />}
          label="Wake up"
          value={wake}
          onChange={(v) => setSettings((s) => ({ ...s, wake: v }))}
        />
        <TimeField
          icon={<Moon className="h-3.5 w-3.5" />}
          label="Quiet from"
          value={sleep}
          onChange={(v) => setSettings((s) => ({ ...s, sleep: v }))}
        />
      </div>
      <p className="mt-2 px-1 text-[11px] text-muted-foreground">
        Reminders pause between {fmt12(sleep)} and {fmt12(wake)}.
      </p>

      {/* Times list */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Scheduled times
          </span>
          {next && (
            <span className="flex items-center gap-1 text-[11px] text-[oklch(0.4_0.08_70)]">
              <Clock className="h-3 w-3" /> next {fmt12(next)}
            </span>
          )}
        </div>
        {times.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Choose an interval to generate times.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {times.map((t) => {
              const isNext = t === next;
              return (
                <span
                  key={t}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums transition ${
                    isNext
                      ? "bg-[var(--honey-deep)] text-white"
                      : "bg-[var(--cream)] text-[oklch(0.35_0.06_65)]"
                  }`}
                >
                  {fmt12(t)}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {enabled && perm !== "granted" && (
        <p className="mt-4 rounded-xl bg-[var(--cream)] px-3 py-2 text-[11px] text-[oklch(0.35_0.06_65)]">
          {perm === "denied"
            ? "Notifications are blocked in your browser. You'll still hear a soft chime while this tab is open."
            : "Allow notifications to get reminders even when this tab is in the background."}
        </p>
      )}
    </section>
  );
}

function TimeField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-3">
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-display text-lg font-semibold tabular-nums text-foreground outline-none"
      />
    </label>
  );
}
