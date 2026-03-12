export function ThemeScript() {
  const code = `(() => {
    try {
      const stored = localStorage.getItem('oc-theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = stored || (systemDark ? 'dark' : 'light');
      const root = document.documentElement;
      root.classList.toggle('dark', theme === 'dark');
      root.style.colorScheme = theme;
    } catch {}
  })();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
