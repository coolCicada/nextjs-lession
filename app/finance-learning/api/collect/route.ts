import { NextResponse } from 'next/server';
import { collectFinanceCycle } from '../../_lib/collector';
import { getStoredInsights, upsertFinanceCollection } from '../../_lib/store';

export const dynamic = 'force-dynamic';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

export async function POST() {
  try {
    const insights = await getStoredInsights();
    const result = await collectFinanceCycle(insights);
    await upsertFinanceCollection({
      date: result.predictionRecord.date,
      rawBundle: result.rawBundle,
      predictions: result.predictionRecord.predictions,
    });

    return NextResponse.json({
      ok: true,
      logs: [
        ...result.logs,
        `写入 ${result.predictionRecord.date} 的采集与预测记录`,
      ],
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage(error),
      },
      { status: 500 },
    );
  }
}
