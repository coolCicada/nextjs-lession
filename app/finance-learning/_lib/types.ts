export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  desc?: string;
}

export interface MarketQuote {
  symbol?: string;
  shortName?: string;
  price?: number;
  change?: number;
  prevClose?: number;
  currency?: string;
  marketTime?: number;
  error?: string;
}

export interface MarketData {
  nasdaq?: MarketQuote;
  hkTech?: MarketQuote;
  gold?: MarketQuote;
  a50?: MarketQuote;
  brent?: MarketQuote;
  dxy?: MarketQuote;
  usdCnh?: MarketQuote;
  [key: string]: MarketQuote | undefined;
}

export interface RawSourceRecord {
  name: string;
  url?: string;
  items?: RssItem[];
  error?: string;
  fetchedAt: string;
}

export interface RawDataBundle {
  timestamp: string;
  date: string;
  hour: string;
  rss: RawSourceRecord[];
  quotes: MarketData;
  hotTopics?: {
    topics?: Array<{ query: string; status: string; summary?: string }>;
    fetchedAt: string;
  };
  marketNews?: {
    news?: Array<{
      source: string;
      title?: string;
      summary?: string;
      url?: string;
      data?: unknown;
      error?: string;
    }>;
    fetchedAt: string;
  };
}

export interface Prediction {
  id: string;
  timestamp: string;
  type:
    | 'index_trend'
    | 'gold_direction'
    | 'sector_hot'
    | 'macro_regime'
    | 'risk_alert';
  target: string;
  direction: '涨' | '跌' | '震荡' | '热点' | '风险';
  confidence: number;
  reasoning: string[];
  horizon: string;
}

export interface PredictionRecord {
  date: string;
  predictions: Prediction[];
}

export interface EvaluationResult {
  predId: string;
  target: string;
  predicted: string;
  actual: '涨' | '跌' | '震荡';
  correct: boolean | null;
  actualChange: string;
  accuracyScore: number | null;
  reason?: string;
}

export interface Evaluation {
  date: string;
  results: EvaluationResult[];
  summary: {
    total: number;
    correct: number;
    accuracy: number;
  };
  evaluatedAt: string;
}

export interface ActualData {
  date?: string;
  prevClose?: number;
  close?: number;
  changePct?: number;
  direction?: '涨' | '跌' | '震荡';
  error?: string;
}

export interface Insight {
  lastUpdated: string;
  overallAccuracy: number;
  byType: Record<string, { count: number; accuracy: number }>;
  topStrategies: { reasoning: string[]; accuracy: number; count: number }[];
  dropStrategies: { reasoning: string[]; accuracy: number; count: number }[];
  totalEvaluated?: number;
  daysAnalyzed?: number;
}

export interface FinanceModuleData {
  latestRawBundle: RawDataBundle | null;
  todayPrediction: PredictionRecord | null;
  historyRecords: PredictionRecord[];
  evaluations: Evaluation[];
  insights: Insight | null;
}
