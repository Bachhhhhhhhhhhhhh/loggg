"use client";

import { useRef, useState, useCallback } from "react";
import { ImagePlus, Send, X, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileToImageAttachment } from "@/lib/gemini/chat-engine";
import type { ChatImageAttachment } from "@/lib/gemini/chat-types";
import { MAX_CHAT_IMAGES } from "@/lib/gemini/chat-types";

interface ChatComposerProps {
  onSend: (text: string, images: ChatImageAttachment[]) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSend,
  disabled,
  loading,
  placeholder = "Hỏi LogIQ Gemini bất cứ điều gì…",
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<ChatImageAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const list = Array.from(files);
    const remaining = MAX_CHAT_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`Tối đa ${MAX_CHAT_IMAGES} ảnh`);
      return;
    }
    try {
      const added: ChatImageAttachment[] = [];
      for (const file of list.slice(0, remaining)) {
        added.push(await fileToImageAttachment(file));
      }
      setImages((prev) => [...prev, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi upload ảnh");
    }
  }, [images.length]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) imageFiles.push(f);
        }
      }
      if (imageFiles.length) {
        e.preventDefault();
        addFiles(imageFiles);
      }
    },
    [addFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const imageFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length) addFiles(imageFiles);
    },
    [addFiles]
  );

  const handleSubmit = () => {
    const trimmed = text.trim();
    if ((!trimmed && images.length === 0) || disabled || loading) return;
    onSend(trimmed, images);
    setText("");
    setImages([]);
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="gemini-composer mx-auto max-w-3xl w-full px-4 pb-4">
      {error && (
        <p className="text-[11px] text-amber-400 mb-2 px-1">{error}</p>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.previewUrl}
                alt={img.name}
                className="h-16 w-16 object-cover rounded-xl border border-slate-700"
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((i) => i.id !== img.id))}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "pro-surface rounded-3xl p-2 flex items-end gap-2 transition-shadow",
          "focus-within:ring-2 focus-within:ring-blue-500/25 focus-within:border-blue-500/30"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || loading || images.length >= MAX_CHAT_IMAGES}
          className="p-2.5 rounded-xl text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 transition-colors shrink-0"
          title="Đính kèm ảnh (JPG, PNG, WebP)"
        >
          <ImagePlus className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={1}
          className="flex-1 bg-transparent border-0 resize-none text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none py-2.5 max-h-40 leading-relaxed"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || loading || (!text.trim() && images.length === 0)}
          className={cn(
            "p-2.5 rounded-xl shrink-0 transition-all",
            text.trim() || images.length
              ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              : "bg-slate-800 text-slate-600"
          )}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-600 text-center mt-2">
        <Paperclip className="h-2.5 w-2.5 inline mr-1" />
        Enter gửi · Shift+Enter xuống dòng · Kéo thả hoặc Ctrl+V ảnh · Tối đa {MAX_CHAT_IMAGES} ảnh
      </p>
    </div>
  );
}