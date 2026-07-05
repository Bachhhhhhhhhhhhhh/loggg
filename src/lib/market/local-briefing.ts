import type { MarketSnapshot } from "./types";
import type { BriefingDepth, MarketBriefingResult } from "./briefing-types";

function sentimentFromSnapshot(s: MarketSnapshot): "bullish" | "neutral" | "bearish" {
  const usdVnd = s.fx.find((q) => q.quote === "VND");
  const wti = s.commodities.find((c) => c.symbol === "WTI");
  let score = 0;
  if (usdVnd && usdVnd.changePct > 0.3) score -= 1;
  if (usdVnd && usdVnd.changePct < -0.3) score += 1;
  if (wti && wti.changePct > 1.5) score -= 1;
  if (wti && wti.changePct < -1) score += 1;
  if (score > 0) return "bullish";
  if (score < 0) return "bearish";
  return "neutral";
}

function riskScore(s: MarketSnapshot): number {
  let risk = 35;
  const usdVnd = s.fx.find((q) => q.quote === "VND");
  const wti = s.commodities.find((c) => c.symbol === "WTI");
  if (usdVnd) risk += Math.min(25, Math.abs(usdVnd.changePct) * 8);
  if (wti) risk += Math.min(25, Math.abs(wti.changePct) * 5);
  const warnings = s.marketWatch.filter((m) => m.status === "warning").length;
  const critical = s.marketWatch.filter((m) => m.status === "critical").length;
  risk += warnings * 4 + critical * 10;
  return Math.min(95, Math.round(risk));
}

export function generateLocalBriefing(
  snapshot: MarketSnapshot,
  depth: BriefingDepth = "standard"
): MarketBriefingResult {
  const usdVnd = snapshot.fx.find((q) => q.quote === "VND");
  const eurUsd = snapshot.fx.find((q) => q.pair === "EUR/USD");
  const cny = snapshot.fx.find((q) => q.quote === "CNY");
  const sentiment = sentimentFromSnapshot(snapshot);
  const risk = riskScore(snapshot);

  const fxPairs = snapshot.fx.map((q) => ({
    pair: q.pair,
    rate: q.rate.toLocaleString("vi-VN", { maximumFractionDigits: q.quote === "VND" ? 0 : 4 }),
    change: `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%`,
    outlook:
      q.changePct > 0.5
        ? "Áp lực tăng chi phí nhập khẩu"
        : q.changePct < -0.5
          ? "Hỗ trợ giảm landed cost"
          : "Ổn định ngắn hạn",
    scmImpact:
      q.quote === "VND"
        ? "Ảnh hưởng trực tiếp COGS hàng nhập USD"
        : q.quote === "CNY"
          ? "Tác động nguồn cung Trung Quốc"
          : "Tác động gián tiếp qua cross-rate",
  }));

  const commodityItems = snapshot.commodities.map((c) => ({
    name: c.name,
    price: `${c.price.toFixed(2)} ${c.unit}`,
    change: `${c.changePct >= 0 ? "+" : ""}${c.changePct.toFixed(2)}%`,
    freightImpact:
      c.changePct > 2
        ? "Bunker surcharge có thể tăng 3-7% tuần tới"
        : c.changePct < -1
          ? "Cơ hội negotiate freight rate"
          : "Freight ổn định",
  }));

  const scmImpacts = [
    {
      area: "Chi phí vận tải quốc tế",
      severity: (snapshot.commodities.some((c) => c.changePct > 2) ? "high" : "medium") as
        | "low"
        | "medium"
        | "high"
        | "critical",
      impact: "Biến động dầu và FX kéo freight all-in cost",
      kpiLink: "Freight Cost / Unit, Logistics Cost Ratio",
    },
    {
      area: "Nhập khẩu & landed cost",
      severity: (usdVnd && usdVnd.changePct > 0.4 ? "high" : "medium") as
        | "low"
        | "medium"
        | "high"
        | "critical",
      impact: usdVnd
        ? `USD/VND ${usdVnd.changePct >= 0 ? "tăng" : "giảm"} ${Math.abs(usdVnd.changePct).toFixed(2)}% — điều chỉnh buffer tỷ giá`
        : "Theo dõi tỷ giá khi có dữ liệu live",
      kpiLink: "Days of Supply, Order Fill Rate",
    },
    {
      area: "Tồn kho & safety stock",
      severity: "medium" as const,
      impact: "Cân nhắc tăng safety stock SKU nhập USD nếu FX biến động mạnh",
      kpiLink: "Inventory Turnover, Stockout Rate",
    },
  ];

  const headline =
    sentiment === "bearish"
      ? "Áp lực chi phí SCM tăng — cần hedge FX và review freight"
      : sentiment === "bullish"
        ? "Điều kiện logistics thuận lợi hơn — tối ưu đặt hàng & negotiate"
        : "Thị trường đi ngang — tập trung tối ưu OTIF và chi phí";

  const fullReport = [
    `## Executive Summary`,
    headline,
    ``,
    `**Risk Score:** ${risk}/100 · **Sentiment:** ${sentiment}`,
    ``,
    `## FX`,
    usdVnd
      ? `- USD/VND: ${usdVnd.rate.toLocaleString("vi-VN")} (${usdVnd.changePct >= 0 ? "+" : ""}${usdVnd.changePct.toFixed(2)}%)`
      : "- Chưa có FX live",
    eurUsd ? `- EUR/USD: ${eurUsd.rate.toFixed(4)}` : "",
    cny ? `- USD/CNY: ${cny.rate.toFixed(4)}` : "",
    ``,
    `## Hành động đề xuất`,
    `- P1: Rà soát PO nhập USD trong 14 ngày tới`,
    `- P2: Cập nhật freight benchmark với carrier`,
    `- P3: Chạy scenario inventory nếu FX > ±0.5%`,
  ]
    .filter(Boolean)
    .join("\n");

  const scenarios =
    depth === "quick"
      ? [
          {
            name: "Base case",
            probability: "55%",
            narrative: "FX và dầu biến động vừa phải, chi phí SCM +2-4%",
            triggers: ["USD/VND ±0.3%", "WTI ±2%"],
          },
        ]
      : [
          {
            name: "Bull — chi phí giảm",
            probability: "25%",
            narrative: "VND ổn định/mạnh, dầu giảm → freight và landed cost cải thiện",
            triggers: ["USD/VND giảm >0.5%", "WTI giảm >3%"],
          },
          {
            name: "Base — sideways",
            probability: "50%",
            narrative: "Biến động nhỏ, tập trung OTIF và inventory right-sizing",
            triggers: ["FX trong band ±0.3%"],
          },
          {
            name: "Bear — cost spike",
            probability: "25%",
            narrative: "VND yếu + dầu tăng → cần hedge và tăng safety stock có chọn lọc",
            triggers: ["USD/VND tăng >0.8%", "WTI tăng >4%"],
          },
        ];

  return {
    generatedAt: Date.now(),
    model: "LogIQ Local Engine",
    source: "local",
    depth,
    confidence: snapshot.isLive ? "medium" : "low",
    marketPulse: {
      sentiment,
      riskScore: risk,
      headline,
      summary: `Phân tích rule-based từ ${snapshot.isLive ? "dữ liệu live" : "baseline demo"}. ${snapshot.sources.length} nguồn dữ liệu.`,
    },
    fxAnalysis: {
      overview: usdVnd
        ? `USD/VND là driver chính cho landed cost VN. Biến động ${usdVnd.changePct.toFixed(2)}% ảnh hưởng trực tiếp PO nhập khẩu.`
        : "Chưa có tỷ giá live — dùng KPI nội bộ làm proxy.",
      pairs: fxPairs.length ? fxPairs : [{ pair: "N/A", rate: "-", change: "-", outlook: "-", scmImpact: "Chờ sync FX" }],
    },
    commodityAnalysis: {
      overview:
        commodityItems.length > 0
          ? "Giá dầu là proxy bunker surcharge và ocean freight all-in."
          : "Chưa có commodity live.",
      items: commodityItems.length
        ? commodityItems
        : [{ name: "WTI (proxy)", price: "N/A", change: "-", freightImpact: "Chờ sync" }],
    },
    scmImpacts,
    scenarios,
    actionItems: [
      { priority: "P1", role: "Procurement", action: "Review open PO USD/CNY, cập nhật landed cost", horizon: "48h" },
      { priority: "P1", role: "Logistics", action: "Benchmark freight rate vs biến động dầu", horizon: "1 tuần" },
      { priority: "P2", role: "Planning", action: "Stress-test safety stock 2 tuần", horizon: "2 tuần" },
      ...(depth === "deep"
        ? [{ priority: "P2" as const, role: "Finance", action: "Đánh giá hedge FX forward", horizon: "1 tháng" }]
        : []),
    ],
    watchlist: [
      usdVnd ? `USD/VND ngưỡng ${(usdVnd.rate * 1.005).toFixed(0)}` : "USD/VND",
      "WTI > $80/bbl",
      "Freight Cost / Unit vs target",
      "Supplier OTIF < 92%",
    ],
    keyRisks: [
      usdVnd && usdVnd.changePct > 0.5 ? "Rủi ro tỷ giá — landed cost tăng nhanh" : "Biến động tỷ giá",
      snapshot.commodities.some((c) => c.changePct > 2) ? "Bunker surcharge tăng" : "Chi phí nhiên liệu vận tải",
      "Lead time supplier Trung Quốc",
    ],
    fullReport,
  };
}