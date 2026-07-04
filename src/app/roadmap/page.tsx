"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, BookOpen, ArrowRight, Map } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getEnrichedPhases } from "@/lib/progress";

export default function RoadmapPage() {
  const phases = getEnrichedPhases();
  const totalLessons = phases.reduce((s, p) => s + p.lessons, 0);
  const avgProgress = totalLessons > 0
    ? Math.round(phases.reduce((s, p) => s + p.progress, 0) / phases.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        title="Lộ trình học tập"
        subtitle={`5 GIAI ĐOẠN · ${totalLessons} BÀI HỌC · TIẾN ĐỘ ${avgProgress}%`}
        badge="ROADMAP"
        icon={<Map className="h-5 w-5" />}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tổng bài học", value: totalLessons },
          { label: "Giai đoạn", value: phases.length },
          { label: "Tiến độ TB", value: `${avgProgress}%` },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">{kpi.label}</p>
              <p className="text-xl font-bold text-blue-400">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700 hidden md:block" />

        <div className="space-y-4">
          {phases.map((phase, i) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/roadmap/${phase.id}`}>
                <Card className="relative hover:border-slate-600 transition-all group ml-0 md:ml-12">
                  <CardContent className="p-5">
                    <div
                      className="absolute left-4 hidden md:flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-900 group-hover:border-blue-500 transition-colors"
                      style={{ top: "1.25rem" }}
                    >
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: phase.color }} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white"
                            style={{ backgroundColor: phase.color }}
                          >
                            {phase.number}
                          </span>
                          <div>
                            <h2 className="text-base font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                              {phase.title}
                            </h2>
                            <p className="text-xs text-slate-500">{phase.subtitle}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                          {phase.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {phase.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[10px]">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="sm:w-48 space-y-3 shrink-0">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> {phase.lessons} bài
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {phase.duration}
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Tiến độ</span>
                            <span>{phase.progress}%</span>
                          </div>
                          <Progress value={phase.progress} color={phase.color} />
                        </div>
                        <span className="flex items-center gap-1 text-xs text-blue-400 group-hover:gap-2 transition-all">
                          Chi tiết <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}