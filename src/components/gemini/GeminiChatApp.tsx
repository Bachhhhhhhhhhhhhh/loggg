"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Package,
  BarChart3,
  ImageIcon,
  Code2,
  Truck,
  Key,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotebookSettingsDialog } from "@/components/notebook/NotebookSettingsDialog";
import { ChatSidebar, SidebarToggle } from "./ChatSidebar";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { askGeminiChat } from "@/lib/gemini/chat-engine";
import {
  createChatSession,
  deleteChatSession,
  deriveChatTitle,
  getActiveChatId,
  getChatSession,
  listChatSessions,
  saveChatSession,
  setActiveChatId,
} from "@/lib/gemini/chat-storage";
import { hasGeminiApiKey, maskGeminiKey } from "@/lib/gemini/config";
import type { ChatImageAttachment, GeminiChatMessage, GeminiChatSession } from "@/lib/gemini/chat-types";

const SUGGESTIONS = [
  { icon: Package, text: "Giải thích EOQ và cách tính cho doanh nghiệp VN" },
  { icon: Truck, text: "So sánh FOB vs CIF — khi nào nên chọn điều khoản nào?" },
  { icon: BarChart3, text: "Thiết kế dashboard KPI logistics cho warehouse" },
  { icon: ImageIcon, text: "Upload ảnh biểu đồ/bảng — tôi sẽ phân tích giúp bạn" },
  { icon: Code2, text: "Viết Python tính safety stock với service level 95%" },
];

function createMsgId(role: string): string {
  return `${role}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function GeminiChatApp() {
  const [sessions, setSessions] = useState<GeminiChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<GeminiChatSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const keyReady = hasGeminiApiKey();

  const refreshSessions = useCallback(() => {
    setSessions(listChatSessions());
  }, []);

  const loadSession = useCallback(
    (id: string) => {
      const s = getChatSession(id);
      if (s) {
        setActiveSession(s);
        setActiveChatId(id);
        setError(null);
        setStreamingText(null);
      }
      setSidebarOpen(false);
    },
    []
  );

  useEffect(() => {
    refreshSessions();
    const activeId = getActiveChatId();
    if (activeId) {
      const s = getChatSession(activeId);
      if (s) setActiveSession(s);
      else {
        const created = createChatSession();
        setActiveSession(created);
        refreshSessions();
      }
    } else {
      const all = listChatSessions();
      if (all.length) loadSession(all[0].id);
      else {
        const created = createChatSession();
        setActiveSession(created);
        refreshSessions();
      }
    }
  }, [refreshSessions, loadSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, streamingText, loading]);

  const handleNewChat = () => {
    const s = createChatSession();
    setActiveSession(s);
    refreshSessions();
    setSidebarOpen(false);
    setError(null);
  };

  const handleDelete = (id: string) => {
    deleteChatSession(id);
    refreshSessions();
    const nextId = getActiveChatId();
    if (nextId) loadSession(nextId);
    else handleNewChat();
  };

  const sendMessage = useCallback(
    async (text: string, images: ChatImageAttachment[], regenerate = false) => {
      if (!activeSession || loading) return;
      if (!keyReady) {
        setError("Cần Gemini API key — nhấn ⚙️ Cài đặt AI → Test → Lưu");
        return;
      }

      setLoading(true);
      setError(null);
      setStreamingText(null);

      let history = activeSession.messages;
      let userText = text;
      let userImages = images;
      let regenUser: GeminiChatMessage | null = null;

      if (regenerate) {
        let trimmed = [...history];
        while (trimmed.length && trimmed[trimmed.length - 1].role === "assistant") {
          trimmed.pop();
        }
        const lastUser = trimmed[trimmed.length - 1];
        if (!lastUser || lastUser.role !== "user") {
          setLoading(false);
          return;
        }
        userText = lastUser.content;
        userImages = lastUser.images ?? [];
        regenUser = lastUser;
        history = trimmed.slice(0, -1);
        setActiveSession({ ...activeSession, messages: trimmed });
        saveChatSession({ ...activeSession, messages: trimmed });
      } else {
        const userMsg: GeminiChatMessage = {
          id: createMsgId("user"),
          role: "user",
          content: text,
          images: images.length ? images : undefined,
          createdAt: Date.now(),
        };
        history = [...history, userMsg];
        const updated: GeminiChatSession = {
          ...activeSession,
          messages: history,
          title:
            activeSession.messages.length === 0
              ? deriveChatTitle(text || "Phân tích ảnh")
              : activeSession.title,
        };
        setActiveSession(updated);
        saveChatSession(updated);
      }

      try {
        const { text: reply, model } = await askGeminiChat(userText, {
          history,
          images: userImages,
          onStream: (partial) => setStreamingText(partial),
        });

        setStreamingText(null);

        const assistantMsg: GeminiChatMessage = {
          id: createMsgId("assistant"),
          role: "assistant",
          content: reply,
          model,
          createdAt: Date.now(),
        };

        const finalMessages = regenUser
          ? [...history, regenUser, assistantMsg]
          : [...history, assistantMsg];

        const finalSession: GeminiChatSession = {
          ...activeSession,
          messages: finalMessages,
        };
        const saved = saveChatSession(finalSession);
        setActiveSession(saved);
        refreshSessions();
      } catch (err) {
        setStreamingText(null);
        setError(err instanceof Error ? err.message : "Lỗi gọi Gemini");
      } finally {
        setLoading(false);
      }
    },
    [activeSession, loading, keyReady, refreshSessions]
  );

  const messages = activeSession?.messages ?? [];
  const isEmpty = messages.length === 0 && !streamingText;

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[500px] -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-0 sm:border border-slate-800/50 overflow-hidden bg-slate-950/40">
      <ChatSidebar
        sessions={sessions}
        activeId={activeSession?.id ?? null}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        onSelect={loadSession}
        onNew={handleNewChat}
        onDelete={handleDelete}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-slate-950/80 shrink-0">
          <SidebarToggle onClick={() => setSidebarOpen(true)} />
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-slate-100 truncate">
              {activeSession?.title ?? "LogIQ Gemini"}
            </h1>
            <p className="text-[10px] text-slate-500">Hỏi đáp AI · Upload ảnh · Logistics & SCM</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {keyReady ? (
              <Badge variant="success" className="text-[9px] hidden sm:flex">
                {maskGeminiKey()}
              </Badge>
            ) : (
              <Badge variant="warning" className="text-[9px] gap-1">
                <Key className="h-2.5 w-2.5" />
                Cần key
              </Badge>
            )}
            <NotebookSettingsDialog compact />
          </div>
        </header>

        {/* Messages / Welcome */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
              <div className="gemini-welcome-orb mb-6" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-2">
                <span className="gradient-text">Xin chào!</span>
              </h2>
              <p className="text-sm text-slate-500 text-center max-w-md mb-8">
                Tôi là LogIQ Gemini — hỏi đáp thực tế về logistics, phân tích ảnh biểu đồ/KPI,
                viết code Python, hoặc bất kỳ chủ đề nào bạn cần.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl w-full">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    type="button"
                    onClick={() => sendMessage(s.text, [])}
                    disabled={loading || !keyReady}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-left hover:border-blue-500/30 hover:bg-slate-900/70 transition-all group"
                  >
                    <s.icon className="h-4 w-4 text-blue-400 shrink-0 mt-0.5 group-hover:text-teal-400 transition-colors" />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>
              {!keyReady && (
                <p className="text-xs text-amber-400/90 mt-6 text-center">
                  Cấu hình Gemini API key (⚙️ góc phải) để bắt đầu chat
                </p>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4">
              {messages.map((msg, i) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  showRegenerate={
                    msg.role === "assistant" && i === messages.length - 1 && !loading
                  }
                  onRegenerate={() => sendMessage("", [], true)}
                />
              ))}
              {streamingText && (
                <ChatMessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamingText,
                    createdAt: Date.now(),
                  }}
                  isStreaming
                />
              )}
              {loading && !streamingText && (
                <div className="flex gap-3 py-4">
                  <div className="h-9 w-9 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-teal-400 animate-pulse" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-slate-900/70 border border-slate-800/50">
                    <p className="text-xs text-slate-500">Gemini đang suy nghĩ…</p>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-amber-300/90 bg-amber-500/10 border-t border-amber-500/20 px-4 py-2 text-center">
            {error}
          </p>
        )}

        <ChatComposer
          onSend={(text, images) => sendMessage(text, images)}
          disabled={!keyReady}
          loading={loading}
        />
      </div>
    </div>
  );
}