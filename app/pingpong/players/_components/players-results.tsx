'use client';

import { use } from 'react';

import { PlayerCard } from '@/app/pingpong/_components/pingpong-ui';
import type { Player } from '@/app/pingpong/data';
import { GlassPanel } from '@/app/ui/app-shell';

export default function PlayersResults({
  playersPromise,
  query,
}: {
  playersPromise: Promise<Player[]>;
  query: string;
}) {
  const filteredPlayers = use(playersPromise);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            搜索结果
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
            {query ? `匹配“${query}”的球员` : '全部收录球员'}
          </h2>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          共 {filteredPlayers.length} 人
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPlayers.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>

      {filteredPlayers.length === 0 ? (
        <GlassPanel className="mt-4 p-6 text-sm text-slate-500 dark:text-slate-400">
          没有找到匹配球员，试试别的名字、城市或俱乐部关键词。
        </GlassPanel>
      ) : null}
    </section>
  );
}
