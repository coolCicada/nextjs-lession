import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

async function ensureAuthSchema() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    INSERT INTO users (username, password_hash)
    VALUES ('admin', 'admin123')
    ON CONFLICT (username) DO NOTHING
  `;
}

export async function POST(request: Request) {
  try {
    await ensureAuthSchema();

    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json({ error: 'username and password required' }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT id, username FROM users
      WHERE username = ${username} AND password_hash = ${password}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
    }

    const user = rows[0];

    return NextResponse.json({
      token: user.id,
      username: user.username,
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
