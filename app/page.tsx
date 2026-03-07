"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    href: "/worklog",
    title: "待办",
    desc: "对话驱动的任务追踪",
    icon: "◐",
    gradient: "from-sky-100 to-blue-50",
    border: "border-sky-200",
    text: "text-sky-600",
    shadow: "shadow-sky-100",
  },
  {
    href: "/ranking",
    title: "排行",
    desc: "实时更新的排行榜",
    icon: "◑",
    gradient: "from-amber-100 to-orange-50",
    border: "border-amber-200",
    text: "text-amber-600",
    shadow: "shadow-amber-100",
  },
  {
    href: "/fortune",
    title: "运势",
    desc: "每日运势测算",
    icon: "✦",
    gradient: "from-rose-100 to-pink-50",
    border: "border-rose-200",
    text: "text-rose-600",
    shadow: "shadow-rose-100",
  },
  {
    href: "/todos",
    title: "清单",
    desc: "传统的待办列表",
    icon: "◎",
    gradient: "from-violet-100 to-purple-50",
    border: "border-violet-200",
    text: "text-violet-600",
    shadow: "shadow-violet-100",
  },
];

const quickActions = [
  { label: "同步飞书", cmd: "#sync-to-log", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
  { label: "查看待办", cmd: "打开待办", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-600" },
  { label: "添加提醒", cmd: "提醒我...", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 text-slate-600 overflow-hidden">
      {/* 柔和光晕背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-violet-200/30 rounded-full blur-[80px]" />
        <div className="absolute -bottom-40 right-1/3 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-[120px]" />
      </div>

      {/* 内容容器 */}
      <div className="relative z-10 max-w-md mx-auto px-6 min-h-screen flex flex-col">
        
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-16 pb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-slate-200/50 flex items-center justify-center text-xl border border-slate-100">
              <span className="bg-gradient-to-br from-sky-500 to-violet-500 bg-clip-text text-transparent">◈</span>
            </div>
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-slate-800">
                OpenClaw
              </h1>
              <p className="text-sm text-slate-400">
                智能助理
              </p>
            </div>
          </div>
        </motion.header>

        {/* 主功能卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3 mb-10"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4 px-1">
            功能
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              >
                <Link
                  href={feature.href}
                  className={`group flex flex-col items-center text-center p-5 rounded-3xl bg-gradient-to-b ${feature.gradient} border ${feature.border} shadow-sm ${feature.shadow} backdrop-blur-sm transition-all active:scale-95 hover:shadow-md`}
                >
                  <span className={`text-3xl mb-3 ${feature.text}`}>{feature.icon}</span>
                  <h3 className="text-slate-700 font-medium mb-1">{feature.title}</h3>
                  <p className="text-[11px] text-slate-500">{feature.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 快捷指令 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4 px-1">
            快捷指令
          </p>
          
          <div className="space-y-2">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${action.bg} border ${action.border}`}
              >
                <span className="text-sm text-slate-600">{action.label}</span>
                <span className={`text-xs font-medium ${action.text} px-3 py-1.5 rounded-full bg-white/60`}>
                  {action.cmd}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 底部状态 */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-auto pb-8"
        >
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>系统运行中</span>
          </div>
          
          <p className="text-center text-[11px] text-slate-300 mt-6">
            OpenClaw · 智能助理
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
