import { DataClient } from '../_components/data-client';
import { getFinanceModuleData } from '../_lib/store';

export const dynamic = 'force-dynamic';

export default async function FinanceLearningDataPage() {
  const data = await getFinanceModuleData();
  return <DataClient latestRawBundle={data.latestRawBundle} />;
}
