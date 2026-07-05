import { createId } from "./id";
import type { TextChunk } from "./types";

export function chunkText(
  text: string,
  sourceId: string,
  chunkSize = 800,
  overlap = 120
): TextChunk[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
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
      const breakAt = Math.max(
        slice.lastIndexOf(". "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("\n")
      );
      if (breakAt > chunkSize * 0.35) {
        end = start + breakAt + 1;
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