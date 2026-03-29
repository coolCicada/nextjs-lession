'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { GlassPanel } from '@/app/ui/app-shell';
import type { RawDataBundle } from '../_lib/types';
import { buildSourceStatus, StatusLine } from './widgets';

export function DataClient({ latestRawBundle }: { latestRawBundle: RawDataBundle | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');

  async function runAction(
    url: string,
    initialLog: string,
    successLog: string,
  ) {
    setResult('idle');
    setLogs([initialLog]);

    try {
      const response = await fetch(url, {
        method: 'POST',
      });
      const payload = (await response.json()) as { logs?: string[]; error?: string };

      if (!response.ok) {
        setLogs(payload.logs?.length ? payload.logs : [payload.error || '采集失败']);
        setResult('error');
        return;
      }

      setLogs(payload.logs?.length ? payload.logs : [successLog]);
      setResult('success');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setLogs([error instanceof Error ? error.message : '采集失败']);
      setResult('error');
    }
  }

  async function handleCollect() {
    await runAction(
      '/finance-learning/api/collect',
      '开始触发采集',
      '采集完成',
    );
  }

  async function handleEvaluate() {
    await runAction(
      '/finance-learning/api/evaluate',
      '开始执行收盘评估',
      '评估完成',
    );
  }

  async function handleLearn() {
    await runAction(
      '/finance-learning/api/learn',
      '开始重算学习洞察',
      '洞察更新完成',
    );
  }

  const sources = buildSourceStatus(latestRawBundle).map((item) => ({
    ...item,
    detail: item.detail ? new Date(item.detail).toLocaleString('zh-CN') : '',
  }));

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Data Management
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              数据管理
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
              onClick={handleCollect}
              disabled={isPending}
            >
              {isPending ? '执行中...' : '手动触发采集'}
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              onClick={handleEvaluate}
              disabled={isPending}
            >
              收盘评估
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              onClick={handleLearn}
              disabled={isPending}
            >
              更新洞察
            </button>
          </div>
        </div>

        <div className="mt-5">
          {sources.length ? (
            sources.map((item) => (
              <StatusLine
                key={item.label}
                status={item.status}
                label={item.label}
                detail={item.detail}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200/80 p-10 text-center text-sm text-slate-400 dark:border-white/10">
              暂无数据来源信息
            </div>
          )}
        </div>

        {result !== 'idle' ? (
          <div className={`mt-4 text-sm ${result === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {result === 'success' ? '采集完成，页面已刷新' : '采集失败，请查看日志'}
          </div>
        ) : null}

        {logs.length ? (
          <div className="mt-4 rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-300">
            {logs.map((log) => (
              <div key={log}>{log}</div>
            ))}
          </div>
        ) : null}
      </GlassPanel>

      {latestRawBundle?.hotTopics?.topics?.length ? (
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">🔥 热点话题</div>
          <div className="flex flex-wrap gap-2">
            {latestRawBundle.hotTopics.topics.map((topic) => (
              <span
                key={`${topic.query}-${topic.summary ?? ''}`}
                className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-slate-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-slate-200"
              >
                {topic.query}
                {topic.summary ? (
                  <span className="ml-2 text-xs text-slate-400">{topic.summary}</span>
                ) : null}
              </span>
            ))}
          </div>
        </GlassPanel>
      ) : null}

      {latestRawBundle?.marketNews?.news?.length ? (
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">📰 市场新闻</div>
          <div className="space-y-3">
            {latestRawBundle.marketNews.news.slice(0, 10).map((item) => (
              <div
                key={`${item.source}-${item.title}`}
                className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.title}
                </div>
                {item.summary ? (
                  <div className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                    {item.summary}
                  </div>
                ) : null}
                <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  {item.source}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      ) : null}

      {latestRawBundle?.rss?.length ? (
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">📰 新闻源</div>
          <div className="space-y-4">
            {latestRawBundle.rss.map((source) => (
              <div key={source.name}>
                <div className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {source.name}
                  {source.error ? (
                    <span className="ml-2 text-xs text-rose-500">{source.error}</span>
                  ) : null}
                </div>
                {source.items?.length ? (
                  <div className="space-y-2 border-l-2 border-slate-200 pl-4 dark:border-white/10">
                    {source.items.slice(0, 5).map((item) => (
                      <div key={item.link} className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : !source.error ? (
                  <div className="text-xs text-slate-400">暂无数据</div>
                ) : null}
              </div>
            ))}
          </div>
        </GlassPanel>
      ) : null}

      {latestRawBundle ? (
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">📦 原始 JSON</div>
          <pre className="max-h-[420px] overflow-auto rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
            {JSON.stringify(latestRawBundle, null, 2)}
          </pre>
        </GlassPanel>
      ) : null}
    </div>
  );
}
