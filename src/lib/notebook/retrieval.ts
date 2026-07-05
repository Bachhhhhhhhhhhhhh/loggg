import type { NotebookSource, TextChunk, Citation } from "./types";
import { tokenize } from "./retrieval-utils";
import { expandQuery, detectQueryIntent } from "./query-expand";

export interface ScoredChunk {
  chunk: TextChunk;
  source: NotebookSource;
  score: number;
}

function scoreChunk(
  queryTokens: string[],
  tokens: string[],
  chunkText: string,
  docFreq: Map<string, number>,
  totalDocs: number
): number {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  let score = 0;
  const lower = chunkText.toLowerCase();

  for (const qt of queryTokens) {
    const termFreq = tf.get(qt) ?? 0;
    if (!termFreq) continue;
    const idf = Math.log(1 + totalDocs / ((docFreq.get(qt) ?? 0) + 1));
    score += (termFreq / Math.max(tokens.length, 1)) * idf * 2.5;
    if (lower.includes(qt)) score += 0.8;
  }
  return score;
}

function seedChunks(sources: NotebookSource[], perSource = 2): ScoredChunk[] {
  const seeded: ScoredChunk[] = [];
  for (const source of sources.filter((s) => s.enabled)) {
    const pick = source.chunks.slice(0, perSource);
    for (const chunk of pick) {
      if (!seeded.some((s) => s.chunk.id === chunk.id)) {
        seeded.push({ chunk, source, score: 0.25 });
      }
    }
  }
  return seeded;
}

function diversifyResults(results: ScoredChunk[], limit: number): ScoredChunk[] {
  const picked: ScoredChunk[] = [];
  const perSource = new Map<string, number>();
  const maxPerSource = Math.max(2, Math.ceil(limit / 3));

  for (const item of results) {
    const count = perSource.get(item.source.id) ?? 0;
    if (count >= maxPerSource) continue;
    if (picked.some((p) => p.chunk.id === item.chunk.id)) continue;
    picked.push(item);
    perSource.set(item.source.id, count + 1);
    if (picked.length >= limit) break;
  }

  if (picked.length < limit) {
    for (const item of results) {
      if (picked.length >= limit) break;
      if (!picked.some((p) => p.chunk.id === item.chunk.id)) {
        picked.push(item);
      }
    }
  }

  return picked;
}

function scoreAllChunks(query: string, sources: NotebookSource[]): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  const queries = expandQuery(query);
  const allTokens = [...new Set(queries.flatMap((q) => tokenize(q)))];
  const intent = detectQueryIntent(query);
  const broad = intent === "summary" || intent === "concepts";

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
    let score = 0;
    for (const q of queries) {
      score += scoreChunk(tokenize(q), item.tokens, item.chunk.text, docFreq, totalDocs);
    }
    if (intent === "summary" && item.chunk.index < 2) score += 0.15;
    if (score > 0 || broad) {
      scored.push({ chunk: item.chunk, source: item.source, score: score || 0.01 });
    }
  }

  return scored.sort((a, b) => b.score - a.score);
}

export function retrieveChunks(
  query: string,
  sources: NotebookSource[],
  limit = 10
): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  let results = scoreAllChunks(query, sources);

  if (results.length < 4) {
    const existing = new Set(results.map((r) => r.chunk.id));
    for (const seed of seedChunks(active, 3)) {
      if (!existing.has(seed.chunk.id)) results.push(seed);
    }
    results = results.sort((a, b) => b.score - a.score);
  }

  if (results.length === 0) {
    return seedChunks(active, 2).slice(0, limit);
  }

  return diversifyResults(results, limit);
}

/** Retrieval tối ưu cho Gemini — nhiều ngữ cảnh, đa dạng nguồn */
export function retrieveForStudy(
  query: string,
  sources: NotebookSource[]
): ScoredChunk[] {
  const intent = detectQueryIntent(query);
  const limit = intent === "summary" ? 14 : intent === "concepts" ? 12 : 10;
  return retrieveChunks(query, sources, limit);
}

export function buildContextFromChunks(results: ScoredChunk[]): string {
  return results
    .map((r, i) => {
      const relevance = r.score > 0.5 ? "cao" : r.score > 0.1 ? "TB" : "tham khảo";
      return `[${i + 1}] (${r.source.name} · độ liên quan: ${relevance})\n${r.chunk.text}`;
    })
    .join("\n\n---\n\n")
    .slice(0, 48000);
}

export function toCitations(results: ScoredChunk[]): Citation[] {
  return results.slice(0, 8).map((r) => ({
    sourceId: r.source.id,
    sourceName: r.source.name,
    chunkIndex: r.chunk.index,
    excerpt: r.chunk.text.slice(0, 280) + (r.chunk.text.length > 280 ? "…" : ""),
  }));
}

export function getAllActiveChunks(sources: NotebookSource[]): TextChunk[] {
  return sources.filter((s) => s.enabled).flatMap((s) => s.chunks);
}

/** Lấy đoạn đại diện từ mỗi nguồn cho Studio / insights */
export function sampleChunksPerSource(
  sources: NotebookSource[],
  perSource = 4
): ScoredChunk[] {
  const results: ScoredChunk[] = [];
  for (const source of sources.filter((s) => s.enabled)) {
    const step = Math.max(1, Math.floor(source.chunks.length / perSource));
    for (let i = 0; i < source.chunks.length && results.filter((r) => r.source.id === source.id).length < perSource; i += step) {
      results.push({ chunk: source.chunks[i], source, score: 1 });
    }
  }
  return results;
}