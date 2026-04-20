import type {
  EvaluationResult,
  MarketQuote,
  Prediction,
  RawDataBundle,
} from '../_lib/types';

function directionTone(direction: string) {
  if (direction === '涨') return 'bg-rose-100 text-rose-600';
  if (direction === '跌') return 'bg-emerald-100 text-emerald-600';
  if (direction === '风险') return 'bg-amber-100 text-amber-700';
  if (direction === '热点') return 'bg-sky-100 text-sky-700';
  return 'bg-amber-50 text-amber-600';
}

function resultTone(correct?: boolean | null) {
  if (correct === true) return 'text-emerald-600';
  if (correct === false) return 'text-rose-600';
  return 'text-slate-400';
}

export function PredictionRow({
  prediction,
  evaluation,
}: {
  prediction: Prediction;
  evaluation?: EvaluationResult;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
      <span className="min-w-[48px] text-xs text-slate-400">
        {prediction.timestamp.slice(11, 16)}
      </span>
      <span className="min-w-[84px] font-medium text-slate-900 dark:text-white">
        {prediction.target}
      </span>
      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${directionTone(prediction.direction)}`}>
        {prediction.direction}
      </span>
      <span className="text-xs text-slate-400">
        置信度 {prediction.confidence}%
      </span>
      <span className={`ml-auto text-xs font-medium ${resultTone(evaluation?.correct)}`}>
        {evaluation
          ? evaluation.correct === true
            ? '✓ 正确'
            : evaluation.correct === false
              ? '✗ 错误'
              : '⏳ 待验证'
          : '—'}
      </span>
    </div>
  );
}

export function AccuracyChart({
  data,
  height = 160,
}: {
  data: { date: string; accuracy: number }[];
  height?: number;
}) {
  if (!data.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200/80 p-10 text-center text-sm text-slate-400 dark:border-white/10">暂无数据</div>;
  }

  const width = 100;
  const padX = 36;
  const padY = 12;
  const chartW = width - padX;
  const chartH = height - padY * 2;
  const scaleX = (index: number) => padX + (index / Math.max(data.length - 1, 1)) * chartW;
  const scaleY = (value: number) => padY + chartH - value * chartH;
  const points = data.map((item, index) => ({
    x: scaleX(index),
    y: scaleY(item.accuracy),
    item,
  }));
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1]?.x ?? padX} ${padY + chartH} L ${padX} ${padY + chartH} Z`;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {[0, 0.25, 0.5, 0.75, 1].map((value) => {
          const y = scaleY(value);
          return (
            <g key={value}>
              <line x1={padX} y1={y} x2={padX + chartW} y2={y} stroke="#dbe3f0" strokeWidth="0.4" />
              <text x={padX - 2} y={y + 1.5} textAnchor="end" fontSize="4" fill="#94a3b8">
                {Math.round(value * 100)}%
              </text>
            </g>
          );
        })}
        <path d={area} fill="#dbeafe" />
        <path d={line} fill="none" stroke="#2563eb" strokeWidth="1" strokeLinejoin="round" />
        {points.map((point) => (
          <g key={point.item.date}>
            <circle cx={point.x} cy={point.y} r="2.2" fill="#2563eb" />
            <text x={point.x} y={padY + chartH + 8} textAnchor="middle" fontSize="3.5" fill="#94a3b8">
              {point.item.date.slice(5)}
            </text>
            <title>{`${point.item.date}: ${(point.item.accuracy * 100).toFixed(1)}%`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function StrategyBar({
  name,
  count,
  accuracy,
  high,
}: {
  name: string;
  count: number;
  accuracy: number;
  high: boolean;
}) {
  const pct = Math.round(accuracy * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="line-clamp-1 text-slate-700 dark:text-slate-200">{name}</span>
        <span className="shrink-0 text-slate-400">{count}次</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full ${high ? 'bg-emerald-500' : 'bg-rose-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{pct}%</span>
        <span className="text-slate-400">{pct >= 70 ? '⬆️' : pct < 55 ? '⬇️' : '➡️'}</span>
      </div>
    </div>
  );
}

export function StatusLine({
  status,
  label,
  detail,
}: {
  status: 'ok' | 'error' | 'pending';
  label: string;
  detail?: string;
}) {
  const tone =
    status === 'ok'
      ? 'bg-emerald-500'
      : status === 'error'
        ? 'bg-rose-500'
        : 'bg-amber-400';

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3 text-sm last:border-b-0 dark:border-white/5">
      <span className={`h-2 w-2 rounded-full ${tone}`} />
      <span className="flex-1 text-slate-700 dark:text-slate-200">{label}</span>
      {detail ? <span className="text-xs text-slate-400">{detail}</span> : null}
    </div>
  );
}

export function QuotesCard({
  quotes,
}: {
  quotes?: Record<string, MarketQuote>;
}) {
  const config: Record<string, { label: string; icon: string }> = {
    nasdaq: { label: '纳斯达克', icon: '📈' },
    hkTech: { label: '恒生科技', icon: '🇭🇰' },
    gold: { label: '黄金', icon: '🥇' },
    a50: { label: 'A50', icon: '🇨🇳' },
    brent: { label: '原油 Brent', icon: '🛢️' },
    dxy: { label: '美元指数', icon: '💵' },
    usdCnh: { label: 'USD/CNH', icon: '💱' },
  };

  if (!quotes || !Object.keys(quotes).length) {
    return <div className="rounded-2xl border border-dashed border-slate-200/80 p-10 text-center text-sm text-slate-400 dark:border-white/10">暂无行情数据</div>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Object.entries(config).map(([key, item]) => {
        const quote = quotes[key];
        if (!quote) return null;
        const color =
          typeof quote.change === 'number'
            ? quote.change > 0
              ? 'text-rose-500'
              : quote.change < 0
                ? 'text-emerald-500'
                : 'text-slate-400'
            : 'text-slate-400';

        return (
          <div key={key} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {quote.error ? (
              <div className="text-sm text-slate-400">暂无数据</div>
            ) : (
              <>
                <div className="font-mono text-xl font-semibold text-slate-900 dark:text-white">
                  {quote.price?.toFixed(2) ?? '-'}
                </div>
                <div className={`mt-1 text-xs font-medium ${color}`}>
                  {typeof quote.change === 'number'
                    ? `${quote.change > 0 ? '+' : ''}${quote.change.toFixed(2)}%`
                    : '-'}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function buildSourceStatus(rawBundle: RawDataBundle | null) {
  if (!rawBundle) return [];
  return [
    ...(rawBundle.rss ?? []).map((source) => ({
      label: `新闻源: ${source.name}`,
      status: source.error ? 'error' : 'ok',
      detail: source.fetchedAt,
    })),
    {
      label: '行情数据',
      status: Object.values(rawBundle.quotes ?? {}).some((quote) => quote?.error) ? 'error' : 'ok',
      detail: rawBundle.timestamp,
    },
    {
      label: '热点话题',
      status: rawBundle.hotTopics ? 'ok' : 'pending',
      detail: rawBundle.hotTopics?.fetchedAt,
    },
    {
      label: '市场新闻',
      status: rawBundle.marketNews ? 'ok' : 'pending',
      detail: rawBundle.marketNews?.fetchedAt,
    },
  ] as Array<{ label: string; status: 'ok' | 'error' | 'pending'; detail?: string }>;
}
