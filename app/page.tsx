'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const cards = [
  {
    id: 'todos',
    title: '待办事项',
    description: '管理你的待办清单，支持飞书同步',
    emoji: '📝',
    href: '/todos',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    id: 'fortune',
    title: '今日运势',
    description: '基于生日和偏好测算今日运势',
    emoji: '✨',
    href: '/fortune',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/20 to-pink-500/10',
  },
  {
    id: 'ranking',
    title: '排行榜',
    description: '实时排名榜单，支持分数统计',
    emoji: '🏆',
    href: '/ranking',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/20 to-orange-500/10',
  },
];

const otherProjects = [
  { id: 'worklog', title: 'AI Worklog', desc: '展示任务执行过程', emoji: '🤖', href: '/worklog' },
  { id: 'oauth', title: 'OAuth 2.0', desc: '学习 OAuth 授权', emoji: '🔐', href: '/oauth' },
  { id: 'ui-library-doc', title: 'Simply UI', desc: '组件库文档', emoji: '🎨', href: '/ui-library-doc' },
  { id: 'nick', title: 'Nick', desc: '个人页面', emoji: '👤', href: '/nick' },
  { id: 'login', title: 'Login', desc: '登录页面', emoji: '🔑', href: '/login' },
  { id: 'tailwindcss', title: 'Tailwind', desc: '样式学习', emoji: '💨', href: '/tailwindcss' },
];

const Page = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* 背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm sticky top-0 bg-slate-950/90">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg">
              🚀
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">工具导航</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 py-6">
        {/* 欢迎语 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-1">
            欢迎使用
          </h2>
          <p className="text-sm text-slate-400">
            选择一个工具开始
          </p>
        </motion.div>

        {/* 主入口卡片 - 移动端单列 */}
        <div className="space-y-3 mb-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => router.push(card.href)}
              className={`group relative overflow-hidden rounded-xl cursor-pointer active:scale-[0.98] transition-all ${card.bgGradient} border border-slate-800/50`}
            >
              {/* 渐变装饰 */}
              <div className={`absolute right-0 top-0 w-20 h-20 bg-gradient-to-br ${card.gradient} opacity-15 rounded-full blur-2xl transform translate-x-4 -translate-y-4`} />
              
              {/* 内容 - 横向布局适配移动端 */}
              <div className="relative p-4 flex items-center gap-3">
                {/* 图标 */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
                  {card.emoji}
                </div>
                
                {/* 文字 */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-white truncate">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {card.description}
                  </p>
                </div>
                
                {/* 箭头 */}
                <div className="text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 其他项目 - 移动端双列更紧凑 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
            <span>📁</span>
            其他项目
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {otherProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + index * 0.03 }}
                onClick={() => router.push(project.href)}
                className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-3 cursor-pointer active:bg-slate-800/50 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{project.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                      {project.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/30 py-4 mt-8">
        <div className="text-center text-xs text-slate-600">
          <a href="https://beian.miit.gov.cn/">京ICP备19043673号-2</a>
        </div>
      </footer>
    </div>
  );
};

export default Page;
