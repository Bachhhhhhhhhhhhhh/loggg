const MODEL_KEY = "logiq-gemini-model";

export function getPreferredModel(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const m = localStorage.getItem(MODEL_KEY);
    return m && m.length > 3 ? m : null;
  } catch {
    return null;
  }
}

export function setPreferredModel(model: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MODEL_KEY, model);
  } catch {
    /* ignore quota */
  }
}