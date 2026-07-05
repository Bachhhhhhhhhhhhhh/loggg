import type { IndexedChunk } from "./retrieval-index";
import { tokenize } from "./retrieval-utils";

const K1 = 1.5;
const B = 0.75;

export function bm25Score(
  queryTokens: string[],
  item: IndexedChunk,
  docFreq: Map<string, number>,
  totalDocs: number,
  avgDocLen: number
): number {
  const docLen = item.tokens.length;
  const tf = new Map<string, number>();
  for (const t of item.tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  let score = 0;
  const uniqueQuery = [...new Set(queryTokens)];

  for (const qt of uniqueQuery) {
    const termFreq = tf.get(qt) ?? 0;
    if (!termFreq) continue;
    const df = docFreq.get(qt) ?? 0;
    const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
    const tfNorm =
      (termFreq * (K1 + 1)) /
      (termFreq + K1 * (1 - B + (B * docLen) / Math.max(avgDocLen, 1)));
    score += idf * tfNorm;
  }

  return score;
}

export function tokenizeQuery(query: string): string[] {
  return tokenize(query);
}