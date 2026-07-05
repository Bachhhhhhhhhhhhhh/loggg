import type { NotebookSource } from "./types";

/** Full text from chunks (sources no longer duplicate raw text in IndexedDB). */
export function getSourceText(source: NotebookSource): string {
  if (source.text?.trim()) return source.text;
  return source.chunks.map((c) => c.text).join("\n\n");
}

export function getSourcesCombinedText(sources: NotebookSource[]): string {
  return sources
    .filter((s) => s.enabled)
    .map(getSourceText)
    .join("\n\n");
}