"use client";

import { useState, useEffect } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  // 从 localStorage 加载
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([todo, ...todos]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          📝 待办事项
        </h1>

        {/* 添加表单 */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="添加新待办..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                进行中 ({pendingTodos.length})
              </h2>
              <div className="space-y-2">
                {pendingTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="flex-1 text-gray-800">{todo.text}</span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
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
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                已完成 ({completedTodos.length})
              </h2>
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg border border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="flex-1 text-gray-500 line-through">
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
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
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">暂无待办事项</p>
              <p className="text-sm mt-2">添加一个开始吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
