"use client";

import {
  FileText,
  FileType2,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { NotebookSource } from "@/lib/notebook/types";
import { SourceUploader } from "./SourceUploader";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface SourcePanelProps {
  notebookId: string;
  sources: NotebookSource[];
  onUpload: (source: NotebookSource) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (source: NotebookSource) => void;
}

export function SourcePanel({
  notebookId,
  sources,
  onUpload,
  onToggle,
  onDelete,
  onPreview,
}: SourcePanelProps) {
  const totalWords = sources
    .filter((s) => s.enabled)
    .reduce((sum, s) => sum + s.chunks.reduce((c, ch) => c + ch.wordCount, 0), 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800/60">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Nguồn tài liệu
        </h2>
        <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
          {sources.filter((s) => s.enabled).length} active · ~{totalWords.toLocaleString()} từ
        </p>
      </div>

      <div className="p-3 border-b border-slate-800/40">
        <SourceUploader
          notebookId={notebookId}
          currentCount={sources.length}
          onUploaded={onUpload}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sources.length === 0 ? (
          <div className="text-center py-8 px-4">
            <FileType2 className="h-10 w-10 mx-auto text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">Chưa có tài liệu</p>
            <p className="text-[10px] text-slate-600 mt-1">
              Upload PDF, Word, hoặc text để bắt đầu học
            </p>
          </div>
        ) : (
          sources.map((source) => (
            <div
              key={source.id}
              className={cn(
                "group rounded-lg border p-3 transition-all",
                source.enabled
                  ? "border-slate-700/80 bg-slate-900/60"
                  : "border-slate-800/40 bg-slate-950/40 opacity-60"
              )}
            >
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {source.name}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="secondary" className="text-[9px] uppercase">
                      {source.type}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      {formatSize(source.size)}
                    </Badge>
                    {source.pageCount && (
                      <Badge variant="secondary" className="text-[9px]">
                        {source.pageCount} trang
                      </Badge>
                    )}
                    <Badge variant="teal" className="text-[9px]">
                      {source.chunks.length} chunks
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => onToggle(source.id)}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 px-1.5 py-1 rounded"
                  title={source.enabled ? "Tắt nguồn" : "Bật nguồn"}
                >
                  {source.enabled ? (
                    <ToggleRight className="h-3.5 w-3.5 text-teal-400" />
                  ) : (
                    <ToggleLeft className="h-3.5 w-3.5" />
                  )}
                  {source.enabled ? "Đang dùng" : "Tắt"}
                </button>
                <button
                  onClick={() => onPreview(source)}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-400 px-1.5 py-1 rounded ml-auto"
                >
                  <Eye className="h-3 w-3" />
                  Xem
                </button>
                <button
                  onClick={() => onDelete(source.id)}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 px-1.5 py-1 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}