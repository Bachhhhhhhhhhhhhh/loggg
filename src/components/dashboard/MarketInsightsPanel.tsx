"use client";

import { useCallback, useState } from "react";
import { Sparkles, RefreshCw, Loader2, AlertCircle, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarketData } from "@/context/MarketDataContext";
import { getEffectiveGeminiKey, isGeminiConfigured } from "@/lib/gemini/config";
import { generateMarketBriefing } from "@/lib/gemini/market-briefing";
import { renderMarkdownLite } from "@/components/notebook/markdown-lite";
import { cn } from "@/lib/utils";

const BRIEFING_CACHE_KEY = "logiq-market-briefing-v1";
const BRIEFING_TTL_MS = 15 * 60 * 1000;

interface CachedBriefing {
  text: string;
  model: string;
  fetchedAt: number;
  marketAt: number;
}

function loadCachedBriefing(marketAt: number): CachedBriefing | null {
  try {
    const raw = localStorage.getItem(BRIEFING_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedBriefing;
    if (Date.now() - parsed.fetchedAt > BRIEFING_TTL_MS) return null;
    if (parsed.marketAt !== marketAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedBriefing(data: CachedBriefing): void {
  try {
    localStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function MarketInsightsPanel() {
  const { snapshot, loading: marketLoading } = useMarketData();
  const [briefing, setBriefing] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geminiReady = isGeminiConfigured();
  const hasLive = snapshot.isLive;

  const generate = useCallback(
    async (force = false) => {
      if (!geminiReady) {
        setError("Cần cấu hình Gemini API key — Cài đặt AI trên thanh điều hướng");
        return;
      }
      if (!hasLive && !force) {
        setError("Chưa có dữ liệu live — đợi tải xong hoặc thử lại");
        return;
      }

      if (!force) {
        const cached = loadCachedBriefing(snapshot.fetchedAt);
        if (cached) {
          setBriefing(cached.text);
          setModel(cached.model);
          return;
        }
      }

      setGenerating(true);
      setError(null);
      try {
        const key = getEffectiveGeminiKey();
        const result = await generateMarketBriefing(key, snapshot);
        setBriefing(result.text);
        setModel(result.model);
        saveCachedBriefing({
          text: result.text,
          model: result.model,
          fetchedAt: Date.now(),
          marketAt: snapshot.fetchedAt,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tạo briefing");
      } finally {
        setGenerating(false);
      }
    },
    [geminiReady, hasLive, snapshot]
  );

  return (
    <Card className="glow-teal overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="normal-case flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-teal-400" />
          Gemini Market Briefing
        </CardTitle>
        <div className="flex items-center gap-2">
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
          {hasLive && (
            <Badge variant="teal" className="text-[9px]">
              LIVE DATA
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Phân tích AI từ tỷ giá USD/VND, EUR/USD, giá dầu WTI/Brent và KPI logistics — cập nhật theo dữ liệu thu thập real-time.
        </p>

        {!briefing && !generating && (
          <Button
            size="sm"
            onClick={() => generate(false)}
            disabled={marketLoading || !geminiReady}
            className="text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Tạo briefing SCM
          </Button>
        )}

        {generating && (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
            Gemini đang phân tích dữ liệu thị trường…
          </div>
        )}

        {error && (
          <p className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {error}
          </p>
        )}

        {briefing && !generating && (
          <div className="space-y-3">
            <div className="prose-invert text-sm text-slate-300 leading-relaxed">
              {renderMarkdownLite(briefing)}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              {model && (
                <span className="text-[10px] text-slate-600 font-mono">{model}</span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => generate(true)}
                className={cn("text-[10px] h-7 ml-auto")}
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