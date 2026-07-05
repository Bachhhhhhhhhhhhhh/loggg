"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseFile, type ParseProgress } from "@/lib/notebook/parser";
import { chunkText } from "@/lib/notebook/chunker";
import { createId } from "@/lib/notebook/id";
import { getSettings } from "@/lib/notebook/storage";
import {
  MAX_FILE_SIZE_MB,
  MAX_SOURCES_PER_NOTEBOOK,
  SUPPORTED_EXTENSIONS,
  type NotebookSource,
} from "@/lib/notebook/types";

const ACCEPT_TYPES =
  ".pdf,.docx,.txt,.md,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,text/csv";

interface SourceUploaderProps {
  notebookId: string;
  currentCount: number;
  onUploaded: (source: NotebookSource) => void | Promise<void>;
}

export function SourceUploader({
  notebookId,
  currentCount,
  onUploaded,
}: SourceUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      setSuccess(null);
      const list = Array.from(files);
      if (currentCount + list.length > MAX_SOURCES_PER_NOTEBOOK) {
        setError(`Tối đa ${MAX_SOURCES_PER_NOTEBOOK} tài liệu mỗi notebook.`);
        return;
      }

      setLoading(true);
      const settings = getSettings();

      try {
        for (const file of list) {
          if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            throw new Error(`${file.name} vượt quá ${MAX_FILE_SIZE_MB}MB`);
          }

          const { text, type, pageCount } = await parseFile(file, setProgress);

          const sourceId = createId("src");
          const chunks = chunkText(text, sourceId, settings.chunkSize);
          if (chunks.length === 0) {
            throw new Error(`${file.name}: nội dung quá ngắn để phân tích.`);
          }

          const source: NotebookSource = {
            id: sourceId,
            notebookId,
            name: file.name,
            type,
            size: file.size,
            text,
            pageCount,
            enabled: true,
            uploadedAt: Date.now(),
            chunks,
          };
          await onUploaded(source);
          setSuccess(`✓ ${file.name} — ${chunks.length} chunks${pageCount ? `, ${pageCount} trang` : ""}`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi upload tài liệu");
      } finally {
        setLoading(false);
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [notebookId, currentCount, onUploaded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all",
          loading && "pointer-events-none opacity-80",
          dragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-700/80 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_TYPES}
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
        {loading ? (
          <Loader2 className="h-8 w-8 mx-auto text-blue-400 animate-spin" />
        ) : (
          <Upload className="h-8 w-8 mx-auto text-slate-500" />
        )}
        <p className="text-xs font-medium text-slate-300 mt-2">
          {loading && progress
            ? progress.detail ?? "Đang xử lý…"
            : loading
              ? "Đang xử lý tài liệu…"
              : "Kéo thả hoặc click để upload"}
        </p>
        {loading && progress?.percent != null && (
          <div className="mt-2 mx-auto max-w-[180px] h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        )}
        <p className="text-[10px] text-slate-600 mt-1 font-mono">
          PDF · DOCX · TXT · MD · CSV — tối đa {MAX_FILE_SIZE_MB}MB
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-300">{error}</p>
        </div>
      )}

      {success && !loading && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-300">{success}</p>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
        <FileText className="h-3 w-3" />
        <span>
          {currentCount}/{MAX_SOURCES_PER_NOTEBOOK} nguồn · xử lý trên trình duyệt
        </span>
      </div>
    </div>
  );
}