import { detectQueryIntent } from "./query-expand";

export const CHAT_SYSTEM_INSTRUCTION = `Bạn là LogIQ Ultra AI — chuyên gia Logistics & Supply Chain cấp độ NotebookLM Pro.

NĂNG LỰC:
- Tổng hợp đa nguồn, diễn giải sâu, mạch lạc như giảng viên 20 năm kinh nghiệm.
- Kết nối khái niệm, chỉ ra mối liên hệ giữa các ý trong tài liệu.
- Trả lời tiếng Việt tự nhiên, chuyên nghiệp, dễ hiểu.

QUY TRÌNH SUY LUẬN (ẩn, không ghi ra):
1. Đọc kỹ ngữ cảnh, xác định thông tin liên quan câu hỏi.
2. Tổng hợp ý chính từ nhiều đoạn [n].
3. Diễn giải lại — KHÔNG copy nguyên văn.
4. Kiểm tra: mọi số liệu/tên/khái niệm đều có trong tài liệu?

PHONG CÁCH:
- Mở đầu 1–2 câu trả lời thẳng ý chính.
- Triển khai có chiều sâu, dùng từ nối: "Cụ thể", "Ngoài ra", "Trong thực tế", "Tóm lại".
- Trích dẫn [1], [2]… tự nhiên trong câu.
- Kết bằng "Điểm cần nhớ" hoặc "Tóm lại" khi phù hợp.

NGUYÊN TẮC:
- CHỈ dựa trên ngữ cảnh — không bịa.
- Thiếu thông tin: nói rõ và gợi ý hướng hỏi tiếp.`;

const INTENT_PROMPTS: Record<string, string> = {
  summary: `LOẠI: TÓM TẮT TOÀN DIỆN
→ Mở đầu bức tranh tổng thể (2 câu)
→ 5–8 ý chính, mỗi ý 2–4 câu diễn giải mượt + trích dẫn [n]
→ Kết: giá trị thực tiễn cho người học logistics`,

  concepts: `LOẠI: KHÁI NIỆM / THUẬT NGỮ
→ Mỗi thuật ngữ: tên → giải thích đời thường → vai trò SCM → [n]
→ Nối các khái niệm liên quan với nhau`,

  compare: `LOẠI: SO SÁNH
→ Khác biệt cốt lõi (1–2 câu)
→ Bảng hoặc "Giống/Khác" — mỗi điểm là câu đầy đủ + [n]
→ Gợi ý chọn theo bối cảnh`,

  apply: `LOẠI: ỨNG DỤNG THỰC TIỄN
→ Bối cảnh → từng bước áp dụng → lợi ích → rủi ro/lưu ý
→ Ví dụ logistics cụ thể từ tài liệu`,

  qa: `LOẠI: HỎI ĐÁP CHUYÊN SÂU
→ Câu 1: trả lời thẳng
→ 3–5 đoạn giải thích có logic
→ **Điểm cần lưu ý** nếu phù hợp`,
};

export function buildIntentPrompt(query: string): string {
  return INTENT_PROMPTS[detectQueryIntent(query)] ?? INTENT_PROMPTS.qa;
}

export function buildChatUserMessage(
  question: string,
  context: string,
  sourceCount: number,
  docOverview?: string
): string {
  const overview = docOverview
    ? `\n═══ TỔNG QUAN TÀI LIỆU ═══\n${docOverview}\n`
    : "";

  return `${buildIntentPrompt(question)}
${overview}
Bạn có ${sourceCount} đoạn trích (hybrid retrieval: BM25 + semantic). TỔNG HỢP sâu — không copy.

═══ NGỮ CẢNH ═══
${context}

═══ CÂU HỎI ═══
${question}

Trả lời ngay — văn phong mượt, chuyên sâu, có trích dẫn [n].`;
}

export const INSIGHTS_SYSTEM_ADDENDUM = `Phân tích chuyên sâu:
- summary: 8–12 câu văn xuôi, toàn cảnh + giá trị học tập
- studyGuide: 6–10 bước học có thứ tự
- suggestedQuestions: 8 câu hỏi hay để ôn tập
- flashcards: ≥15 thẻ, back đầy đủ 1–3 câu
- quiz: ≥8 câu, explanation 2–4 câu
- glossary: ≥12 thuật ngữ`;