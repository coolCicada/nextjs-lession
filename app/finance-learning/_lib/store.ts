import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { sql } from '@vercel/postgres';
import { ensureFinanceSchema, hasFinanceDatabase } from './schema';
import type {
  Evaluation,
  FinanceModuleData,
  Insight,
  Prediction,
  PredictionRecord,
  RawDataBundle,
} from './types';

const LOCAL_DATA_ROOT = path.join(process.cwd(), 'data', 'finance-learning');
const LEGACY_PROJECT_ROOT = path.join(process.cwd(), '..', 'finance-learning');
const LEGACY_DATA_ROOT = path.join(LEGACY_PROJECT_ROOT, 'data');
const LEGACY_LEARNING_ROOT = path.join(LEGACY_PROJECT_ROOT, 'learning');

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function listJsonFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.json'))
    .sort();
}

function getDataRoots(): string[] {
  return [LOCAL_DATA_ROOT, LEGACY_DATA_ROOT].filter((dir) => fs.existsSync(dir));
}

function getLearningRoots(): string[] {
  return [
    path.join(LOCAL_DATA_ROOT, 'learning'),
    LEGACY_LEARNING_ROOT,
  ].filter((dir) => fs.existsSync(dir));
}

function getChinaDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getFinanceChinaDate(date = new Date()): string {
  return getChinaDate(date);
}

function loadLocalPredictions(): PredictionRecord[] {
  const merged = new Map<string, PredictionRecord>();

  for (const root of getDataRoots()) {
    const predDir = path.join(root, 'predictions');
    for (const file of listJsonFiles(predDir)) {
      const record = readJsonFile<PredictionRecord>(path.join(predDir, file));
      if (record?.date && !merged.has(record.date)) {
        merged.set(record.date, record);
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function loadLocalEvaluations(): Evaluation[] {
  const merged = new Map<string, Evaluation>();

  for (const root of getDataRoots()) {
    const evalDir = path.join(root, 'evaluations');
    for (const file of listJsonFiles(evalDir)) {
      const record = readJsonFile<Evaluation>(path.join(evalDir, file));
      if (record?.date && !merged.has(record.date)) {
        merged.set(record.date, record);
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function loadLocalLatestRawBundle(): RawDataBundle | null {
  for (const root of getDataRoots()) {
    const latest = readJsonFile<RawDataBundle>(path.join(root, 'raw', 'latest.json'));
    if (latest) return latest;
  }
  return null;
}

function loadLocalInsights(): Insight | null {
  for (const root of getLearningRoots()) {
    const insights = readJsonFile<Insight>(path.join(root, 'insights.json'));
    if (insights) return insights;
  }
  return null;
}

function loadLocalFinanceModuleData(): FinanceModuleData {
  const historyRecords = loadLocalPredictions();
  const today = getChinaDate();
  const todayPrediction =
    historyRecords.find((record) => record.date === today) ?? historyRecords[0] ?? null;

  return {
    latestRawBundle: loadLocalLatestRawBundle(),
    todayPrediction,
    historyRecords,
    evaluations: loadLocalEvaluations(),
    insights: loadLocalInsights(),
  };
}

async function loadDbFinanceModuleData(): Promise<FinanceModuleData | null> {
  if (!hasFinanceDatabase()) return null;

  await ensureFinanceSchema();

  const { rows } = await sql`
    SELECT
      record_date::text AS "recordDate",
      raw_bundle AS "rawBundle",
      predictions AS "predictions",
      evaluation AS "evaluation",
      collected_at AS "collectedAt",
      evaluated_at AS "evaluatedAt"
    FROM finance_learning_daily_records
    ORDER BY record_date DESC
    LIMIT 60
  `;

  if (!rows.length) {
    return null;
  }

  const historyRecords: PredictionRecord[] = rows
    .filter((row) => Array.isArray(row.predictions))
    .map((row) => ({
      date: row.recordDate as string,
      predictions: row.predictions as Prediction[],
    }));

  const evaluations: Evaluation[] = rows
    .filter((row) => row.evaluation)
    .map((row) => row.evaluation as Evaluation);

  const latestRawBundle =
    (rows.find((row) => row.rawBundle)?.rawBundle as RawDataBundle | undefined) ?? null;

  const { rows: metaRows } = await sql`
    SELECT value
    FROM finance_learning_meta
    WHERE key = 'insights'
    LIMIT 1
  `;

  return {
    latestRawBundle,
    todayPrediction: historyRecords[0] ?? null,
    historyRecords,
    evaluations,
    insights: (metaRows[0]?.value as Insight | undefined) ?? null,
  };
}

export async function getFinanceModuleData(): Promise<FinanceModuleData> {
  try {
    const dbData = await loadDbFinanceModuleData();
    if (dbData) {
      return {
        ...dbData,
        insights: dbData.insights ?? loadLocalInsights(),
      };
    }
  } catch {
    // Fall back to local snapshots when DB is configured but temporarily unreachable.
  }

  return loadLocalFinanceModuleData();
}

export async function getStoredInsights(): Promise<Insight | null> {
  try {
    const dbData = await loadDbFinanceModuleData();
    return dbData?.insights ?? loadLocalInsights();
  } catch {
    return loadLocalInsights();
  }
}

export async function getPredictionRecordByDate(
  date: string,
): Promise<PredictionRecord | null> {
  const data = await getFinanceModuleData();
  return data.historyRecords.find((record) => record.date === date) ?? null;
}

export async function getEvaluationByDate(
  date: string,
): Promise<Evaluation | null> {
  const data = await getFinanceModuleData();
  return data.evaluations.find((record) => record.date === date) ?? null;
}

export async function upsertFinanceCollection(params: {
  date: string;
  rawBundle: RawDataBundle;
  predictions: Prediction[];
}): Promise<void> {
  if (hasFinanceDatabase()) {
    await ensureFinanceSchema();
    await sql`
      INSERT INTO finance_learning_daily_records (
        record_date,
        raw_bundle,
        predictions,
        collected_at,
        updated_at
      )
      VALUES (
        ${params.date},
        ${JSON.stringify(params.rawBundle)}::jsonb,
        ${JSON.stringify(params.predictions)}::jsonb,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (record_date)
      DO UPDATE SET
        raw_bundle = EXCLUDED.raw_bundle,
        predictions = EXCLUDED.predictions,
        collected_at = EXCLUDED.collected_at,
        updated_at = CURRENT_TIMESTAMP
    `;
    return;
  }

  const rawDir = path.join(LOCAL_DATA_ROOT, 'raw', params.rawBundle.date);
  const rawFile = path.join(rawDir, `${params.rawBundle.hour}.json`);
  const latestFile = path.join(LOCAL_DATA_ROOT, 'raw', 'latest.json');
  const predictionFile = path.join(
    LOCAL_DATA_ROOT,
    'predictions',
    `${params.date}.json`,
  );

  writeJsonFile(rawFile, params.rawBundle);
  writeJsonFile(latestFile, params.rawBundle);
  writeJsonFile(predictionFile, {
    date: params.date,
    predictions: params.predictions,
  } satisfies PredictionRecord);
}

export async function upsertFinanceInsights(insights: Insight): Promise<void> {
  if (hasFinanceDatabase()) {
    await ensureFinanceSchema();
    await sql`
      INSERT INTO finance_learning_meta (key, value, updated_at)
      VALUES ('insights', ${JSON.stringify(insights)}::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `;
    return;
  }

  writeJsonFile(path.join(LOCAL_DATA_ROOT, 'learning', 'insights.json'), insights);
}

export async function upsertFinanceEvaluation(params: {
  date: string;
  evaluation: Evaluation;
}): Promise<void> {
  if (hasFinanceDatabase()) {
    await ensureFinanceSchema();
    await sql`
      INSERT INTO finance_learning_daily_records (
        record_date,
        evaluation,
        evaluated_at,
        updated_at
      )
      VALUES (
        ${params.date},
        ${JSON.stringify(params.evaluation)}::jsonb,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (record_date)
      DO UPDATE SET
        evaluation = EXCLUDED.evaluation,
        evaluated_at = EXCLUDED.evaluated_at,
        updated_at = CURRENT_TIMESTAMP
    `;
    return;
  }

  writeJsonFile(
    path.join(LOCAL_DATA_ROOT, 'evaluations', `${params.date}.json`),
    params.evaluation,
  );
}
