"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TaskStatus = "active" | "recurring" | "done";

type Task = {
  id: string;
  title: string;
  detail: string;
  source: "feishu" | "webchat" | string;
  scheduleText: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

// Status columns config
const columns: { id: TaskStatus; title: string; icon: string; color: string; bg: string }[] = [
  { id: "active", title: "进行中", icon: "🚀", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { id: "recurring", title: "周期任务", icon: "🔄", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { id: "done", title: "已完成", icon: "✅", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
];

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
}

function formatRelativeTime(date: string) {
  try {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return "已过期";
    if (hours < 1) return "即将到期";
    if (hours < 24) return `${hours}h`;
    if (days === 1) return "明天";
    if (days < 7) return `${days}天`;
    return formatDate(date);
  } catch {
    return null;
  }
}

function TaskCard({ task, onStatusChange, onDelete }: { 
  task: Task; 
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const nextRemind = task.scheduleText ? formatRelativeTime(task.scheduleText) : null;

  const handleDelete = async () => {
    if (!confirm("确定删除这个任务？")) return;
    setIsDeleting(true);
    await onDelete(task.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-slate-100 line-clamp-2">{task.title}</h3>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Detail */}
      {task.detail && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{task.detail}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-3">
        {task.source === "feishu" && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
            飞书
          </span>
        )}
        {task.scheduleText && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
            ⏰ {task.scheduleText}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <span className="text-xs text-slate-500">{formatDate(task.createdAt)}</span>
        
        {/* Quick Actions */}
        <div className="flex gap-1">
          {task.status !== "active" && (
            <button
              onClick={() => onStatusChange(task.id, "active")}
              className="p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 transition-colors"
              title="标记进行中"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </button>
          )}
          {task.status !== "recurring" && (
            <button
              onClick={() => onStatusChange(task.id, "recurring")}
              className="p-1.5 rounded-lg hover:bg-purple-500/20 text-slate-500 hover:text-purple-400 transition-colors"
              title="标记周期"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {task.status !== "done" && (
            <button
              onClick={() => onStatusChange(task.id, "done")}
              className="p-1.5 rounded-lg hover:bg-green-500/20 text-slate-500 hover:text-green-400 transition-colors"
              title="标记完成"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status indicator */}
      {nextRemind && task.status !== "done" && (
        <div className="absolute -top-1 -right-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/30">
          {nextRemind}
        </div>
      )}
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
      status: "active",
    });
    setTitle("");
    setDetail("");
    setScheduleText("");
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

function EmptyColumn({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <span className="text-4xl mb-2">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function WorklogPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const groupedTasks = {
    active: tasks.filter((t) => t.status === "active"),
    recurring: tasks.filter((t) => t.status === "recurring"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const stats = {
    total: tasks.length,
    active: groupedTasks.active.length,
    recurring: groupedTasks.recurring.length,
    done: groupedTasks.done.length,
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl">
                📌
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">对话提醒</h1>
                <p className="text-xs text-slate-500">管理你的周期性任务</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800">
                <span className="text-xs text-slate-400">{stats.total} 任务</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-xs text-blue-400">{stats.active} 进行中</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-xs text-purple-400">{stats.recurring} 周期</span>
              </div>

              <button
                onClick={loadTasks}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="刷新"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">新建任务</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
                <div className="h-5 w-24 bg-slate-800 rounded mb-4" />
                <div className="h-24 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-5xl mb-6">
              📋
            </div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">还没有任务</h2>
            <p className="text-slate-500 mb-6">点击右上角按钮创建你的第一个任务</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              创建任务
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className={`flex items-center justify-between mb-3 px-1`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{column.icon}</span>
                    <span className={`font-medium ${column.color}`}>{column.title}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                      {groupedTasks[column.id].length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className={`flex-1 rounded-2xl ${column.bg} border p-3 min-h-[200px]`}>
                  {groupedTasks[column.id].length === 0 ? (
                    <EmptyColumn icon="📭" message="暂无任务" />
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {groupedTasks[column.id].map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
      <footer className="relative z-10 border-t border-slate-800/50 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-600">
          对话提醒 · 由 OpenClaw 驱动
        </div>
      </footer>
    </div>
  );
}
