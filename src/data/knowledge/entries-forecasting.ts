import { entry } from "./helpers";
import type { KnowledgeEntry } from "./types";

export const forecastingEntries: KnowledgeEntry[] = [
  entry({
    id: "demand-forecasting-fundamentals",
    title: "Cơ bản Dự báo Nhu cầu",
    subtitle: "Qualitative · Quantitative · Horizon · Aggregation — Nền tảng Demand Planning",
    category: "Phân tích",
    language: "Framework + Python",
    difficulty: "Cơ bản",
    readingTime: "55 phút",
    tags: ["Forecast", "Demand Planning", "S&OP", "Baseline", "Consensus"],
    summary:
      "Hướng dẫn toàn diện về dự báo nhu cầu: phân loại phương pháp định tính/định lượng, chọn horizon phù hợp, aggregation level, và quy trình demand planning chuẩn cho doanh nghiệp VN.",
    overview:
      "Dự báo nhu cầu là đầu vào quan trọng nhất của chuỗi cung ứng — sai forecast 10% có thể khiến inventory tăng 20-30% hoặc stockout mất doanh thu. Bài viết trình bày taxonomy đầy đủ: từ judgmental forecast (sales input, Delphi) đến quantitative (time series, causal), cách chọn forecast horizon (short/medium/long), và aggregation strategy (SKU → family → category). Đây là nền tảng bắt buộc trước khi triển khai ARIMA, Prophet hay ML models.",
    scientificBasis:
      "Forecasting theory dựa trên decomposition (trend + seasonality + irregular), bias-variance tradeoff, và forecastability concept. Law of Large Numbers: aggregate demand ít biến động hơn SKU-level (coefficient of variation giảm khi gộp). Forecast error thường tuân phân phối không đối xứng — cần đo cả accuracy và bias.",
    whenToUse:
      "Mọi doanh nghiệp có inventory planning, S&OP, procurement, hoặc capacity planning. Đặc biệt khi SKU >100, nhu cầu có pattern, và cần consensus giữa sales và operations.",
    whenNotToUse:
      "Sản phẩm one-shot không lặp lại (custom project), hoặc launch hoàn toàn mới không có analog product — dùng judgmental/market research thay vì statistical baseline.",
    vietnamContext:
      "Doanh nghiệp VN thường forecast bằng Excel + kinh nghiệm sales — thiếu baseline statistical. Tết Nguyên Đán, 30/4-1/5, 2/9, 11.11, 12.12 là outliers bắt buộc. Miền Bắc/Nam có seasonality khác nhau — không aggregate blind. SME phân phối nên bắt đầu forecast ở category level rồi disaggregate xuống SKU.",
    keyConcepts: [
      "Demand Forecast vs Sales Forecast — operations cần unconstrained demand",
      "Forecast Horizon: short (0-3 tháng), medium (3-18), long (18+ tháng)",
      "Qualitative: Delphi, sales force composite, market research",
      "Quantitative: time series, causal/regression, simulation",
      "Naive forecast — baseline benchmark (F_t = A_{t-1})",
      "Moving Average — làm mượt nhiễu, lag với trend",
      "Weighted Moving Average — trọng số cao hơn cho kỳ gần",
      "Simple Exponential Smoothing — α smoothing constant",
      "Forecast aggregation — SKU → family giảm CV, tăng accuracy",
      "Disaggregation — chia forecast tổng theo historical mix ratio",
      "Forecastability segmentation — stable vs intermittent vs lumpy",
      "Consensus forecast — statistical baseline + sales override có kiểm soát",
      "Forecast frozen zone — không sửa forecast trong N tuần gần",
      "Leading indicators — POS, pipeline, macro (GDP, weather)",
      "Forecast error management — đo, review, improve liên tục",
      "Causal factors — giá, promo, competitor, weather",
    ],
    applications: [
      "Xây demand planning process cho nhà phân phối FMCG 5.000 SKU",
      "Baseline statistical + sales input cho S&OP monthly",
      "Aggregate forecast category rồi disaggregate theo regional mix",
      "Phân segment SKU theo forecastability trước khi chọn model",
      "Frozen zone 4 tuần cho production scheduling",
    ],
    methods: [
      "Time series decomposition (STL)",
      "Simple/Weighted Moving Average",
      "Exponential Smoothing family",
      "Regression với causal variables",
      "Consensus meeting workflow",
      "Forecast value add (FVA) analysis",
    ],
    stepByStep: [
      "Bước 1: Thu thập lịch sử demand sạch — loại stockout, promo outlier",
      "Bước 2: Phân tích forecastability — CV, intermittency, volume",
      "Bước 3: Chọn aggregation level phù hợp (SKU/family/region)",
      "Bước 4: Chạy baseline models (naive, MA, SES) làm benchmark",
      "Bước 5: Chọn model chính theo segment — stable dùng SES/ARIMA, intermittent dùng Croston",
      "Bước 6: Tích hợp sales/marketing input — promo, new product, channel shift",
      "Bước 7: Consensus meeting — reconcile statistical vs judgmental",
      "Bước 8: Publish forecast + frozen zone policy",
      "Bước 9: Monitor accuracy hàng tháng — MAPE, bias, FVA",
      "Bước 10: Continuous improvement — re-segment, re-model quarterly",
    ],
    pitfalls: [
      "Dùng sales order thay vì shipments/consumption — inflate forecast khi backlog",
      "Không loại stockout periods — underestimate true demand",
      "Sales override không kiểm soát — bias optimistic chronically",
      "Forecast SKU mới không có history — copy analog product sai category",
      "Không có frozen zone — production chaos vì forecast thay đổi liên tục",
      "Aggregate/disaggregate không consistent — tổng SKU ≠ forecast family",
      "Bỏ qua promo calendar — spike bị coi là trend",
    ],
    formulas: [
      {
        name: "Simple Moving Average",
        expression: "F_t = (A_{t-1} + A_{t-2} + ... + A_{t-n}) / n",
        variables: "n: số kỳ, A: actual demand",
        example: "n=3, A=[100,120,110] → F=110",
      },
      {
        name: "Simple Exponential Smoothing",
        expression: "F_t = α·A_{t-1} + (1-α)·F_{t-1}",
        variables: "α ∈ (0,1): smoothing constant, cao = phản ứng nhanh",
      },
      {
        name: "Forecast Value Add",
        expression: "FVA = Accuracy_manual - Accuracy_statistical",
        variables: "FVA > 0: sales input có giá trị; FVA < 0: nên dùng statistical",
      },
      {
        name: "Coefficient of Variation",
        expression: "CV = σ / μ",
        variables: "CV < 0.5: stable (dễ forecast), CV > 1: volatile",
      },
    ],
    metrics: [
      {
        name: "Forecast Accuracy (MAPE)",
        formula: "MAPE = (1/n)Σ|actual-forecast|/actual × 100%",
        benchmark: "A-class: <20%, B-class: <30%, C-class: <40%",
        interpretation: "Đo sai số tương đối — không dùng cho demand gần 0",
      },
      {
        name: "Forecast Bias",
        formula: "Bias = Σ(forecast - actual) / n",
        benchmark: "Gần 0 — không thiên lệch over/under",
        interpretation: "Bias dương = forecast cao → tồn kho thừa",
      },
      {
        name: "Forecast Value Add",
        formula: "FVA = MAPE_stat - MAPE_final",
        benchmark: "FVA > 0 cho strategic SKUs",
        interpretation: "Đo giá trị thêm của judgmental override",
      },
    ],
    caseStudies: [
      {
        title: "Nhà phân phối đồ uống miền Nam — 3.200 SKU",
        context: "Forecast Excel thuần, sales override 100%, không baseline statistical",
        challenge: "MAPE trung bình 45%, tồn kho class C chiếm 38% vốn, stockout class A 15%",
        solution: "Triển khai forecastability segmentation, SES baseline, consensus S&OP monthly với FVA tracking",
        result: "MAPE 45%→28%, inventory -18%, fill rate 89%→95% trong 8 tháng",
      },
      {
        title: "Chuỗi retail thời trang — 800 SKU seasonal",
        context: "2 collections/năm, high volatility, promo heavy",
        challenge: "Forecast không tách baseline vs promo lift — overstock end-of-season 30%",
        solution: "Decompose baseline + promo uplift model, aggregate size-color lên style level",
        result: "Markdown giảm 22%, forecast accuracy style-level 55%→72%",
      },
      {
        title: "Manufacturer linh kiện điện tử — B2B intermittent",
        context: "200 SKU, 40% có demand sporadic, long-term contracts",
        challenge: "Moving average fail hoàn toàn trên intermittent SKUs",
        solution: "Segment: 60% stable dùng SES, 40% intermittent chuyển Croston pipeline",
        result: "Intermittent MAPE 65%→38%, giảm emergency air freight 40%",
      },
    ],
    faq: [
      {
        question: "Forecast horizon nào quan trọng nhất?",
        answer:
          "Short-term (1-13 tuần) cho replenishment và production scheduling — accuracy yêu cầu cao nhất. Medium-term (3-12 tháng) cho S&OP, procurement, capacity. Long-term (12+ tháng) cho strategic sourcing và network design — chấp nhận error lớn hơn.",
      },
      {
        question: "Nên forecast ở level SKU hay category?",
        answer:
          "Forecast ở level có signal mạnh nhất (thường category/family), rồi disaggregate xuống SKU theo historical mix. SKU-level forecast chỉ khi có đủ volume và stability (class AX).",
      },
      {
        question: "Sales forecast hay statistical forecast?",
        answer:
          "Dùng statistical làm baseline objective, sales input cho market intelligence (competitor, new customer, promo). Consensus process reconcile hai nguồn — đo FVA để biết sales có thêm giá trị không.",
      },
      {
        question: "Bao nhiêu lịch sử cần để forecast?",
        answer:
          "Tối thiểu 2 chu kỳ mùa (24 tháng cho monthly data) để capture seasonality. Weekly data cần ≥2 năm. <12 tháng chỉ dùng naive/MA, không ARIMA/Prophet.",
      },
      {
        question: "Xử lý outlier Tết và promo thế nào?",
        answer:
          "Flag outlier periods, tính baseline riêng không gồm outliers, sau đó model promo lift = actual/baseline ratio. Prophet/ARIMA cần holiday regressor hoặc manual adjustment.",
      },
      {
        question: "Frozen zone là gì và tại sao cần?",
        answer:
          "Khoảng thời gian (thường 2-6 tuần) trước execution mà forecast không được sửa — trừ force majeure. Bảo vệ production và procurement khỏi constant firefighting.",
      },
      {
        question: "New product không có history forecast thế nào?",
        answer:
          "Dùng analog product mapping, market research, hoặc Bass diffusion model. Phase-in ramp curve thay vì flat forecast. Review weekly 8 tuần đầu.",
      },
      {
        question: "Demand forecast khác sales forecast thế nào?",
        answer:
          "Demand forecast = unconstrained true market need. Sales forecast = constrained by supply, pricing, promotion plan. Operations cần demand forecast; finance dùng sales forecast cho revenue.",
      },
      {
        question: "Khi nào dùng qualitative thay quantitative?",
        answer:
          "Khi data ít (<6 tháng), discontinuity lớn (COVID, regulatory change), hoặc strategic new market entry. Kết hợp Delphi/expert judgment với quantitative khi có thể.",
      },
      {
        question: "Forecast accuracy target bao nhiêu là đủ?",
        answer:
          "Phụ thuộc forecastability segment: AX stable SKU target MAPE 15-20%, BY 25-30%, CZ intermittent 40-50% acceptable. So sánh với naive benchmark — model phải beat naive.",
      },
      {
        question: "Làm sao giảm bullwhip từ forecast error?",
        answer:
          "Share POS data downstream-upstream, reduce order batching, shorten lead time, và dùng consensus forecast thay vì mỗi tier tự forecast riêng (CPFR).",
      },
      {
        question: "Rolling forecast hay fixed annual budget?",
        answer:
          "Rolling forecast (12-18 tháng horizon, update monthly) phản ánh thực tế tốt hơn fixed annual. S&OP best practice dùng rolling forecast reconcile với financial budget quarterly.",
      },
    ],
    glossary: [
      { term: "Consensus Forecast", definition: "Dự báo thống nhất sau khi reconcile statistical và judgmental input từ cross-functional team" },
      { term: "Forecastability", definition: "Mức độ có thể dự báo chính xác — đo bằng CV, intermittency, volume" },
      { term: "Frozen Zone", definition: "Cửa sổ thời gian forecast không được thay đổi trước execution" },
      { term: "Disaggregation", definition: "Phân bổ forecast tổng xuống SKU/location theo tỷ lệ lịch sử" },
      { term: "FVA", definition: "Forecast Value Add — đo giá trị thêm của manual override so với statistical" },
    ],
    sections: [
      {
        id: "taxonomy",
        title: "Phân loại phương pháp dự báo",
        content: "Demand forecasting chia thành 4 nhóm chính theo nguồn dữ liệu và kỹ thuật:",
        bullets: [
          "Judgmental: Delphi, sales composite, executive opinion",
          "Time series: MA, ES, ARIMA, Prophet — dùng lịch sử demand",
          "Causal: regression với price, promo, weather, GDP",
          "Simulation: agent-based, system dynamics cho scenario phức tạp",
        ],
      },
      {
        id: "horizon",
        title: "Forecast Horizon và ứng dụng",
        content: "Mỗi horizon phục vụ quyết định khác nhau trong chuỗi cung ứng:",
        bullets: [
          "Short (0-3 tháng): replenishment, production schedule, labor planning",
          "Medium (3-18 tháng): S&OP, procurement contracts, capacity investment",
          "Long (18+ tháng): network design, strategic sourcing, capex",
          "Rule: horizon dài → aggregation cao → accuracy thấp hơn acceptable",
        ],
      },
      {
        id: "aggregation",
        title: "Aggregation và Disaggregation",
        content: "Chiến lược gộp/tách forecast ảnh hưởng trực tiếp accuracy:",
        bullets: [
          "Aggregate lên family/region giảm CV — forecast dễ hơn, MAPE thấp hơn",
          "Disaggregate bằng historical mix ratio hoặc planned mix",
          "Top-down: forecast tổng → chia xuống (consistent tổng)",
          "Bottom-up: forecast SKU → cộng lên (chi tiết hơn, error lớn hơn)",
          "Middle-out: forecast family → disaggregate SKU + aggregate category",
        ],
      },
      {
        id: "process",
        title: "Quy trình Demand Planning chuẩn",
        content: "Monthly demand planning cycle 5 bước cho S&OP integration:",
        bullets: [
          "Week 1: Data prep, clean, segment forecastability",
          "Week 2: Statistical baseline generation",
          "Week 3: Sales/marketing input collection",
          "Week 4: Consensus meeting + publish",
          "Ongoing: Accuracy tracking + model refresh quarterly",
        ],
      },
      {
        id: "segmentation",
        title: "Forecastability Segmentation",
        content: "Phân SKU thành 4 nhóm trước khi chọn model:",
        bullets: [
          "Smooth: demand thường xuyên, CV thấp → SES, ARIMA, Prophet",
          "Erratic: demand thường xuyên, CV cao → ES với α cao, causal model",
          "Intermittent: nhiều kỳ zero → Croston, SBA, TSB",
          "Lumpy: intermittent + quantity variable → complex, judgmental + safety stock cao",
        ],
      },
      {
        id: "consensus",
        title: "Consensus Forecast và FVA",
        content: "Quy trình reconcile statistical và judgmental có kiểm soát:",
        bullets: [
          "Statistical baseline = objective anchor",
          "Sales override cần documented reason (promo, new account, competitor)",
          "FVA tracking: nếu manual override làm MAPE tệ hơn → revert statistical",
          "Executive S&OP approve final consensus numbers",
        ],
      },
      {
        id: "data-prep",
        title: "Data Preparation — 80% công việc",
        content: "Chất lượng forecast phụ thuộc chủ yếu vào data cleansing:",
        bullets: [
          "Loại stockout periods — impute true demand nếu có thể",
          "Flag promo spikes — tách baseline vs uplift",
          "Handle returns, cancellations, partial shipments",
          "Align fiscal calendar vs Gregorian (Tết shift yearly)",
          "Consistent UOM và aggregation rules",
        ],
      },
      {
        id: "tools",
        title: "Công cụ và Technology Stack",
        content: "Lộ trình công cụ theo maturity:",
        bullets: [
          "Level 1: Excel + Python baseline (SME)",
          "Level 2: Statistical engine (statsforecast, Prophet) + ERP integration",
          "Level 3: Commercial APS (Kinaxis, o9, Anaplan) với ML",
          "Level 4: Real-time demand sensing từ POS/IoT",
        ],
      },
    ],
    pythonStack: ["pandas", "numpy", "statsmodels", "matplotlib", "scikit-learn"],
    implementationNotes:
      "Luôn benchmark với naive forecast. Document mọi assumption (aggregation level, outlier treatment). Forecast review cadence: weekly cho A-class, monthly cho B/C. Tích hợp promo calendar vào data pipeline.",
    relatedModuleIds: ["machine-learning", "inventory-management", "abc-analysis"],
    relatedToolIds: ["inventory", "abc"],
    codeExample: `import pandas as pd
import numpy as np

def forecastability_segment(df):
    """Phân segment SKU theo CV và intermittency."""
    cv = df['std_demand'] / df['mean_demand']
    intermittency = (df['zero_periods'] / df['total_periods'])
    conditions = [
        (intermittency < 0.1) & (cv < 0.5),
        (intermittency < 0.1) & (cv >= 0.5),
        (intermittency >= 0.1) & (cv < 1.0),
        (intermittency >= 0.1) & (cv >= 1.0),
    ]
    labels = ['smooth', 'erratic', 'intermittent', 'lumpy']
    df['segment'] = np.select(conditions, labels, default='unknown')
    return df

def simple_exp_smooth(series, alpha=0.3):
    """Simple Exponential Smoothing."""
    forecast = [series.iloc[0]]
    for i in range(1, len(series)):
        f = alpha * series.iloc[i-1] + (1 - alpha) * forecast[-1]
        forecast.append(f)
    return forecast

def disaggregate(family_forecast, sku_mix):
    """Chia forecast family xuống SKU theo mix ratio."""
    return {sku: family_forecast * ratio for sku, ratio in sku_mix.items()}`,
  }),

  entry({
    id: "abc-xyz-matrix-deep-dive",
    title: "Ma trận ABC-XYZ — Phân tích Sâu",
    subtitle: "9 ô chiến lược · Policy matrix · Service level · Review frequency",
    category: "Tồn kho",
    language: "Phân tích + Python",
    difficulty: "Trung cấp",
    readingTime: "50 phút",
    tags: ["ABC", "XYZ", "Inventory Policy", "Segmentation", "Service Level"],
    summary:
      "Phân tích chuyên sâu ma trận ABC-XYZ 9 ô: cách tính, ngưỡng chuẩn, policy tồn kho cho từng ô, service level, review frequency, và tích hợp với forecasting strategy.",
    overview:
      "ABC-XYZ là công cụ segmentation mạnh nhất trong inventory management — kết hợp GIÁ TRỊ (ABC) và ĐỘ DỰ ĐOÁN (XYZ) để gán policy khác nhau cho 9 nhóm SKU. Thay vì áp dụng EOQ và safety stock đồng nhất, ma trận cho phép: AX kiểm soát chặt + forecast chính xác, CZ đơn giản hóa + safety stock tối thiểu. Bài viết đi sâu vào calculation, threshold tuning, và policy matrix thực tế.",
    scientificBasis:
      "ABC dựa trên Pareto Principle (Lorenz curve, cumulative value distribution). XYZ dùng Coefficient of Variation (CV = σ/μ) — measure of relative variability. Kết hợp tạo 2-dimensional segmentation matrix. Inventory theory: service level và safety stock nên proportional với value và inversely proportional với forecastability.",
    whenToUse:
      "Danh mục SKU >200, cần differentiate inventory policy, hoặc muốn prioritize improvement effort (forecast, slotting, cycle count).",
    whenNotToUse:
      "Danh mục <50 SKU đồng nhất — overhead segmentation không justify. Hoặc khi tất cả SKU đều make-to-order.",
    vietnamContext:
      "Nhà phân phối VN thường chỉ làm ABC, bỏ qua XYZ — dẫn đến over-invest class A volatile (AZ). Retail VN: class A seasonal (Tết) cần re-classify quarterly. Manufacturing: raw material AZ cần dual sourcing + higher SS.",
    keyConcepts: [
      "ABC — phân theo annual consumption VALUE (không phải volume)",
      "XYZ — phân theo demand VARIABILITY (CV hoặc forecast error)",
      "9-cell matrix: AX, AY, AZ, BX, BY, BZ, CX, CY, CZ",
      "AX: high value + stable → tight control, high service level 98-99%",
      "AZ: high value + volatile → high SS, forecast effort, dual source",
      "CZ: low value + volatile → simplify, low SS, order-as-needed",
      "Policy matrix: service level × review frequency × forecast method",
      "Cycle count frequency theo ABC: A weekly, B monthly, C quarterly",
      "Slotting priority: AX near dock, CZ far/bulk",
      "Safety stock multiplier theo XYZ: X=1.0, Y=1.3, Z=1.8",
      "MOQ override cho class C — consolidate orders",
      "Re-classification cadence: quarterly minimum",
      "Multi-criteria ABC: value + margin + strategic importance",
      "XYZ alternatives: forecast error MAPE thay CV",
      "ABC-XYZ + FSN (Fast/Slow/Non-moving) extension",
      "Inventory investment allocation theo matrix",
    ],
    applications: [
      "Gán service level 99% cho AX, 95% cho BY, 90% cho CZ",
      "Forecast method mapping: AX→ARIMA, AZ→Prophet+causal, CZ→Croston",
      "Slotting redesign: top 20% AX SKUs trong golden zone",
      "Cycle count program: A=weekly, B=monthly, C=quarterly",
      "Purchasing priority: AZ dual-source, CX single-source OK",
    ],
    methods: [
      "Pareto analysis cumulative %",
      "CV calculation per SKU rolling 12 months",
      "Policy matrix assignment",
      "Monte Carlo SS simulation per cell",
      "Heatmap visualization 9-cell",
    ],
    stepByStep: [
      "Bước 1: Tính annual consumption value = unit cost × annual qty mỗi SKU",
      "Bước 2: Sort descending, cumulative % → A: ≤80%, B: ≤95%, C: >95%",
      "Bước 3: Tính CV = σ/μ demand hàng tháng (12 tháng rolling)",
      "Bước 4: Gán XYZ: X CV<0.5, Y 0.5-1.0, Z >1.0",
      "Bước 5: Merge ABC + XYZ → 9-cell matrix",
      "Bước 6: Assign policy: service level, SS multiplier, review freq, forecast method",
      "Bước 7: Calculate EOQ/SS/ROP per cell policy",
      "Bước 8: Visualize heatmap + validate với team vận hành",
      "Bước 9: Implement + monitor KPI per cell",
      "Bước 10: Re-classify quarterly",
    ],
    pitfalls: [
      "Dùng revenue thay contribution margin — misclassify low-margin high-revenue SKU",
      "XYZ threshold cố định cho mọi ngành — cần calibrate",
      "Không re-classify — SKU migrate giữa cells theo thời gian",
      "ABC theo toàn công ty thay vì per warehouse/region",
      "Bỏ qua AZ — high value volatile cần attention nhất",
      "Policy matrix quá phức tạp — team không follow",
    ],
    formulas: [
      {
        name: "Annual Consumption Value",
        expression: "ACV = Unit Cost × Annual Demand Qty",
        variables: "Basis cho ABC classification",
      },
      {
        name: "Coefficient of Variation",
        expression: "CV = σ_d / μ_d",
        variables: "σ_d: std dev monthly demand, μ_d: mean monthly demand",
      },
      {
        name: "Safety Stock với XYZ multiplier",
        expression: "SS = Z × σ × √L × M_xyz",
        variables: "M_xyz: X=1.0, Y=1.3, Z=1.8 (tunable)",
      },
      {
        name: "ABC Threshold",
        expression: "A: cum% ≤ 80%, B: ≤ 95%, C: remainder",
        variables: "Có thể adjust 70/90 cho ngành concentrated",
      },
    ],
    metrics: [
      {
        name: "Inventory Investment by Cell",
        formula: "Σ(inventory value) per ABC-XYZ cell",
        benchmark: "AX: 40-50% value in 5-10% SKUs",
        interpretation: "Kiểm tra capital allocation có match strategy",
      },
      {
        name: "Service Level by Cell",
        formula: "Fill rate per ABC-XYZ segment",
        benchmark: "AX ≥98%, CZ ≥85% acceptable",
        interpretation: "Validate policy matrix effectiveness",
      },
      {
        name: "Forecast MAPE by Cell",
        formula: "MAPE segmented by XYZ class",
        benchmark: "X <20%, Y <30%, Z <45%",
        interpretation: "XYZ phản ánh forecastability — Z naturally higher MAPE",
      },
    ],
    caseStudies: [
      {
        title: "Pharma distributor — 4.500 SKU",
        context: "Uniform 95% service level cho tất cả SKU, inventory $12M",
        challenge: "CZ SKUs chiếm 25% inventory value nhưng chỉ 3% revenue",
        solution: "ABC-XYZ matrix, giảm service CZ→88%, tăng AX→99%, SS multiplier theo XYZ",
        result: "Inventory $12M→$9.2M, AX fill rate 96%→99.2%, không mất revenue class A",
      },
      {
        title: "E-commerce electronics — 12.000 SKU",
        context: "Fast-moving accessories (class A) nhưng highly promotional (class Z)",
        challenge: "AZ SKUs stockout 20% trong promo, overstock 40% post-promo",
        solution: "Separate promo forecast cho AZ, pre-build SS 3 tuần trước 11.11/12.12",
        result: "Promo fill rate 72%→91%, post-promo markdown giảm 35%",
      },
      {
        title: "Steel trading — 800 SKU intermittent",
        context: "B2B project-based demand, 60% SKU intermittent",
        challenge: "ABC alone không capture unpredictability — over-invest class B intermittent",
        solution: "XYZ overlay, BZ chuyển make-to-order policy, BX giữ stock",
        result: "Inventory turnover 3.2x→5.1x, working capital giải phóng $2.8M",
      },
    ],
    faq: [
      {
        question: "Ngưỡng ABC 80/15/5 có phải cố định?",
        answer:
          "Không — 80/15/5 là guideline. Ngành concentrated (pharma, auto parts) có thể 70/20/10. Ngành fragmented (fashion) có thể 60/25/15. Calibrate sao cho class A manageable (review được hết).",
      },
      {
        question: "XYZ dùng CV hay forecast MAPE?",
        answer:
          "CV đo historical variability — dùng cho policy setup. Forecast MAPE đo actual predictability — dùng cho model selection. Best practice: CV cho initial segmentation, refine bằng MAPE sau 2-3 forecast cycles.",
      },
      {
        question: "Ô AZ quan trọng nhất — xử lý thế nào?",
        answer:
          "AZ = high value + unpredictable: invest forecast effort (Prophet, causal), higher safety stock, dual sourcing, shorter review cycle (weekly), và executive attention trong S&OP.",
      },
      {
        question: "CZ có nên giữ tồn kho không?",
        answer:
          "CZ = low value + volatile: minimize stock, order-as-needed, accept lower service level (85-90%), hoặc drop SKU nếu không strategic. Đừng waste capital và warehouse space.",
      },
      {
        question: "Bao lâu re-classify một lần?",
        answer:
          "Quarterly cho dynamic business (retail, e-commerce). Semi-annually cho stable B2B. Re-classify sau major event: new product launch, market shift, Tết season end.",
      },
      {
        question: "ABC theo warehouse hay company-wide?",
        answer:
          "Per warehouse/DC cho replenishment policy. Company-wide cho strategic sourcing. SKU có thể class A tại HCM nhưng class C tại HN — policy khác nhau.",
      },
      {
        question: "Kết hợp ABC-XYZ với FSN?",
        answer:
          "FSN (Fast/Slow/Non-moving) thêm velocity dimension. Non-moving SKU override ABC — dù class A nhưng không bán 6 tháng → disposition. Matrix 3D: ABC × XYZ × FSN.",
      },
      {
        question: "Service level 99% cho AX có quá cao?",
        answer:
          "AX chiếm 80% revenue — 1% stockout = significant revenue loss. Tính marginal cost: SS tăng 15% cho 99% vs 95% thường justify cho AX. CZ 99% thì waste.",
      },
      {
        question: "Làm sao visualize 9-cell matrix?",
        answer:
          "Heatmap: X-axis ABC, Y-axis XYZ, cell size = SKU count, color = inventory value hoặc revenue. Dashboard quarterly update cho S&OP team.",
      },
      {
        question: "Multi-criteria ABC khác gì traditional?",
        answer:
          "Weighted score: value (40%) + margin (30%) + strategic (20%) + customer criticality (10%). Phù hợp khi có SKU high-value low-margin cần differentiate.",
      },
      {
        question: "ABC-XYZ ảnh hưởng slotting thế nào?",
        answer:
          "AX SKUs → golden zone (gần dock, eye-level). CX → bulk/rafter. AY/BX → mid-zone. Re-slot quarterly sau re-classification.",
      },
      {
        question: "Policy matrix có template chuẩn không?",
        answer:
          "Có framework nhưng phải customize. Template: mỗi cell gán service level, SS multiplier, review frequency, forecast method, cycle count freq, sourcing strategy. Document và train team.",
      },
    ],
    glossary: [
      { term: "ACV", definition: "Annual Consumption Value — giá trị tiêu thụ hàng năm = cost × qty" },
      { term: "CV", definition: "Coefficient of Variation — σ/μ, đo biến động tương đối" },
      { term: "Policy Matrix", definition: "Bảng quy tắc tồn kho cho mỗi ô ABC-XYZ" },
      { term: "Golden Zone", definition: "Vùng kho gần dock, dễ pick — dành cho fast movers class A" },
      { term: "FSN", definition: "Fast/Slow/Non-moving — phân loại theo velocity bán hàng" },
    ],
    sections: [
      {
        id: "abc-calc",
        title: "Tính ABC Classification",
        content: "Quy trình Pareto analysis chuẩn:",
        bullets: [
          "Tính ACV cho mỗi SKU",
          "Sort descending by ACV",
          "Cumulative % → threshold A/B/C",
          "Validate: class A SKU count thường 10-20% nhưng 70-80% value",
        ],
      },
      {
        id: "xyz-calc",
        title: "Tính XYZ Classification",
        content: "Đo variability bằng CV hoặc forecast error:",
        bullets: [
          "CV = σ/μ trên monthly demand 12 tháng rolling",
          "X: CV < 0.5 (stable), Y: 0.5-1.0 (moderate), Z: > 1.0 (volatile)",
          "Alternative: dùng forecast MAPE nếu đã có forecast system",
          "Exclude promo/outlier periods trước khi tính CV",
        ],
      },
      {
        id: "matrix-9",
        title: "Ma trận 9 ô — Chiến lược từng ô",
        content: "Policy direction cho mỗi cell:",
        bullets: [
          "AX: Tight control, 99% SL, weekly review, ARIMA/SES forecast",
          "AY: High SL 98%, bi-weekly review, ES with causal factors",
          "AZ: 98% SL, high SS, weekly review, Prophet + promo model, dual source",
          "BX: 96% SL, monthly review, standard forecast",
          "BY: 95% SL, monthly review, moderate SS",
          "BZ: 92% SL, quarterly review, Croston, minimal stock",
          "CX: 93% SL, quarterly review, simple MA",
          "CY: 90% SL, order-as-needed tendency",
          "CZ: 85-88% SL, drop or minimal stock, judgmental forecast",
        ],
      },
      {
        id: "service-level",
        title: "Service Level theo Matrix",
        content: "Cân bằng service level với inventory investment:",
        bullets: [
          "Service level proportional to ABC value class",
          "Safety stock multiplier proportional to XYZ variability",
          "Formula: SS = Z(ABC_SL) × σ × √L × M(XYZ)",
          "Review quarterly: actual fill rate vs target per cell",
        ],
      },
      {
        id: "forecast-mapping",
        title: "Forecast Method theo XYZ",
        content: "Map forecast model với predictability:",
        bullets: [
          "X (stable): SES, ARIMA, moving average",
          "Y (moderate): Holt-Winters, Prophet, regression",
          "Z (volatile): Prophet + causal, ML ensemble, judgmental overlay",
          "Intermittent (Z subset): Croston, SBA, TSB",
        ],
      },
      {
        id: "slotting",
        title: "Slotting và Warehouse Priority",
        content: "ABC-XYZ drive warehouse layout decisions:",
        bullets: [
          "Pick frequency × ABC value = slot priority score",
          "AX in golden zone within 30m of dock",
          "CZ in bulk storage or VNA racking",
          "Re-slot trigger: quarterly re-classification or velocity change >30%",
        ],
      },
      {
        id: "cycle-count",
        title: "Cycle Count Program",
        content: "ABC-driven inventory accuracy program:",
        bullets: [
          "A items: weekly or continuous cycle count",
          "B items: monthly",
          "C items: quarterly or annual",
          "AZ high-value volatile: increase count frequency",
        ],
      },
      {
        id: "integration",
        title: "Tích hợp S&OP và Procurement",
        content: "ABC-XYZ là input cho cross-functional planning:",
        bullets: [
          "S&OP: prioritize forecast improvement cho AZ/BZ",
          "Procurement: dual-source AZ, consolidate orders CZ",
          "Finance: inventory budget allocation theo cell value",
          "Sales: protect AX availability trong negotiation",
        ],
      },
    ],
    pythonStack: ["pandas", "numpy", "matplotlib", "seaborn", "scipy.stats"],
    implementationNotes:
      "Export matrix ra Excel heatmap cho business users. Automate re-classification quarterly via scheduled job. Policy matrix document hóa và train warehouse team. Kết hợp với forecast module để auto-assign model.",
    relatedModuleIds: ["abc-analysis", "inventory-management", "machine-learning"],
    relatedToolIds: ["abc", "eoq", "inventory"],
    codeExample: `import pandas as pd
import numpy as np
from scipy.stats import norm

def abc_classify(df, value_col='annual_value'):
    df = df.sort_values(value_col, ascending=False)
    df['cum_pct'] = df[value_col].cumsum() / df[value_col].sum() * 100
    df['abc'] = pd.cut(df['cum_pct'], bins=[0, 80, 95, 100], labels=['A','B','C'])
    return df

def xyz_classify(df, cv_col='cv'):
    df['xyz'] = pd.cut(df[cv_col], bins=[0, 0.5, 1.0, np.inf], labels=['X','Y','Z'])
    return df

POLICY_MATRIX = {
    'AX': {'service_level': 0.99, 'ss_mult': 1.0, 'review': 'weekly'},
    'AY': {'service_level': 0.98, 'ss_mult': 1.3, 'review': 'biweekly'},
    'AZ': {'service_level': 0.98, 'ss_mult': 1.8, 'review': 'weekly'},
    'BX': {'service_level': 0.96, 'ss_mult': 1.0, 'review': 'monthly'},
    'BY': {'service_level': 0.95, 'ss_mult': 1.3, 'review': 'monthly'},
    'BZ': {'service_level': 0.92, 'ss_mult': 1.8, 'review': 'quarterly'},
    'CX': {'service_level': 0.93, 'ss_mult': 1.0, 'review': 'quarterly'},
    'CY': {'service_level': 0.90, 'ss_mult': 1.3, 'review': 'quarterly'},
    'CZ': {'service_level': 0.88, 'ss_mult': 1.8, 'review': 'quarterly'},
}

def safety_stock(sl, sigma, lead_time, xyz):
    z = norm.ppf(sl)
    mult = POLICY_MATRIX.get(xyz, {}).get('ss_mult', 1.0)
    return z * sigma * np.sqrt(lead_time) * mult`,
  }),

  entry({
    id: "time-series-statistical",
    title: "Dự báo Time Series Thống kê",
    subtitle: "ARIMA · Exponential Smoothing · Holt-Winters · Decomposition",
    category: "Machine Learning",
    language: "Python / statsmodels",
    difficulty: "Nâng cao",
    readingTime: "60 phút",
    tags: ["ARIMA", "ETS", "Holt-Winters", "Time Series", "statsmodels"],
    summary:
      "Hướng dẫn chuyên sâu mô hình time series cổ điển: ARIMA/SARIMA, exponential smoothing (SES, Holt, Holt-Winters), decomposition STL, model selection AIC/BIC, và triển khai Python production-ready.",
    overview:
      "Statistical time series models là backbone của demand forecasting — interpretable, nhanh, và proven trên hàng triệu SKU worldwide. Bài viết cover toàn bộ family: từ Simple Exponential Smoothing cho stable demand, Holt-Winters cho trend+seasonality, đến ARIMA/SARIMA cho autocorrelation phức tạp. Bao gồm quy trình model selection, diagnostic checking (Ljung-Box, ACF/PACF), và khi nào chọn model nào thay vì ML black-box.",
    scientificBasis:
      "Box-Jenkins ARIMA methodology (1970): identification (ACF/PACF) → estimation (MLE) → diagnostic checking. Exponential Smoothing từ Brown (1956), Holt (1957), Winters (1960) — optimal cho một số state-space models. Information criteria AIC/BIC penalize complexity. Seasonal decomposition: additive vs multiplicative seasonality.",
    whenToUse:
      "SKU có demand history ≥24 tháng, pattern trend/seasonality rõ, class X/Y trong ABC-XYZ. Batch forecast hàng nghìn SKU cần speed + interpretability.",
    whenNotToUse:
      "Intermittent demand (nhiều zero), <12 tháng data, hoặc structural break lớn (COVID) không có adjustment — dùng Croston hoặc judgmental.",
    vietnamContext:
      "Tết shift yearly (lunar calendar) — SARIMA cần custom seasonal period hoặc dùng Prophet holiday. Miền Bắc mùa đông tăng demand sưởi ấm, miền Nam không — segment regional trước khi model. Python statsforecast library batch nhanh cho 10.000+ SKU SME VN.",
    keyConcepts: [
      "Stationarity — mean/variance constant, dùng ADF test",
      "Differencing — d=1 hoặc d=2 để achieve stationarity",
      "AR(p) — autoregressive, depend on p past values",
      "MA(q) — moving average, depend on q past errors",
      "ARIMA(p,d,q) — combined AR + differencing + MA",
      "SARIMA(p,d,q)(P,D,Q)_m — seasonal ARIMA với period m",
      "ACF/PACF — identify p và q từ correlogram",
      "AIC/BIC — model selection, lower is better",
      "Simple Exponential Smoothing (SES) — level only",
      "Holt's Linear Trend — level + trend",
      "Holt-Winters — level + trend + seasonality (additive/multiplicative)",
      "ETS framework — Error, Trend, Seasonality taxonomy (ANN, AAN, AAA...)",
      "STL decomposition — Seasonal-Trend-Loess, robust outliers",
      "Forecast interval — prediction interval từ model uncertainty",
      "Residual diagnostics — Ljung-Box test, normality",
      "Ensemble — average ARIMA + ETS cho stability",
    ],
    applications: [
      "Batch forecast 8.000 SKU stable monthly demand",
      "SARIMA cho FMCG có seasonality Tết + summer",
      "Holt-Winters weekly retail với weekly seasonality",
      "STL decompose → forecast trend + seasonal separately",
      "Model tournament: ARIMA vs ETS vs naive, pick lowest MAPE",
    ],
    methods: [
      "statsmodels ARIMA/SARIMA",
      "statsforecast AutoARIMA, AutoETS",
      "pmdarima auto_arima",
      "Holt-Winters scipy/numpy manual",
      "Cross-validation rolling origin",
    ],
    stepByStep: [
      "Bước 1: Plot time series — identify trend, seasonality, outliers",
      "Bước 2: Clean data — handle missing, outliers, stockout imputation",
      "Bước 3: Test stationarity — ADF test, differencing if needed",
      "Bước 4: ACF/PACF analysis → candidate (p,d,q)",
      "Bước 5: Fit multiple models — ARIMA, ETS, Holt-Winters",
      "Bước 6: Compare AIC/BIC + rolling CV MAPE",
      "Bước 7: Residual diagnostic — Ljung-Box, no pattern in residuals",
      "Bước 8: Generate forecast + prediction intervals",
      "Bước 9: Backtest 6-12 tháng holdout",
      "Bước 10: Deploy batch pipeline, refresh monthly",
    ],
    pitfalls: [
      "Overfitting ARIMA order cao — BIC penalize, prefer parsimony",
      "Không seasonal differencing khi có seasonality — SARIMA required",
      "Dùng ARIMA cho intermittent demand — forecast negative hoặc zero",
      "Ignore structural break — model fit pre-COVID fail post-COVID",
      "Không check residuals — autocorrelation còn = model misspecified",
      "Multiplicative seasonality dùng additive model — under/over forecast peaks",
    ],
    formulas: [
      {
        name: "ARIMA(p,d,q)",
        expression: "(1-Σφ_i L^i)(1-L)^d Y_t = (1+Σθ_i L^i)ε_t",
        variables: "L: lag operator, φ: AR params, θ: MA params, d: differencing order",
      },
      {
        name: "Holt-Winters (Additive)",
        expression: "Ŷ_{t+h} = l_t + h·b_t + s_{t+h-m}",
        variables: "l: level, b: trend, s: seasonal, m: seasonal period",
      },
      {
        name: "AIC",
        expression: "AIC = 2k - 2ln(L)",
        variables: "k: số parameters, L: likelihood — chọn model AIC thấp nhất",
      },
      {
        name: "Prediction Interval",
        expression: "PI = Ŷ ± Z_{α/2} × SE(Ŷ)",
        variables: "SE tăng theo forecast horizon h",
      },
    ],
    metrics: [
      {
        name: "MAPE",
        formula: "(1/n)Σ|actual-forecast|/actual × 100%",
        benchmark: "Stable SKU: <20%",
        interpretation: "Primary accuracy metric cho time series",
      },
      {
        name: "RMSE",
        formula: "√(Σ(actual-forecast)²/n)",
        benchmark: "Dùng khi penalize large errors",
        interpretation: "Sensitive to outliers — dùng kèm MAPE",
      },
      {
        name: "MASE",
        formula: "MAE / MAE_naive",
        benchmark: "<1 = beat naive",
        interpretation: "Scale-independent, good cho comparison cross-SKU",
      },
    ],
    caseStudies: [
      {
        title: "FMCG distributor — 6.000 SKU monthly forecast",
        context: "Excel MA 3-period, MAPE 38% average",
        challenge: "Seasonal SKUs (beverages summer peak) MAPE >50%",
        solution: "AutoETS batch via statsforecast, SARIMA cho top 200 seasonal A-class",
        result: "MAPE 38%→22%, forecast pipeline runtime 45 phút cho 6.000 SKU",
      },
      {
        title: "Pharma — hospital channel weekly",
        context: "Weekly demand 150 SKU, strong trend post-COVID healthcare spending",
        challenge: "ARIMA(1,1,1) underfit — trend acceleration missed",
        solution: "Holt linear trend + damped trend ETS, rolling re-fit 4 tuần",
        result: "MAPE 28%→17%, prediction interval cover 92% actuals",
      },
      {
        title: "Industrial MRO — 2.000 slow movers",
        context: "Mixed stable và intermittent, ARIMA applied uniformly",
        challenge: "40% SKU forecast negative values, MAPE infinite",
        solution: "Pre-segment: stable→ARIMA, intermittent→Croston, tournament per segment",
        result: "Negative forecasts eliminated, overall MAPE 52%→31%",
      },
    ],
    faq: [
      {
        question: "ARIMA hay Exponential Smoothing?",
        answer:
          "ETS/Holt-Winters nhanh hơn, robust hơn cho seasonal data, ít tuning. ARIMA flexible hơn cho autocorrelation phức tạp. Best practice: chạy cả hai, chọn MAPE thấp hơn trên holdout.",
      },
      {
        question: "Auto ARIMA có đáng tin không?",
        answer:
          "auto_arima (pmdarima) hoặc statsforecast AutoARIMA tốt cho batch processing. Luôn validate residuals và backtest. Không blindly trust — inspect top 50 high-value SKUs manually.",
      },
      {
        question: "Seasonal period m chọn thế nào?",
        answer:
          "Monthly data m=12, weekly m=52 (hoặc 4 cho monthly-within-weekly), daily m=7. VN Tết không fixed date — dùng holiday regressor thay hard seasonal period.",
      },
      {
        question: "Additive hay multiplicative seasonality?",
        answer:
          "Additive khi seasonal amplitude constant. Multiplicative khi amplitude grows with level (retail growth). Plot decomposition để quyết định.",
      },
      {
        question: "Bao nhiêu data cần cho SARIMA?",
        answer:
          "Tối thiểu 2 full seasonal cycles: 24 months cho m=12, 104 weeks cho m=52. Ít hơn → Holt-Winters hoặc SES.",
      },
      {
        question: "Xử lý outliers trong time series?",
        answer:
          "STL decomposition robust to outliers. Hoặc flag + replace với interpolated value. Không xóa Tết/promo — model chúng explicitly.",
      },
      {
        question: "Prediction interval quan trọng thế nào?",
        answer:
          "PI cho safety stock calculation: SS = Z × PI width. Wider PI = more uncertainty = higher SS. Dùng thay point forecast alone.",
      },
      {
        question: "Rolling cross-validation thế nào?",
        answer:
          "Origin rolling: train on months 1-24, test 25; train 1-25, test 26... Average MAPE across folds. Tránh single holdout may mắn.",
      },
      {
        question: "statsmodels vs statsforecast?",
        answer:
          "statsmodels: flexible, single SKU deep analysis. statsforecast: batch 10.000+ SKU nhanh (Rust backend), AutoARIMA/AutoETS built-in. Production batch → statsforecast.",
      },
      {
        question: "Model refresh frequency?",
        answer:
          "Monthly refresh cho monthly data, weekly cho weekly. Re-fit toàn bộ hoặc rolling window 24-36 months. Drop COVID outliers nếu structural break confirmed.",
      },
      {
        question: "Ensemble nhiều model?",
        answer:
          "Simple average ARIMA + ETS + naive thường beat single model. Weighted average theo inverse MAPE trên validation. Diminishing returns beyond 3 models.",
      },
      {
        question: "Ljung-Box test fail nghĩa là gì?",
        answer:
          "Residuals còn autocorrelation → model chưa capture hết pattern. Tăng order (p,q), thêm seasonal, hoặc thử model khác.",
      },
    ],
    glossary: [
      { term: "Stationarity", definition: "Chuỗi thời gian có mean và variance không đổi theo thời gian" },
      { term: "ACF", definition: "Autocorrelation Function — correlation giữa Y_t và Y_{t-k}" },
      { term: "PACF", definition: "Partial ACF — correlation Y_t và Y_{t-k} sau khi loại middle lags" },
      { term: "SARIMA", definition: "Seasonal ARIMA — mở rộng ARIMA với seasonal differencing và seasonal AR/MA" },
      { term: "ETS", definition: "Error-Trend-Seasonality — taxonomy exponential smoothing models" },
    ],
    sections: [
      {
        id: "arima-theory",
        title: "Lý thuyết ARIMA/SARIMA",
        content: "Box-Jenkins methodology 3 giai đoạn:",
        bullets: [
          "Identification: ACF/PACF patterns → candidate (p,d,q)",
          "Estimation: Maximum Likelihood Estimate parameters",
          "Diagnostic: Ljung-Box on residuals, re-specify if fail",
          "SARIMA thêm seasonal (P,D,Q)_m cho seasonal patterns",
        ],
      },
      {
        id: "ets-family",
        title: "Exponential Smoothing Family",
        content: "ETS taxonomy models:",
        bullets: [
          "SES (ANN): level only, no trend, no season",
          "Holt (AAN): level + additive trend",
          "Holt-Winters (AAA): level + trend + additive season",
          "Multiplicative variants (AAM, AMM) cho growing seasonality",
        ],
      },
      {
        id: "model-selection",
        title: "Model Selection Strategy",
        content: "Quy trình chọn model objective:",
        bullets: [
          "Fit candidate models: naive, SES, Holt-Winters, ARIMA, SARIMA",
          "Compare rolling CV MAPE (primary) và AIC (secondary)",
          "Residual diagnostic pass required",
          "Chọn parsimonious model nếu MAPE tie",
        ],
      },
      {
        id: "decomposition",
        title: "Seasonal Decomposition",
        content: "STL và classical decomposition:",
        bullets: [
          "Y = Trend + Seasonal + Residual (additive)",
          "Y = Trend × Seasonal × Residual (multiplicative)",
          "STL robust to outliers — preferred",
          "Decompose → forecast components separately",
        ],
      },
      {
        id: "diagnostics",
        title: "Diagnostic Checking",
        content: "Validate model fit quality:",
        bullets: [
          "Residuals white noise: Ljung-Box p > 0.05",
          "Residuals normal: Shapiro-Wilk or QQ plot",
          "No trend in residuals over time",
          "Out-of-sample backtest MAPE beat naive",
        ],
      },
      {
        id: "batch-pipeline",
        title: "Production Batch Pipeline",
        content: "Scale cho hàng nghìn SKU:",
        bullets: [
          "Segment SKU trước (stable/intermittent)",
          "statsforecast AutoETS/AutoARIMA parallel",
          "Fallback hierarchy: SARIMA → ETS → SES → naive",
          "Log model selected + MAPE per SKU for audit",
        ],
      },
      {
        id: "intervals",
        title: "Prediction Intervals",
        content: "Uncertainty quantification:",
        bullets: [
          "Point forecast alone insufficient cho inventory planning",
          "PI width → safety stock input",
          "PI widen với horizon h — long-term forecast less certain",
          "Bootstrap intervals cho non-parametric",
        ],
      },
      {
        id: "vn-seasonality",
        title: "Seasonality đặc thù Việt Nam",
        content: "Adjustments cho thị trường VN:",
        bullets: [
          "Tết: lunar calendar, dùng holiday dummy variable",
          "Rainy season miền Trung/Nam: impact construction, F&B outdoor",
          "School year September: stationery, uniform spike",
          "11.11/12.12 e-commerce: promo regressor mandatory",
        ],
      },
    ],
    pythonStack: ["statsmodels", "statsforecast", "pmdarima", "pandas", "numpy", "matplotlib"],
    implementationNotes:
      "Batch pipeline với fallback hierarchy. Log model + MAPE per SKU. Monthly refresh cron job. Exclude stockout periods trước fit. PI export cho safety stock module.",
    relatedModuleIds: ["machine-learning", "inventory-management", "abc-analysis"],
    relatedToolIds: ["inventory"],
    codeExample: `import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX

def fit_holt_winters(series, seasonal_periods=12):
    model = ExponentialSmoothing(
        series, trend='add', seasonal='add',
        seasonal_periods=seasonal_periods
    )
    fit = model.fit(optimized=True)
    return fit.forecast(6)

def fit_sarima(series, order=(1,1,1), seasonal=(1,1,1,12)):
    model = SARIMAX(series, order=order, seasonal_order=seasonal)
    fit = model.fit(disp=False)
    return fit.get_forecast(6).predicted_mean

def mape(actual, forecast):
    return np.mean(np.abs((actual - forecast) / actual)) * 100

def model_tournament(series, holdout=6):
    train, test = series[:-holdout], series[-holdout:]
    hw_fc = fit_holt_winters(train)[:holdout]
    sr_fc = fit_sarima(train)[:holdout]
    naive_fc = [train.iloc[-1]] * holdout
    scores = {
        'holt_winters': mape(test, hw_fc),
        'sarima': mape(test, sr_fc),
        'naive': mape(test, naive_fc),
    }
    return min(scores, key=scores.get), scores`,
  }),

  entry({
    id: "croston-intermittent-demand",
    title: "Croston — Dự báo Nhu cầu Gián đoạn",
    subtitle: "Intermittent · Lumpy · SBA · TSB · ADIDA",
    category: "Machine Learning",
    language: "Python",
    difficulty: "Nâng cao",
    readingTime: "50 phút",
    tags: ["Croston", "Intermittent", "SBA", "TSB", "Sparse Demand"],
    summary:
      "Chuyên sâu về forecast intermittent và lumpy demand: Croston method, SBA correction, TSB, ADIDA decomposition, và khi nào thay thế ARIMA/Prophet cho spare parts, MRO, slow movers.",
    overview:
      "30-70% SKU trong nhiều ngành (spare parts, pharma, industrial, B2B) có intermittent demand — nhiều kỳ zero xen kẽ demand nhỏ. ARIMA và SES fail hoàn toàn trên data này: forecast negative, MAPE infinite. Croston (1972) tách forecast thành 2 phần: demand size khi có bán và interval giữa các lần bán. Bài viết cover Croston, bias correction (SBA), TSB probabilistic, và best practices cho slow movers.",
    scientificBasis:
      "Croston separates demand into two independent exponential smoothing processes: demand size (z) và inter-demand interval (p). Forecast = z/p per period. Syntetos-Boylan Approximation (SBA) corrects upward bias inherent in Croston. Teunter-Syntetos-Babai (TSB) models demand probability directly. ADIDA aggregates to lower frequency then disaggregates.",
    whenToUse:
      "SKU với >30% periods zero demand, class BZ/CZ trong ABC-XYZ, spare parts/MRO/slow-moving B2B. Khi ARIMA/Prophet cho MAPE >50% hoặc negative forecasts.",
    whenNotToUse:
      "Smooth demand (CV <0.5, <10% zeros) — dùng SES/ARIMA. High-volume fast movers. New product không có intermittent pattern established.",
    vietnamContext:
      "Nhà phân phối linh kiện công nghiệp VN: 50-60% SKU intermittent. Manufacturing spare parts cho máy Nhật/Hàn: long tail slow movers. Pharma generic: nhiều SKU bán theo đợt theo tender bệnh viện — highly lumpy.",
    keyConcepts: [
      "Intermittent demand — nhiều zero-demand periods",
      "Lumpy demand — intermittent + variable size khi có demand",
      "Demand size (z) — quantity khi có positive demand",
      "Inter-demand interval (p) — số periods giữa 2 lần demand",
      "Croston forecast — per period rate = ẑ / p̂",
      "SBA bias correction — multiply by (1 - α/2)",
      "TSB — model demand probability + size separately",
      "ADIDA — Aggregate-Disaggregate Intermittent Demand Approach",
      "Intermittency ratio — % zero periods",
      "ADI — Average Demand Interval",
      "CV² — squared CV cho demand size (non-zero periods)",
      "Syntetos-Boylan classification — smooth/erratic/intermittent/lumpy",
      "Forecast = 0 vs small positive — policy decision",
      "Safety stock cho intermittent — higher, use quantile forecast",
      "Service level approach — fill rate vs cycle service level",
      "Simulation-based inventory policy cho lumpy demand",
    ],
    applications: [
      "Forecast 3.000 spare parts MRO catalog",
      "Pharma tender-based SKU forecasting",
      "Industrial distributor slow movers 40% catalog",
      "Auto parts long-tail 15.000 SKU",
      "B2B project-based material requirements",
    ],
    methods: [
      "Croston classic (1972)",
      "SBA — Syntetos-Boylan Approximation",
      "TSB — Teunter-Syntetos-Babai",
      "ADIDA — temporal aggregation",
      "Bootstrap simulation for PI",
    ],
    stepByStep: [
      "Bước 1: Identify intermittent SKUs — >30% zero periods",
      "Bước 2: Classify Syntetos-Boylan: intermittent vs lumpy (CV² threshold)",
      "Bước 3: Extract non-zero demand events và intervals",
      "Bước 4: Apply Croston/SBA/TSB với α=0.1-0.2 (lower than SES)",
      "Bước 5: Compare methods on holdout — MAE, MAPE (non-zero only)",
      "Bước 6: Generate per-period forecast rate",
      "Bước 7: Convert to reorder quantity via simulation",
      "Bước 8: Set higher safety stock — quantile-based",
      "Bước 9: Review quarterly — intermittent pattern may shift",
      "Bước 10: Consider drop/dead stock cho persistent zero movers",
    ],
    pitfalls: [
      "Dùng MAPE trên intermittent — divide by zero, misleading",
      "Croston without SBA correction — systematic over-forecast",
      "α quá cao (>0.3) — overreact to single demand event",
      "Không differentiate intermittent vs lumpy — different methods",
      "Forecast negative từ ARIMA applied to intermittent — nonsense",
      "Safety stock từ normal distribution formula — underestimate for intermittent",
    ],
    formulas: [
      {
        name: "Croston Forecast",
        expression: "F_t = ẑ_t / p̂_t",
        variables: "ẑ: smoothed demand size, p̂: smoothed interval (periods)",
      },
      {
        name: "SBA Correction",
        expression: "F_SBA = F_Croston × (1 - α/2)",
        variables: "α: smoothing constant, corrects upward bias",
      },
      {
        name: "ADI",
        expression: "ADI = Total periods / Number of demand occurrences",
        variables: "Average Demand Interval — đo intermittency",
      },
      {
        name: "Intermittency",
        expression: "I = Zero periods / Total periods × 100%",
        variables: "I > 30%: candidate cho Croston family",
      },
    ],
    metrics: [
      {
        name: "MAE (preferred for intermittent)",
        formula: "Σ|actual - forecast| / n",
        benchmark: "Compare vs naive (last non-zero)",
        interpretation: "Không bị divide-by-zero issue như MAPE",
      },
      {
        name: "MAPE (non-zero periods only)",
        formula: "MAPE trên periods có actual > 0",
        benchmark: "<45% cho intermittent acceptable",
        interpretation: "Chỉ tính khi có demand — partial picture",
      },
      {
        name: "Fill Rate",
        formula: "Demand satisfied / Total demand",
        benchmark: "BZ: 90-92%, CZ: 85% acceptable",
        interpretation: "Service metric quan trọng hơn MAPE cho intermittent",
      },
    ],
    caseStudies: [
      {
        title: "MRO distributor — 8.500 spare parts",
        context: "ARIMA batch cho tất cả SKU, 45% forecast negative",
        challenge: "Intermittent SKUs MAPE infinite, inventory $4.2M slow movers",
        solution: "Segment 52% intermittent → Croston-SBA, lumpy → TSB + simulation SS",
        result: "Zero negative forecasts, intermittent MAE giảm 38%, inventory -$800K",
      },
      {
        title: "Auto parts chain — 15.000 SKU long tail",
        context: "Class CZ 60% catalog, avg 2 sales/quarter",
        challenge: "Holding cost cao cho SKU bán 1 lần/năm",
        solution: "Croston forecast + min order policy, drop SKU zero demand 18 tháng",
        result: "Active SKU 15K→11K, inventory -25%, fill rate maintained 91%",
      },
      {
        title: "Pharma tender — 400 hospital SKUs",
        context: "Demand theo tender 6-12 tháng, highly lumpy",
        challenge: "Croston underforecast tender spikes, overforecast between tenders",
        solution: "TSB + tender calendar overlay, ADIDA monthly→quarterly aggregation",
        result: "Tender period fill rate 78%→93%, between-tender excess stock -30%",
      },
    ],
    faq: [
      {
        question: "Croston khác ARIMA thế nào?",
        answer:
          "Croston designed specifically cho sparse demand — tách size và interval. ARIMA assumes continuous demand, fail với zeros. Never dùng ARIMA khi >30% zeros.",
      },
      {
        question: "SBA correction bắt buộc không?",
        answer:
          "Strongly recommended — Croston classic có upward bias systematically. SBA multiply (1-α/2) gần unbiased. TSB further improve cho lumpy.",
      },
      {
        question: "α chọn bao nhiêu cho Croston?",
        answer:
          "Thấp hơn SES: 0.1-0.2 typical. Intermittent demand ít data points — α cao overreact. Test 0.1, 0.15, 0.2 trên holdout.",
      },
      {
        question: "MAPE có dùng được cho intermittent?",
        answer:
          "MAPE misleading khi nhiều actual=0. Dùng MAE, MASE, hoặc MAPE chỉ trên non-zero periods. Fill rate là business metric quan trọng hơn.",
      },
      {
        question: "Intermittent vs lumpy khác gì?",
        answer:
          "Intermittent: zero periods nhiều nhưng size ổn định khi có demand → Croston/SBA. Lumpy: cả frequency và size đều variable → TSB + simulation.",
      },
      {
        question: "TSB khi nào tốt hơn Croston?",
        answer:
          "TSB tốt hơn cho lumpy demand và khi demand probability thay đổi (product lifecycle). Model P(demand>0) separately từ size.",
      },
      {
        question: "ADIDA là gì?",
        answer:
          "Aggregate demand lên frequency thấp hơn (monthly→quarterly), forecast aggregated, disaggregate xuống. Giảm zero ratio, improve forecastability.",
      },
      {
        question: "Safety stock cho intermittent thế nào?",
        answer:
          "Normal distribution SS formula underestimate. Dùng simulation: bootstrap demand events, hoặc quantile forecast (P90 demand). SS thường cao hơn 50-100% vs smooth demand.",
      },
      {
        question: "Khi nào drop intermittent SKU?",
        answer:
          "Zero demand 18-24 tháng liên tục, không strategic, holding cost > expected margin. Review với sales trước khi discontinue.",
      },
      {
        question: "Croston forecast = 0.3 unit/period nghĩa là gì?",
        answer:
          "Expected demand rate 0.3 units per period — không phải forecast 0.3 mỗi kỳ deterministic. Over 10 periods, expected total ≈ 3 units. Dùng cho reorder planning aggregate.",
      },
      {
        question: "Combine Croston với ML?",
        answer:
          "Có thể: ML classify intermittent vs smooth, route to Croston pipeline. Deep learning (LSTM) trên intermittent vẫn challenging — Croston often competitive.",
      },
      {
        question: "Python library nào support Croston?",
        answer:
          "statsforecast (croston, optimized), scipy manual implementation, inventoryanalytics package. statsforecast batch nhanh nhất cho production.",
      },
    ],
    glossary: [
      { term: "Intermittent Demand", definition: "Nhu cầu có nhiều kỳ zero xen kẽ positive demand" },
      { term: "Croston", definition: "Phương pháp tách forecast demand size và inter-arrival interval" },
      { term: "SBA", definition: "Syntetos-Boylan Approximation — bias correction cho Croston" },
      { term: "TSB", definition: "Teunter-Syntetos-Babai — model demand occurrence probability" },
      { term: "ADI", definition: "Average Demand Interval — kỳ trung bình giữa 2 lần có demand" },
    ],
    sections: [
      {
        id: "problem",
        title: "Vấn đề Intermittent Demand",
        content: "Tại sao standard methods fail:",
        bullets: [
          "30-70% SKU intermittent trong spare parts, MRO, B2B",
          "ARIMA/SES assume continuous demand → negative forecasts",
          "MAPE infinite khi actual=0 nhiều",
          "Safety stock formulas underestimate risk",
        ],
      },
      {
        id: "croston-method",
        title: "Croston Method chi tiết",
        content: "Tách thành 2 exponential smoothing:",
        bullets: [
          "Track demand size z: ES on non-zero demand quantities",
          "Track interval p: ES on periods between demands",
          "Forecast rate per period: F = ẑ / p̂",
          "α typically 0.1-0.2",
        ],
      },
      {
        id: "sba-tsb",
        title: "SBA và TSB Improvements",
        content: "Bias correction và probabilistic approach:",
        bullets: [
          "SBA: F × (1 - α/2) corrects Croston upward bias",
          "TSB: separate P(demand occurs) and E(size | demand)",
          "TSB better for lumpy and lifecycle changes",
          "Compare on holdout MAE",
        ],
      },
      {
        id: "classification",
        title: "Syntetos-Boylan Classification",
        content: "Phân loại demand pattern 2×2:",
        bullets: [
          "ADI < 1.32: frequent demand, ADI ≥ 1.32: infrequent",
          "CV² < 0.49: stable size, CV² ≥ 0.49: variable size",
          "Smooth/Erratic/Intermittent/Lumpy quadrants",
          "Route to appropriate method per quadrant",
        ],
      },
      {
        id: "adida",
        title: "ADIDA — Temporal Aggregation",
        content: "Giảm intermittency bằng aggregation:",
        bullets: [
          "Aggregate monthly → quarterly: fewer zeros",
          "Forecast at aggregated level",
          "Disaggregate to original frequency",
          "Works well for moderate intermittency",
        ],
      },
      {
        id: "inventory",
        title: "Inventory Policy cho Intermittent",
        content: "Safety stock và reorder khác smooth demand:",
        bullets: [
          "Simulation-based SS: bootstrap demand events",
          "Quantile forecast: plan for P90 demand",
          "(s,S) policy phù hợp hơn EOQ continuous review",
          "Higher SS multiplier 1.5-2.5× vs smooth",
        ],
      },
      {
        id: "evaluation",
        title: "Evaluation Metrics",
        content: "Đo accuracy đúng cách:",
        bullets: [
          "MAE primary metric (no divide-by-zero)",
          "MASE vs naive (last non-zero or Croston)",
          "Fill rate và cycle service level",
          "MAPE chỉ trên non-zero periods — supplementary",
        ],
      },
      {
        id: "pipeline",
        title: "Production Pipeline",
        content: "Integrate vào forecast system:",
        bullets: [
          "Pre-segment: intermittency > 30% → Croston pipeline",
          "Method tournament: Croston vs SBA vs TSB",
          "Fallback: ADIDA nếu all fail",
          "Monthly refresh, quarterly review dead stock",
        ],
      },
    ],
    pythonStack: ["statsforecast", "pandas", "numpy", "scipy", "matplotlib"],
    implementationNotes:
      "Route intermittent SKUs to separate pipeline. Never apply ARIMA to >30% zero SKUs. Use MAE not MAPE for evaluation. SBA correction default. Simulation SS for inventory module integration.",
    relatedModuleIds: ["machine-learning", "inventory-management", "abc-analysis"],
    relatedToolIds: ["inventory"],
    codeExample: `import numpy as np
import pandas as pd

def croston_sba(demand, alpha=0.15):
    """Croston với SBA bias correction."""
    demand = np.array(demand, dtype=float)
    z_hat, p_hat = demand[demand > 0][0], 1.0
    forecasts = []
    periods_since = 0
    for d in demand:
        periods_since += 1
        if d > 0:
            z_hat = alpha * d + (1 - alpha) * z_hat
            p_hat = alpha * periods_since + (1 - alpha) * p_hat
            periods_since = 0
        fc = (z_hat / p_hat) * (1 - alpha / 2)  # SBA correction
        forecasts.append(fc)
    return forecasts

def classify_intermittent(demand):
    """Syntetos-Boylan classification."""
    d = np.array(demand, dtype=float)
    nonzero = d[d > 0]
    adi = len(d) / max(len(nonzero), 1)
    cv2 = (np.std(nonzero) / np.mean(nonzero)) ** 2 if len(nonzero) > 1 else 0
    if adi < 1.32 and cv2 < 0.49: return 'smooth'
    if adi < 1.32 and cv2 >= 0.49: return 'erratic'
    if adi >= 1.32 and cv2 < 0.49: return 'intermittent'
    return 'lumpy'

def mae(actual, forecast):
    return np.mean(np.abs(np.array(actual) - np.array(forecast)))`,
  }),

  entry({
    id: "forecast-accuracy-metrics",
    title: "Chỉ số Độ chính xác Dự báo",
    subtitle: "MAPE · MAE · Bias · Tracking Signal · FVA",
    category: "Phân tích",
    language: "Python",
    difficulty: "Trung cấp",
    readingTime: "45 phút",
    tags: ["MAPE", "MAE", "Bias", "Tracking Signal", "FVA", "Forecast Accuracy"],
    summary:
      "Hướng dẫn toàn diện đo lường forecast accuracy: MAPE, MAE, RMSE, MASE, bias, tracking signal, forecast value add, và cách set target theo ABC-XYZ segment.",
    overview:
      "Forecast accuracy không chỉ là một con số MAPE — cần bộ metrics đa chiều: accuracy (sai bao nhiêu), bias (thiên hướng over/under), và tracking signal (có systematic error không). Bài viết giải thích từng metric, ưu nhược điểm, khi nào dùng metric nào, cách set target theo forecastability segment, và quy trình forecast review meeting chuẩn.",
    scientificBasis:
      "Forecast error e_t = A_t - F_t. Metrics derived từ error distribution: MAE (L1 norm), RMSE (L2 norm), MAPE (percentage). Bias = mean error (should be zero). Tracking signal = cumulative error / MAD — detects systematic bias. MASE scale-independent vs naive benchmark.",
    whenToUse:
      "Mọi demand planning process cần measure và improve. Monthly forecast review, S&OP, model selection, và FVA analysis.",
    whenNotToUse:
      "Đừng dùng single MAPE cho toàn bộ portfolio — segment trước. MAPE không dùng cho intermittent demand (nhiều actual ≈ 0).",
    vietnamContext:
      "Doanh nghiệp VN thường không track forecast accuracy — hoặc chỉ nhìn tổng MAPE che giấu class A terrible. Implement monthly accuracy dashboard theo ABC-XYZ. Sales team VN hay optimistic bias +15-25% — track bias riêng.",
    keyConcepts: [
      "Forecast Error — e = Actual - Forecast",
      "MAPE — Mean Absolute Percentage Error",
      "MAE — Mean Absolute Error (robust, no %)",
      "RMSE — Root Mean Square Error (penalize large errors)",
      "MASE — Mean Absolute Scaled Error vs naive",
      "Bias — mean error, positive = over-forecast",
      "Tracking Signal — cumulative bias / MAD",
      "MAD — Mean Absolute Deviation of errors",
      "Forecast Value Add (FVA) — manual vs statistical",
      "Weighted MAPE — weight by revenue/volume",
      "Segmented accuracy — by ABC-XYZ, region, horizon",
      "Rolling accuracy — trailing 3/6/12 months",
      "Horizon-specific accuracy — 1-month vs 3-month ahead",
      "Benchmark vs naive — model must beat naive",
      "Symmetric MAPE (sMAPE) — handle low volumes",
      "Forecast review meeting cadence và escalation",
    ],
    applications: [
      "Monthly forecast accuracy dashboard cho S&OP",
      "Model selection tournament by lowest MAPE",
      "FVA analysis: sales override có giá trị không?",
      "Tracking signal alert khi bias systematic",
      "Set accuracy targets per ABC-XYZ segment",
    ],
    methods: [
      "Rolling origin cross-validation",
      "Segmented MAPE calculation",
      "Tracking signal monitoring",
      "FVA waterfall analysis",
      "Bias correction factor",
    ],
    stepByStep: [
      "Bước 1: Define error formula consistently (A-F or F-A — pick one)",
      "Bước 2: Calculate MAPE, MAE, Bias per SKU",
      "Bước 3: Aggregate segmented: ABC-XYZ, category, region",
      "Bước 4: Calculate tracking signal per SKU/category",
      "Bước 5: Compare vs naive benchmark và target",
      "Bước 6: FVA: statistical MAPE vs final consensus MAPE",
      "Bước 7: Monthly review meeting — top 20 worst SKUs root cause",
      "Bước 8: Action plan: model change, data fix, process fix",
      "Bước 9: Track improvement trend rolling 6 months",
      "Bước 10: Tie accuracy KPI to demand planner performance",
    ],
    pitfalls: [
      "MAPE khi actual=0 → divide by zero, infinite",
      "Aggregate MAPE average — nên weighted by volume",
      "Ignore bias — MAPE 20% nhưng bias +15% = chronic overstock",
      "Tracking signal threshold quá loose — miss systematic error",
      "Không segment — portfolio MAPE 25% che giấu A-class 45%",
      "Compare MAPE across different horizons — not comparable",
    ],
    formulas: [
      {
        name: "MAPE",
        expression: "MAPE = (1/n)Σ|A_t - F_t| / |A_t| × 100%",
        variables: "Vấn đề khi A_t ≈ 0",
      },
      {
        name: "MAE",
        expression: "MAE = (1/n)Σ|A_t - F_t|",
        variables: "Robust, same unit as demand",
      },
      {
        name: "Bias",
        expression: "Bias = (1/n)Σ(F_t - A_t)",
        variables: "Positive = over-forecast, negative = under-forecast",
      },
      {
        name: "Tracking Signal",
        expression: "TS = Σ(F_t - A_t) / MAD",
        variables: "Alert khi |TS| > 4 — systematic bias detected",
      },
      {
        name: "MASE",
        expression: "MASE = MAE / MAE_naive",
        variables: "<1 = beat naive benchmark",
      },
      {
        name: "FVA",
        expression: "FVA = MAPE_statistical - MAPE_final",
        variables: "Positive = manual input added value",
      },
    ],
    metrics: [
      {
        name: "MAPE (AX segment)",
        formula: "(1/n)Σ|error|/actual × 100%",
        benchmark: "<20% world-class cho stable A-class",
        interpretation: "Primary metric cho smooth high-value SKUs",
      },
      {
        name: "Tracking Signal",
        formula: "Cumulative error / MAD",
        benchmark: "|TS| < 4",
        interpretation: ">4 = systematic over/under forecast — action needed",
      },
      {
        name: "FVA",
        formula: "MAPE_stat - MAPE_consensus",
        benchmark: ">0 cho strategic decisions",
        interpretation: "Negative FVA = sales override harmful — revert statistical",
      },
    ],
    caseStudies: [
      {
        title: "FMCG — forecast review transformation",
        context: "Single portfolio MAPE 30% reported monthly, no action",
        challenge: "Class A MAPE actually 48%, bias +18% (over-forecast)",
        solution: "Segmented dashboard ABC-XYZ, tracking signal alerts, FVA tracking",
        result: "AX MAPE 48%→24% trong 6 tháng, bias +18%→+3%, inventory -$1.5M",
      },
      {
        title: "E-commerce — FVA reveals sales harm",
        context: "Sales override 100% forecasts, believed adding market insight",
        challenge: "FVA negative -8%: manual override worse than statistical",
        solution: "Restrict override to documented events, FVA gate approval",
        result: "FVA -8%→+2%, MAPE 35%→27%, sales team trust statistical more",
      },
      {
        title: "B2B industrial — intermittent metric fix",
        context: "MAPE 80% reported, management frustrated, considering dropping forecasting",
        challenge: "MAPE inappropriate for 50% intermittent SKU portfolio",
        solution: "Switch to MAE + fill rate per segment, MASE vs naive",
        result: "Realistic metrics, intermittent fill rate 88%→93%, team morale improved",
      },
    ],
    faq: [
      {
        question: "MAPE bao nhiêu là tốt?",
        answer:
          "Phụ thuộc segment: AX stable <20%, BY 25-30%, intermittent 40-50%. Quan trọng hơn: beat naive benchmark và trend improving.",
      },
      {
        question: "MAPE hay MAE?",
        answer:
          "MAPE cho business communication (% dễ hiểu). MAE cho model comparison và intermittent demand. Dùng cả hai. RMSE khi penalize large errors quan trọng.",
      },
      {
        question: "Tracking signal threshold?",
        answer:
          "Classic: |TS| > 4 triggers review. TS > +4 = chronic over-forecast. TS < -4 = chronic under-forecast. Adjust threshold theo business tolerance.",
      },
      {
        question: "Bias +10% nghĩa là gì?",
        answer:
          "Forecast trung bình cao hơn actual 10% — chronic over-forecasting. Dẫn đến excess inventory, obsolescence. Cần bias correction factor hoặc model fix.",
      },
      {
        question: "FVA negative — bỏ sales input?",
        answer:
          "Không bỏ hoàn toàn — restrict override có kiểm soát. Require documented reason. Track FVA per planner. Training nếu consistent negative FVA.",
      },
      {
        question: "Weighted MAPE thế nào tính?",
        answer:
          "WMAPE = Σ|error_i| / Σ|actual_i| × 100%. SKU volume lớn weight cao hơn. Phản ánh business impact tốt hơn simple average MAPE.",
      },
      {
        question: "sMAPE vs MAPE?",
        answer:
          "sMAPE = 200% × Σ|error|/(|actual|+|forecast|). Bounded 0-200%, handle low volumes better. Dùng khi nhiều SKU low-volume.",
      },
      {
        question: "Accuracy theo horizon?",
        answer:
          "1-month ahead MAPE thấp nhất, 3-month higher, 6-month highest. Report separately. Don't penalize planner cho long-horizon error.",
      },
      {
        question: "Naive benchmark?",
        answer:
          "Naive = forecast next period = actual last period. Mọi model phải beat naive (MASE < 1). Nếu không beat naive → model worthless.",
      },
      {
        question: "Accuracy target ai chịu trách nhiệm?",
        answer:
          "Demand planner owns accuracy KPI. Sales owns FVA contribution. Joint accountability trong S&OP. Tie 10-20% bonus to accuracy improvement.",
      },
      {
        question: "Root cause analysis worst SKUs?",
        answer:
          "Monthly top 20 worst: check data issue, promo miss, competitor action, stockout history, model mismatch. Document và fix systematically.",
      },
      {
        question: "Rolling vs fixed period accuracy?",
        answer:
          "Rolling 3-month trailing smooth noise, show trend. Fixed month-end snapshot cho accountability. Report both.",
      },
    ],
    glossary: [
      { term: "MAPE", definition: "Mean Absolute Percentage Error — sai số % trung bình" },
      { term: "Tracking Signal", definition: "Tỷ lệ cumulative bias trên MAD — detect systematic error" },
      { term: "FVA", definition: "Forecast Value Add — giá trị thêm của manual override" },
      { term: "MASE", definition: "MAE scaled by naive MAE — <1 = beat benchmark" },
      { term: "WMAPE", definition: "Weighted MAPE — weight theo volume/revenue" },
    ],
    sections: [
      {
        id: "metrics-overview",
        title: "Bộ Metrics Forecast Accuracy",
        content: "4 dimensions cần đo:",
        bullets: [
          "Accuracy: MAPE, MAE, RMSE — sai bao nhiêu",
          "Bias: mean error — thiên over hay under",
          "Tracking: systematic drift detection",
          "Value: FVA — manual input có help không",
        ],
      },
      {
        id: "mape-deep",
        title: "MAPE — Ưu và Nhược",
        content: "Metric phổ biến nhất nhưng có pitfalls:",
        bullets: [
          "Ưu: % dễ communicate, scale-independent",
          "Nhược: actual≈0 → infinite, asymmetric (under penalized less)",
          "Fix: WMAPE, sMAPE, hoặc exclude near-zero SKUs",
          "Target by segment, not portfolio average",
        ],
      },
      {
        id: "bias-ts",
        title: "Bias và Tracking Signal",
        content: "Detect systematic over/under forecasting:",
        bullets: [
          "Bias = mean(F-A): target ≈ 0",
          "Positive bias → excess inventory",
          "TS = cumsum(error)/MAD: |TS|>4 → alert",
          "Bias correction: multiply forecast by (1-bias%)",
        ],
      },
      {
        id: "fva",
        title: "Forecast Value Add",
        content: "Đo giá trị judgmental override:",
        bullets: [
          "FVA = MAPE_stat - MAPE_final",
          "Positive: manual added value",
          "Negative: revert to statistical",
          "Track per planner và per SKU category",
        ],
      },
      {
        id: "segmentation",
        title: "Segmented Accuracy Reporting",
        content: "Không report single portfolio number:",
        bullets: [
          "By ABC-XYZ: AX target <20%, CZ <45%",
          "By horizon: 1-month vs 3-month",
          "By region/channel",
          "By forecast method used",
        ],
      },
      {
        id: "targets",
        title: "Setting Accuracy Targets",
        content: "Realistic targets based on forecastability:",
        bullets: [
          "Benchmark vs naive first — MASE < 1 mandatory",
          "Industry benchmark: FMCG 25-30%, pharma 20-25%",
          "Improve 2-3% per quarter realistic",
          "Don't set 10% MAPE for intermittent portfolio",
        ],
      },
      {
        id: "review-process",
        title: "Forecast Review Meeting",
        content: "Monthly accuracy review agenda:",
        bullets: [
          "Review portfolio + segmented accuracy",
          "Top 20 worst SKUs root cause",
          "Tracking signal alerts action items",
          "FVA report: override quality",
          "Model change recommendations",
        ],
      },
      {
        id: "python-impl",
        title: "Python Implementation",
        content: "Automated accuracy pipeline:",
        bullets: [
          "Batch calculate per SKU monthly",
          "Dashboard: Plotly/Streamlit segmented view",
          "Alert rules: TS>4, MAPE>threshold",
          "Export to S&OP meeting pack",
        ],
      },
    ],
    pythonStack: ["pandas", "numpy", "matplotlib", "plotly", "streamlit"],
    implementationNotes:
      "Consistent error definition (A-F). Weighted MAPE for portfolio. Segment before aggregate. Tracking signal alert automation. FVA monthly report. Never single MAPE for heterogeneous portfolio.",
    relatedModuleIds: ["machine-learning", "abc-analysis", "inventory-management"],
    relatedToolIds: ["inventory", "abc"],
    codeExample: `import numpy as np
import pandas as pd

def forecast_metrics(actual, forecast):
    actual, forecast = np.array(actual), np.array(forecast)
    errors = actual - forecast
    abs_errors = np.abs(errors)
    mae = np.mean(abs_errors)
    rmse = np.sqrt(np.mean(errors ** 2))
    mask = actual != 0
    mape = np.mean(abs_errors[mask] / np.abs(actual[mask])) * 100 if mask.any() else np.nan
    bias = np.mean(forecast - actual)
    mad = np.mean(abs_errors)
    ts = np.sum(forecast - actual) / mad if mad > 0 else 0
    naive_mae = np.mean(np.abs(actual[1:] - actual[:-1])) if len(actual) > 1 else mae
    mase = mae / naive_mae if naive_mae > 0 else np.nan
    return {'MAPE': mape, 'MAE': mae, 'RMSE': rmse, 'Bias': bias, 'TS': ts, 'MASE': mase}

def wmape(actual, forecast):
    actual, forecast = np.array(actual), np.array(forecast)
    return np.sum(np.abs(actual - forecast)) / np.sum(np.abs(actual)) * 100

def fva(mape_statistical, mape_final):
    return mape_statistical - mape_final  # positive = manual helped`,
  }),

  entry({
    id: "collaborative-planning-cpfr",
    title: "Lập kế hoạch Hợp tác CPFR",
    subtitle: "Collaborative Planning · Forecasting · Replenishment · VMI",
    category: "Chiến lược",
    language: "Framework + Practice",
    difficulty: "Nâng cao",
    readingTime: "55 phút",
    tags: ["CPFR", "VMI", "Collaboration", "Bullwhip", "POS", "Retail Link"],
    summary:
      "Hướng dẫn toàn diện CPFR (Collaborative Planning, Forecasting and Replenishment): 9 bước VICS model, VMI, POS data sharing, giảm bullwhip, và triển khai thực tế cho manufacturer-retailer VN.",
    overview:
      "CPFR là framework hợp tác giữa trading partners — manufacturer, distributor, retailer — để đồng bộ forecast, order, và replenishment. Mục tiêu: giảm bullwhip effect, giảm inventory toàn chuỗi, tăng fill rate. Walmart Retail Link là case study kinh điển. Bài viết cover 9-step CPFR model, VMI variants, technology requirements, KPI chung, và roadmap triển khai cho thị trường VN.",
    scientificBasis:
      "Forrester Effect (Bullwhip, 1961): demand signal distortion amplifies upstream. CPFR reduces bullwhip via information sharing (POS data), coordinated forecasting, và synchronized replenishment. Game theory: collaboration Pareto-improves vs non-cooperative equilibrium khi trust và information transparency exist.",
    whenToUse:
      "Manufacturer-retailer/distributor relationship strategic, high volume, recurring replenishment. Khi bullwhip ratio >2, excess inventory cả hai bên, hoặc chronic stockout/sync issues.",
    whenNotToUse:
      "Transactional spot-buy relationship, low volume, hoặc partner không willing share data. One-time project orders.",
    vietnamContext:
      "Modern trade VN (WinMart, Co.opmart, Bach Hoa Xanh) bắt đầu yêu cầu EDI forecast từ suppliers. Manufacturer FMCG VN (Unilever, P&G, local brands) triển khai CPFR với top retailers. Thách thức: traditional trade 70% thị trường — CPFR khó scale. Bắt đầu với top 5-10 accounts modern trade.",
    keyConcepts: [
      "CPFR — Collaborative Planning, Forecasting and Replenishment",
      "9-step VICS/GS1 model",
      "Front-end agreement — goals, KPIs, confidentiality",
      "Joint business plan — events, promotions calendar",
      "Sales forecast collaboration — shared forecast",
      "Order forecast — translate to replenishment orders",
      "Order generation and fulfillment sync",
      "Exception management — resolve forecast gaps",
      "VMI — Vendor Managed Inventory",
      "POS data sharing — actual sell-through",
      "Bullwhip ratio reduction target",
      "Frozen zone và order lead time agreement",
      "Fill rate và inventory turns joint KPI",
      "EDI/API data exchange standards",
      "Trust và governance framework",
      "Pilot → scale rollout approach",
    ],
    applications: [
      "FMCG manufacturer ↔ modern trade retailer CPFR",
      "Supplier VMI cho top 20 distributors",
      "POS-driven replenishment cho convenience chain",
      "Promo collaboration — joint forecast uplift",
      "New product launch coordinated pipeline fill",
    ],
    methods: [
      "9-step CPFR VICS model",
      "VMI min-max replenishment",
      "POS-based demand sensing",
      "Exception-based management workflow",
      "Joint S&OP meeting monthly",
    ],
    stepByStep: [
      "Bước 1: Front-end agreement — scope, KPIs, data sharing MOU",
      "Bước 2: Joint business plan — promo calendar, NPD, seasonality",
      "Bước 3: Sales forecast — both parties submit, reconcile",
      "Bước 4: Resolve forecast exceptions — gap >threshold",
      "Bước 5: Order forecast — convert to replenishment plan",
      "Bước 6: Order generation — VMI auto or manual approval",
      "Bước 7: Order fulfillment — OTIF commitment",
      "Bước 8: Exception management ongoing — stockout, overstock alerts",
      "Bước 9: Monthly CPFR review — KPI dashboard, continuous improvement",
      "Bước 10: Scale to additional SKUs và partners",
    ],
    pitfalls: [
      "CPFR chỉ trên paper — không share POS data thực",
      "One-sided benefit — retailer gain, supplier bear cost",
      "Không có exception management process",
      "Forecast frozen zone không agreed — constant changes",
      "Technology gap — Excel email thay EDI/API",
      "Không measure joint KPI — revert to blame game",
    ],
    formulas: [
      {
        name: "Bullwhip Ratio",
        expression: "BW = σ²_upstream / σ²_downstream",
        variables: "Target CPFR: BW < 1.5 (from typical 2-4)",
      },
      {
        name: "VMI Reorder Point",
        expression: "ROP = Lead time demand + Safety stock at retailer",
        variables: "Supplier monitors và triggers replenishment",
      },
      {
        name: "Fill Rate (Joint KPI)",
        expression: "FR = Orders fulfilled complete / Orders placed × 100%",
        variables: "Target ≥95% both parties",
      },
      {
        name: "Inventory Turns Improvement",
        expression: "Δ Turns = Turns_after - Turns_before",
        variables: "CPFR target: +15-30% turns both parties",
      },
    ],
    metrics: [
      {
        name: "Bullwhip Ratio",
        formula: "σ² manufacturer orders / σ² retail sales",
        benchmark: "<1.5 với CPFR (vs 2-4 without)",
        interpretation: "Đo mức giảm demand distortion",
      },
      {
        name: "Forecast Accuracy (Joint)",
        formula: "MAPE on shared consensus forecast",
        benchmark: "<25% at SKU level",
        interpretation: "Both parties accountable",
      },
      {
        name: "OTIF",
        formula: "On-time in-full / Total orders",
        benchmark: "≥95%",
        interpretation: "Execution metric — CPFR fails without OTIF",
      },
    ],
    caseStudies: [
      {
        title: "FMCG manufacturer ↔ WinMart CPFR pilot",
        context: "Top 50 SKU, 18 months collaboration, shared EDI",
        challenge: "Bullwhip ratio 3.2, retailer stockout 12%, manufacturer excess production",
        solution: "CPFR 9-step, weekly POS feed, VMI cho 20 SKU highest volume",
        result: "Bullwhip 3.2→1.4, retailer stockout 12%→4%, manufacturer inventory -20%",
      },
      {
        title: "Beer brewer — distributor VMI",
        context: "150 distributors, top 20 = 60% volume",
        challenge: "Distributor order batching gây bullwhip, production plan volatile",
        solution: "VMI min-max cho top 20, POS sell-through data, monthly joint forecast",
        result: "Production plan stability +35%, distributor fill rate 91%→97%",
      },
      {
        title: "Electronics brand — new product launch CPFR",
        context: "Launch smartphone accessory, 3 retailer partners",
        challenge: "Pipeline fill vs sell-through mismatch, overstock 40% week 4",
        solution: "Joint launch plan, daily POS first 8 weeks, agile replenishment",
        result: "Launch fill rate 96%, markdown only 8% (vs 25% industry avg)",
      },
    ],
    faq: [
      {
        question: "CPFR khác VMI thế nào?",
        answer:
          "VMI là subset của CPFR — supplier manages retailer inventory. CPFR broader: joint forecasting, planning, exception management. VMI focus execution. CPFR = strategy, VMI = tactic.",
      },
      {
        question: "Ai benefit nhiều hơn từ CPFR?",
        answer:
          "Cả hai khi done right — Pareto improvement. Retailer: less stockout, lower inventory. Manufacturer: stable production, less bullwhip. Requires fair risk/cost sharing.",
      },
      {
        question: "Bắt đầu CPFR với bao nhiêu SKU?",
        answer:
          "Pilot 20-50 top SKU (class A, high volume, recurring). Prove KPI improvement 3-6 tháng. Scale gradually. Don't boil the ocean.",
      },
      {
        question: "POS data sharing — retailer không muốn?",
        answer:
          "Common barrier. Offer value: better fill rate, promo support, VMI reduce retailer workload. Start với aggregate category data nếu SKU-level sensitive.",
      },
      {
        question: "CPFR cho traditional trade VN?",
        answer:
          "Khó — thiếu POS data, fragmented outlets. Focus modern trade và top distributors có system. Traditional trade dùng distributor VMI thay.",
      },
      {
        question: "Technology cần gì cho CPFR?",
        answer:
          "Minimum: shared Excel + email (pilot). Scale: EDI (EDIFACT/X12), API integration, CPFR platform (Kinaxis, E2open). Retailer portal cho forecast upload.",
      },
      {
        question: "Exception threshold bao nhiêu?",
        answer:
          "Forecast gap >15-20% trigger exception review. Stockout alert <2 days cover. Overstock >8 weeks supply. Customize per category velocity.",
      },
      {
        question: "CPFR meeting frequency?",
        answer:
          "Monthly joint business review (strategic). Weekly operational (forecast, exceptions). Daily POS monitoring launch/promo periods.",
      },
      {
        question: "Bullwhip ratio đo thế nào?",
        answer:
          "Variance manufacturer orders / variance retail sales (or POS). Ratio >1 = bullwhip present. Track monthly, target reduction 30-50% trong year 1 CPFR.",
      },
      {
        question: "Legal/confidentiality concerns?",
        answer:
          "Front-end agreement cover: data use scope, confidentiality, competitive firewalls. POS data only for replenishment, not competitive intelligence.",
      },
      {
        question: "CPFR và S&OP relationship?",
        answer:
          "CPFR extends S&OP external — include trading partner. Internal S&OP output feeds CPFR sales forecast step. Joint S&OP meeting với key accounts quarterly.",
      },
      {
        question: "ROI CPFR bao lâu?",
        answer:
          "Pilot ROI 6-12 tháng typical: inventory reduction 15-25%, stockout reduction 30-50%, admin cost reduction. Investment: technology + dedicated CPFR team 2-3 FTE.",
      },
    ],
    glossary: [
      { term: "CPFR", definition: "Collaborative Planning, Forecasting and Replenishment — framework hợp tác chuỗi cung ứng" },
      { term: "VMI", definition: "Vendor Managed Inventory — nhà cung cấp quản lý tồn kho khách hàng" },
      { term: "POS", definition: "Point of Sale — dữ liệu bán lẻ thực tế tại quầy" },
      { term: "Bullwhip", definition: "Hiệu ứng khuếch đại biến động nhu cầu lên upstream" },
      { term: "EDI", definition: "Electronic Data Interchange — trao đổi dữ liệu chuẩn giữa partners" },
    ],
    sections: [
      {
        id: "cpfr-model",
        title: "9-Step CPFR Model (VICS/GS1)",
        content: "Framework chuẩn 9 bước:",
        bullets: [
          "1. Front-end agreement",
          "2. Joint business plan",
          "3. Sales forecast (collaborative)",
          "4. Resolve exceptions — forecast",
          "5. Order forecast",
          "6. Resolve exceptions — orders",
          "7. Order generation",
          "8. Order fulfillment",
          "9. Exception management + review",
        ],
      },
      {
        id: "vmi",
        title: "Vendor Managed Inventory",
        content: "VMI models và mechanics:",
        bullets: [
          "Supplier monitors retailer inventory levels",
          "Auto-replenish khi hit min (ROP)",
          "Retailer owns inventory, supplier manages",
          "Requires trust + visibility + agreement on service level",
        ],
      },
      {
        id: "bullwhip",
        title: "Giảm Bullwhip Effect",
        content: "CPFR targets demand distortion:",
        bullets: [
          "Share POS data — see actual sell-through",
          "Reduce order batching — frequent smaller orders",
          "Coordinate promo — no surprise spikes",
          "Target bullwhip ratio <1.5",
        ],
      },
      {
        id: "data-exchange",
        title: "Data Exchange và Technology",
        content: "Information flow requirements:",
        bullets: [
          "POS sell-through daily/weekly",
          "Inventory on-hand at retailer",
          "Shared forecast upload/download",
          "EDI/API preferred, Excel acceptable for pilot",
        ],
      },
      {
        id: "governance",
        title: "Governance và Trust",
        content: "Relationship management critical:",
        bullets: [
          "Front-end agreement: scope, KPIs, confidentiality",
          "Joint team: demand planner + account manager each side",
          "Escalation path for exceptions",
          "Fair benefit sharing — win-win",
        ],
      },
      {
        id: "kpi-joint",
        title: "Joint KPIs",
        content: "Metrics both parties track:",
        bullets: [
          "Fill rate ≥95%",
          "Forecast accuracy MAPE <25%",
          "Inventory turns improvement",
          "Bullwhip ratio reduction",
          "OTIF execution",
        ],
      },
      {
        id: "vn-rollout",
        title: "Triển khai tại Việt Nam",
        content: "Roadmap thực tế cho thị trường VN:",
        bullets: [
          "Phase 1: Top 3-5 modern trade accounts",
          "Phase 2: Top 20 distributors VMI",
          "Phase 3: EDI integration scale",
          "Traditional trade: indirect via distributor CPFR",
        ],
      },
      {
        id: "pilot",
        title: "Pilot Design",
        content: "Prove concept trước khi scale:",
        bullets: [
          "20-50 SKU class A, 1-2 partners",
          "3-6 month pilot duration",
          "Baseline KPI before start",
          "Success criteria defined upfront",
          "Dedicated CPFR team 2-3 FTE",
        ],
      },
    ],
    pythonStack: ["pandas", "numpy", "matplotlib", "requests", "edi"],
    implementationNotes:
      "Start pilot small. POS data pipeline critical. Exception workflow before automation. Joint KPI dashboard shared both parties. Monthly review non-negotiable. Scale technology after proving ROI.",
    relatedModuleIds: ["machine-learning", "inventory-management", "abc-analysis"],
    relatedToolIds: ["inventory"],
    codeExample: `import pandas as pd
import numpy as np

def bullwhip_ratio(upstream_orders, downstream_sales):
    """Tính bullwhip ratio — target < 1.5 với CPFR."""
    var_up = np.var(upstream_orders)
    var_down = np.var(downstream_sales)
    return var_up / var_down if var_down > 0 else np.nan

def cpfr_forecast_reconcile(mfr_forecast, retailer_forecast, threshold=0.15):
    """Reconcile forecast gaps > threshold — flag exceptions."""
    mfr = np.array(mfr_forecast)
    rtl = np.array(retailer_forecast)
    gap = np.abs(mfr - rtl) / np.maximum(rtl, 1)
    exceptions = gap > threshold
    consensus = np.where(exceptions, (mfr + rtl) / 2, (mfr + rtl) / 2)
    return consensus, exceptions

def vmi_reorder_trigger(on_hand, avg_daily_sales, lead_time, safety_stock):
    """VMI: trigger replenishment khi inventory hit ROP."""
    rop = avg_daily_sales * lead_time + safety_stock
    order_qty = max(0, rop * 2 - on_hand)  # replenish to 2× ROP
    return on_hand <= rop, order_qty`,
  }),
];