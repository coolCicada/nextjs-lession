"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RankItem {
  id: string;
  name: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

// 排名奖牌颜色
const rankColors: Record<number, string> = {
  1: "from-yellow-400 to-yellow-600", // 金牌
  2: "from-gray-300 to-gray-500",     // 银牌
  3: "from-orange-400 to-orange-600", // 铜牌
};

export default function RankingPage() {
  const [items, setItems] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 表单状态
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState("");

  // 加载数据
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/ranking/api/items", { cache: "no-store" });
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      // 按分数降序排序
      data.sort((a: RankItem, b: RankItem) => b.score - a.score);
      setItems(data);
      setError("");
    } catch (e) {
      console.error(e);
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // 添加条目
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !score.trim()) return;
    
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum)) {
      setError("分数必须是数字");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/ranking/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), score: scoreNum }),
      });
      if (!res.ok) throw new Error("添加失败");
      
      setName("");
      setScore("");
      await loadItems(); // 重新加载并排序
    } catch (e) {
      setError("添加失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除条目
  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这条记录？")) return;
    
    try {
      const res = await fetch("/ranking/api/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("删除失败");
      await loadItems();
    } catch (e) {
      setError("删除失败");
    }
  };

  // 开始编辑分数
  const startEdit = (item: RankItem) => {
    setEditingId(item.id);
    setEditScore(item.score.toString());
  };

  // 保存分数修改
  const saveEdit = async (id: string) => {
    const scoreNum = parseFloat(editScore);
    if (isNaN(scoreNum)) {
      setError("分数必须是数字");
      return;
    }
    
    try {
      const res = await fetch("/ranking/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, score: scoreNum }),
      });
      if (!res.ok) throw new Error("更新失败");
      
      setEditingId(null);
      await loadItems(); // 重新排序
    } catch (e) {
      setError("更新失败");
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditScore("");
  };

  // 获取排名样式
  const getRankStyle = (index: number) => {
    if (index < 3) {
      return `bg-gradient-to-r ${rankColors[index + 1]} text-white shadow-lg`;
    }
    return "bg-slate-800 text-slate-300 border border-slate-700";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm sticky top-0 bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xl">
                🏆
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">排行榜</h1>
                <p className="text-xs text-slate-500">
                  {items.length} 个条目 · 实时排序
                </p>
              </div>
            </div>

            <button
              onClick={loadItems}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="刷新"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* 添加表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-4"
        >
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名称..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              disabled={isSubmitting}
            />
            <input
              type="number"
              step="0.01"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="分数..."
              className="w-full sm:w-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !score.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加
            </button>
          </form>
        </motion.div>

        {/* 排行榜列表 */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <span className="text-5xl mb-4 block">📭</span>
            <p className="mb-2">还没有条目</p>
            <p className="text-sm">在上面添加第一个排名</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`relative flex items-center gap-4 p-4 rounded-xl ${getRankStyle(index)}`}
                >
                  {/* 排名数字 */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index < 3 ? "bg-white/20" : "bg-slate-700"
                  }`}>
                    {index + 1}
                  </div>

                  {/* 名称 */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${index < 3 ? "text-white" : "text-slate-200"}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${index < 3 ? "text-white/70" : "text-slate-500"}`}>
                      {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>

                  {/* 分数 */}
                  <div className="flex items-center gap-3">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editScore}
                          onChange={(e) => setEditScore(e.target.value)}
                          className="w-20 px-2 py-1 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white text-center"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="p-1 rounded-lg hover:bg-white/20 text-white"
                          title="保存"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 rounded-lg hover:bg-white/20 text-white"
                          title="取消"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(item)}
                          className={`text-2xl font-bold tabular-nums hover:scale-110 transition-transform ${
                            index < 3 ? "text-white" : "text-amber-400"
                          }`}
                          title="点击修改分数"
                        >
                          {item.score.toLocaleString()}
                        </button>
                        
                        {/* 删除按钮 */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            index < 3 
                              ? "hover:bg-white/20 text-white/70 hover:text-white" 
                              : "hover:bg-slate-700 text-slate-500 hover:text-red-400"
                          }`}
                          title="删除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-600">
          实时排行榜 · 自动排序
        </div>
      </footer>
    </div>
  );
}
