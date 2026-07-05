import type { CommodityQuote, FxQuote } from "./types";
import { calcChangePct } from "./cache";

const FETCH_TIMEOUT_MS = 10_000;

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

interface FrankfurterLatest {
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface ErApiLatest {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}

interface AlphaWti {
  name?: string;
  interval?: string;
  unit?: string;
  data?: { date: string; value: string }[];
}

interface YahooChart {
  chart?: {
    result?: {
      meta?: { regularMarketPrice?: number; previousClose?: number; currency?: string };
    }[];
  };
}

const FX_TARGETS = ["VND", "EUR", "CNY", "JPY", "SGD", "GBP"] as const;

export async function fetchFrankfurterFx(
  prevRates: Record<string, number>
): Promise<{ quotes: FxQuote[]; rates: Record<string, number>; source: string }> {
  const data = await fetchJson<FrankfurterLatest>(
    "https://api.frankfurter.app/latest?from=USD&to=VND,EUR,CNY,JPY,SGD,GBP"
  );
  const rates: Record<string, number> = { USD: 1 };
  for (const [k, v] of Object.entries(data.rates)) rates[k] = v;

  const quotes: FxQuote[] = FX_TARGETS.map((quote) => {
    const rate = rates[quote] ?? 0;
    const pair = `USD/${quote}`;
    return {
      pair,
      base: "USD",
      quote,
      rate,
      changePct: calcChangePct(rate, prevRates[quote]),
      source: "Frankfurter",
    };
  });

  return { quotes, rates, source: "Frankfurter ECB" };
}

export async function fetchErApiFx(
  prevRates: Record<string, number>
): Promise<{ quotes: FxQuote[]; rates: Record<string, number>; source: string }> {
  const data = await fetchJson<ErApiLatest>("https://open.er-api.com/v6/latest/USD");
  if (data.result !== "success") throw new Error("ER-API failed");

  const rates: Record<string, number> = { USD: 1 };
  for (const [k, v] of Object.entries(data.rates)) rates[k] = v;

  const quotes: FxQuote[] = FX_TARGETS.map((quote) => ({
    pair: `USD/${quote}`,
    base: "USD",
    quote,
    rate: rates[quote] ?? 0,
    changePct: calcChangePct(rates[quote] ?? 0, prevRates[quote]),
    source: "Open ER-API",
  }));

  return { quotes, rates, source: "Open ER-API" };
}

export async function fetchEurUsdCross(
  prevRates: Record<string, number>
): Promise<FxQuote | null> {
  try {
    const data = await fetchJson<FrankfurterLatest>(
      "https://api.frankfurter.app/latest?from=EUR&to=USD"
    );
    const rate = data.rates.USD ?? 0;
    if (!rate) return null;
    return {
      pair: "EUR/USD",
      base: "EUR",
      quote: "USD",
      rate,
      changePct: calcChangePct(rate, prevRates.EUR_USD),
      source: "Frankfurter",
    };
  } catch {
    return null;
  }
}

export async function fetchWtiOil(prevPrice?: number): Promise<CommodityQuote | null> {
  try {
    const data = await fetchJson<AlphaWti>(
      "https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=demo"
    );
    const rows = data.data ?? [];
    if (rows.length < 2) throw new Error("No WTI data");
    const latest = parseFloat(rows[0].value);
    const prev = parseFloat(rows[1].value);
    if (!Number.isFinite(latest)) throw new Error("Invalid WTI");
    const changePct = prev ? calcChangePct(latest, prev) : calcChangePct(latest, prevPrice);
    return {
      symbol: "WTI",
      name: "WTI Crude Oil",
      price: latest,
      changePct,
      unit: "USD/bbl",
      source: "Alpha Vantage",
    };
  } catch {
    /* fallback Yahoo */
  }

  try {
    const data = await fetchJson<YahooChart>(
      "https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=5d"
    );
    const meta = data.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice ?? 0;
    const prevClose = meta?.previousClose ?? 0;
    if (!price) throw new Error("No CL=F price");
    return {
      symbol: "WTI",
      name: "WTI Crude Oil",
      price,
      changePct: calcChangePct(price, prevClose || prevPrice),
      unit: "USD/bbl",
      source: "Yahoo Finance",
    };
  } catch {
    return null;
  }
}

export async function fetchBrentOil(prevPrice?: number): Promise<CommodityQuote | null> {
  try {
    const data = await fetchJson<AlphaWti>(
      "https://www.alphavantage.co/query?function=BRENT&interval=daily&apikey=demo"
    );
    const rows = data.data ?? [];
    if (rows.length < 2) throw new Error("No Brent data");
    const latest = parseFloat(rows[0].value);
    const prev = parseFloat(rows[1].value);
    if (!Number.isFinite(latest)) throw new Error("Invalid Brent");
    return {
      symbol: "BRENT",
      name: "Brent Crude Oil",
      price: latest,
      changePct: prev ? calcChangePct(latest, prev) : calcChangePct(latest, prevPrice),
      unit: "USD/bbl",
      source: "Alpha Vantage",
    };
  } catch {
    return null;
  }
}

export async function fetchAllLiveMarket(prevRates: Record<string, number>, prevCommodities: Record<string, number>) {
  const sources: string[] = [];
  const errors: string[] = [];
  let fx: FxQuote[] = [];
  let rates: Record<string, number> = { USD: 1 };
  let commodities: CommodityQuote[] = [];

  try {
    const ff = await fetchFrankfurterFx(prevRates);
    fx = ff.quotes;
    rates = ff.rates;
    sources.push(ff.source);
  } catch (e1) {
    errors.push(`Frankfurter: ${e1 instanceof Error ? e1.message : "lỗi"}`);
    try {
      const er = await fetchErApiFx(prevRates);
      fx = er.quotes;
      rates = er.rates;
      sources.push(er.source);
    } catch (e2) {
      errors.push(`ER-API: ${e2 instanceof Error ? e2.message : "lỗi"}`);
    }
  }

  const eurUsd = await fetchEurUsdCross(prevRates);
  if (eurUsd) {
    fx.push(eurUsd);
    rates.EUR_USD = eurUsd.rate;
    if (!sources.includes("Frankfurter ECB")) sources.push("Frankfurter");
  }

  const [wti, brent] = await Promise.all([
    fetchWtiOil(prevCommodities.WTI),
    fetchBrentOil(prevCommodities.BRENT),
  ]);
  if (wti) {
    commodities.push(wti);
    rates.WTI = wti.price;
    sources.push(wti.source);
  } else {
    errors.push("WTI: không lấy được giá dầu");
  }
  if (brent) {
    commodities.push(brent);
    rates.BRENT = brent.price;
    if (!sources.includes(brent.source)) sources.push(brent.source);
  }

  return { fx, rates, commodities, sources, errors };
}