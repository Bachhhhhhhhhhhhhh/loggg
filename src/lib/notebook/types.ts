export type SourceType = "pdf" | "docx" | "txt" | "md" | "csv" | "unknown";

export interface TextChunk {
  id: string;
  sourceId: string;
  index: number;
  text: string;
  wordCount: number;
}

export interface NotebookSource {
  id: string;
  notebookId: string;
  name: string;
  type: SourceType;
  size: number;
  text: string;
  pageCount?: number;
  enabled: boolean;
  uploadedAt: number;
  chunks: TextChunk[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  createdAt: number;
}

export interface Citation {
  sourceId: string;
  sourceName: string;
  chunkIndex: number;
  excerpt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  sourceId?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NotebookInsights {
  outline: string[];
  keyTopics: { topic: string; detail: string }[];
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  glossary: { term: string; definition: string }[];
  generatedAt: number;
}

export interface Notebook {
  id: string;
  title: string;
  description: string;
  emoji: string;
  createdAt: number;
  updatedAt: number;
  sources: NotebookSource[];
  messages: ChatMessage[];
  insights: NotebookInsights | null;
}

export interface NotebookSettings {
  geminiApiKey: string;
  useAi: boolean;
  chunkSize: number;
}

export const DEFAULT_SETTINGS: NotebookSettings = {
  geminiApiKey: "",
  useAi: false,
  chunkSize: 800,
};

export const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".csv"] as const;
export const MAX_FILE_SIZE_MB = 15;
export const MAX_SOURCES_PER_NOTEBOOK = 20;