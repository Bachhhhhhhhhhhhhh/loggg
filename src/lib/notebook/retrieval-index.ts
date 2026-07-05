import type { NotebookSource, TextChunk } from "./types";
import { tokenize } from "./retrieval-utils";

export interface IndexedChunk {
  chunk: TextChunk;
  source: NotebookSource;
  tokens: string[];
  bigrams: string[];
}

export interface SourceIndex {
  notebookId: string;
  builtAt: number;
  chunks: IndexedChunk[];
  docFreq: Map<string, number>;
  totalChunks: number;
}

const cache = new Map<string, SourceIndex>();

function buildBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

export function buildSourceIndex(
  notebookId: string,
  sources: NotebookSource[]
): SourceIndex {
  const active = sources.filter((s) => s.enabled && s.chunks.length > 0);
  const chunks: IndexedChunk[] = [];
  const docFreq = new Map<string, number>();

  for (const source of active) {
    for (const chunk of source.chunks) {
      const tokens = tokenize(chunk.text);
      chunks.push({
        chunk,
        source,
        tokens,
        bigrams: buildBigrams(tokens),
      });
      for (const t of new Set(tokens)) {
        docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
      }
    }
  }

  const index: SourceIndex = {
    notebookId,
    builtAt: Date.now(),
    chunks,
    docFreq,
    totalChunks: chunks.length,
  };

  cache.set(notebookId, index);
  return index;
}

function fingerprint(sources: NotebookSource[]): string {
  return sources
    .map((s) => `${s.id}:${s.enabled ? 1 : 0}:${s.chunks.length}:${s.uploadedAt}`)
    .sort()
    .join("|");
}

const fpCache = new Map<string, string>();

export function getSourceIndex(
  notebookId: string,
  sources: NotebookSource[],
  forceRebuild = false
): SourceIndex {
  const fp = fingerprint(sources);
  const cached = cache.get(notebookId);

  if (!forceRebuild && cached && fpCache.get(notebookId) === fp) {
    return cached;
  }

  fpCache.set(notebookId, fp);
  return buildSourceIndex(notebookId, sources);
}

export function invalidateIndex(notebookId: string): void {
  cache.delete(notebookId);
  fpCache.delete(notebookId);
}