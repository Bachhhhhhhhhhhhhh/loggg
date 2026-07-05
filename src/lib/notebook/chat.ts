import type { ChatMessage, NotebookSource } from "./types";
import { createId } from "./id";
import {
  retrieveForStudy,
  toCitations,
  buildContextFromChunks,
} from "./retrieval";
import { askGemini, isAiReady } from "./ai";
import { getEffectiveGeminiKey } from "@/lib/gemini/config";
import { getSettings } from "./storage";
import { detectQueryIntent } from "./query-expand";
import { polishAiResponse } from "./response-polish";
import { getDynamicSuggestions } from "./source-profile";
import { getNotebookProfiles } from "./retrieval-index";

export function getSuggestedQuestions(
  sources: NotebookSource[],
  notebookId?: string
): string[] {
  if (sources.some((s) => s.enabled && s.chunks.length > 0)) {
    return getDynamicSuggestions(sources, 8);
  }
  return [
    "Tóm tắt nội dung chính của tài liệu",
    "Liệt kê các khái niệm quan trọng",
    "Ứng dụng thực tiễn trong logistics?",
  ];
}

function buildDocOverview(sources: NotebookSource[], notebookId?: string): string {
  if (!notebookId) return "";
  const profiles = getNotebookProfiles(notebookId, sources);
  return profiles
    .map(
      (p) =>
        `• ${p.sourceName} (${p.chunkCount} chunks): ${p.topTerms.slice(0, 5).join(", ")}`
    )
    .join("\n");
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
    const bullets = results.slice(0, 8).map((r, i) => {
      const excerpt = r.chunk.text.slice(0, 300).replace(/\s+/g, " ").trim();
      return `- **Ý ${i + 1}** [${i + 1}]: ${excerpt}${r.chunk.text.length > 300 ? "…" : ""}`;
    });
    return {
      content: polishAiResponse(
        `**Tóm tắt nội dung**\n\n${bullets.join("\n")}\n\n💡 *Bật Gemini AI để có bản diễn giải chuyên sâu hơn.*`
      ),
      citations,
    };
  }

  if (intent === "concepts") {
    const items = results.slice(0, 6).map((r, i) => {
      const excerpt = r.chunk.text.slice(0, 260).replace(/\s+/g, " ").trim();
      const h = r.chunk.heading ? ` (${r.chunk.heading})` : "";
      return `**Khái niệm ${i + 1}**${h} [${i + 1}]\n${excerpt}…`;
    });
    return {
      content: polishAiResponse(`**Khái niệm nổi bật**\n\n${items.join("\n\n")}`),
      citations,
    };
  }

  const primary = results[0];
  const lead = primary.chunk.text.slice(0, 450).replace(/\s+/g, " ").trim();
  let answer = `${lead}… [1]`;
  results.slice(1, 4).forEach((s, i) => {
    const excerpt = s.chunk.text.slice(0, 240).replace(/\s+/g, " ").trim();
    answer += `\n\nBổ sung [${i + 2}]: ${excerpt}…`;
  });

  return { content: polishAiResponse(answer), citations };
}

export interface SendMessageOptions {
  onStream?: (partial: string) => void;
}

export async function sendMessage(
  query: string,
  sources: NotebookSource[],
  history: ChatMessage[],
  notebookId?: string,
  options?: SendMessageOptions
): Promise<ChatMessage> {
  const settings = getSettings();
  const results = retrieveForStudy(query, sources, notebookId);
  const citations = toCitations(results);
  const context = buildContextFromChunks(results);
  const overview = notebookId ? buildDocOverview(sources, notebookId) : "";

  let content: string;

  if (isAiReady(settings.geminiApiKey, settings.useAi)) {
    try {
      if (!context.trim()) {
        throw new Error("Chưa có ngữ cảnh — upload tài liệu trước");
      }
      content = await askGemini(
        getEffectiveGeminiKey() || settings.geminiApiKey,
        query,
        context,
        history,
        results.length,
        overview,
        options?.onStream
      );
    } catch (err) {
      const aiErr = err instanceof Error ? err.message : "Lỗi AI";
      const fallback = buildExtractiveAnswer(query, sources, notebookId);
      content = `${fallback.content}\n\n---\n⚠️ *Gemini: ${aiErr} — bản trích xuất hybrid.*`;
    }
  } else {
    content = buildExtractiveAnswer(query, sources, notebookId).content;
    if (!isAiReady(settings.geminiApiKey, settings.useAi)) {
      content +=
        "\n\n💡 *Bật Gemini Ultra: Cài đặt AI → API key → Test → Lưu*";
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