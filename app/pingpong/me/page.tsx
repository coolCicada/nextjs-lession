import { cookies } from 'next/headers';
import Link from 'next/link';

import { PingPongShell } from '@/app/pingpong/_components/pingpong-ui';
import {
  PINGPONG_REGISTRANT_COOKIE,
  getMyRegistrations,
} from '@/app/pingpong/_lib/db';
import { GlassPanel } from '@/app/ui/app-shell';

export const dynamic = 'force-dynamic';

export default async function PingPongMePage() {
  const registrantKey = cookies().get(PINGPONG_REGISTRANT_COOKIE)?.value;
  const registrations = await getMyRegistrations(registrantKey);
  const latestRegistration = registrations[0] ?? null;

  return (
    <PingPongShell
      title="我的"
      subtitle="轻量 MVP 先用报名人姓名 + 城市识别最近的报名记录，不强依赖登录。"
    >
      <div className="grid gap-6">
        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            个人中心
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            我的报名回执
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
            这里会展示你最近提交到数据库的赛事报名。当前版本不要求登录，报名后会自动记住你的姓名和城市。
          </p>
        </GlassPanel>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassPanel className="p-5">
            <p className="text-sm font-medium text-slate-900 dark:text-white">最近一场赛事</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {latestRegistration
                ? `${latestRegistration.tournamentTitle} · ${latestRegistration.status}`
                : '还没有可识别的报名记录。'}
            </p>
          </GlassPanel>
          <GlassPanel className="p-5">
            <p className="text-sm font-medium text-slate-900 dark:text-white">累计报名</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              当前已识别 {registrations.length} 条数据库记录。
            </p>
          </GlassPanel>
        </div>

        {registrations.length === 0 ? (
          <GlassPanel className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              先去一场可报名赛事提交信息，之后这里会自动显示你的回执。
            </p>
            <Link
              href="/pingpong"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              去看比赛
            </Link>
          </GlassPanel>
        ) : (
          <div className="grid gap-4">
            {registrations.map((registration) => (
              <GlassPanel key={registration.id} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link
                      href={`/pingpong/tournaments/${registration.tournamentId}`}
                      className="text-lg font-semibold text-slate-950 dark:text-white"
                    >
                      {registration.tournamentTitle}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {registration.tournamentCity} · {registration.tournamentDate}
                    </p>
                    {registration.note ? (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        {registration.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-right text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <div>{registration.status}</div>
                    <div className="mt-1">{registration.updatedAt}</div>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>
    </PingPongShell>
  );
}
