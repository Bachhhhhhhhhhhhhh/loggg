import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { phases } from "@/data/roadmap";
import { modules } from "@/data/modules";
import { PHASE_MODULE_MAP, getPhaseProgress } from "@/lib/progress";

export function generateStaticParams() {
  return phases.map((p) => ({ phaseId: p.id }));
}

export default async function PhaseDetailPage({
  params,
}: {
  params: Promise<{ phaseId: string }>;
}) {
  const { phaseId } = await params;
  const phase = phases.find((p) => p.id === phaseId);
  if (!phase) notFound();

  const { lessons, progress } = getPhaseProgress(phaseId);
  const moduleId = PHASE_MODULE_MAP[phaseId];
  const mod = modules.find((m) => m.id === moduleId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <Link href="/roadmap" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Quay lại lộ trình
      </Link>

      <div className="flex items-start gap-4">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white shrink-0"
          style={{ backgroundColor: phase.color }}
        >
          {phase.number}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{phase.title}</h1>
          <p className="text-sm text-slate-400">{phase.subtitle}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {lessons} bài học</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {phase.duration}</span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-slate-300 leading-relaxed">{phase.description}</p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Tiến độ giai đoạn</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} color={phase.color} className="h-2" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {phase.skills.map((s) => (
              <Badge key={s} variant="default">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {mod && (
        <Card>
          <CardHeader>
            <CardTitle>Nội dung bài học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mod.lessons.map((lesson, i) => (
              <Link
                key={lesson.id}
                href={`/learn/${mod.id}/${lesson.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700"
              >
                <span className="text-xs text-slate-500 font-mono w-6">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{lesson.title}</p>
                  <p className="text-xs text-slate-500">{lesson.duration}</p>
                </div>
                {lesson.completed && <Badge variant="success">Hoàn thành</Badge>}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {mod && (
        <Button size="lg" asChild>
          <Link href={`/learn/${mod.id}/${mod.lessons[0].id}`}>
            <BookOpen className="h-4 w-4" />
            Bắt đầu học giai đoạn này
          </Link>
        </Button>
      )}
    </div>
  );
}