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
};

function statusConfig(status: TaskStatus) {
  if (status === "active") {
    return { label: "进行中", cls: "bg-blue-100 text-blue-700" };
  }
  if (status === "recurring") {
    return { label: "周期规则", cls: "bg-purple-100 text-purple-700" };
  }
  return { label: "已完成", cls: "bg-slate-200 text-slate-700" };
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

function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange: (id: string, status: TaskStatus) => Promise<void> }) {
  const status = statusConfig(task.status);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-slate-900 font-semibold">{task.title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${status.cls}`}>{status.label}</span>
      </div>

      {task.detail && <div className="mt-2 text-sm text-slate-600">{task.detail}</div>}

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{sourceLabel(task.source)}</span>
        {task.scheduleText && (
          <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{task.scheduleText}</span>
        )}
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">创建于 {formatDate(task.createdAt)}</span>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onStatusChange(task.id, "active")}
          className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
        >
          标记进行中
        </button>
        <button
          onClick={() => onStatusChange(task.id, "recurring")}
          className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100"
        >
          标记周期
        </button>
        <button
          onClick={() => onStatusChange(task.id, "done")}
          className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          标记完成
        </button>
      </div>
    </article>
  );
}

export default function WorklogV3Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
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

  const grouped = useMemo(() => {
    const active = tasks.filter((t) => t.status === "active");
    const recurring = tasks.filter((t) => t.status === "recurring");
    const done = tasks.filter((t) => t.status === "done");
    return { active, recurring, done };
  }, [tasks]);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">📌 对话提醒总览（V3 动态）</h1>
          <p className="text-slate-600 mt-2">
            现在页面数据来自数据库，不再写死。新增任务后点击“立即刷新”即可看到最新结果。
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={loadTasks}
              className="text-sm px-3 py-2 rounded bg-slate-900 text-white hover:bg-black"
            >
              立即刷新
            </button>
            <a
              href="/worklog/api/init"
              target="_blank"
              className="text-sm px-3 py-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
              rel="noreferrer"
            >
              初始化数据表
            </a>
          </div>

          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-sm">
            <div className="rounded-xl bg-slate-100 p-3">
              <div className="text-slate-500">总计</div>
              <div className="text-xl font-semibold text-slate-900">{tasks.length}</div>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <div className="text-blue-700">进行中</div>
              <div className="text-xl font-semibold text-blue-800">{grouped.active.length}</div>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <div className="text-purple-700">周期规则</div>
              <div className="text-xl font-semibold text-purple-800">{grouped.recurring.length}</div>
            </div>
            <div className="rounded-xl bg-slate-200 p-3">
              <div className="text-slate-600">已完成</div>
              <div className="text-xl font-semibold text-slate-800">{grouped.done.length}</div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="text-center text-slate-500 py-16">加载中...</div>
        ) : (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">🚀 进行中</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grouped.active.map((task) => (
                  <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">🔁 周期规则</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grouped.recurring.map((task) => (
                  <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">✅ 已完成</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grouped.done.map((task) => (
                  <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
