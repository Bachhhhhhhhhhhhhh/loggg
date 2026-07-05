export type BriefingDepth = "quick" | "standard" | "deep";
export type BriefingSource = "gemini" | "local";

export interface MarketBriefingResult {
  generatedAt: number;
  model: string;
  source: BriefingSource;
  depth: BriefingDepth;
  confidence: "high" | "medium" | "low";
  marketPulse: {
    sentiment: "bullish" | "neutral" | "bearish";
    riskScore: number;
    headline: string;
    summary: string;
  };
  fxAnalysis: {
    overview: string;
    pairs: { pair: string; rate: string; change: string; outlook: string; scmImpact: string }[];
  };
  commodityAnalysis: {
    overview: string;
    items: { name: string; price: string; change: string; freightImpact: string }[];
  };
  scmImpacts: {
    area: string;
    severity: "low" | "medium" | "high" | "critical";
    impact: string;
    kpiLink: string;
  }[];
  scenarios: {
    name: string;
    probability: string;
    narrative: string;
    triggers: string[];
  }[];
  actionItems: {
    priority: "P1" | "P2" | "P3";
    role: string;
    action: string;
    horizon: string;
  }[];
  watchlist: string[];
  keyRisks: string[];
  fullReport: string;
}

export interface BriefingGenerateOptions {
  depth?: BriefingDepth;
  onStream?: (partial: string) => void;
}