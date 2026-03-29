import { HistoryClient } from '../_components/history-client';
import { getFinanceModuleData } from '../_lib/store';

export const dynamic = 'force-dynamic';

export default async function FinanceLearningHistoryPage() {
  const data = await getFinanceModuleData();
  return (
    <HistoryClient
      historyRecords={data.historyRecords}
      evaluations={data.evaluations}
    />
  );
}
