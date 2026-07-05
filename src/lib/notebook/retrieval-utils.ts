const VI_STOPWORDS = new Set([
  "và", "của", "là", "có", "trong", "cho", "với", "được", "các", "một", "này",
  "để", "từ", "theo", "khi", "như", "trên", "về", "đã", "sẽ", "cũng", "hay",
  "hoặc", "nếu", "thì", "đó", "những", "tại", "bởi", "ra", "vào", "làm", "the",
  "the", "and", "or", "for", "with", "from", "that", "this", "are", "was", "were",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !VI_STOPWORDS.has(t));
}