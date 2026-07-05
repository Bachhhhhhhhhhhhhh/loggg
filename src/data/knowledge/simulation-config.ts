import type { KnowledgeSimulationModel } from "./types";

export const simulationByEntry: Record<string, KnowledgeSimulationModel[]> = {
  "supply-chain-analytics-python": [
    {
      id: "sim-abc",
      title: "Mô phỏng ABC Analysis",
      subtitle: "Pareto 80/15/5 — phân loại SKU theo giá trị",
      description:
        "Nhập hoặc random dữ liệu SKU, xem phân loại A/B/C và biểu đồ Pareto. Mô hình dựa trên cumulative consumption value.",
      modelType: "abc-classify",
      scientificNote: "ABC dựa trên phân phối lũy kế giá trị tiêu thụ: A ≤80%, B ≤95%, C còn lại (ngưỡng có thể điều chỉnh theo ngành).",
      assumptions: [
        "Giá trị = unit cost × annual demand (không dùng revenue)",
        "SKU độc lập, không có substitution",
        "Dữ liệu 12 tháng đại diện cho annualized value",
      ],
      outputs: ["Phân loại A/B/C", "% tích lũy", "Số SKU mỗi class", "Pareto chart"],
    },
    {
      id: "sim-mc",
      title: "Monte Carlo — Stockout Risk",
      subtitle: "Mô phỏng 500-2000 kịch bản nhu cầu ngẫu nhiên",
      description:
        "Chạy Monte Carlo với nhu cầu normal, ROP policy — ước lượng fill rate và phân phối ngày stockout.",
      modelType: "monte-carlo",
      scientificNote: "SS = Zσ√L với demand ~ N(μ,σ). Law of Large Numbers: n≥500 iterations cho ước lượng ổn định.",
      assumptions: [
        "Nhu cầu ngày i.i.d. normal (Box-Muller)",
        "(s,S) policy: reorder Q khi stock ≤ ROP",
        "Lead time cố định, không partial backorder",
      ],
      outputs: ["Fill rate TB", "Ngày stockout TB", "P95 stockout", "Histogram"],
      defaultParams: { iterations: 1000, days: 90, demandMean: 50, demandStd: 12, leadTime: 7, reorderPoint: 400, orderQty: 600, initialStock: 800 },
    },
  ],

  "eoq-inventory-theory": [
    {
      id: "sim-eoq",
      title: "Mô hình EOQ (Wilson)",
      subtitle: "Q* = √(2DS/H) — đường cong U total cost",
      description: "Điều chỉnh D, S, H — xem EOQ tối ưu, chi phí ordering vs holding, và độ nhạy ±20% quanh Q*.",
      modelType: "eoq",
      scientificNote: "Harris-Wilson 1913: minimize TC(Q) = (Q/2)H + (D/Q)S. ∂TC/∂Q = 0 → Q* = √(2DS/H).",
      assumptions: ["Demand constant và known", "Instant replenishment", "No quantity discount", "No stockout allowed"],
      outputs: ["Q* optimal", "Orders/year", "Avg inventory Q*/2", "TC curve"],
      defaultParams: { D: 12000, S: 50, H: 2 },
    },
    {
      id: "sim-eoq-disc",
      title: "EOQ + Chiết khấu số lượng",
      subtitle: "So sánh TC tại break points",
      description: "Mô hình quantity discount: chọn Q tại EOQ hoặc MOQ break point có total cost thấp nhất.",
      modelType: "eoq-discount",
      scientificNote: "TC = (Q/2)H + (D/Q)S + P×D. Kiểm tra Q* và mỗi breakpoint feasible.",
      assumptions: ["All-units discount", "H proportional to unit price", "No capacity constraint"],
      outputs: ["Optimal Q", "Unit price tier", "Total annual cost"],
      defaultParams: { D: 24000, S: 80, H: 0.22 },
    },
  ],

  "safety-stock-service-level": [
    {
      id: "sim-ss",
      title: "Safety Stock Calculator",
      subtitle: "SS = Z × √(Lσ²_d + d²σ²_L)",
      description: "Tính SS và ROP với demand/LT variability. So sánh demand-only vs combined formula.",
      modelType: "safety-stock",
      scientificNote: "Combined uncertainty: σ_LT = √(L·σ²_d + d²·σ²_L). Z từ inverse normal CDF (service level).",
      assumptions: ["Demand và LT independent", "Normal approximation", "Continuous review policy"],
      outputs: ["Safety stock", "ROP", "Z-score", "Days of SS"],
      defaultParams: { serviceLevel: 0.95, d: 50, sigmaD: 12, L: 14, sigmaL: 3 },
    },
    {
      id: "sim-sl-curve",
      title: "Service Level vs Inventory $",
      subtitle: "Trade-off curve — marginal cost mỗi % SL",
      description: "Xem chi phí holding tăng phi tuyến khi tăng service level 85%→99.5%.",
      modelType: "service-level",
      scientificNote: "SS tăng ~linear với Z; Z tăng nhanh ở tail distribution (98→99%).",
      assumptions: ["Unit cost và holding rate constant", "Single SKU", "LT fixed"],
      outputs: ["SS theo SL", "Annual holding $", "Marginal cost curve"],
      defaultParams: { d: 40, sigmaD: 10, L: 10, unitCost: 25, holdingRate: 0.25 },
    },
  ],

  "abc-xyz-matrix-deep-dive": [
    {
      id: "sim-abcxyz",
      title: "ABC-XYZ Matrix 9 ô",
      subtitle: "Value × Variability → chiến lược tồn kho",
      description: "Phân loại SKU vào matrix AX…CZ, đếm SKU mỗi ô, gợi ý policy.",
      modelType: "abc-xyz-matrix",
      scientificNote: "XYZ: CV = σ/μ. Ngưỡng X<0.5, Y<1.0, Z≥1.0 (có thể tune theo ngành).",
      assumptions: ["Monthly demand 12 periods", "CV excludes stockout-censored periods"],
      outputs: ["9-cell matrix counts", "SKU classification table", "Policy hint per cell"],
    },
  ],

  "demand-forecasting-fundamentals": [
    {
      id: "sim-mape",
      title: "Forecast Accuracy — MAPE & Bias",
      subtitle: "Đo và visualize forecast error",
      description: "So sánh actual vs forecast, tính MAPE, tracking bias. Demo over-forecast vs under-forecast.",
      modelType: "forecast-mape",
      scientificNote: "MAPE = (1/n)Σ|A-F|/A × 100%. Bias = Σ(F-A)/n — dương = over-forecast.",
      assumptions: ["Actual > 0 cho MAPE", "Same horizon comparison", "No weighting by revenue"],
      outputs: ["MAPE %", "Bias units", "Error by period chart"],
    },
  ],

  "collaborative-planning-cpfr": [
    {
      id: "sim-bullwhip",
      title: "Bullwhip Effect Simulator",
      subtitle: "σ²_upstream / σ²_downstream",
      description: "Mô phỏng order batching và amplification — xem bullwhip ratio giảm khi chia sẻ POS data.",
      modelType: "bullwhip",
      scientificNote: "Forrester (1961): demand signal processing, batching, price volatility gây amplification upstream.",
      assumptions: ["Retail demand AR(1) noise", "Distributor orders every N periods", "No information sharing baseline"],
      outputs: ["Bullwhip ratio", "Retail vs order time series", "Impact of batch period"],
      defaultParams: { batchPeriod: 4, orderMultiplier: 1.2 },
    },
  ],

  "python-supply-chain-optimization": [
    {
      id: "sim-lp",
      title: "Transportation Problem (2×3)",
      subtitle: "Minimize freight cost — greedy feasible solution",
      description: "Toy LP: 2 nguồn, 3 đích, cost matrix — xem flow allocation và total cost. (Educational; production dùng simplex/MIP.)",
      modelType: "transport-lp",
      scientificNote: "LP form: min Σ c_ij x_ij s.t. Σx_ij ≤ supply_i, Σx_ij ≥ demand_j, x≥0. Hitchcock 1941.",
      assumptions: ["Balanced or slack allowed", "Linear cost per unit", "Greedy heuristic for demo"],
      outputs: ["Flow matrix", "Total cost", "Utilization per source"],
    },
  ],

  "openboxes-wms": [
    {
      id: "sim-queue",
      title: "Queueing — Dock Scheduling",
      subtitle: "M/M/c model xấp xỉ",
      description: "Ước lượng thời gian chờ dock khi arrival rate và số dock thay đổi. ρ ≥ 1 → unstable.",
      modelType: "queueing-dock",
      scientificNote: "Erlang C: P(wait) khi ρ = λ/(cμ) < 1. Wq ≈ ρ/(μ(1-ρ)) simplified education model.",
      assumptions: ["Poisson arrivals", "Exponential service", "FCFS discipline", "Infinite queue capacity"],
      outputs: ["Utilization %", "Avg wait (hours)", "Stability flag"],
      defaultParams: { arrivalRate: 8, serviceRate: 2, servers: 5 },
    },
  ],

  "sop-planning": [
    {
      id: "sim-sop",
      title: "S&OP Gap Analysis",
      subtitle: "Demand vs Capacity — identify bottleneck months",
      description: "Nhập demand plan và capacity — visualize gap và utilization theo tháng.",
      modelType: "sop-gap",
      scientificNote: "Constrained planning: min(production, demand) hoặc highlight infeasible gap for executive decision.",
      assumptions: ["Monthly buckets", "Single bottleneck resource", "No inventory carry between months in this toy model"],
      outputs: ["Gap units/month", "Utilization %", "Shortage months flagged"],
    },
  ],

  "green-logistics": [
    {
      id: "sim-carbon",
      title: "Carbon Footprint Transport",
      subtitle: "CO₂ = Weight × Distance × Emission factor",
      description: "So sánh road/sea/rail/air cho cùng shipment — modal shift impact.",
      modelType: "carbon-transport",
      scientificNote: "GHG Protocol Scope 3 Cat.4. Factors ~kg CO₂/ton-km (DEFRA/IPCC approximations).",
      assumptions: ["Full load factor", "Average emission factor", "Well-to-wheel not included in toy model"],
      outputs: ["kg CO₂ per mode", "Modal comparison chart", "% reduction sea vs air"],
      defaultParams: { weightTon: 20, distanceKm: 5000 },
    },
  ],

  "inventory-policy-monte-carlo": [
    {
      id: "sim-inv-policy",
      title: "Inventory Policy Simulator",
      subtitle: "(s,S) continuous review — 90 ngày",
      description: "Mô phỏng tồn kho theo thời gian với ROP trigger — chart stock level vs demand.",
      modelType: "inventory-policy",
      scientificNote: "Base stock policy: order up to S when position ≤ s. Stochastic demand via normal draws.",
      assumptions: ["Fixed lead time", "Immediate order placement", "No lost sales tracking cost"],
      outputs: ["Stock level chart", "Stockout count", "Avg inventory"],
      defaultParams: { initialStock: 1000, reorderPoint: 200, orderQty: 500, demandMean: 50, demandStd: 10 },
    },
  ],

  "newsvendor-model": [
    {
      id: "sim-nv",
      title: "Newsvendor Model",
      subtitle: "Critical fractile Cu/(Cu+Co)",
      description: "Sản phẩm perishable/seasonal — tìm Q* tối ưu từ phân phối demand empirical.",
      modelType: "newsvendor",
      scientificNote: "Q* = F⁻¹(Cu/(Cu+Co)) where Cu = price-cost, Co = cost-salvage. Single-period model.",
      assumptions: ["Single period", "Salvage value for unsold", "No recourse", "Known demand distribution"],
      outputs: ["Critical fractile %", "Optimal Q", "Expected profit"],
      defaultParams: { cost: 40, price: 80, salvage: 10 },
    },
  ],
};