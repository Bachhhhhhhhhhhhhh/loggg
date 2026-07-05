import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";
import { parseAiJson } from "@/lib/notebook/ai";
import { getPreferredModel, setPreferredModel } from "@/lib/notebook/model-cache";
import { buildDetailedMarketContext } from "@/lib/market/briefing-context";
import { generateLocalBriefing } from "@/lib/market/local-briefing";
import type {
  BriefingDepth,
  BriefingGenerateOptions,
  MarketBriefingResult,
} from "@/lib/market/briefing-types";
import type { MarketSnapshot } from "@/lib/market/types";
import { normalizeKey } from "./config";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
] as const;

const DEPTH_CONFIG: Record<
  BriefingDepth,
  { maxTokens: number; instruction: string }
> = {
  quick: {
    maxTokens: 2048,
    instruction: "Briefing ngắn: 1 scenario, 3 action items, 3 risks.",
  },
  standard: {
    maxTokens: 4096,
    instruction: "Briefing chuẩn: 3 scenarios, 4 action items, 4 SCM impacts, 5 watchlist.",
  },
  deep: {
    maxTokens: 8192,
    instruction:
      "Briefing chuyên sâu: 3 scenarios chi tiết, 6 action items, 5 SCM impacts, 8 watchlist, phân tích định lượng.",
  },
};

function formatGeminiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/API_KEY_INVALID|API key not valid|invalid api key/i.test(raw)) {
    return "API key không hợp lệ — tạo key mới tại aistudio.google.com/apikey";
  }
  if (/403|PERMISSION_DENIED/i.test(raw)) {
    return "API key bị từ chối — bật Generative Language API";
  }
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(raw)) {
    return "Vượt quota Gemini — đợi 60 giây rồi thử lại";
  }
  if (/404|not found|NOT_FOUND/i.test(raw)) {
    return "Model Gemini tạm không khả dụng — thử model khác";
  }
  if (/Failed to fetch|NetworkError|network|abort/i.test(raw)) {
    return "Lỗi mạng — kiểm tra kết nối internet";
  }
  if (/JSON|parse/i.test(raw)) {
    return "AI trả về định dạng lỗi — đang dùng bản phân tích cục bộ";
  }
  return raw.length > 200 ? raw.slice(0, 200) + "…" : raw;
}

function isRetryable(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  return /429|RESOURCE_EXHAUSTED|quota|503|UNAVAILABLE|timeout|abort/i.test(raw);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function orderedModels(): string[] {
  const preferred = getPreferredModel();
  if (preferred && MODELS.includes(preferred as (typeof MODELS)[number])) {
    return [preferred, ...MODELS.filter((m) => m !== preferred)];
  }
  return [...MODELS];
}

function buildJsonPrompt(snapshot: MarketSnapshot, depth: BriefingDepth): string {
  const cfg = DEPTH_CONFIG[depth];
  return `Bạn là Giám đốc SCM & Market Intelligence tại doanh nghiệp logistics Việt Nam.
Phân tích DỮ LIỆU THỊ TRƯỜNG bên dưới và trả về ĐÚNG 1 JSON object (không markdown fence).

${cfg.instruction}

QUY TẮC:
- Chỉ dùng số liệu trong feed — KHÔNG bịa số
- Tiếng Việt chuyên nghiệp
- riskScore: 0-100 (cao = rủi ro SCM lớn)
- severity: low|medium|high|critical
- priority action: P1|P2|P3

JSON SCHEMA:
{
  "confidence": "high|medium|low",
  "marketPulse": {
    "sentiment": "bullish|neutral|bearish",
    "riskScore": 0,
    "headline": "1 câu headline",
    "summary": "3-5 câu executive summary"
  },
  "fxAnalysis": {
    "overview": "đoạn phân tích FX tổng quan",
    "pairs": [{"pair":"USD/VND","rate":"số","change":"+x%","outlook":"...","scmImpact":"..."}]
  },
  "commodityAnalysis": {
    "overview": "phân tích dầu/nhiên liệu",
    "items": [{"name":"WTI","price":"$xx","change":"+x%","freightImpact":"..."}]
  },
  "scmImpacts": [{"area":"...","severity":"high","impact":"...","kpiLink":"..."}],
  "scenarios": [{"name":"Bull|Base|Bear","probability":"xx%","narrative":"...","triggers":["..."]}],
  "actionItems": [{"priority":"P1","role":"Procurement|Logistics|Planning|Finance","action":"...","horizon":"48h|1 tuần|..."}],
  "watchlist": ["..."],
  "keyRisks": ["..."],
  "fullReport": "Báo cáo markdown đầy đủ với ## headings, bullet, số liệu trích dẫn"
}

DỮ LIỆU:
${buildDetailedMarketContext(snapshot)}`;
}

function normalizeBriefing(
  parsed: Record<string, unknown>,
  model: string,
  depth: BriefingDepth
): MarketBriefingResult {
  const pulse = (parsed.marketPulse ?? {}) as Record<string, unknown>;
  const fx = (parsed.fxAnalysis ?? {}) as Record<string, unknown>;
  const comm = (parsed.commodityAnalysis ?? {}) as Record<string, unknown>;

  return {
    generatedAt: Date.now(),
    model,
    source: "gemini",
    depth,
    confidence: (["high", "medium", "low"].includes(String(parsed.confidence))
      ? parsed.confidence
      : "medium") as MarketBriefingResult["confidence"],
    marketPulse: {
      sentiment: (["bullish", "neutral", "bearish"].includes(String(pulse.sentiment))
        ? pulse.sentiment
        : "neutral") as MarketBriefingResult["marketPulse"]["sentiment"],
      riskScore: Math.min(100, Math.max(0, Number(pulse.riskScore ?? 50))),
      headline: String(pulse.headline ?? "Market briefing"),
      summary: String(pulse.summary ?? ""),
    },
    fxAnalysis: {
      overview: String(fx.overview ?? ""),
      pairs: Array.isArray(fx.pairs)
        ? fx.pairs.map((p) => {
            const item = p as Record<string, unknown>;
            return {
              pair: String(item.pair ?? ""),
              rate: String(item.rate ?? ""),
              change: String(item.change ?? ""),
              outlook: String(item.outlook ?? ""),
              scmImpact: String(item.scmImpact ?? ""),
            };
          })
        : [],
    },
    commodityAnalysis: {
      overview: String(comm.overview ?? ""),
      items: Array.isArray(comm.items)
        ? comm.items.map((p) => {
            const item = p as Record<string, unknown>;
            return {
              name: String(item.name ?? ""),
              price: String(item.price ?? ""),
              change: String(item.change ?? ""),
              freightImpact: String(item.freightImpact ?? ""),
            };
          })
        : [],
    },
    scmImpacts: Array.isArray(parsed.scmImpacts)
      ? parsed.scmImpacts.map((p) => {
          const item = p as Record<string, unknown>;
          return {
            area: String(item.area ?? ""),
            severity: (["low", "medium", "high", "critical"].includes(String(item.severity))
              ? item.severity
              : "medium") as MarketBriefingResult["scmImpacts"][0]["severity"],
            impact: String(item.impact ?? ""),
            kpiLink: String(item.kpiLink ?? ""),
          };
        })
      : [],
    scenarios: Array.isArray(parsed.scenarios)
      ? parsed.scenarios.map((p) => {
          const item = p as Record<string, unknown>;
          return {
            name: String(item.name ?? ""),
            probability: String(item.probability ?? ""),
            narrative: String(item.narrative ?? ""),
            triggers: Array.isArray(item.triggers) ? item.triggers.map(String) : [],
          };
        })
      : [],
    actionItems: Array.isArray(parsed.actionItems)
      ? parsed.actionItems.map((p) => {
          const item = p as Record<string, unknown>;
          return {
            priority: (["P1", "P2", "P3"].includes(String(item.priority))
              ? item.priority
              : "P2") as MarketBriefingResult["actionItems"][0]["priority"],
            role: String(item.role ?? ""),
            action: String(item.action ?? ""),
            horizon: String(item.horizon ?? ""),
          };
        })
      : [],
    watchlist: Array.isArray(parsed.watchlist) ? parsed.watchlist.map(String) : [],
    keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks.map(String) : [],
    fullReport: String(parsed.fullReport ?? ""),
  };
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries && isRetryable(err)) {
        await sleep(1500 * (i + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function callGeminiJson(
  apiKey: string,
  snapshot: MarketSnapshot,
  depth: BriefingDepth,
  onStream?: (partial: string) => void
): Promise<MarketBriefingResult> {
  const genAI = new GoogleGenerativeAI(normalizeKey(apiKey));
  const prompt = buildJsonPrompt(snapshot, depth);
  const cfg = DEPTH_CONFIG[depth];
  let lastError = "Không kết nối Gemini";

  for (const modelName of orderedModels()) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction:
          "Bạn là chuyên gia SCM Việt Nam. Trả về JSON hợp lệ duy nhất, không giải thích thêm.",
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: cfg.maxTokens,
          responseMimeType: "application/json",
        },
      });

      let raw = "";

      if (onStream) {
        const result = await withRetry(() => model.generateContentStream(prompt));
        for await (const chunk of result.stream) {
          raw += chunk.text();
          onStream(raw);
        }
      } else {
        const result = await withRetry(() => model.generateContent(prompt));
        raw = result.response.text();
      }

      if (!raw?.trim()) throw new Error("Gemini trả về rỗng");

      const parsed = parseAiJson<Record<string, unknown>>(raw);
      setPreferredModel(modelName);
      const briefing = normalizeBriefing(parsed, modelName, depth);

      if (!briefing.fullReport && briefing.marketPulse.summary) {
        briefing.fullReport = `## ${briefing.marketPulse.headline}\n\n${briefing.marketPulse.summary}`;
      }

      return briefing;
    } catch (err) {
      lastError = formatGeminiError(err);
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: cfg.maxTokens,
          },
        });
        const result = await withRetry(() => model.generateContent(prompt));
        const raw = result.response.text();
        const parsed = parseAiJson<Record<string, unknown>>(raw);
        setPreferredModel(modelName);
        return normalizeBriefing(parsed, modelName, depth);
      } catch (inner) {
        lastError = formatGeminiError(inner);
      }
    }
  }

  throw new Error(lastError);
}

export async function generateMarketBriefing(
  apiKey: string,
  snapshot: MarketSnapshot,
  options?: BriefingGenerateOptions
): Promise<MarketBriefingResult> {
  const key = normalizeKey(apiKey);
  const depth = options?.depth ?? "standard";

  if (key.length < 20) {
    return generateLocalBriefing(snapshot, depth);
  }

  try {
    return await callGeminiJson(key, snapshot, depth, options?.onStream);
  } catch (geminiErr) {
    const local = generateLocalBriefing(snapshot, depth);
    const errMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);

    local.marketPulse.summary = `${local.marketPulse.summary}\n\n⚠️ Gemini fallback: ${errMsg}`;
    local.fullReport = `${local.fullReport}\n\n---\n*Gemini không khả dụng: ${errMsg} — hiển thị bản phân tích LogIQ Local Engine.*`;
    return local;
  }
}

/** @deprecated use generateMarketBriefing returning MarketBriefingResult */
export async function generateMarketBriefingLegacy(
  apiKey: string,
  snapshot: MarketSnapshot
): Promise<{ text: string; model: string }> {
  const result = await generateMarketBriefing(apiKey, snapshot);
  return {
    text: result.fullReport || result.marketPulse.summary,
    model: result.model,
  };
}