"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
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
import { getNotebook, saveNotebook } from "@/lib/notebook/storage";
import { generateInsights } from "@/lib/notebook/insights";
import { generateAiInsights } from "@/lib/notebook/ai";
import { getSettings } from "@/lib/notebook/storage";
import type { ChatMessage, Notebook, NotebookSource } from "@/lib/notebook/types";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const notebookId = searchParams.get("id");

  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [previewSource, setPreviewSource] = useState<NotebookSource | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);

  const persist = useCallback(async (nb: Notebook) => {
    const updated = { ...nb, updatedAt: Date.now() };
    await saveNotebook(updated);
    setNotebook(updated);
  }, []);

  useEffect(() => {
    if (!notebookId) {
      router.replace("/notebook");
      return;
    }
    getNotebook(notebookId).then((nb) => {
      if (!nb) {
        router.replace("/notebook");
        return;
      }
      setNotebook(nb);
      setLoading(false);
    });
  }, [notebookId, router]);

  if (loading || !notebook) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const handleUpload = async (source: NotebookSource) => {
    const updated = {
      ...notebook,
      sources: [...notebook.sources, source],
    };
    await persist(updated);
  };

  const handleToggle = async (id: string) => {
    const updated = {
      ...notebook,
      sources: notebook.sources.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    };
    await persist(updated);
  };

  const handleDeleteSource = async (id: string) => {
    const updated = {
      ...notebook,
      sources: notebook.sources.filter((s) => s.id !== id),
    };
    await persist(updated);
  };

  const handleUserMessage = async (msg: ChatMessage) => {
    const updated = { ...notebook, messages: [...notebook.messages, msg] };
    setNotebook(updated);
    await saveNotebook({ ...updated, updatedAt: Date.now() });
  };

  const handleAssistantMessage = async (msg: ChatMessage) => {
    const updated = { ...notebook, messages: [...notebook.messages, msg] };
    await persist(updated);
  };

  const handleGenerateInsights = async () => {
    if (!notebook.sources.some((s) => s.enabled)) return;
    setInsightsLoading(true);
    try {
      let insights = generateInsights(notebook.sources);
      const settings = getSettings();
      if (settings.useAi && settings.geminiApiKey) {
        try {
          const fullText = notebook.sources
            .filter((s) => s.enabled)
            .map((s) => s.text)
            .join("\n\n");
          const ai = await generateAiInsights(settings.geminiApiKey, fullText);
          if (ai.summary) insights = { ...insights, summary: ai.summary };
          if (ai.outline.length) insights = { ...insights, outline: ai.outline };
        } catch {
          /* keep extractive insights */
        }
      }
      await persist({ ...notebook, insights });
    } finally {
      setInsightsLoading(false);
    }
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
            value={notebook.title}
            onChange={(e) => setNotebook({ ...notebook, title: e.target.value })}
            onBlur={() => {
              setEditingTitle(false);
              persist(notebook);
            }}
            onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
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
        <div className="ml-auto">
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