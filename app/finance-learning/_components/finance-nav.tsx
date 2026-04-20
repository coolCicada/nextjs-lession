'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/finance-learning', label: '仪表盘' },
  { href: '/finance-learning/history', label: '历史预测' },
  { href: '/finance-learning/insights', label: '学习洞察' },
  { href: '/finance-learning/data', label: '数据管理' },
];

export function FinanceNav() {
  const pathname = usePathname();

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {items.map((item) => {
        const active =
          item.href === '/finance-learning'
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm transition ${
              active
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'border border-slate-200/80 bg-white/80 text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
