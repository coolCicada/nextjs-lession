"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type TaskStatus = "active" | "recurring" | "done" | "canceled";

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
const statusConfig: Record<TaskStatus, { dot: string; bg: string; text: string }> = {
  active: { dot: "bg-sky-400", bg: "bg-sky-50", text: "text-sky-600" },
  recurring: { dot: "bg-violet-400", bg: "bg-violet-50", text: "text-violet-600" },
  done: { dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-600" },
  canceled: { dot: "bg-slate-300", bg: "bg-slate-50", text: "text-slate-500" },
};

function formatTime(date: string | undefined): string {
  if (!date) return "";
  try {
    const d = new Date(date);
    const now = new Date();
    const beijingNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
    const beijingTarget = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
    const today = new Date(beijingNow.getFullYear(), beijingNow.getMonth(), beijingNow.getDate());
    const targetDay = new Date(beijingTarget.getFullYear(), beijingTarget.getMonth(), beijingTarget.getDate());
    const diff = Math.floor((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const timeStr = d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" });
    
    if (diff === 0) return `今天 ${timeStr}`;
    if (diff === 1) return `明天 ${timeStr}`;
    if (diff === -1) return `昨天 ${timeStr}`;
    if (diff > 0 && diff < 7) return `${diff}天后`;
    if (diff < 0 && diff > -7) return `${Math.abs(diff)}天前`;
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", timeZone: "Asia/Shanghai" });
  } catch {
    return "";
  }
}

function getPriority(date: string | undefined, status: TaskStatus): number {
  if (status === "done" || status === "canceled") return 999;
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
  const isDone = task.status === "done" || task.status === "canceled";
  const isExpired = task.nextRunAt && new Date(task.nextRunAt) < new Date() && !isDone;
  const config = statusConfig[task.status];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`group flex items-start gap-4 py-4 ${isFirst ? "" : "border-t border-slate-100"}`}
    >
      {/* 状态点 */}
      <div className={`mt-2 w-2.5 h-2.5 rounded-full ${config.dot} ${isExpired ? "ring-4 ring-rose-100" : ""}`} />
      
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] leading-relaxed ${isDone ? "text-slate-400 line-through" : "text-slate-700"}`}>
          {task.title}
        </p>
        {timeStr && !isDone && (
          <p className={`text-xs mt-1.5 font-medium ${isExpired ? "text-rose-500" : "text-slate-400"}`}>
            {timeStr}
          </p>
        )}
      </div>
      
      {/* 来源标签 */}
      {task.source === "feishu" && (
        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full mt-1">飞书</span>
      )}
    </motion.div>
  );
}

export default function WorklogPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "done" | "all">("upcoming");

  useEffect(() => {
    fetch("/worklog/api/tasks", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = tasks;
    if (filter === "upcoming") {
      result = tasks.filter(t => t.status === "active" || t.status === "recurring");
    } else if (filter === "done") {
      result = tasks.filter(t => t.status === "done" || t.status === "canceled");
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

  const stats = useMemo(() => ({
    today: tasks.filter(t => {
      if (!t.nextRunAt || t.status !== "active") return false;
      const d = new Date(t.nextRunAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
    expired: tasks.filter(t => {
      if (!t.nextRunAt || t.status !== "active") return false;
      return new Date(t.nextRunAt) < new Date();
    }).length,
  }), [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <span className="text-slate-400 text-sm">加载中</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 text-slate-600">
      {/* 柔和背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-sky-200/30 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 -left-20 w-[300px] h-[300px] bg-violet-200/30 rounded-full blur-[60px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-200">
                ←
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">待办</h1>
                {stats.today > 0 ? (
                  <p className="text-xs text-amber-500 mt-0.5">{stats.today} 个今天</p>
                ) : stats.expired > 0 ? (
                  <p className="text-xs text-rose-500 mt-0.5">{stats.expired} 个已过期</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">{filtered.length} 个任务</p>
                )}
              </div>
            </div>
            
            {/* Filter */}
            <div className="flex bg-slate-100 rounded-full p-1">
              <button 
                onClick={() => setFilter("upcoming")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === "upcoming" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                待办
              </button>
              <button 
                onClick={() => setFilter("done")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === "done" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                已完成
              </button>
              <button 
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === "all" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                全部
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* List */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-2xl">◌</div>
            <p className="text-slate-400">没有任务</p>
            <p className="text-xs text-slate-300 mt-2">对话中发送 #sync-to-log 同步</p>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm">
            <div className="px-5 py-2">
              {filtered.map((task, i) => (
                <TaskItem key={task.id} task={task} isFirst={i === 0} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-6 py-8 text-center">
        <p className="text-[11px] text-slate-400">
          对话操作：完成 / 删除 / #sync-to-log
        </p>
      </footer>
    </div>
  );
}
