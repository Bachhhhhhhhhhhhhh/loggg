import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage } from "./types";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
] as const;

function normalizeKey(apiKey: string): string {
  return apiKey.trim().replace(/\s+/g, "");
}

function formatGeminiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/API_KEY_INVALID|API key not valid|invalid api key/i.test(raw)) {
    return "API key không hợp lệ — tạo key mới tại aistudio.google.com/apikey";
  }
  if (/403|PERMISSION_DENIED/i.test(raw)) {
    return "API key bị từ chối — bật Generative Language API cho key này";
  }
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(raw)) {
    return "Vượt giới hạn Gemini — đợi 1 phút rồi thử lại";
  }
  if (/404|not found|NOT_FOUND/i.test(raw)) {
    return "Model AI tạm không khả dụng — hệ thống sẽ thử model khác";
  }
  if (/Failed to fetch|NetworkError|network/i.test(raw)) {
    return "Lỗi mạng — kiểm tra internet hoặc firewall";
  }
  return raw.length > 200 ? raw.slice(0, 200) + "…" : raw;
}

function getClient(apiKey: string): GoogleGenerativeAI {
  const key = normalizeKey(apiKey);
  if (key.length < 20) throw new Error("API key chưa hợp lệ (quá ngắn)");
  return new GoogleGenerativeAI(key);
}

async function generateText(apiKey: string, prompt: string): Promise<string> {
  const genAI = getClient(apiKey);
  const errors: string[] = [];

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 2048,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text?.trim()) throw new Error("AI trả về rỗng");
      return text.trim();
    } catch (err) {
      errors.push(`${modelName}: ${formatGeminiError(err)}`);
    }
  }

  throw new Error(errors[errors.length - 1] ?? "Không kết nối được Gemini");
}

export async function testGeminiApi(apiKey: string): Promise<string> {
  return generateText(
    apiKey,
    'Reply exactly: LogIQ Notebook AI connected successfully.'
  );
}

export async function askGemini(
  apiKey: string,
  question: string,
  context: string,
  history: ChatMessage[]
): Promise<string> {
  const historyText = history
    .slice(-4)
    .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content.slice(0, 500)}`)
    .join("\n");

  const prompt = `Bạn là trợ lý học Logistics & SCM của LogIQ (kiểu NotebookLM).
Trả lời TIẾNG VIỆT, ngắn gọn, có bullet nếu cần.
CHỈ dùng NGỮ CẢNH bên dưới. Trích dẫn [1], [2]...
Nếu không có trong tài liệu: "Tài liệu chưa đề cập."

NGỮ CẢNH:
${context.slice(0, 28000)}

HỘI THOẠI:
${historyText || "(mới)"}

HỎI: ${question}`;

  return generateText(apiKey, prompt);
}

export async function generateAiInsights(
  apiKey: string,
  fullText: string,
  sourceNames: string[]
): Promise<{
  summary: string;
  outline: string[];
  keyTopics: { topic: string; detail: string }[];
  flashcards: { front: string; back: string }[];
}> {
  const excerpt = fullText.slice(0, 20000);
  const prompt = `Phân tích tài liệu logistics từ: ${sourceNames.join(", ")}.
Trả JSON thuần (không markdown):
{"summary":"4-6 câu tiếng Việt","outline":["mục1","mục2"],"keyTopics":[{"topic":"x","detail":"y"}],"flashcards":[{"front":"q","back":"a"}]}

NỘI DUNG:
${excerpt}`;

  const raw = await generateText(apiKey, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI không trả JSON — thử lại");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    summary: String(parsed.summary ?? ""),
    outline: Array.isArray(parsed.outline) ? parsed.outline.map(String) : [],
    keyTopics: Array.isArray(parsed.keyTopics)
      ? parsed.keyTopics.map((t: { topic?: string; detail?: string }) => ({
          topic: String(t.topic ?? ""),
          detail: String(t.detail ?? ""),
        }))
      : [],
    flashcards: Array.isArray(parsed.flashcards)
      ? parsed.flashcards.slice(0, 12).map((f: { front?: string; back?: string }) => ({
          front: String(f.front ?? ""),
          back: String(f.back ?? ""),
        }))
      : [],
  };
}

export function isAiReady(apiKey: string, useAi?: boolean): boolean {
  const key = normalizeKey(apiKey);
  if (key.length < 20) return false;
  return useAi !== false;
}