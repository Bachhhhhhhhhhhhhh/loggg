import type { MarketSnapshot } from "./types";

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function buildDetailedMarketContext(snapshot: MarketSnapshot): string {
  const ts = new Date(snapshot.fetchedAt).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const sections: string[] = [
    "=== LOGIQ MARKET INTELLIGENCE FEED ===",
    `Timestamp (VN): ${ts}`,
    `Data mode: ${snapshot.isLive ? "LIVE" : "DEMO/FALLBACK"}`,
    `Live sources (${snapshot.liveSourceCount}): ${snapshot.sources.join(", ") || "none"}`,
  ];

  if (snapshot.errors.length) {
    sections.push(`Fetch warnings: ${snapshot.errors.join("; ")}`);
  }

  sections.push("\n--- FX RATES ---");
  if (snapshot.fx.length) {
    for (const q of snapshot.fx) {
      sections.push(
        `${q.pair}: rate=${q.rate}, change=${fmtPct(q.changePct)}, source=${q.source}`
      );
    }
  } else {
    sections.push("No live FX — use KPI baseline");
  }

  sections.push("\n--- COMMODITIES ---");
  if (snapshot.commodities.length) {
    for (const c of snapshot.commodities) {
      sections.push(
        `${c.symbol} ${c.name}: ${c.price} ${c.unit}, change=${fmtPct(c.changePct)}, source=${c.source}`
      );
    }
  } else {
    sections.push("No live commodity data");
  }

  sections.push("\n--- SCM KPIs ---");
  for (const k of snapshot.kpis) {
    sections.push(
      `${k.id}|${k.label}: value=${k.value}${k.unit ?? ""}, change=${fmtPct(k.change)}, trend=${k.trend}, desc=${k.description}`
    );
  }

  sections.push("\n--- MARKET WATCH TABLE ---");
  for (const m of snapshot.marketWatch) {
    const chg = m.previous ? ((m.current - m.previous) / m.previous) * 100 : 0;
    sections.push(
      `${m.category}|${m.metric}: current=${m.current} ${m.unit}, prev=${m.previous}, target=${m.target}, change=${fmtPct(chg)}, status=${m.status}`
    );
  }

  sections.push("\n--- TICKER ---");
  for (const t of snapshot.ticker.slice(0, 12)) {
    sections.push(`${t.symbol} ${t.name}: ${t.value}${t.unit ?? ""} ${fmtPct(t.change)}`);
  }

  sections.push("\n--- VIETNAM SCM CONTEXT ---");
  sections.push(
    "VN logistics: USD/VND ảnh hưởng landed cost nhập khẩu; CNY ảnh hưởng hàng Trung Quốc; dầu WTI/Brent ảnh hưởng bunker surcharge & freight; EUR/USD ảnh hưởng EU sourcing."
  );

  return sections.join("\n");
}