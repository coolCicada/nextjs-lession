import { NextResponse } from 'next/server';
import { learnFromHistory } from '../../_lib/learner';
import { getFinanceModuleData, upsertFinanceInsights } from '../../_lib/store';

export const dynamic = 'force-dynamic';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

export async function POST() {
  try {
    const financeData = await getFinanceModuleData();
    const learned = learnFromHistory({
      evaluations: financeData.evaluations,
      predictions: financeData.historyRecords.flatMap((record) => record.predictions),
    });

    await upsertFinanceInsights(learned.insights);

    return NextResponse.json({
      ok: true,
      logs: [...learned.logs, '学习洞察已写入存储'],
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: errorMessage(error) },
      { status: 500 },
    );
  }
}
