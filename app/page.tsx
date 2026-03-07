"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    href: "/worklog",
    title: "待办",
    desc: "对话驱动的任务追踪",
    icon: "◐",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  {
    href: "/ranking",
    title: "排行",
    desc: "实时更新的排行榜",
    icon: "◑",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/20",
    text: "text-amber-400",
  },
  {
    href: "/fortune",
    title: "运势",
    desc: "每日运势测算",
    icon: "✦",
    color: "from-rose-500/20 to-pink-500/20",
    border: "border-rose-500/20",
    text: "text-rose-400",
  },
  {
    href: "/todos",
    title: "清单",
    desc: "传统的待办列表",
    icon: "◎",
    color: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-500/20",
    text: "text-purple-400",
  },
];

const quickActions = [
  { label: "同步飞书", cmd: "#sync-to-log", color: "text-emerald-400" },
  { label: "查看待办", cmd: "打开待办", color: "text-blue-400" },
  { label: "添加提醒", cmd: "提醒我...", color: "text-amber-400" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 overflow-hidden">
      {/* 动态背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px]" />
      </div>

      {/* 网格纹理 */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* 内容容器 */}
      <div className="relative z-10 max-w-md mx-auto px-6 min-h-screen flex flex-col">
        
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-16 pb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-lg shadow-blue-500/25">
              ◈
            </div>
            <h1 className="text-2xl font-light tracking-tight text-white">
              OpenClaw
            </h1>
          </div>
          <p className="text-sm text-slate-500 pl-[52px]">
            对话驱动的智能助理
          </p>
        </motion.header>

        {/* 主功能卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-3 mb-12"
        >
          <p className="text-xs text-slate-600 uppercase tracking-wider mb-4 px-1">
            功能
          </p>
          
          {features.map((feature, i) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              <Link
                href={feature.href}
                className={`group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${feature.color} border ${feature.border} backdrop-blur-sm transition-all active:scale-95`}
              >
                <span className={`text-2xl ${feature.text}`}>{feature.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{feature.title}</h3>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </div>
                <svg 
                  className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </motion.section>

        {/* 快捷指令 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <p className="text-xs text-slate-600 uppercase tracking-wider mb-4 px-1">
            快捷指令
          </p>
          
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.05 }}
                className="px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-xs"
              >
                <span className="text-slate-500">{action.label}</span>
                <span className={`ml-2 ${action.color}`}>{action.cmd}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 状态概览 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-auto pb-8"
        >
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">系统状态</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400">运行中</span>
              </span>
            </div>
          </div>
          
          <p className="text-center text-[11px] text-slate-700 mt-6">
            OpenClaw · 智能助理
          </p>
        </motion.section>
      </div>
    </div>
  );
}
