import { createId } from "./id";
import type { TextChunk } from "./types";

const VI_BREAKS = [". ", "! ", "? ", ".\n", "!\n", "?\n", ":\n", ";\n", "\n\n", "。"];
const HEADING_RE = /^(#{1,4}\s+.+|[\d]+[.)]\s+.{3,60}|[A-Z][A-Z\s]{2,40}:?\s*$)/;

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

function splitSections(text: string): { heading?: string; body: string }[] {
  const lines = text.split("\n");
  const sections: { heading?: string; body: string }[] = [];
  let currentHeading: string | undefined;
  let buffer: string[] = [];

  const flush = () => {
    const body = buffer.join("\n").trim();
    if (body.length > 20) sections.push({ heading: currentHeading, body });
    buffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (HEADING_RE.test(trimmed) && trimmed.length < 120) {
      flush();
      currentHeading = trimmed.replace(/^#+\s+/, "").slice(0, 80);
      continue;
    }
    buffer.push(line);
  }
  flush();

  return sections.length ? sections : [{ body: text }];
}

function chunkSection(
  body: string,
  sourceId: string,
  heading: string | undefined,
  chunkSize: number,
  overlap: number,
  startIndex: number
): TextChunk[] {
  const normalized = body.replace(/[ \t]+/g, " ").trim();
  if (!normalized) return [];

  if (normalized.length <= chunkSize) {
    return [
      {
        id: createId("chk"),
        sourceId,
        index: startIndex,
        text: normalized,
        wordCount: normalized.split(/\s+/).length,
        heading,
      },
    ];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = startIndex;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);
    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const breakAt = findBreakPoint(slice, 0.28, chunkSize);
      if (breakAt > 0) end = start + breakAt;
    }

    const piece = normalized.slice(start, end).trim();
    if (piece.length > 15) {
      chunks.push({
        id: createId("chk"),
        sourceId,
        index,
        text: piece,
        wordCount: piece.split(/\s+/).length,
        heading,
      });
      index += 1;
    }

    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export function chunkText(
  text: string,
  sourceId: string,
  chunkSize = 1100,
  overlap = 180
): TextChunk[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const sections = splitSections(normalized);
  const all: TextChunk[] = [];
  let idx = 0;

  for (const section of sections) {
    const part = chunkSection(
      section.body,
      sourceId,
      section.heading,
      chunkSize,
      overlap,
      idx
    );
    all.push(...part);
    idx += part.length;
  }

  if (!all.length) {
    all.push({
      id: createId("chk"),
      sourceId,
      index: 0,
      text: normalized.slice(0, chunkSize),
      wordCount: normalized.split(/\s+/).length,
    });
  }

  return all;
}