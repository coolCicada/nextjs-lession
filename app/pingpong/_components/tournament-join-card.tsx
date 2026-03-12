'use client';

import { FormEvent, useEffect, useState } from 'react';

import { GlassPanel } from '@/app/ui/app-shell';

type Registration = {
  playerName: string;
  city: string;
  note: string;
  tournamentId: string;
};

type TournamentJoinCardProps = {
  tournamentId: string;
  tournamentTitle: string;
  signupDeadline: string;
  status: '报名中' | '进行中' | '已结束';
};

const STORAGE_KEY = 'oc-pingpong-registrations';

export function TournamentJoinCard({
  tournamentId,
  tournamentTitle,
  signupDeadline,
  status,
}: TournamentJoinCardProps) {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw) as Record<string, Registration>;
    setRegistration(saved[tournamentId] ?? null);
  }, [tournamentId]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextRegistration = {
      playerName: String(formData.get('playerName') ?? '').trim(),
      city: String(formData.get('city') ?? '').trim(),
      note: String(formData.get('note') ?? '').trim(),
      tournamentId,
    };

    const raw = localStorage.getItem(STORAGE_KEY);
    const current = raw
      ? (JSON.parse(raw) as Record<string, Registration>)
      : {};
    current[tournamentId] = nextRegistration;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    setRegistration(nextRegistration);
    setSubmitted(true);
  }

  const isJoinable = status === '报名中';

  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            模拟报名
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
            报名这场比赛
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            当前是本地 MVP 流程，报名信息只保存在当前浏览器，不会影响共享示例数据。
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
            已报名：{tournamentTitle}
          </p>
          <p className="mt-2 text-sm text-emerald-800/80 dark:text-emerald-100/80">
            {registration.playerName} · {registration.city}
          </p>
          {registration.note ? (
            <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
              {registration.note}
            </p>
          ) : null}
          {submitted ? (
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
              刚刚已保存到本地
            </p>
          ) : null}
        </div>
      ) : null}

      {!isJoinable ? (
        <div className="mt-5 rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          当前赛事状态为“{status}”，暂时不能报名。
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            required
            name="playerName"
            placeholder="你的姓名"
            defaultValue={registration?.playerName}
            className="h-12 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-500/20"
          />
          <input
            required
            name="city"
            placeholder="所在城市 / 俱乐部"
            defaultValue={registration?.city}
            className="h-12 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-500/20"
          />
          <textarea
            name="note"
            rows={3}
            placeholder="备注：希望时段、当前水平、是否想双打搭档等……"
            defaultValue={registration?.note}
            className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-500/20"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {registration ? '更新报名信息' : '立即报名'}
          </button>
        </form>
      )}
    </GlassPanel>
  );
}
