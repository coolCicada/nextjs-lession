import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.08),_transparent_24%),linear-gradient(180deg,#fcfcfd_0%,#f8fafc_42%,#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_20%),linear-gradient(180deg,#020617_0%,#0b1120_45%,#0f172a_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.18),transparent_78%)] dark:bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)]" />
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
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/78 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backHref}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:scale-[1.02] hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:shadow-none"
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
    <div className={`rounded-[24px] border border-slate-200/80 bg-white/88 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172acc] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)] ${className}`}>
      {children}
    </div>
  );
}
