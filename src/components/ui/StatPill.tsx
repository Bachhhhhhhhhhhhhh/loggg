"use client";

import type { CSSProperties, ElementType } from "react";
import { cn } from "@/lib/utils";

interface StatPillProps {
  icon: ElementType;
  label: string;
  value: number | string;
  color?: string;
  accent?: string;
}

export function StatPill({ icon: Icon, label, value, color = "text-blue-400", accent = "#3b82f6" }: StatPillProps) {
  return (
    <div
      className="pro-stat group"
      style={{ "--stat-accent": accent } as CSSProperties}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors"
        style={{
          backgroundColor: `${accent}12`,
          borderColor: `${accent}25`,
        }}
      >
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="min-w-0">
        <p className={cn("text-xl font-bold font-mono tabular-nums tracking-tight", color)}>{value}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{label}</p>
      </div>
    </div>
  );
}