import type { BriefingDepth, MarketBriefingResult } from "./briefing-types";

const SECTION_ALIASES: Record<string, string[]> = {
  headline: ["HEADLINE", "TIÊU ĐỀ", "TIEU DE"],
  summary: ["EXECUTIVE SUMMARY", "TÓM TẮT", "TOM TAT", "TỔNG QUAN"],
  risk: ["RISK SCORE", "ĐIỂM RỦI RO", "RISK"],
  sentiment: ["SENTIMENT", "TÂM LÝ THỊ TRƯỜNG", "XU HƯỚNG"],
  fx: ["FX ANALYSIS", "PHÂN TÍCH FX", "TỶ GIÁ", "TY GIA"],
  commodity: ["COMMODITY", "DẦU", "NHIÊN LIỆU", "COMMODITIES"],
  scm: ["SCM IMPACTS", "TÁC ĐỘNG SCM", "TAC DONG SCM", "SUPPLY CHAIN"],
  scenarios: ["SCENARIOS", "KỊCH BẢN", "KICH BAN"],
  actions: ["ACTION ITEMS", "HÀNH ĐỘNG", "HANH DONG", "KHUYẾN NGHỊ"],
  watchlist: ["WATCHLIST", "THEO DÕI"],
  risks: ["KEY RISKS", "RỦI RO", "RUI RO"],
};

function extractSection(md: string, keys: string[]): string {
  for (const key of keys) {
    const re = new RegExp(
      `##\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
      "i"
    );
    const m = md.match(re);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return "";
}

function parseBullets(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s+/, "").replace(/^\d+\.\s+/, "").trim())
    .filter(Boolean);
}

function parseRiskScore(text: string): number {
  const m = text.match(/(\d{1,3})\s*\/\s*100/) ?? text.match(/risk[:\s]*(\d{1,3})/i);
  if (m) return Math.min(100, Math.max(0, parseInt(m[1], 10)));
  const m2 = text.match(/(\d{1,3})/);
  return m2 ? Math.min(100, parseInt(m2[1], 10)) : 50;
}

function parseSentiment(text: string): MarketBriefingResult["marketPulse"]["sentiment"] {
  const t = text.toLowerCase();
  if (/bearish|tiêu cực|giam|tăng áp lực|áp lực tăng/i.test(t)) return "bearish";
  if (/bullish|tích cực|thuận lợi|giảm áp lực/i.test(t)) return "bullish";
  return "neutral";
}

function parseActionItems(text: string): MarketBriefingResult["actionItems"] {
  const lines = parseBullets(text);
  return lines.map((line) => {
    const pMatch = line.match(/^(P[123])/i);
    const priority = (pMatch?.[1]?.toUpperCase() ?? "P2") as "P1" | "P2" | "P3";
    const roleMatch = line.match(/\[(Procurement|Logistics|Planning|Finance|SCM)\]/i);
    const role = roleMatch?.[1] ?? "SCM";
    const horizonMatch = line.match(/\(([^)]+)\)\s*$/);
    const action = line
      .replace(/^(P[123])\s*[:|-]?\s*/i, "")
      .replace(/\[[^\]]+\]/g, "")
      .replace(/\([^)]+\)\s*$/, "")
      .trim();
    return {
      priority,
      role,
      action: action || line,
      horizon: horizonMatch?.[1] ?? "1 tuần",
    };
  });
}

function parseScenarios(text: string): MarketBriefingResult["scenarios"] {
  const blocks = text.split(/\n(?=###|\*\*[A-Z])/).filter(Boolean);
  if (blocks.length <= 1) {
    return parseBullets(text).map((b) => ({
      name: b.split(":")[0]?.trim() || "Scenario",
      probability: "—",
      narrative: b,
      triggers: [],
    }));
  }
  return blocks.map((block) => {
    const name = block.match(/^###\s*(.+)/m)?.[1] ?? block.match(/\*\*(.+?)\*\*/)?.[1] ?? "Kịch bản";
    const prob = block.match(/(\d{1,3}%)/)?.[1] ?? "—";
    const triggers = parseBullets(block.match(/trigger[s]?:?([\s\S]*)/i)?.[1] ?? "");
    return {
      name: name.trim(),
      probability: prob,
      narrative: block.replace(/^###[^\n]*\n/, "").split(/trigger/i)[0].trim(),
      triggers,
    };
  });
}

function parseScmImpacts(text: string): MarketBriefingResult["scmImpacts"] {
  return parseBullets(text).map((line) => {
    const sevMatch = line.match(/\[(low|medium|high|critical)\]/i);
    const severity = (sevMatch?.[1]?.toLowerCase() ?? "medium") as
      | "low"
      | "medium"
      | "high"
      | "critical";
    const parts = line.split(/[:–-]/);
    return {
      area: parts[0]?.replace(/\[[^\]]+\]/g, "").trim() || line.slice(0, 40),
      severity,
      impact: parts.slice(1).join(" ").trim() || line,
      kpiLink: "OTD, Freight Cost, Inventory",
    };
  });
}

export function parseBriefingMarkdown(
  markdown: string,
  model: string,
  depth: BriefingDepth
): MarketBriefingResult {
  const headline = extractSection(markdown, SECTION_ALIASES.headline) || markdown.split("\n")[0]?.replace(/^#+\s*/, "") || "Market Briefing";
  const summary = extractSection(markdown, SECTION_ALIASES.summary) || extractSection(markdown, ["OVERVIEW"]) || markdown.slice(0, 500);
  const riskBlock = extractSection(markdown, SECTION_ALIASES.risk);
  const sentimentBlock = extractSection(markdown, SECTION_ALIASES.sentiment);
  const fxBlock = extractSection(markdown, SECTION_ALIASES.fx);
  const commBlock = extractSection(markdown, SECTION_ALIASES.commodity);
  const scmBlock = extractSection(markdown, SECTION_ALIASES.scm);
  const scenBlock = extractSection(markdown, SECTION_ALIASES.scenarios);
  const actBlock = extractSection(markdown, SECTION_ALIASES.actions);
  const watchBlock = extractSection(markdown, SECTION_ALIASES.watchlist);
  const risksBlock = extractSection(markdown, SECTION_ALIASES.risks);

  const riskScore = parseRiskScore(riskBlock || markdown);
  const sentiment = parseSentiment(sentimentBlock + " " + summary);

  const fxBullets = parseBullets(fxBlock);
  const pairs = fxBullets.map((b) => {
    const pair = b.match(/([A-Z]{3}\/[A-Z]{3})/)?.[1] ?? b.split(":")[0]?.trim() ?? "FX";
    const rate = b.match(/[\d,.]+/)?.[0] ?? "—";
    const change = b.match(/[+-]?\d+\.?\d*%/)?.[0] ?? "—";
    return {
      pair,
      rate,
      change,
      outlook: b,
      scmImpact: "Xem chi tiết trong báo cáo",
    };
  });

  const commBullets = parseBullets(commBlock);
  const commItems = commBullets.map((b) => ({
    name: b.split(":")[0]?.trim() || "Commodity",
    price: b.match(/\$[\d,.]+/)?.[0] ?? "—",
    change: b.match(/[+-]?\d+\.?\d*%/)?.[0] ?? "—",
    freightImpact: b,
  }));

  const scmImpacts = parseScmImpacts(scmBlock);
  const scenarios = parseScenarios(scenBlock);
  const actionItems = parseActionItems(actBlock);
  const watchlist = parseBullets(watchBlock);
  const keyRisks = parseBullets(risksBlock);

  return {
    generatedAt: Date.now(),
    model,
    source: "gemini",
    depth,
    confidence: "high",
    marketPulse: {
      sentiment,
      riskScore,
      headline: headline.replace(/^#+\s*/, "").slice(0, 200),
      summary,
    },
    fxAnalysis: {
      overview: fxBlock || "Phân tích FX trong báo cáo đầy đủ.",
      pairs: pairs.length ? pairs : [{ pair: "—", rate: "—", change: "—", outlook: fxBlock || "—", scmImpact: "—" }],
    },
    commodityAnalysis: {
      overview: commBlock || "Phân tích commodity trong báo cáo.",
      items: commItems.length ? commItems : [],
    },
    scmImpacts: scmImpacts.length
      ? scmImpacts
      : [{ area: "Supply Chain", severity: "medium", impact: scmBlock || summary.slice(0, 200), kpiLink: "OTD, Cost" }],
    scenarios: scenarios.length
      ? scenarios
      : [{ name: "Base case", probability: "50%", narrative: scenBlock || summary.slice(0, 150), triggers: [] }],
    actionItems: actionItems.length
      ? actionItems
      : [{ priority: "P1", role: "SCM", action: "Review open PO và freight benchmark", horizon: "48h" }],
    watchlist: watchlist.length ? watchlist : ["USD/VND", "WTI crude", "Freight cost"],
    keyRisks: keyRisks.length ? keyRisks : ["Biến động tỷ giá", "Chi phí nhiên liệu vận tải"],
    fullReport: markdown,
  };
}