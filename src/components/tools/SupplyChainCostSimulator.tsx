"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CostBreakdownChart } from "@/components/charts/ChartComponents";

export function SupplyChainCostSimulator() {
  const [transportPct, setTransportPct] = useState(35);
  const [warehousePct, setWarehousePct] = useState(25);
  const [inventoryPct, setInventoryPct] = useState(20);
  const [orderPct, setOrderPct] = useState(12);
  const [totalBudget, setTotalBudget] = useState(1000000000);

  const otherPct = Math.max(0, 100 - transportPct - warehousePct - inventoryPct - orderPct);

  const breakdown = useMemo(() => [
    { name: "Vận chuyển", value: transportPct, color: "#3B82F6", amount: Math.round(totalBudget * transportPct / 100) },
    { name: "Kho bãi", value: warehousePct, color: "#14B8A6", amount: Math.round(totalBudget * warehousePct / 100) },
    { name: "Tồn kho", value: inventoryPct, color: "#8B5CF6", amount: Math.round(totalBudget * inventoryPct / 100) },
    { name: "Xử lý đơn", value: orderPct, color: "#F59E0B", amount: Math.round(totalBudget * orderPct / 100) },
    { name: "Khác", value: otherPct, color: "#6B7280", amount: Math.round(totalBudget * otherPct / 100) },
  ], [transportPct, warehousePct, inventoryPct, orderPct, otherPct, totalBudget]);

  const savings = useMemo(() => {
    const transportSave = breakdown[0].amount * 0.12;
    const inventorySave = breakdown[2].amount * 0.18;
    const warehouseSave = breakdown[1].amount * 0.08;
    return {
      transport: Math.round(transportSave),
      inventory: Math.round(inventorySave),
      warehouse: Math.round(warehouseSave),
      total: Math.round(transportSave + inventorySave + warehouseSave),
    };
  }, [breakdown]);

  const sliders = [
    { label: "Vận chuyển (%)", value: transportPct, set: setTransportPct, color: "#3B82F6" },
    { label: "Kho bãi (%)", value: warehousePct, set: setWarehousePct, color: "#14B8A6" },
    { label: "Tồn kho (%)", value: inventoryPct, set: setInventoryPct, color: "#8B5CF6" },
    { label: "Xử lý đơn (%)", value: orderPct, set: setOrderPct, color: "#F59E0B" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Tổng ngân sách logistics (VND)</label>
        <input
          type="number"
          value={totalBudget}
          onChange={(e) => setTotalBudget(Number(e.target.value))}
          className="w-full h-9 rounded-md border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-100 font-mono"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng chi phí", value: `${(totalBudget / 1e9).toFixed(2)}B`, color: "text-slate-200" },
          { label: "Tiềm năng tiết kiệm", value: `${(savings.total / 1e6).toFixed(0)}M`, color: "text-emerald-400" },
          { label: "% Tiết kiệm", value: `${((savings.total / totalBudget) * 100).toFixed(1)}%`, color: "text-teal-400" },
          { label: "Hạng mục lớn nhất", value: breakdown.reduce((a, b) => a.value > b.value ? a : b).name, color: "text-blue-400" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">{kpi.label}</p>
              <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Phân bổ chi phí</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="font-mono" style={{ color: s.color }}>{s.value}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: s.color }}
                />
              </div>
            ))}
            <p className="text-xs text-slate-500">Khác: {otherPct}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Biểu đồ chi phí</CardTitle></CardHeader>
          <CardContent>
            <CostBreakdownChart data={breakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Phân tích tiềm năng giảm chi phí</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Tối ưu vận chuyển (-12%)", value: savings.transport, color: "text-blue-400" },
              { label: "Tối ưu tồn kho (-18%)", value: savings.inventory, color: "text-purple-400" },
              { label: "Tối ưu kho bãi (-8%)", value: savings.warehouse, color: "text-teal-400" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className={`text-lg font-bold font-mono ${item.color}`}>
                  {item.value.toLocaleString("vi-VN")} VND
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}