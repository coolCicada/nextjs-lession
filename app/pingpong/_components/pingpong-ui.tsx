import Link from 'next/link';

import { AppBackground, AppHeader, GlassPanel } from '@/app/ui/app-shell';
import {
  Player,
  Tournament,
  TournamentMatch,
  TournamentParticipant,
  getPlayerById,
  getRatingSummary,
} from '@/app/pingpong/data';

export function PingPongShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-700 dark:text-slate-100">
      <AppBackground />
      <div className="relative z-10">
        <AppHeader title={title} subtitle={subtitle} backHref="/" />
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
        {body}
      </p>
    </div>
  );
}

export function SearchForm({
  action,
  name = 'q',
  placeholder,
  defaultValue,
}: {
  action: string;
  name?: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-12 flex-1 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-500/20"
      />
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        Search
      </button>
    </form>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <GlassPanel className="p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
    </GlassPanel>
  );
}

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const confirmedCount = tournament.participants.filter(
    (participant) => participant.status === 'Confirmed',
  ).length;

  return (
    <Link href={`/pingpong/tournaments/${tournament.id}`} className="block">
      <GlassPanel className="dark:hover:border-white/15 h-full p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200">
              {tournament.status}
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {tournament.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {tournament.summary}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-right text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <div>{formatDate(tournament.date)}</div>
            <div>{tournament.city}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
          <InfoRow label="Venue" value={tournament.venue} />
          <InfoRow label="Format" value={tournament.format} />
          <InfoRow label="Level" value={tournament.level} />
          <InfoRow label="Players" value={`${confirmedCount} confirmed`} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tournament.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </GlassPanel>
    </Link>
  );
}

export function MatchList({
  matches,
}: {
  matches: Array<TournamentMatch & { tournamentTitle?: string; city?: string }>;
}) {
  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const playerA = getPlayerById(match.playerAId);
        const playerB = getPlayerById(match.playerBId);

        if (!playerA || !playerB) {
          return null;
        }

        return (
          <GlassPanel key={match.id} className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  <span>{match.round}</span>
                  <span className="rounded-full border border-slate-200/80 px-2 py-1 text-[10px] dark:border-white/10">
                    {match.status}
                  </span>
                  {match.tournamentTitle ? (
                    <span>{match.tournamentTitle}</span>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center gap-3 text-base font-semibold text-slate-950 dark:text-white">
                  <span>{playerA.name}</span>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white dark:bg-white dark:text-slate-900">
                    {match.score}
                  </span>
                  <span>{playerB.name}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {match.table} · {match.startTime}
                  {match.city ? ` · ${match.city}` : ''}
                </p>
              </div>
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
}

export function PlayerCard({ player }: { player: Player }) {
  const summary = getRatingSummary(player);

  return (
    <Link href={`/pingpong/players/${player.id}`} className="block">
      <GlassPanel className="dark:hover:border-white/15 h-full p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
              {player.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {player.city} · {player.club}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-right dark:border-emerald-400/20 dark:bg-emerald-500/10">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
              Points
            </p>
            <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-100">
              {player.totalPoints}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
          <InfoRow label="Rating" value={String(player.currentRating)} />
          <InfoRow label="Rank" value={`#${player.rank}`} />
          <InfoRow label="Style" value={player.style} />
          <InfoRow
            label="Form"
            value={`${player.form.wins}-${player.form.losses}`}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Recent rating gain
            </span>
            <span className="font-medium text-slate-950 dark:text-white">
              +{summary.gain}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-500"
              style={{ width: `${Math.min(100, Math.max(22, summary.gain))}%` }}
            />
          </div>
        </div>
      </GlassPanel>
    </Link>
  );
}

export function ParticipantList({
  participants,
}: {
  participants: Array<TournamentParticipant & { player: Player }>;
}) {
  return (
    <div className="space-y-3">
      {participants.map((participant) => (
        <div
          key={participant.playerId}
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5"
        >
          <div>
            <Link
              href={`/pingpong/players/${participant.player.id}`}
              className="font-medium text-slate-900 dark:text-white"
            >
              {participant.seed}. {participant.player.name}
            </Link>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {participant.player.city} · {participant.player.currentRating}{' '}
              rating · {participant.player.totalPoints} pts
            </p>
          </div>
          <span className="rounded-full border border-slate-200/80 px-3 py-1 text-xs text-slate-500 dark:border-white/10 dark:text-slate-300">
            {participant.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RatingTrend({ player }: { player: Player }) {
  const values = player.ratingHistory.map((point) => point.rating);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 100;
  const height = 36;

  const points = player.ratingHistory
    .map((point, index) => {
      const x = (index / Math.max(player.ratingHistory.length - 1, 1)) * width;
      const y =
        height - ((point.rating - min) / Math.max(max - min, 1)) * height;
      return `${x},${y}`;
    })
    .join(' ');
  const gradientId = `rating-gradient-${player.id}`;

  return (
    <GlassPanel className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            Rating Trend
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
            Last 6 events
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Current</p>
          <p className="text-xl font-semibold text-slate-950 dark:text-white">
            {player.currentRating}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-24 w-full overflow-visible"
        >
          <polyline
            fill="none"
            points={points}
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {player.ratingHistory.slice(-3).map((point) => (
            <div
              key={`${player.id}-${point.date}`}
              className="rounded-2xl border border-slate-200/80 px-3 py-3 dark:border-white/10"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                {formatShortDate(point.date)}
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
                {point.rating}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {point.event}
              </p>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

export function RatingHistoryTable({ player }: { player: Player }) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            History
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
            Recent rating log
          </h3>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10">
        <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr] bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400 dark:bg-white/5 dark:text-slate-500">
          <span>Date</span>
          <span>Event</span>
          <span>Rating</span>
          <span>Delta</span>
        </div>
        {player.ratingHistory
          .slice()
          .reverse()
          .map((point) => (
            <div
              key={`${player.id}-${point.date}`}
              className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr] border-t border-slate-200/80 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300"
            >
              <span>{formatShortDate(point.date)}</span>
              <span className="truncate">{point.event}</span>
              <span>{point.rating}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-300">
                +{point.delta}
              </span>
            </div>
          ))}
      </div>
    </GlassPanel>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}
