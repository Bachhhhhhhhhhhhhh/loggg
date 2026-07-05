import type { NotebookSource, TextChunk, Citation } from "./types";
import { tokenize } from "./retrieval-utils";

export interface ScoredChunk {
  chunk: TextChunk;
  source: NotebookSource;
  score: number;
}

export function retrieveChunks(
  query: string,
  sources: NotebookSource[],
  limit = 6
): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];

  const docFreq = new Map<string, number>();
  const allChunks: { chunk: TextChunk; source: NotebookSource; tokens: string[] }[] = [];

  for (const source of active) {
    for (const chunk of source.chunks) {
      const tokens = tokenize(chunk.text);
      allChunks.push({ chunk, source, tokens });
      const unique = new Set(tokens);
      for (const t of unique) {
        docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
      }
    }
  }

  const totalDocs = allChunks.length;
  const scored: ScoredChunk[] = [];

  for (const item of allChunks) {
    const tf = new Map<string, number>();
    for (const t of item.tokens) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }

    let score = 0;
    for (const qt of queryTokens) {
      const termFreq = tf.get(qt) ?? 0;
      if (!termFreq) continue;
      const idf = Math.log(1 + totalDocs / ((docFreq.get(qt) ?? 0) + 1));
      score += (termFreq / item.tokens.length) * idf * 2;
      if (item.chunk.text.toLowerCase().includes(qt)) score += 0.5;
    }

    if (score > 0) {
      scored.push({ chunk: item.chunk, source: item.source, score });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function toCitations(results: ScoredChunk[]): Citation[] {
  return results.map((r) => ({
    sourceId: r.source.id,
    sourceName: r.source.name,
    chunkIndex: r.chunk.index,
    excerpt: r.chunk.text.slice(0, 220) + (r.chunk.text.length > 220 ? "…" : ""),
  }));
}

export function getAllActiveChunks(sources: NotebookSource[]): TextChunk[] {
  return sources.filter((s) => s.enabled).flatMap((s) => s.chunks);
}