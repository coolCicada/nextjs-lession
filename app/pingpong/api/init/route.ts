import { NextResponse } from 'next/server';

import { ensurePingPongReady } from '@/app/pingpong/_lib/db';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown error';
}

export async function GET() {
  return handleInit();
}

export async function POST() {
  return handleInit();
}

async function handleInit() {
  try {
    await ensurePingPongReady();
    return NextResponse.json({ message: 'pingpong database initialized' });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
