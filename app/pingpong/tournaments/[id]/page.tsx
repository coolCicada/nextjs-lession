import { notFound } from 'next/navigation';

import {
  MatchList,
  ParticipantList,
  PingPongShell,
  RatingTrend,
  SectionTitle,
} from '@/app/pingpong/_components/pingpong-ui';
import { TournamentJoinCard } from '@/app/pingpong/_components/tournament-join-card';
import { GlassPanel } from '@/app/ui/app-shell';
import {
  getPlayerById,
  getTournamentById,
  getTournamentParticipants,
} from '@/app/pingpong/data';

export default function TournamentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const tournament = getTournamentById(params.id);

  if (!tournament) {
    notFound();
  }

  const participants = getTournamentParticipants(tournament);
  const featuredPlayer = participants[0]
    ? getPlayerById(participants[0].playerId)
    : null;

  return (
    <PingPongShell
      title={tournament.title}
      subtitle={`${tournament.city} · ${tournament.venue} · ${tournament.format}`}
    >
      <div className="grid gap-8">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel className="p-6">
            <SectionTitle
              eyebrow="比赛详情"
              title={tournament.title}
              body={tournament.summary}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DetailChip label="比赛日期" value={tournament.date} />
              <DetailChip label="报名截止" value={tournament.signupDeadline} />
              <DetailChip label="比赛级别" value={tournament.level} />
              <DetailChip label="报名费用" value={`￥${tournament.fee}`} />
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

          <TournamentJoinCard
            tournamentId={tournament.id}
            tournamentTitle={tournament.title}
            signupDeadline={tournament.signupDeadline}
            status={tournament.status}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  参赛名单
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  共 {participants.length} 位种子/报名球员
                </h2>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                主办方：{tournament.organizer}
              </span>
            </div>
            <ParticipantList participants={participants} />
          </section>

          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                赛程看板
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                当前对阵情况
              </h2>
            </div>
            <MatchList matches={tournament.matches} />
          </section>
        </div>

        {featuredPlayer ? (
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <GlassPanel className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                焦点球员
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {featuredPlayer.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                {featuredPlayer.bio}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailChip label="等级分" value={String(featuredPlayer.currentRating)} />
                <DetailChip label="积分" value={String(featuredPlayer.totalPoints)} />
                <DetailChip label="俱乐部" value={featuredPlayer.club} />
                <DetailChip label="打法" value={featuredPlayer.style} />
              </div>
            </GlassPanel>
            <RatingTrend player={featuredPlayer} />
          </div>
        ) : null}
      </div>
    </PingPongShell>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
