import {
  GoogleGenerativeAI,
  type Content,
  type GenerativeModel,
} from "@google/generative-ai";
import type { ChatMessage } from "./types";
import { getPreferredModel, setPreferredModel } from "./model-cache";
import {
  CHAT_SYSTEM_INSTRUCTION,
  INSIGHTS_SYSTEM_ADDENDUM,
  buildChatUserMessage,
} from "./prompts";
import { polishAiResponse, polishSummary } from "./response-polish";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-05-20",
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
  const instruction = jsonMode
    ? `${CHAT_SYSTEM_INSTRUCTION}\n\n${INSIGHTS_SYSTEM_ADDENDUM}`
    : CHAT_SYSTEM_INSTRUCTION;

  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: instruction,
    generationConfig: {
      temperature: jsonMode ? 0.35 : 0.62,
      topP: 0.92,
      topK: 40,
      maxOutputTokens: jsonMode ? 16384 : 8192,
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
  history: ChatMessage[],
  sourceCount = 8,
  docOverview?: string,
  onStream?: (partial: string) => void
): Promise<string> {
  const userMessage = buildChatUserMessage(question, context, sourceCount, docOverview);

  return tryModels(apiKey, async (model) => {
    const chatHistory = buildChatHistory(history.slice(0, -1));
    const chat = model.startChat({ history: chatHistory });

    if (onStream) {
      const result = await chat.sendMessageStream(userMessage);
      let full = "";
      for await (const chunk of result.stream) {
        const piece = chunk.text();
        full += piece;
        onStream(polishAiResponse(full));
      }
      if (!full.trim()) throw new Error("AI trả về rỗng");
      return polishAiResponse(full);
    }

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();
    if (!text?.trim()) throw new Error("AI trả về rỗng");
    return polishAiResponse(text);
  });
}

export interface AiInsightsResult {
  summary: string;
  outline: string[];
  studyGuide: string[];
  suggestedQuestions: string[];
  keyTopics: { topic: string; detail: string }[];
  flashcards: { front: string; back: string }[];
  quiz: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  glossary: { term: string; definition: string }[];
}

function normalizeInsights(parsed: Record<string, unknown>): AiInsightsResult {
  return {
    summary: polishSummary(String(parsed.summary ?? "")),
    outline: Array.isArray(parsed.outline) ? parsed.outline.map(String) : [],
    studyGuide: Array.isArray(parsed.studyGuide) ? parsed.studyGuide.map(String) : [],
    suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
      ? parsed.suggestedQuestions.map(String)
      : [],
    keyTopics: Array.isArray(parsed.keyTopics)
      ? parsed.keyTopics.map((t) => {
          const item = t as { topic?: string; detail?: string };
          return {
            topic: String(item.topic ?? ""),
            detail: polishAiResponse(String(item.detail ?? "")),
          };
        })
      : [],
    flashcards: Array.isArray(parsed.flashcards)
      ? parsed.flashcards.map((f) => {
          const item = f as { front?: string; back?: string };
          return {
            front: String(item.front ?? ""),
            back: polishAiResponse(String(item.back ?? "")),
          };
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
            explanation: polishAiResponse(String(item.explanation ?? "")),
          };
        })
      : [],
    glossary: Array.isArray(parsed.glossary)
      ? parsed.glossary.map((g) => {
          const item = g as { term?: string; definition?: string };
          return {
            term: String(item.term ?? ""),
            definition: polishAiResponse(String(item.definition ?? "")),
          };
        })
      : [],
  };
}

export async function generateAiInsights(
  apiKey: string,
  context: string,
  sourceNames: string[]
): Promise<AiInsightsResult> {
  const prompt = `Phân tích chuyên sâu Logistics/SCM — ${sourceNames.length} file: ${sourceNames.join(", ")}.

JSON:
{
  "summary": "8-12 câu văn xuôi toàn cảnh",
  "outline": ["dàn ý câu hoàn chỉnh"],
  "studyGuide": ["bước 1 học...", "bước 2..."],
  "suggestedQuestions": ["câu hỏi ôn tập 1", "..."],
  "keyTopics": [{"topic": "chủ đề", "detail": "2-3 câu"}],
  "flashcards": [{"front": "?", "back": "đáp án 1-3 câu"}],
  "quiz": [{"question": "?", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "2-4 câu"}],
  "glossary": [{"term": "X", "definition": "định nghĩa đầy đủ"}]
}

Tối thiểu: 8 keyTopics, 15 flashcards, 8 quiz, 12 glossary, 6 studyGuide, 8 suggestedQuestions.
CHỈ dùng nội dung bên dưới.

NỘI DUNG:
${context.slice(0, 85000)}`;

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