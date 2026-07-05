import {
  dashboardKPIs,
  marketWatchData,
  tickerData,
  type KPI,
  type MarketWatchItem,
  type TickerItem,
} from "@/data/kpis";
import type { CommodityQuote, FxQuote, MarketSnapshot } from "./types";

function formatRate(value: number, quote: string): string {
  if (quote === "VND") return value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
  if (value >= 100) return value.toFixed(2);
  if (value >= 10) return value.toFixed(3);
  return value.toFixed(4);
}

function deriveStatus(current: number, target: number, lowerIsBetter = false): MarketWatchItem["status"] {
  const ratio = lowerIsBetter ? target / current : current / target;
  if (ratio >= 0.98) return "good";
  if (ratio >= 0.9) return "warning";
  return "critical";
}

function buildLiveTicker(fx: FxQuote[], commodities: CommodityQuote[]): TickerItem[] {
  const items: TickerItem[] = [];

  for (const q of fx) {
    if (q.rate <= 0) continue;
    items.push({
      symbol: q.pair.replace("/", ""),
      name: q.pair,
      value: formatRate(q.rate, q.quote),
      change: q.changePct,
      unit: q.quote === "VND" ? "₫" : "",
    });
  }

  for (const c of commodities) {
    items.push({
      symbol: c.symbol,
      name: c.name,
      value: c.price.toFixed(2),
      change: c.changePct,
      unit: c.unit.includes("bbl") ? "$" : "",
    });
  }

  return items;
}

function buildDerivedKpis(fx: FxQuote[], commodities: CommodityQuote[]): KPI[] {
  const usdVnd = fx.find((q) => q.quote === "VND");
  const wti = commodities.find((c) => c.symbol === "WTI");
  const vndChange = usdVnd?.changePct ?? 0;
  const oilChange = wti?.changePct ?? 0;

  return dashboardKPIs.map((kpi) => {
    let change = kpi.change;
    let value = kpi.value;

    if (kpi.id === "cost" && (vndChange !== 0 || oilChange !== 0)) {
      change = parseFloat((vndChange * 0.35 + oilChange * 0.45).toFixed(2));
      const base = parseFloat(kpi.value);
      value = (base + change * 0.15).toFixed(1);
    }
    if (kpi.id === "carbon" && oilChange !== 0) {
      change = parseFloat((oilChange * 0.6).toFixed(2));
      const base = parseFloat(kpi.value);
      value = (base * (1 + oilChange / 100 * 0.08)).toFixed(2);
    }
    if (kpi.id === "lead" && vndChange !== 0) {
      change = parseFloat((-vndChange * 0.05).toFixed(2));
    }

    const spark = [...(kpi.sparkline ?? [])];
    if (spark.length > 0) {
      spark[spark.length - 1] = parseFloat(value);
    }

    return { ...kpi, value, change, sparkline: spark };
  });
}

function buildLiveMarketWatch(fx: FxQuote[], commodities: CommodityQuote[]): MarketWatchItem[] {
  const derived: MarketWatchItem[] = [];
  let id = 100;

  const usdVnd = fx.find((q) => q.quote === "VND");
  if (usdVnd && usdVnd.rate > 0) {
    const prev = usdVnd.rate / (1 + usdVnd.changePct / 100);
    derived.push({
      id: String(id++),
      metric: "Tỷ giá USD/VND",
      category: "FX · Logistics VN",
      current: usdVnd.rate,
      previous: prev,
      target: usdVnd.rate * 0.995,
      unit: "VND",
      status: usdVnd.changePct > 0.5 ? "warning" : "good",
    });
  }

  const eurUsd = fx.find((q) => q.pair === "EUR/USD");
  if (eurUsd && eurUsd.rate > 0) {
    const prev = eurUsd.rate / (1 + eurUsd.changePct / 100);
    derived.push({
      id: String(id++),
      metric: "Tỷ giá EUR/USD",
      category: "FX · EU Trade",
      current: eurUsd.rate,
      previous: prev,
      target: 1.08,
      unit: "USD",
      status: "good",
    });
  }

  const cny = fx.find((q) => q.quote === "CNY");
  if (cny && cny.rate > 0) {
    const prev = cny.rate / (1 + cny.changePct / 100);
    derived.push({
      id: String(id++),
      metric: "USD/CNY (Trung Quốc)",
      category: "FX · Import CN",
      current: cny.rate,
      previous: prev,
      target: 7.0,
      unit: "CNY",
      status: cny.changePct > 0.3 ? "warning" : "good",
    });
  }

  for (const c of commodities) {
    const prev = c.price / (1 + c.changePct / 100);
    derived.push({
      id: String(id++),
      metric: c.name,
      category: "Commodity · Freight",
      current: c.price,
      previous: prev,
      target: c.price * 0.95,
      unit: "USD/bbl",
      status: c.changePct > 2 ? "warning" : c.changePct > 5 ? "critical" : "good",
    });
  }

  const baseline = marketWatchData.map((item) => {
    if (item.metric === "Freight Cost / Unit" && usdVnd) {
      const factor = 1 + usdVnd.changePct / 100;
      const current = Math.round(item.current * factor);
      return {
        ...item,
        current,
        previous: item.current,
        status: deriveStatus(current, item.target, true),
      };
    }
    return item;
  });

  return [...derived, ...baseline.slice(0, 7)];
}

export function buildMarketSnapshot(
  fx: FxQuote[],
  commodities: CommodityQuote[],
  sources: string[],
  errors: string[],
  fetchedAt: number,
  refreshIntervalMs: number
): MarketSnapshot {
  const liveTicker = buildLiveTicker(fx, commodities);
  const hasLive = liveTicker.length > 0;

  const ticker: TickerItem[] = hasLive
    ? [...liveTicker, ...tickerData.slice(0, 4)]
    : tickerData;

  return {
    fetchedAt,
    isLive: hasLive,
    liveSourceCount: sources.length,
    sources,
    errors,
    fx,
    commodities,
    ticker,
    kpis: hasLive ? buildDerivedKpis(fx, commodities) : dashboardKPIs,
    marketWatch: hasLive ? buildLiveMarketWatch(fx, commodities) : marketWatchData,
    nextRefreshIn: refreshIntervalMs,
  };
}

export function formatMarketContext(snapshot: MarketSnapshot): string {
  const lines: string[] = [
    `Thời điểm: ${new Date(snapshot.fetchedAt).toISOString()}`,
    `Nguồn live: ${snapshot.sources.join(", ") || "không có"}`,
  ];

  for (const q of snapshot.fx) {
    lines.push(`${q.pair}: ${q.rate} (${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%)`);
  }
  for (const c of snapshot.commodities) {
    lines.push(`${c.name}: ${c.price} ${c.unit} (${c.changePct >= 0 ? "+" : ""}${c.changePct.toFixed(2)}%)`);
  }

  for (const k of snapshot.kpis.slice(0, 4)) {
    lines.push(`KPI ${k.label}: ${k.value}${k.unit ?? ""} (${k.change >= 0 ? "+" : ""}${k.change}%)`);
  }

  return lines.join("\n");
}