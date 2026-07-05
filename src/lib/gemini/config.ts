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

export function isGeminiConfigured(useAi?: boolean): boolean {
  if (useAi === false) return false;
  const key = getEffectiveGeminiKey();
  if (key.length < 20) return false;
  if (typeof window === "undefined") return true;
  const envKey = getEnvGeminiKey();
  if (envKey.length >= 20) return true;
  return getSettings().useAi !== false;
}