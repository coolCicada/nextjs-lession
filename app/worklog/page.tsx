const timeline = [
  {
    time: '2026-03-07 15:26',
    title: '飞书通道故障排查启动',
    detail: '检查 OpenClaw 状态、插件列表、通道配置，定位到 Feishu 插件重复与鉴权失败。',
    status: 'done',
  },
  {
    time: '2026-03-07 16:00',
    title: '修复插件冲突 + 配置清理',
    detail: '移除重复的全局 feishu 插件，保留 stock 插件，避免同 ID 覆盖。',
    status: 'done',
  },
  {
    time: '2026-03-07 16:12',
    title: '飞书凭证联调与配对',
    detail: '完成 pairing approve，更新新的 AppID/Secret 后 probe 通过，连接打通。',
    status: 'done',
  },
  {
    time: '2026-03-07 18:31',
    title: '实现代办展示页第一版',
    detail: '重构 /todos 页面：统计卡片、列表分区、错误态与空状态；保留飞书来源展示。',
    status: 'done',
  },
  {
    time: '2026-03-07 18:42',
    title: '需求转向：展示对话任务执行记录',
    detail: '新增 /worklog 页面，用于展示“你提需求→我执行→结果”的可视化记录。',
    status: 'done',
  },
];

const codeChanges = [
  {
    file: 'app/todos/page.tsx',
    change: '待办展示页重构（UI、统计、交互反馈）',
  },
  {
    file: 'app/todos/api/todos/route.ts',
    change: '统一 API 错误处理，修复 TS unknown 错误',
  },
  {
    file: 'app/todos/api/feishu/route.ts',
    change: '补充错误处理函数，构建可通过',
  },
  {
    file: 'app/todos/api/init/route.ts',
    change: '补充错误处理函数，构建可通过',
  },
  {
    file: 'app/worklog/page.tsx',
    change: '新增 AI 执行看板页面（本页）',
  },
];

const commands = [
  'openclaw status / channels status --probe',
  'openclaw plugins list / uninstall feishu / enable feishu',
  'openclaw pairing approve feishu 4BCFSW2N',
  'npm install / npm run build',
  'git commit / git push origin main',
];

export default function WorklogPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">🛠️ AI 执行记录看板</h1>
          <p className="mt-2 text-slate-600">
            这个页面不是普通待办，而是展示「你在对话中的需求」和「我实际执行结果」。
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-blue-50 p-3">
              <div className="text-blue-700">当前状态</div>
              <div className="font-semibold text-blue-900">进行中（持续更新）</div>
            </div>
            <div className="rounded-xl bg-green-50 p-3">
              <div className="text-green-700">最近提交</div>
              <div className="font-mono text-green-900">3ed1a0e</div>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <div className="text-purple-700">部署分支</div>
              <div className="font-semibold text-purple-900">main (Vercel Auto Deploy)</div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">⏱️ 任务时间线</h2>
          <div className="space-y-3">
            {timeline.map((item) => (
              <div key={`${item.time}-${item.title}`} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-800">{item.title}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">{item.status}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{item.time}</div>
                <p className="text-slate-600 mt-2 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">📦 代码变更</h2>
            <ul className="space-y-3 text-sm">
              {codeChanges.map((c) => (
                <li key={c.file} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <div className="font-mono text-slate-800 break-all">{c.file}</div>
                  <div className="text-slate-600 mt-1">{c.change}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">💻 执行命令（摘要）</h2>
            <ul className="space-y-2 text-sm">
              {commands.map((cmd) => (
                <li key={cmd} className="rounded-lg bg-slate-900 text-slate-100 px-3 py-2 font-mono text-xs">
                  {cmd}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
