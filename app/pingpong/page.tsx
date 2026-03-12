import Link from 'next/link';

import {
  MatchList,
  MetricCard,
  PingPongShell,
  PlayerCard,
  SearchForm,
  SectionTitle,
  TournamentCard,
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
    (tournament) => tournament.status === '进行中',
  ).length;
  const openCount = tournaments.filter(
    (tournament) => tournament.status === '报名中',
  ).length;
  const activePlayers = players.length;
  const recentMatches = getRecentMatches(5);
  const topPlayers = [...players]
    .sort((left, right) => right.totalPoints - left.totalPoints)
    .slice(0, 3);

  return (
    <PingPongShell
      title="开球站"
      subtitle="开球网风格的本地 MVP：赛事浏览、球员积分、搜索与模拟报名，先在应用内闭环。"
    >
      <div className="grid gap-8">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <GlassPanel className="p-6">
            <SectionTitle
              eyebrow="比赛中心"
              title="查看比赛与近期对阵动态"
              body="支持按比赛名称或城市搜索，进入详情页后可查看参赛名单、赛程安排，以及本地模拟报名流程。"
            />
            <div className="mt-5">
              <SearchForm
                action="/pingpong"
                defaultValue={query}
                placeholder="按比赛名称、城市或场馆搜索"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Link
                href="/pingpong/players"
                className="rounded-full border border-slate-200/80 bg-white px-4 py-2 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
              >
                查看球员积分
              </Link>
              <span className="rounded-full border border-slate-200/80 bg-white px-4 py-2 dark:border-white/10 dark:bg-white/5">
                当前内置 {tournaments.length} 场比赛、{players.length} 位球员
              </span>
            </div>
          </GlassPanel>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <MetricCard label="可报名赛事" value={String(openCount)} hint="当前可以本地模拟报名的比赛" />
            <MetricCard label="进行中赛事" value={String(liveCount)} hint="正在更新中的比赛与对阵" />
            <MetricCard label="收录球员" value={String(activePlayers)} hint="包含积分、等级分与历史走势" />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  比赛列表
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {query ? `“${query}” 的搜索结果` : '近期比赛与热门赛事'}
                </h2>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                共 {filteredTournaments.length} 条
              </span>
            </div>

            <div className="grid gap-4">
              {filteredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
              {filteredTournaments.length === 0 ? (
                <GlassPanel className="p-6 text-sm text-slate-500 dark:text-slate-400">
                  没有找到匹配的比赛，换个城市或关键词试试。
                </GlassPanel>
              ) : null}
            </div>
          </section>

          <div className="grid gap-8">
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  近期对阵
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  最近进行中的比赛情况
                </h2>
              </div>
              <MatchList matches={recentMatches} />
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    积分榜
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                    当前积分领先球员
                  </h2>
                </div>
                <Link
                  href="/pingpong/players"
                  className="text-sm font-medium text-sky-600 dark:text-sky-300"
                >
                  查看全部
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
