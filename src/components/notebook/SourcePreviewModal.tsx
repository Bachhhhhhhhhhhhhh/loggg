"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NotebookSource } from "@/lib/notebook/types";
import { getSourceText } from "@/lib/notebook/source-text";

interface SourcePreviewModalProps {
  source: NotebookSource | null;
  onClose: () => void;
}

export function SourcePreviewModal({ source, onClose }: SourcePreviewModalProps) {
  if (!source) return null;

  const text = getSourceText(source);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800/60 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 truncate">{source.name}</h3>
            <div className="flex gap-1 mt-1">
              <Badge variant="secondary" className="text-[9px]">{source.type}</Badge>
              <Badge variant="teal" className="text-[9px]">{source.chunks.length} chunks</Badge>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans leading-relaxed">
            {text.slice(0, 20000)}
            {text.length > 20000 && "\n\n… (hiển thị 20.000 ký tự đầu)"}
          </pre>
        </div>
      </div>
    </div>
  );
}