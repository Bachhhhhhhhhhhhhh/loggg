import { tokenize } from "./retrieval-utils";

export const EMBED_DIM = 384;

function fnv1a(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function addToVector(vec: Float32Array, key: string, weight: number): void {
  const h1 = fnv1a(key) % EMBED_DIM;
  const h2 = fnv1a(`${key}#`) % EMBED_DIM;
  vec[h1] += weight;
  vec[h2] += weight * 0.5;
}

function normalize(vec: Float32Array): Float32Array {
  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return vec;
}

/** Embedding cục bộ — không cần API, hỗ trợ tìm kiếm ngữ nghĩa */
export function embedText(text: string): Float32Array {
  const vec = new Float32Array(EMBED_DIM);
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const token of tokenize(text)) {
    addToVector(vec, token, 1.2);
  }

  for (let i = 0; i < normalized.length - 2; i++) {
    if (/\s/.test(normalized[i])) continue;
    addToVector(vec, normalized.slice(i, i + 3), 0.35);
  }

  const words = normalized.split(/\s+/).filter((w) => w.length > 3);
  for (let i = 0; i < words.length - 1; i++) {
    addToVector(vec, `${words[i]} ${words[i + 1]}`, 0.8);
  }

  return normalize(vec);
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}