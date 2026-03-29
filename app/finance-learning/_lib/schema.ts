import { sql } from '@vercel/postgres';

export function hasFinanceDatabase(): boolean {
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_PRISMA_URL,
  );
}

export async function ensureFinanceSchema(): Promise<void> {
  if (!hasFinanceDatabase()) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS finance_learning_daily_records (
      record_date DATE PRIMARY KEY,
      raw_bundle JSONB,
      predictions JSONB,
      evaluation JSONB,
      collected_at TIMESTAMP,
      evaluated_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS finance_learning_meta (
      key VARCHAR(80) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_finance_learning_daily_updated
    ON finance_learning_daily_records(updated_at DESC)
  `;
}
