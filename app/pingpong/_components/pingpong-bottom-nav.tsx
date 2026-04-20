"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/pingpong', label: '主页', icon: '🏓', match: (p: string) => p === '/pingpong' || p.startsWith('/pingpong/tournaments') },
  { href: '/pingpong/players', label: '球员', icon: '👤', match: (p: string) => p.startsWith('/pingpong/players') },
  { href: '/pingpong/me', label: '我的', icon: '✨', match: (p: string) => p.startsWith('/pingpong/me') },
];

export default function PingPongBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/92 pb-[max(env(safe-area-inset-bottom),0px)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 md:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-3 px-3 py-2">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs transition ${active ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'}`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
