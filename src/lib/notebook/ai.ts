import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage } from "./types";

const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
] as const;

function normalizeKey(apiKey: string): string {
  return apiKey.trim();
}

function getClient(apiKey: string): GoogleGenerativeAI {
  const key = normalizeKey(apiKey);
  if (!key) throw new Error("Chưa nhập Gemini API key");
  return new GoogleGenerativeAI(key);
}

async function generateText(apiKey: string, prompt: string): Promise<string> {
  const genAI = getClient(apiKey);
  let lastError: Error | null = null;

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
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw new Error(
    lastError?.message?.includes("API_KEY")
      ? "API key không hợp lệ — kiểm tra lại key tại aistudio.google.com"
      : lastError?.message ?? "Không kết nối được Gemini API"
  );
}

export async function testGeminiApi(apiKey: string): Promise<string> {
  const text = await generateText(
    apiKey,
    'Trả lời đúng 1 câu tiếng Việt: "LogIQ Notebook AI đã kết nối thành công."'
  );
  return text;
}

export async function askGemini(
  apiKey: string,
  question: string,
  context: string,
  history: ChatMessage[]
): Promise<string> {
  const historyText = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Người dùng" : "Trợ lý"}: ${m.content}`)
    .join("\n");

  const prompt = `Bạn là trợ lý học tập Logistics & Supply Chain của LogIQ (giống NotebookLM).

QUY TẮC:
- Trả lời bằng tiếng Việt, rõ ràng, có cấu trúc (bullet hoặc đoạn ngắn).
- CHỈ dùng thông tin từ NGỮ CẢNH TÀI LIỆU bên dưới.
- Trích dẫn nguồn bằng [1], [2]... khớp với số thứ tự trong ngữ cảnh.
- Nếu tài liệu không đủ thông tin, nói rõ "Tài liệu chưa đề cập đến…".
- Không bịa đặt số liệu hoặc khái niệm không có trong tài liệu.

NGỮ CẢNH TÀI LIỆU:
${context}

LỊCH SỬ HỘI THOẠI:
${historyText || "(chưa có)"}

CÂU HỎI: ${question}`;

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
  const excerpt = fullText.slice(0, 24000);
  const prompt = `Phân tích tài liệu logistics/supply chain từ ${sourceNames.length} file: ${sourceNames.join(", ")}.

Trả về ĐÚNG JSON (không markdown, không giải thích thêm):
{
  "summary": "tóm tắt 4-6 câu tiếng Việt",
  "outline": ["mục dàn ý 1", "mục 2", ...],
  "keyTopics": [{"topic": "chủ đề", "detail": "mô tả ngắn"}],
  "flashcards": [{"front": "câu hỏi/thuật ngữ", "back": "định nghĩa/giải thích"}]
}

TÀI LIỆU:
${excerpt}`;

  const raw = await generateText(apiKey, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI không trả về JSON hợp lệ");

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
      ? parsed.flashcards.map((f: { front?: string; back?: string }) => ({
          front: String(f.front ?? ""),
          back: String(f.back ?? ""),
        }))
      : [],
  };
}

export function isAiReady(apiKey: string, useAi: boolean): boolean {
  return useAi && normalizeKey(apiKey).length > 10;
}