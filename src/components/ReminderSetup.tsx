import { useEffect, useState } from "react";
import { Clock, Bell, Ruler, ChevronRight, Check } from "lucide-react";

const KEY = "sip.setup.v1";

export type Unit = "ml" | "oz" | "cups";

export type SetupResult = {
  wake: string;
  sleep: string;
  intervalMin: number;
  enabled: boolean;
  unit: Unit;
};

export function ReminderSetup({
  initial,
  onDone,
}: {
  initial: { wake: string; sleep: string; intervalMin: number; unit: Unit };
  onDone: (r: SetupResult) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [wake, setWake] = useState(initial.wake);
  const [sleep, setSleep] = useState(initial.sleep);
  const [intervalMin, setIntervalMin] = useState(initial.intervalMin);
  const [unit, setUnit] = useState<Unit>(initial.unit);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {}
  }, []);

  const finish = async (enable: boolean) => {
    if (enable && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch {}
    }
    try { localStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
    onDone({ wake, sleep, intervalMin, enabled: enable, unit });
  };

  if (!open) return null;

  const steps = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Active hours",
      sub: "Kab se kab tak reminder chahiye?",
      body: (
        <div className="grid grid-cols-2 gap-3">
          <TimeField label="Wake up" value={wake} onChange={setWake} />
          <TimeField label="Quiet from" value={sleep} onChange={setSleep} />
        </div>
      ),
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "How often?",
      sub: "Har kitni der mein yaad dilaayein",
      body: (
        <div className="flex flex-wrap justify-center gap-2">
          {[30, 45, 60, 90, 120, 180].map((m) => (
            <Chip key={m} active={intervalMin === m} onClick={() => setIntervalMin(m)}>
              {m < 60 ? `${m}m` : `${m / 60}h`}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      icon: <Ruler className="h-6 w-6" />,
      title: "Preferred unit",
      sub: "Aap kis unit mein dekhna chahte hain?",
      body: (
        <div className="flex flex-wrap justify-center gap-2">
          {(["ml", "oz", "cups"] as Unit[]).map((u) => (
            <Chip key={u} active={unit === u} onClick={() => setUnit(u)}>
              {u === "ml" ? "Litres / ml" : u === "oz" ? "Ounces (oz)" : "Cups (250ml)"}
            </Chip>
          ))}
        </div>
      ),
    },
  ];

  const s = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-2xl">
        <div
          className="flex flex-col items-center px-7 pb-7 pt-9 text-center"
          style={{ background: "var(--gradient-cream)" }}
        >
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--honey)] text-[oklch(0.25_0.05_70)] shadow-[var(--shadow-soft)]">
            {s.icon}
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[oklch(0.45_0.08_70)]">
            Reminder setup · {step + 1}/{steps.length}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-[oklch(0.25_0.05_60)]">
            {s.title}
          </h2>
          <p className="mt-1 text-sm text-[oklch(0.4_0.06_65)]">{s.sub}</p>
          <div className="mt-5 w-full">{s.body}</div>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => finish(false)}
            className="rounded-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
          <button
            onClick={() => (last ? finish(true) : setStep(step + 1))}
            className="flex items-center gap-1 rounded-full bg-[oklch(0.25_0.04_60)] px-4 py-2 text-sm font-medium text-[oklch(0.98_0.02_85)] transition hover:bg-[oklch(0.2_0.04_60)]"
          >
            {last ? (
              <>
                Turn on reminders <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
        active
          ? "border-[oklch(0.35_0.06_60)] bg-[oklch(0.25_0.04_60)] text-[oklch(0.98_0.02_85)]"
          : "border-[oklch(0.8_0.05_80)] bg-white/70 text-[oklch(0.35_0.05_65)]"
      }`}
    >
      {children}
    </button>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="rounded-2xl bg-white/70 px-3 py-2 text-left">
      <span className="block text-[10px] uppercase tracking-wider text-[oklch(0.45_0.08_70)]">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-medium text-[oklch(0.28_0.05_60)] outline-none"
      />
    </label>
  );
}
