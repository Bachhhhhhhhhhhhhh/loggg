"use client";

import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeminiChatSession } from "@/lib/gemini/chat-types";

interface ChatSidebarProps {
  sessions: GeminiChatSession[];
  activeId: string | null;
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function ChatSidebar({
  sessions,
  activeId,
  open,
  onToggle,
  onSelect,
  onNew,
  onDelete,
}: ChatSidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-72 border-r border-slate-800/60 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-0"
        )}
      >
        <div className="p-3 border-b border-slate-800/60 flex items-center gap-2">
          <button
            type="button"
            onClick={onNew}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-700/60 bg-slate-900/60 text-sm text-slate-300 hover:bg-slate-800/80 hover:border-slate-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Cuộc trò chuyện mới
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-300"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sessions.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-8 px-4">
              Chưa có lịch sử chat — bắt đầu hội thoại mới
            </p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                "group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
                activeId === s.id
                  ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                  : "hover:bg-slate-800/50 text-slate-400 border border-transparent"
              )}
              onClick={() => onSelect(s.id)}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="text-xs truncate flex-1">{s.title}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(s.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-600 text-center">
            LogIQ Gemini · Lưu cục bộ trên trình duyệt
          </p>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 lg:hidden"
    >
      <PanelLeft className="h-5 w-5" />
    </button>
  );
}