"use client";

import { useState, useEffect } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  source: string;
}

// Gist ID（需要你创建一个 Gist 并填在这里）
const GIST_ID = "YOUR_GIST_ID_HERE";
const GITHUB_TOKEN = "YOUR_GITHUB_TOKEN_HERE";

const GIST_FILE = "todos.json";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  // 加载待办
  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.github.com/gists/${GIST_ID}`
      );
      
      if (!response.ok) {
        throw new Error("无法加载待办数据");
      }
      
      const data = await response.json();
      const content = data.files[GIST_FILE]?.content;
      
      if (content) {
        setTodos(JSON.parse(content));
      } else {
        // 初始化空文件
        setTodos([]);
      }
      setError("");
    } catch (err) {
      console.error(err);
      setError("加载失败，请检查配置");
    } finally {
      setLoading(false);
    }
  };

  // 保存待办
  const saveTodos = async (newTodos: Todo[]) => {
    try {
      const content = JSON.stringify(newTodos, null, 2);
      
      await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: "PATCH",
        headers: {
          "Authorization": `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: {
            [GIST_FILE]: {
              content,
            },
          },
        }),
      });
      
      setTodos(newTodos);
    } catch (err) {
      console.error(err);
      setError("保存失败");
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      source: "web",
    };

    const newTodos = [todo, ...todos];
    saveTodos(newTodos);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(newTodos);
  };

  const deleteTodo = (id: string) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    saveTodos(newTodos);
  };

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
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

        {/* 待办列表 */}
        <div className="space-y-6">
          {/* 进行中 */}
          {pendingTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                进行中 ({pendingTodos.length})
              </h2>
              <div className="space-y-2">
                {pendingTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleTodo(todo.id)}
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
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleTodo(todo.id)}
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
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            🔄 刷新数据
          </button>
        </div>
      </div>
    </div>
  );
}
