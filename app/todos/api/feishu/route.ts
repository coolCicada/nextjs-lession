import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown error';
}

async function resolveUserId(userId?: string, username?: string) {
  if (userId) return userId;

  if (username) {
    const { rows } = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
    if (rows.length > 0) return rows[0].id as string;
  }

  const fallbackUsername = process.env.TODOS_DEFAULT_USER || 'admin';
  const { rows } = await sql`SELECT id FROM users WHERE username = ${fallbackUsername} LIMIT 1`;
  if (rows.length > 0) return rows[0].id as string;

  return null;
}

// 飞书调用接口添加待办（支持按人隔离）
export async function POST(request: Request) {
  try {
    const { text, source = 'feishu', userId, username } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const finalUserId = await resolveUserId(userId, username);
    if (!finalUserId) {
      return NextResponse.json({ error: 'no matched user' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO todos (user_id, text, source)
      VALUES (${finalUserId}, ${text}, ${source})
      RETURNING id, text, completed, source, created_at as "createdAt"
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error adding todo:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// 仅用于调试：按用户查询待办
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username') || undefined;

    const finalUserId = await resolveUserId(userId || undefined, username);
    if (!finalUserId) {
      return NextResponse.json({ error: 'no matched user' }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT id, text, completed, source, created_at as "createdAt"
      FROM todos
      WHERE user_id = ${finalUserId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
