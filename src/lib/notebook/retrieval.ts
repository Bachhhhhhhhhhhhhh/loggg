import type { NotebookSource, TextChunk, Citation } from "./types";
import { tokenize } from "./retrieval-utils";

export interface ScoredChunk {
  chunk: TextChunk;
  source: NotebookSource;
  score: number;
}

function scoreChunk(queryTokens: string[], tokens: string[], chunkText: string, docFreq: Map<string, number>, totalDocs: number): number {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  let score = 0;
  const lower = chunkText.toLowerCase();

  for (const qt of queryTokens) {
    const termFreq = tf.get(qt) ?? 0;
    if (!termFreq) continue;
    const idf = Math.log(1 + totalDocs / ((docFreq.get(qt) ?? 0) + 1));
    score += (termFreq / Math.max(tokens.length, 1)) * idf * 2;
    if (lower.includes(qt)) score += 0.6;
  }
  return score;
}

function isBroadQuery(query: string): boolean {
  return /tóm tắt|summary|tổng quan|nội dung chính|khái niệm|liệt kê|overview|toàn bộ/i.test(query);
}

function seedChunks(sources: NotebookSource[], perSource = 2): ScoredChunk[] {
  const seeded: ScoredChunk[] = [];
  for (const source of sources.filter((s) => s.enabled)) {
    for (const chunk of source.chunks.slice(0, perSource)) {
      seeded.push({ chunk, source, score: 0.3 });
    }
  }
  return seeded;
}

export function retrieveChunks(
  query: string,
  sources: NotebookSource[],
  limit = 8
): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  const queryTokens = tokenize(query);
  const broad = isBroadQuery(query);

  if (!queryTokens.length && broad) {
    return seedChunks(active, 3).slice(0, limit);
  }

  const docFreq = new Map<string, number>();
  const allChunks: { chunk: TextChunk; source: NotebookSource; tokens: string[] }[] = [];

  for (const source of active) {
    for (const chunk of source.chunks) {
      const tokens = tokenize(chunk.text);
      allChunks.push({ chunk, source, tokens });
      for (const t of new Set(tokens)) {
        docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
      }
    }
  }

  const totalDocs = allChunks.length;
  const scored: ScoredChunk[] = [];

  for (const item of allChunks) {
    const score = scoreChunk(queryTokens, item.tokens, item.chunk.text, docFreq, totalDocs);
    if (score > 0 || broad) {
      scored.push({ chunk: item.chunk, source: item.source, score: score || 0.01 });
    }
  }

  let results = scored.sort((a, b) => b.score - a.score);

  if (results.length < 3 && broad) {
    const existing = new Set(results.map((r) => r.chunk.id));
    for (const seed of seedChunks(active, 2)) {
      if (!existing.has(seed.chunk.id)) results.push(seed);
    }
    results = results.sort((a, b) => b.score - a.score);
  }

  if (results.length === 0) {
    return seedChunks(active, 2).slice(0, limit);
  }

  return results.slice(0, limit);
}

export function buildContextFromChunks(results: ScoredChunk[]): string {
  return results
    .map((r, i) => `[${i + 1}] (${r.source.name}):\n${r.chunk.text}`)
    .join("\n\n")
    .slice(0, 30000);
}

export function toCitations(results: ScoredChunk[]): Citation[] {
  return results.map((r) => ({
    sourceId: r.source.id,
    sourceName: r.source.name,
    chunkIndex: r.chunk.index,
    excerpt: r.chunk.text.slice(0, 240) + (r.chunk.text.length > 240 ? "…" : ""),
  }));
}

export function getAllActiveChunks(sources: NotebookSource[]): TextChunk[] {
  return sources.filter((s) => s.enabled).flatMap((s) => s.chunks);
}