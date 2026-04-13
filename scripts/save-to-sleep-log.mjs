#!/usr/bin/env node
/**
 * save-to-sleep-log.mjs
 *
 * 将睡眠记录直接写入远端 Postgres 数据库（sleep_logs 表）。
 * 同一用户同一天的记录采用 upsert，不会产生重复行。
 *
 * 用法：
 *   node save-to-sleep-log.mjs \
 *     --confirmed-at "2026-04-13T07:30:00+08:00" \
 *     --original-text "昨晚11点睡，今早7点半起" \
 *     [--sleep-date "2026-04-12"]          # 省略则从 confirmed-at 本地日期推算
 *     [--reminder-at "2026-04-13T22:00:00+08:00"]
 *     [--reminder-step 1]
 *     [--source telegram]
 *     [--synced-from cron]
 */

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '@vercel/postgres';

// ── 环境加载 ──────────────────────────────────────────────────────────────────

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

function resolveEnvFile() {
  const candidates = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env'),
    path.join(PROJECT_ROOT, '.env.local'),
    path.join(PROJECT_ROOT, '.env'),
  ];

  for (const envFile of candidates) {
    try {
      readFileSync(envFile, 'utf8');
      return envFile;
    } catch {
      // 尝试下一个候选路径
    }
  }

  return path.join(PROJECT_ROOT, '.env.local');
}

const ENV_FILE = resolveEnvFile();

function loadEnv() {
  try {
    const raw = readFileSync(ENV_FILE, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // 忽略读取失败（CI/容器环境可能通过系统环境变量注入）
  }
}

// ── 工具函数 ──────────────────────────────────────────────────────────────────

function log(msg) {
  console.error(`[${new Date().toISOString()}] ${msg}`);
}

/** 从带时区的 ISO 字符串中提取本地日期部分，格式为 YYYY-MM-DD */
function localDateFromISO(isoString) {
  // 直接取字符串前10位即可（ISO格式 "2026-04-13T07:30:00+08:00"）
  return isoString.slice(0, 10);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    const val = () => {
      if (i + 1 < args.length) return args[++i];
      throw new Error(`${flag} 缺少参数值`);
    };
    if (flag === '--confirmed-at')   result.confirmedAt   = val();
    if (flag === '--original-text')  result.originalText  = val();
    if (flag === '--sleep-date')     result.sleepDate     = val();
    if (flag === '--reminder-at')    result.reminderAt    = val();
    if (flag === '--reminder-step')  result.reminderStep  = parseInt(val(), 10);
    if (flag === '--source')         result.source        = val();
    if (flag === '--synced-from')    result.syncedFrom    = val();
  }
  return result;
}

// ── 建表（幂等） ──────────────────────────────────────────────────────────────

async function ensureSchema() {
  // 确保 uuid-ossp 扩展可用
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS sleep_logs (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id       UUID,
      sleep_date    DATE        NOT NULL,
      confirmed_at  TIMESTAMP   NOT NULL,
      original_text TEXT        NOT NULL,
      reminder_at   TIMESTAMP   NULL,
      reminder_step INTEGER     NULL,
      source        VARCHAR(50) DEFAULT 'telegram',
      synced_from   VARCHAR(50) DEFAULT 'cron',
      record_type   VARCHAR(50) DEFAULT 'sleep-log',
      created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
      sync_status   VARCHAR(30) DEFAULT 'synced',
      synced_at     TIMESTAMP   NULL,
      sync_error    TEXT        NULL
    )
  `;

  // 唯一索引：同一用户同一天只保留一条记录（upsert 的冲突目标）
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_sleep_logs_user_date
    ON sleep_logs (user_id, sleep_date)
  `;
}

// ── 主流程 ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  const {
    confirmedAt,
    originalText,
    sleepDate: rawSleepDate,
    reminderAt   = null,
    reminderStep = null,
    source       = 'telegram',
    syncedFrom   = 'cron',
  } = parseArgs();

  // 必填参数校验
  if (!confirmedAt || !originalText) {
    console.log(JSON.stringify({ error: '--confirmed-at and --original-text are required' }));
    process.exit(1);
  }

  // sleep_date 省略时从 confirmed_at 的本地日期推算（取 ISO 字符串前10位）
  const sleepDate = rawSleepDate || localDateFromISO(confirmedAt);

  if (!process.env.POSTGRES_URL) {
    const err = 'POSTGRES_URL missing';
    log(`error: ${err}`);
    console.log(JSON.stringify({ error: err }));
    process.exit(1);
  }

  log(`POSTGRES_URL found, connecting...`);

  try {
    // 确保远端表结构存在
    await ensureSchema();

    // 获取 admin 用户 id
    const users = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`;
    const userId = users.rows[0]?.id;
    if (!userId) {
      const err = 'admin user not found';
      log(`error: ${err}`);
      console.log(JSON.stringify({ error: err }));
      process.exit(1);
    }

    const now = new Date().toISOString();

    // upsert：冲突时更新除 created_at 以外的所有可变字段
    const { rows } = await sql`
      INSERT INTO sleep_logs (
        user_id, sleep_date, confirmed_at, original_text,
        reminder_at, reminder_step, source, synced_from, record_type,
        created_at, updated_at, sync_status, synced_at, sync_error
      ) VALUES (
        ${userId},
        ${sleepDate}::DATE,
        ${confirmedAt}::TIMESTAMP WITH TIME ZONE,
        ${originalText},
        ${reminderAt}::TIMESTAMP WITH TIME ZONE,
        ${reminderStep},
        ${source},
        ${syncedFrom},
        'sleep-log',
        ${now},
        ${now},
        'synced',
        ${now},
        NULL
      )
      ON CONFLICT (user_id, sleep_date)
      DO UPDATE SET
        confirmed_at  = EXCLUDED.confirmed_at,
        original_text = EXCLUDED.original_text,
        reminder_at   = EXCLUDED.reminder_at,
        reminder_step = EXCLUDED.reminder_step,
        source        = EXCLUDED.source,
        synced_from   = EXCLUDED.synced_from,
        updated_at    = EXCLUDED.updated_at,
        sync_status   = 'synced',
        synced_at     = EXCLUDED.synced_at,
        sync_error    = NULL
      RETURNING id, sleep_date
    `;

    const row = rows[0];
    log(`ok: id=${row.id} sleep_date=${row.sleep_date}`);
    console.log(JSON.stringify({ success: true, id: row.id, sleepDate: row.sleep_date }));
  } catch (err) {
    log(`error: ${err.message}`);
    console.log(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();
