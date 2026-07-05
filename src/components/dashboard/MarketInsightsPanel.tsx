"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
  Key,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Target,
  ListChecks,
  BarChart3,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarketData } from "@/context/MarketDataContext";
import { getEffectiveGeminiKey, isGeminiConfigured } from "@/lib/gemini/config";
import { generateMarketBriefing } from "@/lib/gemini/market-briefing";
import type { BriefingDepth, MarketBriefingResult } from "@/lib/market/briefing-types";
import { renderMarkdownLite } from "@/components/notebook/markdown-lite";
import { cn } from "@/lib/utils";

const BRIEFING_CACHE_KEY = "logiq-market-briefing-v2";
const BRIEFING_TTL_MS = 20 * 60 * 1000;

type TabId = "overview" | "fx" | "scm" | "scenarios" | "actions" | "report";

const TABS: { id: TabId; label: string; icon: typeof Sparkles }[] = [
  { id: "overview", label: "Tổng quan", icon: BarChart3 },
  { id: "fx", label: "FX & Dầu", icon: TrendingUp },
  { id: "scm", label: "Tác động SCM", icon: Shield },
  { id: "scenarios", label: "Kịch bản", icon: Target },
  { id: "actions", label: "Hành động", icon: ListChecks },
  { id: "report", label: "Báo cáo đầy đủ", icon: Sparkles },
];

const DEPTH_OPTIONS: { id: BriefingDepth; label: string }[] = [
  { id: "quick", label: "Nhanh" },
  { id: "standard", label: "Chuẩn" },
  { id: "deep", label: "Chuyên sâu" },
];

interface CachedBriefingV2 {
  briefing: MarketBriefingResult;
  marketAt: number;
  fetchedAt: number;
}

function loadCached(marketAt: number): MarketBriefingResult | null {
  try {
    const raw = localStorage.getItem(BRIEFING_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedBriefingV2;
    if (Date.now() - parsed.fetchedAt > BRIEFING_TTL_MS) return null;
    if (parsed.marketAt !== marketAt) return null;
    return parsed.briefing;
  } catch {
    return null;
  }
}

function saveCached(briefing: MarketBriefingResult, marketAt: number): void {
  try {
    const data: CachedBriefingV2 = {
      briefing,
      marketAt,
      fetchedAt: Date.now(),
    };
    localStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function SentimentIcon({ sentiment }: { sentiment: MarketBriefingResult["marketPulse"]["sentiment"] }) {
  if (sentiment === "bullish") return <TrendingUp className="h-4 w-4 text-emerald-400" />;
  if (sentiment === "bearish") return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-amber-400" />;
}

function severityColor(s: string): string {
  if (s === "critical") return "text-red-400 border-red-500/30 bg-red-500/10";
  if (s === "high") return "text-orange-400 border-orange-500/30 bg-orange-500/10";
  if (s === "medium") return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
}

function priorityColor(p: string): string {
  if (p === "P1") return "text-red-400 bg-red-500/15 border-red-500/25";
  if (p === "P2") return "text-amber-400 bg-amber-500/15 border-amber-500/25";
  return "text-blue-400 bg-blue-500/15 border-blue-500/25";
}

function RiskMeter({ score }: { score: number }) {
  const color =
    score >= 70 ? "from-red-500 to-orange-500" : score >= 45 ? "from-amber-500 to-yellow-500" : "from-emerald-500 to-teal-500";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-slate-500 uppercase tracking-wider">Risk Score</span>
        <span className="font-mono font-bold text-slate-300">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function MarketInsightsPanel() {
  const { snapshot, loading: marketLoading, lastUpdatedLabel } = useMarketData();
  const [briefing, setBriefing] = useState<MarketBriefingResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [depth, setDepth] = useState<BriefingDepth>("standard");
  const [streamPreview, setStreamPreview] = useState<string | null>(null);

  const geminiReady = isGeminiConfigured();

  const generate = useCallback(
    async (force = false) => {
      if (!force && snapshot.fetchedAt > 0) {
        const cached = loadCached(snapshot.fetchedAt);
        if (cached) {
          setBriefing(cached);
          setError(null);
          return;
        }
      }

      setGenerating(true);
      setError(null);
      setStreamPreview(null);

      try {
        const key = getEffectiveGeminiKey();
        const result = await generateMarketBriefing(key, snapshot, {
          depth,
          onStream: (partial) => setStreamPreview(partial.slice(0, 120) + "…"),
        });
        setBriefing(result);
        saveCached(result, snapshot.fetchedAt);

        if (result.source === "local" && result.marketPulse.summary.includes("Gemini fallback")) {
          setError("Gemini lỗi — đang hiển thị bản phân tích cục bộ (vẫn dùng được)");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tạo briefing");
      } finally {
        setGenerating(false);
        setStreamPreview(null);
      }
    },
    [snapshot, depth]
  );

  useEffect(() => {
    if (snapshot.fetchedAt > 0 && !briefing && !generating) {
      const cached = loadCached(snapshot.fetchedAt);
      if (cached) setBriefing(cached);
    }
  }, [snapshot.fetchedAt, briefing, generating]);

  return (
    <Card className="glow-teal overflow-hidden">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="normal-case flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-teal-400" />
          Gemini Market Intelligence
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {geminiReady ? (
            <Badge variant="success" className="text-[9px] gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-live" />
              Gemini
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[9px] gap-1">
              <Key className="h-2.5 w-2.5" />
              Cần API key
            </Badge>
          )}
          <Badge variant={snapshot.isLive ? "teal" : "secondary"} className="text-[9px]">
            {snapshot.isLive ? `LIVE · ${lastUpdatedLabel}` : "DEMO + LIVE mix"}
          </Badge>
          {briefing && (
            <Badge variant="secondary" className="text-[9px] font-mono">
              {briefing.source === "gemini" ? briefing.model : "Local Engine"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Phân tích SCM đa tầng: FX, commodity, KPI logistics, kịch bản Bull/Base/Bear, action items P1-P3 — powered by Gemini + real-time feed.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {DEPTH_OPTIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDepth(d.id)}
              className={cn(
                "pro-filter-pill",
                depth === d.id && "pro-filter-pill-active"
              )}
            >
              {d.label}
            </button>
          ))}
          <Button
            size="sm"
            onClick={() => generate(briefing !== null)}
            disabled={marketLoading || generating}
            className="text-xs ml-auto"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 mr-1.5" />
            )}
            {briefing ? "Phân tích lại" : "Tạo briefing SCM"}
          </Button>
        </div>

        {generating && (
          <div className="pro-surface rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
              Gemini đang phân tích {depth === "deep" ? "chuyên sâu" : depth === "quick" ? "nhanh" : "chuẩn"}…
            </div>
            {streamPreview && (
              <p className="text-[10px] text-slate-600 font-mono truncate">{streamPreview}</p>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {error}
          </p>
        )}

        {briefing && !generating && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1 border-b border-slate-800/60 pb-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors",
                      tab === t.id
                        ? "bg-teal-500/15 text-teal-300 border border-teal-500/25"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {tab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 pro-surface rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <SentimentIcon sentiment={briefing.marketPulse.sentiment} />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">
                        {briefing.marketPulse.headline}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {briefing.marketPulse.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-[9px] capitalize">
                      {briefing.marketPulse.sentiment}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      Confidence: {briefing.confidence}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      Depth: {briefing.depth}
                    </Badge>
                  </div>
                </div>
                <div className="pro-surface rounded-xl p-4 space-y-4">
                  <RiskMeter score={briefing.marketPulse.riskScore} />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Key Risks</p>
                    <ul className="space-y-1.5">
                      {briefing.keyRisks.slice(0, 4).map((r, i) => (
                        <li key={i} className="text-[11px] text-slate-400 flex gap-2">
                          <span className="text-red-400 shrink-0">!</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {tab === "fx" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">{briefing.fxAnalysis.overview}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {briefing.fxAnalysis.pairs.map((p) => (
                    <div key={p.pair} className="pro-surface rounded-xl p-3.5">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="font-mono font-bold text-blue-400">{p.pair}</span>
                        <span className="text-xs font-mono text-slate-300">{p.rate}</span>
                      </div>
                      <Badge variant="secondary" className="text-[9px] mb-2">{p.change}</Badge>
                      <p className="text-[11px] text-slate-400">{p.outlook}</p>
                      <p className="text-[10px] text-teal-400/80 mt-1.5">{p.scmImpact}</p>
                    </div>
                  ))}
                </div>
                {briefing.commodityAnalysis.items.length > 0 && (
                  <>
                    <p className="text-xs text-slate-500 pt-2">{briefing.commodityAnalysis.overview}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {briefing.commodityAnalysis.items.map((c) => (
                        <div key={c.name} className="pro-surface rounded-xl p-3.5 border-amber-500/10">
                          <p className="font-semibold text-amber-400 text-sm">{c.name}</p>
                          <p className="font-mono text-slate-200 mt-1">{c.price} <span className="text-xs text-slate-500">{c.change}</span></p>
                          <p className="text-[10px] text-slate-400 mt-2">{c.freightImpact}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "scm" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {briefing.scmImpacts.map((s, i) => (
                  <div key={i} className={cn("pro-surface rounded-xl p-4 border", severityColor(s.severity))}>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-slate-100">{s.area}</h4>
                      <Badge variant="secondary" className="text-[9px] uppercase">{s.severity}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{s.impact}</p>
                    <p className="text-[10px] text-slate-600 font-mono mt-2">KPI: {s.kpiLink}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "scenarios" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {briefing.scenarios.map((s, i) => (
                  <div key={i} className="pro-surface rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-slate-100">{s.name}</h4>
                      <Badge variant="teal" className="text-[9px] font-mono">{s.probability}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{s.narrative}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {s.triggers.map((t, j) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "actions" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {briefing.actionItems.map((a, i) => (
                    <div key={i} className="pro-surface rounded-xl p-3.5 flex gap-3 items-start">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border shrink-0", priorityColor(a.priority))}>
                        {a.priority}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-200">{a.action}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {a.role} · {a.horizon}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Watchlist</p>
                  <div className="flex flex-wrap gap-2">
                    {briefing.watchlist.map((w, i) => (
                      <Badge key={i} variant="secondary" className="text-[9px] font-mono">
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "report" && (
              <div className="pro-surface rounded-xl p-4 text-sm text-slate-300 leading-relaxed max-h-[480px] overflow-y-auto">
                {renderMarkdownLite(briefing.fullReport || briefing.marketPulse.summary)}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-[10px] text-slate-600 font-mono">
                {new Date(briefing.generatedAt).toLocaleString("vi-VN")} · {briefing.model}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generate(true)}
                className="text-[10px] h-7"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Làm mới
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}