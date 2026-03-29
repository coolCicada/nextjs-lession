import type { Evaluation, Insight, Prediction } from './types';

function analyze(
  evaluations: Evaluation[],
  predictions: Prediction[],
): Omit<Insight, 'lastUpdated'> {
  const byType: Record<string, { count: number; correct: number; totalScore: number }> = {};
  const reasoningStats: Record<
    string,
    { count: number; correct: number; totalScore: number }
  > = {};

  for (const evaluation of evaluations) {
    for (const result of evaluation.results) {
      if (result.accuracyScore === null) continue;

      const prediction = predictions.find((item) => item.id === result.predId);
      if (!prediction) continue;

      if (!byType[prediction.type]) {
        byType[prediction.type] = { count: 0, correct: 0, totalScore: 0 };
      }
      byType[prediction.type].count++;
      if (result.correct) byType[prediction.type].correct++;
      byType[prediction.type].totalScore += result.accuracyScore;

      for (const reason of prediction.reasoning || []) {
        const key = reason.slice(0, 20);
        if (!reasoningStats[key]) {
          reasoningStats[key] = { count: 0, correct: 0, totalScore: 0 };
        }
        reasoningStats[key].count++;
        if (result.correct) reasoningStats[key].correct++;
        reasoningStats[key].totalScore += result.accuracyScore;
      }
    }
  }

  const typeResults: Record<string, { count: number; accuracy: number }> = {};
  for (const [type, stats] of Object.entries(byType)) {
    typeResults[type] = {
      count: stats.count,
      accuracy:
        stats.count > 0
          ? Math.round((stats.totalScore / stats.count) * 1000) / 1000
          : 0,
    };
  }

  const strategyResults = Object.entries(reasoningStats)
    .filter(([, stats]) => stats.count >= 3)
    .map(([reasoning, stats]) => ({
      reasoning: [reasoning],
      count: stats.count,
      accuracy: Math.round((stats.totalScore / stats.count) * 1000) / 1000,
    }));

  const topStrategies = strategyResults
    .filter((item) => item.accuracy >= 0.6)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 10);

  const dropStrategies = strategyResults
    .filter((item) => item.accuracy < 0.4)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const totals = Object.values(byType).reduce(
    (acc, stats) => {
      acc.score += stats.totalScore;
      acc.count += stats.count;
      return acc;
    },
    { score: 0, count: 0 },
  );

  return {
    overallAccuracy:
      totals.count > 0 ? Math.round((totals.score / totals.count) * 1000) / 1000 : 0,
    totalEvaluated: totals.count,
    byType: typeResults,
    topStrategies,
    dropStrategies,
    daysAnalyzed: evaluations.length,
  };
}

export function learnFromHistory(params: {
  evaluations: Evaluation[];
  predictions: Prediction[];
}): { insights: Insight; logs: string[] } {
  const logs = [
    `开始学习：${params.evaluations.length} 天评估记录，${params.predictions.length} 条预测`,
  ];

  if (!params.evaluations.length) {
    const insights: Insight = {
      lastUpdated: new Date().toISOString().slice(0, 10),
      overallAccuracy: 0,
      byType: {},
      topStrategies: [],
      dropStrategies: [],
      totalEvaluated: 0,
      daysAnalyzed: 0,
    };
    logs.push('暂无足够评估数据，写入空洞察');
    return { insights, logs };
  }

  const insights: Insight = {
    ...analyze(params.evaluations, params.predictions),
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
  logs.push(
    `学习完成：总体准确率 ${(insights.overallAccuracy * 100).toFixed(1)}%，分析 ${insights.daysAnalyzed} 天`,
  );

  return { insights, logs };
}
