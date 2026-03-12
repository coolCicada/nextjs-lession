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
  hand: 'Right' | 'Left';
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
  status: 'Confirmed' | 'Waitlist';
};

export type TournamentMatch = {
  id: string;
  round: string;
  table: string;
  startTime: string;
  playerAId: string;
  playerBId: string;
  score: string;
  status: 'Finished' | 'Upcoming' | 'Live';
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
  status: 'Open' | 'Live' | 'Closed';
  summary: string;
  tags: string[];
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
};

export const players: Player[] = [
  {
    id: 'lin-xiao',
    name: 'Lin Xiao',
    city: 'Shanghai',
    club: 'SpinLab Pudong',
    hand: 'Right',
    style: 'Two-wing topspin',
    currentRating: 2216,
    totalPoints: 1860,
    rank: 12,
    form: { wins: 18, losses: 6 },
    bio: 'Fast starter with aggressive backhand opening and strong receive game in short format events.',
    achievements: ['2026 Winter Ladder champion', '3x city weekly podium'],
    ratingHistory: [
      {
        date: '2025-10-12',
        rating: 2090,
        points: 1610,
        event: 'Pudong Ladder',
        delta: 18,
      },
      {
        date: '2025-11-16',
        rating: 2118,
        points: 1655,
        event: 'Open Singles #7',
        delta: 28,
      },
      {
        date: '2025-12-14',
        rating: 2145,
        points: 1708,
        event: 'River Cup',
        delta: 27,
      },
      {
        date: '2026-01-18',
        rating: 2179,
        points: 1766,
        event: 'Winter Ladder Finals',
        delta: 34,
      },
      {
        date: '2026-02-22',
        rating: 2201,
        points: 1815,
        event: 'Suzhou Weekend Open',
        delta: 22,
      },
      {
        date: '2026-03-01',
        rating: 2216,
        points: 1860,
        event: 'Metro Rally',
        delta: 15,
      },
    ],
  },
  {
    id: 'zhao-chen',
    name: 'Zhao Chen',
    city: 'Hangzhou',
    club: 'West Lake TTC',
    hand: 'Left',
    style: 'Forehand-dominant attacker',
    currentRating: 2168,
    totalPoints: 1792,
    rank: 19,
    form: { wins: 14, losses: 7 },
    bio: 'Lefty attacker who likes to dictate from serve plus first ball and pressure middle transitions.',
    achievements: ['2025 Hangzhou Open finalist', 'Team league MVP'],
    ratingHistory: [
      {
        date: '2025-10-19',
        rating: 2058,
        points: 1540,
        event: 'Qiantang Series',
        delta: 16,
      },
      {
        date: '2025-11-23',
        rating: 2084,
        points: 1602,
        event: 'Hangzhou Open',
        delta: 26,
      },
      {
        date: '2025-12-21',
        rating: 2106,
        points: 1658,
        event: 'Club Masters',
        delta: 22,
      },
      {
        date: '2026-01-11',
        rating: 2130,
        points: 1706,
        event: 'New Year Invitational',
        delta: 24,
      },
      {
        date: '2026-02-08',
        rating: 2150,
        points: 1750,
        event: 'Zhejiang Circuit',
        delta: 20,
      },
      {
        date: '2026-03-02',
        rating: 2168,
        points: 1792,
        event: 'Metro Rally',
        delta: 18,
      },
    ],
  },
  {
    id: 'wang-yue',
    name: 'Wang Yue',
    city: 'Nanjing',
    club: 'Jinling Rally Club',
    hand: 'Right',
    style: 'Counter-loop allrounder',
    currentRating: 2134,
    totalPoints: 1748,
    rank: 27,
    form: { wins: 13, losses: 8 },
    bio: 'Reliable match player with strong rally tolerance and late-round consistency.',
    achievements: ['2025 Jiangsu Open top 4', 'Regional mixed team winner'],
    ratingHistory: [
      {
        date: '2025-10-05',
        rating: 2022,
        points: 1495,
        event: 'Autumn Circuit',
        delta: 12,
      },
      {
        date: '2025-11-09',
        rating: 2048,
        points: 1546,
        event: 'Jinling Open',
        delta: 26,
      },
      {
        date: '2025-12-07',
        rating: 2075,
        points: 1604,
        event: 'December Ladder',
        delta: 27,
      },
      {
        date: '2026-01-25',
        rating: 2102,
        points: 1661,
        event: 'Jiangsu Cup',
        delta: 27,
      },
      {
        date: '2026-02-15',
        rating: 2118,
        points: 1709,
        event: 'City Challenge',
        delta: 16,
      },
      {
        date: '2026-03-03',
        rating: 2134,
        points: 1748,
        event: 'Metro Rally',
        delta: 16,
      },
    ],
  },
  {
    id: 'liu-ming',
    name: 'Liu Ming',
    city: 'Suzhou',
    club: 'Silk Spin Union',
    hand: 'Right',
    style: 'Serve-and-third-ball',
    currentRating: 2089,
    totalPoints: 1686,
    rank: 41,
    form: { wins: 11, losses: 9 },
    bio: 'Compact offensive game built around heavy serves and quick forehand follow-up.',
    achievements: ['Suzhou Weekend Open champion'],
    ratingHistory: [
      {
        date: '2025-10-26',
        rating: 1988,
        points: 1458,
        event: 'Garden City Ladder',
        delta: 14,
      },
      {
        date: '2025-11-30',
        rating: 2011,
        points: 1510,
        event: 'Weekend Open',
        delta: 23,
      },
      {
        date: '2025-12-28',
        rating: 2038,
        points: 1574,
        event: 'Silk Road Cup',
        delta: 27,
      },
      {
        date: '2026-01-19',
        rating: 2056,
        points: 1618,
        event: 'Winter League',
        delta: 18,
      },
      {
        date: '2026-02-22',
        rating: 2074,
        points: 1659,
        event: 'Suzhou Weekend Open',
        delta: 18,
      },
      {
        date: '2026-03-05',
        rating: 2089,
        points: 1686,
        event: 'Training Matchday',
        delta: 15,
      },
    ],
  },
  {
    id: 'he-ning',
    name: 'He Ning',
    city: 'Beijing',
    club: 'North Loop Academy',
    hand: 'Left',
    style: 'Close-to-table blocker',
    currentRating: 2052,
    totalPoints: 1622,
    rank: 56,
    form: { wins: 10, losses: 10 },
    bio: 'Absorbs pace well and frustrates attackers with angle changes and early timing.',
    achievements: ['Beijing district series winner'],
    ratingHistory: [
      {
        date: '2025-10-18',
        rating: 1954,
        points: 1402,
        event: 'North Ring Ladder',
        delta: 10,
      },
      {
        date: '2025-11-15',
        rating: 1982,
        points: 1461,
        event: 'District Series',
        delta: 28,
      },
      {
        date: '2025-12-20',
        rating: 2003,
        points: 1510,
        event: 'Capital Open',
        delta: 21,
      },
      {
        date: '2026-01-17',
        rating: 2027,
        points: 1556,
        event: 'Winter Block Cup',
        delta: 24,
      },
      {
        date: '2026-02-14',
        rating: 2040,
        points: 1590,
        event: 'Spring Singles',
        delta: 13,
      },
      {
        date: '2026-03-07',
        rating: 2052,
        points: 1622,
        event: 'North Loop Ladder',
        delta: 12,
      },
    ],
  },
  {
    id: 'sun-jia',
    name: 'Sun Jia',
    city: 'Shenzhen',
    club: 'Bay Area Paddle Lab',
    hand: 'Right',
    style: 'Balanced all-court',
    currentRating: 2018,
    totalPoints: 1574,
    rank: 68,
    form: { wins: 9, losses: 9 },
    bio: 'Steady placement-oriented player with solid touch in doubles-style transitions.',
    achievements: ['South Circuit top 8'],
    ratingHistory: [
      {
        date: '2025-10-11',
        rating: 1931,
        points: 1355,
        event: 'Harbor Open',
        delta: 11,
      },
      {
        date: '2025-11-08',
        rating: 1950,
        points: 1406,
        event: 'Bay Ladder',
        delta: 19,
      },
      {
        date: '2025-12-13',
        rating: 1974,
        points: 1463,
        event: 'South Circuit',
        delta: 24,
      },
      {
        date: '2026-01-10',
        rating: 1990,
        points: 1496,
        event: 'Winter League',
        delta: 16,
      },
      {
        date: '2026-02-07',
        rating: 2006,
        points: 1538,
        event: 'Open Saturday',
        delta: 16,
      },
      {
        date: '2026-03-06',
        rating: 2018,
        points: 1574,
        event: 'Bay Club Cup',
        delta: 12,
      },
    ],
  },
  {
    id: 'gao-feng',
    name: 'Gao Feng',
    city: 'Chengdu',
    club: 'Bamboo Spin House',
    hand: 'Right',
    style: 'Heavy spin forehand',
    currentRating: 1986,
    totalPoints: 1512,
    rank: 80,
    form: { wins: 8, losses: 10 },
    bio: 'Prefers slower setups and heavy spin exchanges, especially effective against passive blockers.',
    achievements: ['2025 Southwest league champion'],
    ratingHistory: [
      {
        date: '2025-10-04',
        rating: 1898,
        points: 1308,
        event: 'Panda Ladder',
        delta: 9,
      },
      {
        date: '2025-11-01',
        rating: 1916,
        points: 1352,
        event: 'West Open',
        delta: 18,
      },
      {
        date: '2025-12-06',
        rating: 1942,
        points: 1410,
        event: 'Southwest League',
        delta: 26,
      },
      {
        date: '2026-01-03',
        rating: 1960,
        points: 1455,
        event: 'Holiday Cup',
        delta: 18,
      },
      {
        date: '2026-02-01',
        rating: 1975,
        points: 1488,
        event: 'February Ladder',
        delta: 15,
      },
      {
        date: '2026-03-08',
        rating: 1986,
        points: 1512,
        event: 'City Weekly',
        delta: 11,
      },
    ],
  },
  {
    id: 'chen-yi',
    name: 'Chen Yi',
    city: 'Guangzhou',
    club: 'Pearl River TTC',
    hand: 'Left',
    style: 'Fast counter driver',
    currentRating: 1968,
    totalPoints: 1486,
    rank: 91,
    form: { wins: 8, losses: 11 },
    bio: 'High-tempo lefty with flat counters and fast pace over the table.',
    achievements: ['Pearl Cup semifinalist'],
    ratingHistory: [
      {
        date: '2025-10-25',
        rating: 1884,
        points: 1294,
        event: 'Pearl Cup',
        delta: 12,
      },
      {
        date: '2025-11-22',
        rating: 1902,
        points: 1332,
        event: 'Canton Weekend',
        delta: 18,
      },
      {
        date: '2025-12-27',
        rating: 1928,
        points: 1391,
        event: 'South Open',
        delta: 26,
      },
      {
        date: '2026-01-24',
        rating: 1940,
        points: 1426,
        event: 'January Rally',
        delta: 12,
      },
      {
        date: '2026-02-21',
        rating: 1956,
        points: 1460,
        event: 'Pearl Ladder',
        delta: 16,
      },
      {
        date: '2026-03-09',
        rating: 1968,
        points: 1486,
        event: 'Training Open',
        delta: 12,
      },
    ],
  },
];

export const tournaments: Tournament[] = [
  {
    id: 'metro-spring-open-2026',
    title: 'Metro Spring Open 2026',
    city: 'Shanghai',
    venue: 'Jingan Spin Center',
    date: '2026-03-21',
    signupDeadline: '2026-03-18',
    level: 'Open Singles 1900+',
    format: 'Groups + main draw',
    fee: 128,
    organizer: 'OC Pingpong Lab',
    status: 'Open',
    summary:
      'Open city event built for active ladder players with two guaranteed group matches before knockouts.',
    tags: ['City open', 'Weekend', 'Points included'],
    participants: [
      { playerId: 'lin-xiao', seed: 1, status: 'Confirmed' },
      { playerId: 'zhao-chen', seed: 2, status: 'Confirmed' },
      { playerId: 'wang-yue', seed: 3, status: 'Confirmed' },
      { playerId: 'liu-ming', seed: 4, status: 'Confirmed' },
      { playerId: 'he-ning', seed: 5, status: 'Confirmed' },
      { playerId: 'sun-jia', seed: 6, status: 'Confirmed' },
      { playerId: 'gao-feng', seed: 7, status: 'Confirmed' },
      { playerId: 'chen-yi', seed: 8, status: 'Waitlist' },
    ],
    matches: [
      {
        id: 'metro-qf-1',
        round: 'Group A',
        table: 'Table 3',
        startTime: '2026-03-21 09:40',
        playerAId: 'lin-xiao',
        playerBId: 'gao-feng',
        score: 'vs',
        status: 'Upcoming',
      },
      {
        id: 'metro-qf-2',
        round: 'Group B',
        table: 'Table 1',
        startTime: '2026-03-21 10:20',
        playerAId: 'zhao-chen',
        playerBId: 'sun-jia',
        score: 'vs',
        status: 'Upcoming',
      },
    ],
  },
  {
    id: 'suzhou-weekend-ladder-5',
    title: 'Suzhou Weekend Ladder #5',
    city: 'Suzhou',
    venue: 'Silk Spin Arena',
    date: '2026-03-14',
    signupDeadline: '2026-03-13',
    level: 'Advanced Ladder 1700-2200',
    format: 'Swiss 6 rounds',
    fee: 98,
    organizer: 'Silk Spin Union',
    status: 'Live',
    summary:
      'Fast Swiss event for players needing dense match volume and same-day rating updates.',
    tags: ['Live', 'Swiss', 'Regional'],
    participants: [
      { playerId: 'liu-ming', seed: 1, status: 'Confirmed' },
      { playerId: 'wang-yue', seed: 2, status: 'Confirmed' },
      { playerId: 'he-ning', seed: 3, status: 'Confirmed' },
      { playerId: 'sun-jia', seed: 4, status: 'Confirmed' },
      { playerId: 'gao-feng', seed: 5, status: 'Confirmed' },
      { playerId: 'chen-yi', seed: 6, status: 'Confirmed' },
    ],
    matches: [
      {
        id: 'suzhou-r4-1',
        round: 'Round 4',
        table: 'Table 2',
        startTime: '2026-03-14 14:00',
        playerAId: 'liu-ming',
        playerBId: 'he-ning',
        score: '2:1',
        status: 'Live',
      },
      {
        id: 'suzhou-r4-2',
        round: 'Round 4',
        table: 'Table 5',
        startTime: '2026-03-14 14:05',
        playerAId: 'wang-yue',
        playerBId: 'chen-yi',
        score: '1:0',
        status: 'Live',
      },
      {
        id: 'suzhou-r3-1',
        round: 'Round 3',
        table: 'Table 1',
        startTime: '2026-03-14 12:30',
        playerAId: 'sun-jia',
        playerBId: 'gao-feng',
        score: '3:0',
        status: 'Finished',
      },
    ],
  },
  {
    id: 'hangzhou-night-cup',
    title: 'Hangzhou Night Cup',
    city: 'Hangzhou',
    venue: 'West Lake TTC Hall',
    date: '2026-03-28',
    signupDeadline: '2026-03-25',
    level: 'Open Singles',
    format: 'Double elimination',
    fee: 88,
    organizer: 'West Lake TTC',
    status: 'Open',
    summary:
      'Night-session event tuned for office-hour players who want bracket play without a full-day commitment.',
    tags: ['Night event', 'Open', 'City points'],
    participants: [
      { playerId: 'zhao-chen', seed: 1, status: 'Confirmed' },
      { playerId: 'lin-xiao', seed: 2, status: 'Confirmed' },
      { playerId: 'sun-jia', seed: 3, status: 'Confirmed' },
      { playerId: 'chen-yi', seed: 4, status: 'Confirmed' },
    ],
    matches: [
      {
        id: 'hz-r1-1',
        round: 'Winner Bracket R1',
        table: 'Table 4',
        startTime: '2026-03-28 19:20',
        playerAId: 'zhao-chen',
        playerBId: 'chen-yi',
        score: 'vs',
        status: 'Upcoming',
      },
    ],
  },
  {
    id: 'beijing-block-masters',
    title: 'Beijing Block Masters',
    city: 'Beijing',
    venue: 'North Loop Academy',
    date: '2026-02-28',
    signupDeadline: '2026-02-24',
    level: 'Style Showcase',
    format: 'Round robin + finals',
    fee: 138,
    organizer: 'North Loop Academy',
    status: 'Closed',
    summary:
      'Invitation-style event centered on short-pips, blockers, and off-tempo matchups.',
    tags: ['Closed', 'Invite', 'Featured styles'],
    participants: [
      { playerId: 'he-ning', seed: 1, status: 'Confirmed' },
      { playerId: 'gao-feng', seed: 2, status: 'Confirmed' },
      { playerId: 'liu-ming', seed: 3, status: 'Confirmed' },
      { playerId: 'wang-yue', seed: 4, status: 'Confirmed' },
    ],
    matches: [
      {
        id: 'bj-final',
        round: 'Final',
        table: 'Center',
        startTime: '2026-02-28 18:30',
        playerAId: 'he-ning',
        playerBId: 'wang-yue',
        score: '1:3',
        status: 'Finished',
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
  if (!normalized) {
    return players;
  }

  return players.filter((player) => {
    return [player.name, player.city, player.club].some((value) =>
      value.toLowerCase().includes(normalized),
    );
  });
}

export function searchTournaments(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return tournaments;
  }

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
