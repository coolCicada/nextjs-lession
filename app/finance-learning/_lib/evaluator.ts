import { fetchHistoricalClose } from './collector';
import { getFinanceChinaDate } from './store';
import type {
  ActualData,
  Evaluation,
  EvaluationResult,
  Prediction,
  PredictionRecord,
} from './types';

const SYMBOL_MAP: Record<string, string> = {
  纳斯达克: '^IXIC',
  恒生科技: 'HSTECH',
  黄金: 'GC=F',
  A股大盘: 'CNX',
};

async function fetchActualData(): Promise<Record<string, ActualData>> {
  const results: Record<string, ActualData> = {};

  for (const [target, symbol] of Object.entries(SYMBOL_MAP)) {
    const hist = await fetchHistoricalClose(symbol);
    if (hist) {
      results[target] = {
        changePct: parseFloat(hist.changePct.toFixed(2)),
        direction:
          hist.changePct > 0.1 ? '涨' : hist.changePct < -0.1 ? '跌' : '震荡',
      };
    } else {
      results[target] = { error: 'Failed to fetch' };
    }
  }

  return results;
}

function evaluatePredictions(
  predictions: Prediction[],
  actualData: Record<string, ActualData>,
): { results: EvaluationResult[]; summary: Evaluation['summary'] } {
  const results: EvaluationResult[] = [];

  for (const prediction of predictions) {
    if (prediction.horizon !== '当日收盘') continue;
    if (!(prediction.target in SYMBOL_MAP)) continue;

    const actual = actualData[prediction.target];
    if (!actual || actual.error || !actual.direction) {
      results.push({
        predId: prediction.id,
        target: prediction.target,
        predicted: prediction.direction,
        actual: '震荡',
        correct: null,
        actualChange: 'N/A',
        accuracyScore: null,
        reason: actual?.error || '无实际数据',
      });
      continue;
    }

    const correct = prediction.direction === actual.direction;
    let score = correct ? 1 : 0;
    if (!correct) {
      const predIdx = ['涨', '震荡', '跌'].indexOf(prediction.direction);
      const actualIdx = ['涨', '震荡', '跌'].indexOf(actual.direction);
      if (predIdx >= 0 && actualIdx >= 0 && Math.abs(predIdx - actualIdx) === 1) {
        score = 0.3;
      }
    }

    results.push({
      predId: prediction.id,
      target: prediction.target,
      predicted: prediction.direction,
      actual: actual.direction,
      correct,
      actualChange: `${actual.changePct! > 0 ? '+' : ''}${actual.changePct}%`,
      accuracyScore: score,
    });
  }

  const valid = results.filter((item) => item.accuracyScore !== null);
  const total = valid.length;
  const correct = valid.filter((item) => item.correct).length;
  const accuracy =
    total > 0
      ? Math.round(
          (valid.reduce((sum, item) => sum + item.accuracyScore!, 0) / total) * 1000,
        ) / 1000
      : 0;

  return {
    results,
    summary: {
      total,
      correct,
      accuracy,
    },
  };
}

export async function evaluatePredictionRecord(
  predictionRecord: PredictionRecord,
  date = predictionRecord.date || getFinanceChinaDate(),
): Promise<{ evaluation: Evaluation; logs: string[] }> {
  const logs = [`开始评估 ${date} 的 ${predictionRecord.predictions.length} 条预测`];
  const actualData = await fetchActualData();
  logs.push(`获取到 ${Object.keys(actualData).length} 个实际行情结果`);

  const evaluated = evaluatePredictions(predictionRecord.predictions, actualData);
  const evaluation: Evaluation = {
    date,
    results: evaluated.results,
    summary: evaluated.summary,
    evaluatedAt: new Date().toISOString(),
  };

  logs.push(
    `评估完成：准确率 ${(evaluation.summary.accuracy * 100).toFixed(1)}% (${evaluation.summary.correct}/${evaluation.summary.total})`,
  );

  return { evaluation, logs };
}
