import type { KPI, MarketWatchItem, TickerItem } from "@/data/kpis";

export interface FxQuote {
  pair: string;
  base: string;
  quote: string;
  rate: number;
  changePct: number;
  source: string;
}

export interface CommodityQuote {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  unit: string;
  source: string;
}

export interface MarketSnapshot {
  fetchedAt: number;
  isLive: boolean;
  liveSourceCount: number;
  sources: string[];
  errors: string[];
  fx: FxQuote[];
  commodities: CommodityQuote[];
  ticker: TickerItem[];
  kpis: KPI[];
  marketWatch: MarketWatchItem[];
  nextRefreshIn: number;
}

export interface MarketCacheEntry {
  fetchedAt: number;
  fx: Record<string, number>;
  commodities: Record<string, number>;
}