import type { Notebook, NotebookSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const DB_NAME = "logiq-notebooks";
const DB_VERSION = 1;
const NOTEBOOKS_STORE = "notebooks";
const SETTINGS_KEY = "settings";

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
    const store = tx.objectStore(NOTEBOOKS_STORE);
    const request = store.getAll();
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
    tx.onerror = () => reject(tx.error);
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
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: NotebookSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}