"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourcePanel } from "@/components/notebook/SourcePanel";
import { NotebookChat } from "@/components/notebook/NotebookChat";
import { StudioPanel } from "@/components/notebook/StudioPanel";
import { SourcePreviewModal } from "@/components/notebook/SourcePreviewModal";
import { NotebookSettingsDialog } from "@/components/notebook/NotebookSettingsDialog";
import {
  getNotebook,
  addSource,
  updateSource,
  removeSource,
  saveMessages,
  saveInsights,
  saveNotebookTitle,
} from "@/lib/notebook/storage";
import { trainFromSources, invalidateNotebookIndex } from "@/lib/notebook/training";
import type { ChatMessage, Notebook, NotebookSource } from "@/lib/notebook/types";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const notebookId = searchParams.get("id");

  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<NotebookSource | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const notebookRef = useRef<Notebook | null>(null);
  useEffect(() => {
    notebookRef.current = notebook;
  }, [notebook]);

  const applyLocal = useCallback((updated: Notebook) => {
    notebookRef.current = updated;
    setNotebook(updated);
    setSaveError(null);
    return updated;
  }, []);

  useEffect(() => {
    if (!notebookId) {
      router.replace("/notebook");
      return;
    }
    setLoading(true);
    getNotebook(notebookId).then((nb) => {
      if (!nb) {
        router.replace("/notebook");
        return;
      }
      applyLocal(nb);
      setLoading(false);
    });
  }, [notebookId, router, applyLocal]);

  const runTraining = useCallback(
    async (auto = false) => {
      const current = notebookRef.current;
      if (!current?.sources.some((s) => s.enabled && s.chunks.length > 0)) return;

      setInsightsLoading(true);
      setTrainingStatus(auto ? "AI đang học tài liệu mới…" : "Đang phân tích tài liệu…");
      try {
        const result = await trainFromSources(current.id, current.sources);
        await saveInsights(current.id, result.insights);
        applyLocal({
          ...current,
          insights: result.insights,
          updatedAt: Date.now(),
        });
        setTrainingStatus(
          result.usedAi
            ? `✓ Đã học ${result.sourceCount} nguồn · ${result.chunkCount} chunks (Gemini)`
            : `✓ Đã phân tích ${result.sourceCount} nguồn (cục bộ)`
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Lỗi huấn luyện";
        setTrainingStatus(null);
        if (!auto) setSaveError(msg);
      } finally {
        setInsightsLoading(false);
        setTimeout(() => setTrainingStatus(null), 6000);
      }
    },
    [applyLocal]
  );

  if (loading || !notebook) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const handleUpload = async (source: NotebookSource) => {
    try {
      await addSource(notebook.id, source);
      invalidateNotebookIndex(notebook.id);
      const updated = applyLocal({
        ...notebookRef.current!,
        sources: [...notebookRef.current!.sources, source],
        updatedAt: Date.now(),
      });
      const shouldAutoTrain =
        !updated.insights && updated.sources.some((s) => s.enabled && s.chunks.length > 0);
      if (shouldAutoTrain) {
        void runTraining(true);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lỗi lưu tài liệu";
      setSaveError(msg);
      throw e;
    }
  };

  const handleToggle = async (id: string) => {
    const current = notebookRef.current!;
    const toggled = current.sources.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    const target = toggled.find((s) => s.id === id);
    if (target) await updateSource(target);
    applyLocal({ ...current, sources: toggled, updatedAt: Date.now() });
  };

  const handleDeleteSource = async (id: string) => {
    await removeSource(notebook.id, id);
    applyLocal({
      ...notebookRef.current!,
      sources: notebookRef.current!.sources.filter((s) => s.id !== id),
      updatedAt: Date.now(),
    });
  };

  const handleUserMessage = async (msg: ChatMessage) => {
    const current = notebookRef.current!;
    const messages = [...current.messages, msg];
    await saveMessages(notebook.id, messages);
    return applyLocal({ ...current, messages, updatedAt: Date.now() });
  };

  const handleAssistantMessage = async (msg: ChatMessage) => {
    const current = notebookRef.current!;
    const messages = [...current.messages, msg];
    await saveMessages(notebook.id, messages);
    applyLocal({ ...current, messages, updatedAt: Date.now() });
  };

  const handleGenerateInsights = () => runTraining(false);

  const handleTitleBlur = async (title: string) => {
    setEditingTitle(false);
    await saveNotebookTitle(notebook.id, title);
    applyLocal({ ...notebookRef.current!, title, updatedAt: Date.now() });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[600px]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-slate-950/80 shrink-0">
        <Button variant="outline" size="sm" asChild className="h-8">
          <Link href="/notebook">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <span className="text-xl">{notebook.emoji}</span>
        {editingTitle ? (
          <Input
            defaultValue={notebook.title}
            onBlur={(e) => handleTitleBlur(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="h-8 max-w-xs bg-slate-900/60 text-sm font-semibold"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="text-sm font-semibold text-slate-200 hover:text-teal-400 transition-colors"
          >
            {notebook.title}
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {trainingStatus && (
            <span className="text-[10px] text-teal-400 max-w-[240px] truncate" title={trainingStatus}>
              {trainingStatus}
            </span>
          )}
          {saveError && (
            <span className="text-[10px] text-red-400 max-w-[220px] truncate" title={saveError}>
              {saveError}
            </span>
          )}
          <NotebookSettingsDialog />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0 overflow-hidden">
        <div className="lg:col-span-3 border-r border-slate-800/60 bg-slate-950/40 min-h-[280px] lg:min-h-0 overflow-hidden flex flex-col">
          <SourcePanel
            notebookId={notebook.id}
            sources={notebook.sources}
            onUpload={handleUpload}
            onToggle={handleToggle}
            onDelete={handleDeleteSource}
            onPreview={setPreviewSource}
          />
        </div>

        <div className="lg:col-span-5 border-r border-slate-800/60 min-h-[400px] lg:min-h-0 overflow-hidden flex flex-col">
          <NotebookChat
            notebookId={notebook.id}
            sources={notebook.sources}
            messages={notebook.messages}
            onUserMessage={handleUserMessage}
            onNewMessage={handleAssistantMessage}
          />
        </div>

        <div className="lg:col-span-4 min-h-[320px] lg:min-h-0 overflow-hidden flex flex-col bg-slate-950/20">
          <StudioPanel
            insights={notebook.insights}
            loading={insightsLoading}
            onGenerate={handleGenerateInsights}
          />
        </div>
      </div>

      <SourcePreviewModal source={previewSource} onClose={() => setPreviewSource(null)} />
    </div>
  );
}

export default function NotebookWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}