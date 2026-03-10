import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import {
  findUserById,
  getAuthUserFromHeader,
  getDefaultUser,
} from '../_lib/auth';
import { ensureWorklogSchema } from '../_lib/schema';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

// GET - 获取当前用户新闻记录（远端 Postgres）
export async function GET(request: Request) {
  try {
    await ensureWorklogSchema();
    const user = await getAuthUserFromHeader(
      request.headers.get('authorization'),
    );
    if (!user) {
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
          WHERE user_id = ${user.id} AND record_type = ${recordType}
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
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
          LIMIT 300
        `;

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

// POST - 创建新闻记录（远端 Postgres）
export async function POST(request: Request) {
  try {
    await ensureWorklogSchema();
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
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 },
      );
    }

    const authUser = await getAuthUserFromHeader(
      request.headers.get('authorization'),
    );
    const bodyUser = await findUserById(providedUserId);
    const fallbackUser = await getDefaultUser();
    const user = authUser || bodyUser || fallbackUser;

    if (!user) {
      return NextResponse.json({ error: 'no user found' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO news_entries (user_id, title, content, source, synced_from, record_type)
      VALUES (${user.id}, ${title}, ${content}, ${source}, ${syncedFrom}, ${recordType})
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
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
