import { createId } from "./id";
import type {
  Flashcard,
  NotebookInsights,
  NotebookSource,
  QuizQuestion,
  TextChunk,
} from "./types";
import { tokenize } from "./retrieval-utils";

function topSentences(chunks: TextChunk[], count = 8): string[] {
  const sentences: { text: string; score: number }[] = [];
  const wordFreq = new Map<string, number>();

  for (const chunk of chunks) {
    for (const w of tokenize(chunk.text)) {
      wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
    }
  }

  for (const chunk of chunks) {
    const parts = chunk.text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 30);
    for (const s of parts) {
      const words = tokenize(s);
      const score = words.reduce((sum, w) => sum + (wordFreq.get(w) ?? 0), 0) / words.length;
      sentences.push({ text: s.trim(), score });
    }
  }

  const seen = new Set<string>();
  return sentences
    .sort((a, b) => b.score - a.score)
    .filter((s) => {
      const key = s.text.slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, count)
    .map((s) => s.text);
}

function extractTopics(chunks: TextChunk[]): { topic: string; detail: string }[] {
  const freq = new Map<string, number>();
  for (const chunk of chunks) {
    for (const w of tokenize(chunk.text)) {
      if (w.length > 4) freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => {
      const related = chunks.find((c) => c.text.toLowerCase().includes(topic));
      return {
        topic: topic.charAt(0).toUpperCase() + topic.slice(1),
        detail: related
          ? related.text.slice(0, 140) + "…"
          : `Xuất hiện ${count} lần trong tài liệu`,
      };
    });
}

function buildFlashcards(chunks: TextChunk[], sources: NotebookSource[]): Flashcard[] {
  const cards: Flashcard[] = [];
  const patterns = [
    /([A-Z]{2,}(?:\s[A-Z]{2,})*)\s*(?:là|được định nghĩa|refers to|means)\s*([^.!?]{20,120})/gi,
    /(?:Incoterm|EOQ|ABC|KPI|OTD|WMS|TMS|SCM)\s*[:\-—]\s*([^.!?]{15,100})/gi,
    /([^.!?]{8,50})\s*:\s*([^.!?]{20,120})/g,
  ];

  for (const chunk of chunks.slice(0, 30)) {
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(chunk.text)) !== null && cards.length < 12) {
        const front = match[1]?.trim();
        const back = match[2]?.trim();
        if (front && back && front.length < 80) {
          const source = sources.find((s) => s.id === chunk.sourceId);
          cards.push({
            id: createId("fc"),
            front,
            back,
            sourceId: source?.id,
          });
        }
      }
    }
  }

  if (cards.length < 6) {
    const sentences = topSentences(chunks, 6);
    sentences.forEach((s, i) => {
      const words = s.split(/\s+/);
      if (words.length > 8) {
        const mid = Math.floor(words.length / 2);
        cards.push({
          id: createId("fc"),
          front: `Khái niệm liên quan: ${words.slice(0, mid).join(" ")}…?`,
          back: s,
        });
      }
    });
  }

  return cards.slice(0, 12);
}

function buildQuiz(chunks: TextChunk[]): QuizQuestion[] {
  const sentences = topSentences(chunks, 5);
  return sentences.slice(0, 5).map((s, i) => {
    const words = tokenize(s).filter((w) => w.length > 4);
    const keyword = words[0] ?? "logistics";
    const question = `Theo tài liệu, điều nào mô tả đúng nhất về "${keyword}"?`;
    const correct = s.length > 120 ? s.slice(0, 120) + "…" : s;
    const distractors = [
      "Không được đề cập trong tài liệu.",
      "Chỉ áp dụng cho thị trường nội địa.",
      "Là chỉ số không liên quan đến chuỗi cung ứng.",
    ];
    const options = [correct, ...distractors.slice(0, 3)];
    return {
      id: createId("quiz"),
      question,
      options,
      correctIndex: 0,
      explanation: s,
    };
  });
}

function buildGlossary(chunks: TextChunk[]): { term: string; definition: string }[] {
  const terms = new Map<string, string>();
  const abbr = /\b([A-Z]{2,6})\b[^.]{0,30}(?:là|—|-|:)\s*([^.!?]{15,100})/g;

  for (const chunk of chunks) {
    let m;
    while ((m = abbr.exec(chunk.text)) !== null && terms.size < 15) {
      terms.set(m[1], m[2].trim());
    }
  }

  return [...terms.entries()].map(([term, definition]) => ({ term, definition }));
}

export function generateInsights(sources: NotebookSource[]): NotebookInsights {
  const chunks = sources.filter((s) => s.enabled).flatMap((s) => s.chunks);
  const sentences = topSentences(chunks, 10);
  const topics = extractTopics(chunks);

  const outline = [
    "Tổng quan nội dung tài liệu",
    ...topics.slice(0, 5).map((t) => t.topic),
    "Khái niệm & thuật ngữ chính",
    "Ứng dụng thực tiễn Logistics / SCM",
  ];

  const summary =
    sentences.length > 0
      ? sentences.slice(0, 4).join(" ")
      : "Chưa đủ nội dung để tạo tóm tắt. Hãy upload thêm tài liệu.";

  return {
    outline,
    keyTopics: topics,
    summary,
    flashcards: buildFlashcards(chunks, sources),
    quiz: buildQuiz(chunks),
    glossary: buildGlossary(chunks),
    generatedAt: Date.now(),
  };
}