"use client";

import { RefreshCw } from "lucide-react";
import { useMarketData } from "@/context/MarketDataContext";
import { cn, formatPercent } from "@/lib/utils";

export function MarketTicker() {
  const { snapshot, loading, refreshing, lastUpdatedLabel, refresh } = useMarketData();
  const items = [...snapshot.ticker, ...snapshot.ticker];

  return (
    <div className="relative overflow-hidden border-b border-slate-800/80 bg-slate-950/90 h-7 flex items-center">
      <div className="absolute left-0 z-10 flex items-center gap-2 px-3 h-full bg-gradient-to-r from-slate-950 via-slate-950 to-transparent">
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              snapshot.isLive ? "bg-emerald-400 pulse-live" : "bg-amber-400"
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              snapshot.isLive ? "bg-emerald-500" : "bg-amber-500"
            )}
          />
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            snapshot.isLive ? "text-emerald-400" : "text-amber-400"
          )}
        >
          {loading ? "SYNC" : snapshot.isLive ? "LIVE" : "DEMO"}
        </span>
        {snapshot.isLive && (
          <span className="text-[9px] text-slate-600 font-mono hidden md:inline">
            {lastUpdatedLabel}
          </span>
        )}
        <button
          type="button"
          onClick={() => refresh()}
          disabled={refreshing}
          className="p-0.5 rounded text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-40"
          aria-label="Làm mới dữ liệu"
        >
          <RefreshCw className={cn("h-2.5 w-2.5", refreshing && "animate-spin")} />
        </button>
      </div>

      <div className="flex ticker-animate whitespace-nowrap pl-28 md:pl-44">
        {items.map((item, i) => {
          const isUp = item.change >= 0;
          return (
            <div
              key={`${item.symbol}-${i}`}
              className="inline-flex items-center gap-2 px-4 text-[11px] border-r border-slate-800/50"
            >
              <span className="font-bold text-blue-400 font-mono">{item.symbol}</span>
              <span className="text-slate-500 hidden sm:inline">{item.name}</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {item.value}
                {item.unit && <span className="text-slate-500 ml-0.5">{item.unit}</span>}
              </span>
              <span
                className={cn(
                  "font-mono font-medium tabular-nums",
                  isUp ? "text-emerald-400" : "text-red-400"
                )}
              >
                {formatPercent(item.change)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
}