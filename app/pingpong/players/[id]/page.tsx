import { notFound } from 'next/navigation';

import {
  PingPongShell,
  RatingHistoryTable,
  RatingTrend,
} from '@/app/pingpong/_components/pingpong-ui';
import { GlassPanel } from '@/app/ui/app-shell';
import {
  getPlayerById,
  getRatingSummary,
  tournaments,
} from '@/app/pingpong/data';

export default function PlayerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const player = getPlayerById(params.id);

  if (!player) {
    notFound();
  }

  const summary = getRatingSummary(player);
  const nextEvents = tournaments.filter((tournament) =>
    tournament.participants.some(
      (participant) => participant.playerId === player.id,
    ),
  );

  return (
    <PingPongShell
      title={player.name}
      subtitle={`${player.city} · ${player.club} · ${player.style}`}
    >
      <div className="grid gap-8">
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <GlassPanel className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Player profile
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {player.name}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              {player.bio}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ProfileStat
                label="Current rating"
                value={String(player.currentRating)}
              />
              <ProfileStat
                label="Total points"
                value={String(player.totalPoints)}
              />
              <ProfileStat label="City rank" value={`#${player.rank}`} />
              <ProfileStat
                label="Match form"
                value={`${player.form.wins}-${player.form.losses}`}
              />
              <ProfileStat label="Hand" value={player.hand} />
              <ProfileStat label="Style" value={player.style} />
            </div>

            <div className="mt-6 rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                Achievements
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {player.achievements.map((achievement) => (
                  <span
                    key={achievement}
                    className="rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  >
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          </GlassPanel>

          <div className="grid gap-4">
            <GlassPanel className="p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Points snapshot
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <ProfileStat
                  label="Rating gain"
                  value={`+${summary.gain}`}
                  compact
                />
                <ProfileStat
                  label="Points gain"
                  value={`+${summary.pointsGain}`}
                  compact
                />
                <ProfileStat
                  label="Latest event"
                  value={summary.lastEvent}
                  compact
                />
              </div>
            </GlassPanel>
            <RatingTrend player={player} />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <RatingHistoryTable player={player} />

          <GlassPanel className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Tournaments
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
              Visible entries
            </h3>
            <div className="mt-4 space-y-3">
              {nextEvents.map((tournament) => (
                <div
                  key={tournament.id}
                  className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="font-medium text-slate-900 dark:text-white">
                    {tournament.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {tournament.city} · {tournament.date} · {tournament.status}
                  </p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </PingPongShell>
  );
}

function ProfileStat({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 font-medium text-slate-900 dark:text-white ${compact ? 'text-base' : 'text-lg'}`}
      >
        {value}
      </p>
    </div>
  );
}
