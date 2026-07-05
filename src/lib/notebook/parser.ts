import type { SourceType } from "./types";

let pdfModule: typeof import("pdfjs-dist/legacy/build/pdf.mjs") | null = null;

function getBasePath(): string {
  if (typeof window === "undefined") return "";
  const path = window.location.pathname;
  if (path.startsWith("/loggg")) return "/loggg";
  return "";
}

async function loadPdfJs() {
  if (pdfModule) return pdfModule;
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const base = getBasePath();
  pdfjs.GlobalWorkerOptions.workerSrc = `${base}/pdf.worker.min.mjs`;
  pdfModule = pdfjs;
  return pdfjs;
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
  const pdfjs = await loadPdfJs();

  onProgress?.({
    fileName: file.name,
    stage: "reading",
    detail: "Đang đọc PDF…",
  });

  const buffer = await file.arrayBuffer();

  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("worker") || msg.includes("Worker")) {
      throw new Error(
        `${file.name}: Lỗi PDF worker. Thử refresh trang (Ctrl+F5) hoặc dùng file TXT/DOCX.`
      );
    }
    throw new Error(`${file.name}: Không mở được PDF — ${msg}`);
  }

  const pages: string[] = [];
  const maxPages = Math.min(doc.numPages, 200);

  for (let i = 1; i <= maxPages; i++) {
    onProgress?.({
      fileName: file.name,
      stage: "parsing",
      percent: Math.round((i / maxPages) * 100),
      detail: `Trang ${i}/${maxPages}`,
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
      `${file.name}: PDF không có chữ (file scan/ảnh). Hãy copy text vào "Dán văn bản" hoặc dùng DOCX/TXT.`
    );
  }

  return { text, pageCount: doc.numPages };
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  if (!result.value.trim()) {
    throw new Error(`${file.name}: Word trống hoặc không đọc được.`);
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
    throw new Error(`Không hỗ trợ ${file.name}. Dùng PDF, DOCX, TXT, MD, CSV.`);
  }

  onProgress?.({ fileName: file.name, stage: "parsing", detail: "Đang phân tích…" });

  switch (type) {
    case "pdf": {
      const { text, pageCount } = await parsePdf(file, onProgress);
      onProgress?.({ fileName: file.name, stage: "done", percent: 100 });
      return { text, type, pageCount };
    }
    case "docx": {
      const text = await parseDocx(file);
      onProgress?.({ fileName: file.name, stage: "done", percent: 100 });
      return { text, type };
    }
    case "csv": {
      const raw = await parseText(file);
      onProgress?.({ fileName: file.name, stage: "done", percent: 100 });
      return { text: parseCsv(raw), type };
    }
    case "txt":
    case "md": {
      const text = await parseText(file);
      onProgress?.({ fileName: file.name, stage: "done", percent: 100 });
      return { text, type };
    }
    default:
      throw new Error(`Không hỗ trợ ${file.name}`);
  }
}

/** Parse pasted plain text as a virtual document. */
export function parsePastedText(title: string, raw: string): { text: string; type: SourceType } {
  const text = raw.trim();
  if (text.length < 20) {
    throw new Error("Văn bản quá ngắn — cần ít nhất 20 ký tự.");
  }
  return { text, type: "txt" };
}