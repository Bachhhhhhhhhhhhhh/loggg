"use client";

import { useState } from "react";
import { ClipboardPaste, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parsePastedText } from "@/lib/notebook/parser";
import { chunkText } from "@/lib/notebook/chunker";
import { createId } from "@/lib/notebook/id";
import { getSettings } from "@/lib/notebook/storage";
import type { NotebookSource } from "@/lib/notebook/types";

interface PasteTextSourceProps {
  notebookId: string;
  onUploaded: (source: NotebookSource) => void | Promise<void>;
}

export function PasteTextSource({ notebookId, onUploaded }: PasteTextSourceProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Văn bản dán");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);
    setLoading(true);
    try {
      const { text: parsed, type } = parsePastedText(title, text);
      const sourceId = createId("src");
      const chunks = chunkText(parsed, sourceId, getSettings().chunkSize);
      const source: NotebookSource = {
        id: sourceId,
        notebookId,
        name: title.trim() || "Văn bản dán",
        type,
        size: parsed.length,
        text: "",
        enabled: true,
        uploadedAt: Date.now(),
        chunks,
      };
      await onUploaded(source);
      setText("");
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi thêm văn bản");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="w-full text-[10px] h-8"
        onClick={() => setOpen(true)}
      >
        <ClipboardPaste className="h-3 w-3 mr-1" />
        Dán văn bản (TXT)
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
      <Input
        placeholder="Tên nguồn…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 text-xs bg-slate-950/60"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Dán nội dung tài liệu vào đây (slide, bài đọc, ghi chú…)…"
        className="w-full h-28 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {error && <p className="text-[10px] text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleAdd} disabled={loading || text.length < 10} className="text-[10px] h-7">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Thêm
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)} className="text-[10px] h-7">
          Hủy
        </Button>
      </div>
    </div>
  );
}