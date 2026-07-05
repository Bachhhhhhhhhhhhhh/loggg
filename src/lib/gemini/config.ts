import { getSettings } from "@/lib/notebook/storage";

export function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, "");
}

/** API key từ biến môi trường build-time (tùy chọn) */
export function getEnvGeminiKey(): string {
  const raw = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
  return normalizeKey(raw);
}

/** Key ưu tiên: localStorage → env */
export function getEffectiveGeminiKey(): string {
  if (typeof window !== "undefined") {
    const stored = normalizeKey(getSettings().geminiApiKey);
    if (stored.length >= 20) return stored;
  }
  return getEnvGeminiKey();
}

/** Có API key hợp lệ (không phụ thuộc checkbox useAi) */
export function hasGeminiApiKey(): boolean {
  return getEffectiveGeminiKey().length >= 20;
}

export function maskGeminiKey(key?: string): string {
  const k = normalizeKey(key ?? getEffectiveGeminiKey());
  if (k.length < 8) return "—";
  return `${k.slice(0, 6)}…${k.slice(-4)}`;
}

export function isGeminiConfigured(useAi?: boolean): boolean {
  if (!hasGeminiApiKey()) return false;
  if (useAi === false) return false;
  if (typeof window === "undefined") return true;
  const envKey = getEnvGeminiKey();
  if (envKey.length >= 20) return true;
  const stored = normalizeKey(getSettings().geminiApiKey);
  if (stored.length >= 20) return true;
  return getSettings().useAi !== false;
}

/** Market Briefing: chỉ cần key, không cần checkbox useAi */
export function isMarketBriefingReady(): boolean {
  return hasGeminiApiKey();
}