"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TaskStatus = "active" | "recurring" | "done" | "canceled";

type Task = {
  id: string;
  title: string;
  detail: string;
  source: "feishu" | "webchat" | string;
  scheduleText: string;
  status: TaskStatus;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
};

// 视图模式
type ViewMode = "kanban" | "timeline";

// 时间分组
type TimeGroup = {
  key: string;
  label: string;
  tasks: Task[];
};

function formatDate(date: string | undefined, withTime = true) {
  if (!date) return "--";
  try {
    const d = new Date(date);
    if (withTime) {
      return d.toLocaleString("zh-CN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  } catch {
    return "--";
  }
}

function getRelativeTimeGroup(date: string | undefined): string {
  if (!date) return "未安排";
  try {
    const now = new Date();
    const target = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    
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

function formatTimeLeft(date: string | undefined): string | null {
  if (!date) return null;
  try {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) return "已过期";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return "即将开始";
    if (hours < 24) return `${hours}小时后`;
    if (days === 1) return "明天";
    return `${days}天后`;
  } catch {
    return null;
  }
}

// 状态配置
const statusConfig: Record<TaskStatus, { label: string; icon: string; color: string; bg: string; border: string }> = {
  active: { 
    label: "进行中", 
    icon: "🚀", 
    color: "text-blue-400", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/20" 
  },
  recurring: { 
    label: "周期任务", 
    icon: "🔄", 
    color: "text-purple-400", 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/20" 
  },
  done: { 
    label: "已完成", 
    icon: "✅", 
    color: "text-green-400", 
    bg: "bg-green-500/10", 
    border: "border-green-500/20" 
  },
  canceled: { 
    label: "已取消", 
    icon: "🚫", 
    color: "text-gray-400", 
    bg: "bg-gray-500/10", 
    border: "border-gray-500/20" 
  },
};

// 看板列配置
const kanbanColumns: { id: Exclude<TaskStatus, "canceled">; title: string }[] = [
  { id: "active", title: "进行中" },
  { id: "recurring", title: "周期任务" },
  { id: "done", title: "已完成" },
];

function TaskCard({ 
  task, 
  onStatusChange, 
  onDelete, 
  compact = false,
  showTime = true,
}: { 
  task: Task; 
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
  showTime?: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const timeLeft = formatTimeLeft(task.nextRunAt);
  const status = statusConfig[task.status];

  const handleDelete = async () => {
    if (!confirm("确定删除这个任务？")) return;
    setIsDeleting(true);
    await onDelete(task.id);
  };

  const nextStatus = (current: TaskStatus): TaskStatus => {
    const flow: Record<TaskStatus, TaskStatus> = {
      active: "done",
      recurring: "done",
      done: "active",
      canceled: "active",
    };
    return flow[current];
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative bg-slate-800/50 backdrop-blur-sm border ${status.border} rounded-xl hover:bg-slate-800/80 transition-all ${
        compact ? "p-3" : "p-4"
      } ${task.status === "canceled" ? "opacity-60" : ""}`}
    >
      {/* 状态指示器 */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r ${status.bg.replace("/10", "")}`} />
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2 pl-2">
        <h3 className={`font-medium text-slate-100 line-clamp-2 ${compact ? "text-sm" : ""}`}>
          {task.title}
        </h3>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* 时间信息 */}
      {showTime && timeLeft && task.status !== "done" && task.status !== "canceled" && (
        <div className={`pl-2 mb-2 text-xs font-medium ${
          timeLeft === "已过期" ? "text-red-400" : 
          timeLeft === "即将开始" ? "text-amber-400" : "text-blue-400"
        }`}>
          {task.nextRunAt && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(task.nextRunAt, false)} · {timeLeft}
            </span>
          )}
        </div>
      )}

      {/* Detail */}
      {!compact && task.detail && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-3 pl-2">{task.detail}</p>
      )}

      {/* Meta */}
      <div className={`flex flex-wrap gap-1.5 mb-2 pl-2 ${compact ? "text-xs" : "text-xs"}`}>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
          {status.icon} {status.label}
        </span>
        {task.source === "feishu" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300">
            飞书
          </span>
        )}
        {task.scheduleText && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 truncate max-w-[120px]">
            ⏰ {task.scheduleText}
          </span>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/30 pl-2">
        <span className="text-xs text-slate-500">{formatDate(task.createdAt, false)}</span>
        
        <div className="flex gap-1">
          {/* 主状态切换按钮 */}
          <button
            onClick={() => onStatusChange(task.id, nextStatus(task.status))}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              task.status === "done" || task.status === "canceled"
                ? "hover:bg-blue-500/20 text-slate-500 hover:text-blue-400"
                : "hover:bg-green-500/20 text-slate-500 hover:text-green-400"
            }`}
            title={task.status === "done" || task.status === "canceled" ? "重新激活" : "标记完成"}
          >
            {task.status === "done" || task.status === "canceled" ? "↺ 重做" : "✓ 完成"}
          </button>
          
          {/* 周期任务切换 */}
          {task.status !== "recurring" && task.status !== "canceled" && (
            <button
              onClick={() => onStatusChange(task.id, "recurring")}
              className="px-2 py-1 rounded-lg text-xs font-medium hover:bg-purple-500/20 text-slate-500 hover:text-purple-400 transition-colors"
              title="标记为周期任务"
            >
              🔄
            </button>
          )}
          
          {/* 取消按钮 */}
          {task.status !== "canceled" && task.status !== "done" && (
            <button
              onClick={() => onStatusChange(task.id, "canceled")}
              className="px-2 py-1 rounded-lg text-xs font-medium hover:bg-gray-500/20 text-slate-500 hover:text-gray-400 transition-colors"
              title="取消任务"
            >
              🚫
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AddTaskModal({ isOpen, onClose, onAdd }: { 
  isOpen: boolean; 
  onClose: () => void;
  onAdd: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [scheduleText, setScheduleText] = useState("");
  const [nextRunAt, setNextRunAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    await onAdd({
      title: title.trim(),
      detail: detail.trim(),
      source: "webchat",
      scheduleText: scheduleText.trim(),
      nextRunAt: nextRunAt || undefined,
      status: "active",
    });
    setTitle("");
    setDetail("");
    setScheduleText("");
    setNextRunAt("");
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold text-slate-100 mb-4">✨ 新建任务</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">任务标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入任务标题..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">详细描述</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="补充详细信息（可选）..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">周期提醒</label>
              <input
                type="text"
                value={scheduleText}
                onChange={(e) => setScheduleText(e.target.value)}
                placeholder="例如: 每周一 9:00"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">下次执行时间</label>
              <input
                type="datetime-local"
                value={nextRunAt}
                onChange={(e) => setNextRunAt(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "创建中..." : "创建任务"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function EmptyState({ icon, message, action }: { icon: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <span className="text-5xl mb-3">{icon}</span>
      <p className="text-sm mb-4">{message}</p>
      {action}
    </div>
  );
}

export default function WorklogPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/worklog/api/tasks", { cache: "no-store" });
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setTasks(data);
      setError("");
    } catch (e) {
      console.error(e);
      setError("加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      const res = await fetch("/worklog/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("更新失败");
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (e) {
      console.error(e);
      setError("状态更新失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/worklog/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("删除失败");
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
      setError("删除失败");
    }
  };

  const handleAddTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    try {
      const res = await fetch("/worklog/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error("创建失败");
      const newTask = await res.json();
      setTasks((prev) => [newTask, ...prev]);
    } catch (e) {
      console.error(e);
      setError("创建失败");
    }
  };

  // 过滤和搜索
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((t) => 
        t.title.toLowerCase().includes(query) ||
        t.detail.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [tasks, statusFilter, searchQuery]);

  // 看板分组
  const kanbanTasks = useMemo(() => ({
    active: filteredTasks
      .filter((t) => t.status === "active")
      .sort((a, b) => {
        // 按 nextRunAt 从近到远排列，无时间的放最后
        const timeA = a.nextRunAt ? new Date(a.nextRunAt).getTime() : Infinity;
        const timeB = b.nextRunAt ? new Date(b.nextRunAt).getTime() : Infinity;
        return timeA - timeB;
      }),
    recurring: filteredTasks.filter((t) => t.status === "recurring"),
    done: filteredTasks.filter((t) => t.status === "done"),
  }), [filteredTasks]);

  // 时间线分组
  const timelineGroups = useMemo((): TimeGroup[] => {
    const groups: Record<string, Task[]> = {
      "已过期": [],
      "今天": [],
      "明天": [],
      "本周": [],
      "未来": [],
      "远期": [],
      "未安排": [],
    };
    
    filteredTasks.forEach((task) => {
      const group = getRelativeTimeGroup(task.nextRunAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(task);
    });
    
    // 按 nextRunAt 排序每个组内的任务
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        const timeA = a.nextRunAt ? new Date(a.nextRunAt).getTime() : Infinity;
        const timeB = b.nextRunAt ? new Date(b.nextRunAt).getTime() : Infinity;
        return timeA - timeB;
      });
    });
    
    return [
      { key: "已过期", label: "⚠️ 已过期", tasks: groups["已过期"] },
      { key: "今天", label: "📅 今天", tasks: groups["今天"] },
      { key: "明天", label: "🔜 明天", tasks: groups["明天"] },
      { key: "本周", label: "📆 本周", tasks: groups["本周"] },
      { key: "未来", label: "🔮 未来", tasks: groups["未来"] },
      { key: "远期", label: "🗓️ 远期", tasks: groups["远期"] },
      { key: "未安排", label: "📝 未安排时间", tasks: groups["未安排"] },
    ].filter((g) => g.tasks.length > 0);
  }, [filteredTasks]);

  // 统计
  const stats = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter((t) => t.status === "active").length,
    recurring: tasks.filter((t) => t.status === "recurring").length,
    done: tasks.filter((t) => t.status === "done").length,
    canceled: tasks.filter((t) => t.status === "canceled").length,
    expired: tasks.filter((t) => {
      if (!t.nextRunAt || t.status === "done" || t.status === "canceled") return false;
      return new Date(t.nextRunAt) < new Date();
    }).length,
  }), [tasks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm sticky top-0 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl">
                📌
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">对话提醒</h1>
                <p className="text-xs text-slate-500">
                  {stats.total} 个任务 · {stats.active} 进行中 · {stats.expired > 0 && (
                    <span className="text-red-400">{stats.expired} 已过期</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* 视图切换 */}
              <div className="flex bg-slate-900 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "timeline" 
                      ? "bg-slate-700 text-slate-100" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ⏱️ 时间线
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "kanban" 
                      ? "bg-slate-700 text-slate-100" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📋 看板
                </button>
              </div>

              {/* 刷新 */}
              <button
                onClick={loadTasks}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="刷新"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* 新建 */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>新建</span>
              </button>
            </div>
          </div>

          {/* 搜索和筛选 */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索任务..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="active">进行中</option>
              <option value="recurring">周期任务</option>
              <option value="done">已完成</option>
              <option value="canceled">已取消</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
                <div className="h-4 w-3/4 bg-slate-800 rounded mb-3" />
                <div className="h-3 w-1/2 bg-slate-800 rounded mb-4" />
                <div className="h-20 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState 
            icon="📋" 
            message={searchQuery ? "没有找到匹配的任务" : "还没有任务"}
            action={!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                创建第一个任务
              </button>
            )}
          />
        ) : viewMode === "timeline" ? (
          /* 时间线视图 */
          <div className="space-y-6">
            {timelineGroups.map((group) => (
              <motion.section 
                key={group.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <div className="flex items-center gap-3 mb-3 sticky top-20 z-10">
                  <h2 className={`text-lg font-semibold ${
                    group.key === "已过期" ? "text-red-400" :
                    group.key === "今天" ? "text-amber-400" :
                    group.key === "明天" ? "text-blue-400" :
                    "text-slate-300"
                  }`}>
                    {group.label}
                  </h2>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400">
                    {group.tasks.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {group.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        compact
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            ))}
          </div>
        ) : (
          /* 看板视图 */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kanbanColumns.map((column) => {
              const config = statusConfig[column.id];
              return (
                <div key={column.id} className="flex flex-col">
                  <div className={`flex items-center gap-2 mb-3 px-1`}>
                    <span className="text-lg">{config.icon}</span>
                    <span className={`font-medium ${config.color}`}>{column.title}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                      {kanbanTasks[column.id].length}
                    </span>
                  </div>

                  <div className={`flex-1 rounded-2xl ${config.bg} ${config.border} border p-3 min-h-[200px]`}>
                    {kanbanTasks[column.id].length === 0 ? (
                      <EmptyState icon="📭" message="暂无任务" />
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                          {kanbanTasks[column.id].map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onStatusChange={handleStatusChange}
                              onDelete={handleDelete}
                              showTime={false}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTask}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-600">
          <p>对话提醒 · 由 OpenClaw 驱动</p>
          <p className="mt-1">输入 #sync-to-log 手动同步飞书任务</p>
        </div>
      </footer>
    </div>
  );
}
