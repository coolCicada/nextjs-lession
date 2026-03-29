'use client';

import { useMemo, useState } from 'react';
import { GlassPanel } from '@/app/ui/app-shell';
import type { Evaluation, PredictionRecord } from '../_lib/types';
import { PredictionRow } from './widgets';

type TypeFilter = 'all' | 'index_trend' | 'gold_direction' | 'sector_hot';
type ResultFilter = 'all' | 'correct' | 'wrong';

export function HistoryClient({
  historyRecords,
  evaluations,
}: {
  historyRecords: PredictionRecord[];
  evaluations: Evaluation[];
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');

  const dates = useMemo(
    () => historyRecords.map((record) => record.date).sort().reverse(),
    [historyRecords],
  );

  const displayDate = selectedDate || dates[0] || '';
  const record = historyRecords.find((item) => item.date === displayDate);
  const evaluation = evaluations.find((item) => item.date === displayDate);

  const predictions = useMemo(() => {
    let list =
      record?.predictions.map((prediction) => ({
        ...prediction,
        evaluation: evaluation?.results.find((result) => result.predId === prediction.id),
      })) ?? [];

    if (typeFilter !== 'all') {
      list = list.filter((item) => item.type === typeFilter);
    }

    if (resultFilter === 'correct') {
      list = list.filter((item) => item.evaluation?.correct === true);
    } else if (resultFilter === 'wrong') {
      list = list.filter((item) => item.evaluation?.correct === false);
    }

    return list;
  }, [record, evaluation, resultFilter, typeFilter]);

  if (!dates.length) {
    return (
      <GlassPanel className="p-10 text-center text-sm text-slate-400">
        暂无历史数据
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="space-y-5 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            History
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
            历史预测
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200/80 px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:text-slate-300"
            onClick={() => {
              const index = dates.indexOf(displayDate);
              if (index < dates.length - 1) setSelectedDate(dates[index + 1]);
            }}
          >
            ←
          </button>
          <span className="min-w-[110px] text-center text-sm font-medium text-slate-700 dark:text-slate-200">
            {displayDate}
          </span>
          <button
            type="button"
            className="rounded-lg border border-slate-200/80 px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:text-slate-300"
            onClick={() => {
              const index = dates.indexOf(displayDate);
              if (index > 0) setSelectedDate(dates[index - 1]);
            }}
          >
            →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['all', '全部'],
          ['index_trend', '指数'],
          ['gold_direction', '黄金'],
          ['sector_hot', '板块'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`rounded-full px-4 py-2 text-xs transition ${
              typeFilter === value
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'border border-slate-200/80 bg-white/80 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
            }`}
            onClick={() => setTypeFilter(value as TypeFilter)}
          >
            {label}
          </button>
        ))}
        <span className="mx-1 h-8 w-px bg-slate-200 dark:bg-white/10" />
        {[
          ['all', '全部'],
          ['correct', '正确'],
          ['wrong', '错误'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`rounded-full px-4 py-2 text-xs transition ${
              resultFilter === value
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'border border-slate-200/80 bg-white/80 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
            }`}
            onClick={() => setResultFilter(value as ResultFilter)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {predictions.length ? (
          predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <PredictionRow
                prediction={prediction}
                evaluation={prediction.evaluation}
              />
              <div className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                依据: {prediction.reasoning.join(' / ')}
              </div>
              {prediction.evaluation?.actualChange ? (
                <div className="mt-1 text-xs text-slate-400">
                  实际变动: {prediction.evaluation.actualChange}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200/80 p-10 text-center text-sm text-slate-400 dark:border-white/10">
            该日期或筛选条件下无数据
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
