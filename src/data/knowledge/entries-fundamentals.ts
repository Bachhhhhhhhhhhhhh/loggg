import { entry } from "./helpers";
import type { KnowledgeEntry } from "./types";

export const fundamentalsEntries: KnowledgeEntry[] = [
  entry({
    id: "cross-docking-operations",
    title: "Vận hành Cross-Docking",
    subtitle: "Flow-through · Pre-distribution · Post-distribution · Transloading",
    category: "Kho bãi",
    language: "Concept + Practice",
    difficulty: "Trung cấp",
    readingTime: "50 phút",
    tags: ["Cross-Dock", "Flow-through", "Transloading", "DC", "WMS"],
    summary:
      "Hướng dẫn toàn diện cross-docking: pre/post-distribution, flow-through, transloading, thiết kế dock, WMS config, và khi nào cross-dock thay vì storage — đặc biệt cho e-commerce và FMCG VN.",
    overview:
      "Cross-docking là chiến lược kho bãi chuyển hàng trực tiếp từ inbound sang outbound mà không lưu trữ (hoặc lưu <24h). Giảm handling cost 30-50%, lead time 1-2 ngày, và warehouse space requirement. Phù hợp hàng có velocity cao, predictable demand, và consolidation từ nhiều supplier. Bài viết cover 4 loại cross-dock, thiết kế facility, WMS workflow, và decision framework.",
    scientificBasis:
      "Cross-docking minimizes non-value-add storage (Lean waste elimination). Queueing theory: dock scheduling optimization giảm waiting time. Consolidation economics: full truckload từ partial inbound shipments. Trade-off: reduced inventory holding vs higher coordination complexity và dock capacity requirement.",
    whenToUse:
      "High-velocity SKU (class A), predictable demand, multi-supplier consolidation, perishable goods, e-commerce same-day/next-day, hoặc DC space constrained.",
    whenNotToUse:
      "Low-velocity SKU, unpredictable demand, cần quality inspection dài, hoặc không đủ dock capacity/inbound scheduling discipline.",
    vietnamContext:
      "E-commerce VN (Shopee, Lazada, Tiki) dùng cross-dock hub tại Bình Dương, Long An. FMCG distributor consolidate inbound từ 20+ NCC → cross-dock → outbound regional. Thách thức: inbound không đúng giờ (OTIF supplier VN 85-90%), cần buffer zone. Sân bay Long Thành sẽ tăng air cargo cross-dock.",
    keyConcepts: [
      "Cross-docking — inbound → outbound không storage",
      "Pre-distribution — sort tại DC theo destination trước khi ship",
      "Post-distribution — ship mixed, sort tại store/last mile",
      "Flow-through — continuous movement, minimal dwell",
      "Transloading — đổi transport mode (container → truck)",
      "Consolidation — gom nhiều inbound thành full outbound load",
      "Deconsolidation — chia inbound lớn thành outbound nhỏ",
      "Dwell time — thời gian hàng ở dock, target <24h",
      "Dock door scheduling — inbound/outbound slot booking",
      "Staging lane — buffer zone tạm trước outbound",
      "Wave-based cross-dock — batch theo cutoff time",
      "Continuous cross-dock — real-time match inbound/outbound",
      "Opportunistic cross-dock — match khi coincident",
      "WMS cross-dock module — auto-allocate inbound to outbound",
      "Yard management — trailer tracking tại dock",
      "Cross-dock KPI: dwell time, match rate, dock utilization",
    ],
    applications: [
      "E-commerce hub: inbound supplier → sort → outbound last-mile",
      "FMCG distributor consolidate 15 NCC → 5 regional trucks",
      "Perishable produce: farm → cross-dock → supermarket same day",
      "Import container deconsolidation tại port DC",
      "Retail DC pre-distribution to 200 stores",
    ],
    methods: [
      "Dock appointment scheduling",
      "WMS cross-dock allocation rules",
      "YMS yard management",
      "Wave planning for cross-dock cutoff",
      "Simulation for dock capacity planning",
    ],
    stepByStep: [
      "Bước 1: Analyze SKU velocity — identify cross-dock candidates (A-class, >80% fill rate)",
      "Bước 2: Map inbound/outbound flow — identify consolidation opportunities",
      "Bước 3: Design dock layout — inbound doors opposite outbound, staging lanes between",
      "Bước 4: Implement dock appointment system — supplier/carrier booking",
      "Bước 5: Configure WMS cross-dock rules — auto-match inbound ASN to outbound orders",
      "Bước 6: Train team — receiving directly to staging, no put-away",
      "Bước 7: Pilot 20% volume cross-dock, measure dwell time và match rate",
      "Bước 8: Scale + optimize dock scheduling",
      "Bước 9: KPI dashboard: dwell time, cross-dock %, cost per unit",
      "Bước 10: Continuous improvement — reduce dwell, increase match rate",
    ],
    pitfalls: [
      "Inbound late/missing ASN — cross-dock fail, fallback to storage",
      "Không đủ dock doors — bottleneck tại peak",
      "Outbound orders chưa ready khi inbound arrive — staging overflow",
      "Quality check cần thiết nhưng skip vì rush — defect ship to customer",
      "Mix cross-dock và storage cùng dock — confusion",
      "Không measure dwell time — cross-dock trở thành storage 3-5 ngày",
    ],
    formulas: [
      {
        name: "Cross-Dock Match Rate",
        expression: "MR = Units cross-docked / Total inbound units × 100%",
        variables: "Target ≥70% cho eligible SKU",
      },
      {
        name: "Dwell Time",
        expression: "DT = Outbound ship time - Inbound receipt time",
        variables: "Target <24 hours",
      },
      {
        name: "Dock Utilization",
        expression: "DU = Occupied dock hours / Available dock hours × 100%",
        variables: "Optimal 70-85%",
      },
      {
        name: "Cost Savings",
        expression: "Savings = (Storage cost + Handling cost) avoided per unit",
        variables: "Typical $0.5-2/unit vs put-away + pick",
      },
    ],
    metrics: [
      {
        name: "Dwell Time",
        formula: "Avg hours inbound to outbound",
        benchmark: "<24h cross-dock, >48h = failed cross-dock",
        interpretation: "Core cross-dock effectiveness metric",
      },
      {
        name: "Cross-Dock Rate",
        formula: "% inbound volume cross-docked vs stored",
        benchmark: "50-70% cho eligible SKU mix",
        interpretation: "Higher = less storage needed",
      },
      {
        name: "Dock Turn Rate",
        formula: "Loads per dock door per day",
        benchmark: "2-4 turns/day",
        interpretation: "Throughput efficiency",
      },
    ],
    caseStudies: [
      {
        title: "E-commerce hub Bình Dương — 50.000 orders/day",
        context: "Inbound từ 200 sellers, outbound last-mile 12 carriers",
        challenge: "Storage cost tăng 40%/năm, lead time 2 ngày",
        solution: "Cross-dock hub 80% volume, WMS auto-match, dock scheduling app",
        result: "Dwell time 36h→8h, storage space -60%, same-day delivery 45%→72%",
      },
      {
        title: "FMCG distributor miền Nam — 12 NCC",
        context: "3.000 SKU, 5 regional DC outbound daily",
        challenge: "Inbound LTL từ 12 NCC, outbound cần FTL regional",
        solution: "Morning cross-dock consolidate → afternoon FTL dispatch",
        result: "Freight cost -22%, handling touches 4→2, dock-to-ship 48h→18h",
      },
      {
        title: "Fresh produce — farm to supermarket",
        context: "Perishable, shelf life 3-5 ngày, 30 suppliers",
        challenge: "Storage giảm shelf life 1-2 ngày, quality loss 8%",
        solution: "Pre-dawn cross-dock, sort by store route, ship before 10AM",
        result: "Shelf life preserved, quality loss 8%→2%, spoilage cost -$200K/năm",
      },
    ],
    faq: [
      {
        question: "Cross-dock khác transloading thế nào?",
        answer:
          "Cross-dock: sort/consolidate tại DC, thường cùng mode (truck→truck). Transloading: đổi transport mode (container→truck, rail→truck). Transloading là subset cross-dock.",
      },
      {
        question: "Bao nhiêu % volume nên cross-dock?",
        answer:
          "Target 50-70% cho eligible A-class high-velocity SKU. Không phải 100% — low-velocity, unpredictable vẫn cần storage buffer.",
      },
      {
        question: "WMS cần feature gì cho cross-dock?",
        answer:
          "ASN receiving, cross-dock allocation rules, staging lane management, wave/cutoff scheduling, yard management integration.",
      },
      {
        question: "Inbound supplier không đúng giờ — xử lý?",
        answer:
          "Buffer staging lane 4-8h. Fallback to short-term storage nếu outbound cutoff missed. Penalty clause trong supplier contract. OTIF tracking.",
      },
      {
        question: "Pre-distribution vs post-distribution?",
        answer:
          "Pre-distribution: sort tại DC theo store/destination trước ship — efficient cho known allocation. Post-distribution: ship mixed pallet, sort tại store — flexible khi allocation unknown.",
      },
      {
        question: "Cross-dock cần bao nhiêu dock doors?",
        answer:
          "Rule of thumb: 1 inbound door per 3-5 outbound doors. Total doors = peak loads/day × dwell hours / 24. Simulation recommended cho design.",
      },
      {
        question: "Quality check trong cross-dock?",
        answer:
          "Fast QC tại receiving (<5 min/pallet): count, visual, barcode scan. Full QC SKUs không eligible cross-dock. Sample-based cho trusted suppliers.",
      },
      {
        question: "Cross-dock cho import hàng?",
        answer:
          "Phổ biến: container deconsolidation tại port DC hoặc bonded warehouse. Customs clearance song song. Cross-dock sau clearance → regional distribution.",
      },
      {
        question: "ROI cross-dock?",
        answer:
          "Typical 12-18 tháng: storage cost -40-60%, handling -30%, lead time -1-2 ngày. Investment: dock redesign, WMS module, scheduling system.",
      },
      {
        question: "Cross-dock và inventory risk?",
        answer:
          "Giảm inventory = giảm buffer. Cần reliable inbound OTIF và demand forecast. Safety stock chuyển từ DC sang inbound scheduling discipline.",
      },
      {
        question: "Night cross-dock operations?",
        answer:
          "Phổ biến FMCG/retail: inbound evening, sort overnight, outbound early morning delivery. Cần labor planning và lighting/security.",
      },
      {
        question: "Measure cross-dock success?",
        answer:
          "3 KPIs: dwell time <24h, match rate >70%, cost per unit handled giảm vs storage path. Monthly trend review.",
      },
    ],
    glossary: [
      { term: "Cross-Dock", definition: "Chuyển hàng trực tiếp inbound→outbound không lưu kho" },
      { term: "Dwell Time", definition: "Thời gian hàng ở kho giữa receiving và shipping" },
      { term: "Staging Lane", definition: "Khu vực tạm chờ giữa inbound và outbound dock" },
      { term: "Transloading", definition: "Chuyển hàng giữa các phương thức vận tải" },
      { term: "ASN", definition: "Advanced Shipping Notice — thông báo giao hàng trước" },
    ],
    sections: [
      {
        id: "types",
        title: "4 Loại Cross-Docking",
        content: "Phân loại theo flow pattern:",
        bullets: [
          "Manufacturing cross-dock: inbound materials → production line",
          "Distributor cross-dock: multi-supplier → consolidate → customer",
          "Transport cross-dock: mode change (container→truck)",
          "Retail cross-dock: DC → pre-sort → store delivery",
        ],
      },
      {
        id: "predist",
        title: "Pre-Distribution Cross-Dock",
        content: "Sort tại DC theo destination:",
        bullets: [
          "Biết allocation trước (store order, route plan)",
          "Sort inbound thành outbound shipments per destination",
          "Efficient: 1 touch, direct to outbound door",
          "Phù hợp retail DC với store orders known",
        ],
      },
      {
        id: "postdist",
        title: "Post-Distribution Cross-Dock",
        content: "Ship mixed, sort downstream:",
        bullets: [
          "Allocation unknown tại receiving time",
          "Consolidate inbound, ship mixed to sort center/store",
          "Flexible nhưng thêm handling downstream",
          "Phù hợp e-commerce với order cutoff",
        ],
      },
      {
        id: "facility",
        title: "Thiết kế Facility",
        content: "Layout principles cho cross-dock:",
        bullets: [
          "I-shape hoặc H-shape dock layout",
          "Inbound doors một side, outbound opposite",
          "Staging lanes ở giữa — minimal travel distance",
          "Yard space cho trailer queue",
        ],
      },
      {
        id: "wms",
        title: "WMS Cross-Dock Workflow",
        content: "System configuration:",
        bullets: [
          "ASN-based receiving trigger cross-dock allocation",
          "Match inbound to outbound orders by SKU/qty",
          "Direct to staging lane assignment",
          "Exception: no match → short-term storage",
        ],
      },
      {
        id: "scheduling",
        title: "Dock Scheduling",
        content: "Appointment và wave management:",
        bullets: [
          "Inbound appointment mandatory",
          "Wave cutoff: inbound by 2PM → outbound by 6PM",
          "YMS track trailer location real-time",
          "Penalty late arrival suppliers",
        ],
      },
      {
        id: "decision",
        title: "Decision Framework",
        content: "SKU eligible cho cross-dock:",
        bullets: [
          "Velocity: class A, >80% service level demand",
          "Predictability: low CV demand",
          "Supplier OTIF >90%",
          "No extended QC requirement",
          "Known outbound destination within 24h",
        ],
      },
      {
        id: "vn-practice",
        title: "Thực tiễn Việt Nam",
        content: "Context và recommendations:",
        bullets: [
          "E-commerce hub Bình Dương/Long An model",
          "FMCG morning consolidate → afternoon dispatch",
          "Supplier OTIF improvement program prerequisite",
          "Fallback storage 20-30% volume cho uncertainty",
        ],
      },
    ],
    pythonStack: ["pandas", "numpy", "matplotlib"],
    implementationNotes:
      "Pilot 20% A-class volume. ASN mandatory. Measure dwell time daily. Fallback storage path required. Dock appointment system trước WMS config.",
    relatedModuleIds: ["warehouse-logistics", "inventory-management"],
    relatedToolIds: ["inventory"],
    codeExample: `# Cross-dock match rate analysis
import pandas as pd

def cross_dock_eligible(sku):
    return (sku['abc_class'] == 'A' and
            sku['supplier_otif'] >= 0.9 and
            sku['cv_demand'] < 0.5)

def calc_dwell_time(receipts, shipments):
    merged = receipts.merge(shipments, on='pallet_id')
    merged['dwell_hours'] = (
        merged['ship_time'] - merged['receipt_time']
    ).dt.total_seconds() / 3600
    return merged['dwell_hours'].mean()

def match_rate(inbound_qty, cross_docked_qty):
    return cross_docked_qty / inbound_qty * 100`,
  }),

  entry({
    id: "reverse-logistics-returns",
    title: "Logistics Ngược & Quản lý Hàng trả",
    subtitle: "Returns · RMA · Refurbishment · Disposition · Circular Economy",
    category: "Vận tải",
    language: "Framework + Practice",
    difficulty: "Trung cấp",
    readingTime: "50 phút",
    tags: ["Reverse Logistics", "Returns", "RMA", "Refurbish", "Circular"],
    summary:
      "Hướng dẫn toàn diện reverse logistics: return authorization, receiving, inspection, disposition (restock/refurbish/dispose), e-commerce returns VN, và circular economy integration.",
    overview:
      "Reverse logistics — flow hàng từ customer ngược về supplier/manufacturer — chiếm 8-15% total logistics cost nhưng critical cho customer satisfaction và sustainability. E-commerce VN return rate 15-25% (fashion 30%+). Bài viết cover return policy design, RMA process, inspection/disposition decision tree, refurbishment, và KPI returns management.",
    scientificBasis:
      "Reverse logistics network design (Fleischmann et al.): collection, inspection, sorting, recovery, redistribution. Cost trade-off: generous return policy increases sales but raises reverse logistics cost. Disposition decision based on recovery value vs processing cost. Circular economy: extend product lifecycle through refurbishment/remanufacturing.",
    whenToUse:
      "E-commerce, retail với return policy, warranty products, B2B equipment lease, hoặc regulatory take-back requirements (electronics, batteries).",
    whenNotToUse:
      "Commodity perishable không returnable, custom-made products, hoặc ultra-low-margin products where return cost > margin.",
    vietnamContext:
      "E-commerce VN return rate cao: fashion 25-35%, electronics 10-15%. Shopee/Lazada return policy 7-15 ngày drive volume. Thách thức: last-mile return pickup cost cao, fake/defective return fraud. Kho returns thường tách riêng tại HCM/HN. Luật BVMT yêu cầu thu hồi pin, điện tử.",
    keyConcepts: [
      "Reverse logistics — flow customer → supplier/manufacturer",
      "Return Merchandise Authorization (RMA)",
      "Return policy design — window, condition, who pays freight",
      "Return rate — returns / total sales",
      "First-time-right return — correct RMA first contact",
      "Receiving và triage — inspect, classify disposition",
      "Disposition: restock, refurbish, liquidate, recycle, dispose",
      "Refurbishment — repair, repackage, resell as refurbished",
      "Return fraud — wardrobing, empty box, switch",
      "Return-to-vendor (RTV) — supplier bears cost",
      "Centralized vs decentralized returns processing",
      "Return transportation — pickup, drop-off point, mail",
      "Warranty vs non-warranty returns",
      "Circular economy — remanufacturing, recycling",
      "Return KPI: rate, cost per return, recovery rate",
      "Green returns — packaging reuse, carbon impact",
    ],
    applications: [
      "E-commerce return center processing 5.000 returns/day",
      "Electronics warranty RMA và refurbishment",
      "Fashion return inspection và restock/disposition",
      "B2B equipment return at lease end",
      "Regulatory WEEE take-back program",
    ],
    methods: [
      "RMA portal/workflow automation",
      "Disposition decision tree",
      "Refurbishment SOP",
      "Return fraud detection rules",
      "3PL reverse logistics outsourcing",
    ],
    stepByStep: [
      "Bước 1: Design return policy — window, conditions, freight responsibility",
      "Bước 2: RMA system — customer request → authorization → label/QR",
      "Bước 3: Return transportation — pickup schedule or drop-off points",
      "Bước 4: Receiving at return center — scan RMA, verify item",
      "Bước 5: Inspection — condition grade A/B/C/D",
      "Bước 6: Disposition decision — restock, refurbish, liquidate, dispose",
      "Bước 7: Refund/credit/exchange trigger",
      "Bước 8: RTV to supplier nếu defect/manufacturer fault",
      "Bước 9: KPI tracking — rate, cost, recovery, cycle time",
      "Bước 10: Continuous improvement — reduce return rate at source",
    ],
    pitfalls: [
      "Return policy quá phức tạp — customer frustration, support cost cao",
      "Không inspect — restock defective item → second return",
      "Return center = black hole — items sit weeks unprocessed",
      "Ignore return fraud — wardrobing, switch cost 2-5% revenue",
      "Không track cost per return — invisible margin erosion",
      "Reverse logistics network thiếu — return cost > product value",
    ],
    formulas: [
      {
        name: "Return Rate",
        expression: "RR = Return units / Sold units × 100%",
        variables: "E-commerce VN: 15-25% average, fashion 30%+",
      },
      {
        name: "Cost per Return",
        expression: "CPR = Total reverse logistics cost / Return units",
        variables: "Typical $3-15/return tùy category",
      },
      {
        name: "Recovery Rate",
        expression: "Recovery = Resale value recovered / Original product value × 100%",
        variables: "Target >60% cho restockable returns",
      },
      {
        name: "Return Processing Time",
        expression: "RPT = Refund issued - Return received",
        variables: "Target <48h e-commerce",
      },
    ],
    metrics: [
      {
        name: "Return Rate",
        formula: "Returns / Sales units × 100%",
        benchmark: "<15% overall, investigate >20%",
        interpretation: "High rate = product/description issue or fraud",
      },
      {
        name: "Cost per Return",
        formula: "Total reverse cost / Returns",
        benchmark: "<$8 e-commerce VN",
        interpretation: "Includes pickup, inspect, restock, refund processing",
      },
      {
        name: "Recovery Rate",
        formula: "Value recovered / Original value",
        benchmark: ">60%",
        interpretation: "Restock + refurbish + liquidate value",
      },
    ],
    caseStudies: [
      {
        title: "Fashion e-commerce — 30% return rate",
        context: "15.000 orders/day, return 4.500/day, HCM return center",
        challenge: "Return processing 5-7 ngày, customer complaint, restock rate chỉ 40%",
        solution: "Automated RMA, grade inspection SOP, fast-track restock A-grade, outlet B-grade",
        result: "Processing 7d→2d, recovery 40%→68%, CPR $12→$7",
      },
      {
        title: "Electronics retailer — warranty returns",
        context: "500 RMA/day, mix warranty defect và customer remorse",
        challenge: "Defect items sit 30 days before RTV, refurbishment không có process",
        solution: "Triage trong 24h, auto-RTV defect, refurbish program cho open-box",
        result: "RTV cycle 30d→7d, refurbished revenue $2M/năm new stream",
      },
      {
        title: "FMCG distributor — expiry returns",
        context: "Retailers return near-expiry goods theo contract",
        challenge: "15% returns near-expiry, disposition chậm, write-off $500K/năm",
        solution: "FEFO enforcement, proactive pull before expiry, discount outlet channel",
        result: "Near-expiry returns -40%, write-off $500K→$200K",
      },
    ],
    faq: [
      {
        question: "Return rate bao nhiêu là bình thường?",
        answer:
          "E-commerce VN: 15-25% average. Fashion 25-35%, electronics 10-15%, FMCG <5%. Above benchmark = investigate product quality, description accuracy, sizing guide.",
      },
      {
        question: "Ai trả phí return shipping?",
        answer:
          "Policy choice: seller-pay (higher conversion, higher cost), customer-pay (lower returns, lower satisfaction), free return window 7 ngày (common VN e-commerce). Hybrid: defect=seller, remorse=customer.",
      },
      {
        question: "Disposition decision tree?",
        answer:
          "Grade A (new condition) → restock. B (minor issue) → refurbish/discount. C (damaged) → liquidate/recycle. D (unsalvageable) → dispose. Decision trong 24h receiving.",
      },
      {
        question: "Return fraud phổ biến thế nào?",
        answer:
          "2-5% returns fraudulent: wardrobing (wear return), empty box, switch (return fake keep real), counterfeit return. Prevention: serial number tracking, inspection SOP, blacklist repeat offenders.",
      },
      {
        question: "Centralized vs distributed return center?",
        answer:
          "Centralized: economies of scale, consistent inspection, lower cost per return. Distributed: faster refund, lower transportation. E-commerce VN trend: 1-2 centralized HCM/HN.",
      },
      {
        question: "Refurbished có bán được tại VN?",
        answer:
          "Có — market growing cho electronics, appliances. Label rõ 'refurbished', warranty ngắn hơn, giá 70-85% new. Shopee/Lazada có category refurbished.",
      },
      {
        question: "RTV process với supplier?",
        answer:
          "Defect/manufacturer fault: RTV within warranty terms. Document defect, ship to supplier, credit note. SLA 7-14 ngày. Track RTV recovery rate.",
      },
      {
        question: "Return processing SLA?",
        answer:
          "E-commerce best practice: refund within 48h of receiving (trước inspect) hoặc 72h after inspect. VN consumer expect fast — delay = bad review.",
      },
      {
        question: "Reverse logistics cost benchmark?",
        answer:
          "$3-15/return tùy category. Fashion high (inspection, restock). Electronics medium (testing). Include pickup, processing, restock, refund admin.",
      },
      {
        question: "Giảm return rate tại source?",
        answer:
          "Better product photos/descriptions, sizing guide, quality control, review analysis (top return reasons), virtual try-on. Mỗi 1% return reduction = significant savings.",
      },
      {
        question: "WEEE/regulatory take-back VN?",
        answer:
          "Luật BVMT yêu cầu thu hồi pin, ắc quy, thiết bị điện tử. Producer responsibility — setup collection points, recycling partner. Cost trong EPR scheme.",
      },
      {
        question: "Return data analytics?",
        answer:
          "Track: return rate by SKU/category/reason/region. Pareto top 10 return SKUs. Root cause: quality, description, sizing, shipping damage. Feed back to product và sourcing.",
      },
    ],
    glossary: [
      { term: "RMA", definition: "Return Merchandise Authorization — mã phép trả hàng" },
      { term: "Disposition", definition: "Quyết định xử lý hàng trả: restock, refurbish, dispose" },
      { term: "RTV", definition: "Return to Vendor — trả hàng lỗi về nhà cung cấp" },
      { term: "Wardrobing", definition: "Gian lận: mua dùng rồi trả lại như mới" },
      { term: "Recovery Rate", definition: "Tỷ lệ giá trị thu hồi từ hàng trả" },
    ],
    sections: [
      {
        id: "policy",
        title: "Return Policy Design",
        content: "Cân bằng customer satisfaction và cost:",
        bullets: [
          "Return window: 7-15 ngày phổ biến VN e-commerce",
          "Condition: unopened, tags attached, original packaging",
          "Freight: seller-pay vs customer-pay vs hybrid",
          "Exchange vs refund vs store credit",
        ],
      },
      {
        id: "rma",
        title: "RMA Process",
        content: "Return authorization workflow:",
        bullets: [
          "Customer request via app/portal",
          "Auto-approve hoặc manual review (high-value)",
          "Generate return label/QR code",
          "Track return shipment status",
        ],
      },
      {
        id: "transport",
        title: "Return Transportation",
        content: "Thu hồi hàng từ customer:",
        bullets: [
          "Pickup at home — convenient, expensive",
          "Drop-off points — cheaper, less convenient",
          "Mail return — small items",
          "VN: GHTK, GHN, J&T reverse pickup services",
        ],
      },
      {
        id: "inspection",
        title: "Inspection và Grading",
        content: "Phân loại condition tại return center:",
        bullets: [
          "Grade A: new, sealed — restock full price",
          "Grade B: opened, minor — refurbish/discount 15-30%",
          "Grade C: damaged — liquidate/recycle",
          "Grade D: unsalvageable — dispose",
        ],
      },
      {
        id: "disposition",
        title: "Disposition Decision Tree",
        content: "Route hàng trả đến optimal outcome:",
        bullets: [
          "Restock → available inventory (fastest recovery)",
          "Refurbish → repair, test, repackage → refurbished channel",
          "Liquidate → outlet, flash sale, B2B clearance",
          "Recycle/Dispose → WEEE, unsalvageable",
        ],
      },
      {
        id: "fraud",
        title: "Return Fraud Prevention",
        content: "Detect và prevent abuse:",
        bullets: [
          "Serial number / IMEI tracking",
          "Photo evidence at return request",
          "Blacklist repeat offenders",
          "Inspection SOP trained staff",
          "Weight check (empty box detection)",
        ],
      },
      {
        id: "kpi",
        title: "Reverse Logistics KPIs",
        content: "Metrics dashboard:",
        bullets: [
          "Return rate by category",
          "Cost per return",
          "Recovery rate",
          "Processing time (receive to refund)",
          "Restock rate (A-grade %)",
        ],
      },
      {
        id: "circular",
        title: "Circular Economy Integration",
        content: "Beyond cost recovery:",
        bullets: [
          "Refurbishment extends product life",
          "Recycling material recovery",
          "EPR compliance VN",
          "Sustainability reporting — return/recycle metrics",
        ],
      },
    ],
    pythonStack: ["pandas", "numpy", "matplotlib"],
    implementationNotes:
      "Separate return center from forward DC. RMA automation first. Inspect within 24h. Track CPR monthly. Return reason analytics feed product team. Fraud rules in RMA system.",
    relatedModuleIds: ["warehouse-logistics", "inventory-management"],
    relatedToolIds: ["inventory"],
    codeExample: `import pandas as pd
import numpy as np

def return_rate(returns, sales):
    return returns / sales * 100

def disposition_decision(grade, original_price, refurb_cost):
    rules = {
        'A': ('restock', original_price),
        'B': ('refurbish', original_price * 0.75 - refurb_cost),
        'C': ('liquidate', original_price * 0.2),
        'D': ('dispose', 0),
    }
    return rules.get(grade, ('dispose', 0))

def recovery_rate(disposition_values, original_values):
    return np.sum(disposition_values) / np.sum(original_values) * 100`,
  }),

  entry({
    id: "cold-chain-logistics",
    title: "Chuỗi lạnh & Logistics Nhiệt độ kiểm soát",
    subtitle: "Cold chain · Reefer · GDP · HACCP · Last-mile lạnh",
    category: "Kho bãi",
    language: "Framework + Practice",
    difficulty: "Trung cấp",
    readingTime: "65 phút",
    tags: ["Cold Chain", "Reefer", "GDP", "Pharma", "F&B", "Temperature"],
    summary:
      "Toàn bộ kiến thức chuỗi lạnh: phân loại nhiệt độ, thiết kế kho lạnh, vận tải reefer, monitoring IoT, GDP/HACCP, và last-mile cho pharma/F&B tại Việt Nam.",
    overview:
      "Chuỗi lạnh (cold chain) là hệ thống logistics duy trì nhiệt độ sản phẩm trong khoảng quy định từ sản xuất đến người tiêu dùng. Một đoạn mất kiểm soát nhiệt độ có thể hủy toàn bộ lô hàng — đặc biệt vaccine, dược phẩm sinh học, hải sản, thịt, sữa, và trái cây nhập khẩu.\n\nBài viết giải thích phân loại nhiệt độ (frozen, chilled, controlled ambient), thiết kế kho multi-temperature, lựa chọn reefer truck/container, cold chain packaging (gel pack, dry ice), monitoring real-time, và quy trình xử lý excursion (nhiệt độ vượt ngưỡng). Đây là kiến thức bắt buộc cho ngành pharma, F&B, và modern retail tại VN.",
    scientificBasis:
      "Arrhenius equation mô tả tốc độ hỏng hóc sinh học phụ thuộc nhiệt độ — tăng 10°C có thể tăng gấp đôi tốc độ vi khuẩn phát triển. Q10 rule trong food science. GDP (Good Distribution Practice) và HACCP là framework kiểm soát rủi ro dựa trên hazard analysis. Cold chain integrity = f(temperature, time, humidity, handling).",
    whenToUse:
      "Sản phẩm có yêu cầu nhiệt độ (vaccine 2-8°C, frozen -18°C, chocolate 15-20°C), shelf life ngắn, hoặc regulatory compliance (Bộ Y tế, FDA, EU GDP). Kho pharma, seafood export, dairy, fresh produce, e-grocery.",
    whenNotToUse:
      "Hàng khô ambient stable (gia vị, đồ điện tử) — cold chain thêm chi phí không cần thiết. Không có monitoring thì không nên claim cold chain.",
    vietnamContext:
      "VN nằm vùng nhiệt đới — ambient 30-35°C, thách thức lớn cho cold chain. Kho lạnh tại KCN Bình Dương, Long An, Hải Phòng. Reefer container cảng Cát Lái, Hải Phòng. Pharma: GDP inspection Bộ Y tế. Hải sản xuất khẩu Nhật/EU cần cold chain certificate. GrabMart, Bach Hoa Xanh e-grocery cần last-mile lạnh. Thiếu reefer fleet nội địa — nhiều SME dùng xe thường + thùng xốp.",
    keyConcepts: [
      "Cold chain — duy trì nhiệt độ xuyên suốt",
      "Temperature zones: frozen (-18°C), chilled (0-4°C), cool (8-15°C)",
      "Reefer truck/container — đơn vị làm lạnh độc lập",
      "Pre-cooling — làm lạnh sản phẩm trước khi load",
      "Temperature excursion — vượt ngưỡng, cần quyết định release/reject",
      "Data logger — ghi nhiệt độ liên tục, không thể sửa",
      "Mean Kinetic Temperature (MKT) — tổng hợp excursion theo thời gian",
      "GDP — Good Distribution Practice cho pharma",
      "HACCP — hazard analysis cho F&B",
      "FEFO — First Expired First Out bắt buộc",
      "Cold chain packaging — insulated box, gel pack, PCM",
      "Cross-dock lạnh — dwell time tối thiểu",
      "Multi-temperature warehouse — zone segregation",
      "Last-mile cold — xe lạnh vs passive packaging",
      "Lane risk assessment — route dài, nắng, customs delay",
      "Calibration — sensor phải hiệu chuẩn định kỳ",
      "Chain of custody — ai chịu trách nhiệm từng đoạn",
    ],
    applications: [
      "Vaccine distribution 2-8°C với data logger mỗi thùng",
      "Seafood export Japan — blast freeze + reefer -18°C",
      "Dairy DC chilled 2-6°C, FEFO picking",
      "E-grocery last-mile: passive cooling 2h delivery",
      "Import fruit cold treatment phòng sâu",
      "Pharma GDP audit preparation",
      "Reefer container booking peak season Tết",
    ],
    methods: [
      "Temperature mapping kho (empty + loaded)",
      "Validation protocol IQ/OQ/PQ",
      "Risk assessment lane-by-lane",
      "SOP excursion handling",
      "IoT real-time alert (SMS/email)",
      "Passive vs active packaging selection",
      "Cold chain simulation (summer worst-case)",
    ],
    stepByStep: [
      "Xác định product temperature profile và shelf life",
      "Map toàn bộ chain: factory → DC → transport → customer",
      "Định nghĩa acceptance criteria (min/max °C, max time out of range)",
      "Chọn packaging và equipment (reefer class, insulation R-value)",
      "Triển khai monitoring (logger interval 5-15 phút)",
      "Viết SOP loading, unloading, break-down handling",
      "Train driver và warehouse staff GDP/HACCP",
      "Chạy qualification run (summer + winter)",
      "Go-live với exception workflow",
      "Monthly review excursion rate và CAPA",
    ],
    pitfalls: [
      "Load hàng chưa pre-cool — reefer không kịp hạ nhiệt",
      "Mở cửa container lâu tại customs — excursion",
      "Sensor đặt sai vị trí (gần cửa, không đại diện)",
      "Không có SOP khi xe hỏng giữa đường",
      "Mix frozen + chilled cùng kho không partition",
      "Tin ambient delivery cho pharma — vi phạm GDP",
      "Logger hết pin — mất bằng chứng",
    ],
    formulas: [
      { name: "MKT", expression: "MKT = ΔH/R × ln(Σe^(-ΔH/RT)/n)", variables: "Tổng hợp nhiệt độ theo thời gian cho stability study" },
      { name: "Cooling load", expression: "Q = m × c × ΔT / t", variables: "Ước lượng năng lực làm lạnh cần thiết" },
    ],
    metrics: [
      { name: "Excursion rate", formula: "Shipments with excursion / Total × 100%", benchmark: "<1% pharma, <3% F&B", interpretation: "Metric compliance chính" },
      { name: "On-time in-spec", formula: "Deliveries in temp range / Total", benchmark: "≥99% pharma", interpretation: "GDP KPI" },
    ],
    caseStudies: [
      {
        title: "Pharma distributor HCM — GDP certification",
        context: "Phân phối thuốc 2-8°C, 3 DC, 50 xe giao",
        challenge: "Excursion 8% do xe không lạnh + customs delay",
        solution: "Reefer fleet, passive backup pack, lane SOP, real-time IoT",
        result: "Excursion 0.8%, pass GDP audit Bộ Y tế",
      },
    ],
    faq: [
      { question: "2-8°C có được mở cửa kho bao lâu?", answer: "Tùy thermal mass và không khí. Thường <5 phút cho pallet sealed. Validation mapping xác định recovery time. GDP yêu cầu documented limit." },
      { question: "Excursion 30 phút có reject cả lô?", answer: "Phụ thuộc product stability data và MKT calculation. Pharma: quality team quyết định theo protocol. Không tự ý release." },
    ],
    glossary: [
      { term: "Reefer", definition: "Container/xe có hệ thống làm lạnh riêng" },
      { term: "GDP", definition: "Good Distribution Practice — chuẩn phân phối dược" },
      { term: "Excursion", definition: "Nhiệt độ vượt min/max cho phép" },
    ],
    sections: [
      { id: "zones", title: "Phân vùng nhiệt độ", content: "Mỗi sản phẩm có profile riêng:", bullets: ["Frozen -18°C: hải sản, kem", "Chilled 0-4°C: sữa, thịt tươi", "2-8°C: vaccine, insulin", "15-25°C: chocolate, một số dược"] },
      { id: "monitoring", title: "Giám sát & IoT", content: "Monitoring là bằng chứng pháp lý:", bullets: ["Data logger không reset được", "Alert real-time khi vượt ngưỡng", "Cloud dashboard cho QA team", "Audit trail 2-5 năm lưu trữ"] },
      { id: "vn-fleet", title: "Đội xe lạnh VN", content: "Thực trạng và giải pháp:", bullets: ["Reefer fleet thiếu, giá cao hơn 40-60%", "Nhiều SME: thùng xốp + đá viên", "Grab/AhaMove chưa đủ cold capacity", "Đầu tư xe lạnh hoặc 3PL chuyên dụng"] },
    ],
    pythonStack: ["pandas", "numpy"],
    implementationNotes: "Mọi shipment lạnh cần logger. SOP excursion trước go-live. Summer qualification bắt buộc VN.",
    relatedModuleIds: ["warehouse-logistics"],
  }),

  entry({
    id: "third-party-logistics-3pl",
    title: "Quản lý 3PL & Logistics thuê ngoài",
    subtitle: "RFQ · SLA · Scorecard · 4PL · Control tower",
    category: "Chiến lược",
    language: "Practice",
    difficulty: "Trung cấp",
    readingTime: "60 phút",
    tags: ["3PL", "4PL", "Outsourcing", "SLA", "Contract"],
    summary: "Hướng dẫn chọn, đàm phán, và quản lý nhà cung cấp logistics thuê ngoài (3PL/4PL): RFQ, SLA, KPI scorecard, và control tower.",
    overview:
      "Thuê ngoài logistics (3PL) cho phép doanh nghiệp tập trung core competency trong khi tận dụng network, technology, và scale của chuyên gia logistics. Quyết định make vs buy ảnh hưởng 15-30% tổng chi phí SC.\n\nBài viết cover phân loại 3PL (warehouse, transport, integrated), quy trình RFQ/RFP, đàm phán hợp đồng và SLA, KPI scorecard hàng tháng, quản lý transition (onboarding), và khi nào nâng cấp lên 4PL/control tower.",
    scientificBasis: "Transaction cost economics: outsource khi chi phí coordination < chi phí internal. Principal-agent problem: misaligned incentives giữa shipper và 3PL — giải bằng SLA penalty/bonus. Total Cost of Logistics (TCL) analysis.",
    whenToUse: "Cần scale nhanh, vào thị trường mới, seasonal peak, hoặc không muốn đầu tư CAPEX kho/xe.",
    whenNotToUse: "Sản phẩm highly proprietary, margin cực cao cần control tuyệt đối, hoặc 3PL local không đủ capability.",
    vietnamContext: "3PL VN: VietFul, SCG Logistics, Transimex, DHL, Kuehne+Nagel. KCN Bình Dương/Long An hub. SME thường thuê kho 3PL theo pallet. E-commerce peak 11.11 cần surge capacity. Hợp đồng tiếng Việt + Incoterms rõ ràng.",
    keyConcepts: [
      "3PL — outsource warehouse +/or transport",
      "4PL — orchestrator quản nhiều 3PL, không sở hữu asset",
      "SLA — Service Level Agreement với penalty/bonus",
      "RFQ/RFP — competitive bidding process",
      "Scope of work — inbound, storage, pick-pack, ship, returns",
      "Rate card — storage/pallet, pick fee, freight per kg",
      "Transition plan — data migration, inventory receipt",
      "Control tower — visibility cross-carrier/warehouse",
      "Gain sharing — chia tiết kiệm từ improvement",
      "Exit clause — chuyển 3PL, data portability",
      "Insurance & liability — hàng hóa mất/hỏng ai chịu",
      "System integration — WMS API, EDI, OMS",
    ],
    applications: [
      "Startup e-commerce outsource fulfillment tại BD",
      "FMCG seasonal surge thuê thêm 3PL Q4",
      "Export manufacturer 4PL quản freight multi-mode",
      "Scorecard monthly review 3PL performance",
    ],
    methods: ["RFQ template", "Weighted vendor scoring", "SLA dashboard", "Quarterly business review"],
    stepByStep: [
      "Define scope: warehouse only vs integrated",
      "Prepare RFQ: volume forecast, SKU profile, SLA targets",
      "Site visit 3PL candidates",
      "Evaluate: cost, capability, technology, references",
      "Negotiate contract + SLA + rate card",
      "Transition: inventory transfer, system integration",
      "Hypercare 90 ngày đầu",
      "Monthly scorecard + QBR",
    ],
    pitfalls: [
      "Chọn 3PL chỉ vì giá rẻ — miss SLA",
      "Scope creep không điều chỉnh rate",
      "Không có exit plan — lock-in",
      "Data không sync — oversell",
    ],
    metrics: [
      { name: "3PL OTIF", formula: "On-time in-full / Total orders", benchmark: "≥96%", interpretation: "SLA chính" },
      { name: "Cost per order", formula: "Total 3PL fee / Orders", benchmark: "Benchmark theo category", interpretation: "Unit economics" },
    ],
    faq: [
      { question: "3PL hay tự vận hành kho?", answer: "3PL khi volume chưa ổn định, cần flexibility, hoặc location strategy. Tự vận hành khi volume lớn ổn định, margin cao, cần customization sâu." },
    ],
    sections: [
      { id: "rfq", title: "Quy trình RFQ", content: "RFQ chuẩn gồm:", bullets: ["Volume forecast 12-24 tháng", "SKU dimensions và handling", "SLA targets (OTIF, accuracy)", "IT integration requirements", "Pricing template standardized"] },
      { id: "sla", title: "Thiết kế SLA", content: "SLA phải đo được:", bullets: ["OTIF với defined on-time window", "Inventory accuracy ≥99.5%", "Pick productivity minimum", "Penalty 1-3% invoice khi breach", "Bonus khi exceed target 3 tháng liên tiếp"] },
    ],
    pythonStack: ["pandas"],
    implementationNotes: "Contract lawyer review. Pilot 3 tháng trước long-term. Data ownership clause bắt buộc.",
    relatedModuleIds: ["warehouse-logistics"],
  }),

  entry({
    id: "customs-clearance-vietnam",
    title: "Thông quan Hải quan Việt Nam",
    subtitle: "HS Code · VNACCS · Thuế · C/O · Kiểm tra chuyên ngành",
    category: "Thương mại QT",
    language: "Regulation + Practice",
    difficulty: "Trung cấp",
    readingTime: "75 phút",
    tags: ["Customs", "VNACCS", "HS Code", "Import", "Export", "FTA"],
    summary: "Hướng dẫn chi tiết thông quan tại Việt Nam: HS classification, VNACCS/VCIS, thuế nhập khẩu, C/O FTA, kiểm tra chuyên ngành, và landed cost.",
    overview:
      "Thông quan là cửa ngõ bắt buộc mọi hàng hóa xuất nhập khẩu. Sai HS code, thiếu giấy phép, hoặc khai báo sai trị giá có thể gây phạt, tịch thu, hoặc delay hàng tuần.\n\nBài viết giải thích hệ thống VNACCS/VCIS, quy trình khai báo hải quan điện tử, phân loại HS 8 số, thuế NK/VAT/chống bán phá giá, chứng từ C/O tận dụng FTA (EVFTA, CPTPP, RCEP), kiểm tra chuyên ngành (Bộ Y tế, Bộ NN, Bộ CT), và tính landed cost chính xác.",
    scientificBasis: "WCO Harmonized System — phân loại hàng hóa quốc tế. Valuation theo WTO Agreement — transaction value, deductive, computed. Risk management: red/yellow/green channel dựa trên compliance history.",
    whenToUse: "Mọi lô hàng xuất nhập khẩu thương mại, kể cả sample và máy móc.",
    whenNotToUse: "Hàng quà biếu cá nhân dưới ngưỡng miễn thuế — vẫn cần hiểu rule nhưng quy trình đơn giản hơn.",
    vietnamContext:
      "Hải quan VN: Tổng cục Hải quan, cửa khẩu Cát Lái, Hải Phòng, Đà Nẵng, Lào Cai. VNACCS/VCIS bắt buộc. FTA: EVFTA (EU), CPTPP, RCEP, ACFTA (ASEAN-TQ). Doanh nghiệp cần đăng ký tài khoản Hải quan, chữ ký số. Một cửa quốc gia cho giấy phép. Green channel cho doanh nghiệp ưu tiên (AEO).",
    keyConcepts: [
      "HS Code 8 số — phân loại hàng hóa, quyết định thuế suất",
      "VNACCS — khai báo hải quan điện tử",
      "Import declaration — tờ khai nhập khẩu",
      "Transaction value — trị giá giao dịch làm cơ sở tính thuế",
      "C/O Form — chứng nhận xuất xứ hưởng FTA",
      "Rules of Origin — điều kiện hưởng thuế suất ưu đãi",
      "VAT nhập khẩu — 8-10% trên CIF + thuế NK",
      "Specialized inspection — kiểm tra y tế, nông sản, động vật",
      "Red/Yellow/Green channel — luồng kiểm tra",
      "AEO — Authorized Economic Operator, ưu tiên thông quan",
      "Temporary import — tái xuất, không chịu thuế NK",
      "Customs broker — đại lý làm thủ tục",
      "Landed cost — CIF + duty + VAT + local charges",
    ],
    applications: [
      "Import máy móc từ EU hưởng EVFTA",
      "Phân loại HS nguyên liệu vs thành phẩm",
      "Tính landed cost so sánh supplier TQ vs VN",
      "AEO application cho importer lớn",
    ],
    methods: ["HS classification ruling", "FTA origin calculation", "Landed cost model Excel/Python", "Broker coordination"],
    stepByStep: [
      "Xác định HS code (8 số) — tra cứu hoặc ruling",
      "Chuẩn bị invoice, packing list, B/L, C/O",
      "Kiểm tra giấy phép chuyên ngành nếu có",
      "Đăng ký tờ khai VNACCS",
      "Nộp thuế NK, VAT, phí",
      "Kiểm tra hải quan (nếu red/yellow channel)",
      "Thông quan — lấy hàng",
      "Lưu hồ sơ 5 năm",
    ],
    pitfalls: [
      "HS code sai — thuế suất sai, phạt",
      "C/O không đủ điều kiện origin — mất ưu đãi",
      "Khai thấp trị giá — điều tra chống bán phá giá",
      "Thiếu kiểm tra chuyên ngành — không thông quan",
      "Không tính phí cảng/container vào landed cost",
    ],
    formulas: [
      { name: "Landed cost", expression: "LC = CIF × (1 + duty%) × (1 + VAT%) + local fees", variables: "CIF = cost + insurance + freight đến cảng VN" },
    ],
    faq: [
      { question: "C/O Form D (ACFTA) cần gì?", answer: "Xuất xứ ASEAN, đủ regional value content hoặc tariff shift. Đăng ký trên hệ thống C/O điện tử. Sai origin bị thu hồi thuế." },
      { question: "Green channel là gì?", answer: "Luồng xanh — thông quan tự động không kiểm tra chi tiết. Doanh nghiệp compliance tốt, AEO, hoặc lô hàng rủi ro thấp." },
    ],
    glossary: [
      { term: "VNACCS", definition: "Vietnam Automated Cargo Clearance System" },
      { term: "C/O", definition: "Certificate of Origin — chứng nhận xuất xứ" },
      { term: "AEO", definition: "Doanh nghiệp ưu tiên hải quan" },
    ],
    sections: [
      { id: "hs", title: "Phân loại HS Code", content: "HS quyết định thuế và kiểm tra:", bullets: ["8 số: chapter + heading + subheading", "General Rules of Interpretation (GRI) 6 quy tắc", "Binding ruling nếu không chắc", "Sai HS = rủi ro phạt và delay"] },
      { id: "fta", title: "Tận dụng FTA", content: "FTA giảm thuế NK đáng kể:", bullets: ["EVFTA: EU → VN, rules of origin riêng từng HS", "RCEP: regional cumulation", "Cần C/O đúng form và đủ RVC", "Audit origin documentation"] },
      { id: "landed", title: "Landed Cost đầy đủ", content: "Không chỉ CIF:", bullets: ["Thuế NK + VAT", "Phí cảng, bốc xếp, DEM/DET", "Vận chuyển nội địa cảng → kho", "Customs broker fee", "Kiểm tra chuyên ngành fee"] },
    ],
    pythonStack: ["pandas"],
    implementationNotes: "Luôn dùng customs broker có kinh nghiệm ngành hàng. Lưu ruling HS cho repeat import.",
    relatedModuleIds: ["incoterms-trade", "warehouse-logistics"],
    relatedToolIds: ["incoterms"],
  }),

  entry({
    id: "container-shipping-basics",
    title: "Vận tải Container & Đường biển",
    subtitle: "FCL · LCL · TEU · Demurrage · Booking · Documentation",
    category: "Thương mại QT",
    language: "Practice",
    difficulty: "Cơ bản",
    readingTime: "55 phút",
    tags: ["Container", "FCL", "LCL", "Shipping", "Ocean Freight"],
    summary: "Kiến thức container shipping: loại container, FCL/LCL, booking, chứng từ, demurrage/detention, và tối ưu chi phí đường biển.",
    overview:
      "90% hàng hóa thương mại quốc tế vận chuyển bằng đường biển. Container shipping là nền tảng import/export của VN. Hiểu FCL vs LCL, loại container (20GP, 40GP, 40HC, reefer), quy trình booking, B/L, và chi phí ẩn (demurrage, detention, THC) giúp tránh surprise cost và delay.\n\nBài viết giải thích ecosystem: carrier, freight forwarder, NVOCC, port, depot, và timeline từ booking đến delivery.",
    scientificBasis: "Economies of scale: cost per TEU giảm khi utilization cao. Hub-and-spoke network của global carriers. Berth scheduling và port congestion ảnh hưởng lead time variability.",
    whenToUse: "Import/export volume đủ lớn (thường >10 CBM), hoặc cần cost-effective vs air freight.",
    whenNotToUse: "Urgent shipment <7 ngày — dùng air. Hàng lẻ <2 CBM có thể LCL hoặc courier.",
    vietnamContext: "Cảng chính: Cát Lái (HCM), Hải Phòng, Đà Nẵng. Route phổ biến: TQ/Hàn → VN, VN → US/EU. Tết và peak season container shortage. Freight rate biến động mạnh post-COVID. Forwarder local: Transimex, Gemadept, Vinalines agents.",
    keyConcepts: [
      "TEU — Twenty-foot Equivalent Unit, đơn vị đo container",
      "FCL — Full Container Load, thuê nguyên container",
      "LCL — Less than Container Load, gom hàng",
      "20GP / 40GP / 40HC — kích thước container",
      "Bill of Lading (B/L) — vận đơn, title document",
      "Booking confirmation — xác nhận chỗ trên tàu",
      "SI cutoff — deadline khai Shipping Instruction",
      "CY/CFS — container yard / freight station",
      "THC — Terminal Handling Charge tại cảng",
      "Demurrage — phí lưu container tại cảng quá free time",
      "Detention — phí giữ container ngoài cảng quá free time",
      "VGM — Verified Gross Mass bắt buộc trước load",
      "Transshipment — chuyển tải tại hub port",
      "Lead time ocean — 14-45 ngày tùy route",
    ],
    applications: [
      "Chọn FCL vs LCL cho import 15 CBM từ TQ",
      "Negotiate free demurrage 7 ngày trong contract",
      "Consolidate LCL thành FCL khi volume tăng",
      "Reefer booking cho hải sản export",
    ],
    methods: ["Freight rate benchmarking", "Container load planning (cubing)", "Forwarder RFQ", "Track & trace via B/L"],
    stepByStep: [
      "Xác định volume, weight, cargo type",
      "Chọn FCL/LCL và container type",
      "Request quote từ forwarder (all-in vs ++ charges)",
      "Booking + empty container release (FCL)",
      "Stuffing container + VGM declaration",
      "Gate in cảng trước cutoff",
      "Vessel departure → track B/L",
      "Arrival VN → customs → pick up",
      "Return empty container trước detention deadline",
    ],
    pitfalls: [
      "Không đọc fine print demurrage — phí $100-300/ngày",
      "Overweight container — phạt và reject",
      "Miss SI cutoff — roll sang chuyến sau",
      "LCL consolidation delay không predict được",
      "B/L telex release chưa thanh toán freight",
    ],
    formulas: [
      { name: "Utilization", expression: "Load % = Used CBM / Container CBM × 100%", variables: "40HC ≈ 67 CBM, target >85%" },
    ],
    metrics: [
      { name: "Cost per CBM", formula: "Ocean freight / CBM", benchmark: "Tùy route, benchmark quarterly", interpretation: "So sánh FCL vs LCL" },
    ],
    faq: [
      { question: "FCL hay LCL khi 12 CBM?", answer: "Gần ngưỡng 15 CBM. So sánh all-in cost. FCL 20GP (~33 CBM) nếu forecast tăng volume. LCL linh hoạt hơn nếu không fill container." },
    ],
    sections: [
      { id: "types", title: "Loại container", content: "Chọn đúng equipment:", bullets: ["20GP: 33 CBM, phổ biến TQ-VN", "40HC: 67 CBM, hàng nhẹ volume lớn", "Reefer: nhiệt độ kiểm soát", "Open top / flat rack: hàng quá khổ"] },
      { id: "charges", title: "Chi phí ẩn", content: "Quote ++ thường chưa gồm:", bullets: ["THC origin + destination", "Doc fee, seal fee", "Demurrage/detention", "Customs, trucking nội địa"] },
    ],
    pythonStack: ["pandas"],
    implementationNotes: "All-in quote cho budgeting. Calendar reminder detention deadline.",
    relatedModuleIds: ["incoterms-trade", "warehouse-logistics"],
    relatedToolIds: ["incoterms"],
  }),

  entry({
    id: "retail-replenishment",
    title: "Bổ sung Hàng bán lẻ (Retail Replenishment)",
    subtitle: "ROP · Min-Max · DRP · Store allocation · POS-driven",
    category: "Tồn kho",
    language: "Practice + Python",
    difficulty: "Trung cấp",
    readingTime: "60 phút",
    tags: ["Replenishment", "Retail", "ROP", "DRP", "Allocation"],
    summary: "Chiến lược bổ sung hàng cho chuỗi bán lẻ: ROP, min-max, DRP, allocation store-level, và POS-driven replenishment.",
    overview:
      "Retail replenishment là quy trình chuyển hàng từ DC/central warehouse đến cửa hàng để duy trì shelf availability mà không overstock. Khác với manufacturing replenishment vì: thousands of SKUs × hundreds of stores, demand heterogeneity, và promotional spikes.\n\nBài viết cover replenishment policies (ROP, min-max, periodic review), Distribution Requirements Planning (DRP), store allocation logic, và POS-driven auto-replenishment cho modern retail VN.",
    scientificBasis: "Multi-echelon inventory theory: DC và store là 2 tier — optimize jointly hoặc sequentially. Newsvendor at store level với short lead time (1-3 ngày từ DC). Aggregation: store demand → DC forecast.",
    whenToUse: "Chuỗi retail ≥10 cửa hàng, centralized DC, cần automate replenishment.",
    whenNotToUse: "Store tự order từ supplier (DSD model) — replenishment khác.",
    vietnamContext: "Chuỗi VN: WinMart, Bach Hoa Xanh, Circle K, Guardian. DC tại BD/Long An. Replenishment 2-3 lần/tuần store urban. Promo 11.11, Tết cần override. Fresh category replenishment daily.",
    keyConcepts: [
      "Replenishment policy — ROP, min-max, (s,S)",
      "DRP — Distribution Requirements Planning",
      "Store allocation — chia hàng DC limited stock",
      "POS-driven — trigger từ sales real-time",
      "Shelf availability — % SKU in-stock tại shelf",
      "Case pack rounding — order theo thùng",
      "Display minimum — tồn tối thiểu trưng bày",
      "Lead time store — DC to store transit",
      "Promo uplift factor — hệ số tăng nhu cầu promo",
      "Markdown trigger — giảm giá khi slow mover",
      "Centralized vs decentralized ordering",
      "VMI retailer-supplier — supplier replenish shelf",
    ],
    applications: [
      "Auto-replenish 500 SKU × 100 stores từ DC",
      "Allocation khi DC stock < total store demand",
      "Fresh daily replenishment bakery category",
      "Promo pre-build inventory 2 tuần trước",
    ],
    methods: ["ROP calculation per store-SKU", "Fair-share allocation", "POS feed integration", "Promo planning overlay"],
    stepByStep: [
      "Segment SKU-store by ABC và velocity",
      "Set replenishment policy per segment",
      "Calculate ROP/min-max với store lead time",
      "Daily batch replenishment orders",
      "Allocation khi constrained supply",
      "Pick-pack-ship DC → store",
      "Monitor shelf availability KPI",
      "Weekly review slow movers và overrides",
    ],
    pitfalls: [
      "Cùng ROP mọi store — ignore local demand",
      "Không round case pack — supplier reject",
      "Promo uplift quên — stockout ngày 1 promo",
      "DC stock allocate unfair — store complaint",
    ],
    formulas: [
      { name: "Store ROP", expression: "ROP = d_store × L + SS_store", variables: "d_store: daily sales store, L: lead time DC→store" },
      { name: "Shelf availability", expression: "SA = In-stock SKU-hours / Total SKU-hours × 100%", variables: "Target ≥95% class A" },
    ],
    faq: [
      { question: "DRP khác MRP thế nào?", answer: "MRP cho manufacturing (BOM explosion). DRP cho distribution (network replenishment store/DC). Cùng logic netting requirements." },
    ],
    sections: [
      { id: "policies", title: "Chính sách bổ sung", content: "Chọn policy theo segment:", bullets: ["A-store A-SKU: daily ROP high service", "C-store C-SKU: weekly min-max", "Fresh: daily fixed quantity", "Promo: manual override + uplift"] },
      { id: "allocation", title: "Phân bổ khi thiếu hàng", content: "Fair-share methods:", bullets: ["Proportional to forecast", "Priority store tier", "First-come first-served", "Maximize total expected sales"] },
    ],
    pythonStack: ["pandas", "numpy"],
    implementationNotes: "Store-SKU matrix sparse — vectorize calculation. Promo calendar integration bắt buộc.",
    relatedModuleIds: ["inventory-management", "abc-analysis"],
    relatedToolIds: ["inventory", "abc"],
    codeExample: `import pandas as pd
import numpy as np

def store_rop(daily_sales, lead_time, service_z, sigma_d):
    ss = service_z * sigma_d * np.sqrt(lead_time)
    return daily_sales * lead_time + ss

def fair_share_allocation(dc_stock, store_forecast):
    total = store_forecast.sum()
    if total <= dc_stock:
        return store_forecast
    return (store_forecast / total * dc_stock).astype(int)`,
  }),

  entry({
    id: "warehouse-layout-design",
    title: "Thiết kế Bố trí Kho (Warehouse Layout)",
    subtitle: "Flow · Slotting · Zones · U-flow · Capacity planning",
    category: "Kho bãi",
    language: "Design + Practice",
    difficulty: "Trung cấp",
    readingTime: "65 phút",
    tags: ["Layout", "Slotting", "Racking", "Flow", "Capacity"],
    summary: "Nguyên tắc thiết kế layout kho: material flow, zoning, rack selection, slotting, và capacity planning cho kho mới hoặc redesign.",
    overview:
      "Warehouse layout quyết định productivity, safety, và khả năng scale. Layout tồi tăng travel distance picking 40%+, gây congestion, và limit capacity.\n\nBài viết giải thích flow patterns (U-flow, I-flow, L-flow), functional zoning (receiving, storage, pick, pack, ship), rack types (selective, drive-in, mezzanine), slotting principles, và cách tính capacity (pallet positions, pick faces).",
    scientificBasis: "Facility layout problem — minimize material handling cost. Pick path optimization depends on aisle layout. Cube utilization vs accessibility trade-off. Throughput capacity = f(docks, aisles, pick stations).",
    whenToUse: "Greenfield kho mới, redesign kho utilization >85%, hoặc thay đổi business model (e-commerce pick-pack).",
    whenNotToUse: "Kho thuê ngắn hạn <2 năm với volume nhỏ — optimize process trước layout.",
    vietnamContext: "Thuê kho KCN BD/Long An $3-6/m². Nhiều kho thấp tầng (6-8m) phù hợp selective rack. E-commerce cần pack station zone lớn. Forklift electric phổ biến. Fire safety PCCC bắt buộc.",
    keyConcepts: [
      "Material flow — one-way, minimize cross-traffic",
      "U-flow — receive và ship cùng phía, storage giữa",
      "I-flow — receive một đầu, ship đầu kia",
      "Functional zones — receive, QC, bulk, pick, pack, ship, returns",
      "Selective rack — FIFO, mọi pallet accessible",
      "Drive-in rack — high density, LIFO, ít SKU",
      "Mezzanine — tận dụng chiều cao cho slow movers",
      "Pick face — vị trí pick từng SKU",
      "Golden zone — waist-to-shoulder height, fastest pick",
      "Aisle width — forklift turning radius",
      "Dock doors — ratio inbound/outbound",
      "Staging lanes — buffer trước ship",
      "Cube utilization — used volume / total volume",
      "Slotting — ABC velocity → location assignment",
    ],
    applications: [
      "Redesign 5.000m² e-commerce DC — thêm pack zone",
      "Slotting project giảm 25% pick distance",
      "Drive-in rack cho seasonal inventory",
      "Capacity plan: 10.000 pallet positions",
    ],
    methods: ["AutoCAD layout drawing", "Simulation (FlexSim, AnyLogic)", "ABC slotting analysis", "Gemba walk measurement"],
    stepByStep: [
      "Collect data: SKU cube, velocity, equipment type",
      "Define zones và flow pattern",
      "Calculate storage capacity requirement",
      "Select rack type per zone",
      "Draw layout draft — aisle, dock, equipment path",
      "Slotting plan — A near dock, C far/mezzanine",
      "Validate với pick path simulation",
      "Implement phased — không stop operation",
      "Measure before/after pick productivity",
    ],
    pitfalls: [
      "Layout không chừa growth 20-30%",
      "Aisle quá hẹp — forklift bottleneck",
      "Không zone returns — contaminate forward flow",
      "Pick face quá nhỏ — replenish liên tục",
      "Bỏ qua PCCC aisle clearance",
    ],
    formulas: [
      { name: "Pallet positions", expression: "Positions = Floor area × Levels × Utilization / Pallet footprint", variables: "Utilization 85-90% realistic" },
      { name: "Pick density", expression: "Picks / m² pick area", variables: "Benchmark theo kho type" },
    ],
    faq: [
      { question: "U-flow hay I-flow?", answer: "U-flow: kho nhỏ-trung, shared dock, e-commerce. I-flow: kho lớn, tách receive/ship, giảm congestion dock." },
    ],
    sections: [
      { id: "zones", title: "Phân vùng chức năng", content: "Zones chuẩn:", bullets: ["Receiving + QC: gần inbound dock", "Bulk storage: xa, high rack", "Forward pick: golden zone", "Pack & ship: gần outbound dock", "Returns: tách biệt flow"] },
      { id: "slotting", title: "Slotting chiến lược", content: "Gán vị trí theo velocity:", bullets: ["A-SKU: 10-20m từ dock", "B-SKU: mid warehouse", "C-SKU: mezzanine/far", "Re-slot quarterly sau ABC review"] },
    ],
    pythonStack: ["pandas", "numpy"],
    implementationNotes: "Measure current state trước redesign. Phased implementation. PCCC approval trước construction.",
    relatedModuleIds: ["warehouse-logistics"],
  }),
];