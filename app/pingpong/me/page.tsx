import { PingPongShell } from '@/app/pingpong/_components/pingpong-ui';
import { GlassPanel } from '@/app/ui/app-shell';

export default function PingPongMePage() {
  return (
    <PingPongShell
      title="我的"
      subtitle="后续这里会接入我的报名、我的比赛、我的积分和常用球馆。"
    >
      <div className="grid gap-6">
        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            个人中心
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            这里先放一个移动端入口占位
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
            下一步适合补：我的报名记录、我关注的比赛、我的积分变化、常用筛选和收藏球员。
          </p>
        </GlassPanel>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassPanel className="p-5">
            <p className="text-sm font-medium text-slate-900 dark:text-white">我的报名</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">后续可接本地报名记录或真实账户数据。</p>
          </GlassPanel>
          <GlassPanel className="p-5">
            <p className="text-sm font-medium text-slate-900 dark:text-white">我的积分</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">后续可展示个人等级分、积分走势和近期比赛。</p>
          </GlassPanel>
        </div>
      </div>
    </PingPongShell>
  );
}
