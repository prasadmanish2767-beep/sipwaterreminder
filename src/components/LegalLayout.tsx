import { Link } from "@tanstack/react-router";
import { ArrowLeft, Droplet } from "lucide-react";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf3e2] text-[#2a1f10]">
      <header
        className="px-5 pt-8 pb-6"
        style={{
          background:
            "linear-gradient(135deg, #f7e4b8 0%, #f5ecd9 60%, #faf3e2 100%)",
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-[#3a2a15] shadow-sm backdrop-blur transition hover:bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#f2b84b] text-[#2a1f10] shadow-sm">
              <Droplet className="h-4 w-4 fill-current" />
            </div>
            <span className="font-serif text-lg font-semibold">Sip</span>
          </div>
        </div>
        <div className="mx-auto mt-6 max-w-2xl">
          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[#5a4a2f]">{subtitle}</p>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-8 pb-24">
        <div className="prose prose-sm max-w-none space-y-5 text-[#3a2f1a] [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#2a1f10] [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-[#2a1f10] [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-[#c58a1e] [&_a]:underline">
          {children}
        </div>
        <footer className="mt-12 border-t border-[#e8d9b3] pt-6 text-center text-xs text-[#7a6640]">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/">Home</Link>
            <span>·</span>
            <Link to="/privacy">Privacy</Link>
            <span>·</span>
            <Link to="/terms">Terms</Link>
            <span>·</span>
            <Link to="/about">About</Link>
            <span>·</span>
            <Link to="/contact">Contact</Link>
          </div>
          <p className="mt-3">© {new Date().getFullYear()} Sip · Stay hydrated 💧</p>
        </footer>
      </main>
    </div>
  );
}
