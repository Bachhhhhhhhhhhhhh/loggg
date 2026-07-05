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
        "Không tìm thấy nội dung phù hợp. Kiểm tra: (1) tài liệu có chunks > 0, (2) nguồn đang bật, (3) thử 'Dán văn bản' nếu PDF lỗi.",
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
      content: `Tóm tắt từ ${results.length} đoạn:\n\n${bullets.join("\n\n")}`,
      citations,
    };
  }

  const primary = results[0];
  let answer = `Theo **${primary.source.name}**:\n\n${primary.chunk.text}`;
  results.slice(1, 3).forEach((s, i) => {
    answer += `\n\n**Bổ sung [${i + 2}]:** ${s.chunk.text.slice(0, 200)}…`;
  });

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

  if (isAiReady(settings.geminiApiKey, settings.useAi)) {
    try {
      if (!context.trim()) {
        throw new Error("Không có ngữ cảnh — upload/dán tài liệu trước");
      }
      content = await askGemini(settings.geminiApiKey, query, context, history);
    } catch (err) {
      const aiErr = err instanceof Error ? err.message : "Lỗi AI";
      const fallback = buildExtractiveAnswer(query, sources);
      content = `${fallback.content}\n\n---\n⚠️ **Gemini:** ${aiErr}`;
    }
  } else {
    content = buildExtractiveAnswer(query, sources).content;
    if (settings.geminiApiKey.length < 20) {
      content += "\n\n💡 *Cài đặt AI → dán Gemini API key → Test kết nối → Lưu*";
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