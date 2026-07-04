"use client";

import { useMemo } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { cn, formatPercent } from "@/lib/utils";
import type { MarketWatchItem } from "@/data/kpis";

type MarketWatchRow = MarketWatchItem & { changePct: number };

const statusConfig = {
  good: { label: "Tốt", variant: "success" as const },
  warning: { label: "Cảnh báo", variant: "warning" as const },
  critical: { label: "Nguy hiểm", variant: "danger" as const },
};

function formatValue(value: number, unit: string) {
  if (unit === "VND") return value.toLocaleString("vi-VN");
  return `${value}${unit === "%" || unit === "x" ? unit : ` ${unit}`}`;
}

export function MarketWatchTable({ data }: { data: MarketWatchItem[] }) {
  const rows = useMemo<MarketWatchRow[]>(
    () =>
      data.map((item) => ({
        ...item,
        changePct: ((item.current - item.previous) / item.previous) * 100,
      })),
    [data]
  );

  const columns: Column<MarketWatchRow>[] = [
    {
      key: "metric",
      header: "Chỉ số",
      sortable: true,
      render: (r) => (
        <div>
          <p className="text-slate-200 font-medium">{r.metric}</p>
          <p className="text-[10px] text-slate-500">{r.category}</p>
        </div>
      ),
    },
    {
      key: "current",
      header: "Hiện tại",
      sortable: true,
      className: "text-right",
      render: (r) => (
        <span className="font-mono text-slate-100 tabular-nums">
          {formatValue(r.current, r.unit)}
        </span>
      ),
    },
    {
      key: "previous",
      header: "Kỳ trước",
      sortable: true,
      className: "text-right",
      render: (r) => (
        <span className="font-mono text-slate-500 tabular-nums">
          {formatValue(r.previous, r.unit)}
        </span>
      ),
    },
    {
      key: "changePct",
      header: "Thay đổi",
      sortable: true,
      className: "text-right",
      render: (r) => (
        <span
          className={cn(
            "font-mono font-medium tabular-nums",
            r.changePct >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {formatPercent(r.changePct)}
        </span>
      ),
    },
    {
      key: "target",
      header: "Mục tiêu",
      sortable: true,
      className: "text-right",
      render: (r) => (
        <span className="font-mono text-blue-400/80 tabular-nums">
          {formatValue(r.target, r.unit)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      sortable: true,
      render: (r) => {
        const cfg = statusConfig[r.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
  ];

  return <DataTable data={rows} columns={columns} maxHeight="360px" />;
}