'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TaskStatus = 'active' | 'recurring' | 'done' | 'canceled';

interface Task {
  id: string;
  title: string;
  detail: string;
  source: string;
  scheduleText: string;
  status: TaskStatus;
  nextRunAt?: string;
  createdAt: string;
}

// 柔和色彩
const statusConfig: Record<
  TaskStatus,
  { dot: string; bg: string; text: string }
> = {
  active: { dot: 'bg-sky-400', bg: 'bg-sky-50', text: 'text-sky-600' },
  recurring: {
    dot: 'bg-violet-400',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
  },
  done: {
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  canceled: { dot: 'bg-slate-300', bg: 'bg-slate-50', text: 'text-slate-500' },
};

function formatTime(date: string | undefined): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    const now = new Date();
    const beijingNow = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }),
    );
    const beijingTarget = new Date(
      d.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }),
    );
    const today = new Date(
      beijingNow.getFullYear(),
      beijingNow.getMonth(),
      beijingNow.getDate(),
    );
    const targetDay = new Date(
      beijingTarget.getFullYear(),
      beijingTarget.getMonth(),
      beijingTarget.getDate(),
    );
    const diff = Math.floor(
      (targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    const timeStr = d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai',
    });

    if (diff === 0) return `今天 ${timeStr}`;
    if (diff === 1) return `明天 ${timeStr}`;
    if (diff === -1) return `昨天 ${timeStr}`;
    if (diff > 0 && diff < 7) return `${diff}天后`;
    if (diff < 0 && diff > -7) return `${Math.abs(diff)}天前`;
    return d.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Shanghai',
    });
  } catch {
    return '';
  }
}

function getPriority(date: string | undefined, status: TaskStatus): number {
  if (status === 'done' || status === 'canceled') return 999;
  if (!date) return 100;
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return 0;
  if (diff < 24 * 60 * 60 * 1000) return 1;
  if (diff < 7 * 24 * 60 * 60 * 1000) return 2;
  return 3;
}

function TaskItem({ task, isFirst }: { task: Task; isFirst?: boolean }) {
  const timeStr = formatTime(task.nextRunAt);
  const isDone = task.status === 'done' || task.status === 'canceled';
  const isExpired =
    task.nextRunAt && new Date(task.nextRunAt) < new Date() && !isDone;
  const config = statusConfig[task.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`group flex items-start gap-4 py-4 ${isFirst ? '' : 'border-t border-slate-100'}`}
    >
      {/* 状态点 */}
      <div
        className={`mt-2 h-2.5 w-2.5 rounded-full ${config.dot} ${isExpired ? 'ring-4 ring-rose-100' : ''}`}
      />

      {/* 内容 */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-[15px] leading-relaxed ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}
        >
          {task.title}
        </p>
        {timeStr && !isDone && (
          <p
            className={`mt-1.5 text-xs font-medium ${isExpired ? 'text-rose-500' : 'text-slate-400'}`}
          >
            {timeStr}
          </p>
        )}
      </div>

      {/* 来源标签 */}
      {task.source === 'feishu' && (
        <span className="mt-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-400">
          飞书
        </span>
      )}
    </motion.div>
  );
}

export default function WorklogPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'done' | 'all'>('upcoming');
  const [user, setUser] = useState<string | null>(null);

  function clearAuth() {
    localStorage.removeItem('worklog_token');
    localStorage.removeItem('worklog_user');
  }

  function handleLogout() {
    clearAuth();
    router.push('/worklog/login');
  }

  // 检查登录态
  useEffect(() => {
    const token = localStorage.getItem('worklog_token');
    const username = localStorage.getItem('worklog_user');
    if (!token) {
      router.push('/worklog/login');
      return;
    }
    setUser(username);
  }, [router]);

  // 加载数据
  useEffect(() => {
    const token = localStorage.getItem('worklog_token');
    if (!token) return;

    setError(null);
    fetch('/worklog/api/tasks', {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          clearAuth();
          router.push('/worklog/login');
          return null;
        }
        const data = await r.json().catch(() => null);
        if (!r.ok) {
          throw new Error(
            typeof data?.error === 'string' ? data.error : '任务加载失败',
          );
        }
        return data;
      })
      .then((data) => {
        if (!data) return;
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setTasks([]);
        setError(err instanceof Error ? err.message : '任务加载失败');
        setLoading(false);
      });
  }, [router]);

  const filtered = useMemo(() => {
    let result = tasks;
    if (filter === 'upcoming') {
      result = tasks.filter(
        (t) => t.status === 'active' || t.status === 'recurring',
      );
    } else if (filter === 'done') {
      result = tasks.filter(
        (t) => t.status === 'done' || t.status === 'canceled',
      );
    }

    return result.sort((a, b) => {
      const pa = getPriority(a.nextRunAt, a.status);
      const pb = getPriority(b.nextRunAt, b.status);
      if (pa !== pb) return pa - pb;

      const ta = a.nextRunAt ? new Date(a.nextRunAt).getTime() : Infinity;
      const tb = b.nextRunAt ? new Date(b.nextRunAt).getTime() : Infinity;
      return ta - tb;
    });
  }, [tasks, filter]);

  const stats = useMemo(
    () => ({
      today: tasks.filter((t) => {
        if (!t.nextRunAt || t.status !== 'active') return false;
        const d = new Date(t.nextRunAt);
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }).length,
      expired: tasks.filter((t) => {
        if (!t.nextRunAt || t.status !== 'active') return false;
        return new Date(t.nextRunAt) < new Date();
      }).length,
    }),
    [tasks],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-gray-50">
        <span className="text-sm text-slate-400">加载中</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 text-slate-600">
      {/* 柔和背景 */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-sky-200/30 blur-[80px]" />
        <div className="absolute -left-20 top-1/2 h-[300px] w-[300px] rounded-full bg-violet-200/30 blur-[60px]" />
      </div>

      {/* Header */}
      <header className="relative sticky top-0 z-10 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-200"
              >
                ←
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">待办</h1>
                {stats.today > 0 ? (
                  <p className="mt-0.5 text-xs text-amber-500">
                    {stats.today} 个今天
                  </p>
                ) : stats.expired > 0 ? (
                  <p className="mt-0.5 text-xs text-rose-500">
                    {stats.expired} 个已过期
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-400">
                    {filtered.length} 个任务
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500 sm:inline-flex">
                  {user}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              >
                退出
              </button>
              <div className="flex rounded-full bg-slate-100 p-1">
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${filter === 'upcoming' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  待办
                </button>
                <button
                  onClick={() => setFilter('done')}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${filter === 'done' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  已完成
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${filter === 'all' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  全部
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* List */}
      <main className="relative z-10 mx-auto max-w-2xl px-6 py-8">
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              ◌
            </div>
            <p className="text-slate-400">没有任务</p>
            <p className="mt-2 text-xs text-slate-300">
              对话中发送 #sync-to-log 同步
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/50 bg-white/60 shadow-sm backdrop-blur-sm">
            <div className="px-5 py-2">
              {filtered.map((task, i) => (
                <TaskItem key={task.id} task={task} isFirst={i === 0} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-2xl px-6 py-8 text-center">
        <p className="text-[11px] text-slate-400">
          对话操作：完成 / 删除 / #sync-to-log
        </p>
      </footer>
    </div>
  );
}
