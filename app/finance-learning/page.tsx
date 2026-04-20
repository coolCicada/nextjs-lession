import { DashboardView } from './_components/dashboard-view';
import { getFinanceModuleData } from './_lib/store';

export const dynamic = 'force-dynamic';

export default async function FinanceLearningPage() {
  const data = await getFinanceModuleData();

  return (
    <DashboardView
      todayPrediction={data.todayPrediction}
      evaluations={data.evaluations}
      insights={data.insights}
      latestRawBundle={data.latestRawBundle}
    />
  );
}
