import { randomUUID } from 'node:crypto';
import type {
  Insight,
  MarketQuote,
  Prediction,
  PredictionRecord,
  RawDataBundle,
  RssItem,
} from './types';

class HttpError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

const NEWS_SOURCES: Array<{
  name: string;
  url: string;
  itemFilter?: (item: RssItem) => boolean;
}> = [
  {
    name: 'eastmoneyRoll',
    url: 'https://roll.eastmoney.com/',
    itemFilter: (item) => /eastmoney\.com\/a\//i.test(item.link),
  },
  {
    name: 'cls',
    url: 'https://www.cls.cn/',
    itemFilter: (item) => /\/detail\//.test(item.link) && item.title.length <= 80,
  },
];

const QUOTE_SYMBOLS: Record<string, string> = {
  nasdaq: '^IXIC',
  hkTech: 'HSTECH',
  gold: 'GC=F',
  a50: 'CNX',
  brent: 'BZ=F',
  dxy: 'DX-Y.NYB',
  usdCnh: 'CNH=X',
};

const PREFER_FALLBACK = new Set(['GC=F', 'BZ=F', 'DX-Y.NYB', 'CNH=X']);

const EASTMONEY_SYMBOLS: Record<string, { secid: string; name: string }> = {
  dxy: { secid: '100.UDI', name: '美元指数' },
};

const SINA_FOREX_SYMBOLS: Record<string, string> = {
  usdCnh: 'fx_susdcnh',
};

const HOT_TOPIC_QUERIES = [
  '今日A股市场热点',
  '纳斯达克期货',
  '黄金价格',
  '恒生科技',
  '原油 Brent',
  '美元指数 DXY',
];

const MARKET_NEWS_KEYWORDS =
  /(纳指|纳斯达克|美股|恒生科技|港股|黄金|原油|布伦特|美元指数|离岸人民币|美联储|CPI|PPI|非农|地缘|芯片|AI)/i;

function getTimestamp(): string {
  return new Date().toISOString();
}

function getChinaDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getChinaHourKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}_${get('hour')}00`;
}

function normalizeCharset(charset?: string | null): string {
  const value = charset?.trim().toLowerCase();
  if (!value) return 'utf-8';
  if (value === 'gbk' || value === 'gb2312' || value === 'gb_2312-80') {
    return 'gb18030';
  }
  return value;
}

function getCharsetFromContentType(contentType?: string | null): string | null {
  if (!contentType) return null;
  const match = contentType.match(/charset=([^;]+)/i);
  return match ? match[1].trim() : null;
}

function decodeBuffer(buffer: Uint8Array, charset?: string | null): string {
  try {
    return new TextDecoder(normalizeCharset(charset)).decode(buffer);
  } catch {
    return new TextDecoder('utf-8').decode(buffer);
  }
}

async function requestText(
  url: string,
  options: { headers?: Record<string, string>; timeoutMs?: number; charset?: string } = {},
): Promise<string> {
  const resp = await fetch(url, {
    headers: options.headers,
    signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
  });

  if (!resp.ok) {
    throw new HttpError(resp.status);
  }

  const buffer = new Uint8Array(await resp.arrayBuffer());
  return decodeBuffer(
    buffer,
    getCharsetFromContentType(resp.headers.get('content-type')) ?? options.charset,
  );
}

async function requestJson<T>(
  url: string,
  options: { headers?: Record<string, string>; timeoutMs?: number } = {},
): Promise<T> {
  return JSON.parse(await requestText(url, options)) as T;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeChange(current?: number, previous?: number): number | undefined {
  if (typeof current !== 'number' || typeof previous !== 'number' || previous === 0) {
    return undefined;
  }
  return ((current - previous) / previous) * 100;
}

function stripCdata(input: string): string {
  return input.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizeNewsText(input: string): string {
  return decodeHtmlEntities(stripCdata(input)).replace(/\s+/g, ' ').trim();
}

function normalizeLink(baseUrl: string, href: string): string | null {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function isUsefulHeadline(text: string): boolean {
  if (text.length < 8 || text.length > 120) return false;
  if (!/[\u4e00-\u9fa5A-Za-z]/.test(text)) return false;
  if (/^(关于我们|网站声明|联系方式|用户反馈|网站地图|帮助|首页|电报|话题|盯盘|VIP|FM|投研|下载)$/.test(text)) {
    return false;
  }
  return true;
}

async function fetchHtmlNews(source: (typeof NEWS_SOURCES)[number]): Promise<RawDataBundle['rss'][number]> {
  try {
    const text = await requestText(source.url, {
      timeoutMs: 8000,
      headers: { 'User-Agent': USER_AGENT },
    });
    const items: RssItem[] = [];
    const seen = new Set<string>();

    for (const match of Array.from(
      text.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi),
    )) {
      const link = normalizeLink(source.url, match[1]);
      const title = normalizeNewsText(match[2]);
      if (!link || !isUsefulHeadline(title)) continue;

      const item: RssItem = {
        title,
        link,
        pubDate: '',
        source: source.name,
      };

      if (source.itemFilter && !source.itemFilter(item)) continue;
      if (seen.has(title)) continue;

      seen.add(title);
      items.push(item);
      if (items.length >= 20) break;
    }

    return {
      name: source.name,
      url: source.url,
      items,
      fetchedAt: getTimestamp(),
    };
  } catch (error) {
    return {
      name: source.name,
      url: source.url,
      error: error instanceof Error ? error.message : String(error),
      fetchedAt: getTimestamp(),
    };
  }
}

async function fetchYahooQuote(symbol: string): Promise<MarketQuote | null> {
  try {
    const data = await requestJson<{
      chart?: {
        result?: Array<{
          meta?: Record<string, unknown>;
          indicators?: { quote?: Array<{ close?: Array<number | null> }> };
        }>;
      };
    }>(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
      {
        headers: { 'User-Agent': USER_AGENT },
        timeoutMs: 8000,
      },
    );

    const result = data.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta) return null;

    const closes = (result?.indicators?.quote?.[0]?.close || []).filter(
      (value): value is number => typeof value === 'number' && Number.isFinite(value),
    );

    const rawPrice = meta.regularMarketPrice;
    const rawPrev = meta.previousClose;

    const price =
      typeof rawPrice === 'number'
        ? rawPrice
        : closes.length > 0
          ? closes[closes.length - 1]
          : undefined;
    const prevClose =
      typeof rawPrev === 'number'
        ? rawPrev
        : closes.length >= 2
          ? closes[closes.length - 2]
          : undefined;

    if (typeof price !== 'number') return null;

    const rawChange = meta.regularMarketChangePercent as number | undefined;
    return {
      symbol: (meta.symbol as string) || symbol,
      shortName: (meta.shortName as string) || (meta.longName as string) || undefined,
      price,
      prevClose,
      currency: meta.currency as string,
      marketTime: meta.regularMarketTime as number,
      change:
        typeof rawChange === 'number'
          ? rawChange
          : normalizeChange(price, prevClose),
    };
  } catch {
    return null;
  }
}

async function fetchStooqQuote(symbol: string): Promise<MarketQuote | null> {
  const stooqMap: Record<string, string> = {
    '^IXIC': '^ixic',
    'GC=F': 'gold',
    'BZ=F': 'bno.us',
    'DX-Y.NYB': 'usdidx',
    'CNH=X': 'usdcnh',
  };
  const mapped = stooqMap[symbol];
  if (!mapped) return null;

  try {
    const text = (
      await requestText(
        `https://stooq.com/q/l/?s=${encodeURIComponent(mapped)}&f=sd2t2ohlcvn&e=csv`,
        {
          headers: { 'User-Agent': USER_AGENT },
          timeoutMs: 8000,
        },
      )
    ).trim();

    const lines = text.split('\n');
    if (lines.length < 2) return null;
    const values = lines[1].split(',');
    if (values.length < 9) return null;

    const price = Number(values[6]);
    const prevClose = Number(values[4]);
    if (!Number.isFinite(price)) return null;

    return {
      symbol,
      shortName: values[8] || mapped,
      price,
      prevClose: Number.isFinite(prevClose) ? prevClose : undefined,
      change: normalizeChange(price, prevClose) ?? 0,
    };
  } catch {
    return null;
  }
}

async function fetchTencentQuote(symbol: string): Promise<MarketQuote | null> {
  const tencentMap: Record<string, string> = {
    '^IXIC': 'usIXIC',
    HSTECH: 'hkHSTECH',
    'GC=F': 'hf_GC',
    CNX: 'sz399001',
    'BZ=F': 'hf_CL',
  };
  const mapped = tencentMap[symbol];
  if (!mapped) return null;

  try {
    const text = await requestText(`https://qt.gtimg.cn/q=${encodeURIComponent(mapped)}`, {
      headers: { 'User-Agent': USER_AGENT, Referer: 'https://gu.qq.com/' },
      timeoutMs: 8000,
      charset: 'gb18030',
    });
    const body = text.split('=')[1]?.replace(/"|;|\n/g, '') || '';

    if (mapped.startsWith('hf_')) {
      const parts = body.split(',');
      if (parts.length < 8) return null;
      const price = Number(parts[0]);
      const change = Number(parts[1]);
      const prevClose = Number(parts[7]);
      if (!Number.isFinite(price)) return null;
      return {
        symbol,
        shortName: parts[13] || mapped,
        price,
        prevClose: Number.isFinite(prevClose) ? prevClose : undefined,
        change: Number.isFinite(change) ? change : normalizeChange(price, prevClose),
      };
    }

    const parts = body.split('~');
    if (parts.length < 5) return null;
    const price = Number(parts[3]);
    const prevClose = Number(parts[4]);
    if (!Number.isFinite(price)) return null;

    return {
      symbol,
      shortName: parts[1] || mapped,
      price,
      prevClose: Number.isFinite(prevClose) ? prevClose : undefined,
      change: normalizeChange(price, prevClose),
    };
  } catch {
    return null;
  }
}

async function fetchEastMoneyQuote(symbol: string): Promise<MarketQuote | null> {
  const config = EASTMONEY_SYMBOLS[symbol];
  if (!config) return null;

  try {
    const data = await requestJson<{
      rc?: number;
      data?: { f43?: number; f58?: string; f60?: number };
    }>(
      `https://push2.eastmoney.com/api/qt/stock/get?ut=fa5fd1943c7b386f172d6893dbfba10b&fltt=2&invt=2&volt=2&fields=f43,f58,f60&secid=${config.secid}`,
      {
        headers: { 'User-Agent': USER_AGENT },
        timeoutMs: 8000,
      },
    );

    if (data.rc !== 0 || !data.data) return null;
    const price = data.data.f43;
    const prevClose = data.data.f60;
    if (typeof price !== 'number' || typeof prevClose !== 'number' || prevClose === 0) {
      return null;
    }

    return {
      symbol: QUOTE_SYMBOLS[symbol] || symbol,
      shortName: data.data.f58 || config.name,
      price,
      prevClose,
      change: ((price - prevClose) / prevClose) * 100,
    };
  } catch {
    return null;
  }
}

async function fetchSinaForexQuote(symbol: string): Promise<MarketQuote | null> {
  const mapped = SINA_FOREX_SYMBOLS[symbol];
  if (!mapped) return null;

  try {
    const text = await requestText(`https://hq.sinajs.cn/list=${mapped}`, {
      headers: { 'User-Agent': USER_AGENT, Referer: 'https://finance.sina.com.cn' },
      timeoutMs: 8000,
      charset: 'gb18030',
    });
    const match = text.match(/"([^"]*)"/);
    if (!match) return null;
    const parts = match[1].split(',');
    if (parts.length < 10) return null;

    const price = Number(parts[1]);
    const change = Number(parts[11]);
    const prevClose = Number(parts[8]) || price / (1 + change / 100);
    if (!Number.isFinite(price)) return null;

    return {
      symbol: QUOTE_SYMBOLS[symbol] || symbol,
      shortName: 'USD/CNH',
      price,
      prevClose: Number.isFinite(prevClose) ? prevClose : undefined,
      change: Number.isFinite(change) ? change : undefined,
    };
  } catch {
    return null;
  }
}

async function fetchByFallback(symbol: string): Promise<MarketQuote | null> {
  if (symbol === 'DX-Y.NYB') {
    const eastmoney = await fetchEastMoneyQuote('dxy');
    if (eastmoney) return eastmoney;
  }

  if (symbol === 'CNH=X') {
    const sina = await fetchSinaForexQuote('usdCnh');
    if (sina) return sina;
  }

  const [tencent, stooq] = await Promise.all([
    fetchTencentQuote(symbol),
    fetchStooqQuote(symbol),
  ]);
  return tencent ?? stooq;
}

async function fetchQuotes(): Promise<Record<string, MarketQuote>> {
  const results: Record<string, MarketQuote> = {};

  for (const [key, symbol] of Object.entries(QUOTE_SYMBOLS)) {
    try {
      if (key === 'dxy') {
        results[key] =
          (await fetchEastMoneyQuote('dxy')) ??
          (await fetchYahooQuote(symbol)) ??
          { error: 'No data' };
        continue;
      }

      if (key === 'usdCnh') {
        results[key] =
          (await fetchSinaForexQuote('usdCnh')) ??
          (await fetchStooqQuote(symbol)) ??
          (await fetchYahooQuote(symbol)) ??
          { error: 'No data' };
        continue;
      }

      if (PREFER_FALLBACK.has(symbol)) {
        results[key] =
          (await fetchByFallback(symbol)) ??
          (await fetchYahooQuote(symbol)) ??
          { error: 'No data' };
        continue;
      }

      results[key] =
        (await fetchYahooQuote(symbol)) ??
        (await fetchByFallback(symbol)) ??
        { error: 'No data' };

      await sleep(250);
    } catch (error) {
      results[key] = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return results;
}

export async function fetchHistoricalClose(
  symbol: string,
): Promise<{ prev: number; curr: number; changePct: number } | null> {
  if (PREFER_FALLBACK.has(symbol)) {
    const fallback = await fetchByFallback(symbol);
    if (
      fallback &&
      typeof fallback.price === 'number' &&
      typeof fallback.prevClose === 'number' &&
      fallback.prevClose !== 0
    ) {
      return {
        prev: fallback.prevClose,
        curr: fallback.price,
        changePct: ((fallback.price - fallback.prevClose) / fallback.prevClose) * 100,
      };
    }
  }

  const yahoo = await fetchYahooQuote(symbol);
  if (
    yahoo &&
    typeof yahoo.price === 'number' &&
    typeof yahoo.prevClose === 'number' &&
    yahoo.prevClose !== 0
  ) {
    return {
      prev: yahoo.prevClose,
      curr: yahoo.price,
      changePct: ((yahoo.price - yahoo.prevClose) / yahoo.prevClose) * 100,
    };
  }

  const fallback = await fetchByFallback(symbol);
  if (
    !fallback ||
    typeof fallback.price !== 'number' ||
    typeof fallback.prevClose !== 'number' ||
    fallback.prevClose === 0
  ) {
    return null;
  }

  return {
    prev: fallback.prevClose,
    curr: fallback.price,
    changePct: ((fallback.price - fallback.prevClose) / fallback.prevClose) * 100,
  };
}

function summarizeTopics(
  quotes: RawDataBundle['quotes'],
): Array<{ query: string; status: string; summary?: string }> {
  const mappings = [
    { query: '纳斯达克期货', key: 'nasdaq' as const },
    { query: '恒生科技', key: 'hkTech' as const },
    { query: '黄金价格', key: 'gold' as const },
    { query: '原油 Brent', key: 'brent' as const },
    { query: '美元指数 DXY', key: 'dxy' as const },
    { query: 'USD/CNH', key: 'usdCnh' as const },
  ];

  return HOT_TOPIC_QUERIES.map((query) => {
    const matched = mappings.find((item) => query.includes(item.query) || query.includes(item.key));
    if (!matched) return { query, status: 'tracked' };

    const quote = quotes[matched.key];
    if (!quote || quote.error || typeof quote.change !== 'number') {
      return { query, status: 'unavailable', summary: '暂无可用行情' };
    }

    const direction = quote.change > 0.1 ? '偏强' : quote.change < -0.1 ? '偏弱' : '震荡';
    const label = quote.shortName ? `${quote.shortName} ` : '';
    return {
      query,
      status: 'tracked',
      summary: `${label}${direction}，变动 ${quote.change.toFixed(2)}%`,
    };
  });
}

function buildMarketNews(rssResults: RawDataBundle['rss']) {
  const dedup = new Set<string>();
  return rssResults
    .flatMap((source) => (source.items || []).map((item) => ({ ...item, source: source.name })))
    .filter((item) => MARKET_NEWS_KEYWORDS.test(`${item.title} ${item.desc || ''}`))
    .filter((item) => {
      const key = item.title.trim();
      if (dedup.has(key)) return false;
      dedup.add(key);
      return true;
    })
    .slice(0, 12)
    .map((item) => ({
      source: item.source,
      title: item.title,
      summary: item.desc || '',
      url: item.link,
    }));
}

function makePredictionId(index: number): string {
  return `pred-${Date.now()}-${index}-${randomUUID().slice(0, 6)}`;
}

function extractHotSectors(
  rawBundle: RawDataBundle,
): { sector: string; confidence: number; reasoning: string[] } | null {
  const sectorKeywords: Record<string, string[]> = {
    科技: ['科技', '半导体', '芯片', 'AI', '人工智能', '互联网', '算力'],
    新能源: ['新能源', '光伏', '锂电', '储能', '电动车'],
    医药: ['医药', '医疗器械', '生物制药', '疫苗'],
    消费: ['消费', '食品', '白酒', '家电', '汽车'],
    金融: ['银行', '保险', '券商', '证券'],
    资源: ['黄金', '原油', '煤炭', '有色', '铜', '铝'],
  };

  const allTexts = [
    ...rawBundle.rss
      .filter((source) => source.items)
      .flatMap((source) => source.items!.map((item) => `${item.title} ${item.desc || ''}`)),
    ...((rawBundle.marketNews?.news || []).map(
      (item) => `${item.title || ''} ${item.summary || ''}`,
    )),
  ];

  const scores: Record<string, number> = {};
  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      for (const text of allTexts) {
        if (text.includes(keyword)) score++;
      }
    }
    if (score > 0) scores[sector] = score;
  }

  if (!Object.keys(scores).length) return null;
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return {
    sector: top[0],
    confidence: Math.min(0.85, 0.5 + top[1] / 12),
    reasoning: [`新闻流中 ${top[0]} 相关关键词最密集`, `热度评分: ${top[1]}`],
  };
}

function addDirectionPrediction(
  predictions: Prediction[],
  insights: Insight | null,
  params: {
    key: keyof NonNullable<RawDataBundle['quotes']>;
    target: string;
    type: Prediction['type'];
    upThreshold: number;
    downThreshold: number;
    maxConfidence: number;
    horizon: string;
    flatText: string;
    upText: string;
    downText: string;
    insightKey?: string;
    extraReasoning?: string[];
  },
  rawBundle: RawDataBundle,
): void {
  const quote = rawBundle.quotes[params.key];
  if (!quote || quote.error || typeof quote.change !== 'number') return;

  const change = quote.change;
  let direction: '涨' | '跌' | '震荡' = '震荡';
  let confidence = 0.5;
  const reasoning: string[] = [];

  if (change > params.upThreshold) {
    direction = '涨';
    confidence = Math.min(params.maxConfidence, 0.5 + Math.abs(change) / 10);
    reasoning.push(params.upText.replace('{change}', change.toFixed(2)));
  } else if (change < params.downThreshold) {
    direction = '跌';
    confidence = Math.min(params.maxConfidence, 0.5 + Math.abs(change) / 10);
    reasoning.push(params.downText.replace('{change}', Math.abs(change).toFixed(2)));
  } else {
    reasoning.push(params.flatText);
  }

  if (params.extraReasoning?.length) reasoning.push(...params.extraReasoning);

  const learned = insights?.byType?.[params.insightKey || params.type];
  if (learned?.accuracy && learned.accuracy > 0.6) {
    confidence = Math.min(0.9, confidence + 0.08);
    reasoning.push(`历史同类信号有效性较高(${(learned.accuracy * 100).toFixed(0)}%)`);
  }

  predictions.push({
    id: makePredictionId(predictions.length + 1),
    timestamp: getTimestamp(),
    type: params.type,
    target: params.target,
    direction,
    confidence: Math.round(confidence * 100),
    reasoning,
    horizon: params.horizon,
  });
}

function makeMacroRegime(rawBundle: RawDataBundle): Prediction | null {
  const reasons: string[] = [];
  const { brent, dxy, usdCnh, gold } = rawBundle.quotes;
  let riskScore = 0;

  if (brent && !brent.error && typeof brent.change === 'number') {
    if (brent.change > 1) {
      riskScore += 1;
      reasons.push(`Brent 偏强(+${brent.change.toFixed(2)}%)，输入型通胀压力抬头`);
    }
  }
  if (dxy && !dxy.error && typeof dxy.change === 'number') {
    if (dxy.change > 0.3) {
      riskScore += 1;
      reasons.push(`美元指数走强(+${dxy.change.toFixed(2)}%)，成长资产估值承压`);
    }
  }
  if (usdCnh && !usdCnh.error && typeof usdCnh.change === 'number') {
    if (usdCnh.change > 0.2) {
      riskScore += 1;
      reasons.push(`离岸人民币走弱(+${usdCnh.change.toFixed(2)}%)，外部风险偏好下降`);
    }
  }
  if (gold && !gold.error && typeof gold.change === 'number') {
    if (gold.change > 0.4) {
      riskScore += 1;
      reasons.push(`黄金走强(+${gold.change.toFixed(2)}%)，避险需求升温`);
    }
  }

  let direction: Prediction['direction'] = '震荡';
  let target = '宏观环境';
  let confidence = 0.55;

  if (riskScore >= 3) {
    direction = '风险';
    target = '风险偏好';
    confidence = 0.78;
    reasons.unshift('跨资产信号指向风险偏好走弱');
  } else if (riskScore === 0) {
    direction = '涨';
    target = '风险偏好';
    confidence = 0.62;
    reasons.push('跨资产未见明显风险扩散，情绪相对平稳');
  } else {
    reasons.push('跨资产信号分化，市场更可能维持震荡交易');
  }

  return {
    id: makePredictionId(90),
    timestamp: getTimestamp(),
    type: 'macro_regime',
    target,
    direction,
    confidence: Math.round(confidence * 100),
    reasoning: reasons,
    horizon: '未来1个交易日',
  };
}

function buildRiskAlert(rawBundle: RawDataBundle): Prediction | null {
  const alerts: string[] = [];
  const marketNews = rawBundle.marketNews?.news || [];
  const text = marketNews.map((item) => `${item.title || ''} ${item.summary || ''}`).join(' ');

  if (/伊朗|中东|霍尔木兹|原油|油价|制裁|空袭/i.test(text)) {
    alerts.push('新闻流出现地缘/能源关键词，需防范油价和避险波动放大');
  }
  if (/美联储|CPI|PPI|非农|利率/i.test(text)) {
    alerts.push('新闻流出现宏观数据/政策关键词，需关注利率预期再定价');
  }

  if (!alerts.length) return null;

  return {
    id: makePredictionId(91),
    timestamp: getTimestamp(),
    type: 'risk_alert',
    target: '短线风险',
    direction: '风险',
    confidence: 70,
    reasoning: alerts,
    horizon: '未来1个交易日',
  };
}

function makePredictions(rawBundle: RawDataBundle, insights: Insight | null): Prediction[] {
  const predictions: Prediction[] = [];

  addDirectionPrediction(
    predictions,
    insights,
    {
      key: 'nasdaq',
      target: '纳斯达克',
      type: 'index_trend',
      upThreshold: 0.5,
      downThreshold: -0.5,
      maxConfidence: 0.82,
      horizon: '当日收盘',
      flatText: '纳指横盘整理',
      upText: '当前纳指上涨{change}%',
      downText: '当前纳指下跌{change}%',
      extraReasoning: ['纳指更受美元、利率预期和风险偏好共同驱动'],
    },
    rawBundle,
  );

  addDirectionPrediction(
    predictions,
    insights,
    {
      key: 'hkTech',
      target: '恒生科技',
      type: 'index_trend',
      upThreshold: 0.45,
      downThreshold: -0.45,
      maxConfidence: 0.8,
      horizon: '当日收盘',
      flatText: '恒生科技盘整',
      upText: '恒生科技代理标的上涨{change}%',
      downText: '恒生科技代理标的下跌{change}%',
      extraReasoning: ['恒生科技波动通常高于宽基，受中美科技情绪影响更大'],
    },
    rawBundle,
  );

  addDirectionPrediction(
    predictions,
    insights,
    {
      key: 'gold',
      target: '黄金',
      type: 'gold_direction',
      upThreshold: 0.25,
      downThreshold: -0.25,
      maxConfidence: 0.78,
      horizon: '当日收盘',
      flatText: '黄金盘整',
      upText: '黄金上涨{change}%',
      downText: '黄金下跌{change}%',
      extraReasoning: ['黄金通常受避险情绪与美元方向共同影响'],
    },
    rawBundle,
  );

  addDirectionPrediction(
    predictions,
    insights,
    {
      key: 'a50',
      target: 'A股大盘',
      type: 'index_trend',
      upThreshold: 0.3,
      downThreshold: -0.3,
      maxConfidence: 0.74,
      horizon: '当日收盘',
      flatText: 'A股平盘',
      upText: 'A50上涨{change}%',
      downText: 'A50下跌{change}%',
    },
    rawBundle,
  );

  const hotSector = extractHotSectors(rawBundle);
  if (hotSector) {
    predictions.push({
      id: makePredictionId(80),
      timestamp: getTimestamp(),
      type: 'sector_hot',
      target: hotSector.sector,
      direction: '热点',
      confidence: Math.round(hotSector.confidence * 100),
      reasoning: hotSector.reasoning,
      horizon: '未来1-3个交易日',
    });
  }

  const macro = makeMacroRegime(rawBundle);
  if (macro) predictions.push(macro);

  const riskAlert = buildRiskAlert(rawBundle);
  if (riskAlert) predictions.push(riskAlert);

  return predictions;
}

export async function collectFinanceCycle(
  insights: Insight | null,
): Promise<{
  rawBundle: RawDataBundle;
  predictionRecord: PredictionRecord;
  logs: string[];
}> {
  const logs = ['开始采集新闻源和行情'];
  const [rss, quotes] = await Promise.all([
    Promise.all(NEWS_SOURCES.map((source) => fetchHtmlNews(source))),
    fetchQuotes(),
  ]);

  logs.push(`新闻源完成 ${rss.length} 个，行情完成 ${Object.keys(quotes).length} 个标的`);

  const rawBundle: RawDataBundle = {
    timestamp: new Date(new Date().setMinutes(0, 0, 0)).toISOString(),
    date: getChinaDate(),
    hour: getChinaHourKey(),
    rss,
    quotes,
    hotTopics: {
      topics: summarizeTopics(quotes),
      fetchedAt: getTimestamp(),
    },
    marketNews: {
      news: buildMarketNews(rss),
      fetchedAt: getTimestamp(),
    },
  };

  const predictions = makePredictions(rawBundle, insights);
  logs.push(`生成 ${predictions.length} 条预测`);

  return {
    rawBundle,
    predictionRecord: {
      date: rawBundle.date,
      predictions,
    },
    logs,
  };
}
