"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TodosLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    try {
      setLoading(true);
      setError("");

      // 先确保表已初始化
      await fetch("/todos/api/init", { cache: "no-store" });

      const res = await fetch("/todos/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "登录失败");
        return;
      }

      localStorage.setItem("todos_token", data.token);
      localStorage.setItem("todos_user", data.username);
      router.replace("/todos");
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-900">登录 Todo</h1>
        <p className="text-sm text-slate-500 mt-1">登录后可查看和管理你的任务</p>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">账号</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
              placeholder="请输入账号"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 text-white py-2.5 font-medium disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">默认账号：admin / admin123</p>
      </div>
    </div>
  );
}
