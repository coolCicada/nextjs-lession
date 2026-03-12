"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("worklog_token");
    if (!token) {
      router.push("/worklog/login");
      return;
    }

    fetch("/worklog/api/news?excludeRecordType=english-daily", {
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
        const items = Array.isArray(data) ? data : [];
        const found = items.find((news) => news.id === params.id) || null;
        setItem(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <span className="text-slate-400 text-sm">加载中</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 text-slate-600">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/newslog" className="text-sm text-sky-500">← 返回新闻列表</Link>
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white/80 p-8 text-center text-slate-400">
            没找到这条记录
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 text-slate-600">
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <Link href="/newslog" className="text-sm text-sky-500">← 返回新闻列表</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <article className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold text-slate-800 leading-9">{item.title}</h1>
            <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(item.createdAt)}</span>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            来源：{item.source} · 触发：{item.syncedFrom}
          </div>

          <div className="mt-6 whitespace-pre-wrap text-[15px] leading-8 text-slate-700">
            {item.content}
          </div>
        </article>
      </main>
    </div>
  );
}
