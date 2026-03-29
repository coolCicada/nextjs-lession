import { GlassPanel } from '@/app/ui/app-shell';
import type { Evaluation, Insight, PredictionRecord, RawDataBundle } from '../_lib/types';
import { AccuracyChart, PredictionRow, QuotesCard } from './widgets';

function lastUpdatedText(date?: string): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date;
  }
}

export function DashboardView({
  todayPrediction,
  evaluations,
  insights,
  latestRawBundle,
}: {
  todayPrediction: PredictionRecord | null;
  evaluations: Evaluation[];
  insights: Insight | null;
  latestRawBundle: RawDataBundle | null;
}) {
  const latestEval = evaluations[0];
  const weekAgo = evaluations[7];
  const weekDiff =
    latestEval && weekAgo ? latestEval.summary.accuracy - weekAgo.summary.accuracy : null;
  const trend = evaluations
    .slice(0, 7)
    .reverse()
    .map((item) => ({ date: item.date, accuracy: item.summary.accuracy }));
  const todayStats = todayPrediction
    ? {
        total: todayPrediction.predictions.length,
        up: todayPrediction.predictions.filter((item) => item.direction === '涨').length,
        down: todayPrediction.predictions.filter((item) => item.direction === '跌').length,
        neutral: todayPrediction.predictions.filter((item) => item.direction === '震荡').length,
      }
    : { total: 0, up: 0, down: 0, neutral: 0 };

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Finance Learning
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              财经自我学习系统
            </h2>
          </div>
          <span className="ml-auto text-xs text-slate-400">
            {todayPrediction
              ? `最后更新: ${lastUpdatedText(todayPrediction.predictions[0]?.timestamp)}`
              : '暂无最新记录'}
          </span>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">💹 实时行情</h3>
          <span className="text-xs text-slate-400">跨资产观察</span>
        </div>
        <QuotesCard quotes={latestRawBundle?.quotes as Record<string, never> | undefined} />
      </GlassPanel>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassPanel className="p-5 text-center">
          <div className="text-2xl">📊</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{todayStats.total}</div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">今日预测</div>
          <div className="mt-2 text-xs text-slate-400">
            涨:{todayStats.up} 跌:{todayStats.down} 震荡:{todayStats.neutral}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 text-center">
          <div className="text-2xl">🎯</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            {latestEval ? `${(latestEval.summary.accuracy * 100).toFixed(1)}%` : '--'}
          </div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">准确率</div>
          <div className="mt-2 text-xs">
            {weekDiff !== null ? (
              <span className={weekDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {weekDiff >= 0 ? '↑ 优于上周' : '↓ 劣于上周'}
              </span>
            ) : (
              <span className="text-slate-400">样本不足</span>
            )}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 text-center">
          <div className="text-2xl">🧠</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            {insights?.topStrategies?.length ?? 0}
          </div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">学习策略</div>
          <div className="mt-2 text-xs text-slate-400">置信度最高</div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">📈 预测记录（今日）</h3>
          <span className="text-xs text-slate-400">
            {todayPrediction?.date ?? '暂无'}
          </span>
        </div>
        <div className="space-y-2">
          {todayPrediction?.predictions.length ? (
            todayPrediction.predictions.map((prediction) => (
              <PredictionRow
                key={prediction.id}
                prediction={prediction}
                evaluation={latestEval?.results.find((item) => item.predId === prediction.id)}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200/80 p-10 text-center text-sm text-slate-400 dark:border-white/10">
              今日暂无预测
            </div>
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">📊 准确率趋势（最近 7 天）</h3>
          <span className="text-xs text-slate-400">回看模型稳定性</span>
        </div>
        <AccuracyChart data={trend} height={150} />
      </GlassPanel>
    </div>
  );
}
