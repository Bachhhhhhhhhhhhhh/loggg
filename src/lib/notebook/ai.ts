import type { ChatMessage } from "./types";

export async function askGemini(
  apiKey: string,
  question: string,
  context: string,
  history: ChatMessage[]
): Promise<string> {
  const historyText = history
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `Bạn là trợ lý học tập Logistics & Supply Chain của LogIQ, giống NotebookLM.
Trả lời bằng tiếng Việt, chính xác, dựa CHỈ trên ngữ cảnh tài liệu bên dưới.
Trích dẫn nguồn bằng [1], [2]... khi cần. Nếu không có trong tài liệu, nói rõ.

NGỮ CẢNH TÀI LIỆU:
${context}

LỊCH SỬ HỘI THOẠI:
${historyText || "(trống)"}

CÂU HỎI: ${question}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty AI response");
  return text;
}

export async function generateAiInsights(
  apiKey: string,
  fullText: string
): Promise<{ summary: string; outline: string[] }> {
  const excerpt = fullText.slice(0, 12000);
  const prompt = `Phân tích tài liệu logistics/SCM sau. Trả về JSON thuần (không markdown):
{"summary":"tóm tắt 3-4 câu tiếng Việt","outline":["mục 1","mục 2",...5-8 mục]}

TÀI LIỆU:
${excerpt}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 800 },
      }),
    }
  );

  if (!res.ok) throw new Error("AI insights failed");

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI JSON");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    summary: parsed.summary ?? "",
    outline: Array.isArray(parsed.outline) ? parsed.outline : [],
  };
}