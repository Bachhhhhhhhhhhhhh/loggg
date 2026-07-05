import mammoth from "mammoth";
import type { SourceType } from "./types";

export function getSourceType(filename: string): SourceType {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  if (ext === ".txt") return "txt";
  if (ext === ".md") return "md";
  if (ext === ".csv") return "csv";
  return "unknown";
}

async function parsePdf(file: File): Promise<{ text: string; pageCount: number }> {
  const pdfjs = await import("pdfjs-dist");
  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  return {
    text: pages.join("\n\n"),
    pageCount: doc.numPages,
  };
}

async function parseDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

async function parseText(file: File): Promise<string> {
  return file.text();
}

function parseCsv(text: string): string {
  const lines = text.split(/\r?\n/).filter(Boolean);
  return lines
    .map((line, i) => {
      if (i === 0) return `Header: ${line}`;
      return `Row ${i}: ${line}`;
    })
    .join("\n");
}

export async function parseFile(
  file: File
): Promise<{ text: string; type: SourceType; pageCount?: number }> {
  const type = getSourceType(file.name);

  switch (type) {
    case "pdf": {
      const { text, pageCount } = await parsePdf(file);
      return { text, type, pageCount };
    }
    case "docx": {
      const text = await parseDocx(file);
      return { text, type };
    }
    case "csv": {
      const raw = await parseText(file);
      return { text: parseCsv(raw), type };
    }
    case "txt":
    case "md": {
      const text = await parseText(file);
      return { text, type };
    }
    default:
      throw new Error(`Định dạng không hỗ trợ: ${file.name}`);
  }
}