"use client";

import { useMemo, useState } from "react";
import {
  FlaskConical,
  Info,
  Play,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GenericLineChart,
  GenericBarChart,
} from "@/components/charts/ChartComponents";
import type { KnowledgeSimulationModel } from "@/data/knowledge/types";
import {
  computeEOQ,
  safetyStockCombined,
  serviceLevelCurve,
  monteCarloInventory,
  classifyABC,
  abcXyzMatrix,
  newsvendorOptimal,
  simulateBullwhip,
  solveTransport2x3,
  computeMAPE,
  transportCarbon,
  queueingDock,
  sopGap,
  eoqQuantityDiscount,
  sampleSKUData,
} from "@/lib/knowledge/simulation-engine";
import { mulberry32 } from "@/lib/random";

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-blue-400 font-mono">
          {step < 1 ? value.toFixed(2) : value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function SimPanel({ model, children }: { model: KnowledgeSimulationModel; children: React.ReactNode }) {
  return (
    <Card id={`sim-${model.id}`} className="border-teal-500/20 glow-teal">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="normal-case flex items-center gap-2 text-teal-300">
              <FlaskConical className="h-4 w-4" />
              {model.title}
            </CardTitle>
            <p className="text-[11px] text-slate-500 mt-1">{model.subtitle}</p>
          </div>
          <Badge variant="teal" className="text-[9px] shrink-0">
            Mô phỏng
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{model.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <p className="text-[10px] text-blue-400 font-semibold uppercase mb-1 flex items-center gap-1">
            <Info className="h-3 w-3" /> Cơ sở mô hình
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">{model.scientificNote}</p>
        </div>
        {children}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/50">
          <div>
            <p className="text-[10px] text-slate-600 uppercase mb-1.5">Giả định</p>
            <ul className="space-y-1">
              {model.assumptions.map((a) => (
                <li key={a} className="text-[10px] text-slate-500 flex gap-1.5">
                  <span className="text-amber-500">•</span>{a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] text-slate-600 uppercase mb-1.5">Đầu ra</p>
            <div className="flex flex-wrap gap-1">
              {model.outputs.map((o) => (
                <Badge key={o} variant="secondary" className="text-[9px]">
                  {o}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EOQSim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const [D, setD] = useState(p.D ?? 12000);
  const [S, setS] = useState(p.S ?? 50);
  const [H, setH] = useState(p.H ?? 2);
  const r = useMemo(() => computeEOQ(D, S, H), [D, S, H]);
  const chartData = r.curve.map((c) => ({
    q: String(c.q),
    ordering: Math.round(c.ordering),
    holding: Math.round(c.holding),
    total: Math.round(c.total),
  }));

  return (
    <SimPanel model={model}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Slider label="Nhu cầu/năm (D)" value={D} onChange={setD} min={1000} max={50000} step={500} />
        <Slider label="Chi phí đặt hàng (S)" value={S} onChange={setS} min={10} max={200} step={5} />
        <Slider label="Holding cost (H)" value={H} onChange={setH} min={0.5} max={10} step={0.1} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { l: "EOQ Q*", v: Math.round(r.eoq), c: "text-blue-400" },
          { l: "Orders/năm", v: Math.round(r.ordersPerYear * 10) / 10, c: "text-teal-400" },
          { l: "Avg inventory", v: Math.round(r.avgInventory), c: "text-purple-400" },
          { l: "Min TC", v: Math.round(r.total), c: "text-emerald-400" },
        ].map((k) => (
          <div key={k.l} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-[9px] text-slate-600">{k.l}</p>
            <p className={`text-lg font-bold font-mono ${k.c}`}>{k.v}</p>
          </div>
        ))}
      </div>
      <GenericLineChart
        data={chartData}
        xKey="q"
        lines={[
          { key: "ordering", name: "Ordering", color: "#EF4444" },
          { key: "holding", name: "Holding", color: "#F59E0B" },
          { key: "total", name: "Total", color: "#3B82F6" },
        ]}
        height={220}
      />
    </SimPanel>
  );
}

function SafetyStockSim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const [sl, setSl] = useState(p.serviceLevel ?? 0.95);
  const [d, setD] = useState(p.d ?? 50);
  const [sigmaD, setSigmaD] = useState(p.sigmaD ?? 12);
  const [L, setL] = useState(p.L ?? 14);
  const [sigmaL, setSigmaL] = useState(p.sigmaL ?? 3);
  const r = useMemo(() => safetyStockCombined(sl, d, sigmaD, L, sigmaL), [sl, d, sigmaD, L, sigmaL]);

  return (
    <SimPanel model={model}>
      <Slider label="Service level" value={sl} onChange={setSl} min={0.85} max={0.995} step={0.01} />
      <div className="grid grid-cols-2 gap-3">
        <Slider label="Demand TB/ngày (d)" value={d} onChange={setD} min={10} max={200} step={5} />
        <Slider label="σ demand" value={sigmaD} onChange={setSigmaD} min={1} max={50} step={1} />
        <Slider label="Lead time (ngày)" value={L} onChange={setL} min={1} max={30} step={1} />
        <Slider label="σ lead time" value={sigmaL} onChange={setSigmaL} min={0} max={10} step={0.5} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { l: "Z-score", v: r.z.toFixed(2) },
          { l: "Safety Stock", v: Math.round(r.ss) },
          { l: "ROP", v: Math.round(r.rop) },
          { l: "Days of SS", v: Math.round(r.ss / d) },
        ].map((k) => (
          <div key={k.l} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-[9px] text-slate-600">{k.l}</p>
            <p className="text-base font-bold font-mono text-teal-400">{k.v}</p>
          </div>
        ))}
      </div>
    </SimPanel>
  );
}

function ServiceLevelSim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const [d, setD] = useState(p.d ?? 40);
  const [sigmaD, setSigmaD] = useState(p.sigmaD ?? 10);
  const [L, setL] = useState(p.L ?? 10);
  const [unitCost, setUnitCost] = useState(p.unitCost ?? 25);
  const [holdingRate, setHoldingRate] = useState(p.holdingRate ?? 0.25);
  const curve = useMemo(
    () => serviceLevelCurve(d, sigmaD, L, unitCost, holdingRate),
    [d, sigmaD, L, unitCost, holdingRate]
  );

  return (
    <SimPanel model={model}>
      <div className="grid grid-cols-2 gap-3">
        <Slider label="σ demand" value={sigmaD} onChange={setSigmaD} min={2} max={40} />
        <Slider label="Unit cost ($)" value={unitCost} onChange={setUnitCost} min={5} max={100} />
      </div>
      <GenericLineChart
        data={curve.map((c) => ({ sl: `${c.sl}%`, ss: c.ss, holdingCost: c.holdingCost }))}
        xKey="sl"
        lines={[
          { key: "ss", name: "Safety Stock", color: "#8B5CF6" },
          { key: "holdingCost", name: "Holding $", color: "#F59E0B" },
        ]}
        height={200}
      />
    </SimPanel>
  );
}

function MonteCarloSim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const [iterations, setIterations] = useState(p.iterations ?? 1000);
  const [demandMean, setDemandMean] = useState(p.demandMean ?? 50);
  const [demandStd, setDemandStd] = useState(p.demandStd ?? 12);
  const [rop, setRop] = useState(p.reorderPoint ?? 400);
  const [orderQty, setOrderQty] = useState(p.orderQty ?? 600);
  const [seed, setSeed] = useState(42);
  const r = useMemo(
    () =>
      monteCarloInventory({
        iterations,
        days: 90,
        demandMean,
        demandStd,
        leadTime: 7,
        reorderPoint: rop,
        orderQty,
        initialStock: 800,
        seed,
      }),
    [iterations, demandMean, demandStd, rop, orderQty, seed]
  );

  return (
    <SimPanel model={model}>
      <div className="grid grid-cols-2 gap-3">
        <Slider label="Iterations" value={iterations} onChange={setIterations} min={200} max={2000} step={100} />
        <Slider label="μ demand/ngày" value={demandMean} onChange={setDemandMean} min={20} max={100} />
        <Slider label="σ demand" value={demandStd} onChange={setDemandStd} min={5} max={30} />
        <Slider label="ROP" value={rop} onChange={setRop} min={100} max={800} step={25} />
      </div>
      <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)} className="gap-1">
        <RotateCcw className="h-3 w-3" /> Chạy lại ({iterations} runs)
      </Button>
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "Fill rate TB", v: `${r.avgFillRate}%` },
          { l: "Stockout days TB", v: r.avgStockoutDays },
          { l: "P95 stockout", v: r.p95StockoutDays },
        ].map((k) => (
          <div key={k.l} className="p-2 rounded-lg bg-slate-900/60 border text-center">
            <p className="text-[9px] text-slate-600">{k.l}</p>
            <p className="font-bold font-mono text-emerald-400">{k.v}</p>
          </div>
        ))}
      </div>
      <GenericBarChart data={r.histData.slice(0, 12)} xKey="days" bars={[{ key: "count", name: "Frequency", color: "#3B82F6" }]} height={180} />
    </SimPanel>
  );
}

function ABCSim({ model }: { model: KnowledgeSimulationModel }) {
  const [seed, setSeed] = useState(1);
  const items = useMemo(() => sampleSKUData(15, seed), [seed]);
  const classified = useMemo(() => classifyABC(items.map((i) => ({ sku: i.sku, value: i.value }))), [items]);
  const summary = { A: 0, B: 0, C: 0 };
  classified.forEach((c) => summary[c.class as keyof typeof summary]++);

  return (
    <SimPanel model={model}>
      <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)} className="gap-1">
        <Play className="h-3 w-3" /> Random SKU data
      </Button>
      <div className="grid grid-cols-3 gap-2">
        {(["A", "B", "C"] as const).map((cls) => (
          <div key={cls} className="p-2 rounded-lg bg-slate-900/60 border text-center">
            <p className="text-[9px] text-slate-600">Class {cls}</p>
            <p className="text-xl font-bold font-mono text-blue-400">{summary[cls]}</p>
          </div>
        ))}
      </div>
      <GenericBarChart
        data={classified.slice(0, 10).map((c) => ({ sku: c.sku.replace("SKU-", ""), value: c.value }))}
        xKey="sku"
        bars={[{ key: "value", name: "Value", color: "#14B8A6" }]}
        height={180}
      />
      <div className="max-h-32 overflow-y-auto text-[10px] font-mono text-slate-500 space-y-0.5">
        {classified.map((c) => (
          <div key={c.sku} className="flex justify-between">
            <span>{c.sku}</span>
            <span className={c.class === "A" ? "text-blue-400" : c.class === "B" ? "text-teal-400" : "text-slate-600"}>
              {c.class} · {c.cumulativePct}%
            </span>
          </div>
        ))}
      </div>
    </SimPanel>
  );
}

function ABCXYZSim({ model }: { model: KnowledgeSimulationModel }) {
  const [seed, setSeed] = useState(2);
  const items = useMemo(() => sampleSKUData(20, seed), [seed]);
  const { classified, matrix } = useMemo(() => abcXyzMatrix(items), [items]);

  return (
    <SimPanel model={model}>
      <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>Regenerate</Button>
      <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
        {["AX", "AY", "AZ", "BX", "BY", "BZ", "CX", "CY", "CZ"].map((cell) => (
          <div key={cell} className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <p className="text-slate-500 font-mono">{cell}</p>
            <p className="text-lg font-bold text-purple-400">{matrix[cell] ?? 0}</p>
          </div>
        ))}
      </div>
    </SimPanel>
  );
}

function NewsvendorSim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const [cost, setCost] = useState(p.cost ?? 40);
  const [price, setPrice] = useState(p.price ?? 80);
  const [salvage, setSalvage] = useState(p.salvage ?? 10);
  const demands = useMemo(() => {
    const rand = mulberry32(99);
    return Array.from({ length: 500 }, () => Math.round(50 + rand() * 80));
  }, []);
  const r = useMemo(() => newsvendorOptimal(cost, price, salvage, demands), [cost, price, salvage, demands]);

  return (
    <SimPanel model={model}>
      <div className="grid grid-cols-3 gap-3">
        <Slider label="Cost" value={cost} onChange={setCost} min={10} max={60} />
        <Slider label="Price" value={price} onChange={setPrice} min={50} max={120} />
        <Slider label="Salvage" value={salvage} onChange={setSalvage} min={0} max={30} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-slate-900/60 border">
          <p className="text-[9px] text-slate-600">Critical fractile</p>
          <p className="font-bold text-amber-400">{r.criticalFractile}%</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border">
          <p className="text-[9px] text-slate-600">Q* optimal</p>
          <p className="font-bold text-blue-400">{r.qStar}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border">
          <p className="text-[9px] text-slate-600">E[Profit]</p>
          <p className="font-bold text-emerald-400">{r.expectedProfit}</p>
        </div>
      </div>
    </SimPanel>
  );
}

function BullwhipSim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const [batch, setBatch] = useState(p.batchPeriod ?? 4);
  const [mult, setMult] = useState(p.orderMultiplier ?? 1.2);
  const retail = useMemo(() => {
    const rand = mulberry32(7);
    return Array.from({ length: 24 }, () => Math.round(100 + (rand() - 0.5) * 20));
  }, []);
  const r = useMemo(() => simulateBullwhip(retail, mult, batch), [retail, mult, batch]);

  return (
    <SimPanel model={model}>
      <Slider label="Order batch period" value={batch} onChange={setBatch} min={1} max={8} />
      <Slider label="Order multiplier" value={mult} onChange={setMult} min={1} max={2} step={0.05} />
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
        <p className="text-[10px] text-slate-500">Bullwhip Ratio</p>
        <p className={`text-2xl font-bold font-mono ${r.ratio > 2 ? "text-red-400" : r.ratio > 1.5 ? "text-amber-400" : "text-emerald-400"}`}>
          {r.ratio}x
        </p>
        <p className="text-[10px] text-slate-600 mt-1">Target &lt; 1.5 với CPFR</p>
      </div>
      <GenericLineChart
        data={r.retail.map((d) => ({ t: String(d.t), retail: d.retail, orders: d.orders }))}
        xKey="t"
        lines={[
          { key: "retail", name: "Retail sales", color: "#22C55E" },
          { key: "orders", name: "Distributor orders", color: "#EF4444" },
        ]}
        height={180}
      />
    </SimPanel>
  );
}

function TransportLPSim({ model }: { model: KnowledgeSimulationModel }) {
  const [costs] = useState([[4, 5, 3], [6, 8, 7]]);
  const [supply, setSupply] = useState<[number, number]>([100, 150]);
  const [demand, setDemand] = useState<[number, number, number]>([80, 120, 50]);
  const r = useMemo(() => solveTransport2x3(supply, demand, costs), [supply, demand, costs]);

  return (
    <SimPanel model={model}>
      <p className="text-[10px] text-slate-600">Cost matrix cố định S1→[4,5,3], S2→[6,8,7]</p>
      <div className="grid grid-cols-2 gap-3">
        <Slider label="Supply S1" value={supply[0]} onChange={(v) => setSupply([v, supply[1]])} min={50} max={200} step={10} />
        <Slider label="Supply S2" value={supply[1]} onChange={(v) => setSupply([supply[0], v])} min={50} max={200} step={10} />
      </div>
      <p className="text-lg font-bold text-teal-400 font-mono">Total cost: {r.totalCost}</p>
      <div className="text-[11px] font-mono text-slate-400 space-y-1">
        {r.flows.map((f) => (
          <div key={`${f.from}-${f.to}`}>{f.from} → {f.to}: {f.qty} units @ {f.cost}</div>
        ))}
      </div>
    </SimPanel>
  );
}

function MAPESim({ model }: { model: KnowledgeSimulationModel }) {
  const actual = [120, 135, 128, 142, 155, 148, 160, 172, 165, 180, 175, 190];
  const [biasPct, setBiasPct] = useState(0);
  const forecast = useMemo(
    () => actual.map((a) => Math.round(a * (1 + biasPct / 100))),
    [biasPct]
  );
  const r = useMemo(() => computeMAPE(actual, forecast), [forecast]);

  return (
    <SimPanel model={model}>
      <Slider label="Forecast bias %" value={biasPct} onChange={setBiasPct} min={-20} max={20} />
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-slate-900/60 border text-center">
          <p className="text-[9px] text-slate-600">MAPE</p>
          <p className={`text-xl font-bold font-mono ${r.mape < 15 ? "text-emerald-400" : r.mape < 25 ? "text-amber-400" : "text-red-400"}`}>
            {r.mape}%
          </p>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border text-center">
          <p className="text-[9px] text-slate-600">Bias</p>
          <p className="text-xl font-bold font-mono text-blue-400">{r.bias > 0 ? "+" : ""}{r.bias}</p>
        </div>
      </div>
      <GenericLineChart
        data={actual.map((a, i) => ({ period: String(i + 1), actual: a, forecast: forecast[i] }))}
        xKey="period"
        lines={[
          { key: "actual", name: "Actual", color: "#22C55E" },
          { key: "forecast", name: "Forecast", color: "#3B82F6" },
        ]}
        height={180}
      />
    </SimPanel>
  );
}

function CarbonSim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const [weight, setWeight] = useState(p.weightTon ?? 20);
  const [dist, setDist] = useState(p.distanceKm ?? 5000);
  const modes = useMemo(
    () =>
      (["road", "sea", "rail", "air"] as const).map((m) => ({
        mode: m.toUpperCase(),
        ...transportCarbon(weight, dist, m),
      })),
    [weight, dist]
  );

  return (
    <SimPanel model={model}>
      <Slider label="Weight (tons)" value={weight} onChange={setWeight} min={1} max={100} />
      <Slider label="Distance (km)" value={dist} onChange={setDist} min={500} max={15000} step={100} />
      <GenericBarChart
        data={modes.map((m) => ({ mode: m.mode, kgCO2: m.kgCO2 }))}
        xKey="mode"
        bars={[{ key: "kgCO2", name: "kg CO₂", color: "#10B981" }]}
        height={180}
      />
    </SimPanel>
  );
}

function QueueingSim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const [arrival, setArrival] = useState(p.arrivalRate ?? 8);
  const [service, setService] = useState(p.serviceRate ?? 2);
  const [servers, setServers] = useState(p.servers ?? 5);
  const r = useMemo(() => queueingDock(arrival, service, servers), [arrival, service, servers]);

  return (
    <SimPanel model={model}>
      <Slider label="Arrival rate λ (trucks/h)" value={arrival} onChange={setArrival} min={2} max={20} />
      <Slider label="Service rate μ (trucks/h/dock)" value={service} onChange={setService} min={1} max={5} />
      <Slider label="Số dock (c)" value={servers} onChange={setServers} min={2} max={12} />
      <div className={`p-3 rounded-lg border text-center ${r.stable ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
        <p className="text-[10px] text-slate-500">ρ = {r.rho} · Util {r.util}%</p>
        <p className="text-lg font-bold font-mono text-teal-400">
          {r.stable ? `Wait ~${r.wait}h` : "UNSTABLE — thêm dock"}
        </p>
      </div>
    </SimPanel>
  );
}

function SOPSim({ model }: { model: KnowledgeSimulationModel }) {
  const demand = [1200, 1350, 1500, 1800, 2200, 1900, 1600, 1400, 1500, 1700, 2000, 2400];
  const [capMult, setCapMult] = useState(1);
  const capacity = demand.map((d) => Math.round(d * capMult));
  const gap = useMemo(() => sopGap(demand, capacity), [demand, capacity]);

  return (
    <SimPanel model={model}>
      <Slider label="Capacity multiplier" value={capMult} onChange={setCapMult} min={0.7} max={1.2} step={0.05} />
      <GenericBarChart
        data={gap.map((g) => ({ month: g.month, demand: g.demand, capacity: g.capacity }))}
        xKey="month"
        bars={[
          { key: "demand", name: "Demand", color: "#3B82F6" },
          { key: "capacity", name: "Capacity", color: "#14B8A6" },
        ]}
        height={200}
      />
      <p className="text-[10px] text-red-400">
        Tháng thiếu capacity: {gap.filter((g) => g.gap > 0).map((g) => g.month).join(", ") || "Không"}
      </p>
    </SimPanel>
  );
}

function InventoryPolicySim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const [rop, setRop] = useState(p.reorderPoint ?? 200);
  const [oq, setOq] = useState(p.orderQty ?? 500);
  const [seed, setSeed] = useState(1);
  const days = 60;
  const chart = useMemo(() => {
    const rand = mulberry32(seed);
    let stock = p.initialStock ?? 1000;
    let onOrder = 0;
    let daysUntil = 0;
    const data: { day: string; stock: number }[] = [];
    let stockouts = 0;
    for (let d = 1; d <= days; d++) {
      if (daysUntil > 0) {
        daysUntil--;
        if (daysUntil === 0) stock += onOrder;
      }
      const demand = Math.max(0, (p.demandMean ?? 50) + (rand() * 2 - 1) * (p.demandStd ?? 10));
      stock -= demand;
      if (stock < 0) {
        stockouts++;
        stock = 0;
      }
      if (stock <= rop && onOrder === 0 && daysUntil === 0) {
        onOrder = oq;
        daysUntil = 7;
      }
      data.push({ day: String(d), stock: Math.round(stock) });
    }
    return { data, stockouts };
  }, [rop, oq, seed, p]);

  return (
    <SimPanel model={model}>
      <Slider label="ROP" value={rop} onChange={setRop} min={50} max={500} step={10} />
      <Slider label="Order Qty" value={oq} onChange={setOq} min={100} max={1000} step={50} />
      <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>Re-run</Button>
      <p className="text-xs text-slate-500">Stockout days: <span className="text-red-400 font-mono">{chart.stockouts}</span></p>
      <GenericLineChart data={chart.data} xKey="day" lines={[{ key: "stock", name: "Stock", color: "#8B5CF6" }]} height={160} />
    </SimPanel>
  );
}

function EOQDiscountSim({ model }: { model: KnowledgeSimulationModel }) {
  const p = model.defaultParams ?? {};
  const breaks = [
    { minQ: 1, unitPrice: 10 },
    { minQ: 500, unitPrice: 9.5 },
    { minQ: 1000, unitPrice: 9 },
    { minQ: 2000, unitPrice: 8.5 },
  ];
  const r = useMemo(
    () => eoqQuantityDiscount(p.D ?? 24000, p.S ?? 80, p.H ?? 0.22, breaks),
    [p]
  );

  return (
    <SimPanel model={model}>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-slate-900/60 border">
          <p className="text-[9px] text-slate-600">Optimal Q</p>
          <p className="font-bold text-blue-400">{r.q}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border">
          <p className="text-[9px] text-slate-600">Unit price</p>
          <p className="font-bold text-teal-400">${r.price}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border">
          <p className="text-[9px] text-slate-600">Total cost</p>
          <p className="font-bold text-emerald-400">{Math.round(r.tc).toLocaleString()}</p>
        </div>
      </div>
    </SimPanel>
  );
}

const RENDERERS: Record<string, React.ComponentType<{ model: KnowledgeSimulationModel }>> = {
  eoq: EOQSim,
  "eoq-discount": EOQDiscountSim,
  "safety-stock": SafetyStockSim,
  "service-level": ServiceLevelSim,
  "monte-carlo": MonteCarloSim,
  "abc-classify": ABCSim,
  "abc-xyz-matrix": ABCXYZSim,
  newsvendor: NewsvendorSim,
  bullwhip: BullwhipSim,
  "transport-lp": TransportLPSim,
  "forecast-mape": MAPESim,
  "carbon-transport": CarbonSim,
  "queueing-dock": QueueingSim,
  "sop-gap": SOPSim,
  "inventory-policy": InventoryPolicySim,
};

export function KnowledgeSimulator({ models }: { models: KnowledgeSimulationModel[] }) {
  if (!models.length) return null;

  return (
    <div id="simulations" className="space-y-6">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-teal-400" />
        <h3 className="text-sm font-semibold text-slate-200">
          Mô hình mô phỏng tương tác ({models.length})
        </h3>
      </div>
      {models.map((model) => {
        const Renderer = RENDERERS[model.modelType];
        if (!Renderer) return null;
        return <Renderer key={model.id} model={model} />;
      })}
    </div>
  );
}