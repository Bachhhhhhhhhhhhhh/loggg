import type { NotebookSource, TextChunk, Citation } from "./types";
import { tokenize } from "./retrieval-utils";
import { expandQuery, detectQueryIntent } from "./query-expand";
import { getSourceIndex, buildSourceIndex, type IndexedChunk, type SourceIndex } from "./retrieval-index";
import { bm25Score } from "./bm25";
import { embedText, cosineSimilarity } from "./semantic-embed";

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

function keywordScore(
  queryTokens: string[],
  queryBigrams: string[],
  item: IndexedChunk,
  rawQuery: string
): number {
  const { tokens, chunk } = item;
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  let score = 0;
  const lower = chunk.text.toLowerCase();
  const normalizedQuery = rawQuery.toLowerCase().trim();

  if (normalizedQuery.length > 4 && lower.includes(normalizedQuery)) score += 4;
  if (chunk.heading && normalizedQuery.includes(chunk.heading.toLowerCase().slice(0, 20))) {
    score += 2.5;
  }

  for (const qt of queryTokens) {
    const termFreq = tf.get(qt) ?? 0;
    if (!termFreq) continue;
    score += (termFreq / Math.max(tokens.length, 1)) * 3;
    if (lower.includes(qt)) score += 1;
  }

  const itemBigramSet = new Set(item.bigrams);
  for (const bg of queryBigrams) {
    if (itemBigramSet.has(bg)) score += 1.6;
  }

  return score;
}

function rrfFuse(rankings: ScoredChunk[][], limit: number, k = 60): ScoredChunk[] {
  const scores = new Map<string, { item: ScoredChunk; rrf: number }>();

  for (const list of rankings) {
    list.forEach((item, rank) => {
      const prev = scores.get(item.chunk.id);
      const rrf = 1 / (k + rank + 1);
      if (prev) {
        prev.rrf += rrf;
      } else {
        scores.set(item.chunk.id, { item, rrf });
      }
    });
  }

  return [...scores.values()]
    .sort((a, b) => b.rrf - a.rrf)
    .slice(0, limit + 6)
    .map(({ item, rrf }) => ({ ...item, score: rrf }));
}

function seedChunks(sources: NotebookSource[], perSource = 2): ScoredChunk[] {
  const seeded: ScoredChunk[] = [];
  for (const source of sources.filter((s) => s.enabled)) {
    for (const chunk of source.chunks.slice(0, perSource)) {
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
  const maxPerSource = Math.max(3, Math.ceil(limit / 2.5));

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
      if (!picked.some((p) => p.chunk.id === item.chunk.id)) picked.push(item);
    }
  }

  return picked;
}

function mmrRerank(results: ScoredChunk[], limit: number, lambda = 0.7): ScoredChunk[] {
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
        const sameSource = p.source.id === candidate.source.id ? 0.3 : 0;
        const overlap =
          p.chunk.text.slice(0, 80) === candidate.chunk.text.slice(0, 80) ? 0.45 : 0;
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

function hybridRetrieve(
  query: string,
  sources: NotebookSource[],
  notebookId?: string
): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  const index: SourceIndex = notebookId
    ? getSourceIndex(notebookId, sources)
    : buildSourceIndex(`_query_${active.map((s) => s.id).join("_")}`, active);

  const queries = expandQuery(query);
  const queryTokens = [...new Set(queries.flatMap((q) => tokenize(q)))];
  const queryBigrams = buildBigrams(queryTokens);
  const queryVector = embedText(queries.join(" "));
  const intent = detectQueryIntent(query);

  const bm25Rank: ScoredChunk[] = [];
  const kwRank: ScoredChunk[] = [];
  const semRank: ScoredChunk[] = [];

  for (const item of index.chunks) {
    let bm = 0;
    for (const q of queries) {
      bm += bm25Score(
        tokenize(q),
        item,
        index.docFreq,
        index.totalChunks,
        index.avgDocLen
      );
    }

    let kw = 0;
    for (const q of queries) {
      kw += keywordScore(tokenize(q), buildBigrams(tokenize(q)), item, q);
    }

    const sem = cosineSimilarity(queryVector, item.vector) * 10;

    if (intent === "summary" && item.chunk.index < 4) {
      bm += 0.3;
      kw += 0.2;
    }
    if (intent === "concepts" && /định nghĩa|là|refers|means|:/i.test(item.chunk.text)) {
      bm += 0.25;
    }

    if (bm > 0) bm25Rank.push({ chunk: item.chunk, source: item.source, score: bm });
    if (kw > 0) kwRank.push({ chunk: item.chunk, source: item.source, score: kw });
    if (sem > 0.1) semRank.push({ chunk: item.chunk, source: item.source, score: sem });
  }

  bm25Rank.sort((a, b) => b.score - a.score);
  kwRank.sort((a, b) => b.score - a.score);
  semRank.sort((a, b) => b.score - a.score);

  const broad = intent === "summary" || intent === "concepts";
  if (!bm25Rank.length && broad) {
    return index.chunks.map((item) => ({
      chunk: item.chunk,
      source: item.source,
      score: 0.01,
    }));
  }

  return rrfFuse(
    [bm25Rank.slice(0, 40), kwRank.slice(0, 40), semRank.slice(0, 40)],
    50
  );
}

export function retrieveChunks(
  query: string,
  sources: NotebookSource[],
  limit = 12,
  notebookId?: string
): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  let results = hybridRetrieve(query, sources, notebookId);

  if (results.length < 6) {
    const existing = new Set(results.map((r) => r.chunk.id));
    for (const seed of seedChunks(active, 4)) {
      if (!existing.has(seed.chunk.id)) results.push(seed);
    }
    results = results.sort((a, b) => b.score - a.score);
  }

  if (!results.length) return seedChunks(active, 3).slice(0, limit);

  return mmrRerank(diversifyResults(results, limit + 6), limit);
}

export function retrieveForStudy(
  query: string,
  sources: NotebookSource[],
  notebookId?: string
): ScoredChunk[] {
  const intent = detectQueryIntent(query);
  const limit =
    intent === "summary" ? 24 : intent === "concepts" ? 20 : intent === "compare" ? 18 : 16;
  return retrieveChunks(query, sources, limit, notebookId);
}

export function buildContextFromChunks(results: ScoredChunk[]): string {
  return results
    .map((r, i) => {
      const text = r.chunk.text.replace(/\s+/g, " ").trim();
      const tag = r.chunk.heading ? ` — ${r.chunk.heading}` : "";
      return `▸ [${i + 1}] "${r.source.name}"${tag}\n${text}`;
    })
    .join("\n\n")
    .slice(0, 96000);
}

export function toCitations(results: ScoredChunk[]): Citation[] {
  return results.slice(0, 10).map((r) => ({
    sourceId: r.source.id,
    sourceName: r.source.name,
    chunkIndex: r.chunk.index,
    excerpt: r.chunk.text.slice(0, 300) + (r.chunk.text.length > 300 ? "…" : ""),
  }));
}

export function getAllActiveChunks(sources: NotebookSource[]): TextChunk[] {
  return sources.filter((s) => s.enabled).flatMap((s) => s.chunks);
}

export function sampleChunksPerSource(
  sources: NotebookSource[],
  perSource = 6
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

export function buildTrainingContext(
  sources: NotebookSource[],
  notebookId?: string
): ScoredChunk[] {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  if (!active.length) return [];

  if (notebookId) getSourceIndex(notebookId, sources);

  const results: ScoredChunk[] = [];
  const queries = [
    "tóm tắt nội dung chính logistics supply chain",
    "khái niệm thuật ngữ định nghĩa quan trọng",
    "ứng dụng thực tiễn case study best practice",
  ];

  for (const source of active) {
    for (const q of queries) {
      results.push(...retrieveChunks(q, [source], 4, notebookId));
    }
  }

  const seen = new Set<string>();
  const unique = results.filter((r) => {
    if (seen.has(r.chunk.id)) return false;
    seen.add(r.chunk.id);
    return true;
  });

  if (unique.length < 12) unique.push(...sampleChunksPerSource(active, 5));

  return unique.slice(0, 48);
}