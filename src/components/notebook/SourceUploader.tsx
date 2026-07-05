"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseFile, type ParseProgress } from "@/lib/notebook/parser";
import { chunkText } from "@/lib/notebook/chunker";
import { createId } from "@/lib/notebook/id";
import { getSettings } from "@/lib/notebook/storage";
import { SUPPORTED_EXTENSIONS, type NotebookSource } from "@/lib/notebook/types";

const ACCEPT_TYPES = [
  ...SUPPORTED_EXTENSIONS,
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/html",
].join(",");

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
  const countRef = useRef(currentCount);
  countRef.current = currentCount;

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [batchInfo, setBatchInfo] = useState<string | null>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      setSuccess(null);
      const list = Array.from(files);
      if (!list.length) return;

      setLoading(true);
      setBatchInfo(`0/${list.length} file`);
      const settings = getSettings();
      const uploaded: string[] = [];
      const failed: string[] = [];

      try {
        for (let i = 0; i < list.length; i++) {
          const file = list[i];
          setBatchInfo(`${i + 1}/${list.length} file`);

          try {
            const { text, type, pageCount } = await parseFile(file, setProgress);
            const sourceId = createId("src");
            const chunks = chunkText(
              text,
              sourceId,
              settings.chunkSize,
              Math.round(settings.chunkSize * 0.17)
            );

            if (chunks.length === 0) {
              throw new Error("nội dung quá ngắn");
            }

            const source: NotebookSource = {
              id: sourceId,
              notebookId,
              name: file.name,
              type,
              size: file.size,
              text: "",
              pageCount,
              enabled: true,
              uploadedAt: Date.now(),
              chunks,
            };

            await onUploaded(source);
            countRef.current += 1;
            uploaded.push(`${file.name} (${chunks.length} chunks)`);
            setSuccess(`✓ Đã thêm: ${uploaded[uploaded.length - 1]}`);
          } catch (e) {
            const msg = e instanceof Error ? e.message : "lỗi không xác định";
            failed.push(`${file.name}: ${msg}`);
          }
        }

        if (failed.length && uploaded.length) {
          setError(`Một số file lỗi:\n${failed.join("\n")}`);
        } else if (failed.length && !uploaded.length) {
          setError(failed.join("\n"));
        } else if (uploaded.length > 1) {
          setSuccess(`✓ Đã thêm ${uploaded.length} tài liệu thành công`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi upload");
      } finally {
        setLoading(false);
        setProgress(null);
        setBatchInfo(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [notebookId, onUploaded]
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
          {loading
            ? batchInfo
              ? `${batchInfo} — ${progress?.detail ?? "đang xử lý…"}`
              : "Đang xử lý…"
            : "Kéo thả nhiều file hoặc click upload"}
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
          PDF · DOCX · TXT · MD · CSV · JSON · HTML — không giới hạn
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-300 whitespace-pre-wrap">{error}</p>
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
        <span>{currentCount} nguồn · upload không giới hạn · lưu cục bộ</span>
      </div>
    </div>
  );
}