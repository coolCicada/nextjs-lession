import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { ThemeScript } from '@/app/ui/theme-script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-100`}>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
