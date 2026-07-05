import { entry } from "./helpers";
import type { KnowledgeEntry } from "./types";

export const analyticsEntries: KnowledgeEntry[] = [
  entry({
    id: "supply-chain-analytics-python",
    title: "Phân tích Chuỗi cung ứng với Python",
    subtitle: "ABC · EOQ · Simulation · KPI Analytics — Hướng dẫn đầy đủ",
    category: "Phân tích",
    language: "Python",
    difficulty: "Trung cấp",
    readingTime: "45 phút",
    tags: ["ABC", "EOQ", "Pareto", "KPI", "Pandas", "Simulation"],
    summary:
      "Hệ thống phương pháp phân tích định lượng end-to-end cho SCM: từ phân loại SKU (ABC/XYZ), tối ưu đặt hàng (EOQ), mô phỏng rủi ro stockout, đến dashboard KPI theo chuẩn SCOR.",
    overview:
      "Phân tích chuỗi cung ứng bằng Python là nền tảng của quyết định dựa trên dữ liệu (data-driven) trong logistics hiện đại. Module này trình bày toàn bộ pipeline: thu thập dữ liệu SKU → làm sạch → phân loại theo giá trị (ABC) và độ biến động (XYZ) → tính EOQ và safety stock → mô phỏng Monte Carlo để đánh giá service level → trực quan hóa và theo dõi KPI. Đây là kiến thức nền tảng mà mọi Supply Chain Analyst cần nắm vững trước khi triển khai WMS, TMS hay S&OP.",
    scientificBasis:
      "Kết hợp Inventory Theory (Harris EOQ 1913, Wilson formula), Pareto Principle (80/20), và Stochastic Modeling. ABC dựa trên phân phối lũy kế (cumulative distribution); EOQ giải bài toán convex cost minimization; simulation dùng Law of Large Numbers để ước lượng xác suất stockout khi nhu cầu tuân phân phối chuẩn hoặc empirical distribution.",
    whenToUse:
      "Khi có dữ liệu lịch sử bán hàng/tiêu thụ ≥6 tháng, danh mục SKU >100 mã, cần giảm chi phí tồn kho hoặc cải thiện fill rate. Phù hợp retail, FMCG, phân phối, manufacturing có finished goods inventory.",
    whenNotToUse:
      "Không áp dụng EOQ thuần khi: nhu cầu cực kỳ biến động (fashion/seasonal one-shot), MOQ nhà cung cấp bắt buộc, hoặc sản phẩm có shelf life ngắn cần FEFO thay vì EOQ cố định.",
    vietnamContext:
      "Doanh nghiệp VN thường quản lý tồn kho bằng Excel — chuyển sang Python giúp xử lý 10.000+ SKU của chuỗi bán lẻ hoặc nhà phân phối. Lưu ý Tết Nguyên Đán: nhu cầu tăng 2-3x, cần điều chỉnh safety stock và loại bỏ seasonality trước khi chạy EOQ.",
    keyConcepts: [
      "ABC Analysis — phân loại A (80% giá trị), B (15%), C (5%) theo annual consumption value",
      "XYZ Analysis — phân loại theo coefficient of variation (CV) nhu cầu: X ổn định, Y trung bình, Z biến động",
      "ABC-XYZ Matrix — 9 ô chiến lược tồn kho (AX: kiểm soát chặt, CZ: đơn giản hóa)",
      "EOQ — Economic Order Quantity cân bằng ordering cost vs holding cost",
      "Safety Stock — SS = Z × σ × √L cho lead time và nhu cầu stochastic",
      "Reorder Point — ROP = d × L + SS",
      "Monte Carlo Simulation — mô phỏng 1000+ kịch bản nhu cầu ngẫu nhiên",
      "KPI: Fill Rate, OTD, Inventory Turnover, Days of Supply, Stockout Rate",
    ],
    applications: [
      "Phân loại 15.000 SKU chuỗi siêu thị — xác định 200 SKU class A cần kiểm kê hàng tuần",
      "Tính EOQ cho nguyên liệu nhập khẩu — giảm 18% chi phí ordering + holding",
      "Mô phỏng: nếu lead time tăng từ 14 lên 21 ngày, stockout risk tăng bao nhiêu %?",
      "Dashboard KPI hàng tuần cho ban giám đốc vận hành",
      "Kết hợp ABC velocity với slotting kho (hàng A gần dock)",
    ],
    methods: [
      "Pandas: groupby, cumsum, merge multi-source data",
      "NumPy: vectorized EOQ, safety stock cho toàn bộ SKU array",
      "SciPy.stats: norm.ppf cho Z-score service level",
      "Matplotlib/Plotly: Pareto chart, inventory simulation histogram",
      "Rolling window cross-validation cho forecast accuracy",
    ],
    stepByStep: [
      "Bước 1: Thu thập dữ liệu — SKU master, sales history, unit cost, lead time, MOQ",
      "Bước 2: Tính annual consumption value = unit cost × annual demand cho mỗi SKU",
      "Bước 3: Sắp xếp giảm dần, tính cumulative % → gán class A/B/C",
      "Bước 4: Tính CV = σ/μ nhu cầu hàng tháng → gán X/Y/Z",
      "Bước 5: Với từng SKU, tính EOQ, SS, ROP theo policy matrix",
      "Bước 6: Chạy Monte Carlo 1000 iterations, đo % stockout tại service level mục tiêu",
      "Bước 7: Visualize Pareto + KPI dashboard, review với team vận hành",
      "Bước 8: Triển khai policy — A: review hàng tuần, C: review hàng quý",
    ],
    pitfalls: [
      "Dùng revenue thay vì profit/contribution margin cho ABC — dẫn đến phân loại sai SKU margin cao",
      "Bỏ qua seasonality — EOQ tính trên nhu cầu trung bình năm sẽ under-stock mùa cao điểm",
      "Không cập nhật lead time thực tế — SS quá thấp khi supplier delay",
      "Simulation <500 iterations — kết quả không ổn định",
      "ABC tĩnh — cần re-classify ít nhất mỗi quý",
    ],
    formulas: [
      {
        name: "EOQ (Wilson Formula)",
        expression: "Q* = √(2DS/H)",
        variables: "D: nhu cầu/năm, S: chi phí đặt hàng/lần ($), H: chi phí lưu kho/đơn vị/năm ($)",
        example: "D=12000, S=50, H=2 → Q* = √(2×12000×50/2) = √600000 ≈ 775 đơn vị",
      },
      {
        name: "Safety Stock (Normal demand)",
        expression: "SS = Z × σ_d × √L",
        variables: "Z: hệ số service level (95%=1.65, 99%=2.33), σ_d: độ lệch chuẩn nhu cầu/kỳ, L: lead time (kỳ)",
      },
      {
        name: "Reorder Point",
        expression: "ROP = d̄ × L + SS",
        variables: "d̄: nhu cầu trung bình/kỳ, L: lead time, SS: safety stock",
      },
      {
        name: "ABC Threshold",
        expression: "A: cum% ≤ 80%, B: ≤ 95%, C: > 95%",
        variables: "Phân theo % giá trị tiêu thụ tích lũy",
      },
      {
        name: "Inventory Turnover",
        expression: "IT = COGS / Average Inventory Value",
        variables: "Benchmark ngành bán lẻ VN: 6-12x/năm",
      },
    ],
    metrics: [
      {
        name: "Fill Rate",
        formula: "Đơn giao đủ / Tổng đơn × 100%",
        benchmark: "≥96% (tốt), ≥99% (xuất sắc)",
        interpretation: "Đo khả năng đáp ứng nhu cầu từ tồn kho có sẵn",
      },
      {
        name: "Stockout Rate",
        formula: "SKU out-of-stock / Tổng SKU active × 100%",
        benchmark: "<2% cho class A",
        interpretation: "Tỷ lệ mã hàng hết — ảnh hưởng trực tiếp doanh thu",
      },
    ],
    caseStudies: [
      {
        title: "Nhà phân phối FMCG miền Nam — 8.000 SKU",
        context: "Doanh nghiệp phân phối đồ uống, 3 kho regional, quản lý Excel",
        challenge: "Stockout class A 12%, tồn kho class C chiếm 40% vốn",
        solution: "Triển khai ABC-XYZ matrix, EOQ + SS cho 500 SKU A/B, giảm tồn C",
        result: "Fill rate 88%→96%, inventory turnover 5.2x→7.8x trong 6 tháng",
      },
    ],
    faq: [
      {
        question: "ABC và XYZ khác nhau thế nào?",
        answer:
          "ABC phân theo GIÁ TRỊ (tiền), XYZ phân theo ĐỘ BIẾN ĐỘNG nhu cầu (predictability). Kết hợp cho chiến lược tồn kho chính xác hơn: AX cần forecast chặt + SS cao, CZ có thể order-as-needed.",
      },
      {
        question: "Service level 95% hay 99%?",
        answer:
          "95% phù hợp đa số SKU class B/C. Class A chiến lược nên 98-99%. Mỗi 1% tăng service level → SS tăng đáng kể (chi phí tồn kho). Cân bằng bằng contribution margin.",
      },
    ],
    glossary: [
      { term: "SKU", definition: "Stock Keeping Unit — mã quản lý từng biến thể sản phẩm riêng biệt" },
      { term: "COGS", definition: "Cost of Goods Sold — giá vốn hàng bán, dùng tính inventory turnover" },
      { term: "CV", definition: "Coefficient of Variation = σ/μ — đo độ biến động tương đối của nhu cầu" },
    ],
    sections: [
      {
        id: "pipeline",
        title: "Pipeline phân tích chuẩn",
        content: "Quy trình 8 bước từ raw data đến policy tồn kho:",
        bullets: [
          "Data ingestion → cleansing → ABC/XYZ → EOQ/SS → simulation → KPI → policy → monitor",
        ],
      },
    ],
    pythonStack: ["pandas", "numpy", "matplotlib", "scipy.stats", "plotly"],
    implementationNotes:
      "Chuẩn hóa đơn vị (ngày/tuần/tháng) trước khi tính. EOQ assume constant demand — điều chỉnh D theo mùa. Với MOQ > EOQ, dùng MOQ làm order quantity. Log mọi assumption trong documentation.",
    relatedModuleIds: ["abc-analysis", "inventory-management"],
    relatedToolIds: ["eoq", "abc", "inventory"],
    codeExample: `import pandas as pd
import numpy as np
from scipy.stats import norm

def abc_xyz_classify(df):
    df = df.sort_values('annual_value', ascending=False)
    df['abc'] = pd.cut(df['value_pct'].cumsum(),
        bins=[0,80,95,100], labels=['A','B','C'])
    df['xyz'] = pd.cut(df['cv'],
        bins=[0,0.5,1.0,np.inf], labels=['X','Y','Z'])
    return df

def eoq(D, S, H):
    return np.sqrt(2 * D * S / H)

def safety_stock(service_level, sigma_d, lead_time):
    z = norm.ppf(service_level)
    return z * sigma_d * np.sqrt(lead_time)`,
  }),

  entry({
    id: "eoq-inventory-theory",
    title: "Lý thuyết Tồn kho & EOQ",
    subtitle: "Từ cơ bản đến mở rộng — Q-model, P-model, Quantity Discount",
    category: "Tồn kho",
    language: "Lý thuyết + Python",
    difficulty: "Cơ bản",
    readingTime: "35 phút",
    tags: ["EOQ", "Inventory", "ROP", "Safety Stock", "Holding Cost"],
    summary:
      "Giải thích đầy đủ lý thuyết tồn kho cổ điển: mô hình EOQ, chi phí tồn kho, điểm đặt hàng lại, và các mở rộng thực tế (MOQ, chiết khấu số lượng, backorder).",
    overview:
      "Inventory Management là một trong những lĩnh vực mature nhất của Operations Research. Bài viết này giải thích từng thành phần của mô hình EOQ, tại sao đường tổng chi phí có dạng U-curve, và cách mở rộng khi giả định cổ điển không còn đúng. Hiểu sâu lý thuyết giúp bạn không chỉ 'chạy công thức' mà biết KHI NÀO công thức sai.",
    scientificBasis:
      "Harris (1913) và Wilson đề xuất EOQ dựa trên trade-off: ordering cost giảm khi order lớn (ít lần đặt), holding cost tăng khi order lớn (nhiều hàng tồn). Đạo hàm = 0 cho Q* = √(2DS/H). Mở rộng: Wagner-Whitin (dynamic lot sizing), Silver-Meal heuristic.",
    whenToUse: "Sản phẩm ổn định, chi phí đặt hàng và lưu kho xác định được, không chiết khấu số lượng phức tạp.",
    whenNotToUse: "Perishable goods, one-time orders, make-to-order với lead time ngắn, hoặc khi supplier có MOQ >> EOQ.",
    vietnamContext:
      "Nhiều NCC VN có MOQ cao (thùng/pallet) — EOQ lý thuyết nhỏ hơn MOQ thì phải order MOQ và chấp nhận holding cost cao hơn, hoặc consolidate với SKU khác.",
    keyConcepts: [
      "Holding cost (H) — lãi vốn + kho bãi + bảo hiểm + obsolescence + opportunity cost",
      "Ordering cost (S) — admin, vận chuyển inbound, receiving, quality check",
      "Total cost curve — U-shaped, minimum tại Q*",
      "Cycle inventory = Q/2 trung bình",
      "Pipeline inventory = d × L trong lead time",
      "Quantity discount model — so sánh TC tại Q*, và tại break points",
      "Production model (P-model) — EPQ khi sản xuất liên tục",
    ],
    applications: [
      "Tính order quantity tối ưu cho raw material nhập từ Trung Quốc",
      "Đánh giá trade-off: đặt hàng 2 tuần/lần vs 1 tháng/lần",
      "Phân tích impact của supplier MOQ lên total cost",
    ],
    methods: [
      "EOQ classic formula",
      "Total cost comparison at discount breakpoints",
      "EPQ = √(2DS/H(1-d/p)) với d= demand rate, p= production rate",
      "Sensitivity analysis trên S, H, D",
    ],
    stepByStep: [
      "Xác định D (nhu cầu/năm), S ($/order), H ($/unit/year)",
      "Tính Q* = √(2DS/H)",
      "Tính orders/year = D/Q*, cycle time = Q*/D",
      "Tính avg inventory = Q*/2, annual holding = (Q*/2)×H",
      "Tính annual ordering = (D/Q*)×S",
      "Tổng TC = holding + ordering (bỏ purchase cost vì constant)",
      "So sánh với MOQ thực tế — chọn max(Q*, MOQ)",
    ],
    pitfalls: [
      "Dùng purchase price thay vì holding cost rate cho H",
      "Bỏ qua inbound freight trong S",
      "EOQ quá nhỏ so với container load — nên consolidate",
    ],
    formulas: [
      {
        name: "EOQ",
        expression: "Q* = √(2DS/H)",
        variables: "D, S, H như trên",
        example: "Q*=775, 12 orders/năm, avg inventory=387 units",
      },
      {
        name: "Total Annual Cost",
        expression: "TC = (Q/2)H + (D/Q)S",
        variables: "Minimum tại Q=Q*",
      },
      {
        name: "EPQ (Production)",
        expression: "Q* = √(2DS / (H(1-d/p)))",
        variables: "p: tốc độ sản xuất, d: tốc độ tiêu thụ",
      },
    ],
    metrics: [
      {
        name: "Days of Inventory",
        formula: "(Avg Inventory / Daily Demand)",
        benchmark: "Ngành FMCG VN: 25-45 ngày",
        interpretation: "Số ngày tồn kho đủ bán — cao = vốn bị bind",
      },
    ],
    faq: [
      {
        question: "EOQ có còn relevant không?",
        answer:
          "Có — là baseline và sanity check. Trong thực tế kết hợp với min/max policy, forecast-driven ordering, và VMI. EOQ cho insight về trade-off cơ bản.",
      },
    ],
    pythonStack: ["numpy", "matplotlib"],
    implementationNotes: "Plot TC curve vs Q để visualize. Luôn annotate Q*, MOQ, và actual policy trên cùng chart.",
    relatedModuleIds: ["inventory-management"],
    relatedToolIds: ["eoq", "inventory"],
    codeExample: `import numpy as np
import matplotlib.pyplot as plt

def total_cost(Q, D, S, H):
    return (Q/2)*H + (D/Q)*S

D, S, H = 12000, 50, 2
Q_star = np.sqrt(2*D*S/H)
Qs = np.linspace(100, 2000, 100)
TCs = [total_cost(q, D, S, H) for q in Qs]
# plt.plot(Qs, TCs); plt.axvline(Q_star)`,
  }),

  entry({
    id: "kpi-scor-dashboard",
    title: "KPI & SCOR Model Dashboard",
    subtitle: "Plan · Source · Make · Deliver · Return · Enable — Đo lường toàn diện",
    category: "Phân tích",
    language: "Framework + Python",
    difficulty: "Trung cấp",
    readingTime: "40 phút",
    tags: ["SCOR", "KPI", "OTD", "Dashboard", "Benchmark"],
    summary:
      "Hướng dẫn xây dựng hệ thống KPI chuỗi cung ứng theo SCOR Model — 6 quy trình, 5 thuộc tính hiệu suất, benchmark ngành và dashboard Python.",
    overview:
      "SCOR (Supply Chain Operations Reference) là framework chuẩn toàn cầu do ASCM/APICS phát triển. Thay vì đo lường rời rạc, SCOR cung cấp taxonomy thống nhất: mọi KPI đều map về 1 trong 6 processes và 5 performance attributes. Bài viết hướng dẫn chọn KPI đúng, công thức tính, benchmark, và cách visualize trên dashboard.",
    scientificBasis:
      "SCOR dựa trên process reference model và hierarchical metrics. Level 1 metrics (strategic) cascade xuống Level 2-3 (operational). Balanced scorecard approach: không optimize 1 KPI sacrifice others (ví dụ: giảm inventory nhưng stockout tăng).",
    whenToUse: "Khi cần chuẩn hóa báo cáo SC cho board, benchmark với ngành, hoặc triển khai SC improvement program.",
    whenNotToUse: "Startup giai đoạn đầu chưa có data infrastructure — bắt đầu với 3-5 KPI cốt lõi trước.",
    vietnamContext:
      "Doanh nghiệp VN xuất khẩu nên track OTD, Perfect Order, và Customs clearance time. So sánh benchmark regional ASEAN logistics performance index.",
    keyConcepts: [
      "6 SCOR Processes: Plan, Source, Make, Deliver, Return, Enable",
      "5 Attributes: Reliability, Responsiveness, Agility, Cost, Asset Management",
      "Perfect Order Fulfillment — đơn đúng, đủ, đúng hạn, không hư, chứng từ đúng",
      "Cash-to-Cash Cycle Time — DIO + DSO - DPO",
      "Supply Chain Resilience metrics",
      "Leading vs Lagging indicators",
    ],
    applications: [
      "Dashboard hàng tuần cho COO — 10 KPI level-1",
      "Benchmark OTD 94% vs ngành 92%",
      "Root cause analysis khi Perfect Order giảm",
      "OKR mapping: team logistics → SCOR metrics",
    ],
    methods: [
      "SCOR metric hierarchy mapping",
      "Traffic light scoring (red/yellow/green vs target)",
      "Pareto analysis on order failures",
      "Streamlit/Plotly dashboard",
    ],
    stepByStep: [
      "Bước 1: Map quy trình SC hiện tại vào 6 SCOR processes",
      "Bước 2: Chọn 8-12 KPI level-1 phù hợp ngành",
      "Bước 3: Định nghĩa formula, data source, frequency cho mỗi KPI",
      "Bước 4: Set target dựa trên benchmark + strategy",
      "Bước 5: Build data pipeline (ERP → warehouse → TMS)",
      "Bước 6: Dashboard visualization + alert rules",
      "Bước 7: Monthly review + action plan cho KPI đỏ",
    ],
    pitfalls: [
      "Quá nhiều KPI (>20) — không ai theo dõi hết",
      "KPI không có owner rõ ràng",
      "Đo sai (ví dụ OTD tính từ order date thay vì promise date)",
      "Chỉ đo lagging, thiếu leading (forecast accuracy, supplier OTIF)",
    ],
    formulas: [
      {
        name: "Perfect Order Rate",
        expression: "POR = Perfect Orders / Total Orders × 100%",
        variables: "Perfect = on-time + complete + damage-free + docs-accurate",
      },
      {
        name: "Cash-to-Cash",
        expression: "C2C = DIO + DSO - DPO",
        variables: "Đo hiệu quả vốn lưu động trong chuỗi cung ứng",
      },
      {
        name: "OTD",
        expression: "OTD = On-time shipments / Total shipments × 100%",
        variables: "On-time = giao ≤ promised date",
      },
    ],
    metrics: [
      {
        name: "OTD (On-Time Delivery)",
        formula: "Giao đúng hạn / Tổng đơn",
        benchmark: "≥95% world-class, ≥92% ASEAN avg",
        interpretation: "Metric #1 cho customer satisfaction logistics",
      },
      {
        name: "Inventory Turnover",
        formula: "COGS / Avg Inventory",
        benchmark: "Retail 8-12x, Manufacturing 4-8x",
        interpretation: "Cao = vốn quay nhanh, nhưng quá cao có thể gây stockout",
      },
    ],
    pythonStack: ["pandas", "plotly", "streamlit"],
    implementationNotes: "Mỗi KPI cần: definition doc, SQL query, owner, review cadence. Dùng consistent color coding across dashboard.",
    relatedModuleIds: ["abc-analysis"],
    relatedToolIds: ["cost"],
  }),

  entry({
    id: "awesome-supply-chain",
    title: "Tổng quan Hệ sinh thái Supply Chain",
    subtitle: "SCOR · Bullwhip · Resilience · Digital Twin — Bản đồ tri thức",
    category: "Chiến lược",
    language: "Đa ngôn ngữ",
    difficulty: "Cơ bản",
    readingTime: "50 phút",
    tags: ["SCOR", "Bullwhip", "Resilience", "End-to-end", "Strategy"],
    summary:
      "Bản đồ kiến thức toàn diện về hệ sinh thái SCM: framework chuẩn, hiện tượng bullwhip, resilience, và lộ trình digitalization.",
    overview:
      "Supply Chain Management không chỉ là logistics hay kho bãi — đó là hệ thống end-to-end từ nhà cung cấp nguyên liệu đến tay người tiêu dùng cuối. Bài viết tổng hợp các framework, hiện tượng, và xu hướng quan trọng nhất mà mọi professional cần biết để có bức tranh toàn cảnh trước khi đi sâu vào từng mảng.",
    scientificBasis:
      "SCOR Model (ASCM), Forrester Effect (Bullwhip, 1961), Supply Chain Resilience theory (post-COVID), và Value Chain Analysis (Porter). TCO (Total Cost of Ownership) vs landed cost analysis.",
    whenToUse: "Onboarding nhân viên mới, thiết kế SC strategy, hoặc chuẩn bị cho SC transformation project.",
    whenNotToUse: "Khi cần technical deep-dive vào 1 bài toán cụ thể — chuyển sang module chuyên sâu.",
    vietnamContext:
      "VN là hub sản xuất + xuất khẩu: cần hiểu cả inbound (nguyên liệu TQ/Hàn) và outbound (FOB/CIF đi US/EU). CPTPP, EVFTA ảnh hưởng sourcing strategy.",
    keyConcepts: [
      "SCOR: Plan-Source-Make-Deliver-Return-Enable",
      "Bullwhip Effect — khuếch đại biến động nhu cầu lên upstream",
      "Supply Chain Resilience — absorb, adapt, recover",
      "End-to-end visibility — từ tier-2 supplier đến end customer",
      "Total Cost of Ownership (TCO) vs unit price",
      "Push vs Pull supply chain strategy",
      "Lean vs Agile vs Leagile supply chain",
    ],
    applications: [
      "Vẽ SC map cho doanh nghiệp — identify bottleneck",
      "Giảm bullwhip bằng POS data sharing với retailer",
      "Đánh giá resilience sau sự cố cầu nắng/sụp cầu",
      "TCO analysis khi chọn supplier VN vs import",
    ],
    methods: [
      "Value stream mapping (VSM)",
      "SCOR benchmarking",
      "Risk assessment matrix (probability × impact)",
      "Scenario planning (best/base/worst)",
    ],
    stepByStep: [
      "Vẽ current-state supply chain map (suppliers → factory → DC → customer)",
      "Identify pain points: cost, time, quality, risk",
      "Map metrics theo SCOR cho mỗi node",
      "Prioritize improvement projects (impact × feasibility)",
      "Design future-state với target KPI",
      "Roadmap 12-24 tháng triển khai",
    ],
    pitfalls: [
      "Optimize local thay vì end-to-end (sub-optimization)",
      "Bỏ qua tier-2 supplier risk",
      "Không tính hidden cost (quality defect, delay penalty)",
    ],
    formulas: [
      {
        name: "Bullwhip Ratio",
        expression: "BW = σ²_upstream / σ²_downstream",
        variables: "Ratio >1 = bullwhip present, càng cao càng nghiêm trọng",
      },
      {
        name: "TCO",
        expression: "TCO = Price + Logistics + Quality + Risk + Admin",
        variables: "So sánh supplier không chỉ bằng unit price",
      },
    ],
    caseStudies: [
      {
        title: "Bullwhip trong chuỗi bia nước giải khát",
        context: "Distiller → distributor → 50.000 điểm bán lẻ",
        challenge: "Distributor order biến động ±40% dù retail sales ±10%",
        solution: "CPFR, VMI cho top 20 distributors, shared POS data",
        result: "Bullwhip ratio 4.2→1.6, inventory giảm 22%",
      },
    ],
    faq: [
      {
        question: "Lean hay Agile cho chuỗi cung ứng?",
        answer:
          "Lean cho phần predictable (base demand), Agile cho phần volatile (fashion, promo). Leagile: decouple bằng strategic inventory buffer — lean upstream, agile downstream.",
      },
    ],
    pythonStack: ["pandas", "plotly", "streamlit", "networkx"],
    implementationNotes: "Bullwhip giảm bằng: (1) reduce lead time, (2) share information, (3) order batching discipline, (4) price stability.",
    relatedModuleIds: ["abc-analysis", "linear-programming", "inventory-management", "warehouse-logistics", "machine-learning"],
    relatedToolIds: ["eoq", "abc", "inventory", "cost"],
  }),
];