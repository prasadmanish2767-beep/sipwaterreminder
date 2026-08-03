import { Droplet, BarChart3, Plus, Trophy, User } from "lucide-react";

type Props = {
  active: string;
  onNavigate: (id: string) => void;
  onAdd: () => void;
  onProfile: () => void;
};

const ITEMS = [
  { id: "home", label: "Home", icon: Droplet },
  { id: "history", label: "History", icon: BarChart3 },
  { id: "add", label: "Add", icon: Plus },
  { id: "goals", label: "Goals", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
] as const;

export function BottomNav({ active, onNavigate, onAdd, onProfile }: Props) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-end justify-between px-4 py-2 sm:max-w-xl sm:px-8">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          if (it.id === "add") {
            return (
              <li key={it.id} className="flex-1">
                <button
                  onClick={onAdd}
                  aria-label="Quick add water"
                  className="mx-auto flex w-full flex-col items-center gap-1"
                >
                  <span className="grid h-11 w-11 -translate-y-3 place-items-center rounded-full bg-[var(--honey-deep)] text-[oklch(0.25_0.04_60)] shadow-[var(--shadow-soft)] transition active:scale-95">
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                  <span className="-mt-2 text-[10px] font-semibold text-[oklch(0.45_0.08_70)]">
                    {it.label}
                  </span>
                </button>
              </li>
            );
          }
          return (
            <li key={it.id} className="flex-1">
              <button
                onClick={() => (it.id === "profile" ? onProfile() : onNavigate(it.id))}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full flex-col items-center gap-1 py-1 transition ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
