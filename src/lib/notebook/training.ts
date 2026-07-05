import { createId } from "./id";
import type { NotebookInsights, NotebookSource } from "./types";
import { generateInsights } from "./insights";
import { generateAiInsights, isAiReady } from "./ai";
import { buildContextFromChunks, buildTrainingContext } from "./retrieval";
import { buildSourceIndex, invalidateIndex } from "./retrieval-index";
import { getDynamicSuggestions } from "./source-profile";
import { getSettings } from "./storage";

export interface TrainingResult {
  insights: NotebookInsights;
  usedAi: boolean;
  chunkCount: number;
  sourceCount: number;
  error?: string;
}

export function prepareNotebookIndex(
  notebookId: string,
  sources: NotebookSource[]
): number {
  return buildSourceIndex(notebookId, sources).totalChunks;
}

export function invalidateNotebookIndex(notebookId: string): void {
  invalidateIndex(notebookId);
}

export async function trainFromSources(
  notebookId: string,
  sources: NotebookSource[],
  options?: { forceAi?: boolean }
): Promise<TrainingResult> {
  const enabled = sources.filter((s) => s.enabled && s.chunks.length > 0);
  const chunkCount = enabled.reduce((n, s) => n + s.chunks.length, 0);

  if (!enabled.length || chunkCount === 0) {
    throw new Error("Chưa có tài liệu để học — upload hoặc dán văn bản trước");
  }

  prepareNotebookIndex(notebookId, sources);

  let insights = generateInsights(enabled);
  insights = {
    ...insights,
    suggestedQuestions: getDynamicSuggestions(enabled, 10),
    studyGuide: insights.outline.slice(0, 6),
  };

  const settings = getSettings();
  let usedAi = false;
  let error: string | undefined;

  if (isAiReady(settings.geminiApiKey, settings.useAi) || options?.forceAi) {
    try {
      const context = buildContextFromChunks(buildTrainingContext(enabled, notebookId));
      const ai = await generateAiInsights(
        settings.geminiApiKey,
        context,
        enabled.map((s) => s.name)
      );

      if (ai.summary) insights = { ...insights, summary: ai.summary };
      if (ai.outline.length) insights = { ...insights, outline: ai.outline };
      if (ai.studyGuide?.length) insights = { ...insights, studyGuide: ai.studyGuide };
      if (ai.suggestedQuestions?.length) {
        insights = { ...insights, suggestedQuestions: ai.suggestedQuestions };
      }
      if (ai.keyTopics.length) insights = { ...insights, keyTopics: ai.keyTopics };
      if (ai.flashcards.length) {
        insights = {
          ...insights,
          flashcards: ai.flashcards.map((f) => ({
            id: createId("fc"),
            front: f.front,
            back: f.back,
          })),
        };
      }
      if (ai.quiz?.length) {
        insights = {
          ...insights,
          quiz: ai.quiz.map((q) => ({
            id: createId("quiz"),
            question: q.question,
            options: q.options.length >= 2 ? q.options : ["A", "B", "C", "D"],
            correctIndex: Math.min(q.correctIndex, (q.options.length || 4) - 1),
            explanation: q.explanation,
          })),
        };
      }
      if (ai.glossary?.length) {
        insights = { ...insights, glossary: ai.glossary };
      }
      usedAi = true;
    } catch (e) {
      error = e instanceof Error ? e.message : "Lỗi AI";
      insights = {
        ...insights,
        summary: insights.summary + `\n\n⚠️ Gemini: ${error} — dùng bản phân tích cục bộ.`,
      };
    }
  }

  return {
    insights: { ...insights, generatedAt: Date.now() },
    usedAi,
    chunkCount,
    sourceCount: enabled.length,
    error,
  };
}