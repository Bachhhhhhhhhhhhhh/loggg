import { generateGeminiRaw } from "@/lib/notebook/ai";
import { buildDetailedMarketContext } from "@/lib/market/briefing-context";
import { parseBriefingMarkdown } from "@/lib/market/briefing-markdown-parser";
import { generateLocalBriefing } from "@/lib/market/local-briefing";
import type {
  BriefingDepth,
  BriefingGenerateOptions,
  MarketBriefingResult,
} from "@/lib/market/briefing-types";
import type { MarketSnapshot } from "@/lib/market/types";
import { normalizeKey } from "./config";

const BRIEFING_SYSTEM = `Bạn là Giám đốc Market Intelligence & Supply Chain tại tập đoàn logistics Việt Nam.
Nhiệm vụ: phân tích dữ liệu thị trường LIVE và viết briefing chuyên nghiệp bằng tiếng Việt.
CHỈ dùng số liệu trong feed — không bịa số.
Luôn trả về đúng các section ## theo template (không bỏ section).`;

const DEPTH_HINT: Record<BriefingDepth, string> = {
  quick: "Ngắn gọn: mỗi section 2-4 bullet, 1 scenario.",
  standard: "Đầy đủ: 3 scenarios, 4-5 action items, phân tích FX + dầu chi tiết.",
  deep: "Chuyên sâu: 5+ action items, phân tích định lượng, 3 scenarios có triggers cụ thể, 6+ SCM impacts.",
};

function buildBriefingPrompt(snapshot: MarketSnapshot, depth: BriefingDepth): string {
  return `${DEPTH_HINT[depth]}

Viết báo cáo MARKET BRIEFING theo ĐÚNG template markdown sau (giữ nguyên tên ## section):

## HEADLINE
(1 câu headline súc tích)

## EXECUTIVE SUMMARY
(4-6 câu tóm tắt tình hình FX, dầu, tác động logistics VN)

## RISK SCORE
(Chỉ 1 dòng: "XX/100" — 0=thấp, 100=cực cao)

## SENTIMENT
(bullish | neutral | bearish + 1 câu giải thích)

## FX ANALYSIS
- USD/VND: [rate] ([change%]) — [outlook SCM VN]
- EUR/USD: ...
- USD/CNY: ...
(ít nhất 3 bullet, dùng số từ feed)

## COMMODITY
- WTI/Brent: [price] ([change%]) — [tác động freight/bunker]
(bullet từ dữ liệu feed)

## SCM IMPACTS
- [high] Chi phí vận tải: ...
- [medium] Nhập khẩu: ...
- [medium] Tồn kho: ...
(severity: low|medium|high|critical trong ngoặc vuông)

## SCENARIOS
### Bull — XX%
(narrative 2-3 câu)
Triggers: - trigger 1

### Base — XX%
...

### Bear — XX%
...

## ACTION ITEMS
- P1 [Procurement] Hành động cụ thể (48h)
- P2 [Logistics] ...
- P2 [Planning] ...

## WATCHLIST
- mục theo dõi 1
- mục 2
...

## KEY RISKS
- rủi ro 1
- rủi ro 2
...

═══ DỮ LIỆU THỊ TRƯỜNG ═══
${buildDetailedMarketContext(snapshot)}`;
}

export async function generateMarketBriefing(
  apiKey: string,
  snapshot: MarketSnapshot,
  options?: BriefingGenerateOptions
): Promise<MarketBriefingResult> {
  const key = normalizeKey(apiKey);
  const depth = options?.depth ?? "standard";

  if (key.length < 20) {
    const local = generateLocalBriefing(snapshot, depth);
    local.marketPulse.summary += "\n\n⚠️ Chưa có Gemini API key — Cài đặt AI (⚙️ Navbar) → Test → Lưu.";
    return local;
  }

  try {
    const { text, model } = await generateGeminiRaw(key, buildBriefingPrompt(snapshot, depth), {
      systemInstruction: BRIEFING_SYSTEM,
      temperature: 0.5,
      maxOutputTokens: depth === "deep" ? 8192 : depth === "quick" ? 3072 : 6144,
      onStream: options?.onStream,
    });

    const briefing = parseBriefingMarkdown(text, model, depth);
    briefing.confidence = snapshot.isLive ? "high" : "medium";
    return briefing;
  } catch (geminiErr) {
    const errMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
    const local = generateLocalBriefing(snapshot, depth);
    local.marketPulse.summary =
      `${local.marketPulse.summary}\n\n⚠️ **Gemini lỗi:** ${errMsg}\n\nĐang hiển thị bản phân tích cục bộ. Kiểm tra API key tại ⚙️ Cài đặt AI → Test kết nối.`;
    local.fullReport += `\n\n---\n**Lỗi Gemini:** ${errMsg}`;
    return local;
  }
}