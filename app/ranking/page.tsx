"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface RankItem {
  id: string;
  name: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

// 排名奖牌
const rankMedals: Record<number, { bg: string; text: string; emoji: string }> = {
  1: { bg: "bg-gradient-to-br from-amber-100 to-yellow-50", text: "text-amber-600", emoji: "🥇" },
  2: { bg: "bg-gradient-to-br from-slate-100 to-gray-50", text: "text-slate-600", emoji: "🥈" },
  3: { bg: "bg-gradient-to-br from-orange-100 to-amber-50", text: "text-orange-600", emoji: "🥉" },
};

export default function RankingPage() {
  const [items, setItems] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/ranking/api/items", { cache: "no-store" });
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      data.sort((a: RankItem, b: RankItem) => b.score - a.score);
      setItems(data);
      setError("");
    } catch (e) {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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
      await loadItems();
    } catch (e) {
      setError("添加失败");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getRankStyle = (index: number) => {
    if (index < 3) {
      return rankMedals[index + 1];
    }
    return { bg: "bg-white/70", text: "text-slate-600", emoji: "" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 text-slate-600">
      {/* 柔和背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                ←
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">排行榜</h1>
                <p className="text-xs text-slate-400 mt-0.5">{items.length} 个条目</p>
              </div>
            </div>

            <button
              onClick={loadItems}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-6">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* 添加表单 */}
        <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-4">
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名称..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              disabled={isSubmitting}
            />
            <input
              type="number"
              step="0.01"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="分数"
              className="w-28 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !score.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium disabled:opacity-50 transition-all"
            >
              +
            </button>
          </form>
        </div>

        {/* 列表 */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-slate-400">还没有条目</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const rank = getRankStyle(index);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl ${rank.bg} border border-white/50 shadow-sm`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${rank.text}`}>
                      {rank.emoji || index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-bold ${rank.text}`}>
                        {item.score.toLocaleString()}
                      </span>
                      
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
