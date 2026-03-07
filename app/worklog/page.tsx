"use client";

import { useEffect, useMemo, useState } from "react";

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
  nextRemindAt?: string;
};

function statusConfig(status: TaskStatus) {
  if (status === "active") {
    return { label: "进行中", cls: "bg-blue-100 text-blue-700 border-blue-200" };
  }
  if (status === "recurring") {
    return { label: "周期规则", cls: "bg-purple-100 text-purple-700 border-purple-200" };
  }
  return { label: "已完成", cls: "bg-slate-100 text-slate-500 border-slate-200" };
}

function sourceLabel(source: Task["source"]) {
  if (source === "feishu") return "飞书对话";
  if (source === "webchat") return "网页对话";
  return source;
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
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
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diff < 0) return "已过期";
    if (days === 0) return `${hours}小时后`;
    if (days === 1) return "明天";
    if (days < 7) return `${days}天后`;
    return formatDate(date);
  } catch {
    return "--";
  }
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
        <div className="h-5 w-16 bg-slate-200 rounded"></div>
      </div>
      <div className="mt-3 h-4 w-full bg-slate-100 rounded"></div>
      <div className="mt-2 h-4 w-2/3 bg-slate-100 rounded"></div>
      <div className="mt-3 flex gap-2">
        <div className="h-6 w-20 bg-slate-100 rounded"></div>
        <div className="h-6 w-20 bg-slate-100 rounded"></div>
        <div className="h-6 w-20 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
}

function EmptyState({ onInit }: { onInit: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无待办任务</h3>
      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
下方按钮        点击初始化数据表，然后就可以开始添加对话提醒任务了
      </p>
      <button
        onClick={onInit}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-black transition-colors font-medium"
      >
        <span>🚀</span>
        初始化数据表
      </button>
    </div>
  );
}

function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange: (id: string, status: TaskStatus) => Promise<void> }) {
  const status = statusConfig(task.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    await onStatusChange(task.id, newStatus);
    setIsUpdating(false);
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-slate-900 font-semibold flex-1">{task.title}</h3>
        <span className={`text-xs px-2 py-1 rounded font-medium ${status.cls}`}>{status.label}</span>
      </div>

      {task.detail && <div className="mt-2 text-sm text-slate-600 line-clamp-2">{task.detail}</div>}

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-slate-600">
          {sourceLabel(task.source)}
        </span>
        {task.scheduleText && (
          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-slate-600">
            📅 {task.scheduleText}
          </span>
        )}
        {task.nextRemindAt && task.status !== "done" && (
          <span className="inline-flex items-center rounded bg-amber-50 px-2 py-1 text-amber-700">
            ⏰ {formatRelativeTime(task.nextRemindAt)}
          </span>
        )}
        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-slate-500">
          🕒 {formatDate(task.createdAt)}
        </span>
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        <button
          onClick={() => handleStatusChange("active")}
          disabled={isUpdating || task.status === "active"}
          className="text-xs px-2.5 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          进行中
        </button>
        <button
          onClick={() => handleStatusChange("recurring")}
          disabled={isUpdating || task.status === "recurring"}
          className="text-xs px-2.5 py-1.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          周期
        </button>
        <button
          onClick={() => handleStatusChange("done")}
          disabled={isUpdating || task.status === "done"}
          className="text-xs px-2.5 py-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          完成
        </button>
      </div>
    </article>
  );
}

export default function WorklogV3Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [isInitializing, setIsInitializing] = useState(false);

  const loadTasks = async () => {
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
  };

  const handleInit = async () => {
    setIsInitializing(true);
    try {
      const res = await fetch("/worklog/api/init", { method: "POST" });
      if (!res.ok) throw new Error("初始化失败");
      await loadTasks();
    } catch (e) {
      console.error(e);
      setError("初始化失败，请重试");
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onStatusChange = async (id: string, status: TaskStatus) => {
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

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.detail.toLowerCase().includes(query) ||
          t.scheduleText?.toLowerCase().includes(query)
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }
    
    return filtered;
  }, [tasks, searchQuery, filterStatus]);

  const grouped = useMemo(() => {
    const active = filteredTasks.filter((t) => t.status === "active");
    const recurring = filteredTasks.filter((t) => t.status === "recurring");
    const done = filteredTasks.filter((t) => t.status === "done");
    return { active, recurring, done };
  }, [filteredTasks]);

  const totalCount = tasks.length;
  const activeCount = grouped.active.length;
  const recurringCount = grouped.recurring.length;
  const doneCount = grouped.done.length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-3 md:px-8">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">📌 对话提醒总览</h1>
              <p className="text-slate-500 text-sm mt-1">管理你的周期性对话提醒任务</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadTasks}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-black transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新
              </button>
              <button
                onClick={handleInit}
                disabled={isInitializing}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                {isInitializing ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span>⚡</span>
                )}
                初始化
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索任务标题、详情..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
              />
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {(["all", "active", "recurring", "done"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filterStatus === status
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {status === "all" ? "全部" : statusConfig(status).label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mt-3 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mt-4 text-sm">
            <div className="rounded-xl bg-slate-100 p-3">
              <div className="text-slate-500 text-xs">总计</div>
              <div className="text-xl font-bold text-slate-900">{totalCount}</div>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <div className="text-blue-600 text-xs">进行中</div>
              <div className="text-xl font-bold text-blue-800">{activeCount}</div>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <div className="text-purple-600 text-xs">周期规则</div>
              <div className="text-xl font-bold text-purple-800">{recurringCount}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-slate-500 text-xs">已完成</div>
              <div className="text-xl font-bold text-slate-600">{doneCount}</div>
            </div>
          </div>
        </section>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <EmptyState onInit={handleInit} />
          </section>
        ) : filteredTasks.length === 0 ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-slate-500">没有找到匹配的任务</p>
              <button
                onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}
                className="mt-3 text-sm text-slate-600 hover:text-slate-900 underline"
              >
                清除筛选
              </button>
            </div>
          </section>
        ) : (
          <>
            {grouped.active.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <span>🚀</span> 进行中
                  <span className="text-xs font-normal text-slate-400">({grouped.active.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {grouped.active.map((task) => (
                    <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
                  ))}
                </div>
              </section>
            )}

            {grouped.recurring.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <span>🔁</span> 周期规则
                  <span className="text-xs font-normal text-slate-400">({grouped.recurring.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {grouped.recurring.map((task) => (
                    <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
                  ))}
                </div>
              </section>
            )}

            {grouped.done.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <span>✅</span> 已完成
                  <span className="text-xs font-normal text-slate-400">({grouped.done.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {grouped.done.map((task) => (
                    <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
