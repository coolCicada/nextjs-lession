import Link from 'next/link';
import ThemeToggle from '@/app/ui/theme-toggle';
import { AppBackground } from '@/app/ui/app-shell';
import { FinanceNav } from './_components/finance-nav';

export default function FinanceLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AppBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172acc] dark:shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Finance Learning
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                >
                  ←
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    财经自我学习
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    把采集、预测、回看和数据管理收拢到同一个线上模块里。
                  </p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <FinanceNav />
        </header>

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
