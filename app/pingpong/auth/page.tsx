import { cookies } from 'next/headers';
import Link from 'next/link';

import {
  loginPingPongAccount,
  logoutPingPongAccount,
  registerPingPongAccount,
} from '@/app/pingpong/actions';
import {
  PINGPONG_FIELD_CLASSNAME,
  PingPongShell,
  SectionTitle,
} from '@/app/pingpong/_components/pingpong-ui';
import {
  PINGPONG_SESSION_COOKIE,
  getPingPongUserBySessionToken,
} from '@/app/pingpong/_lib/db';
import { GlassPanel } from '@/app/ui/app-shell';

export const dynamic = 'force-dynamic';

const AUTH_MESSAGES: Record<string, string> = {
  identifier_exists: '这个手机号或邮箱已经注册过，直接登录即可。',
  identifier_required: '注册时至少填写手机号或邮箱其中一项。',
  invalid_login: '请填写姓名和手机号/邮箱后再登录。',
  invalid_credentials: '没有找到匹配的开球站账号，请检查姓名和手机号/邮箱。',
  invalid_profile: '资料填写不完整，请重新提交。',
  profile_required: '先登录或补全资料，再报名比赛。',
};

function readQueryValue(value?: string | string[]) {
  return typeof value === 'string' ? value : '';
}

export default async function PingPongAuthPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [resolvedSearchParams, cookieStore] = await Promise.all([
    searchParams,
    cookies(),
  ]);
  const currentUser = await getPingPongUserBySessionToken(
    cookieStore.get(PINGPONG_SESSION_COOKIE)?.value,
  );
  const errorCode = readQueryValue(resolvedSearchParams?.error);
  const isLoggedOut = readQueryValue(resolvedSearchParams?.logged_out) === '1';
  const welcome = readQueryValue(resolvedSearchParams?.welcome) === '1';

  return (
    <PingPongShell
      title="开球站账号"
      subtitle="独立于 worklog/news 的轻量账号体系，只服务开球站报名和个人资料。"
    >
      <div className="grid gap-6">
        {errorCode && AUTH_MESSAGES[errorCode] ? (
          <GlassPanel className="border-amber-200/80 bg-amber-50/80 p-5 dark:border-amber-400/20 dark:bg-amber-500/10">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {AUTH_MESSAGES[errorCode]}
            </p>
          </GlassPanel>
        ) : null}

        {isLoggedOut ? (
          <GlassPanel className="border-slate-200/80 bg-white/90 p-5">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              当前已退出开球站账号。
            </p>
          </GlassPanel>
        ) : null}

        {welcome ? (
          <GlassPanel className="border-emerald-200/80 bg-emerald-50/80 p-5 dark:border-emerald-400/20 dark:bg-emerald-500/10">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              资料已写入数据库，现在可以在“我的”里查看你的个人卡片和报名记录。
            </p>
          </GlassPanel>
        ) : null}

        {currentUser ? (
          <GlassPanel className="p-6">
            <SectionTitle
              eyebrow="当前账号"
              title={currentUser.name}
              body="你已经登录开球站账号。后续报名会优先绑定这个账号，不会影响 worklog/news 的登录状态。"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ProfileItem label="城市" value={currentUser.city} />
              <ProfileItem
                label="俱乐部"
                value={currentUser.club || '暂未填写'}
              />
              <ProfileItem label="邮箱" value={currentUser.email || '未绑定'} />
              <ProfileItem label="手机" value={currentUser.phone || '未绑定'} />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pingpong/me"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                去我的主页
              </Link>
              <form action={logoutPingPongAccount}>
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/20"
                >
                  退出当前账号
                </button>
              </form>
            </div>
          </GlassPanel>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassPanel className="p-6">
              <SectionTitle
                eyebrow="注册"
                title="创建开球站资料"
                body="先登记你的基础资料。资料会写入数据库，并用于后续赛事报名和“我的”页面展示。"
              />
              <form
                action={registerPingPongAccount}
                className="mt-5 grid gap-3"
              >
                <input
                  required
                  name="name"
                  placeholder="姓名"
                  className={`h-12 ${PINGPONG_FIELD_CLASSNAME}`}
                />
                <input
                  required
                  name="city"
                  placeholder="所在城市"
                  className={`h-12 ${PINGPONG_FIELD_CLASSNAME}`}
                />
                <input
                  name="club"
                  placeholder="俱乐部 / 常打球馆（选填）"
                  className={`h-12 ${PINGPONG_FIELD_CLASSNAME}`}
                />
                <input
                  name="phone"
                  inputMode="tel"
                  placeholder="手机号（可选，和邮箱至少填一个）"
                  className={`h-12 ${PINGPONG_FIELD_CLASSNAME}`}
                />
                <input
                  name="email"
                  inputMode="email"
                  placeholder="邮箱（可选，和手机号至少填一个）"
                  className={`h-12 ${PINGPONG_FIELD_CLASSNAME}`}
                />
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  注册并登录
                </button>
              </form>
            </GlassPanel>

            <GlassPanel className="p-6">
              <SectionTitle
                eyebrow="登录"
                title="继续使用已有资料"
                body="MVP 登录只校验姓名 + 手机号/邮箱，不复用现有 worklog/news 登录。"
              />
              <form action={loginPingPongAccount} className="mt-5 grid gap-3">
                <input
                  required
                  name="name"
                  placeholder="注册时填写的姓名"
                  className={`h-12 ${PINGPONG_FIELD_CLASSNAME}`}
                />
                <input
                  required
                  name="identifier"
                  inputMode="text"
                  placeholder="手机号或邮箱"
                  className={`h-12 ${PINGPONG_FIELD_CLASSNAME}`}
                />
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/20"
                >
                  登录开球站
                </button>
              </form>
              <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                还没注册也没关系。先建一份资料，之后报名比赛时会自动带出你的名字和城市。
              </p>
            </GlassPanel>
          </div>
        )}
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
