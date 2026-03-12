import {
  PingPongShell,
  SearchForm,
  SectionTitle,
} from '@/app/pingpong/_components/pingpong-ui';
import { GlassPanel } from '@/app/ui/app-shell';

export default function Loading() {
  return (
    <PingPongShell
      title="球员积分榜"
      subtitle="搜索球员、查看当前积分与等级分，并进入详情页查看走势与近期战绩。"
    >
      <div className="grid gap-8">
        <GlassPanel className="p-6">
          <SectionTitle
            eyebrow="球员搜索"
            title="按姓名搜索球员"
            body="当前已从数据库读取球员资料、积分、俱乐部和最近等级分变化。"
          />
          <div className="mt-5">
            <SearchForm
              action="/pingpong/players"
              placeholder="按球员姓名、城市或俱乐部搜索"
            />
          </div>
        </GlassPanel>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                搜索结果
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                全部收录球员
              </h2>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              正在加载...
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <GlassPanel
                key={index}
                className="h-[250px] animate-pulse bg-white/70 p-5 dark:bg-white/5"
              >
                <div className="h-full rounded-[18px] bg-slate-100/80 dark:bg-white/5" />
              </GlassPanel>
            ))}
          </div>
        </section>
      </div>
    </PingPongShell>
  );
}
