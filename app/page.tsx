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

const Page = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* 背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm sticky top-0 bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl">
              🚀
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">工具导航</h1>
              <p className="text-xs text-slate-500">
                快速入口
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* 欢迎语 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            欢迎使用
          </h2>
          <p className="text-slate-400">
            选择一个工具开始吧
          </p>
        </motion.div>

        {/* 导航卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(card.href)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl ${card.bgGradient} border border-slate-800/50`}
            >
              {/* 渐变背景装饰 */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-20 rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:opacity-30 transition-opacity`} />
              
              {/* 内容 */}
              <div className="relative p-6 flex flex-col h-full min-h-[180px]">
                {/* 图标 */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {card.emoji}
                </div>
                
                {/* 标题 */}
                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                  {card.title}
                </h3>
                
                {/* 描述 */}
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors flex-1">
                  {card.description}
                </p>
                
                {/* 箭头指示 */}
                <div className="mt-4 flex items-center text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                  <span>进入</span>
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 其他功能入口 (原有项目) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
            <span>📁</span>
            其他项目
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => router.push('/worklog')}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🤖</span>
                <div>
                  <p className="font-medium text-slate-200 group-hover:text-white">AI Worklog</p>
                  <p className="text-xs text-slate-500">展示任务执行过程</p>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => router.push('/oauth')}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔐</span>
                <div>
                  <p className="font-medium text-slate-200 group-hover:text-white">OAuth 2.0</p>
                  <p className="text-xs text-slate-500">学习 OAuth 授权</p>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => router.push('/ui-library-doc')}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🎨</span>
                <div>
                  <p className="font-medium text-slate-200 group-hover:text-white">Simply UI</p>
                  <p className="text-xs text-slate-500">组件库文档</p>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => router.push('/nick')}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👤</span>
                <div>
                  <p className="font-medium text-slate-200 group-hover:text-white">Nick</p>
                  <p className="text-xs text-slate-500">个人页面</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-600">
          <a href="https://beian.miit.gov.cn/">京ICP备19043673号-2</a>
        </div>
      </footer>
    </div>
  );
};

export default Page;
