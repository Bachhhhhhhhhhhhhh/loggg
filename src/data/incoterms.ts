export type IncotermGroup = "E" | "F" | "C" | "D";
export type TransportScope = "all" | "sea-inland";

export interface ObligationRow {
  task: string;
  seller: "yes" | "no" | "optional" | "buyer-if-agreed";
  buyer: "yes" | "no" | "optional" | "seller-if-agreed";
}

export interface Incoterm {
  code: string;
  fullName: string;
  group: IncotermGroup;
  groupLabel: string;
  transportScope: TransportScope;
  transportNote: string;
  sellerDelivers: string;
  riskTransfer: string;
  costTransfer: string;
  insurance: string;
  exportClearance: string;
  importClearance: string;
  loadingAtOrigin: string;
  unloadingAtDestination: string;
  summary: string;
  whenToUse: string[];
  sellerPros: string[];
  sellerCons: string[];
  buyerPros: string[];
  buyerCons: string[];
  documents: string[];
  commonMistakes: string[];
  relatedTerms: string[];
  obligations: ObligationRow[];
}

export const INCOTERM_GROUPS = {
  E: { label: "Departure — Xuất phát", color: "#6B7280", description: "Người bán giao hàng tại địa điểm của mình. Rủi ro chuyển sớm nhất." },
  F: { label: "Main Carriage Unpaid — Vận chuyển chính chưa trả", color: "#3B82F6", description: "Người bán giao cho đơn vị vận tải do người mua thuê. Rủi ro chuyển khi giao cho carrier." },
  C: { label: "Main Carriage Paid — Vận chuyển chính đã trả", color: "#14B8A6", description: "Người bán trả cước vận chuyển chính nhưng rủi ro chuyển sớm hơn điểm đến." },
  D: { label: "Arrival — Đến nơi", color: "#8B5CF6", description: "Người bán chịu rủi ro và chi phí đến điểm đến (hoặc hơn)." },
} as const;

const baseObligations = (sellerExport: boolean, buyerImport: boolean): ObligationRow[] => [
  { task: "Chuẩn bị hàng hóa & chứng từ thương mại", seller: "yes", buyer: "no" },
  { task: "Thông báo giao hàng cho bên kia", seller: "yes", buyer: "yes" },
  { task: "Xuất khẩu thủ tục hải quan", seller: sellerExport ? "yes" : "no", buyer: sellerExport ? "no" : "yes" },
  { task: "Nhập khẩu thủ tục hải quan", seller: buyerImport ? "yes" : "no", buyer: buyerImport ? "no" : "yes" },
  { task: "Kiểm tra & nhận hàng", seller: "no", buyer: "yes" },
];

export const incoterms: Incoterm[] = [
  {
    code: "EXW",
    fullName: "Ex Works — Giao tại xưởng",
    group: "E",
    groupLabel: "Nhóm E — Departure",
    transportScope: "all",
    transportNote: "Mọi phương thức vận tải",
    sellerDelivers: "Đặt hàng sẵn sàng tại cơ sở người bán (nhà máy, kho, xưởng).",
    riskTransfer: "Tại cơ sở người bán — khi hàng đặt à disposition của người mua.",
    costTransfer: "Mọi chi phí sau khi hàng sẵn sàng tại xưởng do người mua chịu.",
    insurance: "Không bắt buộc. Người mua tự mua bảo hiểm nếu cần.",
    exportClearance: "Người mua (trừ khi thỏa thuận người bán hỗ trợ — không bắt buộc theo EXW).",
    importClearance: "Người mua",
    loadingAtOrigin: "Người mua (trừ thỏa thuận khác)",
    unloadingAtDestination: "Người mua",
    summary: "Người bán chịu trách nhiệm tối thiểu. Phù hợp khi người mua kiểm soát toàn bộ logistics xuất khẩu.",
    whenToUse: [
      "Người mua có đội logistics mạnh tại nước xuất khẩu",
      "Giao dịch nội địa hoặc người mua tự lo vận chuyển quốc tế",
      "Máy móc lớn cần người mua tự điều phối bốc xếp",
    ],
    sellerPros: ["Trách nhiệm tối thiểu", "Không lo vận chuyển quốc tế", "Giá báo đơn giản"],
    sellerCons: ["Ít kiểm soát chất lượng giao hàng", "Người mua có thể chậm lấy hàng"],
    buyerPros: ["Kiểm soát hoàn toàn logistics", "Tối ưu cước và forwarder của mình"],
    buyerCons: ["Chịu mọi rủi ro từ xưởng", "Phải lo xuất khẩu tại nước seller"],
    documents: ["Commercial Invoice", "Packing List", "EXW delivery note"],
    commonMistakes: [
      "Nhầm EXW với FCA khi cần seller lo export clearance",
      "Không thỏa thuận ai chịu loading tại xưởng",
      "Dùng EXW cho người mua không có kinh nghiệm xuất nhập khẩu",
    ],
    relatedTerms: ["FCA", "FOB"],
    obligations: baseObligations(false, false),
  },
  {
    code: "FCA",
    fullName: "Free Carrier — Giao cho người vận chuyển",
    group: "F",
    groupLabel: "Nhóm F — Main Carriage Unpaid",
    transportScope: "all",
    transportNote: "Mọi phương thức — container, air, road, rail, multimodal",
    sellerDelivers: "Giao hàng đã cleared export cho carrier do người mua chỉ định tại điểm đã thỏa thuận.",
    riskTransfer: "Khi giao cho carrier tại điểm named place.",
    costTransfer: "Chi phí đến điểm giao cho carrier — seller; sau đó buyer.",
    insurance: "Không bắt buộc seller. Buyer tự mua.",
    exportClearance: "Người bán",
    importClearance: "Người mua",
    loadingAtOrigin: "Seller nếu điểm giao là cơ sở seller; otherwise theo địa điểm",
    unloadingAtDestination: "Người mua / carrier",
    summary: "Thay thế FOB cho multimodal. Phổ biến nhất cho container FCL/LCL.",
    whenToUse: [
      "Container giao tại CY/CFS hoặc bãi carrier",
      "Multimodal transport (đường bộ + biển + air)",
      "Seller cần lo export nhưng buyer chọn forwarder",
    ],
    sellerPros: ["Lo export clearance", "Phù hợp Incoterms 2020 container"],
    sellerCons: ["Phải phối hợp carrier của buyer", "Rủi ro chuyển sớm tại terminal"],
    buyerPros: ["Chọn forwarder và tuyến", "Seller lo hải quan xuất"],
    buyerCons: ["Chịu rủi ro từ khi giao carrier", "Phải book carriage chính"],
    documents: ["Commercial Invoice", "Packing List", "Export declaration", "Delivery note to carrier"],
    commonMistakes: [
      "Ghi FOB cho container khi nên dùng FCA",
      "Không chỉ rõ điểm giao (seller premises vs terminal)",
      "Nhầm lẫn On Board vs Received for Shipment B/L",
    ],
    relatedTerms: ["FOB", "CPT", "EXW"],
    obligations: baseObligations(true, false),
  },
  {
    code: "FAS",
    fullName: "Free Alongside Ship — Giao dọc mạn tàu",
    group: "F",
    groupLabel: "Nhóm F — Main Carriage Unpaid",
    transportScope: "sea-inland",
    transportNote: "Chỉ đường biển & đường thủy nội địa",
    sellerDelivers: "Đặt hàng dọc mạn tàu tại cảng xuất đã chỉ định.",
    riskTransfer: "Khi hàng đặt alongside ship tại cảng xuất.",
    costTransfer: "Chi phí đến alongside ship — seller; từ đó buyer.",
    insurance: "Buyer tự mua",
    exportClearance: "Người bán",
    importClearance: "Người mua",
    loadingAtOrigin: "Người mua (stow on board)",
    unloadingAtDestination: "Người mua",
    summary: "Ít dùng hiện nay. Hàng rời, bulk cargo tại cảng.",
    whenToUse: ["Hàng rời (bulk) cảng xuất", "Người mua có kinh nghiệm xếp hàng lên tàu"],
    sellerPros: ["Không phải stow on board", "Lo export"],
    sellerCons: ["Ít phổ biến, dễ tranh chấp vị trí alongside", "Phụ thuộc cảng"],
    buyerPros: ["Kiểm soát loading và freight", "Phù hợp bulk commodity"],
    buyerCons: ["Rủi ro từ cạnh tàu", "Phải lo xếp hàng lên tàu"],
    documents: ["Invoice", "Packing List", "Export licence nếu có"],
    commonMistakes: ["Dùng cho container (nên FCA/FOB)", "Không xác định rõ cảng alongside"],
    relatedTerms: ["FOB", "FCA"],
    obligations: baseObligations(true, false),
  },
  {
    code: "FOB",
    fullName: "Free On Board — Giao lên tàu",
    group: "F",
    groupLabel: "Nhóm F — Main Carriage Unpaid",
    transportScope: "sea-inland",
    transportNote: "Chỉ đường biển & đường thủy nội địa — không dùng cho container đổ bãi",
    sellerDelivers: "Giao hàng đã export cleared lên tàu tại cảng xuất.",
    riskTransfer: "Khi hàng On Board tàu tại cảng xuất (Incoterms 2020).",
    costTransfer: "Chi phí đến on board — seller.",
    insurance: "Buyer mua (thường không bắt buộc trừ khi quy định ngành)",
    exportClearance: "Người bán",
    importClearance: "Người mua",
    loadingAtOrigin: "Người bán (stow on board)",
    unloadingAtDestination: "Người mua",
    summary: "Phổ biến cho hàng xuất khẩu Việt Nam — đường biển traditional.",
    whenToUse: [
      "Hàng rời hoặc break bulk truyền thống",
      "Người mua book freight và bảo hiểm hàng hóa",
      "Giá FOB cảng xuất quen thuộc trong hợp đồng",
    ],
    sellerPros: ["Chuẩn ngành xuất khẩu VN", "Seller lo export + loading on board"],
    sellerCons: ["Rủi ro đến khi lên tàu", "Không phù hợp container door-to-door"],
    buyerPros: ["Kiểm soát freight & insurance", "FOB price benchmarking"],
    buyerCons: ["Chịu rủi ro trên tàu", "Phải book vessel space"],
    documents: ["B/L On Board", "Invoice", "Packing List", "Certificate of Origin", "Export customs"],
    commonMistakes: [
      "FOB cho container giao tại depot (phải FCA)",
      "Nhầm risk transfer với CFR/CIF",
      "Không ghi rõ cảng FOB (FOB Ho Chi Minh City)",
    ],
    relatedTerms: ["CFR", "CIF", "FCA", "FAS"],
    obligations: baseObligations(true, false),
  },
  {
    code: "CFR",
    fullName: "Cost and Freight — Tiền hàng & cước",
    group: "C",
    groupLabel: "Nhóm C — Main Carriage Paid",
    transportScope: "sea-inland",
    transportNote: "Chỉ đường biển & đường thủy nội địa",
    sellerDelivers: "Trả cước vận chuyển đến cảng đích. Giao hàng on board tại cảng xuất.",
    riskTransfer: "Khi hàng On Board tại cảng xuất (giống FOB).",
    costTransfer: "Freight đến cảng đích — seller; unloading tại đích — buyer.",
    insurance: "Không bắt buộc seller. Buyer nên mua marine insurance.",
    exportClearance: "Người bán",
    importClearance: "Người mua",
    loadingAtOrigin: "Người bán",
    unloadingAtDestination: "Người mua",
    summary: "Seller trả cước nhưng rủi ro chuyển sớm — 'two critical points'.",
    whenToUse: ["Seller có hợp đồng freight tốt", "Buyer muốn seller lo booking nhưng tự bảo hiểm"],
    sellerPros: ["Cạnh tranh giá CFR cảng đích", "Kiểm soát carrier xuất"],
    sellerCons: ["Rủi ro trên biển không thuộc seller", "Phải trả freight dù hàng mất"],
    buyerPros: ["Biết trước freight đến cảng", "Tự chọn insurance cover"],
    buyerCons: ["Rủi ro từ khi on board", "CFR không bao gồm insurance"],
    documents: ["B/L", "Invoice", "Insurance (buyer)", "Export docs"],
    commonMistakes: [
      "Tưởng seller chịu rủi ro trên biển",
      "Dùng CFR cho container multimodal",
      "Không mua insurance khi dùng CFR",
    ],
    relatedTerms: ["CIF", "FOB", "CPT"],
    obligations: baseObligations(true, false),
  },
  {
    code: "CIF",
    fullName: "Cost Insurance and Freight — Tiền hàng, bảo hiểm & cước",
    group: "C",
    groupLabel: "Nhóm C — Main Carriage Paid",
    transportScope: "sea-inland",
    transportNote: "Chỉ đường biển — seller mua insurance tối thiểu Institute Cargo Clauses C",
    sellerDelivers: "Giống CFR + mua bảo hiểm tối thiểu cho buyer.",
    riskTransfer: "Khi hàng On Board tại cảng xuất.",
    costTransfer: "Freight + insurance minimum — seller đến cảng đích.",
    insurance: "Seller mua tối thiểu 110% invoice value, ICC(C) hoặc tương đương.",
    exportClearance: "Người bán",
    importClearance: "Người mua",
    loadingAtOrigin: "Người bán",
    unloadingAtDestination: "Người mua",
    summary: "Phổ biến xuất khẩu VN — seller lo freight + basic insurance.",
    whenToUse: [
      "Letter of Credit yêu cầu CIF",
      "Buyer muốn seller lo freight và insurance cơ bản",
      "Giao dịch đường biển truyền thống",
    ],
    sellerPros: ["Giá all-in đến cảng đích", "Phù hợp L/C"],
    sellerCons: ["Phải mua insurance cho buyer", "Rủi ro vẫn chuyển on board"],
    buyerPros: ["Freight + insurance cơ bản included", "Dễ so sánh giá CIF"],
    buyerCons: ["Insurance minimum có thể không đủ", "Rủi ro trên biển từ sớm"],
    documents: ["B/L", "Insurance Policy/Certificate", "Invoice", "CO", "Export customs"],
    commonMistakes: [
      "Buyer không nâng cấp insurance khi CIF chỉ ICC(C)",
      "Nhầm CIF nghĩa là seller chịu rủi ro đến cảng đích",
      "Dùng CIF cho air freight (nên CIP)",
    ],
    relatedTerms: ["CFR", "CIP", "FOB"],
    obligations: baseObligations(true, false),
  },
  {
    code: "CPT",
    fullName: "Carriage Paid To — Cước trả tới",
    group: "C",
    groupLabel: "Nhóm C — Main Carriage Paid",
    transportScope: "all",
    transportNote: "Mọi phương thức — tương đương CFR cho multimodal",
    sellerDelivers: "Trả cước vận chuyển đến địa điểm đích đã đặt tên.",
    riskTransfer: "Khi giao cho carrier đầu tiên tại điểm xuất phát.",
    costTransfer: "Freight đến đích — seller; sau risk transfer — buyer.",
    insurance: "Không bắt buộc seller",
    exportClearance: "Người bán",
    importClearance: "Người mua",
    loadingAtOrigin: "Theo điểm giao",
    unloadingAtDestination: "Người mua",
    summary: "CFR phiên bản multimodal — air, road, rail, container.",
    whenToUse: ["Air freight CPT airport", "Container door-to-port", "Multimodal với seller trả freight"],
    sellerPros: ["Linh hoạt mọi phương thức", "Cạnh tranh CPT điểm đến"],
    sellerCons: ["Two critical points — risk sớm, cost muộn", "Phải trả freight nếu hàng hư"],
    buyerPros: ["Freight included đến điểm đích", "Phù hợp air/container"],
    buyerCons: ["Rủi ro từ carrier đầu tiên", "Tự mua insurance"],
    documents: ["AWB/B/L/CMR", "Invoice", "Export docs"],
    commonMistakes: ["Dùng CPT nhưng kỳ vọng seller chịu rủi ro đến đích", "Không chỉ rõ điểm CPT"],
    relatedTerms: ["CIP", "FCA", "CFR"],
    obligations: baseObligations(true, false),
  },
  {
    code: "CIP",
    fullName: "Carriage and Insurance Paid To — Cước & bảo hiểm trả tới",
    group: "C",
    groupLabel: "Nhóm C — Main Carriage Paid",
    transportScope: "all",
    transportNote: "Mọi phương thức — seller mua insurance tối thiểu ICC(A) cho CIP",
    sellerDelivers: "Giống CPT + insurance tối thiểu Institute Cargo Clauses (A).",
    riskTransfer: "Khi giao cho carrier đầu tiên.",
    costTransfer: "Freight + insurance — seller đến điểm đích.",
    insurance: "Seller: ICC(A) minimum hoặc tương đương all-risk.",
    exportClearance: "Người bán",
    importClearance: "Người mua",
    loadingAtOrigin: "Theo điểm giao",
    unloadingAtDestination: "Người mua",
    summary: "CIF phiên bản multimodal với insurance all-risk tối thiểu.",
    whenToUse: ["High-value goods air freight", "Multimodal cần insurance mạnh", "L/C quốc tế hiện đại"],
    sellerPros: ["Insurance A — buyer được bảo vệ tốt hơn CIF", "Phù hợp high-tech"],
    sellerCons: ["Chi phí insurance cao hơn CIF", "Rủi ro chuyển sớm"],
    buyerPros: ["All-risk minimum từ seller", "Freight included"],
    buyerCons: ["Vẫn chịu rủi ro sau handover carrier", "Có thể cần insurance bổ sung"],
    documents: ["Transport doc", "Insurance certificate ICC(A)", "Invoice"],
    commonMistakes: ["Nhầm CIP với DAP", "Không nâng cấp insurance cho giá trị thực"],
    relatedTerms: ["CPT", "CIF", "DAP"],
    obligations: baseObligations(true, false),
  },
  {
    code: "DAP",
    fullName: "Delivered At Place — Giao tại điểm đến",
    group: "D",
    groupLabel: "Nhóm D — Arrival",
    transportScope: "all",
    transportNote: "Mọi phương thức — giao sẵn sàng dỡ hàng tại địa điểm đích",
    sellerDelivers: "Giao hàng sẵn sàng dỡ tại địa điểm đích đã đặt tên.",
    riskTransfer: "Tại địa điểm đích — sẵn sàng dỡ khỏi phương tiện đến.",
    costTransfer: "Mọi chi phí đến điểm đích (trừ import clearance) — seller.",
    insurance: "Seller thường mua đến điểm đích; không bắt buộc theo rule",
    exportClearance: "Người bán",
    importClearance: "Người mua",
    loadingAtOrigin: "Người bán",
    unloadingAtDestination: "Người mua (ready for unloading)",
    summary: "Seller giao đến kho/địa điểm buyer — buyer lo import thủ tục.",
    whenToUse: [
      "DDU thay thế (Incoterms 2020)",
      "Seller có mạng logistics tại nước nhập",
      "Buyer muốn hàng đến nơi nhưng tự lo import",
    ],
    sellerPros: ["Giá trọn gói đến địa điểm", "Kiểm soát last-mile đến door"],
    sellerCons: ["Chịu rủi ro đường dài", "Không lo import — phối hợp buyer customs"],
    buyerPros: ["Hàng đến địa điểm", "Tự kiểm soát import duty"],
    buyerCons: ["Phải lo nhập khẩu", "Chi phí dỡ hàng tại đích"],
    documents: ["Invoice", "Packing List", "Proof of delivery", "Export + transport docs"],
    commonMistakes: [
      "Nhầm DAP với DDP",
      "Không chỉ rõ địa điểm DAP (địa chỉ cụ thể)",
      "Seller vô tình lo import clearance",
    ],
    relatedTerms: ["DPU", "DDP", "CIP"],
    obligations: baseObligations(true, false),
  },
  {
    code: "DPU",
    fullName: "Delivered at Place Unloaded — Giao đã dỡ hàng",
    group: "D",
    groupLabel: "Nhóm D — Arrival",
    transportScope: "all",
    transportNote: "Mọi phương thức — seller chịu dỡ hàng tại đích (DAT cũ)",
    sellerDelivers: "Giao hàng đã dỡ khỏi phương tiện tại địa điểm đích.",
    riskTransfer: "Sau khi dỡ hàng tại địa điểm đích.",
    costTransfer: "Đến và including unloading — seller.",
    insurance: "Seller thường mua",
    exportClearance: "Người bán",
    importClearance: "Người mua",
    loadingAtOrigin: "Người bán",
    unloadingAtDestination: "Người bán",
    summary: "Duy nhất Incoterm bắt seller chịu unloading tại đích.",
    whenToUse: [
      "Terminal buyer không có thiết bị dỡ hàng",
      "Project cargo cần seller dỡ tại site",
      "Thay thế DAT Incoterms 2010",
    ],
    sellerPros: ["Dịch vụ cao — đến và dỡ", "Phân biệt với DAP rõ ràng"],
    sellerCons: ["Chi phí unloading tại đích", "Rủi ro đến sau dỡ"],
    buyerPros: ["Không lo dỡ hàng", "Hàng sẵn sàng tại kho"],
    buyerCons: ["Vẫn lo import", "Ít phổ biến hơn DAP/DDP"],
    documents: ["Delivery note unloaded", "Invoice", "Transport docs"],
    commonMistakes: ["Chọn DPU khi terminal cấm seller dỡ", "Nhầm với DDP"],
    relatedTerms: ["DAP", "DDP"],
    obligations: baseObligations(true, false),
  },
  {
    code: "DDP",
    fullName: "Delivered Duty Paid — Giao đã nộp thuế",
    group: "D",
    groupLabel: "Nhóm D — Arrival",
    transportScope: "all",
    transportNote: "Mọi phương thức — trách nhiệm tối đa người bán",
    sellerDelivers: "Giao hàng cleared import, sẵn sàng dỡ tại địa điểm đích.",
    riskTransfer: "Tại địa điểm đích sẵn sàng dỡ — sau import clearance.",
    costTransfer: "Mọi chi phí kể cả duty, tax, import clearance — seller.",
    insurance: "Seller thường mua toàn journey",
    exportClearance: "Người bán",
    importClearance: "Người bán",
    loadingAtOrigin: "Người bán",
    unloadingAtDestination: "Người mua (ready for unloading)",
    summary: "Seller chịu tối đa — door-to-door cleared. Buyer rủi ro tối thiểu.",
    whenToUse: [
      "Seller có entity tại nước nhập",
      "E-commerce cross-border seller lo customs",
      "Sample nhỏ gửi trọn gói",
    ],
    sellerPros: ["Giá trọn gói cho buyer", "Kiểm soát end-to-end"],
    sellerCons: ["Rủi ro và chi phí cao nhất", "Phải hiểu thuế nhập khẩu đích"],
    buyerPros: ["Chỉ việc nhận hàng", "Không lo customs import"],
    buyerCons: ["Giá cao", "Ít kiểm soát logistics", "Seller markup duty risk"],
    documents: ["Invoice", "Import entry", "Duty payment proof", "Delivery note"],
    commonMistakes: [
      "Seller không đăng ký được làm importer of record",
      "Không tính VAT/duty vào báo giá DDP",
      "Dùng DDP khi buyer muốn tự khấu trừ thuế",
    ],
    relatedTerms: ["DAP", "DPU", "CIP"],
    obligations: baseObligations(true, true),
  },
];

export const INCOTERM_MATRIX = {
  headers: ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"],
  rows: [
    { label: "Phạm vi vận tải", values: ["All", "All", "Sea", "Sea", "Sea", "Sea", "All", "All", "All", "All", "All"] },
    { label: "Export clearance", values: ["Buyer*", "Seller", "Seller", "Seller", "Seller", "Seller", "Seller", "Seller", "Seller", "Seller", "Seller"] },
    { label: "Loading on board", values: ["Buyer", "Varies", "Buyer", "Seller", "Seller", "Seller", "Varies", "Varies", "Seller", "Seller", "Seller"] },
    { label: "Main carriage freight", values: ["Buyer", "Buyer", "Buyer", "Buyer", "Seller", "Seller", "Seller", "Seller", "Seller", "Seller", "Seller"] },
    { label: "Insurance", values: ["Optional", "Buyer", "Buyer", "Buyer", "Buyer", "Seller(min C)", "Buyer", "Seller(min A)", "Optional", "Optional", "Optional"] },
    { label: "Import clearance", values: ["Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Seller"] },
    { label: "Unloading at destination", values: ["Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Buyer", "Seller", "Buyer"] },
    { label: "Rủi ro chuyển", values: ["Xưởng", "Carrier", "Alongside", "On Board", "On Board", "On Board", "Carrier 1", "Carrier 1", "Đích", "Sau dỡ", "Đích cleared"] },
  ],
};

export function getIncoterm(code: string): Incoterm | undefined {
  return incoterms.find((t) => t.code.toLowerCase() === code.toLowerCase());
}

export function getIncotermsByGroup(group: IncotermGroup): Incoterm[] {
  return incoterms.filter((t) => t.group === group);
}

export function recommendIncoterms(opts: {
  transport: "all" | "sea";
  sellerControl: "minimal" | "moderate" | "maximum";
  insuranceNeeded: boolean;
  importBySeller: boolean;
}): { primary: Incoterm; alternatives: Incoterm[]; reasoning: string } {
  const pool = incoterms.filter((t) =>
    opts.transport === "sea" ? true : t.transportScope === "all"
  );

  let primary: Incoterm | undefined;
  let reasoning = "";

  if (opts.sellerControl === "minimal") {
    primary = pool.find((t) => t.code === "EXW");
    reasoning = "Seller muốn trách nhiệm tối thiểu — EXW phù hợp nhất.";
  } else if (opts.importBySeller) {
    primary = pool.find((t) => t.code === "DDP");
    reasoning = "Seller lo cả nhập khẩu — DDP là điều khoản duy nhất yêu cầu seller cleared import.";
  } else if (opts.sellerControl === "maximum") {
    primary = pool.find((t) => t.code === "DAP");
    reasoning = "Seller giao đến địa điểm đích, buyer lo import — DAP cân bằng dịch vụ cao.";
  } else if (opts.insuranceNeeded && opts.transport === "sea") {
    primary = pool.find((t) => t.code === "CIF");
    reasoning = "Đường biển + seller mua bảo hiểm tối thiểu — CIF phổ biến trong L/C.";
  } else if (opts.insuranceNeeded) {
    primary = pool.find((t) => t.code === "CIP");
    reasoning = "Multimodal + insurance all-risk tối thiểu — CIP (ICC A).";
  } else if (opts.transport === "sea") {
    primary = pool.find((t) => t.code === "FOB");
    reasoning = "Đường biển, buyer lo freight & insurance — FOB chuẩn xuất khẩu.";
  } else {
    primary = pool.find((t) => t.code === "FCA");
    reasoning = "Multimodal/container — FCA thay FOB theo Incoterms 2020.";
  }

  primary = primary ?? pool[0];
  const alternatives = pool
    .filter((t) => t.code !== primary!.code && t.group === primary!.group)
    .slice(0, 2);

  return { primary, alternatives, reasoning };
}