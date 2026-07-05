import { entry } from "./helpers";
import type { KnowledgeEntry } from "./types";

export const operationsEntries: KnowledgeEntry[] = [
  entry({
    id: "python-supply-chain-optimization",
    title: "Tối ưu hóa Mạng lưới Supply Chain",
    subtitle: "LP · MILP · Facility Location · Transportation — Toàn diện",
    category: "Tối ưu hóa",
    language: "Python",
    difficulty: "Nâng cao",
    readingTime: "55 phút",
    tags: ["LP", "MILP", "OR-Tools", "Network", "Facility Location"],
    summary:
      "Quy hoạch tuyến tính và Mixed Integer Programming cho thiết kế mạng lưới phân phối, bài toán vận tải, và quyết định mở/đóng kho.",
    overview:
      "Network optimization quyết định cấu trúc vật lý của chuỗi cung ứng: bao nhiêu kho, đặt ở đâu, hàng chảy thế nào từ nhà máy đến khách hàng. Đây là bài toán có impact lớn nhất về chi phí logistics (thường 50-70% total SC cost) nhưng cũng phức tạp nhất về mô hình hóa.",
    scientificBasis:
      "Linear Programming (Dantzig 1947), Transportation Problem (Hitchcock), Facility Location Problem (NP-hard với binary open/close). Dual prices (shadow prices) cho sensitivity: nếu tăng 1 unit demand tại node j, cost tăng bao nhiêu?",
    whenToUse: "Redesign mạng lưới (merger, expansion), thêm/bớt kho, consolidate DC, hoặc optimize flow hàng năm.",
    whenNotToUse: "Khi chỉ cần route optimization ngày (dùng VRP/TMS), hoặc data demand không đáng tin (<6 tháng).",
    vietnamContext:
      "Xu hướng hub regional tại Bình Dương, Long An cho e-commerce. Cân nhắc chi phí thuê kho VN ($3-8/m²) vs transportation cost đến 63 tỉnh.",
    keyConcepts: [
      "Transportation Problem — cân bằng supply/demand, minimize freight cost",
      "Transshipment — cho phép flow qua intermediate nodes",
      "Facility Location (FLP) — binary y_j: mở kho j hay không",
      "Fixed cost + variable cost trade-off",
      "Capacity constraints — giới hạn throughput kho và nhà máy",
      "Multi-echelon inventory optimization",
      "Shadow price / dual value cho sensitivity",
    ],
    applications: [
      "3 nhà máy → 2 DC mới → 200 khách hàng: minimize total landed cost",
      "Đóng 2 DC underutilized, mở 1 hub miền Trung",
      "Cross-dock vs storage decision",
      "Post-merger network rationalization",
    ],
    methods: ["scipy.optimize.linprog", "PuLP", "OR-Tools MIP", "Gurobi (commercial)", "NetworkX graph modeling"],
    stepByStep: [
      "Thu thập: demand by location, supply capacity, freight cost matrix, fixed cost mỗi facility",
      "Xây model: decision variables (flow x_ij, open y_j)",
      "Constraints: supply limit, demand satisfy, capacity, flow balance",
      "Solve LP (nếu không có binary) hoặc MIP",
      "Validate solution feasibility với team vận hành",
      "Sensitivity: what-if demand +20%, freight +10%",
      "Implementation roadmap",
    ],
    pitfalls: [
      "Freight cost linear assumption — thực tế có economies of scale (piecewise linear)",
      "Bỏ qua service level constraint (max distance to customer)",
      "MIP lớn không set time limit — solver chạy mãi",
      "Solution không practical (ship 0.3 pallet)",
    ],
    formulas: [
      { name: "LP Standard", expression: "min cᵀx  s.t.  Ax ≤ b, x ≥ 0", variables: "c: cost vector" },
      { name: "FLP", expression: "min Σ f_j·y_j + Σ c_ij·x_ij", variables: "y_j ∈ {0,1} mở facility j" },
      { name: "Balance", expression: "Σᵢ supplyᵢ = Σⱼ demandⱼ", variables: "Cân bằng tổng (có thể thêm slack)" },
    ],
    caseStudies: [
      {
        title: "FMCG — consolidate 5 DC xuống 3",
        context: "5 DC utilization 45-60%, overlap coverage",
        challenge: "Fixed cost $2M/năm cho DC thừa",
        solution: "MIP model với service level ≥95% within 2 ngày",
        result: "Tiết kiệm $1.2M/năm, OTD giữ 93%",
      },
    ],
    faq: [
      {
        question: "LP hay MIP?",
        answer: "LP khi chỉ optimize flow (facilities cố định). MIP khi quyết định mở/đóng kho hoặc số lượng xe nguyên (integer).",
      },
    ],
    pythonStack: ["scipy.optimize", "pulp", "ortools", "networkx"],
    implementationNotes: "Scale cost coefficients. Validate rank(A_eq). OR-Tools cho MIP >100 binary variables.",
    relatedModuleIds: ["linear-programming"],
    relatedToolIds: ["cost"],
    codeExample: `from scipy.optimize import linprog
import numpy as np

# 2 sources, 3 destinations — transportation
costs = [4,5,3, 6,8,7]
A_eq = [[1,1,1,0,0,0],[0,0,0,1,1,1],
        [1,0,0,1,0,0],[0,1,0,0,1,0],[0,0,1,0,0,1]]
b_eq = [100, 150, 80, 120, 50]
result = linprog(costs, A_eq=A_eq, b_eq=b_eq, method='highs')
print(f"Optimal cost: {result.fun:.0f}")`,
  }),

  entry({
    id: "openboxes-wms",
    title: "Hệ thống Quản lý Kho (WMS)",
    subtitle: "Inbound · Storage · Picking · Shipping — Vận hành kho chuyên nghiệp",
    category: "Kho bãi",
    language: "Concept + Practice",
    difficulty: "Trung cấp",
    readingTime: "45 phút",
    tags: ["WMS", "Picking", "Slotting", "FEFO", "Cycle Count"],
    summary:
      "Kiến trúc và vận hành WMS đầy đủ: từ nhận hàng, put-away, slotting, wave picking, đến cycle count và multi-location inventory.",
    overview:
      "WMS là 'bộ não' của kho bãi — điều phối con người, không gian, và thời gian. Một WMS tốt giảm 30-50% thời gian picking, đạt inventory accuracy ≥99.5%, và cung cấp real-time visibility. Bài viết cover toàn bộ lifecycle trong kho và best practices từng module.",
    scientificBasis:
      "Order Picking Problem (traveling salesman variant), Slotting optimization (ABC velocity), và Queueing theory cho dock scheduling. Pick path strategies: S-shape (simplest), Return, Midpoint, Largest Gap — trade-off distance vs complexity.",
    whenToUse: "Kho >1.000 m², >500 SKU active, >50 orders/ngày, hoặc accuracy <98%.",
    whenNotToUse: "Kho nhỏ <200m² với <50 SKU — Excel + barcode đơn giản đủ.",
    vietnamContext:
      "Thị trường WMS VN: SAP EWM, Oracle, local (VietFul, KiotViet warehouse module). Thuê kho 3PL tại KCN vs tự vận hành WMS.",
    keyConcepts: [
      "Inbound: ASN, receiving, QC, put-away directed",
      "Available vs On-hand vs Allocated vs ATP inventory",
      "Slotting: ABC velocity — fast movers near dock",
      "Wave planning: batch orders by route/carrier/cutoff",
      "Pick methods: discrete, batch, zone, wave",
      "FEFO/FIFO for expiry products",
      "Cycle count: ABC frequency (A weekly, C quarterly)",
      "Labor management: picks/hour, lines/hour KPI",
    ],
    applications: [
      "Giảm 35% travel distance picking bằng slotting redesign",
      "Wave release 3 lần/ngày cho e-commerce cutoff",
      "FEFO cho pharma/F&B — zero expiry shipment",
      "Multi-warehouse transfer orders",
    ],
    methods: ["ABC slotting", "Pick path algorithms", "Barcode/RFID scanning", "Labor standards (MTM)"],
    stepByStep: [
      "AS-IS process mapping (receive → store → pick → pack → ship)",
      "Define inventory statuses và business rules",
      "Slotting analysis — re-slot top 20% velocity SKUs",
      "Configure wave rules và pick strategy",
      "Cycle count program theo ABC",
      "KPI dashboard: accuracy, productivity, dock-to-stock time",
      "Continuous improvement: gemba walk hàng tuần",
    ],
    pitfalls: [
      "Nhầm available vs on-hand → oversell",
      "Không re-slot sau ABC reclassification",
      "Wave quá lớn — picker overwhelm",
      "Bỏ qua receiving QC → sai inventory từ đầu",
    ],
    formulas: [
      { name: "Inventory Accuracy", expression: "IA = (1 - |system - physical| / total) × 100%", variables: "Target ≥99.5%" },
      { name: "Pick Productivity", expression: "PP = Lines picked / Labor hours", variables: "Benchmark: 40-80 lines/hour tùy kho" },
      { name: "Dock-to-Stock", expression: "DTS = Put-away complete - Receipt time", variables: "Target <4 hours" },
    ],
    metrics: [
      { name: "Warehouse Utilization", formula: "Used pallets / Capacity", benchmark: "75-85% optimal", interpretation: ">90% = congestion risk" },
    ],
    glossary: [
      { term: "ASN", definition: "Advanced Shipping Notice — thông báo giao hàng trước từ NCC" },
      { term: "ATP", definition: "Available-to-Promise — số lượng có thể cam kết giao khách" },
    ],
    pythonStack: ["pandas", "numpy"],
    implementationNotes: "Phân biệt rõ business rules (ai được allocate, partial ship policy) trước khi config WMS.",
    relatedModuleIds: ["warehouse-logistics"],
    codeExample: `# Slotting priority score
def slot_priority(sku):
    weights = {'A': 3, 'B': 2, 'C': 1}
    return sku['annual_picks'] * weights[sku['abc_class']]`,
  }),

  entry({
    id: "fleetbase-tms",
    title: "Hệ thống Quản lý Vận tải (TMS)",
    subtitle: "VRP · Fleet · Tracking · Freight Audit — Vận tải thông minh",
    category: "Vận tải",
    language: "Concept + OR-Tools",
    difficulty: "Trung cấp",
    readingTime: "45 phút",
    tags: ["TMS", "VRP", "Routing", "Fleet", "Last-mile"],
    summary:
      "Transportation Management System: quản lý đội xe, tối ưu tuyến VRP, tracking real-time, và freight cost control.",
    overview:
      "TMS quản lý movement of goods — chiếm 40-60% logistics cost. Từ load planning, carrier selection, route optimization, đến POD (proof of delivery) và freight audit. Bài viết giải thích VRP variants và khi nào dùng heuristic vs exact solver.",
    scientificBasis:
      "Vehicle Routing Problem (Dantzig & Ramser 1959) — NP-hard. Variants: CVRP (capacity), VRPTW (time windows), MDVRP (multi-depot). Solomon benchmarks cho VRPTW. Metaheuristics: Tabu Search, Genetic Algorithm, OR-Tools Guided Local Search.",
    whenToUse: ">10 shipments/ngày, owned fleet hoặc multi-carrier, cần route optimization hoặc freight audit.",
    whenNotToUse: "Shipments thương lượng manual với 1-2 carriers cố định, volume thấp.",
    vietnamContext:
      "VN logistics fragmented — nhiều SME carriers. TMS giúp compare rate card, track container port-to-DC, và optimize giao hàng nội thành HCM/HN.",
    keyConcepts: [
      "VRP, CVRP, VRPTW, MDVRP",
      "Load consolidation & cubing",
      "Carrier rate management & tendering",
      "GPS telematics, ETA, POD",
      "Freight audit — invoice vs contract rate",
      "Mode selection: FTL vs LTL vs parcel",
      "Detention & demurrage cost",
    ],
    applications: [
      "200 stops/ngày, 12 xe — giảm 18% km",
      "Auto-select carrier by lane + cost + OTD history",
      "Customer portal tracking real-time",
      "Freight invoice audit tiết kiệm 3-5% spend",
    ],
    methods: ["OR-Tools Routing", "Geofencing", "Dynamic rerouting", "Rate engine"],
    stepByStep: [
      "Import orders + delivery windows + vehicle capacity",
      "Geocode addresses → distance/time matrix",
      "Solve VRP với constraints (capacity, time windows)",
      "Dispatch plan → driver app",
      "Track GPS → update ETA",
      "POD capture → close shipment",
      "Freight audit monthly",
    ],
    pitfalls: [
      "Matrix API cost với >500 nodes — cluster trước",
      "Không có time window thực tế → plan không execute được",
      "Bỏ qua traffic pattern giờ cao điểm",
    ],
    formulas: [
      { name: "Fleet Utilization", expression: "FU = Loaded km / Total km × 100%", variables: "Target >75%, deadhead <25%" },
      { name: "Cost per km", expression: "CPK = Total freight / Total km", variables: "Benchmark VN truck: 15-25k VND/km" },
    ],
    pythonStack: ["ortools", "folium", "geopy", "pandas"],
    implementationNotes: "VRP: set time_limit_seconds. Dùng dimension callbacks cho capacity + time. Test với 20 nodes trước khi scale.",
    relatedModuleIds: ["warehouse-logistics"],
  }),

  entry({
    id: "safety-stock-service-level",
    title: "Safety Stock & Service Level",
    subtitle: "Đáp ứng khách hàng vs Chi phí tồn kho — Cân bằng tối ưu",
    category: "Tồn kho",
    language: "Lý thuyết + Python",
    difficulty: "Trung cấp",
    readingTime: "30 phút",
    tags: ["Safety Stock", "Service Level", "Stockout", "Lead Time"],
    summary:
      "Cách tính safety stock cho các kịch bản: demand variability, lead time variability, và combined uncertainty.",
    overview:
      "Safety stock là 'buffer' bảo vệ khách hàng khỏi uncertainty. Nhưng mỗi đơn vị SS tốn tiền — bài toán là chọn service level phù hợp cho từng SKU dựa trên contribution margin và customer criticality.",
    scientificBasis:
      "Newsvendor model, base stock policy. SS = z × σ_LT where σ_LT = √(L×σ²_d + d²×σ²_L) khi cả demand và lead time đều random.",
    whenToUse: "Mọi SKU có demand hoặc lead time không deterministic.",
    whenNotToUse: "Make-to-order với lead time cam kết cố định và không giữ finished goods.",
    vietnamContext: "Lead time nhập khẩu TQ thường biến động ±7 ngày (Tết, customs) — cần σ_L cao hơn domestic.",
    keyConcepts: [
      "Cycle service level vs fill rate",
      "Z-score mapping (90%=1.28, 95%=1.65, 99%=2.33)",
      "Combined demand + lead time variability",
      "MAPE-driven safety stock for forecast-based",
      "Days of safety stock = SS / daily demand",
    ],
    applications: [
      "Tính SS cho 1.000 SKU với service target khác nhau theo ABC",
      "What-if: lead time TQ tăng 2 tuần → SS tăng bao nhiêu?",
      "Trade-off curve: service level vs inventory investment",
    ],
    methods: ["Normal approximation", "Empirical distribution simulation", "Bootstrap from history"],
    stepByStep: [
      "Tính σ_d từ historical demand (loại outlier)",
      "Estimate σ_L từ supplier delivery history",
      "Chọn service level theo ABC class",
      "Tính SS và ROP",
      "Simulation validate stockout rate",
      "Review quarterly",
    ],
    pitfalls: [
      "Dùng service level 99% cho tất cả SKU — lãng phí vốn",
      "σ_d tính trên data có stockout (biased low)",
      "Không update sau supplier change",
    ],
    formulas: [
      { name: "SS (demand only)", expression: "SS = Z × σ_d × √L", variables: "Lead time cố định" },
      { name: "SS (combined)", expression: "SS = Z × √(Lσ²_d + d²σ²_L)", variables: "Cả demand và LT random" },
    ],
    pythonStack: ["numpy", "scipy.stats", "pandas"],
    implementationNotes: "Plot service level vs SS cost curve cho management buy-in.",
    relatedModuleIds: ["inventory-management"],
    relatedToolIds: ["inventory", "eoq"],
  }),

  entry({
    id: "last-mile-delivery",
    title: "Last-Mile & Giao hàng chặng cuối",
    subtitle: "E-commerce · Urban logistics · POD · Returns",
    category: "Vận tải",
    language: "Practice",
    difficulty: "Trung cấp",
    readingTime: "35 phút",
    tags: ["Last-mile", "E-commerce", "Giao hàng", "Urban"],
    summary:
      "Chiến lược giao hàng chặng cuối: hub-spoke, micro-fulfillment, crowdshipping, và tối ưu chi phí/khách hàng experience.",
    overview:
      "Last-mile chiếm 40-50% total delivery cost nhưng là điểm chạm duy nhất khách hàng thấy. E-commerce boom VN đẩy nhu cầu giao nhanh (same-day, 2h) với chi phí kiểm soát được.",
    scientificBasis: "Urban logistics, VRP with time windows, facility location for micro-hubs. Trade-off: speed vs cost vs carbon.",
    whenToUse: "E-commerce, B2C delivery, urban dense areas.",
    whenNotToUse: "B2B pallet delivery FTL — dùng TMS standard.",
    vietnamContext:
      "Players: GHN, GHTK, Viettel Post, Grab, AhaMove. Nội thành HCM/HN: giao 2-4h. Tỉnh xa: 2-5 ngày. COD vẫn phổ biến.",
    keyConcepts: [
      "Hub-and-spoke vs point-to-point",
      "Micro-fulfillment center (MFC) trong city",
      "Delivery density — stops per km",
      "Failed delivery rate & re-attempt cost",
      "Reverse logistics / returns",
      "PUDO (pick up drop off) points",
    ],
    applications: [
      "Same-day delivery zone 10km quanh MFC",
      "Route 150 đơn/shipper/ngày urban",
      "Returns consolidation giảm 30% reverse cost",
    ],
    methods: ["Zone-based routing", "Dynamic batching", "Carrier scorecard"],
    stepByStep: [
      "Define service zones và SLA (2h, same-day, next-day)",
      "Locate MFC/dark stores",
      "Integrate carrier API hoặc own fleet VRP",
      "Track OTP (on-time pickup) và OTD",
      "Manage returns workflow",
    ],
    pitfalls: ["Over-promise SLA không execute được", "Bỏ qua failed delivery cost", "COD reconciliation errors"],
    metrics: [
      { name: "Cost per delivery", formula: "Total last-mile cost / Deliveries", benchmark: "VN e-com: 15-35k VND/đơn nội thành", interpretation: "Metric profitability driver" },
    ],
    pythonStack: ["ortools", "folium"],
    relatedModuleIds: ["warehouse-logistics"],
  }),
];