import type { MarketCacheEntry } from "./types";

const CACHE_KEY = "logiq-market-cache-v1";

export function loadMarketCache(): MarketCacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MarketCacheEntry;
    if (!parsed.fetchedAt || !parsed.fx) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMarketCache(entry: MarketCacheEntry): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* quota */
  }
}

export function calcChangePct(current: number, previous: number | undefined): number {
  if (!previous || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}