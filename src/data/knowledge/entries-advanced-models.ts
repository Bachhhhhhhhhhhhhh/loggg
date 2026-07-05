import { entry } from "./helpers";
import type { KnowledgeEntry } from "./types";

export const advancedModelEntries: KnowledgeEntry[] = [
  entry({
    id: "newsvendor-model",
    title: "Mô hình Newsvendor",
    subtitle: "Single-period · Critical fractile · Perishable & Fashion",
    category: "Tồn kho",
    language: "Lý thuyết + Mô phỏng",
    difficulty: "Nâng cao",
    readingTime: "90 phút",
    tags: ["Newsvendor", "Critical fractile", "Fashion", "Perishable", "Single-period"],
    summary:
      "Mô hình tồn kho một kỳ cho sản phẩm có shelf life ngắn hoặc seasonal — tìm Q* tối ưu cân bằng shortage cost vs overage cost qua critical fractile Cu/(Cu+Co).",
    overview:
      "Newsvendor (tin báo) là mô hình kinh điển cho quyết định order quantity khi chỉ có MỘT cơ hội bán (single-period): thời trang mùa, Tết, event marketing, sản phẩm perishable.\n\nKhác EOQ (multi-period replenishment), newsvendor optimize Q* từ phân phối demand — không phải trade-off ordering/holding mà là trade-off underage vs overage. Critical fractile = Cu/(Cu+Co) xác định percentile của demand distribution.\n\nBài viết giải thích đầy đủ: derivation từ expected profit maximization, empirical vs analytical solution, multi-product newsvendor, và ứng dụng retail VN (quà Tết, áo dài mùa, F&B expiry).",
    scientificBasis:
      "Arrow-Harris-Marschak (1951), newsvendor paradigm. E[π(Q)] = ∫₀^Q [p·d - c·Q + v(Q-d)]f(d)dd + ∫_Q^∞ [p·Q - c·Q]f(d)dd. FOC → Q* = F⁻¹(Cu/(Cu+Co)). Cu = p-c (lost margin), Co = c-v (salvage loss).",
    whenToUse: "Single selling season, perishable, fashion, promo one-shot, make-to-stock trước event với không reorder.",
    whenNotToUse: "Continuous replenishment SKU staple — dùng EOQ/(s,S). Make-to-order.",
    vietnamContext:
      "Retail Tết: bánh kẹo, quà biếu, hoa — order 1 lần trước Tết, sell-through 2-3 tuần. Fashion local brand: collection 1 mùa. F&B: pastry daily production = newsvendor ngày. Salvage: giảm giá 50% hoặc donate.",
    keyConcepts: [
      "Single-period model — một cơ hội order",
      "Underage cost Cu = price - cost (lost profit)",
      "Overage cost Co = cost - salvage",
      "Critical fractile = Cu / (Cu + Co)",
      "Q* = inverse CDF of demand at fractile",
      "Salvage value v — giá trị thu hồi unsold",
      "Fill rate vs service level khác EOQ",
      "Multi-product newsvendor với budget constraint",
      "Sample average approximation từ historical demand",
      "Regret và robust newsvendor (distribution-free)",
      "Clearance pricing post-season",
      "Newsvendor network — nhiều store share inventory",
    ],
    applications: [
      "Tính Q* quà Tết từ 5 năm sell-through history",
      "Fashion buy depth cho collection Thu-Đông",
      "Bakery daily production quantity",
      "Promo stock 11.11 — one-time buy",
      "Compare Q* analytical vs empirical CDF",
    ],
    methods: [
      "Critical fractile formula",
      "Empirical CDF từ historical sales",
      "Monte Carlo profit simulation",
      "Sensitivity Cu/Co ratio",
      "Clearance price optimization",
    ],
    stepByStep: [
      "Estimate demand distribution (historical, similar product, judgment)",
      "Xác định c (cost), p (price), v (salvage)",
      "Tính Cu = p-c, Co = c-v",
      "Critical fractile = Cu/(Cu+Co)",
      "Q* = percentile demand tại fractile",
      "Simulate profit distribution cho Q* ±20%",
      "Plan salvage/clearance process",
      "Post-mortem: actual vs Q*, update distribution",
    ],
    pitfalls: [
      "Dùng EOQ cho seasonal one-shot",
      "Salvage = 0 khi thực tế có clearance",
      "Demand distribution từ biased sample (stockout censoring)",
      "Ignore constraint budget/capacity",
      "Không update distribution sau mỗi season",
    ],
    formulas: [
      { name: "Critical fractile", expression: "α* = Cu / (Cu + Co)", variables: "Cu = p-c, Co = c-v" },
      { name: "Optimal Q", expression: "Q* = F⁻¹(α*)", variables: "F = CDF demand" },
      { name: "Expected profit", expression: "E[π] = p·E[min(Q,D)] - c·Q + v·E[max(Q-D,0)]", variables: "D = random demand" },
    ],
    metrics: [
      { name: "Sell-through %", formula: "Units sold / Units ordered × 100%", benchmark: "Fashion: 70-85%", interpretation: "Cao = under-ordered; thấp = over-ordered" },
      { name: "Markdown %", formula: "Revenue lost to clearance / Total revenue", benchmark: "<15% fashion", interpretation: "Chi phí overage thực tế" },
    ],
    caseStudies: [
      {
        title: "Chuỗi bakery HCM — daily newsvendor",
        context: "120 cửa hàng, 40 SKU pastry, production 4h sáng mỗi ngày",
        challenge: "Waste 18% hoặc stockout 8% — không cân bằng",
        solution: "Newsvendor Q* theo weekday + weather, salvage internal staff meal",
        result: "Waste 9%, stockout 4%, margin +2.3pp",
      },
    ],
    faq: [
      {
        question: "Newsvendor khác EOQ thế nào?",
        answer: "EOQ: multi-period, balance ordering vs holding, reorder nhiều lần. Newsvendor: ONE order, balance shortage vs overage, demand uncertain distribution. Dùng newsvendor cho seasonal/perishable; EOQ cho staple replenishment.",
      },
      {
        question: "Không biết distribution demand?",
        answer: "Dùng empirical CDF từ historical sales cùng period (Tết năm trước, cùng weekday). Hoặc bootstrap 1000 scenarios. Minimum 2-3 seasons data.",
      },
    ],
    glossary: [
      { term: "Cu", definition: "Underage cost — margin lost khi stockout" },
      { term: "Co", definition: "Overage cost — loss khi unsold (cost - salvage)" },
      { term: "Salvage", definition: "Giá trị thu hồi hàng không bán được" },
    ],
    sections: [
      {
        id: "derivation",
        title: "Derivation từ Expected Profit",
        content: "Maximize E[π(Q)] theo Q. Trade-off: Q cao → overage risk; Q thấp → shortage risk. FOC đưa về critical fractile.",
        bullets: ["Cu high → order more (high margin product)", "Co high → order less (low salvage)", "Symmetric normal → Q* near mean"],
      },
      {
        id: "empirical",
        title: "Giải bằng Empirical CDF",
        content: "Sort historical demand, pick percentile = fractile × n. Robust khi distribution không normal.",
        bullets: ["Cần ≥30 observations", "Adjust outliers (promo, stockout)", "Combine similar stores"],
      },
    ],
    pythonStack: ["numpy", "scipy.stats", "pandas"],
    implementationNotes: "Luôn simulate profit cho Q*±20%. Document salvage assumption. Post-season update CDF.",
    relatedModuleIds: ["inventory-management"],
    relatedToolIds: ["inventory", "eoq"],
    codeExample: `from scipy.stats import norm
import numpy as np

def newsvendor_q(cost, price, salvage, mu, sigma):
    cu = price - cost
    co = cost - salvage
    fractile = cu / (cu + co)
    return norm.ppf(fractile, mu, sigma)`,
  }),

  entry({
    id: "inventory-policy-monte-carlo",
    title: "Mô phỏng Monte Carlo Chuỗi cung ứng",
    subtitle: "Stochastic inventory · Risk quantification · Policy comparison",
    category: "Phân tích",
    language: "Python + Mô phỏng",
    difficulty: "Nâng cao",
    readingTime: "100 phút",
    tags: ["Monte Carlo", "Simulation", "Risk", "Fill rate", "Stochastic"],
    summary:
      "Hướng dẫn đầy đủ Monte Carlo simulation cho inventory policy: ước lượng fill rate, stockout distribution, so sánh (s,S) vs ROP vs periodic review dưới uncertainty.",
    overview:
      "Khi demand và lead time không deterministic, công thức closed-form (EOQ, SS) chỉ cho point estimate — không cho risk distribution. Monte Carlo mô phỏng hàng nghìn kịch bản để quantify: P(stockout > X days), fill rate 95% CI, inventory investment range.\n\nBài viết cover thiết kế simulation experiment, random variate generation (normal, empirical bootstrap, Poisson), variance reduction, và cách present kết quả cho management (P5/P50/P95).",
    scientificBasis:
      "Law of Large Numbers: sample mean → population mean as n→∞. Monte Carlo error O(1/√n). Inventory: discrete-event simulation với review policy. Compare via paired difference (same random seed stream).",
    whenToUse: "Policy sign-off cần risk quantification, SS formula assumptions violated, multi-source uncertainty, what-if disruption.",
    whenNotToUse: "Deterministic stable SKU với closed-form đủ. Data <3 tháng.",
    vietnamContext:
      "Dùng MC validate SS trước Tết: demand ×2-3, lead time +7 ngày customs. Nhà phân phối import: simulate supplier delay scenario. Present P95 stockout cho board approval buffer budget.",
    keyConcepts: [
      "Iteration = one simulation run",
      "Random variate generation — Box-Muller, bootstrap",
      "Fill rate = met demand / total demand",
      "Cycle service level vs fill rate",
      "P5/P50/P95 inventory metrics",
      "Paired comparison — same seed",
      "Warm-up period exclusion",
      "Discrete-event simulation clock",
      "What-if scenario library",
      "Confidence interval on fill rate",
      "Variance reduction — antithetic variates",
      "Simulation vs analytical SS gap",
    ],
    applications: [
      "Validate SS formula vs MC fill rate",
      "Tết scenario: demand +150%, LT +5 days",
      "Compare ROP 400 vs 500 — stockout risk",
      "Board presentation: P95 inventory $",
      "Supplier disruption 2-week delay",
    ],
    methods: ["Python Monte Carlo loop", "NumPy vectorization", "Bootstrap demand", "Paired t-test policy diff", "Histogram + CI"],
    stepByStep: [
      "Define policy (s,S), parameters, horizon days",
      "Fit demand distribution từ history (test normality)",
      "Code simulation loop: day-by-day stock dynamics",
      "Run N≥1000 iterations, collect KPIs",
      "Compute mean, std, percentiles",
      "Compare policies with paired seeds",
      "Sensitivity tornado chart",
      "Document assumptions + present CI",
    ],
    pitfalls: [
      "<500 iterations — noisy estimates",
      "Censored demand in history",
      "No warm-up for initial stock bias",
      "Independent iterations when comparing — dùng paired",
      "Present point estimate without CI",
    ],
    formulas: [
      { name: "MC standard error", expression: "SE = σ / √n", variables: "Giảm SE cần 4× iterations" },
      { name: "Fill rate", expression: "FR = Σ min(stock,demand) / Σ demand", variables: "Per iteration, average over n" },
    ],
    metrics: [
      { name: "Fill rate CI", formula: "FR ± 1.96 × SE", benchmark: "Width <2% với n=2000", interpretation: "Precision simulation" },
    ],
    faq: [
      {
        question: "Bao nhiêu iterations đủ?",
        answer: "Minimum 500 cho rough estimate. 1000-2000 cho policy decision. 10000 nếu cần tail risk (P99). Check SE giảm khi tăng n.",
      },
    ],
    pythonStack: ["numpy", "pandas", "matplotlib", "scipy.stats"],
    implementationNotes: "Fixed seed cho reproducibility. Version control simulation code. Sensitivity one-at-a-time.",
    relatedModuleIds: ["inventory-management", "abc-analysis"],
    relatedToolIds: ["inventory", "eoq"],
  }),

  entry({
    id: "multi-echelon-inventory",
    title: "Tồn kho Đa tầng (Multi-Echelon)",
    subtitle: "DC → Store · METRIC · Pooling · Network inventory",
    category: "Tồn kho",
    language: "Lý thuyết + Framework",
    difficulty: "Nâng cao",
    readingTime: "85 phút",
    tags: ["Multi-echelon", "METRIC", "DC", "Retail", "Pooling"],
    summary:
      "Tối ưu tồn kho khi có nhiều tầng (factory → DC → store): hiệu ứng pooling, METRIC heuristic, và trade-off centralization vs responsiveness.",
    overview:
      "Đa số chuỗi cung ứng có ≥2 echelon inventory: central DC và retail stores. Optimize từng tầng riêng (local optimization) dẫn đến double-counting safety stock — total inventory cao hơn cần thiết.\n\nMulti-echelon inventory theory (Clark-Scarf, Graves-Williams) chứng minh risk pooling: gộp SS ở upstream giảm total SS cùng service level. METRIC (Multi-Echelon Technique for Recoverable Item Control) là heuristic phổ biến industry.",
    scientificBasis:
      "Risk pooling: Var(ΣX_i) < Σ Var(X_i) khi aggregate. Echelon stock = stock tại node + downstream pipeline. Service level có thể define per-echelon hoặc system-wide.",
    whenToUse: "Network ≥2 tiers, nhiều store share DC, high total SS $, DRP/S&OP planning.",
    whenNotToUse: "Single warehouse DSD to customer. Independent stores không share inventory.",
    vietnamContext:
      "Chuỗi retail VN: 1 DC BD phục vụ 50-200 store. E-commerce hub + micro-fulfillment. Pooling giảm SS 15-30% vs store-level SS riêng.",
    keyConcepts: [
      "Echelon — tầng trong network",
      "Echelon stock position",
      "Risk pooling / inventory aggregation",
      "METRIC heuristic",
      "Installation vs system service level",
      "DC replenishment vs store replenishment",
      "Virtual pooling — transshipment",
      "Slow mover centralize at DC",
      "Fast mover forward deploy",
      "Pipeline inventory echelon",
      "BOM explosion multi-echelon MRP",
      "Network design impact on inventory",
    ],
    applications: [
      "Reallocate SS từ store lên DC class C SKU",
      "METRIC approx cho spare parts network",
      "Compare centralized vs regional DC",
      "Virtual pool 10 stores same city",
    ],
    methods: ["METRIC", "Echelon base-stock policy", "Simulation network", "DRP netting", "LP relaxation"],
    stepByStep: [
      "Map network nodes và lead times",
      "Define service level target (system vs local)",
      "Calculate echelon demand variance",
      "Apply METRIC hoặc simulation",
      "Set reorder points per echelon",
      "Monitor system fill rate",
      "Annual review network structure",
    ],
    pitfalls: [
      "Sum store SS independently",
      "Ignore lead time DC→store trong echelon",
      "Local SL 99% mọi store — overstock",
      "Không enable transshipment virtual pool",
    ],
    formulas: [
      { name: "Pooling variance", expression: "σ²_pooled = Σσ²_i + 2Σρ_ij σ_i σ_j", variables: "ρ=0 → max pooling benefit" },
    ],
    faq: [
      {
        question: "DC giữ SS thay store được không?",
        answer: "Có — risk pooling. DC SS cover aggregate demand uncertainty; store giữ minimal display stock. Cần fast replenishment DC→store (1-2 ngày).",
      },
    ],
    pythonStack: ["numpy", "networkx", "pandas"],
    implementationNotes: "Start 2-echelon simulation trước METRIC full. Validate system SL not just local.",
    relatedModuleIds: ["inventory-management", "warehouse-logistics"],
  }),

  entry({
    id: "dynamic-pricing-revenue",
    title: "Dynamic Pricing & Revenue Management",
    subtitle: "Markdown · Capacity allocation · Perishable capacity",
    category: "Chiến lược",
    language: "OR + Practice",
    difficulty: "Nâng cao",
    readingTime: "80 phút",
    tags: ["Pricing", "Revenue", "Markdown", "Airline", "Retail"],
    summary:
      "Revenue management và dynamic pricing cho logistics capacity và perishable retail: markdown optimization, EMSR heuristic, và ứng dụng last-mile capacity.",
    overview:
      "Revenue management (RM) ban đầu từ airline — bán cùng seat với giá khác nhau theo demand forecast và capacity. Mở rộng sang: hotel, freight capacity, retail markdown, logistics peak pricing.\n\nCore idea: fixed capacity + perishable time → price discrimination để maximize revenue. Protection levels và booking limits cho từng fare class.",
    scientificBasis:
      "Littlewood (1972) two-class model. EMSR-a/b heuristics. Dynamic programming formulation cho multi-period pricing. Markdown: salvage value decay over time.",
    whenToUse: "Fixed capacity perishable (flight, truck slot, warehouse space peak), fashion seasonal clearance.",
    whenNotToUse: "Commodity unlimited supply stable price.",
    vietnamContext: "Airlines VN domestic, logistics peak Tết surcharge, e-commerce flash sale inventory allocation.",
    keyConcepts: [
      "Fixed capacity + perishable",
      "Fare/class nesting",
      "Protection level",
      "EMSR heuristic",
      "Markdown optimization",
      "Price elasticity estimation",
      "Capacity allocation",
      "Overbooking model",
      "Revenue vs fill rate trade-off",
    ],
    applications: ["Freight peak season pricing", "Retail markdown schedule", "Warehouse slot auction peak"],
    methods: ["EMSR-b", "DP pricing", "Regression elasticity", "A/B price test"],
    stepByStep: [
      "Estimate demand by price point",
      "Define capacity constraint",
      "Set protection levels per segment",
      "Monitor booking pace",
      "Adjust price fences",
    ],
    pitfalls: ["Cannibalization high fare", "Ignore competitor price", "Overbooking không model no-show"],
    pythonStack: ["numpy", "scipy", "pandas"],
    implementationNotes: "Start 2-class Littlewood trước full network RM.",
    relatedModuleIds: ["inventory-management"],
  }),

  entry({
    id: "stochastic-optimization-sc",
    title: "Tối ưu hóa Ngẫu nhiên (Stochastic Programming)",
    subtitle: "Two-stage · Scenario · Robust optimization",
    category: "Tối ưu hóa",
    language: "Python + OR",
    difficulty: "Nâng cao",
    readingTime: "95 phút",
    tags: ["Stochastic", "Scenario", "Robust", "LP", "Uncertainty"],
    summary:
      "Mô hình hóa uncertainty trong supply chain bằng stochastic programming: two-stage recourse, scenario tree, sample average approximation (SAA).",
    overview:
      "LP deterministic assume known demand/cost — thực tế uncertain. Stochastic programming optimize first-stage decision (capacity, SS, network) considering random scenarios second-stage (recourse cost).\n\nVí dụ: mở DC location trước khi biết demand realization — minimize expected cost + penalty unmet demand.",
    scientificBasis:
      "Dantzig (1955) two-stage SP. SAA: solve increasing sample scenarios → converge optimal. Robust optimization: min-max regret trong uncertainty set.",
    whenToUse: "Strategic decisions under uncertainty (network, capacity), long lead time irreversible.",
    whenNotToUse: "Operational daily decisions với short horizon — dùng MC simulation.",
    vietnamContext: "Expand DC capacity trước khi biết e-commerce growth scenario. Import tariff uncertainty sourcing.",
    keyConcepts: [
      "First-stage vs second-stage decisions",
      "Recourse cost",
      "Scenario tree",
      "Sample Average Approximation",
      "Value of stochastic solution (VSS)",
      "Expected value of perfect information (EVPI)",
      "Robust optimization uncertainty set",
      "Chance constraints",
    ],
    applications: ["DC capacity under demand scenarios", "Sourcing mix tariff scenarios", "Fleet size demand uncertainty"],
    methods: ["SAA", "L-shaped decomposition", "Robust counterpart LP", "Scenario generation"],
    stepByStep: [
      "Identify uncertain parameters",
      "Generate scenarios (historical, expert, MC)",
      "Formulate two-stage model",
      "Solve SAA increasing N",
      "Compute VSS vs deterministic",
      "Sensitivity scenario weights",
    ],
    pitfalls: ["Too few scenarios", "Scenario tree explosion", "Ignore recourse feasibility"],
    pythonStack: ["pulp", "ortools", "numpy", "scipy"],
    implementationNotes: "VSS >5% → worth stochastic model. Document scenario provenance.",
    relatedModuleIds: ["linear-programming"],
    relatedToolIds: ["cost"],
  }),

  entry({
    id: "digital-twin-sc",
    title: "Digital Twin Chuỗi cung ứng",
    subtitle: "Simulation · Real-time sync · What-if · IoT",
    category: "Chiến lược",
    language: "Framework + Tech",
    difficulty: "Nâng cao",
    readingTime: "75 phút",
    tags: ["Digital Twin", "Simulation", "IoT", "Real-time", "Industry 4.0"],
    summary:
      "Digital twin SCM: bản sao số của network vật lý — sync real-time data, chạy what-if, optimize trước khi execute thực tế.",
    overview:
      "Digital Twin là virtual replica của supply chain physical assets (kho, xe, line sản xuất) cập nhật real-time qua IoT/ERP/WMS/TMS. Cho phép test policy changes, disruption scenarios, và predictive maintenance mà không risk physical ops.\n\nKhác simulation one-off: twin liên tục sync state và có thể closed-loop control (auto-adjust ROP từ twin forecast).",
    scientificBasis:
      "Cyber-physical systems, discrete-event simulation, state-space models. Twin fidelity levels: descriptive → predictive → prescriptive → autonomous.",
    whenToUse: "Complex network, high disruption cost, IoT infrastructure available, S&OP what-if frequent.",
    whenNotToUse: "SME simple 1-DC — Excel MC đủ. Data không sync được.",
    vietnamContext: "Manufacturing 4.0 VN pilot: factory twin + warehouse WMS feed. Logistics lớn test route disruption trên twin trước Tết.",
    keyConcepts: [
      "Physical-digital sync",
      "DES engine (AnyLogic, FlexSim)",
      "State snapshot từ WMS/TMS",
      "What-if sandbox",
      "Predictive analytics layer",
      "Closed-loop control",
      "Twin fidelity levels",
      "Master data alignment",
      "Latency và refresh rate",
    ],
    applications: ["Tết disruption what-if", "New DC layout simulation", "Route change test", "Labor planning peak"],
    methods: ["DES + API sync", "Digital thread ERP", "ML demand layer on twin"],
    stepByStep: [
      "Map physical assets → model blocks",
      "Define data feeds (API, batch)",
      "Calibrate model vs historical KPI",
      "Run validated what-if library",
      "Integrate S&OP decision workflow",
    ],
    pitfalls: ["Garbage in garbage out — bad master data", "Model không calibrate", "One-way twin không action"],
    pythonStack: ["pandas", "simpy", "networkx", "api"],
    implementationNotes: "Calibrate OTD, fill rate ±5% trước trust twin. Start descriptive twin.",
    relatedModuleIds: ["warehouse-logistics", "machine-learning"],
  }),
];