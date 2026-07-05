import type { NotebookSource } from "./types";
import { tokenize } from "./retrieval-utils";

export interface SourceProfile {
  sourceId: string;
  sourceName: string;
  topTerms: string[];
  suggestedQuestions: string[];
  snippet: string;
  chunkCount: number;
}

const TERM_TEMPLATES = [
  (t: string) => `${t} là gì và ứng dụng thế nào trong logistics?`,
  (t: string) => `Giải thích chi tiết về ${t}`,
  (t: string) => `So sánh ${t} với các phương pháp khác trong tài liệu`,
  (t: string) => `Rủi ro và lưu ý khi áp dụng ${t}?`,
];

export function buildSourceProfile(source: NotebookSource): SourceProfile {
  const freq = new Map<string, number>();
  const sentences: string[] = [];

  for (const chunk of source.chunks) {
    const parts = chunk.text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 40);
    sentences.push(...parts.slice(0, 3));
    for (const w of tokenize(chunk.text)) {
      if (w.length > 3) freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }

  const topTerms = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t]) => t.charAt(0).toUpperCase() + t.slice(1));

  const suggestedQuestions: string[] = [
    `Tóm tắt nội dung chính của "${source.name}"`,
    `Liệt kê khái niệm quan trọng trong ${source.name}`,
    "Ứng dụng thực tiễn trong chuỗi cung ứng?",
  ];

  for (const term of topTerms.slice(0, 3)) {
    suggestedQuestions.push(TERM_TEMPLATES[0](term));
  }

  const snippet =
    sentences.sort((a, b) => b.length - a.length)[0]?.slice(0, 200) ??
    source.chunks[0]?.text.slice(0, 200) ??
    "";

  return {
    sourceId: source.id,
    sourceName: source.name,
    topTerms,
    suggestedQuestions: [...new Set(suggestedQuestions)].slice(0, 8),
    snippet,
    chunkCount: source.chunks.length,
  };
}

export function buildNotebookProfiles(sources: NotebookSource[]): SourceProfile[] {
  return sources
    .filter((s) => s.enabled && s.chunks.length > 0)
    .map(buildSourceProfile);
}

export function getDynamicSuggestions(
  sources: NotebookSource[],
  limit = 8
): string[] {
  const profiles = buildNotebookProfiles(sources);
  const pool: string[] = [
    "Tóm tắt toàn bộ tài liệu theo chủ đề",
    "So sánh các phương pháp được đề cập",
    "Liệt kê rủi ro và cách giảm thiểu",
    "Tạo lộ trình học từ tài liệu này",
  ];

  for (const p of profiles) {
    pool.push(...p.suggestedQuestions.slice(0, 3));
  }

  return [...new Set(pool)].slice(0, limit);
}