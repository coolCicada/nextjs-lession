import { GlassPanel } from '@/app/ui/app-shell';
import type { Evaluation, Insight, PredictionRecord, RawDataBundle } from '../_lib/types';
import { AccuracyChart, PredictionRow, QuotesCard, StatusLine, buildSourceStatus } from './widgets';

function deriveStance(pred: PredictionRecord | null) {
  if (!pred?.predictions.length) {
    return {
      label: '偏观望',
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      detail: '暂无预测',
      avgConf: 0,
    };
  }
  const ps = pred.predictions;
  const up = ps.filter((p) => p.direction === '涨').length;
  const down = ps.filter((p) => p.direction === '跌').length;
  const total = ps.length;
  const avgConf = Math.round(ps.reduce((s, p) => s + p.confidence, 0) / total);
  if (up > down && up / total > 0.4) {
    return {
      label: '偏进攻',
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      detail: `看涨 ${up}/${total} 标的`,
      avgConf,
    };
  }
  if (down > up && down / total > 0.4) {
    return {
      label: '偏防守',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      detail: `看跌 ${down}/${total} 标的`,
      avgConf,
    };
  }
  return {
    label: '偏观望',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    detail: `多空均衡 (涨${up}/跌${down})`,
    avgConf,
  };
}

interface KeyFact {
  title: string;
  source: string;
  tag: '市场' | '新闻' | '热点';
}

function collectKeyFacts(bundle: RawDataBundle | null): KeyFact[] {
  if (!bundle) return [];
  const facts: KeyFact[] = [];
  for (const item of (bundle.marketNews?.news ?? []).slice(0, 4)) {
    if (item.title && !item.error) facts.push({ title: item.title, source: item.source, tag: '市场' });
  }
  for (const src of (bundle.rss ?? []).slice(0, 3)) {
    for (const item of (src.items ?? []).slice(0, 2)) {
      if (item.title) facts.push({ title: item.title, source: src.name, tag: '新闻' });
    }
  }
  for (const topic of (bundle.hotTopics?.topics ?? []).slice(0, 3)) {
    if (topic.query) {
      facts.push({
        title: topic.summary ? `${topic.query} — ${topic.summary}` : topic.query,
        source: '热点',
        tag: '热点',
      });
    }
  }
  return facts.slice(0, 8);
}

function formatTime(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

const tagStyle: Record<string, string> = {
  市场: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  新闻: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400',
  热点: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
};

const typeLabels: Record<string, string> = {
  index_trend: '指数趋势',
  gold_direction: '黄金方向',
  sector_hot: '热点板块',
  macro_regime: '宏观态势',
  risk_alert: '风险预警',
};

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
  const stance = deriveStance(todayPrediction);
  const latestEval = evaluations[0];
  const weekAgo = evaluations[7];
  const weekDiff =
    latestEval && weekAgo ? latestEval.summary.accuracy - weekAgo.summary.accuracy : null;
  const trend = evaluations
    .slice(0, 7)
    .reverse()
    .map((e) => ({ date: e.date, accuracy: e.summary.accuracy }));
  const keyFacts = collectKeyFacts(latestRawBundle);
  const sources = buildSourceStatus(latestRawBundle);
  const healthyCount = sources.filter((s) => s.status === 'ok').length;
  const topTypes = insights?.byType
    ? Object.entries(insights.byType)
        .sort((a, b) => b[1].accuracy - a[1].accuracy)
        .slice(0, 4)
    : [];

  return (
    <div className="space-y-5">
      {/* 今日决策摘要 */}
      <GlassPanel className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Finance Cockpit
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
              理财系统驾驶舱
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {todayPrediction
                ? `最后更新 ${formatTime(todayPrediction.predictions[0]?.timestamp)}`
                : '暂无最新记录'}
            </p>
          </div>

          <div className={`flex flex-col items-center rounded-2xl px-6 py-4 ${stance.bg}`}>
            <span className={`text-3xl font-bold ${stance.color}`}>{stance.label}</span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stance.detail}</span>
            {stance.avgConf > 0 && (
              <span className="mt-0.5 text-xs text-slate-400">置信 {stance.avgConf}%</span>
            )}
          </div>

          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl font-semibold text-slate-950 dark:text-white">
                {latestEval ? `${(latestEval.summary.accuracy * 100).toFixed(0)}%` : '--'}
              </div>
              <div className="text-xs text-slate-400">模型准确率</div>
              {weekDiff !== null && (
                <div
                  className={`text-xs font-medium ${weekDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                >
                  {weekDiff >= 0 ? '↑' : '↓'} 较上周
                </div>
              )}
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-950 dark:text-white">
                {sources.length ? `${healthyCount}/${sources.length}` : '--'}
              </div>
              <div className="text-xs text-slate-400">源正常</div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 实时行情 */}
      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">实时行情</h3>
          <span className="text-xs text-slate-400">跨资产观察</span>
        </div>
        <QuotesCard quotes={latestRawBundle?.quotes as Record<string, never> | undefined} />
      </GlassPanel>

      {/* 关键事实 */}
      {keyFacts.length > 0 && (
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">关键事实</h3>
            <span className="text-xs text-slate-400">新闻·热点·市场</span>
          </div>
          <div className="space-y-2">
            {keyFacts.map((fact, i) => (
              <div
                key={`${fact.tag}-${i}`}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/5 dark:bg-white/5"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${tagStyle[fact.tag]}`}
                >
                  {fact.tag}
                </span>
                <span className="flex-1 text-sm leading-snug text-slate-700 dark:text-slate-200">
                  {fact.title}
                </span>
                <span className="ml-auto shrink-0 text-[10px] text-slate-400">{fact.source}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* 持仓影响 + 源健康 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">持仓影响</h3>
            <span className="text-xs text-slate-400">{todayPrediction?.date ?? '暂无'}</span>
          </div>
          <div className="space-y-2">
            {todayPrediction?.predictions.length ? (
              todayPrediction.predictions.map((prediction) => (
                <PredictionRow
                  key={prediction.id}
                  prediction={prediction}
                  evaluation={latestEval?.results.find((r) => r.predId === prediction.id)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200/80 p-8 text-center text-sm text-slate-400 dark:border-white/10">
                今日暂无预测
              </div>
            )}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">源健康</h3>
            <span
              className={`text-xs font-medium ${
                sources.length > 0 && healthyCount === sources.length
                  ? 'text-emerald-500'
                  : 'text-amber-500'
              }`}
            >
              {sources.length ? `${healthyCount}/${sources.length} 正常` : '--'}
            </span>
          </div>
          {sources.length ? (
            sources.map((src) => (
              <StatusLine
                key={src.label}
                status={src.status}
                label={src.label}
                detail={formatTime(src.detail) || undefined}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200/80 p-8 text-center text-sm text-slate-400 dark:border-white/10">
              暂无源数据
            </div>
          )}
        </GlassPanel>
      </div>

      {/* 模型分析 */}
      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">模型分析</h3>
          <span className="text-xs text-slate-400">
            {insights?.totalEvaluated ? `共评估 ${insights.totalEvaluated} 条` : ''}
          </span>
        </div>
        {insights ? (
          <div className="space-y-4">
            {topTypes.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {topTypes.map(([type, stat]) => (
                  <div
                    key={type}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5"
                  >
                    <div className="text-xs text-slate-400">{typeLabels[type] ?? type}</div>
                    <div
                      className={`mt-1 text-2xl font-semibold ${
                        stat.accuracy >= 0.7
                          ? 'text-emerald-500'
                          : stat.accuracy >= 0.5
                            ? 'text-amber-500'
                            : 'text-rose-500'
                      }`}
                    >
                      {(stat.accuracy * 100).toFixed(0)}%
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">{stat.count} 次样本</div>
                  </div>
                ))}
              </div>
            )}
            {(insights.topStrategies?.length ?? 0) > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  高效策略
                </div>
                <div className="space-y-2">
                  {insights.topStrategies.slice(0, 3).map((s, i) => (
                    <div
                      key={`top-${i}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs dark:border-white/5 dark:bg-white/5"
                    >
                      <span className="font-semibold text-emerald-600">
                        {(s.accuracy * 100).toFixed(0)}%
                      </span>
                      <span className="line-clamp-1 flex-1 text-slate-600 dark:text-slate-300">
                        {s.reasoning[0] ?? '—'}
                      </span>
                      <span className="text-slate-400">{s.count} 次</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200/80 p-8 text-center text-sm text-slate-400 dark:border-white/10">
            暂无洞察数据
          </div>
        )}
      </GlassPanel>

      {/* 复盘趋势 */}
      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">复盘趋势</h3>
          <span className="text-xs text-slate-400">近 7 日准确率走势</span>
        </div>
        <AccuracyChart data={trend} height={150} />
      </GlassPanel>
    </div>
  );
}
