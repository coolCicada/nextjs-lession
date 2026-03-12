"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppBackground, AppHeader, GlassPanel } from "@/app/ui/app-shell";

type EnglishItem = {
  id: string;
  title: string;
  content: string;
  source: string;
  syncedFrom: string;
  recordType: string;
  createdAt: string;
};

function getEnglishTypeLabel(recordType?: string) {
  if (recordType === "english-daily") return "每日英语";
  return recordType || "英语记录";
}

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

export default function EnglishDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<EnglishItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("worklog_token");
    if (!token) {
      router.push("/worklog/login");
      return;
    }

    fetch("/worklog/api/news?recordType=english-daily", {
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

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-700 dark:text-slate-100">
      <AppBackground />
      <AppHeader title={item?.title || "英语详情"} subtitle="更适合阅读的内容页，支持 markdown 呈现" backHref="/englishlog" />

      <main className="relative z-10 mx-auto max-w-4xl px-5 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <GlassPanel className="flex min-h-[260px] items-center justify-center p-10 text-sm text-slate-400 dark:text-slate-500">加载中</GlassPanel>
        ) : !item ? (
          <GlassPanel className="p-10 text-center text-slate-400 dark:text-slate-500">没找到这条记录</GlassPanel>
        ) : (
          <GlassPanel className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 inline-flex rounded-full border border-emerald-200/70 bg-emerald-50/90 px-3 py-1 text-[11px] font-medium text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {getEnglishTypeLabel(item.recordType)}
                </div>
                <h1 className="text-2xl font-semibold leading-10 tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  {item.title}
                </h1>
              </div>
              <span className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">{formatTime(item.createdAt)}</span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="rounded-full border border-white/60 bg-white/60 px-3 py-1 dark:border-white/10 dark:bg-white/5">来源：{item.source}</span>
              <span className="rounded-full border border-white/60 bg-white/60 px-3 py-1 dark:border-white/10 dark:bg-white/5">触发：{item.syncedFrom}</span>
            </div>

            <div className="prose prose-slate mt-8 max-w-none text-[15px] leading-8 dark:prose-invert prose-headings:tracking-tight prose-pre:rounded-2xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-slate-950 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 dark:prose-code:bg-white/10">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
            </div>

            <div className="mt-8">
              <Link href="/englishlog" className="text-sm font-medium text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300 dark:hover:text-emerald-200">
                ← 返回英文记录
              </Link>
            </div>
          </GlassPanel>
        )}
      </main>
    </div>
  );
}
