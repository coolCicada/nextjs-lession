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

type ViewMode = "timeline" | "kanban";

// 状态配置
const statusConfig: Record<TaskStatus, { label: string; icon: string; color: string; bg: string; border: string }> = {
  active: { label: "进行中", icon: "◐", color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/10" },
  recurring: { label: "周期", icon: "◑", color: "text-purple-400", bg: "bg-purple-500/5", border: "border-purple-500/10" },
  done: { label: "已完成", icon: "●", color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
  canceled: { label: "已取消", icon: "○", color: "text-slate-500", bg: "bg-slate-500/5", border: "border-slate-500/10" },
};

function formatDate(date: string | undefined): string {
  if (!date) return "";
  try {
    const d = new Date(date);
    return d.toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getTimeGroup(date: string | undefined): string {
  if (!date) return "未安排";
  try {
    const now = new Date();
    const target = new Date(date);
    const beijingNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
    const beijingTarget = new Date(target.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
    const today = new Date(beijingNow.getFullYear(), beijingNow.getMonth(), beijingNow.getDate());
    const targetDay = new Date(beijingTarget.getFullYear(), beijingTarget.getMonth(), beijingTarget.getDate());
    const diffDays = Math.floor((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "已过期";
    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "明天";
    if (diffDays < 7) return "本周";
    if (diffDays < 30) return "未来";
    return "远期";
  } catch {
    return "未安排";
  }
}

function TaskCard({ task, compact = false }: { task: Task; compact?: boolean }) {
  const status = statusConfig[task.status];
  const timeGroup = getTimeGroup(task.nextRunAt);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative rounded-2xl border ${status.border} ${status.bg} p-4 hover:bg-slate-800/30 transition-colors`}
    >
      {/* 状态指示条 */}
      <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-r ${status.color.replace("text-", "bg-")}`} />
      
      <div className="pl-3">
        {/* 标题 */}
        <h3 className={`font-medium leading-relaxed ${compact ? "text-sm" : "text-base"} ${task.status === "done" || task.status === "canceled" ? "text-slate-500 line-through" : "text-slate-200"}`}>
          {task.title}
        </h3>
        
        {/* 时间和标签 */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {/* 状态标签 */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
            <span className="text-[10px]">{status.icon}</span>
            {status.label}
          </span>
          
          {/* 时间信息 */}
          {task.nextRunAt && task.status !== "done" && task.status !== "canceled" && (
            <span className={`px-2 py-0.5 rounded-full ${
              timeGroup === "已过期" ? "bg-red-500/10 text-red-400" :
              timeGroup === "今天" ? "bg-amber-500/10 text-amber-400" :
              "bg-slate-700/50 text-slate-400"
            }`}>
              {timeGroup === "今天" || timeGroup === "明天" 
                ? `${timeGroup} ${formatDate(task.nextRunAt).split(" ")[1]}` 
                : formatDate(task.nextRunAt)}
            </span>
          )}
          
          {/* 来源 */}
          {task.source === "feishu" && (
            <span className="text-slate-600">飞书</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function WorklogPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("active");

  useEffect(() => {
    fetch("/worklog/api/tasks", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 过滤
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }
    return result;
  }, [tasks, statusFilter]);

  // 时间线分组
  const timelineGroups = useMemo(() => {
    const groups: Record<string, Task[]> = { "已过期": [], "今天": [], "明天": [], "本周": [], "未来": [], "远期": [], "未安排": [] };
    filteredTasks.forEach(task => {
      const group = getTimeGroup(task.nextRunAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(task);
    });
    
    // 每组内按时间排序
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const timeA = a.nextRunAt ? new Date(a.nextRunAt).getTime() : Infinity;
        const timeB = b.nextRunAt ? new Date(b.nextRunAt).getTime() : Infinity;
        return timeA - timeB;
      });
    });
    
    return [
      { key: "已过期", label: "已过期", tasks: groups["已过期"] },
      { key: "今天", label: "今天", tasks: groups["今天"] },
      { key: "明天", label: "明天", tasks: groups["明天"] },
      { key: "本周", label: "本周", tasks: groups["本周"] },
      { key: "未来", label: "未来", tasks: groups["未来"] },
      { key: "远期", label: "远期", tasks: groups["远期"] },
      { key: "未安排", label: "未安排", tasks: groups["未安排"] },
    ].filter(g => g.tasks.length > 0);
  }, [filteredTasks]);

  // 看板分组
  const kanbanGroups = useMemo(() => {
    const groups: Record<string, Task[]> = { active: [], recurring: [], done: [], canceled: [] };
    filteredTasks.forEach(task => {
      if (groups[task.status]) groups[task.status].push(task);
    });
    
    // active 按时间排序
    groups.active.sort((a, b) => {
      const timeA = a.nextRunAt ? new Date(a.nextRunAt).getTime() : Infinity;
      const timeB = b.nextRunAt ? new Date(b.nextRunAt).getTime() : Infinity;
      return timeA - timeB;
    });
    
    return [
      { id: "active", title: "进行中", tasks: groups.active },
      { id: "recurring", title: "周期", tasks: groups.recurring },
      { id: "done", title: "已完成", tasks: groups.done },
      { id: "canceled", title: "已取消", tasks: groups.canceled },
    ].filter(g => g.tasks.length > 0);
  }, [filteredTasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter(t => t.status === "active").length,
    today: tasks.filter(t => getTimeGroup(t.nextRunAt) === "今天" && t.status === "active").length,
    expired: tasks.filter(t => getTimeGroup(t.nextRunAt) === "已过期" && t.status === "active").length,
  }), [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-slate-100 tracking-tight">待办</h1>
              <p className="text-xs text-slate-500 mt-1">
                {stats.today > 0 && <span className="text-amber-400">{stats.today} 个今天</span>}
                {stats.expired > 0 && <span className="text-red-400 ml-2">{stats.expired} 个已过期</span>}
                {stats.today === 0 && stats.expired === 0 && `${stats.active} 个进行中`}
              </p>
            </div>
            
            {/* 视图切换 */}
            <div className="flex bg-slate-900 rounded-full p-1">
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${viewMode === "timeline" ? "bg-slate-700 text-slate-100" : "text-slate-500 hover:text-slate-300"}`}
              >
                时间线
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${viewMode === "kanban" ? "bg-slate-700 text-slate-100" : "text-slate-500 hover:text-slate-300"}`}
              >
                看板
              </button>
            </div>
          </div>
          
          {/* 筛选 */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {(["active", "recurring", "done", "canceled", "all"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  statusFilter === status 
                    ? "bg-slate-700 text-slate-200" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                }`}
              >
                {status === "all" ? "全部" : statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <p className="text-4xl mb-4">◌</p>
            <p className="text-sm">暂无任务</p>
            <p className="text-xs mt-2 opacity-60">对话中发送 #sync-to-log 同步飞书任务</p>
          </div>
        ) : viewMode === "timeline" ? (
          // 时间线视图
          <div className="space-y-8">
            {timelineGroups.map((group) => (
              <section key={group.key}>
                <h2 className={`text-xs font-medium tracking-wider uppercase mb-4 ${
                  group.key === "已过期" ? "text-red-400" :
                  group.key === "今天" ? "text-amber-400" :
                  "text-slate-500"
                }`}>
                  {group.label} · {group.tasks.length}
                </h2>
                <div className="space-y-2">
                  {group.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          // 看板视图
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kanbanGroups.map((group) => (
              <section key={group.id}>
                <h2 className="text-xs font-medium tracking-wider uppercase text-slate-500 mb-4">
                  {group.title} · {group.tasks.length}
                </h2>
                <div className="space-y-2">
                  {group.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} compact />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 text-center text-xs text-slate-600">
        <p>输入 #sync-to-log 同步 · 对话操作任务</p>
      </footer>
    </div>
  );
}
