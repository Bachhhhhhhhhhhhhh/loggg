"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
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
import {
  getEffectiveGeminiKey,
  hasGeminiApiKey,
  isMarketBriefingReady,
  maskGeminiKey,
} from "@/lib/gemini/config";
import { testGeminiApi } from "@/lib/notebook/ai";
import { generateMarketBriefing } from "@/lib/gemini/market-briefing";
import type { BriefingDepth, MarketBriefingResult } from "@/lib/market/briefing-types";
import { renderMarkdownLite } from "@/components/notebook/markdown-lite";
import { cn } from "@/lib/utils";

const BRIEFING_CACHE_KEY = "logiq-market-briefing-v3";
const BRIEFING_TTL_MS = 20 * 60 * 1000;

type TabId = "overview" | "fx" | "scm" | "scenarios" | "actions" | "report";

const TABS: { id: TabId; label: string; icon: typeof Sparkles }[] = [
  { id: "overview", label: "Tổng quan", icon: BarChart3 },
  { id: "fx", label: "FX & Dầu", icon: TrendingUp },
  { id: "scm", label: "Tác động SCM", icon: Shield },
  { id: "scenarios", label: "Kịch bản", icon: Target },
  { id: "actions", label: "Hành động", icon: ListChecks },
  { id: "report", label: "Báo cáo Gemini", icon: Sparkles },
];

const DEPTH_OPTIONS: { id: BriefingDepth; label: string }[] = [
  { id: "quick", label: "Nhanh" },
  { id: "standard", label: "Chuẩn" },
  { id: "deep", label: "Chuyên sâu" },
];

interface CachedBriefing {
  briefing: MarketBriefingResult;
  marketAt: number;
  fetchedAt: number;
}

function loadCached(marketAt: number): MarketBriefingResult | null {
  try {
    const raw = localStorage.getItem(BRIEFING_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedBriefing;
    if (Date.now() - parsed.fetchedAt > BRIEFING_TTL_MS) return null;
    if (parsed.marketAt !== marketAt) return null;
    return parsed.briefing;
  } catch {
    return null;
  }
}

function saveCached(briefing: MarketBriefingResult, marketAt: number): void {
  try {
    localStorage.setItem(
      BRIEFING_CACHE_KEY,
      JSON.stringify({ briefing, marketAt, fetchedAt: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

function clearCached(): void {
  try {
    localStorage.removeItem(BRIEFING_CACHE_KEY);
    localStorage.removeItem("logiq-market-briefing-v2");
    localStorage.removeItem("logiq-market-briefing-v1");
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
  const [testing, setTesting] = useState(false);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [depth, setDepth] = useState<BriefingDepth>("standard");
  const [streamPreview, setStreamPreview] = useState<string | null>(null);

  const keyReady = hasGeminiApiKey();
  const briefingReady = isMarketBriefingReady();

  const testConnection = useCallback(async () => {
    const key = getEffectiveGeminiKey();
    if (key.length < 20) {
      setConnectionOk(false);
      setError("Chưa có API key — mở ⚙️ Cài đặt AI trên Navbar → nhập key → Test → Lưu");
      return;
    }
    setTesting(true);
    setError(null);
    try {
      await testGeminiApi(key);
      setConnectionOk(true);
    } catch (err) {
      setConnectionOk(false);
      setError(err instanceof Error ? err.message : "Test kết nối thất bại");
    } finally {
      setTesting(false);
    }
  }, []);

  const generate = useCallback(
    async (force = false) => {
      if (!keyReady) {
        setError("Chưa có Gemini API key — ⚙️ Navbar → Cài đặt AI → Test → Lưu");
        return;
      }

      if (force) clearCached();

      if (!force && snapshot.fetchedAt > 0) {
        const cached = loadCached(snapshot.fetchedAt);
        if (cached?.source === "gemini") {
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
          onStream: (partial) => {
            const preview = partial.replace(/[{[\]"]/g, " ").slice(-140);
            setStreamPreview(preview + "…");
          },
        });

        setBriefing(result);

        if (result.source === "gemini") {
          saveCached(result, snapshot.fetchedAt);
          setError(null);
          setConnectionOk(true);
        } else {
          const errInSummary = result.marketPulse.summary.match(/Gemini lỗi:\*\* ([^\n]+)/);
          setError(
            errInSummary?.[1] ??
              "Gemini không phản hồi — hiển thị bản cục bộ. Nhấn 'Test Gemini' để kiểm tra key."
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tạo briefing");
      } finally {
        setGenerating(false);
        setStreamPreview(null);
      }
    },
    [keyReady, snapshot, depth]
  );

  useEffect(() => {
    if (snapshot.fetchedAt > 0 && !briefing && !generating) {
      const cached = loadCached(snapshot.fetchedAt);
      if (cached) setBriefing(cached);
    }
  }, [snapshot.fetchedAt, briefing, generating]);

  useEffect(() => {
    if (keyReady && connectionOk === null) {
      testConnection();
    }
  }, [keyReady, connectionOk, testConnection]);

  return (
    <Card className="glow-teal overflow-hidden">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="normal-case flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-teal-400" />
          Gemini Market Intelligence
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {briefingReady ? (
            <Badge variant="success" className="text-[9px] gap-1">
              {connectionOk ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-live" />
              )}
              Key {maskGeminiKey()}
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[9px]">
              Chưa có key
            </Badge>
          )}
          <Badge variant={snapshot.isLive ? "teal" : "secondary"} className="text-[9px]">
            {snapshot.isLive ? `LIVE · ${lastUpdatedLabel}` : "DEMO data"}
          </Badge>
          {briefing && (
            <Badge
              variant={briefing.source === "gemini" ? "success" : "warning"}
              className="text-[9px] font-mono"
            >
              {briefing.source === "gemini" ? briefing.model : "Local fallback"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="pro-surface rounded-xl p-3.5 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-slate-500">Engine:</span>
          <span className="text-teal-400 font-mono">generateGeminiRaw</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">cùng pipeline Notebook AI</span>
          {briefingReady && (
            <Button
              size="sm"
              variant="outline"
              onClick={testConnection}
              disabled={testing}
              className="h-6 text-[9px] ml-auto"
            >
              {testing ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : "Test Gemini"}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {DEPTH_OPTIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDepth(d.id)}
              className={cn("pro-filter-pill", depth === d.id && "pro-filter-pill-active")}
            >
              {d.label}
            </button>
          ))}
          <Button
            size="sm"
            onClick={() => generate(true)}
            disabled={marketLoading || generating || !keyReady}
            className="text-xs ml-auto"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 mr-1.5" />
            )}
            {briefing ? "Phân tích lại (Gemini)" : "Tạo briefing Gemini"}
          </Button>
        </div>

        {generating && (
          <div className="pro-surface rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
              Gemini đang viết báo cáo markdown ({depth})…
            </div>
            {streamPreview && (
              <p className="text-[10px] text-slate-600 font-mono line-clamp-2">{streamPreview}</p>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              {error}
              {!keyReady && (
                <span className="block mt-1 text-slate-500">
                  Mở ⚙️ trên thanh điều hướng → nhập key từ aistudio.google.com/apikey
                </span>
              )}
            </span>
          </p>
        )}

        {connectionOk === true && !error && !briefing && !generating && (
          <p className="text-xs text-emerald-400/90 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Gemini kết nối OK — nhấn &quot;Tạo briefing Gemini&quot;
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
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">
                        {briefing.marketPulse.summary.replace(/⚠️[\s\S]*$/, "").trim()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-[9px] capitalize">
                      {briefing.marketPulse.sentiment}
                    </Badge>
                    <Badge variant={briefing.source === "gemini" ? "success" : "warning"} className="text-[9px]">
                      {briefing.source === "gemini" ? "✓ Gemini AI" : "Local fallback"}
                    </Badge>
                  </div>
                </div>
                <div className="pro-surface rounded-xl p-4 space-y-4">
                  <RiskMeter score={briefing.marketPulse.riskScore} />
                  <ul className="space-y-1.5">
                    {briefing.keyRisks.slice(0, 5).map((r, i) => (
                      <li key={i} className="text-[11px] text-slate-400 flex gap-2">
                        <span className="text-red-400 shrink-0">!</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "fx" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {briefing.fxAnalysis.overview}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {briefing.fxAnalysis.pairs.map((p, i) => (
                    <div key={`${p.pair}-${i}`} className="pro-surface rounded-xl p-3.5">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="font-mono font-bold text-blue-400">{p.pair}</span>
                        <span className="text-xs font-mono text-slate-300">{p.rate}</span>
                      </div>
                      <Badge variant="secondary" className="text-[9px] mb-2">{p.change}</Badge>
                      <p className="text-[11px] text-slate-400">{p.outlook}</p>
                    </div>
                  ))}
                </div>
                {briefing.commodityAnalysis.items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {briefing.commodityAnalysis.items.map((c, i) => (
                      <div key={`${c.name}-${i}`} className="pro-surface rounded-xl p-3.5">
                        <p className="font-semibold text-amber-400 text-sm">{c.name}</p>
                        <p className="font-mono text-slate-200 mt-1">
                          {c.price} <span className="text-xs text-slate-500">{c.change}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2">{c.freightImpact}</p>
                      </div>
                    ))}
                  </div>
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
                  </div>
                ))}
              </div>
            )}

            {tab === "actions" && (
              <div className="space-y-4">
                {briefing.actionItems.map((a, i) => (
                  <div key={i} className="pro-surface rounded-xl p-3.5 flex gap-3 items-start">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border shrink-0", priorityColor(a.priority))}>
                      {a.priority}
                    </span>
                    <div>
                      <p className="text-xs text-slate-200">{a.action}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{a.role} · {a.horizon}</p>
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  {briefing.watchlist.map((w, i) => (
                    <Badge key={i} variant="secondary" className="text-[9px] font-mono">{w}</Badge>
                  ))}
                </div>
              </div>
            )}

            {tab === "report" && (
              <div className="pro-surface rounded-xl p-4 text-sm max-h-[520px] overflow-y-auto">
                {renderMarkdownLite(briefing.fullReport)}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-[10px] text-slate-600 font-mono">
                {new Date(briefing.generatedAt).toLocaleString("vi-VN")} · {briefing.model}
              </span>
              <Button size="sm" variant="outline" onClick={() => generate(true)} className="text-[10px] h-7">
                <RefreshCw className="h-3 w-3 mr-1" />
                Gọi Gemini mới
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}