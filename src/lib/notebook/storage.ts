import type {
  ChatMessage,
  Notebook,
  NotebookInsights,
  NotebookSettings,
  NotebookSource,
} from "./types";
import { DEFAULT_SETTINGS } from "./types";

const DB_NAME = "logiq-notebooks";
const DB_VERSION = 2;
const NOTEBOOKS_STORE = "notebooks";
const SOURCES_STORE = "sources";
const SETTINGS_KEY = "logiq-notebook-settings";

interface NotebookMeta {
  id: string;
  title: string;
  description: string;
  emoji: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  insights: NotebookInsights | null;
  sourceIds: string[];
}

function compactSource(source: NotebookSource): NotebookSource {
  return { ...source, text: "" };
}

function dbError(err: DOMException | null): Error {
  if (err?.name === "QuotaExceededError") {
    return new Error(
      "Bộ nhớ trình duyệt đầy. Xóa notebook/tài liệu cũ hoặc dùng trình duyệt khác (Chrome thường cho nhiều dung lượng hơn)."
    );
  }
  return new Error(err?.message ?? "Lỗi lưu dữ liệu");
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const tx = request.transaction!;

      if (!db.objectStoreNames.contains(NOTEBOOKS_STORE)) {
        db.createObjectStore(NOTEBOOKS_STORE, { keyPath: "id" });
      }

      let sourceStore: IDBObjectStore;
      if (!db.objectStoreNames.contains(SOURCES_STORE)) {
        sourceStore = db.createObjectStore(SOURCES_STORE, { keyPath: "id" });
        sourceStore.createIndex("byNotebook", "notebookId", { unique: false });
      } else {
        sourceStore = tx.objectStore(SOURCES_STORE);
      }

      if (event.oldVersion < 2) {
        const nbStore = tx.objectStore(NOTEBOOKS_STORE);
        const getAll = nbStore.getAll();
        getAll.onsuccess = () => {
          for (const raw of getAll.result as (NotebookMeta & { sources?: NotebookSource[] })[]) {
            const legacySources = raw.sources ?? [];
            const sourceIds: string[] = raw.sourceIds ?? [];

            for (const src of legacySources) {
              sourceStore.put(compactSource(src));
              if (!sourceIds.includes(src.id)) sourceIds.push(src.id);
            }

            const meta: NotebookMeta = {
              id: raw.id,
              title: raw.title,
              description: raw.description,
              emoji: raw.emoji,
              createdAt: raw.createdAt,
              updatedAt: raw.updatedAt,
              messages: raw.messages ?? [],
              insights: raw.insights ?? null,
              sourceIds,
            };
            nbStore.put(meta);
          }
        };
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

function getSourcesForNotebook(
  db: IDBDatabase,
  notebookId: string
): Promise<NotebookSource[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SOURCES_STORE, "readonly");
    const index = tx.objectStore(SOURCES_STORE).index("byNotebook");
    const req = index.getAll(notebookId);
    req.onsuccess = () => {
      const sources = (req.result as NotebookSource[]).sort(
        (a, b) => a.uploadedAt - b.uploadedAt
      );
      resolve(sources);
    };
    req.onerror = () => reject(req.error);
  });
}

function metaToNotebook(meta: NotebookMeta, sources: NotebookSource[]): Notebook {
  return {
    id: meta.id,
    title: meta.title,
    description: meta.description,
    emoji: meta.emoji,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    messages: meta.messages,
    insights: meta.insights,
    sources,
    sourceCount: sources.length,
  };
}

export async function listNotebooks(): Promise<Notebook[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readonly");
    const req = tx.objectStore(NOTEBOOKS_STORE).getAll();
    req.onsuccess = () => {
      const list = (req.result as NotebookMeta[])
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((meta) => ({
          ...metaToNotebook(meta, []),
          sourceCount: meta.sourceIds?.length ?? 0,
        }));
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getNotebook(id: string): Promise<Notebook | null> {
  const db = await openDb();
  const meta = await new Promise<NotebookMeta | null>((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readonly");
    const req = tx.objectStore(NOTEBOOKS_STORE).get(id);
    req.onsuccess = () => resolve((req.result as NotebookMeta) ?? null);
    req.onerror = () => reject(req.error);
  });

  if (!meta) return null;

  let sources = await getSourcesForNotebook(db, id);

  if (sources.length === 0 && meta.sourceIds?.length) {
    sources = await Promise.all(
      meta.sourceIds.map(
        (sid) =>
          new Promise<NotebookSource | null>((resolve, reject) => {
            const tx = db.transaction(SOURCES_STORE, "readonly");
            const req = tx.objectStore(SOURCES_STORE).get(sid);
            req.onsuccess = () => resolve((req.result as NotebookSource) ?? null);
            req.onerror = () => reject(req.error);
          })
      )
    ).then((arr) => arr.filter((s): s is NotebookSource => s !== null));
  }

  return metaToNotebook(meta, sources);
}

export async function saveNotebook(notebook: Notebook): Promise<void> {
  const db = await openDb();
  const sourceIds = notebook.sources.map((s) => s.id);
  const meta: NotebookMeta = {
    id: notebook.id,
    title: notebook.title,
    description: notebook.description,
    emoji: notebook.emoji,
    createdAt: notebook.createdAt,
    updatedAt: Date.now(),
    messages: notebook.messages,
    insights: notebook.insights,
    sourceIds,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([NOTEBOOKS_STORE, SOURCES_STORE], "readwrite");
    tx.objectStore(NOTEBOOKS_STORE).put(meta);
    for (const src of notebook.sources) {
      tx.objectStore(SOURCES_STORE).put(compactSource(src));
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(dbError(tx.error));
  });
}

export async function addSource(
  notebookId: string,
  source: NotebookSource
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([NOTEBOOKS_STORE, SOURCES_STORE], "readwrite");
    const srcStore = tx.objectStore(SOURCES_STORE);
    const nbStore = tx.objectStore(NOTEBOOKS_STORE);

    srcStore.put(compactSource({ ...source, notebookId }));

    const getReq = nbStore.get(notebookId);
    getReq.onsuccess = () => {
      const meta = getReq.result as NotebookMeta | undefined;
      if (!meta) {
        reject(new Error("Notebook không tồn tại"));
        return;
      }
      const sourceIds = meta.sourceIds ?? [];
      if (!sourceIds.includes(source.id)) sourceIds.push(source.id);
      nbStore.put({
        ...meta,
        sourceIds,
        updatedAt: Date.now(),
      });
    };
    getReq.onerror = () => reject(getReq.error);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(dbError(tx.error));
  });
}

export async function updateSource(source: NotebookSource): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SOURCES_STORE, "readwrite");
    tx.objectStore(SOURCES_STORE).put(compactSource(source));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(dbError(tx.error));
  });
}

export async function removeSource(
  notebookId: string,
  sourceId: string
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([NOTEBOOKS_STORE, SOURCES_STORE], "readwrite");
    tx.objectStore(SOURCES_STORE).delete(sourceId);

    const nbStore = tx.objectStore(NOTEBOOKS_STORE);
    const getReq = nbStore.get(notebookId);
    getReq.onsuccess = () => {
      const meta = getReq.result as NotebookMeta | undefined;
      if (meta) {
        nbStore.put({
          ...meta,
          sourceIds: (meta.sourceIds ?? []).filter((id) => id !== sourceId),
          updatedAt: Date.now(),
        });
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(dbError(tx.error));
  });
}

export async function saveMessages(
  notebookId: string,
  messages: ChatMessage[]
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readwrite");
    const store = tx.objectStore(NOTEBOOKS_STORE);
    const getReq = store.get(notebookId);
    getReq.onsuccess = () => {
      const meta = getReq.result as NotebookMeta | undefined;
      if (meta) {
        store.put({ ...meta, messages, updatedAt: Date.now() });
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(dbError(tx.error));
  });
}

export async function saveInsights(
  notebookId: string,
  insights: NotebookInsights
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readwrite");
    const store = tx.objectStore(NOTEBOOKS_STORE);
    const getReq = store.get(notebookId);
    getReq.onsuccess = () => {
      const meta = getReq.result as NotebookMeta | undefined;
      if (meta) {
        store.put({ ...meta, insights, updatedAt: Date.now() });
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(dbError(tx.error));
  });
}

export async function saveNotebookTitle(
  notebookId: string,
  title: string
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTEBOOKS_STORE, "readwrite");
    const store = tx.objectStore(NOTEBOOKS_STORE);
    const getReq = store.get(notebookId);
    getReq.onsuccess = () => {
      const meta = getReq.result as NotebookMeta | undefined;
      if (meta) store.put({ ...meta, title, updatedAt: Date.now() });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(dbError(tx.error));
  });
}

export async function deleteNotebook(id: string): Promise<void> {
  const db = await openDb();
  const sources = await getSourcesForNotebook(db, id);

  return new Promise((resolve, reject) => {
    const tx = db.transaction([NOTEBOOKS_STORE, SOURCES_STORE], "readwrite");
    tx.objectStore(NOTEBOOKS_STORE).delete(id);
    for (const src of sources) {
      tx.objectStore(SOURCES_STORE).delete(src.id);
    }
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
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      ...settings,
      geminiApiKey: key,
      useAi: key.length >= 20 ? true : settings.useAi,
    })
  );
  localStorage.removeItem("settings");
}