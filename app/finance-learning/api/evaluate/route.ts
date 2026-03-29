import { NextResponse } from 'next/server';
import { evaluatePredictionRecord } from '../../_lib/evaluator';
import { learnFromHistory } from '../../_lib/learner';
import {
  getFinanceChinaDate,
  getFinanceModuleData,
  getPredictionRecordByDate,
  upsertFinanceEvaluation,
  upsertFinanceInsights,
} from '../../_lib/store';

export const dynamic = 'force-dynamic';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const date =
      typeof body?.date === 'string' && body.date.trim()
        ? body.date.trim()
        : getFinanceChinaDate();

    const predictionRecord = await getPredictionRecordByDate(date);
    if (!predictionRecord) {
      return NextResponse.json(
        { ok: false, error: `${date} 没有可评估的预测记录` },
        { status: 404 },
      );
    }

    const evaluated = await evaluatePredictionRecord(predictionRecord, date);
    await upsertFinanceEvaluation({
      date,
      evaluation: evaluated.evaluation,
    });

    const financeData = await getFinanceModuleData();
    const allPredictions = financeData.historyRecords.flatMap((record) => record.predictions);
    const allEvaluations = [
      evaluated.evaluation,
      ...financeData.evaluations.filter((item) => item.date !== date),
    ].sort((a, b) => b.date.localeCompare(a.date));

    const learned = learnFromHistory({
      evaluations: allEvaluations,
      predictions: allPredictions,
    });
    await upsertFinanceInsights(learned.insights);

    return NextResponse.json({
      ok: true,
      logs: [
        ...evaluated.logs,
        '评估结果已写入存储',
        ...learned.logs,
        '学习洞察已同步更新',
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: errorMessage(error) },
      { status: 500 },
    );
  }
}
