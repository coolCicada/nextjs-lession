import 'server-only';

import { sql } from '@vercel/postgres';

// ── 类型定义 ──────────────────────────────────────────────────────────────────

export type SleepLogRow = {
  id: string;
  /** 'YYYY-MM-DD'，SQL 中 TO_CHAR 转换 */
  sleep_date: string;
  /** 'MM-DD HH:MI' Asia/Shanghai 本地时间，SQL 中转换 */
  confirmed_at_sh: string;
  /** epoch 秒（float8），用于计算相对时间 */
  confirmed_epoch: number;
  original_text: string;
  reminder_step: number | null;
  source: string;
  synced_from: string;
};

export type SleepStats = {
  total: number;
  /** 'YYYY-MM-DD HH:MI' Asia/Shanghai，最近一条确认时刻 */
  latest_confirmed_sh: string | null;
  latest_confirmed_epoch: number | null;
  /** 近 7 条确认时刻的平均值，分钟数（0–1439，Asia/Shanghai） */
  avg_confirmed_minutes: number | null;
  /** 今日（Asia/Shanghai）是否已有记录 */
  has_today: boolean;
};

// ── 查询函数 ──────────────────────────────────────────────────────────────────

/** 获取最近 N 条睡眠记录（按日期倒序） */
export async function getRecentSleepLogs(limit = 14): Promise<SleepLogRow[]> {
  try {
    const { rows } = await sql`
      SELECT
        id,
        TO_CHAR(sleep_date, 'YYYY-MM-DD')                                         AS sleep_date,
        TO_CHAR(confirmed_at AT TIME ZONE 'Asia/Shanghai', 'MM-DD HH24:MI')       AS confirmed_at_sh,
        EXTRACT(EPOCH FROM confirmed_at)::FLOAT8                                  AS confirmed_epoch,
        original_text,
        reminder_step,
        COALESCE(source, 'telegram')                                              AS source,
        COALESCE(synced_from, 'cron')                                             AS synced_from
      FROM sleep_logs
      ORDER BY sleep_date DESC, confirmed_at DESC
      LIMIT ${limit}
    `;
    return rows as SleepLogRow[];
  } catch {
    return [];
  }
}

/** 获取汇总统计：总数、最近确认、近7条均值、今日状态 */
export async function getSleepStats(): Promise<SleepStats> {
  try {
    // 总数 + 最近确认
    const { rows: totRows } = await sql`
      SELECT
        COUNT(*)::INT                                                              AS total,
        TO_CHAR(MAX(confirmed_at) AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI')
                                                                                  AS latest_confirmed_sh,
        EXTRACT(EPOCH FROM MAX(confirmed_at))::FLOAT8                             AS latest_confirmed_epoch
      FROM sleep_logs
    `;
    const total: number               = totRows[0]?.total              ?? 0;
    const latest_confirmed_sh: string | null = totRows[0]?.latest_confirmed_sh ?? null;
    const latest_confirmed_epoch      = totRows[0]?.latest_confirmed_epoch != null
      ? Number(totRows[0].latest_confirmed_epoch) : null;

    // 近 7 条确认时刻的平均值（Asia/Shanghai，分钟数）
    const { rows: avgRows } = await sql`
      SELECT AVG(
        EXTRACT(HOUR  FROM confirmed_at AT TIME ZONE 'Asia/Shanghai') * 60 +
        EXTRACT(MINUTE FROM confirmed_at AT TIME ZONE 'Asia/Shanghai')
      )::INT AS avg_minutes
      FROM (
        SELECT confirmed_at
        FROM sleep_logs
        ORDER BY sleep_date DESC, confirmed_at DESC
        LIMIT 7
      ) sub
    `;
    const avg_confirmed_minutes: number | null =
      avgRows[0]?.avg_minutes != null ? Number(avgRows[0].avg_minutes) : null;

    // 今日（Asia/Shanghai）是否已有记录
    const { rows: todayRows } = await sql`
      SELECT COUNT(*)::INT AS cnt
      FROM sleep_logs
      WHERE sleep_date = (NOW() AT TIME ZONE 'Asia/Shanghai')::DATE
    `;
    const has_today = (todayRows[0]?.cnt ?? 0) > 0;

    return { total, latest_confirmed_sh, latest_confirmed_epoch, avg_confirmed_minutes, has_today };
  } catch {
    return {
      total: 0,
      latest_confirmed_sh: null,
      latest_confirmed_epoch: null,
      avg_confirmed_minutes: null,
      has_today: false,
    };
  }
}
