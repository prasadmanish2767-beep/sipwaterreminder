import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Bell,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  Trash2,
  PlayCircle,
  Droplet,
  Info,
  Target,
  Shield,
  FileText,
  Mail,
  ChevronRight,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  reminders: {
    enabled: boolean;
    sound: boolean;
    voice: boolean;
  };
  setReminder: (key: "enabled" | "sound" | "voice", value: boolean) => void;
  dailyGoal: number;
  setDailyGoal: (n: number) => void;
  onResetToday: () => void;
  onResetAll: () => void;
  onReplayIntro: () => void;
};

export function SettingsMenu({
  open,
  onClose,
  reminders,
  setReminder,
  dailyGoal,
  setDailyGoal,
  onResetToday,
  onResetAll,
  onReplayIntro,
}: Props) {
  const [confirmAll, setConfirmAll] = useState(false);

  useEffect(() => {
    if (!open) setConfirmAll(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-card shadow-2xl">
        <header
          className="flex items-center justify-between px-6 pb-5 pt-7"
          style={{ background: "var(--gradient-cream)" }}
        >
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--honey)] text-[oklch(0.25_0.05_70)] shadow-[var(--shadow-soft)]">
              <Droplet className="h-4 w-4 fill-current" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.45_0.08_70)]">
                Sip
              </p>
              <h2 className="font-display text-lg font-semibold leading-none text-[oklch(0.25_0.05_60)]">
                Settings
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-[oklch(0.3_0.05_60)] transition hover:bg-white"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-6 px-6 pb-10 pt-6">
          {/* Daily goal */}
          <Section title="Daily goal" subtitle="Aapka roz ka paani target">
            <div className="flex flex-wrap gap-2">
              {[1500, 2000, 2500, 3000, 3500].map((g) => (
                <button
                  key={g}
                  onClick={() => setDailyGoal(g)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    dailyGoal === g
                      ? "border-[var(--honey-deep)] bg-[var(--cream)] text-[oklch(0.3_0.05_60)]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Target className="h-3 w-3" /> {(g / 1000).toFixed(g % 1000 ? 1 : 0)}L
                </button>
              ))}
            </div>
          </Section>

          {/* Reminders */}
          <Section title="Reminders" subtitle="Sound, voice aur nudges">
            <Toggle
              icon={<Bell className="h-4 w-4" />}
              label="Hourly reminders"
              sub="Background mein paani peene ka nudge"
              on={reminders.enabled}
              onChange={async (v) => {
                if (v && "Notification" in window && Notification.permission === "default") {
                  try { await Notification.requestPermission(); } catch {}
                }
                setReminder("enabled", v);
              }}
            />
            <Toggle
              icon={reminders.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              label="Chime sound"
              sub="Soft bell jab reminder chale"
              on={reminders.sound}
              onChange={(v) => setReminder("sound", v)}
            />
            <Toggle
              icon={reminders.voice ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              label='Voice "पानी पियो"'
              sub="Hindi voice prompt sune"
              on={reminders.voice}
              onChange={(v) => setReminder("voice", v)}
            />
          </Section>

          {/* Help */}
          <Section title="Help & onboarding">
            <MenuRow
              icon={<PlayCircle className="h-4 w-4" />}
              label="Replay intro tour"
              sub="3 simple slides dobara dekhein"
              onClick={() => {
                onReplayIntro();
                onClose();
              }}
            />
            <LinkRow to="/about" icon={<Info className="h-4 w-4" />} label="About Sip" sub="v1.0 · Stay hydrated, beautifully" onNav={onClose} />
          </Section>

          {/* Legal & contact */}
          <Section title="Legal & support">
            <LinkRow to="/privacy" icon={<Shield className="h-4 w-4" />} label="Privacy Policy" sub="How your data is handled" onNav={onClose} />
            <LinkRow to="/terms" icon={<FileText className="h-4 w-4" />} label="Terms & Conditions" sub="Rules for using Sip" onNav={onClose} />
            <LinkRow to="/contact" icon={<Mail className="h-4 w-4" />} label="Contact us" sub="prasadmanish2767@gmail.com" onNav={onClose} />
          </Section>

          {/* Danger */}
          <Section title="Data">
            <MenuRow
              icon={<RotateCcw className="h-4 w-4" />}
              label="Reset today's water"
              sub="Aaj ka count 0 kar dein"
              onClick={() => {
                onResetToday();
                onClose();
              }}
            />
            {confirmAll ? (
              <div className="rounded-2xl border border-red-300 bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700">
                  Sab data delete ho jaayega. Sure?
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setConfirmAll(false)}
                    className="flex-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onResetAll();
                      setConfirmAll(false);
                      onClose();
                    }}
                    className="flex-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Delete all
                  </button>
                </div>
              </div>
            ) : (
              <MenuRow
                icon={<Trash2 className="h-4 w-4 text-red-500" />}
                label="Reset all data"
                sub="Logs, custom cups, settings — sab clear"
                onClick={() => setConfirmAll(true)}
                danger
              />
            )}
          </Section>

          <p className="pt-2 text-center text-[10px] text-muted-foreground">
            Made with care · Stay hydrated 💧
          </p>
        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {subtitle && <p className="text-[11px] text-muted-foreground/80">{subtitle}</p>}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Toggle({
  icon,
  label,
  sub,
  on,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-[var(--honey)]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--cream)] text-[oklch(0.35_0.08_70)]">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{label}</span>
          {sub && <span className="block truncate text-[11px] text-muted-foreground">{sub}</span>}
        </span>
      </div>
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

function MenuRow({
  icon,
  label,
  sub,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition ${
        onClick ? "hover:border-[var(--honey)]" : "cursor-default"
      }`}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--cream)] text-[oklch(0.35_0.08_70)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-medium ${danger ? "text-red-600" : ""}`}>
          {label}
        </span>
        {sub && <span className="block truncate text-[11px] text-muted-foreground">{sub}</span>}
      </span>
    </button>
  );
}
