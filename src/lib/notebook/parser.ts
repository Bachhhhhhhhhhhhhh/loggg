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
  pdfjs.GlobalWorkerOptions.workerSrc = `${getBasePath()}/pdf.worker.min.mjs`;
  pdfModule = pdfjs;
  return pdfjs;
}

function yieldToMain(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

export function getSourceType(filename: string, mime = ""): SourceType {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (ext === ".pdf" || mime === "application/pdf") return "pdf";
  if (ext === ".docx" || mime.includes("wordprocessingml")) return "docx";
  if (ext === ".txt" || mime.startsWith("text/plain")) return "txt";
  if (ext === ".md") return "md";
  if (ext === ".csv" || mime === "text/csv") return "csv";
  if (ext === ".json" || mime === "application/json") return "json";
  if (ext === ".html" || ext === ".htm" || mime === "text/html") return "html";
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

  onProgress?.({ fileName: file.name, stage: "reading", detail: "Đang đọc PDF…" });

  const buffer = await file.arrayBuffer();

  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/worker/i.test(msg)) {
      throw new Error(`${file.name}: Lỗi PDF worker — Ctrl+F5 refresh hoặc dùng Dán văn bản.`);
    }
    throw new Error(`${file.name}: Không mở được PDF — ${msg}`);
  }

  const pages: string[] = [];
  const total = doc.numPages;

  for (let i = 1; i <= total; i++) {
    if (i % 5 === 0) await yieldToMain();

    onProgress?.({
      fileName: file.name,
      stage: "parsing",
      percent: Math.round((i / total) * 100),
      detail: `Trang ${i}/${total}`,
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
      `${file.name}: PDF scan/ảnh — không có chữ. Dùng "Dán văn bản" hoặc DOCX/TXT.`
    );
  }

  return { text, pageCount: total };
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

function stripHtml(html: string): string {
  const el = typeof document !== "undefined" ? document.createElement("div") : null;
  if (el) {
    el.innerHTML = html;
    return (el.textContent ?? el.innerText ?? "").trim();
  }
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseCsv(text: string): string {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, i) => (i === 0 ? `Header: ${line}` : `Row ${i}: ${line}`))
    .join("\n");
}

export async function parseFile(
  file: File,
  onProgress?: (p: ParseProgress) => void
): Promise<{ text: string; type: SourceType; pageCount?: number }> {
  const type = getSourceType(file.name, file.type);
  if (type === "unknown") {
    throw new Error(`${file.name}: định dạng chưa hỗ trợ. Thử PDF, DOCX, TXT, MD, CSV, JSON, HTML.`);
  }

  onProgress?.({ fileName: file.name, stage: "parsing", detail: "Đang phân tích…" });

  switch (type) {
    case "pdf": {
      const r = await parsePdf(file, onProgress);
      onProgress?.({ fileName: file.name, stage: "done", percent: 100 });
      return { ...r, type };
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
    case "json": {
      const raw = await parseText(file);
      try {
        const parsed = JSON.parse(raw);
        const text =
          typeof parsed === "string"
            ? parsed
            : JSON.stringify(parsed, null, 2);
        onProgress?.({ fileName: file.name, stage: "done", percent: 100 });
        return { text, type };
      } catch {
        throw new Error(`${file.name}: JSON không hợp lệ.`);
      }
    }
    case "html": {
      const raw = await parseText(file);
      const text = stripHtml(raw);
      if (!text) throw new Error(`${file.name}: HTML không có nội dung text.`);
      onProgress?.({ fileName: file.name, stage: "done", percent: 100 });
      return { text, type };
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

export function parsePastedText(title: string, raw: string): { text: string; type: SourceType } {
  const text = raw.trim();
  if (text.length < 10) {
    throw new Error("Văn bản quá ngắn — cần ít nhất 10 ký tự.");
  }
  return { text, type: "txt" };
}