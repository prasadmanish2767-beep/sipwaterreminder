import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Database, Bell, EyeOff, Check } from "lucide-react";

const KEY = "sip.consent.v1";

export function ConsentGate({ onAccepted }: { onAccepted?: () => void }) {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {}
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ acceptedAt: new Date().toISOString(), analytics }),
      );
    } catch {}
    setOpen(false);
    onAccepted?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-2xl">
        <div
          className="px-7 pb-6 pt-8 text-center"
          style={{ background: "var(--gradient-cream)" }}
        >
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--honey)] text-[oklch(0.25_0.05_70)] shadow-[var(--shadow-soft)]">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-bold leading-tight text-[oklch(0.25_0.05_60)]">
            Your privacy, your data
          </h2>
          <p className="mt-1 text-sm text-[oklch(0.4_0.06_65)]">
            Aapka data aapke phone mein hi rehta hai
          </p>
        </div>

        <div className="space-y-3 px-6 py-5">
          <Row
            icon={<Database className="h-4 w-4" />}
            title="Stored on this device"
            sub="Water logs, goal aur settings sirf local storage mein save hote hain — koi account nahi."
          />
          <Row
            icon={<Bell className="h-4 w-4" />}
            title="Notification permission"
            sub="Reminders ke liye hi use hoti hai. Aap kabhi bhi settings se band kar sakte hain."
          />
          <Row
            icon={<EyeOff className="h-4 w-4" />}
            title="No ads, no tracking, no selling"
            sub="Hum aapka data kisi third party ko nahi bhejte."
          />

          <button
            onClick={() => setAnalytics((v) => !v)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border p-3 text-left"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium">Optional anonymous usage stats</span>
              <span className="block text-[11px] text-muted-foreground">
                Off by default. App iske bina bhi poora chalta hai.
              </span>
            </span>
            <span
              className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                analytics ? "bg-[var(--honey-deep)]" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                  analytics ? "left-[18px]" : "left-0.5"
                }`}
              />
            </span>
          </button>

          <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
            Continue karke aap hamari{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>{" "}
            aur{" "}
            <Link to="/terms" className="underline">
              Terms
            </Link>{" "}
            se sehmat hote hain.
          </p>

          <button
            onClick={accept}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[oklch(0.25_0.04_60)] px-4 py-3 text-sm font-medium text-[oklch(0.98_0.02_85)] transition hover:bg-[oklch(0.2_0.04_60)]"
          >
            <Check className="h-4 w-4" /> Agree & continue
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--cream)] text-[oklch(0.35_0.08_70)]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-[11px] leading-relaxed text-muted-foreground">{sub}</span>
      </span>
    </div>
  );
}
