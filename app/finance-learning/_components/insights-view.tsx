import { GlassPanel } from '@/app/ui/app-shell';
import type { Insight } from '../_lib/types';
import { StrategyBar } from './widgets';

function typeName(key: string): string {
  const map: Record<string, string> = {
    index_trend: '指数走势',
    gold_direction: '黄金方向',
    sector_hot: '板块热点',
    macro_regime: '宏观环境',
    risk_alert: '风险提醒',
  };
  return map[key] ?? key;
}

export function InsightsView({ insights }: { insights: Insight | null }) {
  if (!insights) {
    return (
      <GlassPanel className="p-10 text-center text-sm text-slate-400">
        暂无学习洞察
      </GlassPanel>
    );
  }

  const lastUpdated = insights.lastUpdated
    ? new Date(insights.lastUpdated).toLocaleDateString('zh-CN')
    : '';

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Insight
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              🧠 自我学习洞察
            </h2>
          </div>
          <span className="ml-auto text-xs text-slate-400">
            {lastUpdated ? `最后更新: ${lastUpdated}` : ''}
          </span>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Overall Accuracy
        </div>
        <div className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">
          {(insights.overallAccuracy * 100).toFixed(1)}%
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">📈 按类型</div>
        <div className="space-y-3">
          {Object.entries(insights.byType ?? {}).length ? (
            Object.entries(insights.byType).map(([key, value]) => {
              const pct = Math.round(value.accuracy * 100);
              return (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <span className="min-w-[88px] font-medium text-slate-800 dark:text-slate-200">
                    {typeName(key)}
                  </span>
                  <span className="min-w-[44px] text-xs text-slate-400">{value.count}次</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full ${pct >= 65 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="min-w-[44px] text-right text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {pct}%
                  </span>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200/80 p-10 text-center text-sm text-slate-400 dark:border-white/10">
              暂无分类数据
            </div>
          )}
        </div>
      </GlassPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 text-sm font-semibold text-emerald-600">✅ 最可靠策略</div>
          <div className="space-y-4">
            {insights.topStrategies?.length ? (
              insights.topStrategies.map((item, index) => (
                <StrategyBar
                  key={`${item.reasoning.join('-')}-${index}`}
                  name={item.reasoning.join(' ')}
                  count={item.count}
                  accuracy={item.accuracy}
                  high={true}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200/80 p-10 text-center text-sm text-slate-400 dark:border-white/10">
                暂无数据
              </div>
            )}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 text-sm font-semibold text-rose-600">❌ 需淘汰策略</div>
          <div className="space-y-4">
            {insights.dropStrategies?.length ? (
              insights.dropStrategies.map((item, index) => (
                <StrategyBar
                  key={`${item.reasoning.join('-')}-${index}`}
                  name={item.reasoning.join(' ')}
                  count={item.count}
                  accuracy={item.accuracy}
                  high={false}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200/80 p-10 text-center text-sm text-slate-400 dark:border-white/10">
                暂无数据
              </div>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
