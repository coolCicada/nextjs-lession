"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  source: string;
  createdAt: string;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
}

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("todos_token");
    const u = localStorage.getItem("todos_user");

    if (!t) {
      router.replace("/todos/login");
      return;
    }

    setToken(t);
    setUsername(u);
  }, [router]);

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;

  const handleUnauthorized = () => {
    localStorage.removeItem("todos_token");
    localStorage.removeItem("todos_user");
    router.replace("/todos/login");
  };

  const loadTodos = async () => {
    if (!authHeaders) return;

    try {
      setLoading(true);
      const res = await fetch("/todos/api/todos", {
        cache: "no-store",
        headers: authHeaders,
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setTodos(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !authHeaders) return;

    try {
      const res = await fetch("/todos/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ text: newTodo.trim(), source: "web" }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) throw new Error("添加失败");

      const todo = await res.json();
      setTodos((prev) => [todo, ...prev]);
      setNewTodo("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("添加失败，请稍后重试");
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (!authHeaders) return;

    try {
      const next = !completed;
      const res = await fetch("/todos/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ id, completed: next }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) throw new Error("更新失败");

      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: next } : t)));
      setError("");
    } catch (err) {
      console.error(err);
      setError("更新失败，请稍后重试");
    }
  };

  const deleteTodo = async (id: string) => {
    if (!authHeaders) return;

    try {
      const res = await fetch("/todos/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ id }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) throw new Error("删除失败");

      setTodos((prev) => prev.filter((t) => t.id !== id));
      setError("");
    } catch (err) {
      console.error(err);
      setError("删除失败，请稍后重试");
    }
  };

  const logout = () => {
    localStorage.removeItem("todos_token");
    localStorage.removeItem("todos_user");
    router.replace("/todos/login");
  };

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.completed).length;
    const pending = total - done;
    const progress = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, progress };
  }, [todos]);

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-lg">正在加载待办...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">✅ Todo 展示页</h1>
              <p className="text-slate-500 mt-2">支持网页新增，也可接飞书消息同步进来。</p>
              {username && <p className="text-xs text-slate-400 mt-1">当前账号：{username}</p>}
            </div>
            <button onClick={logout} className="px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">
              退出登录
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <div className="rounded-xl bg-slate-100 p-3">
              <div className="text-xs text-slate-500">总数</div>
              <div className="text-xl font-semibold">{stats.total}</div>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <div className="text-xs text-blue-600">进行中</div>
              <div className="text-xl font-semibold text-blue-700">{stats.pending}</div>
            </div>
            <div className="rounded-xl bg-green-50 p-3">
              <div className="text-xs text-green-600">已完成</div>
              <div className="text-xl font-semibold text-green-700">{stats.done}</div>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <div className="text-xs text-purple-600">完成率</div>
              <div className="text-xl font-semibold text-purple-700">{stats.progress}%</div>
            </div>
          </div>

          <form onSubmit={addTodo} className="mt-5 flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="输入新的待办事项..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
            >
              添加
            </button>
          </form>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </section>

        <section className="space-y-4">
          {pendingTodos.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">进行中（{pendingTodos.length}）</h2>
              <div className="space-y-2">
                {pendingTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="text-slate-800">{todo.text}</div>
                      <div className="text-xs text-slate-400 mt-1">创建于 {formatDate(todo.createdAt)}</div>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {todo.source === "feishu" ? "飞书" : "网页"}
                    </span>
                    <button onClick={() => deleteTodo(todo.id)} className="text-red-500 text-sm hover:text-red-700">
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedTodos.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">已完成（{completedTodos.length}）</h2>
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="text-slate-500 line-through">{todo.text}</div>
                      <div className="text-xs text-slate-400 mt-1">完成于 {formatDate(todo.createdAt)}</div>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                      {todo.source === "feishu" ? "飞书" : "网页"}
                    </span>
                    <button onClick={() => deleteTodo(todo.id)} className="text-red-400 text-sm hover:text-red-600">
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {todos.length === 0 && (
            <div className="rounded-2xl bg-white shadow-sm border border-dashed border-slate-300 p-12 text-center">
              <div className="text-5xl mb-3">🗂️</div>
              <div className="text-slate-700 text-lg">还没有待办事项</div>
              <div className="text-slate-400 text-sm mt-1">现在就添加一条吧</div>
            </div>
          )}
        </section>

        <div className="text-center">
          <button onClick={loadTodos} className="text-slate-500 hover:text-slate-700 text-sm">
            刷新列表
          </button>
        </div>
      </div>
    </div>
  );
}
