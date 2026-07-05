"use client";

import { useState } from "react";
import {
  BookOpen,
  ListTree,
  Layers,
  HelpCircle,
  GraduationCap,
  Route,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NotebookInsights } from "@/lib/notebook/types";

type StudioTab = "summary" | "outline" | "studyguide" | "flashcards" | "quiz" | "glossary";

const tabs: { id: StudioTab; label: string; icon: typeof BookOpen }[] = [
  { id: "summary", label: "Tóm tắt", icon: BookOpen },
  { id: "outline", label: "Dàn ý", icon: ListTree },
  { id: "studyguide", label: "Lộ trình", icon: Route },
  { id: "flashcards", label: "Flashcard", icon: Layers },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "glossary", label: "Thuật ngữ", icon: GraduationCap },
];

interface StudioPanelProps {
  insights: NotebookInsights | null;
  loading: boolean;
  onGenerate: () => void;
}

export function StudioPanel({ insights, loading, onGenerate }: StudioPanelProps) {
  const [tab, setTab] = useState<StudioTab>("summary");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const flashcards = insights?.flashcards ?? [];
  const quiz = insights?.quiz ?? [];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800/60">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Studio học tập
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerate}
            disabled={loading}
            className="h-7 text-[10px]"
          >
            <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
            {insights ? "Tạo lại" : "Tạo insights"}
          </Button>
        </div>
        {insights && (
          <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
            Cập nhật {new Date(insights.generatedAt).toLocaleString("vi-VN")}
          </p>
        )}
      </div>

      <div className="flex gap-1 p-2 border-b border-slate-800/40 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors",
              tab === t.id
                ? "bg-blue-500/15 text-blue-400"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!insights && !loading && (
          <div className="text-center py-10">
            <Layers className="h-10 w-10 mx-auto text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">Chưa có insights</p>
            <p className="text-[10px] text-slate-600 mt-1 mb-4">
              Tự động tạo tóm tắt, flashcard, quiz từ tài liệu
            </p>
            <Button size="sm" onClick={onGenerate}>
              Tạo Studio
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-10">
            <RefreshCw className="h-8 w-8 mx-auto text-blue-400 animate-spin mb-2" />
            <p className="text-xs text-slate-500">Đang phân tích tài liệu…</p>
          </div>
        )}

        {insights && tab === "summary" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-4">
              <Badge variant="teal" className="text-[9px] mb-2">
                Tóm tắt tài liệu
              </Badge>
              <p className="text-sm text-slate-300 leading-relaxed">{insights.summary}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Chủ đề chính</p>
              <div className="space-y-2">
                {insights.keyTopics.slice(0, 6).map((t) => (
                  <div
                    key={t.topic}
                    className="rounded-lg border border-slate-800/40 p-3"
                  >
                    <p className="text-xs font-medium text-blue-400">{t.topic}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{t.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {insights && tab === "studyguide" && (
          <ol className="space-y-3">
            {(insights.studyGuide ?? insights.outline).map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-[11px] font-bold text-teal-400">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-300 pt-1 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        )}

        {insights && tab === "outline" && (
          <ol className="space-y-2">
            {insights.outline.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-slate-800/40 p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/15 text-[10px] font-mono text-blue-400">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-300 pt-0.5">{item}</p>
              </li>
            ))}
          </ol>
        )}

        {insights && tab === "flashcards" && flashcards.length > 0 && (
          <div className="space-y-4">
            <div
              onClick={() => setFlipped(!flipped)}
              className="relative min-h-[180px] cursor-pointer rounded-xl border border-slate-700/80 bg-gradient-to-br from-slate-900 to-slate-950 p-6 flex items-center justify-center text-center transition-all hover:border-blue-500/40"
            >
              <p className="text-sm text-slate-200 leading-relaxed">
                {flipped ? flashcards[cardIndex].back : flashcards[cardIndex].front}
              </p>
              <Badge variant="secondary" className="absolute top-3 right-3 text-[9px]">
                {cardIndex + 1}/{flashcards.length}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-600 text-center">Click để lật thẻ</p>
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCardIndex((i) => Math.max(0, i - 1));
                  setFlipped(false);
                }}
                disabled={cardIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCardIndex((i) => Math.min(flashcards.length - 1, i + 1));
                  setFlipped(false);
                }}
                disabled={cardIndex >= flashcards.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {insights && tab === "quiz" && quiz.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800/60 p-4">
              <Badge variant="secondary" className="text-[9px] mb-2">
                Câu {quizIndex + 1}/{quiz.length} · Điểm: {quizScore}
              </Badge>
              <p className="text-sm text-slate-200 mb-4">{quiz[quizIndex].question}</p>
              <div className="space-y-2">
                {quiz[quizIndex].options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isCorrect = i === quiz[quizIndex].correctIndex;
                  const showResult = selectedOption !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (selectedOption !== null) return;
                        setSelectedOption(i);
                        if (isCorrect) setQuizScore((s) => s + 1);
                      }}
                      className={cn(
                        "w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-colors",
                        showResult && isCorrect && "border-emerald-500/50 bg-emerald-500/10",
                        showResult && isSelected && !isCorrect && "border-red-500/50 bg-red-500/10",
                        !showResult && "border-slate-800/60 hover:border-slate-600 text-slate-400"
                      )}
                    >
                      <span className="font-mono text-slate-600 mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {selectedOption !== null && (
                <div className="mt-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800/40">
                  <p className="text-[11px] text-slate-400">{quiz[quizIndex].explanation}</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setSelectedOption(null);
                      setQuizIndex((i) => Math.min(quiz.length - 1, i + 1));
                    }}
                    disabled={quizIndex >= quiz.length - 1}
                  >
                    Câu tiếp
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {insights && tab === "glossary" && (
          <div className="space-y-2">
            {insights.glossary.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Không phát hiện thuật ngữ viết tắt
              </p>
            ) : (
              insights.glossary.map((g) => (
                <div
                  key={g.term}
                  className="rounded-lg border border-slate-800/40 p-3"
                >
                  <p className="text-xs font-mono font-bold text-teal-400">{g.term}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{g.definition}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}