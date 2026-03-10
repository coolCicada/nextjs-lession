import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

function getUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

async function getDefaultUserId(): Promise<string | null> {
  const { rows } = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`;
  return rows?.[0]?.id ?? null;
}

// GET - 获取当前用户新闻记录（远端 Postgres）
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = getUserIdFromToken(authHeader);

    if (!userId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recordType = searchParams.get('recordType');

    const { rows } = recordType
      ? await sql`
          SELECT
            id,
            title,
            content,
            source,
            synced_from as "syncedFrom",
            record_type as "recordType",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM news_entries
          WHERE user_id = ${userId} AND record_type = ${recordType}
          ORDER BY created_at DESC
          LIMIT 300
        `
      : await sql`
          SELECT
            id,
            title,
            content,
            source,
            synced_from as "syncedFrom",
            record_type as "recordType",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM news_entries
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT 300
        `;

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// POST - 创建新闻记录（远端 Postgres）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      source = 'feishu',
      syncedFrom = 'sync-news',
      recordType = 'manual-news',
      userId: providedUserId,
    } = body || {};

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const tokenUserId = getUserIdFromToken(authHeader);
    const fallbackUserId = await getDefaultUserId();
    const userId = providedUserId || tokenUserId || fallbackUserId;

    if (!userId) {
      return NextResponse.json({ error: 'no user found' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO news_entries (user_id, title, content, source, synced_from, record_type)
      VALUES (${userId}, ${title}, ${content}, ${source}, ${syncedFrom}, ${recordType})
      RETURNING
        id,
        title,
        content,
        source,
        synced_from as "syncedFrom",
        record_type as "recordType",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
