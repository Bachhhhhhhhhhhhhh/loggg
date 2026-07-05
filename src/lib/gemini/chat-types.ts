export interface ChatImageAttachment {
  id: string;
  name: string;
  mimeType: string;
  /** base64 without data: prefix */
  data: string;
  /** preview data URL */
  previewUrl: string;
  size: number;
}

export interface GeminiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: ChatImageAttachment[];
  model?: string;
  createdAt: number;
}

export interface GeminiChatSession {
  id: string;
  title: string;
  messages: GeminiChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export const CHAT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const MAX_CHAT_IMAGES = 4;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;