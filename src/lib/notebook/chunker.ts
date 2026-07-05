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

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);

    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const breakAt = Math.max(
        slice.lastIndexOf(". "),
        slice.lastIndexOf(".\n"),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("\n")
      );
      if (breakAt > chunkSize * 0.4) {
        end = start + breakAt + 1;
      }
    }

    const chunkText = normalized.slice(start, end).trim();
    if (chunkText.length > 40) {
      chunks.push({
        id: createId("chk"),
        sourceId,
        index,
        text: chunkText,
        wordCount: chunkText.split(/\s+/).length,
      });
      index += 1;
    }

    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}