import 'server-only';

import { sql } from '@vercel/postgres';

import {
  players as seedPlayers,
  tournaments as seedTournaments,
  type Player,
  type RatingHistoryPoint,
  type RegistrationRecord,
  type Tournament,
  type TournamentMatch,
  type TournamentParticipant,
} from '@/app/pingpong/data';

export const PINGPONG_REGISTRANT_COOKIE = 'oc-pingpong-registrant';

let pingPongInitPromise: Promise<void> | null = null;

type TournamentStatus = Tournament['status'];

type PlayerRow = {
  id: string;
  name: string;
  city: string;
  club: string;
  hand: Player['hand'];
  style: string;
  current_rating: number;
  total_points: number;
  rank: number;
  wins: number;
  losses: number;
  bio: string;
  achievements: unknown;
};

type RatingHistoryRow = {
  player_id: string;
  date: Date | string;
  rating: number;
  points: number;
  event: string;
  delta: number;
};

type TournamentRow = {
  id: string;
  title: string;
  city: string;
  venue: string;
  date: Date | string;
  signup_deadline: Date | string;
  level: string;
  format: string;
  fee: number;
  organizer: string;
  status: TournamentStatus;
  summary: string;
  tags: unknown;
};

type RegistrationRow = {
  id: string;
  tournament_id: string;
  player_id: string | null;
  registrant_name: string;
  registrant_city: string;
  note: string;
  seed: number | null;
  status: TournamentParticipant['status'] | '待审核';
  source: 'seed' | 'public';
  created_at: Date | string;
  updated_at: Date | string;
};

type MatchRow = {
  id: string;
  tournament_id: string;
  round: string;
  table_name: string;
  start_time: Date | string;
  player_a_id: string;
  player_b_id: string;
  score: string;
  status: TournamentMatch['status'];
  sort_order: number;
};

export function ensurePingPongReady() {
  if (!pingPongInitPromise) {
    pingPongInitPromise = ensurePingPongSchema().then(seedPingPongData).catch((error) => {
      pingPongInitPromise = null;
      throw error;
    });
  }

  return pingPongInitPromise;
}

export function buildRegistrantKey(playerName: string, city: string) {
  return `${normalizeRegistrantPart(playerName)}::${normalizeRegistrantPart(city)}`;
}

export async function searchPlayers(query: string) {
  const players = await fetchAllPlayers();
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return players;
  }

  return players.filter((player) =>
    [player.name, player.city, player.club].some((value) =>
      value.toLowerCase().includes(normalized),
    ),
  );
}

export async function getPlayerById(id: string) {
  const players = await fetchAllPlayers();
  return players.find((player) => player.id === id);
}

export async function searchTournaments(query: string) {
  const tournaments = await fetchAllTournaments();
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return tournaments;
  }

  return tournaments.filter((tournament) =>
    [tournament.title, tournament.city, tournament.venue].some((value) =>
      value.toLowerCase().includes(normalized),
    ),
  );
}

export async function getTournamentById(id: string) {
  const tournaments = await fetchAllTournaments();
  return tournaments.find((tournament) => tournament.id === id);
}

export async function getRecentMatches(limit = 6) {
  const tournaments = await fetchAllTournaments();

  return tournaments
    .flatMap((tournament) =>
      tournament.matches.map((match) => ({
        ...match,
        tournamentId: tournament.id,
        tournamentTitle: tournament.title,
        city: tournament.city,
      })),
    )
    .sort((left, right) => right.startTime.localeCompare(left.startTime))
    .slice(0, limit);
}

export async function getPlayerTournaments(playerId: string) {
  const tournaments = await fetchAllTournaments();
  return tournaments.filter((tournament) =>
    tournament.participants.some((participant) => participant.playerId === playerId),
  );
}

export async function getTournamentRecentRegistrations(
  tournamentId: string,
  limit = 6,
) {
  await ensurePingPongReady();

  const { rows } = await sql<RegistrationRow>`
    SELECT
      id,
      tournament_id,
      player_id,
      registrant_name,
      registrant_city,
      note,
      seed,
      status,
      source,
      created_at,
      updated_at
    FROM pingpong_registrations
    WHERE tournament_id = ${tournamentId}
      AND source = 'public'
    ORDER BY updated_at DESC
    LIMIT ${limit}
  `;

  const tournament = await getTournamentById(tournamentId);

  if (!tournament) {
    return [];
  }

  return rows.map((row) => mapRegistrationRecord(row, tournament));
}

export async function getRegistrationForRegistrant(
  tournamentId: string,
  registrantKey?: string,
) {
  const parsed = parseRegistrantKey(registrantKey);
  if (!parsed) {
    return null;
  }

  await ensurePingPongReady();

  const { rows } = await sql<RegistrationRow>`
    SELECT
      id,
      tournament_id,
      player_id,
      registrant_name,
      registrant_city,
      note,
      seed,
      status,
      source,
      created_at,
      updated_at
    FROM pingpong_registrations
    WHERE tournament_id = ${tournamentId}
      AND LOWER(registrant_name) = ${parsed.playerName}
      AND LOWER(registrant_city) = ${parsed.city}
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  const tournament = await getTournamentById(tournamentId);
  if (!rows[0] || !tournament) {
    return null;
  }

  return mapRegistrationRecord(rows[0], tournament);
}

export async function getMyRegistrations(registrantKey?: string) {
  const parsed = parseRegistrantKey(registrantKey);
  if (!parsed) {
    return [];
  }

  await ensurePingPongReady();

  const { rows } = await sql<
    RegistrationRow & {
      tournament_title: string;
      tournament_date: Date | string;
      tournament_city: string;
    }
  >`
    SELECT
      r.id,
      r.tournament_id,
      r.player_id,
      r.registrant_name,
      r.registrant_city,
      r.note,
      r.seed,
      r.status,
      r.source,
      r.created_at,
      r.updated_at,
      t.title AS tournament_title,
      t.date AS tournament_date,
      t.city AS tournament_city
    FROM pingpong_registrations r
    INNER JOIN pingpong_tournaments t
      ON t.id = r.tournament_id
    WHERE LOWER(r.registrant_name) = ${parsed.playerName}
      AND LOWER(r.registrant_city) = ${parsed.city}
    ORDER BY t.date DESC, r.updated_at DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    tournamentId: row.tournament_id,
    tournamentTitle: row.tournament_title,
    tournamentDate: formatDateOnly(row.tournament_date),
    tournamentCity: row.tournament_city,
    playerName: row.registrant_name,
    city: row.registrant_city,
    note: row.note,
    status: row.status,
    source: row.source,
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
  }));
}

export async function upsertTournamentRegistration(input: {
  tournamentId: string;
  playerName: string;
  city: string;
  note: string;
}) {
  await ensurePingPongReady();

  const { rows } = await sql<{ status: TournamentStatus }>`
    SELECT status
    FROM pingpong_tournaments
    WHERE id = ${input.tournamentId}
    LIMIT 1
  `;

  const status = rows[0]?.status;
  if (!status) {
    throw new Error('tournament not found');
  }

  if (status !== '报名中') {
    throw new Error('tournament is not open for registration');
  }

  await sql`
    INSERT INTO pingpong_registrations (
      tournament_id,
      player_id,
      registrant_name,
      registrant_city,
      note,
      seed,
      status,
      source
    )
    VALUES (
      ${input.tournamentId},
      NULL,
      ${input.playerName},
      ${input.city},
      ${input.note},
      NULL,
      '待审核',
      'public'
    )
    ON CONFLICT (tournament_id, registrant_name, registrant_city)
    DO UPDATE SET
      note = EXCLUDED.note,
      status = '待审核',
      source = 'public',
      updated_at = CURRENT_TIMESTAMP
  `;
}

async function ensurePingPongSchema() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS pingpong_players (
      id TEXT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      city VARCHAR(100) NOT NULL,
      club VARCHAR(160) NOT NULL,
      hand VARCHAR(20) NOT NULL,
      style VARCHAR(160) NOT NULL,
      current_rating INTEGER NOT NULL,
      total_points INTEGER NOT NULL,
      rank INTEGER NOT NULL,
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      bio TEXT NOT NULL DEFAULT '',
      achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pingpong_tournaments (
      id TEXT PRIMARY KEY,
      title VARCHAR(160) NOT NULL,
      city VARCHAR(100) NOT NULL,
      venue VARCHAR(160) NOT NULL,
      date DATE NOT NULL,
      signup_deadline DATE NOT NULL,
      level VARCHAR(120) NOT NULL,
      format VARCHAR(120) NOT NULL,
      fee INTEGER NOT NULL,
      organizer VARCHAR(160) NOT NULL,
      status VARCHAR(20) NOT NULL,
      summary TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pingpong_registrations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tournament_id TEXT NOT NULL REFERENCES pingpong_tournaments(id) ON DELETE CASCADE,
      player_id TEXT REFERENCES pingpong_players(id) ON DELETE SET NULL,
      registrant_name VARCHAR(100) NOT NULL,
      registrant_city VARCHAR(160) NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      seed INTEGER,
      status VARCHAR(20) NOT NULL DEFAULT '待审核',
      source VARCHAR(20) NOT NULL DEFAULT 'public',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (tournament_id, registrant_name, registrant_city)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pingpong_rating_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      player_id TEXT NOT NULL REFERENCES pingpong_players(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      rating INTEGER NOT NULL,
      points INTEGER NOT NULL,
      event VARCHAR(160) NOT NULL,
      delta INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (player_id, date, event)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pingpong_matches (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL REFERENCES pingpong_tournaments(id) ON DELETE CASCADE,
      round VARCHAR(100) NOT NULL,
      table_name VARCHAR(80) NOT NULL,
      start_time TIMESTAMP NOT NULL,
      player_a_id TEXT NOT NULL REFERENCES pingpong_players(id) ON DELETE RESTRICT,
      player_b_id TEXT NOT NULL REFERENCES pingpong_players(id) ON DELETE RESTRICT,
      score VARCHAR(40) NOT NULL,
      status VARCHAR(20) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_pingpong_tournaments_date
    ON pingpong_tournaments(date DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_pingpong_registrations_tournament
    ON pingpong_registrations(tournament_id, updated_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_pingpong_matches_tournament
    ON pingpong_matches(tournament_id, start_time ASC)
  `;
}

async function seedPingPongData() {
  for (const player of seedPlayers) {
    await sql`
      INSERT INTO pingpong_players (
        id,
        name,
        city,
        club,
        hand,
        style,
        current_rating,
        total_points,
        rank,
        wins,
        losses,
        bio,
        achievements
      )
      VALUES (
        ${player.id},
        ${player.name},
        ${player.city},
        ${player.club},
        ${player.hand},
        ${player.style},
        ${player.currentRating},
        ${player.totalPoints},
        ${player.rank},
        ${player.form.wins},
        ${player.form.losses},
        ${player.bio},
        ${JSON.stringify(player.achievements)}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        city = EXCLUDED.city,
        club = EXCLUDED.club,
        hand = EXCLUDED.hand,
        style = EXCLUDED.style,
        current_rating = EXCLUDED.current_rating,
        total_points = EXCLUDED.total_points,
        rank = EXCLUDED.rank,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        bio = EXCLUDED.bio,
        achievements = EXCLUDED.achievements,
        updated_at = CURRENT_TIMESTAMP
    `;

    for (const point of player.ratingHistory) {
      await sql`
        INSERT INTO pingpong_rating_history (
          player_id,
          date,
          rating,
          points,
          event,
          delta
        )
        VALUES (
          ${player.id},
          ${point.date},
          ${point.rating},
          ${point.points},
          ${point.event},
          ${point.delta}
        )
        ON CONFLICT (player_id, date, event)
        DO UPDATE SET
          rating = EXCLUDED.rating,
          points = EXCLUDED.points,
          delta = EXCLUDED.delta
      `;
    }
  }

  for (const tournament of seedTournaments) {
    await sql`
      INSERT INTO pingpong_tournaments (
        id,
        title,
        city,
        venue,
        date,
        signup_deadline,
        level,
        format,
        fee,
        organizer,
        status,
        summary,
        tags
      )
      VALUES (
        ${tournament.id},
        ${tournament.title},
        ${tournament.city},
        ${tournament.venue},
        ${tournament.date},
        ${tournament.signupDeadline},
        ${tournament.level},
        ${tournament.format},
        ${tournament.fee},
        ${tournament.organizer},
        ${tournament.status},
        ${tournament.summary},
        ${JSON.stringify(tournament.tags)}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        title = EXCLUDED.title,
        city = EXCLUDED.city,
        venue = EXCLUDED.venue,
        date = EXCLUDED.date,
        signup_deadline = EXCLUDED.signup_deadline,
        level = EXCLUDED.level,
        format = EXCLUDED.format,
        fee = EXCLUDED.fee,
        organizer = EXCLUDED.organizer,
        status = EXCLUDED.status,
        summary = EXCLUDED.summary,
        tags = EXCLUDED.tags,
        updated_at = CURRENT_TIMESTAMP
    `;

    for (let index = 0; index < tournament.matches.length; index += 1) {
      const match = tournament.matches[index];

      await sql`
        INSERT INTO pingpong_matches (
          id,
          tournament_id,
          round,
          table_name,
          start_time,
          player_a_id,
          player_b_id,
          score,
          status,
          sort_order
        )
        VALUES (
          ${match.id},
          ${tournament.id},
          ${match.round},
          ${match.table},
          ${normalizeMatchTimestamp(match.startTime)},
          ${match.playerAId},
          ${match.playerBId},
          ${match.score},
          ${match.status},
          ${index}
        )
        ON CONFLICT (id)
        DO UPDATE SET
          round = EXCLUDED.round,
          table_name = EXCLUDED.table_name,
          start_time = EXCLUDED.start_time,
          player_a_id = EXCLUDED.player_a_id,
          player_b_id = EXCLUDED.player_b_id,
          score = EXCLUDED.score,
          status = EXCLUDED.status,
          sort_order = EXCLUDED.sort_order
      `;
    }

    for (const participant of tournament.participants) {
      const player = seedPlayers.find((entry) => entry.id === participant.playerId);
      if (!player) {
        continue;
      }

      await sql`
        INSERT INTO pingpong_registrations (
          tournament_id,
          player_id,
          registrant_name,
          registrant_city,
          note,
          seed,
          status,
          source
        )
        VALUES (
          ${tournament.id},
          ${participant.playerId},
          ${player.name},
          ${player.city},
          '',
          ${participant.seed},
          ${participant.status},
          'seed'
        )
        ON CONFLICT (tournament_id, registrant_name, registrant_city)
        DO UPDATE SET
          player_id = EXCLUDED.player_id,
          seed = EXCLUDED.seed,
          status = EXCLUDED.status,
          source = 'seed',
          updated_at = CURRENT_TIMESTAMP
      `;
    }
  }
}

async function fetchAllPlayers() {
  await ensurePingPongReady();

  const [playerResult, historyResult] = await Promise.all([
    sql<PlayerRow>`
      SELECT
        id,
        name,
        city,
        club,
        hand,
        style,
        current_rating,
        total_points,
        rank,
        wins,
        losses,
        bio,
        achievements
      FROM pingpong_players
      ORDER BY total_points DESC, current_rating DESC
    `,
    sql<RatingHistoryRow>`
      SELECT
        player_id,
        date,
        rating,
        points,
        event,
        delta
      FROM pingpong_rating_history
      ORDER BY date ASC
    `,
  ]);

  const historyMap = new Map<string, RatingHistoryPoint[]>();

  for (const row of historyResult.rows) {
    const entry = historyMap.get(row.player_id) ?? [];
    entry.push({
      date: formatDateOnly(row.date),
      rating: row.rating,
      points: row.points,
      event: row.event,
      delta: row.delta,
    });
    historyMap.set(row.player_id, entry);
  }

  return playerResult.rows.map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    club: row.club,
    hand: row.hand,
    style: row.style,
    currentRating: row.current_rating,
    totalPoints: row.total_points,
    rank: row.rank,
    form: {
      wins: row.wins,
      losses: row.losses,
    },
    bio: row.bio,
    achievements: parseStringArray(row.achievements),
    ratingHistory: historyMap.get(row.id) ?? [],
  }));
}

async function fetchAllTournaments() {
  await ensurePingPongReady();

  const [players, tournamentResult, registrationResult, matchResult] = await Promise.all([
    fetchAllPlayers(),
    sql<TournamentRow>`
      SELECT
        id,
        title,
        city,
        venue,
        date,
        signup_deadline,
        level,
        format,
        fee,
        organizer,
        status,
        summary,
        tags
      FROM pingpong_tournaments
      ORDER BY date ASC
    `,
    sql<RegistrationRow>`
      SELECT
        id,
        tournament_id,
        player_id,
        registrant_name,
        registrant_city,
        note,
        seed,
        status,
        source,
        created_at,
        updated_at
      FROM pingpong_registrations
      WHERE player_id IS NOT NULL
      ORDER BY tournament_id ASC, seed ASC NULLS LAST, updated_at ASC
    `,
    sql<MatchRow>`
      SELECT
        id,
        tournament_id,
        round,
        table_name,
        start_time,
        player_a_id,
        player_b_id,
        score,
        status,
        sort_order
      FROM pingpong_matches
      ORDER BY tournament_id ASC, sort_order ASC, start_time ASC
    `,
  ]);

  const playerMap = new Map(players.map((player) => [player.id, player]));
  const participantMap = new Map<string, TournamentParticipant[]>();
  const matchMap = new Map<string, TournamentMatch[]>();

  for (const row of registrationResult.rows) {
    const player = row.player_id ? playerMap.get(row.player_id) : null;
    if (!player || row.seed == null || (row.status !== '已确认' && row.status !== '候补')) {
      continue;
    }

    const entries = participantMap.get(row.tournament_id) ?? [];
    entries.push({
      playerId: player.id,
      seed: row.seed,
      status: row.status,
      player,
    });
    participantMap.set(row.tournament_id, entries);
  }

  for (const row of matchResult.rows) {
    const entries = matchMap.get(row.tournament_id) ?? [];
    entries.push({
      id: row.id,
      round: row.round,
      table: row.table_name,
      startTime: formatDateTime(row.start_time),
      playerAId: row.player_a_id,
      playerBId: row.player_b_id,
      playerAName: playerMap.get(row.player_a_id)?.name,
      playerBName: playerMap.get(row.player_b_id)?.name,
      score: row.score,
      status: row.status,
    });
    matchMap.set(row.tournament_id, entries);
  }

  return tournamentResult.rows.map((row) => ({
    id: row.id,
    title: row.title,
    city: row.city,
    venue: row.venue,
    date: formatDateOnly(row.date),
    signupDeadline: formatDateOnly(row.signup_deadline),
    level: row.level,
    format: row.format,
    fee: row.fee,
    organizer: row.organizer,
    status: row.status,
    summary: row.summary,
    tags: parseStringArray(row.tags),
    participants: participantMap.get(row.id) ?? [],
    matches: matchMap.get(row.id) ?? [],
  }));
}

function mapRegistrationRecord(
  row: RegistrationRow,
  tournament: Pick<Tournament, 'id' | 'title' | 'date' | 'city'>,
): RegistrationRecord {
  return {
    id: row.id,
    tournamentId: tournament.id,
    tournamentTitle: tournament.title,
    tournamentDate: tournament.date,
    tournamentCity: tournament.city,
    playerName: row.registrant_name,
    city: row.registrant_city,
    note: row.note,
    status: row.status,
    source: row.source,
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
  };
}

function parseRegistrantKey(registrantKey?: string) {
  if (!registrantKey) {
    return null;
  }

  const [playerName, city] = registrantKey.split('::');
  if (!playerName || !city) {
    return null;
  }

  return {
    playerName,
    city,
  };
}

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeRegistrantPart(value: string) {
  return value.trim().toLowerCase();
}

function formatDateOnly(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function formatDateTime(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 16).replace('T', ' ');
  }

  return String(value).replace('T', ' ').slice(0, 16);
}

function normalizeMatchTimestamp(value: string) {
  return value.replace(' ', 'T');
}
