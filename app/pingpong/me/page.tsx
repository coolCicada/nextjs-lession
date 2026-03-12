import { cookies } from 'next/headers';
import Link from 'next/link';

import { logoutPingPongAccount } from '@/app/pingpong/actions';
import { PingPongShell } from '@/app/pingpong/_components/pingpong-ui';
import {
  PINGPONG_REGISTRANT_COOKIE,
  PINGPONG_SESSION_COOKIE,
  getMyRegistrations,
  getMyRegistrationsForUser,
  getPingPongUserBySessionToken,
} from '@/app/pingpong/_lib/db';
import { GlassPanel } from '@/app/ui/app-shell';

export const dynamic = 'force-dynamic';

export default async function PingPongMePage() {
  const cookieStore = await cookies();
  const registrantKey = cookieStore.get(PINGPONG_REGISTRANT_COOKIE)?.value;
  const currentUser = await getPingPongUserBySessionToken(
    cookieStore.get(PINGPONG_SESSION_COOKIE)?.value,
  );
  const [registrations, guestRegistrations] = await Promise.all([
    currentUser
      ? getMyRegistrationsForUser(currentUser.id)
      : getMyRegistrations(registrantKey),
    currentUser ? getMyRegistrations(registrantKey) : Promise.resolve([]),
  ]);
  const guestOnlyRegistrations = currentUser
    ? guestRegistrations.filter(
        (registration) =>
          !registrations.some((entry) => entry.id === registration.id),
      )
    : [];
  const latestRegistration = registrations[0] ?? null;

  return (
    <PingPongShell
      title="我的"
      subtitle={
        currentUser
          ? '已登录开球站账号，个人资料和报名记录优先按账号展示。'
          : '还没登录开球站账号时，仍会尽量读取你之前的访客报名记录。'
      }
    >
      <div className="grid gap-6">
        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            个人中心
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {currentUser ? '我的开球站资料' : '我的报名回执'}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
            {currentUser
              ? '你的资料已经写入数据库。后续比赛报名会优先带入这个账号，不会复用 worklog/news 的登录状态。'
              : '这里会展示你最近提交到数据库的赛事报名。登录后会升级为独立的开球站个人资料页。'}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {currentUser ? (
              <>
                <Link
                  href="/pingpong/auth"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/20"
                >
                  查看账号信息
                </Link>
                <form action={logoutPingPongAccount}>
                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    退出开球站
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/pingpong/auth"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                登录 / 注册开球站账号
              </Link>
            )}
          </div>
        </GlassPanel>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassPanel className="p-5">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {currentUser ? '当前资料' : '最近一场赛事'}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {currentUser
                ? `${currentUser.name} · ${currentUser.city}${currentUser.club ? ` · ${currentUser.club}` : ''}`
                : latestRegistration
                  ? `${latestRegistration.tournamentTitle} · ${latestRegistration.status}`
                  : '还没有可识别的报名记录。'}
            </p>
          </GlassPanel>
          <GlassPanel className="p-5">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {currentUser ? '累计报名' : '识别到的记录'}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {currentUser
                ? `账号下共有 ${registrations.length} 条赛事报名记录。`
                : `当前已识别 ${registrations.length} 条数据库记录。`}
            </p>
          </GlassPanel>
        </div>

        {currentUser ? (
          <GlassPanel className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              资料卡
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ProfileItem label="姓名" value={currentUser.name} />
              <ProfileItem label="城市" value={currentUser.city} />
              <ProfileItem
                label="俱乐部"
                value={currentUser.club || '暂未填写'}
              />
              <ProfileItem
                label="联系信息"
                value={currentUser.phone || currentUser.email || '未填写'}
              />
            </div>
          </GlassPanel>
        ) : null}

        {registrations.length === 0 ? (
          <GlassPanel className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {currentUser
                ? '先去一场可报名赛事提交信息，之后这里会自动显示你的回执。'
                : '先去一场可报名赛事提交信息，或者先注册开球站账号，之后这里会自动显示你的回执。'}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pingpong"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                去看比赛
              </Link>
              {!currentUser ? (
                <Link
                  href="/pingpong/auth"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/20"
                >
                  先建资料
                </Link>
              ) : null}
            </div>
          </GlassPanel>
        ) : (
          <div className="grid gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                报名记录
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {currentUser ? '账号下的赛事报名' : '最近识别到的赛事报名'}
              </h3>
            </div>
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
                      {registration.tournamentCity} ·{' '}
                      {registration.tournamentDate}
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

        {currentUser && guestOnlyRegistrations.length > 0 ? (
          <GlassPanel className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              访客历史
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
              当前设备上识别到的旧报名记录
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              这些记录来自之前未登录时保存的姓名 + 城市识别，可作为补充参考。
            </p>
            <div className="mt-4 grid gap-3">
              {guestOnlyRegistrations.slice(0, 3).map((registration) => (
                <div
                  key={registration.id}
                  className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="font-medium text-slate-900 dark:text-white">
                    {registration.tournamentTitle}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {registration.tournamentCity} ·{' '}
                    {registration.tournamentDate} · {registration.status}
                  </p>
                </div>
              ))}
            </div>
          </GlassPanel>
        ) : null}
      </div>
    </PingPongShell>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
