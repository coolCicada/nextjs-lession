import { PingPongShell } from '@/app/pingpong/_components/pingpong-ui';
import { GlassPanel } from '@/app/ui/app-shell';

export default function Loading() {
  return (
    <PingPongShell title="比赛详情加载中" subtitle="正在准备比赛信息、参赛名单和对阵情况……">
      <div className="grid gap-8 animate-pulse">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel className="p-6">
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-white/10" />
            <div className="mt-4 h-10 w-56 rounded bg-slate-200 dark:bg-white/10" />
            <div className="mt-4 h-20 rounded bg-slate-200 dark:bg-white/10" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 rounded-2xl bg-slate-200 dark:bg-white/10" />
              ))}
            </div>
          </GlassPanel>
          <GlassPanel className="h-[320px] p-5"><div /></GlassPanel>
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <GlassPanel className="h-[420px] p-5"><div /></GlassPanel>
          <GlassPanel className="h-[420px] p-5"><div /></GlassPanel>
        </div>
      </div>
    </PingPongShell>
  );
}
