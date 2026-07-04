"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, FlaskConical, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CodeBlock } from "./CodeBlock";
import { CostBreakdownChart, GenericBarChart, GenericLineChart } from "@/components/charts/ChartComponents";
import type { Lesson } from "@/data/modules";

interface LessonContentProps {
  lesson: Lesson;
  moduleTitle: string;
  prevLesson?: { moduleId: string; lessonId: string; title: string } | null;
  nextLesson?: { moduleId: string; lessonId: string; title: string } | null;
}

const samplePieData = [
  { name: "Nhóm A", value: 80, color: "#3B82F6" },
  { name: "Nhóm B", value: 15, color: "#14B8A6" },
  { name: "Nhóm C", value: 5, color: "#6B7280" },
];

const sampleBarData = [
  { sku: "SKU001", value: 500000 },
  { sku: "SKU002", value: 300000 },
  { sku: "SKU003", value: 150000 },
  { sku: "SKU004", value: 80000 },
  { sku: "SKU005", value: 50000 },
];

const sampleLineData = [
  { q: 100, ordering: 5000, holding: 100, total: 5100 },
  { q: 316, ordering: 1581, holding: 316, total: 1897 },
  { q: 500, ordering: 1000, holding: 500, total: 1500 },
  { q: 707, ordering: 707, holding: 707, total: 1414 },
  { q: 1000, ordering: 500, holding: 1000, total: 1500 },
];

function LessonChart({ type }: { type: Lesson["chartType"] }) {
  if (!type) return null;

  return (
    <Card className="glow-blue">
      <CardHeader>
        <CardTitle>Biểu đồ minh họa</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {type === "pie" && <CostBreakdownChart data={samplePieData} />}
        {type === "bar" && (
          <GenericBarChart
            data={sampleBarData}
            xKey="sku"
            bars={[{ key: "value", name: "Giá trị (VND)", color: "#3B82F6" }]}
          />
        )}
        {type === "line" && (
          <GenericLineChart
            data={sampleLineData}
            xKey="q"
            lines={[
              { key: "ordering", name: "Chi phí đặt hàng", color: "#EF4444" },
              { key: "holding", name: "Chi phí lưu kho", color: "#F59E0B" },
              { key: "total", name: "Tổng chi phí", color: "#3B82F6" },
            ]}
          />
        )}
        {type === "area" && (
          <GenericLineChart
            data={[
              { day: "1", stock: 1000 },
              { day: "5", stock: 750 },
              { day: "10", stock: 500 },
              { day: "15", stock: 200 },
              { day: "20", stock: 700 },
              { day: "25", stock: 450 },
              { day: "30", stock: 800 },
            ]}
            xKey="day"
            lines={[{ key: "stock", name: "Tồn kho", color: "#14B8A6" }]}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ReadingProgressBar({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(100, Math.max(0, (el.scrollTop / maxScroll) * 100)));
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return (
    <div className="sticky top-0 z-10 h-0.5 bg-slate-900/80 shrink-0">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function LessonContent({ lesson, moduleTitle, prevLesson, nextLesson }: LessonContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <ReadingProgressBar scrollRef={scrollRef} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto" id="lesson-content">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="teal" className="mb-3">{moduleTitle}</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{lesson.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {lesson.duration}
              </span>
              {lesson.completed && (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Đã hoàn thành
                </Badge>
              )}
            </div>
          </motion.div>

          <Card>
            <CardHeader>
              <CardTitle>Lý thuyết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="lesson-prose text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {lesson.theory.split("**").map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="text-slate-100">{part}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {lesson.chartType && <LessonChart type={lesson.chartType} />}

          {lesson.pythonCode && <CodeBlock code={lesson.pythonCode} />}

          {lesson.experiment && (
            <Card className="border-teal-500/20 bg-teal-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 normal-case">
                  <FlaskConical className="h-4 w-4 text-teal-400" />
                  Thử nghiệm: {lesson.experiment.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">{lesson.experiment.description}</p>
                <Link href="/tools">
                  <Button variant="success" size="sm">
                    <FlaskConical className="h-3.5 w-3.5" />
                    Mở công cụ tương tác
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {lesson.githubUrl && (
            <a
              href={lesson.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-9 rounded-lg px-4 text-xs border border-slate-700/60 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-600 text-slate-300 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Xem GitHub repo gốc
            </a>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-slate-800/60 gap-4">
            {prevLesson ? (
              <Link
                href={`/learn/${prevLesson.moduleId}/${prevLesson.lessonId}`}
                className="text-sm text-slate-500 hover:text-blue-400 transition-colors truncate max-w-[45%]"
              >
                ← {prevLesson.title}
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link href={`/learn/${nextLesson.moduleId}/${nextLesson.lessonId}`}>
                <Button size="sm">
                  Tiếp theo: {nextLesson.title.length > 20 ? nextLesson.title.slice(0, 20) + "…" : nextLesson.title}
                </Button>
              </Link>
            ) : (
              <Badge variant="success">Hoàn thành module!</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}