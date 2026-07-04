export interface KnowledgeFormula {
  name: string;
  expression: string;
  variables: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  subtitle: string;
  category: "Phân tích" | "Tối ưu hóa" | "Tồn kho" | "Kho bãi" | "Vận tải" | "Thương mại QT" | "Machine Learning" | "Thư viện";
  language: string;
  summary: string;
  overview: string;
  scientificBasis: string;
  keyConcepts: string[];
  applications: string[];
  methods: string[];
  formulas?: KnowledgeFormula[];
  pythonStack: string[];
  implementationNotes: string;
  relatedModuleIds: string[];
  relatedToolIds?: string[];
  codeExample?: string;
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "supply-chain-analytics-python",
    title: "Phân tích Chuỗi cung ứng với Python",
    subtitle: "ABC · EOQ · Simulation · KPI Analytics",
    category: "Phân tích",
    language: "Python",
    summary:
      "Bộ phương pháp phân tích định lượng cho chuỗi cung ứng: phân loại ABC, mô hình EOQ, mô phỏng Monte Carlo và dashboard KPI.",
    overview:
      "Đây là nền tảng kiến thức cốt lõi của LogIQ về phân tích supply chain bằng Python. Nội dung bao gồm xử lý dữ liệu SKU, phân loại theo nguyên tắc Pareto, tính toán chi phí tồn kho tối ưu, và mô phỏng stochastic để đánh giá rủi ro stockout.",
    scientificBasis:
      "Dựa trên Operations Research và Inventory Theory cổ điển (Harris EOQ 1913, Pareto 80/20). Phương pháp kết hợp descriptive analytics (ABC) với prescriptive analytics (EOQ) và simulation-based analysis (Monte Carlo) để xử lý uncertainty trong nhu cầu.",
    keyConcepts: [
      "ABC Analysis (phân loại theo giá trị tích lũy)",
      "Pareto Chart (biểu đồ histogram + đường cumulative)",
      "EOQ — Economic Order Quantity",
      "Safety Stock & Service Level",
      "Monte Carlo Inventory Simulation",
    ],
    applications: [
      "Phân loại 10.000+ SKU theo giá trị hàng năm",
      "Xác định số lượng đặt hàng tối ưu giảm 15-25% chi phí tồn kho",
      "Đánh giá xác suất stockout dưới các kịch bản nhu cầu",
      "Xây dựng KPI dashboard: OTD, Fill Rate, Inventory Turnover",
    ],
    methods: [
      "Pandas DataFrame sorting & cumulative sum",
      "NumPy vectorized computation",
      "Matplotlib/Seaborn visualization",
      "Stochastic simulation với phân phối chuẩn",
    ],
    formulas: [
      {
        name: "EOQ",
        expression: "Q* = √(2DS/H)",
        variables: "D: nhu cầu/năm, S: chi phí đặt hàng, H: chi phí lưu kho/đơn vị/năm",
      },
      {
        name: "Safety Stock",
        expression: "SS = Z × σ_d × √L",
        variables: "Z: hệ số service level, σ_d: độ lệch chuẩn nhu cầu, L: lead time",
      },
      {
        name: "ABC Threshold",
        expression: "Class A: cumulative ≤ 80%, B: ≤ 95%, C: > 95%",
        variables: "Phân loại theo % giá trị tích lũy",
      },
    ],
    pythonStack: ["pandas", "numpy", "matplotlib", "scipy.stats"],
    implementationNotes:
      "Luôn chuẩn hóa dữ liệu SKU trước khi phân loại ABC. Với EOQ, kiểm tra giả định: nhu cầu ổn định, chi phí cố định, không chiết khấu. Simulation cần chạy ≥1000 iterations để kết quả hội tụ.",
    relatedModuleIds: ["abc-analysis", "inventory-management"],
    relatedToolIds: ["eoq", "abc", "inventory"],
    codeExample: `import pandas as pd
import numpy as np

# ABC Analysis
def abc_classify(df, col='annual_value'):
    df = df.sort_values(col, ascending=False)
    df['cum_pct'] = df[col].cumsum() / df[col].sum() * 100
    df['class'] = df['cum_pct'].apply(
        lambda p: 'A' if p <= 80 else ('B' if p <= 95 else 'C')
    )
    return df

# EOQ
def eoq(D, S, H):
    return np.sqrt(2 * D * S / H)`,
  },
  {
    id: "python-supply-chain-optimization",
    title: "Tối ưu hóa Mạng lưới Supply Chain",
    subtitle: "Linear Programming · Network Design · Transportation",
    category: "Tối ưu hóa",
    language: "Python",
    summary:
      "Quy hoạch tuyến tính (LP) và Mixed Integer Programming (MIP) cho bài toán vận tải, thiết kế mạng lưới phân phối.",
    overview:
      "Tối ưu hóa mạng lưới là bài toán quyết định vị trí kho, luồng hàng hóa và phân bổ vận chuyển sao cho tổng chi phí logistics minimum trong khi đáp ứng ràng buộc cung-cầu và capacity.",
    scientificBasis:
      "Dựa trên Lý thuyết Quy hoạch Tuyến tính (Dantzig, 1947) và Transportation Problem. Bài toán Network Design là dạng Facility Location Problem (FLP) — NP-hard khi có biến binary (mở/đóng kho).",
    keyConcepts: [
      "Transportation Problem (bài toán vận chuyển)",
      "Facility Location Problem (FLP)",
      "Mixed Integer Linear Programming (MILP)",
      "Decision variables: flow, open/close facility",
      "Constraint: supply ≥ demand, capacity limits",
    ],
    applications: [
      "Chọn vị trí kho regional vs central distribution",
      "Phân bổ hàng từ 3 nhà máy đến 50 khách hàng",
      "Tối ưu luồng cross-docking",
      "Phân tích trade-off: chi phí cố định vs chi phí biến đổi",
    ],
    methods: [
      "scipy.optimize.linprog (Simplex/Interior Point)",
      "PuLP / OR-Tools cho MILP",
      "Sensitivity analysis trên shadow prices",
      "Graph-based network modeling",
    ],
    formulas: [
      {
        name: "LP Standard Form",
        expression: "min cᵀx  s.t.  Ax = b, x ≥ 0",
        variables: "c: cost vector, A: constraint matrix, b: RHS",
      },
      {
        name: "Transportation Balance",
        expression: "Σᵢ supplyᵢ = Σⱼ demandⱼ",
        variables: "Cân bằng tổng cung và tổng cầu",
      },
    ],
    pythonStack: ["scipy.optimize", "pulp", "networkx"],
    implementationNotes:
      "Với bài toán lớn (>100 nodes), dùng OR-Tools thay vì PuLP thuần. Luôn validate feasibility trước khi solve. Binary variables cho facility opening cần solver hỗ trợ MIP (CBC, Gurobi).",
    relatedModuleIds: ["linear-programming"],
    relatedToolIds: ["cost"],
    codeExample: `from scipy.optimize import linprog

# Transportation: 2 sources, 3 destinations
c = [4, 5, 3, 6, 8, 7]  # unit costs
A_eq = [[1,1,1,0,0,0], [0,0,0,1,1,1],
        [1,0,0,1,0,0], [0,1,0,0,1,0], [0,0,1,0,0,1]]
b_eq = [100, 150, 80, 120, 50]
result = linprog(c, A_eq=A_eq, b_eq=b_eq, method='highs')`,
  },
  {
    id: "fleetbase-tms",
    title: "Hệ thống Quản lý Vận tải (TMS)",
    subtitle: "Fleet Management · Route Optimization · Real-time Tracking",
    category: "Vận tải",
    language: "JavaScript / API",
    summary:
      "Kiến trúc và chức năng của Transportation Management System: quản lý đội xe, tối ưu tuyến, tracking đơn hàng vận chuyển.",
    overview:
      "TMS (Transportation Management System) là hệ thống phần mềm quản lý toàn bộ hoạt động vận tải: lập kế hoạch tuyến, phân công xe, theo dõi real-time, và tính chi phí vận chuyển. LogIQ tích hợp kiến thức TMS vào module Warehouse & Logistics.",
    scientificBasis:
      "TMS áp dụng Vehicle Routing Problem (VRP) và Travelling Salesman Problem (TSP) — bài toán NP-hard trong Operations Research. Các thuật toán heuristic (savings algorithm, tabu search) và metaheuristic (genetic algorithm) được dùng cho bài toán quy mô lớn.",
    keyConcepts: [
      "Vehicle Routing Problem (VRP)",
      "Last-mile delivery optimization",
      "Fleet utilization rate",
      "GPS telematics & ETA prediction",
      "Freight cost per unit (cost/km, cost/kg)",
    ],
    applications: [
      "Tối ưu 200 điểm giao hàng/ngày với 15 xe tải",
      "Giảm 20% quãng đường deadhead (xe chạy không)",
      "Real-time tracking cho khách hàng B2B",
      "Tự động tính phí vận chuyển theo zone/weight",
    ],
    methods: [
      "Route optimization (OR-Tools Routing)",
      "Geofencing & GPS waypoint matching",
      "Load consolidation algorithm",
      "Dynamic rerouting khi có sự cố",
    ],
    pythonStack: ["ortools", "folium", "geopy"],
    implementationNotes:
      "VRP cần xác định rõ loại: CVRP (capacity), VRPTW (time windows), hay MDVRP (multi-depot). Với fleet <20 xe, OR-Tools cho kết quả tốt trong <30 giây.",
    relatedModuleIds: ["warehouse-logistics"],
    codeExample: `# VRP concept với OR-Tools
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

# Tạo RoutingModel với distance matrix
# manager = pywrapcp.RoutingIndexManager(len(locations), num_vehicles, depot)
# routing = pywrapcp.RoutingModel(manager)`,
  },
  {
    id: "openboxes-wms",
    title: "Hệ thống Quản lý Kho (WMS)",
    subtitle: "Slotting · Picking · Inventory Tracking · Multi-location",
    category: "Kho bãi",
    language: "Java / Groovy",
    summary:
      "Kiến trúc Warehouse Management System: quản lý vị trí kho, wave picking, lot tracking và multi-location inventory.",
    overview:
      "WMS điều phối mọi hoạt động trong kho bãi — từ nhận hàng, put-away, storage, picking, packing đến xuất kho. Hệ thống tối ưu hóa không gian, lao động và độ chính xác inventory.",
    scientificBasis:
      "WMS dựa trên Warehouse Layout Optimization và Order Picking Problem. Slotting optimization sử dụng ABC velocity analysis — hàng xoay nhanh (A-class) đặt gần khu vực xuất kho để minimize travel distance (chiếm 50-60% thời gian picking).",
    keyConcepts: [
      "Slotting optimization (sắp xếp vị trí theo velocity)",
      "Wave planning & batch picking",
      "Lot tracking & expiry management (FEFO/FIFO)",
      "Cycle counting vs annual physical inventory",
      "Warehouse utilization rate",
    ],
    applications: [
      "Giảm 30% thời gian picking bằng slotting ABC",
      "Theo dõi lô hàng và hạn sử dụng (healthcare, F&B)",
      "Quản lý multi-warehouse với transfer orders",
      "Tích hợp barcode/RFID scanning",
    ],
    methods: [
      "ABC velocity-based slotting",
      "Pick path optimization (S-shape, Return, Midpoint)",
      "Labor productivity metrics (lines/hour, picks/hour)",
      "Inventory accuracy target ≥99.5%",
    ],
    formulas: [
      {
        name: "Picking Travel Distance",
        expression: "TD = Σ |xᵢ - xᵢ₋₁| + |yᵢ - yᵢ₋₁|",
        variables: "Tổng quãng đường di chuyển giữa các pick locations",
      },
      {
        name: "Warehouse Utilization",
        expression: "WU = (Used capacity / Total capacity) × 100%",
        variables: "Mức sử dụng không gian kho",
      },
    ],
    pythonStack: ["pandas", "numpy", "matplotlib"],
    implementationNotes:
      "Khi thiết kế WMS logic, luôn phân biệt available stock vs on-hand stock vs allocated stock. Cycle count frequency nên tỷ lệ nghịch với ABC class (A: weekly, B: monthly, C: quarterly).",
    relatedModuleIds: ["warehouse-logistics"],
    codeExample: `# Slotting score: fast movers near dock
def slotting_score(sku):
    velocity = sku['annual_picks']
    abc_class = sku['abc_class']
    weight = {'A': 3, 'B': 2, 'C': 1}[abc_class]
    return velocity * weight`,
  },
  {
    id: "google-or-tools",
    title: "Google OR-Tools",
    subtitle: "Routing · Scheduling · LP/MIP Solver",
    category: "Thư viện",
    language: "C++ / Python",
    summary:
      "Bộ công cụ tối ưu hóa mã nguồn mở của Google cho routing, scheduling và linear/mixed-integer programming.",
    overview:
      "OR-Tools là thư viện optimization production-grade, hỗ trợ VRP, CP-SAT (constraint programming), LP/MIP solver. Được dùng rộng rãi trong logistics, manufacturing scheduling và resource allocation.",
    scientificBasis:
      "Kết hợp nhiều solver: GLOP (LP), CBC (MIP), CP-SAT (constraint programming). Routing solver dùng metaheuristics: Guided Local Search, Tabu Search, Simulated Annealing.",
    keyConcepts: [
      "Constraint Programming (CP-SAT)",
      "Vehicle Routing Problem solver",
      "Linear Solver (GLOP)",
      "MIP Solver (CBC)",
      "RoutingModel & RoutingIndexManager",
    ],
    applications: [
      "Giải VRP 500+ điểm giao trong <5 phút",
      "Lập lịch sản xuất (job shop scheduling)",
      "Bin packing optimization",
      "Resource allocation trong kho",
    ],
    methods: ["ortools.linear_solver", "ortools.constraint_solver", "ortools.routing"],
    pythonStack: ["ortools"],
    implementationNotes:
      "Cài đặt: pip install ortools. Với VRP, luôn set time limit cho solver. Dùng dimension callbacks cho capacity và time windows.",
    relatedModuleIds: ["linear-programming", "warehouse-logistics"],
    relatedToolIds: ["cost"],
  },
  {
    id: "scipy-optimize",
    title: "SciPy Optimization",
    subtitle: "Linear Programming · Nonlinear Optimization",
    category: "Thư viện",
    language: "Python",
    summary:
      "Module scipy.optimize cung cấp linprog, minimize và các thuật toán tối ưu hóa cho bài toán supply chain.",
    overview:
      "SciPy là thư viện khoa học tính toán Python, module optimize hỗ trợ giải bài toán LP, QP, NLP. Phương pháp 'highs' trong linprog cho performance tốt cho bài toán vận tải cỡ trung.",
    scientificBasis:
      "linprog sử dụng HiGHS solver (dual revised simplex + interior point). Độ phức tạp: O(n³) worst case nhưng thực tế hiệu quả với sparse matrices trong transportation problems.",
    keyConcepts: [
      "linprog (linear programming)",
      "minimize (nonlinear optimization)",
      "Bounds và constraints",
      "Method: 'highs', 'simplex', 'interior-point'",
    ],
    applications: [
      "Bài toán vận chuyển 10×10 nodes",
      "Portfolio optimization cho inventory mix",
      "Parameter fitting cho demand models",
    ],
    methods: ["scipy.optimize.linprog", "scipy.optimize.minimize"],
    pythonStack: ["scipy", "numpy"],
    implementationNotes:
      "Kiểm tra result.success trước khi dùng result.x. Với A_eq, đảm bảo rank đủ (feasibility). Scale coefficients về cùng magnitude để tránh numerical issues.",
    relatedModuleIds: ["linear-programming", "inventory-management"],
    relatedToolIds: ["eoq"],
  },
  {
    id: "prophet-forecasting",
    title: "Prophet — Dự báo Time Series",
    subtitle: "Demand Forecasting · Seasonality · Holiday Effects",
    category: "Machine Learning",
    language: "Python",
    summary:
      "Mô hình dự báo chuỗi thời gian của Meta, xử lý trend, seasonality và holiday effects cho demand forecasting.",
    overview:
      "Prophet decompose time series thành 3 thành phần: trend (piecewise linear/logistic), seasonality (Fourier series), và holidays (dummy variables). Phù hợp cho demand forecasting trong SC khi có pattern theo mùa và sự kiện.",
    scientificBasis:
      "Bayesian structural time series model. Sử dụng Stan (MCMC) cho posterior estimation. Robust với missing data và outliers hơn ARIMA truyền thống.",
    keyConcepts: [
      "Additive model: y(t) = g(t) + s(t) + h(t) + ε",
      "Trend changepoints (automatic detection)",
      "Yearly/weekly seasonality (Fourier terms)",
      "Holiday effects (country-specific calendars)",
    ],
    applications: [
      "Dự báo nhu cầu hàng tuần cho 500 SKU",
      "Phát hiện trend shift sau chiến dịch marketing",
      "Dự báo có tính mùa vụ (Tết, Black Friday)",
    ],
    methods: [
      "fbprophet / prophet package",
      "Cross-validation với rolling window",
      "MAPE, RMSE evaluation metrics",
    ],
    formulas: [
      {
        name: "Prophet Decomposition",
        expression: "ŷ(t) = g(t) + Σ sᵢ(t) + Σ hⱼ(t)",
        variables: "g: trend, s: seasonality, h: holidays",
      },
      {
        name: "Forecast Accuracy",
        expression: "MAPE = (1/n) Σ |actual - forecast| / actual × 100%",
        variables: "Mean Absolute Percentage Error",
      },
    ],
    pythonStack: ["prophet", "pandas", "matplotlib"],
    implementationNotes:
      "Cần ≥2 seasons data (2 năm nếu có yearly seasonality). Đặt changepoint_prior_scale cao hơn nếu trend thay đổi nhanh. Dùng add_country_holidays('VN') cho thị trường Việt Nam.",
    relatedModuleIds: ["machine-learning"],
    codeExample: `from prophet import Prophet

df = pd.DataFrame({'ds': dates, 'y': demand})
model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
model.add_country_holidays(country_name='VN')
model.fit(df)
future = model.make_future_dataframe(periods=90)
forecast = model.predict(future)`,
  },
  {
    id: "awesome-supply-chain",
    title: "Tổng quan Hệ sinh thái Supply Chain",
    subtitle: "Framework · Standards · Best Practices",
    category: "Phân tích",
    language: "Đa ngôn ngữ",
    summary:
      "Bản đồ kiến thức toàn diện về công cụ, framework và tiêu chuẩn trong ngành supply chain management.",
    overview:
      "LogIQ tổng hợp kiến thức từ hệ sinh thái supply chain toàn cầu thành lộ trình học có hệ thống, không cần tra cứu rời rạc từng nguồn.",
    scientificBasis:
      "Dựa trên SCOR Model (Supply Chain Operations Reference) — framework chuẩn ngành gồm 6 quy trình: Plan, Source, Make, Deliver, Return, Enable. KPIs được định nghĩa theo 5 thuộc tính: Reliability, Responsiveness, Agility, Cost, Asset Management.",
    keyConcepts: [
      "SCOR Model (Plan-Source-Make-Deliver-Return-Enable)",
      "Bullwhip Effect (hiệu ứng whipsaw trong chuỗi cung ứng)",
      "Cash-to-Cash Cycle Time",
      "Perfect Order Fulfillment",
      "Supply Chain Resilience",
    ],
    applications: [
      "Benchmark KPI theo chuẩn SCOR",
      "Thiết kế end-to-end supply chain map",
      "Đánh giá maturity level của SC operations",
      "Xây dựng digital twin cho simulation",
    ],
    methods: [
      "SCOR benchmarking",
      "Value stream mapping",
      "Total Cost of Ownership (TCO) analysis",
      "Risk assessment matrix",
    ],
    formulas: [
      {
        name: "Cash-to-Cash Cycle",
        expression: "C2C = DIO + DSO - DPO",
        variables: "DIO: Days Inventory Outstanding, DSO: Days Sales Outstanding, DPO: Days Payable Outstanding",
      },
      {
        name: "Perfect Order Rate",
        expression: "POR = (Orders complete & on-time & damage-free & docs-accurate) / Total orders",
        variables: "Tỷ lệ đơn hàng hoàn hảo",
      },
    ],
    pythonStack: ["pandas", "plotly", "streamlit"],
    implementationNotes:
      "Khi xây KPI dashboard, map mỗi metric về 1 trong 5 thuộc tính SCOR. Bullwhip effect giảm bằng information sharing (POS data) và vendor-managed inventory (VMI).",
    relatedModuleIds: ["abc-analysis", "linear-programming", "inventory-management", "warehouse-logistics", "machine-learning"],
    relatedToolIds: ["eoq", "abc", "inventory", "cost"],
  },
  {
    id: "incoterms-2020",
    title: "Incoterms® 2020 — Đầy đủ 11 điều khoản",
    subtitle: "EXW · FCA · FAS · FOB · CFR · CIF · CPT · CIP · DAP · DPU · DDP",
    category: "Thương mại QT",
    language: "Quốc tế (ICC)",
    summary:
      "Bộ quy tắc thương mại quốc tế ICC gồm 11 điều khoản, 4 nhóm E/F/C/D — xác định nghĩa vụ giao hàng, chuyển rủi ro, phân bổ chi phí và chứng từ.",
    overview:
      "Incoterms® 2020 (International Commercial Terms) do Phòng Thương mại Quốc tế (ICC) ban hành, áp dụng từ 1/1/2020. Mỗi điều khoản quy định 10 nghĩa vụ người bán (A1-A10) và 10 nghĩa vụ người mua (B1-B10). LogIQ tích hợp đầy đủ 11 điều khoản với ma trận so sánh, công cụ tư vấn và 8 bài học chuyên sâu.",
    scientificBasis:
      "Dựa trên ICC Publication No. 723 Incoterms® 2020. Nguyên tắc 'two critical points' ở nhóm C: điểm chuyển rủi ro (thường sớm) khác điểm chuyển chi phí (đến đích). Phân loại theo mức độ dịch vụ: E (tối thiểu) → F → C → D (tối đa).",
    keyConcepts: [
      "11 điều khoản Incoterms 2020",
      "4 nhóm: E (EXW), F (FCA/FAS/FOB), C (CFR/CIF/CPT/CIP), D (DAP/DPU/DDP)",
      "Two critical points — Risk vs Cost transfer",
      "Sea-only: FAS, FOB, CFR, CIF",
      "All modes: EXW, FCA, CPT, CIP, DAP, DPU, DDP",
      "FCA thay FOB cho container/multimodal",
      "CIP yêu cầu ICC(A); CIF yêu cầu ICC(C) minimum",
      "DPU = DAT thay thế (seller unloading)",
      "DDP = seller cleared import",
    ],
    applications: [
      "Soạn hợp đồng mua bán quốc tế (Sales Contract)",
      "Đàm phán giá FOB/CIF/DDP với nhà cung cấp",
      "Thiết kế L/C (Letter of Credit) đúng điều khoản",
      "Tính Landed Cost và duty cho DDP",
      "Chọn điều khoản phù hợp multimodal/container",
    ],
    methods: [
      "Ma trận 11×8 obligation comparison",
      "Decision tree: transport mode → insurance → import",
      "Risk-cost timeline visualization",
      "Case study: VN exporter → EU/US buyer",
    ],
    formulas: [
      {
        name: "Landed Cost (DDP basis)",
        expression: "LC = Product + Freight + Insurance + Duty + VAT + Local delivery",
        variables: "Seller phải quote trọn DDP nếu chọn điều khoản DDP",
      },
      {
        name: "CIF Insurance minimum",
        expression: "Cover ≥ 110% × CIF invoice value",
        variables: "ICC(C) minimum cho seller theo CIF",
      },
      {
        name: "CIP Insurance minimum",
        expression: "Cover ≥ 110% × CIP invoice value, ICC(A)",
        variables: "All-risk minimum cho CIP",
      },
    ],
    pythonStack: ["pandas", "openpyxl"],
    implementationNotes:
      "Luôn ghi đủ: Incoterm + named place/port. Ví dụ: 'FOB Ho Chi Minh City, Incoterms® 2020'. Không dùng Incoterms cho quyền sở hữu hay thanh toán — chỉ giao hàng. Container tại depot: FCA không phải FOB.",
    relatedModuleIds: ["incoterms-trade", "warehouse-logistics"],
    relatedToolIds: ["incoterms"],
    codeExample: `# Incoterm selector logic
INCOTERMS_2020 = {
    'E': ['EXW'],
    'F': ['FCA', 'FAS', 'FOB'],
    'C': ['CFR', 'CIF', 'CPT', 'CIP'],
    'D': ['DAP', 'DPU', 'DDP'],
}
SEA_ONLY = {'FAS', 'FOB', 'CFR', 'CIF'}

def validate_incoterm(code, mode='sea'):
    if mode == 'multimodal' and code in SEA_ONLY:
        return 'FCA/CPT/CIP recommended'
    return 'OK'`,
  },
];

export function getKnowledgeEntry(id: string): KnowledgeEntry | undefined {
  return knowledgeBase.find((k) => k.id === id);
}

export function getKnowledgeByModule(moduleId: string): KnowledgeEntry[] {
  return knowledgeBase.filter((k) => k.relatedModuleIds.includes(moduleId));
}