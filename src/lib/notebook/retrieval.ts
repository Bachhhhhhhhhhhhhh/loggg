import type { NotebookSource, TextChunk, Citation } from "./types";
import { tokenize } from "./retrieval-utils";
import { expandQuery, detectQueryIntent } from "./query-expand";
import { getSourceIndex, type IndexedChunk } from "./retrieval-index";

export interface ScoredChunk {
  chunk: TextChunk;
  source: NotebookSource;
  score: number;
}

function buildBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

function scoreChunk(
  queryTokens: string[],
  queryBigrams: string[],
  item: IndexedChunk,
  docFreq: Map<string, number>,
  totalDocs: number,
  rawQuery: string
): number {
  const { tokens, chunk } = item;
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  let score = 0;
  const lower = chunk.text.toLowerCase();
  const normalizedQuery = rawQuery.toLowerCase().trim();

  if (normalizedQuery.length > 4 && lower.includes(normalizedQuery)) {
    score += 3.5;
  }

  for (const qt of queryTokens) {
    const termFreq = tf.get(qt) ?? 0;
    if (!termFreq) continue;
    const idf = Math.log(1 + totalDocs / ((docFreq.get(qt) ?? 0) + 1));
    score += (termFreq / Math.max(tokens.length, 1)) * idf * 2.8;
    if (lower.includes(qt)) score += 0.9;
  }

  const itemBigramSet = new Set(item.bigrams);
  for (const bg of queryBigrams) {
    if (itemBigramSet.has(bg)) score += 1.4;
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

function mmrRerank(results: ScoredChunk[], limit: number, lambda = 0.72): ScoredChunk[] {
  if (results.length <= limit) return results;

  const picked: ScoredChunk[] = [];
  const remaining = [...results];
  const maxScore = Math.max(...remaining.map((r) => r.score), 1);

  while (picked.length < limit && remaining.length > 0) {
    let bestIdx = 0;
    let bestMmr = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const relevance = candidate.score / maxScore;

      let maxSim = 0;
      for (const p of picked) {
        const sameSource = p.source.id === candidate.source.id ? 0.35 : 0;
        const overlap =
          p.chunk.text.slice(0, 80) === candidate.chunk.text.slice(0, 80) ? 0.5 : 0;
        maxSim = Math.max(maxSim, sameSource + overlap);
      }

      const mmr = lambda * relevance - (1 - lambda) * maxSim;
      if (mmr > bestMmr) {
        bestMmr = mmr;
        bestIdx = i;
      }
    }

    picked.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }

  return picked;
}

function scoreAllChunks(
  query: string,
  sources: NotebookSource[],
  notebookId?: string
): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  const index = notebookId
    ? getSourceIndex(notebookId, sources)
    : null;

  const queries = expandQuery(query);
  const allTokens = [...new Set(queries.flatMap((q) => tokenize(q)))];
  const allBigrams = buildBigrams(allTokens);
  const intent = detectQueryIntent(query);
  const broad = intent === "summary" || intent === "concepts";

  const chunksToScore: IndexedChunk[] = index
    ? index.chunks
    : active.flatMap((source) =>
        source.chunks.map((chunk) => ({
          chunk,
          source,
          tokens: tokenize(chunk.text),
          bigrams: buildBigrams(tokenize(chunk.text)),
        }))
      );

  const docFreq = index?.docFreq ?? new Map<string, number>();
  if (!index) {
    for (const item of chunksToScore) {
      for (const t of new Set(item.tokens)) {
        docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
      }
    }
  }

  const totalDocs = chunksToScore.length;
  const scored: ScoredChunk[] = [];

  for (const item of chunksToScore) {
    let score = 0;
    for (const q of queries) {
      const qTokens = tokenize(q);
      score += scoreChunk(
        qTokens,
        buildBigrams(qTokens),
        item,
        docFreq,
        totalDocs,
        q
      );
    }
    if (intent === "summary" && item.chunk.index < 3) score += 0.2;
    if (intent === "concepts" && /định nghĩa|là|refers|means|:/i.test(item.chunk.text)) {
      score += 0.15;
    }
    if (score > 0 || broad) {
      scored.push({ chunk: item.chunk, source: item.source, score: score || 0.01 });
    }
  }

  return scored.sort((a, b) => b.score - a.score);
}

export function retrieveChunks(
  query: string,
  sources: NotebookSource[],
  limit = 10,
  notebookId?: string
): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  let results = scoreAllChunks(query, sources, notebookId);

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

  const diversified = diversifyResults(results, limit + 4);
  return mmrRerank(diversified, limit);
}

/** Retrieval tối ưu cho Gemini — nhiều ngữ cảnh, đa dạng nguồn */
export function retrieveForStudy(
  query: string,
  sources: NotebookSource[],
  notebookId?: string
): ScoredChunk[] {
  const intent = detectQueryIntent(query);
  const limit =
    intent === "summary" ? 16 : intent === "concepts" ? 14 : intent === "compare" ? 12 : 10;
  return retrieveChunks(query, sources, limit, notebookId);
}

export function buildContextFromChunks(results: ScoredChunk[]): string {
  return results
    .map((r, i) => {
      const text = r.chunk.text.replace(/\s+/g, " ").trim();
      return `▸ Nguồn [${i + 1}] — "${r.source.name}"\n${text}`;
    })
    .join("\n\n")
    .slice(0, 52000);
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
    for (
      let i = 0;
      i < source.chunks.length &&
      results.filter((r) => r.source.id === source.id).length < perSource;
      i += step
    ) {
      results.push({ chunk: source.chunks[i], source, score: 1 });
    }
    if (source.chunks.length > 0 && !results.some((r) => r.source.id === source.id)) {
      results.push({ chunk: source.chunks[0], source, score: 1 });
    }
  }
  return results;
}

/** Ngữ cảnh rộng cho huấn luyện Studio — đầu/cuối/giữa mỗi nguồn */
export function buildTrainingContext(
  sources: NotebookSource[],
  notebookId?: string
): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  if (notebookId) getSourceIndex(notebookId, sources);

  const results: ScoredChunk[] = [];
  const summaryQuery = "tóm tắt nội dung chính khái niệm logistics supply chain";

  for (const source of active) {
    const sourceResults = retrieveChunks(summaryQuery, [source], 6, notebookId);
    results.push(...sourceResults.slice(0, 5));
  }

  const seen = new Set<string>();
  const unique = results.filter((r) => {
    if (seen.has(r.chunk.id)) return false;
    seen.add(r.chunk.id);
    return true;
  });

  if (unique.length < 8) {
    unique.push(...sampleChunksPerSource(active, 3));
  }

  return unique.slice(0, 28);
}