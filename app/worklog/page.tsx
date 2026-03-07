type TaskStatus = 'active' | 'recurring' | 'done';

type Task = {
  id: string;
  title: string;
  source: 'feishu' | 'webchat';
  schedule: string;
  detail: string;
  status: TaskStatus;
};

const tasks: Task[] = [
  {
    id: 'pingpong-depart-20260308-1305',
    title: '乒乓球出发提醒（带手环/水/换衣服）',
    source: 'feishu',
    schedule: '2026-03-08 13:05',
    detail: '课前 20 分钟提醒出发，并提示携带清单。',
    status: 'active',
  },
  {
    id: 'pingpong-fee-20260308-1455',
    title: '乒乓球课后转教练费 270 元',
    source: 'feishu',
    schedule: '2026-03-08 14:55',
    detail: '1.5 小时课程，一次一结。',
    status: 'active',
  },
  {
    id: 'gold-monday-10k',
    title: '周一先投黄金 1w（总目标 2w）',
    source: 'feishu',
    schedule: '2026-03-09 14:50',
    detail: '作为本周黄金计划的第一笔。',
    status: 'active',
  },
  {
    id: 'gold-daily-1450',
    title: '黄金进度提醒（直到投完 2w）',
    source: 'feishu',
    schedule: '2026-03-09 ~ 2026-03-15 每天 14:50',
    detail: '每天提醒汇报已投/剩余，便于收口。',
    status: 'recurring',
  },
  {
    id: 'food-order-1731',
    title: '17:31 订饭提醒',
    source: 'feishu',
    schedule: '2026-03-07 17:31',
    detail: '一次性提醒，已执行。',
    status: 'done',
  },
  {
    id: 'haircut-after-pingpong',
    title: '打球回程顺路理发提醒',
    source: 'feishu',
    schedule: '2026-03-07 20:50',
    detail: '当日提醒已发送；后续改为明天再理。',
    status: 'done',
  },
  {
    id: 'pingpong-fee-followup',
    title: '教练费补提醒（21:00）',
    source: 'feishu',
    schedule: '2026-03-07 21:00',
    detail: '你说“现在没时间”，所以追加一次补提醒。',
    status: 'done',
  },
];

function statusConfig(status: TaskStatus) {
  if (status === 'active') {
    return { label: '进行中', cls: 'bg-blue-100 text-blue-700' };
  }
  if (status === 'recurring') {
    return { label: '周期规则', cls: 'bg-purple-100 text-purple-700' };
  }
  return { label: '已完成', cls: 'bg-slate-200 text-slate-700' };
}

function sourceLabel(source: Task['source']) {
  return source === 'feishu' ? '飞书对话' : '网页对话';
}

function TaskCard({ task }: { task: Task }) {
  const status = statusConfig(task.status);
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-slate-900 font-semibold">{task.title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${status.cls}`}>{status.label}</span>
      </div>
      <div className="mt-2 text-sm text-slate-600">{task.detail}</div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{sourceLabel(task.source)}</span>
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{task.schedule}</span>
      </div>
    </article>
  );
}

export default function WorklogV2Page() {
  const active = tasks.filter((t) => t.status === 'active');
  const recurring = tasks.filter((t) => t.status === 'recurring');
  const done = tasks.filter((t) => t.status === 'done');

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">📌 对话提醒总览（V2）</h1>
          <p className="text-slate-600 mt-2">
            这个页面聚焦“你在聊天里交代的提醒事项”，并按状态总览展示。
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-sm">
            <div className="rounded-xl bg-slate-100 p-3">
              <div className="text-slate-500">总计</div>
              <div className="text-xl font-semibold text-slate-900">{tasks.length}</div>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <div className="text-blue-700">进行中</div>
              <div className="text-xl font-semibold text-blue-800">{active.length}</div>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <div className="text-purple-700">周期规则</div>
              <div className="text-xl font-semibold text-purple-800">{recurring.length}</div>
            </div>
            <div className="rounded-xl bg-slate-200 p-3">
              <div className="text-slate-600">已完成</div>
              <div className="text-xl font-semibold text-slate-800">{done.length}</div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">🚀 进行中</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">🔁 周期规则</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurring.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">✅ 已完成</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {done.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
