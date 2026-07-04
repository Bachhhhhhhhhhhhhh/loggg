"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GenericLineChart } from "@/components/charts/ChartComponents";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatNumber } from "@/lib/utils";

interface EOQRow {
  q: number;
  ordering_cost: number;
  holding_cost: number;
  total_cost: number;
}

function isValidInput(D: number, S: number, H: number) {
  return D > 0 && S > 0 && H > 0 && Number.isFinite(D) && Number.isFinite(S) && Number.isFinite(H);
}

export function EOQCalculator() {
  const [D, setD] = useState(10000);
  const [S, setS] = useState(50);
  const [H, setH] = useState(2);

  const valid = isValidInput(D, S, H);

  const result = useMemo(() => {
    if (!valid) return null;

    const eoq = Math.sqrt((2 * D * S) / H);
    const orderingCost = (D / eoq) * S;
    const holdingCost = (eoq / 2) * H;
    const totalCost = orderingCost + holdingCost;

    const chartData: EOQRow[] = [];
    const step = Math.max(1, Math.round(eoq * 0.1));
    for (let q = Math.round(eoq * 0.2); q <= Math.round(eoq * 2); q += step) {
      chartData.push({
        q,
        ordering_cost: Math.round((D / q) * S),
        holding_cost: Math.round((q / 2) * H),
        total_cost: Math.round((D / q) * S + (q / 2) * H),
      });
    }

    return {
      eoq: Math.round(eoq),
      orderingCost: Math.round(orderingCost),
      holdingCost: Math.round(holdingCost),
      totalCost: Math.round(totalCost),
      ordersPerYear: Math.round((D / eoq) * 10) / 10,
      chartData,
    };
  }, [D, S, H, valid]);

  const tableData: EOQRow[] = result
    ? [
        {
          q: result.eoq,
          ordering_cost: result.orderingCost,
          holding_cost: result.holdingCost,
          total_cost: result.totalCost,
        },
        ...result.chartData.filter((r) => r.q !== result.eoq).slice(0, 8),
      ]
    : [];

  const columns: Column<EOQRow>[] = [
    { key: "q", header: "Số lượng (Q)", sortable: true, render: (r) => <span className="font-mono">{formatNumber(r.q, 0)}</span> },
    { key: "ordering_cost", header: "Chi phí đặt hàng", sortable: true, render: (r) => <span className="text-red-400 font-mono">{formatNumber(r.ordering_cost, 0)}</span> },
    { key: "holding_cost", header: "Chi phí lưu kho", sortable: true, render: (r) => <span className="text-amber-400 font-mono">{formatNumber(r.holding_cost, 0)}</span> },
    { key: "total_cost", header: "Tổng chi phí", sortable: true, render: (r) => <span className="text-blue-400 font-mono font-semibold">{formatNumber(r.total_cost, 0)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Nhu cầu hàng năm (D)</label>
          <Input type="number" min={1} value={D} onChange={(e) => setD(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Chi phí đặt hàng (S)</label>
          <Input type="number" min={1} value={S} onChange={(e) => setS(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Chi phí lưu kho/đv/năm (H)</label>
          <Input type="number" min={0.01} step={0.01} value={H} onChange={(e) => setH(Number(e.target.value))} />
        </div>
      </div>

      {!valid && (
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          D, S, H phải là số dương (H &gt; 0) để tính EOQ.
        </p>
      )}

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "EOQ", value: formatNumber(result.eoq, 0), color: "text-blue-400" },
              { label: "Tổng chi phí", value: formatNumber(result.totalCost, 0), color: "text-emerald-400" },
              { label: "Số lần đặt/năm", value: String(result.ordersPerYear), color: "text-teal-400" },
              { label: "Chi phí đặt = Lưu kho", value: result.orderingCost === result.holdingCost ? "✓ Cân bằng" : "—", color: "text-slate-300" },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">{kpi.label}</p>
                  <p className={`text-lg font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle>Biểu đồ chi phí theo số lượng đặt hàng</CardTitle></CardHeader>
            <CardContent>
              <GenericLineChart
                data={result.chartData}
                xKey="q"
                lines={[
                  { key: "ordering_cost", name: "Chi phí đặt hàng", color: "#EF4444" },
                  { key: "holding_cost", name: "Chi phí lưu kho", color: "#F59E0B" },
                  { key: "total_cost", name: "Tổng chi phí", color: "#3B82F6" },
                ]}
                height={280}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Bảng kết quả</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={tableData} columns={columns} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}