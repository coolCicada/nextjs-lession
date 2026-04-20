import type { SleepTrendPoint } from '../_lib/db';

// normalize minutes: times before noon treated as next-day for continuity
function norm(m: number): number {
  return m < 720 ? m + 1440 : m;
}

function fmtMinutes(m: number): string {
  const actual = m % 1440;
  const h = Math.floor(actual / 60);
  const min = actual % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function toDisplayDate(dateStr: string, minutes: number): string {
  const actualDate = minutes < 720 ? addDays(dateStr, 1) : dateStr;
  return actualDate.slice(5).replace('-', '-');
}

export default function SleepChart({ data }: { data: SleepTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        暂无趋势数据
      </div>
    );
  }

  const W = 540;
  const H = 200;
  const ML = 48; // left margin for Y labels
  const MR = 12;
  const MT = 14;
  const MB = 36; // bottom margin for X labels
  const PW = W - ML - MR;
  const PH = H - MT - MB;

  const normalized = data.map((d) => ({ ...d, nm: norm(d.confirmed_minutes) }));
  const values = normalized.map((d) => d.nm);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const pad = Math.max(30, Math.round((rawMax - rawMin) * 0.15));
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;
  const yRange = yMax - yMin || 60;

  const toX = (_: SleepTrendPoint, i: number) =>
    ML + (i / Math.max(normalized.length - 1, 1)) * PW;
  const toY = (nm: number) =>
    MT + PH - ((nm - yMin) / yRange) * PH;

  // Y axis ticks: ~4-5 evenly spaced multiples of 30
  const tickStep = yRange <= 120 ? 15 : yRange <= 240 ? 30 : 60;
  const firstTick = Math.ceil(yMin / tickStep) * tickStep;
  const yTicks: number[] = [];
  for (let t = firstTick; t <= yMax; t += tickStep) yTicks.push(t);

  // X axis labels: show at most 7, evenly spaced
  const maxXLabels = 7;
  const xLabelIndices: number[] = [];
  if (normalized.length <= maxXLabels) {
    normalized.forEach((_, i) => xLabelIndices.push(i));
  } else {
    const step = (normalized.length - 1) / (maxXLabels - 1);
    for (let i = 0; i < maxXLabels; i++) {
      xLabelIndices.push(Math.round(i * step));
    }
  }

  const points = normalized.map((d, i) => `${toX(d, i)},${toY(d.nm)}`).join(' ');

  return (
      <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      aria-label="睡眠确认时间趋势（按实际入睡日显示）"
      className="overflow-visible"
    >
{/* grid lines */}
      {yTicks.map((t) => (
        <line
          key={t}
          x1={ML}
          x2={W - MR}
          y1={toY(t)}
          y2={toY(t)}
          stroke="currentColor"
          strokeWidth={0.5}
          className="text-slate-200 dark:text-slate-700"
        />
      ))}

      {/* Y axis labels */}
      {yTicks.map((t) => (
        <text
          key={t}
          x={ML - 6}
          y={toY(t)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={10}
          className="fill-slate-400 dark:fill-slate-500"
        >
          {fmtMinutes(t)}
        </text>
      ))}

      {/* line */}
      <polyline
        points={points}
        fill="none"
        stroke="#6366f1"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* area fill */}
      <polyline
        points={`${ML},${MT + PH} ${points} ${W - MR},${MT + PH}`}
        fill="#6366f1"
        fillOpacity={0.08}
        stroke="none"
      />

      {/* dots */}
      {normalized.map((d, i) => (
        <circle
          key={i}
          cx={toX(d, i)}
          cy={toY(d.nm)}
          r={3}
          fill="#6366f1"
          stroke="white"
          strokeWidth={1.5}
          className="dark:stroke-slate-900"
        >
          <title>{`${toDisplayDate(d.sleep_date, d.confirmed_minutes)} · ${fmtMinutes(d.nm)}`}</title>
        </circle>
      ))}

      {/* X axis labels */}
      {xLabelIndices.map((i) => (
        <text
          key={i}
          x={toX(normalized[i], i)}
          y={H - MB + 14}
          textAnchor="middle"
          fontSize={10}
          className="fill-slate-400 dark:fill-slate-500"
        >
          {toDisplayDate(normalized[i].sleep_date, normalized[i].confirmed_minutes)}
        </text>
      ))}

      {/* X axis baseline */}
      <line
        x1={ML}
        x2={W - MR}
        y1={MT + PH}
        y2={MT + PH}
        stroke="currentColor"
        strokeWidth={0.5}
        className="text-slate-200 dark:text-slate-700"
      />
    </svg>
  );
}
