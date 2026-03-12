export type RatingHistoryPoint = {
  date: string;
  rating: number;
  points: number;
  event: string;
  delta: number;
};

export type Player = {
  id: string;
  name: string;
  city: string;
  club: string;
  hand: '右手' | '左手';
  style: string;
  currentRating: number;
  totalPoints: number;
  rank: number;
  form: {
    wins: number;
    losses: number;
  };
  bio: string;
  achievements: string[];
  ratingHistory: RatingHistoryPoint[];
};

export type TournamentParticipant = {
  playerId: string;
  seed: number;
  status: '已确认' | '候补';
};

export type TournamentMatch = {
  id: string;
  round: string;
  table: string;
  startTime: string;
  playerAId: string;
  playerBId: string;
  score: string;
  status: '已完成' | '未开始' | '进行中';
};

export type Tournament = {
  id: string;
  title: string;
  city: string;
  venue: string;
  date: string;
  signupDeadline: string;
  level: string;
  format: string;
  fee: number;
  organizer: string;
  status: '报名中' | '进行中' | '已结束';
  summary: string;
  tags: string[];
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
};

export const players: Player[] = [
  {
    id: 'lin-xiao',
    name: '林霄',
    city: '上海',
    club: 'SpinLab 浦东馆',
    hand: '右手',
    style: '两面弧圈快攻',
    currentRating: 2216,
    totalPoints: 1860,
    rank: 12,
    form: { wins: 18, losses: 6 },
    bio: '启动快，反手先上手能力强，前三板压迫感足，适合快节奏单打。',
    achievements: ['2026 冬季天梯冠军', '城市周赛 3 次领奖台'],
    ratingHistory: [
      { date: '2025-10-12', rating: 2090, points: 1610, event: '浦东天梯赛', delta: 18 },
      { date: '2025-11-16', rating: 2118, points: 1655, event: '公开单打 #7', delta: 28 },
      { date: '2025-12-14', rating: 2145, points: 1708, event: '滨江杯', delta: 27 },
      { date: '2026-01-18', rating: 2179, points: 1766, event: '冬季天梯总决赛', delta: 34 },
      { date: '2026-02-22', rating: 2201, points: 1815, event: '苏州周末公开赛', delta: 22 },
      { date: '2026-03-01', rating: 2216, points: 1860, event: '都会对抗赛', delta: 15 },
    ],
  },
  {
    id: 'zhao-chen',
    name: '赵晨',
    city: '杭州',
    club: '西湖乒乓俱乐部',
    hand: '左手',
    style: '正手主导型进攻',
    currentRating: 2168,
    totalPoints: 1792,
    rank: 19,
    form: { wins: 14, losses: 7 },
    bio: '左手进攻型选手，擅长发球后抢攻，前三板质量高，中路压制明显。',
    achievements: ['2025 杭州公开赛亚军', '团体联赛 MVP'],
    ratingHistory: [
      { date: '2025-10-19', rating: 2058, points: 1540, event: '钱塘系列赛', delta: 16 },
      { date: '2025-11-23', rating: 2084, points: 1602, event: '杭州公开赛', delta: 26 },
      { date: '2025-12-21', rating: 2106, points: 1658, event: '俱乐部大师赛', delta: 22 },
      { date: '2026-01-11', rating: 2130, points: 1706, event: '新年邀请赛', delta: 24 },
      { date: '2026-02-08', rating: 2150, points: 1750, event: '浙江巡回赛', delta: 20 },
      { date: '2026-03-02', rating: 2168, points: 1792, event: '都会对抗赛', delta: 18 },
    ],
  },
  {
    id: 'wang-yue',
    name: '王越',
    city: '南京',
    club: '金陵对冲俱乐部',
    hand: '右手',
    style: '相持反拉型',
    currentRating: 2134,
    totalPoints: 1748,
    rank: 27,
    form: { wins: 13, losses: 8 },
    bio: '比赛气质稳定，反拉相持能力好，后半段韧性强。',
    achievements: ['2025 江苏公开赛四强', '区域混合团体冠军'],
    ratingHistory: [
      { date: '2025-10-05', rating: 2022, points: 1495, event: '秋季巡回赛', delta: 12 },
      { date: '2025-11-09', rating: 2048, points: 1546, event: '金陵公开赛', delta: 26 },
      { date: '2025-12-07', rating: 2075, points: 1604, event: '12 月天梯赛', delta: 27 },
      { date: '2026-01-25', rating: 2102, points: 1661, event: '江苏杯', delta: 27 },
      { date: '2026-02-15', rating: 2118, points: 1709, event: '城市挑战赛', delta: 16 },
      { date: '2026-03-03', rating: 2134, points: 1748, event: '都会对抗赛', delta: 16 },
    ],
  },
  {
    id: 'liu-ming',
    name: '刘铭',
    city: '苏州',
    club: '丝路旋转联盟',
    hand: '右手',
    style: '发抢前三板',
    currentRating: 2089,
    totalPoints: 1686,
    rank: 41,
    form: { wins: 11, losses: 9 },
    bio: '进攻节奏紧凑，依赖发球变化和正手衔接，前三板威胁大。',
    achievements: ['苏州周末公开赛冠军'],
    ratingHistory: [
      { date: '2025-10-26', rating: 1988, points: 1458, event: '园区天梯赛', delta: 14 },
      { date: '2025-11-30', rating: 2011, points: 1510, event: '周末公开赛', delta: 23 },
      { date: '2025-12-28', rating: 2038, points: 1574, event: '丝路杯', delta: 27 },
      { date: '2026-01-19', rating: 2056, points: 1618, event: '冬季联赛', delta: 18 },
      { date: '2026-02-22', rating: 2074, points: 1659, event: '苏州周末公开赛', delta: 18 },
      { date: '2026-03-05', rating: 2089, points: 1686, event: '训练对抗日', delta: 15 },
    ],
  },
  {
    id: 'he-ning',
    name: '何宁',
    city: '北京',
    club: '北环学院',
    hand: '左手',
    style: '近台快挡控制',
    currentRating: 2052,
    totalPoints: 1622,
    rank: 56,
    form: { wins: 10, losses: 10 },
    bio: '善于借力和落点控制，能用节奏变化打乱对手连续进攻。',
    achievements: ['北京区级系列赛冠军'],
    ratingHistory: [
      { date: '2025-10-18', rating: 1954, points: 1402, event: '北环天梯赛', delta: 10 },
      { date: '2025-11-15', rating: 1982, points: 1461, event: '区级系列赛', delta: 28 },
      { date: '2025-12-20', rating: 2003, points: 1510, event: '京城公开赛', delta: 21 },
      { date: '2026-01-17', rating: 2027, points: 1556, event: '冬季快挡杯', delta: 24 },
      { date: '2026-02-14', rating: 2040, points: 1590, event: '春季单打赛', delta: 13 },
      { date: '2026-03-07', rating: 2052, points: 1622, event: '北环天梯赛', delta: 12 },
    ],
  },
  {
    id: 'sun-jia',
    name: '孙佳',
    city: '深圳',
    club: '湾区拍感实验室',
    hand: '右手',
    style: '均衡型全台',
    currentRating: 2018,
    totalPoints: 1574,
    rank: 68,
    form: { wins: 9, losses: 9 },
    bio: '节奏均衡，摆短和落点处理细腻，过渡球稳定。',
    achievements: ['华南巡回赛八强'],
    ratingHistory: [
      { date: '2025-10-11', rating: 1931, points: 1355, event: '港湾公开赛', delta: 11 },
      { date: '2025-11-08', rating: 1950, points: 1406, event: '湾区天梯赛', delta: 19 },
      { date: '2025-12-13', rating: 1974, points: 1463, event: '华南巡回赛', delta: 24 },
      { date: '2026-01-10', rating: 1990, points: 1496, event: '冬季联赛', delta: 16 },
      { date: '2026-02-07', rating: 2006, points: 1538, event: '周六公开赛', delta: 16 },
      { date: '2026-03-06', rating: 2018, points: 1574, event: '湾区俱乐部杯', delta: 12 },
    ],
  },
  {
    id: 'gao-feng',
    name: '高峰',
    city: '成都',
    club: '竹影旋转馆',
    hand: '右手',
    style: '重旋转正手',
    currentRating: 1986,
    totalPoints: 1512,
    rank: 80,
    form: { wins: 8, losses: 10 },
    bio: '擅长慢节奏重旋转拉冲，打被动型对手时效果更明显。',
    achievements: ['2025 西南联赛冠军'],
    ratingHistory: [
      { date: '2025-10-04', rating: 1898, points: 1308, event: '熊猫天梯赛', delta: 9 },
      { date: '2025-11-01', rating: 1916, points: 1352, event: '西部公开赛', delta: 18 },
      { date: '2025-12-06', rating: 1942, points: 1410, event: '西南联赛', delta: 26 },
      { date: '2026-01-03', rating: 1960, points: 1455, event: '假日杯', delta: 18 },
      { date: '2026-02-01', rating: 1975, points: 1488, event: '二月天梯赛', delta: 15 },
      { date: '2026-03-08', rating: 1986, points: 1512, event: '城市周赛', delta: 11 },
    ],
  },
  {
    id: 'chen-yi',
    name: '陈逸',
    city: '广州',
    club: '珠江乒乓馆',
    hand: '左手',
    style: '快节奏反击',
    currentRating: 1968,
    totalPoints: 1486,
    rank: 91,
    form: { wins: 8, losses: 11 },
    bio: '左手快攻型，平击反带节奏快，台内速度优势明显。',
    achievements: ['珠江杯四强'],
    ratingHistory: [
      { date: '2025-10-25', rating: 1884, points: 1294, event: '珠江杯', delta: 12 },
      { date: '2025-11-22', rating: 1902, points: 1332, event: '羊城周末赛', delta: 18 },
      { date: '2025-12-27', rating: 1928, points: 1391, event: '华南公开赛', delta: 26 },
      { date: '2026-01-24', rating: 1940, points: 1426, event: '一月对抗赛', delta: 12 },
      { date: '2026-02-21', rating: 1956, points: 1460, event: '珠江天梯赛', delta: 16 },
      { date: '2026-03-09', rating: 1968, points: 1486, event: '训练公开日', delta: 12 },
    ],
  },
];

export const tournaments: Tournament[] = [
  {
    id: 'metro-spring-open-2026',
    title: '都会春季公开赛 2026',
    city: '上海',
    venue: '静安旋转中心',
    date: '2026-03-21',
    signupDeadline: '2026-03-18',
    level: '公开单打 1900+',
    format: '小组赛 + 正赛',
    fee: 128,
    organizer: 'OC 开球实验室',
    status: '报名中',
    summary: '面向活跃天梯选手的城市公开赛，至少保证两场小组赛，再进入淘汰阶段。',
    tags: ['城市公开赛', '周末', '计入积分'],
    participants: [
      { playerId: 'lin-xiao', seed: 1, status: '已确认' },
      { playerId: 'zhao-chen', seed: 2, status: '已确认' },
      { playerId: 'wang-yue', seed: 3, status: '已确认' },
      { playerId: 'liu-ming', seed: 4, status: '已确认' },
      { playerId: 'he-ning', seed: 5, status: '已确认' },
      { playerId: 'sun-jia', seed: 6, status: '已确认' },
      { playerId: 'gao-feng', seed: 7, status: '已确认' },
      { playerId: 'chen-yi', seed: 8, status: '候补' },
    ],
    matches: [
      {
        id: 'metro-qf-1',
        round: 'A 组',
        table: '3 号台',
        startTime: '2026-03-21 09:40',
        playerAId: 'lin-xiao',
        playerBId: 'gao-feng',
        score: '未开赛',
        status: '未开始',
      },
      {
        id: 'metro-qf-2',
        round: 'B 组',
        table: '1 号台',
        startTime: '2026-03-21 10:20',
        playerAId: 'zhao-chen',
        playerBId: 'sun-jia',
        score: '未开赛',
        status: '未开始',
      },
    ],
  },
  {
    id: 'suzhou-weekend-ladder-5',
    title: '苏州周末天梯赛 #5',
    city: '苏州',
    venue: '丝路旋转馆',
    date: '2026-03-14',
    signupDeadline: '2026-03-13',
    level: '进阶组 1700-2200',
    format: '瑞士制 6 轮',
    fee: 98,
    organizer: '丝路旋转联盟',
    status: '进行中',
    summary: '适合需要高密度对抗和当日更新积分的快节奏瑞士制赛事。',
    tags: ['进行中', '瑞士制', '区域赛'],
    participants: [
      { playerId: 'liu-ming', seed: 1, status: '已确认' },
      { playerId: 'wang-yue', seed: 2, status: '已确认' },
      { playerId: 'he-ning', seed: 3, status: '已确认' },
      { playerId: 'sun-jia', seed: 4, status: '已确认' },
      { playerId: 'gao-feng', seed: 5, status: '已确认' },
      { playerId: 'chen-yi', seed: 6, status: '已确认' },
    ],
    matches: [
      {
        id: 'suzhou-r4-1',
        round: '第 4 轮',
        table: '2 号台',
        startTime: '2026-03-14 14:00',
        playerAId: 'liu-ming',
        playerBId: 'he-ning',
        score: '2:1',
        status: '进行中',
      },
      {
        id: 'suzhou-r4-2',
        round: '第 4 轮',
        table: '5 号台',
        startTime: '2026-03-14 14:05',
        playerAId: 'wang-yue',
        playerBId: 'chen-yi',
        score: '1:0',
        status: '进行中',
      },
      {
        id: 'suzhou-r3-1',
        round: '第 3 轮',
        table: '1 号台',
        startTime: '2026-03-14 12:30',
        playerAId: 'sun-jia',
        playerBId: 'gao-feng',
        score: '3:0',
        status: '已完成',
      },
    ],
  },
  {
    id: 'hangzhou-night-cup',
    title: '杭州夜场杯',
    city: '杭州',
    venue: '西湖乒乓馆',
    date: '2026-03-28',
    signupDeadline: '2026-03-25',
    level: '公开单打',
    format: '双败淘汰',
    fee: 88,
    organizer: '西湖乒乓俱乐部',
    status: '报名中',
    summary: '面向上班族的夜场赛事，不占用整天时间，也能打到完整签表体验。',
    tags: ['夜场', '公开赛', '城市积分'],
    participants: [
      { playerId: 'zhao-chen', seed: 1, status: '已确认' },
      { playerId: 'lin-xiao', seed: 2, status: '已确认' },
      { playerId: 'sun-jia', seed: 3, status: '已确认' },
      { playerId: 'chen-yi', seed: 4, status: '已确认' },
    ],
    matches: [
      {
        id: 'hz-r1-1',
        round: '胜者组第一轮',
        table: '4 号台',
        startTime: '2026-03-28 19:20',
        playerAId: 'zhao-chen',
        playerBId: 'chen-yi',
        score: '未开赛',
        status: '未开始',
      },
    ],
  },
  {
    id: 'beijing-block-masters',
    title: '北京控制大师赛',
    city: '北京',
    venue: '北环学院',
    date: '2026-02-28',
    signupDeadline: '2026-02-24',
    level: '打法主题赛',
    format: '循环赛 + 决赛',
    fee: 138,
    organizer: '北环学院',
    status: '已结束',
    summary: '偏邀请制的特色赛事，主打生胶、长胶、挡推等节奏变化型对抗。',
    tags: ['已结束', '邀请赛', '特殊打法'],
    participants: [
      { playerId: 'he-ning', seed: 1, status: '已确认' },
      { playerId: 'gao-feng', seed: 2, status: '已确认' },
      { playerId: 'liu-ming', seed: 3, status: '已确认' },
      { playerId: 'wang-yue', seed: 4, status: '已确认' },
    ],
    matches: [
      {
        id: 'bj-final',
        round: '决赛',
        table: '中心台',
        startTime: '2026-02-28 18:30',
        playerAId: 'he-ning',
        playerBId: 'wang-yue',
        score: '1:3',
        status: '已完成',
      },
    ],
  },
];

export function getPlayerById(id: string) {
  return players.find((player) => player.id === id);
}

export function getTournamentById(id: string) {
  return tournaments.find((tournament) => tournament.id === id);
}

export function searchPlayers(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return players;

  return players.filter((player) => {
    return [player.name, player.city, player.club].some((value) =>
      value.toLowerCase().includes(normalized),
    );
  });
}

export function searchTournaments(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return tournaments;

  return tournaments.filter((tournament) => {
    return [tournament.title, tournament.city, tournament.venue].some((value) =>
      value.toLowerCase().includes(normalized),
    );
  });
}

export function getTournamentParticipants(tournament: Tournament) {
  return tournament.participants
    .map((entry) => {
      const player = getPlayerById(entry.playerId);
      return player ? { ...entry, player } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((left, right) => left.seed - right.seed);
}

export function getRecentMatches(limit = 6) {
  return tournaments
    .flatMap((tournament) =>
      tournament.matches.map((match) => ({
        ...match,
        tournamentId: tournament.id,
        tournamentTitle: tournament.title,
        city: tournament.city,
      })),
    )
    .sort((left, right) => left.startTime.localeCompare(right.startTime))
    .slice(0, limit);
}

export function getRatingSummary(player: Player) {
  const first = player.ratingHistory[0];
  const last = player.ratingHistory[player.ratingHistory.length - 1];

  return {
    gain: last.rating - first.rating,
    pointsGain: last.points - first.points,
    lastEvent: last.event,
  };
}
