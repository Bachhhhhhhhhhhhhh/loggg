"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage, Notebook, NotebookSource } from "@/lib/notebook/types";
import { sendMessage, getSuggestedQuestions } from "@/lib/notebook/chat";
import { getSettings } from "@/lib/notebook/storage";
import { isAiReady } from "@/lib/notebook/ai";
import { renderMarkdownLite } from "@/components/notebook/markdown-lite";

interface NotebookChatProps {
  notebookId: string;
  sources: NotebookSource[];
  messages: ChatMessage[];
  onUserMessage: (msg: ChatMessage) => Promise<Notebook | null>;
  onNewMessage: (msg: ChatMessage) => Promise<void>;
}

export function NotebookChat({
  notebookId,
  sources,
  messages,
  onUserMessage,
  onNewMessage,
}: NotebookChatProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasSources = sources.some((s) => s.enabled && s.chunks.length > 0);
  const suggestions = getSuggestedQuestions();
  const settings = getSettings();
  const aiActive = isAiReady(settings.geminiApiKey, settings.useAi);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    const query = text.trim();
    if (!query || loading || !hasSources) return;

    const userMsg: ChatMessage = {
      id: createMsgId("user"),
      role: "user",
      content: query,
      createdAt: Date.now(),
    };

    setInput("");
    setLoading(true);

    try {
      const updatedNotebook = await onUserMessage(userMsg);
      const history = updatedNotebook?.messages ?? [...messages, userMsg];
      const reply = await sendMessage(query, sources, history, notebookId);
      await onNewMessage(reply);
    } catch {
      await onNewMessage({
        id: createMsgId("err"),
        role: "assistant",
        content: "⚠️ Lỗi xử lý câu hỏi — thử lại hoặc kiểm tra tài liệu đã upload.",
        createdAt: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-400" />
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Hỏi đáp từ tài liệu
          </h2>
          <Badge variant={aiActive ? "success" : "teal"} className="text-[9px] ml-auto">
            {aiActive ? "Gemini AI" : "Trích xuất"}
          </Badge>
        </div>
        <p className="text-[10px] text-slate-600 mt-0.5">
          {hasSources
            ? `${sources.filter((s) => s.enabled).length} nguồn · ${sources.reduce((n, s) => n + s.chunks.length, 0)} chunks`
            : "Upload hoặc dán văn bản trước"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Bot className="h-12 w-12 mx-auto text-slate-700 mb-3" />
            <p className="text-sm text-slate-400 font-medium">
              {hasSources ? "Đặt câu hỏi về tài liệu" : "Chưa có tài liệu"}
            </p>
            {hasSources && (
              <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-lg mx-auto">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-slate-700/80 bg-slate-900/60 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                msg.role === "user"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-teal-500/20 text-teal-400"
              )}
            >
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={cn(
                "flex-1 max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-blue-500/10 border border-blue-500/20 text-slate-200"
                  : "bg-slate-900/80 border border-slate-800/60 text-slate-300"
              )}
            >
              <div className="space-y-0.5">{renderMarkdownLite(msg.content)}</div>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Trích dẫn</p>
                  {msg.citations.map((c, i) => (
                    <div
                      key={`${c.sourceId}-${c.chunkIndex}-${i}`}
                      className="text-[10px] text-slate-500 bg-slate-950/50 rounded px-2 py-1.5"
                    >
                      <span className="text-teal-400 font-mono">[{i + 1}]</span>{" "}
                      <span className="text-slate-400">{c.sourceName}</span>
                      <p className="text-slate-600 mt-0.5 italic">{c.excerpt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20">
              <Loader2 className="h-4 w-4 text-teal-400 animate-spin" />
            </div>
            <div className="rounded-xl px-4 py-3 bg-slate-900/80 border border-slate-800/60">
              <p className="text-xs text-slate-500">
                {aiActive
                  ? "Đang diễn giải nội dung tài liệu…"
                  : "Đang trích xuất từ tài liệu…"}
              </p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-slate-800/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasSources ? "Hỏi về nội dung tài liệu…" : "Thêm tài liệu trước"}
            disabled={!hasSources || loading}
            className="flex-1 bg-slate-900/60 border-slate-800"
          />
          <Button type="submit" disabled={!hasSources || loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function createMsgId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}