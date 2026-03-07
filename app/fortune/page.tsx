"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 幸运颜色选项
const colorOptions = [
  { id: "red", name: "红色", emoji: "🔴", hex: "#ef4444" },
  { id: "blue", name: "蓝色", emoji: "🔵", hex: "#3b82f6" },
  { id: "green", name: "绿色", emoji: "🟢", hex: "#22c55e" },
  { id: "yellow", name: "黄色", emoji: "🟡", hex: "#eab308" },
  { id: "purple", name: "紫色", emoji: "🟣", hex: "#a855f7" },
  { id: "pink", name: "粉色", emoji: "🩷", hex: "#ec4899" },
  { id: "white", name: "白色", emoji: "⚪", hex: "#f8fafc" },
  { id: "black", name: "黑色", emoji: "⚫", hex: "#1e293b" },
];

// 幸运方向选项
const directionOptions = [
  { id: "east", name: "东方", emoji: "🌅" },
  { id: "south", name: "南方", emoji: "☀️" },
  { id: "west", name: "西方", emoji: "🌇" },
  { id: "north", name: "北方", emoji: "❄️" },
];

// 幸运数字选项
const numberOptions = [1, 2, 3, 5, 6, 7, 8, 9];

// 幸运运动选项
const sportOptions = [
  { id: "running", name: "跑步", emoji: "🏃" },
  { id: "swimming", name: "游泳", emoji: "🏊" },
  { id: "basketball", name: "篮球", emoji: "🏀" },
  { id: "football", name: "足球", emoji: "⚽" },
  { id: "tennis", name: "网球", emoji: "🎾" },
  { id: "pingpong", name: "乒乓球", emoji: "🏓" },
  { id: "yoga", name: "瑜伽", emoji: "🧘" },
  { id: "cycling", name: "骑行", emoji: "🚴" },
];

// 运势类型
interface FortuneResult {
  overall: string;
  career: string;
  love: string;
  wealth: string;
  health: string;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  luckySport: string;
  tip: string;
}

// 基于生日和偏好生成运势
function generateFortune(birthday: string, preferences: {
  colors: string[];
  number: number | null;
  direction: string | null;
  sport: string | null;
}): FortuneResult {
  // 解析生日
  const birth = new Date(birthday);
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  
  // 基础随机种子（基于生日）
  const seed = month * 100 + day;
  const random = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;
  
  // 运势描述库
  const overallTexts = [
    "今天你的能量满满，适合挑战新事物！",
    "保持平稳节奏的一天，不宜冒进。",
    "意外惊喜等着你，保持开放心态！",
    "需要耐心等待，好事多磨。",
    "人际关系带来好运，多和朋友聊聊。",
    "灵感爆棚，适合创作和思考。",
    "休息是为了走更远的路，给自己放个假。",
    "行动力满分，想到就去做！",
  ];
  
  const careerTexts = [
    "工作上可能有新的机会出现。",
    "保持专业，稳扎稳打会更好。",
    "和同事协作能提升效率。",
    "注意细节，避免低级错误。",
    "你的创意会得到认可。",
    "适合处理之前拖延的任务。",
    "可以主动承担更多责任。",
    "学习新技能会很有帮助。",
  ];
  
  const loveTexts = [
    "单身的朋友有机会认识新朋友。",
    "和有缘分的人相处愉快。",
    "适合和伴侣一起规划未来。",
    "表达情感的好时机。",
    "保持真诚最重要。",
    "独处也是美好的选择。",
    "朋友介绍可能有意想不到的惊喜。",
    "倾听对方很重要。",
  ];
  
  const wealthTexts = [
    "理性消费，避免冲动购物。",
    "可能会有意外收入。",
    "适合开始小额投资。",
    "财运平稳，保持现状。",
    "控制支出能存下钱。",
    "朋友可能带来赚钱机会。",
    "学习理财知识会有收获。",
    "慷慨会带来更多回报。",
  ];
  
  const healthTexts = [
    "注意休息，避免熬夜。",
    "适量运动身体好。",
    "饮食均衡很重要。",
    "保持心情愉快是第一位的。",
    "多喝水对身体有益。",
    "适合做一些舒缓的运动。",
    "关注心理健康。",
    "身体状态不错，保持规律。",
  ];
  
  const tips = [
    "今天适合尝试新事物。",
    "保持好奇心，会有收获。",
    "给自己一点耐心。",
    "和小动物相处会带来好运。",
    "听一首喜欢的歌吧。",
    "给重要的人发个消息。",
    "整理一下房间会有好心情。",
    "睡个好觉很重要。",
  ];
  
  // 生成结果
  const getText = (arr: string[]) => arr[Math.floor(random(arr.length))];
  
  // 确定幸运颜色
  const luckyColor = preferences.colors.length > 0 
    ? preferences.colors[Math.floor(random(preferences.colors.length))]
    : colorOptions[Math.floor(random(colorOptions.length))].id;
  
  // 确定幸运数字
  const luckyNumber = preferences.number || Math.floor(random(9)) + 1;
  
  // 确定幸运方向
  const luckyDirection = preferences.direction || directionOptions[Math.floor(random(directionOptions.length))].id;
  
  // 确定幸运运动
  const luckySport = preferences.sport || sportOptions[Math.floor(random(sportOptions.length))].id;
  
  return {
    overall: getText(overallTexts),
    career: getText(careerTexts),
    love: getText(loveTexts),
    wealth: getText(wealthTexts),
    health: getText(healthTexts),
    luckyColor,
    luckyNumber,
    luckyDirection,
    luckySport,
    tip: getText(tips),
  };
}

// 获取颜色信息
function getColorInfo(id: string) {
  return colorOptions.find(c => c.id === id) || colorOptions[0];
}

export default function FortunePage() {
  const [birthday, setBirthday] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // 切换颜色选择
  const toggleColor = (id: string) => {
    setSelectedColors(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };
  
  // 计算运势
  const calculateFortune = () => {
    if (!birthday) return;
    
    const fortune = generateFortune(birthday, {
      colors: selectedColors,
      number: selectedNumber,
      direction: selectedDirection,
      sport: selectedSport,
    });
    
    setResult(fortune);
    setShowResult(true);
  };
  
  // 重置
  const reset = () => {
    setBirthday("");
    setSelectedColors([]);
    setSelectedNumber(null);
    setSelectedDirection(null);
    setSelectedSport(null);
    setResult(null);
    setShowResult(false);
  };
  
  // 格式化生日显示
  const formatBirthday = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };
  
  // 获取星座
  const getZodiac = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    
    const zodiacs = [
      { name: "白羊座", emoji: "🐏", start: [3, 21], end: [4, 19] },
      { name: "金牛座", emoji: "🐂", start: [4, 20], end: [5, 20] },
      { name: "双子座", emoji: "👯", start: [5, 21], end: [6, 21] },
      { name: "巨蟹座", emoji: "🦀", start: [6, 22], end: [7, 22] },
      { name: "狮子座", emoji: "🦁", start: [7, 23], end: [8, 22] },
      { name: "处女座", emoji: "👸", start: [8, 23], end: [9, 22] },
      { name: "天秤座", emoji: "⚖️", start: [9, 23], end: [10, 23] },
      { name: "天蝎座", emoji: "🦂", start: [10, 24], end: [11, 22] },
      { name: "射手座", emoji: "🏹", start: [11, 23], end: [12, 21] },
      { name: "摩羯座", emoji: "🐐", start: [12, 22], end: [1, 19] },
      { name: "水瓶座", emoji: "🏺", start: [1, 20], end: [2, 18] },
      { name: "双鱼座", emoji: "🐟", start: [2, 19], end: [3, 20] },
    ];
    
    for (const z of zodiacs) {
      if (month === z.start[0] && day >= z.start[1]) return `${z.emoji} ${z.name}`;
      if (month === z.end[0] && day <= z.end[1]) return `${z.emoji} ${z.name}`;
    }
    return "🧘 摩羯座"; // default
  };
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* 背景星空效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm sticky top-0 bg-slate-950/80">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                ✨
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">今日运势</h1>
                <p className="text-xs text-slate-500">
                  基于生日与偏好 · 仅供参考
                </p>
              </div>
            </div>
            
            {showResult && (
              <button
                onClick={reset}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
              >
                重新测算
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 生日选择 */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  🎂 你的阳历生日
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
                {birthday && (
                  <p className="mt-2 text-sm text-slate-400">
                    星座：{getZodiac(birthday)}
                  </p>
                )}
              </div>

              {/* 幸运颜色 */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  🎨 幸运颜色（可多选）
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => toggleColor(color.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        selectedColors.includes(color.id)
                          ? "bg-purple-500/20 border-2 border-purple-500"
                          : "bg-slate-800 border-2 border-transparent hover:border-slate-600"
                      }`}
                    >
                      <span className="text-2xl">{color.emoji}</span>
                      <span className="text-xs text-slate-400">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 幸运数字 */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  🔢 幸运数字（单选）
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {numberOptions.map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedNumber(selectedNumber === num ? null : num)}
                      className={`p-3 rounded-xl text-lg font-bold transition-all ${
                        selectedNumber === num
                          ? "bg-purple-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* 幸运方向 */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  🧭 幸运方向（单选）
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {directionOptions.map((dir) => (
                    <button
                      key={dir.id}
                      onClick={() => setSelectedDirection(selectedDirection === dir.id ? null : dir.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        selectedDirection === dir.id
                          ? "bg-purple-500/20 border-2 border-purple-500"
                          : "bg-slate-800 border-2 border-transparent hover:border-slate-600"
                      }`}
                    >
                      <span className="text-2xl">{dir.emoji}</span>
                      <span className="text-sm text-slate-400">{dir.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 幸运运动 */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  ⚽ 幸运运动（单选）
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {sportOptions.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => setSelectedSport(selectedSport === sport.id ? null : sport.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        selectedSport === sport.id
                          ? "bg-purple-500/20 border-2 border-purple-500"
                          : "bg-slate-800 border-2 border-transparent hover:border-slate-600"
                      }`}
                    >
                      <span className="text-2xl">{sport.emoji}</span>
                      <span className="text-xs text-slate-400">{sport.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 计算按钮 */}
              <button
                onClick={calculateFortune}
                disabled={!birthday}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <span>🔮</span>
                开始测算
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* 总体运势 */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">🌟</div>
                <h2 className="text-2xl font-bold text-white mb-2">今日总体运势</h2>
                <p className="text-lg text-purple-300">{result?.overall}</p>
                <p className="mt-3 text-sm text-slate-400">
                  {formatBirthday(birthday)} · {getZodiac(birthday)}
                </p>
              </div>

              {/* 幸运元素 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">
                    {getColorInfo(result?.luckyColor || "red").emoji}
                  </div>
                  <p className="text-xs text-slate-500">幸运颜色</p>
                  <p className="text-sm font-medium">
                    {colorOptions.find(c => c.id === result?.luckyColor)?.name}
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">🔢</div>
                  <p className="text-xs text-slate-500">幸运数字</p>
                  <p className="text-sm font-medium">{result?.luckyNumber}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">
                    {directionOptions.find(d => d.id === result?.luckyDirection)?.emoji}
                  </div>
                  <p className="text-xs text-slate-500">幸运方向</p>
                  <p className="text-sm font-medium">
                    {directionOptions.find(d => d.id === result?.luckyDirection)?.name}
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">
                    {sportOptions.find(s => s.id === result?.luckySport)?.emoji}
                  </div>
                  <p className="text-xs text-slate-500">幸运运动</p>
                  <p className="text-sm font-medium">
                    {sportOptions.find(s => s.id === result?.luckySport)?.name}
                  </p>
                </div>
              </div>

              {/* 各项运势 */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  📊 各项运势详解
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-xl">💼</span>
                    <div>
                      <p className="text-xs text-slate-500">事业</p>
                      <p className="text-sm text-slate-300">{result?.career}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-xl">💕</span>
                    <div>
                      <p className="text-xs text-slate-500">爱情</p>
                      <p className="text-sm text-slate-300">{result?.love}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-xl">💰</span>
                    <div>
                      <p className="text-xs text-slate-500">财运</p>
                      <p className="text-sm text-slate-300">{result?.wealth}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-xl">💪</span>
                    <div>
                      <p className="text-xs text-slate-500">健康</p>
                      <p className="text-sm text-slate-300">{result?.health}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 今日建议 */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 mb-2">
                  💡 今日建议
                </h3>
                <p className="text-sm text-slate-300">{result?.tip}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-6 mt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-600">
          运势仅供娱乐 · 仅供参考
        </div>
      </footer>
    </div>
  );
}
