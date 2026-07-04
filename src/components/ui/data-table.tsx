"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  maxHeight?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  className,
  maxHeight = "400px",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [filter, setFilter] = React.useState("");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = React.useMemo(() => {
    if (!filter) return data;
    const lower = filter.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(lower))
    );
  }, [data, filter]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filtered, sortKey, sortDir]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <input
          type="text"
          placeholder="Lọc dữ liệu..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-xs h-8 rounded-lg border border-slate-800/60 bg-slate-900/50 px-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all"
        />
      </div>
      <div className="rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md">
              <tr className="border-b border-slate-800/60">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider",
                      col.sortable && "cursor-pointer hover:text-slate-300 select-none transition-colors",
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-blue-400" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-blue-400" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-slate-800/30 transition-colors",
                    i % 2 === 0 ? "bg-transparent" : "bg-slate-900/20",
                    "hover:bg-blue-500/5"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-3 py-2.5 text-slate-300 text-xs", col.className)}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-slate-600 font-mono">
        {sorted.length} / {data.length} bản ghi
      </p>
    </div>
  );
}