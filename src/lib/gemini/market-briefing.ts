import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPreferredModel, setPreferredModel } from "@/lib/notebook/model-cache";
import { formatMarketContext } from "@/lib/market/aggregator";
import type { MarketSnapshot } from "@/lib/market/types";
import { normalizeKey } from "./config";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
] as const;

const BRIEFING_PROMPT = `Bạn là chuyên gia Logistics & Supply Chain Việt Nam.
Phân tích dữ liệu thị trường LIVE bên dưới và viết briefing ngắn gọn (tiếng Việt):

1. **Tóm tắt 2-3 câu** — tình hình FX, nhiên liệu, tác động logistics VN
2. **Tác động SCM** — 3 bullet: chi phí vận tải, nhập khẩu, tồn kho
3. **Khuyến nghị** — 2 hành động cụ thể cho planner/buyer VN

Giữ dưới 220 từ. Không bịa số liệu ngoài dữ liệu cung cấp.`;

export async function generateMarketBriefing(
  apiKey: string,
  snapshot: MarketSnapshot
): Promise<{ text: string; model: string }> {
  const key = normalizeKey(apiKey);
  if (key.length < 20) throw new Error("Chưa cấu hình Gemini API key");

  const genAI = new GoogleGenerativeAI(key);
  const preferred = getPreferredModel();
  const ordered =
    preferred && MODELS.includes(preferred as (typeof MODELS)[number])
      ? [preferred, ...MODELS.filter((m) => m !== preferred)]
      : [...MODELS];

  const prompt = `${BRIEFING_PROMPT}\n\nDỮ LIỆU:\n${formatMarketContext(snapshot)}`;
  let lastErr = "Không kết nối Gemini";

  for (const modelName of ordered) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.45, maxOutputTokens: 1024 },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim();
      if (!text) throw new Error("Phản hồi rỗng");
      setPreferredModel(modelName);
      return { text, model: modelName };
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(lastErr);
}