import Link from 'next/link';

import {
  MetricCard,
  PingPongShell,
  PlayerCard,
  SearchForm,
  SectionTitle,
  TournamentCard,
  MatchList,
} from '@/app/pingpong/_components/pingpong-ui';
import { GlassPanel } from '@/app/ui/app-shell';
import {
  getRecentMatches,
  players,
  searchTournaments,
  tournaments,
} from '@/app/pingpong/data';

export default function PingPongPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q?.trim() ?? '';
  const filteredTournaments = searchTournaments(query);
  const liveCount = tournaments.filter(
    (tournament) => tournament.status === 'Live',
  ).length;
  const openCount = tournaments.filter(
    (tournament) => tournament.status === 'Open',
  ).length;
  const activePlayers = players.length;
  const recentMatches = getRecentMatches(5);
  const topPlayers = [...players]
    .sort((left, right) => right.totalPoints - left.totalPoints)
    .slice(0, 3);

  return (
    <PingPongShell
      title="Pingpong MVP"
      subtitle="开球网风格的本地 MVP：赛事浏览、球员积分、搜索与模拟报名，先在 app 内闭环。"
    >
      <div className="grid gap-8">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <GlassPanel className="p-6">
            <SectionTitle
              eyebrow="Tournament Hub"
              title="Browse tournaments and recent match flow"
              body="Search by tournament title or city, then drill into event detail pages for participants, schedules, and a local mocked registration flow."
            />
            <div className="mt-5">
              <SearchForm
                action="/pingpong"
                defaultValue={query}
                placeholder="Search tournaments by title or city"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Link
                href="/pingpong/players"
                className="rounded-full border border-slate-200/80 bg-white px-4 py-2 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
              >
                Explore players
              </Link>
              <span className="rounded-full border border-slate-200/80 bg-white px-4 py-2 dark:border-white/10 dark:bg-white/5">
                Seeded with {tournaments.length} tournaments and{' '}
                {players.length} players
              </span>
            </div>
          </GlassPanel>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <MetricCard
              label="Open events"
              value={String(openCount)}
              hint="Currently accepting local registrations"
            />
            <MetricCard
              label="Live today"
              value={String(liveCount)}
              hint="Tournaments with in-progress matches"
            />
            <MetricCard
              label="Tracked players"
              value={String(activePlayers)}
              hint="Profiles with points and rating history"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Tournaments
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {query
                    ? `Results for "${query}"`
                    : 'Upcoming and active events'}
                </h2>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {filteredTournaments.length} results
              </span>
            </div>

            <div className="grid gap-4">
              {filteredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
              {filteredTournaments.length === 0 ? (
                <GlassPanel className="p-6 text-sm text-slate-500 dark:text-slate-400">
                  No tournaments match this search. Try another city or clear
                  the query.
                </GlassPanel>
              ) : null}
            </div>
          </section>

          <div className="grid gap-8">
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Matches
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  Recent and live pairings
                </h2>
              </div>
              <MatchList matches={recentMatches} />
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Players
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                    Top points right now
                  </h2>
                </div>
                <Link
                  href="/pingpong/players"
                  className="text-sm font-medium text-sky-600 dark:text-sky-300"
                >
                  View all
                </Link>
              </div>
              <div className="grid gap-4">
                {topPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PingPongShell>
  );
}
