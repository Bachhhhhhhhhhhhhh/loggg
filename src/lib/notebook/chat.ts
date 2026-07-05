import type { ChatMessage, NotebookSource } from "./types";
import { createId } from "./id";
import {
  retrieveChunks,
  toCitations,
  buildContextFromChunks,
} from "./retrieval";
import { askGemini, isAiReady } from "./ai";
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
  const results = retrieveChunks(query, sources, 6);
  if (!results.length) {
    return {
      content:
        "Không tìm thấy nội dung trong tài liệu đã upload. Hãy kiểm tra file đã được xử lý thành công (có chunks) và nguồn đang bật.",
      citations: [],
    };
  }

  const citations = toCitations(results);
  const isSummary = /tóm tắt|summary|tổng quan/i.test(query);

  if (isSummary) {
    const bullets = results.map(
      (r, i) =>
        `**${i + 1}.** (${r.source.name}) ${r.chunk.text.slice(0, 300)}${r.chunk.text.length > 300 ? "…" : ""}`
    );
    return {
      content: `Tóm tắt từ ${results.length} đoạn trong tài liệu:\n\n${bullets.join("\n\n")}`,
      citations,
    };
  }

  const primary = results[0];
  const supporting = results.slice(1, 3);
  let answer = `Theo **${primary.source.name}** [1]:\n\n${primary.chunk.text}`;

  if (supporting.length) {
    answer += "\n\n**Bổ sung:**\n";
    supporting.forEach((s, i) => {
      answer += `\n- [${i + 2}] ${s.chunk.text.slice(0, 200)}…`;
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
  const results = retrieveChunks(query, sources, 8);
  const citations = toCitations(results);
  const context = buildContextFromChunks(results);

  let content: string;
  let aiError: string | null = null;

  if (isAiReady(settings.geminiApiKey, settings.useAi)) {
    try {
      if (!context.trim()) {
        throw new Error("Không có ngữ cảnh từ tài liệu để gửi cho AI");
      }
      content = await askGemini(
        settings.geminiApiKey,
        query,
        context,
        history
      );
    } catch (err) {
      aiError = err instanceof Error ? err.message : "Lỗi AI không xác định";
      const fallback = buildExtractiveAnswer(query, sources);
      content = `${fallback.content}\n\n---\n⚠️ **Gemini lỗi:** ${aiError}`;
    }
  } else {
    const extractive = buildExtractiveAnswer(query, sources);
    content = extractive.content;
    if (!settings.geminiApiKey.trim()) {
      content += "\n\n💡 *Mẹo: Vào Cài đặt AI → dán Gemini API key để có câu trả lời thông minh hơn.*";
    } else if (!settings.useAi) {
      content += "\n\n💡 *Bật \"AI nâng cao\" trong Cài đặt AI để dùng Gemini.*";
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