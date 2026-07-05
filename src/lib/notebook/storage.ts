import type { Notebook, NotebookSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const DB_NAME = "logiq-notebooks";
const DB_VERSION = 1;
const NOTEBOOKS_STORE = "notebooks";
const SETTINGS_KEY = "logiq-notebook-settings";

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
      const notebooks = (request.result as Notebook[]).sort(
        (a, b) => b.updatedAt - a.updatedAt
      );
      resolve(notebooks);
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
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readwrite");
    tx.objectStore(NOTEBOOKS_STORE).put(notebook);
    tx.oncomplete = () => resolve();
    tx.onerror = () => {
      const err = tx.error;
      if (err?.name === "QuotaExceededError") {
        reject(
          new Error(
            "Bộ nhớ trình duyệt đầy — xóa bớt tài liệu hoặc notebook cũ."
          )
        );
      } else {
        reject(err);
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
    const raw = localStorage.getItem(SETTINGS_KEY) ?? localStorage.getItem("settings");
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    parsed.geminiApiKey = String(parsed.geminiApiKey ?? "").trim();
    if (parsed.geminiApiKey.length > 10) parsed.useAi = true;
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: NotebookSettings): void {
  const normalized: NotebookSettings = {
    ...settings,
    geminiApiKey: settings.geminiApiKey.trim(),
    useAi: settings.geminiApiKey.trim().length > 10 ? true : settings.useAi,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
  localStorage.removeItem("settings");
}