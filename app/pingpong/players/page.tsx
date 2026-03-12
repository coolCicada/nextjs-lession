import { Suspense } from 'react';

import {
  PingPongShell,
  SearchForm,
  SectionTitle,
} from '@/app/pingpong/_components/pingpong-ui';
import { searchPlayers } from '@/app/pingpong/_lib/db';
import PlayersResults from '@/app/pingpong/players/_components/players-results';
import { GlassPanel } from '@/app/ui/app-shell';

export const dynamic = 'force-dynamic';

export default async function PlayersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query =
    typeof resolvedSearchParams?.q === 'string'
      ? resolvedSearchParams.q.trim()
      : '';
  const rr = searchPlayers(query).then((players) =>
    players.sort((left, right) => right.totalPoints - left.totalPoints),
  );
  const playersPromise = new Promise((r) => setTimeout(r, 5000)).then(
    () => rr,
  );

  return (
    <PingPongShell
      title="球员积分榜"
      subtitle="搜索球员、查看当前积分与等级分，并进入详情页查看走势与近期战绩。"
    >
      <div className="grid gap-8">
        <GlassPanel className="p-6">
          <SectionTitle
            eyebrow="球员搜索"
            title="按姓名搜索球员"
            body="当前已从数据库读取球员资料、积分、俱乐部和最近等级分变化。"
          />
          <div className="mt-5">
            <SearchForm
              action="/pingpong/players"
              defaultValue={query}
              placeholder="按球员姓名、城市或俱乐部搜索"
            />
          </div>
        </GlassPanel>

        <Suspense
          key={query}
          fallback={<PlayersResultsFallback query={query} />}
        >
          <PlayersResults playersPromise={playersPromise} query={query} />
        </Suspense>
      </div>
    </PingPongShell>
  );
}

function PlayersResultsFallback({ query }: { query: string }) {
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
          正在加载...
        </span>
      </div>

      <GlassPanel className="p-6 text-sm text-slate-500 dark:text-slate-400">
        正在加载球员列表...
      </GlassPanel>
    </section>
  );
}
