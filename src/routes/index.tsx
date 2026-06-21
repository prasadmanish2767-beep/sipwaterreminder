import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Droplet,
  Minus,
  Plus,
  Bell,
  BellOff,
  Trophy,
  Flame,
  X,
  Moon,
  Sun,
  Clock,
  Volume2,
  VolumeX,
  Zap,
  Trash2,
  Mic,
  MicOff,
  Menu,
} from "lucide-react";
import { Onboarding } from "../components/Onboarding";
import { SettingsMenu } from "../components/SettingsMenu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sip — Water Reminder" },
      { name: "description", content: "Track your daily water intake with gentle hourly reminders." },
    ],
  }),
  component: Index,
});

const DEFAULT_GOAL_ML = 2000;
const CUP_ML = 250;

function useDailyGoal() {
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL_ML);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sip.dailyGoal");
      if (raw) {
        const n = parseInt(raw, 10);
        if (Number.isFinite(n) && n > 0) setGoal(n);
      }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("sip.dailyGoal", String(goal));
  }, [goal]);
  return [goal, setGoal] as const;
}

type Log = Record<string, number>;

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
  wake: string;
  sleep: string;
  sound: boolean;
  voice: boolean; // speak "paani piyo, time ho gaya"
  customTimes: string[]; // extra HH:MM
};

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  intervalMin: 60,
  wake: "08:00",
  sleep: "22:00",
  sound: true,
  voice: true,
  customTimes: [],
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

// Is `t` inside the active window (wake → sleep, wrapping past midnight)?
function inWindow(t: string, wake: string, sleep: string): boolean {
  const x = toMin(t), w = toMin(wake), s = toMin(sleep);
  if (w === s) return true;
  return w < s ? x >= w && x <= s : x >= w || x <= s;
}

function computeTimes(s: ReminderSettings): string[] {
  const set = new Set<string>();
  if (s.intervalMin > 0) {
    const w = toMin(s.wake), sl = toMin(s.sleep);
    const span = sl > w ? sl - w : 1440 - w + sl;
    for (let t = 0; t <= span; t += s.intervalMin) set.add(fromMin(w + t));
  }
  for (const t of s.customTimes) {
    if (inWindow(t, s.wake, s.sleep)) set.add(t);
  }
  return [...set].sort();
}

const SSR_SAFE_DATE = new Date(2026, 0, 1);

function useClientClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function SipApp() {
  const [logs, setLogs] = useLogs();
  const [settings, setSettings] = useReminderSettings();
  const [dailyGoal, setDailyGoal] = useDailyGoal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  const clientNow = useClientClock();
  const today = todayKey();
  const ml = logs[today] ?? 0;
  const pct = Math.min(100, Math.round((ml / dailyGoal) * 100));

  const add = (amount: number) =>
    setLogs((l) => ({ ...l, [today]: Math.max(0, (l[today] ?? 0) + amount) }));

  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    while ((logs[d.toISOString().slice(0, 10)] ?? 0) >= dailyGoal) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [logs, dailyGoal]);

  const completedThisMonth = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return Object.entries(logs).filter(([k, v]) => k.startsWith(ym) && v >= dailyGoal).length;
  }, [logs, dailyGoal]);

  const allTime = useMemo(
    () => Object.values(logs).filter((v) => v >= dailyGoal).length,
    [logs, dailyGoal],
  );

  const times = useMemo(() => computeTimes(settings), [settings]);

  // Scheduler
  const firedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!settings.enabled) return;
    const tick = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const stamp = `${todayKey()} ${hhmm}`;
      if (times.includes(hhmm) && !firedRef.current.has(stamp)) {
        firedRef.current.add(stamp);
        fireReminder(settings);
      }
    };
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [settings, times]);

  const toggleReminders = useCallback(async () => {
    if (!settings.enabled && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch {}
    }
    setSettings((s) => ({ ...s, enabled: !s.enabled }));
  }, [settings.enabled, setSettings]);

  const setReminderField = (key: "enabled" | "sound" | "voice", value: boolean) => {
    if (key === "enabled" && value && "Notification" in window && Notification.permission === "default") {
      try { Notification.requestPermission(); } catch {}
    }
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const resetToday = () => setLogs((l) => ({ ...l, [today]: 0 }));
  const resetAll = () => {
    try {
      localStorage.removeItem("sip.logs");
      localStorage.removeItem("sip.customCups");
      localStorage.removeItem("sip.reminders");
      localStorage.removeItem("sip.dailyGoal");
      localStorage.removeItem("sip.installHintDismissed");
    } catch {}
    setLogs({});
    setSettings(DEFAULT_SETTINGS);
    setDailyGoal(DEFAULT_GOAL_ML);
  };
  const replayIntro = () => {
    try { localStorage.removeItem("sip.onboarded.v1"); } catch {}
    setIntroKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Onboarding key={introKey} />
      <SettingsMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        reminders={{ enabled: settings.enabled, sound: settings.sound, voice: settings.voice }}
        setReminder={setReminderField}
        dailyGoal={dailyGoal}
        setDailyGoal={setDailyGoal}
        onResetToday={resetToday}
        onResetAll={resetAll}
        onReplayIntro={replayIntro}
      />
      <div className="mx-auto max-w-md px-5 pb-24 pt-10 sm:max-w-xl sm:px-8">
        <Header onMenu={() => setMenuOpen(true)} />
        <HeroCard ml={ml} pct={pct} goal={dailyGoal} onAdd={add} />
        <QuickAdd onAdd={add} />

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatChip icon={<Check className="h-4 w-4" />} value={completedThisMonth} label="this month" />
          <StatChip icon={<Trophy className="h-4 w-4" />} value={allTime} label="all time" />
          <StatChip icon={<Flame className="h-4 w-4" />} value={streak} label="day streak" />
        </div>

        <CalendarCard logs={logs} goal={dailyGoal} now={clientNow} />

        <ReminderCard
          settings={settings}
          setSettings={setSettings}
          times={times}
          now={clientNow}
          onToggle={toggleReminders}
          onTest={() => fireReminder(settings)}
        />

        <InstallHint />

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Stay hydrated · {(dailyGoal / 1000).toFixed(dailyGoal % 1000 ? 1 : 0)}L daily goal
        </footer>
      </div>
    </div>
  );
}


function Index() {
  return <SipApp />;
}

function fireReminder(s: ReminderSettings) {
  const body = "Paani piyo — time ho gaya 💧";
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Sip", { body, icon: "/icon-512.png", tag: "sip-reminder" });
    }
  } catch {}

  if (s.sound) {
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      if (Ctx) {
        const ctx = new Ctx();
        const play = (freq: number, start: number, dur: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.value = freq;
          o.type = "sine";
          g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
          g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + start + 0.04);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
          o.connect(g).connect(ctx.destination);
          o.start(ctx.currentTime + start);
          o.stop(ctx.currentTime + start + dur + 0.05);
        };
        play(880, 0, 0.35);
        play(1320, 0.18, 0.45);
      }
    } catch {}
  }

  if (s.voice && "speechSynthesis" in window) {
    try {
      const u = new SpeechSynthesisUtterance("पानी पियो, टाइम हो गया");
      u.lang = "hi-IN";
      u.rate = 0.95;
      u.pitch = 1;
      // Slight delay so chime plays first
      setTimeout(() => window.speechSynthesis.speak(u), 700);
    } catch {}
  }
}

function Header({ onMenu }: { onMenu: () => void }) {
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
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground hover:border-[var(--honey)]"
      >
        <Menu className="h-4 w-4" />
      </button>
    </header>
  );
}

function HeroCard({ ml, pct, goal, onAdd }: { ml: number; pct: number; goal: number; onAdd: (n: number) => void }) {
  const left = Math.max(0, goal - ml);
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
        <span>{(goal / 1000).toFixed(goal % 1000 ? 1 : 0)}L</span>
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

type QuickOpt = { ml: number; label: string; emoji: string };
const QUICK_PRESETS: QuickOpt[] = [
  { ml: 100, label: "Sip", emoji: "💧" },
  { ml: 150, label: "Espresso", emoji: "☕" },
  { ml: 200, label: "Small", emoji: "🥃" },
  { ml: 250, label: "Glass", emoji: "🥛" },
  { ml: 300, label: "Tall", emoji: "🧋" },
  { ml: 330, label: "Can", emoji: "🥤" },
  { ml: 350, label: "Mug", emoji: "🍵" },
  { ml: 400, label: "Latte", emoji: "🍶" },
  { ml: 450, label: "Pint", emoji: "🍺" },
  { ml: 500, label: "Bottle", emoji: "🧴" },
  { ml: 600, label: "Sport", emoji: "🏃" },
  { ml: 750, label: "Flask", emoji: "🧪" },
  { ml: 1000, label: "1 Litre", emoji: "🪣" },
  { ml: 1500, label: "1.5L", emoji: "🌊" },
  { ml: 2000, label: "2 Litre", emoji: "🛢️" },
];

function QuickAdd({ onAdd }: { onAdd: (n: number) => void }) {
  const [custom, setCustom] = useState("");
  const [extras, setExtras] = useState<QuickOpt[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sip.customCups");
      if (raw) setExtras(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("sip.customCups", JSON.stringify(extras));
  }, [extras]);

  const submitCustom = () => {
    const n = parseInt(custom, 10);
    if (!Number.isFinite(n) || n <= 0 || n > 5000) return;
    onAdd(n);
    if (!extras.some((e) => e.ml === n) && !QUICK_PRESETS.some((e) => e.ml === n)) {
      setExtras((x) => [...x, { ml: n, label: "Custom", emoji: "✨" }].slice(-6));
    }
    setCustom("");
  };

  const all = [...QUICK_PRESETS, ...extras];

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-muted-foreground">Quick add</h2>
        <span className="text-[10px] text-muted-foreground">swipe →</span>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8">
        <div className="flex w-max gap-3 pb-1">
          {all.map((o, i) => (
            <button
              key={`${o.ml}-${i}`}
              onClick={() => onAdd(o.ml)}
              className="group flex w-[88px] shrink-0 flex-col items-center gap-1 rounded-2xl border border-border bg-card py-4 transition hover:border-[var(--honey)] hover:shadow-[var(--shadow-soft)]"
            >
              <span className="text-2xl transition-transform group-hover:scale-110">{o.emoji}</span>
              <span className="text-xs font-medium">{o.label}</span>
              <span className="text-[10px] text-muted-foreground">{o.ml}ml</span>
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submitCustom(); }}
        className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 pl-4"
      >
        <span className="text-xs font-medium text-muted-foreground">Custom</span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 275"
          className="flex-1 bg-transparent text-sm tabular-nums outline-none placeholder:text-muted-foreground"
        />
        <span className="text-xs text-muted-foreground">ml</span>
        <button
          type="submit"
          disabled={!custom}
          className="flex items-center gap-1 rounded-full bg-[var(--honey-deep)] px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-40"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </form>
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

function CalendarCard({ logs, goal, now }: { logs: Log; goal: number; now: Date | null }) {
  const displayNow = now ?? SSR_SAFE_DATE;
  const year = displayNow.getFullYear();
  const month = displayNow.getMonth();
  const monthName = displayNow.toLocaleString("en", { month: "long", year: "numeric" });
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const startWeekday = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const todayDate = displayNow.getDate();

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
          const done = dayMl >= goal;
          const partial = dayMl > 0 && !done;
          const isToday = now !== null && d === todayDate;
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
  onTest,
  now,
}: {
  settings: ReminderSettings;
  setSettings: React.Dispatch<React.SetStateAction<ReminderSettings>>;
  times: string[];
  now: Date | null;
  onToggle: () => void;
  onTest: () => void;
}) {
  const { enabled, intervalMin, wake, sleep, sound, voice, customTimes } = settings;
  const [perm, setPerm] = useState<NotificationPermission | "default">("default");
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) setPerm(Notification.permission);
  }, [enabled]);

  const [newTime, setNewTime] = useState("");

  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : Math.max(0, toMin(wake) - 1);
  const upcoming = times.filter((t) => toMin(t) > nowMin).slice(0, 6);
  const next = upcoming[0] ?? null;

  const addCustom = () => {
    if (!/^\d{2}:\d{2}$/.test(newTime)) return;
    if (customTimes.includes(newTime)) return;
    setSettings((s) => ({ ...s, customTimes: [...s.customTimes, newTime].sort() }));
    setNewTime("");
  };

  const removeCustom = (t: string) =>
    setSettings((s) => ({ ...s, customTimes: s.customTimes.filter((x) => x !== t) }));

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
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Every</span>
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

      {/* Quiet hours */}
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
        Quiet hours: no nudges between {fmt12(sleep)} and {fmt12(wake)} — even custom times in that window are skipped.
      </p>

      {/* Custom times */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Custom reminder times
          </span>
          <span className="text-[11px] text-muted-foreground">{customTimes.length} added</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 pl-3">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="flex-1 bg-transparent text-sm tabular-nums outline-none"
          />
          <button
            onClick={addCustom}
            disabled={!newTime}
            className="flex items-center gap-1 rounded-full bg-[var(--honey-deep)] px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {customTimes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {customTimes.map((t) => (
              <span
                key={t}
                className="group flex items-center gap-1 rounded-full bg-[var(--cream)] py-1 pl-2.5 pr-1 text-[11px] font-medium tabular-nums text-[oklch(0.35_0.06_65)]"
              >
                {fmt12(t)}
                <button
                  onClick={() => removeCustom(t)}
                  className="grid h-4 w-4 place-items-center rounded-full hover:bg-[var(--honey)]/30"
                  aria-label="Remove"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sound + voice toggles */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <ToggleRow
          on={sound}
          onChange={(v) => setSettings((s) => ({ ...s, sound: v }))}
          icon={sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          label="Chime sound"
        />
        <ToggleRow
          on={voice}
          onChange={(v) => setSettings((s) => ({ ...s, voice: v }))}
          icon={voice ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
          label='Voice "पानी पियो"'
        />
      </div>

      {/* Upcoming reminders */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Upcoming today
          </span>
          {next && (
            <span className="flex items-center gap-1 text-[11px] text-[oklch(0.4_0.08_70)]">
              <Clock className="h-3 w-3" /> next {fmt12(next)}
            </span>
          )}
        </div>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            All done for today — see you tomorrow.
          </p>
        ) : (
          <ol className="space-y-1.5">
            {upcoming.map((t, i) => {
              const mins = toMin(t) - nowMin;
              const inLabel = mins < 60 ? `in ${mins}m` : `in ${Math.floor(mins / 60)}h ${mins % 60}m`;
              return (
                <li
                  key={t}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs ${
                    i === 0 ? "bg-[var(--honey-deep)] text-white" : "bg-[var(--cream)] text-[oklch(0.35_0.06_65)]"
                  }`}
                >
                  <span className="font-medium tabular-nums">{fmt12(t)}</span>
                  <span className={`tabular-nums ${i === 0 ? "opacity-90" : "opacity-70"}`}>{inLabel}</span>
                </li>
              );
            })}
          </ol>
        )}
        {times.length > upcoming.length && (
          <p className="mt-2 px-1 text-[10px] text-muted-foreground">
            +{times.length - upcoming.length} earlier today · {times.length} total
          </p>
        )}
      </div>

      {/* Test button */}
      <button
        onClick={onTest}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--honey-deep)] bg-[var(--cream)] px-4 py-2.5 text-sm font-medium text-[oklch(0.3_0.05_60)] transition hover:bg-[var(--honey)]/30"
      >
        <Zap className="h-4 w-4" /> Send a test reminder
      </button>

      {enabled && perm !== "granted" && (
        <p className="mt-4 rounded-xl bg-[var(--cream)] px-3 py-2 text-[11px] text-[oklch(0.35_0.06_65)]">
          {perm === "denied"
            ? "Notifications are blocked. You'll still hear the chime while this tab is open."
            : "Allow notifications so reminders work even when Sip is in the background."}
        </p>
      )}
    </section>
  );
}

function ToggleRow({
  on,
  onChange,
  icon,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-[var(--honey)]"
    >
      <span className="flex items-center gap-2 text-xs font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          on ? "bg-[var(--honey-deep)]" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            on ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
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

function InstallHint() {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    try {
      setDismissed(localStorage.getItem("sip.installHintDismissed") === "1");
    } catch {}
  }, []);
  if (dismissed) return null;
  return (
    <section className="mt-6 flex items-start gap-3 rounded-[20px] border border-border bg-[var(--cream)] p-4">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[oklch(0.35_0.08_70)]">
        <Droplet className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-[oklch(0.3_0.05_60)]">Install Sip as an app</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[oklch(0.4_0.05_65)]">
          On Android Chrome: menu → <strong>Install app</strong>. On iPhone Safari: Share → <strong>Add to Home Screen</strong>.
        </p>
      </div>
      <button
        onClick={() => {
          localStorage.setItem("sip.installHintDismissed", "1");
          setDismissed(true);
        }}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}
