import { createId } from "./id";
import type { TextChunk } from "./types";

const VI_BREAKS = [". ", "! ", "? ", ".\n", "!\n", "?\n", ":\n", ";\n", "\n\n", "。"];

function findBreakPoint(slice: string, minRatio: number, chunkSize: number): number {
  let best = -1;
  for (const sep of VI_BREAKS) {
    const at = slice.lastIndexOf(sep);
    if (at > chunkSize * minRatio && at > best) {
      best = at + sep.length - (sep.endsWith("\n") ? 0 : 1);
    }
  }
  return best;
}

export function chunkText(
  text: string,
  sourceId: string,
  chunkSize = 900,
  overlap = 150
): TextChunk[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) return [];

  if (normalized.length <= chunkSize) {
    return [
      {
        id: createId("chk"),
        sourceId,
        index: 0,
        text: normalized,
        wordCount: normalized.split(/\s+/).length,
      },
    ];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);

    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const breakAt = findBreakPoint(slice, 0.3, chunkSize);
      if (breakAt > 0) {
        end = start + breakAt;
      }
    }

    const piece = normalized.slice(start, end).trim();
    if (piece.length > 15) {
      chunks.push({
        id: createId("chk"),
        sourceId,
        index,
        text: piece,
        wordCount: piece.split(/\s+/).length,
      });
      index += 1;
    }

    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  if (chunks.length === 0) {
    chunks.push({
      id: createId("chk"),
      sourceId,
      index: 0,
      text: normalized.slice(0, chunkSize),
      wordCount: normalized.split(/\s+/).length,
    });
  }

  return chunks;
}