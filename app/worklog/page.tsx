"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

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

// 极简色彩
const statusDot: Record<TaskStatus, string> = {
  active: "bg-blue-400",
  recurring: "bg-purple-400", 
  done: "bg-emerald-400",
  canceled: "bg-slate-600",
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
  if (diff < 0) return 0; // 已过期最高优先级
  if (diff < 24 * 60 * 60 * 1000) return 1; // 24小时内
  if (diff < 7 * 24 * 60 * 60 * 1000) return 2; // 一周内
  return 3;
}

function TaskItem({ task, isFirst }: { task: Task; isFirst?: boolean }) {
  const timeStr = formatTime(task.nextRunAt);
  const isDone = task.status === "done" || task.status === "canceled";
  const isExpired = task.nextRunAt && new Date(task.nextRunAt) < new Date() && !isDone;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`group flex items-start gap-4 py-4 ${isFirst ? "" : "border-t border-slate-800/50"}`}
    >
      {/* 状态点 */}
      <div className={`mt-2 w-2 h-2 rounded-full ${statusDot[task.status]} ${isExpired ? "ring-2 ring-red-400/30" : ""}`} />
      
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] leading-relaxed ${isDone ? "text-slate-600 line-through" : "text-slate-300"}`}>
          {task.title}
        </p>
        {timeStr && !isDone && (
          <p className={`text-xs mt-1 ${isExpired ? "text-red-400" : "text-slate-500"}`}>
            {timeStr}
          </p>
        )}
      </div>
      
      {/* 来源标签 */}
      {task.source === "feishu" && (
        <span className="text-[10px] text-slate-600 uppercase tracking-wider mt-1">飞书</span>
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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <span className="text-slate-600 text-sm">加载中</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-400 font-light">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-slate-800/30">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extralight text-slate-200 tracking-tight">待办</h1>
              {stats.today > 0 ? (
                <p className="text-xs text-amber-500/80 mt-1">{stats.today} 个今天</p>
              ) : stats.expired > 0 ? (
                <p className="text-xs text-red-400/80 mt-1">{stats.expired} 个已过期</p>
              ) : (
                <p className="text-xs text-slate-600 mt-1">{filtered.length} 个任务</p>
              )}
            </div>
            
            {/* Filter */}
            <div className="flex text-xs gap-4">
              <button 
                onClick={() => setFilter("upcoming")}
                className={filter === "upcoming" ? "text-slate-200" : "text-slate-600 hover:text-slate-400"}
              >
                待办
              </button>
              <button 
                onClick={() => setFilter("done")}
                className={filter === "done" ? "text-slate-200" : "text-slate-600 hover:text-slate-400"}
              >
                已完成
              </button>
              <button 
                onClick={() => setFilter("all")}
                className={filter === "all" ? "text-slate-200" : "text-slate-600 hover:text-slate-400"}
              >
                全部
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* List */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-700">
            <p className="text-3xl mb-3 opacity-30">◌</p>
            <p className="text-sm">没有任务</p>
            <p className="text-xs mt-3 opacity-50">对话中发送 #sync-to-log 同步</p>
          </div>
        ) : (
          <div>
            {filtered.map((task, i) => (
              <TaskItem key={task.id} task={task} isFirst={i === 0} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-6 py-8 text-center">
        <p className="text-[11px] text-slate-700">
          对话操作：完成 / 删除 / #sync-to-log
        </p>
      </footer>
    </div>
  );
}
