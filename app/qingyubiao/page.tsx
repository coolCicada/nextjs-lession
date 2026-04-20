import type { Metadata } from 'next';
import { AppBackground, AppHeader, GlassPanel } from '@/app/ui/app-shell';

export const metadata: Metadata = {
  title: '晴雨表',
  description: '静态组合与市场立场看板',
};

type Holding = {
  name: string;
  amount: string;
  ratio: number;
  signal: '偏多' | '中性' | '偏空';
  weather: '晴' | '多云' | '阴';
  note: string;
  color: string;
};

const portfolioSummary = {
  totalAssets: '70.6万',
  holdings: '68.6万',
  cash: '2万',
  investedRatio: '97.2%',
  cashRatio: '2.8%',
};

const holdings: Holding[] = [
  {
    name: '纳斯达克',
    amount: '28.5万',
    ratio: 40.4,
    signal: '偏多',
    weather: '晴',
    note: '主趋势仍强，但靠近 25000 点后以分批减仓为主。',
    color: 'from-sky-500 to-cyan-400',
  },
  {
    name: '恒生科技',
    amount: '14.3万',
    ratio: 20.2,
    signal: '中性',
    weather: '多云',
    note: '反弹弹性在，但 10%+ 后更适合小幅兑现。',
    color: 'from-indigo-500 to-blue-400',
  },
  {
    name: '红利低波',
    amount: '10万',
    ratio: 14.2,
    signal: '中性',
    weather: '多云',
    note: '承担防守底仓角色，继续稳住波动即可。',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    name: '医疗器械ETF',
    amount: '7.8万',
    ratio: 11.1,
    signal: '中性',
    weather: '多云',
    note: '仍需耐心，先看修复持续性，不追高。',
    color: 'from-rose-500 to-orange-400',
  },
  {
    name: '黄金',
    amount: '5.3万',
    ratio: 7.5,
    signal: '中性',
    weather: '多云',
    note: '当前位置更偏等待，回调到目标区间再考虑补仓。',
    color: 'from-amber-400 to-yellow-300',
  },
  {
    name: '招商量化C',
    amount: '2.7万',
    ratio: 3.9,
    signal: '偏空',
    weather: '阴',
    note: '权重较轻，暂不主动加码，保留观察位。',
    color: 'from-slate-500 to-slate-400',
  },
  {
    name: '现金',
    amount: '2万',
    ratio: 2.8,
    signal: '中性',
    weather: '阴',
    note: '安全垫偏薄，大额加仓需要更谨慎。',
    color: 'from-stone-400 to-slate-300',
  },
];

const weatherSummary = [
  {
    title: '总览',
    weather: '多云' as const,
    summary: '整体仓位偏高，方向不差，但更需要节奏管理。',
  },
  {
    title: '成长仓',
    weather: '晴' as const,
    summary: '纳指仍是核心收益来源，维持偏多但不恋战。',
  },
  {
    title: '港股科技',
    weather: '多云' as const,
    summary: '反弹窗口仍在，兑现优先级高于追涨。',
  },
  {
    title: '防守仓',
    weather: '阴' as const,
    summary: '现金偏低，黄金等待更好的回撤位置。',
  },
];

const actionChecklist = [
  '纳指接近 25000 分批减仓',
  '恒生科技反弹 10%+ 小减',
  '黄金目标 8-10% 回调补',
  '现金偏低，谨慎大额加仓',
];

const signalClassMap = {
  偏多: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  中性: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
  偏空: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',
};

const weatherClassMap = {
  晴: 'bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
  多云: 'bg-slate-900/8 text-slate-700 ring-slate-400/20 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10',
  阴: 'bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/20',
};

export default function QingYuBiaoPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-700 dark:text-slate-100">
      <AppBackground />
      <AppHeader
        title="晴雨表"
        subtitle="静态组合看板 · 仓位、风向与策略一页看完"
        backHref="/"
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <GlassPanel className="overflow-hidden p-6 sm:p-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-500/10 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                    晴雨表总览
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">
                    组合处于高仓位，多云偏晴。
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                    核心收益仍靠成长仓驱动，但现金只占{' '}
                    {portfolioSummary.cashRatio}
                    ，当前更适合控节奏、做兑现和回撤预案，而不是继续大幅追仓。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-[240px]">
                  <MetricCard
                    label="总资产"
                    value={portfolioSummary.totalAssets}
                    detail="当前口径"
                  />
                  <MetricCard
                    label="持仓"
                    value={portfolioSummary.holdings}
                    detail={portfolioSummary.investedRatio}
                  />
                  <MetricCard
                    label="现金"
                    value={portfolioSummary.cash}
                    detail={portfolioSummary.cashRatio}
                  />
                  <MetricCard
                    label="动作基调"
                    value="控节奏"
                    detail="兑现优先"
                  />
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200/80 bg-slate-950 p-4 text-white shadow-[0_18px_48px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-900/80 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Allocation
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      仓位结构一眼看懂，现金缓冲仍偏薄。
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
                    静态数据
                  </div>
                </div>
                <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-white/10">
                  {holdings.map((item) => (
                    <div
                      key={item.name}
                      className={`h-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${item.ratio}%` }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {weatherSummary.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-300">
                          {item.title}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            weatherClassMap[item.weather]
                          }`}
                        >
                          {item.weather}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassPanel>

          <div className="grid gap-6">
            <GlassPanel className="p-5 sm:p-6">
              <SectionHeading
                eyebrow="策略动作"
                title="当前执行清单"
                description="优先级不多，重点是先把减仓和等待区间定义清楚。"
              />
              <div className="mt-5 space-y-3">
                {actionChecklist.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-5 sm:p-6">
              <SectionHeading
                eyebrow="仓位提醒"
                title="仓位温度"
                description="成长仓推动收益，防守端空间有限。"
              />
              <div className="mt-5 space-y-4">
                <TemperatureRow
                  label="进攻仓位"
                  value={portfolioSummary.investedRatio}
                  width={97.2}
                  tone="from-sky-500 to-indigo-500"
                />
                <TemperatureRow
                  label="现金缓冲"
                  value={portfolioSummary.cashRatio}
                  width={2.8}
                  tone="from-amber-400 to-orange-400"
                />
              </div>
              <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                当前现金比例偏低。新资金没有明确计划时，不建议做大额追高型加仓。
              </div>
            </GlassPanel>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel className="p-5 sm:p-6">
            <SectionHeading
              eyebrow="组合分布"
              title="资产持仓"
              description="金额、权重和当下信号放在同一行，便于快速复盘。"
            />
            <div className="mt-5 space-y-4">
              {holdings.map((item) => (
                <div
                  key={item.name}
                  className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/5 sm:px-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            weatherClassMap[item.weather]
                          }`}
                        >
                          {item.weather}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            signalClassMap[item.signal]
                          }`}
                        >
                          {item.signal}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {item.note}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-3 sm:flex-col sm:items-end sm:gap-1">
                      <span className="text-lg font-semibold text-slate-950 dark:text-white">
                        {item.amount}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {item.ratio}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${item.ratio}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 sm:p-6">
            <SectionHeading
              eyebrow="晴雨表判断"
              title="市场立场"
              description="用天气标签统一表达组合当前的风险收益感受。"
            />
            <div className="mt-5 space-y-4">
              {weatherSummary.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.title}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                        {item.weather}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                        weatherClassMap[item.weather]
                      }`}
                    >
                      {item.weather}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[22px] border border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white dark:border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                一句话结论
              </p>
              <p className="mt-3 text-lg font-semibold tracking-tight">
                现阶段不是全面进攻，而是围绕强势仓位做兑现、围绕防守仓位等回撤。
              </p>
            </div>
          </GlassPanel>
        </section>
      </main>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {detail}
      </p>
    </div>
  );
}

function TemperatureRow({
  label,
  value,
  width,
  tone,
}: {
  label: string;
  value: string;
  width: number;
  tone: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-medium text-slate-900 dark:text-white">
          {value}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200/80 dark:bg-white/10">
        <div
          className={`h-2.5 rounded-full bg-gradient-to-r ${tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
