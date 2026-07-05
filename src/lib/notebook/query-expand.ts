/** Mở rộng câu hỏi tiếng Việt để retrieval chính xác hơn */
export function expandQuery(query: string): string[] {
  const base = query.trim().toLowerCase();
  const variants = new Set<string>([query.trim()]);

  const expansions: [RegExp, string[]][] = [
    [/tóm tắt|summary|tổng quan/i, ["nội dung chính", "ý chính", "overview", "key points"]],
    [/khái niệm|concept|thuật ngữ/i, ["định nghĩa", "terminology", "glossary", "thuật ngữ"]],
    [/logistics|chuỗi cung ứng|scm|supply chain/i, ["logistics", "supply chain", "SCM", "vận hành"]],
    [/eoq|tồn kho|inventory/i, ["EOQ", "inventory", "stock", "tồn kho", "reorder"]],
    [/incoterm|thương mại/i, ["Incoterms", "FOB", "CIF", "DDP", "trade terms"]],
    [/kho|warehouse|wms/i, ["warehouse", "WMS", "kho bãi", "fulfillment"]],
    [/vận tải|transport|freight/i, ["transportation", "freight", "shipping", "carrier"]],
    [/chi phí|cost/i, ["cost", "chi phí", "logistics cost", "Landed Cost"]],
    [/rủi ro|risk/i, ["risk", "rủi ro", "mitigation", "disruption"]],
    [/so sánh|compare/i, ["so sánh", "khác biệt", "versus", "comparison"]],
    [/ứng dụng|thực tiễn|apply/i, ["ứng dụng", "case study", "best practice", "implementation"]],
    [/quiz|câu hỏi|kiểm tra/i, ["câu hỏi", "ôn tập", "quiz", "assessment"]],
    [/lean|tinh gọn|lãng phí/i, ["lean", "waste", "kaizen", "5S", "tinh gọn"]],
    [/last mile|giao hàng|delivery/i, ["last mile", "delivery", "fulfillment", "giao hàng"]],
    [/procurement|mua hàng|sourcing/i, ["procurement", "sourcing", "purchasing", "mua hàng"]],
    [/demand|dự báo|forecast/i, ["demand planning", "forecast", "dự báo nhu cầu"]],
    [/3pl|4pl|đối tác logistics/i, ["3PL", "4PL", "logistics provider", "outsourcing"]],
  ];

  for (const [pattern, words] of expansions) {
    if (pattern.test(base)) {
      words.forEach((w) => variants.add(w));
    }
  }

  return [...variants];
}

export function detectQueryIntent(query: string): "summary" | "concepts" | "compare" | "apply" | "qa" {
  if (/tóm tắt|summary|tổng quan|toàn bộ/i.test(query)) return "summary";
  if (/khái niệm|thuật ngữ|liệt kê|list/i.test(query)) return "concepts";
  if (/so sánh|khác|versus/i.test(query)) return "compare";
  if (/ứng dụng|thực tiễn|làm sao|how to/i.test(query)) return "apply";
  return "qa";
}