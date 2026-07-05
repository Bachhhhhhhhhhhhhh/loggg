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
import { polishAiResponse } from "./response-polish";

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
  sources: NotebookSource[],
  notebookId?: string
): { content: string; citations: ReturnType<typeof toCitations> } {
  const results = retrieveForStudy(query, sources, notebookId);
  if (!results.length) {
    return {
      content:
        "Không tìm thấy nội dung. Kiểm tra tài liệu đã upload (có chunks > 0) và nguồn đang bật.",
      citations: [],
    };
  }

  const citations = toCitations(results);
  const intent = detectQueryIntent(query);

  if (intent === "summary") {
    const intro =
      "Dưới đây là các ý chính được trích từ tài liệu — bật Gemini AI để có bản diễn giải mượt mà hơn.";
    const bullets = results.slice(0, 6).map((r, i) => {
      const excerpt = r.chunk.text.slice(0, 280).replace(/\s+/g, " ").trim();
      return `- **Ý ${i + 1}** [${i + 1}]: ${excerpt}${r.chunk.text.length > 280 ? "…" : ""}`;
    });
    return {
      content: polishAiResponse(`**Tóm tắt nội dung**\n\n${intro}\n\n${bullets.join("\n")}`),
      citations,
    };
  }

  if (intent === "concepts") {
    const items = results.slice(0, 5).map((r, i) => {
      const excerpt = r.chunk.text.slice(0, 240).replace(/\s+/g, " ").trim();
      return `**Khái niệm ${i + 1}** [${i + 1}]\n${excerpt}${r.chunk.text.length > 240 ? "…" : ""}`;
    });
    return {
      content: polishAiResponse(
        `**Các khái niệm nổi bật trong tài liệu**\n\n${items.join("\n\n")}`
      ),
      citations,
    };
  }

  const primary = results[0];
  const lead = primary.chunk.text.slice(0, 400).replace(/\s+/g, " ").trim();
  let answer = `${lead}${primary.chunk.text.length > 400 ? "…" : ""} [1]`;

  results.slice(1, 3).forEach((s, i) => {
    const excerpt = s.chunk.text.slice(0, 220).replace(/\s+/g, " ").trim();
    answer += `\n\nNgoài ra, tài liệu còn đề cập [${i + 2}]: ${excerpt}${s.chunk.text.length > 220 ? "…" : ""}`;
  });

  return { content: polishAiResponse(answer), citations };
}

export async function sendMessage(
  query: string,
  sources: NotebookSource[],
  history: ChatMessage[],
  notebookId?: string
): Promise<ChatMessage> {
  const settings = getSettings();
  const results = retrieveForStudy(query, sources, notebookId);
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
        history,
        results.length
      );
    } catch (err) {
      const aiErr = err instanceof Error ? err.message : "Lỗi AI";
      const fallback = buildExtractiveAnswer(query, sources, notebookId);
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