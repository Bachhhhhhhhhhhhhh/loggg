"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dashboardKPIs, marketWatchData, tickerData } from "@/data/kpis";
import { buildMarketSnapshot } from "@/lib/market/aggregator";
import { loadMarketCache, saveMarketCache } from "@/lib/market/cache";
import { fetchAllLiveMarket } from "@/lib/market/fetchers";
import type { MarketSnapshot } from "@/lib/market/types";

const REFRESH_MS = 5 * 60 * 1000;

const FALLBACK_SNAPSHOT: MarketSnapshot = {
  fetchedAt: 0,
  isLive: false,
  liveSourceCount: 0,
  sources: [],
  errors: [],
  fx: [],
  commodities: [],
  ticker: tickerData,
  kpis: dashboardKPIs,
  marketWatch: marketWatchData,
  nextRefreshIn: REFRESH_MS,
};

interface MarketDataContextValue {
  snapshot: MarketSnapshot;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdatedLabel: string;
}

const MarketDataContext = createContext<MarketDataContextValue | null>(null);

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(FALLBACK_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const refresh = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setRefreshing(true);
    setError(null);

    try {
      const cache = loadMarketCache();
      const prevRates: Record<string, number> = { ...(cache?.fx ?? {}) };
      const prevCommodities: Record<string, number> = { ...(cache?.commodities ?? {}) };

      const { fx, rates, commodities, sources, errors } = await fetchAllLiveMarket(
        prevRates,
        prevCommodities
      );

      const commodityMap: Record<string, number> = { ...prevCommodities };
      for (const c of commodities) commodityMap[c.symbol] = c.price;

      saveMarketCache({
        fetchedAt: Date.now(),
        fx: { ...rates, EUR_USD: rates.EUR_USD },
        commodities: commodityMap,
      });

      const next = buildMarketSnapshot(
        fx,
        commodities,
        sources,
        errors,
        Date.now(),
        REFRESH_MS
      );
      setSnapshot(next);
      if (errors.length > 0 && !next.isLive) {
        setError(errors.join(" · "));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi tải dữ liệu thị trường";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
      busyRef.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const lastUpdatedLabel = useMemo(() => {
    if (!snapshot.fetchedAt) return "Chưa cập nhật";
    const d = new Date(snapshot.fetchedAt);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }, [snapshot.fetchedAt]);

  const value = useMemo(
    () => ({
      snapshot,
      loading,
      refreshing,
      error,
      refresh,
      lastUpdatedLabel,
    }),
    [snapshot, loading, refreshing, error, refresh, lastUpdatedLabel]
  );

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>;
}

export function useMarketData(): MarketDataContextValue {
  const ctx = useContext(MarketDataContext);
  if (!ctx) {
    throw new Error("useMarketData must be used within MarketDataProvider");
  }
  return ctx;
}