"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericLineChart } from "@/components/charts/ChartComponents";
import { mulberry32 } from "@/lib/random";

function simulate(
  days: number,
  initialStock: number,
  reorderPoint: number,
  orderQty: number,
  demandMean: number,
  demandStd: number,
  seed: number
) {
  const rand = mulberry32(seed);
  const stockLevels: Array<{ day: string; stock: number; demand: number }> = [];
  let stock = initialStock;
  let stockouts = 0;

  for (let day = 1; day <= days; day++) {
    const z = rand() * 2 - 1;
    const demand = Math.max(0, demandMean + z * demandStd);
    stock -= demand;
    if (stock < 0) {
      stockouts++;
      stock = 0;
    }
    if (stock <= reorderPoint) {
      stock += orderQty;
    }
    stockLevels.push({ day: String(day), stock: Math.round(stock), demand: Math.round(demand) });
  }

  const avgStock = stockLevels.reduce((s, d) => s + d.stock, 0) / days;
  return { stockLevels, stockouts, avgStock: Math.round(avgStock) };
}

export function InventorySimulator() {
  const [initialStock, setInitialStock] = useState(1000);
  const [reorderPoint, setReorderPoint] = useState(200);
  const [orderQty, setOrderQty] = useState(500);
  const [demandMean, setDemandMean] = useState(50);
  const [demandStd, setDemandStd] = useState(10);
  const [seed, setSeed] = useState(1);

  const { stockLevels, stockouts, avgStock } = useMemo(
    () => simulate(90, initialStock, reorderPoint, orderQty, demandMean, demandStd, seed),
    [initialStock, reorderPoint, orderQty, demandMean, demandStd, seed]
  );

  const sliders = [
    { label: "Tồn kho ban đầu", value: initialStock, set: setInitialStock, min: 100, max: 3000, step: 50 },
    { label: "Điểm đặt hàng lại (ROP)", value: reorderPoint, set: setReorderPoint, min: 50, max: 500, step: 10 },
    { label: "Số lượng đặt hàng", value: orderQty, set: setOrderQty, min: 100, max: 2000, step: 50 },
    { label: "Nhu cầu TB/ngày", value: demandMean, set: setDemandMean, min: 10, max: 200, step: 5 },
    { label: "Độ lệch chuẩn nhu cầu", value: demandStd, set: setDemandStd, min: 1, max: 50, step: 1 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Tồn kho TB", value: avgStock, color: "text-blue-400" },
          { label: "Số lần stockout", value: stockouts, color: stockouts > 5 ? "text-red-400" : "text-emerald-400" },
          { label: "Tỷ lệ stockout", value: `${((stockouts / 90) * 100).toFixed(1)}%`, color: "text-teal-400" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">{kpi.label}</p>
              <p className={`text-lg font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Tham số mô phỏng</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="text-blue-400 font-mono">{s.value}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="w-full h-9 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
            >
              Chạy lại mô phỏng (seed {seed})
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Biểu đồ tồn kho (90 ngày)</CardTitle></CardHeader>
          <CardContent>
            <GenericLineChart
              data={stockLevels}
              xKey="day"
              lines={[
                { key: "stock", name: "Tồn kho", color: "#3B82F6" },
                { key: "demand", name: "Nhu cầu", color: "#EF4444" },
              ]}
              height={280}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}