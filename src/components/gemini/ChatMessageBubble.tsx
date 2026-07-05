"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, User, RotateCcw } from "lucide-react";
import { renderMarkdownLite } from "@/components/notebook/markdown-lite";
import type { GeminiChatMessage } from "@/lib/gemini/chat-types";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: GeminiChatMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

export function ChatMessageBubble({
  message,
  isStreaming,
  onRegenerate,
  showRegenerate,
}: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group flex gap-3 md:gap-4 py-4", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
            : "bg-gradient-to-br from-blue-500/20 via-teal-500/15 to-violet-500/20 text-teal-300 ring-1 ring-teal-500/25"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      <div className={cn("flex-1 min-w-0 max-w-3xl", isUser && "flex flex-col items-end")}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-medium text-slate-500">
            {isUser ? "Bạn" : "LogIQ Gemini"}
          </span>
          {!isUser && message.model && (
            <span className="text-[9px] text-slate-600 font-mono">{message.model}</span>
          )}
        </div>

        {message.images && message.images.length > 0 && (
          <div className={cn("flex flex-wrap gap-2 mb-2", isUser && "justify-end")}>
            {message.images.map((img) => (
              <div
                key={img.id}
                className="relative rounded-xl overflow-hidden border border-slate-700/60 max-w-[200px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="max-h-40 object-cover w-full"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-slate-400 px-2 py-0.5 truncate">
                  {img.name}
                </span>
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-blue-500/10 border border-blue-500/20 text-slate-100 rounded-tr-md"
              : "bg-slate-900/70 border border-slate-800/50 text-slate-300 rounded-tl-md gemini-response"
          )}
        >
          <div className="space-y-1">
            {renderMarkdownLite(message.content)}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-teal-400/80 animate-pulse ml-0.5 align-middle rounded-sm" />
            )}
          </div>
        </div>

        {!isUser && message.content && !isStreaming && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
              title="Sao chép"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            {showRegenerate && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
                title="Tạo lại"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}