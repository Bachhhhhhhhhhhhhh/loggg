import type { GeminiChatSession } from "./chat-types";

const SESSIONS_KEY = "logiq-gemini-chats-v1";
const ACTIVE_KEY = "logiq-gemini-active-chat";

function genId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadAll(): GeminiChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GeminiChatSession[];
  } catch {
    return [];
  }
}

function saveAll(sessions: GeminiChatSession[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = sessions
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 50);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota */
  }
}

export function listChatSessions(): GeminiChatSession[] {
  return loadAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getChatSession(id: string): GeminiChatSession | null {
  return loadAll().find((s) => s.id === id) ?? null;
}

export function getActiveChatId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveChatId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function createChatSession(title = "Cuộc trò chuyện mới"): GeminiChatSession {
  const session: GeminiChatSession = {
    id: genId(),
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const all = loadAll();
  all.unshift(session);
  saveAll(all);
  setActiveChatId(session.id);
  return session;
}

export function saveChatSession(session: GeminiChatSession): GeminiChatSession {
  const updated = { ...session, updatedAt: Date.now() };
  const all = loadAll();
  const idx = all.findIndex((s) => s.id === updated.id);
  if (idx >= 0) all[idx] = updated;
  else all.unshift(updated);
  saveAll(all);
  return updated;
}

export function deleteChatSession(id: string): void {
  const all = loadAll().filter((s) => s.id !== id);
  saveAll(all);
  if (getActiveChatId() === id) {
    setActiveChatId(all[0]?.id ?? null);
  }
}

export function deriveChatTitle(firstMessage: string): string {
  const clean = firstMessage.replace(/\s+/g, " ").trim();
  if (!clean) return "Cuộc trò chuyện mới";
  return clean.length > 42 ? clean.slice(0, 42) + "…" : clean;
}