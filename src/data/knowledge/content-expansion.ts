import type { KnowledgeEntry } from "./types";

type Expansion = Partial<
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
    | "faq"
    | "glossary"
    | "sections"
    | "caseStudies"
  >
>;

/** Bổ sung nội dung chuyên sâu — merge vào entries hiện có */
export const contentExpansion: Record<string, Expansion> = {
  "eoq-inventory-theory": {
    sections: [
      {
        id: "assumption-audit",
        title: "Kiểm tra giả định EOQ — Assumption Audit",
        content:
          "Trước khi áp dụng EOQ, audit từng giả định Wilson model với thực tế SKU. Bảng dưới giúp quyết định adjust hay dùng model khác.",
        bullets: [
          "Demand constant? → Nếu trend/season: deseasonalize D hoặc dùng EPQ/periodic review",
          "Instant replenishment? → Thêm pipeline stock = d×L vào avg inventory",
          "No stockout? → Thêm SS riêng, EOQ chỉ cho cycle stock",
          "Fixed S? → Include buyer time, freight amortization",
          "Fixed H? → H = unit_value × (WACC + warehouse + obsolescence rate)",
          "No discount? → Chuyển quantity discount model",
          "MOQ binding? → Q = max(Q*, MOQ), recalc TC",
        ],
      },
      {
        id: "sensitivity",
        title: "Phân tích độ nhạy (Sensitivity)",
        content: "EOQ robust ±20-30% quanh Q* — total cost curve flat. Nhưng S và H estimate sai 50% → Q* shift đáng kể. Luôn tornado chart S, H, D.",
        bullets: [
          "D +20% → Q* tăng √20% ≈ 9.5%",
          "S +50% → Q* tăng √50% ≈ 22%",
          "H +50% → Q* giảm √50% ≈ 22%",
          "Present sensitivity cho procurement negotiation",
        ],
      },
    ],
    faq: [
      {
        question: "Pipeline stock có tính vào EOQ không?",
        answer: "EOQ Q*/2 là cycle stock. Pipeline = d×L (hàng đang về) là additive — total avg inventory = Q*/2 + d×L + SS. Không nhầm pipeline vào EOQ formula.",
      },
      {
        question: "Review period bao lâu với EOQ policy?",
        answer: "Cycle time = Q*/D years. Class A review mỗi cycle; class C có thể periodic review (s,S) thay continuous EOQ. Thực tế: weekly review A, monthly B/C.",
      },
    ],
    glossary: [
      { term: "Wilson Formula", definition: "Q* = √(2DS/H) — classic EOQ 1913" },
      { term: "Wagner-Whitin", definition: "Dynamic lot sizing — EOQ khi demand varying" },
      { term: "Silver-Meal", definition: "Heuristic dynamic lot — look-ahead horizon cost" },
    ],
  },

  "time-series-statistical": {
    sections: [
      {
        id: "arima-practice",
        title: "ARIMA(p,d,q) — Thực hành chọn tham số",
        content: "Workflow Box-Jenkins: identify (ACF/PACF) → estimate → diagnose (Ljung-Box) → forecast. Auto-ARIMA (pmdarima) cho batch SKU.",
        bullets: [
          "d=1 nếu series non-stationary (trend)",
          "p từ PACF cutoff, q từ ACF cutoff",
          "AIC/BIC compare models",
          "Residuals white noise test",
          "Rolling origin CV — không in-sample MAPE",
          "Seasonal ARIMA (SARIMA) cho mùa rõ",
        ],
      },
      {
        id: "ets-guide",
        title: "ETS (Error-Trend-Seasonal)",
        content: "ETS taxonomy: A/M/N cho Error, Trend, Seasonal. ETS(A,A,A) = Holt-Winters additive. Robust hơn ARIMA cho short series business.",
        bullets: [
          "ETS(A,N,N) = Simple exponential smoothing",
          "ETS(A,A,N) = Holt linear trend",
          "ETS(A,A,A) = Holt-Winters seasonal",
          "statsmodels ETS hoặc R fable",
        ],
      },
    ],
    faq: [
      {
        question: "ARIMA hay Prophet cho SKU VN?",
        answer: "Prophet: ít code, holidays Tết built-in, nhiều SKU nhanh. ARIMA: kiểm soát hơn, tốt series ổn định dài. Intermittent → Croston, không ARIMA.",
      },
    ],
  },

  "prophet-forecasting": {
    sections: [
      {
        id: "prophet-params",
        title: "Tham số Prophet quan trọng",
        content: "changepoint_prior_scale: flexibility trend (0.05 default, tăng nếu trend shift). seasonality_prior_scale: strength seasonality. holidays_prior_scale: Tết/11.11 impact.",
        bullets: [
          "changepoint_prior_scale 0.001-0.5",
          "seasonality_mode: additive vs multiplicative",
          "add_country_holidays('VN')",
          "Custom holidays CSV cho 11.11, 12.12",
          "cap/floor logistic growth nếu cần",
        ],
      },
    ],
  },

  "fleetbase-tms": {
    sections: [
      {
        id: "vrp-formulation",
        title: "VRP Formulation chi tiết",
        content: "VRP: minimize Σ c_ij x_ij subject to each customer visited once, capacity Σ q_i y_ik ≤ Q_k, time windows. OR-Tools: RoutingModel + dimensions.",
        bullets: [
          "Binary x_ij = vehicle k travels i→j",
          "Capacity dimension cumul",
          "Time dimension với slack",
          "Penalty dropping node nếu infeasible",
          "First solution: PATH_CHEAPEST_ARC",
          "Local search: GUIDED_LOCAL_SEARCH",
        ],
      },
    ],
    faq: [
      {
        question: "VRP infeasible — xử lý thế nào?",
        answer: "Relax time windows (penalty), thêm vehicle, drop low-priority nodes với penalty cost, hoặc cluster customers split sub-VRP. Luôn set time_limit_seconds.",
      },
    ],
  },

  "incoterms-2020": {
    sections: [
      {
        id: "decision-tree",
        title: "Decision Tree chọn Incoterm",
        content: "Flowchart: multimodal? → FCA/CPT/CIP. Sea only traditional? → FOB/CFR/CIF. Seller lo import? → DDP (cẩn thận). Buyer control freight? → FOB/FCA.",
        bullets: [
          "Exporter VN muốn control shipping → CIF/CIP",
          "Buyer có contract freight riêng → FOB/FCA",
          "Container depot → FCA not FOB",
          "DDP chỉ khi seller hiểu import duty đích",
          "Luôn named place: 'FOB Ho Chi Minh City, Incoterms® 2020'",
        ],
      },
      {
        id: "risk-transfer",
        title: "Điểm chuyển rủi ro vs chi phí",
        content: "Nhóm C: risk chuyển tại origin (goods on board/handover) nhưng seller trả freight đến dest. Insurance gap nếu buyer không mua thêm.",
        bullets: [
          "CIF seller insurance minimum — buyer có thể cần top-up",
          "CIP ICC(A) broader than CIF ICC(C)",
          "Document timing: B/L date = risk transfer FOB",
        ],
      },
    ],
  },

  "forecast-accuracy-metrics": {
    sections: [
      {
        id: "metric-selection",
        title: "Chọn metric theo ngành",
        content: "MAPE misleading khi actual nhỏ. MAE robust. WAPE (weighted) cho aggregate. MASE vs naive benchmark.",
        bullets: [
          "MAPE: retail SKU volume ổn định",
          "MAE: intermittent low volume",
          "WAPE: planning aggregate category",
          "MASE < 1 = beat naive",
          "Tracking signal ±4 cho bias alert",
        ],
      },
    ],
  },

  "croston-intermittent-demand": {
    sections: [
      {
        id: "croston-detail",
        title: "Croston & SBA/TBS chi tiết",
        content: "Croston forecast = (smoothed demand size) / (smoothed inter-demand interval). SBA correction bias. TSB probability demand occurrence — tốt hơn khi obsolescence.",
        bullets: [
          "Classify ADI (avg demand interval) > 1.32 → intermittent",
          "Croston α typically 0.1-0.2",
          "SBA: multiply Croston by (1 - α/2)",
          "TSB: smooth demand probability separately",
          "Don't use MAPE — use MAE per period",
        ],
      },
    ],
  },

  "python-supply-chain-optimization": {
    sections: [
      {
        id: "mip-practice",
        title: "MIP thực hành với OR-Tools",
        content: "Facility location: binary y_j open facility j, continuous x_ij flow. Big-M constraints linking flow to open. Time limit bắt buộc.",
        bullets: [
          "Solver: SCIP/CBC/Gurobi via OR-Tools",
          "Gap tolerance 1-2% acceptable strategic",
          "Warm start từ LP relaxation",
          "Validate solution integer feasible",
        ],
      },
    ],
  },

  "retail-replenishment": {
    sections: [
      {
        id: "store-sku",
        title: "Store-SKU replenishment matrix",
        content: "Không một policy cho tất cả. Matrix: velocity × store tier × shelf life → policy template.",
        bullets: [
          "A-store + A-SKU: daily ROP 98% SL",
          "B-store + B-SKU: 2×/week min-max",
          "C-store + C-SKU: weekly push",
          "Fresh: daily fixed qty forecast",
          "New item: analog launch curve",
        ],
      },
    ],
  },

  "customs-clearance-vietnam": {
    sections: [
      {
        id: "red-channel",
        title: "Xử lý luồng đỏ/vàng",
        content: "Red channel: physical inspect 100%. Yellow: doc check. Chuẩn bị: invoice match PO, HS ruling, C/O valid, license ready.",
        bullets: [
          "AEO enterprise → green probability cao",
          "Pre-clearance declaration trước hàng đến",
          "Bonded warehouse nếu chưa đủ giấy phép",
          "Appeal classification nếu dispute HS",
        ],
      },
    ],
  },
};