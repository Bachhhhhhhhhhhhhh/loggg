import type { ChatMessage, NotebookSource } from "./types";
import { createId } from "./id";
import {
  retrieveForStudy,
  toCitations,
  buildContextFromChunks,
} from "./retrieval";
import { askGemini, isAiReady } from "./ai";
import { getSettings } from "./storage";
import { detectQueryIntent } from "./query-expand";

const SUGGESTED_BY_INTENT: Record<string, string[]> = {
  default: [
    "Tóm tắt nội dung chính của tài liệu",
    "Liệt kê các khái niệm quan trọng",
    "Ứng dụng thực tiễn trong logistics?",
    "So sánh các phương pháp được đề cập",
    "Rủi ro và lưu ý cần biết?",
  ],
};

export function getSuggestedQuestions(): string[] {
  return SUGGESTED_BY_INTENT.default;
}

function buildExtractiveAnswer(
  query: string,
  sources: NotebookSource[]
): { content: string; citations: ReturnType<typeof toCitations> } {
  const results = retrieveForStudy(query, sources);
  if (!results.length) {
    return {
      content:
        "Không tìm thấy nội dung. Kiểm tra tài liệu đã upload (có chunks > 0) và nguồn đang bật.",
      citations: [],
    };
  }

  const citations = toCitations(results);
  const intent = detectQueryIntent(query);

  if (intent === "summary" || intent === "concepts") {
    const bullets = results.map((r, i) => {
      const excerpt = r.chunk.text.slice(0, 350);
      return `**${i + 1}.** [${r.source.name}] ${excerpt}${r.chunk.text.length > 350 ? "…" : ""}`;
    });
    const title = intent === "summary" ? "Tóm tắt" : "Khái niệm chính";
    return {
      content: `**${title}** (${results.length} đoạn từ tài liệu):\n\n${bullets.join("\n\n")}`,
      citations,
    };
  }

  const primary = results[0];
  let answer = `**${primary.source.name}** [1]\n\n${primary.chunk.text}`;

  results.slice(1, 4).forEach((s, i) => {
    answer += `\n\n---\n**[${i + 2}] ${s.source.name}:**\n${s.chunk.text.slice(0, 300)}${s.chunk.text.length > 300 ? "…" : ""}`;
  });

  return { content: answer, citations };
}

export async function sendMessage(
  query: string,
  sources: NotebookSource[],
  history: ChatMessage[]
): Promise<ChatMessage> {
  const settings = getSettings();
  const results = retrieveForStudy(query, sources);
  const citations = toCitations(results);
  const context = buildContextFromChunks(results);

  let content: string;

  if (isAiReady(settings.geminiApiKey, settings.useAi)) {
    try {
      if (!context.trim()) {
        throw new Error("Chưa có ngữ cảnh — upload tài liệu trước");
      }
      content = await askGemini(
        settings.geminiApiKey,
        query,
        context,
        history
      );
    } catch (err) {
      const aiErr = err instanceof Error ? err.message : "Lỗi AI";
      const fallback = buildExtractiveAnswer(query, sources);
      content = `${fallback.content}\n\n---\n⚠️ *Gemini tạm lỗi: ${aiErr} — hiển thị bản trích xuất.*`;
    }
  } else {
    content = buildExtractiveAnswer(query, sources).content;
    if (!isAiReady(settings.geminiApiKey, settings.useAi)) {
      content +=
        "\n\n💡 *Bật Gemini: Cài đặt AI → dán API key → Test kết nối → Lưu*";
    }
  }

  return {
    id: createId("msg"),
    role: "assistant",
    content,
    citations,
    createdAt: Date.now(),
  };
}