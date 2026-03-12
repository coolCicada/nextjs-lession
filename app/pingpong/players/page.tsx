import {
  PingPongShell,
  PlayerCard,
  SearchForm,
  SectionTitle,
} from '@/app/pingpong/_components/pingpong-ui';
import { GlassPanel } from '@/app/ui/app-shell';
import { searchPlayers } from '@/app/pingpong/data';

export default function PlayersPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q?.trim() ?? '';
  const filteredPlayers = searchPlayers(query).sort(
    (left, right) => right.totalPoints - left.totalPoints,
  );

  return (
    <PingPongShell
      title="Player Directory"
      subtitle="Search players, compare current points, and open a profile for rating history and recent form."
    >
      <div className="grid gap-8">
        <GlassPanel className="p-6">
          <SectionTitle
            eyebrow="Players"
            title="Search by player name"
            body="The directory is seeded with realistic mock profiles, current points, clubs, and recent rating movement."
          />
          <div className="mt-5">
            <SearchForm
              action="/pingpong/players"
              defaultValue={query}
              placeholder="Search by player name, city, or club"
            />
          </div>
        </GlassPanel>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Results
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {query ? `Players matching "${query}"` : 'All tracked players'}
              </h2>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {filteredPlayers.length} players
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>

          {filteredPlayers.length === 0 ? (
            <GlassPanel className="mt-4 p-6 text-sm text-slate-500 dark:text-slate-400">
              No players matched that search. Try a different spelling or search
              by city.
            </GlassPanel>
          ) : null}
        </section>
      </div>
    </PingPongShell>
  );
}
