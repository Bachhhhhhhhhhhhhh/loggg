import type { Notebook, NotebookSettings, NotebookSource } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const DB_NAME = "logiq-notebooks";
const DB_VERSION = 1;
const NOTEBOOKS_STORE = "notebooks";
const SETTINGS_KEY = "logiq-notebook-settings";

/** Strip duplicate raw text — chunks hold the content (saves IndexedDB quota). */
function compactSource(source: NotebookSource): NotebookSource {
  return { ...source, text: "" };
}

function compactNotebook(nb: Notebook): Notebook {
  return {
    ...nb,
    sources: nb.sources.map(compactSource),
    messages: nb.messages.slice(-50),
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(NOTEBOOKS_STORE)) {
        db.createObjectStore(NOTEBOOKS_STORE, { keyPath: "id" });
      }
    };
  });
}

export async function listNotebooks(): Promise<Notebook[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readonly");
    const request = tx.objectStore(NOTEBOOKS_STORE).getAll();
    request.onsuccess = () => {
      resolve((request.result as Notebook[]).sort((a, b) => b.updatedAt - a.updatedAt));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getNotebook(id: string): Promise<Notebook | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readonly");
    const request = tx.objectStore(NOTEBOOKS_STORE).get(id);
    request.onsuccess = () => resolve((request.result as Notebook) ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveNotebook(notebook: Notebook): Promise<void> {
  const db = await openDb();
  const compact = compactNotebook(notebook);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readwrite");
    tx.objectStore(NOTEBOOKS_STORE).put(compact);
    tx.oncomplete = () => resolve();
    tx.onerror = () => {
      const err = tx.error;
      if (err?.name === "QuotaExceededError") {
        reject(new Error("Bộ nhớ trình duyệt đầy — xóa notebook/tài liệu cũ rồi thử lại."));
      } else {
        reject(err ?? new Error("Lỗi lưu dữ liệu"));
      }
    };
  });
}

export async function deleteNotebook(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readwrite");
    tx.objectStore(NOTEBOOKS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function getSettings(): NotebookSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw =
      localStorage.getItem(SETTINGS_KEY) ?? localStorage.getItem("settings");
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    parsed.geminiApiKey = String(parsed.geminiApiKey ?? "").trim();
    if (parsed.geminiApiKey.length >= 20) parsed.useAi = true;
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: NotebookSettings): void {
  const key = settings.geminiApiKey.trim();
  const normalized: NotebookSettings = {
    ...settings,
    geminiApiKey: key,
    useAi: key.length >= 20 ? true : settings.useAi,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
  localStorage.removeItem("settings");
}