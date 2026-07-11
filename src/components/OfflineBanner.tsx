import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-[#1f1a12] px-4 py-2 text-xs font-medium text-[#f5ecd9] shadow-lg">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Offline — Sip apka data local pe save karta hai</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#f2b84b] px-2 py-0.5 text-[10px] font-semibold text-[#2a1f10]"
      >
        <RefreshCw className="h-3 w-3" /> Retry
      </button>
    </div>
  );
}
