"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AppBackground, GlassPanel } from "@/app/ui/app-shell";
import ThemeToggle from "@/app/ui/theme-toggle";

const features = [
  {
    href: "/worklog",
    title: "待办",
    desc: "对话驱动的任务追踪与沉淀",
    icon: "◐",
    accent: "from-sky-400/20 to-cyan-300/10",
    border: "border-sky-200/70 dark:border-sky-500/20",
    text: "text-sky-600 dark:text-sky-300",
  },
  {
    href: "/newslog",
    title: "新闻库",
    desc: "财经与分析结果回看",
    icon: "◉",
    accent: "from-violet-400/20 to-fuchsia-300/10",
    border: "border-violet-200/70 dark:border-violet-500/20",
    text: "text-violet-600 dark:text-violet-300",
  },
  {
    href: "/englishlog",
    title: "英语库",
    desc: "每日英语与学习沉淀",
    icon: "✎",
    accent: "from-emerald-400/20 to-teal-300/10",
    border: "border-emerald-200/70 dark:border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-300",
  },
  {
    href: "/fortune",
    title: "运势",
    desc: "轻量的每日状态入口",
    icon: "✦",
    accent: "from-rose-400/20 to-orange-300/10",
    border: "border-rose-200/70 dark:border-rose-500/20",
    text: "text-rose-600 dark:text-rose-300",
  },
  {
    href: "/pingpong",
    title: "开球站",
    desc: "比赛、球员积分、搜索与报名",
    icon: "🏓",
    accent: "from-indigo-400/20 to-sky-300/10",
    border: "border-indigo-200/70 dark:border-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-300",
  },
];

const quickActions = [
  { label: "同步待办", cmd: "#sync-to-log" },
  { label: "同步新闻", cmd: "#sync-news" },
  { label: "添加提醒", cmd: "提醒我..." },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-700 dark:text-slate-100">
      <AppBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-5 pb-10 pt-8 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
                系统在线 · 工作台
              </div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">
                OpenClaw
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                更接近前沿产品的克制工作台：首页承载入口、沉淀内容与高频操作，但不过度装饰。
              </p>
            </div>
            <ThemeToggle />
          </div>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <GlassPanel className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  Core Entry
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">常用入口</h2>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Light / Dark
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 * index }}
                >
                  <Link
                    href={feature.href}
                    className={`group relative block overflow-hidden rounded-[24px] border ${feature.border} bg-gradient-to-br ${feature.accent} p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:hover:border-white/12 dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.22)]`}
                  >
                    <div className="absolute inset-0 bg-white/72 dark:bg-slate-950/18" />
                    <div className="relative">
                      <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-2xl shadow-sm dark:border-white/10 dark:bg-white/10 ${feature.text}`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.desc}</p>
                      <div className={`mt-5 text-sm font-medium ${feature.text}`}>进入 →</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </GlassPanel>

          <div className="grid gap-6">
            <GlassPanel className="p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Quick Actions</p>
              <div className="mt-4 space-y-3">
                {quickActions.map((action) => (
                  <div
                    key={action.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-200">{action.label}</span>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-slate-900">
                      {action.cmd}
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Status</p>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">内容工作流</span>
                    <span className="font-medium text-slate-900 dark:text-white">稳定</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
                    <div className="h-2 w-[78%] rounded-full bg-gradient-to-r from-sky-400 to-violet-500" />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  这版首页把视觉语言往 Linear / Raycast / Vercel 的方向收了：更克制、更清爽、留白更稳定。
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
