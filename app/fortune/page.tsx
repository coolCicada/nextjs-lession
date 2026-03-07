"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const colorOptions = [
  { id: "red", name: "红色", emoji: "🔴", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600" },
  { id: "blue", name: "蓝色", emoji: "🔵", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-600" },
  { id: "green", name: "绿色", emoji: "🟢", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
  { id: "yellow", name: "黄色", emoji: "🟡", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
  { id: "purple", name: "紫色", emoji: "🟣", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-600" },
  { id: "pink", name: "粉色", emoji: "🩷", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-600" },
  { id: "white", name: "白色", emoji: "⚪", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600" },
  { id: "black", name: "黑色", emoji: "⚫", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
];

const directionOptions = [
  { id: "east", name: "东方", emoji: "🌅", bg: "bg-orange-50", text: "text-orange-600" },
  { id: "south", name: "南方", emoji: "☀️", bg: "bg-amber-50", text: "text-amber-600" },
  { id: "west", name: "西方", emoji: "🌇", bg: "bg-rose-50", text: "text-rose-600" },
  { id: "north", name: "北方", emoji: "❄️", bg: "bg-sky-50", text: "text-sky-600" },
];

const numberOptions = [1, 2, 3, 5, 6, 7, 8, 9];

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

function generateFortune(birthday: string, preferences: {
  colors: string[];
  number: number | null;
  direction: string | null;
  sport: string | null;
}): FortuneResult {
  const birth = new Date(birthday);
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  const seed = month * 100 + day;
  const random = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;
  
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
  ];
  
  const loveTexts = [
    "单身的朋友有机会认识新朋友。",
    "和有缘分的人相处愉快。",
    "适合和伴侣一起规划未来。",
    "表达情感的好时机。",
    "保持真诚最重要。",
  ];
  
  const wealthTexts = [
    "理性消费，避免冲动购物。",
    "可能会有意外收入。",
    "适合开始小额投资。",
    "财运平稳，保持现状。",
  ];
  
  const healthTexts = [
    "注意休息，避免熬夜。",
    "适量运动身体好。",
    "饮食均衡很重要。",
    "保持心情愉快是第一位的。",
  ];
  
  const tips = [
    "今天适合尝试新事物。",
    "保持好奇心，会有收获。",
    "给自己一点耐心。",
    "和小动物相处会带来好运。",
    "听一首喜欢的歌吧。",
  ];
  
  const getText = (arr: string[]) => arr[Math.floor(random(arr.length))];
  
  const luckyColor = preferences.colors.length > 0 
    ? preferences.colors[Math.floor(random(preferences.colors.length))]
    : colorOptions[Math.floor(random(colorOptions.length))].id;
  
  return {
    overall: getText(overallTexts),
    career: getText(careerTexts),
    love: getText(loveTexts),
    wealth: getText(wealthTexts),
    health: getText(healthTexts),
    luckyColor,
    luckyNumber: preferences.number || Math.floor(random(9)) + 1,
    luckyDirection: preferences.direction || directionOptions[Math.floor(random(directionOptions.length))].id,
    luckySport: preferences.sport || sportOptions[Math.floor(random(sportOptions.length))].id,
    tip: getText(tips),
  };
}

function getZodiac(date: string) {
  if (!date) return "";
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  
  const zodiacs = [
    { name: "白羊座", emoji: "♈", start: [3, 21], end: [4, 19] },
    { name: "金牛座", emoji: "♉", start: [4, 20], end: [5, 20] },
    { name: "双子座", emoji: "♊", start: [5, 21], end: [6, 21] },
    { name: "巨蟹座", emoji: "♋", start: [6, 22], end: [7, 22] },
    { name: "狮子座", emoji: "♌", start: [7, 23], end: [8, 22] },
    { name: "处女座", emoji: "♍", start: [8, 23], end: [9, 22] },
    { name: "天秤座", emoji: "♎", start: [9, 23], end: [10, 23] },
    { name: "天蝎座", emoji: "♏", start: [10, 24], end: [11, 22] },
    { name: "射手座", emoji: "♐", start: [11, 23], end: [12, 21] },
    { name: "摩羯座", emoji: "♑", start: [12, 22], end: [1, 19] },
    { name: "水瓶座", emoji: "♒", start: [1, 20], end: [2, 18] },
    { name: "双鱼座", emoji: "♓", start: [2, 19], end: [3, 20] },
  ];
  
  for (const z of zodiacs) {
    if (month === z.start[0] && day >= z.start[1]) return `${z.emoji} ${z.name}`;
    if (month === z.end[0] && day <= z.end[1]) return `${z.emoji} ${z.name}`;
  }
  return "♑ 摩羯座";
}

export default function FortunePage() {
  const [birthday, setBirthday] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const toggleColor = (id: string) => {
    setSelectedColors(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };
  
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
  
  const reset = () => {
    setBirthday("");
    setSelectedColors([]);
    setSelectedNumber(null);
    setSelectedDirection(null);
    setSelectedSport(null);
    setResult(null);
    setShowResult(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-purple-50 text-slate-600">
      {/* 柔和光晕 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-200/30 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                ←
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">今日运势</h1>
                <p className="text-xs text-slate-400 mt-0.5">基于生日与偏好 · 仅供娱乐</p>
              </div>
            </div>
            
            {showResult && (
              <button
                onClick={reset}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors"
              >
                重新测算
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* 生日 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-5">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  🎂 你的阳历生日
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-rose-400"
                />
                {birthday && (
                  <p className="mt-2 text-sm text-slate-500">
                    {getZodiac(birthday)}
                  </p>
                )}
              </div>

              {/* 幸运颜色 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-5">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  🎨 幸运颜色（可多选）
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => {
                    const isSelected = selectedColors.includes(color.id);
                    return (
                      <button
                        key={color.id}
                        onClick={() => toggleColor(color.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                          isSelected
                            ? `${color.bg} ${color.border} border-2`
                            : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                        }`}
                      >
                        <span className="text-2xl">{color.emoji}</span>
                        <span className={`text-xs ${isSelected ? color.text : "text-slate-500"}`}>{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 幸运数字 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-5">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  🔢 幸运数字
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {numberOptions.map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedNumber(selectedNumber === num ? null : num)}
                      className={`p-3 rounded-xl text-lg font-bold transition-all ${
                        selectedNumber === num
                          ? "bg-rose-400 text-white shadow-lg shadow-rose-200"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* 幸运方向 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-5">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  🧭 幸运方向
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {directionOptions.map((dir) => {
                    const isSelected = selectedDirection === dir.id;
                    return (
                      <button
                        key={dir.id}
                        onClick={() => setSelectedDirection(isSelected ? null : dir.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                          isSelected
                            ? `${dir.bg} border-2 border-current ${dir.text}`
                            : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                        }`}
                      >
                        <span className="text-2xl">{dir.emoji}</span>
                        <span className={`text-sm ${isSelected ? dir.text : "text-slate-500"}`}>{dir.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 幸运运动 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-5">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  ⚽ 幸运运动
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {sportOptions.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => setSelectedSport(selectedSport === sport.id ? null : sport.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        selectedSport === sport.id
                          ? "bg-emerald-50 border-2 border-emerald-300"
                          : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                      }`}
                    >
                      <span className="text-2xl">{sport.emoji}</span>
                      <span className={`text-xs ${selectedSport === sport.id ? "text-emerald-600" : "text-slate-500"}`}>{sport.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 计算按钮 */}
              <button
                onClick={calculateFortune}
                disabled={!birthday}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                🔮 开始测算
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              {/* 总体运势 */}
              <div className="bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200 rounded-3xl p-6 text-center shadow-sm">
                <div className="text-5xl mb-3">✨</div>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">今日总体运势</h2>
                <p className="text-rose-600">{result?.overall}</p>
                <p className="mt-3 text-sm text-slate-500">
                  {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" })} · {getZodiac(birthday)}
                </p>
              </div>

              {/* 幸运元素 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: colorOptions.find(c => c.id === result?.luckyColor)?.emoji, label: "幸运颜色", value: colorOptions.find(c => c.id === result?.luckyColor)?.name },
                  { emoji: "🔢", label: "幸运数字", value: result?.luckyNumber },
                  { emoji: directionOptions.find(d => d.id === result?.luckyDirection)?.emoji, label: "幸运方向", value: directionOptions.find(d => d.id === result?.luckyDirection)?.name },
                  { emoji: sportOptions.find(s => s.id === result?.luckySport)?.emoji, label: "幸运运动", value: sportOptions.find(s => s.id === result?.luckySport)?.name },
                ].map((item, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-4 text-center">
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="font-medium text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* 各项运势 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-4">📊 各项运势详解</h3>
                
                <div className="space-y-3">
                  {[
                    { icon: "💼", label: "事业", text: result?.career, bg: "bg-blue-50" },
                    { icon: "💕", label: "爱情", text: result?.love, bg: "bg-rose-50" },
                    { icon: "💰", label: "财运", text: result?.wealth, bg: "bg-amber-50" },
                    { icon: "💪", label: "健康", text: result?.health, bg: "bg-emerald-50" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.bg}`}>
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="text-xs text-slate-500">{item.label}</p>
                        <p className="text-sm text-slate-700">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 今日建议 */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="font-semibold text-amber-700 flex items-center gap-2 mb-2">
                  💡 今日建议
                </h3>
                <p className="text-slate-700">{result?.tip}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
