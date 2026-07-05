import {
  GoogleGenerativeAI,
  type Content,
  type GenerativeModel,
} from "@google/generative-ai";
import type { ChatMessage } from "./types";
import { detectQueryIntent } from "./query-expand";
import { getPreferredModel, setPreferredModel } from "./model-cache";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
] as const;

const SYSTEM_INSTRUCTION = `Bạn là LogIQ Study AI — trợ lý học Logistics & Supply Chain chuyên nghiệp (phong cách NotebookLM).

NGUYÊN TẮC BẮT BUỘC:
1. Trả lời bằng TIẾNG VIỆT rõ ràng, có cấu trúc (tiêu đề ngắn, bullet, bảng nếu cần).
2. CHỈ dựa trên NGỮ CẢNH TÀI LIỆU được cung cấp trong từng lượt hỏi.
3. Trích dẫn nguồn bằng [1], [2]... khớp số thứ tự trong ngữ cảnh.
4. Không bịa số liệu, tên riêng, hoặc khái niệm không có trong tài liệu.
5. Nếu thiếu thông tin: nói rõ "Tài liệu chưa đề cập đến…" và gợi ý câu hỏi khác.
6. Giải thích như giáo viên: dễ hiểu, có ví dụ thực tế logistics khi tài liệu cho phép.
7. Với câu tóm tắt: 4-6 bullet ý chính. Với khái niệm: định nghĩa + ứng dụng. Với so sánh: bảng hoặc bullet đối chiếu.`;

function normalizeKey(apiKey: string): string {
  return apiKey.trim().replace(/\s+/g, "");
}

function formatGeminiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/API_KEY_INVALID|API key not valid|invalid api key/i.test(raw)) {
    return "API key không hợp lệ — tạo key mới tại aistudio.google.com/apikey";
  }
  if (/403|PERMISSION_DENIED/i.test(raw)) {
    return "API key bị từ chối — kiểm tra quyền Generative Language API";
  }
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(raw)) {
    return "Vượt giới hạn Gemini — đợi 1 phút rồi thử lại";
  }
  if (/404|not found|NOT_FOUND/i.test(raw)) {
    return "Model tạm không khả dụng";
  }
  if (/Failed to fetch|NetworkError|network/i.test(raw)) {
    return "Lỗi mạng — kiểm tra internet";
  }
  return raw.length > 180 ? raw.slice(0, 180) + "…" : raw;
}

function isRetryable(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  return /429|RESOURCE_EXHAUSTED|quota|503|UNAVAILABLE|timeout/i.test(raw);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getClient(apiKey: string): GoogleGenerativeAI {
  const key = normalizeKey(apiKey);
  if (key.length < 20) throw new Error("API key chưa hợp lệ");
  return new GoogleGenerativeAI(key);
}

function orderedModels(): string[] {
  const preferred = getPreferredModel();
  if (preferred && MODELS.includes(preferred as (typeof MODELS)[number])) {
    return [preferred, ...MODELS.filter((m) => m !== preferred)];
  }
  return [...MODELS];
}

function createModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  jsonMode = false
): GenerativeModel {
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: jsonMode ? 0.25 : 0.4,
      topP: 0.9,
      maxOutputTokens: jsonMode ? 8192 : 4096,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries && isRetryable(err)) {
        await sleep(1200 * (i + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function tryModels<T>(
  apiKey: string,
  fn: (model: GenerativeModel, modelName: string) => Promise<T>
): Promise<T> {
  const genAI = getClient(apiKey);
  const errors: string[] = [];

  for (const modelName of orderedModels()) {
    try {
      const model = createModel(genAI, modelName);
      const result = await withRetry(() => fn(model, modelName));
      setPreferredModel(modelName);
      return result;
    } catch (err) {
      errors.push(`${modelName}: ${formatGeminiError(err)}`);
    }
  }

  throw new Error(errors[errors.length - 1] ?? "Không kết nối được Gemini");
}

function buildChatHistory(history: ChatMessage[]): Content[] {
  return history
    .slice(-10)
    .filter((m) => m.content.trim())
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content.slice(0, 1400) }],
    }));
}

function intentHint(query: string): string {
  const intent = detectQueryIntent(query);
  const hints: Record<string, string> = {
    summary: "Yêu cầu: TÓM TẮT — liệt kê 4-8 ý chính, mỗi ý 1-2 câu, kèm trích dẫn.",
    concepts: "Yêu cầu: KHÁI NIỆM — liệt kê thuật ngữ quan trọng, mỗi mục có định nghĩa ngắn.",
    compare: "Yêu cầu: SO SÁNH — nêu điểm giống/khác, dùng bullet hoặc bảng.",
    apply: "Yêu cầu: ỨNG DỤNG — nêu cách áp dụng thực tế trong logistics/SCM.",
    qa: "Yêu cầu: TRẢ LỜI trực tiếp, đầy đủ, có ví dụ nếu tài liệu có.",
  };
  return hints[intent];
}

export function parseAiJson<T>(raw: string): T {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("AI không trả về JSON hợp lệ");
  }
  const jsonStr = candidate.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(jsonStr) as T;
}

export async function testGeminiApi(apiKey: string): Promise<string> {
  return tryModels(apiKey, async (model) => {
    const r = await model.generateContent(
      'Trả lời đúng 1 câu tiếng Việt: "LogIQ AI đã kết nối thành công."'
    );
    return r.response.text().trim();
  });
}

export async function askGemini(
  apiKey: string,
  question: string,
  context: string,
  history: ChatMessage[]
): Promise<string> {
  const userMessage = `${intentHint(question)}

═══ NGỮ CẢNH TÀI LIỆU ═══
${context}

═══ CÂU HỎI ═══
${question}`;

  return tryModels(apiKey, async (model) => {
    const chatHistory = buildChatHistory(history.slice(0, -1));
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();
    if (!text?.trim()) throw new Error("AI trả về rỗng");
    return text.trim();
  });
}

export interface AiInsightsResult {
  summary: string;
  outline: string[];
  keyTopics: { topic: string; detail: string }[];
  flashcards: { front: string; back: string }[];
  quiz: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  glossary: { term: string; definition: string }[];
}

function normalizeInsights(parsed: Record<string, unknown>): AiInsightsResult {
  return {
    summary: String(parsed.summary ?? ""),
    outline: Array.isArray(parsed.outline) ? parsed.outline.map(String) : [],
    keyTopics: Array.isArray(parsed.keyTopics)
      ? parsed.keyTopics.map((t) => {
          const item = t as { topic?: string; detail?: string };
          return { topic: String(item.topic ?? ""), detail: String(item.detail ?? "") };
        })
      : [],
    flashcards: Array.isArray(parsed.flashcards)
      ? parsed.flashcards.map((f) => {
          const item = f as { front?: string; back?: string };
          return { front: String(item.front ?? ""), back: String(item.back ?? "") };
        })
      : [],
    quiz: Array.isArray(parsed.quiz)
      ? parsed.quiz.map((q) => {
          const item = q as {
            question?: string;
            options?: string[];
            correctIndex?: number;
            explanation?: string;
          };
          return {
            question: String(item.question ?? ""),
            options: Array.isArray(item.options) ? item.options.map(String) : [],
            correctIndex: Number(item.correctIndex ?? 0),
            explanation: String(item.explanation ?? ""),
          };
        })
      : [],
    glossary: Array.isArray(parsed.glossary)
      ? parsed.glossary.map((g) => {
          const item = g as { term?: string; definition?: string };
          return { term: String(item.term ?? ""), definition: String(item.definition ?? "") };
        })
      : [],
  };
}

export async function generateAiInsights(
  apiKey: string,
  context: string,
  sourceNames: string[]
): Promise<AiInsightsResult> {
  const prompt = `Phân tích tài liệu Logistics/SCM từ ${sourceNames.length} file: ${sourceNames.join(", ")}.

Trả về JSON với cấu trúc:
{
  "summary": "tóm tắt 5-8 câu tiếng Việt, súc tích",
  "outline": ["mục dàn ý 1", "..."],
  "keyTopics": [{"topic": "chủ đề", "detail": "mô tả 1-2 câu"}],
  "flashcards": [{"front": "câu hỏi/thuật ngữ", "back": "đáp án/định nghĩa"}],
  "quiz": [{"question": "câu hỏi", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "giải thích"}],
  "glossary": [{"term": "ABC", "definition": "định nghĩa"}]
}

Tạo ít nhất: 6 keyTopics, 10 flashcards, 5 quiz (4 đáp án mỗi câu), 8 glossary.
CHỈ dùng nội dung bên dưới. Không thêm markdown ngoài JSON.

NỘI DUNG:
${context.slice(0, 50000)}`;

  const genAI = getClient(apiKey);
  let lastError: Error | null = null;

  for (const modelName of orderedModels()) {
    try {
      const model = createModel(genAI, modelName, true);
      const result = await withRetry(() => model.generateContent(prompt));
      const raw = result.response.text();
      const parsed = parseAiJson<Record<string, unknown>>(raw);
      setPreferredModel(modelName);
      return normalizeInsights(parsed);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      try {
        const model = createModel(genAI, modelName, false);
        const result = await withRetry(() => model.generateContent(prompt));
        const raw = result.response.text();
        const parsed = parseAiJson<Record<string, unknown>>(raw);
        setPreferredModel(modelName);
        return normalizeInsights(parsed);
      } catch {
        /* try next model */
      }
    }
  }

  throw lastError ?? new Error("Không tạo được insights từ AI");
}

export function isAiReady(apiKey: string, useAi?: boolean): boolean {
  return normalizeKey(apiKey).length >= 20 && useAi !== false;
}