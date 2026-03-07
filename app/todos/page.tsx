"use client";

import { useState, useEffect } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  source: string;
  createdAt: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 加载待办
  const loadTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/todos/api/todos");
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setTodos(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  // 添加待办
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const res = await fetch("/todos/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTodo.trim(), source: "web" }),
      });
      if (!res.ok) throw new Error("添加失败");
      
      const todo = await res.json();
      setTodos([todo, ...todos]);
      setNewTodo("");
    } catch (err) {
      setError("添加失败");
    }
  };

  // 切换完成状态
  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await fetch("/todos/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed }),
      });
      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, completed: !completed } : t
        )
      );
    } catch (err) {
      setError("更新失败");
    }
  };

  // 删除待办
  const deleteTodo = async (id: string) => {
    try {
      await fetch("/todos/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      setError("删除失败");
    }
  };

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 我的待办
          </h1>
          <p className="text-gray-500">
            共 {todos.length} 项 · {pendingTodos.length} 进行中
          </p>
        </div>

        {/* 添加表单 */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="添加新待办..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              添加
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* 待办列表 */}
        <div className="space-y-6">
          {/* 进行中 */}
          {pendingTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                进行中 ({pendingTodos.length})
              </h2>
              <div className="space-y-2">
                {pendingTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="flex-1 text-gray-800">{todo.text}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {todo.source === "feishu" ? "🐙 飞书" : "🌐 网页"}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-400 hover:text-red-600 text-sm px-2"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 已完成 */}
          {completedTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                已完成 ({completedTodos.length})
              </h2>
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-75"
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      className="w-5 h-5 text-green-600 rounded-lg focus:ring-green-500 cursor-pointer"
                    />
                    <span className="flex-1 text-gray-400 line-through">
                      {todo.text}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {todo.source === "feishu" ? "🐙 飞书" : "🌐 网页"}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-300 hover:text-red-500 text-sm px-2"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {todos.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-xl text-gray-600">暂无待办事项</p>
              <p className="text-gray-400 mt-2">添加一个开始吧！</p>
            </div>
          )}
        </div>

        {/* 刷新按钮 */}
        <div className="mt-8 text-center">
          <button
            onClick={loadTodos}
            className="text-gray-400 hover:text-gray-600 text-sm px-4 py-2"
          >
            🔄 刷新
          </button>
        </div>
      </div>
    </div>
  );
}
