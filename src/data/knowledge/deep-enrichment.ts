import type { KnowledgeEntry } from "./types";

type Enrichment = Partial<
  Pick<
    KnowledgeEntry,
    | "overview"
    | "scientificBasis"
    | "vietnamContext"
    | "keyConcepts"
    | "applications"
    | "stepByStep"
    | "pitfalls"
    | "formulas"
    | "metrics"
    | "caseStudies"
    | "faq"
    | "glossary"
    | "sections"
    | "implementationNotes"
  >
>;

export const deepEnrichment: Record<string, Enrichment> = {
  "supply-chain-analytics-python": {
    overview:
      "Phân tích chuỗi cung ứng không chỉ là vẽ biểu đồ — đó là hệ thống quyết định liên kết dữ liệu vận hành với chính sách tồn kho, mua hàng, và phân phối. Một analyst giỏi phải hiểu cả business context (ai chịu trách nhiệm class A?) lẫn statistical rigor (distribution nào cho safety stock?).\n\nPipeline chuẩn gồm: Data Engineering (ETL từ ERP/WMS) → Descriptive Analytics (ABC, KPI) → Prescriptive Analytics (EOQ, SS) → Simulation (Monte Carlo risk) → Monitoring (dashboard + alert). Mỗi bước cần documentation assumption rõ ràng để audit và handover.",
    vietnamContext:
      "Thực tế VN: dữ liệu thường nằm rải rác Excel + phần mềm kế toán (MISA, Fast) + WMS riêng. Bước đầu không cần data lake — consolidate CSV hàng tuần đã cải thiện đáng kể. Chuỗi bán lẻ VN có seasonality mạnh Tết (2-4 tuần trước), mưa bão miền Trung ảnh hưởng giao hàng, và promo 11.11/12.12 cần tách khỏi baseline forecast.",
    sections: [
      {
        id: "data-foundation",
        title: "Nền tảng dữ liệu — Data Foundation",
        content:
          "Trước khi chạy ABC hay EOQ, cần master data sạch. SKU master phải có: mã duy nhất, mô tả, đơn vị đo, unit cost, supplier, lead time, MOQ, shelf life (nếu có). Sales history cần: date, SKU, quantity, location, channel. Thiếu một trường có thể làm sai toàn bộ phân loại.\n\nQuy tắc vàng: một SKU một định nghĩa — tránh trùng mã do typo hoặc legacy system. Merge duplicate trước khi phân tích.",
        bullets: [
          "SKU master: id, cost, lead_time, moq, category, supplier_id",
          "Sales: date, sku_id, qty, revenue, warehouse_id, channel",
          "Inbound: po_date, receipt_date, qty — tính lead time thực tế",
          "Minimum 6 tháng history, lý tưởng 24 tháng cho seasonality",
          "Outlier flag: promo spike, stockout zero-sale days",
          "Unit harmonization: thùng vs chai vs kg",
          "Null handling: impute hoặc exclude có documentation",
          "Version control: snapshot data mỗi lần chạy policy",
        ],
      },
      {
        id: "abc-deep",
        title: "ABC Analysis — Chuyên sâu",
        content:
          "ABC dựa trên Pareto: thường 20% SKU tạo 80% giá trị tiêu thụ. Nhưng ngưỡng 80/15/5 không phải bắt buộc — điều chỉnh theo ngành. Automotive spare parts có thể 70/20/10; fashion có tail dài hơn.\n\nDùng annual consumption VALUE (cost × qty) chứ không phải revenue — margin cao SKU doanh thu thấp vẫn quan trọng. Với multi-warehouse, chạy ABC global và ABC per-location.",
        bullets: [
          "Value = unit_cost × annual_demand (không dùng selling price)",
          "Cumulative %: sort desc, cumsum / total",
          "A: cum ≤80%, B: ≤95%, C: còn lại",
          "Multi-criteria ABC: thêm margin, strategic flag",
          "Re-classify quarterly hoặc khi launch/discontinue SKU",
          "ABC per warehouse cho allocation policy",
          "Visual: Pareto chart + table export cho buyers",
          "Governance: ai approve thay đổi class A?",
        ],
      },
      {
        id: "xyz-deep",
        title: "XYZ — Độ biến động nhu cầu",
        content:
          "XYZ đo predictability qua Coefficient of Variation CV = σ/μ. X (CV<0.5): ổn định, forecast dễ. Y (0.5-1.0): trung bình. Z (>1.0): intermittent/lumpy, cần Croston thay EOQ.\n\nKết hợp ABC-XYZ tạo matrix 9 ô — mỗi ô một policy khác nhau. AX: tight control, high SS, weekly review. CZ: simple min-max hoặc order-as-needed.",
        bullets: [
          "CV tính trên monthly demand 12 tháng",
          "Loại zero months nếu do stockout (censored demand)",
          "AX: forecast weekly, SS 98-99%, cycle count weekly",
          "AY: forecast bi-weekly, SS 95%",
          "AZ: Croston/SBA, review monthly",
          "CX: quarterly review, low SS acceptable",
          "Matrix heatmap cho management presentation",
          "Link matrix → WMS slotting + count frequency",
        ],
      },
      {
        id: "eoq-practice",
        title: "EOQ trong thực tế VN",
        content:
          "EOQ cổ điển assume constant demand, zero lead time variability, unlimited capacity. Thực tế VN: MOQ nhà cung cấp thường lớn hơn EOQ, chi phí S khó đo (gồm cả thời gian buyer), H phụ thuộc cost of capital 8-12%/năm.\n\nKhi EOQ < MOQ: order MOQ và tính holding cost thực tế. Khi nhiều SKU cùng supplier: consolidate order để share S.",
        bullets: [
          "H = unit_cost × holding_rate (15-25%/năm all-in)",
          "S = admin + freight inbound + receiving labor",
          "MOQ constraint: Q_actual = max(Q*, MOQ)",
          "Container fill: round up to full container nếu tiết kiệm freight",
          "Review EOQ khi D thay đổi >20% YoY",
          "Sensitivity table: Q* vs S và H ±30%",
          "Document mọi assumption trong policy sheet",
        ],
      },
      {
        id: "safety-stock-deep",
        title: "Safety Stock — Chi tiết tính toán",
        content:
          "SS bảo vệ khỏi uncertainty trong lead time và demand. Công thức phổ biến SS = Z × σ_d × √L (LT cố định). Khi cả demand và LT random: SS = Z × √(Lσ²_d + d²σ²_L).\n\nZ mapping: 90%=1.28, 95%=1.65, 98%=2.05, 99%=2.33. Mỗi 1% service level tăng → SS tăng không tuyến tính — class C không cần 99%.",
        bullets: [
          "σ_d: std dev daily/monthly demand từ history",
          "σ_L: std dev lead time từ PO receipt dates",
          "Service level chọn theo ABC + margin contribution",
          "Cycle service level ≠ fill rate — đừng nhầm",
          "Simulation validate: stockout rate thực tế vs target",
          "Days of SS = SS / daily_demand — communicate cho sales",
          "Tết: tăng SS 2-3x hoặc separate seasonal buffer",
        ],
      },
      {
        id: "monte-carlo",
        title: "Monte Carlo Simulation",
        content:
          "Simulation mô phỏng 1000+ kịch bản nhu cầu ngẫu nhiên để estimate stockout probability khi distribution không normal hoặc có nhiều uncertainty sources.\n\nInput: demand distribution (normal, empirical, bootstrap), lead time distribution, initial inventory, reorder policy. Output: distribution stockout days, fill rate, average inventory.",
        bullets: [
          "≥1000 iterations cho stable estimate",
          "Empirical bootstrap từ history khi non-normal",
          "Combine demand + LT uncertainty",
          "What-if: LT tăng 50% post-disruption",
          "Output: histogram inventory, % stockout",
          "Compare policies: (s,S) vs ROP vs periodic review",
          "Present P5/P50/P95 inventory investment",
        ],
      },
      {
        id: "kpi-dashboard",
        title: "Dashboard KPI vận hành",
        content:
          "Dashboard phải actionable — mỗi KPI có owner, target, frequency, và action khi đỏ. Tránh vanity metrics. Tier 1 (daily): fill rate, stockout class A. Tier 2 (weekly): inventory turnover, OTIF. Tier 3 (monthly): forecast accuracy, carrying cost.",
        bullets: [
          "Fill rate = lines fulfilled complete / total lines",
          "Stockout rate = OOS SKU count / active SKU",
          "Inventory turnover = COGS / avg inventory",
          "Days of supply = inventory / avg daily sales",
          "Traffic light: green ±5% target, yellow ±10%, red >10%",
          "Drill-down: KPI đỏ → pareto root cause",
          "Mobile-friendly cho ops manager gemba",
        ],
      },
      {
        id: "python-pipeline",
        title: "Pipeline Python production",
        content:
          "Chuyển từ notebook Jupyter sang pipeline lặp lại: script scheduled (cron/GitHub Actions), input/output CSV hoặc DB, log file, email alert khi anomaly.\n\nStructure: config.yaml (thresholds), data_loader.py, analytics.py, report_generator.py. Test với pytest trên sample data.",
        bullets: [
          "pandas + numpy vectorized — không loop SKU",
          "config external: ABC thresholds, service levels",
          "Output: policy CSV + HTML/PDF report",
          "Schedule weekly refresh",
          "Unit test EOQ, ABC với known inputs",
          "Error handling: missing SKU, negative qty",
        ],
      },
    ],
    faq: [
      {
        question: "Cần bao nhiêu tháng dữ liệu để bắt đầu ABC-XYZ?",
        answer:
          "Tối thiểu 6 tháng cho ABC (value ranking ổn định hơn). XYZ cần 12 tháng để tính CV có ý nghĩa. Lý tưởng 24 tháng để thấy full seasonality. Với SKU mới <6 tháng: dùng analog product hoặc tạm class B cho đến khi đủ data.",
      },
      {
        question: "Excel đủ hay bắt buộc Python?",
        answer:
          "Excel đủ cho <500 SKU và team nhỏ — nhưng dễ lỗi formula copy, khó version control. Python khi >1000 SKU, cần automation weekly, hoặc integrate nhiều nguồn data. Bắt đầu Excel proof-of-concept → migrate Python khi validate logic.",
      },
      {
        question: "Làm sao xử lý ngày stockout (sale = 0) trong history?",
        answer:
          "Stockout gây censored demand — sale 0 không có nghĩa demand 0. Options: (1) exclude ngày OOS khỏi σ calculation, (2) impute từ adjacent periods, (3) dùng lost sales estimation. Document method. Nếu bỏ qua → σ thấp → SS thấp → stockout tiếp.",
      },
      {
        question: "ABC theo revenue hay margin?",
        answer:
          "Ưu tiên consumption value (cost × qty) hoặc contribution margin (selling - variable cost) × qty. Revenue alone misleading khi SKU margin khác nhau mạnh. Với retail, có thể dual ABC: value ABC + margin ABC.",
      },
      {
        question: "Monte Carlo cần giả định phân phối nào?",
        answer:
          "Kiểm tra normality bằng histogram/Q-Q plot. Nếu skewed (promo spikes): dùng empirical bootstrap từ history. Lead time thường discrete — sample từ empirical distribution PO receipts. Không assume normal blind.",
      },
      {
        question: "Bao lâu re-run policy một lần?",
        answer:
          "ABC/XYZ: quarterly. EOQ/SS parameters: monthly hoặc khi lead time/cost thay đổi >10%. Daily ops dùng ROP trigger tự động từ system. Annual full review với finance validation carrying cost.",
      },
      {
        question: "Làm sao convince management tăng SS trước Tết?",
        answer:
          "Show simulation: stockout probability Tết vs SS hiện tại. Quantify lost sales class A × margin. Compare carrying cost increase (có hạn) vs stockout cost. Historical Tết stockout cases nếu có.",
      },
      {
        question: "Integration với ERP/WMS thế nào?",
        answer:
          "Export CSV/API từ ERP (SAP, Oracle, local) → Python pipeline → import policy file (min/max, ROP) vào WMS. Phase 1: manual upload weekly. Phase 2: API automation. Đảm bảo SKU ID mapping consistent.",
      },
    ],
    glossary: [
      { term: "Pareto Principle", definition: "80/20 — phần lớn effect từ minority causes; nền tảng ABC" },
      { term: "Censored Demand", definition: "Demand thực bị ẩn khi stockout — sale ghi nhận thấp hơn thực tế" },
      { term: "Carrying Cost", definition: "Chi phí giữ tồn kho: vốn, kho, bảo hiểm, hỏng hóc, obsolescence" },
      { term: "Cycle Stock", definition: "Tồn do batch ordering — trung bình Q/2 trong EOQ model" },
      { term: "Pipeline Stock", definition: "Hàng đang trên đường = demand rate × lead time" },
      { term: "Fill Rate", definition: "% demand satisfied từ stock ngay lập tức" },
      { term: "Stockout", definition: "Không đủ hàng đáp ứng demand khi cần" },
      { term: "MOQ", definition: "Minimum Order Quantity — ràng buộc NCC tối thiểu mỗi lần đặt" },
      { term: "Lead Time", definition: "Thời gian từ đặt hàng đến nhận hàng usable" },
      { term: "ROP", definition: "Reorder Point — mức tồn trigger đặt hàng mới" },
    ],
    caseStudies: [
      {
        title: "Chuỗi siêu thị miền Bắc — 12.000 SKU, 45 cửa hàng",
        context: "DC Hà Nội, WMS cơ bản, forecast Excel, stockout class A 8%",
        challenge: "Không phân biệt policy theo SKU importance, tồn C chiếm 55% vốn",
        solution: "ABC-XYZ matrix, EOQ+SS cho 800 SKU A/B, giảm tồn C 30%, Monte Carlo validate Tết buffer",
        result: "Fill rate 91%→97%, inventory -18% trong 9 tháng, stockout A <2%",
      },
      {
        title: "Manufacturer linh kiện điện tử Bình Dương",
        context: "Import raw material TQ, 2.000 SKU, lead time 14-28 ngày biến động",
        challenge: "SS tính cố định LT=14 → stockout khi customs delay",
        solution: "Combined SS formula với σ_L từ 18 tháng PO data, simulation customs +7 ngày scenario",
        result: "Stockout giảm 40%, SS investment +12% nhưng production stop giảm 85%",
      },
    ],
  },

  "eoq-inventory-theory": {
    sections: [
      {
        id: "cost-components",
        title: "Thành phần chi phí tồn kho",
        content: "Total inventory cost = Purchase + Ordering + Holding + Shortage. EOQ optimize ordering + holding (purchase constant). Holding cost H thường underestimate.",
        bullets: [
          "Capital cost: WACC 8-15%/năm VN",
          "Warehouse: rent + utilities allocated per unit",
          "Insurance, taxes on inventory",
          "Obsolescence/shrinkage: 2-10% tùy ngành",
          "Opportunity cost: vốn không invest elsewhere",
          "H = unit_value × annual_holding_rate (20-30% all-in realistic)",
        ],
      },
      {
        id: "u-curve",
        title: "Đường cong U — Intuition",
        content: "Plot TC(Q) = (Q/2)H + (D/Q)S — U-shaped. Q nhỏ: nhiều lần order, S cao. Q lớn: holding cao. Minimum tại Q*.",
        bullets: [
          "EOQ insensitive ±20% around Q* — robust",
          "Total cost flat near optimum",
          "Visualize cho management buy-in",
          "Compare Q*, MOQ, practical order size",
        ],
      },
      {
        id: "quantity-discount",
        title: "Chiết khấu số lượng",
        content: "Supplier offer price breaks at Q1, Q2, Q3. Algorithm: compute EOQ, if not in discount range check boundaries, compare total cost including purchase at each break point.",
        bullets: [
          "TC = (Q/2)H + (D/Q)S + P×D",
          "Check Q* và mỗi break point feasible",
          "Chọn Q với minimum TC",
          "Watch inventory carrying của large order",
        ],
      },
      {
        id: "epq-model",
        title: "EPQ — Economic Production Quantity",
        content: "Khi sản xuất nội bộ liên tục thay vì order: EPQ = √(2DS/(H(1-d/p))). d=consumption rate, p=production rate. Max inventory < Q vì produce during consumption.",
        bullets: [
          "d/p ratio quan trọng — không produce instant",
          "Avg inventory = Q(1-d/p)/2",
          "Run time = Q/p, cycle time = Q/d",
          "Phù hợp manufacturing VN make-to-stock",
        ],
      },
    ],
    faq: [
      { question: "Ordering cost S đo thế nào?", answer: "Tổng chi phí mỗi lần đặt: buyer time (1-2h × salary), PO processing, inbound freight amortized, receiving QC labor, system transaction. Survey 3-5 recent orders lấy average. Thường $30-200/order tùy quy mô." },
      { question: "EOQ và MRP có conflict?", answer: "EOQ là unconstrained ideal. MRP netting requirements theo BOM và schedule. Dùng EOQ làm sanity check order quantity MRP suggest — nếu MRP order quá nhỏ → ordering cost cao." },
    ],
  },

  "openboxes-wms": {
    sections: [
      {
        id: "inventory-states",
        title: "Trạng thái tồn kho trong WMS",
        content: "On-hand ≠ Available. WMS track multiple states: on-hand physical, allocated to orders, picked, in-transit, quarantine QC, damaged.",
        bullets: [
          "On-hand: physical in warehouse",
          "Allocated: reserved for confirmed orders",
          "Available = On-hand - Allocated - Hold",
          "ATP = Available + Inbound expected - Outbound committed",
          "Oversell khi confuse on-hand vs available",
          "Status transition rules phải documented",
        ],
      },
      {
        id: "picking-strategies",
        title: "Chiến lược Picking",
        content: "Discrete (1 order/pick), Batch (multi-order 1 trip), Zone (picker stays zone), Wave (batch by cutoff). E-commerce thường batch+wave.",
        bullets: [
          "Discrete: accuracy cao, productivity thấp",
          "Batch: cần sort-after-pick station",
          "Zone: conveyor connect zones",
          "Wave: release theo carrier cutoff 14h, 17h",
          "Pick-to-light/cart for batch efficiency",
        ],
      },
      {
        id: "cycle-count-program",
        title: "Chương trình Kiểm kê xoay vòng",
        content: "Full physical count 1x/năm disrupt ops. Cycle count liên tục: count subset daily theo ABC.",
        bullets: [
          "Class A: weekly or daily count",
          "Class B: monthly",
          "Class C: quarterly",
          "Root cause mọi variance >threshold",
          "Target accuracy ≥99.5%",
          "Blind count — counter không thấy system qty",
        ],
      },
    ],
    faq: [
      { question: "WMS cloud hay on-premise?", answer: "Cloud (SaaS): nhanh deploy, update tự động, phù hợp SME/e-commerce. On-premise: customization sâu, data control, enterprise. VN nhiều SME chọn cloud WMS hoặc module KiotViet/Haravan." },
      { question: "Barcode hay RFID?", answer: "Barcode: rẻ, proven, cần line-of-sight scan. RFID: batch read, đắt, phù hợp high-value hoặc pallet level. Đa số kho VN barcode đủ ROI." },
    ],
  },

  "fleetbase-tms": {
    sections: [
      {
        id: "vrp-variants",
        title: "Các biến thể VRP",
        content: "CVRP: capacity constraint. VRPTW: time windows. MDVRP: multi depot. PDPTW: pickup-delivery pairs. Chọn variant match business.",
        bullets: [
          "CVRP: weight/volume per vehicle",
          "VRPTW: customer delivery window 9-12h",
          "MDVRP: ship from nearest depot",
          "Heterogeneous fleet: truck sizes khác nhau",
          "OR-Tools RoutingModel handle most variants",
        ],
      },
      {
        id: "freight-audit",
        title: "Freight Audit",
        content: "Compare carrier invoice vs contract rate, weight audit, accessorial charges. Typical savings 2-5% freight spend.",
        bullets: [
          "Rate card by lane + weight break",
          "Auto flag invoice mismatch",
          "Detention/demurrage validation",
          "Duplicate charge detection",
          "Monthly accrual vs actual",
        ],
      },
    ],
    faq: [
      { question: "Own fleet hay thuê carrier?", answer: "Own: control, fixed cost cao, phù hợp dense routes cố định. Carrier: variable cost, flexibility, phù hợp peak và remote areas. Hybrid phổ biến VN: own core routes + outsource overflow." },
    ],
  },

  "incoterms-2020": {
    sections: [
      {
        id: "group-e",
        title: "Nhóm E — EXW",
        content: "EXW: seller minimum obligation. Buyer lo mọi thứ từ lấy hàng tại xưởng seller. Rủi ro buyer sớm nhất.",
        bullets: ["Seller: đóng gói tại premises", "Buyer: export clearance, freight, import", "Ít dùng cho buyer không có kinh nghiệm export", "Giá EXW thấp nhưng total landed cost có thể cao hơn FOB"],
      },
      {
        id: "group-f",
        title: "Nhóm F — FCA, FAS, FOB",
        content: "Seller giao cho carrier tại điểm named. FOB chỉ đường biển nội địa — không dùng container tại depot (dùng FCA).",
        bullets: [
          "FCA: multimodal, giao tại depot/carrier",
          "FOB: risk chuyển khi hàng qua lan tàu",
          "FAS: hàng đặt cạnh tàu tại cảng",
          "Exporter VN thường quote FOB hoặc FCA",
        ],
      },
      {
        id: "group-c",
        title: "Nhóm C — CFR, CIF, CPT, CIP",
        content: "Seller trả freight đến destination named. Rủi ro chuyển sớm (tại origin) nhưng cost đến dest do seller — two critical points.",
        bullets: [
          "CIF: seller mua insurance minimum ICC(C)",
          "CIP: seller insurance ICC(A) broader",
          "CFR/CIF: sea only",
          "CPT/CIP: multimodal",
          "Buyer vẫn lo import clearance (trừ DDP)",
        ],
      },
      {
        id: "group-d",
        title: "Nhóm D — DAP, DPU, DDP",
        content: "Seller giao tại destination. DDP: seller lo cả import duty — rủi ro cao nhất cho seller.",
        bullets: [
          "DAP: delivered at place, buyer unload + import",
          "DPU: seller unload (thay DAT 2010)",
          "DDP: all-in delivered, seller import clearance",
          "DDP cần seller hiểu import regime nước đích",
        ],
      },
    ],
    faq: [
      { question: "Incoterms quy định transfer ownership?", answer: "KHÔNG. Incoterms chỉ delivery, risk transfer, cost allocation. Ownership/title theo hợp đồng mua bán và luật applicable." },
      { question: "FOB container tại depot Cát Lái?", answer: "Sai terminology. Dùng FCA Cát Lái depot. FOB chỉ khi hàng thực sự loaded on vessel tại cảng." },
    ],
  },
};