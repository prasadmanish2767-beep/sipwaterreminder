import { useEffect, useState } from "react";
import { Droplet, Plus, Bell, ChevronRight } from "lucide-react";

const KEY = "sip.onboarded.v1";

type Slide = {
  icon: React.ReactNode;
  title: string;
  hindi: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    icon: <Droplet className="h-7 w-7 fill-current" />,
    title: "Track your daily water",
    hindi: "Roz ka paani track karein",
    body: "Aapka goal hai 2L paani. Har sip count hoti hai — bas tap karke add karein.",
  },
  {
    icon: <Plus className="h-7 w-7" />,
    title: "One tap to add a cup",
    hindi: "Ek tap se cup add karein",
    body: "Bada button dabaayein '+ Add a cup' — ya neeche se Glass, Bottle, Mug choose karein.",
  },
  {
    icon: <Bell className="h-7 w-7" />,
    title: "Gentle reminders",
    hindi: "Pyara sa reminder",
    body: "Reminder ON karein — Sip aapko har ghante yaad dilaayega: 'Paani piyo, time ho gaya'.",
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {}
  }, []);

  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
  };

  if (!open) return null;
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-2xl">
        <div
          className="flex flex-col items-center px-7 pb-7 pt-10 text-center"
          style={{ background: "var(--gradient-cream)" }}
        >
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--honey)] text-[oklch(0.25_0.05_70)] shadow-[var(--shadow-soft)]">
            {s.icon}
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[oklch(0.45_0.08_70)]">
            Step {i + 1} of {SLIDES.length}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-[oklch(0.25_0.05_60)]">
            {s.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-[oklch(0.4_0.06_65)]">{s.hindi}</p>
          <p className="mt-4 text-sm leading-relaxed text-[oklch(0.35_0.04_65)]">{s.body}</p>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex gap-1.5">
            {SLIDES.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-5 bg-[var(--honey-deep)]" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={close}
              className="rounded-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
            <button
              onClick={() => (last ? close() : setI(i + 1))}
              className="flex items-center gap-1 rounded-full bg-[oklch(0.25_0.04_60)] px-4 py-2 text-sm font-medium text-[oklch(0.98_0.02_85)] transition hover:bg-[oklch(0.2_0.04_60)]"
            >
              {last ? "Start" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
