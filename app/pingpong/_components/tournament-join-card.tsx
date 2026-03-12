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
  status: 'Open' | 'Live' | 'Closed';
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
    if (!raw) {
      return;
    }

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

  const isJoinable = status === 'Open';

  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            Mock registration
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
            Join this tournament
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Local-only MVP flow. Registrations are stored in this browser and do
            not affect the shared seed data.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Deadline
          <div className="mt-1 font-medium text-slate-900 dark:text-white">
            {signupDeadline}
          </div>
        </div>
      </div>

      {registration ? (
        <div className="mt-5 rounded-[20px] border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/10">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
            Registered for {tournamentTitle}
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
              Saved locally just now
            </p>
          ) : null}
        </div>
      ) : null}

      {!isJoinable ? (
        <div className="mt-5 rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          Registration is disabled because this event is currently marked as{' '}
          {status.toLowerCase()}.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            required
            name="playerName"
            placeholder="Your name"
            defaultValue={registration?.playerName}
            className="h-12 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-500/20"
          />
          <input
            required
            name="city"
            placeholder="City / club"
            defaultValue={registration?.city}
            className="h-12 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-500/20"
          />
          <textarea
            name="note"
            rows={3}
            placeholder="Notes: preferred time slot, current level, partner request..."
            defaultValue={registration?.note}
            className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-500/20"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {registration ? 'Update local registration' : 'Join tournament'}
          </button>
        </form>
      )}
    </GlassPanel>
  );
}
