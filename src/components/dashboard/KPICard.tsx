"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/Sparkline";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn, formatPercent } from "@/lib/utils";
import type { KPI } from "@/data/kpis";

interface KPICardProps {
  kpi: KPI;
  index?: number;
}

export function KPICard({ kpi, index = 0 }: KPICardProps) {
  const isPositive = kpi.trend === "up" ? kpi.change >= 0 : kpi.change <= 0;
  const TrendIcon = kpi.change === 0 ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2 }}
    >
      <Card
        className="card-accent group hover:border-slate-600/80 hover:glow-blue transition-all duration-300 h-full"
        style={{ "--accent-color": isPositive ? "#22c55e" : "#ef4444" } as React.CSSProperties}
      >
        <CardContent className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-tight">
              {kpi.label}
            </p>
            <div
              className={cn(
                "flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0",
                isPositive
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  : "text-red-400 bg-red-500/10 border border-red-500/20"
              )}
            >
              <TrendIcon className="h-2.5 w-2.5" />
              {formatPercent(kpi.change)}
            </div>
          </div>

          <div className="flex items-end justify-between mt-2">
            <div className="flex items-baseline gap-0.5">
              <AnimatedNumber
                value={kpi.value}
                className="text-2xl font-bold text-slate-50 tabular-nums tracking-tight"
              />
              {kpi.unit && (
                <span className="text-xs text-slate-500 font-medium">{kpi.unit}</span>
              )}
            </div>
            {kpi.sparkline && (
              <Sparkline
                data={kpi.sparkline}
                positive={isPositive}
                width={72}
                height={24}
              />
            )}
          </div>

          <p className="text-[10px] text-slate-600 mt-2 truncate">{kpi.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}