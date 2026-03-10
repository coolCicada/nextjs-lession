import { NextResponse } from 'next/server';
import { insertNewsEntry, listNewsEntries, resolveNewsUserId } from '@/app/lib/local-news-db';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

function getUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

// GET - 获取当前用户新闻记录（本地 SQLite）
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = getUserIdFromToken(authHeader);

    if (!userId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    return NextResponse.json(listNewsEntries(userId));
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// POST - 创建新闻记录（支持无 token 自动同步到本地 SQLite）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      source = 'feishu',
      syncedFrom = 'sync-news',
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
    const userId = resolveNewsUserId(providedUserId || tokenUserId);

    const entry = insertNewsEntry({
      userId,
      title,
      content,
      source,
      syncedFrom,
    });

    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
