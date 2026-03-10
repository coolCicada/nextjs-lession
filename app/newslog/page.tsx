"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NewsItem = {
  id: string;
  title: string;
  content: string;
  source: string;
  syncedFrom: string;
  createdAt: string;
};

function formatTime(date: string) {
  return new Date(date).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewslogPage() {
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("worklog_token");
    if (!token) {
      router.push("/worklog/login");
      return;
    }

    fetch("/worklog/api/news", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          localStorage.removeItem("worklog_token");
          localStorage.removeItem("worklog_user");
          router.push("/worklog/login");
          return [];
        }
        return r.json();
      })
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <span className="text-slate-400 text-sm">加载中</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 text-slate-600">
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-200">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">新闻分析记录</h1>
            <p className="text-xs text-slate-400 mt-0.5">支持 #sync-news 手动写入，且每日财经简讯会自动落到本地 SQLite</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            还没有记录，先在对话里发送 #sync-news
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white/70 border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-medium text-slate-800">{item.title}</h2>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatTime(item.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap leading-6">{item.content}</p>
                <div className="mt-3 text-[11px] text-slate-400">
                  来源：{item.source} · 触发：{item.syncedFrom}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
