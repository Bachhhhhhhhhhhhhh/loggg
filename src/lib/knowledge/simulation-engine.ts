import { mulberry32 } from "@/lib/random";

/** EOQ Wilson + total cost curve */
export function computeEOQ(D: number, S: number, H: number) {
  const eoq = Math.sqrt((2 * D * S) / H);
  const ordering = (D / eoq) * S;
  const holding = (eoq / 2) * H;
  const curve: { q: number; ordering: number; holding: number; total: number }[] = [];
  const step = Math.max(1, Math.round(eoq * 0.08));
  for (let q = Math.max(1, Math.round(eoq * 0.15)); q <= Math.round(eoq * 2.5); q += step) {
    curve.push({
      q,
      ordering: (D / q) * S,
      holding: (q / 2) * H,
      total: (D / q) * S + (q / 2) * H,
    });
  }
  return {
    eoq,
    ordering,
    holding,
    total: ordering + holding,
    ordersPerYear: D / eoq,
    avgInventory: eoq / 2,
    curve,
  };
}

/** Z-score từ service level (xấp xỉ normal) */
const Z_TABLE: [number, number][] = [
  [0.9, 1.28],
  [0.95, 1.65],
  [0.98, 2.05],
  [0.99, 2.33],
  [0.995, 2.58],
];

export function zFromServiceLevel(sl: number): number {
  for (const [level, z] of Z_TABLE) {
    if (sl <= level) return z;
  }
  return 2.33;
}

/** Safety stock — demand random, LT fixed */
export function safetyStockDemandOnly(serviceLevel: number, sigmaD: number, leadTime: number) {
  const z = zFromServiceLevel(serviceLevel);
  const ss = z * sigmaD * Math.sqrt(leadTime);
  const rop = 50 * leadTime + ss; // assume d=50 for viz if not passed
  return { z, ss, rop };
}

export function safetyStockCombined(
  serviceLevel: number,
  d: number,
  sigmaD: number,
  L: number,
  sigmaL: number
) {
  const z = zFromServiceLevel(serviceLevel);
  const sigmaLt = Math.sqrt(L * sigmaD ** 2 + d ** 2 * sigmaL ** 2);
  const ss = z * sigmaLt;
  const rop = d * L + ss;
  return { z, ss, rop, sigmaLt };
}

/** Service level vs SS cost tradeoff curve */
export function serviceLevelCurve(d: number, sigmaD: number, L: number, unitCost: number, holdingRate: number) {
  const levels = [0.85, 0.9, 0.92, 0.95, 0.97, 0.98, 0.99, 0.995];
  return levels.map((sl) => {
    const { ss } = safetyStockCombined(sl, d, sigmaD, L, 0);
    const holdingCost = ss * unitCost * holdingRate;
    return { sl: Math.round(sl * 100), ss: Math.round(ss), holdingCost: Math.round(holdingCost) };
  });
}

/** Monte Carlo stockout simulation */
export function monteCarloInventory(opts: {
  iterations: number;
  days: number;
  demandMean: number;
  demandStd: number;
  leadTime: number;
  reorderPoint: number;
  orderQty: number;
  initialStock: number;
  seed: number;
}) {
  const rand = mulberry32(opts.seed);
  const stockoutDays: number[] = [];
  const fillRates: number[] = [];

  for (let iter = 0; iter < opts.iterations; iter++) {
    let stock = opts.initialStock;
    let stockout = 0;
    let totalDemand = 0;
    let metDemand = 0;
    let onOrder = 0;
    let daysUntilArrival = 0;

    for (let day = 0; day < opts.days; day++) {
      if (daysUntilArrival > 0) {
        daysUntilArrival--;
        if (daysUntilArrival === 0) stock += onOrder;
      }

      const u1 = rand();
      const u2 = rand();
      const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
      const demand = Math.max(0, opts.demandMean + z * opts.demandStd);
      totalDemand += demand;

      const fulfilled = Math.min(stock, demand);
      metDemand += fulfilled;
      stock -= demand;
      if (stock < 0) {
        stockout++;
        stock = 0;
      }

      if (stock <= opts.reorderPoint && onOrder === 0 && daysUntilArrival === 0) {
        onOrder = opts.orderQty;
        daysUntilArrival = opts.leadTime;
      }
    }

    stockoutDays.push(stockout);
    fillRates.push(totalDemand > 0 ? metDemand / totalDemand : 1);
  }

  const avgStockout = stockoutDays.reduce((a, b) => a + b, 0) / opts.iterations;
  const avgFill = fillRates.reduce((a, b) => a + b, 0) / opts.iterations;
  const p95Stockout = [...stockoutDays].sort((a, b) => a - b)[Math.floor(opts.iterations * 0.95)];

  const histogram = new Map<number, number>();
  for (const s of stockoutDays) {
    histogram.set(s, (histogram.get(s) ?? 0) + 1);
  }
  const histData = Array.from(histogram.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([days, count]) => ({ days: String(days), count, pct: Math.round((count / opts.iterations) * 1000) / 10 }));

  return {
    avgStockoutDays: Math.round(avgStockout * 10) / 10,
    avgFillRate: Math.round(avgFill * 1000) / 10,
    p95StockoutDays: p95Stockout,
    histData,
  };
}

/** ABC classification */
export function classifyABC(items: { sku: string; value: number }[]) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, i) => s + i.value, 0);
  let cum = 0;
  return sorted.map((item) => {
    cum += item.value;
    const pct = (cum / total) * 100;
    let cls = "C";
    if (pct <= 80) cls = "A";
    else if (pct <= 95) cls = "B";
    return { ...item, cumulativePct: Math.round(pct * 10) / 10, class: cls };
  });
}

/** ABC-XYZ matrix counts */
export function abcXyzMatrix(
  items: { sku: string; value: number; cv: number }[]
) {
  const abc = classifyABC(items.map((i) => ({ sku: i.sku, value: i.value })));
  const cvMap = new Map(items.map((i) => [i.sku, i.cv]));
  const matrix: Record<string, number> = {};
  for (const row of abc) {
    const cv = cvMap.get(row.sku) ?? 0;
    const xyz = cv < 0.5 ? "X" : cv < 1 ? "Y" : "Z";
    const key = `${row.class}${xyz}`;
    matrix[key] = (matrix[key] ?? 0) + 1;
  }
  return { classified: abc.map((r) => ({ ...r, xyz: (cvMap.get(r.sku) ?? 0) < 0.5 ? "X" : (cvMap.get(r.sku) ?? 0) < 1 ? "Y" : "Z" })), matrix };
}

/** Newsvendor critical fractile */
export function newsvendorOptimal(
  cost: number,
  price: number,
  salvage: number,
  demandSamples: number[]
) {
  const cu = price - cost;
  const co = cost - salvage;
  const critical = cu / (cu + co);
  const sorted = [...demandSamples].sort((a, b) => a - b);
  const qStar = sorted[Math.min(sorted.length - 1, Math.floor(critical * sorted.length))];
  let profit = 0;
  for (const d of demandSamples) {
    const sold = Math.min(qStar, d);
    const leftover = Math.max(0, qStar - d);
    profit += sold * price - qStar * cost + leftover * salvage;
  }
  return {
    criticalFractile: Math.round(critical * 1000) / 10,
    qStar: Math.round(qStar),
    expectedProfit: Math.round(profit / demandSamples.length),
  };
}

/** Bullwhip ratio simulation */
export function simulateBullwhip(
  retailDemand: number[],
  orderMultiplier: number,
  batchPeriod: number
) {
  const n = retailDemand.length;
  const distributorOrders: number[] = [];
  let pipeline = 0;
  for (let t = 0; t < n; t++) {
    pipeline += retailDemand[t];
    if (t % batchPeriod === 0) {
      distributorOrders.push(pipeline * orderMultiplier);
      pipeline = 0;
    } else {
      distributorOrders.push(0);
    }
  }
  const varRetail = variance(retailDemand);
  const varDist = variance(distributorOrders.filter((_, i) => i % batchPeriod === 0));
  const ratio = varDist / (varRetail || 1);
  return {
    ratio: Math.round(ratio * 100) / 100,
    retail: retailDemand.map((d, i) => ({ t: i + 1, retail: d, orders: distributorOrders[i] ?? 0 })),
  };
}

function variance(arr: number[]) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length;
}

/** Transportation LP — 2 sources × 3 destinations (toy) */
export function solveTransport2x3(
  supply: [number, number],
  demand: [number, number, number],
  costs: number[][]
) {
  // Greedy min-cost feasible (educational, not optimal simplex)
  const s = [...supply];
  const d = [...demand];
  const flows: { from: string; to: string; qty: number; cost: number }[] = [];
  let total = 0;
  const flat: { i: number; j: number; c: number }[] = [];
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 3; j++) flat.push({ i, j, c: costs[i][j] });
  flat.sort((a, b) => a.c - b.c);

  for (const { i, j, c } of flat) {
    const qty = Math.min(s[i], d[j]);
    if (qty > 0) {
      flows.push({ from: `S${i + 1}`, to: `D${j + 1}`, qty, cost: c * qty });
      total += c * qty;
      s[i] -= qty;
      d[j] -= qty;
    }
  }
  return { flows, totalCost: Math.round(total) };
}

/** MAPE calculation */
export function computeMAPE(actual: number[], forecast: number[]) {
  const n = Math.min(actual.length, forecast.length);
  const errors = [];
  for (let i = 0; i < n; i++) {
    if (actual[i] === 0) continue;
    const ape = Math.abs((actual[i] - forecast[i]) / actual[i]) * 100;
    errors.push({ period: i + 1, actual: actual[i], forecast: forecast[i], ape: Math.round(ape * 10) / 10 });
  }
  const mape = errors.reduce((s, e) => s + e.ape, 0) / errors.length;
  const bias = errors.reduce((s, e) => s + (forecast[e.period - 1] - actual[e.period - 1]), 0) / errors.length;
  return { mape: Math.round(mape * 10) / 10, bias: Math.round(bias * 10) / 10, errors };
}

/** Carbon transport */
export function transportCarbon(weightTon: number, distanceKm: number, mode: "road" | "sea" | "rail" | "air") {
  const factors = { road: 0.12, sea: 0.015, rail: 0.03, air: 0.6 };
  const kg = weightTon * distanceKm * factors[mode];
  return { kgCO2: Math.round(kg), factor: factors[mode] };
}

/** M/M/c queueing approx for dock */
export function queueingDock(arrivalRate: number, serviceRate: number, servers: number) {
  const rho = arrivalRate / (servers * serviceRate);
  if (rho >= 1) return { rho, wait: Infinity, util: 100, stable: false };
  // Erlang C approx simplified
  const util = rho * 100;
  const wait = (rho / (1 - rho)) * (1 / serviceRate);
  return {
    rho: Math.round(rho * 1000) / 1000,
    wait: Math.round(wait * 100) / 100,
    util: Math.round(util * 10) / 10,
    stable: true,
  };
}

/** S&OP gap */
export function sopGap(demand: number[], capacity: number[]) {
  const n = Math.min(demand.length, capacity.length);
  return Array.from({ length: n }, (_, i) => ({
    month: `T${i + 1}`,
    demand: demand[i],
    capacity: capacity[i],
    gap: demand[i] - capacity[i],
    utilization: Math.round((demand[i] / capacity[i]) * 1000) / 10,
  }));
}

/** EOQ with quantity discount breakpoints */
export function eoqQuantityDiscount(
  D: number,
  S: number,
  H: number,
  breaks: { minQ: number; unitPrice: number }[]
) {
  const candidates = breaks.flatMap((b) => {
    const eoq = Math.sqrt((2 * D * S) / (H * b.unitPrice / breaks[0].unitPrice));
    const q = Math.max(b.minQ, Math.round(eoq));
    const tc = (q / 2) * H + (D / q) * S + D * b.unitPrice;
    return [{ q, tc, price: b.unitPrice, minQ: b.minQ }];
  });
  candidates.sort((a, b) => a.tc - b.tc);
  return candidates[0];
}

/** Generate sample SKU data */
export function sampleSKUData(n: number, seed: number) {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, (_, i) => ({
    sku: `SKU-${String(i + 1).padStart(3, "0")}`,
    value: Math.round(500000 * Math.pow(rand(), 2.5) + 5000),
    cv: Math.round((0.2 + rand() * 1.2) * 100) / 100,
  }));
}