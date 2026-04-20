#!/usr/bin/env node
/**
 * save-to-news.mjs
 * 
 * 将简报内容直接写入远端 Postgres 数据库（news_entries 表）。
 * 用法：
 *   node save-to-news.mjs --title "标题" --content "正文" --record-type "daily-finance-brief"
 * 
 * 参数：
 *   --title       简报标题
 *   --content     简报正文
 *   --record-type 记录类型，默认 daily-finance-brief
 */

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '@vercel/postgres';

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
      // try next candidate
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
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore
  }
}

function log(msg) {
  console.error(`[${new Date().toISOString()}] ${msg}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && i + 1 < args.length) result.title = args[++i];
    if (args[i] === '--content' && i + 1 < args.length) result.content = args[++i];
    if (args[i] === '--record-type' && i + 1 < args.length) result.recordType = args[++i];
  }
  return result;
}

async function main() {
  loadEnv();

  const { title, content, recordType = 'daily-finance-brief' } = parseArgs();

  if (!title && !content) {
    console.log(JSON.stringify({ error: 'title and content are required' }));
    process.exit(1);
  }

  if (!process.env.POSTGRES_URL) {
    const err = 'POSTGRES_URL missing';
    log(`error: ${err}`);
    console.log(JSON.stringify({ error: err }));
    process.exit(1);
  }

  log(`POSTGRES_URL found, connecting...`);

  try {
    // 确保 users 表里有默认用户
    const users = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`;
    const userId = users.rows[0]?.id;
    if (!userId) {
      const err = 'admin user not found';
      log(`error: ${err}`);
      console.log(JSON.stringify({ error: err }));
      process.exit(1);
    }

    const now = new Date().toISOString();
    const { rows } = await sql`
      INSERT INTO news_entries (
        user_id, title, content, source, synced_from, record_type,
        created_at, updated_at, sync_status, synced_at
      ) VALUES (
        ${userId}, ${title || '无标题'}, ${content || ''}, 'telegram', 'cron', ${recordType},
        ${now}, ${now}, 'synced', ${now}
      )
      RETURNING id, title, created_at
    `;

    log(`ok: saved id=${rows[0].id} title=${(title || '').slice(0, 60)}`);
    console.log(JSON.stringify({ success: true, id: rows[0].id }));
  } catch (err) {
    log(`error: ${err.message}`);
    console.log(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();
