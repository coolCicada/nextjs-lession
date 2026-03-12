"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppBackground, AppHeader, GlassPanel } from "@/app/ui/app-shell";

type NewsItem = {
  id: string;
  title: string;
  content: string;
  source: string;
  syncedFrom: string;
  recordType?: string;
  createdAt: string;
};

function getNewsTypeLabel(recordType?: string) {
  switch (recordType) {
    case "daily-finance-brief":
      return "财经晨报";
    case "news-quant":
      return "量化简报";
    case "manual-news":
      return "手动新闻";
    default:
      return recordType || "新闻记录";
  }
}

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
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-700 dark:text-slate-100">
      <AppBackground />
      <AppHeader title="新闻分析记录" subtitle="主要查看新闻、财经与分析沉淀，已自动排除每日英语记录" />

      <main className="relative z-10 mx-auto max-w-4xl px-5 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <GlassPanel className="flex min-h-[260px] items-center justify-center p-10 text-sm text-slate-400 dark:text-slate-500">
            加载中
          </GlassPanel>
        ) : items.length === 0 ? (
          <GlassPanel className="p-10 text-center text-slate-400 dark:text-slate-500">
            还没有记录，先在对话里发送 #sync-news
          </GlassPanel>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Link key={item.id} href={`/newslog/${item.id}`}>
                <GlassPanel className="group p-5 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/70 hover:shadow-[0_22px_50px_rgba(14,165,233,0.12)] dark:hover:border-sky-500/20 dark:hover:shadow-[0_22px_50px_rgba(0,0,0,0.3)] sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-3 inline-flex rounded-full border border-sky-200/70 bg-sky-50/90 px-3 py-1 text-[11px] font-medium text-sky-600 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                        {getNewsTypeLabel(item.recordType)}
                      </div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-300">
                        {item.title}
                      </h2>
                    </div>
                    <span className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">{formatTime(item.createdAt)}</span>
                  </div>

                  <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-slate-500 dark:text-slate-400">
                    {item.content}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
                    <span>来源：{item.source} · 触发：{item.syncedFrom}</span>
                    <span className="font-medium text-sky-500 dark:text-sky-300">查看详情 →</span>
                  </div>
                </GlassPanel>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
