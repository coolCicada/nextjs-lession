import { unstable_noStore as noStore } from 'next/cache';
import { Suspense } from 'react';
import { AppBackground, AppHeader, GlassPanel } from '@/app/ui/app-shell';
import { getSleepLogsPage, getSleepStats, getSleepTrend } from './_lib/db';
import SleepChart from './_components/SleepChart';
import SleepPagination from './_components/SleepPagination';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PAGE_SIZE = 10;

// ── 工具函数 ──────────────────────────────────────────────────────────────────

function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function relativeTime(epoch: number): string {
  const diffMs = Date.now() - epoch * 1000;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

function fmtSleepDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parseInt(parts[1])}月${parseInt(parts[2])}日`;
}

function sourceBadgeClass(source: string): string {
  if (source === 'telegram')
    return 'bg-sky-50 border-sky-200/70 text-sky-600 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300';
  return 'bg-slate-50 border-slate-200/80 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-slate-400';
}

// ── 页面组件 ──────────────────────────────────────────────────────────────────

export default async function SleepLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  noStore();
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [{ rows: logs, total }, stats, trend] = await Promise.all([
    getSleepLogsPage(currentPage, PAGE_SIZE),
    getSleepStats(),
    getSleepTrend(30),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-700 dark:text-slate-100">
      <AppBackground />
      <AppHeader
        title="睡眠记录"
        subtitle="追踪每日睡眠确认时间，分析作息规律"
      />

      <main className="relative z-10 mx-auto max-w-4xl space-y-6 px-5 py-6 sm:px-6 sm:py-8">

        {/* ── 统计摘要 ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

          <GlassPanel className="p-4 sm:p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              总记录
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              {stats.total}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">条</p>
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              最近确认
            </p>
            {stats.latest_confirmed_sh ? (
              <>
                <p className="mt-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                  {stats.latest_confirmed_sh}
                </p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {stats.latest_confirmed_epoch != null
                    ? relativeTime(stats.latest_confirmed_epoch)
                    : ''}
                </p>
              </>
            ) : (
              <p className="mt-2 text-2xl text-slate-300 dark:text-slate-600">—</p>
            )}
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              近7条均值
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {stats.avg_confirmed_minutes != null
                ? minutesToHHMM(stats.avg_confirmed_minutes)
                : '—'}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">确认时刻</p>
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              今日状态
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  stats.has_today
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
                    : 'bg-amber-400'
                }`}
              />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {stats.has_today ? '已确认' : '未确认'}
              </p>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {stats.has_today ? '今日已记录' : '今日尚无记录'}
            </p>
          </GlassPanel>
        </div>

        {/* ── 趋势图 ── */}
        <GlassPanel className="overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-white/5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              Trend
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              实际入睡日趋势
            </h2>
          </div>
          <div className="px-4 pb-4 pt-3 sm:px-6">
            <SleepChart data={trend} />
          </div>
        </GlassPanel>

        {/* ── 记录列表 ── */}
        <GlassPanel className="overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-white/5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              Recent Records
            </p>
            <div className="mt-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                最近睡眠记录
              </h2>
              {total > 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  共 {total} 条 · 第 {currentPage}/{totalPages} 页
                </span>
              )}
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-4xl text-slate-200 dark:text-slate-700">◑</p>
              <p className="mt-4 text-sm font-medium text-slate-400 dark:text-slate-500">
                暂无睡眠记录
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                通过机器人发送睡眠确认消息后自动同步
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.025]"
                  >
                    <div className="w-14 shrink-0 pt-0.5 text-center sm:w-16">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {fmtSleepDate(log.sleep_date)}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {log.confirmed_at_sh}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${sourceBadgeClass(log.source)}`}
                        >
                          {log.source}
                        </span>
                        {log.reminder_step != null && (
                          <span className="inline-flex items-center rounded-full border border-violet-200/70 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                            提醒第 {log.reminder_step} 次
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {log.original_text}
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5 text-right">
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {relativeTime(log.confirmed_epoch)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="border-t border-slate-100 px-6 py-4 dark:border-white/5">
                  <Suspense>
                    <SleepPagination totalPages={totalPages} />
                  </Suspense>
                </div>
              )}
            </>
          )}
        </GlassPanel>

      </main>
    </div>
  );
}
