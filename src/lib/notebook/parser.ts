import mammoth from "mammoth";
import type { SourceType } from "./types";

let pdfWorkerReady = false;

function getBasePath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname.startsWith("/loggg") ? "/loggg" : "";
}

async function ensurePdfWorker(): Promise<void> {
  if (pdfWorkerReady || typeof window === "undefined") return;
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = `${getBasePath()}/pdf.worker.min.mjs`;
  pdfWorkerReady = true;
}

export function getSourceType(filename: string): SourceType {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  if (ext === ".txt") return "txt";
  if (ext === ".md") return "md";
  if (ext === ".csv") return "csv";
  return "unknown";
}

export type ParseProgress = {
  fileName: string;
  stage: "reading" | "parsing" | "chunking" | "done";
  percent?: number;
  detail?: string;
};

async function parsePdf(
  file: File,
  onProgress?: (p: ParseProgress) => void
): Promise<{ text: string; pageCount: number }> {
  await ensurePdfWorker();
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  onProgress?.({
    fileName: file.name,
    stage: "reading",
    detail: "Đang đọc file PDF…",
  });

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    onProgress?.({
      fileName: file.name,
      stage: "parsing",
      percent: Math.round((i / doc.numPages) * 100),
      detail: `Trang ${i}/${doc.numPages}`,
    });

    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) pages.push(text);
  }

  const text = pages.join("\n\n");
  if (!text.trim()) {
    throw new Error(
      `${file.name}: PDF không có text (có thể là file scan/ảnh). Hãy dùng PDF có text hoặc chuyển sang DOCX/TXT.`
    );
  }

  return { text, pageCount: doc.numPages };
}

async function parseDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  if (!result.value.trim()) {
    throw new Error(`${file.name}: file Word trống hoặc không đọc được.`);
  }
  return result.value;
}

async function parseText(file: File): Promise<string> {
  const text = await file.text();
  if (!text.trim()) throw new Error(`${file.name}: file trống.`);
  return text;
}

function parseCsv(text: string): string {
  const lines = text.split(/\r?\n/).filter(Boolean);
  return lines
    .map((line, i) => (i === 0 ? `Header: ${line}` : `Row ${i}: ${line}`))
    .join("\n");
}

export async function parseFile(
  file: File,
  onProgress?: (p: ParseProgress) => void
): Promise<{ text: string; type: SourceType; pageCount?: number }> {
  const type = getSourceType(file.name);
  if (type === "unknown") {
    throw new Error(
      `Định dạng không hỗ trợ: ${file.name}. Dùng PDF, DOCX, TXT, MD hoặc CSV.`
    );
  }

  onProgress?.({ fileName: file.name, stage: "parsing", detail: "Đang phân tích…" });

  let result: { text: string; type: SourceType; pageCount?: number };

  switch (type) {
    case "pdf": {
      const { text, pageCount } = await parsePdf(file, onProgress);
      result = { text, type, pageCount };
      break;
    }
    case "docx": {
      const text = await parseDocx(file);
      result = { text, type };
      break;
    }
    case "csv": {
      const raw = await parseText(file);
      result = { text: parseCsv(raw), type };
      break;
    }
    case "txt":
    case "md": {
      const text = await parseText(file);
      result = { text, type };
      break;
    }
    default:
      throw new Error(`Định dạng không hỗ trợ: ${file.name}`);
  }

  onProgress?.({ fileName: file.name, stage: "done", percent: 100 });
  return result;
}