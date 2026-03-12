import { registerForTournament } from '@/app/pingpong/actions';
import { type RegistrationRecord } from '@/app/pingpong/data';
import { PINGPONG_FIELD_CLASSNAME } from '@/app/pingpong/_components/pingpong-ui';
import { GlassPanel } from '@/app/ui/app-shell';

type TournamentJoinCardProps = {
  tournamentId: string;
  tournamentTitle: string;
  signupDeadline: string;
  status: '报名中' | '进行中' | '已结束';
  registration: RegistrationRecord | null;
  hasRecentRegistrations?: boolean;
  justRegistered?: boolean;
};

export function TournamentJoinCard({
  tournamentId,
  tournamentTitle,
  signupDeadline,
  status,
  registration,
  hasRecentRegistrations = false,
  justRegistered = false,
}: TournamentJoinCardProps) {
  const isJoinable = status === '报名中';
  const formAction = registerForTournament.bind(null, tournamentId);

  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            真实报名
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
            报名这场比赛
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            当前 MVP 已改为数据库保存。提交后可在“我的”里继续查看最近一次报名记录。
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          报名截止
          <div className="mt-1 font-medium text-slate-900 dark:text-white">
            {signupDeadline}
          </div>
        </div>
      </div>

      {registration ? (
        <div className="mt-5 rounded-[20px] border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/10">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
            已保存：{tournamentTitle}
          </p>
          <p className="mt-2 text-sm text-emerald-800/80 dark:text-emerald-100/80">
            {registration.playerName} · {registration.city}
          </p>
          <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
            状态：{registration.status}
          </p>
          {registration.note ? (
            <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
              {registration.note}
            </p>
          ) : null}
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
            {justRegistered ? '刚刚已写入数据库' : `最近更新于 ${registration.updatedAt}`}
          </p>
        </div>
      ) : null}

      {hasRecentRegistrations ? (
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
          已有其他公开报名写入数据库
        </p>
      ) : null}

      {!isJoinable ? (
        <div className="mt-5 rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          当前赛事状态为“{status}”，暂时不能报名。
        </div>
      ) : (
        <form action={formAction} className="mt-5 grid gap-3">
          <input
            required
            name="playerName"
            placeholder="你的姓名"
            defaultValue={registration?.playerName}
            className={`h-12 ${PINGPONG_FIELD_CLASSNAME}`}
          />
          <input
            required
            name="city"
            placeholder="所在城市 / 俱乐部"
            defaultValue={registration?.city}
            className={`h-12 ${PINGPONG_FIELD_CLASSNAME}`}
          />
          <textarea
            name="note"
            rows={3}
            maxLength={400}
            placeholder="备注：希望时段、当前水平、是否想双打搭档等……"
            defaultValue={registration?.note}
            className={`py-3 ${PINGPONG_FIELD_CLASSNAME}`}
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {registration ? '更新报名信息' : '提交报名'}
          </button>
        </form>
      )}
    </GlassPanel>
  );
}
