"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const current = root.classList.contains("dark") ? "dark" : "light";
    setTheme(current);
    setReady(true);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
    localStorage.setItem("oc-theme", next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="切换亮暗主题"
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/70 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:scale-[1.02] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
    >
      <span className="text-lg">{!ready ? "◐" : theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
