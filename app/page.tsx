'use client';

import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const cards = [
  {
    id: 'todos',
    title: '待办事项',
    description: '管理你的待办清单，支持飞书同步',
    emoji: '📝',
    href: '/todos',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    shadow: 'shadow-emerald-500/25',
    iconBg: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'fortune',
    title: '今日运势',
    description: '基于生日和偏好测算今日运势',
    emoji: '🔮',
    href: '/fortune',
    gradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
    shadow: 'shadow-purple-500/25',
    iconBg: 'from-violet-500 to-purple-600',
  },
  {
    id: 'ranking',
    title: '排行榜',
    description: '实时排名榜单，支持分数统计',
    emoji: '🏆',
    href: '/ranking',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    shadow: 'shadow-orange-500/25',
    iconBg: 'from-amber-500 to-orange-600',
  },
];

const otherProjects = [
  { id: 'worklog', title: 'AI Worklog', desc: '任务执行过程', emoji: '🤖', href: '/worklog' },
  { id: 'oauth', title: 'OAuth 2.0', desc: '授权学习', emoji: '🔐', href: '/oauth' },
  { id: 'ui', title: 'Simply UI', desc: '组件文档', emoji: '🎨', href: '/ui-library-doc' },
  { id: 'nick', title: 'Nick', desc: '个人主页', emoji: '👤', href: '/nick' },
  { id: 'login', title: 'Login', desc: '登录页面', emoji: '🔑', href: '/login' },
  { id: 'tailwind', title: 'Tailwind', desc: '样式学习', emoji: '💨', href: '/tailwindcss' },
];

// 浮动的背景形状组件
function FloatingShape({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.2, 1],
        x: [0, 20, 0],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute w-20 h-20 rounded-full blur-3xl"
      style={{
        background: `linear-gradient(${Math.random() * 360}deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))`,
      }}
    />
  );
}

const Page = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 简单的视差效果
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  if (!mounted) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* 动态背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 渐变网格背景 */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* 浮动光球 */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.4), transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.4), transparent 50%)',
              'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.4), transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0"
        />
        
        {/* 顶部渐变光 */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-violet-600/20 to-transparent" />
        
        {/* 底部渐变光 */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-600/10 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-slate-950/50 border-b border-white/5">
        <div className="px-4 py-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-s bg-clip-text text-transparent">
                工具导航
             late-400 </h1>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 py-6">
        {/* 欢迎区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <motion.div
            animate={{ 
              textShadow: [
                '0 0 20px rgba(139, 92, 246, 0.5)',
                '0 0 40px rgba(236, 72, 153, 0.5)',
                '0 0 20px rgba(139, 92, 246, 0.5)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-3xl font-black mb-2"
          >
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
              欢迎使用
            </span>
          </motion.div>
          <p className="text-slate-400 text-sm">
            选择一个工具开始探索
          </p>
        </motion.div>

        {/* 主入口卡片 - 毛玻璃效果 */}
        <div className="space-y-4 mb-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={variants}
              onClick={() => router.push(card.href)}
              className="group relative overflow-hidden rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
            >
              {/* 背景渐变 */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              {/* 毛玻璃层 */}
              <div className="relative backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-4 group-hover:border-white/20 transition-colors">
                {/* 闪光效果 */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <motion.div
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                  />
                </div>
                
                {/* 内容 */}
                <div className="relative flex items-center gap-4">
                  {/* 图标 */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center text-2xl shadow-lg ${card.shadow}`}
                  >
                    {card.emoji}
                  </motion.div>
                  
                  {/* 文字 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                      {card.description}
                    </p>
                  </div>
                  
                  {/* 箭头 */}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-slate-500 group-hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 其他项目 - 玻璃态卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-violet-500" />
            更多项目
          </h3>
          
          <div className="grid grid-cols-3 gap-2">
            {otherProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                onClick={() => router.push(project.href)}
                className="group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-3 cursor-pointer active:scale-95 transition-all hover:bg-slate-800/50 hover:border-white/10"
              >
                <div className="flex flex-col items-center text-center gap-1.5">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {project.emoji}
                  </span>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate w-full">
                    {project.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-slate-600">
            Powered by Next.js
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 mt-4">
        <div className="text-center text-xs text-slate-700">
          <a href="https://beian.miit.gov.cn/" className="hover:text-slate-500 transition-colors">
            京ICP备19043673号-2
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Page;
