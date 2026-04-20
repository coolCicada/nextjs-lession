import { InsightsView } from '../_components/insights-view';
import { getFinanceModuleData } from '../_lib/store';

export const dynamic = 'force-dynamic';

export default async function FinanceLearningInsightsPage() {
  const data = await getFinanceModuleData();
  return <InsightsView insights={data.insights} />;
}
