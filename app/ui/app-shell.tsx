import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(20,184,166,0.12),_transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.08),_transparent_28%)]" />
      <div className="absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />
      <div className="absolute right-[-8%] top-36 h-80 w-80 rounded-full bg-fuchsia-300/15 blur-3xl dark:bg-violet-500/10" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl dark:bg-emerald-500/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.25),transparent_18%,transparent_82%,rgba(255,255,255,0.18))] dark:bg-[linear-gradient(to_bottom,rgba(15,23,42,0.15),transparent_20%,transparent_80%,rgba(15,23,42,0.25))]" />
    </div>
  );
}

export function AppHeader({
  title,
  subtitle,
  backHref = "/",
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/55 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backHref}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/70 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:scale-[1.02] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          >
            ←
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[28px] border border-white/60 bg-white/72 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${className}`}>
      {children}
    </div>
  );
}
