import type { ChatMessage, NotebookSource } from "./types";
import { createId } from "./id";
import { retrieveChunks, toCitations } from "./retrieval";
import { askGemini } from "./ai";
import { getSettings } from "./storage";

const SUGGESTED_QUESTIONS = [
  "Tóm tắt nội dung chính của tài liệu",
  "Liệt kê các khái niệm quan trọng",
  "Ứng dụng thực tiễn trong logistics?",
  "So sánh các phương pháp được đề cập",
  "Rủi ro và lưu ý cần biết?",
];

export function getSuggestedQuestions(): string[] {
  return SUGGESTED_QUESTIONS;
}

function buildExtractiveAnswer(
  query: string,
  sources: NotebookSource[]
): { content: string; citations: ReturnType<typeof toCitations> } {
  const results = retrieveChunks(query, sources, 5);
  if (!results.length) {
    return {
      content:
        "Không tìm thấy thông tin liên quan trong tài liệu đã upload. Hãy thử đổi câu hỏi hoặc bật thêm nguồn tài liệu.",
      citations: [],
    };
  }

  const citations = toCitations(results);
  const isSummary = /tóm tắt|summary|tổng quan/i.test(query);

  if (isSummary) {
    const bullets = results.map(
      (r, i) => `**${i + 1}.** ${r.chunk.text.slice(0, 280)}${r.chunk.text.length > 280 ? "…" : ""}`
    );
    return {
      content: `Dựa trên ${results.length} đoạn liên quan trong tài liệu:\n\n${bullets.join("\n\n")}`,
      citations,
    };
  }

  const primary = results[0];
  const supporting = results.slice(1, 3);
  let answer = `Theo **${primary.source.name}**:\n\n${primary.chunk.text}`;

  if (supporting.length) {
    answer += "\n\n**Thông tin bổ sung:**\n";
    supporting.forEach((s, i) => {
      answer += `\n- ${s.chunk.text.slice(0, 180)}…`;
    });
  }

  return { content: answer, citations };
}

export async function sendMessage(
  query: string,
  sources: NotebookSource[],
  history: ChatMessage[]
): Promise<ChatMessage> {
  const settings = getSettings();
  const results = retrieveChunks(query, sources, 6);
  const citations = toCitations(results);

  let content: string;

  if (settings.useAi && settings.geminiApiKey && results.length > 0) {
    try {
      const context = results
        .map(
          (r, i) =>
            `[${i + 1}] (${r.source.name}): ${r.chunk.text}`
        )
        .join("\n\n");
      content = await askGemini(
        settings.geminiApiKey,
        query,
        context,
        history.slice(-4)
      );
    } catch {
      const fallback = buildExtractiveAnswer(query, sources);
      content = fallback.content + "\n\n*(AI không khả dụng — hiển thị kết quả trích xuất từ tài liệu)*";
    }
  } else {
    const extractive = buildExtractiveAnswer(query, sources);
    content = extractive.content;
  }

  return {
    id: createId("msg"),
    role: "assistant",
    content,
    citations,
    createdAt: Date.now(),
  };
}