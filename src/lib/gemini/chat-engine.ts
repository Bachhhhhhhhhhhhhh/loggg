import type { Content, Part } from "@google/generative-ai";
import { generateGeminiRaw } from "@/lib/notebook/ai";
import { getEffectiveGeminiKey, normalizeKey } from "./config";
import type { ChatImageAttachment, GeminiChatMessage } from "./chat-types";

const GEMINI_CHAT_SYSTEM = `Bạn là LogIQ Gemini — trợ lý AI thông minh, thân thiện, chuyên sâu về Logistics, Supply Chain, kinh doanh và phân tích dữ liệu.

KHẢ NĂNG:
- Trả lời mọi câu hỏi bằng tiếng Việt tự nhiên, rõ ràng, có cấu trúc
- Phân tích hình ảnh: biểu đồ, bảng KPI, invoice, nhãn hàng, sơ đồ kho, screenshot
- Viết code Python, Excel logic, công thức SCM khi được yêu cầu
- Giải thích chuyên môn từ cơ bản đến nâng cao

PHONG CÁCH (giống Gemini):
- Thẳng thắn, hữu ích, không lan man
- Dùng markdown: **bold**, bullet, heading khi cần
- Với ảnh: mô tả những gì thấy → phân tích → khuyến nghị

KHÔNG bịa số liệu trong ảnh nếu không đọc được — nói rõ độ tin cậy.`;

function buildParts(text: string, images?: ChatImageAttachment[]): Part[] {
  const parts: Part[] = [];
  if (text.trim()) parts.push({ text });
  for (const img of images ?? []) {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data,
      },
    });
  }
  return parts;
}

function toGeminiHistory(messages: GeminiChatMessage[]): Content[] {
  return messages
    .filter((m) => m.content.trim() || (m.images && m.images.length > 0))
    .slice(-16)
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: buildParts(m.content, m.images),
    }));
}

export interface AskGeminiChatOptions {
  history?: GeminiChatMessage[];
  images?: ChatImageAttachment[];
  onStream?: (partial: string) => void;
}

export async function askGeminiChat(
  userText: string,
  options?: AskGeminiChatOptions
): Promise<{ text: string; model: string }> {
  const apiKey = getEffectiveGeminiKey();
  if (normalizeKey(apiKey).length < 20) {
    throw new Error("Chưa có Gemini API key — mở ⚙️ Cài đặt AI → nhập key → Test → Lưu");
  }

  const history = options?.history ?? [];
  const images = options?.images ?? [];

  if (!userText.trim() && images.length === 0) {
    throw new Error("Nhập câu hỏi hoặc đính kèm ảnh");
  }

  const historyText = history
    .slice(-8)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const imageNote =
    images.length > 0
      ? `\n\n[User đính kèm ${images.length} ảnh — phân tích chi tiết nội dung ảnh]`
      : "";

  const prompt = historyText
    ? `═══ LỊCH SỬ HỘI THOẠI ═══\n${historyText}\n\n═══ CÂU HỎI MỚI ═══\n${userText}${imageNote}`
    : `${userText}${imageNote}`;

  if (images.length > 0) {
    return askGeminiMultimodal(apiKey, prompt, images, options?.onStream);
  }

  return generateGeminiRaw(apiKey, prompt, {
    systemInstruction: GEMINI_CHAT_SYSTEM,
    temperature: 0.65,
    maxOutputTokens: 8192,
    onStream: options?.onStream,
  });
}

async function askGeminiMultimodal(
  apiKey: string,
  text: string,
  images: ChatImageAttachment[],
  onStream?: (partial: string) => void
): Promise<{ text: string; model: string }> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(normalizeKey(apiKey));

  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
  ];

  const parts = buildParts(text, images);
  let lastErr = "Không kết nối Gemini";

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: GEMINI_CHAT_SYSTEM,
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 8192,
        },
      });

      let resultText = "";

      if (onStream) {
        const stream = await model.generateContentStream(parts);
        for await (const chunk of stream.stream) {
          try {
            const piece = chunk.text();
            if (piece) {
              resultText += piece;
              onStream(resultText);
            }
          } catch {
            /* empty chunk */
          }
        }
      } else {
        const result = await model.generateContent(parts);
        resultText = result.response.text() ?? "";
      }

      if (!resultText.trim()) throw new Error("Gemini trả về rỗng");
      return { text: resultText.trim(), model: modelName };
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(lastErr);
}

export async function fileToImageAttachment(file: File): Promise<ChatImageAttachment> {
  const { CHAT_IMAGE_TYPES, MAX_IMAGE_BYTES } = await import("./chat-types");

  if (!CHAT_IMAGE_TYPES.includes(file.type as (typeof CHAT_IMAGE_TYPES)[number])) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WebP, GIF");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Ảnh tối đa ${MAX_IMAGE_BYTES / 1024 / 1024}MB`);
  }

  const dataUrl = await readFileAsDataUrl(file);
  const base64 = dataUrl.split(",")[1] ?? "";

  return {
    id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: file.name,
    mimeType: file.type,
    data: base64,
    previewUrl: dataUrl,
    size: file.size,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Không đọc được file"));
    reader.readAsDataURL(file);
  });
}